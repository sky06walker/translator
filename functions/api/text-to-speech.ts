// functions/api/text-to-speech.ts
import { GoogleGenAI, Modality } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

// FIX: Replaced PagesFunction with an explicit type for the context parameter to resolve the "Cannot find name 'PagesFunction'" error.
export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text for speech' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // FIX: Use the @google/genai SDK instead of fetch for Gemini API calls.
    const ai = new GoogleGenAI({ apiKey });

    // FIX: Refactored the API call to use ai.models.generateContent with the correct config structure and Modality enum.
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });

    const audioContent = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioContent) {
        return new Response(JSON.stringify({ error: 'No audio content received from API' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ audioContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TTS Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};