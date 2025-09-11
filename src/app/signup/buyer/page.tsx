// src/app/signup/buyer/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function BuyerSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/buyer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/buyer");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      {/* 🔹 Amber-Themed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
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
            <TranslatedText translationKey="signup" />
          </Link>

          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* 🔹 Animated Grid Background */}
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

      {/* 🔹 Signup Form */}
      <main className="relative z-10 flex items-center justify-end min-h-screen px-6 pr-12 pt-36">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl p-10 shadow-xl border bg-[rgba(250,248,245,0.98)] border-amber-200">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                <TranslatedText translationKey="signupAsBuyer" />
              </h1>
              <p className="text-base font-medium text-amber-700">
                Create your buyer account
              </p>
            </div>

            {error && (
              <div className="border px-4 py-3 rounded-2xl mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { id: "name", label: "name", type: "text", required: true },
                { id: "email", label: "email", type: "email", required: false },
                { id: "phone", label: "phone", type: "tel", required: true },
                { id: "city", label: "city", type: "text", required: true },
                { id: "state", label: "state", type: "text", required: true },
                { id: "password", label: "password", type: "password", required: true },
              ].map(({ id, label, type, required }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block text-sm font-semibold text-amber-900 mb-2 capitalize"
                  >
                    <TranslatedText translationKey={label} />
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    value={(formData as any)[id]}
                    onChange={handleChange}
                    required={required}
                    className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                    placeholder={`Enter your ${label}`}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #d2691e 0%, #cd853f 100%)",
                }}
              >
                {loading ? "Creating Account..." : <TranslatedText translationKey="createAccount" />}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-amber-700">
                <TranslatedText translationKey="hasAccount" />{" "}
                <Link href="/login/buyer" className="font-semibold hover:underline text-amber-900">
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
