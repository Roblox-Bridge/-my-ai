const HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b0d">
<title>AetherAI Studio</title>

<style>
:root{
  --bg:#0b0b0d;
  --panel:#111114;
  --panel2:#17171b;
  --border:#29292f;
  --text:#f4f4f5;
  --muted:#9b9ba3;
  --accent:#ffffff;
  --danger:#ef4444;
  --radius:14px;
}

*{box-sizing:border-box}

html,body{
  margin:0;
  width:100%;
  height:100%;
  background:var(--bg);
  color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
}

body{
  overflow:hidden;
}

button,input,textarea,select{
  font:inherit;
}

button{
  cursor:pointer;
}

.app{
  display:flex;
  width:100%;
  height:100%;
}

/* SIDEBAR */

.sidebar{
  width:270px;
  height:100%;
  background:#101012;
  border-right:1px solid var(--border);
  display:flex;
  flex-direction:column;
  padding:14px;
  flex-shrink:0;
  z-index:20;
}

.brand{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 8px 18px;
}

.logo{
  width:34px;
  height:34px;
  border-radius:10px;
  display:grid;
  place-items:center;
  background:#fff;
  color:#000;
  font-weight:800;
}

.brand-title{
  font-weight:700;
  font-size:15px;
}

.brand-sub{
  color:var(--muted);
  font-size:11px;
  margin-top:2px;
}

.new-chat{
  border:1px solid var(--border);
  background:#19191d;
  color:var(--text);
  padding:11px 12px;
  border-radius:11px;
  text-align:left;
  margin-bottom:12px;
}

.new-chat:hover{
  background:#202024;
}

.history-label{
  color:#73737b;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.08em;
  padding:12px 8px 7px;
}

.history{
  flex:1;
  overflow:auto;
}

