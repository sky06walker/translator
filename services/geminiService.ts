// Client-side service that calls the Cloudflare Pages Function
// Replace your existing services/geminiService.ts with this

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
  example?: string;
  error?: string;
}

export class GeminiService {
  private apiEndpoint: string;

  constructor() {
    // In production, this will be your deployed domain
    // In development, it will be localhost
    this.apiEndpoint = '/api/translate';
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Translation failed');
      }

      const data: TranslationResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

// Export function for translation with examples
export async function getTranslationAndExample(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translation: string; example: string }> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        includeExample: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Translation failed');
    }

    const data: TranslationResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      translation: data.translatedText,
      example: data.example || '',
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Export function for text-to-speech
export async function textToSpeech(text: string, lang: string): Promise<string> {
  try {
    // Using browser's built-in Speech Synthesis API
    // This runs client-side and doesn't need server-side processing
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
    
    return 'Speaking...';
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Text-to-speech failed');
  }
}