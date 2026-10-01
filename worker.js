const BASE = "https://www.codecraftapi.com/v1";

/* =========================================================
   BASIC HELPERS
========================================================= */

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...extra
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(extra)
    }
  });
}

function apiKey(env) {
  return String(env.CODECRAFT_API_KEY || "").trim();
}

async function codecraftFetch(env, path, options = {}) {
  const headers = new Headers(options.headers || {});

  headers.set(
    "Authorization",
    `Bearer ${apiKey(env)}`
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  headers.set(
    "Accept",
    "application/json"
  );

  return fetch(
    BASE + path,
    {
      ...options,
      headers
    }
  );
}

async function readJSON(response) {
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  return {
    data,
    text
  };
}

/* =========================================================
   FRONTEND
========================================================= */

const HTML = String.raw`<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1,viewport-fit=cover"
>

<meta
  name="theme-color"
  content="#212121"
>

<meta
  name="apple-mobile-web-app-capable"
  content="yes"
>

<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
>

<meta
  name="apple-mobile-web-app-title"
  content="AetherAI"
>

<link
  rel="manifest"
  href="/manifest.json"
>

<title>AetherAI</title>

<style>

*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#212121;
  color:#ececec;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

button,
input,
textarea,
select{
  font:inherit;
}

button{
  color:inherit;
}

.app{
  width:100%;
  height:100%;
  display:flex;
}

/* SIDEBAR */

.sidebar{
  width:260px;
  flex:0 0 260px;
  background:#171717;
  display:flex;
  flex-direction:column;
  padding:10px;
}

.brand{
  height:44px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 8px;
  font-weight:700;
}

.logo{
  width:30px;
  height:30px;
  border-radius:9px;
  background:#fff;
  color:#111;
  display:grid;
  place-items:center;
  font-weight:800;
}

.new-chat{
  margin:8px 0;
  width:100%;
  height:44px;
  border-radius:10px;
  border:1px solid #444;
  background:#222;
  text-align:left;
  padding:0 12px;
  cursor:pointer;
}

.new-chat:hover{
  background:#2d2d2d;
}

.search{
  margin-bottom:8px;
}

.search input{
  width:100%;
  height:36px;
  border:1px solid #333;
  background:#222;
  color:#eee;
  border-radius:9px;
  padding:0 10px;
  outline:none;
}

.history{
  flex:1;
  overflow:auto;
}

.history-item{
  display:flex;
  align-items:center;
  gap:8px;
  padding:9px;
  margin:2px 0;
  border-radius:8px;
  cursor:pointer;
}

.history-item:hover{
  background:#292929;
}

.history-item.active{
  background:#303030;
}

.history-title{
  flex:1;
  min-width:0;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  font-size:13px;
}

.delete-chat{
  background:none;
  border:0;
  color:#888;
  cursor:pointer;
}

.side-bottom{
  padding-top:8px;
}

.side-btn{
  width:100%;
  border:0;
  background:none;
  text-align:left;
  padding:10px;
  border-radius:8px;
  cursor:pointer;
}

.side-btn:hover{
  background:#292929;
}

/* MAIN */

.main{
  min-width:0;
  flex:1;
  height:100%;
  display:flex;
  flex-direction:column;
  background:#212121;
}

.topbar{
  height:56px;
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 12px;
}

.top-left{
  display:flex;
  align-items:center;
  min-width:0;
}

.mobile-menu{
  display:none;
  width:38px;
  height:38px;
  border:0;
  background:none;
  font-size:21px;
}

.model-select{
  max-width:300px;
  background:transparent;
  color:#eee;
  border:0;
  outline:none;
  padding:8px;
  font-weight:600;
  border-radius:8px;
}

.model-select:hover{
  background:#2c2c2c;
}

.model-select option{
  background:#222;
  color:#eee;
}

/* ERROR */

.model-error{
  max-width:700px;
  margin:8px auto 0;
  padding:10px 14px;
  border:1px solid #684040;
  background:#321f1f;
  border-radius:10px;
  color:#ffb5b5;
  font-size:13px;
  display:none;
}

.model-error.show{
  display:block;
}

.model-error button{
  margin-left:8px;
  border:1px solid #765050;
  background:#452828;
  border-radius:7px;
  padding:4px 8px;
  cursor:pointer;
}

/* CHAT */

.chat{
  flex:1;
  overflow:auto;
}

.messages{
  max-width:900px;
  margin:auto;
  padding:20px 20px 170px;
}

.welcome{
  min-height:60vh;
  display:grid;
  place-items:center;
  text-align:center;
}

.welcome h1{
  font-size:30px;
  margin:0 0 8px;
}

.welcome p{
  color:#999;
  margin:0;
}

.message{
  display:flex;
  gap:12px;
  margin-bottom:28px;
}

.avatar{
  width:30px;
  height:30px;
  flex:none;
  border-radius:8px;
  display:grid;
  place-items:center;
  font-size:13px;
}

.user .avatar{
  background:#555;
}

.assistant .avatar{
  background:#fff;
  color:#111;
}

.content{
  min-width:0;
  flex:1;
  font-size:15px;
  line-height:1.65;
  overflow-wrap:anywhere;
}

.content p{
  margin:0 0 12px;
}

.content h1,
.content h2,
.content h3{
  line-height:1.25;
}

.content pre{
  background:#101010;
  border:1px solid #3b3b3b;
  border-radius:10px;
  padding:13px;
  overflow:auto;
}

.content code{
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}

.inline-code{
  background:#303030;
  border-radius:5px;
  padding:2px 5px;
}

.actions{
  margin-top:7px;
  display:flex;
  gap:4px;
}

.action{
  border:0;
  background:none;
  color:#888;
  padding:5px 7px;
  border-radius:7px;
  cursor:pointer;
  font-size:12px;
}

.action:hover{
  background:#303030;
  color:#eee;
}

.danger{
  color:#ff9999;
}

.image-card{
  max-width:700px;
  border:1px solid #3b3b3b;
  border-radius:12px;
  overflow:hidden;
  background:#111;
}

.image-card img{
  display:block;
  width:100%;
  height:auto;
}

/* COMPOSER */

.composer-area{
  position:fixed;
  left:260px;
  right:0;
  bottom:0;
  padding:25px 16px 12px;
  background:
    linear-gradient(
      transparent,
      #212121 30%
    );
}

.composer{
  max-width:900px;
  margin:auto;
  background:#2f2f2f;
  border:1px solid #4b4b4b;
  border-radius:18px;
  box-shadow:0 5px 25px #0005;
}

.attachments{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  padding:8px 10px 0;
}

.attachment{
  background:#202020;
  border:1px solid #444;
  border-radius:8px;
  padding:5px 8px;
  font-size:12px;
  cursor:pointer;
}

.compose-row{
  display:flex;
  align-items:flex-end;
  padding:7px;
}

.tool{
  width:40px;
  height:40px;
  flex:none;
  border:0;
  background:none;
  border-radius:9px;
  font-size:20px;
  cursor:pointer;
}

.tool:hover{
  background:#3b3b3b;
}

.prompt{
  flex:1;
  min-height:42px;
  max-height:180px;
  resize:none;
  border:0;
  outline:none;
  background:none;
  color:#eee;
  padding:10px 8px;
  line-height:1.45;
}

.prompt::placeholder{
  color:#999;
}

.send{
  width:40px;
  height:40px;
  flex:none;
  border:0;
  border-radius:11px;
  background:#fff;
  color:#111;
  cursor:pointer;
  font-weight:800;
}

.send:disabled{
  opacity:.35;
}

.hint{
  max-width:900px;
  margin:auto;
  text-align:center;
  font-size:10px;
  color:#777;
  padding-top:6px;
}

/* MEMORY MODAL */

.modal{
  position:fixed;
  inset:0;
  background:#0009;
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
  z-index:50;
}

.modal.open{
  display:flex;
}

.modal-card{
  width:min(520px,100%);
  max-height:80vh;
  overflow:auto;
  background:#202020;
  border:1px solid #444;
  border-radius:16px;
  padding:18px;
}

.modal-card h2{
  margin-top:0;
}

.memory-row{
  padding:9px 0;
  border-bottom:1px solid #333;
  display:flex;
  gap:8px;
  justify-content:space-between;
}

.close{
  float:right;
  background:none;
  border:0;
  font-size:20px;
  cursor:pointer;
}

/* MOBILE */

@media(max-width:700px){

  .sidebar{
    position:fixed;
    z-index:40;
    top:0;
    bottom:0;
    left:0;
    width:85%;
    max-width:310px;
    transform:translateX(-100%);
    transition:transform .2s;
  }

  .sidebar.open{
    transform:translateX(0);
  }

  .mobile-menu{
    display:block;
  }

  .backdrop{
    position:fixed;
    inset:0;
    background:#0008;
    z-index:39;
    display:none;
  }

  .backdrop.open{
    display:block;
  }

  .composer-area{
    left:0;
    padding:20px 8px 8px;
  }

  .messages{
    padding:12px 12px 145px;
  }

  .model-select{
    max-width:190px;
  }

  .welcome h1{
    font-size:27px;
  }

  .message{
    gap:9px;
  }
}

</style>

</head>

<body>

<div class="app">

<aside
  class="sidebar"
  id="sidebar"
>

  <div class="brand">
    <div class="logo">A</div>
    <span>AetherAI</span>
  </div>

  <button
    class="new-chat"
    id="newChat"
  >
    ＋ New chat
  </button>

  <div class="search">
    <input
      id="search"
      placeholder="Search chats"
    >
  </div>

  <div
    class="history"
    id="history"
  ></div>

  <div class="side-bottom">

    <button
      class="side-btn"
      id="memoryBtn"
    >
      🧠 Memory
    </button>

    <button
      class="side-btn"
      id="clearBtn"
    >
      ⚙ Clear local data
    </button>

  </div>

</aside>

<div
  class="backdrop"
  id="backdrop"
></div>

<main class="main">

<header class="topbar">

  <div class="top-left">

    <button
      class="mobile-menu"
      id="menu"
    >
      ☰
    </button>

    <select
      id="model"
      class="model-select"
    >

      <option value="">
        Loading models…
      </option>

    </select>

  </div>

  <button
    class="tool"
    id="newTop"
    title="New chat"
  >
    ＋
  </button>

</header>

<div
  class="model-error"
  id="modelError"
>
</div>

<section
  class="chat"
  id="chat"
>

  <div
    class="messages"
    id="messages"
  ></div>

</section>

<div class="composer-area">

  <div class="composer">

    <div
      class="attachments"
      id="attachments"
    ></div>

    <div class="compose-row">

      <button
        class="tool"
        id="attach"
        title="Attach"
      >
        ＋
      </button>

      <button
        class="tool"
        id="imageTool"
        title="Generate image"
      >
        ✦
      </button>

      <input
        type="file"
        id="file"
        hidden
        multiple
        accept="image/*,.txt,.md,.json,.csv,.pdf"
      >

      <textarea
        id="prompt"
        class="prompt"
        rows="1"
        placeholder="Message AetherAI…"
      ></textarea>

      <button
        class="send"
        id="send"
      >
        ↑
      </button>

    </div>

  </div>

  <div class="hint">
    AetherAI can make mistakes. Check important information.
  </div>

</div>

</main>

</div>

<div
  class="modal"
  id="memoryModal"
>

  <div class="modal-card">

    <button
      class="close"
      id="closeMemory"
    >
      ×
    </button>

    <h2>Memory</h2>

    <div id="memoryList"></div>

    <button
      class="side-btn danger"
      id="clearMemory"
    >
      Clear all memories
    </button>

  </div>

</div>

<script>

"use strict";

/* =========================================================
   STATE
========================================================= */

const state = {

  chats:
    JSON.parse(
      localStorage.getItem(
        "aether_chats"
      ) || "[]"
    ),

  current:null,

  attachments:[],

  memories:
    JSON.parse(
      localStorage.getItem(
        "aether_memories"
      ) || "[]"
    ),

  models:[],

  busy:false

};

/* =========================================================
   HELPERS
========================================================= */

const $ =
  id => document.getElementById(id);

function uid(){

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2,8)
  );
}

function save(){

  localStorage.setItem(
    "aether_chats",
    JSON.stringify(
      state.chats
    )
  );

  localStorage.setItem(
    "aether_memories",
    JSON.stringify(
      state.memories
    )
  );
}

function esc(value){

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[c])
  );
}

/* =========================================================
   SIMPLE MARKDOWN
========================================================= */

function markdown(text){

  let s =
    String(
      text ?? ""
    ).replace(
      /\r\n?/g,
      "\n"
    );

  const blocks = [];

  s =
    s.replace(
      /\x60\x60\x60([\w+-]*)\n?([\s\S]*?)\x60\x60\x60/g,
      (_,lang,code) => {

        const id =
          blocks.length;

        blocks.push({
          lang:
            lang || "code",
          code
        });

        return (
          "@@CODE" +
          id +
          "@@"
        );
      }
    );

  let x = esc(s);

  x =
    x.replace(
      /^###\s+(.+)$/gm,
      "<h3>$1</h3>"
    );

  x =
    x.replace(
      /^##\s+(.+)$/gm,
      "<h2>$1</h2>"
    );

  x =
    x.replace(
      /^#\s+(.+)$/gm,
      "<h1>$1</h1>"
    );

  x =
    x.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );

  x =
    x.replace(
      /\x60([^\x60\n]+)\x60/g,
      '<span class="inline-code">$1</span>'
    );

  x =
    x.replace(
      /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\\s\)\]\+\)$end:math:text$/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

  x =
    x.replace(
      /^[-*]\s+(.+)$/gm,
      "• $1"
    );

  x =
    x.replace(
      /\n/g,
      "<br>"
    );

  x =
    x.replace(
      /@@CODE(\d+)@@/g,
      (_,i) => {

        const b =
          blocks[
            Number(i)
          ];

        return (
          '<pre><code>' +
          esc(b.code) +
          "</code></pre>"
        );
      }
    );

  return x;
}

/* =========================================================
   CHAT HISTORY
========================================================= */

function currentChat(){

  return state.chats.find(
    c =>
      c.id ===
      state.current
  ) || null;
}

function newChat(){

  const chat = {

    id:uid(),

    title:"New chat",

    messages:[],

    created:Date.now()

  };

  state.chats.push(chat);

  state.current =
    chat.id;

  state.attachments = [];

  save();

  renderHistory();

  renderCurrent();

  closeDrawer();

  $("prompt").focus();
}

function renderHistory(
  filter = ""
){

  const box =
    $("history");

  box.innerHTML = "";

  state.chats
    .slice()
    .reverse()
    .filter(
      c =>
        !filter ||
        c.title
          .toLowerCase()
          .includes(
            filter.toLowerCase()
          )
    )
    .forEach(chat => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "history-item" +
        (
          chat.id ===
          state.current
          ? " active"
          : ""
        );

      row.innerHTML =
        '<span>💬</span>' +
        '<span class="history-title"></span>' +
        '<button class="delete-chat">×</button>';

      row.querySelector(
        ".history-title"
      ).textContent =
        chat.title;

      row.onclick =
        event => {

          if(
            event.target
              .closest(
                ".delete-chat"
              )
          ){

            state.chats =
              state.chats.filter(
                c =>
                  c.id !==
                  chat.id
              );

            if(
              state.current ===
              chat.id
            ){

              state.current =
                state.chats.at(-1)
                  ?.id || null;
            }

            save();

            renderHistory();

            renderCurrent();

            return;
          }

          state.current =
            chat.id;

          renderHistory();

          renderCurrent();

          closeDrawer();
        };

      box.appendChild(row);
    });
}

function renderCurrent(){

  const box =
    $("messages");

  box.innerHTML = "";

  const chat =
    currentChat();

  if(!chat){

    box.innerHTML =
      '<div class="welcome">' +
      "<div>" +
      "<h1>How can I help you?</h1>" +
      "<p>Ask anything, upload a file, or create an image.</p>" +
      "</div>" +
      "</div>";

    return;
  }

  chat.messages.forEach(
    message => {

      if(message.image){

        addImageMessage(
          message.image
        );

      }else{

        addMessage(
          message.role,
          message.content,
          false
        );
      }

    }
  );
}

function addMessage(
  role,
  text,
  actions = true
){

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "message " +
    role;

  row.innerHTML =
    '<div class="avatar">' +
    (
      role === "user"
        ? "U"
        : "A"
    ) +
    "</div>" +

    '<div class="content">' +
    markdown(text) +

    (
      actions
        ?
          '<div class="actions">' +
          '<button class="action copy">Copy</button>' +
          (
            role === "assistant"
              ?
                '<button class="action regenerate">Regenerate</button>'
              :
                ""
          ) +
          "</div>"
        :
          ""
    ) +

    "</div>";

  $("messages")
    .appendChild(row);

  if(actions){

    row.querySelector(
      ".copy"
    )?.addEventListener(
      "click",
      () =>
        navigator
          .clipboard
          ?.writeText(
            text
          )
    );

    row.querySelector(
      ".regenerate"
    )?.addEventListener(
      "click",
      regenerate
    );
  }

  return row;
}

function addImageMessage(
  dataURL
){

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "message assistant";

  row.innerHTML =
    '<div class="avatar">A</div>' +
    '<div class="content">' +
    '<div class="image-card">' +
    '<img src="' +
    dataURL +
    '" alt="Generated image">' +
    "</div>" +
    "</div>";

  $("messages")
    .appendChild(row);
}

/* =========================================================
   MODEL SELECTION
========================================================= */

function modelScore(model){

  const caps =
    new Set(
      Array.isArray(
        model.capabilities
      )
        ? model.capabilities
        : []
    );

  let score = 0;

  if(
    caps.has("reasoning")
  )
    score += 50;

  if(
    caps.has("vision")
  )
    score += 20;

  if(
    caps.has("web_search")
  )
    score += 15;

  if(
    caps.has("tools")
  )
    score += 10;

  if(
    caps.has("streaming")
  )
    score += 5;

  score += Math.min(
    Number(
      model.context_window ||
      0
    ) / 10000,
    20
  );

  return score;
}

function chooseDefaultModel(
  models
){

  const preferred =
    models.find(
      m =>
        m.id ===
        "claude-opus-4.8"
    );

  if(preferred)
    return preferred;

  return [...models]
    .sort(
      (a,b) =>
        modelScore(b) -
        modelScore(a)
    )[0];
}

/* =========================================================
   MODEL ERROR HANDLING
========================================================= */

async function fetchJSONWithTimeout(
  url,
  timeout = 12000
){

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      timeout
    );

  try{

    const response =
      await fetch(
        url,
        {
          method:"GET",
          cache:"no-store",
          signal:
            controller.signal
        }
      );

    const text =
      await response.text();

    let data;

    try{

      data =
        JSON.parse(text);

    }catch{

      data = {
        raw:text
      };
    }

    if(!response.ok){

      const error =
        data?.error || {};

      const err =
        new Error(
          error.message ||
          data?.message ||
          data?.raw ||
          (
            "HTTP " +
            response.status
          )
        );

      err.status =
        response.status;

      err.code =
        error.code || "";

      err.type =
        error.type || "";

      throw err;
    }

    return data;

  }finally{

    clearTimeout(timer);
  }
}

function modelErrorMessage(
  error
){

  if(
    error?.name ===
    "AbortError"
  ){

    return (
      "CodeCraft /models request timed out after 12 seconds."
    );
  }

  switch(
    Number(
      error?.status
    )
  ){

    case 401:

      return (
        "CodeCraft 401 — API key is missing, invalid, or revoked."
      );

    case 403:

      return (
        "CodeCraft 403 — API key needs the models:read scope."
      );

    case 402:

      return (
        "CodeCraft 402 — account allowance/balance is unavailable."
      );

    case 404:

      return (
        "CodeCraft 404 — /v1/models endpoint or resource was not found."
      );

    case 429:

      return (
        "CodeCraft 429 — rate limit reached. Try again shortly."
      );

    case 502:

      return (
        "CodeCraft 502 — upstream provider/API error."
      );

    default:

      return (
        "Models error" +
        (
          error?.status
            ? " (HTTP " +
              error.status +
              ")"
            : ""
        ) +
        ": " +
        (
          error?.message ||
          String(error)
        )
      );
  }
}

function showModelError(
  message
){

  const box =
    $("modelError");

  box.innerHTML =
    "<span>" +
    esc(message) +
    "</span>" +

    '<button id="retryModels">' +
    "Retry" +
    "</button>";

  box.classList.add(
    "show"
  );

  $("retryModels").onclick =
    () =>
      loadModels(
        true
      );
}

function hideModelError(){

  $("modelError")
    .classList
    .remove("show");
}

function populateModels(
  models,
  cached = false
){

  const select =
    $("model");

  select.innerHTML = "";

  models.forEach(
    model => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        model.id;

      option.textContent =
        (
          model.name ||
          model.id
        ) +
        (
          cached
            ? " (cached)"
            : ""
        );

      select.appendChild(
        option
      );
    }
  );

  const best =
    chooseDefaultModel(
      models
    );

  if(best){

    select.value =
      best.id;
  }

  select.title =
    cached
      ? "Using cached models"
      : (
          models.length +
          " models loaded"
        );
}

/* =========================================================
   MAIN MODEL LOADER
========================================================= */

async function loadModels(
  manualRetry = false
){

  const select =
    $("model");

  hideModelError();

  select.disabled = true;

  select.innerHTML =
    "<option>Loading models…</option>";

  /*
    First try:
    live CodeCraft API
  */

  let lastError =
    null;

  for(
    let attempt = 1;
    attempt <= 3;
    attempt++
  ){

    try{

      const data =
        await fetchJSONWithTimeout(
          "/api/models",
          12000
        );

      if(
        !Array.isArray(
          data?.data
        )
      ){

        throw new Error(
          "CodeCraft returned an invalid response: data[] is missing."
        );
      }

      if(
        data.data.length === 0
      ){

        throw new Error(
          "CodeCraft returned 0 models. Check the API key and models:read scope."
        );
      }

      state.models =
        data.data;

      /*
        Cache successful model list
      */

      localStorage.setItem(
        "aether_models",
        JSON.stringify(
          data.data
        )
      );

      populateModels(
        data.data,
        false
      );

      select.disabled =
        false;

      hideModelError();

      return true;

    }catch(error){

      lastError =
        error;

      console.error(
        "AetherAI model attempt",
        attempt,
        error
      );

      /*
        Wait before retrying.
      */

      if(
        attempt < 3
      ){

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              attempt * 1000
            )
        );
      }
    }
  }

  /*
    Live API failed.
    Try cached models.
  */

  try{

    const cached =
      JSON.parse(
        localStorage.getItem(
          "aether_models"
        ) || "[]"
      );

    if(
      Array.isArray(cached) &&
      cached.length > 0
    ){

      state.models =
        cached;

      populateModels(
        cached,
        true
      );

      select.disabled =
        false;

      showModelError(
        "Live model list failed. Using cached models. " +
        modelErrorMessage(
          lastError
        )
      );

      return false;
    }

  }catch(error){

    console.error(
      "Cached model list error",
      error
    );
  }

  /*
    No cache either.
    Show exact error.
  */

  select.disabled =
    false;

  select.innerHTML =
    '<option value="">⚠ Models unavailable</option>';

  showModelError(
    modelErrorMessage(
      lastError
    )
  );

  return false;
}

/* =========================================================
   FILES
========================================================= */

async function readFile(
  file
){

  return new Promise(
    resolve => {

      const reader =
        new FileReader();

      reader.onload =
        () => {

          const result =
            String(
              reader.result
            );

          if(
            file.type.startsWith(
              "image/"
            )
          ){

            resolve({
              name:file.name,
              type:file.type,
              data:result
            });

          }else{

            resolve({
              name:file.name,
              type:file.type,
              text:
                result.slice(
                  0,
                  120000
                )
            });
          }
        };

      if(
        file.type.startsWith(
          "image/"
        )
      ){

        reader.readAsDataURL(
          file
        );

      }else{

        reader.readAsText(
          file
        );
      }
    }
  );
}

function renderAttachments(){

  const box =
    $("attachments");

  box.innerHTML = "";

  state.attachments.forEach(
    (file,index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "attachment";

      item.textContent =
        "📎 " +
        file.name +
        " ×";

      item.onclick =
        () => {

          state.attachments
            .splice(
              index,
              1
            );

          renderAttachments();
        };

      box.appendChild(
        item
      );
    }
  );
}

/* =========================================================
   IMAGE GENERATION
========================================================= */

function wantsImage(
  text
){

  return (
    /\b(generate|create|make|draw|design|render|produce)\b[\s\S]{0,80}\b(image|picture|photo|wallpaper|illustration|artwork|logo)\b/i
      .test(text)
    ||
    /\b(image|picture|photo|wallpaper|illustration|artwork|logo)\b[\s\S]{0,40}\b(generate|create|make|draw|design|render)\b/i
      .test(text)
  );
}

async function generateImage(
  prompt
){

  const chat =
    ensureChat(
      prompt
    );

  state.busy =
    true;

  $("send").disabled =
    true;

  const loading =
    addMessage(
      "assistant",
      "Generating image…",
      false
    );

  try{

    const response =
      await fetch(
        "/api/generate-image",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              prompt
            })
        }
      );

    const text =
      await response.text();

    let data;

    try{

      data =
        JSON.parse(text);

    }catch{

      data = {
        raw:text
      };
    }

    if(!response.ok){

      throw new Error(
        data?.error?.message ||
        data?.message ||
        text ||
        (
          "HTTP " +
          response.status
        )
      );
    }

    loading.remove();

    addImageMessage(
      data.dataURI
    );

    chat.messages.push({
      role:"assistant",
      content:
        "[Generated image] " +
        prompt,
      image:
        data.dataURI
    });

    save();

  }catch(error){

    loading.querySelector(
      ".content"
    ).innerHTML =
      '<p class="danger">' +
      "Image generation failed: " +
      esc(
        error.message
      ) +
      "</p>";

  }finally{

    state.busy =
      false;

    $("send").disabled =
      false;

    $("prompt").focus();
  }
}

/* =========================================================
   CHAT
========================================================= */

function ensureChat(
  title
){

  if(
    !currentChat()
  ){

    newChat();
  }

  const chat =
    currentChat();

  if(
    chat.title ===
    "New chat" &&
    title
  ){

    chat.title =
      title.slice(
        0,
        50
      );
  }

  return chat;
}

function buildMessages(
  chat,
  files
){

  const messages =
    chat.messages
      .map(
        message => ({
          role:
            message.role,
          content:
            message.content
        })
      );

  const last =
    messages.pop();

  const output =
    messages;

  const userParts = [];

  if(
    last?.content
  ){

    userParts.push({
      type:"text",
      text:last.content
    });
  }

  for(
    const file of files
  ){

    if(
      file.type.startsWith(
        "image/"
      )
    ){

      userParts.push({
        type:"image_url",
        image_url:{
          url:file.data
        }
      });

    }else{

      userParts.push({
        type:"text",
        text:
          "Attached file: " +
          file.name +
          "\n\n" +
          (
            file.text ||
            ""
          )
      });
    }
  }

  if(
    userParts.length
  ){

    output.push({
      role:"user",
      content:userParts
    });
  }

  if(
    state.memories.length
  ){

    output.unshift({
      role:"system",
      content:
        "Relevant remembered information: " +
        state.memories.join(
          "; "
        )
    });
  }

  return output;
}

async function send(){

  if(
    state.busy
  )
    return;

  const prompt =
    $("prompt")
      .value
      .trim();

  if(
    !prompt &&
    !state.attachments.length
  )
    return;

  if(
    prompt &&
    !state.attachments.length &&
    wantsImage(prompt)
  ){

    $("prompt").value =
      "";

    autoSize();

    await generateImage(
      prompt
    );

    return;
  }

  /*
    If model list is unavailable,
    stop before sending a broken
    request.
  */

  if(
    !state.models.length
  ){

    showModelError(
      "No model is available. Fix the model/API error above, then tap Retry."
    );

    return;
  }

  const chat =
    ensureChat(
      prompt ||
      "File chat"
    );

  const files =
    state.attachments.slice();

  state.attachments =
    [];

  renderAttachments();

  chat.messages.push({
    role:"user",
    content:
      prompt ||
      "Please analyze the attached file(s)."
  });

  if(
    chat.title ===
    "New chat"
  ){

    chat.title =
      (
        prompt ||
        files[0]?.name ||
        "New chat"
      ).slice(
        0,
        50
      );
  }

  save();

  renderHistory();

  renderCurrent();

  state.busy =
    true;

  $("send").disabled =
    true;

  $("prompt").value =
    "";

  autoSize();

  const assistant =
    addMessage(
      "assistant",
      "Thinking…",
      false
    );

  const content =
    assistant.querySelector(
      ".content"
    );

  try{

    let modelID =
      $("model").value;

    /*
      Automatically choose vision model
      if an image is attached.
    */

    const hasImage =
      files.some(
        file =>
          file.type.startsWith(
            "image/"
          )
      );

    if(hasImage){

      const currentModel =
        state.models.find(
          model =>
            model.id ===
            modelID
        );

      const currentCaps =
        currentModel?.capabilities ||
        [];

      const currentHasVision =
        Array.isArray(
          currentCaps
        ) &&
        currentCaps.includes(
          "vision"
        );

      if(
        !currentHasVision
      ){

        const visionModel =
          state.models.find(
            model =>
              Array.isArray(
                model.capabilities
              ) &&
              model.capabilities.includes(
                "vision"
              )
          );

        if(
          visionModel
        ){

          modelID =
            visionModel.id;

          $("model").value =
            visionModel.id;
        }
      }
    }

    const payload = {

      model:
        modelID,

      messages:
        buildMessages(
          chat,
          files
        ),

      stream:true,

      max_tokens:8192
    };

    const response =
      await fetch(
        "/api/chat",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              payload
            )
        }
      );

    if(
      !response.ok
    ){

      const text =
        await response.text();

      let data;

      try{

        data =
          JSON.parse(text);

      }catch{

        data = {
          raw:text
        };
      }

      throw new Error(
        data?.error?.message ||
        data?.message ||
        data?.raw ||
        (
          "HTTP " +
          response.status
        )
      );
    }

    if(
      !response.body
    ){

      throw new Error(
        "CodeCraft returned an empty response body."
      );
    }

    const reader =
      response.body
        .getReader();

    const decoder =
      new TextDecoder();

    let buffer =
      "";

    let answer =
      "";

    while(true){

      const chunk =
        await reader.read();

      if(
        chunk.done
      )
        break;

      buffer +=
        decoder.decode(
          chunk.value,
          {
            stream:true
          }
        );

      const lines =
        buffer.split(
          "\n"
        );

      buffer =
        lines.pop();

      for(
        const line of lines
      ){

        if(
          !line.startsWith(
            "data:"
          )
        )
          continue;

        const raw =
          line
            .slice(5)
            .trim();

        if(
          raw ===
          "[DONE]"
        )
          continue;

        try{

          const data =
            JSON.parse(
              raw
            );

          const delta =
            data
              ?.choices?.[0]
              ?.delta
              ?.content ||
            "";

          if(!delta)
            continue;

          answer +=
            delta;

          content.innerHTML =
            markdown(
              answer
            );

          $("chat")
            .scrollTop =
            $("chat")
              .scrollHeight;

        }catch{

          /*
            Ignore malformed individual
            SSE chunks.
          */
        }
      }
    }

    if(
      !answer
    ){

      answer =
        "The model returned an empty response.";
    }

    content.innerHTML =
      markdown(
        answer
      );

    chat.messages.push({
      role:"assistant",
      content:answer
    });

    save();

    const actions =
      document.createElement(
        "div"
      );

    actions.className =
      "actions";

    actions.innerHTML =
      '<button class="action">Copy</button>' +
      '<button class="action">Regenerate</button>';

    content.appendChild(
      actions
    );

    actions
      .children[0]
      .onclick =
        () =>
          navigator
            .clipboard
            ?.writeText(
              answer
            );

    actions
      .children[1]
      .onclick =
        regenerate;

    extractMemory(
      prompt
    );

  }catch(error){

    content.innerHTML =
      '<p class="danger">' +
      "Error: " +
      esc(
        error.message
      ) +
      "</p>";

    chat.messages.push({
      role:"assistant",
      content:
        "Error: " +
        error.message
    });

    save();

  }finally{

    state.busy =
      false;

    $("send").disabled =
      false;

    $("prompt").focus();
  }
}

/* =========================================================
   MEMORY
========================================================= */

function extractMemory(
  prompt
){

  const lower =
    prompt.toLowerCase();

  if(
    /remember|my name is|i am|i'm|i like|i prefer/
      .test(lower)
  ){

    if(
      prompt &&
      !state.memories.includes(
        prompt
      )
    ){

      state.memories.push(
        prompt.slice(
          0,
          250
        )
      );

      state.memories =
        state.memories.slice(
          -30
        );

      save();
    }
  }
}

function openMemory(){

  const box =
    $("memoryList");

  if(
    !state.memories.length
  ){

    box.innerHTML =
      "<p>No memories yet.</p>";

  }else{

    box.innerHTML =
      state.memories
        .map(
          (memory,index) =>
            '<div class="memory-row">' +
            "<span>" +
            esc(memory) +
            "</span>" +
            '<button class="action" data-memory="' +
            index +
            '">' +
            "Delete" +
            "</button>" +
            "</div>"
        )
        .join("");

    box
      .querySelectorAll(
        "[data-memory]"
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              state.memories
                .splice(
                  Number(
                    button.dataset.memory
                  ),
                  1
                );

              save();

              openMemory();
            };
        }
      );
  }

  $("memoryModal")
    .classList
    .add("open");
}

/* =========================================================
   REGENERATE
========================================================= */

function regenerate(){

  const chat =
    currentChat();

  if(
    !chat ||
    state.busy ||
    chat.messages.length < 2
  )
    return;

  const assistant =
    chat.messages.pop();

  const user =
    chat.messages.pop();

  $("prompt").value =
    user.content;

  save();

  renderCurrent();

  send();
}

/* =========================================================
   UI
========================================================= */

function autoSize(){

  const textarea =
    $("prompt");

  textarea.style.height =
    "auto";

  textarea.style.height =
    Math.min(
      textarea.scrollHeight,
      180
    ) +
    "px";
}

function closeDrawer(){

  $("sidebar")
    .classList
    .remove("open");

  $("backdrop")
    .classList
    .remove("open");
}

/* NEW CHAT */

$("newChat").onclick =
  newChat;

$("newTop").onclick =
  newChat;

/* SEND */

$("send").onclick =
  send;

/* ENTER */

$("prompt")
  .addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "Enter" &&
        !event.shiftKey
      ){

        event.preventDefault();

        send();
      }
    }
  );

$("prompt")
  .addEventListener(
    "input",
    autoSize
  );

/* FILE */

$("attach").onclick =
  () =>
    $("file").click();

$("file").onchange =
  async event => {

    state.attachments =
      await Promise.all(
        [
          ...event.target.files
        ].map(
          readFile
        )
      );

    renderAttachments();

    event.target.value =
      "";
  };

/* IMAGE */

$("imageTool").onclick =
  async () => {

    const prompt =
      $("prompt")
        .value
        .trim();

    if(!prompt){

      $("prompt").placeholder =
        "Describe the image you want…";

      $("prompt").focus();

      return;
    }

    $("prompt").value =
      "";

    autoSize();

    await generateImage(
      prompt
    );
  };

/* SEARCH */

$("search").oninput =
  event =>
    renderHistory(
      event.target.value
    );

/* MOBILE */

$("menu").onclick =
  () => {

    $("sidebar")
      .classList
      .add("open");

    $("backdrop")
      .classList
      .add("open");
  };

$("backdrop").onclick =
  closeDrawer;

/* MEMORY */

$("memoryBtn").onclick =
  openMemory;

$("closeMemory").onclick =
  () =>
    $("memoryModal")
      .classList
      .remove("open");

$("clearMemory").onclick =
  () => {

    if(
      confirm(
        "Clear all memories?"
      )
    ){

      state.memories =
        [];

      save();

      openMemory();
    }
  };

/* CLEAR */

$("clearBtn").onclick =
  () => {

    if(
      confirm(
        "Delete all local chats and memories?"
      )
    ){

      localStorage.removeItem(
        "aether_chats"
      );

      localStorage.removeItem(
        "aether_memories"
      );

      localStorage.removeItem(
        "aether_models"
      );

      location.reload();
    }
  };

/* =========================================================
   START
========================================================= */

renderHistory();

renderCurrent();

/*
  IMPORTANT:
  Model loading starts immediately,
  but the UI can never remain
  permanently in "Loading models…".
*/

loadModels();

if(
  "serviceWorker" in navigator
){

  navigator.serviceWorker
    .register(
      "/sw.js"
    )
    .catch(
      () => {}
    );
}

</script>

</body>

</html>`;

/* =========================================================
   PWA MANIFEST
========================================================= */

const MANIFEST =
  JSON.stringify(
    {
      name:"AetherAI",
      short_name:"AetherAI",
      start_url:"/",
      display:"standalone",
      background_color:"#212121",
      theme_color:"#212121",
      orientation:"portrait",
      icons:[
        {
          src:"/icon.svg",
          sizes:"any",
          type:"image/svg+xml",
          purpose:"any maskable"
        }
      ]
    },
    null,
    2
  );

/* =========================================================
   SERVICE WORKER
========================================================= */

const SW = `
const CACHE_NAME = "aetherai-v2";

self.addEventListener(
  "install",
  event => {
    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  event => {
    event.waitUntil(
      self.clients.claim()
    );
  }
);

self.addEventListener(
  "fetch",
  event => {

    if(
      event.request.method !==
      "GET"
    )
      return;

    event.respondWith(
      fetch(
        event.request
      ).catch(
        () =>
          caches.match(
            event.request
          )
      )
    );
  }
);
`;

/* =========================================================
   ICON
========================================================= */

const ICON = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 128 128"
>
<rect
  width="128"
  height="128"
  rx="30"
  fill="#fff"
/>

<path
  d="M64 24c-23 0-41 15-41 34
  0 11 6 21 16 27l-5 18
  18-10c4 1 8 2 12 2
  23 0 41-15 41-34
  S87 24 64 24Z"
  fill="#111"
/>

<path
  d="M47 59h34M47 72h22"
  stroke="#fff"
  stroke-width="7"
  stroke-linecap="round"
/>

</svg>
`;

/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(
    request,
    env
  ){

    /* CORS */

    if(
      request.method ===
      "OPTIONS"
    ){

      return new Response(
        null,
        {
          headers:
            corsHeaders()
        }
      );
    }

    const url =
      new URL(
        request.url
      );

    /* =====================================================
       STATIC FILES
    ===================================================== */

    if(
      url.pathname ===
      "/manifest.json"
    ){

      return new Response(
        MANIFEST,
        {
          headers:{
            "Content-Type":
              "application/manifest+json",
            ...corsHeaders()
          }
        }
      );
    }

    if(
      url.pathname ===
      "/sw.js"
    ){

      return new Response(
        SW,
        {
          headers:{
            "Content-Type":
              "application/javascript; charset=utf-8",
            ...corsHeaders()
          }
        }
      );
    }

    if(
      url.pathname ===
      "/icon.svg"
    ){

      return new Response(
        ICON,
        {
          headers:{
            "Content-Type":
              "image/svg+xml",
            ...corsHeaders()
          }
        }
      );
    }

    /* =====================================================
       HEALTH
    ===================================================== */

    if(
      url.pathname ===
      "/api/health"
    ){

      return json({
        ok:true,
        provider:"CodeCraft",
        has_key:
          Boolean(
            apiKey(env)
          )
      });
    }

    /* =====================================================
       MODELS
       THIS IS THE IMPORTANT FIX
    ===================================================== */

    if(
      url.pathname ===
      "/api/models"
    ){

      if(
        !apiKey(env)
      ){

        return json(
          {
            error:{
              message:
                "CODECRAFT_API_KEY is not configured in Cloudflare Secrets.",
              type:
                "configuration_error",
              code:
                "missing_api_key"
            }
          },
          500
        );
      }

      const controller =
        new AbortController();

      const timer =
        setTimeout(
          () =>
            controller.abort(),
          10000
        );

      try{

        const response =
          await codecraftFetch(
            env,
            "/models",
            {
              method:"GET",
              signal:
                controller.signal
            }
          );

        const {
          data,
          text
        } =
          await readJSON(
            response
          );

        if(
          !response.ok
        ){

          const error =
            data?.error || {};

          return json(
            {
              error:{
                message:
                  error.message ||
                  text ||
                  (
                    "CodeCraft returned HTTP " +
                    response.status
                  ),

                type:
                  error.type ||
                  "codecraft_error",

                code:
                  error.code ||
                  (
                    "http_" +
                    response.status
                  )
              },

              status:
                response.status,

              source:
                "CodeCraft API"
            },
            response.status
          );
        }

        if(
          !Array.isArray(
            data?.data
          )
        ){

          return json(
            {
              error:{
                message:
                  "CodeCraft returned an invalid /models response. Expected data[].",
                type:
                  "invalid_response",
                code:
                  "invalid_models_response"
              }
            },
            502
          );
        }

        if(
          data.data.length ===
          0
        ){

          return json(
            {
              error:{
                message:
                  "CodeCraft returned an empty model list. Check that the API key has models:read.",
                type:
                  "empty_models",
                code:
                  "empty_models"
              }
            },
            502
          );
        }

        return json({
          object:
            data.object ||
            "list",

          data:
            data.data,

          count:
            data.data.length,

          source:
            "CodeCraft API"
        });

      }catch(error){

        if(
          error?.name ===
          "AbortError"
        ){

          return json(
            {
              error:{
                message:
                  "CodeCraft /v1/models timed out after 10 seconds.",
                type:
                  "timeout",
                code:
                  "models_timeout"
              }
            },
            504
          );
        }

        return json(
          {
            error:{
              message:
                error?.message ||
                "Could not reach CodeCraft /v1/models.",
              type:
                "upstream_error",
              code:
                "models_fetch_failed"
            }
          },
          502
        );

      }finally{

        clearTimeout(
          timer
        );
      }
    }

    /* =====================================================
       IMAGE GENERATION
    ===================================================== */

    if(
      url.pathname ===
      "/api/generate-image" &&
      request.method ===
      "POST"
    ){

      if(
        !env.AI
      ){

        return json(
          {
            error:{
              message:
                "Workers AI binding AI is not configured in wrangler.jsonc."
            }
          },
          500
        );
      }

      let body;

      try{

        body =
          await request.json();

      }catch{

        return json(
          {
            error:{
              message:
                "Invalid JSON."
            }
          },
          400
        );
      }

      const prompt =
        String(
          body.prompt ||
          ""
        ).trim();

      if(
        !prompt
      ){

        return json(
          {
            error:{
              message:
                "Image prompt is required."
            }
          },
          400
        );
      }

      try{

        const result =
          await env.AI.run(
            "@cf/black-forest-labs/flux-1-schnell",
            {
              prompt,

              steps:4,

              seed:
                Math.floor(
                  Math.random() *
                  2147483647
                )
            }
          );

        return json({
          dataURI:
            "data:image/jpeg;base64," +
            result.image
        });

      }catch(error){

        return json(
          {
            error:{
              message:
                error?.message ||
                "Image generation failed."
            }
          },
          500
        );
      }
    }

    /* =====================================================
       CHAT
    ===================================================== */

    if(
      url.pathname ===
      "/api/chat" &&
      request.method ===
      "POST"
    ){

      if(
        !apiKey(env)
      ){

        return json(
          {
            error:{
              message:
                "CODECRAFT_API_KEY is not configured."
            }
          },
          500
        );
      }

      let body;

      try{

        body =
          await request.json();

      }catch{

        return json(
          {
            error:{
              message:
                "Invalid JSON."
            }
          },
          400
        );
      }

      const response =
        await codecraftFetch(
          env,
          "/chat/completions",
          {
            method:"POST",
            body:
              JSON.stringify(
                body
              )
          }
        );

      /*
        Pass CodeCraft's actual response
        back to the frontend.
      */

      return new Response(
        response.body,
        {
          status:
            response.status,

          headers:{
            "Content-Type":
              response.headers.get(
                "Content-Type"
              ) ||
              "application/json",

            ...corsHeaders()
          }
        }
      );
    }

    /* =====================================================
       APP
    ===================================================== */

    return new Response(
      HTML,
      {
        headers:{
          "Content-Type":
            "text/html; charset=utf-8",

          ...corsHeaders()
        }
      }
    );
  }
};
