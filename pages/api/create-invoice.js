import axios from 'axios';
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        await dbConnect();

        const { items, totalAmount } = req.body;
        const external_id = `cinema22-order-${Date.now()}`;

        // Simpan order ke database dengan status PENDING
        const newOrder = new Order({
            external_id: external_id,
            amount: totalAmount,
            status: 'PENDING',
            items: items,
        });
        await newOrder.save();

        // Siapkan data yang akan dikirim ke Xendit
        const invoiceData = {
            external_id: external_id,
            amount: totalAmount,
            payer_email: 'customer@example.com',
            description: 'Pembayaran F&B Cinema 22',
            // --- PERUBAHAN UTAMA ADA DI SINI ---
            // Memberitahu Xendit ke mana harus mengarahkan pengguna setelah pembayaran sukses.
            success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        };

        try {
            const response = await axios.post(
                'https://api.xendit.co/v2/invoices',
                invoiceData,
                {
                    auth: {
                        username: process.env.XENDIT_SECRET_KEY,
                        password: ''
                    }
                }
            );

            // Simpan invoice ID dari Xendit untuk referensi
            newOrder.invoice_id = response.data.id;
            await newOrder.save();

            // Kirim URL pembayaran ke frontend
            res.status(200).json({ invoice_url: response.data.invoice_url });

        } catch (error) {
            console.error('Error creating Xendit invoice:', error.response ? error.response.data : error.message);
            res.status(500).json({ message: 'Gagal membuat invoice Xendit' });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

