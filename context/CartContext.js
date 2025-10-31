import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

// Fungsi helper untuk mengambil keranjang dari localStorage
const getCartFromLocalStorage = () => {
  // Cek apakah kode berjalan di browser (bukan server)
  if (typeof window !== "undefined") {
    const storedCart = localStorage.getItem('cinema22-cart');
    if (storedCart) {
      try {
        return JSON.parse(storedCart);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        return [];
      }
    }
  }
  return [];
};

export function CartProvider({ children }) {
  // --- PERBAIKAN HYDRATION ---
  // 1. Mulai dengan state kosong (agar cocok dengan server)
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // 2. Gunakan useEffect untuk mengambil data dari localStorage HANYA di sisi client
  useEffect(() => {
    setCartItems(getCartFromLocalStorage());
    setIsCartLoaded(true); // Tandai bahwa keranjang sudah di-load
  }, []); // [] = hanya berjalan sekali saat component mount
  // --- AKHIR PERBAIKAN HYDRATION ---

  // 3. Simpan ke localStorage setiap kali keranjang berubah (HANYA jika sudah di-load)
  useEffect(() => {
    // Jangan simpan ke localStorage saat pertama kali render (saat masih kosong)
    if (isCartLoaded) {
      localStorage.setItem('cinema22-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isCartLoaded]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => 
        (item._id && item._id === product._id) || (item.id && item.id === product.id)
      );
      
      if (itemExists) {
        return prevItems.map((item) =>
          (item._id && item._id === product._id) || (item.id && item.id === product.id)
            ? { ...item, quantity: Number(item.quantity) + 1 } 
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          const isThisItem = (item._id && item._id === productId) || (item.id && item.id === productId);
          
          if (isThisItem) {
            return { ...item, quantity: Math.max(0, Number(item.quantity) + amount) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); 
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cinema22-cart');
  };

  const value = {
    cartItems,
    isCartLoaded, // <-- Kirim status 'loaded'
    addToCart,
    updateQuantity,
    clearCart, 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}