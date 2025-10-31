// File: pages/api/auth/update-profile.js (BARU)

import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

// Regex untuk nomor HP Indonesia (awalan 08 atau +62)
const phoneRegex = /^(08|\+62|62)\d{8,15}$/;

export default async function handler(req, res) {
  // Hanya izinkan method PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Cek Sesi (HARUS login untuk update)
  const session = await getSession({ req });
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized. Please login again.' });
  }

  try {
    await dbConnect();

    const { name, email, phone } = req.body;
    const userId = session.user.id;

    // 2. Validasi input
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }
    if (!phoneRegex.test(phone)) {
         return res.status(400).json({ message: 'Invalid Indonesian phone number format' });
    }
    
    // 3. Cek jika email baru sudah dipakai user lain
    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use by another account.' });
        }
    }

    // 4. Cari dan update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        email: email.toLowerCase(), // Simpan email sbg lowercase
        phone: phone,
      },
      { new: true, runValidators: true } // 'new:true' agar mengembalikan data baru
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully!', user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
    }});

  } catch (error) {
    console.error('Update Profile API Error:', error);
    res.status(500).json({ message: 'Server error updating profile.', error: error.message });
  }
}