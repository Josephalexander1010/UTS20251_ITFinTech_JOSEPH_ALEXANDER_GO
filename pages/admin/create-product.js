// File: pages/admin/create-product.js (FIXED v2 - tanpa CSRF)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

// --- SERVER SIDE PROTECTION ---
export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
        return {
            redirect: {
                destination: '/admin/login?error=NOT_ADMIN', 
                permanent: false,
            },
        };
    }
    
    return { 
        props: { 
            session
        } 
    }; 
}

export default function CreateProductPage() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Snacks'); 
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/products/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    price: Number(price), 
                    category, 
                    imageUrl 
                }),
                credentials: 'same-origin',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            console.log('✅ Product created:', data);
            
            // Redirect setelah sukses
            router.push('/admin/products'); 
            
        } catch (err) {
            console.error('❌ Create product error:', err);
            setError(err.message || 'An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout title="Create Product"> 
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Product</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="name">
                            Product Name
                        </label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="price">
                            Price (IDR)
                        </label>
                        <input 
                            type="number" 
                            id="price" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded" 
                            required 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="category">
                            Category
                        </label>
                        <select 
                            id="category" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded bg-white"
                        >
                            <option value="Snacks">Snacks</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Bundles">Bundles</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="imageUrl">
                            Image URL (Optional)
                        </label>
                        <input 
                            type="text" 
                            id="imageUrl" 
                            value={imageUrl} 
                            onChange={(e) => setImageUrl(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded" 
                            placeholder="/images/popcorn.png" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : 'Save Product'}
                        </button>
                        <Link href="/admin/products" className="text-gray-600 hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}