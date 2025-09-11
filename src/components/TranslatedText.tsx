"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TranslatedTextProps {
  translationKey: string;
  className?: string;
  fallbackText?: string;
}

export default function TranslatedText({ 
  translationKey, 
  className = "",
  fallbackText 
}: TranslatedTextProps) {
  const { t, tSync, currentLocale } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadTranslation = async () => {
      // Show immediate fallback text
      const immediateText = fallbackText || tSync(translationKey);
      setTranslatedText(immediateText);

      // If not English, load Google Translate version
      if (currentLocale !== 'en') {
        setIsLoading(true);
        try {
          const translated = await t(translationKey);
          setTranslatedText(translated);
        } catch (error) {
          console.error('Translation failed:', error);
          // Keep the fallback text
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTranslation();
  }, [translationKey, currentLocale, t, tSync, fallbackText]);

  return (
    <span className={className}>
      {translatedText}
      {isLoading && currentLocale !== 'en' && (
        <span className="text-gray-400 text-xs ml-1">⟳</span>
      )}
    </span>
  );
}
