// pages/api/products/index.js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  const { method } = req;

  // Menghubungkan ke database
  await dbConnect();

  // Hanya izinkan request GET ke endpoint ini
  if (method === 'GET') {
    try {
      const products = await Product.find({});
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      // Jika ada error di server/database
      console.error("Database error:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  } else {
    // Jika metodenya bukan GET (misal: POST, PUT, DELETE)
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}