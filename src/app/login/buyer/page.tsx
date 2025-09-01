"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function BuyerLoginPage() {
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
      // Check if user is already logged in
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          if (data.role === 'artisan') {
            router.push("/dashboard");
          } else if (data.role === 'buyer') {
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
      const res = await fetch("/api/buyer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to buyer page on success
        router.push("/buyer");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p><TranslatedText translationKey="loading" /></p>
      </div>
    );
  }

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
              <TranslatedText translationKey="login" /> as <TranslatedText translationKey="buyer" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to your buyer account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="email" /> or <TranslatedText translationKey="phone" />
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter email or phone"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="password" />
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {loading ? "Signing in..." : <TranslatedText translationKey="login" />}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <TranslatedText translationKey="noAccount" />{" "}
              <Link href="/signup/buyer" className="text-green-600 hover:underline">
                <TranslatedText translationKey="signup" />
              </Link>
            </p>
          </div>
          
          <div className="text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to login options
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
