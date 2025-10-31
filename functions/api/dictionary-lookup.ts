// functions/api/dictionary-lookup.ts
import { GoogleGenAI, Type } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

// FIX: Replaced PagesFunction with an explicit type for the context parameter to resolve the "Cannot find name 'PagesFunction'" error.
export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // FIX: Use the @google/genai SDK instead of fetch for Gemini API calls.
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an advanced multilingual dictionary. For the given word or phrase "${text}", perform the following steps:
1.  Detect its language (must be one of: English, Malay, or Chinese).
2.  Provide the translations for the other two languages, **and also include the original word in the results**.
3.  For each translation (and the original word), provide a simple, clear example sentence.
4.  Return the result as a JSON object that strictly follows the provided schema. The 'sourceLanguage' field should contain the detected language of the input text. The 'translations' array should contain three items: the original word and its two translations.`;

    // FIX: Refactored the API call to use ai.models.generateContent with the correct config structure and Type enum for schema.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sourceLanguage: { type: Type.STRING },
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING },
                  word: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['language', 'word', 'example'],
              },
            },
          },
          required: ['sourceLanguage', 'translations'],
        },
      },
    });

    // FIX: Used the recommended `response.text` to extract the text from the response.
    const responseText = response.text;

    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
