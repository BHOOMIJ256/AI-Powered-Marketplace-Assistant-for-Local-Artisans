"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function SellerLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          if (data.role === "artisan") {
            router.push("/dashboard");
          } else if (data.role === "buyer") {
            router.push("/buyer");
          }
          return;
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const getColumnImages = (columnIndex: number) => {
    const imagesPerColumn = 10;
    const startIndex = columnIndex * imagesPerColumn + 1;

    return Array.from({ length: 20 }, (_, i) => {
      const imageIndex = startIndex + (i % imagesPerColumn);
      return `/images/grid/${imageIndex}.png`;
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-amber-900 text-base font-medium">
          <TranslatedText translationKey="loading" />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Grid Background */}
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
                className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
                style={{
                  minHeight: "200px",
                  backgroundColor: "#f5f1eb",
                }}
              >
                <img
                  src={imageSrc}
                  alt={`Grid image ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
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

      {/* Navbar */}
      {/* Navbar (removed blur effect) */}
      <nav className="fixed top-0 left-0 right-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-amber-900/85  
        backdrop-blur-md shadow-md border-b border-amber-950/40">

        <Link
          href="/"
          className="text-4xl font-extrabold tracking-wider text-amber-100 drop-shadow-md 
                     hover:scale-[1.05] transition-transform duration-500 ease-out"
          style={{ fontFamily: "Cinzel Decorative, serif" }}
        >
          ARTISAN
        </Link>

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
            <TranslatedText translationKey="Signup" />
          </Link>

          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-end min-h-screen px-6 pr-12 pt-28">
        <div className="w-full max-w-lg">
          <div
            className="rounded-3xl p-10 shadow-2xl border"
            style={{
              backgroundColor: "rgba(250, 248, 245, 0.98)",
              borderColor: "#d4c4a8",
              boxShadow: "0 25px 50px -12px rgba(139, 69, 19, 0.25)",
            }}
          >
            <div className="text-center mb-8">
              <h1 className="font-bold mb-2 text-3xl text-amber-900">
                <TranslatedText translationKey="login" /> as Seller (Artisan)
              </h1>
              <p className="text-sm text-amber-800/80 font-medium">
                Sign in to your artisan account
              </p>
            </div>

            {error && (
              <div className="border px-4 py-3 rounded-xl mb-6 text-sm font-medium text-red-700 bg-red-50 border-red-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block font-semibold mb-2 text-sm tracking-wide text-amber-900/90"
                >
                  <TranslatedText translationKey="email" /> or{" "}
                  <TranslatedText translationKey="phone" />
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-0 shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-amber-600/50 
                             transition-all duration-200 text-sm tracking-wide"
                  style={{
                    backgroundColor: "#f5f1eb",
                    color: "#5c3317",
                  }}
                  placeholder="Enter email or phone"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block font-semibold mb-2 text-sm tracking-wide text-amber-900/90"
                >
                  <TranslatedText translationKey="password" />
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-0 shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-amber-600/50 
                             transition-all duration-200 text-sm tracking-wide"
                  style={{
                    backgroundColor: "#f5f1eb",
                    color: "#5c3317",
                  }}
                  placeholder="Enter password"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-amber-100 font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-amber-800 hover:bg-amber-800"
              >
                {loading ? "Signing in..." : <TranslatedText translationKey="login" />}
              </button>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-6">
              <p className="text-sm text-amber-800/80">
                <TranslatedText translationKey="noAccount" />{" "}
                <Link
                  href="/signup/seller"
                  className="font-semibold hover:underline transition-colors text-amber-900"
                >
                  <TranslatedText translationKey="signup" />
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link
                href="/login"
                className="font-medium transition-colors text-xs text-amber-700 hover:text-amber-900"
              >
                ← Back to login options
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
