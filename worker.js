const CODECRAFT_BASE = "https://www.codecraftapi.com/v1";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders()
    }
  });
}

function apiKey(env) {
  return env.CODECRAFT_API_KEY || "";
}

async function ccFetch(env, path, options = {}) {
  const key = apiKey(env);

  if (!key) {
    return json(
      {
        error: {
          message: "CODECRAFT_API_KEY is not configured."
        }
      },
      500
    );
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", "Bearer " + key);
  headers.set("Content-Type", "application/json");

  return fetch(CODECRAFT_BASE + path, {
    ...options,
    headers
  });
}

function getCapabilities(model) {
  const caps = model && model.capabilities;

  if (Array.isArray(caps)) {
    return new Set(
      caps.map(function (x) {
        return String(x).toLowerCase();
      })
    );
  }

  if (caps && typeof caps === "object") {
    return new Set(
      Object.keys(caps)
        .filter(function (key) {
          return caps[key] === true;
        })
        .map(function (key) {
          return key.toLowerCase();
        })
    );
  }

  return new Set();
}

function scoreModel(model) {
  const caps = getCapabilities(model);

  let score = 0;

  const type = String(model.type || "").toLowerCase();
  const name = String(model.name || model.id || "").toLowerCase();
  const id = String(model.id || "").toLowerCase();

  if (type === "chat") score += 1000;

  if (
    caps.has("reasoning") ||
    caps.has("reasoning_content")
  ) {
    score += 300;
  }

  if (caps.has("web_search")) score += 260;
  if (caps.has("vision")) score += 190;
  if (caps.has("tools")) score += 130;
  if (caps.has("streaming") || caps.has("stream")) score += 90;
  if (caps.has("json_mode")) score += 20;

  const context =
    Number(model.context_window) ||
    Number(model.contextWindow) ||
    0;

  score += Math.min(context / 1000, 400);

  if (/opus/.test(name + " " + id)) score += 100;
  if (/pro/.test(name + " " + id)) score += 60;
  if (/max|ultra|frontier/.test(name + " " + id)) score += 50;

  return score;
}

function sortModels(models) {
  return models
    .filter(function (m) {
      return m && m.id;
    })
    .map(function (m) {
      return {
        model: m,
        score: scoreModel(m)
      };
    })
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .map(function (x) {
      return x.model;
    });
}

function extractDelta(obj) {
  if (!obj) return "";

  if (
    obj.choices &&
    obj.choices[0] &&
    obj.choices[0].delta
  ) {
    const delta = obj.choices[0].delta;

    if (typeof delta.content === "string") {
      return delta.content;
    }

    if (Array.isArray(delta.content)) {
      return delta.content
        .map(function (part) {
          if (typeof part === "string") return part;

          if (
            part &&
            typeof part.text === "string"
          ) {
            return part.text;
          }

          return "";
        })
        .join("");
    }
  }

  if (
    obj.choices &&
    obj.choices[0] &&
    typeof obj.choices[0].text === "string"
  ) {
    return obj.choices[0].text;
  }

  if (typeof obj.content === "string") {
    return obj.content;
  }

  return "";
}

function buildSystemPrompt(memories) {
  let memoryText = "";

  if (Array.isArray(memories) && memories.length) {
    memoryText =
      "\n\nUser memory available to you:\n" +
      memories
        .slice(0, 30)
        .map(function (m) {
          return "- " + String(m);
        })
        .join("\n");
  }

  return (
    "You are AetherAI, a helpful general-purpose AI assistant. " +
    "Give accurate, useful and clear answers. " +
    "Use Markdown when it improves readability. " +
    "For code, use fenced code blocks with an appropriate language when possible. " +
    "Do not claim to have used tools, searched the web, opened files, or generated an image unless that actually happened. " +
    "If information may be current or uncertain, clearly say so. " +
    "Keep answers reasonably concise unless the user asks for detail." +
    memoryText
  );
}

async function handleChat(request, env) {
  try {
    const body = await request.json();

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const model = body.model || "";

    const memories = Array.isArray(body.memories)
      ? body.memories
      : [];

    if (!messages.length) {
      return json(
        {
          error: {
            message: "No messages were provided."
          }
        },
        400
      );
    }

    const finalMessages = [
      {
        role: "system",
        content: buildSystemPrompt(memories)
      }
    ];

    for (const message of messages) {
      if (!message || !message.role) continue;

      finalMessages.push({
        role: message.role,
        content: message.content
      });
    }

    const payload = {
      model: model,
      messages: finalMessages,
      stream: true,
      temperature:
        typeof body.temperature === "number"
          ? body.temperature
          : 0.7,
      max_tokens:
        typeof body.max_tokens === "number"
          ? body.max_tokens
          : 8192
    };

    const response = await ccFetch(
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
          error: {
            message:
              "CodeCraft API error: " +
              errorText
          }
        }),
        {
          status: response.status,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
            ...corsHeaders()
          }
        }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        ...corsHeaders()
      }
    });
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : String(error)
        }
      },
      500
    );
  }
}

async function handleModels(env) {
  try {
    const response = await ccFetch(
      env,
      "/models",
      {
        method: "GET"
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return new Response(text, {
        status: response.status,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
          ...corsHeaders()
        }
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return json({
        data: [],
        error: {
          message: "Invalid models response."
        }
      });
    }

    if (Array.isArray(data.data)) {
      data.data = sortModels(data.data);
    } else if (Array.isArray(data)) {
      data = {
        data: sortModels(data)
      };
    }

    return json(data);
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : String(error)
        }
      },
      500
    );
  }
}

async function handleImageGeneration(request, env) {
  try {
    if (!env.AI || typeof env.AI.run !== "function") {
      return json(
        {
          error: {
            message:
              "Cloudflare Workers AI binding is not available. Check wrangler.jsonc."
          }
        },
        501
      );
    }

    const body = await request.json();

    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return json(
        {
          error: {
            message: "Image prompt is empty."
          }
        },
        400
      );
    }

    if (prompt.length > 2048) {
      return json(
        {
          error: {
            message:
              "Image prompt must be 2048 characters or less."
          }
        },
        400
      );
    }

    const result = await env.AI.run(
      IMAGE_MODEL,
      {
        prompt: prompt,
        seed:
          typeof body.seed === "number"
            ? body.seed
            : undefined,
        steps: 8
      }
    );

    if (!result || !result.image) {
      return json(
        {
          error: {
            message:
              "Image model did not return an image."
          }
        },
        502
      );
    }

    return json({
      success: true,
      model: IMAGE_MODEL,
      image:
        "data:image/jpeg;base64," +
        result.image
    });
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : String(error)
        }
      },
      500
    );
  }
}

