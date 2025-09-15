import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function SignupPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
      
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[2] bg-repeat"
        style={{
          backgroundImage: "url('/images/indian-texture1.jpeg')",
          backgroundSize: "400px 400px",
          backgroundPosition: "center",
          zIndex: 1
        }}
      ></div>

      {/* Content Wrapper with higher z-index */}
      <div className="relative z-10">
        
         {/* Navbar */}
      <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
        bg-amber-900/85  
        backdrop-blur-md shadow-md border-b border-amber-950/40">
          {/* Brand / Logo */}
          <Link 
            href="/" 
            className="text-4xl font-extrabold tracking-wider text-stone-100 drop-shadow-md 
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
                className="px-4 py-2 text-stone-100 tracking-wide font-medium 
                           transition-all duration-300 hover:text-stone-300"
              >
                {item.label}
              </Link>
            ))}

            {/* Login & Signup - Updated colors */}
            <Link
              href="/login"
              className="px-4 py-2 border border-amber-100 text-amber-100 
                         rounded-md font-medium shadow-sm transition-all duration-300 
                         hover:bg-amber-100 hover:text-red-900 hover:scale-105"
            >
              <TranslatedText translationKey="login" />
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 border border-amber-100 text-amber-100 
                         rounded-md font-medium shadow-sm transition-all duration-300 
                         hover:bg-amber-100 hover:text-red-900 hover:scale-105"
            >
              <TranslatedText translationKey="Signup" />
            </Link>

            {/* Language Selector */}
            <div className="ml-4">
              <LanguageSelector />
            </div>
          </div>
        </nav>

        {/* Main Signup Section */}
        <main className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-amber-900">
                <TranslatedText translationKey="Signup" />
              </h1>
              <p className="text-sm text-amber-900 mt-2">
                <TranslatedText translationKey="Choose your account type" />
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Primary Button - Burnt Sienna */}
              <Link
                href="/signup/buyer"
                className="block w-full text-white py-3 px-4 rounded-md 
                           font-medium transition-all duration-300 shadow-lg
                           hover:shadow-xl hover:scale-105 text-center
                           bg-red-900 hover:bg-red-800"
                style={{ backgroundColor: '#A0522D' }}
              >
                <TranslatedText translationKey="signupAsBuyer" />
              </Link>
              
              {/* Secondary Button - Muted Gold */}
              <Link
                href="/signup/seller"
                className="block w-full py-3 px-4 rounded-md 
                           font-medium transition-all duration-300 shadow-lg
                           hover:shadow-xl hover:scale-105 text-center
                           bg-yellow-600 hover:bg-yellow-700 text-amber-900 hover:text-amber-950"
                style={{ 
                  backgroundColor: '#C9A96E',
                  color: '#4A3429'
                }}
              >
                <TranslatedText translationKey="signupAsSeller" />
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-stone-600">
                <TranslatedText translationKey="hasAccount" />{" "}
                <Link href="/login" className="text-stone-700 hover:text-stone-900 hover:underline font-medium">
                  <TranslatedText translationKey="login" />
                </Link>
              </p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}