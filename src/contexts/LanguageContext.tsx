"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languages, Locale } from '@/lib/i18n';

interface LanguageContextType {
  currentLocale: Locale;
  setLanguage: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = 'en' }: { children: ReactNode; initialLocale?: Locale }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale);

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
  };

  const t = (key: string) => {
    // Import translations dynamically to avoid circular dependencies
    const translations = require('@/lib/translations').translations;
    return translations[currentLocale]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLocale, setLanguage, t }}>
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
