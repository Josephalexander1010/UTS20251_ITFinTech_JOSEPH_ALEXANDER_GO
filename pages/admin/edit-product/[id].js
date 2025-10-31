// File: pages/admin/edit-product/[id].js (PERBAIKAN FINAL)

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout'; 
import { getSession } from 'next-auth/react'; 
import dbConnect from '../../../lib/mongodb'; 
import Product from '../../../models/Product'; 
import mongoose from 'mongoose'; 

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session || !session.user?.isAdmin) {
        return {
            redirect: { destination: '/admin/login?error=NOT_ADMIN', permanent: false },
        };
    }

    const { id } = context.params; 
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { notFound: true };
    }

    try {
        // --- INI PERBAIKAN MONGOOSEERROR ---
        await dbConnect(); 
        // ------------------------------------
        const product = await Product.findById(id).lean();
        
        if (!product) {
            return { notFound: true }; 
        }

        return {
            props: {
                // Kirim 'session' ke komponen Page
                session, 
                product: JSON.parse(JSON.stringify(product)), 
            },
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        // Kirim 'session' bahkan jika produk error, agar layout tidak crash
        return { props: { session, product: null } };
    }
}

// Terima 'session' dan 'product' sebagai props
export default function EditProductPage({ session, product }) { 
    // Cek jika produk gagal di-load
    if (!product) {
        return (
            <AdminLayout title="Error" session={session}>
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto">
                    <h2 className="text-xl font-bold mb-6 text-red-600">Error</h2>
                    <p className="text-gray-700">Failed to load product data. It may have been deleted.</p>
                    <Link href="/admin/products" className="text-blue-600 hover:underline mt-4 inline-block">
                        &larr; Back to Products
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price);
    const [category, setCategory] = useState(product.category);
    const [imageUrl, setImageUrl] = useState(product.image || ''); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/products/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: product._id, name, price: Number(price), category, imageUrl }),
                credentials: 'include' // <-- Perbaikan "Unauthorized"
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/admin/products'); 
            } else {
                setError(data.message || 'Failed to update product');
                setIsLoading(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        // Kirim 'session' ke AdminLayout
        <AdminLayout title={`Edit ${product.name}`} session={session}>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Product</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="name">Product Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="price">Price (IDR)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="category">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded bg-white">
                            <option value="Snacks">Snacks</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Bundles">Bundles</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="imageUrl">Image URL (Optional)</label>
                        <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
t                     >
                            {isLoading ? 'Saving...' : 'Save Changes'}
          _           </button>
                        <Link href="/admin/products" className="text-gray-600 hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}