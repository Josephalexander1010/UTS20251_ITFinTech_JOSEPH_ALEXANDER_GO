// File: pages/api/admin/products/update.js (UPDATE)
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react'; // Import getSession

export default async function handler(req, res) {
    // --- "PENJAGA" API ---
    const session = await getSession({ req });
    if (!session || !session.user?.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // --------------------

    if (req.method === 'PUT') {
        try {
            await dbConnect();
            const { id, name, price, category, imageUrl } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            if (!name || !price || !category) {
                return res.status(400).json({ message: 'Name, price, and category are required' });
            }
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    name,
                    price,
                    category,
                    image: imageUrl || '',
                },
                { new: true } 
            );
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error: error.message });
        }
    } else {
        res.setHeader('Allow', 'PUT');
        res.status(405).end('Method Not Allowed');
    }
}