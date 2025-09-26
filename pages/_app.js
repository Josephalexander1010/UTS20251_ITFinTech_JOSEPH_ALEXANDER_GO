import { CartProvider } from "../context/CartContext";
import "@/styles/globals.css"; // Menggunakan path alias '@/' dari file pertama, ini praktik yang lebih baik

// Nama function bisa 'App' atau 'MyApp', keduanya berfungsi. 'App' lebih modern.
export default function App({ Component, pageProps }) {
  return (
    // Membungkus seluruh aplikasi dengan CartProvider
    // agar semua halaman bisa mengakses data keranjang belanja.
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}