import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { dummyProducts } from "../data/products";
import { useCart } from "../context/CartContext";

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
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans bg-gray-100 min-h-screen`}
    >
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Select Item - Joseph Alexander Go</title>
        </Head>

        <header className="sticky top-0 bg-white shadow-sm z-10 flex items-center justify-between p-4 border-b">
          <h1 className="text-blue-600 text-2xl font-bold">
            Joseph Alexander Go
          </h1>
          <Link href="/checkout" className="text-2xl relative">
            <span role="img" aria-label="cart">
              🛒
            </span>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
          </Link>
        </header>

        <main className="p-4">
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Search product name..."
              className="w-full px-4 py-2 text-gray-500 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <nav className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter("All")}
              className={`px-4 py-2 text-sm text-gray-400 rounded-full ${
                filter === "All" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Drinks")}
              className={`px-4 py-2 text-sm text-gray-400 rounded-full ${
                filter === "Drinks" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Drinks
            </button>
            <button
              onClick={() => setFilter("Snacks")}
              className={`px-4 py-2 text-sm text-gray-400 rounded-full ${
                filter === "Snacks" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Snacks
            </button>
            <button
              onClick={() => setFilter("Bundles")}
              className={`px-4 py-2 text-sm text-gray-400 rounded-full ${
                filter === "Bundles" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Bundles
            </button>
          </nav>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                {/* GAMBAR SEKARANG SUDAH AKTIF KEMBALI */}
                <div className="relative w-full h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg text-gray-700 font-semibold">
                    {product.name}
                  </h3>
                  <p className="text-gray-800 font-bold mt-1">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-600 text-sm mt-1 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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