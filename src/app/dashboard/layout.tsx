"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div className="min-h-screen flex bg-[rgb(139,69,19)]"> 
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
  );
}
