// File: pages/admin/analytics.js (BARU)

import AdminLayout from '../../components/AdminLayout';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getSession } from 'next-auth/react'; // Import getSession

// --- "PENJAGA" HALAMAN ---
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session || !session.user?.isAdmin) {
        return {
            redirect: { destination: '/admin/login?error=NOT_ADMIN', permanent: false },
        };
    }
    return { props: { session } }; // Kirim sesi
}
// ------------------------

export default function AdminAnalyticsPage() {
    const [salesData, setSalesData] = useState([]);
    const [timeGroup, setTimeGroup] = useState('daily'); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Panggil API yang tadi kita buat
                const res = await fetch(`/api/admin/analytics/sales-over-time?groupBy=${timeGroup}`);
                if (res.ok) {
                    const data = await res.json();
                    const formattedData = data.salesData.map(item => ({
                        ...item,
                        // Format tanggal untuk label X-Axis
                        dateLabel: timeGroup === 'daily' 
                            ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) // Misal: 30 Okt
                            : item.date // Misal: 2025-10
                    }));
                    setSalesData(formattedData);
                } else {
                    console.error("Failed to fetch analytics data");
                    setSalesData([]);
                }
            } catch (error) {
                console.error("Error fetching analytics data:", error);
                setSalesData([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeGroup]); // Jalankan ulang jika timeGroup berubah

    const formatRupiah = (value) => `Rp ${value.toLocaleString('id-ID')}`;

    return (
        <AdminLayout title="Analytics">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sales Analytics</h2>

            <div className="mb-4">
                <button 
                    onClick={() => setTimeGroup('daily')}
                    className={`mr-2 px-3 py-1 rounded text-sm ${timeGroup === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Daily
                </button>
                <button 
                    onClick={() => setTimeGroup('monthly')}
                     className={`px-3 py-1 rounded text-sm ${timeGroup === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Monthly
                </button>
            </div>

            {isLoading ? (
                <p className="text-gray-500">Loading chart data...</p>
            ) : salesData.length === 0 ? (
                <p className="text-gray-500">No sales data found for this period. (Hanya order 'PAID' yang dihitung)</p>
            ) : (
                <div className="bg-white p-4 rounded-lg shadow h-96">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        Revenue Trend ({timeGroup === 'daily' ? 'Daily' : 'Monthly'})
                    </h3>
                    <ResponsiveContainer width="100%" height="85%"> 
                        <LineChart data={salesData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateLabel" /> 
                            <YAxis tickFormatter={formatRupiah} /> 
                            <Tooltip formatter={formatRupiah} /> 
                            <Legend />
                            <Line type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={2} name="Total Sales (Rp)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </AdminLayout>
    );
}