.history-item{
  border:0;
  background:transparent;
  color:#d7d7dc;
  width:100%;
  padding:9px 10px;
  text-align:left;
  border-radius:9px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.history-item:hover{
  background:#19191d;
}

.sidebar-footer{
  border-top:1px solid var(--border);
  padding-top:12px;
  color:#777780;
  font-size:11px;
}

/* MAIN */

.main{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  height:100%;
}

.topbar{
  height:58px;
  flex-shrink:0;
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 16px;
  background:rgba(11,11,13,.92);
  backdrop-filter:blur(14px);
}

.menu{
  display:none;
}

.model-wrap{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
}

.model-select{
  max-width:330px;
  min-width:180px;
  background:#151519;
  color:var(--text);
  border:1px solid var(--border);
  border-radius:9px;
  padding:8px 10px;
  outline:none;
}

.model-info{
  color:var(--muted);
  font-size:11px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.top-actions{
  margin-left:auto;
  display:flex;
  gap:8px;
}

.icon-btn,
.council-btn{
  border:1px solid var(--border);
  background:#151519;
  color:#ddd;
  border-radius:9px;
  padding:8px 10px;
}

.icon-btn:hover,
.council-btn:hover{
  background:#202024;
}

.council-btn{
  font-size:12px;
}

/* CHAT */

.chat{
  flex:1;
  overflow:auto;
  scroll-behavior:smooth;
}

.messages{
  width:min(900px,100%);
  margin:0 auto;
  padding:26px 20px 150px;
}

.empty{
  min-height:55vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
}

.empty-logo{
  width:55px;
  height:55px;
  border-radius:17px;
  background:#fff;
  color:#000;
  display:grid;
  place-items:center;
  font-size:22px;
  font-weight:800;
  margin-bottom:18px;
}

.empty h1{
  margin:0 0 7px;
  font-size:27px;
}

.empty p{
  color:var(--muted);
  margin:0;
  font-size:14px;
}

.message{
  display:flex;
  gap:12px;
  margin:0 0 27px;
}

.avatar{
  width:30px;
  height:30px;
  border-radius:9px;
  flex:0 0 30px;
  display:grid;
  place-items:center;
  font-size:11px;
  font-weight:700;
  background:#202024;
  color:#ddd;
}

.message.user .avatar{
  background:#fff;
  color:#000;
}

.content{
  min-width:0;
  flex:1;
  line-height:1.65;
  font-size:14px;
}

.content p{
  margin:0 0 12px;
}

.content p:last-child{
  margin-bottom:0;
}

.content pre{
  overflow:auto;
  background:#09090b;
  border:1px solid var(--border);
  border-radius:10px;
  padding:13px;
  margin:12px 0;
}

.content code{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}

.content :not(pre)>code{
  background:#202024;
  border-radius:5px;
  padding:2px 5px;
  font-size:12px;
}

.content blockquote{
  border-left:3px solid #444;
  padding-left:12px;
  color:#bbb;
}

.content a{
  color:#c9c9ff;
  text-decoration:none;
}

.content a:hover{
  text-decoration:underline;
}

.typing{
  color:#888;
}

.dot{
  display:inline-block;
  animation:pulse 1.2s infinite;
}

@keyframes pulse{
  0%,100%{opacity:.25}
  50%{opacity:1}
}

/* SOURCES */

.sources{
  margin-top:13px;
  display:grid;
  gap:7px;
}

.source{
  border:1px solid var(--border);
  background:#121216;
  border-radius:9px;
  padding:9px 10px;
  text-decoration:none;
  color:#ddd;
  display:block;
}

.source-title{
  font-size:12px;
  font-weight:600;
}

.source-url{
  color:#777780;
  font-size:10px;
  margin-top:3px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

/* COMPOSER */

.composer-area{
  position:fixed;
  left:270px;
  right:0;
  bottom:0;
  padding:14px 18px 18px;
  background:linear-gradient(transparent,var(--bg) 28%);
  pointer-events:none;
}

.composer{
  pointer-events:auto;
  width:min(900px,100%);
  margin:auto;
  background:#17171b;
  border:1px solid #303038;
  border-radius:17px;
  box-shadow:0 10px 45px rgba(0,0,0,.35);
}

.attachments{
  display:none;
  gap:7px;
  flex-wrap:wrap;
  padding:10px 12px 0;
}

.attachment{
  border:1px solid var(--border);
  background:#101012;
  padding:5px 8px;
  border-radius:7px;
  font-size:10px;
  color:#bbb;
}

.composer-row{
  display:flex;
  align-items:flex-end;
  gap:8px;
  padding:10px;
}

textarea{
  flex:1;
  min-height:43px;
  max-height:180px;
  resize:none;
  border:0;
  outline:0;
  background:transparent;
  color:#fff;
  padding:9px 5px;
  line-height:1.45;
}

textarea::placeholder{
  color:#66666e;
}

.attach-btn,
.send-btn,
.stop-btn{
  width:38px;
  height:38px;
  border-radius:10px;
  border:1px solid var(--border);
  background:#202024;
  color:#eee;
  display:grid;
  place-items:center;
  flex:0 0 auto;
}

.send-btn{
  background:#fff;
  color:#000;
  border-color:#fff;
}

.stop-btn{
  background:#2a1717;
  color:#ffb0b0;
  display:none;
}

.bottom-info{
  text-align:center;
  color:#55555d;
  font-size:10px;
  margin-top:7px;
}

/* OVERLAY */

.overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  z-index:15;
  display:none;
}

.overlay.show{
  display:block;
}

/* MODAL */

.modal{
  position:fixed;
  inset:0;
  z-index:30;
  display:none;
  place-items:center;
  padding:20px;
  background:rgba(0,0,0,.65);
}

.modal.show{
  display:grid;
}

.modal-box{
  width:min(700px,100%);
  max-height:85vh;
  overflow:auto;
  background:#151519;
  border:1px solid var(--border);
  border-radius:16px;
  padding:18px;
}

.modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:15px;
}

.modal-title{
  font-weight:700;
}

.close{
  border:0;
  background:transparent;
  color:#aaa;
  font-size:20px;
}

.image-form{
  display:grid;
  gap:12px;
}

.image-form textarea,
.image-form select{
  width:100%;
  border:1px solid var(--border);
  border-radius:10px;
  background:#0f0f12;
  color:#fff;
  padding:10px;
}

.generate{
  border:0;
  border-radius:10px;
  background:#fff;
  color:#000;
  padding:11px;
  font-weight:700;
}

.image-result{
  margin-top:15px;
}

.image-result img{
  width:100%;
  max-height:500px;
  object-fit:contain;
  border-radius:12px;
  border:1px solid var(--border);
}

.status{
  color:#85858d;
  font-size:11px;
}

/* MOBILE */

@media(max-width:760px){
  .sidebar{
    position:fixed;
    left:-290px;
    top:0;
    transition:left .2s ease;
    box-shadow:15px 0 40px rgba(0,0,0,.35);
  }

  .sidebar.open{
    left:0;
  }

  .menu{
    display:block;
    border:1px solid var(--border);
    background:#151519;
    color:#ddd;
    width:35px;
    height:35px;
    border-radius:9px;
  }

  .model-select{
    min-width:0;
    max-width:170px;
  }

  .model-info{
    display:none;
  }

  .council-btn{
    display:none;
  }

  .composer-area{
    left:0;
    padding:9px 10px 11px;
  }

  .messages{
    padding:20px 14px 135px;
  }

  .content{
    font-size:14px;
  }

  .topbar{
    padding:0 10px;
  }

  .top-actions{
    gap:5px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <div class="logo">A</div>
      <div>
        <div class="brand-title">AetherAI Studio</div>
        <div class="brand-sub">xKiro AI Gateway</div>
      </div>
    </div>

    <button class="new-chat" id="newChat">＋ New chat</button>

    <div class="history-label">History</div>
    <div class="history" id="history"></div>

    <div class="sidebar-footer">
      API key stays server-side.
    </div>
  </aside>

  <div class="overlay" id="overlay"></div>

  <main class="main">

    <header class="topbar">
      <button class="menu" id="menuBtn">☰</button>

      <div class="model-wrap">
        <select class="model-select" id="modelSelect">
          <option value="">Loading models...</option>
        </select>
        <div class="model-info" id="modelInfo"></div>
      </div>

      <div class="top-actions">
        <button class="council-btn" id="councilBtn">AI Council</button>
        <button class="icon-btn" id="imageBtn" title="Generate image">✦</button>
      </div>
    </header>

    <section class="chat" id="chat">
      <div class="messages" id="messages">

        <div class="empty" id="empty">
          <div class="empty-logo">A</div>
          <h1>How can I help?</h1>
          <p>Ask anything, research the web, analyze files, or generate an image.</p>
        </div>

      </div>
    </section>

    <div class="composer-area">
      <div class="composer">

        <div class="attachments" id="attachments"></div>

        <div class="composer-row">

          <input
            type="file"
            id="fileInput"
            hidden
            multiple
            accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.html,.css,.py,.java,.c,.cpp,.h,.hpp,.csv,.xml,.yaml,.yml,.sql,.sh,.png,.jpg,.jpeg,.webp,.gif"
          >

          <button class="attach-btn" id="attachBtn" title="Attach file">＋</button>

          <textarea
            id="input"
            rows="1"
            placeholder="Message AetherAI..."
          ></textarea>

          <button class="stop-btn" id="stopBtn" title="Stop">■</button>
          <button class="send-btn" id="sendBtn" title="Send">↑</button>

        </div>
      </div>

      <div class="bottom-info">
        AetherAI can make mistakes. Verify important information.
      </div>
    </div>

  </main>
</div>

<div class="modal" id="imageModal">
  <div class="modal-box">
    <div class="modal-head">
      <div class="modal-title">Generate image</div>
      <button class="close" id="imageClose">×</button>
    </div>

    <div class="image-form">

      <textarea
        id="imagePrompt"
        rows="5"
        placeholder="Describe the image you want..."
      ></textarea>

      <select id="imageModel">
        <option value="">Loading image models...</option>
      </select>

      <select id="imageSize">
        <option value="1024x1024">Square — 1024×1024</option>
        <option value="1792x1024">Landscape — 1792×1024</option>
        <option value="1024x1792">Portrait — 1024×1792</option>
      </select>

      <button class="generate" id="generateImage">Generate</button>

      <div class="status" id="imageStatus"></div>

      <div class="image-result" id="imageResult"></div>

    </div>
  </div>
</div>

<script>
"use strict";

const state = {
  messages: [],
  files: [],
  busy: false,
  controller: null,
  models: [],
  imageModels: [],
  conversationId: crypto.randomUUID()
};

const el = {
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  menuBtn: document.getElementById("menuBtn"),
  newChat: document.getElementById("newChat"),
  history: document.getElementById("history"),
  modelSelect: document.getElementById("modelSelect"),
  modelInfo: document.getElementById("modelInfo"),
  messages: document.getElementById("messages"),
  empty: document.getElementById("empty"),
  input: document.getElementById("input"),
  sendBtn: document.getElementById("sendBtn"),
  stopBtn: document.getElementById("stopBtn"),
  attachBtn: document.getElementById("attachBtn"),
  fileInput: document.getElementById("fileInput"),
  attachments: document.getElementById("attachments"),
  councilBtn: document.getElementById("councilBtn"),
  imageBtn: document.getElementById("imageBtn"),
  imageModal: document.getElementById("imageModal"),
  imageClose: document.getElementById("imageClose"),
  imagePrompt: document.getElementById("imagePrompt"),
  imageModel: document.getElementById("imageModel"),
  imageSize: document.getElementById("imageSize"),
  generateImage: document.getElementById("generateImage"),
  imageStatus: document.getElementById("imageStatus"),
  imageResult: document.getElementById("imageResult")
};

/* -----------------------------
   UI helpers
----------------------------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHtml(input) {
  let value = escapeHtml(input);

  value = value.replace(
    /```([\\s\\S]*?)```/g,
    function(_, code) {
      return "<pre><code>" + code.trim() + "</code></pre>";
    }
  );

  value = value.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
  );

  value = value.replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
  );

  value = value.replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
  );

  value = value.replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
  );

  value = value.replace(
    /^> (.*)$/gm,
    "<blockquote>$1</blockquote>"
  );

  value = value.replace(
    /^[-*] (.*)$/gm,
    "<li>$1</li>"
  );

  value = value.replace(
    /\\*\\*(.+?)\\*\\*/g,
    "<strong>$1</strong>"
  );

  value = value.replace(
    /\\*(.+?)\\*/g,
    "<em>$1</em>"
  );

  value = value.replace(
    /\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  value = value.replace(
    /(^|\\n)(?!<h\\d|<pre|<blockquote|<li)([^\\n]+)(?=\\n|$)/g,
    "$1<p>$2</p>"
  );

  value = value.replace(
    /(<li>.*<\\/li>)(?:\\s*<li>.*<\\/li>)*/gs,
    function(block) {
      return "<ul>" + block + "</ul>";
    }
  );

  value = value.replace(/<p><\\/p>/g, "");

  return value;
}

function scrollBottom() {
  requestAnimationFrame(function() {
    el.chat.scrollTop = el.chat.scrollHeight;
  });
}

function showSystemError(message) {
  addMessage("assistant", "⚠️ " + message);
}

function addMessage(role, content, extra) {
  extra = extra || {};

  el.empty.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "message " + role;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "A";

  const body = document.createElement("div");
  body.className = "content";

  body.innerHTML = markdownToHtml(content || "");

  if (extra.sources && extra.sources.length) {
    body.appendChild(renderSources(extra.sources));
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(body);

  el.messages.appendChild(wrapper);

  scrollBottom();

  return {
    wrapper,
    body
  };
}

function renderSources(sources) {
  const box = document.createElement("div");
  box.className = "sources";

  sources.slice(0, 10).forEach(function(source, index) {
    if (!source || !source.url) return;

    const a = document.createElement("a");
    a.className = "source";
    a.href = source.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const title = document.createElement("div");
    title.className = "source-title";
    title.textContent = "[" + (index + 1) + "] " + (source.title || source.url);

    const url = document.createElement("div");
    url.className = "source-url";
    url.textContent = source.url;

    a.appendChild(title);
    a.appendChild(url);
    box.appendChild(a);
  });

  return box;
}

/* -----------------------------
   History
----------------------------- */

function saveHistory() {
  try {
    const list = JSON.parse(localStorage.getItem("aether_history") || "[]");

    const firstUser = state.messages.find(function(m) {
      return m.role === "user";
    });

    if (!firstUser) return;

    const item = {
      id: state.conversationId,
      title: firstUser.content.slice(0, 80),
      messages: state.messages.slice(-40),
      updated: Date.now()
    };

    const filtered = list.filter(function(x) {
      return x.id !== state.conversationId;
    });

    filtered.unshift(item);

    localStorage.setItem(
      "aether_history",
      JSON.stringify(filtered.slice(0, 30))
    );

    renderHistory();
  } catch (_) {}
}

function renderHistory() {
  el.history.innerHTML = "";

  try {
    const list = JSON.parse(localStorage.getItem("aether_history") || "[]");

    list.forEach(function(item) {
      const button = document.createElement("button");
      button.className = "history-item";
      button.textContent = item.title || "New chat";

      button.onclick = function() {
        loadHistory(item);
        closeSidebar();
      };

      el.history.appendChild(button);
    });
  } catch (_) {}
}

function loadHistory(item) {
  state.conversationId = item.id;
  state.messages = Array.isArray(item.messages) ? item.messages : [];
  state.files = [];

  el.messages.innerHTML = "";

  if (!state.messages.length) {
    el.empty.style.display = "flex";
    el.messages.appendChild(el.empty);
    return;
  }

  state.messages.forEach(function(message) {
    addMessage(
      message.role,
      message.content,
      message.sources ? { sources: message.sources } : {}
    );
  });
}

function newChat() {
  if (state.busy) return;

  state.conversationId = crypto.randomUUID();
  state.messages = [];
  state.files = [];

  el.messages.innerHTML = "";
  el.messages.appendChild(el.empty);

  el.empty.style.display = "flex";

  renderAttachments();
  el.input.value = "";
  autoResize();
}

el.newChat.addEventListener("click", newChat);

/* -----------------------------
   Sidebar
----------------------------- */

function closeSidebar() {
  el.sidebar.classList.remove("open");
  el.overlay.classList.remove("show");
}

el.menuBtn.addEventListener("click", function() {
  el.sidebar.classList.add("open");
  el.overlay.classList.add("show");
});

el.overlay.addEventListener("click", closeSidebar);

/* -----------------------------
   Models
----------------------------- */

function modelScore(model) {
  let score = 0;

  const capabilities = model.capabilities || {};

  if (capabilities.reasoning) score += 40;
  if (capabilities.vision) score += 20;
  if (capabilities.tools) score += 10;

  const context = Number(model.context_length || 0);
  const output = Number(model.max_output_tokens || 0);

  score += Math.min(context / 10000, 30);
  score += Math.min(output / 5000, 20);

  const id = String(model.id || "").toLowerCase();

  if (id.includes("reason")) score += 5;
  if (id.includes("thinking")) score += 5;

  return score;
}

function populateModels(models) {
  state.models = models || [];

  el.modelSelect.innerHTML = "";

  if (!state.models.length) {
    el.modelSelect.innerHTML =
      '<option value="">No free models available</option>';
    el.modelInfo.textContent = "";
    return;
  }

  const sorted = state.models.slice().sort(function(a, b) {
    return modelScore(b) - modelScore(a);
  });

  sorted.forEach(function(model) {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.id;
    el.modelSelect.appendChild(option);
  });

  const saved = localStorage.getItem("aether_model");

  if (saved && state.models.some(function(m) {
    return m.id === saved;
  })) {
    el.modelSelect.value = saved;
  } else {
    el.modelSelect.value = sorted[0].id;
  }

  updateModelInfo();
}

function updateModelInfo() {
  const model = state.models.find(function(m) {
    return m.id === el.modelSelect.value;
  });

  if (!model) {
    el.modelInfo.textContent = "";
    return;
  }

  const caps = model.capabilities || {};
  const features = [];

  if (caps.reasoning) features.push("reasoning");
  if (caps.vision) features.push("vision");
  if (caps.tools) features.push("tools");

  el.modelInfo.textContent =
    features.length ? features.join(" · ") : "free model";
}

el.modelSelect.addEventListener("change", function() {
  localStorage.setItem("aether_model", el.modelSelect.value);
  updateModelInfo();
});

async function loadModels() {
  el.modelSelect.innerHTML =
    '<option value="">Loading models...</option>';

  try {
    const response = await fetch("/api/models", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data && data.error
          ? data.error.message || data.error
          : "Model catalog request failed"
      );
    }

    populateModels(data.models || []);

  } catch (error) {

    console.error(error);

    el.modelSelect.innerHTML =
      '<option value="">Retry model loading</option>';

    el.modelInfo.textContent = "Loading failed";

    el.modelSelect.onclick = function() {
      loadModels();
    };
  }
}

/* -----------------------------
   File attachments
----------------------------- */

el.attachBtn.addEventListener("click", function() {
  el.fileInput.click();
});

el.fileInput.addEventListener("change", async function() {

  const selected = Array.from(el.fileInput.files || []);

  for (const file of selected) {

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      showSystemError(
        "PDF files are not supported by this version. Upload extracted text instead."
      );
      continue;
    }

    if (file.size > 8 * 1024 * 1024) {
      showSystemError(
        file.name + " is too large. Maximum file size is 8 MB."
      );
      continue;
    }

    try {

      if (file.type.startsWith("image/")) {

        const dataUrl = await readFileAsDataURL(file);

        state.files.push({
          name: file.name,
          type: "image",
          mime: file.type,
          dataUrl: dataUrl
        });

      } else {

        const text = await file.text();

        state.files.push({
          name: file.name,
          type: "text",
          mime: file.type || "text/plain",
          text: text.slice(0, 250000)
        });

      }

    } catch (error) {
      showSystemError(
        "Could not read " + file.name + ": " + error.message
      );
    }
  }

  renderAttachments();
  el.fileInput.value = "";
});

function readFileAsDataURL(file) {
  return new Promise(function(resolve, reject) {

    const reader = new FileReader();

    reader.onload = function() {
      resolve(reader.result);
    };

    reader.onerror = function() {
      reject(new Error("File read failed"));
    };

    reader.readAsDataURL(file);
  });
}

function renderAttachments() {

  el.attachments.innerHTML = "";

  if (!state.files.length) {
    el.attachments.style.display = "none";
    return;
  }

  el.attachments.style.display = "flex";

  state.files.forEach(function(file, index) {

    const item = document.createElement("div");
    item.className = "attachment";

    item.textContent = file.name + " ×";

    item.title = "Remove";

    item.onclick = function() {
      state.files.splice(index, 1);
      renderAttachments();
    };

    el.attachments.appendChild(item);
  });
}

/* -----------------------------
   Input
----------------------------- */

function autoResize() {
  el.input.style.height = "auto";
  el.input.style.height =
    Math.min(el.input.scrollHeight, 180) + "px";
}

el.input.addEventListener("input", autoResize);

el.input.addEventListener("keydown", function(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.isComposing
  ) {
    event.preventDefault();
    sendMessage();
  }

});

