import express from 'express';
import cors from 'cors';
import { db } from './db';
import { users, conversations, messages } from '../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-use-a-real-secret-in-production';

app.use(cors());
app.use(express.json());

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password_hash }).returning();
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  try {
    const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, req.userId)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations', authMiddleware, async (req: any, res) => {
  try {
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.user_id, req.userId))
      .orderBy(desc(conversations.updated_at));
    return res.json(convs);
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/conversations', authMiddleware, async (req: any, res) => {
  const { title } = req.body;
  try {
    const [conv] = await db
      .insert(conversations)
      .values({ user_id: req.userId, title: title || 'New Chat' })
      .returning();
    return res.json(conv);
  } catch (err) {
    console.error('Create conversation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/conversations/:id', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { updated_at } = req.body;
  try {
    await db
      .update(conversations)
      .set({ updated_at: updated_at ? new Date(updated_at) : new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.user_id, req.userId)));
    return res.json({ success: true });
  } catch (err) {
    console.error('Update conversation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations/:id/messages', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  try {
    const conv = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, req.userId)))
      .limit(1);
    if (conv.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(messages.created_at);

    const parsed = msgs.map((m) => ({
      ...m,
      sources: m.sources ? JSON.parse(m.sources) : undefined,
    }));
    return res.json(parsed);
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/conversations/:id/messages', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { role, content, sources } = req.body;
  try {
    const conv = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, req.userId)))
      .limit(1);
    if (conv.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const [msg] = await db
      .insert(messages)
      .values({
        conversation_id: id,
        role,
        content,
        sources: sources ? JSON.stringify(sources) : null,
      })
      .returning();
    return res.json({ ...msg, sources: sources || undefined });
  } catch (err) {
    console.error('Insert message error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function generateSearchQueries(userQuery: string, groqKey: string): Promise<string[]> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are a search query optimizer. Generate 3-5 diverse, optimized search queries to comprehensively answer the user\'s question. Return ONLY a JSON array of strings, no explanations. Example: ["query 1", "query 2", "query 3"]',
          },
          { role: 'user', content: `Generate search queries for: ${userQuery}` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [userQuery];
  } catch {
    return [userQuery];
  }
}

async function searchWeb(query: string, serpApiKey: string): Promise<any[]> {
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.organic_results) return [];
    return data.organic_results.slice(0, 5).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet || '',
    }));
  } catch {
    return [];
  }
}

async function generateResponse(userQuery: string, searchResults: any[], groqKey: string): Promise<string> {
  const resultsText =
    searchResults.length > 0
      ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`).join('\n\n')
      : 'No search results available. Provide a direct answer based on your knowledge.';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant that provides accurate, well-structured answers based on search results. You can respond in any language the user uses.

Instructions:
- Analyze the search results provided
- Synthesize information from multiple sources
- Provide a clear, comprehensive answer
- Use proper formatting with headings and bullet points where appropriate
- Be concise but thorough
- Highlight key insights
- Ensure accuracy
- Match the language of the user's question
- If no search results are available, provide a direct answer

Format your response with:
- Clear structure
- Bullet points for lists when relevant
- Short paragraphs
- Key takeaways

Rules:
- Keep it simple and clear
- Avoid unnecessary text
- Focus on answering the user's question
- Use information from the search results when available
- Be helpful and informative`,
        },
        {
          role: 'user',
          content: `User Question: ${userQuery}\n\nSearch Results:\n${resultsText}\n\nPlease provide a comprehensive answer based on these search results. Respond in the same language as the user's question.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

app.post('/api/ai-search', authMiddleware, async (req: any, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const groqKey = process.env.GROQ_API_KEY;
  const serpApiKey = process.env.SERP_API_KEY;

  if (!groqKey || !serpApiKey) {
    return res.status(500).json({
      error: 'API keys not configured',
      missing: {
        groq: !groqKey ? 'GROQ_API_KEY not set' : 'ok',
        serp: !serpApiKey ? 'SERP_API_KEY not set' : 'ok',
      },
    });
  }

  try {
    const searchQueries = await generateSearchQueries(query, groqKey);
    const allResults: any[] = [];
    const seenLinks = new Set<string>();

    for (const q of searchQueries) {
      const results = await searchWeb(q, serpApiKey);
      for (const r of results) {
        if (!seenLinks.has(r.link)) {
          seenLinks.add(r.link);
          allResults.push(r);
        }
      }
    }

    const topResults = allResults.slice(0, 10);
    const aiResponse = await generateResponse(query, topResults, groqKey);

    return res.json({ response: aiResponse, sources: topResults.slice(0, 5) });
  } catch (err) {
    console.error('AI search error:', err);
    return res.status(500).json({
      error: 'An error occurred processing your request',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
