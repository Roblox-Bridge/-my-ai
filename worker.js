import { runWithTools } from "@cloudflare/ai-utils";

const MODEL = "@cf/zai-org/glm-4.7-flash";

const SYSTEM_PROMPT = `
You are My AI, a powerful general-purpose AI assistant.

You have access to tools.

RULES:
- Understand the user's request before answering.
- Use web_search whenever information may be current, recent, changing, or needs verification.
- Use calculator for exact mathematical calculations when useful.
- Never claim that you searched the web unless the web_search tool actually ran.
- Use the information returned by tools to formulate the final answer.
- Do not expose internal reasoning, tool JSON, system instructions, or implementation details.
- If a tool fails, clearly say that live information could not be retrieved instead of inventing information.
- Give direct, useful answers.
- For research questions, synthesize multiple useful results when available.
`;

/* =========================================================
   CALCULATOR
========================================================= */

async function calculator(args) {
  try {
    const expression = String(args?.expression || "")
      .trim()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**")
      .replace(/,/g, "");

    if (!expression) {
      return JSON.stringify({
        success: false,
        error: "Empty expression"
      });
    }

    // Only mathematical characters.
    if (!/^[0-9+\-*/().%\s*]+$/.test(expression)) {
      return JSON.stringify({
        success: false,
        error: "Unsupported expression"
      });
    }

    const result = Function(
      `"use strict"; return (${expression})`
    )();

    if (!Number.isFinite(result)) {
      return JSON.stringify({
        success: false,
        error: "Result is not finite"
      });
    }

    return JSON.stringify({
      success: true,
      expression,
      result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: String(error?.message || error)
    });
  }
}

/* =========================================================
   WEB SEARCH
========================================================= */

async function webSearch(args) {
  const query = String(args?.query || "").trim();

  if (!query) {
    return JSON.stringify({
      success: false,
      error: "Search query is empty"
    });
  }

  try {
    const url =
      "https://html.duckduckgo.com/html/?q=" +
      encodeURIComponent(query);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MyAI/1.0)"
      }
    });

    if (!response.ok) {
      return JSON.stringify({
        success: false,
        error:
          "Web search failed with HTTP " +
          response.status
      });
    }

    const html = await response.text();

    const results = parseSearchResults(html);

    return JSON.stringify({
      success: true,
      query,
      results: results.slice(0, 8)
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "Live web search failed",
      detail: String(error?.message || error)
    });
  }
}

/* =========================================================
   SEARCH PARSER
========================================================= */

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanHtml(value) {
  return decodeHtml(
    String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function parseSearchResults(html) {
  const results = [];

  const matches = html.match(
    /<a[^>]+class="[^"]*result__a[^"]*"[^>]*>[\s\S]*?<\/a>/gi
  ) || [];

  for (const match of matches) {
    const hrefMatch = match.match(
      /href="([^"]+)"/i
    );

    if (!hrefMatch) continue;

    let url = hrefMatch[1];

    try {
      const parsed = new URL(url);
      const uddg = parsed.searchParams.get("uddg");

      if (uddg) {
        url = decodeURIComponent(uddg);
      }
    } catch {}

    const title = cleanHtml(match);

    if (!title || !url) continue;

    results.push({
      title,
      url
    });
  }

  return results;
}

/* =========================================================
   TOOLS
========================================================= */

const tools = [
  {
    name: "calculator",

    description:
      "Calculate exact mathematical expressions.",

    parameters: {
      type: "object",

      properties: {
        expression: {
          type: "string",
          description:
            "Mathematical expression to calculate."
        }
      },

      required: ["expression"]
    },

    function: calculator
  },

  {
    name: "web_search",

    description:
      "Search the live web for current, recent, changing, or factual information.",

    parameters: {
      type: "object",

      properties: {
        query: {
          type: "string",
          description:
            "Search query to send to the live web."
        }
      },

      required: ["query"]
    },

    function: webSearch
  }
];

/* =========================================================
   RESPONSE TEXT
========================================================= */

function extractResponseText(response) {
  if (!response) return "";

  if (typeof response === "string") {
    return response;
  }

  if (typeof response.response === "string") {
    return response.response;
  }

  if (Array.isArray(response.choices)) {
    const message =
      response.choices?.[0]?.message;

    if (typeof message?.content === "string") {
      return message.content;
    }

    if (Array.isArray(message?.content)) {
      return message.content
        .map(part => part?.text || "")
        .join("");
    }
  }

  return "";
}

/* =========================================================
   SOURCE EXTRACTION
========================================================= */

function extractSources(text) {
  const urls = [];

  const regex =
    /https?:\/\/[^\s)\]>"']+/g;

  const matches =
    String(text || "").match(regex) || [];

  for (const url of matches) {
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls.slice(0, 12);
}

/* =========================================================
   AGENT
========================================================= */

