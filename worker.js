const CODECRAFT_BASE = "https://www.codecraftapi.com/v1";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    try {
      if (url.pathname === "/api/health") {
        return json({
          ok: true,
          service: "AetherAI",
          time: new Date().toISOString(),
          codecraft: Boolean(getApiKey(env)),
          imageAI: Boolean(env.AI)
        });
      }

      if (url.pathname === "/api/models" && request.method === "GET") {
        return await handleModels(env);
      }

      if (url.pathname === "/api/chat" && request.method === "POST") {
        return await handleChat(request, env);
      }

      if (
        url.pathname === "/api/generate-image" &&
        request.method === "POST"
      ) {
        return await handleImage(request, env);
      }

      if (url.pathname === "/manifest.json") {
        return new Response(manifest(), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            ...corsHeaders()
          }
        });
      }

      if (url.pathname === "/icon.svg") {
        return new Response(iconSVG(), {
          headers: {
            "content-type": "image/svg+xml",
            ...corsHeaders()
          }
        });
      }

      if (url.pathname === "/sw.js") {
        return new Response(serviceWorker(), {
          headers: {
            "content-type": "application/javascript; charset=utf-8",
            "cache-control": "no-cache"
          }
        });
      }

      if (
        request.method === "GET" &&
        (
          url.pathname === "/" ||
          url.pathname === "/index.html"
        )
      ) {
        return new Response(appHTML(), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-cache"
          }
        });
      }

      return new Response("Not Found", {
        status: 404,
        headers: corsHeaders()
      });

    } catch (error) {
      return json(
        {
          error: error instanceof Error
            ? error.message
            : String(error)
        },
        500
      );
    }
  }
};


/* =========================================================
   CONFIG
========================================================= */

function getApiKey(env) {
  return (
    env.CODECRAFT_API_KEY ||
    env.XKIRO_API_KEY ||
    ""
  );
}


/* =========================================================
   CORS
========================================================= */

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-expose-headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}


/* =========================================================
   CODECRAFT
========================================================= */

async function codecraftRequest(env, path, options = {}) {
  const apiKey = getApiKey(env);

  if (!apiKey) {
    throw new Error(
      "CODECRAFT_API_KEY is missing. Add it in Cloudflare Workers Secrets."
    );
  }

  const headers = new Headers(options.headers || {});

  headers.set("Authorization", "Bearer " + apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    CODECRAFT_BASE + path,
    {
      ...options,
      headers
    }
  );

  return response;
}


/* =========================================================
   MODELS
========================================================= */

async function handleModels(env) {
  const response = await codecraftRequest(
    env,
    "/models",
    {
      method: "GET"
    }
  );

  const text = await response.text();

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: "Could not load CodeCraft models.",
        status: response.status,
        details: text.slice(0, 2000)
      }),
      {
        status: response.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...corsHeaders()
        }
      }
    );
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      data: []
    };
  }

  const models = Array.isArray(data)
    ? data
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.models)
        ? data.models
        : [];

  const cleaned = models.map(function(model) {
    return {
      id: model.id || "",
      name: model.name || model.id || "Unknown model",
      description: model.description || "",
      type: model.type || "chat",
      context_window: model.context_window || 0,
      capabilities: model.capabilities || {},
      pricing: model.pricing || {}
    };
  });

  return json({
    object: "list",
    data: cleaned
  });
}


/* =========================================================
   CHAT
========================================================= */

async function handleChat(request, env) {
  const body = await request.json();

  const model =
    body.model ||
    "";

  const messages =
    Array.isArray(body.messages)
      ? body.messages
      : [];

  if (!model) {
    return json(
      {
        error: "No model selected."
      },
      400
    );
  }

  if (!messages.length) {
    return json(
      {
        error: "No messages supplied."
      },
      400
    );
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

  if (typeof body.top_p === "number") {
    payload.top_p = body.top_p;
  }

  const response = await codecraftRequest(
    env,
    "/chat/completions",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    return new Response(
      JSON.stringify({
        error: "CodeCraft request failed.",
        status: response.status,
        details: errorText.slice(0, 4000)
      }),
      {
        status: response.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...corsHeaders()
        }
      }
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ||
        "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      ...corsHeaders()
    }
  });
}


/* =========================================================
   IMAGE GENERATION
========================================================= */

async function handleImage(request, env) {
  if (!env.AI) {
    return json(
      {
        error:
          "Cloudflare AI binding is missing."
      },
      500
    );
  }

  const body = await request.json();

  const prompt =
    String(body.prompt || "").trim();

  if (!prompt) {
    return json(
      {
        error: "Image prompt is empty."
      },
      400
    );
  }

  const seed =
    Number.isFinite(Number(body.seed))
      ? Number(body.seed)
      : Math.floor(Math.random() * 2147483647);

  const result = await env.AI.run(
    IMAGE_MODEL,
    {
      prompt,
      seed
    }
  );

  if (!result || !result.image) {
    throw new Error(
      "Cloudflare image model did not return an image."
    );
  }

  return json({
    image:
      "data:image/jpeg;base64," +
      result.image,
    model: IMAGE_MODEL
  });
}


/* =========================================================
   MANIFEST
========================================================= */

function manifest() {
  return JSON.stringify(
    {
      name: "AetherAI",
      short_name: "AetherAI",
      description: "Personal AI assistant",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#101010",
      theme_color: "#101010",
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ]
    },
    null,
    2
  );
}


/* =========================================================
   ICON
========================================================= */

function iconSVG() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    '<rect width="512" height="512" rx="120" fill="#101010"/>',
    '<rect x="92" y="92" width="328" height="328" rx="92" fill="#181818" stroke="#303030" stroke-width="8"/>',
    '<path d="M256 125c-76 0-137 55-137 123 0 43 25 81 64 103v48l48-28c8 1 17 2 25 2 76 0 137-55 137-123S332 125 256 125z" fill="#fff"/>',
    '<circle cx="203" cy="245" r="17" fill="#101010"/>',
    '<circle cx="256" cy="245" r="17" fill="#101010"/>',
    '<circle cx="309" cy="245" r="17" fill="#101010"/>',
    '</svg>'
  ].join("");
}


/* =========================================================
   SERVICE WORKER
========================================================= */

function serviceWorker() {
  return [
    'const CACHE = "aetherai-v1";',
    '',
    'self.addEventListener("install", function(event) {',
    '  event.waitUntil(',
    '    caches.open(CACHE).then(function(cache) {',
    '      return cache.addAll(["/", "/manifest.json", "/icon.svg"]);',
    '    })',
    '  );',
    '  self.skipWaiting();',
    '});',
    '',
    'self.addEventListener("activate", function(event) {',
    '  event.waitUntil(self.clients.claim());',
    '});',
    '',
    'self.addEventListener("fetch", function(event) {',
    '  if (event.request.method !== "GET") return;',
    '',
    '  const url = new URL(event.request.url);',
    '',
    '  if (url.pathname.startsWith("/api/")) return;',
    '',
    '  event.respondWith(',
    '    fetch(event.request).catch(function() {',
    '      return caches.match(event.request);',
    '    })',
    '  );',
    '});'
  ].join("\n");
}


