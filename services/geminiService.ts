import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { TranslationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const translationSchema = {
  type: Type.OBJECT,
  properties: {
    sourceLanguage: {
      type: Type.STRING,
      description: 'The detected language of the input word. Can be "English", "Malay", or "Chinese".',
    },
    translations: {
      type: Type.ARRAY,
      description: 'An array containing the details for the original word and its translations into the other two languages. Should contain exactly 3 items.',
      items: {
        type: Type.OBJECT,
        properties: {
          language: {
            type: Type.STRING,
            description: 'The target language. Can be "English", "Malay", or "Chinese".',
          },
          word: {
            type: Type.STRING,
            description: 'The translated word in the target language.',
          },
          example: {
            type: Type.STRING,
            description: 'A simple example sentence using the translated word.',
          },
        },
        required: ['language', 'word', 'example'],
      },
    },
  },
  required: ['sourceLanguage', 'translations'],
};

export const getTranslationAndExample = async (word: string): Promise<TranslationResult> => {
  const prompt = `
    Analyze the following word: "${word}"
    1. Detect if its language is English, Malay, or Chinese.
    2. Translate it into the other two languages.
    3. Your response must contain details for all three languages (the original and the two translations).
    4. For each of the three languages, provide the language name, the word itself, and a simple example sentence.
    5. Return the result in the requested JSON format. The 'translations' array must contain exactly three items. The first item in the array should be for the source language.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: translationSchema,
    },
  });

  const jsonText = response.text.trim();
  const parsedResult = JSON.parse(jsonText) as TranslationResult;
  
  if (!parsedResult || !parsedResult.translations || parsedResult.translations.length === 0) {
      throw new Error("Invalid response format from API.");
  }

  return parsedResult;
};

export const textToSpeech = async (text: string): Promise<string | null> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A versatile and clear voice
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
};