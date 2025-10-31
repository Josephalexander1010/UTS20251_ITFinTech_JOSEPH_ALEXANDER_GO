// lib/mongodb.js
// (PERBAIKAN: Memaksa koneksi baru di mode development)

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Definisikan MONGODB_URI di dalam .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {

  // --- INI PERBAIKANNYA ---
  // Di mode 'development', JANGAN gunakan koneksi cache.
  // Ini memaksa Mongoose untuk mengambil data BARU dari database
  // setiap kali API dipanggil, dan BUKAN dari cache.
  if (process.env.NODE_ENV === 'development') {
    cached.conn = null;
    cached.promise = null;
  }
  // --- AKHIR PERBAIKAN ---

  if (cached.conn) {
    console.log("Using cached DB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new DB connection...");
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;