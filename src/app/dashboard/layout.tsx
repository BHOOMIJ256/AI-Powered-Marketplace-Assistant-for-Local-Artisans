"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Sidebar links
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/marketing", label: "AI Marketing" },
    { href: "/dashboard/insights", label: "Customer Insights" },
    { href: "/dashboard/pricing", label: "Pricing & Trends" },
    { href: "/dashboard/storytelling", label: "Storytelling" },
    { href: "/dashboard/finance-support", label: "Finance & Support" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Navbar (new version) */}
      <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
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
            <TranslatedText translationKey="Signup" />
          </Link>

          {/* Language Selector */}
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* Content wrapper (push down so it doesn’t overlap navbar) */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <aside className="w-56 bg-[rgb(92,51,23)] text-white p-4 space-y-4">
          <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">
            Dashboard
          </p>
          <nav className="space-y-1">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white text-[rgb(92,51,23)] font-semibold"
                      : "hover:bg-[rgb(160,82,45)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
