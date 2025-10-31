import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

// Regex untuk nomor HP Indonesia (awalan 08 atau +62)
const phoneRegex = /^(08|\+62|62)\d{8,15}$/;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await dbConnect();

        const { name, email, phone, password, confirmPassword } = req.body;

        // 1. Validasi input dasar
        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        if (password.length < 6) {
             return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        if (!phoneRegex.test(phone)) {
             return res.status(400).json({ message: 'Invalid Indonesian phone number format' });
        }
        
        // 2. Cek apakah email sudah ada
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' }); // 409 = Conflict
        }

        // 3. Acak (Hash) password
        const hashedPassword = await bcrypt.hash(password, 12); 

        // 4. Buat user baru
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            isAdmin: false, 
            isVerified: true, // <-- LANGSUNG KITA SET 'true'
        });

        // 5. Simpan ke database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' }); // 201 = Created

    } catch (error) {
        console.error('Register API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
}