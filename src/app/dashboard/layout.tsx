"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const navbarAmber = "#8b4513" //"#8B5E3C"; // navbar amber shade
  const beige = "#FAF3E0";

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/marketing", label: "AI Marketing" },
    { href: "/dashboard/insights", label: "Customer Insights" },
    { href: "/dashboard/pricing", label: "Pricing & Trends" },
    { href: "/dashboard/finance-support", label: "Finance & Support" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: beige }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-20 shadow-md"
        style={{ backgroundColor: navbarAmber }}
      >
        <div className="mx-auto flex w-full items-center justify-between px-8 py-4">
          <Link
            href="/"
            className="text-3xl font-bold tracking-wider text-[#FAF3E0] transition-all"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            ARTISAN
          </Link>

          <div className="hidden gap-6 md:flex items-center">
            {[
              { href: "/", label: "HOME" },
              { href: "/about", label: "ABOUT" },
              { href: "#contact", label: "CONTACT" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-[#FAF3E0] font-medium after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#FAF3E0] after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3">
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="px-5 py-2 border border-[#8b4513] text-[#FAF3E0] bg-transparent rounded-md font-medium transition-transform hover:scale-105 hover:bg-[#FAF3E0] hover:text-[#000]"
                >
                  <TranslatedText translationKey="logout" />
                </button>
              </form>

              <Link
                href="/signup"
                className="px-5 py-2 bg-[#FAF3E0] text-[#000] rounded-md font-medium transition-transform hover:scale-105 hover:bg-[#000] hover:text-[#FAF3E0]"
              >
                <TranslatedText translationKey="Signup" />
              </Link>

              <div className="ml-2">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-64 relative shadow-md"
          style={{
            backgroundImage: "url('/textures/picture.jpeg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: navbarAmber, opacity: 0.3 }}
          />
          <div className="relative p-6">
            <h2 className="text-xs uppercase tracking-wider text-[#FAF3E0] font-bold mb-4">
              ARTISAN DASHBOARD
            </h2>
            <nav className="space-y-1">
              {links.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-4 py-3 text-sm font-medium rounded-md transition-all border-l-4 ${
                      isActive
                        ? "bg-[#8b4513] text-[#FAF3E0] border-[#8b4513]"
                        : "bg-[#8b4513]/40 text-[#FAF3E0] border-[#8b4513]/60 hover:bg-[#8b4513]/70"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
