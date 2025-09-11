// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { translateText, translateMultipleTexts, SupportedLanguage } from '@/lib/translate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, targetLanguage } = body;

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Handle single text translation
    if (text) {
      const translation = await translateText(text, targetLanguage as SupportedLanguage);
      return NextResponse.json({ translation });
    }

    // Handle multiple texts translation
    if (texts && Array.isArray(texts)) {
      const translations = await translateMultipleTexts(texts, targetLanguage as SupportedLanguage);
      return NextResponse.json({ translations });
    }

    return NextResponse.json(
      { error: 'Either text or texts array is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
