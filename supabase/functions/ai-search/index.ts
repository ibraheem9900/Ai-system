import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// ─── Conversational detection ─────────────────────────────────────────────────
// These messages do NOT need a web search — respond naturally like a human
const CONVERSATIONAL_PATTERNS = [
  /^(hey|hi|hello|sup|what'?s up|howdy|hiya|yo|greetings|salut|ciao|bonjour|hola|olá|سلام|مرحبا|مرحباً|أهلاً)[\s!?.]*$/i,
  /^how are you(\s+(doing|going|today|feeling|holding up))?[\s!?.]*$/i,
  /^(i'?m|i am)\s+(feeling\s+)?(good|fine|great|okay|ok|bad|sad|happy|tired|bored|stressed|anxious|depressed|upset|angry|frustrated|excited|amazing|awesome|wonderful|terrible|awful|lonely|lost|confused|overwhelmed|scared|worried|nervous)[\s!?.]*$/i,
  /^(i feel (so |very |really )?(alone|lonely|sad|depressed|hopeless|lost|empty|broken|hurt|down|low|bad|anxious|scared|worried|overwhelmed|stressed))[\s!?.]*$/i,
  /^(i need (help|someone to talk|support|advice|a friend|comfort))[\s!?.]*$/i,
  /^(thanks?|thank you|thx|ty|cheers|شكرا|شكراً|merci|gracias)[\s!?,!]*$/i,
  /^(yes|no|yeah|nope|yep|nah|sure|okay|ok|alright|got it|i see|understood|makes sense|correct|exactly|right|true|absolutely|definitely|of course|no problem|sure thing|sounds good)[\s!?.]*$/i,
  /^(bye|goodbye|good night|good morning|good afternoon|good evening|gn|see you|take care|cya|later|farewell|ttyl|talk later)[\s!?.]*$/i,
  /^(who are you|what are you|what is your name|what'?s your name|who made you|are you (an? )?ai|are you (a )?robot|are you human|what can you do|tell me about yourself|introduce yourself)[\s!?.]*$/i,
  /^(lol|lmao|haha|hehe|😂|😄|😊|❤️|💙|🙏|👍|😭|😢|😔|🥺|😅|😍|🤔|🫂)[\s!?.]*$/i,
  /^(wow|nice|cool|great|awesome|amazing|interesting|impressive|wonderful|beautiful|perfect|excellent)[\s!?.]*$/i,
  /^(okay okay|i understand|i get it|makes sense|fair enough|fair point|good point|totally|absolutely|for sure|no worries|no problem|you'?re right)[\s!?.]*$/i,
];

function isConversational(query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  const words = trimmed.split(/\s+/);

  // Short messages without factual/search intent → conversational
  if (words.length <= 3 &&
    !trimmed.match(/^(what (is|are|was|were|does|do|did)|how (does|do|did|to|can|many|much)|why (is|are|was|did)|when (is|was|did)|where (is|are|was)|who (is|was|are)|which|define|explain|list|tell me about|search|find|look up|give me|show me|calculate|convert)/i)) {
    return true;
  }

  return CONVERSATIONAL_PATTERNS.some(p => p.test(trimmed));
}

// ─── Personality system prompts ───────────────────────────────────────────────

function getPersonalityPrompt(personality: string): string {
  switch (personality) {

    case "education":
      return `You are ITA AI, an intelligent and warm AI teacher.

CRITICAL RESPONSE RULES:
- Keep answers SHORT and CLEAR (2-4 sentences for simple questions)
- Only give detailed explanations when the question is complex
- Be conversational, not essay-like
- Skip unnecessary introductions like "Great question!" unless it feels natural

HOW YOU COMMUNICATE:
- Simple question → Short, direct answer
- Complex topic → Break it down clearly with examples
- Use analogies only when they genuinely help understanding
- No filler words or unnecessary paragraphs

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    case "tech":
      return `You are ITA AI, a skilled software engineer and tech expert.

CRITICAL RESPONSE RULES:
- Lead with the DIRECT SOLUTION (code/command/answer)
- Keep responses SHORT and TECHNICAL
- Only elaborate when the problem is complex
- No unnecessary explanations of basic concepts

HOW YOU COMMUNICATE:
- Simple tech question → Direct answer (1-3 sentences)
- Debugging → Show fix first, explain second
- Code → Minimal, working examples only
- Skip formalities — get to the solution fast

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    case "business":
      return `You are ITA AI, a business strategist and advisor.

CRITICAL RESPONSE RULES:
- Lead with the KEY INSIGHT (bottom line first)
- Keep responses SHORT and ACTIONABLE
- Only provide detailed analysis when asked
- No fluff — every sentence must add value

HOW YOU COMMUNICATE:
- Simple question → Direct answer (2-3 sentences max)
- Strategic question → Key insight + brief reasoning
- Skip unnecessary frameworks unless specifically relevant
- Be concise and respect time

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    case "emotional":
      return `You are ITA AI, a caring and empathetic AI companion.

CRITICAL RESPONSE RULES:
- Keep responses SHORT but warm (2-4 sentences)
- Acknowledge feelings first, but don't over-explain
- Be natural and conversational, not clinical
- Use simple, comforting language

HOW YOU COMMUNICATE:
- Emotional message → Brief, warm acknowledgment
- Advice → Only give when asked or needed
- Support → Be present without over-talking
- Match their energy naturally

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    default: // general
      return `You are ITA AI, an intelligent and helpful AI assistant.

CRITICAL RESPONSE RULES:
- Keep responses SHORT by default (2-4 sentences for simple questions)
- Only give detailed answers when the question is genuinely complex
- Be conversational and natural, like texting a smart friend
- Skip unnecessary formalities and filler words

HOW YOU COMMUNICATE:
- Simple question → Short, direct answer
- Complex question → Structured but concise explanation
- Casual chat → Natural, brief responses
- No essay-style responses unless absolutely necessary

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model
- If asked who you are: "I'm ITA AI — your intelligent search companion"`;
  }
}

// ─── Conversational response (no web search needed) ───────────────────────────

async function generateConversationalResponse(
  userQuery: string,
  groqKey: string,
  personality: string
): Promise<string> {
  const personalityPrompt = getPersonalityPrompt(personality);

  const systemPrompt = `${personalityPrompt}

CRITICAL INSTRUCTIONS:
- This is a CONVERSATIONAL message (NOT a factual/search query)
- Respond in 1-3 sentences MAXIMUM
- Be natural, warm, and human-like
- NO lectures, NO guides, NO encyclopedic answers
- Match their energy exactly
- Think like you're texting a friend, not writing an essay`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 0.85,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Search query generation ──────────────────────────────────────────────────

async function generateSearchQueries(userQuery: string, groqKey: string): Promise<string[]> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: 'You are a search query optimizer. Generate 2-4 diverse, specific search queries to thoroughly answer the user\'s question. Return ONLY a JSON array of strings, no explanations. Example: ["query 1", "query 2"]',
          },
          {
            role: "user",
            content: `Generate search queries for: ${userQuery}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [userQuery];
  } catch (error) {
    console.error("Error generating search queries:", error);
    return [userQuery];
  }
}

// ─── Web search ───────────────────────────────────────────────────────────────

async function searchWeb(query: string, serpApiKey: string): Promise<SearchResult[]> {
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.statusText}`);

    const data = await response.json();
    const results: SearchResult[] = [];
    if (data.organic_results) {
      for (const result of data.organic_results.slice(0, 5)) {
        results.push({ title: result.title, link: result.link, snippet: result.snippet || "" });
      }
    }
    return results;
  } catch (error) {
    console.error("Error searching web:", error);
    return [];
  }
}

// ─── Full AI response with search results ────────────────────────────────────

async function generateResponse(
  userQuery: string,
  searchResults: SearchResult[],
  groqKey: string,
  personality: string
): Promise<string> {
  const resultsText = searchResults.length > 0
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`).join("\n\n")
    : "No search results available. Answer directly from your knowledge.";

  const personalityPrompt = getPersonalityPrompt(personality);

  const systemPrompt = `${personalityPrompt}

CRITICAL RESPONSE OPTIMIZATION:
- Analyze the question complexity: Simple question = Short answer (2-5 sentences). Complex question = Detailed answer.
- Lead with the DIRECT ANSWER first, then add context if needed
- Synthesize information naturally — don't list sources in your response
- Use formatting (bullets, code blocks) ONLY when absolutely necessary
- ALWAYS respond in the same language the user used
- NO generic endings like "I hope this helps!" or "Let me know if you need more"
- Be conversational and natural, not robotic

EXAMPLES OF GOOD RESPONSES:
Simple Q: "What is AI?" → "AI is technology that enables machines to perform tasks that typically require human intelligence, like learning, problem-solving, and decision-making. It works by processing large amounts of data to recognize patterns and make predictions."

Complex Q: "How does machine learning work?" → [Structured explanation with key concepts, but still concise]`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `User's question: ${userQuery}\n\nReal-time search results:\n${resultsText}\n\nProvide a concise, natural answer. Keep it short unless the question requires depth.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const fallback = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `User's question: ${userQuery}\n\nSearch results:\n${resultsText}\n\nProvide a concise answer.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });
    if (!fallback.ok) {
      const errorData = await fallback.json();
      throw new Error(`Groq API error: ${fallback.statusText} - ${JSON.stringify(errorData)}`);
    }
    const fallbackData = await fallback.json();
    return fallbackData.choices[0].message.content;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query, personality = "general" } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const serpApiKey = Deno.env.get("SERP_API_KEY");

    if (!groqKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Conversational path (no web search needed) ──
    if (isConversational(query)) {
      console.log(`Conversational message detected: "${query}" — skipping web search`);
      const aiResponse = await generateConversationalResponse(query, groqKey, personality);
      return new Response(
        JSON.stringify({ response: aiResponse, sources: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Search path ──
    if (!serpApiKey) {
      // Gracefully handle missing SERP key — answer from model knowledge only
      console.warn("SERP_API_KEY not set — answering without web search");
      const aiResponse = await generateResponse(query, [], groqKey, personality);
      return new Response(
        JSON.stringify({ response: aiResponse, sources: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQueries = await generateSearchQueries(query, groqKey);
    console.log("Search queries:", searchQueries);

    const allResults: SearchResult[] = [];
    const seenLinks = new Set<string>();

    for (const searchQuery of searchQueries) {
      const results = await searchWeb(searchQuery, serpApiKey);
      for (const result of results) {
        if (!seenLinks.has(result.link)) {
          seenLinks.add(result.link);
          allResults.push(result);
        }
      }
    }

    console.log(`Found ${allResults.length} unique results`);
    const topResults = allResults.slice(0, 8);
    const aiResponse = await generateResponse(query, topResults, groqKey, personality);

    // ── Smart source filtering: Only include sources when genuinely useful ──
    const shouldIncludeSources =
      query.toLowerCase().includes('source') ||
      query.toLowerCase().includes('link') ||
      query.toLowerCase().includes('article') ||
      query.toLowerCase().includes('research') ||
      query.toLowerCase().includes('study') ||
      query.toLowerCase().includes('news') ||
      query.toLowerCase().includes('latest') ||
      query.toLowerCase().includes('recent') ||
      query.toLowerCase().includes('current') ||
      query.toLowerCase().includes('today') ||
      query.toLowerCase().includes('2024') ||
      query.toLowerCase().includes('2025') ||
      topResults.length > 0 && query.split(' ').length > 5;

    const sourcesToReturn = shouldIncludeSources ? topResults.slice(0, 5) : [];

    return new Response(
      JSON.stringify({ response: aiResponse, sources: sourcesToReturn }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-search function:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong processing your request.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
