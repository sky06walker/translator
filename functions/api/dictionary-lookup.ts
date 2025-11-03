// functions/api/dictionary-lookup.ts
import { GoogleGenAI, Type } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

// FIX: Replaced PagesFunction with an explicit type for the context parameter to resolve the "Cannot find name 'PagesFunction'" error.
export const onRequest = async (context: { request: Request; env: Env }) => {
  // Handle CORS preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { text } = (await context.request.json()) as { text: string };

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
4.  The 'language' field for each item in the 'translations' array MUST be one of "English", "Malay", or "Chinese".
5.  Return the result as a JSON object that strictly follows the provided schema. The 'sourceLanguage' field should contain the detected language of the input text. The 'translations' array should contain three items: the original word and its two translations.`;

    // FIX: Refactored the API call to use ai.models.generateContent with the correct config structure and Type enum for schema.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sourceLanguage: { type: Type.STRING, enum: ['English', 'Malay', 'Chinese'] },
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING, enum: ['English', 'Malay', 'Chinese'] },
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

    try {
      const jsonResponse = JSON.parse(responseText);

      // FIX: Manually validate and sanitize the response from the AI model.
      // This ensures that we only send complete, valid data to the client and prevents
      // errors caused by malformed or incomplete translation objects.
      if (!jsonResponse.sourceLanguage || !Array.isArray(jsonResponse.translations)) {
        throw new Error('Invalid data structure from AI model');
      }

      // FIX: Implement strict, manual validation and sanitization of the AI's response.
      // This is the definitive fix to ensure the client only receives clean, valid data,
      // preventing downstream errors in the text-to-speech service.
      const validLangs = ['English', 'Malay', 'Chinese'];
      const sanitizedTranslations = jsonResponse.translations.filter(
        (t: any) => {
          if (!t) return false;
          const { language, word, example } = t;
          return (
            typeof language === 'string' &&
            validLangs.includes(language) &&
            typeof word === 'string' &&
            word.trim() !== '' &&
            typeof example === 'string' &&
            example.trim() !== ''
          );
        }
      );

      const sanitizedResponse = {
        sourceLanguage: jsonResponse.sourceLanguage,
        translations: sanitizedTranslations,
      };

      return new Response(JSON.stringify(sanitizedResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    } catch (e) {
      console.error('Failed to parse or validate Gemini response:', responseText, e);
      return new Response(JSON.stringify({ error: 'Invalid response from AI model' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
};
