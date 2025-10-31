// File: lib/fonnte.js
// (VERSI FINAL - Melempar Error jika Fonnte Gagal)

export async function sendWhatsAppMessage(phoneNumber, message) {
  // 1. Ambil Token dari .env.local
  const token = process.env.FONNTE_TOKEN;

  // 2. Format nomor HP (WAJIB pakai 62, bukan 0)
  let formattedPhone = phoneNumber.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `62${formattedPhone.substring(1)}`;
  }

  // 3. Siapkan data untuk dikirim ke Fonnte
  const data = {
    target: formattedPhone,
    message: message,
  };

  // 4. Kirim permintaan ke server Fonnte
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token // Kirim Token di sini
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // 5. Cek apakah sukses atau gagal
    //    INI PERBAIKAN KRITIS-nya: Cek 'result.status === false'
    if (!response.ok || (result.status && result.status === false)) {
      const errorMessage = result.reason || 'Unknown Fonnte API error';
      console.error('Fonnte API Error:', errorMessage);
      throw new Error(errorMessage); // <-- LEMPAR ERROR
    }

    // Jika sukses
    console.log('Fonnte message sent successfully:', result);
    return { success: true, data: result }; // Sukses, return data

  } catch (error) {
    // Jika ada error jaringan (misal: fetch gagal atau error yg kita lempar)
    console.error('Failed to send Fonnte message:', error.message);
    // Lempar lagi errornya agar API [..nextauth].js bisa menangkap
    throw error; 
  }
}