// URL Webhook n8n Anda untuk ChatBot
const WEBHOOK_URL = 'https://wendyproducts.app.n8n.cloud/webhook-test/fb4c92a4-aa9f-43f9-9358-ae9a741b6f4d';

// CATATAN: Fungsi addRow() telah dihapus karena elemen tabel transaksi sudah tidak ada di index.html

// Fungsi untuk membuka ChatBot dan mengirim pesan ke n8n via Webhook
async function openChatbot() {
    // 1. Minta input dari pengguna
    const userMessage = prompt('Hai! Saya AI Agent. Masukkan pesan Anda untuk memulai percakapan:');

    // Cek jika pengguna membatalkan atau input kosong
    if (!userMessage) {
        // Tampilkan pesan di alert jika dibatalkan
        alert('Obrolan dibatalkan.');
        return;
    }

    // --- LOGIKA SESSION ID TETAP SAMA ---
    let sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
        sessionId = 'sesi_' + Date.now(); 
        sessionStorage.setItem('ai_session_id', sessionId);
    }
    // --- AKHIR LOGIKA SESSION ID ---

    // ----------------------------------------------------
    // PERUBAHAN UTAMA: Targetkan elemen HTML untuk output
    // ----------------------------------------------------
    const responseContainer = document.getElementById('ai-agent-text');
    
    // Berikan feedback loading di dalam container
    responseContainer.innerHTML = 'Mengirim pesan ke AI Agent, mohon tunggu...';
    // ----------------------------------------------------

    try {
        // 2. Siapkan data yang akan dikirim ke n8n
        const payload = {
            message: userMessage,
            sessionId: sessionId, 
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
        
        // Respons Diharapkan Berupa JSON dari n8n
        const data = await response.json();
        
        // Ambil balasan dari kunci 'response' atau 'text'
        const aiResponse = data.response || data.text || "Gagal mendapatkan balasan dari AI. Cek konfigurasi Response Body n8n.";
        
        // Tampilkan jawaban di dalam elemen HTML (mengganti pesan loading)
        responseContainer.innerHTML = aiResponse;

    } catch (error) {
        console.error('Error saat menghubungi n8n Webhook:', error);
        
        // Tampilkan pesan error di dalam container
        responseContainer.innerHTML = 'Terjadi kesalahan: Gagal terhubung atau menerima balasan dari ChatBot. Pastikan n8n workflow sudah aktif dan Node Respond to Webhook sudah disetel ke JSON.';
        
        // Opsional: Tampilkan alert() untuk error yang sangat kritis
        alert('Gagal terhubung atau menerima balasan dari ChatBot. Silakan lihat pesan di bawah bagian Makalah Project.');
    }
}
