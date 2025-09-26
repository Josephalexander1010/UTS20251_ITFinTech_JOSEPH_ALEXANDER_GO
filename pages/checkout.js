import Head from "next/head";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cartItems, updateQuantity } = useCart();
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.11; // Contoh PPN 11%
  const total = subtotal + tax;

  const handleContinue = () => {
    console.log("Order to be processed:", { cartItems, subtotal, tax, total });
    router.push("/payment"); // Arahkan ke halaman pembayaran
  };

  return (
    // PERUBAHAN: Hapus bg-gray-100 agar gradient dari body terlihat
    <div className="min-h-screen">
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Checkout - Cinema 22</title>
        </Head>

        {/* PERUBAHAN: Header disesuaikan dengan tema gelap */}
        <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 z-10">
          <Link
            href="/"
            className="text-teal-400 font-semibold hover:text-teal-300 transition"
          >
            &lt; Back to Shopping
          </Link>
          <h1 className="text-white text-xl font-bold">Checkout</h1>
          <div className="w-44"></div> {/* Spacer to keep title centered */}
        </header>

        <main className="p-4 md:p-8">
          {cartItems.length === 0 ? (
            // PERUBAHAN: Tampilan 'keranjang kosong' disesuaikan
            <div className="text-center py-16 bg-gray-800/50 rounded-lg shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white">
                Your cart is empty.
              </h2>
              <p className="text-gray-300 mt-2">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
              >
                Go Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  // PERUBAHAN: Kartu item disesuaikan
                  <div
                    key={item.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-4 flex items-center"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="text-sm text-gray-300">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    {/* PERUBAHAN: Tombol kuantitas disesuaikan */}
                    <div className="flex items-center mx-4">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-teal-400 border border-gray-600 rounded-full text-lg hover:bg-gray-700 transition"
                      >
                        -
                      </button>
                      <span className="px-4 text-white font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-teal-400 border border-gray-600 rounded-full text-lg hover:bg-gray-700 transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-white text-right w-28">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              {/* PERUBAHAN: Kartu summary disesuaikan */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 sticky top-24">
                  <h3 className="text-xl text-white font-bold mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (11%)</span>
                      <span>Rp {tax.toLocaleString("id-ID", {minimumFractionDigits: 0})}</span>
                    </div>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className="flex justify-between font-bold text-xl text-white">
                      <span>Total</span>
                      <span className="text-teal-400">
                        Rp {total.toLocaleString("id-ID", {minimumFractionDigits: 0})}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full mt-6 px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-semibold text-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}