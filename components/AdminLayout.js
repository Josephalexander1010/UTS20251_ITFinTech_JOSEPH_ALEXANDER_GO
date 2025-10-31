// File: components/AdminLayout.js (BARU)

import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react'; // Import signOut
import Head from 'next/head';

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const router = useRouter();
  const currentPath = router.pathname; 

  const handleLogout = () => {
    // Logout dan kembali ke halaman login admin
    signOut({ callbackUrl: '/admin/login' }); 
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Head>
        <title>{title} - Cinema 22</title>
      </Head>
      
      {/* Header Admin (Mirip Contoh) */}
      <header className="bg-blue-800 text-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar/Navigasi Tab (Mirip Contoh) */}
        <nav className="w-56 bg-white shadow-md p-4"> 
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className={`block px-4 py-2 rounded font-medium ${currentPath === '/admin' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className={`block px-4 py-2 rounded font-medium ${currentPath === '/admin/orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className={`block px-4 py-2 rounded font-medium ${currentPath.startsWith('/admin/products') || currentPath.startsWith('/admin/create-product') || currentPath.startsWith('/admin/edit-product') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                Products
              </Link>
            </li>
             <li>
              <Link href="/admin/analytics" className={`block px-4 py-2 rounded font-medium ${currentPath === '/admin/analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                Analytics
              </Link>
            </li>
          </ul>
        </nav>

        {/* Area Konten Utama Halaman */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children} {/* Di sinilah konten halaman akan dirender */}
        </main>
      </div>
    </div>
  );
}