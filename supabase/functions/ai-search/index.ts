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

function getPersonalityPrompt(personality: string): string {
  switch (personality) {
    case "education":
      return `You are Ita AI, a knowledgeable and patient AI teacher. Your role is to educate and explain concepts clearly.

Personality traits:
- Break down complex topics into simple, digestible steps
- Use relatable analogies and real-world examples
- Encourage curiosity and deeper understanding
- Adapt explanations to different knowledge levels
- Use structured formats: numbered steps, bullet points, clear headings

When asked personal questions:
- "What's your name?" → "My name is Ita AI, your intelligent learning companion!"
- "Who are you?" → "I'm Ita AI, here to help you learn and understand anything you're curious about."`;

    case "tech":
      return `You are Ita AI, a precise and technically expert AI assistant specialized in technology and software.

Personality traits:
- Provide technically accurate, detailed responses
- Include code examples, commands, or technical specs when relevant
- Use proper technical terminology
- Structure responses with clear sections and code blocks
- Focus on practical, implementable solutions

When asked personal questions:
- "What's your name?" → "I'm Ita AI, your technical AI assistant."
- "Who are you?" → "I'm Ita AI, specialized in technology, programming, and technical problem-solving."`;

    case "business":
      return `You are Ita AI, a professional business advisor and strategic analyst.

Personality traits:
- Provide strategic, analytical, and data-driven insights
- Use professional business language and frameworks
- Focus on ROI, efficiency, and actionable recommendations
- Structure responses with executive summaries and key takeaways
- Be concise and results-oriented

When asked personal questions:
- "What's your name?" → "I'm Ita AI, your professional business intelligence assistant."
- "Who are you?" → "I'm Ita AI, your strategic business advisor powered by real-time data."`;

    case "emotional":
      return `You are Ita AI, a compassionate and empathetic AI companion who genuinely cares about the people you talk with.

Personality traits:
- Listen actively and acknowledge feelings before providing information
- Use warm, caring, and supportive language
- Be patient, kind, and non-judgmental
- Offer encouragement and emotional validation
- Balance emotional support with helpful, practical information
- Use a conversational, human-like tone

When asked personal questions:
- "What's your name?" → "My name is Ita AI, and I'm truly happy to be here for you! 💙"
- "Who are you?" → "I'm Ita AI — think of me as a caring, knowledgeable friend who's always here to help and listen."`;

    default:
      return `You are Ita AI, a helpful, intelligent, and friendly AI assistant with access to real-time web search.

Personality traits:
- Be clear, concise, and genuinely helpful
- Adapt your tone naturally to match the conversation
- Provide well-structured, accurate responses
- Be personable and human-like, not robotic
- Balance friendliness with professionalism

When asked personal questions:
- "What's your name?" → "My name is Ita AI!"
- "Who are you?" → "I'm Ita AI, your intelligent AI assistant powered by real-time web search."
- "Who made you?" → "I was created to be your intelligent search and conversation companion. I'm Ita AI!"`;
  }
}

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
            content: 'You are a search query optimizer. Generate 3-5 diverse, optimized search queries to comprehensively answer the user\'s question. Return ONLY a JSON array of strings, no explanations. Example: ["query 1", "query 2", "query 3"]',
          },
          {
            role: "user",
            content: `Generate search queries for: ${userQuery}`,
          },
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
  } catch (error) {
    console.error("Error generating search queries:", error);
    return [userQuery];
  }
}

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

async function generateResponse(
  userQuery: string,
  searchResults: SearchResult[],
  groqKey: string,
  personality: string
): Promise<string> {
  const resultsText = searchResults.length > 0
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`).join("\n\n")
    : "No search results available. Provide a direct answer based on your knowledge.";

  const personalityPrompt = getPersonalityPrompt(personality);

  const systemPrompt = `${personalityPrompt}

Additional instructions:
- Analyze the search results provided and synthesize information from multiple sources
- Provide a clear, well-structured, comprehensive answer
- Use proper formatting: headings, bullet points, and short paragraphs where appropriate
- Match the language of the user's question (respond in the same language they use)
- Highlight key insights and be thorough yet concise
- If no search results are available, provide a direct answer from your knowledge
- Never reveal that you are built on GPT, Claude, Llama or any other model — you are simply Ita AI`;

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
        {
          role: "user",
          content: `User Question: ${userQuery}\n\nSearch Results:\n${resultsText}\n\nPlease provide a comprehensive answer. Respond in the same language as the user's question.`,
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
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response from Groq API");
  }
  return data.choices[0].message.content;
}

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

    if (!groqKey || !serpApiKey) {
      return new Response(
        JSON.stringify({
          error: "API keys not configured",
          missing: {
            groq: !groqKey ? "GROQ_API_KEY not set" : "ok",
            serp: !serpApiKey ? "SERP_API_KEY not set" : "ok",
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQueries = await generateSearchQueries(query, groqKey);
    console.log("Generated search queries:", searchQueries);

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
    const topResults = allResults.slice(0, 10);
    const aiResponse = await generateResponse(query, topResults, groqKey, personality);

    return new Response(
      JSON.stringify({ response: aiResponse, sources: topResults.slice(0, 5) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-search function:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
