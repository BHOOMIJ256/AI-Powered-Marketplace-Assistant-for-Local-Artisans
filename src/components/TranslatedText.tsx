"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface TranslatedTextProps {
  translationKey: string;
  className?: string;
}

export default function TranslatedText({ translationKey, className = "" }: TranslatedTextProps) {
  const { t } = useLanguage();
  
  return (
    <span className={className}>
      {t(translationKey)}
    </span>
  );
}
