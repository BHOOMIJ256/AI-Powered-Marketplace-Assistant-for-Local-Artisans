"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";
import { useInView } from "@/app/hooks/useInView";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for user sessions and redirect if needed
    const userSession = document.cookie.includes("session_user");
    const buyerSession = document.cookie.includes("session_buyer");

    if (userSession) router.push("/dashboard");
    if (buyerSession) router.push("/buyer");
  }, [router]);

  // Scroll transition hooks
  const [headerRef, headerInView] = useInView();
  const [artisansRef, artisansInView] = useInView();
  const [categoriesRef, categoriesInView] = useInView();
  const [missionRef, missionInView] = useInView();
  const [impactRef, impactInView] = useInView();
  const [communityRef, communityInView] = useInView();

  return (

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background artisan mosaic matching the reference image */}
      <div className="absolute inset-0 z-0">

        <div className="grid h-screen w-screen grid-cols-3 grid-rows-2 gap-0">
          {[
            "https://media.licdn.com/dms/image/v2/D4D12AQEghHGDoCE4ZA/article-inline_image-shrink_1000_1488/article-inline_image-shrink_1000_1488/0/1702122645498?e=1761177600&v=beta&t=8WAAxdRchlT17iwHgC08HiHil2c1iTj3cj0DtefNS8A",
            "https://idronline.org/wp-content/uploads/2022/01/woman-artisan-standing-in-front-of-a-rug_Jaipur-Rugs-4_resize.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_eVlVyXFXgC9QmTEqCmlmHEkzG3ROkteYtQ&s",
            "https://www.bunkarvalley.com/wp-content/uploads/2024/10/Passionate-Pasapalli-Artisans-Behind-The-Loom.jpg",
            "https://miradorlife.com/wp-content/uploads/2021/08/header-6.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcQVDVTy3qFZDgH95syOU0fGOGHg7I4aeVhw&s",
            "https://media.licdn.com/dms/image/v2/D4D12AQEghHGDoCE4ZA/article-inline_image-shrink_1000_1488/article-inline_image-shrink_1000_1488/0/1702122645498?e=1761177600&v=beta&t=8WAAxdRchlT17iwHgC08HiHil2c1iTj3cj0DtefNS8A",
            "https://idronline.org/wp-content/uploads/2022/01/woman-artisan-standing-in-front-of-a-rug_Jaipur-Rugs-4_resize.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_eVlVyXFXgC9QmTEqCmlmHEkzG3ROkteYtQ&s",
            "https://www.bunkarvalley.com/wp-content/uploads/2024/10/Passionate-Pasapalli-Artisans-Behind-The-Loom.jpg",
            "https://miradorlife.com/wp-content/uploads/2021/08/header-6.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcQVDVTy3qFZDgH95syOU0fGOGHg7I4aeVhw&s",


          ].map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={src}
                alt="artisan craft work"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110 filter sepia-[0.3] saturate-75"
              />
              {/* Subtle gradient overlay for blending */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-orange-900/30" />
            </div>
          ))}
        </div>
      </div>


      {/* Soft top gradient like the screenshot */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/60 via-transparent to-amber-900/0" />

      {/* Navbar */}
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




      <div className="absolute text-3xl font-bold text-cream-100 tracking-widest" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {/* <h1 className="text-5xl font-bold text-gray-900 mb-6 text-center ">
            <TranslatedText translationKey="welcomeTitle" />
          </h1> */}
      </div>

      {/* Center statue - background removed */}
      {/* <main className="relative z-10 flex items-center justify-center"> */}
        {/* <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[60vh] w-[60vh] max-w-[90vw] rounded-full bg-gradient-radial from-amber-800/20 via-transparent to-transparent shadow-[0_0_100px_60px_rgba(146,64,14,0.3)]" /> */}
        <main className="flex flex-col items-center justify-center text-center">
  {/* Heading above image */}
  <br></br>
  <br></br>
  <h2
    className="text-6xl font-bold text-amber-900 mb-1 drop-shadow-sm animate-fade-in-up delay-"
    style={{ fontFamily: 'Cormorant Garamond, serif' }}
  >
    <TranslatedText translationKey="Welcome to our Artisan Marketplace " />
 
  </h2>

  {/* Image below heading */}
  <div className="relative mt-6 flex h-[65vh] w-[65vh] max-w-[92vw] items-center justify-center transition-all duration-1000 ease-out opacity-0 animate-fade-in-scale">
    <img
      src="\1-removebg-preview.png"
      alt="center statue"
      className="h-full w-full rounded-full object-contain drop-shadow-[0_20px_60px_rgba(40,37,8,0.6)] filter brightness-110 contrast-110 shadow-[0_0_100px_60px_rgba(150,64,14,0.3)]"
      style={{ background: 'transparent' }}
    />
  </div>
</main>


      {/* Decorative Image Divider 1 */}
      <div className="relative z-10 h-19 flex items-center justify-center overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF0TEN-mwlN5A8Cz-AOnDGHoz5V1dTaFlGLA&s"
          alt="artisan tools"
          className="w-full h-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out animate-fade-in"
        />
        <div className="absolute inset-0 " />

      </div>

      {/* Section 1: Featured Artisans - Brown & Cream Theme */}
      <section
        ref={artisansRef as any}
        className={`relative z-10 bg-[khaki]/10 flex items-center transition-all duration-1000 delay-300 ${
          artisansInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2
              className="text-7xl font-bold text-amber-900 mb-6 drop-shadow-sm animate-fade-in-up delay-200"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              <TranslatedText translationKey="Featured Artisans" />
            </h2>
            <p
              className="text-2xl text-amber-700 max-w-4xl mx-auto leading-relaxed"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <TranslatedText translationKey="featuredArtisansDescription" />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              {
                name: "Ram Gopal Saini",
                craft: "Jaipur blue pottery master",
                img: "https://cdn.workmob.com/stories_workmob/images/stories/thumb/ram-saini-arts-entertainment-jaipur-thumb.jpg",
              },
              {
                name: "Sneh Gangal",
                craft: "Weaving",
                img: "https://snehgangal.com/wp-content/uploads/2020/11/gangal.jpg",
              },
              {
                name: "Rajendra Bagel",
                craft: "Dhakra craft",
                img: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ0lhb9y_ohCV6ZE67iN-588QkrHFgdzPAM-aZALAcz1SmUgLh_",
              },
              {
                name: "New Artisan",
                craft: "Traditional craft",
                img: "https://via.placeholder.com/150",
              },
            ].map((artisan, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-l-4 border-amber-800 shadow-md hover:shadow-lg transition-all flex gap-6 items-center
                transform transition duration-700 ease-out 
                ${artisansInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{ transitionDelay: `${i * 200}ms` }} // stagger effect
              >
                {/* Image on left */}
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-md border-2 border-amber-300 flex-shrink-0">
                  <img
                    src={artisan.img}
                    alt={artisan.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text content on right */}
                <div>
                  <h3
                    className="text-xl font-bold text-amber-800 mb-2"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {artisan.name}
                  </h3>
                  <p className="text-gray-700 text-base mb-2">{artisan.craft}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Preserving traditional techniques while creating contemporary
                    masterpieces.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>




      <hr></hr>
      {/* Decorative Image Divider 2 */}
      <div className="relative z-10 h-50 bg-gradient-to-r from-stone-600 via-amber-600 to-stone-600 flex items-center justify-center overflow-hidden">
        <img
          src="https://t4.ftcdn.net/jpg/12/67/19/61/360_F_1267196195_TX0PoNWmPFyS4ceKsu159FwLYOgmRrIG.jpg"
          alt="pottery wheel"
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-stone-800/70" />
        <div className="absolute text-4xl font-bold text-amber-100 tracking-wider" style={{ fontFamily: 'Cormorant Garamond, serif' }}>

          <p className="text-3xl text-white-600 mb-12">
            Discover unique handmade products from local artisans and connect with talented craftspeople in your community.
          </p>
        </div>
      </div>
      {/* Section 2: Product Categories - Warm Browns */}
      <section
  ref={categoriesRef as any}
  className={`relative z-10 min-h-screen bg-[khaki]/10 flex items-center transition-all duration-1000 delay-400 ${
    categoriesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
  }`}
>
  <div className="max-w-7xl mx-auto px-6 py-20">
    {/* Heading */}
    <div className="text-center mb-16">
      <h2
        className="text-7xl font-bold text-stone-800 mb-6 drop-shadow-sm animate-fade-in-up delay-200"
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        <TranslatedText translationKey="Explore diverse categories" />
      </h2>
      <p
        className="text-2xl text-stone-700 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        <TranslatedText translationKey="Discover unique creations that tell a story and carry the soul of their maker." />
      </p>
    </div>

    {/* Categories Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
      {[
        {
          name: "Textiles",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Weaving_jamdani_at_BSCIC_Jamdani_palli%2C_Narayanganj_113.jpg/330px-Weaving_jamdani_at_BSCIC_Jamdani_palli%2C_Narayanganj_113.jpg",
        },
        {
          name: "Pottery",
          img: "https://www.tafecafe.com/wp-content/uploads/2022/11/Pottery.png",
        },
        {
          name: "Jewelry",
          img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200",
        },
        {
          name: "Woodwork",
          img: "https://www.sowpeace.in/cdn/shop/files/sowpeace-wooden-elephant-artisan-tabletop-decor-masterpiecetabletopsowpeacewood-eldn-wdn-tt-786569.jpg?v=1741833131&width=1946",
        },
        {
          name: "Metalcraft",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS3pNNPOuMPCeKX6jpV2UAoAy2LxZiajD_Yw&s",
        },
        {
          name: "Paintings",
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk0w_QBcHm86fUi0gxEegs_cXsWEYGqelBGw&s",
        },
        {
          name: "Sculptures",
          img: "https://5.imimg.com/data5/AZ/VC/FU/SELLER-7545519/indian-sculpture.jpeg",
        },
        {
          name: "Ceramics",
          img: "https://m.media-amazon.com/images/I/71NAoXH3bhL.jpg",
        },
      ].map((category, i) => (
        <div
          key={category.name}
          className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-md hover:shadow-xl border-l-4 border-amber-800 transition-all transform
          ${categoriesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          style={{ transitionDelay: `${i * 150}ms` }} // stagger animation
        >
          {/* Image */}
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-amber-400 shadow">
            <img
              src={category.img}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Text */}
          <h3
            className="text-xl font-bold text-amber-800 text-center"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            {category.name}
          </h3>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Decorative Image Divider 3 */}
      <div className="relative z-10 h-50 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-800 flex items-center justify-center overflow-hidden">
        <img
          src="https://t4.ftcdn.net/jpg/12/67/19/61/360_F_1267196195_TX0PoNWmPFyS4ceKsu159FwLYOgmRrIG.jpg"
          alt="traditional crafts"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-amber-900/60" />
        <div className="absolute text-3xl font-bold text-white tracking-widest" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          ☾ HERITAGE & INNOVATION ☽
        </div>
      </div>

      {/* Section 3: About Our Mission - Rich Browns */}
      <section
        ref={missionRef as any}
        className={`relative z-10 min-h-screen bg-[khaki]/20 flex items-center transition-all duration-1000 delay-500 ${missionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left Content */}
            <div>
              <h2 className="text-7xl font-bold text-amber-900 mb-8 drop-shadow-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                <TranslatedText translationKey="Our Mission" />
              </h2>
              <p className="text-2xl text-amber-800 mb-8 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                <TranslatedText translationKey="We are on a mission to empower local artisans by bringing their handcrafted treasures to the world.
Our platform connects skilled creators with conscious buyers who value authenticity and sustainability.
Every purchase supports heritage, craftsmanship, and communities.
Together, we celebrate culture while shaping a brighter, fairer future for artisans." />
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-amber-200/70 backdrop-blur-lg px-8 py-4 rounded-full text-amber-900 font-bold text-lg border border-amber-300">Authenticity</span>
                <span className="bg-stone-200/70 backdrop-blur-lg px-8 py-4 rounded-full text-stone-800 font-bold text-lg border border-stone-300">Quality</span>
                <span className="bg-yellow-200/70 backdrop-blur-lg px-8 py-4 rounded-full text-yellow-900 font-bold text-lg border border-yellow-300">Heritage</span>
              </div>
            </div>

            {/* Right Image Full Height */}
            <div className="relative h-full min-h-screen">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300">
                <img
                  src="https://media.licdn.com/dms/image/v2/D4D12AQFsK_G3iOWSLg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1702122874916?e=2147483647&v=beta&t=GnyGY55ijUMYZjI9dqn5BDTCCaHYJVsoCNGr_MmowYE"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-4 bg-gradient-to-br from-amber-900/10 to-transparent rounded-2xl border border-amber-200/50 "></div>
            </div>

          </div>
        </div>
      </section>


      {/* Decorative Image Divider 4 */}
      <div className="relative z-10 h-40 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565814576524-7fcb5e516c8e?w=1200"
          alt="handmade pottery"
          className="w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-stone-900/70" />
        <div className="absolute text-3xl font-bold text-amber-100 tracking-widest" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          ⚡ GLOBAL ARTISAN NETWORK ⚡
        </div>
      </div>

      {/* Section 4: Global Impact - Deep Earth Tones */}
      <section
        ref={impactRef as any}
        className={`relative z-10 min-h-screen bg-[khaki]/40 flex items-center transition-all duration-1000 delay-600 ${impactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-7xl font-bold text-amber-900 mb-6 drop-shadow-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <TranslatedText translationKey="globalImpact" />
            </h2>
            <p className="text-2xl text-stone-700 max-w-4xl mx-auto leading-relaxed">
              <TranslatedText translationKey="globalImpactDescription" />
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {[
              { number: '50K+', label: 'Artisans Supported' },
              { number: '120+', label: 'Countries Reached' },
              { number: '1M+', label: 'Products Sold' },
              { number: '$25M+', label: 'Earnings Generated' }
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/70 rounded-3xl p-8 shadow-lg">
                <div className="text-6xl font-bold text-amber-800 mb-4 drop-shadow-md" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{stat.number}</div>
                <div className="text-xl text-stone-700 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { img: 'https://catalystaic.org/wp-content/uploads/2021/10/PHOTO-2022-04-05-17-53-47-1024x768.jpg' },
              { img: 'https://www.shutterstock.com/image-photo/guwahati-india-20-august-2020-260nw-1799546608.jpg', title: 'Preserving Traditions' },
              { img: 'https://d3vrux30chabys.cloudfront.net/wp-content/uploads/2022/01/prathik_new.jpg' }
            ].map((story, i) => (
              <div key={i} className="bg-white/70 rounded-3xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500">
                <img src={story.img} alt={story.title} className="w-full h-60 object-cover" />
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-amber-900 text-center mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{story.title}</h3>
                  <p className="text-amber-700 text-center leading-relaxed">Real stories of transformation, growth, and cultural preservation through artisan partnerships</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Image Divider 5 */}
      <div className="relative z-10 h-40 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200"
          alt="jewelry making"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 to-amber-900/70" />
        <div className="absolute text-4xl font-bold text-amber-100 tracking-wider" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          ◊ JOIN OUR COMMUNITY ◊
        </div>
      </div>

      {/* Section 5: Join Our Community - Warm Earth Palette */}
      <section
        ref={communityRef as any}
        className={`relative z-10 min-h-screen bg- flex items-center transition-all duration-1000 delay-700 ${communityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-7xl font-bold text-amber-900 mb-6 drop-shadow-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <TranslatedText translationKey="joinCommunity" />
            </h2>
            <p className="text-2xl text-amber-800 max-w-4xl mx-auto leading-relaxed">
              <TranslatedText translationKey="joinCommunityDescription" />
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-cream-100 to-amber-100 backdrop-blur-lg rounded-3xl p-10 border border-amber-200/50 shadow-xl">
                <h3 className="text-4xl font-bold text-amber-900 mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>For Collectors</h3>
                <p className="text-xl text-amber-800 mb-8 leading-relaxed">Discover one-of-a-kind, handcrafted pieces directly from master artisans. Each purchase supports traditional crafts and their creators.</p>
                <button className="bg-gradient-to-r from-amber-600 to-yellow-700 px-10 py-4 rounded-full text-white font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-lg">
                  Start Exploring
                </button>
              </div>
              <div className="bg-gradient-to-br from-stone-100 to-amber-100 backdrop-blur-lg rounded-3xl p-10 border border-stone-200/50 shadow-xl">
                <h3 className="text-4xl font-bold text-stone-800 mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>For Artisans</h3>
                <p className="text-xl text-stone-700 mb-8 leading-relaxed">Share your craft with a global audience. Connect with customers who truly value authentic artisanship and cultural traditions.</p>
                <button className="bg-gradient-to-r from-stone-600 to-amber-700 px-10 py-4 rounded-full text-white font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-lg">
                  Join Platform
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-180 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300">
                <img
                  src="https://riverdalehub.ca/wp-content/uploads/2025/04/Artisan-Market.webp"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* to-transparent rounded-2xl border border-amber-200/50 backdrop-blur-sm flex */}
              <div className="absolute inset-8 bg-gradient-to-br from-amber-900/10  items-center justify-center">
                <div className="text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Community Hub</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Elegant Brown Gradient */}
      <footer className="relative z-10 bg-gradient-to-br from-amber-900 via-stone-800 to-yellow-900">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <div className="text-5xl font-bold text-amber-100 mb-6 drop-shadow-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ARTISAN</div>
              <p className="text-amber-200 text-lg mb-8 leading-relaxed">Connecting master craftspeople with those who cherish authentic, handmade artistry.</p>
              <div className="flex space-x-4">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <div key={social} className="w-12 h-12 bg-amber-700/30 backdrop-blur-lg rounded-full hover:bg-amber-600/40 transition-colors duration-300 cursor-pointer border border-amber-600/30"></div>
                ))}
              </div>
            </div>


            {/* Quick Links */}
            <div>
              <h4 className="text-2xl font-bold text-amber-100 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Quick Links</h4>
              <ul className="space-y-4">
                {['Home', 'About Us', 'Artisans', 'Collections', 'Stories', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-amber-200 hover:text-amber-100 text-lg transition-colors duration-300 hover:underline">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-2xl font-bold text-amber-100 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Craft Categories</h4>
              <ul className="space-y-4">
                {['Textiles', 'Pottery', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings'].map((category) => (
                  <li key={category}>
                    <a href="#" className="text-amber-200 hover:text-amber-100 text-lg transition-colors duration-300 hover:underline">{category}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-2xl font-bold text-white mb-6">Stay Connected</h4>
              <p className="text-white/80 text-lg mb-6">Subscribe for updates and exclusive artisan stories.</p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 rounded-full text-white font-bold hover:scale-105 transition-transform duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 text-lg mb-4 md:mb-0">© 2025 Artisan Marketplace. All rights reserved.</p>
            <div className="flex space-x-8">
              <a href="#" className="text-white/80 hover:text-white text-lg transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-white/80 hover:text-white text-lg transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-white/80 hover:text-white text-lg transition-colors duration-300">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}