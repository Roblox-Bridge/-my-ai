const CODECRAFT_BASE = "https://www.codecraftapi.com/v1";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

const ALLOWED_ORIGINS = "*";

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...extra
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    })
  });
}

function html(data) {
  return new Response(data, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function text(data, type = "text/plain; charset=utf-8") {
  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "no-store"
    }
  });
}

function safeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getApiKey(env) {
  return env.CODECRAFT_API_KEY || env.XKIRO_API_KEY || "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch (_) {}

  return "#";
}

function modelScore(model) {
  const m = model || {};
  const caps = Array.isArray(m.capabilities) ? m.capabilities : [];

  let score = 0;

  if (caps.includes("reasoning")) score += 50;
  if (caps.includes("vision")) score += 35;
  if (caps.includes("tools")) score += 30;
  if (caps.includes("web_search")) score += 30;
  if (caps.includes("streaming")) score += 20;
  if (caps.includes("json_mode")) score += 5;

  const context = Number(m.context_window || 0);
  if (context >= 100000) score += 20;
  else if (context >= 32000) score += 10;

  const pricing = m.pricing || {};

  const input = Number(pricing.input || pricing.prompt || 0);
  const output = Number(pricing.output || pricing.completion || 0);

  if (input === 0 && output === 0) score += 50;

  return score;
}

async function codecraftFetch(env, path, body) {
  const apiKey = getApiKey(env);

  if (!apiKey) {
    throw new Error(
      "CODECRAFT_API_KEY is missing. Add it in Cloudflare Workers > Settings > Variables and Secrets."
    );
  }

  const response = await fetch(CODECRAFT_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      "CodeCraft API error " +
      response.status +
      ": " +
      errorText.slice(0, 1000)
    );
  }

  return response;
}

function systemPrompt(memories) {
  const memoryText = Array.isArray(memories) && memories.length
    ? "\nKnown user memories:\n" + memories
        .slice(0, 30)
        .map(x => "- " + String(x))
        .join("\n")
    : "";

  return [
    "You are AetherAI, a helpful general-purpose AI assistant.",
    "Answer clearly and naturally.",
    "Use Markdown when useful.",
    "For programming, provide correct runnable code.",
    "Do not invent facts when information is uncertain.",
    "Keep answers reasonably concise unless the user asks for detail.",
    "If the user asks for current information and the selected model has web-search/tool capabilities, use those capabilities when available.",
    memoryText
  ].join("\n");
}

function normalizeMessages(messages, memories) {
  if (!Array.isArray(messages)) return [];

  const result = [];

  result.push({
    role: "system",
    content: systemPrompt(memories)
  });

  for (const message of messages.slice(-60)) {
    if (!message || typeof message !== "object") continue;

    const role =
      message.role === "assistant"
        ? "assistant"
        : "user";

    const content = message.content;

    if (typeof content === "string") {
      result.push({
        role,
        content: content.slice(0, 50000)
      });

      continue;
    }

    if (Array.isArray(content)) {
      const parts = [];

      for (const part of content) {
        if (!part || typeof part !== "object") continue;

        if (part.type === "text") {
          parts.push({
            type: "text",
            text: String(part.text || "").slice(0, 50000)
          });
        }

        if (part.type === "image_url" && part.image_url) {
          const url = String(part.image_url.url || "");

          if (
            url.startsWith("data:image/") ||
            url.startsWith("https://") ||
            url.startsWith("http://")
          ) {
            parts.push({
              type: "image_url",
              image_url: {
                url
              }
            });
          }
        }
      }

      if (parts.length) {
        result.push({
          role,
          content: parts
        });
      }
    }
  }

  return result;
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const model = safeString(body.model);

  if (!model) {
    return json({ error: "No model selected." }, 400);
  }

  const messages = normalizeMessages(
    body.messages,
    body.memories
  );

  if (!messages.length) {
    return json({ error: "No messages supplied." }, 400);
  }

  const payload = {
    model,
    messages,
    stream: true,
    temperature:
      typeof body.temperature === "number"
        ? body.temperature
        : 0.7,
    max_tokens:
      typeof body.max_tokens === "number"
        ? body.max_tokens
        : 4096
  };

  let response;

  try {
    response = await codecraftFetch(
      env,
      "/chat/completions",
      payload
    );
  } catch (error) {
    return json(
      {
        error: error.message || "Chat request failed."
      },
      500
    );
  }

  return new Response(response.body, {
    status: 200,
    headers: corsHeaders({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    })
  });
}

async function handleModels(env) {
  const apiKey = getApiKey(env);

  if (!apiKey) {
    return json({
      data: [],
      error: "CODECRAFT_API_KEY is missing."
    }, 500);
  }

  try {
    const response = await fetch(
      CODECRAFT_BASE + "/models",
      {
        headers: {
          "Authorization": "Bearer " + apiKey
        }
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      return new Response(raw, {
        status: response.status,
        headers: corsHeaders({
          "Content-Type": "application/json"
        })
      });
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch (_) {
      return json({
        data: [],
        error: "Invalid model response."
      }, 502);
    }

    if (Array.isArray(data.data)) {
      data.data.sort(
        (a, b) => modelScore(b) - modelScore(a)
      );
    }

    return json(data);
  } catch (error) {
    return json({
      data: [],
      error: error.message || "Unable to load models."
    }, 500);
  }
}

async function handleImageGeneration(request, env) {
  if (!env.AI) {
    return json({
      error:
        "Cloudflare Workers AI binding is missing. Check wrangler.jsonc."
    }, 500);
  }

  let body;

  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "Invalid JSON." }, 400);
  }

  const prompt = safeString(body.prompt).trim();

  if (!prompt) {
    return json({
      error: "Image prompt is empty."
    }, 400);
  }

  if (prompt.length > 2048) {
    return json({
      error: "Image prompt is too long."
    }, 400);
  }

  try {
    const result = await env.AI.run(
      IMAGE_MODEL,
      {
        prompt,
        steps: 8
      }
    );

    if (!result || !result.image) {
      return json({
        error: "Image model returned no image."
      }, 502);
    }

    return json({
      image:
        "data:image/jpeg;base64," +
        result.image
    });
  } catch (error) {
    return json({
      error:
        error.message ||
        "Image generation failed."
    }, 500);
  }
}

function manifest() {
  return {
    name: "AetherAI",
    short_name: "AetherAI",
    description: "Personal AI assistant",
    start_url: "/",
    display: "standalone",
    background_color: "#101010",
    theme_color: "#101010",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  };
}

function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="#111111"/>
<circle cx="256" cy="256" r="142" fill="none" stroke="#ffffff" stroke-width="34"/>
<path d="M150 300c32 42 73 63 121 63 50 0 91-22 123-67" fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round"/>
<circle cx="190" cy="220" r="22" fill="#ffffff"/>
<circle cx="322" cy="220" r="22" fill="#ffffff"/>
</svg>`;
}

function serviceWorker() {
  return `
