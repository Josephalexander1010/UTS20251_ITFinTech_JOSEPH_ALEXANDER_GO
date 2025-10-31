// File: pages/admin/analytics.js
// (DIUBAH - Menjadi Halaman Menu)

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AnalyticsMenuPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Lindungi Halaman
    if (status === 'loading') {
        return <div className="min-h-screen bg-gray-900 text-white p-10">Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.replace('/admin/login');
        return null;
    }
    
    if (status === 'authenticated' && !session.user.isAdmin) {
        return <div className="min-h-screen bg-gray-900 text-red-500 p-10">Access Denied.</div>;
    }

    // Tampilan Menu
    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tombol ke Grafik Harian */}
                <Link href="/admin/analytics/daily" legacyBehavior>
                    <a className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition">
                        <h2 className="text-2xl font-bold mb-2 text-teal-400">Omset Harian</h2>
                        <p className="text-gray-300">Lihat grafik total pendapatan per hari.</p>
                    </a>
                </Link>

                {/* Tombol ke Grafik Bulanan */}
                <Link href="/admin/analytics/monthly" legacyBehavior>
                    <a className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition">
                        <h2 className="text-2xl font-bold mb-2 text-blue-400">Omset Bulanan</h2>
                        <p className="text-gray-300">Lihat grafik total pendapatan per bulan.</p>
                    </a>
                </Link>

            </div>
        </div>
    );
}