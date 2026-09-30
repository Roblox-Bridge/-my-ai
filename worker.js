const BASE = 'https://www.codecraftapi.com/v1';

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extra
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(extra)
    }
  });
}

function apiKey(env) {
  return String(env.CODECRAFT_API_KEY || '').trim();
}

async function ccFetch(env, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${apiKey(env)}`);
  headers.set('Content-Type', 'application/json');

  return fetch(BASE + path, {
    ...options,
    headers
  });
}

async function bodyJson(resp) {
  const text = await resp.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { data, text };
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
  content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"
>

<meta name="theme-color" content="#212121">

<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AetherAI">

<link rel="manifest" href="/manifest.json">

<title>AetherAI</title>

<style>

*{
  box-sizing:border-box
}

html,
body{
  margin:0;
  width:100%;
  height:100%;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  background:#212121;
  color:#ececec;
  overflow:hidden
}

button,
input,
textarea,
select{
  font:inherit
}

button{
  color:inherit
}

.app{
  height:100%;
  display:flex
}

.sidebar{
  width:260px;
  flex:0 0 260px;
  background:#171717;
  display:flex;
  flex-direction:column;
  padding:10px 10px 12px
}

.brand{
  height:42px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 10px;
  font-weight:700;
  font-size:16px
}

.logo{
  width:28px;
  height:28px;
  border-radius:8px;
  background:#fff;
  color:#111;
  display:grid;
  place-items:center;
  font-weight:800
}

.new{
  height:44px;
  width:100%;
  border:1px solid #444;
  background:#212121;
  border-radius:10px;
  text-align:left;
  padding:0 13px;
  cursor:pointer;
  margin:8px 0
}

.new:hover,
.history-item:hover,
.side-btn:hover{
  background:#2a2a2a
}

.search{
  margin:0 0 8px
}

.search input{
  width:100%;
  height:36px;
  background:#212121;
  border:1px solid #333;
  border-radius:9px;
  color:#eee;
  padding:0 11px;
  outline:none
}

.history{
  overflow:auto;
  flex:1;
  scrollbar-width:thin
}

.history-item{
  display:flex;
  align-items:center;
  gap:7px;
  border-radius:8px;
  padding:9px;
  cursor:pointer;
  margin:2px 0
}

.history-item.active{
  background:#2b2b2b
}

.history-title{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  flex:1;
  font-size:13.5px
}

.more{
  background:none;
  border:0;
  opacity:.55;
  cursor:pointer
}

.side-bottom{
  padding-top:8px
}

.side-btn{
  width:100%;
  border:0;
  background:transparent;
  text-align:left;
  padding:10px;
  border-radius:8px;
  cursor:pointer
}

.main{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  background:#212121
}

.topbar{
  height:56px;
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
  background:#212121
}

.top-left{
  display:flex;
  align-items:center;
  gap:5px;
  min-width:0
}

.mobile-menu{
  display:none;
  border:0;
  background:transparent;
  font-size:22px
}

.model-wrap{
  display:flex;
  align-items:center
}

.model-select{
  appearance:none;
  background:transparent;
  border:0;
  color:#eee;
  font-weight:600;
  font-size:15px;
  max-width:260px;
  outline:none;
  padding:8px 24px 8px 8px
}

.model-select:hover{
  background:#2a2a2a;
  border-radius:8px
}

.model-select option{
  background:#212121
}

.top-actions{
  display:flex;
  gap:2px
}

.icon-btn{
  width:36px;
  height:36px;
  border:0;
  background:transparent;
  border-radius:8px;
  cursor:pointer;
  font-size:18px
}

.icon-btn:hover{
  background:#303030
}

.chat{
  flex:1;
  overflow:auto;
  scroll-behavior:auto
}

.messages{
  max-width:860px;
  margin:auto;
  padding:22px 22px 170px
}

.welcome{
  min-height:58vh;
  display:grid;
  place-items:center;
  text-align:center
}

.welcome h1{
  font-size:30px;
  letter-spacing:-.5px;
  margin:0 0 9px
}

.welcome p{
  color:#a6a6a6;
  margin:0
}

.msg{
  display:flex;
  gap:13px;
  margin:0 0 28px;
  min-width:0
}

.avatar{
  width:30px;
  height:30px;
  border-radius:8px;
  flex:none;
  display:grid;
  place-items:center;
  font-size:13px
}

.user .avatar{
  background:#555
}

.assistant .avatar{
  background:#fff;
  color:#111
}

.bubble{
  min-width:0;
  flex:1;
  line-height:1.65;
  font-size:15.5px;
  overflow-wrap:anywhere
}

.bubble p{
  margin:0 0 13px
}

.bubble p:last-child{
  margin-bottom:0
}

.bubble h1,
.bubble h2,
.bubble h3{
  line-height:1.25;
  margin:18px 0 8px
}

.bubble h1{
  font-size:24px
}

.bubble h2{
  font-size:20px
}

.bubble h3{
  font-size:17px
}

.bubble strong{
  font-weight:700
}

.bubble em{
  font-style:italic
}

.bubble blockquote{
  border-left:3px solid #666;
  margin:12px 0;
  padding:2px 0 2px 14px;
  color:#c9c9c9
}

.bubble ul,
.bubble ol{
  margin:7px 0 14px;
  padding-left:24px
}

.bubble li{
  margin:4px 0
}

.bubble a{
  color:#9ecbff;
  text-decoration:underline
}

.inline-code{
  background:#2f2f2f;
  border:1px solid #3c3c3c;
  padding:1px 5px;
  border-radius:5px;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
  font-size:.9em
}

.code-wrap{
  margin:12px 0 15px;
  border:1px solid #3a3a3a;
  border-radius:10px;
  overflow:hidden;
  background:#0d0d0d
}

.code-head{
  height:34px;
  background:#181818;
  border-bottom:1px solid #303030;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 9px;
  color:#aaa;
  font-size:12px
}

.code-copy{
  border:0;
  background:#242424;
  border-radius:6px;
  padding:4px 8px;
  font-size:11px;
  cursor:pointer
}

.code-copy:hover{
  background:#333;
  color:#fff
}

.bubble pre{
  margin:0;
  padding:14px;
  overflow:auto;
  white-space:pre;
  line-height:1.5
}

.bubble pre code{
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  font-size:13px;
  background:none;
  padding:0
}

.table-wrap{
  overflow:auto;
  margin:12px 0
}

.bubble table{
  border-collapse:collapse;
  width:100%;
  min-width:420px
}

.bubble th,
.bubble td{
  border:1px solid #444;
  padding:7px 9px;
  text-align:left
}

.bubble th{
  background:#2b2b2b
}

.message-actions{
  display:flex;
  gap:3px;
  margin-top:8px;
  opacity:.78
}

.mini{
  border:0;
  background:transparent;
  color:#999;
  padding:5px 7px;
  border-radius:7px;
  cursor:pointer;
  font-size:12px
}

.mini:hover{
  background:#303030;
  color:#eee
}

.image-card{
  margin-top:10px;
  border:1px solid #3a3a3a;
  border-radius:12px;
  overflow:hidden;
  background:#111;
  max-width:720px
}

.image-card img{
  display:block;
  width:100%;
  height:auto
}

.image-toolbar{
  display:flex;
  justify-content:flex-end;
  gap:4px;
  padding:7px;
  background:#181818
}

.composer-wrap{
  position:fixed;
  bottom:0;
  left:260px;
  right:0;
  background:
    linear-gradient(
      transparent,
      #212121 24%
    );
  padding:28px 18px 14px;
  pointer-events:none
}

.composer,
.hint{
  pointer-events:auto
}

.composer{
  max-width:860px;
  margin:auto;
  background:#2f2f2f;
  border:1px solid #4b4b4b;
  border-radius:18px;
  box-shadow:0 5px 25px #0005
}

.attachments{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  padding:9px 12px 0
}

.chip{
  background:#202020;
  border:1px solid #444;
  border-radius:9px;
  padding:6px 9px;
  font-size:12px;
  cursor:pointer
}

.compose-row{
  display:flex;
  align-items:flex-end;
  padding:7px
}

.attach,
.image-tool{
  width:40px;
  height:40px;
  border:0;
  background:transparent;
  border-radius:10px;
  cursor:pointer;
  font-size:20px;
  flex:none
}

.attach:hover,
.image-tool:hover{
  background:#3a3a3a
}

.prompt{
  flex:1;
  resize:none;
  border:0;
  outline:0;
  background:transparent;
  color:#eee;
  max-height:180px;
  min-height:42px;
  padding:10px 8px;
  line-height:1.45
}

.prompt::placeholder{
  color:#999
}

.send{
  width:40px;
  height:40px;
  border:0;
  border-radius:11px;
  background:#fff;
  color:#111;
  cursor:pointer;
  font-weight:800;
  flex:none
}

.send:disabled{
  opacity:.35;
  cursor:default
}

.hint{
  text-align:center;
  font-size:10.5px;
  color:#777;
  padding-top:7px
}

.drawer-backdrop{
  display:none
}

.modal{
  position:fixed;
  inset:0;
  background:#0008;
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
  z-index:20
}

.modal.open{
  display:flex
}

.card{
  width:min(520px,100%);
  background:#202020;
  border:1px solid #444;
  border-radius:16px;
  padding:18px
}

.card h2{
  margin:0 0 14px
}

.card p{
  color:#aaa;
  font-size:14px;
  line-height:1.5
}

.memory-list{
  max-height:300px;
  overflow:auto
}

.memory-row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:10px;
  border-bottom:1px solid #333
}

.danger{
  color:#ff8d8d
}

.close{
  float:right;
  background:none;
  border:0;
  font-size:20px;
  cursor:pointer
}

.typing{
  display:inline-flex;
  gap:4px;
  align-items:center;
  padding:5px 0
}

.typing i{
  width:5px;
  height:5px;
  background:#aaa;
  border-radius:50%;
  animation:blink 1s infinite
}

.typing i:nth-child(2){
  animation-delay:.15s
}

.typing i:nth-child(3){
  animation-delay:.3s
}

@keyframes blink{
  0%,80%,100%{opacity:.25}
  40%{opacity:1}
}

@media(max-width:700px){

  .sidebar{
    position:fixed;
    z-index:15;
    top:0;
    bottom:0;
    left:0;
    transform:translateX(-100%);
    transition:transform .2s;
    width:84%;
    max-width:310px
  }

  .sidebar.open{
    transform:translateX(0)
  }

  .drawer-backdrop{
    position:fixed;
    inset:0;
    background:#0008;
    z-index:14
  }

  .drawer-backdrop.open{
    display:block
  }

  .mobile-menu{
    display:block
  }

  .composer-wrap{
    left:0;
    padding:20px 9px 9px
  }

  .messages{
    padding:14px 13px 145px
  }

  .topbar{
    padding:0 7px
  }

  .model-select{
    max-width:185px
  }

  .welcome h1{
    font-size:27px
  }

  .msg{
    gap:9px;
    margin-bottom:25px
  }

  .bubble{
    font-size:15px
  }

  .hint{
    display:none
  }

  .code-head{
    height:32px
  }

  .bubble pre{
    padding:11px
  }

  .image-card{
    max-width:100%
  }
}

</style>
</head>

<body>

<div class="app">

<aside class="sidebar" id="sidebar">

  <div class="brand">
    <div class="logo">A</div>
    <span>AetherAI</span>
  </div>

  <button class="new" id="newChat">
    ＋ New chat
  </button>

  <div class="search">
    <input
      id="search"
      placeholder="Search chats"
    >
  </div>

  <div class="history" id="history"></div>

  <div class="side-bottom">

    <button class="side-btn" id="memoryBtn">
      🧠 Memory
    </button>

    <button class="side-btn" id="clearBtn">
      ⚙ Clear local data
    </button>

  </div>

</aside>

<div class="drawer-backdrop" id="backdrop"></div>

<main class="main">

<header class="topbar">

  <div class="top-left">

    <button
      class="mobile-menu"
      id="menu"
    >
      ☰
    </button>

    <div class="model-wrap">

      <select
        class="model-select"
        id="model"
      >
        <option>
          Loading models…
        </option>
      </select>

    </div>

  </div>

  <div class="top-actions">

    <button
      class="icon-btn"
      id="newTop"
      title="New chat"
    >
      ＋
    </button>

  </div>

</header>

<section
  class="chat"
  id="chat"
>

  <div
    class="messages"
    id="messages"
  ></div>

</section>

<div class="composer-wrap">

  <div class="composer">

    <div
      class="attachments"
      id="attachments"
    ></div>

    <div class="compose-row">

      <button
        class="attach"
        id="attach"
        title="Attach files"
      >
        ＋
      </button>

      <button
        class="image-tool"
        id="imageTool"
        title="Generate image"
      >
        ✦
      </button>

      <input
        id="file"
        type="file"
        hidden
        multiple
        accept="image/*,.pdf,.txt,.md,.json,.csv,.doc,.docx"
      >

      <textarea
        class="prompt"
        id="prompt"
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

  <div class="card">

    <button
      class="close"
      id="closeMemory"
    >
      ×
    </button>

    <h2>Memory</h2>

    <p>
      Memories are stored locally on this device.
      AetherAI can use them in future chats.
    </p>

    <div
      class="memory-list"
      id="memoryList"
    ></div>

    <button
      class="side-btn danger"
      id="clearMemory"
    >
      Clear all memories
    </button>

  </div>

</div>

<script>

const state = {
  chats: JSON.parse(
    localStorage.getItem('aether_chats') || '[]'
  ),
  current: null,
  attachments: [],
  memories: JSON.parse(
    localStorage.getItem('aether_memories') || '[]'
  ),
  models: [],
  busy: false,
  autoImage: false
};

const $ = id => document.getElementById(id);

function save(){
  localStorage.setItem(
    'aether_chats',
    JSON.stringify(state.chats)
  );

  localStorage.setItem(
    'aether_memories',
    JSON.stringify(state.memories)
  );
}

function uid(){
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2,8);
}

function esc(s){
  return String(s ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[c])
  );
}

function codeEsc(s){
  return esc(s);
}

/*
  IMPORTANT:
  Backtick characters are represented with \x60
  so the outer String.raw template literal cannot
  terminate accidentally.
*/

function md(text){

  var s = String(
    text == null ? '' : text
  ).replace(/\r\n?/g,'\n');

  var blocks = [];

  s = s.replace(
    /\x60\x60\x60([\w+-]*)\n?([\s\S]*?)\x60\x60\x60/g,
    function(_,lang,code){

      var id = blocks.length;

      blocks.push({
        lang:lang || 'code',
        code:code
      });

      return '@@CODE' + id + '@@';
    }
  );

  var x = esc(s);

  x = x
    .replace(
      /^###\s+(.+)$/gm,
      '<h3>$1</h3>'
    )
    .replace(
      /^##\s+(.+)$/gm,
      '<h2>$1</h2>'
    )
    .replace(
      /^#\s+(.+)$/gm,
      '<h1>$1</h1>'
    );

  x = x.replace(
    /^>\s?(.+)$/gm,
    '<blockquote>$1</blockquote>'
  );

  x = x
    .replace(
      /^[-*]\s+(.+)$/gm,
      '<li>$1</li>'
    )
    .replace(
      /^(\d+)\.\s+(.+)$/gm,
      '<li data-ol="$1">$2</li>'
    );

  x = x.replace(
    /(<li(?: data-ol="\d+")?>.*?<\/li>\n?)+/g,
    function(m){

      var ordered = /data-ol=/.test(m);

      return '<' +
        (ordered ? 'ol' : 'ul') +
        '>' +
        m.replace(
          / data-ol="\d+"/g,
          ''
        ) +
        '</' +
        (ordered ? 'ol' : 'ul') +
        '>';
    }
  );

  x = x.replace(
    /^---+$/gm,
    '<hr>'
  );

  x = x.replace(
    /\|([^\n]+)\|\n\|\s*[-:]+(?:\s*\|\s*[-:]+)+\s*\|\n((?:\|[^\n]+\|\n?)+)/g,
    function(m,head,rows){

      var cells = head
        .split('|')
        .map(function(v){
          return v.trim();
        })
        .filter(Boolean);

      var body = rows
        .trim()
        .split('\n')
        .map(function(r){
          return r
            .split('|')
            .map(function(v){
              return v.trim();
            })
            .filter(Boolean);
        });

      return '<div class="table-wrap">' +
        '<table>' +
        '<thead><tr>' +
        cells.map(function(c){
          return '<th>' + c + '</th>';
        }).join('') +
        '</tr></thead>' +
        '<tbody>' +
        body.map(function(r){
          return '<tr>' +
            r.map(function(c){
              return '<td>' + c + '</td>';
            }).join('') +
            '</tr>';
        }).join('') +
        '</tbody>' +
        '</table>' +
        '</div>';
    }
  );

  x = x
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong>$1</strong>'
    )
    .replace(
      /__(.+?)__/g,
      '<strong>$1</strong>'
    )
    .replace(
      /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
      '<em>$1</em>'
    )
    .replace(
      /(?<!_)_([^_\n]+)_(?!_)/g,
      '<em>$1</em>'
    );

  x = x.replace(
    /\x60([^\x60\n]+)\x60/g,
    '<span class="inline-code">$1</span>'
  );

  x = x.replace(
    /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\\s\)\]\+\)$end:math:text$/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  x = x
    .split(/\n{2,}/)
    .map(function(part){

      if(
        /^<(h[1-3]|ul|ol|blockquote|pre|div|table|hr)/.test(
          part.trim()
        ) ||
        /^@@CODE\d+@@$/.test(part.trim())
      ){
        return part;
      }

      return part.replace(
        /\n/g,
        '<br>'
      );
    })
    .join('<div class="md-gap"></div>');

  x = x.replace(
    /@@CODE(\d+)@@/g,
    function(_,i){

      var b = blocks[Number(i)];

      return '<div class="code-wrap">' +
        '<div class="code-head">' +
        '<span>' +
        esc(b.lang) +
        '</span>' +
        '<button class="code-copy" data-code="' +
        encodeURIComponent(b.code) +
        '">' +
        'Copy code' +
        '</button>' +
        '</div>' +
        '<pre><code>' +
        codeEsc(b.code) +
        '</code></pre>' +
        '</div>';
    }
  );

  return x;
}

function bindRendered(root,raw){

  root
    .querySelectorAll('.code-copy')
    .forEach(btn => {

      btn.onclick = () => {

        const code =
          decodeURIComponent(
            btn.dataset.code
          );

        navigator.clipboard?.writeText(code);

        btn.textContent = 'Copied';

        setTimeout(
          () => btn.textContent = 'Copy code',
          1000
        );
      };
    });
}

function current(){
  return state.chats.find(
    c => c.id === state.current
  ) || null;
}

function renderHistory(filter = ''){

  const h = $('history');

  h.innerHTML = '';

  state.chats
    .filter(
      c =>
        !filter ||
        c.title
          .toLowerCase()
          .includes(filter.toLowerCase())
    )
    .slice()
    .reverse()
    .forEach(c => {

      const d =
        document.createElement('div');

      d.className =
        'history-item ' +
        (c.id === state.current
          ? 'active'
          : '');

      d.innerHTML =
        '<span>💬</span>' +
        '<span class="history-title"></span>' +
        '<button class="more" title="Delete">⋯</button>';

      d.querySelector(
        '.history-title'
      ).textContent = c.title;

      d.onclick = e => {

        if(
          e.target.closest('.more')
        ){

          state.chats =
            state.chats.filter(
              x => x.id !== c.id
            );

          if(
            state.current === c.id
          ){

            state.current =
              state.chats.at(-1)?.id ||
              null;
          }

          save();
          renderHistory();
          renderCurrent();

          return;
        }

        state.current = c.id;

        renderHistory();
        renderCurrent();
        closeDrawer();
      };

      h.appendChild(d);
    });
}

function renderCurrent(){

  const box = $('messages');

  box.innerHTML = '';

  const c = current();

  if(!c){

    box.innerHTML =
      '<div class="welcome">' +
      '<div>' +
      '<h1>How can I help you?</h1>' +
      '<p>Ask anything, upload an image, attach a file, or create an image.</p>' +
      '</div>' +
      '</div>';

    return;
  }

  c.messages.forEach(m => {

    if(m.image){

      addImageMessage(
        'Generated image',
        m.image
      );

    }else{

      addMessage(
        m.role,
        m.content,
        false
      );
    }

  });
}

function addMessage(
  role,
  text,
  actions = true
){

  const d =
    document.createElement('div');

  d.className =
    'msg ' + role;

  d.innerHTML =
    '<div class="avatar">' +
    (role === 'user' ? 'U' : 'A') +
    '</div>' +

    '<div class="bubble">' +

    '<div class="content">' +
    md(text) +
    '</div>' +

    (
      actions
      ?
      '<div class="message-actions">' +
      '<button class="mini copy">Copy</button>' +
      (
        role === 'assistant'
        ?
        '<button class="mini regen">Regenerate</button>'
        :
        ''
      ) +
      '</div>'
      :
      ''
    ) +

    '</div>';

  $('messages').appendChild(d);

  bindRendered(d,text);

  d.querySelector('.copy')
    ?.addEventListener(
      'click',
      () => navigator.clipboard?.writeText(text)
    );

  d.querySelector('.regen')
    ?.addEventListener(
      'click',
      () => regenerate()
    );

  return d;
}

function addImageMessage(
  prompt,
  dataURL
){

  const d =
    document.createElement('div');

  d.className =
    'msg assistant';

  d.innerHTML =
    '<div class="avatar">A</div>' +
    '<div class="bubble">' +
    '<div class="content">' +
    '<p>' +
    esc(prompt) +
    '</p>' +
    '<div class="image-card">' +
    '<img src="' +
    dataURL +
    '" alt="AI generated image">' +
    '<div class="image-toolbar">' +
    '<button class="mini image-download">Save image</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  $('messages').appendChild(d);

  d.querySelector(
    '.image-download'
  ).onclick = () => {

    const a =
      document.createElement('a');

    a.href = dataURL;
    a.download =
      'aether-generated-image.jpg';

    a.click();
  };

  return d;
}

function newChat(){

  const c = {
    id:uid(),
    title:'New chat',
    messages:[],
    created:Date.now()
  };

  state.chats.push(c);

  state.current = c.id;

  state.attachments = [];

  renderAttachments();

  save();
  renderHistory();
  renderCurrent();

  closeDrawer();

  $('prompt').focus();
}

function ensureChat(title){

  if(!current()){
    newChat();
  }

  const c = current();

  if(
    c.title === 'New chat' &&
    title
  ){
    c.title =
      title.slice(0,50);
  }

  return c;
}

function renderAttachments(){

  const a = $('attachments');

  a.innerHTML = '';

  state.attachments.forEach(
    (f,i) => {

      const d =
        document.createElement('div');

      d.className = 'chip';

      d.textContent =
        '📎 ' + f.name + ' ×';

      d.onclick = () => {

        state.attachments.splice(i,1);

        renderAttachments();
      };

      a.appendChild(d);
    }
  );
}

function modelScore(m){

  const caps =
    new Set(m.capabilities || []);

  let score = 0;

  if(caps.has('reasoning'))
    score += 50;

  if(caps.has('vision'))
    score += 20;

  if(caps.has('web_search'))
    score += 15;

  if(caps.has('tools'))
    score += 10;

  if(caps.has('streaming'))
    score += 5;

  score += Math.min(
    Number(m.context_window || 0) / 10000,
    20
  );

  return score;
}

function chooseDefaultModel(models){

  const exact =
    models.find(
      m => m.id === 'claude-opus-4.8'
    );

  if(exact)
    return exact;

  return [...models].sort(
    (a,b) =>
      modelScore(b) -
      modelScore(a)
  )[0];
}

async function loadModels(){

  try{

    const r =
      await fetch('/api/models');

    if(!r.ok)
      throw new Error(
        await r.text()
      );

    const data =
      await r.json();

    state.models =
      data.data || [];

    const select =
      $('model');

    select.innerHTML = '';

    state.models.forEach(m => {

      const o =
        document.createElement('option');

      o.value = m.id;

      o.textContent =
        m.name || m.id;

      select.appendChild(o);
    });

    const best =
      chooseDefaultModel(
        state.models
      );

    if(best)
      select.value = best.id;

    if(!state.models.length)
      throw new Error(
        'No models available'
      );

  }catch(e){

    $('model').innerHTML =
      '<option>Models failed — retry</option>';

    console.error(e);
  }
}

function memoryText(){

  return state.memories.length
    ?
      '\n\nKnown memory:\n' +
      state.memories
        .map(x => '- ' + x)
        .join('\n')
    :
      '';
}

function scrollToBottom(){

  const el = $('chat');

  el.scrollTop =
    el.scrollHeight;
}

function wantsImage(text){

  return (
    /\b(generate|create|make|draw|design|render|produce)\b[\s\S]{0,80}\b(image|picture|photo|wallpaper|illustration|artwork|logo)\b/i
    .test(text)
  ) ||
  (
    /\b(image|picture|photo|wallpaper|illustration|artwork|logo)\b[\s\S]{0,40}\b(generate|create|make|draw|design|render)\b/i
    .test(text)
  );
}

async function generateImage(prompt){

  const c =
    ensureChat(
      prompt || 'Generated image'
    );

  state.busy = true;

  $('send').disabled = true;

  const ai =
    addMessage(
      'assistant',
      '',
      false
    );

  ai.querySelector(
    '.content'
  ).innerHTML =
    '<div class="typing">' +
    '<i></i><i></i><i></i>' +
    '</div>';

  try{

    const r =
      await fetch(
        '/api/generate-image',
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            prompt
          })
        }
      );

    if(!r.ok)
      throw new Error(
        await r.text()
      );

    const data =
      await r.json();

    ai.remove();

    addImageMessage(
      'Generated image',
      data.dataURI
    );

    c.messages.push({
      role:'assistant',
      content:
        '[Generated image] ' +
        prompt,
      image:data.dataURI
    });

    save();

  }catch(e){

    ai.querySelector(
      '.content'
    ).innerHTML =
      '<p class="danger">' +
      'Image generation failed: ' +
      esc(e.message) +
      '</p>';

  }finally{

    state.busy = false;

    $('send').disabled = false;

    $('prompt').focus();
  }
}

async function send(){

  if(state.busy)
    return;

  const prompt =
    $('prompt').value.trim();

  if(
    !prompt &&
    !state.attachments.length
  ){
    return;
  }

  if(
    !state.attachments.length &&
    wantsImage(prompt)
  ){

    $('prompt').value = '';

    autoSize();

    await generateImage(prompt);

    return;
  }

  const c =
    ensureChat(
      prompt || 'File chat'
    );

  const files =
    state.attachments.slice();

  state.attachments = [];

  renderAttachments();

  c.messages.push({
    role:'user',
    content:
      prompt ||
      'Please analyze the attached file(s).'
  });

  if(c.title === 'New chat'){

    c.title =
      (
        prompt ||
        files[0]?.name ||
        'New chat'
      ).slice(0,50);
  }

  save();

  renderHistory();
  renderCurrent();
  scrollToBottom();

  state.busy = true;

  $('send').disabled = true;

  $('prompt').value = '';

  autoSize();

  const ai =
    addMessage(
      'assistant',
      '',
      false
    );

  const content =
    ai.querySelector(
      '.content'
    );

  content.innerHTML =
    '<div class="typing">' +
    '<i></i><i></i><i></i>' +
    '</div>';

  try{

    let selected =
      $('model').value;

    if(
      files.some(
        f => f.type.startsWith('image/')
      )
    ){

      const currentModel =
        state.models.find(
          m => m.id === selected
        );

      if(
        !currentModel?.capabilities?.includes?.('vision') &&
        !currentModel?.capabilities?.vision
      ){

        const vision =
          state.models.find(
            m =>
              (m.capabilities || [])
                .includes('vision') ||
              m.capabilities?.vision
          );

        if(vision){

          selected =
            vision.id;

          $('model').value =
            vision.id;
        }
      }
    }

    const payload = {
      model:selected,
      messages:
        buildMessages(
          c,
          files
        ),
      stream:true,
      max_tokens:8192
    };

    const r =
      await fetch(
        '/api/chat',
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify(payload)
        }
      );

    if(!r.ok)
      throw new Error(
        await r.text()
      );

    const reader =
      r.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = '';
    let answer = '';

    while(true){

      const q =
        await reader.read();

      if(q.done)
        break;

      buffer +=
        decoder.decode(
          q.value,
          {stream:true}
        );

      const lines =
        buffer.split('\n');

      buffer =
        lines.pop();

      for(
        const line of lines
      ){

        if(
          !line.startsWith('data:')
        )
          continue;

        const raw =
          line
            .slice(5)
            .trim();

        if(raw === '[DONE]')
          continue;

        try{

          const j =
            JSON.parse(raw);

          const delta =
            j.choices?.[0]
              ?.delta
              ?.content || '';

          if(!delta)
            continue;

          answer += delta;

          content.innerHTML =
            md(answer);

          bindRendered(
            ai,
            answer
          );

        }catch{}
      }
    }

    content.innerHTML =
      md(
        answer ||
        'No response received.'
      );

    bindRendered(
      ai,
      answer
    );

    c.messages.push({
      role:'assistant',
      content:
        answer ||
        'No response received.'
    });

    save();

    ai.querySelector(
      '.bubble'
    ).insertAdjacentHTML(
      'beforeend',
      '<div class="message-actions">' +
      '<button class="mini copy">Copy</button>' +
      '<button class="mini regen">Regenerate</button>' +
      '</div>'
    );

    ai.querySelector(
      '.copy'
    ).onclick =
      () =>
        navigator.clipboard?.writeText(
          answer
        );

    ai.querySelector(
      '.regen'
    ).onclick =
      () => regenerate();

    extractMemory(
      prompt,
      answer
    );

  }catch(e){

    content.innerHTML =
      '<p class="danger">' +
      'Error: ' +
      esc(e.message) +
      '</p>';

    c.messages.push({
      role:'assistant',
      content:
        'Error: ' +
        e.message
    });

    save();

  }finally{

    state.busy = false;

    $('send').disabled = false;

    $('prompt').focus();
  }
}

function buildMessages(
  c,
  files
){

  const msgs =
    [...c.messages];

  const last =
    msgs.pop();

  const out =
    msgs.map(
      m => ({
        role:m.role,
        content:m.content
      })
    );

  let userContent = [];

  if(last?.content){

    userContent.push({
      type:'text',
      text:last.content
    });
  }

  for(
    const f of files
  ){

    if(
      f.type.startsWith('image/')
    ){

      userContent.push({
        type:'image_url',
        image_url:{
          url:f.data
        }
      });

    }else{

      userContent.push({
        type:'text',
        text:
          'Attached file: ' +
          f.name +
          '\n' +
          (f.text || '')
      });
    }
  }

  if(userContent.length){

    out.push({
      role:'user',
      content:userContent
    });
  }

  if(state.memories.length){

    out.unshift({
      role:'system',
      content:
        'Use these remembered facts only when relevant. ' +
        state.memories.join('; ')
    });
  }

  return out;
}

async function prepareFile(file){

  return new Promise(
    resolve => {

      const fr =
        new FileReader();

      fr.onload = () => {

        const data =
          String(fr.result);

        if(
          file.type.startsWith('image/')
        ){

          resolve({
            name:file.name,
            type:file.type,
            data
          });

        }else{

          resolve({
            name:file.name,
            type:file.type,
            text:
              data.slice(
                0,
                120000
              )
          });
        }
      };

      if(
        file.type.startsWith('image/')
      ){

        fr.readAsDataURL(file);

      }else{

        fr.readAsText(file);
      }
    }
  );
}

function regenerate(){

  const c = current();

  if(
    !c ||
    state.busy ||
    c.messages.length < 2
  )
    return;

  c.messages.pop();

  const user =
    c.messages.pop();

  $('prompt').value =
    user.content;

  save();

  renderCurrent();

  scrollToBottom();

  send();
}

function extractMemory(
  prompt,
  answer
){

  const p =
    prompt.toLowerCase();

  if(
    /remember|my name is|i am|i'm|i like|i prefer/
      .test(p)
  ){

    const item =
      prompt.slice(0,220);

    if(
      item &&
      !state.memories.includes(item)
    ){

      state.memories.push(item);

      state.memories =
        state.memories.slice(-30);

      save();
    }
  }
}

function openMemory(){

  const list =
    $('memoryList');

  list.innerHTML =
    state.memories.length
    ?
      state.memories
        .map(
          (m,i) =>
            '<div class="memory-row">' +
            '<span>' +
            esc(m) +
            '</span>' +
            '<button class="mini" onclick="removeMemory(' +
            i +
            ')">Delete</button>' +
            '</div>'
        )
        .join('')
    :
      '<p>No memories yet.</p>';

  $('memoryModal')
    .classList
    .add('open');
}

window.removeMemory =
  i => {

    state.memories.splice(
      i,
      1
    );

    save();

    openMemory();
  };

function closeDrawer(){

  $('sidebar')
    .classList
    .remove('open');

  $('backdrop')
    .classList
    .remove('open');
}

function autoSize(){

  const x =
    $('prompt');

  x.style.height = 'auto';

  x.style.height =
    Math.min(
      x.scrollHeight,
      180
    ) + 'px';
}

$('newChat').onclick =
  newChat;

$('newTop').onclick =
  newChat;

$('send').onclick =
  send;

$('imageTool').onclick =
  () => {

    const p =
      $('prompt')
        .value
        .trim();

    if(!p){

      $('prompt').focus();

      $('prompt').placeholder =
        'Describe the image you want…';

      return;
    }

    $('prompt').value = '';

    autoSize();

    generateImage(p);
  };

$('attach').onclick =
  () =>
    $('file').click();

$('file').onchange =
  async e => {

    state.attachments =
      await Promise.all(
        [...e.target.files]
          .map(prepareFile)
      );

    renderAttachments();

    e.target.value = '';
  };

$('prompt')
  .addEventListener(
    'input',
    autoSize
  );

$('prompt')
  .addEventListener(
    'keydown',
    e => {

      if(
        e.key === 'Enter' &&
        !e.shiftKey
      ){

        e.preventDefault();

        send();
      }
    }
  );

$('search').oninput =
  e =>
    renderHistory(
      e.target.value
    );

$('menu').onclick =
  () => {

    $('sidebar')
      .classList
      .add('open');

    $('backdrop')
      .classList
      .add('open');
  };

$('backdrop').onclick =
  closeDrawer;

$('memoryBtn').onclick =
  openMemory;

$('closeMemory').onclick =
  () =>
    $('memoryModal')
      .classList
      .remove('open');

$('clearMemory').onclick =
  () => {

    if(
      confirm(
        'Clear all memories?'
      )
    ){

      state.memories = [];

      save();

      openMemory();
    }
  };

$('clearBtn').onclick =
  () => {

    if(
      confirm(
        'Delete all local chats and memories?'
      )
    ){

      localStorage.removeItem(
        'aether_chats'
      );

      localStorage.removeItem(
        'aether_memories'
      );

      location.reload();
    }
  };

renderHistory();
renderCurrent();
loadModels();

if(
  'serviceWorker' in navigator
){

  navigator.serviceWorker
    .register('/sw.js')
    .catch(() => {});
}

</script>

</body>
</html>`;

const MANIFEST = JSON.stringify(
  {
    name:'AetherAI',
    short_name:'AetherAI',
    start_url:'/',
    display:'standalone',
    background_color:'#212121',
    theme_color:'#212121',
    orientation:'portrait',
    icons:[
      {
        src:'/icon.svg',
        sizes:'any',
        type:'image/svg+xml',
        purpose:'any maskable'
      }
    ]
  },
  null,
  2
);

const SW =
`const CACHE='aetherai-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).catch(
      ()=>caches.match(e.request)
    )
  )
});`;

const ICON =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<rect width="128" height="128" rx="30" fill="#fff"/>
<path d="M64 24c-23 0-41 15-41 34 0 11 6 21 16 27l-5 18 18-10c4 1 8 2 12 2 23 0 41-15 41-34S87 24 64 24Z" fill="#111"/>
<path d="M47 59h34M47 72h22" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
</svg>`;

export default {

  async fetch(
    request,
    env
  ){

    if(
      request.method === 'OPTIONS'
    ){

      return new Response(
        null,
        {
          headers:corsHeaders()
        }
      );
    }

    const url =
      new URL(request.url);

    if(
      url.pathname ===
      '/manifest.json'
    ){

      return new Response(
        MANIFEST,
        {
          headers:{
            'Content-Type':
              'application/manifest+json',
            ...corsHeaders()
          }
        }
      );
    }

    if(
      url.pathname === '/sw.js'
    ){

      return new Response(
        SW,
        {
          headers:{
            'Content-Type':
              'application/javascript; charset=utf-8',
            ...corsHeaders()
          }
        }
      );
    }

    if(
      url.pathname === '/icon.svg'
    ){

      return new Response(
        ICON,
        {
          headers:{
            'Content-Type':
              'image/svg+xml',
            ...corsHeaders()
          }
        }
      );
    }

    if(
      url.pathname === '/api/health'
    ){

      return json({
        ok:true,
        provider:'CodeCraft',
        has_key:!!apiKey(env)
      });
    }

    if(
      url.pathname === '/api/models'
    ){

      if(!apiKey(env)){

        return json(
          {
            error:{
              message:
                'CODECRAFT_API_KEY is not configured'
            }
          },
          500
        );
      }

      const r =
        await ccFetch(
          env,
          '/models'
        );

      const {
        data
      } =
        await bodyJson(r);

      return json(
        data,
        r.status
      );
    }

    if(
      url.pathname ===
      '/api/generate-image' &&
      request.method === 'POST'
    ){

      if(!env.AI){

        return json(
          {
            error:{
              message:
                'Workers AI binding AI is not configured. Add the AI binding in wrangler.jsonc.'
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
                'Invalid JSON'
            }
          },
          400
        );
      }

      const prompt =
        String(
          body.prompt || ''
        ).trim();

      if(!prompt){

        return json(
          {
            error:{
              message:
                'Image prompt is required'
            }
          },
          400
        );
      }

      try{

        const result =
          await env.AI.run(
            '@cf/black-forest-labs/flux-1-schnell',
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
            `data:image/jpeg;base64,${result.image}`
        });

      }catch(e){

        return json(
          {
            error:{
              message:
                e?.message ||
                'Image generation failed'
            }
          },
          500
        );
      }
    }

    if(
      url.pathname === '/api/chat' &&
      request.method === 'POST'
    ){

      if(!apiKey(env)){

        return json(
          {
            error:{
              message:
                'CODECRAFT_API_KEY is not configured'
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
                'Invalid JSON'
            }
          },
          400
        );
      }

      const r =
        await ccFetch(
          env,
          '/chat/completions',
          {
            method:'POST',
            body:
              JSON.stringify(body)
          }
        );

      return new Response(
        r.body,
        {
          status:r.status,
          headers:{
            'Content-Type':
              r.headers.get(
                'Content-Type'
              ) ||
              'application/json',
            ...corsHeaders()
          }
        }
      );
    }

    return new Response(
      HTML,
      {
        headers:{
          'Content-Type':
            'text/html; charset=utf-8',
          ...corsHeaders()
        }
      }
    );
  }
};
