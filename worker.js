const DEFAULT_MODEL = "openai/gpt-5.6-sol";
const DEFAULT_IMAGE_MODEL = "sensenova/sensenova-u1.5-lite";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function withCors(response) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getApiKey(env) {
  return env.XKIRO_API_KEY || "";
}

function getBaseUrl(env) {
  return (env.XKIRO_BASE_URL || "https://api.xkiro.com/v1").replace(/\/+$/, "");
}

function getDefaultModel(env) {
  return env.DEFAULT_CHAT_MODEL || DEFAULT_MODEL;
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((m) => {
      return (
        m &&
        ["user", "assistant", "system"].includes(m.role) &&
        typeof m.content !== "undefined"
      );
    })
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));
}

function errorMessage(data, fallback) {
  return (
    data?.error?.message ||
    data?.message ||
    data?.error ||
    fallback
  );
}

/* =========================================================
   FRONTEND
========================================================= */

const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b0f">
<title>AetherAI</title>

<style>
* {
  box-sizing: border-box;
}

:root {
  --bg: #0b0b0f;
  --panel: #111116;
  --panel2: #17171d;
  --border: rgba(255,255,255,.09);
  --text: #f5f5f7;
  --muted: #9b9ba4;
  --accent: #8b7cff;
  --accent2: #6d5dfc;
  --user: #25252d;
  --danger: #ff5c68;
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

body {
  overflow: hidden;
}

button,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.app {
  width: 100%;
  height: 100dvh;
  display: flex;
  overflow: hidden;
}

/* ================= SIDEBAR ================= */

.sidebar {
  width: 275px;
  background: #0d0d11;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: transform .22s ease;
  z-index: 50;
}

.brand {
  padding: 20px 18px 14px;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -.5px;
}

.brand span {
  color: var(--accent);
}

.new-chat {
  margin: 4px 12px 14px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  border-radius: 11px;
  padding: 11px 13px;
  text-align: left;
}

.new-chat:hover {
  background: var(--panel2);
}

.history {
  flex: 1;
  overflow-y: auto;
  padding: 5px 10px;
}

.history-title {
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 8px;
}

.chat-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: #dddde4;
  padding: 10px;
  border-radius: 9px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item:hover,
.chat-item.active {
  background: rgba(255,255,255,.07);
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
}

/* ================= MAIN ================= */

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.topbar {
  height: 62px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: rgba(11,11,15,.92);
  backdrop-filter: blur(15px);
  z-index: 20;
}

.menu-btn {
  display: none;
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: white;
  border-radius: 9px;
}

.model-wrap {
  position: relative;
}

.model-select {
  min-width: 220px;
  max-width: 360px;
  padding: 9px 34px 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  outline: none;
}

.model-select:focus {
  border-color: rgba(139,124,255,.7);
}

.top-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: #ddd;
  border-radius: 9px;
}

.icon-btn:hover {
  background: var(--panel2);
}

.search-active {
  border-color: var(--accent);
  color: #bcb4ff;
}

/* ================= CHAT ================= */

