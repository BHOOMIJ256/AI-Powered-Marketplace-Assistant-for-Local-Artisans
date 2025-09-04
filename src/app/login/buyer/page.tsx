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
      // Check if user is already logged in as buyer
      const res = await fetch("/api/buyer/check-auth");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          router.push("/buyer");
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
    <div
    className="min-h-screen bg-cover bg-center relative"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1658155058681-7a17cf3c42fd?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    }}>
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black opacity-40"></div>

    {/* Page Content */}
    <div className="relative z-10">
      {/* Header with Language Selector */}
      <header className="flex justify-between items-center p-6">
        <Link href="/" className="text-2xl font-bold text-white">
          Artisan Marketplace
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex items-center justify-center min-h-[80vh] px-6">
      <div className="w-full max-w-md space-y-6 p-6 rounded-2xl shadow-lg bg-[rgba(126,120,67,0.8)] translate-x-100">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">
              <TranslatedText translationKey="login" /> as{" "}
              <TranslatedText translationKey="buyer" />
            </h1>
            <p className="text-sm text-gray-50 mt-2">
              Sign in to your buyer account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-50 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter email or phone"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-50 mb-1"
              >
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
            <p className="text-sm text-gray-50">
              <TranslatedText translationKey="noAccount" />{" "}
              <Link
                href="/signup/buyer"
                className="text-green-300 hover:underline"
              >
                <TranslatedText translationKey="signup" />
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-gray-50"
            >
              ← Back to login options
            </Link>
          </div>
        </div>
      </main>


    </div>
  </div>

  );
}