const CACHE = "aetherai-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
`;
}

function appHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#101010">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AetherAI">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icon.svg">

<title>AetherAI</title>

<style>
*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

html,
body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#101010;
  color:#ececec;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
}

button,
textarea,
input{
  font:inherit;
}

button{
  border:0;
  cursor:pointer;
}

.app{
  display:flex;
  width:100%;
  height:100%;
}

.sidebar{
  width:270px;
  height:100%;
  flex-shrink:0;
  background:#171717;
  border-right:1px solid #292929;
  display:flex;
  flex-direction:column;
  padding:12px;
  z-index:30;
}

.brand{
  height:48px;
  display:flex;
  align-items:center;
  gap:11px;
  padding:0 9px;
  font-weight:700;
  font-size:17px;
}

.brand-logo{
  width:30px;
  height:30px;
  border-radius:9px;
  background:#fff;
  color:#111;
  display:grid;
  place-items:center;
  font-weight:900;
}

.new-chat{
  width:100%;
  min-height:44px;
  margin:5px 0 10px;
  border:1px solid #343434;
  background:#222;
  color:#fff;
  border-radius:10px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 13px;
}

.new-chat:hover{
  background:#2a2a2a;
}

.sidebar-search{
  width:100%;
  height:38px;
  border:1px solid #303030;
  border-radius:9px;
  background:#202020;
  color:#ddd;
  outline:none;
  padding:0 11px;
  margin-bottom:9px;
}

.history{
  flex:1;
  overflow:auto;
  padding:2px 0;
}

.history-title{
  color:#777;
  font-size:11px;
  padding:8px 10px;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.chat-item{
  display:flex;
  align-items:center;
  width:100%;
  min-height:39px;
  padding:8px 10px;
  margin:2px 0;
  border-radius:8px;
  background:transparent;
  color:#ccc;
  text-align:left;
  overflow:hidden;
}

.chat-item:hover,
.chat-item.active{
  background:#262626;
  color:#fff;
}

.chat-item span{
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.sidebar-bottom{
  border-top:1px solid #292929;
  padding-top:9px;
}

.side-button{
  width:100%;
  height:40px;
  background:transparent;
  color:#c9c9c9;
  border-radius:8px;
  text-align:left;
  padding:0 10px;
}

.side-button:hover{
  background:#252525;
  color:#fff;
}

.main{
  flex:1;
  min-width:0;
  height:100%;
  display:flex;
  flex-direction:column;
  background:#101010;
}

.topbar{
  height:58px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  border-bottom:1px solid #202020;
}

.mobile-menu{
  display:none;
  position:absolute;
  left:10px;
  width:40px;
  height:40px;
  border-radius:9px;
  background:transparent;
  color:#ddd;
  font-size:21px;
}

.model-select{
  appearance:none;
  background:#101010;
  color:#eee;
  border:0;
  outline:0;
  font-weight:600;
  max-width:240px;
  text-align:center;
  padding:8px 28px 8px 8px;
}

.model-info{
  position:absolute;
  right:13px;
  color:#666;
  font-size:11px;
  max-width:220px;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}

.chat-scroll{
  flex:1;
  overflow-y:auto;
  overscroll-behavior:contain;
}

.chat-inner{
  width:min(860px,100%);
  margin:0 auto;
  padding:32px 20px 180px;
}

.welcome{
  min-height:55vh;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;
}

.welcome-logo{
  width:54px;
  height:54px;
  border-radius:17px;
  background:#fff;
  color:#111;
  display:grid;
  place-items:center;
  font-weight:900;
  font-size:23px;
  margin-bottom:17px;
}

.welcome h1{
  font-size:27px;
  margin:0 0 9px;
}

.welcome p{
  color:#858585;
  margin:0 0 24px;
}

.suggestions{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:8px;
  width:min(600px,100%);
}

.suggestion{
  min-height:48px;
  padding:10px 13px;
  border-radius:10px;
  border:1px solid #2c2c2c;
  background:#171717;
  color:#d8d8d8;
  text-align:left;
}

.suggestion:hover{
  background:#222;
}

.message{
  display:flex;
  gap:12px;
  margin:0 0 27px;
  animation:appear .16s ease;
}

@keyframes appear{
  from{opacity:.2;transform:translateY(3px)}
  to{opacity:1;transform:none}
}

.avatar{
  width:32px;
  height:32px;
  border-radius:9px;
  flex-shrink:0;
  display:grid;
  place-items:center;
  font-size:13px;
  font-weight:700;
}

.user .avatar{
  background:#333;
}

.assistant .avatar{
  background:#fff;
  color:#111;
}

.message-body{
  min-width:0;
  flex:1;
}

.message-name{
  font-size:12px;
  color:#777;
  margin:2px 0 6px;
}

.content{
  color:#e7e7e7;
  font-size:15px;
  line-height:1.65;
  overflow-wrap:anywhere;
}

.content p{
  margin:0 0 12px;
}

.content p:last-child{
  margin-bottom:0;
}

.content h1,
.content h2,
.content h3{
  line-height:1.3;
  margin:18px 0 9px;
}

.content h1{font-size:23px}
.content h2{font-size:19px}
.content h3{font-size:16px}

.content ul,
.content ol{
  padding-left:23px;
}

.content li{
  margin:4px 0;
}

.content blockquote{
  border-left:3px solid #555;
  padding-left:13px;
  color:#aaa;
  margin:12px 0;
}

.inline-code{
  background:#292929;
  border:1px solid #383838;
  border-radius:5px;
  padding:2px 5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:.9em;
}

.code-wrap{
  margin:12px 0;
  border:1px solid #303030;
  background:#0b0b0b;
  border-radius:10px;
  overflow:hidden;
}

.code-head{
  height:34px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:0 9px 0 12px;
  background:#171717;
  color:#777;
  font-size:11px;
}

.code-copy{
  background:#252525;
  color:#bbb;
  border-radius:6px;
  padding:5px 8px;
  font-size:11px;
}

.code-wrap pre{
  margin:0;
  padding:14px;
  overflow:auto;
  font-size:13px;
  line-height:1.55;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}

.message-actions{
  display:flex;
  gap:5px;
  margin-top:7px;
}

.message-actions button{
  height:28px;
  padding:0 8px;
  border-radius:6px;
  background:transparent;
  color:#777;
  font-size:11px;
}

.message-actions button:hover{
  background:#222;
  color:#ddd;
}

.image-result{
  margin-top:12px;
  max-width:100%;
}

.image-result img{
  display:block;
  max-width:100%;
  max-height:600px;
  border-radius:12px;
  border:1px solid #303030;
}

.image-buttons{
  display:flex;
  gap:7px;
  margin-top:8px;
}

.image-buttons a{
  color:#ddd;
  background:#222;
  border:1px solid #333;
  border-radius:7px;
  padding:7px 10px;
  text-decoration:none;
  font-size:12px;
}

.composer-area{
  position:fixed;
  left:270px;
  right:0;
  bottom:0;
  padding:13px 18px calc(13px + env(safe-area-inset-bottom));
  background:linear-gradient(
    to bottom,
    rgba(16,16,16,0),
    #101010 25%
  );
  z-index:20;
}

.composer{
  width:min(860px,100%);
  margin:auto;
  border:1px solid #373737;
  background:#1a1a1a;
  border-radius:16px;
  box-shadow:0 8px 35px rgba(0,0,0,.3);
  overflow:hidden;
}

.attachments{
  display:none;
  padding:8px 10px 0;
  gap:7px;
  flex-wrap:wrap;
}

.attachments.show{
  display:flex;
}

.attachment{
  background:#282828;
  border:1px solid #383838;
  border-radius:8px;
  padding:5px 8px;
  color:#bbb;
  font-size:11px;
}

.composer-row{
  display:flex;
  align-items:flex-end;
  gap:7px;
  padding:9px;
}

.composer textarea{
  flex:1;
  min-width:0;
  max-height:180px;
  min-height:40px;
  resize:none;
  background:transparent;
  color:#eee;
  border:0;
  outline:0;
  padding:9px 5px;
  line-height:1.45;
}

.tool-button,
.send-button{
  width:38px;
  height:38px;
  flex-shrink:0;
  border-radius:10px;
  display:grid;
  place-items:center;
}

.tool-button{
  background:transparent;
  color:#aaa;
  font-size:20px;
}

.tool-button:hover{
  background:#282828;
  color:#fff;
}

.send-button{
  background:#fff;
  color:#111;
  font-size:16px;
}

.send-button:disabled{
  opacity:.35;
  cursor:not-allowed;
}

.stop-button{
  background:#e4e4e4;
  color:#111;
}

.file-input{
  display:none;
}

.bottom-note{
  width:min(860px,100%);
  margin:6px auto 0;
  text-align:center;
  font-size:10px;
  color:#5f5f5f;
}

.scroll-bottom{
  position:fixed;
  right:26px;
  bottom:100px;
  width:38px;
  height:38px;
  border-radius:50%;
  background:#292929;
  color:#ddd;
  display:none;
  place-items:center;
  border:1px solid #3b3b3b;
  z-index:25;
}

.scroll-bottom.show{
  display:grid;
}

.overlay{
  display:none;
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  z-index:29;
}

.memory-panel{
  position:fixed;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  z-index:60;
  background:rgba(0,0,0,.65);
}

.memory-panel.show{
  display:flex;
}

.memory-box{
  width:min(500px,calc(100% - 28px));
  max-height:80vh;
  overflow:auto;
  background:#1b1b1b;
  border:1px solid #333;
  border-radius:14px;
  padding:18px;
}

.memory-box h2{
  margin:0 0 12px;
  font-size:18px;
}

.memory-list{
  color:#bbb;
  line-height:1.6;
  font-size:13px;
}

.memory-close{
  margin-top:15px;
  width:100%;
  height:40px;
  border-radius:8px;
  background:#292929;
  color:#eee;
}

.toast{
  position:fixed;
  left:50%;
  bottom:105px;
  transform:translateX(-50%) translateY(15px);
  background:#292929;
  color:#eee;
  border:1px solid #3a3a3a;
  border-radius:9px;
  padding:9px 13px;
  font-size:12px;
  opacity:0;
  pointer-events:none;
  transition:.2s;
  z-index:100;
}

.toast.show{
  opacity:1;
  transform:translateX(-50%);
}

@media(max-width:760px){
  .sidebar{
    position:fixed;
    left:0;
    top:0;
    bottom:0;
    transform:translateX(-100%);
    transition:transform .2s ease;
    box-shadow:10px 0 30px rgba(0,0,0,.4);
  }

  .sidebar.open{
    transform:translateX(0);
  }

  .overlay.open{
    display:block;
  }

  .mobile-menu{
    display:grid;
    place-items:center;
  }

  .model-info{
    display:none;
  }

  .topbar{
    justify-content:center;
  }

  .composer-area{
    left:0;
    padding-left:10px;
    padding-right:10px;
  }

  .chat-inner{
    padding:23px 12px 170px;
  }

  .suggestions{
    grid-template-columns:1fr;
  }

  .welcome{
    min-height:60vh;
  }

  .welcome h1{
    font-size:24px;
  }

  .scroll-bottom{
    right:14px;
    bottom:105px;
  }

  .content{
    font-size:14.5px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar" id="sidebar">

    <div class="brand">
      <div class="brand-logo">A</div>
      <span>AetherAI</span>
    </div>

    <button class="new-chat" id="newChat">
      <span>＋</span>
      <span>New chat</span>
    </button>

    <input
      class="sidebar-search"
      id="searchChats"
      placeholder="Search chats..."
      autocomplete="off"
    >

    <div class="history" id="history">
      <div class="history-title">Chats</div>
    </div>

    <div class="sidebar-bottom">

      <button class="side-button" id="memoryButton">
        🧠 Memory
      </button>

      <button class="side-button" id="homeButton">
        ⊞ Add to Home Screen
      </button>

    </div>

  </aside>

  <div class="overlay" id="overlay"></div>

  <main class="main">

    <header class="topbar">

      <button class="mobile-menu" id="mobileMenu">
        ☰
      </button>

      <select class="model-select" id="modelSelect">
        <option>Loading models...</option>
      </select>

      <div class="model-info" id="modelInfo"></div>

    </header>

    <section class="chat-scroll" id="chatScroll">

      <div class="chat-inner" id="chatInner">

        <div class="welcome" id="welcome">

          <div class="welcome-logo">A</div>

          <h1>How can I help?</h1>

          <p>Your personal AI assistant.</p>

          <div class="suggestions">

            <button class="suggestion">
              Explain something to me simply
            </button>

            <button class="suggestion">
              Help me write something
            </button>

            <button class="suggestion">
              Analyze an idea
            </button>

            <button class="suggestion">
              Write code for me
            </button>

          </div>

        </div>

        <div id="messages"></div>

      </div>

    </section>

    <button
      class="scroll-bottom"
      id="scrollBottom"
      title="Scroll to bottom"
    >
      ↓
    </button>

    <div class="composer-area">

      <div class="composer">

        <div class="attachments" id="attachments"></div>

        <div class="composer-row">

          <button
            class="tool-button"
            id="attachButton"
            title="Attach file"
          >
            ＋
          </button>

          <input
            class="file-input"
            id="fileInput"
            type="file"
            multiple
            accept="image/*,.txt,.md,.json,.csv,.js,.html,.css,.py,.xml,.yaml,.yml,.pdf,.doc,.docx"
          >

          <textarea
            id="prompt"
            rows="1"
            placeholder="Message AetherAI..."
            autocomplete="off"
          ></textarea>

          <button
            class="tool-button"
            id="imageButton"
            title="Generate image"
          >
            ◈
          </button>

          <button
            class="send-button"
            id="sendButton"
            title="Send"
          >
            ↑
          </button>

        </div>

      </div>

      <div class="bottom-note">
        AetherAI can make mistakes. Check important information.
      </div>

    </div>

  </main>

</div>

<div class="memory-panel" id="memoryPanel">

  <div class="memory-box">

    <h2>Memory</h2>

    <div class="memory-list" id="memoryList">
      No saved memories.
    </div>

    <button class="memory-close" id="memoryClose">
      Close
    </button>

  </div>

</div>

<div class="toast" id="toast"></div>

<script>
(function(){

"use strict";

const state = {
  chats: [],
  currentChatId: null,
  memories: [],
  models: [],
  selectedModel: "",
  attachments: [],
  controller: null,
  generating: false
};

const els = {
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  mobileMenu: document.getElementById("mobileMenu"),
  newChat: document.getElementById("newChat"),
  searchChats: document.getElementById("searchChats"),
  history: document.getElementById("history"),
  memoryButton: document.getElementById("memoryButton"),
  homeButton: document.getElementById("homeButton"),
  memoryPanel: document.getElementById("memoryPanel"),
  memoryList: document.getElementById("memoryList"),
  memoryClose: document.getElementById("memoryClose"),
  modelSelect: document.getElementById("modelSelect"),
  modelInfo: document.getElementById("modelInfo"),
  chatScroll: document.getElementById("chatScroll"),
  chatInner: document.getElementById("chatInner"),
  welcome: document.getElementById("welcome"),
  messages: document.getElementById("messages"),
  prompt: document.getElementById("prompt"),
  sendButton: document.getElementById("sendButton"),
  imageButton: document.getElementById("imageButton"),
  attachButton: document.getElementById("attachButton"),
  fileInput: document.getElementById("fileInput"),
  attachments: document.getElementById("attachments"),
  scrollBottom: document.getElementById("scrollBottom"),
  toast: document.getElementById("toast")
};

function uid(){
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
}

function showToast(message){
  els.toast.textContent = message;
  els.toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(function(){
    els.toast.classList.remove("show");
  }, 2200);
}

function escapeHTML(value){
  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function loadStorage(){
  try{
    state.chats =
      JSON.parse(localStorage.getItem("aether_chats") || "[]");

    state.memories =
      JSON.parse(localStorage.getItem("aether_memories") || "[]");

    state.selectedModel =
      localStorage.getItem("aether_model") || "";
  }catch(_){
    state.chats = [];
    state.memories = [];
    state.selectedModel = "";
  }
}

function saveStorage(){
  localStorage.setItem(
    "aether_chats",
    JSON.stringify(state.chats)
  );

  localStorage.setItem(
    "aether_memories",
    JSON.stringify(state.memories)
  );

  localStorage.setItem(
    "aether_model",
    state.selectedModel
  );
}

function getCurrentChat(){
  return state.chats.find(
    chat => chat.id === state.currentChatId
  );
}

function createChat(){
  const chat = {
    id: uid(),
    title: "New chat",
    created: Date.now(),
    messages: []
  };

  state.chats.unshift(chat);
  state.currentChatId = chat.id;

  saveStorage();
  renderHistory();
  renderMessages();

  closeSidebar();
  els.prompt.focus();
}

function ensureChat(){
  if(getCurrentChat()) return;

  createChat();
}

function titleFromMessage(text){
  const clean = String(text || "")
    .replace(/\\s+/g," ")
    .trim();

  if(!clean) return "New chat";

  return clean.length > 42
    ? clean.slice(0,42) + "..."
    : clean;
}

function renderHistory(){
  const query =
    String(els.searchChats.value || "")
      .toLowerCase()
      .trim();

  els.history.innerHTML =
    '<div class="history-title">Chats</div>';

  const chats = state.chats.filter(chat => {
    if(!query) return true;

    return String(chat.title || "")
      .toLowerCase()
      .includes(query);
  });

  if(!chats.length){
    const empty = document.createElement("div");

    empty.style.cssText =
      "padding:14px 10px;color:#666;font-size:12px";

    empty.textContent = "No chats";

    els.history.appendChild(empty);

    return;
  }

  chats.forEach(chat => {

    const button = document.createElement("button");

    button.className =
      "chat-item" +
      (chat.id === state.currentChatId ? " active" : "");

    const span = document.createElement("span");

    span.textContent =
      chat.title || "New chat";

    button.appendChild(span);

    button.addEventListener("click",function(){

      state.currentChatId = chat.id;

      saveStorage();
      renderHistory();
      renderMessages();
      closeSidebar();

    });

    els.history.appendChild(button);
  });
}

function renderMessages(){
  els.messages.innerHTML = "";

  const chat = getCurrentChat();

  if(!chat || !chat.messages.length){
    els.welcome.style.display = "flex";
    return;
  }

  els.welcome.style.display = "none";

  chat.messages.forEach((message,index) => {
    addMessageElement(
      message.role,
      message.content,
      index
    );
  });

  setTimeout(scrollToBottom,0);
}

function addMessageElement(role, content, index){
  const wrapper = document.createElement("div");

  wrapper.className =
    "message " +
    (role === "user" ? "user" : "assistant");

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    role === "user" ? "U" : "A";

  const body = document.createElement("div");

  body.className = "message-body";

  const name = document.createElement("div");

  name.className = "message-name";

  name.textContent =
    role === "user" ? "You" : "AetherAI";

  const contentBox = document.createElement("div");

  contentBox.className = "content";

  if(role === "user"){
    contentBox.innerHTML =
      escapeHTML(content)
        .replace(/\\n/g,"<br>");
  }else{
    contentBox.innerHTML =
      renderMarkdown(content);
  }

  body.appendChild(name);
  body.appendChild(contentBox);

  if(role === "assistant"){

    const actions = document.createElement("div");

    actions.className = "message-actions";

    const copy = document.createElement("button");

    copy.textContent = "Copy";

    copy.addEventListener("click",function(){
      copyText(content);
    });

    actions.appendChild(copy);

    if(index > 0){

      const regenerate = document.createElement("button");

      regenerate.textContent = "Regenerate";

      regenerate.addEventListener(
        "click",
        function(){
          regenerateMessage(index);
        }
      );

      actions.appendChild(regenerate);
    }

    body.appendChild(actions);

  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(body);

  els.messages.appendChild(wrapper);

  activateCodeButtons(wrapper);
}

function renderMarkdown(text){
  let source = String(text || "");

  const codeBlocks = [];

  const fencePattern =
    /```([a-zA-Z0-9_+-]*)\\n?([\\s\\S]*?)```/g;

  source = source.replace(
    fencePattern,
    function(_, language, code){

      const id = codeBlocks.length;

      codeBlocks.push({
        language: language || "code",
        code
      });

      return "%%CODEBLOCK" + id + "%%";
    }
  );

  const inlineCodes = [];

  const tick = String.fromCharCode(96);

  const inlinePattern =
    new RegExp(
      tick +
      "([^" +
      tick +
      "]+)" +
      tick,
      "g"
    );

  source = source.replace(
    inlinePattern,
    function(_, code){

      const id = inlineCodes.length;

      inlineCodes.push(
        '<span class="inline-code">' +
        escapeHTML(code) +
        "</span>"
      );

      return "%%INLINECODE" + id + "%%";
    }
  );

  source = escapeHTML(source);

  source = source.replace(
    /^### (.+)$/gm,
    "<h3>$1</h3>"
  );

  source = source.replace(
    /^## (.+)$/gm,
    "<h2>$1</h2>"
  );

  source = source.replace(
    /^# (.+)$/gm,
    "<h1>$1</h1>"
  );

  source = source.replace(
    /^> (.+)$/gm,
    "<blockquote>$1</blockquote>"
  );

  source = source.replace(
    /\\*\\*([^*]+)\\*\\*/g,
    "<strong>$1</strong>"
  );

  source = source.replace(
    /__([^_]+)__/g,
    "<strong>$1</strong>"
  );

  source = source.replace(
    /\\*([^*\\n]+)\\*/g,
    "<em>$1</em>"
  );

  source = source.replace(
    /_([^_\\n]+)_/g,
    "<em>$1</em>"
  );

  source = source.replace(
    /\$begin:math:display$\(\[\^\\$end:math:display$]+)\\]\$begin:math:text$\(\[\^\)\]\+\)\\$end:math:text$/g,
    function(_,label,url){

      const safe = safeURL(url);

      if(safe === "#"){
        return label;
      }

      return '<a href="' +
        escapeHTML(safe) +
        '" target="_blank" rel="noopener noreferrer">' +
        label +
        "</a>";
    }
  );

  const lines = source.split("\\n");

  let output = "";
  let listOpen = false;
  let orderedOpen = false;

  for(let i=0;i<lines.length;i++){

    const line = lines[i];

    const unordered =
      /^\\s*[-*] (.+)$/.exec(line);

    const ordered =
      /^\\s*\\d+\\. (.+)$/.exec(line);

    if(unordered){

      if(orderedOpen){
        output += "</ol>";
        orderedOpen = false;
      }

      if(!listOpen){
        output += "<ul>";
        listOpen = true;
      }

      output += "<li>" + unordered[1] + "</li>";
      continue;
    }

    if(ordered){

      if(listOpen){
        output += "</ul>";
        listOpen = false;
      }

      if(!orderedOpen){
        output += "<ol>";
        orderedOpen = true;
      }

      output += "<li>" + ordered[1] + "</li>";
      continue;
    }

    if(listOpen){
      output += "</ul>";
      listOpen = false;
    }

    if(orderedOpen){
      output += "</ol>";
      orderedOpen = false;
    }

    if(!line.trim()){
      continue;
    }

    if(
      line.startsWith("<h1>") ||
      line.startsWith("<h2>") ||
      line.startsWith("<h3>") ||
      line.startsWith("<blockquote>")
    ){
      output += line;
    }else{
      output += "<p>" + line + "</p>";
    }
  }

  if(listOpen) output += "</ul>";
  if(orderedOpen) output += "</ol>";

  output = output.replace(
    /%%INLINECODE(\\d+)%%/g,
    function(_,id){
      return inlineCodes[Number(id)] || "";
    }
  );

  output = output.replace(
    /%%CODEBLOCK(\\d+)%%/g,
    function(_,id){

      const block =
        codeBlocks[Number(id)];

      if(!block) return "";

      const encoded =
        escapeHTML(block.code);

      return (
        '<div class="code-wrap">' +
          '<div class="code-head">' +
            "<span>" +
              escapeHTML(block.language) +
            "</span>" +
            '<button class="code-copy" data-code="' +
              escapeHTML(block.code) +
            '">Copy</button>' +
          "</div>" +
          "<pre><code>" +
            encoded +
          "</code></pre>" +
        "</div>"
      );
    }
  );

  return output;
}

function safeURL(value){
  try{
    const url = new URL(String(value || ""));

    if(
      url.protocol === "https:" ||
      url.protocol === "http:"
    ){
      return url.href;
    }

  }catch(_){}

  return "#";
}

function activateCodeButtons(root){
  root.querySelectorAll(".code-copy")
    .forEach(button => {

      button.addEventListener(
        "click",
        function(){

          const code =
            button.getAttribute("data-code") || "";

          copyText(code);

        }
      );

    });
}

async function copyText(value){
  try{
    await navigator.clipboard.writeText(
      String(value || "")
    );

    showToast("Copied");

  }catch(_){
    showToast("Copy failed");
  }
}

function isNearBottom(){
  const distance =
    els.chatScroll.scrollHeight -
    els.chatScroll.scrollTop -
    els.chatScroll.clientHeight;

  return distance < 180;
}

function scrollToBottom(force){
  if(force || isNearBottom()){
    els.chatScroll.scrollTop =
      els.chatScroll.scrollHeight;
  }
}

function updateScrollButton(){
  const distance =
    els.chatScroll.scrollHeight -
    els.chatScroll.scrollTop -
    els.chatScroll.clientHeight;

  els.scrollBottom.classList.toggle(
    "show",
    distance > 350
  );
}

function resizePrompt(){
  els.prompt.style.height = "auto";

  els.prompt.style.height =
    Math.min(
      els.prompt.scrollHeight,
      180
    ) + "px";
}

function updateAttachments(){
  els.attachments.innerHTML = "";

  if(!state.attachments.length){
    els.attachments.classList.remove("show");
    return;
  }

  els.attachments.classList.add("show");

  state.attachments.forEach((file,index) => {

    const item = document.createElement("div");

    item.className = "attachment";

    item.textContent =
      file.name +
      " ×";

    item.style.cursor = "pointer";

    item.addEventListener(
      "click",
      function(){

        state.attachments.splice(index,1);

        updateAttachments();

      }
    );

    els.attachments.appendChild(item);
  });
}

async function readFile(file){

  if(file.size > 8 * 1024 * 1024){
    throw new Error(
      file.name + " is larger than 8 MB."
    );
  }

  if(file.type.startsWith("image/")){

    const dataURL =
      await fileToDataURL(file);

    return {
      name:file.name,
      type:"image",
      dataURL,
      text:""
    };
  }

  if(
    file.type === "text/plain" ||
    file.type === "text/markdown" ||
    file.name.match(
      /\\.(txt|md|json|csv|js|html|css|py|xml|yaml|yml)$/i
    )
  ){

    const content =
      await file.text();

    return {
      name:file.name,
      type:"text",
      dataURL:"",
      text:content.slice(0,30000)
    };
  }

  return {
    name:file.name,
    type:"file",
    dataURL:"",
    text:
      "[Attached file: " +
      file.name +
      "]"
  };
}

function fileToDataURL(file){
  return new Promise(
    function(resolve,reject){

      const reader =
        new FileReader();

      reader.onload =
        function(){
          resolve(reader.result);
        };

      reader.onerror =
        reject;

      reader.readAsDataURL(file);

    }
  );
}

async function handleFiles(fileList){

  const files =
    Array.from(fileList || []);

  for(const file of files){

    try{

      const parsed =
        await readFile(file);

      state.attachments.push(parsed);

    }catch(error){

      showToast(
        error.message || "File failed"
      );

    }
  }

  updateAttachments();
}

function buildUserMessage(text){

  const images =
    state.attachments.filter(
      item => item.type === "image"
    );

  const textFiles =
    state.attachments.filter(
      item => item.type !== "image"
    );

  let combined = text;

  if(textFiles.length){

    combined += "\\n\\nAttached files:\\n";

    textFiles.forEach(file => {

      combined +=
        "\\n--- " +
        file.name +
        " ---\\n" +
        file.text +
        "\\n";

    });
  }

  if(!images.length){
    return combined;
  }

  const parts = [];

  parts.push({
    type:"text",
    text:combined
  });

  images.forEach(image => {

    parts.push({
      type:"image_url",
      image_url:{
        url:image.dataURL
      }
    });

  });

  return parts;
}

function displayUserContent(content){

  if(typeof content === "string"){
    return content;
  }

  if(Array.isArray(content)){

    const first =
      content.find(
        item => item.type === "text"
      );

    return first
      ? first.text
      : "[Image]";
  }

  return "";
}

async function sendMessage(){

  if(state.generating){
    return;
  }

  const text =
    els.prompt.value.trim();

  if(!text && !state.attachments.length){
    return;
  }

  ensureChat();

  const chat =
    getCurrentChat();

  const userContent =
    buildUserMessage(text);

  const displayText =
    displayUserContent(userContent) ||
    "[Image attachment]";

  chat.messages.push({
    role:"user",
    content:displayText
  });

  if(
    chat.title === "New chat"
  ){
    chat.title =
      titleFromMessage(displayText);
  }

  state.attachments = [];

  updateAttachments();

  els.prompt.value = "";

  resizePrompt();

  saveStorage();
  renderHistory();

  addMessageElement(
    "user",
    displayText,
    chat.messages.length - 1
  );

  els.welcome.style.display = "none";

  const assistantIndex =
    chat.messages.length;

  chat.messages.push({
    role:"assistant",
    content:""
  });

  addMessageElement(
    "assistant",
    "",
    assistantIndex
  );

  const assistantElements =
    els.messages.querySelectorAll(
      ".message.assistant"
    );

  const assistantElement =
    assistantElements[
      assistantElements.length - 1
    ];

  const contentBox =
    assistantElement.querySelector(".content");

  state.generating = true;
  state.controller = new AbortController();

  setSendingUI(true);

  const shouldStick =
    isNearBottom();

  try{

    const response =
      await fetch("/api/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        signal:state.controller.signal,
        body:JSON.stringify({
          model:state.selectedModel,
          messages:chat.messages
            .filter(
              message =>
                message.content !== ""
            )
            .map(message => ({
              role:message.role,
              content:
                message.role === "user" &&
                displayText === message.content &&
                userContent !== message.content &&
                message === chat.messages[
                  chat.messages.length - 2
                ]
                  ? userContent
                  : message.content
            })),
          memories:state.memories,
          temperature:.7,
          max_tokens:4096
        })
      });

    if(!response.ok){

      let message =
        "Request failed (" +
        response.status +
        ")";

      try{
        const data =
          await response.json();

        if(data.error){
          message = data.error;
        }
      }catch(_){}

      throw new Error(message);
    }

    if(!response.body){
      throw new Error(
        "No streaming response received."
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";
    let fullText = "";

    while(true){

      const result =
        await reader.read();

      if(result.done) break;

      buffer +=
        decoder.decode(
          result.value,
          {stream:true}
        );

      const lines =
        buffer.split("\\n");

      buffer =
        lines.pop() || "";

      for(const line of lines){

        const trimmed =
          line.trim();

        if(!trimmed) continue;

        if(
          !trimmed.startsWith("data:")
        ){
          continue;
        }

        const data =
          trimmed.slice(5).trim();

        if(data === "[DONE]"){
          continue;
        }

        try{

          const parsed =
            JSON.parse(data);

          const delta =
            extractDelta(parsed);

          if(delta){

            fullText += delta;

            chat.messages[
              chat.messages.length - 1
            ].content = fullText;

            contentBox.innerHTML =
              renderMarkdown(fullText);

            activateCodeButtons(
              assistantElement
            );

            if(shouldStick){
              scrollToBottom(true);
            }
          }

        }catch(_){
        }
      }
    }

    if(!fullText){

      contentBox.innerHTML =
        "<p>No response was returned.</p>";

      chat.messages[
        chat.messages.length - 1
      ].content =
        "No response was returned.";
    }

    saveStorage();

  }catch(error){

    if(error.name === "AbortError"){

      if(!chat.messages[
        chat.messages.length - 1
      ].content){

        chat.messages[
          chat.messages.length - 1
        ].content =
          "Generation stopped.";

        contentBox.innerHTML =
          "<p>Generation stopped.</p>";
      }

    }else{

      const message =
        error.message ||
        "Something went wrong.";

      chat.messages[
        chat.messages.length - 1
      ].content =
        "Error: " + message;

      contentBox.innerHTML =
        "<p><strong>Error:</strong> " +
        escapeHTML(message) +
        "</p>";
    }

    saveStorage();

  }finally{

    state.generating = false;
    state.controller = null;

    setSendingUI(false);

    activateCodeButtons(
      assistantElement
    );
  }
}

function extractDelta(data){

  if(
    data &&
    data.choices &&
    data.choices[0]
  ){

    const choice =
      data.choices[0];

    if(
      choice.delta &&
      typeof choice.delta.content === "string"
    ){
      return choice.delta.content;
    }

    if(
      typeof choice.text === "string"
    ){
      return choice.text;
    }

    if(
      choice.message &&
      typeof choice.message.content === "string"
    ){
      return choice.message.content;
    }
  }

  if(
    data &&
    typeof data.content === "string"
  ){
    return data.content;
  }

  return "";
}

function setSendingUI(active){

  if(active){

    els.sendButton.textContent = "■";
    els.sendButton.classList.add(
      "stop-button"
    );
    els.sendButton.title =
      "Stop generation";

  }else{

    els.sendButton.textContent = "↑";
    els.sendButton.classList.remove(
      "stop-button"
    );
    els.sendButton.title =
      "Send";
  }

  els.sendButton.disabled = false;
}

function stopGeneration(){

  if(
    state.generating &&
    state.controller
  ){
    state.controller.abort();
  }
}

function regenerateMessage(index){

  if(state.generating) return;

  const chat =
    getCurrentChat();

  if(!chat) return;

  if(
    index <= 0 ||
    !chat.messages[index] ||
    chat.messages[index].role !== "assistant"
  ){
    return;
  }

  const previous =
    chat.messages[index - 1];

  if(
    !previous ||
    previous.role !== "user"
  ){
    return;
  }

  chat.messages =
    chat.messages.slice(0,index);

  const oldUser =
    previous.content;

  const lastUser =
    chat.messages[
      chat.messages.length - 1
    ];

  if(
    lastUser &&
    lastUser.role === "user"
  ){

    chat.messages.push({
      role:"assistant",
      content:""
    });

  }

  saveStorage();
  renderMessages();

  generateFromExistingChat();
}

async function generateFromExistingChat(){

  const chat =
    getCurrentChat();

  if(!chat || state.generating) return;

  const assistantIndex =
    chat.messages.length - 1;

  const assistantElement =
    els.messages.querySelectorAll(
      ".message.assistant"
    )[assistantIndex];

  if(!assistantElement) return;

  const contentBox =
    assistantElement.querySelector(".content");

  state.generating = true;
  state.controller = new AbortController();

  setSendingUI(true);

  const shouldStick =
    isNearBottom();

  try{

    const response =
      await fetch("/api/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        signal:state.controller.signal,
        body:JSON.stringify({
          model:state.selectedModel,
          messages:chat.messages
            .filter(
              x => x.content !== ""
            ),
          memories:state.memories,
          temperature:.7,
          max_tokens:4096
        })
      });

    if(!response.ok){
      throw new Error(
        "Request failed: " +
        response.status
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";
    let fullText = "";

    while(true){

      const result =
        await reader.read();

      if(result.done) break;

      buffer +=
        decoder.decode(
          result.value,
          {stream:true}
        );

      const lines =
        buffer.split("\\n");

      buffer =
        lines.pop() || "";

      for(const line of lines){

        if(!line.startsWith("data:")){
          continue;
        }

        const data =
          line.slice(5).trim();

        if(data === "[DONE]"){
          continue;
        }

        try{

          const parsed =
            JSON.parse(data);

          const delta =
            extractDelta(parsed);

          if(delta){

            fullText += delta;

            chat.messages[
              chat.messages.length - 1
            ].content = fullText;

            contentBox.innerHTML =
              renderMarkdown(fullText);

            activateCodeButtons(
              assistantElement
            );

            if(shouldStick){
              scrollToBottom(true);
            }
          }

        }catch(_){}
      }
    }

    saveStorage();

  }catch(error){

    if(error.name === "AbortError"){
      contentBox.innerHTML =
        "<p>Generation stopped.</p>";
    }else{
      contentBox.innerHTML =
        "<p><strong>Error:</strong> " +
        escapeHTML(error.message) +
        "</p>";
    }

  }finally{

    state.generating = false;
    state.controller = null;

    setSendingUI(false);
  }
}

async function generateImage(){

  if(state.generating) return;

  let prompt =
    els.prompt.value.trim();

  if(!prompt){

    prompt =
      window.prompt(
        "Describe the image you want:"
      ) || "";

    prompt = prompt.trim();
  }

  if(!prompt) return;

  ensureChat();

  state.generating = true;
  setSendingUI(true);

  const chat =
    getCurrentChat();

  const userMessage =
    "Create an image: " + prompt;

  chat.messages.push({
    role:"user",
    content:userMessage
  });

  if(chat.title === "New chat"){
    chat.title =
      titleFromMessage(userMessage);
  }

  saveStorage();
  renderHistory();

  addMessageElement(
    "user",
    userMessage,
    chat.messages.length - 1
  );

  try{

    const response =
      await fetch(
        "/api/generate-image",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            prompt
          })
        }
      );

    const data =
      await response.json();

    if(!response.ok){
      throw new Error(
        data.error ||
        "Image generation failed."
      );
    }

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "message assistant";

    wrapper.innerHTML =
      '<div class="avatar">A</div>' +
      '<div class="message-body">' +
        '<div class="message-name">AetherAI</div>' +
        '<div class="content">' +
          '<p>Generated image:</p>' +
          '<div class="image-result">' +
            '<img src="' +
              data.image +
            '" alt="Generated image">' +
            '<div class="image-buttons">' +
              '<a href="' +
                data.image +
              '" target="_blank">Open</a>' +
              '<a href="' +
                data.image +
              '" download="aetherai-image.jpg">Save</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    els.messages.appendChild(wrapper);

    chat.messages.push({
      role:"assistant",
      content:"[Generated image]"
    });

    saveStorage();

    scrollToBottom(true);

  }catch(error){

    const message =
      error.message ||
      "Image generation failed.";

    chat.messages.push({
      role:"assistant",
      content:"Error: " + message
    });

    addMessageElement(
      "assistant",
      "Error: " + message,
      chat.messages.length - 1
    );

    saveStorage();

  }finally{

    state.generating = false;

    setSendingUI(false);
  }
}

async function loadModels(){

  try{

    const response =
      await fetch("/api/models",{
        cache:"no-store"
      });

    const data =
      await response.json();

    const models =
      Array.isArray(data.data)
        ? data.data
        : [];

    state.models = models;

    els.modelSelect.innerHTML = "";

    if(!models.length){

      const option =
        document.createElement("option");

      option.value = "";
      option.textContent =
        "No models available";

      els.modelSelect.appendChild(
        option
      );

      els.modelInfo.textContent =
        data.error || "";

      return;
    }

    models.forEach(model => {

      const option =
        document.createElement("option");

      option.value =
        model.id || "";

      option.textContent =
        model.name ||
        model.id ||
        "Model";

      els.modelSelect.appendChild(
        option
      );
    });

    const exists =
      models.some(
        model =>
          model.id === state.selectedModel
      );

    if(!exists){

      state.selectedModel =
        models[0].id || "";

      saveStorage();
    }

    els.modelSelect.value =
      state.selectedModel;

    updateModelInfo();

  }catch(error){

    els.modelSelect.innerHTML =
      "<option>Model loading failed</option>";

    els.modelInfo.textContent =
      error.message || "";
  }
}

function updateModelInfo(){

  const model =
    state.models.find(
      x => x.id === state.selectedModel
    );

  if(!model){

    els.modelInfo.textContent = "";
    return;
  }

  const caps =
    Array.isArray(model.capabilities)
      ? model.capabilities
      : [];

  els.modelInfo.textContent =
    caps.length
      ? caps.join(" • ")
      : "";
}

function showMemory(){

  els.memoryPanel.classList.add("show");

  if(!state.memories.length){

    els.memoryList.textContent =
      "No saved memories.";

    return;
  }

  els.memoryList.innerHTML =
    state.memories
      .map(
        memory =>
          "<div>• " +
          escapeHTML(memory) +
          "</div>"
      )
      .join("");
}

function extractMemory(text){

  const value =
    String(text || "").trim();

  const patterns = [
    /remember(?: that)? (.+)/i,
    /my name is (.+)/i,
    /i prefer (.+)/i,
    /i like (.+)/i
  ];

  for(const pattern of patterns){

    const match =
      pattern.exec(value);

    if(match){

      const memory =
        match[1]
          .trim()
          .slice(0,300);

      if(
        memory &&
        !state.memories.includes(memory)
      ){

        state.memories.push(memory);

        state.memories =
          state.memories.slice(-30);

        saveStorage();

        showToast("Memory saved");
      }

      break;
    }
  }
}

function openSidebar(){
  els.sidebar.classList.add("open");
  els.overlay.classList.add("open");
}

function closeSidebar(){
  els.sidebar.classList.remove("open");
  els.overlay.classList.remove("open");
}

function newChat(){
  if(state.generating){
    showToast("Stop generation first");
    return;
  }

  createChat();
}

function sendOrStop(){

  if(state.generating){
    stopGeneration();
    return;
  }

  sendMessage();
}

els.newChat.addEventListener(
  "click",
  newChat
);

els.mobileMenu.addEventListener(
  "click",
  openSidebar
);

els.overlay.addEventListener(
  "click",
  closeSidebar
);

els.searchChats.addEventListener(
  "input",
  renderHistory
);

els.memoryButton.addEventListener(
  "click",
  showMemory
);

els.memoryClose.addEventListener(
  "click",
  function(){
    els.memoryPanel.classList.remove("show");
  }
);

els.homeButton.addEventListener(
  "click",
  async function(){

    if(
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches
    ){

      showToast("Already installed");

      return;
    }

    if(
      "BeforeInstallPromptEvent" in window &&
      window.__installPrompt
    ){

      window.__installPrompt.prompt();

      try{
        await window.__installPrompt.userChoice;
      }catch(_){}

      window.__installPrompt = null;

      return;
    }

    showToast(
      "On iPhone: Share → Add to Home Screen"
    );
  }
);

window.addEventListener(
  "beforeinstallprompt",
  function(event){

    event.preventDefault();

    window.__installPrompt = event;

  }
);

els.modelSelect.addEventListener(
  "change",
  function(){

    state.selectedModel =
      els.modelSelect.value;

    saveStorage();

    updateModelInfo();
  }
);

els.attachButton.addEventListener(
  "click",
  function(){
    els.fileInput.click();
  }
);

els.fileInput.addEventListener(
  "change",
  async function(){

    await handleFiles(
      els.fileInput.files
    );

    els.fileInput.value = "";
  }
);

els.imageButton.addEventListener(
  "click",
  generateImage
);

els.sendButton.addEventListener(
  "click",
  sendOrStop
);

els.prompt.addEventListener(
  "input",
  resizePrompt
);

els.prompt.addEventListener(
  "keydown",
  function(event){

    if(
      event.key === "Enter" &&
      !event.shiftKey
    ){

      event.preventDefault();

      sendOrStop();
    }
  }
);

els.chatScroll.addEventListener(
  "scroll",
  updateScrollButton
);

els.scrollBottom.addEventListener(
  "click",
  function(){
    scrollToBottom(true);
  }
);

document.querySelectorAll(
  ".suggestion"
).forEach(button => {

  button.addEventListener(
    "click",
    function(){

      els.prompt.value =
        button.textContent.trim();

      resizePrompt();
      els.prompt.focus();

    }
  );

});

window.addEventListener(
  "keydown",
  function(event){

    if(
      event.key === "/" &&
      document.activeElement !== els.prompt &&
      document.activeElement !== els.searchChats
    ){

      event.preventDefault();

      els.prompt.focus();
    }

    if(
      event.key === "Escape" &&
      state.generating
    ){
      stopGeneration();
    }
  }
);

async function boot(){

  loadStorage();

  if(!state.chats.length){
    createChat();
  }else{

    state.currentChatId =
      state.chats[0].id;

    renderHistory();
    renderMessages();
  }

  updateAttachments();

  await loadModels();

  resizePrompt();
}

boot();

})();
</script>

</body>
</html>`;
}

