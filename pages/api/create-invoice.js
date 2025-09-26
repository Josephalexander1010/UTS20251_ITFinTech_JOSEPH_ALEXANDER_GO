// pages/api/create-invoice.js
import axios from 'axios';
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        await dbConnect();

        const { items, totalAmount } = req.body; // Data ini dikirim oleh frontend

        // 1. Buat ID unik untuk order ini
        const external_id = `invoice-${Date.now()}`;

        // 2. Simpan order ke database Anda dengan status PENDING
        const newOrder = new Order({
            external_id: external_id,
            amount: totalAmount,
            status: 'PENDING',
            items: items, // asumsikan frontend mengirim array of items
        });
        await newOrder.save();

        // 3. Siapkan data untuk dikirim ke Xendit
        const invoiceData = {
            external_id: external_id,
            amount: totalAmount,
            payer_email: 'customer@example.com', // bisa didapat dari frontend
            description: 'Pembayaran untuk produk di toko kita',
            success_redirect_url: 'http://localhost:3000/payment-success', // Halaman setelah sukses
            failure_redirect_url: 'http://localhost:3000/payment-failed', // Halaman setelah gagal
        };

        // 4. Kirim permintaan ke Xendit
        try {
            const response = await axios.post(
                'https://api.xendit.co/v2/invoices',
                invoiceData,
                {
                    auth: {
                        username: process.env.XENDIT_SECRET_KEY,
                        password: '' // Password dikosongkan
                    }
                }
            );

            // Simpan invoice_id dari Xendit ke order kita
            newOrder.invoice_id = response.data.id;
            await newOrder.save();

            // 5. Kirim URL pembayaran kembali ke frontend
            res.status(200).json({ invoice_url: response.data.invoice_url });

        } catch (error) {
            console.error('Error creating invoice:', error.response ? error.response.data : error.message);
            res.status(500).json({ message: 'Gagal membuat invoice' });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}