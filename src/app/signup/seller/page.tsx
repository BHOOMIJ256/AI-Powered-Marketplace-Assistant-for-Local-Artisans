//src/app/signup/sellr/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function SellerSignupPage() {
  return (
    <div className={`min-h-screen overflow-hidden relative ${cormorant.className}`}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 grid grid-cols-5 gap-4 p-4">
        {[0, 1, 2, 3, 4].map((columnIndex) => (
          <div
            key={columnIndex}
            className={`flex flex-col gap-4 ${
              columnIndex % 2 === 0 ? "animate-scroll-down" : "animate-scroll-up"
            }`}
          >
            {getColumnImages(columnIndex).map((imageSrc, imageIndex) => (
              <div
                key={`${columnIndex}-${imageIndex}`}
                className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
                style={{ 
                  minHeight: '200px',
                  backgroundColor: '#f5f1eb' // Light brown background
                }}
              >
                <img
                  src={imageSrc}
                  alt={`Grid image ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.style.background = `linear-gradient(135deg, 
                      hsl(${30 + (columnIndex * 20 + imageIndex * 15) % 60}, 25%, 75%), 
                      hsl(${40 + (columnIndex * 20 + imageIndex * 15) % 60}, 30%, 80%))`;
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Ultra Compact Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div 
          className="flex justify-between items-center px-4 py-2 border-b"
          style={{
            backgroundColor: 'rgba(250, 248, 245, 0.95)',
            borderBottomColor: '#d4c4a8',
            backdropFilter: 'blur(10px)',
            minHeight: '60px' // Fixed compact height
          }}
        >
          <Link 
            href="/" 
            className="text-2xl font-bold transition-colors hover:opacity-80"
            style={{ color: '#8b4513' }}
          >
            Artisan Marketplace
          </Link>
          <div 
            className="rounded-full px-3 py-1.5"
            style={{
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              border: '1px solid rgba(139, 69, 19, 0.2)'
            }}
          >
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">
              <TranslatedText translationKey="signupAsSeller" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">Create your artisan account</p>
          </div>
          
          <form action="/api/auth" method="post" className="space-y-4">
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
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
