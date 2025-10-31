// File: pages/api/auth/[...nextauth].js
// VERSI FINAL - FIX NGROK + SESSION COOKIE ISSUE
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { sendWhatsAppMessage } from '../../../lib/fonnte';

// Deteksi environment
const isProduction = process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("https://");
let cookieDomain = undefined;

// PENTING: Untuk ngrok, kita TIDAK set domain agar cookie bekerja
if (isProduction && !process.env.NEXTAUTH_URL.includes('ngrok')) {
  try {
    const url = new URL(process.env.NEXTAUTH_URL);
    cookieDomain = url.hostname; 
    console.log("Production Cookie Domain:", cookieDomain);
  } catch (e) {
    console.error("Invalid NEXTAUTH_URL:", e);
  }
} else {
  console.log("Development/Ngrok mode: Cookie domain = undefined (per-request)");
}

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 jam
  },
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        console.log("\n--- Authorize attempt ---");
        try {
          await dbConnect();
          console.log("DB Connected. Finding user:", credentials.email);
          
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            console.error("Authorize failed: User not found");
            throw new Error('Email not found. Please register.');
          }
          console.log("User found:", user.email, "Is Admin:", user.isAdmin);

          // SKENARIO 1: Cek Password
          if (credentials.password) {
            console.log("Comparing password...");
            const isValid = await bcrypt.compare(credentials.password, user.password);
            
            if (!isValid) {
              console.error("Authorize failed: Wrong password");
              throw new Error('Wrong password. Please try again.');
            }
            console.log("Password valid. Generating OTP...");

            if (!user.phone) {
              console.error("Login Error: No phone number");
              throw new Error('Account has no phone number setup.');
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);

            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  verificationOTP: otp,
                  otpExpires: expires
                }
              }
            );
            console.log("OTP saved to DB.");

            try {
              const message = `[Cinema 22] Kode login Anda: ${otp}. Kode ini berlaku 5 menit.`;
              await sendWhatsAppMessage(user.phone, message); 
              console.log("OTP sent to WA.");
            } catch (waError) {
              console.error("Failed to send WA OTP:", waError.message);
              throw new Error('Failed to send OTP. Please contact support.');
            }
            
            throw new Error('OTP_SENT');
          }

          // SKENARIO 2: Cek OTP
          if (credentials.otp) {
            console.log("Comparing OTP...");
            const userOtpData = await User.findOne({ _id: user._id })
              .select("verificationOTP otpExpires")
              .lean();

            if (!userOtpData || userOtpData.verificationOTP !== credentials.otp) {
              console.error("Authorize failed: Invalid OTP");
              throw new Error('Invalid OTP. Please try again.');
            }

            if (userOtpData.otpExpires < new Date()) {
              console.error("Authorize failed: Expired OTP");
              throw new Error('OTP expired. Please login again.');
            }

            console.log("OTP valid. Clearing OTP fields.");
            await User.updateOne(
              { _id: user._id },
              {
                $unset: { 
                  verificationOTP: "",
                  otpExpires: ""
                }
              }
            );

            console.log("✅ Login success for:", user.email);
            return { 
              id: user._id.toString(), 
              email: user.email, 
              name: user.name,
              phone: user.phone,
              isAdmin: user.isAdmin || false
            };
          }
          
          throw new Error('Invalid login request.');
        } catch (error) {
          console.error("❌ Authorize error:", error.message); 
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.name = user.name;
        token.phone = user.phone;
        console.log("JWT created for:", user.email, "isAdmin:", user.isAdmin);
      }
      return token; 
    },
    
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          phone: token.phone,
          isAdmin: token.isAdmin,
          image: null, // PENTING: Set null untuk mencegah undefined serialization error
        };
        // Debug log setiap session check
        // console.log("Session check - isAdmin:", token.isAdmin);
      }
      return session; 
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET, 
  
  pages: { 
    signIn: '/login', 
    error: '/login'   
  },
  
  // PENTING: Konfigurasi cookie untuk ngrok
  useSecureCookies: isProduction,
  
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // UBAH dari 'none' ke 'lax' untuk ngrok
        path: '/',
        secure: isProduction,
        domain: cookieDomain, // undefined untuk ngrok
      },
    },
    callbackUrl: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax', // UBAH dari 'none' ke 'lax'
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: `${isProduction ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // UBAH dari 'none' ke 'lax'
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
  },
  
  // Tambahan debug
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);