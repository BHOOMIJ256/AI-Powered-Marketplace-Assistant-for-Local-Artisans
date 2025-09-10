"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/buyer");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fixed function to properly distribute 50 images across 5 columns
  const getColumnImages = (columnIndex: number) => {
    const imagesPerColumn = 10;
    const startIndex = columnIndex * imagesPerColumn + 1;

    return Array.from({ length: 20 }, (_, i) => {
      const imageIndex = startIndex + (i % imagesPerColumn);
      return `/images/grid/${imageIndex}.png`;
    });
  };

  return (
    <div className={`min-h-screen overflow-hidden relative ${cormorant.className}`}>
      {/* 🔹 Amber-Themed Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
        backdrop-blur-md shadow-md border-b border-amber-950/40"
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-4xl font-extrabold tracking-wider text-amber-100 drop-shadow-md 
                     hover:scale-[1.05] transition-transform duration-500 ease-out"
          style={{ fontFamily: "Cinzel Decorative, Cormorant Garamond, serif" }}
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

      {/* 🔹 Main Signup Form */}
      <main className="relative z-10 flex items-center justify-end min-h-screen px-6 pr-12 pt-36">
        <div className="w-full max-w-lg">
          <div
            className="stable-card rounded-3xl p-10 shadow-2xl border"
            style={{
              backgroundColor: "rgba(250, 248, 245, 0.98)",
              borderColor: "#d4c4a8",
              boxShadow: "0 25px 50px -12px rgba(139, 69, 19, 0.25)",
            }}
          >
            {/* Title */}
            <div className="text-center mb-8">
              <h1
                className="font-bold mb-3"
                style={{
                  color: "#8b4513",
                  fontSize: "2.5rem",
                }}
              >
                <TranslatedText translationKey="signupAsBuyer" />
              </h1>
              <p
                style={{
                  color: "#a0522d",
                  fontSize: "1.175rem",
                  fontWeight: "bold",
                }}
              >
                Create your buyer account
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="border px-4 py-3 rounded-2xl mb-6"
                style={{
                  backgroundColor: "#fdf2f2",
                  borderColor: "#fecaca",
                  color: "#b91c1c",
                  fontSize: "1rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="block font-bold mb-3 capitalize"
                    style={{ color: "#8b4513", fontSize: "1.125rem" }}
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
                    className="w-full px-5 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      backgroundColor: "#f5f1eb",
                      color: "#8b4513",
                      fontSize: "1rem",
                    }}
                    placeholder={`Enter your ${label}`}
                  />
                </div>
              ))}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-4 px-6 rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #d2691e 0%, #cd853f 100%)",
                  fontSize: "1.125rem",
                }}
              >
                {loading ? "Creating Account..." : <TranslatedText translationKey="createAccount" />}
              </button>
            </form>

            {/* Redirect to login */}
            <div className="text-center mt-8">
              <p style={{ color: "#a0522d", fontSize: "1rem" }}>
                <TranslatedText translationKey="hasAccount" />{" "}
                <Link
                  href="/login/buyer"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: "#8b4513", fontSize: "1rem" }}
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
