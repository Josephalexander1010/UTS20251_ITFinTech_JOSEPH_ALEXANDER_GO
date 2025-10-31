// File: pages/admin/orders.js (BARU)

import AdminLayout from '../../components/AdminLayout';
import Head from 'next/head';
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';
import { getSession } from 'next-auth/react'; // Import getSession
import { useState } from 'react'; // Import useState untuk filter

// --- "PENJAGA" HALAMAN + PENGAMBIL DATA ---
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session || !session.user?.isAdmin) {
        return {
            redirect: { destination: '/admin/login?error=NOT_ADMIN', permanent: false },
        };
    }

    try {
        await dbConnect();
        const allOrders = await Order.find({})
          .sort({ createdAt: -1 }) // Urutkan dari terbaru
          .lean();

        return {
          props: {
            session, // Kirim sesi
            orders: JSON.parse(JSON.stringify(allOrders)),
          },
        };
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return { props: { session, orders: [] } };
    }
}
// ---------------------------------------

export default function AdminOrdersPage({ orders }) {
  const [filterStatus, setFilterStatus] = useState('All'); // State untuk filter

  const filteredOrders = (orders || []).filter(order => {
      if (filterStatus === 'All') return true;
      return order.status === filterStatus;
  });

  return (
    <AdminLayout title="All Orders">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">All Orders ({filteredOrders.length})</h2>
        {/* Tombol Filter */}
        <div className="flex gap-2">
            <button 
                onClick={() => setFilterStatus('All')}
                className={`px-3 py-1 rounded text-sm ${filterStatus === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilterStatus('PAID')}
                className={`px-3 py-1 rounded text-sm ${filterStatus === 'PAID' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                Paid
            </button>
            <button 
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1 rounded text-sm ${filterStatus === 'PENDING' ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-700'}`}
            >
                Pending
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="p-3 text-sm text-gray-700 truncate" style={{maxWidth: '120px'}}>{order.external_id}</td>
                  <td className="p-3 text-sm text-gray-700 truncate" style={{maxWidth: '200px'}}>
                      {order.items && order.items.length > 0 ? `${order.items[0].name}${order.items.length > 1 ? ` (+${order.items.length - 1})` : ''}` : 'N/A'}
                  </td>
                  <td className="p-3 text-sm text-gray-900">Rp {((order.amount || 0).toLocaleString('id-ID'))}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                   <td className="p-3 text-sm text-gray-500">
                     {new Date(order.createdAt).toLocaleString('id-ID')}
                   </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-3 text-center text-gray-500">No orders found for this filter.</td></tr> 
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}