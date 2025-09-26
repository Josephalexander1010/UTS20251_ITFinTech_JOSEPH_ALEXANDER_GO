// pages/api/webhook.js
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Xendit akan mengirim notifikasi ke URL ini
        const { external_id, status } = req.body;

        console.log(`Webhook diterima untuk external_id: ${external_id} dengan status: ${status}`);

        if (status === 'PAID') {
            await dbConnect();

            // Cari order di database Anda berdasarkan external_id
            const order = await Order.findOne({ external_id: external_id });

            if (order) {
                // Update statusnya menjadi LUNAS (atau PAID)
                order.status = 'PAID';
                await order.save();
                console.log(`Order ${external_id} berhasil diupdate menjadi PAID.`);
            } else {
                console.log(`Order dengan external_id: ${external_id} tidak ditemukan.`);
            }
        }

        // Kirim respon OK ke Xendit agar mereka tahu notifikasi sudah diterima
        res.status(200).send('OK');
    } else {
        res.status(405).end();
    }
}