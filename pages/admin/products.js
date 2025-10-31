// File: pages/admin/products.js (Fungsi Edit/Delete Dihilangkan)

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react'; // Hapus useEffect, tidak perlu lagi
import AdminLayout from '../../components/AdminLayout'; // Import layout
// --- IMPORT BARU ---
import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/mongodb';
import Product from '../../models/Product';
// -------------------

// --- "PENJAGA" HALAMAN + PENGAMBIL DATA ---
export async function getServerSideProps(context) {
    const session = await getSession(context);

    // 1. Cek Sesi
    if (!session || !session.user?.isAdmin) {
        // Jika bukan admin, tendang ke login admin
        return {
            redirect: {
                destination: '/admin/login?error=NOT_ADMIN',
                permanent: false,
            },
        };
    }

    // 2. Jika lolos (admin), ambil data produk
    try {
        await dbConnect();
        const productsData = await Product.find({}).sort({ name: 1 }).lean();
        return {
            props: {
                session: session, // Kirim sesi (wajib)
                initialProducts: JSON.parse(JSON.stringify(productsData)),
            },
        };
    } catch (error) {
        console.error("Error fetching products for admin:", error);
        return { props: { session, initialProducts: [] } };
    }
}
// ---------------------------------------


export default function AdminProductsPage({ initialProducts }) { // Terima props
    const router = useRouter();
    // Isi state dari props
    const [products, setProducts] = useState(initialProducts || []);
    // Hapus isLoading, data sudah di-load server
    
    // Hapus useEffect fetchProducts, karena data sudah diambil di getServerSideProps

    // HAPUS FUNGSI handleDelete

    return (
        // BUNGKUS DENGAN LAYOUT
        <AdminLayout title="Products">
            {/* Hapus <header> karena sudah ada di Layout */}
            
            <main className="p-0"> {/* Hapus padding 'p-8' */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Product List</h2>
                    <Link href="/admin/create-product" className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition font-semibold">
                         + Add New Product 
                    </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-hidden"> {/* Ganti styling jadi putih */}
                    <table className="w-full">
                        <thead className="bg-gray-50"> {/* Ganti styling */}
                            <tr>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (IDR)</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                {/* <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> (HAPUS KOLOM ACTIONS) */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200"> {/* Ganti styling */}
                            {/* Hapus isLoading check */}
                            {products && products.length > 0 ? (
                                products.map((product) => (
                                <tr key={product._id}>
                                    <td className="p-3 text-sm text-gray-700">{product.name}</td>
                                    <td className="p-3 text-sm text-gray-900">{product.price.toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-sm text-gray-700">{product.category}</td>
                                    {/* HAPUS KOLOM <td> UNTUK ACTIONS */}
                                </tr>
                                ))
                            ) : (
                                // GANTI COLSPAN JADI 3
                                <tr><td colSpan="3" className="p-3 text-center text-gray-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </AdminLayout> // TUTUP LAYOUT
    );
}