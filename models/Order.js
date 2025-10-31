import mongoose from 'mongoose';

// Ini adalah asumsi struktur file Order.js kamu
// Sesuaikan jika ada yang beda, TAPI PASTIKAN TAMBAH 'userPhoneNumber'

const OrderSchema = new mongoose.Schema({
    external_id: {
        type: String,
        required: true,
        unique: true,
    },
    invoice_id: {
        type: String,
    },
    // Kamu pakai 'total' di file create-invoice.js, jadi saya pakai 'total'
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'PENDING',
    },
    items: {
        type: Array,
    },
    
    // --- TAMBAHKAN BARIS INI ---
    userPhoneNumber: {
        type: String,
    },
    // --- AKHIR TAMBAHAN ---

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
