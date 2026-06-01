import { GoogleGenAI } from '@google/genai';
import type { ApiKeys } from './types';

export function getPrimaryClient(apiKeys?: ApiKeys): GoogleGenAI {
  const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable or pass it via apiKeys.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });
}
