// File: pages/api/create-invoice.js
// (VERSI FINAL - Menggunakan getServerSession untuk fix 401)

// --- IMPORT BARU (SERVER-SIDE) ---
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; // <-- Import config kita
// --- AKHIR IMPORT ---

import axios from 'axios';
import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';
import { sendWhatsAppMessage } from '../../lib/fonnte';

export default async function handler(req, res) {
  // --- INI PERBAIKANNYA: Cek Sesi (SERVER-SIDE) ---
  const session = await unstable_getServerSession(req, res, authOptions);
  
  // 1. Cek Sesi (Wajib Login)
  if (!session || !session.user) {
    console.error("Auth Error: No session found.");
    return res.status(401).json({ message: 'Error: Unauthorized. Please login to checkout.' });
  }
  
  // 2. Cek apakah nomor HP ada di sesi
  const userPhoneNumber = session.user.phone;
  if (!userPhoneNumber) {
    console.error("Auth Error: User session has no phone number.");
    return res.status(400).json({ message: 'Error: Your account has no phone number.' });
  }
  // --- AKHIR PERBAIKAN ---

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    await dbConnect();

    const { items, totalAmount } = req.body;
    const external_id = `cinema22-order-${Date.now()}`;

    // 3. Simpan order ke database (Status: PENDING)
    const newOrder = new Order({
      external_id: external_id,
      total: totalAmount,
      status: 'PENDING',
      items: items,
      userPhoneNumber: userPhoneNumber, // <-- Ambil dari sesi
    });
    await newOrder.save();
    console.log("Order PENDING (User:", session.user.email, ") berhasil disimpan.");

    // 4. Kirim Notifikasi WA (Checkout)
    try {
      const message = `Halo, ${session.user.name || 'Pelanggan'}! Tagihan untuk Order ID ${external_id} sebesar Rp ${totalAmount.toLocaleString('id-ID')} telah dibuat. Silakan selesaikan pembayaran.`;
      
      // Kirim pesan tanpa 'await' agar tidak memblokir respon ke frontend
      sendWhatsAppMessage(userPhoneNumber, message)
        .then(result => console.log('Fonnte checkout msg sent:', result))
        .catch(err => console.error('Fonnte checkout msg error:', err));

    } catch (waError) {
      console.error("Gagal kirim WA checkout (tapi order tetap dibuat):", waError.message);
      // Jangan gagalkan pembayaran walau WA gagal
    }

    // 5. Siapkan data untuk Xendit
    const invoiceData = {
      external_id: external_id,
      amount: totalAmount,
      payer_email: session.user.email, // <-- Ambil dari sesi
      description: 'Pembayaran F&B Cinema 22',
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
    };

    // 6. Buat invoice ke Xendit
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

    // 7. Update order di DB dengan invoice_id dari Xendit
    newOrder.invoice_id = response.data.id;
    await newOrder.save();

    // 8. Kirim URL pembayaran ke frontend
    res.status(200).json({ invoice_url: response.data.invoice_url });

  } catch (error) {
    console.error('Create Invoice API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error processing payment.' });
  }
}