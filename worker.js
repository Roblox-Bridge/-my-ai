const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

const PERSONAS = {
  architect: {
    name: "Software Architect",
    prompt:
      "You are a senior software architect. Give practical, maintainable solutions. " +
      "When discussing code, explain important architectural decisions and provide complete examples."
  },

  researcher: {
    name: "Data Researcher",
    prompt:
      "You are a careful data researcher. Separate known facts from assumptions, " +
      "reason systematically, and clearly identify uncertainty when information is incomplete."
  },

  creative: {
    name: "Creative Strategist",
    prompt:
      "You are a creative strategist. Generate original, practical ideas and organize them " +
      "into clear actionable recommendations while avoiding unnecessary repetition."
  }
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function html(content) {
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function cleanString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function clamp(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      message =>
        message &&
        typeof message === "object" &&
        ["system", "user", "assistant"].includes(message.role) &&
        typeof message.content === "string"
    )
    .slice(-20)
    .map(message => ({
      role: message.role,
      content: message.content.slice(0, 12000)
    }));
}

async function groqChat(apiKey, messages, personaPrompt) {
  const groqMessages = [
    {
      role: "system",
      content:
        "You are AetherAI Studio, a helpful AI assistant.\n\n" +
        personaPrompt
    },
    ...messages
  ];

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 4096
      })
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Groq request failed with HTTP ${response.status}.`;

    throw new Error(message);
  }

  const answer = data?.choices?.[0]?.message?.content;

  if (typeof answer !== "string") {
    throw new Error("Groq returned an invalid response.");
  }

  return answer;
}

async function cloudflareChat(env, messages, personaPrompt) {
  if (!env.AI) {
    throw new Error("Workers AI binding 'AI' is not configured.");
  }

  const prompt = [
    "You are AetherAI Studio, a helpful AI assistant.",
    "",
    personaPrompt,
    "",
    "Conversation:"
  ].join("\n");

  const conversation = messages
    .map(message => {
      const role =
        message.role === "assistant"
          ? "Assistant"
          : message.role === "system"
            ? "System"
            : "User";

      return `${role}: ${message.content}`;
    })
    .join("\n\n");

  const result = await env.AI.run(
    env.DEFAULT_MODEL || DEFAULT_MODEL,
    {
      prompt: `${prompt}\n\n${conversation}\n\nAssistant:`,
      max_tokens: 2048,
      temperature: 0.7
    }
  );

  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result.response === "string") {
    return result.response;
  }

  if (result && typeof result.text === "string") {
    return result.text;
  }

  throw new Error("Workers AI returned an unexpected response.");
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Request body must contain valid JSON."
      },
      400
    );
  }

  const messages = normalizeMessages(body.messages);

  if (!messages.length) {
    return json(
      {
        ok: false,
        error: "At least one valid message is required."
      },
      400
    );
  }

  const groqApiKey = cleanString(body.groqApiKey);
  const personaKey = cleanString(body.persona, "architect");

  const persona =
    PERSONAS[personaKey] ||
    PERSONAS.architect;

  try {
    let answer;
    let provider;

    if (groqApiKey) {
      if (groqApiKey.length < 10 || groqApiKey.length > 512) {
        return json(
          {
            ok: false,
            error: "The supplied Groq API key has an invalid format."
          },
          400
        );
      }

      answer = await groqChat(
        groqApiKey,
        messages,
        persona.prompt
      );

      provider = "groq";
    } else {
      answer = await cloudflareChat(
        env,
        messages,
        persona.prompt
      );

      provider = "cloudflare";
    }

    return json({
      ok: true,
      response: answer,
      provider,
      model:
        provider === "groq"
          ? GROQ_MODEL
          : env.DEFAULT_MODEL || DEFAULT_MODEL,
      persona: persona.name
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "AI request failed."
      },
      502
    );
  }
}

async function handleImage(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Request body must contain valid JSON."
      },
      400
    );
  }

  const prompt = cleanString(body.prompt);

  if (!prompt) {
    return json(
      {
        ok: false,
        error: "An image prompt is required."
      },
      400
    );
  }

  if (prompt.length > 4000) {
    return json(
      {
        ok: false,
        error: "Image prompt is too long."
      },
      400
    );
  }

  if (!env.AI) {
    return json(
      {
        ok: false,
        error: "Workers AI binding 'AI' is not configured."
      },
      500
    );
  }

  const width = clamp(body.width, 256, 1536, 1024);
  const height = clamp(body.height, 256, 1536, 1024);
  const numSteps = clamp(body.num_steps, 1, 20, 20);
  const guidance = clamp(body.guidance, 1, 20, 7.5);

  try {
    const result = await env.AI.run(
      env.IMAGE_MODEL || IMAGE_MODEL,
      {
        prompt,
        negative_prompt: cleanString(body.negative_prompt),
        width,
        height,
        num_steps: numSteps,
        guidance
      }
    );

    if (result instanceof ReadableStream) {
      return new Response(result, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    if (result instanceof ArrayBuffer) {
      return new Response(result, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    if (result instanceof Uint8Array) {
      return new Response(result, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    if (result?.image) {
      let image = result.image;

      if (typeof image === "string") {
        const binary = Uint8Array.from(
          atob(image),
          character => character.charCodeAt(0)
        );

        image = binary;
      }

      return new Response(image, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    throw new Error("SDXL returned an unexpected response.");
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Image generation failed."
      },
      502
    );
  }
}

const APP_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover"
  >

  <title>AetherAI Studio</title>

  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            aether: {
              bg: "#090d16",
              panel: "#101725",
              border: "#243047",
              accent: "#8b5cf6",
              cyan: "#22d3ee"
            }
          },
          boxShadow: {
            glow:
              "0 0 50px rgba(139, 92, 246, 0.12)"
          }
        }
      }
    };
  </script>

  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background: #090d16;
    }

    body {
      color: #e5e7eb;
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .glass {
      background: rgba(15, 23, 42, 0.62);
      border: 1px solid rgba(148, 163, 184, 0.12);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
    }

    .glass-strong {
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(148, 163, 184, 0.14);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
    }

    .glow {
      box-shadow:
        0 0 80px rgba(139, 92, 246, 0.12),
        inset 0 1px rgba(255, 255, 255, 0.025);
    }

    .orb {
      position: fixed;
      pointer-events: none;
      width: 420px;
      height: 420px;
      border-radius: 9999px;
      filter: blur(100px);
      opacity: 0.12;
    }

    .message-enter {
      animation: messageEnter 0.24s ease-out both;
    }

    @keyframes messageEnter {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .typing-dot {
      animation: pulse 1.2s infinite ease-in-out;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes pulse {
      0%,
      70%,
      100% {
        opacity: 0.25;
        transform: translateY(0);
      }

      35% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    .chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: #334155 transparent;
    }

    .chat-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .chat-scroll::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 999px;
    }

    .markdown {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.7;
    }

    textarea {
      resize: none;
    }

    button,
    select,
    input,
    textarea {
      outline: none;
    }
  </style>
</head>

<body class="overflow-hidden">

  <div
    class="orb left-[-180px] top-[-180px] bg-violet-600"
  ></div>

  <div
    class="orb right-[-160px] bottom-[-180px] bg-cyan-500"
  ></div>

  <div class="h-screen flex relative">

    <aside
      id="sidebar"
      class="w-[290px] shrink-0 glass-strong border-r border-slate-800/70
             flex flex-col z-20 transition-transform duration-300
             max-lg:absolute max-lg:inset-y-0 max-lg:left-0
             max-lg:-translate-x-full"
    >

      <div class="px-5 py-5 border-b border-slate-800/70">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl
                   bg-gradient-to-br from-violet-500 to-cyan-400
                   flex items-center justify-center
                   shadow-lg shadow-violet-500/20"
          >
            <span class="font-black text-white">A</span>
          </div>

          <div>
            <div class="font-bold tracking-tight">
              AetherAI
            </div>
            <div class="text-[11px] text-slate-500">
              Studio
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 space-y-7">

        <section>
          <div
            class="text-[10px] uppercase tracking-[0.18em]
                   text-slate-500 font-semibold mb-3"
          >
            Operational Mode
          </div>

          <div class="space-y-2">

            <button
              data-mode="chat"
              class="mode-btn w-full text-left p-3 rounded-xl
                     border border-violet-500/30
                     bg-violet-500/10"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg">✦</span>
                <div>
                  <div class="text-sm font-medium">
                    Text / Logic Engine
                  </div>
                  <div class="text-[11px] text-slate-500">
                    Llama-powered reasoning
                  </div>
                </div>
              </div>
            </button>

            <button
              data-mode="image"
              class="mode-btn w-full text-left p-3 rounded-xl
                     border border-transparent
                     hover:bg-white/[0.04]"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg">◈</span>
                <div>
                  <div class="text-sm font-medium">
                    SDXL Image Generation
                  </div>
                  <div class="text-[11px] text-slate-500">
                    Create images from prompts
                  </div>
                </div>
              </div>
            </button>

          </div>
        </section>

        <section>
          <div
            class="text-[10px] uppercase tracking-[0.18em]
                   text-slate-500 font-semibold mb-3"
          >
            Agent Persona
          </div>

          <select
            id="persona"
            class="w-full bg-slate-900/70 border border-slate-700/70
                   rounded-xl px-3 py-3 text-sm text-slate-200"
          >
            <option value="architect">
              Software Architect
            </option>
            <option value="researcher">
              Data Researcher
            </option>
            <option value="creative">
              Creative Strategist
            </option>
          </select>
        </section>

        <section>
          <div
            class="text-[10px] uppercase tracking-[0.18em]
                   text-slate-500 font-semibold mb-3"
          >
            Groq Accelerator
          </div>

          <input
            id="groqKey"
            type="password"
            autocomplete="off"
            placeholder="Optional Groq API key"
            class="w-full bg-slate-900/70 border border-slate-700/70
                   rounded-xl px-3 py-3 text-sm
                   placeholder:text-slate-600"
          >

          <p class="text-[10px] text-slate-600 mt-2 leading-4">
            Used only for the current request. It is not saved by the UI.
          </p>
        </section>

      </div>

      <div class="px-4 py-4 border-t border-slate-800/70">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500">
            Runtime
          </span>

          <span
            class="flex items-center gap-1.5 text-emerald-400"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Edge Online
          </span>
        </div>
      </div>

    </aside>

    <main class="flex-1 min-w-0 flex flex-col">

      <header
        class="h-[68px] shrink-0 glass border-b border-slate-800/70
               flex items-center justify-between px-4 sm:px-6 z-10"
      >

        <div class="flex items-center gap-3">

          <button
            id="menuBtn"
            class="lg:hidden w-9 h-9 rounded-lg
                   hover:bg-white/[0.05]"
          >
            ☰
          </button>

          <div>
            <div class="font-semibold text-sm sm:text-base">
              AetherAI Studio
            </div>

            <div
              id="modeLabel"
              class="text-[11px] text-slate-500"
            >
              Text / Logic Engine
            </div>
          </div>

        </div>

        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-emerald-500/[0.08]
                 border border-emerald-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-emerald-400
                   shadow-[0_0_10px_rgba(52,211,153,.8)]"
          ></span>

          <span
            id="statusText"
            class="text-[11px] text-emerald-300"
          >
            Llama 3.1 8B Active
          </span>
        </div>

      </header>

      <div
        id="chat"
        class="flex-1 overflow-y-auto chat-scroll px-4 sm:px-8 py-8"
      >

        <div
          id="emptyState"
          class="min-h-full flex items-center justify-center"
        >
          <div class="max-w-xl text-center">

            <div
              class="mx-auto mb-5 w-16 h-16 rounded-2xl
                     bg-gradient-to-br from-violet-500/20
                     to-cyan-400/10
                     border border-white/10
                     flex items-center justify-center
                     text-2xl"
            >
              ✦
            </div>

            <h1
              class="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              What are you building today?
            </h1>

            <p
              class="mt-3 text-sm text-slate-500 leading-6"
            >
              AetherAI Studio combines edge inference,
              optional Groq acceleration, and image generation
              in one workspace.
            </p>

          </div>
        </div>

        <div
          id="messages"
          class="max-w-4xl mx-auto space-y-6"
        ></div>

      </div>

      <div
        class="px-4 sm:px-8 pb-5 pt-2"
      >
        <div class="max-w-4xl mx-auto">

          <div
            class="glass-strong glow rounded-2xl p-2"
          >

            <textarea
              id="prompt"
              rows="1"
              placeholder="Ask AetherAI anything..."
              class="w-full bg-transparent px-4 pt-3 pb-2
                     text-sm text-slate-100
                     placeholder:text-slate-600
                     max-h-40"
            ></textarea>

            <div class="flex items-center justify-between px-2 pb-1">

              <div
                id="inputHint"
                class="text-[10px] text-slate-600 px-2"
              >
                Enter to send · Shift + Enter for newline
              </div>

              <button
                id="sendBtn"
                class="w-10 h-10 rounded-xl
                       bg-gradient-to-br from-violet-500 to-violet-600
                       hover:from-violet-400 hover:to-violet-500
                       disabled:opacity-40
                       disabled:cursor-not-allowed
                       transition-all
                       flex items-center justify-center"
              >
                ↑
              </button>

            </div>

          </div>

          <div
            class="text-center text-[10px] text-slate-700 mt-2"
          >
            AetherAI Studio · Edge AI workspace
          </div>

        </div>
      </div>

    </main>
  </div>

<script>
(() => {
  "use strict";

  const state = {
    mode: "chat",
    busy: false,
    messages: []
  };

  const chat = document.getElementById("chat");
  const messagesEl = document.getElementById("messages");
  const emptyState = document.getElementById("emptyState");
  const promptEl = document.getElementById("prompt");
  const sendBtn = document.getElementById("sendBtn");
  const personaEl = document.getElementById("persona");
  const groqKeyEl = document.getElementById("groqKey");
  const modeLabel = document.getElementById("modeLabel");
  const statusText = document.getElementById("statusText");
  const inputHint = document.getElementById("inputHint");
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  function setBusy(value) {
    state.busy = value;
    sendBtn.disabled = value;
    promptEl.disabled = value;

    if (value) {
      sendBtn.innerHTML = `
        <span class="flex gap-1">
          <span class="typing-dot w-1 h-1 rounded-full bg-white"></span>
          <span class="typing-dot w-1 h-1 rounded-full bg-white"></span>
          <span class="typing-dot w-1 h-1 rounded-full bg-white"></span>
        </span>
      `;
    } else {
      sendBtn.textContent = "↑";
    }
  }

  function addUserMessage(text) {
    emptyState.classList.add("hidden");

    const node = document.createElement("div");

    node.className =
      "message-enter flex justify-end";

    node.innerHTML = `
      <div class="max-w-[85%]">
        <div class="text-[10px] text-slate-600 mb-1 text-right">
          You
        </div>

        <div
          class="rounded-2xl rounded-tr-md
                 bg-violet-500/10
                 border border-violet-500/15
                 px-4 py-3 text-sm text-slate-200
                 whitespace-pre-wrap break-words"
        >
          ${escapeHtml(text)}
        </div>
      </div>
    `;

    messagesEl.appendChild(node);
    scrollToBottom();
  }

  function addAssistantMessage(text, metadata = {}) {
    emptyState.classList.add("hidden");

    const node = document.createElement("div");

    node.className =
      "message-enter flex justify-start";

    const provider = metadata.provider
      ? escapeHtml(metadata.provider)
      : "Cloudflare";

    node.innerHTML = `
      <div class="max-w-[90%]">
        <div class="text-[10px] text-slate-600 mb-1">
          AetherAI · ${provider}
        </div>

        <div
          class="glass rounded-2xl rounded-tl-md
                 px-4 py-4 text-sm text-slate-200"
        >
          <div class="markdown">${escapeHtml(text)}</div>
        </div>
      </div>
    `;

    messagesEl.appendChild(node);
    scrollToBottom();
  }

  function addImageMessage(url) {
    emptyState.classList.add("hidden");

    const node = document.createElement("div");

    node.className =
      "message-enter flex justify-start";

    node.innerHTML = `
      <div class="max-w-[90%]">
        <div class="text-[10px] text-slate-600 mb-1">
          AetherAI · SDXL
        </div>

        <div class="glass rounded-2xl p-3">
          <img
            src="${url}"
            alt="Generated image"
            class="rounded-xl max-w-full h-auto"
          >
        </div>
      </div>
    `;

    messagesEl.appendChild(node);
    scrollToBottom();
  }

  function addErrorMessage(text) {
    const node = document.createElement("div");

    node.className =
      "message-enter flex justify-start";

    node.innerHTML = `
      <div class="max-w-[90%]">
        <div class="text-[10px] text-rose-400 mb-1">
          Request Error
        </div>

        <div
          class="rounded-2xl
                 bg-rose-500/[0.06]
                 border border-rose-500/15
                 px-4 py-3 text-sm text-rose-200"
        >
          ${escapeHtml(text)}
        </div>
      </div>
    `;

    messagesEl.appendChild(node);
    scrollToBottom();
  }

  function setMode(mode) {
    state.mode = mode;

    document.querySelectorAll(".mode-btn").forEach(button => {
      const active = button.dataset.mode === mode;

      button.classList.toggle(
        "border-violet-500/30",
        active
      );

      button.classList.toggle(
        "bg-violet-500/10",
        active
      );

      button.classList.toggle(
        "border-transparent",
        !active
      );
    });

    if (mode === "image") {
      modeLabel.textContent = "SDXL Image Generation";
      statusText.textContent = "SDXL Ready";
      promptEl.placeholder = "Describe the image you want to create...";
      inputHint.textContent = "Enter to generate · Shift + Enter for newline";
    } else {
      modeLabel.textContent = "Text / Logic Engine";
      statusText.textContent = "Llama 3.1 8B Active";
      promptEl.placeholder = "Ask AetherAI anything...";
      inputHint.textContent = "Enter to send · Shift + Enter for newline";
    }

    promptEl.focus();
  }

  async function sendChat(prompt) {
    const userMessage = {
      role: "user",
      content: prompt
    };

    state.messages.push(userMessage);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: state.messages,
        persona: personaEl.value,
        groqApiKey: groqKeyEl.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || "The AI request failed."
      );
    }

    state.messages.push({
      role: "assistant",
      content: data.response
    });

    addAssistantMessage(
      data.response,
      {
        provider: data.provider
      }
    );
  }

  async function generateImage(prompt) {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        num_steps: 20,
        guidance: 7.5
      })
    });

    if (!response.ok) {
      let message = "Image generation failed.";

      try {
        const data = await response.json();
        message = data.error || message;
      } catch {}

      throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    addImageMessage(url);
  }

  async function submit() {
    if (state.busy) {
      return;
    }

    const prompt = promptEl.value.trim();

    if (!prompt) {
      return;
    }

    promptEl.value = "";
    promptEl.style.height = "auto";

    addUserMessage(prompt);
    setBusy(true);

    try {
      if (state.mode === "image") {
        await generateImage(prompt);
      } else {
        await sendChat(prompt);
      }
    } catch (error) {
      addErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
      promptEl.focus();
    }
  }

  sendBtn.addEventListener("click", submit);

  promptEl.addEventListener("keydown", event => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submit();
    }
  });

  promptEl.addEventListener("input", () => {
    promptEl.style.height = "auto";
    promptEl.style.height =
      Math.min(promptEl.scrollHeight, 160) + "px";
  });

  document.querySelectorAll(".mode-btn").forEach(button => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);

      if (window.innerWidth < 1024) {
        sidebar.classList.add("-translate-x-full");
      }
    });
  });

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  setMode("chat");
})();
</script>

</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    try {
      if (
        request.method === "GET" &&
        (url.pathname === "/" ||
          url.pathname === "/index.html")
      ) {
        return html(APP_HTML);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/chat"
      ) {
        return await handleChat(request, env);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/generate-image"
      ) {
        return await handleImage(request, env);
      }

      if (url.pathname === "/api/health") {
        return json({
          ok: true,
          service: "AetherAI Studio",
          cloudflareModel:
            env.DEFAULT_MODEL || DEFAULT_MODEL,
          groqModel: GROQ_MODEL,
          imageModel:
            env.IMAGE_MODEL || IMAGE_MODEL,
          aiBinding: Boolean(env.AI)
        });
      }

      return json(
        {
          ok: false,
          error: "Route not found."
        },
        404
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Internal server error."
        },
        500
      );
    }
  }
};
