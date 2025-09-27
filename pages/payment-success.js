import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "../context/CartContext"; // Asumsi Anda punya fungsi clearCart

export default function PaymentSuccessPage() {
  
  // Opsional: Jika Anda ingin mengosongkan keranjang setelah pembayaran berhasil
  // Anda perlu membuat fungsi clearCart di dalam CartContext.js Anda
  // const { clearCart } = useCart();
  // useEffect(() => {
  //   clearCart();
  // }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Payment Successful - Cinema 22</title>
      </Head>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-8 md:p-12 text-center max-w-lg mx-4">
        {/* Ikon Centang Hijau */}
        <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <h1 className="text-3xl font-bold text-white mb-2">
          Thank You!
        </h1>
        <p className="text-gray-300 mb-6">
          Your payment was successful. We have received your order.
        </p>

        <Link href="/" legacyBehavior>
          <a className="inline-block px-8 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-semibold">
            Back to Homepage
          </a>
        </Link>
      </div>
    </div>
  );
}