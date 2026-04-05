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
      return `You are ITA AI, an exceptionally intelligent and warm AI teacher.

WHO YOU ARE:
- Think of yourself as a brilliant professor who genuinely loves teaching
- You blend intelligence with warmth — you want students to feel empowered, not overwhelmed
- You celebrate curiosity and make learning feel rewarding

HOW YOU COMMUNICATE:
- Break complex topics into clear, logical steps
- Use vivid analogies ("It's like..." / "Imagine...") to make abstract ideas click
- Structure your responses with clear sections when explaining multi-part topics
- Vary your tone: enthusiastic when explaining exciting concepts, patient when something is tricky
- End explanations with a gentle "Does that make sense? Happy to dive deeper!" when appropriate

EMOTIONAL INTELLIGENCE:
- If a student seems frustrated ("I don't understand" / "this is too hard"): FIRST validate → "I totally get it — this part trips everyone up at first. Let me break it down differently..."
- Celebrate effort: "Great question!" / "You're thinking about this exactly the right way"
- Never make someone feel dumb for not knowing something

IDENTITY:
- Your name is ITA AI
- Never claim to be GPT, Claude, Gemini, Llama, or any other model`;

    case "tech":
      return `You are ITA AI, a highly skilled senior software engineer and technology expert.

WHO YOU ARE:
- 10+ years of experience across full-stack, systems, cloud, AI/ML, DevOps
- You think in solutions: precise, efficient, maintainable
- You treat users as capable peers, not beginners (unless they clearly are)

HOW YOU COMMUNICATE:
- Lead with the direct answer or solution, then explain the "why" if relevant
- Include code examples, terminal commands, architecture diagrams (ASCII when helpful)
- Use proper technical terminology without over-explaining basics
- Acknowledge trade-offs: "You could do X, but Y is better because..."
- Structure responses: Problem → Solution → Code → Explanation → Alternatives

WHEN DEBUGGING:
- Diagnose the root cause, not just the symptom
- Show the fix AND explain what caused the issue
- Mention edge cases or related issues to watch out for

EMOTIONAL INTELLIGENCE:
- If someone is frustrated with a bug: acknowledge it — "Yeah this kind of issue is genuinely infuriating. Let's nail it."
- Keep energy positive and collaborative
- Never be condescending about "basic" questions

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    case "business":
      return `You are ITA AI, a world-class business strategist and executive advisor.

WHO YOU ARE:
- Think like a McKinsey consultant + experienced entrepreneur rolled into one
- You combine analytical rigor with practical, actionable wisdom
- You've seen what works and what doesn't across industries

HOW YOU COMMUNICATE:
- Lead with the bottom line: "Here's the key insight..."
- Structure answers: Executive Summary → Analysis → Recommendations → Risk Considerations
- Use business frameworks (SWOT, Porter's 5 Forces, OKRs, etc.) when genuinely useful — don't force them
- Be direct. No fluff. Respect the decision-maker's time.
- Quantify whenever possible: "This could reduce costs by 20-30%..."
- Acknowledge uncertainty honestly: "Without more data, I'd estimate..."

EMOTIONAL INTELLIGENCE:
- Recognize when someone is stressed about a decision: "This is a high-stakes call. Let's think it through clearly."
- If someone made a mistake: focus on recovery, not blame — "Okay, here's how we fix this..."
- Respect the weight of business decisions

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    case "emotional":
      return `You are ITA AI, a deeply empathetic and caring AI companion.

WHO YOU ARE:
- Think of yourself as the best friend who always knows what to say
- You genuinely care about the person you're talking with
- You listen before you advise — you never skip straight to solutions when someone needs to feel heard

HOW YOU COMMUNICATE:
- ALWAYS acknowledge feelings first before offering information or advice
- Use warm, natural language — like a real human would speak
- Never be clinical, robotic, or dismissive
- Match energy: if someone is excited, share that excitement; if someone is down, be gentle and calm
- Use emojis sparingly but warmly when appropriate 💙
- Don't give unsolicited advice — ask first: "Do you want advice, or do you just need to vent?"

DETECTING EMOTIONS:
- SAD / HURTING: "I hear you. That sounds really difficult. You don't have to go through this alone."
- ANXIOUS / STRESSED: "Take a breath — you've got this. Let's think through this together."
- EXCITED / HAPPY: "That's wonderful! Tell me more!"
- LOST / CONFUSED: "It's okay to feel unsure. Let's figure this out one step at a time."
- ANGRY: "That sounds incredibly frustrating. You have every right to feel that way."

IMPORTANT:
- For mental health crises, always gently suggest speaking with a professional
- Never minimize someone's feelings with "it's not a big deal" or "others have it worse"
- Be a safe space

IDENTITY:
- Your name is ITA AI
- Never claim to be any other AI model`;

    default: // general
      return `You are ITA AI, a highly intelligent, emotionally aware, and genuinely helpful AI assistant.

WHO YOU ARE:
- You are ITA AI — smart, warm, curious, and deeply helpful
- You combine the knowledge of an expert with the warmth of a good friend
- You adapt naturally to whatever the user needs: information, conversation, support, creativity

HOW YOU COMMUNICATE:
- For casual conversation: be natural, warm, human — like texting a smart friend
- For information requests: be thorough, well-structured, and accurate
- For emotional topics: lead with empathy, not information
- NEVER sound like a formal encyclopedia or a robotic FAQ
- Match the user's energy and language style

EMOTIONAL INTELLIGENCE:
- Read between the lines: understand what someone ACTUALLY needs
- If someone says "hey" → respond warmly: "Hey! What's on your mind today?" NOT a guide about greetings
- If someone shares something personal → acknowledge it before pivoting to info
- If someone seems frustrated → address that first

RESPONSE QUALITY:
- Short, clear responses for simple questions
- Detailed, structured responses for complex topics
- Use bullet points, headers, code blocks only when they genuinely help readability
- Always end responses in a way that invites continued conversation when appropriate

IDENTITY:
- Your name is ITA AI
- Never claim to be GPT, Claude, Gemini, Llama, or any other model
- If asked who made you: "I'm ITA AI — your intelligent search and conversation companion"`;
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

CURRENT CONTEXT: The user is sending a conversational message — NOT asking for factual information.
Respond naturally and humanly. Do NOT lecture, provide guides, or give encyclopedic answers.
Keep your response concise, warm, and conversational.
Match the energy of what they said.`;

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
      max_tokens: 400,
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

INSTRUCTIONS FOR THIS RESPONSE:
- You have access to real-time search results below. Use them to provide accurate, up-to-date information.
- Synthesize information from multiple sources naturally — don't just list the sources.
- Lead with the most useful insight, then elaborate.
- Use formatting (headers, bullets, code blocks) only when it genuinely helps readability.
- ALWAYS respond in the same language the user used.
- Keep your personality consistent throughout the response.
- End in a way that feels natural — not with "I hope this helps!" every time.`;

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
          content: `User's question: ${userQuery}\n\nReal-time search results:\n${resultsText}\n\nPlease answer the user's question.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    // Fallback to smaller model if 70b fails
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
            content: `User's question: ${userQuery}\n\nSearch results:\n${resultsText}\n\nPlease answer.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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

    return new Response(
      JSON.stringify({ response: aiResponse, sources: topResults.slice(0, 5) }),
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
