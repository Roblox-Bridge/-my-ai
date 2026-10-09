
const COMET_BASE = "https://api.cometapi.com/v1";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const DEFAULT_MODEL = "gpt-6-astra";

const MODEL_ALLOWLIST = [
  "gpt-6-astra",
  "gpt-6-sol",
  "gpt-6.1-sol",
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "grok-4.20-0309-reasoning",
  "grok-4.7",
  "mimo-v2.6-pro"
];

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      ...extra
    }
  });
}

function getKey(env) {
  return env.COMETAPI_API_KEY || "";
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

async function cometRequest(env, path, options = {}, timeout = 20000) {
  const key = getKey(env);

  if (!key) {
    throw new Error("COMETAPI_API_KEY is missing in Cloudflare secrets.");
  }

  const controller = new AbortController();
  let expired = false;

  const timer = setTimeout(() => {
    expired = true;
    controller.abort();
  }, timeout);

  try {
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${key}`);
    headers.set("Accept", "application/json");

    if (options.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(COMET_BASE + path, {
      ...options,
      headers,
      signal: controller.signal
    });

    const text = await response.text();

    if (expired) {
      throw new Error("CometAPI request timed out.");
    }

    return { response, text };
  } catch (error) {
    if (expired || error?.name === "AbortError") {
      throw new Error(
        `CometAPI timed out after ${timeout / 1000} seconds.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function parseJSON(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned invalid JSON.`);
  }
}

function chatModel(model) {
  if (!model || typeof model.id !== "string") return false;

  const id = model.id.toLowerCase();
  const type = String(model.type || "").toLowerCase();

  if (/embedding|moderation|rerank|speech-to-text|text-to-speech/.test(id)) {
    return false;
  }

  if (/image|audio|video|embedding|moderation/.test(type)) {
    return false;
  }

  return true;
}

function normalizeModel(item) {
  if (typeof item === "string") {
    return { id: item, name: item, type: "chat" };
  }

  if (!item || typeof item !== "object") return null;

  const id = item.id || item.model;
  if (typeof id !== "string" || !id) return null;

  return {
    ...item,
    id,
    name: item.name || id
  };
}

function modelArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.models)) return payload.models;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function getModels(env) {
  const { response, text } = await cometRequest(
    env,
    "/models",
    { method: "GET" },
    20000
  );

  if (!response.ok) {
    const detail = response.status === 401 || response.status === 403
      ? "API key rejected or account access denied. Check Cloudflare secrets."
      : response.status === 429
        ? "CometAPI rate limit reached."
        : text.slice(0, 400);

    throw new Error(`/models failed (${response.status}): ${detail}`);
  }

  const payload = parseJSON(text, "CometAPI /models");

  const available = modelArray(payload)
    .map(normalizeModel)
    .filter(Boolean)
    .filter(chatModel)
    .filter(model => MODEL_ALLOWLIST.includes(model.id));

  available.sort(
    (a, b) =>
      MODEL_ALLOWLIST.indexOf(a.id) - MODEL_ALLOWLIST.indexOf(b.id)
  );

  if (!available.length) {
    throw new Error(
      "No allowlisted model IDs were returned. Check the actual IDs from your CometAPI /models response before changing the allowlist."
    );
  }

  return available;
}

async function handleModels(env) {
  try {
    const models = await getModels(env);

    return json({
      ok: true,
      provider: "cometapi",
      models,
      best: models.find(model => model.id === DEFAULT_MODEL) || models[0],
      error: null
    });
  } catch (error) {
    return json({
      ok: false,
      provider: "cometapi",
      models: [],
      best: null,
      error: messageOf(error)
    }, 502);
  }
}

function normalizeMessages(input) {
  if (!Array.isArray(input)) {
    throw new Error("messages must be an array.");
  }

  return input
    .filter(item => item && typeof item === "object")
    .map(item => {
      const role = ["system", "user", "assistant"].includes(item.role)
        ? item.role
        : "user";

      if (typeof item.content === "string") {
        return { role, content: item.content };
      }

      if (Array.isArray(item.content)) {
        const content = item.content.map(part => {
          if (part?.type === "text") {
            return { type: "text", text: String(part.text || "") };
          }

          if (part?.type === "image_url" && part.image_url) {
            return {
              type: "image_url",
              image_url: part.image_url
            };
          }

          return null;
        }).filter(Boolean);

        return { role, content };
      }

      return { role, content: String(item.content ?? "") };
    })
    .filter(item =>
      typeof item.content === "string"
        ? item.content.trim().length > 0
        : item.content.length > 0
    );
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, 400);
  }

  let messages;

  try {
    messages = normalizeMessages(body.messages);
  } catch (error) {
    return json({ error: messageOf(error) }, 400);
  }

  if (!messages.length) {
    return json({ error: "No messages provided." }, 400);
  }

  let models;

  try {
    models = await getModels(env);
  } catch (error) {
    return json({ error: messageOf(error) }, 502);
  }

  const requested = typeof body.model === "string"
    ? body.model
    : DEFAULT_MODEL;

  const selected = models.find(model => model.id === requested);

  if (!selected) {
    return json({
      error: "Selected model is not available. Refresh the model list.",
      availableModels: models.map(model => model.id)
    }, 400);
  }

  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 120000);

  try {
    const response = await fetch(`${COMET_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getKey(env)}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify({
        model: selected.id,
        messages,
        stream: true
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1200);
      clearTimeout(timer);

      return json({
        error: `CometAPI chat failed (${response.status}).`,
        details: detail,
        model: selected.id
      }, response.status);
    }

    if (!response.body) {
      clearTimeout(timer);
      return json({ error: "The provider returned no response stream." }, 502);
    }

    const reader = response.body.getReader();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async pull(output) {
        try {
          const result = await reader.read();

          if (result.done) {
            clearTimeout(timer);
            output.close();
            return;
          }

          output.enqueue(result.value);
        } catch (error) {
          clearTimeout(timer);

          const message = timedOut
            ? "Model response timed out."
            : `Stream interrupted: ${messageOf(error)}`;

          output.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              error: { message }
            })}\n\ndata: [DONE]\n\n`)
          );

          output.close();
        }
      },

      async cancel(reason) {
        clearTimeout(timer);
        controller.abort();

        try {
          await reader.cancel(reason);
        } catch {}
      }
    });

    return new Response(stream, {
      headers: {
        ...HEADERS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Selected-Model": selected.id
      }
    });
  } catch (error) {
    clearTimeout(timer);

    return json({
      error: timedOut
        ? "CometAPI request timed out."
        : messageOf(error)
    }, 502);
  }
}

function toBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function handleImage(request, env) {
  if (!env.AI) {
    return json({
      error: "Cloudflare AI binding is missing from wrangler.jsonc."
    }, 500);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, 400);
  }

  const prompt = typeof body.prompt === "string"
    ? body.prompt.trim()
    : "";

  if (!prompt) {
    return json({ error: "Please enter an image prompt." }, 400);
  }

  if (prompt.length > 4000) {
    return json({ error: "Image prompt is too long." }, 400);
  }

  try {
    const result = await env.AI.run(IMAGE_MODEL, { prompt });

    let image = result?.image ?? result;

    if (typeof image === "string") {
      return json({
        ok: true,
        image: image.startsWith("data:")
          ? image
          : `data:image/png;base64,${image}`
      });
    }

    if (image instanceof ReadableStream) {
      image = new Uint8Array(await new Response(image).arrayBuffer());
    } else if (!(image instanceof Uint8Array)) {
      image = new Uint8Array(image);
    }

    return json({
      ok: true,
      image: `data:image/png;base64,${toBase64(image)}`
    });
  } catch (error) {
    return json({
      error: `Image generation failed: ${messageOf(error)}`
    }, 502);
  }
}

function appHTML() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#101010">
<title>My AI</title>
<style>
:root{color-scheme:dark;--bg:#101010;--panel:#191919;--line:#303030;--text:#f5f5f5;--muted:#a0a0a0;--accent:#d6d6d6}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input,textarea,select{font:inherit}
button{cursor:pointer;color:var(--text);background:#242424;border:1px solid #383838;border-radius:12px;padding:9px 13px}
button:disabled{opacity:.45;cursor:not-allowed}
button:hover{background:#303030}
#layout{display:flex;height:100dvh;overflow:hidden}
aside{width:260px;flex-shrink:0;background:#151515;border-right:1px solid var(--line);padding:14px;display:flex;flex-direction:column;gap:12px}
.brand{font-size:20px;font-weight:700;padding:8px 4px}
#history{overflow:auto;display:flex;flex-direction:column;gap:6px}
.history-item{text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:transparent;border-color:transparent}
main{min-width:0;flex:1;display:flex;flex-direction:column}
header{min-height:62px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line)}
#top-left{display:flex;align-items:center;gap:10px}
#model{max-width:min(48vw,360px);background:#202020;color:white;border:1px solid #3b3b3b;padding:9px;border-radius:10px}
#messages{flex:1;overflow:auto;padding:24px max(18px,calc((100% - 820px)/2));scroll-behavior:auto}
.message{margin:0 0 28px;overflow-wrap:anywhere}
.role{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px}
.content{white-space:pre-wrap}
.content img{max-width:100%;height:auto;border-radius:14px}
.content pre{overflow:auto;background:#090909;border:1px solid var(--line);border-radius:12px;padding:14px}
.content code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.content p{margin:.4em 0 1em}
.content blockquote{border-left:3px solid #666;margin:12px 0;padding-left:14px;color:#ccc}
.actions{display:flex;gap:7px;margin-top:10px}
.actions button{font-size:12px;padding:5px 9px}
#composer-wrap{padding:12px 16px calc(14px + env(safe-area-inset-bottom));}
#composer{max-width:820px;margin:auto;border:1px solid #3b3b3b;background:#1c1c1c;border-radius:18px;padding:10px}
#prompt{width:100%;resize:vertical;min-height:60px;max-height:220px;background:transparent;color:white;border:0;outline:none;padding:8px}
#composer-tools{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
#status{font-size:12px;color:var(--muted);padding:4px 8px}
#file{display:none}
#preview{display:flex;gap:8px;flex-wrap:wrap}
#preview img{width:64px;height:64px;object-fit:cover;border-radius:9px}
.small{font-size:12px;color:var(--muted)}
#notice{padding:10px 14px;color:#ffcf9e;display:none}
@media(max-width:700px){
 aside{position:fixed;z-index:5;inset:0 auto 0 0;width:280px;transform:translateX(-105%);transition:transform .2s;box-shadow:none}
 aside.open{transform:translateX(0);box-shadow:0 0 0 100vmax #0008}
 header{padding:9px}
 #messages{padding:18px 16px}
 #composer-wrap{padding:9px}
 #model{max-width:52vw}
}
</style>
</head>
<body>
<div id="layout">
<aside id="sidebar">
 <div class="brand">My AI</div>
 <button id="new-chat">＋ New chat</button>
 <button id="clear-history">Clear history</button>
 <div class="small">Your conversations are stored locally on this device.</div>
 <div id="history"></div>
 <div style="margin-top:auto" class="small">CometAPI · Models available to your key</div>
</aside>
<main>
 <header>
  <div id="top-left">
   <button id="menu" aria-label="Open menu">☰</button>
   <strong>My AI</strong>
  </div>
  <select id="model" aria-label="AI model"><option>Loading models…</option></select>
 </header>
 <div id="notice"></div>
 <section id="messages" aria-live="polite"></section>
 <div id="composer-wrap">
  <div id="composer">
   <div id="preview"></div>
   <textarea id="prompt" placeholder="Message My AI…" rows="2"></textarea>
   <div id="composer-tools">
    <div style="display:flex;gap:7px;flex-wrap:wrap">
     <button id="attach">＋ Image</button>
     <input id="file" type="file" accept="image/*">
     <button id="make-image">Generate image</button>
     <button id="refresh">Refresh models</button>
    </div>
    <button id="send">Send ↑</button>
   </div>
  </div>
  <div class="small" style="max-width:820px;margin:7px auto">AI can make mistakes. Avoid sharing passwords or secret keys.</div>
 </div>
</main>
</div>
<script>
const $ = id => document.getElementById(id);
const STORE = "my-ai-single-file-history-v1";
let chats = [];
let current = null;
let attachments = [];
let busy = false;
let modelList = [];

function safeParse(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}

function save() {
  try { localStorage.setItem(STORE, JSON.stringify({chats,current})); } catch {}
}

function newChat() {
  current = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    title: "New chat",
    messages: [],
    updated: Date.now()
  };
  chats.unshift(current);
  save();
  render();
  $("prompt").focus();
  $("sidebar").classList.remove("open");
}

function loadState() {
  const saved = safeParse(localStorage.getItem(STORE), {});
  chats = Array.isArray(saved.chats) ? saved.chats : [];
  current = chats.find(chat => chat.id === saved.current) || chats[0] || null;
  if (!current) newChat();
  else render();
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}

function markdown(value) {
  let text = esc(value);
  const codeBlocks = [];

  text = text.replace(/\`\`\`([^\\n\`]*)\\n([\\s\\S]*?)\`\`\`/g, (_, lang, code) => {
    const i = codeBlocks.length;
    codeBlocks.push('<pre><code>' + code.replace(/\\n$/, "") + '</code></pre>');
    return "%%CODE" + i + "%%";
  });

  text = text.replace(/\\\`([^\`\\n]+)\\\`/g, "<code>$1</code>");
  text = text.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  text = text.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");
  text = text.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");
  text = text.replace(/\\*(.+?)\\*/g, "<em>$1</em>");
  text = text.replace(/\\n/g, "<br>");

  text = text.replace(/%%CODE(\\d+)%%/g, (_, n) => codeBlocks[Number(n)] || "");
  return text;
}

function render() {
  if (!current) return;
  $("messages").innerHTML = current.messages.map((message, index) => {
    const role = message.role === "user" ? "You" : "Assistant";
    const image = message.image
      ? '<img alt="Generated image" src="' + esc(message.image) + '">'
      : "";
    const content = markdown(message.content || "");
    const actions = message.role === "assistant"
      ? '<div class="actions"><button data-copy="' + index + '">Copy</button><button data-regenerate="' + index + '">Regenerate</button></div>'
      : '<div class="actions"><button data-copy="' + index + '">Copy</button></div>';

    return '<article class="message"><div class="role">' + role + '</div><div class="content">' + content + image + '</div>' + actions + '</article>';
  }).join("");

  $("history").innerHTML = chats.map(chat =>
    '<button class="history-item" data-chat="' + esc(chat.id) + '">' +
    esc(chat.title || "New chat") + '</button>'
  ).join("");

  $("messages").scrollTop = $("messages").scrollHeight;
}

function showNotice(message) {
  $("notice").textContent = message || "";
  $("notice").style.display = message ? "block" : "none";
}

async function loadModels() {
  const select = $("model");
  select.innerHTML = '<option>Loading models…</option>';
  showNotice("");

  let lastError = "";

  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 22000);

    try {
      const response = await fetch("/api/models", {
        signal: controller.signal,
        cache: "no-store"
      });

      const text = await response.text();
      const data = safeParse(text, null);

      if (!response.ok || !data?.ok || !Array.isArray(data.models)) {
        throw new Error(data?.error || "Model list request failed.");
      }

      modelList = data.models;
      select.innerHTML = "";

      modelList.forEach(model => {
        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = model.name || model.id;
        select.appendChild(option);
      });

      const saved = localStorage.getItem("my-ai-selected-model");
      select.value = modelList.some(m => m.id === saved)
        ? saved
        : (modelList.some(m => m.id === "gpt-6-astra")
            ? "gpt-6-astra"
            : modelList[0].id);

      showNotice("");
      return;
    } catch (error) {
      lastError = error.name === "AbortError"
        ? "Model list timed out."
        : error.message;
    } finally {
      clearTimeout(timer);
    }

    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
  }

  select.innerHTML = '<option value="">Models unavailable</option>';
  showNotice("Could not load models: " + lastError + " Use Refresh models to retry.");
}

function addMessage(role, content, extra = {}) {
  current.messages.push({role, content, ...extra});
  current.updated = Date.now();

  if (role === "user" && current.title === "New chat") {
    current.title = content.slice(0, 48) || "New chat";
  }

  save();
  render();
}

function buildMessages() {
  return current.messages
    .filter(message => !message.error)
    .map(message => {
      if (message.role === "user" && message.imageData) {
        return {
          role: "user",
          content: [
            {type:"text", text:message.content || "Please examine this image."},
            {type:"image_url", image_url:{url:message.imageData}}
          ]
        };
      }

      return {role:message.role, content:message.content || ""};
    });
}

async function send() {
  if (busy) return;

  const text = $("prompt").value.trim();
  if (!text && !attachments.length) return;

  if (!current) newChat();

  let imageData = attachments[0]?.data || null;
  const userText = text || (imageData ? "Please examine this image." : "");

  addMessage("user", userText, imageData ? {imageData} : {});
  $("prompt").value = "";
  attachments = [];
  $("preview").innerHTML = "";

  busy = true;
  $("send").disabled = true;
  showNotice("");

  const assistantIndex = current.messages.length;
  current.messages.push({role:"assistant",content:"",pending:true});
  save();
  render();

  let full = "";
  let failed = false;

  try {
    const response = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:$("model").value,
        messages:buildMessages()
      })
    });

    if (!response.ok) {
      const body = safeParse(await response.text(), {});
      throw new Error(body.error || body.details || "Chat request failed.");
    }

    if (!response.body) throw new Error("No response stream received.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    async function processLine(line) {
      if (!line.startsWith("data:")) return;

      const raw = line.slice(5).trim();
      if (!raw || raw === "[DONE]") return;

      let chunk;
      try { chunk = JSON.parse(raw); } catch { return; }

      if (chunk.error) {
        throw new Error(chunk.error.message || "The model returned a stream error.");
      }

      const delta = chunk.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta) {
        full += delta;
        current.messages[assistantIndex].content = full;
        current.messages[assistantIndex].pending = true;
        render();
      }

      const choiceText = chunk.choices?.[0]?.text;
      if (typeof choiceText === "string" && choiceText) {
        full += choiceText;
        current.messages[assistantIndex].content = full;
        render();
      }
    }

    while (true) {
      const {value, done} = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), {stream:!done});

      const lines = buffer.split(/\\r?\\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        await processLine(line);
      }

      if (done) break;
    }

    if (buffer.trim()) await processLine(buffer);

    if (!full.trim()) {
      throw new Error("The model finished without returning text.");
    }

    current.messages[assistantIndex].pending = false;
    save();
  } catch (error) {
    failed = true;
    current.messages[assistantIndex] = {
      role:"assistant",
      content:"Request failed: " + error.message,
      error:true
    };
    showNotice(error.message);
    save();
  } finally {
    busy = false;
    $("send").disabled = false;
    render();
    $("prompt").focus();
  }
}

async function generateImage() {
  if (busy) return;

  const prompt = $("prompt").value.trim();
  if (!prompt) {
    showNotice("Enter a description for your image first.");
    return;
  }

  busy = true;
  $("send").disabled = true;
  $("make-image").disabled = true;
  showNotice("Generating image…");

  addMessage("user", "Generate an image: " + prompt);
  $("prompt").value = "";

  try {
    const response = await fetch("/api/generate-image", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt})
    });

    const data = safeParse(await response.text(), {});

    if (!response.ok || !data.image) {
      throw new Error(data.error || "Image generation failed.");
    }

    addMessage("assistant", "Generated image", {image:data.image});
    showNotice("");
  } catch (error) {
    showNotice(error.message);
  } finally {
    busy = false;
    $("send").disabled = false;
    $("make-image").disabled = false;
  }
}

$("send").addEventListener("click", send);
$("make-image").addEventListener("click", generateImage);
$("refresh").addEventListener("click", loadModels);
$("new-chat").addEventListener("click", newChat);
$("menu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("attach").addEventListener("click", () => $("file").click());

$("file").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showNotice("Please select an image file.");
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    showNotice("Choose an image smaller than 8 MB.");
    return;
  }

  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  attachments = [{data, name:file.name}];
  $("preview").innerHTML = '<img alt="Attachment preview" src="' + esc(data) + '">';
  showNotice("");
  event.target.value = "";
});

$("prompt").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});

$("model").addEventListener("change", () => {
  localStorage.setItem("my-ai-selected-model", $("model").value);
});

$("clear-history").addEventListener("click", () => {
  if (!confirm("Delete all locally saved chats?")) return;
  chats = [];
  current = null;
  save();
  newChat();
});

$("history").addEventListener("click", event => {
  const button = event.target.closest("[data-chat]");
  if (!button) return;
  current = chats.find(chat => chat.id === button.dataset.chat) || current;
  save();
  render();
  $("sidebar").classList.remove("open");
});

$("messages").addEventListener("click", async event => {
  const copy = event.target.closest("[data-copy]");
  const regenerate = event.target.closest("[data-regenerate]");

  if (copy) {
    const message = current.messages[Number(copy.dataset.copy)];
    const value = message?.content || "";
    try {
      await navigator.clipboard.writeText(value);
      showNotice("Copied.");
    } catch {
      showNotice("Clipboard access failed. Select and copy the text manually.");
    }
  }

  if (regenerate && !busy) {
    const index = Number(regenerate.dataset.regenerate);
    const message = current.messages[index];

    if (!message || message.role !== "assistant") return;

    current.messages = current.messages.slice(0, index);
    save();
    render();
    await sendLastAgain();
  }
});

async function sendLastAgain() {
  // Regenerate the last assistant answer without duplicating the last user turn.
  if (busy) return;

  const lastUser = [...current.messages].reverse().find(m => m.role === "user");
  if (!lastUser) return;

  busy = true;
  $("send").disabled = true;

  const assistantIndex = current.messages.length;
  current.messages.push({role:"assistant",content:"",pending:true});
  save();
  render();

  let full = "";

  try {
    const response = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:$("model").value,
        messages:buildMessages()
      })
    });

    if (!response.ok) {
      const body = safeParse(await response.text(), {});
      throw new Error(body.error || "Regeneration failed.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const {value, done} = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), {stream:!done});
      const lines = buffer.split(/\\r?\\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;

        const chunk = safeParse(raw, null);
        if (!chunk) continue;
        if (chunk.error) throw new Error(chunk.error.message || "Stream error.");

        const delta = chunk.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
          full += delta;
          current.messages[assistantIndex].content = full;
          render();
        }
      }

      if (done) break;
    }

    current.messages[assistantIndex].pending = false;
    save();
  } catch (error) {
    current.messages[assistantIndex] = {
      role:"assistant",
      content:"Regeneration failed: " + error.message,
      error:true
    };
    showNotice(error.message);
  } finally {
    busy = false;
    $("send").disabled = false;
    render();
  }
}

loadState();
loadModels();
</script>
</body>
</html>`;
}

function manifest() {
  return {
    name: "My AI",
    short_name: "My AI",
    start_url: "/",
    display: "standalone",
    background_color: "#101010",
    theme_color: "#101010"
  };
}

function icon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#171717"/><path d="M64 18 104 42v44L64 110 24 86V42z" fill="none" stroke="white" stroke-width="7"/><path d="M43 50h42M43 64h42M43 78h25" stroke="white" stroke-width="6" stroke-linecap="round"/></svg>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {status:204, headers:HEADERS});
    }

    try {
      if (path === "/" && request.method === "GET") {
        return new Response(appHTML(), {
          headers: {
            ...HEADERS,
            "Content-Type":"text/html; charset=utf-8"
          }
        });
      }

      if (path === "/api/health" && request.method === "GET") {
        return json({
          ok:true,
          app:"my-ai",
          provider:"cometapi",
          imageGeneration:Boolean(env.AI)
        });
      }

      if (path === "/api/models" && request.method === "GET") {
        return handleModels(env);
      }

      if (path === "/api/chat" && request.method === "POST") {
        return handleChat(request, env);
      }

      if (
        (path === "/api/generate-image" || path === "/api/image") &&
        request.method === "POST"
      ) {
        return handleImage(request, env);
      }

      if (path === "/manifest.json") {
        return new Response(JSON.stringify(manifest()), {
          headers: {
            ...HEADERS,
            "Content-Type":"application/manifest+json"
          }
        });
      }

      if (path === "/icon.svg") {
        return new Response(icon(), {
          headers: {
            ...HEADERS,
            "Content-Type":"image/svg+xml"
          }
        });
      }

      return json({error:"Not found", path}, 404);
    } catch (error) {
      return json({error:messageOf(error)}, 500);
    }
  }
};
