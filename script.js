// ===============================
// URL Webhook n8n
// ===============================
const WEBHOOK_URL =
  "https://webhook-alpha-explore.digibox.ai/webhook/b6c8f3d0-333b-4506-ba1b-c774a0026705";

// ===============================
// DOM ELEMENTS
// ===============================
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

// ===============================
// SESSION ID (TETAP ADA)
// ===============================
function getSessionId() {
  let sessionId = sessionStorage.getItem("ai_session_id");
  if (!sessionId) {
    sessionId = "sesi_" + Date.now();
    sessionStorage.setItem("ai_session_id", sessionId);
  }
  return sessionId;
}

// ===============================
// FORMAT MESSAGE
// - aman dari HTML injection
// - hapus angka Romawi di awal baris (I. / II) / III: dst)
// - bold **text**
// - bullet: "- " / "• " => "• "
// - newline -> <br>
// ===============================
function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMessage(text) {
  let safe = escapeHtml(text);

  // 1) Hapus angka Romawi di awal baris
  safe = safe.replace(
    /(^|\n)\s*(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\s*(?:[.)\-:])\s+/g,
    "$1"
  );

  // 2) Normalisasi bullet
  safe = safe.replace(/(^|\n)\s*-\s+/g, "$1• ");
  safe = safe.replace(/(^|\n)\s*•\s+/g, "$1• ");

  // 3) Bold markdown
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 4) Newline
  safe = safe.replace(/\r\n|\n|\r/g, "<br>");

  return safe;
}

// ===============================
// APPEND USER MESSAGE
// ===============================
function appendUserMessage(message) {
  const msg = document.createElement("div");
  msg.className = "msg msg-user";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message;

  msg.appendChild(bubble);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===============================
// APPEND AI MESSAGE (Typing Effect)
// ===============================
function appendAiTypingMessage(rawMessage) {
  const msg = document.createElement("div");
  msg.className = "msg msg-ai";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = `<img src="logo.png" class="avatar-img" alt="AI">`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatMessages.appendChild(msg);

  const formatted = formatMessage(rawMessage);

  let index = 0;
  const speed = 15; // ms per karakter

  function type() {
    bubble.innerHTML = formatted.slice(0, index);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (index < formatted.length) {
      index++;
      setTimeout(type, speed);
    }
  }

  type();
}

// ===============================
// TYPING INDICATOR (•••) saat menunggu respon
// ===============================
function showTyping() {
  if (document.getElementById("typing-indicator")) return;

  const typing = document.createElement("div");
  typing.className = "msg msg-ai";
  typing.id = "typing-indicator";

  typing.innerHTML = `
    <div class="avatar">
      <img src="logo.png" class="avatar-img" alt="AI">
    </div>
    <div class="bubble">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;

  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

// ===============================
// SEND MESSAGE
// ===============================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendUserMessage(text);

  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

  showTyping();

  try {
    const payload = {
      message: text,
      sessionId: getSessionId(),
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    removeTyping();

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();
    const aiReply =
      data.output || data.response || data.text || "Tidak ada respon dari AI.";

    appendAiTypingMessage(aiReply);
  } catch (error) {
    console.error(error);
    removeTyping();
    appendAiTypingMessage("Terjadi kesalahan saat menghubungi server.");
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// ===============================
// EVENTS
// ===============================
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});



