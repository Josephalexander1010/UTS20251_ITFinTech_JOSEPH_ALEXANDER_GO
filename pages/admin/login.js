// File: pages/admin/login.js
// (VERSI BERSIH - Fix import signOut & UI MFA 2-Langkah)

import { useState, useEffect } from 'react';
import { signIn, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // --- TAMBAHAN BARU UNTUK UI MFA ---
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('password'); // 'password' atau 'otp'
    const [message, setMessage] = useState('');
    // --- AKHIR TAMBAHAN ---

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // Jika sudah login sebagai admin, langsung redirect
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.isAdmin) {
            router.replace('/admin'); // Arahkan ke dashboard admin
        }
    }, [session, status, router]);

    // Cek error dari URL
    useEffect(() => {
        if (router.query.error) {
            // Ubah pesan error 'undefined' (dari 'OTP_SENT') menjadi pesan yang jelas
            if (router.query.error === 'undefined') {
                 // Jangan tampilkan error, tunggu user masukkan password lagi
            } else if (router.query.error === 'CredentialsSignin' || router.query.error === 'INVALID_PASSWORD' || router.query.error === 'USER_NOT_FOUND' || router.query.error === 'Wrong password. Please try again.') {
                setError('Email or password wrong. Please try again.');
            } else if (router.query.error === 'NOT_ADMIN') {
                 setError('This account does not have Admin privileges.');
            } else {
                 setError(router.query.error);
            }
        }
    }, [router.query.error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        // Coba login (Langkah 1: kirim password)
        const result = await signIn('credentials', {
            redirect: false,
            email: email,
            password: password,
        });

        setIsLoading(false);

        if (result.ok) {
             // Ini seharusnya tidak terjadi di alur OTP, tapi jika terjadi...
             const newSession = await fetch('/api/auth/session');
             const sessionData = await newSession.json();
             if (sessionData?.user?.isAdmin) {
                 router.replace('/admin');
             }
        } else {
            // --- LOGIKA BARU UNTUK MFA ---
            if (result.error === 'OTP_SENT') {
                setMessage('Password correct. OTP sent to your WhatsApp.');
                setStep('otp'); // Pindah ke langkah 2 (form OTP)
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
            // --- AKHIR LOGIKA BARU ---
        }
    };

    // --- HANDLER BARU UNTUK OTP ---
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        // Coba login (Langkah 2: kirim OTP)
        const result = await signIn('credentials', {
            redirect: false,
            email: email, // Kirim email yang sama
            otp: otp,     // Kirim OTP
        });

        setIsLoading(false);

        if (result.ok) {
            // Sukses! Cek lagi apakah dia admin
            const newSession = await fetch('/api/auth/session');
            const sessionData = await newSession.json();

            if (sessionData?.user?.isAdmin) {
                router.replace('/admin'); // Arahkan ke dashboard admin
            } else {
                setError('Login successful, but you are not an Admin.');
                signOut({ redirect: false }); // Logout user biasa yang nyasar
            }
        } else {
            // Gagal (misal: OTP salah)
            setError(result.error || 'Login failed. Please try again.');
        }
    };
    // --- AKHIR HANDLER BARU ---
    
    // Tampilkan loading jika masih cek sesi
    if (status === 'loading') {
         return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
    }

    // Jika sudah login tapi BUKAN admin, jangan tampilkan form
    if (status === 'authenticated' && !session?.user?.isAdmin) {
         return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                 <p>You are logged in as a regular user.</p>
                 <p className="mb-4">This page is for Admins only.</p>
                 <Link href="/" className="text-teal-400 hover:underline">
                     Back to Home
                 </Link>
             </div>
         )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <Head>
                <title>Admin Login - Cinema 22</title>
            </Head>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Admin Panel Login</h1>
                
                {error && (
                    <div className="bg-red-500 text-white p-3 rounded mb-4 text-center text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-500 text-white p-3 rounded mb-4 text-center text-sm">
                        {message}
                    </div>
                )}
                
                {/* --- TAMPILKAN FORM BERDASARKAN 'step' --- */}

                {step === 'password' ? (
                    // --- FORM 1: PASSWORD ---
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2" htmlFor="email">
                                Username (Email)
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-300 mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500"
                        >
                            {isLoading ? 'Checking...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    // --- FORM 2: OTP ---
                    <form onSubmit={handleOtpSubmit}>
                        <p className="text-center text-gray-300 mb-4">
                            We've sent a 6-digit login code to the phone number associated with <span className="font-bold">{email}</span>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-gray-300 mb-2" htmlFor="otp">
                                Enter 6-Digit OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </form>
                )}
                {/* --- AKHIR PERUBAHAN TAMPILAN --- */}

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm text-gray-400 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}