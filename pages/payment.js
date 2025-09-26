import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function PaymentPage() {
  const { cartItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 10000;
  const total = subtotal + shipping;

  const handleConfirmAndPay = () => {
    alert(
      `Payment process started with ${paymentMethod}. Total: Rp ${total.toLocaleString(
        "id-ID"
      )}`
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Secure Checkout</title>
        </Head>

        <header className="bg-white shadow-sm flex items-center justify-between p-4 border-b">
          <Link
            href="/checkout"
            className="text-blue-600 font-semibold hover:underline"
          >
            &lt; Back
          </Link>
          <h1 className="text-xl text-blue-600 font-bold">Secure Checkout</h1>
          <div className="w-16"></div> {/* Spacer */}
        </header>

        <main className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolom Kiri: Alamat & Metode Pembayaran */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-black">
                  Shipping Address
                </h3>
                <textarea
                  placeholder="Enter your full address"
                  rows="4"
                  className="w-full p-2 border text-black border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg text-black font-bold mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3 text-gray-700">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                    <input
                      type="radio"
                      name="payment"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-black"
                    />
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    PayPal
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                    <input
                      type="radio"
                      name="payment"
                      value="other"
                      checked={paymentMethod === "other"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    Other (e.g. E-Wallet, Bank Transfer)
                  </label>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan & Tombol Bayar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg text-black font-bold mb-4">Order Summary</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Item(s)</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Rp {shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <button
                  onClick={handleConfirmAndPay}
                  className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
