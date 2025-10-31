// File: pages/admin/analytics/daily.js
// (BARU - Halaman Grafik Harian)

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// (Salin fungsi formatCurrency dari kode saya sebelumnya)
const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

export default function DailyAnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Lindungi Halaman
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/admin/login');
        }
    }, [status, router]);

    // 2. Ambil data Harian
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.isAdmin) {
            fetch('/api/admin/analytics/sales-over-time')
                .then(res => res.json())
                .then(data => {
                    setSalesData(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [status, session]);

    // 3. Render Konten
    const renderContent = () => {
        if (loading) {
            return <div className="text-center text-white p-10">Loading data...</div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-10">Error: {error}</div>;
        }
        if (salesData.length === 0) {
            return <div className="text-center text-white p-10">No sales data found.</div>;
        }

        return (
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="date" stroke="#ccc" /> {/* dataKey adalah 'date' */}
                        <YAxis stroke="#ccc" tickFormatter={formatCurrency} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#333', border: 'none' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="totalSales" name="Total Omset" stroke="#8884d8" />
                        <Line type="monotone" dataKey="orderCount" name="Jumlah Order" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };
    
    if (status === 'authenticated' && !session?.user?.isAdmin) {
        return <div className="min-h-screen bg-gray-900 text-red-500 p-10">Access Denied.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Omset Harian</h1>
                <div>
                    <Link href="/admin/analytics" legacyBehavior>
                        <a className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2">
                            Kembali ke Menu
                        </a>
                    </Link>
                    <Link href="/admin/analytics/monthly" legacyBehavior>
                        <a className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                            Lihat Bulanan
                        </a>
                    </Link>
                </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
}