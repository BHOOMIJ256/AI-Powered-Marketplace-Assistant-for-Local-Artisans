export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' },
  bn: { name: 'বাংলা', flag: '🇮🇳' },
  te: { name: 'తెలుగు', flag: '🇮🇳' },
  mr: { name: 'मराठी', flag: '🇮🇳' },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ml: { name: 'മലയാളം', flag: '🇮🇳' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
};

export type Locale = keyof typeof languages;

export function getLanguageName(locale: string): string {
  return languages[locale as Locale]?.name || locale;
}

export function getLanguageFlag(locale: string): string {
  return languages[locale as Locale]?.flag || '🌐';
}