/* -----------------------------
   Image detection
----------------------------- */

function looksLikeImageRequest(text) {

  const value = text.toLowerCase().trim();

  if (!value) return false;

  const patterns = [
    /^generate (an )?image/,
    /^create (an )?image/,
    /^make (an )?image/,
    /^draw (an )?image/,
    /^render (an )?image/,
    /^visualize/,
    /generate.*picture/,
    /create.*picture/,
    /make.*picture/,
    /generate.*wallpaper/,
    /create.*wallpaper/
  ];

  return patterns.some(function(pattern) {
    return pattern.test(value);
  });
}

/* -----------------------------
   Chat
----------------------------- */

function buildUserContent(text) {

  if (!state.files.length) {
    return text;
  }

  const parts = [];

  let fileContext = "";

  state.files.forEach(function(file) {

    if (file.type === "text") {

      fileContext +=
        "\\n\\n--- FILE: " +
        file.name +
        " ---\\n" +
        file.text +
        "\\n--- END FILE ---\\n";

    }

  });

  if (fileContext) {
    parts.push({
      type: "text",
      text:
        text +
        "\\n\\nThe user attached these text/code files. Use their contents when relevant:" +
        fileContext
    });
  } else {
    parts.push({
      type: "text",
      text: text
    });
  }

  state.files.forEach(function(file) {

    if (file.type === "image") {

      parts.push({
        type: "image_url",
        image_url: {
          url: file.dataUrl
        }
      });

    }

  });

  return parts;
}