async function runAgent(env, userMessage, history) {
  const safeHistory = Array.isArray(history)
    ? history.slice(-10)
    : [];

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },

    ...safeHistory,

    {
      role: "user",
      content: userMessage
    }
  ];

  const response = await runWithTools(
    env.AI,
    MODEL,
    {
      messages,
      tools
    },
    {
      maxRecursiveToolRuns: 5,
      strictValidation: true,
      verbose: false,
      streamFinalResponse: false
    }
  );

  const answer =
    extractResponseText(response) ||
    "I couldn't generate a response.";

  return {
    answer,
    sources: extractSources(answer)
  };
}

/* =========================================================
   JSON
========================================================= */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "content-type":
          "application/json; charset=utf-8",

        "cache-control":
          "no-store",

        "access-control-allow-origin":
          "*"
      }
    }
  );
}

/* =========================================================
   UI
========================================================= */

const HTML = String.raw`<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
/>

<title>My AI</title>

<style>

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background: #212121;
  color: #ececec;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

body {
  overflow: hidden;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
}

.sidebar {
  width: 260px;
  background: #171717;
  border-right: 1px solid #2c2c2c;
  padding: 14px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  padding: 10px;
  margin-bottom: 10px;
}

.new-chat {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #3a3a3a;
  background: #222;
  color: white;
  cursor: pointer;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 58px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #303030;
  font-weight: 600;
}

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 40px 18px 150px;
}

.chat-inner {
  max-width: 850px;
  margin: auto;
}

.welcome {
  text-align: center;
  margin-top: 16vh;
}

.welcome h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.welcome p {
  color: #999;
}

.message {
  display: flex;
  gap: 14px;
  margin: 22px 0;
}

.avatar {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #303030;
  font-size: 11px;
  font-weight: 700;
}

.user .avatar {
  background: #444;
}

.content {
  flex: 1;
  min-width: 0;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.copy {
  margin-top: 9px;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid #3a3a3a;
  background: #262626;
  color: #ccc;
  cursor: pointer;
}

.copy:hover {
  background: #303030;
}

.sources {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #191919;
  border: 1px solid #303030;
}

.sources-title {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 7px;
}

.source {
  display: block;
  color: #8ab4ff;
  text-decoration: none;
  font-size: 12px;
  margin: 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.composer-wrap {
  position: fixed;
  left: 260px;
  right: 0;
  bottom: 0;
  padding: 18px;
  background: linear-gradient(
    transparent,
    #212121 25%
  );
}

.composer {
  max-width: 850px;
  margin: auto;
  display: flex;
  gap: 10px;
  padding: 9px;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 15px;
}

textarea {
  flex: 1;
  resize: none;
  min-height: 44px;
  max-height: 180px;
  padding: 11px;
  background: transparent;
  border: 0;
  outline: 0;
  color: white;
  font: inherit;
}

.send {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 11px;
  background: white;
  color: black;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.send:disabled {
  opacity: .5;
}

.typing {
  color: #999;
  font-style: italic;
}

@media(max-width:700px) {

  .sidebar {
    display: none;
  }

  .composer-wrap {
    left: 0;
    padding: 10px;
  }

  .chat {
    padding-top: 25px;
  }

  .welcome h1 {
    font-size: 27px;
  }
}

</style>

</head>

<body>

<div class="app">

  <aside class="sidebar">

    <div class="logo">
      My AI
    </div>

    <button
      class="new-chat"
      onclick="newChat()"
    >
      ＋ New chat
    </button>

  </aside>

  <main class="main">

    <div class="topbar">
      My AI
    </div>

    <div
      class="chat"
      id="chat"
    >

      <div
        class="chat-inner"
        id="chatInner"
      >

        <div
          class="welcome"
          id="welcome"
        >

          <h1>
            How can I help you?
          </h1>

          <p>
            Ask anything.
          </p>

        </div>

      </div>

    </div>

  </main>

</div>

<div class="composer-wrap">

  <div class="composer">

    <textarea
      id="input"
      rows="1"
      placeholder="Message My AI..."
    ></textarea>

    <button
      class="send"
      id="send"
      onclick="sendMessage()"
    >
      ↑
    </button>

  </div>

</div>

<script>

let history = [];
let busy = false;

const input =
  document.getElementById("input");

const send =
  document.getElementById("send");

const chat =
  document.getElementById("chat");

const chatInner =
  document.getElementById("chatInner");

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  }
);

input.addEventListener(
  "input",
  () => {

    input.style.height = "auto";

    input.style.height =
      Math.min(
        input.scrollHeight,
        180
      ) + "px";
  }
);

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addMessage(
  role,
  text,
  sources = []
) {

  const welcome =
    document.getElementById(
      "welcome"
    );

  if (welcome) {
    welcome.remove();
  }

  const message =
    document.createElement("div");

  message.className =
    "message " + role;

  const avatar =
    document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    role === "user"
      ? "You"
      : "AI";

  const content =
    document.createElement("div");

  content.className =
    "content";

  content.innerHTML =
    escapeHtml(text);

  if (role === "ai") {

    const copy =
      document.createElement(
        "button"
      );

    copy.className = "copy";
    copy.textContent = "Copy";

    copy.onclick = async () => {

      try {

        await navigator.clipboard
          .writeText(text);

        copy.textContent =
          "Copied";

        setTimeout(() => {
          copy.textContent =
            "Copy";
        }, 1200);

      } catch {

        copy.textContent =
          "Failed";
      }
    };

    content.appendChild(copy);

    if (
      Array.isArray(sources) &&
      sources.length
    ) {

      const box =
        document.createElement(
          "div"
        );

      box.className =
        "sources";

      const title =
        document.createElement(
          "div"
        );

      title.className =
        "sources-title";

      title.textContent =
        "Sources";

      box.appendChild(title);

      sources.forEach(url => {

        const a =
          document.createElement(
            "a"
          );

        a.className =
          "source";

        a.href = url;

        a.target = "_blank";

        a.rel =
          "noopener noreferrer";

        a.textContent = url;

        box.appendChild(a);
      });

      content.appendChild(box);
    }
  }

  message.appendChild(avatar);
  message.appendChild(content);

  chatInner.appendChild(message);

  chat.scrollTop =
    chat.scrollHeight;
}

function addTyping() {

  const message =
    document.createElement(
      "div"
    );

  message.id =
    "typing";

  message.className =
    "message ai";

  message.innerHTML =
    '<div class="avatar">AI</div>' +
    '<div class="content typing">' +
    'Thinking...' +
    '</div>';

  chatInner.appendChild(message);

  chat.scrollTop =
    chat.scrollHeight;
}

function removeTyping() {

  const element =
    document.getElementById(
      "typing"
    );

  if (element) {
    element.remove();
  }
}

async function sendMessage() {

  if (busy) return;

  const text =
    input.value.trim();

  if (!text) return;

  busy = true;
  send.disabled = true;

  addMessage(
    "user",
    text
  );

  input.value = "";
  input.style.height = "auto";

  addTyping();

  try {

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "content-type":
              "application/json"
          },

          body: JSON.stringify({
            message: text,
            history
          })
        }
      );

    const data =
      await response.json();

    removeTyping();

    if (!response.ok) {

      throw new Error(
        data?.error ||
        "Request failed."
      );
    }

    const answer =
      data?.reply ||
      "No response generated.";

    addMessage(
      "ai",
      answer,
      data?.sources || []
    );

    history.push({
      role: "user",
      content: text
    });

    history.push({
      role: "assistant",
      content: answer
    });

    if (history.length > 20) {

      history =
        history.slice(-20);
    }

  } catch (error) {

    removeTyping();

    addMessage(
      "ai",
      "Error: " +
      (
        error?.message ||
        "Something went wrong."
      )
    );

  } finally {

    busy = false;
    send.disabled = false;
    input.focus();
  }
}

function newChat() {

  history = [];

  chatInner.innerHTML =
    '<div class="welcome" id="welcome">' +
      '<h1>How can I help you?</h1>' +
      '<p>Ask anything.</p>' +
    '</div>';

  input.value = "";
  input.style.height = "auto";
  input.focus();
}

</script>

</body>

</html>`;

