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
      <nav
        className="relative sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
  bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85 
  backdrop-blur-md shadow-md border-b border-amber-950/40 overflow-hidden"
      >
        {/* Background Warli art */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("/warli1.jpg")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "contain",
            backgroundPosition: "bottom",
            filter: "blur(1px)",   // blur only background
            zIndex: -1,            // push behind content
          }}
        />

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
        className={`relative text-white flex items-center transition-all duration-1000 delay-300 ${artisansInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16 z-10">
              <h2 className="text-7xl font-bold text-amber-900 mb-6 drop-shadow-sm animate-fade-in-up delay-200 z-10" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                <TranslatedText translationKey="Featured Artisans" />
              </h2>
              <p className="text-2xl text-amber-700 max-w-4xl mx-auto leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                <TranslatedText translationKey="featuredArtisansDescription" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Ram Gopal Saini", craft: "Jaipur blue pottery master", img: "data:image/jpeg;base64,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" },
                { name: "Sneh Gangal", craft: " weaving", img: "data:image/jpeg;base64,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" },
                { name: "Rajendra Bagel", craft: "Dhakra craft", img: "data:image/jpeg;base64,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" }
              ].map((artisan, i) => (
                <div key={i} className="bg- bg-amber-900/75 rounded-2xl  drop-shadow-md from-cream-50 to-amber-50 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 transition-all duration-500 border border-amber-200/50 shadow-xl hover:shadow-2xl">
                  <div className="w-40 h-40 rounded-full mx-auto mb-6 overflow-hidden shadow-2xl border-4 border-amber-300">
                    <img src={artisan.img} alt={artisan.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-bg-[#EFDEC2] text-center mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{artisan.name}</h3>
                  <p className="text-yellow text-center text-lg font-medium mb-4">{artisan.craft}</p>
                  <p className="text-bg-whitw tracking-wider text-center leading-relaxed">Preserving traditional techniques while creating contemporary masterpieces</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr></hr>
      {/* Decorative Image Divider 2 */}
      <div className="relative z-10 h-40 bg-gradient-to-r from-stone-600 via-amber-600 to-stone-600 flex items-center justify-center overflow-hidden">
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
        className={`relative min-h-screen flex items-center transition-all duration-1000 delay-400 ${categoriesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-7xl font-bold text-stone-800 mb-6 drop-shadow-sm  animate-fade-in-up delay-200" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                <TranslatedText translationKey="Explore diverse categories" />
              </h2>
              <p className="text-2xl text-stone-700 max-w-4xl mx-auto leading-relaxed  animate-fade-in-up delay-200">
                <TranslatedText translationKey="Discover unique creations that tell a story and carry the soul of their maker." />
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Textiles', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Weaving_jamdani_at_BSCIC_Jamdani_palli%2C_Narayanganj_113.jpg/330px-Weaving_jamdani_at_BSCIC_Jamdani_palli%2C_Narayanganj_113.jpg' },
                { name: 'Pottery', img: 'https://www.tafecafe.com/wp-content/uploads/2022/11/Pottery.png' },
                { name: 'Jewelry', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' },
                { name: 'Woodwork', img: 'https://www.sowpeace.in/cdn/shop/files/sowpeace-wooden-elephant-artisan-tabletop-decor-masterpiecetabletopsowpeacewood-eldn-wdn-tt-786569.jpg?v=1741833131&width=1946' },
                { name: 'Metalcraft', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS3pNNPOuMPCeKX6jpV2UAoAy2LxZiajD_Yw&s' },
                { name: 'Paintings', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk0w_QBcHm86fUi0gxEegs_cXsWEYGqelBGw&s' },
                { name: 'Sculptures', img: 'https://5.imimg.com/data5/AZ/VC/FU/SELLER-7545519/indian-sculpture.jpeg' },
                { name: 'Ceramics', img: 'https://m.media-amazon.com/images/I/71NAoXH3bhL.jpg' }
              ].map((category) => (
                <div key={category.name} className="group bg-amber-900/70  rounded-2xl p-6 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl border border-amber-300/30">
                  <div className="w-60 h-60 rounded-full mx-auto mb-4 overflow-hidden border-2 border-amber-400">
                    <img src={category.img} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Image Divider 3 */}
      <div className="relative z-10 h-40 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-800 flex items-center justify-center overflow-hidden">
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
        className={`relative min-h-screen flex items-center transition-all duration-1000 delay-500 ${missionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
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
        className={`relative min-h-screen flex items-center transition-all duration-1000 delay-600 ${impactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
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
        className={`relative min-h-screen flex items-center transition-all duration-1000 delay-700 ${communityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(252, 252, 252, 0.1) 0%, rgba(216, 196, 196, 0.15) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
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
        </div>
      </section>

      {/* Footer - Elegant Brown Gradient */}
      <footer className="relative">
        {/* Blurred background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `url("/bg1.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.1)"
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(146, 64, 14, 0.95) 0%, rgba(101, 67, 33, 0.95) 50%, rgba(184, 134, 11, 0.95) 100%)`
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full">
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
        </div>
      </footer>
    </div>
  );
}