import { SessionProvider } from "next-auth/react"; // <-- IMPORT INI
import { CartProvider } from '../context/CartContext';
import '../styles/globals.css'; 

// --- UBAH BARIS INI ---
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // --- TAMBAHKAN PEMBUNGKUS INI ---
    <SessionProvider session={session}>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
    // --- AKHIR TAMBAHAN ---
  );
}

export default MyApp;