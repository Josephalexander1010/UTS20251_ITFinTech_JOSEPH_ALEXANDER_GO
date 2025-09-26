import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { dummyProducts } from "../data/products";
import { useCart } from "../context/CartContext";

// --- PERUBAHAN 1: Import Swiper ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
// ------------------------------------

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [products] = useState(dummyProducts);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart, cartItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  // --- PERUBAHAN 2: Definisikan gambar untuk carousel ---
  const carouselImages = [
    "/images/CAR1.png",
    "/images/CAR2.png",
    "/images/CAR3.png",
  ];
  // ----------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const categoryMatch = filter === "All" || p.category === filter;
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const totalItemsInCart = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen`}>
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Cinema 22 - Food & Beverages</title>
        </Head>

        <header
          className={`fixed top-0 w-full z-20 flex items-center justify-between p-4 transition-all duration-300 ${
            isScrolled ? "bg-transparent shadow-none" : "bg-black shadow-md"
          }`}
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/images/weblogo.png"
                alt="Cinema 22 Logo"
                width={50}
                height={10}
              />
            </Link>
            <h1 className="text-white text-2xl font-bold font-sans">
              Cinema 22
            </h1>
          </div>
          <Link href="/checkout" className="text-2xl relative">
            <span role="img" aria-label="cart" className="text-yellow-400">
              🛒
            </span>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
          </Link>
        </header>

        <main className="p-4 pt-24">
          <div className="relative flex items-center mb-8">
            <span className="absolute left-4 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search food or beverages..."
              className="w-full pl-11 pr-4 py-2.5 text-white bg-black/20 border border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* --- PERUBAHAN 3: Tambahkan komponen Carousel --- */}
          <div className="mb-8 w-full rounded-lg overflow-hidden shadow-lg">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000, // Berganti setiap 3 detik
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              className="mySwiper"
            >
              {carouselImages.map((src, index) => (
                <SwiperSlide key={index}>
                  {/* Aspect ratio untuk tampilan sinematik & responsif */}
                  <div className="relative w-full aspect-[16/7] md:aspect-[16/6]">
                    <Image
                      src={src}
                      alt={`Promotional banner ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      priority={index === 0} // Prioritaskan gambar pertama
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* ------------------------------------------- */}

          <nav className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter("All")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "All" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              All
            </button>
            <button onClick={() => setFilter("Drinks")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Drinks" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              Drinks
            </button>
            <button onClick={() => setFilter("Snacks")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Snacks" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              Snacks
            </button>
            <button onClick={() => setFilter("Bundles")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Bundles" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              Bundles
            </button>
          </nav>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden flex flex-col backdrop-blur-sm"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow text-white">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-teal-400 font-bold mt-1">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-300 text-sm mt-1 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-auto px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                  >
                    Add +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}