import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function SignupPage() {
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
              <TranslatedText translationKey="signupTitle" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">Choose your account type</p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/signup/buyer"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center font-medium"
            >
              <TranslatedText translationKey="signupAsBuyer" />
            </Link>
            
            <Link
              href="/signup/seller"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center font-medium"
            >
              <TranslatedText translationKey="signupAsSeller" />
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <TranslatedText translationKey="hasAccount" />{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                <TranslatedText translationKey="login" />
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 