function setBusy(value) {

  state.busy = value;

  el.sendBtn.style.display = value ? "none" : "grid";
  el.stopBtn.style.display = value ? "grid" : "none";

  el.input.disabled = value;

  if (!value) {
    el.input.disabled = false;
    el.input.focus();
  }
}

function stopGeneration() {

  if (state.controller) {
    state.controller.abort();
    state.controller = null;
  }

  setBusy(false);
}

el.stopBtn.addEventListener("click", stopGeneration);

async function sendMessage() {

  if (state.busy) return;

  const text = el.input.value.trim();

  if (!text) return;

  if (!el.modelSelect.value) {
    showSystemError("No model is selected.");
    return;
  }

  if (looksLikeImageRequest(text) && !state.files.length) {

    el.imageModal.classList.add("show");
    el.imagePrompt.value = text;

    await loadImageModels();

    return;
  }

  state.messages.push({
    role: "user",
    content: text
  });

  addMessage("user", text);

  el.input.value = "";
  autoResize();

  saveHistory();

  const userContent = buildUserContent(text);

  const payloadMessages = state.messages
    .slice(-20)
    .map(function(message, index, arr) {

      if (
        index === arr.length - 1 &&
        message.role === "user"
      ) {
        return {
          role: "user",
          content: userContent
        };
      }

      return {
        role: message.role,
        content: message.content
      };
    });

  const assistant = addMessage(
    "assistant",
    '<span class="typing">Thinking<span class="dot">...</span></span>'
  );

  setBusy(true);

  state.controller = new AbortController();

  try {

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: el.modelSelect.value,
        messages: payloadMessages,
        webSearch: true
      }),
      signal: state.controller.signal
    });

    if (!response.ok) {

      let data = null;

      try {
        data = await response.json();
      } catch (_) {}

      throw new Error(
        data &&
        data.error &&
        data.error.message
          ? data.error.message
          : "Chat request failed with HTTP " + response.status
      );
    }

    if (!response.body) {
      throw new Error("Streaming response is not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let fullText = "";
    let sources = [];

    assistant.body.innerHTML = "";

    while (true) {

      const result = await reader.read();

      if (result.done) break;

      buffer += decoder.decode(result.value, {
        stream: true
      });

      const events = buffer.split("\\n\\n");

      buffer = events.pop() || "";

      for (const event of events) {

        const lines = event.split("\\n");

        for (const line of lines) {

          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trim();

          if (!data) continue;

          if (data === "[DONE]") continue;

          let chunk;

          try {
            chunk = JSON.parse(data);
          } catch (_) {
            continue;
          }

          if (chunk.type === "meta") {

            if (
              chunk.web_search &&
              Array.isArray(chunk.web_search.results)
            ) {
              sources = chunk.web_search.results;
            }

            continue;
          }

          if (chunk.type === "error") {
            throw new Error(
              chunk.error &&
              chunk.error.message
                ? chunk.error.message
                : "Upstream error"
            );
          }

          const delta =
            chunk.choices &&
            chunk.choices[0] &&
            chunk.choices[0].delta
              ? chunk.choices[0].delta.content
              : "";

          if (delta) {

            fullText += delta;

            assistant.body.innerHTML =
              markdownToHtml(fullText);

            scrollBottom();
          }

        }
      }
    }

    if (!fullText) {
      fullText = "No response was returned.";
      assistant.body.innerHTML = markdownToHtml(fullText);
    }

    if (sources.length) {
      assistant.body.appendChild(renderSources(sources));
    }

    state.messages.push({
      role: "assistant",
      content: fullText,
      sources: sources
    });

    saveHistory();

  } catch (error) {

    if (error.name === "AbortError") {

      if (!assistant.body.textContent.trim()) {
        assistant.body.innerHTML =
          "<p>Generation stopped.</p>";
      }

    } else {

      assistant.body.innerHTML =
        markdownToHtml(
          "⚠️ " + (error.message || "Unknown error")
        );
    }

  } finally {

    state.controller = null;
    setBusy(false);

  }
}

