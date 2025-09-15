import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Fixed Navbar */}
      <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
  bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
  backdrop-blur-md shadow-md border-b border-amber-950/40">

  {/* Brand / Logo */}
  <div 
    className="text-4xl font-extrabold tracking-wider text-amber-100 drop-shadow-md 
               hover:scale-[1.05] transition-transform duration-500 ease-out" 
    style={{ fontFamily: 'Cinzel Decorative, Cormorant Garamond, serif' }}
  >
    ARTISAN
  </div>

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
      Login
    </Link>
    <Link
      href="/signup"
      className="px-4 py-2 border border-[#c9a86a] text-[#f0e68c] 
                 rounded-md font-medium shadow-sm transition-all duration-300 
                 hover:bg-[#f0e68c] hover:text-[#5c3317] hover:scale-105"
    >
      Sign Up
    </Link>

    {/* Language Selector on extreme right */}
    <div className="ml-4">
      <LanguageSelector />
    </div>
  </div>
</nav>


      {/* Push content below fixed navbar (navbar height ≈ 96px → pt-24) */}
      <main className="pt-24">
        {/* Hero section */}
        <section className="relative h-[420px] w-full overflow-hidden">
          <img
            src="images/about-us.jpg"
            alt="potter shaping clay on a wheel"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full items-center justify-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
              About us
            </h1>
          </div>
        </section>

        {/* Content with decorative side images */}
        <section className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          {/* Left decorative figure */}
          <div className="pointer-events-none absolute left-2 top-6 hidden md:block">
            <img
              src="/11-removebg-preview.png"
              alt="decorative artisan doll"
              className="h-64 w-auto opacity-90"
            />
          </div>

          {/* Right decorative figure */}
          <div className="pointer-events-none absolute right-2 top-6 hidden md:block">
            <img
              src="/11-removebg-preview.png"
              alt="decorative artisan doll"
              className="h-64 w-auto opacity-90"
            />
          </div>

          <div className="mx-auto max-w-3xl text-center leading-8 text-amber-900">
            <p className="mb-4">
              Welcome to Artisan Creations, where the beauty of handcrafted artistry comes to life!
              At Artisan Creations, we are passionate about celebrating the timeless tradition of
              craftsmanship and the unique stories that each piece tells.
            </p>
            <p className="mb-4">
              Our team of dedicated artisans is committed to creating exquisite, one-of-a-kind
              products that blend creativity with quality. We believe in the power of handmade goods
              to connect people with culture, heritage, and a sense of personal expression.
            </p>
            <p className="mb-4">
              Whether you're seeking a unique gift or a special addition to your home, our diverse
              collection offers something for everyone. Explore our curated selection and discover
              the artistry that defines us.
            </p>
            <p>
              Join us on our journey to preserve and promote the art of handmade creations, crafted
              with love and care.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
