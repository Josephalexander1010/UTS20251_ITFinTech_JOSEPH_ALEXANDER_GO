    // File: pages/api/admin/products/delete.js (UPDATE)
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

        if (req.method === 'DELETE') {
            try {
                await dbConnect();
                const { id } = req.body;
                if (!id) {
                    return res.status(400).json({ message: 'Product ID is required' });
                }
                await Product.findByIdAndDelete(id);
                res.status(200).json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error deleting product:', error);
                res.status(500).json({ message: 'Error deleting product', error: error.message });
            }
        } else {
            res.setHeader('Allow', 'DELETE');
            res.status(405).end('Method Not Allowed');
        }
    }