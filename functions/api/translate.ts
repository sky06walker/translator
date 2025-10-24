// Cloudflare Pages Function for Gemini API
// This file should be placed at: functions/api/translate.ts
import { GoogleGenAI } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

// FIX: Changed signature to match other functions and avoid potential build errors.
export const onRequestPost = async (context: { request: Request; env: Env }) => {
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

    // FIX: Use the @google/genai SDK instead of fetch for Gemini API calls.
    const ai = new GoogleGenAI({ apiKey });

    // FIX: Refactored the API call to use ai.models.generateContent and a non-deprecated model.
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    });
    
    const responseText = result.text;

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
