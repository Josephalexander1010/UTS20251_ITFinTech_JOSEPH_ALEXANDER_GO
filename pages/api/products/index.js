// pages/api/products/index.js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  // Anda bisa mengisi database dengan beberapa produk dulu melalui MongoDB Atlas
  const products = await Product.find({}); 

  res.status(200).json({ success: true, data: products });
}