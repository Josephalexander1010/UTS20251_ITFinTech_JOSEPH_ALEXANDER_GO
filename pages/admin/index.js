// File: pages/admin/index.js (BARU - Sesuai Contoh)

import AdminLayout from '../../components/AdminLayout';
import Head from 'next/head';
import Link from 'next/link';
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order'; // Import model Order
import { getSession } from 'next-auth/react'; // Import getSession

// --- "PENJAGA" HALAMAN + PENGAMBIL DATA ---
export async function getServerSideProps(context) {
    const session = await getSession(context);
    // 1. Cek Sesi: Apakah user login DAN user adalah admin?
    if (!session || !session.user?.isAdmin) {
        // Jika tidak, tendang ke halaman login admin
        return {
            redirect: { 
                destination: '/admin/login?error=NOT_ADMIN', // Arahkan ke login admin
                permanent: false 
            },
        };
    }

    // 2. Jika lolos (dia adalah admin), ambil data
    try {
        await dbConnect();

        // Hitung total order
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
        const paidOrders = await Order.countDocuments({ status: 'PAID' });
        
        // Hitung total revenue (hanya dari order PAID)
        const revenueResult = await Order.aggregate([
          { $match: { status: 'PAID' } }, 
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } } 
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Ambil 5 order terbaru
        const recentOrders = await Order.find({})
          .sort({ createdAt: -1 }) // Urutkan dari terbaru
          .limit(5) // Ambil 5 saja
          .lean();

        return {
          props: {
            session, // Kirim sesi (wajib)
            // Kirim data statistik
            stats: { totalOrders, pendingOrders, paidOrders, totalRevenue },
            // Kirim data order terbaru
            recentOrders: JSON.parse(JSON.stringify(recentOrders)),
          },
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Kirim data default jika ada error DB
        return { 
            props: { 
                session, 
                stats: { totalOrders: 0, pendingOrders: 0, paidOrders: 0, totalRevenue: 0 }, 
                recentOrders: [] 
            } 
        };
    }
}
// ---------------------------------------

export default function AdminIndexPage({ stats, recentOrders }) {
  return (
    <AdminLayout title="Dashboard">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard Overview</h2>

      {/* Grid Statistik (Sesuai Contoh) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Payment</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Paid Orders</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.paidOrders}</p>
        </div>
      </div>

      {/* Tabel Recent Orders (Sesuai Contoh) */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="p-3 text-sm text-gray-700 truncate" style={{maxWidth: '120px'}}>{order.external_id}</td>
                  <td className="p-3 text-sm text-gray-700 truncate" style={{maxWidth: '200px'}}>
                      {/* Tampilkan nama item pertama + jumlah item lainnya */}
                      {order.items && order.items.length > 0 
                         ? `${order.items[0].name}${order.items.length > 1 ? ` (and ${order.items.length - 1} more)` : ''}` 
                         : 'N/A'}
                  </td>
                  <td className="p-3 text-sm text-gray-900">Rp {(order.amount || 0).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                   <td className="p-3 text-sm text-gray-500">
                     {new Date(order.createdAt).toLocaleDateString('id-ID')}
                   </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-3 text-center text-gray-500">No recent orders.</td></tr>
            )}
          </tbody>
        </table>
      </div>
       <div className="mt-4 text-center">
           <Link href="/admin/orders" className="text-blue-600 hover:underline">
               View All Orders
           </Link>
       </div>
    </AdminLayout>
  );
}