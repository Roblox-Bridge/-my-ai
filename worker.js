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
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  background:#212121;
  color:#ececec;
  overflow:hidden
}

button,
input,
textarea{
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
  width:280px;
  background:#171717;
  border-right:1px solid #303030;
  display:flex;
  flex-direction:column;
  padding:12px
}

.brand{
  height:48px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 10px;
  font-weight:700;
  font-size:18px
}

.logo{
  width:30px;
  height:30px;
  border-radius:9px;
  background:#fff;
  color:#111;
  display:grid;
  place-items:center;
  font-weight:900
}

.new{
  width:100%;
  height:46px;
  border:1px solid #3b3b3b;
  background:#212121;
  border-radius:12px;
  text-align:left;
  padding:0 14px;
  cursor:pointer
}

.new:hover,
.history-item:hover{
  background:#2a2a2a
}

.search{
  margin:10px 0;
  position:relative
}

.search input{
  width:100%;
  height:38px;
  background:#212121;
  border:1px solid #333;
  border-radius:10px;
  color:#eee;
  padding:0 12px;
  outline:none
}

.history{
  overflow:auto;
  flex:1
}

.history-item{
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:9px;
  padding:9px 10px;
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
  font-size:14px
}

.more{
  background:none;
  border:0;
  opacity:.55;
  cursor:pointer
}

.side-bottom{
  border-top:1px solid #303030;
  padding-top:10px
}

.side-btn{
  width:100%;
  border:0;
  background:transparent;
  text-align:left;
  padding:11px;
  border-radius:9px;
  cursor:pointer
}

.side-btn:hover{
  background:#2a2a2a
}

.main{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column
}

.topbar{
  height:58px;
  border-bottom:1px solid #303030;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 16px
}

.top-left{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0
}

.mobile-menu{
  display:none;
  border:0;
  background:transparent;
  font-size:23px
}

.model-select{
  background:transparent;
  border:0;
  color:#eee;
  font-weight:600;
  max-width:220px;
  outline:none
}

.model-select option{
  background:#212121
}

.top-actions{
  display:flex;
  gap:4px
}

.icon-btn{
  width:38px;
  height:38px;
  border:0;
  background:transparent;
  border-radius:9px;
  cursor:pointer;
  font-size:18px
}

.icon-btn:hover{
  background:#303030
}

.chat{
  flex:1;
  overflow:auto
}

.messages{
  max-width:850px;
  margin:auto;
  padding:24px 20px 170px
}

.welcome{
  min-height:55vh;
  display:grid;
  place-items:center;
  text-align:center
}

.welcome h1{
  font-size:32px;
  margin:0 0 10px
}

.welcome p{
  color:#a6a6a6;
  margin:0
}

.msg{
  display:flex;
  gap:14px;
  margin:0 0 28px
}

.avatar{
  width:30px;
  height:30px;
  border-radius:8px;
  flex:none;
  display:grid;
  place-items:center;
  font-size:14px
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
  font-size:15.5px
}

.bubble p{
  margin:0 0 12px
}

.bubble p:last-child{
  margin-bottom:0
}

.bubble pre{
  background:#111;
  border:1px solid #333;
  border-radius:10px;
  padding:13px;
  overflow:auto;
  white-space:pre-wrap
}

.bubble code{
  background:#303030;
  padding:2px 5px;
  border-radius:5px
}

.bubble pre code{
  background:none;
  padding:0
}

.message-actions{
  display:flex;
  gap:4px;
  margin-top:7px
}

.mini{
  border:0;
  background:transparent;
  color:#8f8f8f;
  padding:4px 7px;
  border-radius:7px;
  cursor:pointer;
  font-size:12px
}

.mini:hover{
  background:#303030;
  color:#eee
}

