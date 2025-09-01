import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default async function BuyerLoginPage() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("session_user");
  const buyerSession = cookieStore.get("session_buyer");

  if (userSession) redirect("/dashboard");
  if (buyerSession) redirect("/buyer");

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
          
          <form action="/api/buyer/login" method="post" className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatedText translationKey="email" /> or <TranslatedText translationKey="phone" />
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email or phone"
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
                placeholder="Enter password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              <TranslatedText translationKey="login" />
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
              <TranslatedText translationKey="login" /> as Artisan
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
