import { GoogleGenAI } from '@google/genai';

const KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
];

let keyIndex = 0;

export async function getGeminiResponse(contents) {
  let lastError = null;

  for (let i = 0; i < KEYS.length; i++) {
    const apiKey = KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % KEYS.length;

    const ai = new GoogleGenAI({ apiKey });

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        generationConfig: { responseMimeType: 'text/plain' },
      });

      // Success
      return result;

    } catch (err) {
      lastError = err;
      if (err?.message?.includes('quota') || err?.message?.includes('exceeded')) {
        // Try next key
        continue;
      } else {
        // If it's not a quota issue, break early
        throw err;
      }
    }
  }

  // All keys failed
  throw lastError;
}
