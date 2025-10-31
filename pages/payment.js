import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function PaymentPage() {
  // --- AMBIL isCartLoaded UNTUK MENCEGAH HYDRATION ERROR ---
  const { cartItems, isCartLoaded } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // --- HITUNG TOTAL HANYA JIKA KERANJANG SUDAH SIAP ---
  const subtotal = isCartLoaded ? cartItems.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  ) : 0;
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const handleConfirmAndPay = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }

    setIsLoading(true);

    const orderDetails = {
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        quantity: Number(item.quantity), // Pastikan ini adalah Angka
        price: Number(item.price),       // Pastikan ini adalah Angka
      })),
      totalAmount: Math.round(total),
    };

    try {
      // --- INI PERBAIKAN FINALNYA ---
      // Kita gunakan URL lengkap (Absolute Path)
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-invoice`;
      
      const response = await fetch(apiUrl, {
      // --- AKHIR PERBAIKAN ---
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
        credentials: 'include', // <-- KUNCI TETAP DI SINI
      });

      const result = await response.json();

      if (response.ok) {
        setIsLoading(false); // Matikan loading SEBELUM pindah
        window.location.href = result.invoice_url;
      } else {
        alert(`Error: ${result.message}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Gagal memproses pembayaran:", error);
      alert("Terjadi kesalahan pada sistem. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Secure Payment - Cinema 22</title>
        </Head>

        <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 z-10">
          <Link
            href="/checkout"
            className="text-teal-400 font-semibold hover:text-teal-300 transition"
          >
            &lt; Back to Checkout
          </Link>
          <h1 className="text-white text-xl font-bold">Secure Payment</h1>
          <div className="w-44"></div>
        </header>

        <main className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-white">
                  Payment Method
                </h3>
                <div className="space-y-3 text-gray-300">
                  <label className="flex items-center p-3 border border-gray-600 rounded-md bg-gray-700">
                    <input
                      type="radio"
                      name="payment"
                      checked={true}
                      readOnly
                      className="mr-3 h-4 w-4 text-teal-500 bg-gray-600 border-gray-500 focus:ring-teal-500"
                    />
                    E-Wallet, Virtual Account, Credit Card (via Xendit)
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 sticky top-24">
                <h3 className="text-xl text-white font-bold mb-4">
                  Order Summary
                </h3>
                {/* --- TAMBAHKAN PENGECEKAN isCartLoaded --- */}
                {!isCartLoaded ? (
                  <div className="text-gray-300 text-center">Loading summary...</div>
                ) : (
                  <>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (11%)</span>
                        <span>
                          Rp {tax.toLocaleString("id-ID", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 my-2"></div>
                      <div className="flex justify-between font-bold text-xl text-white">
                        <span>Total</span>
                        <span className="text-teal-400">
                          Rp {total.toLocaleString("id-ID", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleConfirmAndPay}
                      disabled={isLoading || cartItems.length === 0}
                      className="w-full mt-6 px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-semibold text-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Processing..." : "Confirm & Pay"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