.chat {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-inner {
  width: min(900px, calc(100% - 30px));
  margin: 0 auto;
  padding: 30px 0 170px;
}

.welcome {
  min-height: calc(100dvh - 250px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-box {
  max-width: 650px;
}

.welcome h1 {
  font-size: clamp(32px, 5vw, 52px);
  margin: 0 0 12px;
  letter-spacing: -1.8px;
}

.welcome p {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
}

/* ================= MESSAGE ================= */

.message {
  display: flex;
  gap: 13px;
  margin: 0 0 28px;
  animation: appear .18s ease;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.avatar {
  flex: 0 0 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 750;
  background: var(--panel2);
  border: 1px solid var(--border);
}

.message.user .avatar {
  background: #25252d;
}

.message-body {
  min-width: 0;
  flex: 1;
}

.message-role {
  font-size: 12px;
  color: var(--muted);
  margin: 0 0 5px;
}

.message-content {
  line-height: 1.65;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.message.user .message-content {
  display: inline-block;
  background: var(--user);
  padding: 10px 13px;
  border-radius: 12px;
}

.message-actions {
  display: flex;
  gap: 5px;
  margin-top: 8px;
  opacity: .72;
}

.message-actions button {
  border: 0;
  background: transparent;
  color: var(--muted);
  padding: 5px 7px;
  border-radius: 7px;
  font-size: 12px;
}

.message-actions button:hover {
  background: var(--panel2);
  color: white;
}

.copy-ok {
  color: #75e09b !important;
}

pre {
  background: #08080b;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  overflow-x: auto;
  position: relative;
}

code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
}

p {
  margin: 0 0 12px;
}

p:last-child {
  margin-bottom: 0;
}

strong {
  color: white;
}

a {
  color: #a99fff;
}

.generated-image {
  max-width: min(100%, 760px);
  border-radius: 14px;
  border: 1px solid var(--border);
  display: block;
  margin-top: 8px;
}

.image-loading {
  width: min(100%, 500px);
  height: 300px;
  border-radius: 14px;
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
  background:
    linear-gradient(
      110deg,
      #111116 25%,
      #1b1b22 37%,
      #111116 63%
    );
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  color: var(--muted);
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ================= COMPOSER ================= */

.composer-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px 15px 14px;
  background:
    linear-gradient(
      transparent,
      rgba(11,11,15,.95) 35%
    );
  z-index: 15;
}

.composer {
  width: min(900px, 100%);
  margin: 0 auto;
  border: 1px solid var(--border);
  background: #15151b;
  border-radius: 17px;
  box-shadow: 0 10px 50px rgba(0,0,0,.3);
  overflow: hidden;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 9px 0;
}

.tool {
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.tool:hover,
.tool.active {
  background: rgba(255,255,255,.07);
  color: white;
}

.composer-main {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
}

.prompt {
  flex: 1;
  resize: none;
  min-height: 48px;
  max-height: 180px;
  border: 0;
  outline: 0;
  background: transparent;
  color: white;
  padding: 11px;
  line-height: 1.5;
}

.prompt::placeholder {
  color: #777780;
}

.send {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 11px;
  background: var(--accent);
  color: white;
  font-weight: 700;
}

.send:hover {
  background: var(--accent2);
}

.send:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.composer-status {
  padding: 0 12px 8px;
  font-size: 11px;
  color: var(--muted);
}

/* ================= MODALS / MENUS ================= */

.model-panel {
  position: absolute;
  top: 54px;
  left: 0;
  width: min(400px, calc(100vw - 30px));
  max-height: 550px;
  overflow: hidden;
  background: #141419;
  border: 1px solid var(--border);
  border-radius: 13px;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
  display: none;
  z-index: 100;
}

.model-panel.open {
  display: block;
}

.model-search {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--border);
  outline: 0;
  padding: 12px;
  background: transparent;
  color: white;
}

.model-filters {
  display: flex;
  gap: 6px;
  padding: 9px;
  border-bottom: 1px solid var(--border);
}

.filter-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 11px;
}

.filter-btn.active {
  color: white;
  background: rgba(139,124,255,.16);
  border-color: rgba(139,124,255,.4);
}

.model-list {
  max-height: 440px;
  overflow-y: auto;
  padding: 7px;
}

.model-option {
  width: 100%;
  border: 0;
  background: transparent;
  color: white;
  padding: 10px;
  border-radius: 9px;
  text-align: left;
}

.model-option:hover,
.model-option.selected {
  background: rgba(255,255,255,.07);
}

.model-name {
  font-size: 13px;
  font-weight: 600;
}

.model-id {
  color: var(--muted);
  font-size: 10px;
  margin-top: 3px;
}

.tier {
  float: right;
  font-size: 9px;
  padding: 3px 5px;
  border-radius: 5px;
  background: rgba(117,224,155,.12);
  color: #75e09b;
}

/* ================= RESPONSIVE ================= */

@media (max-width: 760px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    transform: translateX(-100%);
    box-shadow: 20px 0 60px rgba(0,0,0,.4);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-btn {
    display: block;
  }

  .model-select {
    min-width: 0;
    width: 165px;
    max-width: 165px;
  }

  .chat-inner {
    width: calc(100% - 22px);
    padding-top: 22px;
  }

  .topbar {
    padding: 0 9px;
  }

  .top-actions {
    gap: 4px;
  }

  .icon-btn {
    width: 35px;
    height: 35px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar" id="sidebar">
    <div class="brand">Aether<span>AI</span></div>

    <button class="new-chat" id="newChat">
      ＋ New chat
    </button>

    <div class="history">
      <div class="history-title">Recent chats</div>
      <div id="historyList"></div>
    </div>

    <div class="sidebar-footer">
      Powered by xKiro
    </div>
  </aside>

  <main class="main">

    <header class="topbar">

      <button class="menu-btn" id="menuBtn">☰</button>

      <div class="model-wrap">

        <button class="model-select" id="modelButton">
          Loading models...
        </button>

        <div class="model-panel" id="modelPanel">

          <input
            class="model-search"
            id="modelSearch"
            placeholder="Search models..."
          >

          <div class="model-filters">
            <button class="filter-btn active" data-filter="free">
              Free
            </button>

            <button class="filter-btn" data-filter="all">
              All
            </button>
          </div>

          <div class="model-list" id="modelList"></div>

        </div>
      </div>

      <div class="top-actions">

        <button
          class="icon-btn"
          id="webSearchBtn"
          title="Web search"
        >
          ◉
        </button>

        <button
          class="icon-btn"
          id="clearBtn"
          title="Clear current chat"
        >
          ×
        </button>

      </div>

    </header>

    <section class="chat" id="chat">
      <div class="chat-inner" id="chatInner"></div>
    </section>

    <div class="composer-area">

      <div class="composer">

        <div class="composer-tools">

          <button class="tool" id="imageBtn">
            ✦ Image
          </button>

          <button class="tool" id="normalBtn">
            Text
          </button>

          <span
            id="modeStatus"
            style="font-size:11px;color:#777;margin-left:auto;padding:6px"
          >
            Text mode
          </span>

        </div>

        <div class="composer-main">

          <textarea
            id="prompt"
            class="prompt"
            rows="1"
            placeholder="Message AetherAI..."
          ></textarea>

          <button
            class="send"
            id="send"
            title="Send"
          >
            ↑
          </button>

        </div>

        <div class="composer-status" id="composerStatus">
          Select a model and start chatting.
        </div>

      </div>

    </div>

  </main>

</div>

<script>
(() => {
  "use strict";

  /* =======================================================
     STATE
  ======================================================= */

  const STORAGE_CHATS = "aetherai_chats_v3";
  const STORAGE_ACTIVE = "aetherai_active_v3";
  const STORAGE_MODEL = "aetherai_model_v3";

  let models = [];
  let imageModels = [];

  let selectedModel =
    localStorage.getItem(STORAGE_MODEL) || "";

  let activeChatId =
    localStorage.getItem(STORAGE_ACTIVE) || "";

  let chats = loadChats();

  let webSearch = false;
  let imageMode = false;
  let generating = false;
  let modelFilter = "free";

  const $ = (id) => document.getElementById(id);

  /* =======================================================
     STORAGE
  ======================================================= */

  function loadChats() {
    try {
      const raw = localStorage.getItem(STORAGE_CHATS);
      if (!raw) return [];

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveChats() {
    localStorage.setItem(
      STORAGE_CHATS,
      JSON.stringify(chats)
    );

    localStorage.setItem(
      STORAGE_ACTIVE,
      activeChatId
    );
  }

  function newChatObject() {
    return {
      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(),

      title: "New chat",

      messages: [],

      createdAt: Date.now(),

      updatedAt: Date.now()
    };
  }

  function ensureChat() {
    if (activeChatId) {
      const existing = chats.find(
        (c) => c.id === activeChatId
      );

      if (existing) return existing;
    }

    const chat = newChatObject();

    chats.unshift(chat);

    activeChatId = chat.id;

    saveChats();

    return chat;
  }

  function activeChat() {
    return chats.find(
      (c) => c.id === activeChatId
    );
  }

  /* =======================================================
     MODEL LOADING
  ======================================================= */

  async function loadModels() {
    try {
      const [chatResponse, imageResponse] =
        await Promise.all([
          fetch("/api/models?modality=chat"),
          fetch("/api/models?modality=image")
        ]);

      if (!chatResponse.ok) {
        throw new Error("Unable to load chat models");
      }

      const chatData = await chatResponse.json();

      models = Array.isArray(chatData.data)
        ? chatData.data
        : [];

      if (imageResponse.ok) {
        const imageData =
          await imageResponse.json();

        imageModels =
          Array.isArray(imageData.data)
            ? imageData.data
            : [];
      }

      if (!selectedModel) {
        const free =
          models.find(
            (m) => m.access_tier === "free"
          );

        selectedModel =
          free?.id ||
          models[0]?.id ||
          "";
      }

      if (
        selectedModel &&
        !models.some(
          (m) => m.id === selectedModel
        )
      ) {
        selectedModel =
          models.find(
            (m) => m.access_tier === "free"
          )?.id ||
          models[0]?.id ||
          "";
      }

      localStorage.setItem(
        STORAGE_MODEL,
        selectedModel
      );

      renderModels();
      updateModelButton();

      composerStatus(
        models.length
          ? models.length +
            " chat models available."
          : "No models found."
      );

    } catch (err) {
      console.error(err);

      $("modelButton").textContent =
        "Models unavailable";

      composerStatus(
        "Could not load xKiro models."
      );
    }
  }

  function modelDisplayName(model) {
    if (!model) return "Unknown model";

    return (
      model.name ||
      model.display_name ||
      model.id
    );
  }

  function renderModels() {
    const list = $("modelList");

    const query =
      $("modelSearch").value
        .trim()
        .toLowerCase();

    let visible =
      models.filter((m) => {
        if (
          modelFilter === "free" &&
          m.access_tier !== "free"
        ) {
          return false;
        }

        const haystack =
          (
            m.id +
            " " +
            modelDisplayName(m)
          ).toLowerCase();

        return haystack.includes(query);
      });

    list.innerHTML = "";

    if (!visible.length) {
      list.innerHTML =
        '<div style="padding:15px;color:#888;font-size:12px">No matching models.</div>';

      return;
    }

    for (const model of visible) {

      const button =
        document.createElement("button");

      button.className =
        "model-option" +
        (
          model.id === selectedModel
            ? " selected"
            : ""
        );

      const tier =
        model.access_tier || "unknown";

      button.innerHTML = \`
        <span class="tier">\${escapeHtml(tier)}</span>
        <div class="model-name">
          \${escapeHtml(modelDisplayName(model))}
        </div>
        <div class="model-id">
          \${escapeHtml(model.id)}
        </div>
      \`;

      button.onclick = () => {

        selectedModel = model.id;

        localStorage.setItem(
          STORAGE_MODEL,
          selectedModel
        );

        updateModelButton();
        renderModels();

        $("modelPanel")
          .classList.remove("open");

        composerStatus(
          "Using " +
          modelDisplayName(model)
        );
      };

      list.appendChild(button);
    }
  }

  function updateModelButton() {
    const model =
      models.find(
        (m) => m.id === selectedModel
      );

    $("modelButton").textContent =
      model
        ? modelDisplayName(model)
        : selectedModel || "Select model";
  }

  /* =======================================================
     CHAT RENDERING
  ======================================================= */

  function renderHistory() {
    const list = $("historyList");

    list.innerHTML = "";

    const sorted =
      [...chats].sort(
        (a, b) =>
          b.updatedAt - a.updatedAt
      );

    for (const chat of sorted.slice(0, 50)) {

      const button =
        document.createElement("button");

      button.className =
        "chat-item" +
        (
          chat.id === activeChatId
            ? " active"
            : ""
        );

      button.textContent =
        chat.title || "New chat";

      button.onclick = () => {

        activeChatId = chat.id;

        saveChats();

        renderHistory();
        renderChat();

        $("sidebar")
          .classList.remove("open");
      };

      list.appendChild(button);
    }
  }

  function renderChat() {
    const container = $("chatInner");

    container.innerHTML = "";

    const chat = activeChat();

    if (!chat || !chat.messages.length) {

      container.innerHTML = \`
        <div class="welcome">
          <div class="welcome-box">
            <h1>What can I help with?</h1>
            <p>
              Ask questions, research topics,
              write code, or generate images.
              Choose any available xKiro model above.
            </p>
          </div>
        </div>
      \`;

      return;
    }

    for (const message of chat.messages) {
      appendMessage(message);
    }

    scrollBottom(false);
  }

  function appendMessage(message) {

    const container = $("chatInner");

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "message " + message.role;

    const avatar =
      message.role === "user"
        ? "You"
        : "AI";

    const body =
      document.createElement("div");

    body.className =
      "message-body";

    const content =
      document.createElement("div");

    content.className =
      "message-content";

    if (
      message.type === "image" &&
      message.imageUrl
    ) {

      content.innerHTML = \`
        <img
          class="generated-image"
          src="\${escapeAttribute(message.imageUrl)}"
          alt="Generated image"
          loading="lazy"
        >
      \`;

    } else if (message.streaming) {

      content.innerHTML =
        renderMarkdown(
          message.content || "Thinking..."
        );

    } else {

      content.innerHTML =
        renderMarkdown(
          message.content || ""
        );
    }

    const role =
      document.createElement("div");

    role.className =
      "message-role";

    role.textContent =
      message.role === "user"
        ? "You"
        : (
          message.model
            ? "AetherAI · " + message.model
            : "AetherAI"
        );

    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";

    if (message.role === "assistant") {

      const copy =
        document.createElement("button");

      copy.innerHTML = "⧉ Copy";

      copy.onclick = async () => {

        const text =
          message.content || "";

        try {

          await navigator.clipboard.writeText(
            text
          );

          copy.textContent =
            "✓ Copied";

          copy.classList.add(
            "copy-ok"
          );

          setTimeout(() => {
            copy.textContent =
              "⧉ Copy";

            copy.classList.remove(
              "copy-ok"
            );
          }, 1200);

        } catch {

          copy.textContent =
            "Copy failed";
        }
      };

      actions.appendChild(copy);
    }

    body.appendChild(role);
    body.appendChild(content);
    body.appendChild(actions);

    wrapper.innerHTML =
      \`<div class="avatar">\${avatar}</div>\`;

    wrapper.appendChild(body);

    container.appendChild(wrapper);
  }

  /* =======================================================
     MARKDOWN
  ======================================================= */

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value)
      .replaceAll("`", "&#096;");
  }

  function renderMarkdown(text) {

    let value =
      escapeHtml(text || "");

    const codeBlocks = [];

    value =
      value.replace(
        /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g,
        (_, lang, code) => {

          const index =
            codeBlocks.length;

          codeBlocks.push({
            lang,
            code
          });

          return (
            "@@CODE" +
            index +
            "@@"
          );
        }
      );

    value =
      value.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );

    value =
      value.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
      );

    value =
      value.replace(
        /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\)\\s\]\+\)$end:math:text$/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );

    value =
      value.replace(
        /\n\n+/g,
        "</p><p>"
      );

    value =
      value.replace(
        /\n/g,
        "<br>"
      );

    value =
      "<p>" + value + "</p>";

    value =
      value.replace(
        /@@CODE(\d+)@@/g,
        (_, index) => {

          const item =
            codeBlocks[
              Number(index)
            ];

          return (
            "<pre><code>" +
            item.code +
            "</code></pre>"
          );
        }
      );

    return value;
  }

  /* =======================================================
     SEND TEXT
  ======================================================= */

  async function sendText(promptText) {

    if (generating) return;

    if (!promptText.trim()) return;

    if (!selectedModel) {

      alert(
        "Please select an AI model first."
      );

      return;
    }

    const chat = ensureChat();

    const userMessage = {
      role: "user",
      content: promptText,
      timestamp: Date.now()
    };

    chat.messages.push(userMessage);

    if (
      chat.title === "New chat"
    ) {

      chat.title =
        promptText
          .replace(/\s+/g, " ")
          .slice(0, 60);
    }

    chat.updatedAt = Date.now();

    saveChats();
    renderHistory();
    renderChat();

    generating = true;

    $("send").disabled = true;

    composerStatus(
      "Generating with " +
      selectedModel +
      "..."
    );

    const assistantMessage = {
      role: "assistant",
      content: "",
      model: selectedModel,
      streaming: true,
      timestamp: Date.now()
    };

    chat.messages.push(
      assistantMessage
    );

    appendMessage(
      assistantMessage
    );

    scrollBottom(true);

    try {

      const response =
        await fetch("/api/chat", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            model: selectedModel,
            messages:
              chat.messages
                .filter(
                  (m) =>
                    m.role === "user" ||
                    m.role === "assistant"
                )
                .filter(
                  (m) =>
                    m.type !== "image"
                )
                .map((m) => ({
                  role: m.role,
                  content: m.content
                })),

            webSearch
          })
        });

      if (!response.ok) {

        let errorText =
          "Request failed.";

        try {

          const data =
            await response.json();

          errorText =
            data.error ||
            errorText;

        } catch {}

        throw new Error(
          errorText
        );
      }

      if (!response.body) {
        throw new Error(
          "No streaming response."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      while (true) {

        const {
          value,
          done
        } = await reader.read();

        if (done) break;

        buffer +=
          decoder.decode(
            value,
            {
              stream: true
            }
          );

        const parts =
          buffer.split("\n");

        buffer =
          parts.pop() || "";

        for (const line of parts) {

          if (
            !line.startsWith(
              "data:"
            )
          ) continue;

          const data =
            line.slice(5).trim();

          if (
            !data ||
            data === "[DONE]"
          ) continue;

          try {

            const parsed =
              JSON.parse(data);

            const delta =
              parsed?.choices?.[0]
                ?.delta?.content;

            if (delta) {

              assistantMessage.content +=
                delta;

              refreshLastAssistant(
                assistantMessage
              );

              scrollBottom(true);
            }

          } catch {
            // Ignore malformed SSE chunks.
          }
        }
      }

      assistantMessage.streaming =
        false;

      chat.updatedAt =
        Date.now();

      saveChats();

      refreshLastAssistant(
        assistantMessage
      );

      renderHistory();

      composerStatus(
        "Ready"
      );

    } catch (error) {

      assistantMessage.streaming =
        false;

      assistantMessage.content =
        "Error: " +
        error.message;

      refreshLastAssistant(
        assistantMessage
      );

      saveChats();

      composerStatus(
        "Request failed."
      );

    } finally {

      generating = false;

      $("send").disabled =
        false;
    }
  }

  function refreshLastAssistant(
    message
  ) {

    const messages =
      $("chatInner")
        .querySelectorAll(
          ".message.assistant"
        );

    const last =
      messages[messages.length - 1];

    if (!last) return;

    const content =
      last.querySelector(
        ".message-content"
      );

    if (!content) return;

    content.innerHTML =
      renderMarkdown(
        message.content
      );
  }

  /* =======================================================
     IMAGE GENERATION
  ======================================================= */

  async function generateImage(
    promptText
  ) {

    if (generating) return;

    const chat = ensureChat();

    chat.messages.push({
      role: "user",
      content: promptText,
      timestamp: Date.now()
    });

    if (
      chat.title === "New chat"
    ) {

      chat.title =
        promptText
          .replace(/\s+/g, " ")
          .slice(0, 60);
    }

    saveChats();
    renderHistory();
    renderChat();

    generating = true;

    $("send").disabled = true;

    composerStatus(
      "Creating image..."
    );

    const placeholder = {
      role: "assistant",
      content: "Generating image...",
      type: "image-loading",
      streaming: true,
      timestamp: Date.now()
    };

    chat.messages.push(
      placeholder
    );

    appendMessage(
      placeholder
    );

    try {

      const model =
        imageModels.find(
          (m) =>
            m.access_tier === "free"
        ) ||
        imageModels[0];

      if (!model) {
        throw new Error(
          "No image model is available."
        );
      }

      const createResponse =
        await fetch(
          "/api/images",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              prompt: promptText,
              model: model.id,
              size: "1024x1024"
            })
          }
        );

      const createData =
        await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          errorText(createData)
        );
      }

      const jobId =
        createData.id;

      if (!jobId) {
        throw new Error(
          "Image job ID was not returned."
        );
      }

      let job = null;

      const deadline =
        Date.now() + 5 * 60 * 1000;

      let waitMs = 2000;

      while (
        Date.now() < deadline
      ) {

        await sleep(waitMs);

        waitMs =
          Math.min(
            Math.round(
              waitMs * 1.5
            ),
            10000
          );

        const poll =
          await fetch(
            "/api/images/" +
            encodeURIComponent(
              jobId
            )
          );

        const data =
          await poll.json();

        if (!poll.ok) {
          throw new Error(
            errorText(data)
          );
        }

        job = data;

        if (
          job.status ===
          "succeeded"
        ) break;

        if (
          job.status === "failed" ||
          job.status === "blocked"
        ) {

          throw new Error(
            errorText(job) ||
            job.status
          );
        }
      }

      if (
        !job ||
        job.status !== "succeeded"
      ) {

        throw new Error(
          "Image generation timed out."
        );
      }

      const imageUrl =
        job.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error(
          "No image URL returned."
        );
      }

      const index =
        chat.messages.indexOf(
          placeholder
        );

      if (index !== -1) {

        chat.messages[index] = {
          role: "assistant",
          content: "",
          type: "image",
          imageUrl,
          model: model.id,
          timestamp: Date.now()
        };
      }

      chat.updatedAt =
        Date.now();

      saveChats();

      renderChat();

      composerStatus(
        "Image generated."
      );

    } catch (error) {

      placeholder.type =
        undefined;

      placeholder.streaming =
        false;

      placeholder.content =
        "Image error: " +
        error.message;

      saveChats();

      renderChat();

      composerStatus(
        "Image generation failed."
      );

    } finally {

      generating = false;

      $("send").disabled =
        false;
    }
  }

  function errorText(data) {

    return (
      data?.error?.message ||
      data?.error ||
      data?.message ||
      "Request failed."
    );
  }

  function sleep(ms) {
    return new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          ms
        )
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  function composerStatus(text) {
    $("composerStatus")
      .textContent = text;
  }

  function scrollBottom(force) {

    const chat =
      $("chat");

    if (
      force ||
      chat.scrollHeight -
        chat.scrollTop -
        chat.clientHeight <
        500
    ) {

      requestAnimationFrame(() => {
        chat.scrollTop =
          chat.scrollHeight;
      });
    }
  }

  $("newChat").onclick = () => {

    const chat =
      newChatObject();

    chats.unshift(chat);

    activeChatId =
      chat.id;

    saveChats();

    renderHistory();
    renderChat();
  };

  $("clearBtn").onclick = () => {

    const chat =
      activeChat();

    if (!chat) return;

    chat.messages = [];

    chat.title = "New chat";

    chat.updatedAt =
      Date.now();

    saveChats();

    renderHistory();
    renderChat();
  };

  $("modelButton").onclick =
    (event) => {

      event.stopPropagation();

      $("modelPanel")
        .classList.toggle(
          "open"
        );
    };

  document.addEventListener(
    "click",
    (event) => {

      if (
        !$("modelPanel")
          .contains(event.target) &&
        event.target !==
          $("modelButton")
      ) {

        $("modelPanel")
          .classList.remove(
            "open"
          );
      }
    }
  );

  $("modelSearch").oninput =
    renderModels;

  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach((button) => {

      button.onclick = () => {

        modelFilter =
          button.dataset.filter;

        document
          .querySelectorAll(
            ".filter-btn"
          )
          .forEach(
            (b) =>
              b.classList.remove(
                "active"
              )
          );

        button.classList.add(
          "active"
        );

        renderModels();
      };
    });

  $("webSearchBtn").onclick =
    () => {

      webSearch =
        !webSearch;

      $("webSearchBtn")
        .classList.toggle(
          "search-active",
          webSearch
        );

      composerStatus(
        webSearch
          ? "Web search enabled."
          : "Web search disabled."
      );
    };

  $("imageBtn").onclick =
    () => {

      imageMode = true;

      $("imageBtn")
        .classList.add("active");

      $("normalBtn")
        .classList.remove("active");

      $("modeStatus")
        .textContent =
        "Image mode";

      $("prompt").placeholder =
        "Describe the image you want...";
    };

  $("normalBtn").onclick =
    () => {

      imageMode = false;

      $("normalBtn")
        .classList.add("active");

      $("imageBtn")
        .classList.remove("active");

      $("modeStatus")
        .textContent =
        "Text mode";

      $("prompt").placeholder =
        "Message AetherAI...";
    };

  $("menuBtn").onclick =
    () => {

      $("sidebar")
        .classList.toggle(
          "open"
        );
    };

  $("send").onclick =
    submitPrompt;

  $("prompt").addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        submitPrompt();
      }
    }
  );

  $("prompt").addEventListener(
    "input",
    () => {

      const textarea =
        $("prompt");

      textarea.style.height =
        "auto";

      textarea.style.height =
        Math.min(
          textarea.scrollHeight,
          180
        ) + "px";
    }
  );

  function submitPrompt() {

    if (generating) return;

    const prompt =
      $("prompt").value.trim();

    if (!prompt) return;

    $("prompt").value = "";

    $("prompt").style.height =
      "auto";

    if (imageMode) {
      generateImage(prompt);
    } else {
      sendText(prompt);
    }
  }

  /* =======================================================
     INIT
  ======================================================= */

  ensureChat();

  renderHistory();
  renderChat();

  loadModels();

})();
</script>

