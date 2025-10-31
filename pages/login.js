import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
    // State untuk form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // State UI
    const [step, setStep] = useState('password'); // 'password' or 'otp'
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Cek jika ada error di URL (misal dari next-auth redirect)
    useEffect(() => {
        if (router.query.error) {
            if (router.query.error === 'CredentialsSignin') {
                setError('Email atau Password salah. Coba lagi.');
            } else {
                setError(router.query.error);
            }
        }
    }, [router.query.error]);

    // Handler untuk form Langkah 1 (Email + Password)
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const result = await signIn('credentials', {
            redirect: false,
            email: email,
            password: password,
        });

        setIsLoading(false);

        if (result.ok) {
            // Ini seharusnya tidak terjadi di alur OTP, tapi jika ya, login sukses
            router.replace(router.query.callbackUrl || '/');
        } else {
            // Cek error spesial 'OTP_SENT'
            if (result.error === 'OTP_SENT') {
                setMessage('Password correct. OTP sent to your WhatsApp.');
                setStep('otp'); // Pindah ke langkah 2
            } else {
                // Error lain (misal: password salah)
                setError(result.error || 'Login failed. Please try again.');
            }
        }
    };

    // Handler untuk form Langkah 2 (OTP)
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const result = await signIn('credentials', {
            redirect: false,
            email: email, // Kirim email yang sama
            otp: otp,     // Kirim OTP (bukan password)
        });

        setIsLoading(false);

        if (result.ok) {
            // SUKSES! Login selesai
            router.replace(router.query.callbackUrl || '/');
        } else {
            // Gagal (misal: OTP salah atau kedaluwarsa)
            setError(result.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <Head>
                <title>Login - Cinema 22</title>
            </Head>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                
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
                
                {step === 'password' ? (
                    <>
                        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
                                <input
                                    type="email" id="email" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
                                <input
                                    type="password" id="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500">
                                {isLoading ? 'Checking...' : 'Login'}
                            </button>
                        </form>
                        <div className="text-center mt-6">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-teal-400 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-center mb-6">Check Your WhatsApp</h1>
                        <p className="text-center text-gray-300 mb-4">
                            We've sent a 6-digit login code to the phone number associated with <span className="font-bold">{email}</span>.
                        </p>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-300 mb-2" htmlFor="otp">Enter 6-Digit OTP</label>
                                <input
                                    type="text" id="otp" value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required maxLength={6}
                                />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500">
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </form>
                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                Wrong account?{' '}
                                <button 
                                    onClick={() => {
                                        setStep('password');
                                        setError('');
                                        setMessage('');
                                        setPassword('');
                                    }}
                                    className="text-teal-400 hover:underline bg-transparent border-none p-0"
                                >
                                    Go Back
                                </button>
                            </p>
                        </div>
                    </>
                )}
                
            </div>
        </div>
    );
}