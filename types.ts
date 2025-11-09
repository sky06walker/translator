export interface Translation {
  language: 'English' | 'Malay' | 'Chinese';
  word: string;
  example: string;
  explanation: string;
  pinyin?: string;
}

export interface TranslationResult {
  sourceLanguage: string;
  translations: Translation[];
}
