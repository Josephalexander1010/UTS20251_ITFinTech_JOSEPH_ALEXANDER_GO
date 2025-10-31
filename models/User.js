import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    // --- TAMBAHAN BARU ---
    name: {
        type: String,
        required: [true, 'Please provide your name'],
    },
    // --- AKHIR TAMBAHAN ---

    email: { // Field email kamu
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please provide a valid email'], 
    },

    // --- TAMBAHAN BARU ---
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
    },
    // --- AKHIR TAMBAHAN ---

    password: { // Field password kamu
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6, 
    },
    isAdmin: { // Field isAdmin kamu
        type: Boolean,
        default: false,
    },

    // --- TAMBAHAN BARU UNTUK VERIFIKASI OTP ---
    verificationOTP: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false, // User baru defaultnya BELUM terverifikasi
    }
    // --- AKHIR TAMBAHAN ---

}, { timestamps: true }); 

export default mongoose.models.User || mongoose.model('User', UserSchema);
