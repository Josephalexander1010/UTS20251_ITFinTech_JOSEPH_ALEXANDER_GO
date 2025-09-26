// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    external_id: { type: String, required: true, unique: true }, // ID dari sisi kita
    invoice_id: { type: String }, // ID dari Xendit
    status: { type: String, default: 'PENDING' }, // PENDING, PAID, FAILED
    amount: { type: Number, required: true },
    items: [{ // Menyimpan detail produk yang dibeli
        productId: String,
        name: String,
        quantity: Number,
        price: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);