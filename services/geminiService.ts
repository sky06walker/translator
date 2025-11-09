import { Capacitor } from '@capacitor/core';
import type { TranslationResult } from '../types';

const getBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return 'https://translator-478.pages.dev';
  }
  return '';
};

const API_BASE_URL = getBaseUrl();

export async function dictionaryLookup(text: string): Promise<TranslationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dictionary-lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error || 'Dictionary lookup failed');
    }

    const data: TranslationResult = await response.json();
    return data;
  } catch (error) {
    console.error('Dictionary lookup error:', error);
    throw error;
  }
}

export async function textToSpeech(text: string, language: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || 'Text-to-speech failed');
    }

    const data = (await response.json()) as { audioContent: string };
    return data.audioContent; // The base64 encoded audio string
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Text-to-speech failed');
  }
}