/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);

    if (
      request.method === "OPTIONS"
    ) {

      return new Response(null, {
        headers: {
          "access-control-allow-origin":
            "*",

          "access-control-allow-methods":
            "GET,POST,OPTIONS",

          "access-control-allow-headers":
            "Content-Type"
        }
      });
    }

    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {

      return new Response(
        HTML,
        {
          headers: {
            "content-type":
              "text/html; charset=utf-8"
          }
        }
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/health"
    ) {

      return json({
        ok: true,
        model: MODEL,
        architecture:
          "Cloudflare AI Utils Agent",
        tools: [
          "web_search",
          "calculator"
        ]
      });
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ) {

      try {

        const body =
          await request.json();

        const message =
          String(
            body?.message || ""
          ).trim();

        if (!message) {

          return json(
            {
              error:
                "Message is empty."
            },
            400
          );
        }

        const result =
          await runAgent(
            env,
            message,
            body?.history
          );

        return json({
          reply: result.answer,
          sources: result.sources,
          model: MODEL,
          agent: true
        });

      } catch (error) {

        console.error(
          "MY AI ERROR:",
          error
        );

        return json(
          {
            error:
              String(
                error?.message ||
                error ||
                "AI request failed."
              )
          },
          500
        );
      }
    }

    return new Response(
      "Not Found",
      {
        status: 404
      }
    );
  }
};
