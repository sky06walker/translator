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
  // Map language names to Google Translate language codes
  const getLanguageCode = (lang: string): string => {
    switch (lang.toLowerCase()) {
      case 'malay':
        return 'ms';
      case 'chinese':
        return 'zh-CN';
      case 'english':
      default:
        return 'en';
    }
  };

  const langCode = getLanguageCode(language);

  try {
    // Try Google Translate TTS first (better quality, especially for Malay)
    // Split text into chunks if too long (Google TTS has a character limit)
    const maxLength = 200;
    const chunks = text.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [text];
    
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(chunk)}`;
      
      const audio = new Audio(url);
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Google TTS failed'));
        audio.play().catch(reject);
      });
      
      // Small pause between chunks
      if (chunks.length > 1 && chunk !== chunks[chunks.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return '';
  } catch (error) {
    console.log('Google TTS failed, falling back to Web Speech API:', error);
    
    // Fallback to Web Speech API
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Text-to-speech not supported in this browser'));
        return;
      }

      const getWebSpeechLangCode = (lang: string): string => {
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
      utterance.lang = getWebSpeechLangCode(language);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onend = () => resolve('');
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