/* =========================================================
   APP HTML
========================================================= */

function appHTML() {

  return String.raw`<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
>

<meta
  name="theme-color"
  content="#101010"
>

<meta
  name="mobile-web-app-capable"
  content="yes"
>

<meta
  name="apple-mobile-web-app-capable"
  content="yes"
>

<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
>

<link
  rel="manifest"
  href="/manifest.json"
>

<link
  rel="icon"
  href="/icon.svg"
>

<title>AetherAI</title>

<style>

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #101010;
  color: #ececec;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
textarea,
input {
  font: inherit;
}

button {
  border: 0;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
  background: #101010;
}

/* ================= SIDEBAR ================= */

.sidebar {
  width: 270px;
  height: 100%;
  flex-shrink: 0;
  background: #171717;
  border-right: 1px solid #292929;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.brand {
  height: 62px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 16px;
  border-bottom: 1px solid #292929;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #fff;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 17px;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
}

.new-chat {
  margin: 13px;
  padding: 12px 14px;
  border-radius: 9px;
  background: #fff;
  color: #111;
  font-weight: 650;
  cursor: pointer;
  text-align: left;
}

.new-chat:active {
  transform: scale(.98);
}

.side-actions {
  padding: 0 10px;
}

.side-button {
  width: 100%;
  padding: 11px 12px;
  color: #d8d8d8;
  background: transparent;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 2px;
}

.side-button:hover {
  background: #222;
}

.side-icon {
  display: inline-block;
  width: 25px;
  opacity: .8;
}

.history-title {
  padding: 16px 16px 8px;
  color: #777;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.history {
  flex: 1;
  overflow-y: auto;
  padding: 0 9px 12px;
}

.chat-item {
  position: relative;
  width: 100%;
  padding: 10px 11px;
  margin-bottom: 3px;
  border-radius: 8px;
  color: #cfcfcf;
  background: transparent;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}

.chat-item:hover,
.chat-item.active {
  background: #242424;
}

.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.chat-date {
  color: #777;
  font-size: 10px;
  margin-top: 3px;
}

.side-bottom {
  border-top: 1px solid #292929;
  padding: 10px;
}

.memory-status {
  padding: 9px 11px;
  color: #999;
  font-size: 11px;
}

/* ================= MAIN ================= */

.main {
  min-width: 0;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 62px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 17px;
  border-bottom: 1px solid #292929;
  background: #101010;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.menu-button {
  display: none;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: transparent;
  color: #ddd;
  cursor: pointer;
  font-size: 20px;
}

.model-select {
  max-width: 300px;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid #303030;
  outline: none;
  background: #181818;
  color: #eee;
  cursor: pointer;
}

.model-status {
  color: #777;
  font-size: 11px;
}

/* ================= CHAT ================= */

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.messages-inner {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 35px 20px 160px;
}

.welcome {
  max-width: 720px;
  margin: 13vh auto 0;
  text-align: center;
}

.welcome-logo {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  margin: 0 auto 18px;
  background: #fff;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27px;
  font-weight: 800;
}

.welcome h1 {
  margin: 0 0 9px;
  font-size: 30px;
}

.welcome p {
  margin: 0;
  color: #858585;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
  margin-top: 28px;
}

.suggestion {
  padding: 13px;
  border: 1px solid #2c2c2c;
  background: #171717;
  color: #ddd;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
}

.suggestion:hover {
  background: #202020;
}

.message {
  display: flex;
  gap: 13px;
  margin: 0 auto 27px;
  max-width: 850px;
}

.avatar {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.user-avatar {
  background: #303030;
  color: #ddd;
}

.ai-avatar {
  background: #fff;
  color: #111;
}

.message-content {
  min-width: 0;
  flex: 1;
  line-height: 1.65;
  font-size: 14px;
}

.message-content p {
  margin: 0 0 10px;
}

.message-content p:last-child {
  margin-bottom: 0;
}

.message-content h1,
.message-content h2,
.message-content h3 {
  line-height: 1.3;
  margin: 16px 0 9px;
}

.message-content h1 {
  font-size: 23px;
}

.message-content h2 {
  font-size: 20px;
}

.message-content h3 {
  font-size: 17px;
}

.message-content ul,
.message-content ol {
  padding-left: 24px;
}

.message-content blockquote {
  margin: 12px 0;
  padding: 8px 14px;
  border-left: 3px solid #555;
  color: #aaa;
}

.message-content a {
  color: #9ecbff;
}

.inline-code {
  background: #242424;
  border: 1px solid #303030;
  padding: 2px 5px;
  border-radius: 5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .9em;
}

.code-wrap {
  margin: 12px 0;
  border: 1px solid #303030;
  border-radius: 9px;
  overflow: hidden;
  background: #0b0b0b;
}

.code-head {
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #171717;
  border-bottom: 1px solid #303030;
  color: #888;
  font-size: 11px;
}

.code-copy {
  padding: 5px 9px;
  border-radius: 6px;
  color: #ccc;
  background: #262626;
  cursor: pointer;
  font-size: 11px;
}

.code-wrap pre {
  margin: 0;
  padding: 13px;
  overflow-x: auto;
}

.code-wrap code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
}

.message-actions {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.msg-action {
  padding: 5px 8px;
  border-radius: 6px;
  color: #777;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
}

.msg-action:hover {
  background: #222;
  color: #bbb;
}

.generated-image {
  display: block;
  max-width: min(100%, 640px);
  border-radius: 12px;
  border: 1px solid #303030;
  margin-top: 9px;
}

.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 9px;
}

.attachment-image {
  max-width: 180px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #333;
}

/* ================= COMPOSER ================= */

.composer-area {
  position: absolute;
  left: 270px;
  right: 0;
  bottom: 0;
  padding: 15px 18px 17px;
  pointer-events: none;
}

.composer-wrap {
  max-width: 850px;
  margin: 0 auto;
  pointer-events: auto;
}

.composer {
  background: #1b1b1b;
  border: 1px solid #373737;
  border-radius: 15px;
  box-shadow: 0 10px 35px rgba(0,0,0,.35);
}

.attachments {
  display: flex;
  gap: 7px;
  padding: 9px 10px 0;
  flex-wrap: wrap;
}

.attachment-chip {
  padding: 6px 8px;
  background: #292929;
  border-radius: 7px;
  color: #bbb;
  font-size: 11px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.attachment-remove {
  cursor: pointer;
  color: #888;
}

.prompt-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 9px;
}

.prompt {
  flex: 1;
  min-height: 25px;
  max-height: 180px;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #eee;
  line-height: 1.5;
  padding: 7px 6px;
}

.prompt::placeholder {
  color: #666;
}

.icon-button {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 9px;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: #292929;
  color: #fff;
}

.send-button {
  background: #fff;
  color: #111;
}

.send-button:disabled {
  background: #343434;
  color: #777;
  cursor: default;
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  padding: 0 12px 8px;
  color: #666;
  font-size: 10px;
}

.stop-button {
  display: none;
  background: #2b2b2b;
  color: #eee;
}

.stop-button.show {
  display: flex;
}

/* ================= SEARCH ================= */

.search-box {
  padding: 10px;
  border-bottom: 1px solid #292929;
  display: none;
}

.search-box.show {
  display: block;
}

.search-box input {
  width: 100%;
  border: 1px solid #333;
  background: #101010;
  color: #eee;
  padding: 9px 10px;
  border-radius: 8px;
  outline: none;
}

/* ================= MODAL ================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.62);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-overlay.show {
  display: flex;
}

.modal {
  width: min(520px, 100%);
  max-height: 80vh;
  overflow: auto;
  background: #191919;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 20px;
}

.modal h2 {
  margin-top: 0;
}

.memory-item {
  padding: 10px;
  margin: 6px 0;
  background: #242424;
  border-radius: 8px;
  font-size: 13px;
  color: #bbb;
}

.modal-close {
  margin-top: 13px;
  padding: 9px 13px;
  border-radius: 8px;
  background: #fff;
  color: #111;
  cursor: pointer;
}

/* ================= MOBILE ================= */

.overlay {
  display: none;
}

@media(max-width: 720px) {

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(290px, 84vw);
    transform: translateX(-105%);
    transition: transform .2s ease;
    box-shadow: 12px 0 40px rgba(0,0,0,.4);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.55);
    z-index: 10;
  }

  .overlay.show {
    display: block;
  }

  .composer-area {
    left: 0;
    padding: 9px 9px 10px;
  }

  .messages-inner {
    padding-left: 13px;
    padding-right: 13px;
    padding-bottom: 150px;
  }

  .suggestions {
    grid-template-columns: 1fr;
  }

  .welcome {
    margin-top: 9vh;
  }

  .welcome h1 {
    font-size: 25px;
  }

  .model-status {
    display: none;
  }

  .model-select {
    max-width: 190px;
  }

  .message {
    gap: 9px;
  }

  .avatar {
    width: 29px;
    height: 29px;
    flex-basis: 29px;
  }

}

</style>

</head>

<body>

<div class="app">

  <aside class="sidebar" id="sidebar">

    <div class="brand">
      <div class="brand-logo">A</div>
      <div class="brand-name">AetherAI</div>
    </div>

    <button class="new-chat" id="newChat">
      + New chat
    </button>

    <div class="side-actions">

      <button class="side-button" id="searchButton">
        <span class="side-icon">⌕</span>
        Search chats
      </button>

      <button class="side-button" id="memoryButton">
        <span class="side-icon">◈</span>
        Memory
      </button>

      <button class="side-button" id="installButton">
        <span class="side-icon">⌂</span>
        Add to Home Screen
      </button>

    </div>

    <div class="search-box" id="searchBox">
      <input
        id="searchInput"
        type="search"
        placeholder="Search chats..."
      >
    </div>

    <div class="history-title">
      Chats
    </div>

    <div class="history" id="history"></div>

    <div class="side-bottom">
      <div class="memory-status" id="memoryStatus">
        Memory enabled
      </div>
    </div>

  </aside>

  <div class="overlay" id="overlay"></div>

  <main class="main">

    <header class="topbar">

      <div class="top-left">

        <button
          class="menu-button"
          id="menuButton"
          aria-label="Menu"
        >
          ☰
        </button>

        <select
          class="model-select"
          id="modelSelect"
        >
          <option>Loading models...</option>
        </select>

        <span
          class="model-status"
          id="modelStatus"
        >
          Loading...
        </span>

      </div>

      <button
        class="icon-button"
        id="clearCurrent"
        title="Clear chat"
      >
        ⟳
      </button>

    </header>

    <section
      class="messages"
      id="messages"
    >

      <div
        class="messages-inner"
        id="messagesInner"
      ></div>

    </section>

  </main>

</div>


<div class="composer-area">

  <div class="composer-wrap">

    <div class="composer">

      <div
        class="attachments"
        id="attachments"
      ></div>

      <div class="prompt-row">

        <button
          class="icon-button"
          id="attachButton"
          title="Attach file"
        >
          +
        </button>

        <input
          id="fileInput"
          type="file"
          accept="image/*,.txt,.md,.json,.csv,.js,.html,.css,.py"
          multiple
          hidden
        >

        <textarea
          class="prompt"
          id="prompt"
          rows="1"
          placeholder="Message AetherAI..."
          autocomplete="off"
          spellcheck="true"
        ></textarea>

        <button
          class="icon-button stop-button"
          id="stopButton"
          title="Stop"
        >
          ■
        </button>

        <button
          class="icon-button send-button"
          id="sendButton"
          title="Send"
        >
          ↑
        </button>

      </div>

      <div class="composer-footer">
        <span>AI can make mistakes. Check important information.</span>
        <span id="counter">0</span>
      </div>

    </div>

  </div>

</div>


<div
  class="modal-overlay"
  id="memoryModal"
>

  <div class="modal">

    <h2>Memory</h2>

    <p style="color:#888;font-size:13px">
      AetherAI can remember simple preferences and facts
      stored locally on this device.
    </p>

    <div id="memoryList"></div>

    <button
      class="modal-close"
      id="closeMemory"
    >
      Close
    </button>

  </div>

</div>


<script>

(function(){

"use strict";


/* =========================================================
   STATE
========================================================= */

const STORAGE_CHATS = "aetherai_chats_v2";
const STORAGE_MEMORY = "aetherai_memory_v2";
const STORAGE_MODEL = "aetherai_model_v2";

let chats = loadJSON(STORAGE_CHATS, []);
let memories = loadJSON(STORAGE_MEMORY, []);

let currentChatId = null;
let models = [];
let selectedModel = localStorage.getItem(STORAGE_MODEL) || "";

let controller = null;
let generating = false;

let pendingAttachments = [];

let deferredInstallPrompt = null;


/* =========================================================
   ELEMENTS
========================================================= */

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const menuButton =
  document.getElementById("menuButton");

const newChat =
  document.getElementById("newChat");

const searchButton =
  document.getElementById("searchButton");

const searchBox =
  document.getElementById("searchBox");

const searchInput =
  document.getElementById("searchInput");

const memoryButton =
  document.getElementById("memoryButton");

const installButton =
  document.getElementById("installButton");

const history =
  document.getElementById("history");

const messages =
  document.getElementById("messages");

const messagesInner =
  document.getElementById("messagesInner");

const modelSelect =
  document.getElementById("modelSelect");

const modelStatus =
  document.getElementById("modelStatus");

const prompt =
  document.getElementById("prompt");

const sendButton =
  document.getElementById("sendButton");

const stopButton =
  document.getElementById("stopButton");

const attachButton =
  document.getElementById("attachButton");

const fileInput =
  document.getElementById("fileInput");

const attachments =
  document.getElementById("attachments");

const counter =
  document.getElementById("counter");

const clearCurrent =
  document.getElementById("clearCurrent");

const memoryModal =
  document.getElementById("memoryModal");

const memoryList =
  document.getElementById("memoryList");

const closeMemory =
  document.getElementById("closeMemory");


/* =========================================================
   INIT
========================================================= */

init();


async function init(){

  renderHistory();

  createNewChat();

  setupEvents();

  updateMemoryStatus();

  await loadModels();

  registerPWA();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents(){

  newChat.addEventListener(
    "click",
    function(){
      createNewChat();
      closeMobileMenu();
    }
  );


  menuButton.addEventListener(
    "click",
    function(){
      sidebar.classList.add("open");
      overlay.classList.add("show");
    }
  );


  overlay.addEventListener(
    "click",
    closeMobileMenu
  );


  searchButton.addEventListener(
    "click",
    function(){
      searchBox.classList.toggle("show");

      if(searchBox.classList.contains("show")){
        searchInput.focus();
      }else{
        searchInput.value = "";
        renderHistory();
      }
    }
  );


  searchInput.addEventListener(
    "input",
    function(){
      renderHistory(searchInput.value);
    }
  );


  memoryButton.addEventListener(
    "click",
    function(){
      renderMemory();
      memoryModal.classList.add("show");
      closeMobileMenu();
    }
  );


  closeMemory.addEventListener(
    "click",
    function(){
      memoryModal.classList.remove("show");
    }
  );


  memoryModal.addEventListener(
    "click",
    function(event){
      if(event.target === memoryModal){
        memoryModal.classList.remove("show");
      }
    }
  );


  installButton.addEventListener(
    "click",
    installPWA
  );


  modelSelect.addEventListener(
    "change",
    function(){
      selectedModel = modelSelect.value;
      localStorage.setItem(
        STORAGE_MODEL,
        selectedModel
      );
      updateModelStatus();
    }
  );


  sendButton.addEventListener(
    "click",
    sendMessage
  );


  stopButton.addEventListener(
    "click",
    stopGeneration
  );


  attachButton.addEventListener(
    "click",
    function(){
      fileInput.click();
    }
  );


  fileInput.addEventListener(
    "change",
    async function(){
      await addFiles(fileInput.files);
      fileInput.value = "";
    }
  );


  prompt.addEventListener(
    "input",
    function(){

      prompt.style.height = "auto";

      prompt.style.height =
        Math.min(
          prompt.scrollHeight,
          180
        ) + "px";

      counter.textContent =
        prompt.value.length.toLocaleString();

    }
  );


  prompt.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Enter" && !event.shiftKey){

        event.preventDefault();

        if(!generating){
          sendMessage();
        }

      }

    }
  );


  clearCurrent.addEventListener(
    "click",
    function(){

      const chat = getCurrentChat();

      if(!chat) return;

      chat.messages = [];

      saveChats();

      renderChat();

    }
  );


  window.addEventListener(
    "beforeinstallprompt",
    function(event){

      event.preventDefault();

      deferredInstallPrompt = event;

    }
  );

}


/* =========================================================
   CHAT DATA
========================================================= */

function createNewChat(){

  const id =
    "chat_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2,8);

  const chat = {
    id,
    title: "New chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };

  chats.unshift(chat);

  currentChatId = id;

  saveChats();

  renderHistory();

  renderChat();

  prompt.focus();

}


function getCurrentChat(){

  return chats.find(
    function(chat){
      return chat.id === currentChatId;
    }
  ) || null;

}


function saveChats(){

  try{

    localStorage.setItem(
      STORAGE_CHATS,
      JSON.stringify(chats)
    );

  }catch(error){

    console.warn(
      "Could not save chats:",
      error
    );

    /*
     * If localStorage becomes too large because of
     * old data, keep the newest chats.
     */

    chats = chats
      .slice(0, 30)
      .map(function(chat){

        return {
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messages: chat.messages
            .slice(-40)
            .map(function(message){

              return {
                role: message.role,
                content:
                  typeof message.content === "string"
                    ? message.content
                    : getDisplayContent(
                        message.content
                      )
              };

            })
        };

      });

    try{
      localStorage.setItem(
        STORAGE_CHATS,
        JSON.stringify(chats)
      );
    }catch{}

  }

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory(filter){

  history.innerHTML = "";

  const query =
    String(filter || "")
      .trim()
      .toLowerCase();

  const list =
    chats
      .filter(function(chat){

        if(!query) return true;

        return (
          chat.title
            .toLowerCase()
            .includes(query)
        );

      })
      .sort(function(a,b){
        return b.updatedAt - a.updatedAt;
      });


  if(!list.length){

    const empty =
      document.createElement("div");

    empty.style.cssText =
      "padding:15px;color:#666;font-size:12px";

    empty.textContent =
      "No chats found.";

    history.appendChild(empty);

    return;
  }


  list.forEach(function(chat){

    const button =
      document.createElement("button");

    button.className =
      "chat-item" +
      (
        chat.id === currentChatId
          ? " active"
          : ""
      );

    const title =
      document.createElement("div");

    title.className =
      "chat-title";

    title.textContent =
      chat.title || "New chat";


    const date =
      document.createElement("div");

    date.className =
      "chat-date";

    date.textContent =
      formatDate(chat.updatedAt);


    button.appendChild(title);
    button.appendChild(date);

    button.addEventListener(
      "click",
      function(){

        currentChatId = chat.id;

        renderHistory(
          searchInput.value
        );

        renderChat();

        closeMobileMenu();

      }
    );

    history.appendChild(button);

  });

}


/* =========================================================
   RENDER CHAT
========================================================= */

function renderChat(){

  messagesInner.innerHTML = "";

  const chat = getCurrentChat();

  if(!chat || !chat.messages.length){

    renderWelcome();

    return;
  }


  chat.messages.forEach(
    function(message, index){

      renderMessage(
        message,
        index
      );

    }
  );

  scrollToBottomIfNear();

}


/* =========================================================
   WELCOME
========================================================= */

function renderWelcome(){

  const welcome =
    document.createElement("div");

  welcome.className =
    "welcome";

  welcome.innerHTML =
    '<div class="welcome-logo">A</div>' +
    '<h1>How can I help?</h1>' +
    '<p>Your personal AI assistant.</p>' +

    '<div class="suggestions">' +

      '<button class="suggestion" data-prompt="Explain something to me in simple words.">' +
        "Explain something simply" +
      "</button>" +

      '<button class="suggestion" data-prompt="Research this topic and give me a clear, up-to-date answer.">' +
        "Research a topic" +
      "</button>" +

      '<button class="suggestion" data-prompt="Help me write a professional message.">' +
        "Write something" +
      "</button>" +

      '<button class="suggestion" data-prompt="Help me debug this code step by step.">' +
        "Debug code" +
      "</button>" +

    "</div>";


  welcome
    .querySelectorAll(".suggestion")
    .forEach(function(button){

      button.addEventListener(
        "click",
        function(){

          prompt.value =
            button.dataset.prompt;

          prompt.dispatchEvent(
            new Event("input")
          );

          prompt.focus();

        }
      );

    });


  messagesInner.appendChild(welcome);

}


/* =========================================================
   MESSAGE RENDER
========================================================= */

function renderMessage(message, index){

  const row =
    document.createElement("div");

  row.className =
    "message";


  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar " +
    (
      message.role === "user"
        ? "user-avatar"
        : "ai-avatar"
    );

  avatar.textContent =
    message.role === "user"
      ? "You"
      : "A";


  const content =
    document.createElement("div");

  content.className =
    "message-content";


  if(message.role === "user"){

    renderUserContent(
      content,
      message.content
    );

  }else{

    content.innerHTML =
      renderMarkdown(
        getDisplayContent(
          message.content
        )
      );

  }


  row.appendChild(avatar);
  row.appendChild(content);

  messagesInner.appendChild(row);


  if(message.role === "assistant"){

    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";


    const copy =
      document.createElement("button");

    copy.className =
      "msg-action";

    copy.textContent =
      "Copy";


    copy.addEventListener(
      "click",
      async function(){

        await copyText(
          getDisplayContent(
            message.content
          )
        );

        copy.textContent =
          "Copied";

        setTimeout(
          function(){
            copy.textContent =
              "Copy";
          },
          1200
        );

      }
    );


    const regenerate =
      document.createElement("button");

    regenerate.className =
      "msg-action";

    regenerate.textContent =
      "Regenerate";


    regenerate.addEventListener(
      "click",
      function(){

        regenerateResponse(
          index
        );

      }
    );


    actions.appendChild(copy);
    actions.appendChild(regenerate);

    content.appendChild(actions);


    content
      .querySelectorAll(".code-copy")
      .forEach(function(button){

        button.addEventListener(
          "click",
          async function(){

            await copyText(
              button.dataset.code || ""
            );

            button.textContent =
              "Copied";

            setTimeout(
              function(){
                button.textContent =
                  "Copy";
              },
              1200
            );

          }
        );

      });

  }

}


/* =========================================================
   USER CONTENT
========================================================= */

function renderUserContent(element, content){

  if(
    Array.isArray(content)
  ){

    const preview =
      document.createElement(
        "div"
      );

    preview.className =
      "attachment-preview";


    content.forEach(
      function(part){

        if(
          part &&
          part.type === "image_url" &&
          part.image_url &&
          part.image_url.url
        ){

          const img =
            document.createElement("img");

          img.className =
            "attachment-image";

          img.src =
            part.image_url.url;

          preview.appendChild(img);

        }

      }
    );


    if(preview.children.length){
      element.appendChild(preview);
    }

  }


  const text =
    getDisplayContent(content);


  if(text){

    const div =
      document.createElement("div");

    div.innerHTML =
      renderMarkdown(text);

    element.appendChild(div);

  }

}


/* =========================================================
   MARKDOWN
========================================================= */

function renderMarkdown(text){

  let source =
    String(text || "");


  const codeBlocks = [];
  const inlineCodes = [];


  /*
   * IMPORTANT:
   *
   * This is intentionally constructed with RegExp().
   * There are NO literal backticks here, so the worker
   * template cannot break during Cloudflare deployment.
   */

  const fencePattern =
    new RegExp(
      "```([a-zA-Z0-9_+\\\\-]*)\\\\n?([\\\\s\\\\S]*?)```",
      "g"
    );


  source =
    source.replace(
      fencePattern,
      function(_, language, code){

        const id =
          codeBlocks.length;

        codeBlocks.push({
          language:
            language || "code",
          code
        });

        return (
          "%%CODEBLOCK" +
          id +
          "%%"
        );

      }
    );


  const tick =
    String.fromCharCode(96);


  const inlinePattern =
    new RegExp(
      tick +
      "([^" +
      tick +
      "]+)" +
      tick,
      "g"
    );


  source =
    source.replace(
      inlinePattern,
      function(_, code){

        const id =
          inlineCodes.length;

        inlineCodes.push(
          '<span class="inline-code">' +
          escapeHTML(code) +
          "</span>"
        );

        return (
          "%%INLINECODE" +
          id +
          "%%"
        );

      }
    );


  source =
    escapeHTML(source);


  source =
    source.replace(
      /^### (.+)$/gm,
      "<h3>$1</h3>"
    );


  source =
    source.replace(
      /^## (.+)$/gm,
      "<h2>$1</h2>"
    );


  source =
    source.replace(
      /^# (.+)$/gm,
      "<h1>$1</h1>"
    );


  source =
    source.replace(
      /^> (.+)$/gm,
      "<blockquote>$1</blockquote>"
    );


  source =
    source.replace(
      new RegExp(
        "\\*\\*([^*]+)\\*\\*",
        "g"
      ),
      "<strong>$1</strong>"
    );


  source =
    source.replace(
      new RegExp(
        "__([^_]+)__",
        "g"
      ),
      "<strong>$1</strong>"
    );


  source =
    source.replace(
      new RegExp(
        "\\*([^*\\n]+)\\*",
        "g"
      ),
      "<em>$1</em>"
    );


  source =
    source.replace(
      new RegExp(
        "_([^_\\n]+)_",
        "g"
      ),
      "<em>$1</em>"
    );


  source =
    source.replace(
      new RegExp(
        "\$begin:math:display$\(\[\^\\$end:math:display$]+)\\]\$begin:math:text$\(\[\^\)\]\+\)\\$end:math:text$",
        "g"
      ),
      function(_, label, url){

        const safe =
          safeURL(url);

        if(safe === "#"){
          return label;
        }

        return (
          '<a href="' +
          escapeHTML(safe) +
          '" target="_blank" rel="noopener noreferrer">' +
          label +
          "</a>"
        );

      }
    );


  const lines =
    source.split("\n");

  let output = "";
  let listOpen = false;
  let orderedOpen = false;


  lines.forEach(
    function(line){

      const unordered =
        /^\s*[-*] (.+)$/.exec(line);

      const ordered =
        /^\s*\d+\. (.+)$/.exec(line);


      if(unordered){

        if(orderedOpen){

          output += "</ol>";

          orderedOpen =
            false;

        }


        if(!listOpen){

          output += "<ul>";

          listOpen =
            true;

        }


        output +=
          "<li>" +
          unordered[1] +
          "</li>";

        return;

      }


      if(ordered){

        if(listOpen){

          output += "</ul>";

          listOpen =
            false;

        }


        if(!orderedOpen){

          output += "<ol>";

          orderedOpen =
            true;

        }


        output +=
          "<li>" +
          ordered[1] +
          "</li>";

        return;

      }


      if(listOpen){

        output += "</ul>";

        listOpen =
          false;

      }


      if(orderedOpen){

        output += "</ol>";

        orderedOpen =
          false;

      }


      if(!line.trim()){
        return;
      }


      if(
        line.indexOf("<h1>") === 0 ||
        line.indexOf("<h2>") === 0 ||
        line.indexOf("<h3>") === 0 ||
        line.indexOf("<blockquote>") === 0
      ){

        output += line;

      }else{

        output +=
          "<p>" +
          line +
          "</p>";

      }

    }
  );


  if(listOpen){
    output += "</ul>";
  }


  if(orderedOpen){
    output += "</ol>";
  }


  output =
    output.replace(
      /%%INLINECODE(\d+)%%/g,
      function(_, id){

        return (
          inlineCodes[
            Number(id)
          ] || ""
        );

      }
    );


  output =
    output.replace(
      /%%CODEBLOCK(\d+)%%/g,
      function(_, id){

        const block =
          codeBlocks[
            Number(id)
          ];


        if(!block){
          return "";
        }


        return (
          '<div class="code-wrap">' +

            '<div class="code-head">' +

              "<span>" +
                escapeHTML(
                  block.language
                ) +
              "</span>" +

              '<button class="code-copy" data-code="' +
                escapeHTML(
                  block.code
                ) +
              '">' +
                "Copy" +
              "</button>" +

            "</div>" +

            "<pre><code>" +
              escapeHTML(
                block.code
              ) +
            "</code></pre>" +

          "</div>"
        );

      }
    );


  return output;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(){

  if(generating){
    return;
  }


  const text =
    prompt.value.trim();


  if(
    !text &&
    pendingAttachments.length === 0
  ){

    return;

  }


  const chat =
    getCurrentChat();


  if(!chat){
    return;
  }


  const apiContent =
    await buildCurrentUserContent(
      text
    );


  const displayContent =
    text ||
    (
      pendingAttachments.length
        ? "Attached file(s)"
        : ""
    );


  const userMessage = {
    role: "user",
    content:
      displayContent
  };


  chat.messages.push(
    userMessage
  );


  chat.updatedAt =
    Date.now();


  if(chat.title === "New chat"){

    chat.title =
      makeTitle(
        text ||
        "Attached file"
      );

  }


  saveChats();

  renderHistory();

  renderChat();


  prompt.value = "";

  prompt.style.height =
    "auto";

  counter.textContent =
    "0";


  const attachmentsForRequest =
    pendingAttachments.slice();

  pendingAttachments = [];

  renderAttachments();


  const assistantMessage = {
    role: "assistant",
    content: ""
  };


  chat.messages.push(
    assistantMessage
  );


  generating =
    true;

  updateGeneratingUI();


  /*
   * Build API messages.
   *
   * Older history remains text-only in localStorage.
   * The current turn can contain real image_url parts.
   */

  const apiMessages =
    buildAPIMessages(
      chat,
      apiContent,
      assistantMessage
    );


  try{

    await streamChat(
      apiMessages,
      assistantMessage,
      chat
    );

  }catch(error){

    if(
      error &&
      error.name === "AbortError"
    ){

      if(
        !assistantMessage.content
      ){

        assistantMessage.content =
          "Generation stopped.";

      }

    }else{

      assistantMessage.content =
        "Error: " +
        (
          error &&
          error.message
            ? error.message
            : String(error)
        );

    }

  }finally{

    generating =
      false;

    controller =
      null;

    saveChats();

    renderHistory();

    renderChat();

    updateGeneratingUI();

  }

}


/* =========================================================
   API MESSAGE BUILD
========================================================= */

function buildAPIMessages(
  chat,
  currentContent,
  assistantMessage
){

  const systemMessage = {
    role: "system",
    content:
      buildSystemPrompt()
  };


  const result = [
    systemMessage
  ];


  const messages =
    chat.messages;


  for(
    let i = 0;
    i < messages.length;
    i++
  ){

    const message =
      messages[i];


    if(message === assistantMessage){
      continue;
    }


    if(
      i === messages.length - 1 &&
      message.role === "user"
    ){

      result.push({
        role: "user",
        content: currentContent
      });

      continue;

    }


    result.push({
      role: message.role,
      content:
        getDisplayContent(
          message.content
        )
    });

  }


  return result;

}


/* =========================================================
   SYSTEM PROMPT
========================================================= */

function buildSystemPrompt(){

  let memoryText = "";

  if(memories.length){

    memoryText =
      "\n\nUser memory:\n" +
      memories
        .slice(-30)
        .map(function(item){
          return "- " + item;
        })
        .join("\n");

  }


  return (
    "You are AetherAI, a helpful personal AI assistant. " +
    "Answer clearly and accurately. " +
    "Use simple language when appropriate. " +
    "For code, provide complete working code when requested. " +
    "Do not claim that you used a tool or searched the web unless " +
    "the application actually provided that capability. " +
    "If the user asks for current information and no live search " +
    "tool is available, clearly say that the answer may need verification." +
    memoryText
  );

}


/* =========================================================
   STREAM CHAT
========================================================= */

async function streamChat(
  apiMessages,
  assistantMessage,
  chat
){

  controller =
    new AbortController();


  const response =
    await fetch(
      "/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          model:
            selectedModel,

          messages:
            apiMessages,

          temperature:
            0.7,

          max_tokens:
            4096
        }),

        signal:
          controller.signal
      }
    );


  if(!response.ok){

    let message =
      "Request failed.";

    try{

      const data =
        await response.json();

      message =
        data.error ||
        data.details ||
        message;

    }catch{

      message =
        await response.text();

    }


    throw new Error(
      String(message).slice(0,3000)
    );

  }


  if(!response.body){

    throw new Error(
      "Streaming is not supported by this response."
    );

  }


  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  let lastRender =
    0;


  while(true){

    const result =
      await reader.read();


    if(result.done){
      break;
    }


    buffer +=
      decoder.decode(
        result.value,
        {
          stream: true
        }
      );


    const parts =
      buffer.split("\n");

    buffer =
      parts.pop() || "";


    for(
      let i = 0;
      i < parts.length;
      i++
    ){

      const line =
        parts[i].trim();


      if(!line){
        continue;
      }


      if(
        line === "data: [DONE]" ||
        line === "[DONE]"
      ){

        continue;

      }


      if(
        !line.startsWith("data:")
      ){

        continue;

      }


      const raw =
        line.slice(5).trim();


      if(!raw){
        continue;
      }


      let data;

      try{

        data =
          JSON.parse(raw);

      }catch{

        continue;

      }


      const delta =
        extractDelta(data);


      if(delta){

        assistantMessage.content +=
          delta;


        const now =
          Date.now();


        /*
         * Render frequently, but don't destroy the
         * user's scroll position if they moved upward.
         */

        if(now - lastRender > 45){

          renderChat();

          lastRender =
            now;

        }

      }

    }

  }


  renderChat();

}


/* =========================================================
   STREAM DELTA
========================================================= */

function extractDelta(data){

  if(
    data &&
    Array.isArray(data.choices) &&
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


  if(
    data &&
    typeof data.text === "string"
  ){

    return data.text;

  }


  return "";

}


/* =========================================================
   STOP
========================================================= */

function stopGeneration(){

  if(controller){

    controller.abort();

  }

}


/* =========================================================
   REGENERATE
========================================================= */

async function regenerateResponse(index){

  if(generating){
    return;
  }


  const chat =
    getCurrentChat();


  if(!chat){
    return;
  }


  if(
    index < 1 ||
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


  chat.messages.splice(
    index,
    1
  );


  saveChats();

  renderChat();


  /*
   * Temporarily rebuild the current request
   * without adding another user message.
   */

  const apiMessages =
    buildAPIMessages(
      chat,
      getDisplayContent(
        previous.content
      ),
      {
        role: "assistant",
        content: ""
      }
    );


  const assistant = {
    role: "assistant",
    content: ""
  };


  chat.messages.splice(
    index,
    0,
    assistant
  );


  generating =
    true;

  updateGeneratingUI();


  try{

    await streamChat(
      apiMessages,
      assistant,
      chat
    );

  }catch(error){

    if(
      error.name === "AbortError"
    ){

      assistant.content =
        "Generation stopped.";

    }else{

      assistant.content =
        "Error: " +
        error.message;

    }

  }finally{

    generating =
      false;

    controller =
      null;

    saveChats();

    renderChat();

    updateGeneratingUI();

  }

}


/* =========================================================
   GENERATING UI
========================================================= */

function updateGeneratingUI(){

  sendButton.disabled =
    generating;

  stopButton.classList.toggle(
    "show",
    generating
  );

  prompt.disabled =
    generating;

}


/* =========================================================
   FILES
========================================================= */

async function addFiles(fileList){

  const files =
    Array.from(
      fileList || []
    );


  for(
    let i = 0;
    i < files.length;
    i++
  ){

    const file =
      files[i];


    if(
      file.size >
      5 * 1024 * 1024
    ){

      alert(
        file.name +
        " is larger than 5 MB."
      );

      continue;

    }


    if(
      file.type.startsWith("image/")
    ){

      const dataURL =
        await readAsDataURL(file);


      pendingAttachments.push({
        type: "image",
        name: file.name,
        dataURL
      });

    }else{

      const text =
        await file.text();


      pendingAttachments.push({
        type: "text",
        name: file.name,
        text:
          text.slice(0, 50000)
      });

    }

  }


  renderAttachments();

}


/* =========================================================
   ATTACHMENT UI
========================================================= */

function renderAttachments(){

  attachments.innerHTML = "";


  pendingAttachments.forEach(
    function(item, index){

      const chip =
        document.createElement(
          "div"
        );

      chip.className =
        "attachment-chip";


      const name =
        document.createElement(
          "span"
        );

      name.textContent =
        item.name;


      const remove =
        document.createElement(
          "span"
        );

      remove.className =
        "attachment-remove";

      remove.textContent =
        "×";


      remove.addEventListener(
        "click",
        function(){

          pendingAttachments.splice(
            index,
            1
          );

          renderAttachments();

        }
      );


      chip.appendChild(name);
      chip.appendChild(remove);

      attachments.appendChild(chip);

    }
  );

}


/* =========================================================
   BUILD CURRENT USER CONTENT
========================================================= */

async function buildCurrentUserContent(text){

  const hasImages =
    pendingAttachments.some(
      function(item){
        return item.type === "image";
      }
    );


  const hasFiles =
    pendingAttachments.some(
      function(item){
        return item.type === "text";
      }
    );


  if(
    !hasImages &&
    !hasFiles
  ){

    return text;

  }


  const parts = [];


  let combinedText =
    text || "";


  pendingAttachments.forEach(
    function(item){

      if(item.type === "text"){

        combinedText +=
          "\n\n--- File: " +
          item.name +
          " ---\n" +
          item.text;

      }

    }
  );


  if(combinedText){

    parts.push({
      type: "text",
      text: combinedText
    });

  }


  pendingAttachments.forEach(
    function(item){

      if(item.type === "image"){

        parts.push({
          type: "image_url",
          image_url: {
            url: item.dataURL
          }
        });

      }

    }
  );


  return parts;

}


/* =========================================================
   CONTENT HELPERS
========================================================= */

function getDisplayContent(content){

  if(typeof content === "string"){
    return content;
  }


  if(Array.isArray(content)){

    return content
      .map(function(part){

        if(
          part &&
          part.type === "text"
        ){

          return part.text || "";

        }

        return "";

      })
      .join("\n");

  }


  return "";

}


/* =========================================================
   MEMORY
========================================================= */

function updateMemoryStatus(){

  memoryStatus.textContent =
    memories.length
      ? memories.length +
        " memories saved"
      : "Memory enabled";

}


function renderMemory(){

  memoryList.innerHTML = "";


  if(!memories.length){

    const empty =
      document.createElement("div");

    empty.className =
      "memory-item";

    empty.textContent =
      "No memories saved yet.";

    memoryList.appendChild(
      empty
    );

    return;

  }


  memories.forEach(
    function(item, index){

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "memory-item";


      const text =
        document.createElement(
          "span"
        );

      text.textContent =
        item;


      const remove =
        document.createElement(
          "button"
        );

      remove.textContent =
        " ×";

      remove.style.cssText =
        "float:right;background:none;color:#888;cursor:pointer";


      remove.addEventListener(
        "click",
        function(){

          memories.splice(
            index,
            1
          );

          saveMemory();

          renderMemory();

          updateMemoryStatus();

        }
      );


      row.appendChild(text);
      row.appendChild(remove);

      memoryList.appendChild(row);

    }
  );

}


/*
 * Extract simple memories from user messages.
 */

function learnMemory(text){

  const value =
    String(text || "")
      .trim();


  if(!value){
    return;
  }


  const patterns = [

    /remember that (.+)/i,

    /remember (.+)/i,

    /my name is (.+)/i,

    /i prefer (.+)/i,

    /i like (.+)/i,

    /i love (.+)/i

  ];


  for(
    let i = 0;
    i < patterns.length;
    i++
  ){

    const match =
      patterns[i].exec(value);


    if(match){

      const memory =
        match[0].trim();


      if(
        memory.length > 3 &&
        memory.length < 300
      ){

        if(
          !memories.includes(memory)
        ){

          memories.push(memory);

          memories =
            memories.slice(-50);

          saveMemory();

          updateMemoryStatus();

        }

      }

      break;

    }

  }

}


function saveMemory(){

  localStorage.setItem(
    STORAGE_MEMORY,
    JSON.stringify(memories)
  );

}


/* =========================================================
   MODELS
========================================================= */

async function loadModels(){

  try{

    modelStatus.textContent =
      "Loading models...";


    const response =
      await fetch(
        "/api/models",
        {
          cache: "no-store"
        }
      );


    if(!response.ok){

      throw new Error(
        "Model request failed: " +
        response.status
      );

    }


    const data =
      await response.json();


    models =
      Array.isArray(data.data)
        ? data.data
        : [];


    if(!models.length){

      throw new Error(
        "No CodeCraft models returned."
      );

    }


    models =
      models.filter(function(model){

        return (
          model &&
          model.id
        );

      });


    /*
     * Prefer models that support streaming/chat.
     * If the API gives no useful capability data,
     * simply use the first model returned.
     */

    models.sort(function(a,b){

      const aStream =
        hasCapability(
          a,
          "streaming"
        )
          ? 1
          : 0;

      const bStream =
        hasCapability(
          b,
          "streaming"
        )
          ? 1
          : 0;

      return bStream - aStream;

    });


    if(
      !selectedModel ||
      !models.some(
        function(model){
          return model.id === selectedModel;
        }
      )
    ){

      selectedModel =
        models[0].id;

      localStorage.setItem(
        STORAGE_MODEL,
        selectedModel
      );

    }


    modelSelect.innerHTML = "";


    models.forEach(
      function(model){

        const option =
          document.createElement(
            "option"
          );

        option.value =
          model.id;

        option.textContent =
          model.name ||
          model.id;


        modelSelect.appendChild(
          option
        );

      }
    );


    modelSelect.value =
      selectedModel;


    updateModelStatus();

  }catch(error){

    modelSelect.innerHTML =
      '<option value="">Models failed</option>';

    modelStatus.textContent =
      "Load failed";

    console.error(error);

  }

}


function hasCapability(model, name){

  if(!model || !model.capabilities){
    return false;
  }


  const caps =
    model.capabilities;


  if(Array.isArray(caps)){

    return caps.includes(name);

  }


  return Boolean(
    caps[name]
  );

}


function updateModelStatus(){

  const model =
    models.find(
      function(item){
        return item.id === selectedModel;
      }
    );


  if(!model){

    modelStatus.textContent =
      "";

    return;

  }


  const capabilities =
    model.capabilities;


  let text =
    model.context_window
      ? (
        Number(
          model.context_window
        ).toLocaleString() +
        " context"
      )
      : "Ready";


  if(
    capabilities &&
    (
      capabilities.vision ||
      (
        Array.isArray(capabilities) &&
        capabilities.includes("vision")
      )
    )
  ){

    text += " · Vision";

  }


  modelStatus.textContent =
    text;

}


/* =========================================================
   PWA
========================================================= */

function registerPWA(){

  if(
    "serviceWorker" in navigator
  ){

    navigator.serviceWorker
      .register("/sw.js")
      .catch(function(error){
        console.warn(
          "Service worker:",
          error
        );
      });

  }

}


async function installPWA(){

  if(deferredInstallPrompt){

    deferredInstallPrompt.prompt();

    try{
      await deferredInstallPrompt.userChoice;
    }catch{}

    deferredInstallPrompt =
      null;

    return;

  }


  alert(
    "On iPhone: tap the Share button in Safari, then choose 'Add to Home Screen'."
  );

}


/* =========================================================
   MOBILE
========================================================= */

function closeMobileMenu(){

  sidebar.classList.remove(
    "open"
  );

  overlay.classList.remove(
    "show"
  );

}


/* =========================================================
   SCROLL
========================================================= */

function isNearBottom(){

  const distance =
    messages.scrollHeight -
    messages.scrollTop -
    messages.clientHeight;


  return distance < 180;

}


function scrollToBottomIfNear(){

  if(isNearBottom()){

    messages.scrollTop =
      messages.scrollHeight;

  }

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value){

  return String(value || "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function safeURL(value){

  try{

    const url =
      new URL(
        value,
        location.origin
      );


    if(
      url.protocol === "http:" ||
      url.protocol === "https:"
    ){

      return url.href;

    }

  }catch{}


  return "#";

}


function copyText(text){

  if(
    navigator.clipboard &&
    navigator.clipboard.writeText
  ){

    return navigator.clipboard.writeText(
      text
    );

  }


  return new Promise(function(resolve){

    const area =
      document.createElement(
        "textarea"
      );

    area.value =
      text;

    area.style.position =
      "fixed";

    area.style.opacity =
      "0";

    document.body.appendChild(
      area
    );

    area.select();

    try{
      document.execCommand(
        "copy"
      );
    }catch{}

    area.remove();

    resolve();

  });

}


function readAsDataURL(file){

  return new Promise(function(resolve,reject){

    const reader =
      new FileReader();


    reader.onload =
      function(){
        resolve(
          reader.result
        );
      };


    reader.onerror =
      reject;


    reader.readAsDataURL(
      file
    );

  });

}


function loadJSON(key, fallback){

  try{

    const value =
      localStorage.getItem(key);


    if(!value){
      return fallback;
    }


    const parsed =
      JSON.parse(value);


    return parsed;

  }catch{

    return fallback;

  }

}


function makeTitle(text){

  const clean =
    String(text || "")
      .replace(/\s+/g, " ")
      .trim();


  if(!clean){
    return "New chat";
  }


  return clean.length > 42
    ? clean.slice(0,42) + "..."
    : clean;

}


function formatDate(timestamp){

  const date =
    new Date(timestamp);


  const now =
    new Date();


  if(
    date.toDateString() ===
    now.toDateString()
  ){

    return date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );

  }


  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric"
    }
  );

}


/* =========================================================
   MEMORY LEARNING HOOK
========================================================= */

const originalSendMessage =
  sendMessage;


/*
 * We cannot redeclare the main send function,
 * so observe user text when Enter/click is used.
 */

prompt.addEventListener(
  "keydown",
  function(event){

    if(
      event.key === "Enter" &&
      !event.shiftKey
    ){

      learnMemory(
        prompt.value
      );

    }

  }
);


sendButton.addEventListener(
  "click",
  function(){

    learnMemory(
      prompt.value
    );

  }
);


})();

</script>

</body>
</html>`;
}
