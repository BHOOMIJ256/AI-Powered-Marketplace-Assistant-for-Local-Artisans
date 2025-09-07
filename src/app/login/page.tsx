import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("session_user");
  const buyerSession = cookieStore.get("session_buyer");

  if (userSession) redirect("/dashboard");
  if (buyerSession) redirect("/buyer");

  return (
    <div className="min-h-screen bg-amber-100 from-blue-50 to-indigo-100">
      {/* Header with Language Selector */}
      <header className="flex justify-between items-center p-6">
        <Link href="/" className="text-2xl text-amber-900 font-bold">
          Artisan Marketplace
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl text-amber-900 font-semibold">
              <TranslatedText translationKey="loginTitle" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">Choose your account type to sign in</p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/login/seller"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center font-medium"
            >
              <TranslatedText translationKey="login" /> as Seller (Artisan)
            </Link>
            
            <Link
              href="/login/buyer"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center font-medium"
            >
              <TranslatedText translationKey="login" /> as Buyer
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <TranslatedText translationKey="noAccount" />{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                <TranslatedText translationKey="signup" />
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 