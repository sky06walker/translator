import type { TranslationResult } from '../types';

export async function dictionaryLookup(text: string): Promise<TranslationResult> {
  try {
    const response = await fetch('/api/dictionary-lookup', {
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
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    // Map language names to speech synthesis language codes
    const getLanguageCode = (lang: string): string => {
      switch (lang.toLowerCase()) {
        case 'malay':
          return 'ms-MY';
        case 'chinese':
          return 'zh-CN';
        case 'english':
        default:
          return 'en-US';
      }
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Return empty string since we're using direct speech synthesis
      // No base64 audio needed for Web Speech API
      resolve('');
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis failed: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

