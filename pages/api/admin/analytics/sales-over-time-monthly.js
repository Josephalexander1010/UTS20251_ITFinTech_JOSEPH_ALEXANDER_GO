// File: pages/api/admin/analytics/sales-over-time-monthly.js
// (BARU - Agregasi per bulan)

import { getSession } from 'next-auth/react';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

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
                $match: {
                    status: 'PAID' // Sesuaikan juga di sini
                }
            },
            {
                $group: {
                    // DIUBAH: Format menjadi YYYY-MM untuk grup bulanan
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    // PERBAIKKEUN: Ganti ke $sum: "$amount" jika perlu
                    totalSales: { $sum: "$total" }, 
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const formattedData = salesData.map(item => ({
            month: item._id, // Kita beri nama 'month'
            totalSales: item.totalSales,
            orderCount: item.orderCount,
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching monthly sales data:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}