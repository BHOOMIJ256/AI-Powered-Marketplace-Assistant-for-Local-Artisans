"use client";

import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function BuyerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Language Selector */}
      <header className="flex justify-between items-center p-6">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Artisan Marketplace
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">
              <TranslatedText translationKey="signupAsBuyer" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">Create your buyer account</p>
          </div>
          
          <form action="/api/buyer/register" method="post" className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="name" />
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="email" />
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email (optional)"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="phone" />
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="password" />
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              <TranslatedText translationKey="create" /> <TranslatedText translationKey="account" />
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <TranslatedText translationKey="hasAccount" />{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                <TranslatedText translationKey="login" />
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