.composer-wrap{
  position:fixed;
  bottom:0;
  left:280px;
  right:0;
  background:linear-gradient(transparent,#212121 28%);
  padding:24px 18px 16px
}

.composer{
  max-width:850px;
  margin:auto;
  background:#303030;
  border:1px solid #4a4a4a;
  border-radius:18px;
  box-shadow:0 4px 20px #0005
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
  font-size:12px
}

.compose-row{
  display:flex;
  align-items:flex-end;
  padding:8px
}

.attach{
  width:42px;
  height:42px;
  border:0;
  background:transparent;
  border-radius:10px;
  cursor:pointer;
  font-size:21px
}

.attach:hover{
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

.send{
  width:42px;
  height:42px;
  border:0;
  border-radius:11px;
  background:#fff;
  color:#111;
  cursor:pointer;
  font-weight:800
}

.send:disabled{
  opacity:.35;
  cursor:default
}

.hint{
  text-align:center;
  font-size:11px;
  color:#777;
  padding-top:8px
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

@media(max-width:700px){

.sidebar{
  position:fixed;
  z-index:15;
  top:0;
  bottom:0;
  left:0;
  transform:translateX(-100%);
  transition:transform .2s;
  width:84%
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
  padding:16px 10px 10px
}

.messages{
  padding:18px 13px 145px
}

.topbar{
  padding:0 8px
}

.model-select{
  max-width:170px
}

.welcome h1{
  font-size:27px
}

.msg{
  gap:9px
}

.bubble{
  font-size:15px
}

.hint{
  display:none
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
<input id="search" placeholder="Search chats">
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

<button class="mobile-menu" id="menu">
☰
</button>

<select class="model-select" id="model">
<option>Loading models…</option>
</select>

</div>

<div class="top-actions">

<button class="icon-btn" id="newTop" title="New chat">
＋
</button>

</div>

</header>

<section class="chat" id="chat">

<div class="messages" id="messages"></div>

</section>

<div class="composer-wrap">

<div class="composer">

<div class="attachments" id="attachments"></div>

<div class="compose-row">

<button class="attach" id="attach" title="Attach files">
＋
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

<button class="send" id="send">
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

<div class="modal" id="memoryModal">

<div class="card">

<button class="close" id="closeMemory">
×
</button>

<h2>Memory</h2>

<p>
Memories are stored locally on this device.
AetherAI can use them in future chats.
</p>

<div class="memory-list" id="memoryList"></div>

<button class="side-btn danger" id="clearMemory">
Clear all memories
</button>

</div>

</div>

<script>

const state = {
  chats: JSON.parse(localStorage.getItem('aether_chats') || '[]'),
  current: null,
  attachments: [],
  memories: JSON.parse(localStorage.getItem('aether_memories') || '[]'),
  models: [],
  busy: false
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
  return String(s).replace(
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

function md(s){

  let x = esc(s);

  x = x.replace(
    /\x60{3}([\s\S]*?)\x60{3}/g,
    '<pre><code>$1</code></pre>'
  );

  x = x.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  x = x.replace(
    /\x60([^\x60]+)\x60/g,
    '<code>$1</code>'
  );

  x = x.replace(
    /\n/g,
    '<br>'
  );

  return x;
}

function renderHistory(filter = ''){

  const h = $('history');

  h.innerHTML = '';

  state.chats
    .filter(c =>
      !filter ||
      c.title.toLowerCase().includes(filter.toLowerCase())
    )
    .slice()
    .reverse()
    .forEach(c => {

      const d = document.createElement('div');

      d.className =
        'history-item ' +
        (c.id === state.current ? 'active' : '');

      d.innerHTML =
        '<span>💬</span>' +
        '<span class="history-title"></span>' +
        '<button class="more">⋯</button>';

      d.querySelector('.history-title').textContent =
        c.title || 'New chat';

      d.onclick = e => {

        if(e.target.classList.contains('more')){

          if(confirm('Delete this chat?')){

            state.chats =
              state.chats.filter(
                x => x.id !== c.id
              );

            if(state.current === c.id){
              state.current = null;
            }

            save();
            renderHistory();
            renderCurrent();
          }

        }else{

          state.current = c.id;

          renderHistory();
          renderCurrent();
          closeDrawer();
        }

      };

      h.appendChild(d);
    });
}

function current(){
  return state.chats.find(
    c => c.id === state.current
  );
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
      '<p>Ask anything, upload an image or attach a file.</p>' +
      '</div>' +
      '</div>';

    return;
  }

  c.messages.forEach(
    m => addMessage(
      m.role,
      m.content,
      false
    )
  );

  $('chat').scrollTop =
    $('chat').scrollHeight;
}

function addMessage(role,text,actions=true){

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

  d.querySelector('.copy')?.addEventListener(
    'click',
    () => navigator.clipboard?.writeText(text)
  );

  d.querySelector('.regen')?.addEventListener(
    'click',
    () => regenerate()
  );

  $('messages').appendChild(d);

  return d;
}

function newChat(){

  const c = {
    id: uid(),
    title: 'New chat',
    messages: [],
    created: Date.now()
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

async function loadModels(){

  try{

    const r =
      await fetch('/api/models');

    if(!r.ok){
      throw new Error(await r.text());
    }

    const data =
      await r.json();

    state.models =
      data.data || [];

    $('model').innerHTML = '';

    state.models.forEach(m => {

      const o =
        document.createElement('option');

      o.value = m.id;

      o.textContent =
        m.name || m.id;

      $('model').appendChild(o);

    });

    if(!state.models.length){
      throw new Error(
        'No models available'
      );
    }

  }catch(e){

    $('model').innerHTML =
      '<option>Models failed — retry</option>';

    console.error(e);
  }
}

async function send(){

  if(state.busy){
    return;
  }

  const prompt =
    $('prompt').value.trim();

  if(
    !prompt &&
    !state.attachments.length
  ){
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
    ai.querySelector('.content');

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
        !currentModel?.capabilities?.vision
      ){

        const vision =
          state.models.find(
            m => m.capabilities?.vision
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
      messages:buildMessages(
        c,
        files
      ),
      stream:true
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

    if(!r.ok){

      const t =
        await r.text();

      throw new Error(t);
    }

    const reader =
      r.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = '';
    let answer = '';

    while(true){

      const q =
        await reader.read();

      if(q.done){
        break;
      }

      buffer +=
        decoder.decode(
          q.value,
          {stream:true}
        );

      const lines =
        buffer.split('\n');

      buffer =
        lines.pop();

      for(const line of lines){

        if(!line.startsWith('data:')){
          continue;
        }

        const raw =
          line.slice(5).trim();

        if(raw === '[DONE]'){
          continue;
        }

        try{

          const j =
            JSON.parse(raw);

          const delta =
            j.choices?.[0]?.delta?.content ||
            '';

          answer += delta;

          content.innerHTML =
            md(answer);

          $('chat').scrollTop =
            $('chat').scrollHeight;

        }catch{}
      }
    }

    c.messages.push({
      role:'assistant',
      content:
        answer ||
        'No response received.'
    });

    save();

    ai.querySelector('.bubble')
      .insertAdjacentHTML(
        'beforeend',
        '<div class="message-actions">' +
        '<button class="mini copy">Copy</button>' +
        '<button class="mini regen">Regenerate</button>' +
        '</div>'
      );

    ai.querySelector('.copy').onclick =
      () => navigator.clipboard?.writeText(
        answer
      );

    ai.querySelector('.regen').onclick =
      () => regenerate();

    extractMemory(
      prompt,
      answer
    );

  }catch(e){

    content.innerHTML =
      '<p class="danger">Error: ' +
      esc(e.message) +
      '</p>';

    c.messages.push({
      role:'assistant',
      content:
        'Error: ' + e.message
    });

    save();

  }finally{

    state.busy = false;

    $('send').disabled = false;

    $('prompt').focus();
  }
}

function buildMessages(c,files){

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

  for(const f of files){

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

  return new Promise(resolve => {

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
          text:data.slice(0,120000)
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
  });
}

async function regenerate(){

  const c =
    current();

  if(
    !c ||
    state.busy ||
    c.messages.length < 2
  ){
    return;
  }

  c.messages.pop();

  const last =
    c.messages.pop();

  $('prompt').value =
    last.content;

  save();

  renderCurrent();

  await send();
}

function extractMemory(prompt,answer){

  const p =
    prompt.toLowerCase();

  if(
    /remember|my name is|i am|i'm|i like|i prefer/.test(p)
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
    .classList.add('open');
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
    .classList.remove('open');

  $('backdrop')
    .classList.remove('open');
}

function autoSize(){

  const x =
    $('prompt');

  x.style.height =
    'auto';

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

$('attach').onclick =
  () => $('file').click();

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

$('prompt').addEventListener(
  'input',
  autoSize
);

$('prompt').addEventListener(
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
      .classList.add('open');

    $('backdrop')
      .classList.add('open');
  };

$('backdrop').onclick =
  closeDrawer;

$('memoryBtn').onclick =
  openMemory;

$('closeMemory').onclick =
  () =>
    $('memoryModal')
      .classList.remove('open');

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

const SW = `
const CACHE='aetherai-v1';

self.addEventListener(
  'install',
  e => self.skipWaiting()
);

self.addEventListener(
  'activate',
  e => e.waitUntil(
    self.clients.claim()
  )
);

self.addEventListener(
  'fetch',
  e => {

    if(e.request.method !== 'GET'){
      return;
    }

    e.respondWith(
      fetch(e.request)
        .catch(
          () => caches.match(e.request)
        )
    );
  }
);
`;

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
 d="M64 24c-23 0-41 15-41 34 0 11 6 21 16 27l-5 18 18-10c4 1 8 2 12 2 23 0 41-15 41-34S87 24 64 24Z"
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

export default {

  async fetch(request, env){

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
      url.pathname === '/manifest.json'
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

      const {data} =
        await bodyJson(r);

      return json(
        data,
        r.status
      );
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
              message:'Invalid JSON'
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
