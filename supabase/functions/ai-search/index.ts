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
            content: "You are a search query optimizer. Generate 3-5 diverse, optimized search queries to comprehensively answer the user's question. Return ONLY a JSON array of strings, no explanations. Example: [\"query 1\", \"query 2\", \"query 3\"]"
          },
          {
            role: "user",
            content: `Generate search queries for: ${userQuery}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

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

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    if (data.organic_results) {
      for (const result of data.organic_results.slice(0, 5)) {
        results.push({
          title: result.title,
          link: result.link,
          snippet: result.snippet || "",
        });
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
  groqKey: string
): Promise<string> {
  const resultsText = searchResults.length > 0
    ? searchResults
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
        .join("\n\n")
    : "No search results available. Provide a direct answer based on your knowledge.";

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
- Be helpful and informative`
        },
        {
          role: "user",
          content: `User Question: ${userQuery}

Search Results:
${resultsText}

Please provide a comprehensive answer based on these search results. Respond in the same language as the user's question.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Groq error response:", errorData);
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
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
            serp: !serpApiKey ? "SERP_API_KEY not set" : "ok"
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

    const aiResponse = await generateResponse(query, topResults, groqKey);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        sources: topResults.slice(0, 5),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-search function:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