export default {
  async fetch(request, env) {

    if(request.method === "OPTIONS"){
      return new Response(null,{
        status:204,
        headers:corsHeaders()
      });
    }

    const url =
      new URL(request.url);

    if(
      request.method === "GET" &&
      url.pathname === "/api/health"
    ){

      return json({
        ok:true,
        name:"AetherAI",
        codecraft:!!getApiKey(env),
        workersAI:!!env.AI,
        time:new Date().toISOString()
      });
    }

    if(
      request.method === "GET" &&
      url.pathname === "/api/models"
    ){

      return handleModels(env);
    }

    if(
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ){

      return handleChat(
        request,
        env
      );
    }

    if(
      request.method === "POST" &&
      url.pathname === "/api/generate-image"
    ){

      return handleImageGeneration(
        request,
        env
      );
    }

    if(
      request.method === "GET" &&
      url.pathname === "/manifest.json"
    ){

      return json(manifest());
    }

    if(
      request.method === "GET" &&
      url.pathname === "/icon.svg"
    ){

      return text(
        iconSvg(),
        "image/svg+xml"
      );
    }

    if(
      request.method === "GET" &&
      url.pathname === "/sw.js"
    ){

      return text(
        serviceWorker(),
        "application/javascript; charset=utf-8"
      );
    }

    if(
      request.method === "GET" &&
      (
        url.pathname === "/" ||
        url.pathname === "/index.html"
      )
    ){

      return html(appHTML());
    }

    return new Response(
      "Not found",
      {
        status:404,
        headers:corsHeaders()
      }
    );
  }
};