/* -----------------------------
   AI Council
----------------------------- */

el.councilBtn.addEventListener("click", function() {

  if (state.busy) return;

  const text = el.input.value.trim();

  if (!text) {
    showSystemError("Enter a question first.");
    el.input.focus();
    return;
  }

  runCouncil(text);
});

async function runCouncil(text) {

  state.messages.push({
    role: "user",
    content: text
  });

  addMessage("user", text);

  el.input.value = "";
  autoResize();

  const assistant = addMessage(
    "assistant",
    '<span class="typing">AI Council is consulting multiple models<span class="dot">...</span></span>'
  );

  setBusy(true);

  try {

    const response = await fetch("/api/council", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: text,
        webSearch: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data &&
        data.error &&
        data.error.message
          ? data.error.message
          : "Council request failed"
      );
    }

    assistant.body.innerHTML =
      markdownToHtml(data.answer || "No council answer.");

    if (
      data.sources &&
      Array.isArray(data.sources) &&
      data.sources.length
    ) {
      assistant.body.appendChild(
        renderSources(data.sources)
      );
    }

    state.messages.push({
      role: "assistant",
      content: data.answer || "",
      sources: data.sources || []
    });

    saveHistory();

  } catch (error) {

    assistant.body.innerHTML =
      markdownToHtml(
        "⚠️ " + (error.message || "Council failed.")
      );

  } finally {

    setBusy(false);

  }
}

/* -----------------------------
   Images
----------------------------- */

el.imageBtn.addEventListener("click", async function() {

  if (state.busy) return;

  el.imageModal.classList.add("show");

  await loadImageModels();

});

el.imageClose.addEventListener("click", function() {
  el.imageModal.classList.remove("show");
});

el.imageModal.addEventListener("click", function(event) {

  if (event.target === el.imageModal) {
    el.imageModal.classList.remove("show");
  }

});

async function loadImageModels() {

  el.imageModel.innerHTML =
    '<option value="">Loading image models...</option>';

  try {

    const response = await fetch("/api/image-models");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data &&
        data.error
          ? data.error.message || data.error
          : "Could not load image models"
      );
    }

    state.imageModels = data.models || [];

    el.imageModel.innerHTML = "";

    if (!state.imageModels.length) {

      el.imageModel.innerHTML =
        '<option value="">No image models available</option>';

      return;
    }

    state.imageModels.forEach(function(model) {

      const option = document.createElement("option");

      option.value = model.id;
      option.textContent =
        model.id +
        (model.access_tier
          ? " — " + model.access_tier
          : "");

      el.imageModel.appendChild(option);

    });

  } catch (error) {

    el.imageModel.innerHTML =
      '<option value="">Image model loading failed</option>';

    el.imageStatus.textContent = error.message;

  }
}

el.generateImage.addEventListener("click", generateImage);

async function generateImage() {

  const prompt = el.imagePrompt.value.trim();
  const model = el.imageModel.value;
  const size = el.imageSize.value;

  if (!prompt) {
    el.imageStatus.textContent =
      "Enter an image prompt.";
    return;
  }

  if (!model) {
    el.imageStatus.textContent =
      "No image model is available.";
    return;
  }

  el.generateImage.disabled = true;
  el.imageStatus.textContent =
    "Submitting image job...";
  el.imageResult.innerHTML = "";

  try {

    const response = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model,
        size: size
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data &&
        data.error &&
        data.error.message
          ? data.error.message
          : "Image request failed"
      );
    }

    const jobId = data.jobId;

    if (!jobId) {
      throw new Error("Image job ID was not returned.");
    }

    await pollImageJob(jobId);

  } catch (error) {

    el.imageStatus.textContent =
      "Error: " + error.message;

  } finally {

    el.generateImage.disabled = false;

  }
}