async function handleHealth(env) {
  return json({
    ok: true,
    service: "AetherAI",
    codecraft: Boolean(apiKey(env)),
    workersAI: Boolean(env.AI)
  });
}

function manifest() {
  return json({
    name: "AetherAI",
    short_name: "AetherAI",
    description: "Your personal AI assistant",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  });
}

function icon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="112" fill="#0b0b0f"/>
      <circle cx="256" cy="256" r="145" fill="none" stroke="#ffffff" stroke-width="34"/>
      <path d="M165 310c25 30 57 45 91 45 55 0 100-37 100-83 0-46-45-83-100-83-34 0-66 15-91 45"
        fill="none" stroke="#ffffff" stroke-width="30" stroke-linecap="round"/>
    </svg>`,
    {
      headers: {
        "Content-Type": "image/svg+xml",
        ...corsHeaders()
      }
    }
  );
}

function serviceWorker() {
  return new Response(
    `
const CACHE = "aetherai-v3";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "/",
        "/manifest.json",
        "/icon.svg"
      ]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
`,
    {
      headers: {
        "Content-Type":
          "application/javascript; charset=utf-8",
        ...corsHeaders()
      }
    }
  );
}

function appHTML() {
  return String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">

<title>AetherAI</title>

<meta name="theme-color" content="#0b0b0f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AetherAI">

<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icon.svg">

<style>
*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  width:100%;
  height:100%;
  background:#0b0b0f;
  color:#f5f5f5;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  overflow:hidden;
}

button,
textarea,
select,
input{
  font:inherit;
}

button{
  color:inherit;
}

.app{
  width:100%;
  height:100dvh;
  display:flex;
  background:#0b0b0f;
}

.sidebar{
  width:280px;
  flex-shrink:0;
  height:100%;
  background:#111116;
  border-right:1px solid #25252d;
  display:flex;
  flex-direction:column;
  padding:12px;
  z-index:50;
}

.brand{
  height:48px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 8px;
  font-weight:700;
  font-size:17px;
}

.brand-icon{
  width:30px;
  height:30px;
  border-radius:10px;
  background:#fff;
  color:#111;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
}

.new-chat{
  width:100%;
  border:1px solid #303039;
  background:#19191f;
  border-radius:12px;
  padding:11px 13px;
  cursor:pointer;
  text-align:left;
  margin:8px 0 10px;
}

.new-chat:hover{
  background:#202027;
}

.search{
  width:100%;
  border:1px solid #2a2a32;
  background:#16161b;
  border-radius:10px;
  padding:10px 12px;
  outline:none;
  color:#fff;
  margin-bottom:10px;
}

.history{
  overflow:auto;
  flex:1;
  padding-right:2px;
}

.history::-webkit-scrollbar,
.chat::-webkit-scrollbar{
  width:7px;
}

.history::-webkit-scrollbar-thumb,
.chat::-webkit-scrollbar-thumb{
  background:#303039;
  border-radius:20px;
}

.chat-item{
  border:0;
  width:100%;
  background:transparent;
  color:#ddd;
  text-align:left;
  border-radius:9px;
  padding:10px;
  margin:2px 0;
  cursor:pointer;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.chat-item:hover{
  background:#1d1d24;
}

.sidebar-bottom{
  border-top:1px solid #25252d;
  padding-top:10px;
}

.small-btn{
  width:100%;
  border:0;
  background:transparent;
  text-align:left;
  color:#bbb;
  border-radius:9px;
  padding:9px 10px;
  cursor:pointer;
}

.small-btn:hover{
  background:#1d1d24;
}

.main{
  min-width:0;
  flex:1;
  height:100%;
  display:flex;
  flex-direction:column;
  position:relative;
}

.topbar{
  height:58px;
  flex-shrink:0;
  border-bottom:1px solid #202027;
  display:flex;
  align-items:center;
  padding:0 16px;
  gap:10px;
  background:rgba(11,11,15,.92);
  backdrop-filter:blur(16px);
  z-index:20;
}

.mobile-menu{
  display:none;
  border:0;
  background:transparent;
  font-size:22px;
  cursor:pointer;
}

.model-select{
  appearance:none;
  border:0;
  background:transparent;
  color:#eee;
  font-weight:600;
  outline:none;
  max-width:280px;
  cursor:pointer;
}

.model-info{
  color:#777;
  font-size:12px;
  margin-left:auto;
}

.chat{
  flex:1;
  min-height:0;
  overflow-y:auto;
  overflow-x:hidden;
  padding:30px 20px 180px;
  scroll-behavior:auto;
}

.chat-inner{
  max-width:900px;
  margin:0 auto;
}

.welcome{
  min-height:55vh;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  text-align:center;
  padding:50px 10px;
}

.welcome-logo{
  width:64px;
  height:64px;
  border-radius:20px;
  background:#fff;
  color:#111;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:30px;
  font-weight:900;
  margin-bottom:18px;
}

.welcome h1{
  font-size:30px;
  margin:0 0 8px;
}

.welcome p{
  color:#888;
  margin:0 0 25px;
}

.suggestions{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:9px;
  max-width:650px;
}

.suggestion{
  background:#15151b;
  border:1px solid #2a2a32;
  border-radius:12px;
  padding:10px 13px;
  color:#ccc;
  cursor:pointer;
}

.suggestion:hover{
  background:#1e1e25;
}

.message{
  display:flex;
  gap:14px;
  padding:20px 4px;
}

.message.user{
  justify-content:flex-end;
}

.message.user .avatar{
  order:2;
}

.message.user .bubble{
  background:#24242c;
  border-radius:18px;
  padding:11px 15px;
  max-width:min(78%,700px);
}

.message.assistant{
  align-items:flex-start;
}

.avatar{
  width:30px;
  height:30px;
  border-radius:9px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  font-weight:800;
}

.avatar.ai{
  background:#fff;
  color:#111;
}

.avatar.user-avatar{
  background:#34343d;
  color:#eee;
}

.bubble{
  min-width:0;
  max-width:850px;
  line-height:1.65;
  font-size:15px;
}

.message-actions{
  display:flex;
  gap:6px;
  margin-top:9px;
  opacity:.65;
}

.action{
  border:0;
  background:transparent;
  color:#999;
  font-size:12px;
  padding:4px 6px;
  cursor:pointer;
  border-radius:6px;
}

.action:hover{
  background:#202027;
  color:#fff;
}

.md h1,
.md h2,
.md h3,
.md h4,
.md h5,
.md h6{
  line-height:1.3;
  margin:20px 0 9px;
}

.md h1{font-size:27px}
.md h2{font-size:23px}
.md h3{font-size:20px}
.md h4{font-size:18px}
.md h5{font-size:16px}
.md h6{font-size:15px}

.md p{
  margin:0 0 13px;
}

.md ul,
.md ol{
  margin:8px 0 14px;
  padding-left:25px;
}

.md li{
  margin:5px 0;
}

.md blockquote{
  border-left:3px solid #777;
  padding:3px 0 3px 15px;
  margin:12px 0;
  color:#aaa;
}

.md hr{
  border:0;
  border-top:1px solid #303039;
  margin:22px 0;
}

.md a{
  color:#8ab4ff;
  text-decoration:underline;
}

.inline-code{
  background:#1b1b22;
  border:1px solid #303039;
  padding:2px 6px;
  border-radius:6px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:.9em;
}

.code-wrap{
  background:#101014;
  border:1px solid #2c2c35;
  border-radius:12px;
  margin:15px 0;
  overflow:hidden;
}

.code-head{
  height:36px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 9px 0 12px;
  background:#18181e;
  color:#888;
  font-size:11px;
}

.code-copy{
  border:0;
  background:transparent;
  color:#aaa;
  padding:5px 8px;
  border-radius:6px;
  cursor:pointer;
}

.code-copy:hover{
  background:#292930;
  color:#fff;
}

.code-wrap pre,
pre.code{
  margin:0;
  padding:14px;
  overflow:auto;
  font-size:13px;
  line-height:1.55;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
}

.image-result{
  max-width:100%;
}

.image-result img{
  display:block;
  max-width:min(100%,700px);
  max-height:700px;
  border-radius:14px;
  border:1px solid #303039;
}

.image-actions{
  display:flex;
  gap:8px;
  margin-top:9px;
}

.image-actions a,
.image-actions button{
  border:1px solid #303039;
  background:#17171d;
  color:#ddd;
  padding:7px 10px;
  border-radius:8px;
  text-decoration:none;
  cursor:pointer;
}

.typing{
  display:inline-flex;
  gap:4px;
  align-items:center;
}

.typing span{
  width:5px;
  height:5px;
  background:#888;
  border-radius:50%;
  animation:bounce 1s infinite;
}

.typing span:nth-child(2){animation-delay:.15s}
.typing span:nth-child(3){animation-delay:.3s}

@keyframes bounce{
  0%,60%,100%{transform:translateY(0);opacity:.5}
  30%{transform:translateY(-4px);opacity:1}
}

.composer-wrap{
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  padding:16px 20px 20px;
  background:linear-gradient(
    transparent,
    rgba(11,11,15,.94) 28%
  );
  pointer-events:none;
}

.composer{
  pointer-events:auto;
  max-width:850px;
  margin:0 auto;
  background:#18181e;
  border:1px solid #34343d;
  border-radius:18px;
  box-shadow:0 8px 40px rgba(0,0,0,.35);
}

.attachments{
  display:flex;
  gap:7px;
  padding:9px 12px 0;
  overflow-x:auto;
}

.attachment{
  background:#22222a;
  border:1px solid #33333d;
  border-radius:9px;
  padding:6px 9px;
  font-size:11px;
  color:#bbb;
  white-space:nowrap;
}

.composer-row{
  display:flex;
  align-items:flex-end;
  gap:7px;
  padding:9px;
}

.icon-btn{
  width:38px;
  height:38px;
  border:0;
  border-radius:10px;
  background:transparent;
  color:#aaa;
  cursor:pointer;
  flex-shrink:0;
}

.icon-btn:hover{
  background:#25252c;
  color:#fff;
}

.icon-btn.active{
  background:#fff;
  color:#111;
}

.prompt{
  flex:1;
  min-width:0;
  max-height:180px;
  min-height:38px;
  resize:none;
  border:0;
  outline:none;
  background:transparent;
  color:#fff;
  padding:9px 4px;
  line-height:1.45;
}

.prompt::placeholder{
  color:#777;
}

.send{
  width:38px;
  height:38px;
  border:0;
  border-radius:11px;
  background:#fff;
  color:#111;
  cursor:pointer;
  font-weight:900;
}

.send:disabled{
  opacity:.4;
  cursor:not-allowed;
}

.attach-input{
  display:none;
}

.bottom-note{
  text-align:center;
  color:#666;
  font-size:10px;
  margin-top:7px;
}

.scroll-bottom{
  position:absolute;
  right:24px;
  bottom:105px;
  width:38px;
  height:38px;
  border-radius:50%;
  border:1px solid #383841;
  background:#17171d;
  color:#ddd;
  cursor:pointer;
  display:none;
  z-index:10;
}

.overlay{
  display:none;
}

@media(max-width:760px){
  .sidebar{
    position:fixed;
    left:0;
    top:0;
    bottom:0;
    transform:translateX(-102%);
    transition:transform .2s ease;
    box-shadow:20px 0 50px rgba(0,0,0,.35);
  }

  .sidebar.open{
    transform:translateX(0);
  }

  .mobile-menu{
    display:block;
  }

  .overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.55);
    z-index:40;
  }

  .overlay.show{
    display:block;
  }

  .model-select{
    max-width:190px;
  }

  .model-info{
    display:none;
  }

  .chat{
    padding:18px 12px 165px;
  }

  .message{
    padding:15px 2px;
  }

  .message.user .bubble{
    max-width:88%;
  }

  .bubble{
    font-size:14px;
  }

  .composer-wrap{
    padding:10px 10px calc(10px + env(safe-area-inset-bottom));
  }

  .welcome h1{
    font-size:26px;
  }
}
</style>
</head>

<body>
<div class="app">

  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <div class="brand-icon">A</div>
      <span>AetherAI</span>
    </div>

    <button class="new-chat" id="newChat">
      ＋ New chat
    </button>

    <input
      id="search"
      class="search"
      placeholder="Search chats..."
      autocomplete="off"
    >

    <div class="history" id="history"></div>

    <div class="sidebar-bottom">
      <button class="small-btn" id="memoryBtn">
        🧠 Memory
      </button>

      <button class="small-btn" id="installBtn">
        ⌂ Add to Home Screen
      </button>
    </div>
  </aside>

  <div class="overlay" id="overlay"></div>

  <main class="main">

    <header class="topbar">
      <button class="mobile-menu" id="menuBtn">☰</button>

      <select class="model-select" id="modelSelect"></select>

      <div class="model-info" id="modelInfo">
        Auto-selected model
      </div>
    </header>

    <section class="chat" id="chat">
      <div class="chat-inner" id="chatInner"></div>
    </section>

    <button class="scroll-bottom" id="scrollBottom">↓</button>

    <div class="composer-wrap">
      <div class="composer">

        <div class="attachments" id="attachments"></div>

        <div class="composer-row">

          <button class="icon-btn" id="attachBtn" title="Attach file">
            ＋
          </button>

          <input
            type="file"
            id="fileInput"
            class="attach-input"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,text/plain,text/markdown,text/csv,application/json,application/pdf,.txt,.md,.csv,.json,.pdf,.doc,.docx"
          >

          <button
            class="icon-btn"
            id="imageBtn"
            title="Generate image"
          >
            ✦
          </button>

          <textarea
            id="prompt"
            class="prompt"
            rows="1"
            placeholder="Message AetherAI..."
            autocomplete="off"
          ></textarea>

          <button class="send" id="sendBtn">↑</button>

        </div>
      </div>

      <div class="bottom-note">
        AetherAI can make mistakes. Check important information.
      </div>
    </div>

  </main>
</div>

<script>
(function(){

  "use strict";

  var $ = function(id){
    return document.getElementById(id);
  };

  var state = {
    chats: [],
    currentChatId: null,
    memories: [],
    models: [],
    selectedModel: localStorage.getItem("aether_model") || "",
    attachments: [],
    generating: false,
    controller: null,
    imageMode: false
  };

  var elements = {
    sidebar: $("sidebar"),
    overlay: $("overlay"),
    menuBtn: $("menuBtn"),
    newChat: $("newChat"),
    search: $("search"),
    history: $("history"),
    memoryBtn: $("memoryBtn"),
    installBtn: $("installBtn"),
    modelSelect: $("modelSelect"),
    modelInfo: $("modelInfo"),
    chat: $("chat"),
    chatInner: $("chatInner"),
    scrollBottom: $("scrollBottom"),
    prompt: $("prompt"),
    sendBtn: $("sendBtn"),
    attachBtn: $("attachBtn"),
    fileInput: $("fileInput"),
    attachments: $("attachments"),
    imageBtn: $("imageBtn")
  };

  function uid(){
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2);
  }

  function escapeHTML(value){
    return String(value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function safeURL(url){
    var value = String(url || "").trim();

    if (
      /^https?:\\/\\//i.test(value) ||
      /^mailto:/i.test(value) ||
      /^\\//.test(value)
    ){
      return value;
    }

    return "#";
  }

  function inlineMarkdown(text){
    var source = String(text || "");
    var inlineCodes = [];

    source = source.replace(/`([^`]+)`/g, function(_, code){
      var id = inlineCodes.length;
      inlineCodes.push(
        '<span class="inline-code">' +
        escapeHTML(code) +
        '</span>'
      );
      return "@@INLINECODE" + id + "@@";
    });

    source = escapeHTML(source);

    source = source.replace(
      /\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g,
      function(_, label, url){
        var safe = safeURL(
          String(url).replace(/&amp;/g,"&")
        );

        return '<a href="' +
          escapeHTML(safe) +
          '" target="_blank" rel="noopener noreferrer">' +
          label +
          '</a>';
      }
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
      /(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)/g,
      "<em>$1</em>"
    );

    source = source.replace(
      /(?<!_)_([^_\\n]+)_(?!_)/g,
      "<em>$1</em>"
    );

    source = source.replace(
      /@@INLINECODE(\\d+)@@/g,
      function(_, id){
        return inlineCodes[Number(id)] || "";
      }
    );

    return source;
  }

  function markdown(source){
    var text = String(source || "")
      .replace(/\\r\\n/g,"\\n")
      .replace(/\\r/g,"\\n");

    var codeBlocks = [];

    text = text.replace(
      /^```([^\\n]*)\\n([\\s\\S]*?)^```[ \\t]*$/gm,
      function(_, language, code){
        var id = codeBlocks.length;

        codeBlocks.push({
          language: language.trim() || "code",
          code: code.replace(/\\n$/,"")
        });

        return "@@CODEBLOCK" + id + "@@";
      }
    );

    var lines = text.split("\\n");
    var output = [];
    var paragraph = [];
    var listType = null;
    var listItems = [];

    function flushParagraph(){
      if (!paragraph.length) return;

      output.push(
        "<p>" +
        inlineMarkdown(paragraph.join("<br>")) +
        "</p>"
      );

      paragraph = [];
    }

    function flushList(){
      if (!listItems.length) return;

      var tag = listType === "ol" ? "ol" : "ul";

      output.push(
        "<" + tag + ">" +
        listItems.map(function(item){
          return "<li>" + inlineMarkdown(item) + "</li>";
        }).join("") +
        "</" + tag + ">"
      );

      listItems = [];
      listType = null;
    }

    lines.forEach(function(rawLine){

      var line = rawLine;

      if (/^\\s*$/.test(line)){
        flushParagraph();
        flushList();
        return;
      }

      var heading = line.match(/^\\s*(#{1,6})\\s+(.+)$/);

      if (heading){
        flushParagraph();
        flushList();

        var level = heading[1].length;

        output.push(
          "<h" + level + ">" +
          inlineMarkdown(heading[2]) +
          "</h" + level + ">"
        );

        return;
      }

      if (/^\\s*(---+|\\*\\*\\*+)\\s*$/.test(line)){
        flushParagraph();
        flushList();
        output.push("<hr>");
        return;
      }

      var quote = line.match(/^\\s*>\\s?(.*)$/);

      if (quote){
        flushParagraph();
        flushList();

        output.push(
          "<blockquote>" +
          inlineMarkdown(quote[1]) +
          "</blockquote>"
        );

        return;
      }

      var unordered = line.match(/^\\s*[-*+]\\s+(.+)$/);

      if (unordered){
        flushParagraph();

        if (listType && listType !== "ul"){
          flushList();
        }

        listType = "ul";
        listItems.push(unordered[1]);

        return;
      }

      var ordered = line.match(/^\\s*\\d+[.)]\\s+(.+)$/);

      if (ordered){
        flushParagraph();

        if (listType && listType !== "ol"){
          flushList();
        }

        listType = "ol";
        listItems.push(ordered[1]);

        return;
      }

      if (
        /^@@CODEBLOCK\\d+@@$/.test(line.trim())
      ){
        flushParagraph();
        flushList();

        var codeId = Number(
          line.trim()
            .replace("@@CODEBLOCK","")
            .replace("@@","")
        );

        var block = codeBlocks[codeId];

        if (block){
          output.push(
            '<div class="code-wrap">' +
              '<div class="code-head">' +
                '<span>' +
                  escapeHTML(block.language) +
                '</span>' +
                '<button class="code-copy" data-code="' +
                  encodeURIComponent(block.code) +
                '">' +
                  'Copy' +
                '</button>' +
              '</div>' +
              '<pre><code>' +
                escapeHTML(block.code) +
              '</code></pre>' +
            '</div>'
          );
        }

        return;
      }

      paragraph.push(line);
    });

    flushParagraph();
    flushList();

    return output.join("");
  }

  function saveState(){
    localStorage.setItem(
      "aether_chats",
      JSON.stringify(state.chats)
    );

    localStorage.setItem(
      "aether_memories",
      JSON.stringify(state.memories)
    );
  }

  function loadState(){
    try{
      state.chats =
        JSON.parse(
          localStorage.getItem("aether_chats") || "[]"
        );
    }catch{
      state.chats = [];
    }

    try{
      state.memories =
        JSON.parse(
          localStorage.getItem("aether_memories") || "[]"
        );
    }catch{
      state.memories = [];
    }

    if (!state.chats.length){
      createChat(false);
    }else{
      state.currentChatId =
        state.chats[0].id;
    }
  }

  function currentChat(){
    return state.chats.find(function(chat){
      return chat.id === state.currentChatId;
    });
  }

  function createChat(render){
    var chat = {
      id: uid(),
      title: "New chat",
      messages: [],
      created: Date.now(),
      updated: Date.now()
    };

    state.chats.unshift(chat);
    state.currentChatId = chat.id;

    saveState();

    if (render !== false){
      renderHistory();
      renderChat();
    }

    closeSidebar();
  }

  function renderHistory(){
    var query =
      String(elements.search.value || "")
        .trim()
        .toLowerCase();

    var chats = state.chats.filter(function(chat){
      if (!query) return true;

      return (
        chat.title.toLowerCase().includes(query) ||
        chat.messages.some(function(m){
          return String(m.content || "")
            .toLowerCase()
            .includes(query);
        })
      );
    });

    elements.history.innerHTML = chats.map(function(chat){
      var active =
        chat.id === state.currentChatId
          ? ' style="background:#22222a"'
          : "";

      return (
        '<button class="chat-item" data-chat="' +
        escapeHTML(chat.id) +
        '"' +
        active +
        '>' +
        escapeHTML(chat.title || "New chat") +
        '</button>'
      );
    }).join("");
  }

  function welcomeHTML(){
    return (
      '<div class="welcome">' +
        '<div class="welcome-logo">A</div>' +
        '<h1>How can I help?</h1>' +
        '<p>Ask AetherAI anything.</p>' +
        '<div class="suggestions">' +
          '<button class="suggestion">Explain something simply</button>' +
          '<button class="suggestion">Write some code</button>' +
          '<button class="suggestion">Research a topic</button>' +
          '<button class="suggestion">Create an image</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderImageMessage(message){
    var image = message.image || "";

    return (
      '<div class="image-result">' +
        '<img src="' +
          escapeHTML(image) +
          '" alt="Generated image">' +
        '<div class="image-actions">' +
          '<a href="' +
            escapeHTML(image) +
            '" target="_blank" rel="noopener noreferrer">' +
            'Open image' +
          '</a>' +
          '<a href="' +
            escapeHTML(image) +
            '" download="aetherai-image.jpg">' +
            'Save image' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  function renderMessage(message, index){
    var isUser = message.role === "user";

    var content = "";

    if (message.type === "image"){
      content = renderImageMessage(message);
    }else{
      content =
        '<div class="md">' +
        markdown(message.content || "") +
        '</div>';
    }

    var actions = "";

    if (!isUser){
      actions =
        '<div class="message-actions">' +
          '<button class="action copy-message" data-index="' +
            index +
          '">Copy</button>' +
          '<button class="action regenerate" data-index="' +
            index +
          '">Regenerate</button>' +
        '</div>';
    }

    return (
      '<article class="message ' +
        (isUser ? "user" : "assistant") +
      '">' +

        '<div class="avatar ' +
          (isUser ? "user-avatar" : "ai") +
        '">' +
          (isUser ? "U" : "A") +
        '</div>' +

        '<div class="bubble">' +
          content +
          actions +
        '</div>' +

      '</article>'
    );
  }

  function renderChat(){
    var chat = currentChat();

    if (!chat || !chat.messages.length){
      elements.chatInner.innerHTML =
        welcomeHTML();
      return;
    }

    elements.chatInner.innerHTML =
      chat.messages.map(renderMessage).join("");

    elements.chat.scrollTop =
      elements.chat.scrollHeight;
  }

  function renderStreamingAssistant(index){
    var chat = currentChat();

    if (!chat) return;

    var existing =
      document.querySelector(
        '[data-streaming-message]'
      );

    var content =
      chat.messages[index] &&
      chat.messages[index].content
        ? chat.messages[index].content
        : "";

    var html =
      '<article class="message assistant" data-streaming-message>' +
        '<div class="avatar ai">A</div>' +
        '<div class="bubble">' +
          '<div class="md">' +
            markdown(content) +
          '</div>' +
        '</div>' +
      '</article>';

    if (existing){
      existing.outerHTML = html;
    }else{
      elements.chatInner.insertAdjacentHTML(
        "beforeend",
        html
      );
    }
  }

  function isNearBottom(){
    return (
      elements.chat.scrollHeight -
      elements.chat.scrollTop -
      elements.chat.clientHeight
    ) < 140;
  }

  function scrollToBottom(){
    elements.chat.scrollTop =
      elements.chat.scrollHeight;
  }

  function updateScrollButton(){
    var away = !isNearBottom();

    elements.scrollBottom.style.display =
      away ? "block" : "none";
  }

  function setGenerating(value){
    state.generating = value;

    if (value){
      elements.sendBtn.textContent = "■";
      elements.sendBtn.title = "Stop";
    }else{
      elements.sendBtn.textContent = "↑";
      elements.sendBtn.title = "Send";
    }

    elements.prompt.disabled = false;
  }

  function autoTitle(chat, text){
    if (
      chat.title !== "New chat" ||
      !text
    ){
      return;
    }

    var clean =
      text.replace(/\\s+/g," ").trim();

    chat.title =
      clean.length > 42
        ? clean.slice(0,42) + "…"
        : clean;
  }

  function looksLikeImageRequest(text){
    var value =
      String(text || "")
        .toLowerCase()
        .trim();

    var action =
      /^(create|generate|draw|make|design|render|produce|show|give me|make me|create me)/i
        .test(value);

    var imageWord =
      /(image|picture|photo|wallpaper|illustration|logo|poster|artwork|portrait|thumbnail|background)/i
        .test(value);

    return action && imageWord;
  }

  async function generateImage(prompt){
    var chat = currentChat();

    if (!chat) return;

    setGenerating(true);

    var userMessage = {
      role: "user",
      content: prompt
    };

    chat.messages.push(userMessage);
    autoTitle(chat,prompt);
    chat.updated = Date.now();

    renderChat();
    renderHistory();

    var loadingIndex = chat.messages.length;

    chat.messages.push({
      role: "assistant",
      content: "Generating your image…"
    });

    renderChat();

    try{
      var response = await fetch(
        "/api/generate-image",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            prompt:prompt
          })
        }
      );

      var data = await response.json();

      if (!response.ok || !data.image){
        throw new Error(
          data &&
          data.error &&
          data.error.message
            ? data.error.message
            : "Image generation failed."
        );
      }

      chat.messages.pop();

      chat.messages.push({
        role:"assistant",
        type:"image",
        content:"Generated image",
        image:data.image
      });

      chat.updated = Date.now();

      saveState();
      renderChat();
      renderHistory();

    }catch(error){
      chat.messages.pop();

      chat.messages.push({
        role:"assistant",
        content:
          "I couldn't generate the image.\\n\\n" +
          "**Error:** " +
          String(error.message || error)
      });

      saveState();
      renderChat();
      renderHistory();
    }finally{
      setGenerating(false);
    }
  }

  function collectMemory(text){
    var value =
      String(text || "").trim();

    if (!value) return;

    var match =
      value.match(
        /(?:remember that|remember|my name is|i am|i'm|i like|i prefer)\\s+(.{3,180})/i
      );

    if (!match) return;

    var memory = match[0].trim();

    if (
      !state.memories.some(function(item){
        return item.toLowerCase() ===
          memory.toLowerCase();
      })
    ){
      state.memories.unshift(memory);
      state.memories =
        state.memories.slice(0,50);

      saveState();
    }
  }

  function buildMessages(){
    var chat = currentChat();

    if (!chat) return [];

    return chat.messages
      .filter(function(message){
        return (
          message.role === "user" ||
          message.role === "assistant"
        );
      })
      .filter(function(message){
        return message.type !== "image";
      })
      .map(function(message){
        return {
          role:message.role,
          content:message.content
        };
      });
  }

  function parseSSEChunk(buffer, callback){
    var normalized =
      buffer.replace(/\\r\\n/g,"\\n");

    var parts =
      normalized.split("\\n\\n");

    var remainder =
      parts.pop() || "";

    parts.forEach(function(event){
      var lines = event.split("\\n");
      var dataLines = [];

      lines.forEach(function(line){
        if (line.indexOf("data:") === 0){
          dataLines.push(
            line.slice(5).trim()
          );
        }
      });

      if (!dataLines.length) return;

      var data = dataLines.join("\\n");

      if (data === "[DONE]"){
        callback({done:true});
        return;
      }

      try{
        callback({
          json:JSON.parse(data)
        });
      }catch{
        // Ignore malformed SSE chunks.
      }
    });

    return remainder;
  }

  async function sendMessage(){
    if (state.generating){
      if (state.controller){
        state.controller.abort();
      }
      return;
    }

    var prompt =
      String(elements.prompt.value || "").trim();

    if (!prompt && !state.attachments.length){
      return;
    }

    var chat = currentChat();

    if (!chat){
      createChat(false);
      chat = currentChat();
    }

    var nearBottom = isNearBottom();

    if (
      state.imageMode ||
      looksLikeImageRequest(prompt)
    ){
      elements.prompt.value = "";
      resizePrompt();

      state.imageMode = false;
      elements.imageBtn.classList.remove("active");

      await generateImage(prompt);
      return;
    }

    var userContent = prompt;

    if (state.attachments.length){
      var fileText =
        state.attachments.map(function(file){
          if (file.kind === "image"){
            return (
              "\\n[Attached image: " +
              file.name +
              "]"
            );
          }

          return (
            "\\n\\n[File: " +
            file.name +
            "]\\n" +
            file.text
          );
        }).join("\\n");

      userContent += fileText;
    }

    elements.prompt.value = "";
    resizePrompt();

    collectMemory(prompt);

    chat.messages.push({
      role:"user",
      content:userContent
    });

    autoTitle(chat,prompt || "Attached files");
    chat.updated = Date.now();

    saveState();
    renderHistory();

    var assistantIndex =
      chat.messages.length;

    chat.messages.push({
      role:"assistant",
      content:""
    });

    renderChat();

    if (nearBottom){
      scrollToBottom();
    }

    setGenerating(true);

    state.controller =
      new AbortController();

    var model =
      state.selectedModel ||
      (
        state.models[0]
          ? state.models[0].id
          : ""
      );

    try{
      var response = await fetch(
        "/api/chat",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          signal:state.controller.signal,
          body:JSON.stringify({
            model:model,
            messages:buildMessages(),
            memories:state.memories,
            max_tokens:8192,
            temperature:.7
          })
        }
      );

      if (!response.ok){
        var errorText =
          await response.text();

        var parsedError = null;

        try{
          parsedError =
            JSON.parse(errorText);
        }catch{}

        throw new Error(
          parsedError &&
          parsedError.error &&
          parsedError.error.message
            ? parsedError.error.message
            : errorText ||
              "Request failed."
        );
      }

      if (!response.body){
        throw new Error(
          "Streaming is not supported by this response."
        );
      }

      var reader =
        response.body.getReader();

      var decoder =
        new TextDecoder();

      var buffer = "";
      var finished = false;

      while (!finished){
        var result =
          await reader.read();

        if (result.done) break;

        buffer +=
          decoder.decode(
            result.value,
            {stream:true}
          );

        buffer =
          parseSSEChunk(
            buffer,
            function(event){

              if (event.done){
                finished = true;
                return;
              }

              if (!event.json) return;

              var delta =
                extractDelta(event.json);

              if (!delta) return;

              chat.messages[
                assistantIndex
              ].content += delta;

              renderStreamingAssistant(
                assistantIndex
              );

              if (isNearBottom()){
                scrollToBottom();
              }

            }
          );
      }

      buffer += decoder.decode();

      chat.updated = Date.now();

      saveState();
      renderHistory();

      var finalNearBottom =
        isNearBottom();

      renderChat();

      if (finalNearBottom){
        scrollToBottom();
      }

    }catch(error){

      if (
        error &&
        error.name === "AbortError"
      ){
        chat.messages[
          assistantIndex
        ].content +=
          "\\n\\n_Generation stopped._";
      }else{
        chat.messages[
          assistantIndex
        ].content =
          "Sorry, something went wrong.\\n\\n" +
          "**Error:** " +
          String(
            error && error.message
              ? error.message
              : error
          );
      }

      saveState();
      renderChat();

    }finally{
      state.controller = null;
      state.attachments = [];
      renderAttachments();
      setGenerating(false);
    }
  }

  async function loadModels(){
    elements.modelSelect.innerHTML =
      '<option>Loading models…</option>';

    try{
      var response =
        await fetch("/api/models");

      var data =
        await response.json();

      var models =
        Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      state.models = models;

      if (!state.models.length){
        elements.modelSelect.innerHTML =
          '<option>No models available</option>';

        return;
      }

      var savedExists =
        state.models.some(function(model){
          return model.id ===
            state.selectedModel;
        });

      if (!savedExists){
        state.selectedModel =
          state.models[0].id;

        localStorage.setItem(
          "aether_model",
          state.selectedModel
        );
      }

      elements.modelSelect.innerHTML =
        state.models.map(function(model,index){
          return (
            '<option value="' +
            escapeHTML(model.id) +
            '">' +
            escapeHTML(
              (index === 0 ? "★ " : "") +
              (model.name || model.id)
            ) +
            '</option>'
          );
        }).join("");

      elements.modelSelect.value =
        state.selectedModel;

      updateModelInfo();

    }catch(error){

      elements.modelSelect.innerHTML =
        '<option>Model loading failed</option>';

      elements.modelInfo.textContent =
        "Could not load models";
    }
  }

  function updateModelInfo(){
    var model =
      state.models.find(function(item){
        return item.id ===
          state.selectedModel;
      });

    if (!model){
      elements.modelInfo.textContent =
        "Auto-selected model";
      return;
    }

    var caps =
      getCapabilities(model);

    var labels = [];

    if (caps.has("reasoning"))
      labels.push("reasoning");

    if (caps.has("vision"))
      labels.push("vision");

    if (caps.has("web_search"))
      labels.push("web");

    if (caps.has("tools"))
      labels.push("tools");

    elements.modelInfo.textContent =
      labels.length
        ? labels.join(" · ")
        : "AetherAI model";
  }

  function renderAttachments(){
    elements.attachments.innerHTML =
      state.attachments.map(function(file,index){
        return (
          '<div class="attachment">' +
            escapeHTML(file.name) +
            ' × ' +
            '<button class="action remove-file" data-file="' +
              index +
            '">remove</button>' +
          '</div>'
        );
      }).join("");
  }

  function readAsDataURL(file){
    return new Promise(function(resolve,reject){
      var reader = new FileReader();

      reader.onload =
        function(){
          resolve(reader.result);
        };

      reader.onerror =
        function(){
          reject(
            new Error(
              "Could not read " +
              file.name
            )
          );
        };

      reader.readAsDataURL(file);
    });
  }

  function readAsText(file){
    return new Promise(function(resolve,reject){
      var reader = new FileReader();

      reader.onload =
        function(){
          resolve(String(reader.result || ""));
        };

      reader.onerror =
        function(){
          reject(
            new Error(
              "Could not read " +
              file.name
            )
          );
        };

      reader.readAsText(file);
    });
  }

  async function addFiles(files){
    var list =
      Array.from(files || []);

    for (var i=0;i<list.length;i++){
      var file = list[i];

      if (file.size > 8 * 1024 * 1024){
        alert(
          file.name +
          " is larger than 8 MB."
        );
        continue;
      }

      if (file.type.indexOf("image/") === 0){

        if (file.size > 5 * 1024 * 1024){
          alert(
            file.name +
            " is larger than 5 MB. Images must be 5 MB or less."
          );
          continue;
        }

        try{
          var dataURL =
            await readAsDataURL(file);

          state.attachments.push({
            name:file.name,
            kind:"image",
            image:dataURL,
            text:""
          });
        }catch(error){
          alert(error.message);
        }

        continue;
      }

      var isText =
        file.type.indexOf("text/") === 0 ||
        /\\.(txt|md|markdown|csv|json|xml|html|js|css|py|java|c|cpp|h|hpp|ts|tsx|jsx)$/i
          .test(file.name);

      if (isText){
        try{
          var text =
            await readAsText(file);

          state.attachments.push({
            name:file.name,
            kind:"text",
            text:text.slice(0,100000)
          });
        }catch(error){
          alert(error.message);
        }

        continue;
      }

      state.attachments.push({
        name:file.name,
        kind:"text",
        text:
          "[This file type is attached but its binary contents were not extracted by the browser.]"
      });
    }

    renderAttachments();
  }

  function resizePrompt(){
    elements.prompt.style.height =
      "auto";

    elements.prompt.style.height =
      Math.min(
        elements.prompt.scrollHeight,
        180
      ) + "px";
  }

  function openSidebar(){
    elements.sidebar.classList.add("open");
    elements.overlay.classList.add("show");
  }

  function closeSidebar(){
    elements.sidebar.classList.remove("open");
    elements.overlay.classList.remove("show");
  }

  elements.menuBtn.addEventListener(
    "click",
    openSidebar
  );

  elements.overlay.addEventListener(
    "click",
    closeSidebar
  );

  elements.newChat.addEventListener(
    "click",
    function(){
      createChat(true);
    }
  );

  elements.search.addEventListener(
    "input",
    renderHistory
  );

  elements.modelSelect.addEventListener(
    "change",
    function(){
      state.selectedModel =
        elements.modelSelect.value;

      localStorage.setItem(
        "aether_model",
        state.selectedModel
      );

      updateModelInfo();
    }
  );

  elements.attachBtn.addEventListener(
    "click",
    function(){
      elements.fileInput.click();
    }
  );

  elements.fileInput.addEventListener(
    "change",
    function(){
      addFiles(elements.fileInput.files);
      elements.fileInput.value = "";
    }
  );

  elements.imageBtn.addEventListener(
    "click",
    function(){
      state.imageMode =
        !state.imageMode;

      elements.imageBtn.classList.toggle(
        "active",
        state.imageMode
      );

      elements.prompt.placeholder =
        state.imageMode
          ? "Describe the image you want..."
          : "Message AetherAI...";
    }
  );

  elements.prompt.addEventListener(
    "input",
    resizePrompt
  );

  elements.prompt.addEventListener(
    "keydown",
    function(event){
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ){
        event.preventDefault();
        sendMessage();
      }
    }
  );

  elements.sendBtn.addEventListener(
    "click",
    sendMessage
  );

  elements.scrollBottom.addEventListener(
    "click",
    scrollToBottom
  );

  elements.chat.addEventListener(
    "scroll",
    updateScrollButton
  );

  elements.history.addEventListener(
    "click",
    function(event){
      var button =
        event.target.closest(".chat-item");

      if (!button) return;

      state.currentChatId =
        button.dataset.chat;

      renderHistory();
      renderChat();
      closeSidebar();
    }
  );

  elements.attachments.addEventListener(
    "click",
    function(event){
      var button =
        event.target.closest(".remove-file");

      if (!button) return;

      var index =
        Number(button.dataset.file);

      state.attachments.splice(
        index,
        1
      );

      renderAttachments();
    }
  );

  elements.chatInner.addEventListener(
    "click",
    async function(event){

      var suggestion =
        event.target.closest(".suggestion");

      if (suggestion){
        elements.prompt.value =
          suggestion.textContent;

        if (
          suggestion.textContent
            .toLowerCase()
            .includes("image")
        ){
          state.imageMode = true;
          elements.imageBtn.classList.add("active");
          elements.prompt.placeholder =
            "Describe the image you want...";
        }

        resizePrompt();
        elements.prompt.focus();
        return;
      }

      var copyCode =
        event.target.closest(".code-copy");

      if (copyCode){
        try{
          var code =
            decodeURIComponent(
              copyCode.dataset.code || ""
            );

          await navigator.clipboard.writeText(code);

          copyCode.textContent = "Copied";

          setTimeout(function(){
            copyCode.textContent = "Copy";
          },1200);

        }catch{
          copyCode.textContent = "Failed";
        }

        return;
      }

      var copyMessage =
        event.target.closest(".copy-message");

      if (copyMessage){
        var index =
          Number(copyMessage.dataset.index);

        var chat = currentChat();

        if (!chat || !chat.messages[index])
          return;

        var message =
          chat.messages[index];

        try{
          await navigator.clipboard.writeText(
            message.content || ""
          );

          copyMessage.textContent = "Copied";

          setTimeout(function(){
            copyMessage.textContent = "Copy";
          },1200);

        }catch{
          copyMessage.textContent = "Failed";
        }

        return;
      }

      var regenerate =
        event.target.closest(".regenerate");

      if (regenerate){
        regenerateLast();
      }
    }
  );

  function regenerateLast(){
    var chat = currentChat();

    if (!chat || state.generating)
      return;

    var lastAssistant = -1;

    for (
      var i=chat.messages.length-1;
      i>=0;
      i--
    ){
      if (
        chat.messages[i].role ===
        "assistant"
      ){
        lastAssistant = i;
        break;
      }
    }

    if (lastAssistant < 0)
      return;

    var userIndex =
      lastAssistant - 1;

    if (
      !chat.messages[userIndex] ||
      chat.messages[userIndex].role !==
      "user"
    ){
      return;
    }

    var oldUser =
      chat.messages[userIndex].content;

    chat.messages.splice(
      lastAssistant,
      1
    );

    chat.messages.splice(
      userIndex,
      1
    );

    saveState();
    renderChat();

    elements.prompt.value =
      oldUser;

    resizePrompt();

    sendMessage();
  }

  elements.memoryBtn.addEventListener(
    "click",
    function(){
      if (!state.memories.length){
        alert(
          "No saved memories yet.\\n\\n" +
          "Try saying things like: " +
          "\"Remember that I prefer concise answers.\""
        );
        return;
      }

      alert(
        "AetherAI Memory:\\n\\n" +
        state.memories.join("\\n")
      );
    }
  );

  var deferredInstallPrompt = null;

  window.addEventListener(
    "beforeinstallprompt",
    function(event){
      event.preventDefault();
      deferredInstallPrompt = event;
    }
  );

  elements.installBtn.addEventListener(
    "click",
    async function(){

      if (deferredInstallPrompt){
        deferredInstallPrompt.prompt();

        try{
          await deferredInstallPrompt.userChoice;
        }catch{}

        deferredInstallPrompt = null;
        return;
      }

      alert(
        "On iPhone: open this AetherAI page in Safari, tap Share, then choose 'Add to Home Screen'."
      );
    }
  );

  if ("serviceWorker" in navigator){
    window.addEventListener(
      "load",
      function(){
        navigator.serviceWorker.register(
          "/sw.js"
        ).catch(function(){
          // PWA is optional.
        });
      }
    );
  }

  loadState();
  renderHistory();
  renderChat();
  resizePrompt();
  loadModels();

})();
</script>

</body>
</html>`;
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    const url =
      new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname === "/api/health"
    ){
      return handleHealth(env);
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/models"
    ){
      return handleModels(env);
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ){
      return handleChat(request, env);
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/generate-image"
    ){
      return handleImageGeneration(
        request,
        env
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/manifest.json"
    ){
      return manifest();
    }

    if (
      request.method === "GET" &&
      url.pathname === "/icon.svg"
    ){
      return icon();
    }

    if (
      request.method === "GET" &&
      url.pathname === "/sw.js"
    ){
      return serviceWorker();
    }

    if (
      request.method === "GET" &&
      (
        url.pathname === "/" ||
        url.pathname === "/index.html"
      )
    ){
      return html(appHTML());
    }

    return json(
      {
        error:{
          message:"Not found"
        }
      },
      404
    );
  }
};
