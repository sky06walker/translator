// Client-side service that calls the Cloudflare Pages Function
// Replace your existing services/geminiService.ts with this

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
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