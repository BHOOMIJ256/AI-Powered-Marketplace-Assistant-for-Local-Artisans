"use client";

import { useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from 'next/font/google';
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function SellerSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Handle success - you can add redirect logic here
        console.log("Registration successful");
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
      [e.target.name]: e.target.value
    });
  };

  // Fixed function to properly distribute 50 images across 5 columns
  const getColumnImages = (columnIndex: number) => {
    // Distribute 50 images across 5 columns (10 images per column)
    const imagesPerColumn = 10;
    const startIndex = columnIndex * imagesPerColumn + 1;
    
    // Create array with 20 items (duplicating for smooth infinite scroll)
    return Array.from({ length: 20 }, (_, i) => {
      const imageIndex = startIndex + (i % imagesPerColumn);
      return `/images/grid/${imageIndex}.png`;
    });
  };

  return (
    <div className={`min-h-screen overflow-hidden relative ${cormorant.className}`}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 grid grid-cols-5 gap-4 p-4">
        {[0, 1, 2, 3, 4].map((columnIndex) => (
          <div
            key={columnIndex}
            className={`flex flex-col gap-4 ${
              columnIndex % 2 === 0 ? 'animate-scroll-down' : 'animate-scroll-up'
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
                    // Fallback to a gradient background if image fails to load
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

      {/* Main Content - Adjusted for ultra compact fixed header with extra spacing */}
      <main className="relative z-10 flex items-center justify-end min-h-screen px-6 pr-12 pt-28">
        <div className="w-full max-w-lg">
          {/* Static Card - No Floating Animation */}
          <div 
            className="stable-card rounded-3xl p-10 shadow-2xl border"
            style={{
              backgroundColor: 'rgba(250, 248, 245, 0.98)', // More opaque cream background
              borderColor: '#d4c4a8', // Light brown border
              boxShadow: '0 25px 50px -12px rgba(139, 69, 19, 0.25)' // Stronger brown shadow
            }}
          >
            <div className="text-center mb-8">
              <h1 
                className="font-bold mb-3"
                style={{ 
                  color: '#8b4513',
                  fontSize: '2.5rem' // Increased font size
                }}
              >
                <TranslatedText translationKey="signupAsSeller" />
              </h1>
              <p 
                className=""
                style={{ 
                  color: '#a0522d',
                  fontSize: '1.175rem',  
                  fontWeight: 'bold' 
                }}
              >
                Create your artisan account
              </p>
            </div>
            
            {error && (
              <div 
                className="border px-4 py-3 rounded-2xl mb-6"
                style={{
                  backgroundColor: '#fdf2f2',
                  borderColor: '#fecaca',
                  color: '#b91c1c',
                  fontSize: '1rem'
                }}
              >
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block font-bold mb-3 capitalize"
                  style={{ 
                    color: '#8b4513',
                    fontSize: '1.125rem' // Increased font size
                  }}
                >
                  <TranslatedText translationKey="name" />
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#f5f1eb',
                    color: '#8b4513',
                    fontSize: '1rem' // Increased input font size
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block font-semibold mb-3"
                  style={{ 
                    color: '#8b4513',
                    fontSize: '1.125rem'
                  }}
                >
                  <TranslatedText translationKey="email" />
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#f5f1eb',
                    color: '#8b4513',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your email (optional)"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="phone" 
                  className="block font-bold mb-3"
                  style={{ 
                    color: '#8b4513',
                    fontSize: '1.125rem'
                  }}
                >
                  <TranslatedText translationKey="phone" />
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#f5f1eb',
                    color: '#8b4513',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="password" 
                  className="block font-bold mb-3"
                  style={{ 
                    color: '#8b4513',
                    fontSize: '1.125rem'
                  }}
                >
                  <TranslatedText translationKey="password" />
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#f5f1eb',
                    color: '#8b4513',
                    fontSize: '1rem'
                  }}
                  placeholder="Create a password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-4 px-6 rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d2691e 0%, #cd853f 100%)',
                  fontSize: '1.125rem' // Increased button font size
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #d2691e 0%, #cd853f 100%)';
                  }
                }}
              >
                {loading ? "Creating Account..." : 
                  <>
                    <TranslatedText translationKey="create" /> <TranslatedText translationKey="account" />
                  </>
                }
              </button>
            </form>
            
            <div className="text-center mt-8">
              <p 
                style={{ 
                  color: '#a0522d',
                  fontSize: '1rem' // Increased font size
                }}
              >
                <TranslatedText translationKey="hasAccount" />{" "}
                <Link 
                  href="/login" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ 
                    color: '#8b4513',
                    fontSize: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLAnchorElement).style.color = '#a0522d';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLAnchorElement).style.color = '#8b4513';
                  }}
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