async function pollImageJob(jobId) {

  let delay = 1500;

  for (let attempt = 0; attempt < 120; attempt++) {

    await new Promise(function(resolve) {
      setTimeout(resolve, delay);
    });

    const response = await fetch(
      "/api/image/status?id=" +
      encodeURIComponent(jobId)
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data &&
        data.error &&
        data.error.message
          ? data.error.message
          : "Could not retrieve image job"
      );

    }

    if (data.status === "processing") {

      el.imageStatus.textContent =
        "Generating image... " +
        Math.round((attempt + 1) * 100 / 120) +
        "%";

      delay = Math.min(
        Math.round(delay * 1.25),
        8000
      );

      continue;
    }

    if (data.status === "succeeded") {

      el.imageStatus.textContent =
        "Image generated.";

      el.imageResult.innerHTML = "";

      const urls =
        Array.isArray(data.data)
          ? data.data
          : [];

      urls.forEach(function(url) {

        if (!url || !url.url) return;

        const img = document.createElement("img");
        img.src = url.url;
        img.alt = "Generated image";
        img.loading = "lazy";

        el.imageResult.appendChild(img);

      });

      return;
    }

    if (
      data.status === "failed" ||
      data.status === "blocked"
    ) {

      throw new Error(
        data.error &&
        data.error.message
          ? data.error.message
          : "Image generation " + data.status
      );
    }

  }

  throw new Error(
    "Image generation timed out while waiting for the job."
  );
}

/* -----------------------------
   Startup
----------------------------- */

renderHistory();
loadModels();
autoResize();