</body>
</html>`;

/* =========================================================
   API ROUTES
========================================================= */

async function handleModels(request, env, url) {

  const apiKey = getApiKey(env);

  /*
   xKiro's model catalog is public, but using the same
   gateway here keeps the frontend simple.
  */

  const modality =
    url.searchParams.get("modality") ||
    "chat";

  const target =
    getBaseUrl(env) +
    "/models?modality=" +
    encodeURIComponent(modality);

  const headers = {};

  if (apiKey) {
    headers.Authorization =
      "Bearer " + apiKey;
  }

  const response =
    await fetch(target, {
      headers
    });

  const text =
    await response.text();

  return withCors(
    new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json"
      }
    })
  );
}

async function handleChat(
  request,
  env
) {

  const apiKey =
    getApiKey(env);

  if (!apiKey) {

    return withCors(
      json({
        error:
          "XKIRO_API_KEY is not configured."
      }, 500)
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {

    return withCors(
      json({
        error:
          "Invalid JSON request."
      }, 400)
    );
  }

  const model =
    body.model ||
    getDefaultModel(env);

  const messages =
    sanitizeMessages(
      body.messages
    );

  if (!messages.length) {

    return withCors(
      json({
        error:
          "At least one message is required."
      }, 400)
    );
  }

  const payload = {
    model,
    messages,
    stream: true
  };

  if (body.webSearch) {
    payload.web_search = {
      enable: true,
      count: 5
    };
  }

  if (body.reasoning_effort) {
    payload.reasoning_effort =
      body.reasoning_effort;
  }

  const upstream =
    await fetch(
      getBaseUrl(env) +
      "/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization:
            "Bearer " + apiKey,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          payload
        )
      }
    );

  if (!upstream.ok) {

    const text =
      await upstream.text();

    return withCors(
      new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type":
            "application/json"
        }
      })
    );
  }

  return withCors(
    new Response(
      upstream.body,
      {
        status: upstream.status,

        headers: {
          "Content-Type":
            "text/event-stream; charset=utf-8",

          "Cache-Control":
            "no-cache, no-transform",

          "Connection":
            "keep-alive"
        }
      }
    )
  );
}

async function handleImageCreate(
  request,
  env
) {

  const apiKey =
    getApiKey(env);

  if (!apiKey) {

    return withCors(
      json({
        error:
          "XKIRO_API_KEY is not configured."
      }, 500)
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {

    return withCors(
      json({
        error:
          "Invalid JSON request."
      }, 400)
    );
  }

  if (
    !body.prompt ||
    typeof body.prompt !== "string"
  ) {

    return withCors(
      json({
        error:
          "Image prompt is required."
      }, 400)
    );
  }

  const payload = {
    model:
      body.model ||
      DEFAULT_IMAGE_MODEL,

    prompt:
      body.prompt,

    n: 1,

    size:
      body.size ||
      "1024x1024"
  };

  const response =
    await fetch(
      getBaseUrl(env) +
      "/images/generations",
      {
        method: "POST",

        headers: {
          Authorization:
            "Bearer " + apiKey,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          payload
        )
      }
    );

  const text =
    await response.text();

  return withCors(
    new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json"
      }
    })
  );
}

async function handleImagePoll(
  request,
  env,
  jobId
) {

  const apiKey =
    getApiKey(env);

  if (!apiKey) {

    return withCors(
      json({
        error:
          "XKIRO_API_KEY is not configured."
      }, 500)
    );
  }

  const response =
    await fetch(
      getBaseUrl(env) +
      "/images/generations/" +
      encodeURIComponent(jobId),
      {
        headers: {
          Authorization:
            "Bearer " + apiKey
        }
      }
    );

  const text =
    await response.text();

  return withCors(
    new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json"
      }
    })
  );
}

/* =========================================================
   WORKER
========================================================= */

export default {
  async fetch(request, env) {

    if (
      request.method === "OPTIONS"
    ) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    const url =
      new URL(request.url);

    try {

      if (
        request.method === "GET" &&
        url.pathname === "/"
      ) {

        return new Response(
          HTML,
          {
            headers: {
              "Content-Type":
                "text/html; charset=utf-8",

              "Cache-Control":
                "no-store"
            }
          }
        );
      }

      if (
        request.method === "GET" &&
        url.pathname === "/health"
      ) {

        return withCors(
          json({
            ok: true,

            xkiroConfigured:
              Boolean(
                getApiKey(env)
              ),

            model:
              getDefaultModel(env),

            baseUrl:
              getBaseUrl(env)
          })
        );
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/models"
      ) {

        return handleModels(
          request,
          env,
          url
        );
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/chat"
      ) {

        return handleChat(
          request,
          env
        );
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/images"
      ) {

        return handleImageCreate(
          request,
          env
        );
      }

      if (
        request.method === "GET" &&
        url.pathname.startsWith(
          "/api/images/"
        )
      ) {

        const jobId =
          url.pathname.slice(
            "/api/images/".length
          );

        return handleImagePoll(
          request,
          env,
          jobId
        );
      }

      return withCors(
        json({
          error: "Not found"
        }, 404)
      );

    } catch (error) {

      console.error(error);

      return withCors(
        json({
          error:
            error?.message ||
            "Internal server error."
        }, 500)
      );
    }
  }
};
