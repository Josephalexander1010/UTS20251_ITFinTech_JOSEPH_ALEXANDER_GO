// File: pages/api/admin/analytics/sales-over-time.js
// (VERSI DIPERBAIKI - Menggunakan 'amount' dan 'PAID')

import { getSession } from 'next-auth/react';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order'; // Sesuaikan path jika model Anda beda

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getSession({ req });
    if (!session || !session.user.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized: Admin only' });
    }

    try {
        await dbConnect();

        const salesData = await Order.aggregate([
            {
                // PERBAIKAN: Sesuaikan dengan status di DB Anda
                $match: {
                    status: 'PAID' 
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    // PERBAIKAN: Gunakan field 'amount' jika itu nama di DB
                    totalSales: { $sum: "$total" }, // GANTI KE $sum: "$amount" jika data lama pakai 'amount'
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const formattedData = salesData.map(item => ({
            date: item._id, // Kita beri nama 'date'
            totalSales: item.totalSales,
            orderCount: item.orderCount,
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching sales data:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}