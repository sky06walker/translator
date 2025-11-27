// functions/api/dictionary-lookup.ts

interface Env {
  // No API key required for Pollinations.ai
}

export const onRequest = async (context: { request: Request; env: Env }) => {

  try {
    const { text } = (await context.request.json()) as { text: string };

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert multilingual dictionary. Your task is to take a word or phrase, "${text}", and provide comprehensive details for it and its translations in English, Malay, and Chinese.

Follow these instructions precisely:
1.  **Detect Language**: First, identify the language of the input "${text}". It must be one of English, Malay, or Chinese.
2.  **Translate**: Provide translations for the other two languages. You must return a total of three items: the original word and its two translations.
3.  **Provide Details for Each Word (Original and Translations)**: For each of the three items, you MUST provide the following fields:
    *   \`language\`: The language of the word ("English", "Malay", or "Chinese"). This is MANDATORY.
    *   \`word\`: The word or phrase itself. This is MANDATORY.
    *   \`explanation\`: A clear and concise explanation of the word's meaning and usage. **The explanation MUST be in the same language as the 'language' field.** For example, if the language is "Chinese", the explanation must be in Chinese. This is MANDATORY.
    *   \`example\`: A simple example sentence demonstrating how the word is used. This is MANDATORY.
    *   \`pinyin\`: If the language is "Chinese", you MUST provide the Hanyu Pinyin. If the language is NOT "Chinese", you MUST OMIT this field entirely.
4.  **Format Output**: Return a single, valid JSON object. The JSON object must strictly adhere to the following structure:
    {
      "sourceLanguage": "English", // or "Malay" or "Chinese"
      "translations": [
        {
          "language": "English",
          "word": "Apple",
          "explanation": "A round fruit with red or green skin and a white inside.",
          "example": "I ate an apple for lunch."
        },
        {
          "language": "Malay",
          "word": "Epal",
          "explanation": "Sejenis buah bulat yang mempunyai kulit merah atau hijau dan isi putih.",
          "example": "Saya makan sebiji epal untuk makan tengah hari."
        },
        {
          "language": "Chinese",
          "word": "苹果",
          "explanation": "一种圆形的落叶乔木果实，通常为红色、绿色或黄色。",
          "example": "我午餐吃了一个苹果。",
          "pinyin": "píng guǒ"
        }
      ]
    }
    Do not include any text or markdown formatting outside of the JSON object.`;

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze the word: "${text}"` }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const responseText = data.choices[0].message.content;

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
      console.error('Failed to parse or validate Pollinations response:', responseText, e);
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
