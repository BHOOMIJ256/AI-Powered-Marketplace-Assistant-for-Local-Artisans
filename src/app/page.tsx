import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default async function Home() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("session_user");
  const buyerSession = cookieStore.get("session_buyer");

  // Redirect logged-in users to their appropriate pages
  if (userSession) redirect("/dashboard");
  if (buyerSession) redirect("/buyer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Language Selector */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-gray-800">Artisan Marketplace</h1>
        <LanguageSelector />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <TranslatedText translationKey="loginTitle" />
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover unique handmade products from local artisans and connect with talented craftspeople in your community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              <TranslatedText translationKey="login" />
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
            >
              <TranslatedText translationKey="signup" />
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Artisans</h3>
              <p className="text-gray-600">Showcase your crafts and manage your business</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Buyers</h3>
              <p className="text-gray-600">Discover unique handmade products</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Connect with local artisans and buyers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
