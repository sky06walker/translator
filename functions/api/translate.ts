// Cloudflare Pages Function for Gemini API
// This file should be placed at: functions/api/translate.ts

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { text, sourceLang, targetLang, includeExample } = await context.request.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt based on whether example is needed
    let prompt = `Translate the following text from ${sourceLang} to ${targetLang}.`;
    
    if (includeExample) {
      prompt += ` Provide the translation first, then on a new line provide an example sentence using the translated word/phrase. Format: Translation: [translation]\nExample: [example sentence]`;
    } else {
      prompt += ` Only provide the translation, no explanations:`;
    }
    
    prompt += `\n\n${text}`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('Gemini API error:', error);
      return new Response(
        JSON.stringify({ error: 'Translation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await geminiResponse.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let translatedText = responseText;
    let example = '';

    // Parse response if example was requested
    if (includeExample && responseText.includes('Example:')) {
      const parts = responseText.split('Example:');
      translatedText = parts[0].replace('Translation:', '').trim();
      example = parts[1].trim();
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        ...(includeExample && { example })
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};