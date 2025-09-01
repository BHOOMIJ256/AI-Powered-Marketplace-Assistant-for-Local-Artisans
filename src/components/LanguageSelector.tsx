"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages, getLanguageFlag, getLanguageName } from "@/lib/i18n";

export default function LanguageSelector() {
  const { currentLocale, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
      >
        <span>{getLanguageFlag(currentLocale)}</span>
        <span className="hidden sm:inline">{getLanguageName(currentLocale)}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
          {Object.entries(languages).map(([locale, lang]) => (
            <button
              key={locale}
              onClick={() => {
                setLanguage(locale as keyof typeof languages);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 ${
                currentLocale === locale ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLocale === locale && (
                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
