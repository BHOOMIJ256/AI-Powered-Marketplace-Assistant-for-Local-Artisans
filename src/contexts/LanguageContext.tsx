"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languages, Locale } from '@/lib/i18n';
import { SupportedLanguage } from '@/lib/translate';

interface LanguageContextType {
  currentLocale: Locale;
  setLanguage: (locale: Locale) => void;
  t: (key: string) => Promise<string>;
  tSync: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = 'en' }: { children: ReactNode; initialLocale?: Locale }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage') as Locale;
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLocale(savedLanguage);
    }
  }, []);

  const setLanguage = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('preferredLanguage', locale);
    // Clear cache when language changes
    setTranslationCache(new Map());
  };

  // Synchronous translation (for immediate display, falls back to English)
  const tSync = (key: string) => {
    // Import translations dynamically to avoid circular dependencies
    const translations = require('@/lib/translations').translations;
    return translations[currentLocale]?.[key] || translations.en[key] || key;
  };

  // Asynchronous translation using Google Translate
  const t = async (key: string): Promise<string> => {
    // Return English text immediately if current language is English
    if (currentLocale === 'en') {
      return tSync(key);
    }

    // Check cache first
    const cacheKey = `${key}:${currentLocale}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      // Get English text first
      const englishText = tSync(key);
      
      // If it's the same as the key, no translation needed
      if (englishText === key) {
        return key;
      }

      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: englishText,
          targetLanguage: currentLocale as SupportedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translation = data.translation || englishText;
        
        // Cache the translation
        setTranslationCache(prev => new Map(prev).set(cacheKey, translation));
        
        return translation;
      } else {
        console.error('Translation API error:', response.statusText);
        return englishText;
      }
    } catch (error) {
      console.error('Translation error:', error);
      return tSync(key);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLocale, setLanguage, t, tSync }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
