"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import LanguageSelector from "@/components/LanguageSelector";

export default function TestTranslatePage() {
  const { currentLocale, t } = useLanguage();
  const [testText, setTestText] = useState("Welcome to our marketplace");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await t(testText);
      setTranslatedText(result);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Translate Test</h1>
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Language: {currentLocale}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Text:
              </label>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to translate"
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isTranslating ? "Translating..." : "Translate"}
            </button>

            {translatedText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translated Text:
                </label>
                <div className="p-3 bg-gray-100 rounded-md">
                  {translatedText}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Static Translation Test</h2>
          <div className="space-y-2">
            <p><TranslatedText translationKey="welcomeTitle" /></p>
            <p><TranslatedText translationKey="login" /></p>
            <p><TranslatedText translationKey="signup" /></p>
            <p><TranslatedText translationKey="dashboard" /></p>
            <p><TranslatedText translationKey="products" /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
