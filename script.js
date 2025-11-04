// URL Webhook n8n Anda untuk ChatBot
const WEBHOOK_URL = 'https://wendyproducts.app.n8n.cloud/webhook-test/fb4c92a4-aa9f-43f9-9358-ae9a741b6f4d';

// CATATAN: Fungsi addRow() telah dihapus karena elemen tabel transaksi sudah tidak ada di index.html

// Fungsi untuk membuka ChatBot dan mengirim pesan ke n8n via Webhook
async function openChatbot() {
    // 1. Minta input dari pengguna
    const userMessage = prompt('Hai! Saya AI Agent. Masukkan pesan Anda untuk memulai percakapan:');

    // Cek jika pengguna membatalkan atau input kosong
    if (!userMessage) {
        alert('Obrolan dibatalkan.');
        return;
    }

    // --- LOGIKA SESSION ID BARU DIMULAI DI SINI ---
    // Dapatkan/buat Session ID (menggunakan Session Storage)
    let sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
        // Buat ID sesi baru yang sederhana jika belum ada
        sessionId = 'sesi_' + Date.now(); 
        sessionStorage.setItem('ai_session_id', sessionId);
    }
    // --- LOGIKA SESSION ID BARU BERAKHIR DI SINI ---

    alert('Mengirim pesan ke AI Agent. Mohon tunggu...');

    try {
        // 2. Siapkan data yang akan dikirim ke n8n
        // Sekarang payload menyertakan sessionId
        const payload = {
            message: userMessage,
            sessionId: sessionId, // <-- Kunci ini akan digunakan oleh node Simple Memory di n8n
        };

        // 3. Kirim permintaan POST menggunakan Fetch API
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // 4. Proses respons
        if (!response.ok) {
            throw new Error(`Gagal mengirim pesan. Status HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Tampilkan balasan dari AI Agent. Sesuaikan 'data.response' 
        const aiResponse = data.response || data.text || "Pesan Anda berhasil diproses oleh n8n. (Cek log Webhook Anda)";
        
        alert(`AI Agent: ${aiResponse}`);

    } catch (error) {
        console.error('Error saat menghubungi n8n Webhook:', error);
        alert('Gagal terhubung atau menerima balasan dari ChatBot. Pastikan n8n workflow aktif.');
    }
}