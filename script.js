// URL Webhook n8n Anda untuk ChatBot

const WEBHOOK_URL = 'https://webhook-alpha-explore.digibox.ai/webhook/19945a4a-301a-4497-bc79-d0925f82cb95';
//const WEBHOOK_URL ='https://webhook-alpha-explore.digibox.ai/webhook/19945a4a-301a-4497-bc79-d0925f82cb95';

// Dapatkan elemen-elemen DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');

// Tambahkan event listener untuk tombol Kirim dan tombol Enter
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

/**
 * Menambahkan pesan ke kolom chat (baik dari user maupun AI).
 * @param {string} message - Isi pesan.
 * @param {string} sender - 'user' atau 'ai' atau 'ai-error'.
 */
function appendMessage(message, sender) {
    const messageDiv = document.createElement('div');
    // Jika sender adalah 'ai-error', tambahkan kedua kelas
    if (sender === 'ai-error') {
        messageDiv.classList.add('message', 'message-ai', sender);
    } else {
        messageDiv.classList.add('message', `message-${sender}`);
    }
    
    // Gunakan pre-wrap agar baris baru (`\n`) dari AI bisa ditampilkan
    messageDiv.innerHTML = `<p style="white-space: pre-wrap;">${message}</p>`; 
    chatMessages.appendChild(messageDiv);
    
    // Scroll ke pesan terbaru
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fungsi utama untuk mengirim pesan
async function sendMessage() {
    
    const userMessage = userInput.value.trim();

    // Cek jika input kosong
    if (!userMessage) {
        return;
    }

    // Tampilkan pesan user di chat
    appendMessage(userMessage, 'user');

    // Kosongkan input dan nonaktifkan tombol
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    // ===============================================
    // KODE BARU: Menambahkan Indikator Mengetik (Loading Dots)
    // ===============================================
    const loadingMessage = document.createElement('div');
    // Gunakan kelas 'loading-indicator' (yang akan di-style di CSS)
    loadingMessage.classList.add('message', 'message-ai', 'loading-indicator'); 
    loadingMessage.innerHTML = 
        `<div class="dot-container">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>`;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll ke bawah
    // ===============================================

    // --- LOGIKA SESSION ID TETAP SAMA ---
    let sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
        sessionId = 'sesi_' + Date.now(); 
        sessionStorage.setItem('ai_session_id', sessionId);
    }
    // --- AKHIR LOGIKA SESSION ID ---

    try {
        const payload = {
            message: userMessage,
            sessionId: sessionId, 
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Hapus pesan loading
        loadingMessage.remove();

        if (!response.ok) {
            throw new Error(`Gagal mengirim pesan. Status HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        const aiResponse = data.output || data.response || data.text || "Gagal mendapatkan balasan dari AI. Cek kunci 'output' di Respond to Webhook n8n.";
        
        // Tampilkan jawaban AI di chat
        appendMessage(aiResponse, 'ai');

    } catch (error) {
        console.error('Error saat menghubungi n8n Webhook:', error);
        
        // Hapus pesan loading dan tampilkan error
        loadingMessage.remove();
        appendMessage('Terjadi kesalahan: Gagal terhubung ke ChatBot.', 'ai-error');
    } finally {
        // Aktifkan kembali input dan tombol
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus(); // Fokuskan kembali ke input
    }
}
