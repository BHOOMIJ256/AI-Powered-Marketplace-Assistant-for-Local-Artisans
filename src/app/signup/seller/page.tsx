// src/app/signup/seller/page.tsx
"use client";

import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function SellerSignupPage() {
  const getColumnImages = (columnIndex: number) => {
    const imagesPerColumn = 10;
    const startIndex = columnIndex * imagesPerColumn + 1;
    return Array.from({ length: 20 }, (_, i) => {
      const imageIndex = startIndex + (i % imagesPerColumn);
      return `/images/grid/${imageIndex}.png`;
    });
  };

  return (
    <div className="min-h-screen overflow-hidden relative font-sans">
      {/* Background grid */}
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
                className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-amber-50"
              >
                <img
                  src={imageSrc}
                  alt={`Grid image ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.style.background =
                      "linear-gradient(135deg, #f5deb3, #f0e68c)";
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Navbar (same as BuyerLoginPage) */}
      <nav className="sticky top-0 z-50 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
        backdrop-blur-md shadow-md border-b border-amber-950/40">
        
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-4xl font-extrabold tracking-wider text-amber-100 drop-shadow-md 
                     hover:scale-[1.05] transition-transform duration-500 ease-out"
          style={{ fontFamily: "Cinzel Decorative, serif" }}
        >
          ARTISAN
        </Link>

        {/* Nav Links */}
        <div className="hidden gap-4 md:flex items-center">
          {[
            { href: "/", label: "HOME" },
            { href: "/about", label: "ABOUT" },
            { href: "#contact", label: "CONTACT" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-amber-100 tracking-wide font-medium 
                         transition-all duration-300 hover:text-amber-300"
            >
              {item.label}
            </Link>
          ))}

          {/* Login & Signup */}
          <Link
            href="/login"
            className="px-4 py-2 border border-[#c9a86a] text-[#f0e68c] 
                       rounded-md font-medium shadow-sm transition-all duration-300 
                       hover:bg-[#f0e68c] hover:text-[#5c3317] hover:scale-105"
          >
            <TranslatedText translationKey="login" />
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 border border-[#c9a86a] text-[#f0e68c] 
                       rounded-md font-medium shadow-sm transition-all duration-300 
                       hover:bg-[#f0e68c] hover:text-[#5c3317] hover:scale-105"
          >
            <TranslatedText translationKey="signup" />
          </Link>

          {/* Language Selector */}
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex items-center justify-end min-h-screen px-6 pr-12 pt-28">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl p-8 shadow-xl border bg-[rgba(250,248,245,0.98)] border-amber-200">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                <TranslatedText translationKey="signupAsSeller" />
              </h1>
              <p className="text-base font-medium text-amber-700">
                Create your artisan account
              </p>
            </div>

            <form action="/api/auth" method="post" className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-amber-900 mb-2"
                >
                  <TranslatedText translationKey="name" />
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-amber-900 mb-2"
                >
                  <TranslatedText translationKey="email" />
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                  placeholder="Enter your email (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-amber-900 mb-2"
                >
                  <TranslatedText translationKey="phone" />
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-amber-900 mb-2"
                >
                  <TranslatedText translationKey="password" />
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #d2691e 0%, #cd853f 100%)",
                }}
              >
                <TranslatedText translationKey="create" />{" "}
                <TranslatedText translationKey="account" />
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-amber-700">
                <TranslatedText translationKey="hasAccount" />{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:underline text-amber-900"
                >
                  <TranslatedText translationKey="login" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
