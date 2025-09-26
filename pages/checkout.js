import Head from "next/head";
import Link from "next/link";
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
    router.push("/payment");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-full">
        <Head>
          <title>Checkout</title>
        </Head>

        <header className="bg-white shadow-sm flex items-center justify-between p-4 border-b">
          <Link
            href="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            &lt; Back
          </Link>
          <h1 className="text-blue-600 text-xl font-bold">Checkout</h1>
          <div className="w-16"></div>
        </header>

        <main className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700">
                Your cart is empty.
              </h2>
              <p className="text-gray-500 mt-2">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Go Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md p-4 flex items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-700">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center mx-4">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 text-blue-600 border rounded-full text-lg"
                      >
                        -
                      </button>
                      <span className="px-4 text-blue-600 font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 text-blue-600 border rounded-full text-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-black text-right w-24">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h3 className="text-lg text-gray-700 font-bold mb-4">Summary</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (11%)</span>
                      <span>Rp {tax.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
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