</script>
</body>
</html>`;

const MODEL_CACHE = {
  chat: null,
  image: null,
  chatExpires: 0,
  imageExpires: 0
};

const CACHE_TTL = 5 * 60 * 1000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {

      if (request.method === "GET" && url.pathname === "/") {
        return new Response(HTML, {
          status: 200,
          headers: {
            "content-type": "text/html; charset=UTF-8",
            "cache-control": "no-store"
          }
        });
      }

      if (request.method === "GET" && url.pathname === "/api/models") {
        return await handleModels(env);
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/image-models"
      ) {
        return await handleImageModels(env);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/chat"
      ) {
        return await handleChat(request, env);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/council"
      ) {
        return await handleCouncil(request, env);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/image"
      ) {
        return await handleImage(request, env);
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/image/status"
      ) {
        return await handleImageStatus(request, env);
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/health"
      ) {
        return await handleHealth(env);
      }

      return json({
        error: {
          message: "Not found"
        }
      }, 404);

    } catch (error) {

      console.error("Worker error:", error);

      return json({
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Internal server error"
        }
      }, 500);
    }
  }
};

/* =========================================================
   CONFIG
========================================================= */

function getBaseUrl(env) {
  return (
    env.XKIRO_BASE_URL ||
    "https://api.xkiro.com/v1"
  ).replace(/\/+$/, "");
}

function getApiKey(env) {
  return env.XKIRO_API_KEY || "";
}

/* =========================================================
   MODEL CATALOG
========================================================= */

async function listModels(env, modality) {

  const suffix =
    modality
      ? "?modality=" +
        encodeURIComponent(modality)
      : "";

  const response = await fetch(
    getBaseUrl(env) +
    "/models" +
    suffix,
    {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    }
  );

  const data = await readJsonSafe(response);

  if (!response.ok) {

    throw new Error(
      upstreamError(
        data,
        response.status
      ).error.message
    );
  }

  return Array.isArray(data.data)
    ? data.data
    : [];
}

function isFreeModel(model) {

  return (
    String(model.access_tier || "")
      .toLowerCase() === "free"
  );
}

async function getFreeModels(env) {

  const now = Date.now();

  if (
    MODEL_CACHE.chat &&
    MODEL_CACHE.chatExpires > now
  ) {
    return MODEL_CACHE.chat;
  }

  const models = await listModels(env, "chat");

  const free = models
    .filter(isFreeModel)
    .filter(function(model) {
      return model.modality === "chat" ||
        !model.modality;
    });

  MODEL_CACHE.chat = free;
  MODEL_CACHE.chatExpires =
    now + CACHE_TTL;

  return free;
}

async function getFreeImageModels(env) {

  const now = Date.now();

  if (
    MODEL_CACHE.image &&
    MODEL_CACHE.imageExpires > now
  ) {
    return MODEL_CACHE.image;
  }

  const models = await listModels(
    env,
    "image"
  );

  const free = models.filter(isFreeModel);

  MODEL_CACHE.image = free;
  MODEL_CACHE.imageExpires =
    now + CACHE_TTL;

  return free;
}

/* =========================================================
   MODELS ENDPOINT
========================================================= */

async function handleModels(env) {

  try {

    const models =
      await getFreeModels(env);

    return json({
      models: models
    });

  } catch (error) {

    return json({
      error: {
        message: error.message
      }
    }, 502);
  }
}

async function handleImageModels(env) {

  try {

    const models =
      await getFreeImageModels(env);

    return json({
      models: models
    });

  } catch (error) {

    return json({
      error: {
        message: error.message
      }
    }, 502);
  }
}

/* =========================================================
   CHAT
========================================================= */

async function handleChat(request, env) {

  const apiKey = getApiKey(env);

  if (!apiKey) {
    return json({
      error: {
        message:
          "XKIRO_API_KEY is not configured on the Worker."
      }
    }, 500);
  }

  const body = await readJsonRequest(request);

  const requestedModel =
    typeof body.model === "string"
      ? body.model.trim()
      : "";

  const messages =
    Array.isArray(body.messages)
      ? body.messages
      : [];

  if (!requestedModel) {
    return json({
      error: {
        message: "A model is required."
      }
    }, 400);
  }

  if (!messages.length) {
    return json({
      error: {
        message: "At least one message is required."
      }
    }, 400);
  }

  const freeModels =
    await getFreeModels(env);

  const allowed =
    freeModels.find(function(model) {
      return model.id === requestedModel;
    });

  if (!allowed) {

    return json({
      error: {
        message:
          "Selected model is not available in the current free model catalog."
      }
    }, 400);
  }

  const payload = {
    model: requestedModel,
    messages: messages.slice(-30),
    stream: true,

    web_search: {
      enable: body.webSearch !== false,
      count: 5
    }
  };

  const capabilities =
    allowed.capabilities || {};

  if (
    capabilities.reasoning &&
    Array.isArray(allowed.reasoning_efforts) &&
    allowed.reasoning_efforts.includes("medium")
  ) {
    payload.reasoning_effort = "medium";
  }

  const response =
    await xkiroFetch(
      env,
      "/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(payload),
        stream: true
      }
    );

  if (!response.ok) {

    const data =
      await readJsonSafe(response);

    return json(
      upstreamError(
        data,
        response.status
      ),
      response.status
    );
  }

  return transformChatStream(response);
}

/* =========================================================
   STREAM TRANSFORM
========================================================= */

function transformChatStream(upstream) {

  const reader =
    upstream.body.getReader();

  const encoder =
    new TextEncoder();

  const decoder =
    new TextDecoder();

  let buffer = "";

  const stream =
    new ReadableStream({
      async start(controller) {

        try {

          while (true) {

            const result =
              await reader.read();

            if (result.done) {
              break;
            }

            buffer +=
              decoder.decode(
                result.value,
                { stream: true }
              );

            const events =
              buffer.split("\n\n");

            buffer =
              events.pop() || "";

            for (const event of events) {

              const lines =
                event.split("\n");

              for (const line of lines) {

                if (!line.startsWith("data:")) {
                  continue;
                }

                const raw =
                  line.slice(5).trim();

                if (!raw) continue;

                if (raw === "[DONE]") {

                  controller.enqueue(
                    encoder.encode(
                      "data: [DONE]\n\n"
                    )
                  );

                  continue;
                }

                let chunk;

                try {
                  chunk =
                    JSON.parse(raw);
                } catch (_) {
                  continue;
                }

                if (
                  chunk.web_search &&
                  Array.isArray(
                    chunk.web_search.results
                  )
                ) {

                  controller.enqueue(
                    encoder.encode(
                      "data: " +
                      JSON.stringify({
                        type: "meta",
                        web_search:
                          chunk.web_search
                      }) +
                      "\n\n"
                    )
                  );
                }

                const choices =
                  Array.isArray(chunk.choices)
                    ? chunk.choices
                    : [];

                if (choices.length) {

                  controller.enqueue(
                    encoder.encode(
                      "data: " +
                      JSON.stringify({
                        choices: choices
                      }) +
                      "\n\n"
                    )
                  );
                }
              }
            }
          }

          controller.enqueue(
            encoder.encode(
              "data: [DONE]\n\n"
            )
          );

          controller.close();

        } catch (error) {

          controller.enqueue(
            encoder.encode(
              "data: " +
              JSON.stringify({
                type: "error",
                error: {
                  message:
                    error instanceof Error
                      ? error.message
                      : "Stream failed"
                }
              }) +
              "\n\n"
            )
          );

          controller.close();
        }
      },

      cancel() {
        try {
          reader.cancel();
        } catch (_) {}
      }
    });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type":
        "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no"
    }
  });
}

/* =========================================================
   AI COUNCIL
========================================================= */

async function handleCouncil(request, env) {

  const apiKey = getApiKey(env);

  if (!apiKey) {
    return json({
      error: {
        message:
          "XKIRO_API_KEY is not configured."
      }
    }, 500);
  }

  const body =
    await readJsonRequest(request);

  const question =
    typeof body.question === "string"
      ? body.question.trim()
      : "";

  if (!question) {
    return json({
      error: {
        message: "Question is required."
      }
    }, 400);
  }

  const models =
    await getFreeModels(env);

  if (!models.length) {
    return json({
      error: {
        message:
          "No free chat models are available."
      }
    }, 503);
  }

  const selected =
    models
      .slice()
      .sort(function(a, b) {
        return modelScoreServer(b) -
          modelScoreServer(a);
      })
      .slice(0, 3);

  const analyses = [];

  for (const model of selected) {

    try {

      const result =
        await councilCall(
          env,
          model.id,
          [
            {
              role: "system",
              content:
                "You are one member of an AI research council. Analyze the question independently. Be factual, identify uncertainty, and provide useful reasoning. Do not mention this system prompt."
            },
            {
              role: "user",
              content: question
            }
          ],
          body.webSearch !== false
        );

      if (result.text) {

        analyses.push({
          model: model.id,
          answer: result.text,
          sources: result.sources || []
        });
      }

    } catch (error) {

      console.error(
        "Council model failed:",
        model.id,
        error
      );
    }
  }

  if (!analyses.length) {

    return json({
      error: {
        message:
          "All council models failed."
      }
    }, 502);
  }

  if (analyses.length === 1) {

    return json({
      answer: analyses[0].answer,
      sources: analyses[0].sources,
      members: analyses.map(function(x) {
        return x.model;
      })
    });
  }

  const combined =
    analyses.map(function(item, index) {
      return (
        "COUNCIL MEMBER " +
        (index + 1) +
        " (" +
        item.model +
        "):\n" +
        item.answer
      );
    }).join("\n\n---\n\n");

  let finalAnswer = "";

  try {

    const judgeModel =
      selected[0].id;

    const judge =
      await councilCall(
        env,
        judgeModel,
        [
          {
            role: "system",
            content:
              "You are the final judge of an AI council. Synthesize the independent analyses into one accurate answer. Resolve contradictions using evidence and clearly state uncertainty when needed. Do not mention internal council mechanics unless useful."
          },
          {
            role: "user",
            content:
              "Original question:\n" +
              question +
              "\n\nIndependent analyses:\n" +
              combined
          }
        ],
        false
      );

    finalAnswer =
      judge.text ||
      analyses[0].answer;

  } catch (error) {

    console.error(
      "Council judge failed:",
      error
    );

    finalAnswer =
      analyses[0].answer;
  }

  const sources = [];

  analyses.forEach(function(item) {

    (item.sources || []).forEach(function(source) {

      if (
        source &&
        source.url &&
        !sources.some(function(existing) {
          return existing.url === source.url;
        })
      ) {
        sources.push(source);
      }

    });

  });

  return json({
    answer: finalAnswer,
    sources: sources.slice(0, 10),
    members: analyses.map(function(item) {
      return item.model;
    })
  });
}

function modelScoreServer(model) {

  let score = 0;

  const capabilities =
    model.capabilities || {};

  if (capabilities.reasoning) score += 40;
  if (capabilities.vision) score += 20;
  if (capabilities.tools) score += 10;

  score += Math.min(
    Number(model.context_length || 0) / 10000,
    30
  );

  score += Math.min(
    Number(model.max_output_tokens || 0) / 5000,
    20
  );

  return score;
}

async function councilCall(
  env,
  model,
  messages,
  useWebSearch
) {

  const payload = {
    model: model,
    messages: messages,
    stream: false
  };

  if (useWebSearch) {

    payload.web_search = {
      enable: true,
      count: 5
    };
  }

  const response =
    await xkiroFetch(
      env,
      "/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(payload),
        timeoutMs: 90000
      }
    );

  const data =
    await readJsonSafe(response);

  if (!response.ok) {

    throw new Error(
      upstreamError(
        data,
        response.status
      ).error.message
    );
  }

  const choice =
    data.choices &&
    data.choices[0];

  const text =
    choice &&
    choice.message &&
    typeof choice.message.content === "string"
      ? choice.message.content
      : "";

  return {
    text: text,
    sources:
      data.web_search &&
      Array.isArray(
        data.web_search.results
      )
        ? data.web_search.results
        : []
  };
}

/* =========================================================
   IMAGE GENERATION
========================================================= */

async function handleImage(request, env) {

  const apiKey = getApiKey(env);

  if (!apiKey) {

    return json({
      error: {
        message:
          "XKIRO_API_KEY is not configured."
      }
    }, 500);
  }

  const body =
    await readJsonRequest(request);

  const prompt =
    typeof body.prompt === "string"
      ? body.prompt.trim()
      : "";

  const model =
    typeof body.model === "string"
      ? body.model.trim()
      : "";

  const size =
    typeof body.size === "string"
      ? body.size
      : "1024x1024";

  if (!prompt) {

    return json({
      error: {
        message: "Image prompt is required."
      }
    }, 400);
  }

  if (!model) {

    return json({
      error: {
        message: "Image model is required."
      }
    }, 400);
  }

  const imageModels =
    await getFreeImageModels(env);

  const allowed =
    imageModels.find(function(item) {
      return item.id === model;
    });

  if (!allowed) {

    return json({
      error: {
        message:
          "Selected image model is not available in the free catalog."
      }
    }, 400);
  }

  const payload = {
    model: model,
    prompt: prompt,
    n: 1,
    size: size
  };

  const response =
    await xkiroFetch(
      env,
      "/images/generations",
      {
        method: "POST",
        body: JSON.stringify(payload),
        timeoutMs: 30000
      }
    );

  const data =
    await readJsonSafe(response);

  if (!response.ok) {

    return json(
      upstreamError(
        data,
        response.status
      ),
      response.status
    );
  }

  return json({
    jobId: data.id,
    status: data.status || "processing",
    model: data.model || model
  }, response.status || 202);
}

async function handleImageStatus(
  request,
  env
) {

  const apiKey = getApiKey(env);

  if (!apiKey) {

    return json({
      error: {
        message:
          "XKIRO_API_KEY is not configured."
      }
    }, 500);
  }

  const url =
    new URL(request.url);

  const id =
    url.searchParams.get("id");

  if (!id) {

    return json({
      error: {
        message: "Image job id is required."
      }
    }, 400);
  }

  if (!/^[A-Za-z0-9_-]{8,200}$/.test(id)) {

    return json({
      error: {
        message: "Invalid image job id."
      }
    }, 400);
  }

  const response =
    await xkiroFetch(
      env,
      "/images/generations/" +
        encodeURIComponent(id),
      {
        method: "GET",
        timeoutMs: 30000
      }
    );

  const data =
    await readJsonSafe(response);

  if (!response.ok) {

    return json(
      upstreamError(
        data,
        response.status
      ),
      response.status
    );
  }

  return json({
    id: data.id,
    status: data.status,
    model: data.model,
    data: Array.isArray(data.data)
      ? data.data
      : [],
    error: data.error || null
  });
}

/* =========================================================
   HEALTH
========================================================= */

async function handleHealth(env) {

  let catalogOk = false;
  let freeModels = 0;
  let imageModels = 0;

  try {

    const models =
      await getFreeModels(env);

    catalogOk = true;
    freeModels = models.length;

  } catch (_) {}

  try {

    const models =
      await getFreeImageModels(env);

    imageModels = models.length;

  } catch (_) {}

  return json({
    ok: true,
    apiKeyConfigured:
      Boolean(getApiKey(env)),
    catalogOk: catalogOk,
    freeChatModels: freeModels,
    freeImageModels: imageModels
  });
}

/* =========================================================
   HTTP HELPERS
========================================================= */

async function xkiroFetch(
  env,
  path,
  options
) {

  options = options || {};

  const apiKey =
    getApiKey(env);

  if (!apiKey) {

    throw new Error(
      "XKIRO_API_KEY is not configured."
    );
  }

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    "Authorization",
    "Bearer " + apiKey
  );

  headers.set(
    "Accept",
    "application/json"
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const controller =
    new AbortController();

  const timeout =
    options.stream
      ? 30000
      : (options.timeoutMs || 90000);

  const timer =
    setTimeout(
      function() {
        controller.abort();
      },
      timeout
    );

  try {

    const response =
      await fetch(
        getBaseUrl(env) + path,
        {
          method:
            options.method || "GET",
          headers: headers,
          body:
            options.body || undefined,
          signal:
            options.signal || controller.signal
        }
      );

    /*
      For streaming responses the timeout only protects
      connection establishment. Once the headers arrive,
      the stream is allowed to continue.
    */
    clearTimeout(timer);

    return response;

  } catch (error) {

    clearTimeout(timer);

    if (error.name === "AbortError") {

      throw new Error(
        "xKiro request timed out."
      );
    }

    throw error;
  }
}

async function readJsonRequest(request) {

  let body;

  try {
    body = await request.json();
  } catch (_) {

    throw new Error(
      "Request body must be valid JSON."
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {

    throw new Error(
      "Request body must be a JSON object."
    );
  }

  return body;
}

async function readJsonSafe(response) {

  const text =
    await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (_) {
    return {
      error: {
        message: text.slice(0, 2000)
      }
    };
  }
}

function upstreamError(
  data,
  status
) {

  const message =
    data &&
    data.error &&
    typeof data.error === "object" &&
    data.error.message
      ? data.error.message
      : data &&
        typeof data.error === "string"
        ? data.error
        : data &&
          data.message
          ? data.message
          : "Upstream request failed.";

  return {
    error: {
      message:
        message +
        " (HTTP " +
        status +
        ")"
    }
  };
}

function json(data, status) {

  return new Response(
    JSON.stringify(data),
    {
      status: status || 200,
      headers: {
        "content-type":
          "application/json; charset=UTF-8",
        "cache-control": "no-store"
      }
    }
  );
}
