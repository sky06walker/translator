// functions/api/dictionary-lookup.ts
import { GoogleGenAI, Type } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

// FIX: Replaced PagesFunction with an explicit type for the context parameter to resolve the "Cannot find name 'PagesFunction'" error.
export const onRequest = async (context: { request: Request; env: Env }) => {

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
    
    const prompt = `You are an expert multilingual dictionary. Your task is to take a word or phrase, "${text}", and provide comprehensive details for it and its translations in English, Malay, and Chinese.

Follow these instructions precisely:
1.  **Detect Language**: First, identify the language of the input "${text}". It must be one of English, Malay, or Chinese.
2.  **Translate**: Provide translations for the other two languages. You must return a total of three items: the original word and its two translations.
3.  **Provide Details for Each Word (Original and Translations)**: For each of the three items, you MUST provide the following fields:
    *   \`language\`: The language of the word ("English", "Malay", or "Chinese"). This is MANDATORY.
    *   \`word\`: The word or phrase itself. This is MANDATORY.
    *   \`explanation\`: A clear and concise explanation of the word's meaning and usage. **The explanation MUST be in the same language as the 'language' field.** For example, if the language is "Chinese", the explanation must be in Chinese. This is MANDATORY.
    *   \`example\`: A simple example sentence demonstrating how the word is used. This is MANDATORY.
    *   \`pinyin\`: If the language is "Chinese", you MUST provide the Hanyu Pinyin. If the language is NOT "Chinese", you MUST OMIT this field entirely.
4.  **Format Output**: Return a single, valid JSON object. The JSON object must strictly adhere to the provided JSON schema. Do not include any text or markdown formatting outside of the JSON object.`;

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
                  explanation: { type: Type.STRING },
                  pinyin: { type: Type.STRING },
                },
                required: ['language', 'word', 'explanation', 'example'],
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
          const { language, word, explanation, example } = t;
          return (
            typeof language === 'string' &&
            validLangs.includes(language) &&
            typeof word === 'string' &&
            word.trim() !== '' &&
            typeof explanation === 'string' &&
            explanation.trim() !== '' &&
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
        },
      });
    } catch (e) {
      console.error('Failed to parse or validate Gemini response:', responseText, e);
      return new Response(JSON.stringify({ error: 'Invalid response from AI model' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
