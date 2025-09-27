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
  const { addToCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // State untuk pop-up cart
  const [flyingItems, setFlyingItems] = useState([]); // State untuk animasi flying items

  // --- PERUBAHAN 2: Definisikan gambar untuk carousel ---
  const carouselImages = [
    "/images/DASH2.png",
    "/images/DASH3.png",
    "/images/DASH1.png",
  ];

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

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  // Function untuk close cart popup ketika klik di luar
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  // Function untuk animasi flying to cart
  const handleAddToCart = (product, event) => {
    // Ambil posisi tombol yang diklik
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    
    // Ambil posisi cart icon dengan lebih spesifik
    const cartIcon = document.querySelector('[aria-label="cart"]');
    if (!cartIcon) {
      // Fallback jika cart icon tidak ditemukan
      addToCart(product);
      return;
    }
    
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Buat flying item
    const flyingItem = {
      id: Date.now() + Math.random(),
      image: product.image,
      startX: buttonRect.left + buttonRect.width / 2,
      startY: buttonRect.top + buttonRect.height / 2,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2,
    };
    
    // Debug log
    console.log('Flying item created:', flyingItem);
    
    setFlyingItems(prev => [...prev, flyingItem]);
    
    // Hapus flying item setelah animasi selesai dan tambahkan ke cart
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== flyingItem.id));
      addToCart(product);
    }, 800);
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen`}>
      <style jsx global>{`
        @keyframes flyToCart {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.3)) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.3);
            opacity: 0;
          }
        }
        
        .fly-to-cart-animation {
          animation: flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
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
              Cinema 22 Cafe
            </h1>
          </div>
          
          {/* Cart Icon dengan Pop-up */}
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="text-2xl relative hover:scale-110 transition-transform"
          >
            <span role="img" aria-label="cart" className="text-yellow-400">
              🛒
            </span>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {totalItemsInCart}
              </span>
            )}
          </button>
        </header>

        {/* Flying Items Animation */}
        {flyingItems.map((item) => (
          <div
            key={item.id}
            className="fixed z-50 pointer-events-none fly-to-cart-animation"
            style={{
              left: `${item.startX - 20}px`,
              top: `${item.startY - 20}px`,
              '--end-x': `${item.endX - item.startX}px`,
              '--end-y': `${item.endY - item.startY}px`,
            }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-2xl border-2 border-teal-400 bg-white">
              <Image
                src={item.image}
                alt="Flying item"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}

        {/* Cart Pop-up Overlay */}
        {isCartOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 flex items-start justify-end p-4 pt-20"
            onClick={handleOverlayClick}
          >
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700">
              {/* Header Pop-up */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto max-h-96">
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="text-6xl mb-4">🛒</div>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{item.name}</h4>
                          <p className="text-teal-400 text-sm font-bold">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-500 transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer Pop-up */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-teal-400">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <Link href="/checkout">
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-500 transition-colors"
                    >
                      Checkout ({totalItemsInCart} items)
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

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
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full mt-auto px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
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