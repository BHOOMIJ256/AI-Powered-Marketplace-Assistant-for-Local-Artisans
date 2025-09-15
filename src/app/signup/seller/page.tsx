// src/app/signup/seller/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function SellerSignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getColumnImages = (columnIndex: number) => {
    const imagesPerColumn = 10;
    const startIndex = columnIndex * imagesPerColumn + 1;
    return Array.from({ length: 20 }, (_, i) => {
      const imageIndex = startIndex + (i % imagesPerColumn);
      return `/images/grid/${imageIndex}.png`;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Convert FormData to JSON
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      // Add default values for required fields that aren't in the form
      city: "Not Specified",
      state: "Not Specified",
    };

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to artisan dashboard or success page
        router.push("/dashboard");
      } else {
        setError(result.error || result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative font-sans">
      {/* Background grid */}
      <div className="fixed inset-0 grid grid-cols-5 gap-4 p-4 blur-[2px]">
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

      {/* Navbar (removed blur effect) */}
      <nav className="fixed top-0 left-0 right-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-amber-900/85  
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

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-amber-100 font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-amber-900 hover:bg-amber-800"
              >
                {isSubmitting ? (
                  "Creating Account..."
                ) : (
                  <>
                    <TranslatedText translationKey="create" />{" "}
                    <TranslatedText translationKey="account" />
                  </>
                )}
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