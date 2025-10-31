// File: next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
    // Pastikan URL ini SAMA PERSIS dengan domain Ngrok Anda
    allowedDevOrigins: ['https://shirley-sociologistic-tomika.ngrok-free.dev'], 
  },
};

module.exports = nextConfig;