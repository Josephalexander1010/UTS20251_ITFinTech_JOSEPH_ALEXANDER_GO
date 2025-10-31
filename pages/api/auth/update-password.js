// File: pages/api/auth/update-password.js (BARU)

import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Cek Sesi
  const session = await getSession({ req });
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized. Please login again.' });
  }

  try {
    await dbConnect();

    const { currentPassword, newPassword } = req.body;
    const userId = session.user.id;

    // 2. Validasi input
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'All fields are required and new password must be at least 6 characters.' });
    }

    // 3. Ambil user dari DB (PENTING: JANGAN pakai .lean() di sini)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 4. Cek password lama
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // 5. Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 6. Simpan password baru
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Update Password API Error:', error);
    res.status(500).json({ message: 'Server error updating password.', error: error.message });
  }
}