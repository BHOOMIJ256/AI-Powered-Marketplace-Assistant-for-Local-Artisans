// src/lib/translate.ts
import { TranslationServiceClient } from '@google-cloud/translate';

// Language code mapping
export const LANGUAGE_CODES = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
  // Add more languages as needed
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_CODES;

// Initialize Google Translate client
let translateClient: TranslationServiceClient | null = null;

function getTranslateClient(): TranslationServiceClient {
  if (!translateClient) {
    // Use environment variable instead of file
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not found');
    }

    try {
      const credentials = JSON.parse(credentialsJson);
      translateClient = new TranslationServiceClient({
        projectId: 'story-telling-project-470510',
        credentials: credentials, // Use parsed JSON credentials
      });
    } catch (error) {
      console.error('Failed to parse Google credentials:', error);
      throw new Error('Invalid Google credentials JSON format');
    }
  }
  return translateClient;
}
// Translation cache to avoid repeated API calls
const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string> {
  // Return original text if target language is English
  if (targetLanguage === 'en') {
    return text;
  }

  // Check cache first
  const cacheKey = `${text}:${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const client = getTranslateClient();
    const targetLangCode = LANGUAGE_CODES[targetLanguage];
    
    const [response] = await client.translateText({
      parent: `projects/story-telling-project-470510/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: targetLangCode,
    });

    const translation = response.translations?.[0]?.translatedText || text;

    // Cache the translation
    translationCache.set(cacheKey, translation);
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}

export async function translateMultipleTexts(
  texts: string[],
  targetLanguage: SupportedLanguage
): Promise<string[]> {
  if (targetLanguage === 'en') {
    return texts;
  }

  try {
    const client = getTranslateClient();
    const targetLangCode = LANGUAGE_CODES[targetLanguage];
    
    const [response] = await client.translateText({
      parent: `projects/story-telling-project-470510/locations/global`,
      contents: texts,
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: targetLangCode,
    });

    return response.translations?.map(t => t.translatedText || '') || texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts if translation fails
    return texts;
  }
}

// Clear cache function (useful for testing or when you want fresh translations)
export function clearTranslationCache(): void {
  translationCache.clear();
}
