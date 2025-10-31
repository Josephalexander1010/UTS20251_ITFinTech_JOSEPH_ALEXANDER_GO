// File: pages/index.js (Versi FINAL v16 - Hapus Ikon Admin)

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import dbConnect from '../lib/mongodb';
import Product from '../models/Product';
import { useCart } from "../context/CartContext";
// --- IMPORT BARU UNTUK AUTH ---
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
// -----------------------------
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// --- FETCH DATA DARI DB (Tidak berubah) ---
export async function getServerSideProps() {
  let initialProducts = [];
  try {
    await dbConnect();
    const productsData = await Product.find({}).sort({ name: 1 }).lean();
    initialProducts = JSON.parse(JSON.stringify(productsData));
  } catch (error) {
    console.error("Failed to fetch products for homepage:", error);
  }
  return { props: { initialProducts } };
}
// ----------------------------------------

// Fungsi untuk memperbaiki path gambar (Tidak berubah)
const fixImagePath = (path) => {
  if (!path) return '/images/DASH1.png';
  if (path.startsWith('/')) return path;
  if (path.startsWith('images/')) return `/${path}`;
  if (path.startsWith('public/')) return path.replace('public/', '/');
  if (path.startsWith('http')) return path;
  return '/images/DASH1.png';
};

export default function Home({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart, cartItems, updateQuantity, isCartLoaded } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);

  // --- LOGIC BARU UNTUK AUTH ---
  const { data: session } = useSession(); // Ambil data sesi (null jika Guest)
  const router = useRouter(); // Untuk redirect
  // -----------------------------

  const carouselImages = [
    "/images/DASH2.png",
    "/images/DASH3.png",
    "/images/DASH1.png",
  ];

  // --- PERBAIKAN LOGIKA SCROLL HEADER ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // True jika scroll lebih dari 10px
    };
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll) };
  }, []);
  // --- AKHIR PERBAIKAN ---
  
  const filteredProducts = (products || []).filter((p) => {
    const categoryMatch = filter === "All" || p.category === filter;
    const searchMatch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return categoryMatch && searchMatch;
  });

  const totalItemsInCart = isCartLoaded ? cartItems.reduce((t, i) => t + Number(i.quantity), 0) : 0;
  const totalPrice = isCartLoaded ? cartItems.reduce((t, i) => t + (Number(i.price) * Number(i.quantity)), 0) : 0;

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) { setIsCartOpen(false) } };

  // --- handleAddToCart (Tidak berubah) ---
  const handleAddToCart = (product, event) => {
    if (!session) {
      alert('Please login or register to add items to your cart.');
      router.push(`/login?callbackUrl=${router.asPath}`);
      return;
    }
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const cartIcon = document.querySelector('[aria-label="cart"]');
    if (!cartIcon) { addToCart(product); return; }
    const cartRect = cartIcon.getBoundingClientRect();
    const flyingItem = {
      id: Date.now() + Math.random(), image: product.image,
      startX: buttonRect.left + buttonRect.width / 2, startY: buttonRect.top + buttonRect.height / 2,
      endX: cartRect.left + cartRect.width / 2, endY: cartRect.top + cartRect.height / 2,
    };
    setFlyingItems(prev => [...prev, flyingItem]);
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== flyingItem.id));
      addToCart(product);
    }, 800);
  };
  // --------------------------------

  return (
    <div className={`${inter.className} font-sans min-h-screen`}>
      <style jsx global>{`
        @keyframes flyToCart { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 50% { transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.3)) scale(0.8); opacity: 0.8; } 100% { transform: translate(var(--end-x), var(--end-y)) scale(0.3); opacity: 0; } }
        .fly-to-cart-animation { animation: flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>
      <div className="container mx-auto max-w-full">
        <Head> <title>Cinema 22 - Food & Beverages</title> </Head>

        {/* --- HEADER DENGAN LOGIKA SCROLL BARU --- */}
        <header className={`fixed top-0 w-full z-20 flex items-center justify-between p-4 transition-all duration-300 ${isScrolled ? "bg-gray-900/80 backdrop-blur-sm shadow-lg border-b border-gray-700" : "bg-transparent"}`}>
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/images/weblogo.png" alt="Cinema 22 Logo" width={50} height={50} priority />
            </Link>
            <h1 className="text-white text-2xl font-bold font-sans">Cinema 22 Cafe</h1>
          </div>
          
          {/* Navigasi Kanan (Login/Logout & Cart) */}
          <div className="flex items-center gap-3 md:gap-4">
            {session ? (
              // --- JIKA SUDAH LOGIN ---
              <>
                <Link href="/profile" className="flex items-center gap-2 text-white hover:text-teal-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                  <span className="hidden md:block text-sm font-medium">{session.user.name}</span>
                </Link>
                
                {session.user.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1.5 bg-yellow-500 text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-yellow-400 transition-colors">
                    {/* Ikon Admin */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Admin Panel
                  </Link>
                )}
                
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              // --- JIKA MASIH GUEST (UI/UX BARU) ---
              <>
                <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors" title="Login/Register">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                </Link>
                
                {/* --- PERMINTAAN KAMU (HAPUS IKON) --- */}
                <Link href="/admin/login" className="bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors hidden md:block">
                  Admin Only
                </Link>
                {/* --- AKHIR PERUBAHAN --- */}
                
                <Link href="/login" className="flex items-center gap-1.5 text-white ring-1 ring-white hover:bg-white hover:text-black font-semibold px-3 py-1.5 rounded-md text-sm transition-colors">
                  {/* Ikon Login */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Login
                </Link>
                
                <Link href="/register" className="flex items-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-teal-500 transition-colors">
                  {/* Ikon Register */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                  Register
                </Link>
              </>
            )}

            {/* Tombol Cart (tetap ada) */}
            <button onClick={() => setIsCartOpen(!isCartOpen)} className="text-2xl relative hover:scale-110 transition-transform ml-2">
              <span role="img" aria-label="cart" className="text-yellow-400">🛒</span>
              {isCartLoaded && totalItemsInCart > 0 && (<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{totalItemsInCart}</span>)}
            </button>
          </div>
        </header>
        {/* --- AKHIR HEADER --- */}


        {/* Flying Items (Tidak berubah) */}
        {flyingItems.map((item) => (
          <div key={item.id} className="fixed z-50 pointer-events-none fly-to-cart-animation" style={{ left: `${item.startX - 20}px`, top: `${item.startY - 20}px`, '--end-x': `${item.endX - item.startX}px`, '--end-y': `${item.endY - item.startY}px`, }}>
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-2xl border-2 border-teal-400 bg-white">
              <Image src={fixImagePath(item.image)} alt="Flying item" width={40} height={40} style={{ objectFit: 'cover' }} className="w-full h-full" />
            </div>
          </div>
        ))}

        {/* --- CART POP-UP DENGAN ANIMASI TOMBOL --- */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-start justify-end p-4 pt-20" onClick={handleOverlayClick}>
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>
              <div className="flex-1 overflow-y-auto max-h-96">
                {!isCartLoaded ? (
                  <div className="p-8 text-center text-gray-400">Loading cart...</div>
                ) : cartItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="text-6xl mb-4">🛒</div>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item._id || item.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image src={fixImagePath(item.image)} alt={item.name || 'Cart item'} fill style={{ objectFit: 'cover' }} className="rounded-lg" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                        <div className="flex-1 min-w-0"><h4 className="text-white font-medium truncate">{item.name || 'Item'}</h4><p className="text-teal-400 text-sm font-bold">Rp {(item.price || 0).toLocaleString("id-ID")}</p></div>
                        <div className="flex items-center gap-2">
                          {/* --- PERBAIKAN ANIMASI TOMBOL --- */}
                          <button onClick={() => updateQuantity(item._id || item.id, -1)} className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center">-</button>
                          <span className="text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id || item.id, 1)} className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-500 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isCartLoaded && cartItems.length > 0 && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  <div className="flex justify-between items-center text-white"><span className="text-lg font-bold">Total:</span><span className="text-xl font-bold text-teal-400">Rp {totalPrice.toLocaleString("id-ID")}</span></div>
                  <Link href="/checkout">
                    <button onClick={() => setIsCartOpen(false)} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-500 transition-colors">
                      Checkout ({totalItemsInCart} items)
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        {/* --- AKHIR CART POP-UP --- */}

        <main className="p-4 pt-24">
          
          {!session && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 flex items-center justify-between shadow-md">
              <div>
                <p className="font-bold">👋 Browsing as Guest</p>
                <p className="text-sm">Login or Register to add to cart.</p>
              </div>
              <Link href="/login" className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-600">
                Login Now
              </Link>
            </div>
          )}
          
          {/* Search bar, Filter, Carousel (Tidak berubah) */}
          <div className="relative flex items-center mb-8">
            <span className="absolute left-4 z-10"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg> </span>
            <input type="text" placeholder="Search food or beverages..." className="w-full pl-11 pr-4 py-2.5 text-white bg-black/20 border border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <nav className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter("All")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "All" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>All</button>
            <button onClick={() => setFilter("Drinks")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Drinks" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>Drinks</button>
            <button onClick={() => setFilter("Snacks")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Snacks" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>Snacks</button>
            <button onClick={() => setFilter("Bundles")} className={`px-4 py-2 text-sm rounded-full transition ${filter === "Bundles" ? "bg-teal-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>Bundles</button>
          </nav>
          <div className="mb-8 w-full rounded-lg overflow-hidden shadow-lg">
            <Swiper modules={[Autoplay, Pagination]} spaceBetween={0} slidesPerView={1} loop={true} autoplay={{ delay: 3000, disableOnInteraction: false }} pagination={{ clickable: true }} className="mySwiper">
              {carouselImages.map((src, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full aspect-[16/7] md:aspect-[16/6]">
                    <Image src={fixImagePath(src)} alt={`Promotional banner ${index + 1}`} fill style={{ objectFit: 'cover' }} priority={index === 0} sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* --- PRODUCT CARD DENGAN HOVER EFFECT --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product._id} className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden flex flex-col backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="relative w-full h-48">
                    <Image src={fixImagePath(product.image)}
                      alt={product.name || 'Product Image'}
                      fill style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow text-white">
                    <h3 className="text-lg font-semibold">{product.name || 'Unnamed Product'}</h3>
                    <p className="text-teal-400 font-bold mt-1">Rp {(product.price || 0).toLocaleString("id-ID")}</p>
                    <p className="text-gray-300 text-sm mt-1 mb-4 flex-grow">{product.description || ''}</p>
                    <button onClick={(e) => handleAddToCart(product, e)} className="w-full mt-auto px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">Add +</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">{!initialProducts ? "Failed to load products." : "No products available."}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

