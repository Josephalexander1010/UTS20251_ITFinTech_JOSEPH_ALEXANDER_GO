import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Panggil API Register
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, confirmPassword }),
            });

            const data = await res.json();
            setIsLoading(false);

            if (res.ok) {
                // Sukses! Arahkan ke halaman login
                alert('Registration successful! Please login.'); // Kasih notif
                router.push('/login'); 
            } else {
                // Gagal, tampilkan pesan error dari server
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setIsLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <Head>
                <title>Register - Cinema 22</title>
            </Head>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
                
                {error && (
                    <div className="bg-red-500 text-white p-3 rounded mb-4 text-center text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="name">Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="phone">Phone Number (ID Format)</label>
                        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="08... or +62..." required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="password">Password (min. 6 characters)</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <div className="text-center mt-6">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-teal-400 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}