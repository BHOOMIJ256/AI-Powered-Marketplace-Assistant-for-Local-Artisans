export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative h-[420px] w-full overflow-hidden">
        <img
          src="https://itokri.com/cdn/shop/articles/header6_1_bf61afaa-180c-4ea9-a2fb-be108b9ca401.jpg?v=1738050867&width=930"
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

        <div className="mx-auto max-w-3xl text-center leading-8 text-stone-700">
          <p className="mb-4">
            Welcome to Artisan Creations, where the beauty of handcrafted artistry comes to life!
            At Artisan Creations, we are passionate about celebrating the timeless tradition of
            craftsmanship and the unique stories that each piece tells.
          </p>
          <p className="mb-4">
            Our team of dedicated artisans is committed to creating exquisite, one-of-a-kind products
            that blend creativity with quality. We believe in the power of handmade goods to connect
            people with culture, heritage, and a sense of personal expression.
          </p>
          <p className="mb-4">
            Whether you're seeking a unique gift or a special addition to your home, our diverse
            collection offers something for everyone. Explore our curated selection and discover the
            artistry that defines us.
          </p>
          <p>
            Join us on our journey to preserve and promote the art of handmade creations, crafted
            with love and care.
          </p>
        </div>
      </section>
    </div>
  );
}


