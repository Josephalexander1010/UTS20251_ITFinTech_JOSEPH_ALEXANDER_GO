// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String }, // <-- GANTI MENJADI 'image'
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);