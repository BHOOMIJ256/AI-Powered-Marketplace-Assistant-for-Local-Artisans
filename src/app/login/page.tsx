import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default async function LoginPage(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("session_user");
  const buyerSession = cookieStore.get("session_buyer");

  if (userSession) redirect("/dashboard");
  if (buyerSession) redirect("/buyer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
        backdrop-blur-md shadow-md border-b border-amber-950/40">

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
            <TranslatedText translationKey="Signup" />
          </Link>

          {/* Language Selector */}
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* Main Login Section */}
      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl text-amber-900 font-semibold">
              <TranslatedText translationKey="loginTitle" />
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Choose your account type to sign in
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/login/seller"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md 
                         hover:bg-blue-700 transition-colors text-center font-medium"
            >
              <TranslatedText translationKey="login" /> as Seller (Artisan)
            </Link>
            
            <Link
              href="/login/buyer"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-md 
                         hover:bg-green-700 transition-colors text-center font-medium"
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
