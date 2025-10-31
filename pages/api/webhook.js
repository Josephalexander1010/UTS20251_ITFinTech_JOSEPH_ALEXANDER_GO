import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';
import { sendWhatsAppMessage } from '../../lib/fonnte'; // <-- TAMBAHAN 1: Import Fonnte

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
                // Cek jika order sudah PAID (mencegah kirim WA dobel)
                if (order.status !== 'PAID') {
                    order.status = 'PAID';
                    await order.save();
                    console.log(`Order ${external_id} berhasil diupdate menjadi PAID.`);

                    // --- TAMBAHAN 2: KIRIM NOTIFIKASI LUNAS ---
                    if (order.userPhoneNumber) {
                        const message = `Hore! Pembayaran untuk Order ID #${external_id} telah LUNAS.
Total: Rp ${order.total.toLocaleString('id-ID')}
    
Terima kasih telah memesan di Cinema 22!`;

                        // Kirim tanpa await agar Xendit tidak menunggu
                        sendWhatsAppMessage(order.userPhoneNumber, message)
                            .then(result => console.log('Fonnte lunas msg sent:', result))
                            .catch(err => console.error('Fonnte lunas msg error:', err));
                    }
                    // --- AKHIR TAMBAHAN 2 ---
                } else {
                    console.log(`Order ${external_id} sudah PAID sebelumnya.`);
                }
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
