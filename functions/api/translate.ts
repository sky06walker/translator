// Cloudflare Pages Function for Pollinations.ai (OpenAI-compatible)
// This file should be placed at: functions/api/translate.ts

interface Env {
  // No API key required for Pollinations.ai
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}) => {
  try {
    const { text, sourceLang, targetLang, includeExample } =
      (await context.request.json()) as {
        text: string;
        sourceLang: string;
        targetLang: string;
        includeExample: boolean;
      };

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build prompt based on whether example is needed
    let systemPrompt = `You are a helpful translator. Translate from ${sourceLang} to ${targetLang}.`;
    let userPrompt = text;

    if (includeExample) {
      systemPrompt += ` Provide the translation first, then on a new line provide an example sentence using the translated word/phrase. Format: Translation: [translation]\nExample: [example sentence]`;
    } else {
      systemPrompt += ` Only provide the translation, no explanations.`;
    }

    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const responseText = data.choices[0].message.content;

    let translatedText = responseText;
    let example = "";

    // Parse response if example was requested
    if (includeExample && responseText.includes("Example:")) {
      const parts = responseText.split("Example:");
      translatedText = parts[0].replace("Translation:", "").trim();
      example = parts[1].trim();
    }

    return new Response(
      JSON.stringify({
        translatedText,
        ...(includeExample && { example }),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
