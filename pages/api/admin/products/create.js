// File: pages/api/admin/products/create.js (FIXED)
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import { getServerSession } from 'next-auth/next'; // UBAH dari getSession
import { authOptions } from '../../auth/[...nextauth]'; // Import authOptions

export default async function handler(req, res) {
    // --- AUTH CHECK YANG BENAR ---
    const session = await getServerSession(req, res, authOptions);
    
    console.log('--- Create Product API ---');
    console.log('Session:', session ? `User: ${session.user.email}, isAdmin: ${session.user.isAdmin}` : 'No session');
    
    if (!session || !session.user?.isAdmin) {
        console.error('❌ Unauthorized access attempt');
        return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }
    // ----------------------------

    if (req.method === 'POST') {
        try {
            await dbConnect();
            const { name, price, category, imageUrl } = req.body;

            // Validasi input
            if (!name || !price || !category) {
                return res.status(400).json({ 
                    message: 'Name, price, and category are required' 
                });
            }

            const newProduct = new Product({
                name,
                price: Number(price),
                category,
                image: imageUrl || '',
            });

            await newProduct.save();
            
            console.log('✅ Product created successfully:', newProduct._id);
            
            res.status(201).json({ 
                message: 'Product created successfully', 
                product: newProduct 
            });
        } catch (error) {
            console.error('❌ Error creating product:', error);
            res.status(500).json({ 
                message: 'Error creating product', 
                error: error.message 
            });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}