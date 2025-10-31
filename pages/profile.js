// File: pages/profile.js (BARU)

import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'; // Import Image

// --- "PENJAGA" HALAMAN ---
// Fungsi ini dijalankan di server sebelum halaman dimuat
export async function getServerSideProps(context) {
  const session = await getSession(context); // Ambil sesi

  // Jika TIDAK ADA sesi (belum login)
  if (!session) {
    return {
      redirect: {
        destination: '/login?callbackUrl=/profile', // Tendang ke login
        permanent: false,
      },
    };
  }

  // Jika ada sesi, kirim data sesi ke halaman
  return {
    props: { session }, // Data user ada di 'session'
  };
}
// ------------------------


export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession(); // Ambil sesi & fungsi update
  const router = useRouter();

  // State untuk form info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // <-- State untuk No. HP
  
  // State untuk ganti password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State untuk pesan
  const [infoMessage, setInfoMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [infoError, setInfoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State untuk loading
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Isi form dengan data dari sesi saat halaman dimuat
  useEffect(() => {
    if (session) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      // Ambil 'phone' dari sesi (pastikan sudah ditambah di [...nextauth].js)
      setPhone(session.user.phone || ''); 
    }
  }, [session]); // Dijalankan setiap kali 'session' berubah

  // Handle update info (Nama, Email, HP)
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsInfoLoading(true);
    setInfoMessage('');
    setInfoError('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      setIsInfoLoading(false);
      
      if (res.ok) {
        setInfoMessage('Profile updated successfully!');
        // Update sesi di frontend agar nama di header berubah
        await updateSession({ 
            ...session, 
            user: { ...session.user, name, email, phone } 
        });
      } else {
        setInfoError(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      setIsInfoLoading(false);
      setInfoError('An error occurred.');
    }
  };

  // Handle ganti password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      setIsPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setIsPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setIsPasswordLoading(false);
      
      if (res.ok) {
        setPasswordMessage('Password updated successfully!');
        // Kosongkan form password
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (error) {
      setIsPasswordLoading(false);
      setPasswordError('An error occurred.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>My Profile - Cinema 22</title>
      </Head>
      
      {/* Header Sederhana */}
       <header className="bg-black shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image src="/images/weblogo.png" alt="Cinema 22 Logo" width={50} height={50} priority />
              </Link>
              <h1 className="text-white text-2xl font-bold font-sans">My Profile</h1>
            </div>
             <Link href="/" className="text-teal-400 hover:underline">
                Back to Home
             </Link>
        </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Form 1: Update Info */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
            {infoError && <p className="text-red-500 text-sm mb-4">{infoError}</p>}
            {infoMessage && <p className="text-green-500 text-sm mb-4">{infoMessage}</p>}
            <form onSubmit={handleUpdateInfo}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="name">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2" htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="08..." required />
              </div>
              <button type="submit" disabled={isInfoLoading} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-500">
                {isInfoLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Form 2: Ganti Password */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-6">Change Password</h2>
            {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
            {passwordMessage && <p className="text-green-500 text-sm mb-4">{passwordMessage}</p>}
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="newPassword">New Password (min. 6 characters)</label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2" htmlFor="confirmNewPassword">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <button type="submit" disabled={isPasswordLoading} className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-500">
                {isPasswordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}