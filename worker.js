const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>AetherAI Studio</title>

<style>
:root{
  color-scheme:dark;
  --bg:#0b0d12;
  --panel:#11151d;
  --panel2:#171c25;
  --border:#28303c;
  --text:#edf2f7;
  --muted:#8e9aaa;
  --accent:#7c8cff;
  --accent2:#a978ff;
  --danger:#ff6b6b
}

*{box-sizing:border-box}

body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  height:100vh;
  overflow:hidden
}

button,input,select,textarea{font:inherit}
button{
  cursor:pointer;
  color:inherit;
  border:0
}

.app{
  height:100vh;
  display:flex
}

.sidebar{
  width:280px;
  background:#0d1016;
  border-right:1px solid var(--border);
  display:flex;
  flex-direction:column;
  flex-shrink:0
}

.brand{
  padding:20px 18px;
  font-weight:800;
  font-size:18px;
  border-bottom:1px solid var(--border)
}

.brand span{color:var(--accent)}

.newchat{
  margin:14px;
  padding:11px 13px;
  border:1px solid var(--border);
  background:var(--panel);
  border-radius:12px;
  text-align:left
}

.history{
  padding:0 10px 12px;
  overflow:auto
}

.history h4{
  font-size:11px;
  color:var(--muted);
  text-transform:uppercase;
  letter-spacing:.08em;
  padding:8px
}

.hist{
  padding:10px 12px;
  border-radius:10px;
  color:#cbd3df;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis
}

.hist:hover{background:var(--panel2)}

.main{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column
}

.topbar{
  height:62px;
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 16px;
  background:rgba(11,13,18,.9)
}

.menu{display:none}

.title{
  font-weight:700;
  min-width:0
}

.controls{
  margin-left:auto;
  display:flex;
  gap:8px;
  align-items:center
}

.select,.toggle,.iconbtn{
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:10px;
  padding:8px 10px
}

.select{
  max-width:260px;
  color:var(--text)
}

.toggle{font-size:12px}

.toggle.on{
  border-color:var(--accent);
  color:#cfd4ff
}

.iconbtn{
  width:38px;
  height:38px;
  padding:0
}

.chat{
  flex:1;
  overflow:auto
}

.messages{
  max-width:900px;
  margin:0 auto;
  padding:28px 20px 140px
}

.msg{
  display:flex;
  gap:12px;
  margin:0 0 24px
}

.avatar{
  width:34px;
  height:34px;
  border-radius:10px;
  display:grid;
  place-items:center;
  background:var(--panel2);
  flex-shrink:0;
  font-size:13px;
  font-weight:700
}

.msg.user .avatar{background:#242b3a}

.bubble{
  min-width:0;
  flex:1;
  line-height:1.65
}

.bubble p{margin:0 0 12px}
.bubble p:last-child{margin-bottom:0}

.bubble pre{
  overflow:auto;
  background:#090b0f;
  border:1px solid var(--border);
  padding:13px;
  border-radius:10px
}

.bubble code{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:.9em
}

.bubble :not(pre)>code{
  background:#1b202a;
  padding:2px 5px;
  border-radius:5px
}

.bubble a{color:#9da8ff}

.sources{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-top:12px
}

.source{
  border:1px solid var(--border);
  background:var(--panel);
  border-radius:9px;
  padding:7px 9px;
  color:#bfc7d5;
  text-decoration:none;
  font-size:12px
}

.typing{color:var(--muted)}

.composer-wrap{
  position:fixed;
  left:280px;
  right:0;
  bottom:0;
  padding:15px 20px 20px;
  background:linear-gradient(transparent,var(--bg) 28%)
}

.composer{
  max-width:900px;
  margin:auto;
  border:1px solid var(--border);
  background:#11151c;
  border-radius:16px;
  padding:10px
}

.attachments{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  padding:3px 3px 8px
}

.chip{
  font-size:12px;
  background:var(--panel2);
  border:1px solid var(--border);
  padding:6px 8px;
  border-radius:8px
}

.row{
  display:flex;
  gap:8px;
  align-items:end
}

.prompt{
  flex:1;
  resize:none;
  background:transparent;
  border:0;
  outline:0;
  color:var(--text);
  min-height:44px;
  max-height:180px;
  padding:9px
}

.send{
  background:var(--accent);
  color:white;
  border-radius:11px;
  padding:10px 15px;
  font-weight:700
}

.send.stop{background:#6d3941}

.bottom{
  display:flex;
  gap:7px;
  padding-top:7px
}

.small{
  font-size:12px;
  color:var(--muted)
}

.spacer{flex:1}

.overlay{
  display:none;
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.68);
  z-index:20;
  align-items:center;
  justify-content:center;
  padding:20px
}

.overlay.show{display:flex}

.modal{
  width:min(760px,100%);
  max-height:90vh;
  overflow:auto;
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:16px;
  padding:18px
}

.modal h3{margin-top:0}

.modal img{
  max-width:100%;
  display:block;
  border-radius:12px;
  margin:auto
}

.drop{
  border:1px dashed #455064;
  border-radius:12px;
  padding:18px;
  text-align:center;
  color:var(--muted)
}

@media(max-width:800px){
  .sidebar{
    position:fixed;
    z-index:30;
    top:0;
    bottom:0;
    left:-290px;
    transition:left .2s
  }

  .sidebar.open{left:0}

  .menu{display:block}

  .composer-wrap{left:0}

  .messages{
    padding-left:13px;
    padding-right:13px
  }

  .controls .select{max-width:150px}

  .toggle{display:none}
}
</style>
</head>

<body>

<div class="app">

<aside class="sidebar" id="sidebar">

  <div class="brand">
    Aether<span>AI</span> Studio
  </div>

  <button class="newchat" id="newChat">
    ＋ New chat
  </button>

  <div class="history">
    <h4>History</h4>
    <div id="history"></div>
  </div>

</aside>

<main class="main">

<header class="topbar">

  <button class="iconbtn menu" id="menuBtn">☰</button>

  <div class="title">AetherAI</div>

  <div class="controls">

    <select class="select" id="model">
      <option>Loading models...</option>
    </select>

    <button class="toggle" id="webBtn">
      Web search: Off
    </button>

    <button class="iconbtn" id="councilBtn" title="AI Council">
      ♟
    </button>

    <button class="iconbtn" id="imageBtn" title="Generate image">
      ▧
    </button>

  </div>

</header>

<section class="chat" id="chat">
  <div class="messages" id="messages"></div>
</section>

<div class="composer-wrap">

  <div class="composer">

    <div class="attachments" id="attachments"></div>

    <div class="row">

      <textarea
        class="prompt"
        id="prompt"
        placeholder="Message AetherAI..."
        rows="1"
      ></textarea>

      <button class="send" id="send">
        Send
      </button>

    </div>

    <div class="bottom">

      <button class="iconbtn" id="fileBtn" title="Attach file">
        ＋
      </button>

      <input
        id="fileInput"
        type="file"
        multiple
        hidden
      >

      <span class="small" id="status">
        Ready
      </span>

      <span class="spacer"></span>

      <span class="small">
        xKiro gateway
      </span>

    </div>

  </div>

</div>

</main>

</div>

<div class="overlay" id="modalOverlay">

  <div class="modal">

    <div style="display:flex;align-items:center;gap:10px">

      <h3 id="modalTitle" style="flex:1">
        Image generation
      </h3>

      <button class="iconbtn" id="closeModal">
        ×
      </button>

    </div>

    <div id="modalBody"></div>

  </div>

</div>

<script>

const $ = id => document.getElementById(id);

const state = {
  history: JSON.parse(localStorage.getItem("aether_history") || "[]"),
  messages: [],
  attachments: [],
  web: false,
  controller: null,
  models: []
};

const bt = String.fromCharCode(96);

function esc(s){
  return String(s ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function markdown(s){

  let v = esc(s);

  const fence = new RegExp(
    bt + bt + bt + "([\\s\\S]*?)" + bt + bt + bt,
    "g"
  );

  const inline = new RegExp(
    bt + "([^" + bt + "]+)" + bt,
    "g"
  );

  const stash = [];

  v = v.replace(
    fence,
    (m,c)=>{
      const i =
        stash.push(
          "<pre><code>" + c + "</code></pre>"
        ) - 1;

      return "___CODE_" + i + "___";
    }
  );

  v = v.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  v = v.replace(
    /\*(.+?)\*/g,
    "<em>$1</em>"
  );

  v = v.replace(
    inline,
    (m,c)=>"<code>" + c + "</code>"
  );

  v = v.replace(
    /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\\s\)\]\+\)$end:math:text$/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  v = v
    .replace(
      /(^|\n)### (.+)/g,
      "$1<h3>$2</h3>"
    )
    .replace(
      /(^|\n)## (.+)/g,
      "$1<h2>$2</h2>"
    )
    .replace(
      /(^|\n)# (.+)/g,
      "$1<h1>$2</h1>"
    );

  v = v.replace(
    /(^|\n)[-•] (.+)/g,
    "$1<li>$2</li>"
  );

  v = v
    .replace(/\n{2,}/g,"</p><p>")
    .replace(/\n/g,"<br>");

  v = "<p>" + v + "</p>";

  v = v
    .replace(/<p>(<h[1-3]>)/g,"$1")
    .replace(/(<\/h[1-3]>)<\/p>/g,"$1")
    .replace(/<p>(<pre>)/g,"$1")
    .replace(/(<\/pre>)<\/p>/g,"$1");

  v = v.replace(
    /(<li>.*?<\/li>)(?:<br>|<\/p>)/gs,
    "<ul>$1</ul>"
  );

  stash.forEach(
    (x,i)=>{
      v = v.replace(
        "___CODE_" + i + "___",
        x
      );
    }
  );

  return v;
}

function save(){
  localStorage.setItem(
    "aether_history",
    JSON.stringify(state.history.slice(-50))
  );
}

function renderHistory(){

  $("history").innerHTML = "";

  state.history
    .slice()
    .reverse()
    .forEach((h,i)=>{

      const d = document.createElement("div");

      d.className = "hist";

      d.textContent =
        h.title || "New chat";

      d.onclick = ()=>{
        loadHistory(
          state.history.length - 1 - i
        );
      };

      $("history").appendChild(d);

    });
}

function render(){

  $("messages").innerHTML = "";

  state.messages.forEach(m=>{

    const el =
      document.createElement("div");

    el.className =
      "msg " + m.role;

    el.innerHTML =
      '<div class="avatar">' +
      (m.role === "user" ? "U" : "A") +
      '</div>' +

      '<div class="bubble">' +

      markdown(m.content) +

      (
        m.sources?.length
        ?
        '<div class="sources">' +
        m.sources.map(x=>
          '<a class="source" target="_blank" href="' +
          esc(x.url) +
          '">' +
          esc(x.title || x.url) +
          '</a>'
        ).join("") +
        "</div>"
        :
        ""
      ) +

      "</div>";

    $("messages").appendChild(el);

  });

  $("chat").scrollTop =
    $("chat").scrollHeight;
}

function newChat(){

  if(state.messages.length){

    state.history.push({
      title:
        (
          state.messages.find(
            x=>x.role === "user"
          )?.content ||
          "New chat"
        ).slice(0,60),

      messages: state.messages
    });

    save();
  }

  state.messages = [];
  state.attachments = [];

  renderAttachments();
  render();
  renderHistory();
}

function loadHistory(i){

  const h = state.history[i];

  if(h){

    state.messages =
      h.messages || [];

    render();
  }
}

async function loadModels(){

  $("model").innerHTML =
    "<option>Loading models...</option>";

  try{

    const r =
      await fetch("/api/models");

    const d =
      await r.json();

    state.models =
      d.models || [];

    $("model").innerHTML = "";

    state.models.forEach(m=>{

      const o =
        document.createElement("option");

      o.value = m.id;

      o.textContent =
        m.id +
        (
          m.access_tier === "free"
          ? " · free"
          : ""
        );

      $("model").appendChild(o);

    });

    if(!state.models.length){

      $("model").innerHTML =
        '<option value="">No models</option>';

    }

  }catch(e){

    $("model").innerHTML =
      '<option value="">Model load failed</option>';

  }
}

function renderAttachments(){

  $("attachments").innerHTML =
    state.attachments.map(
      (f,i)=>
        '<span class="chip">' +
        esc(f.name) +
        ' <button data-i="' +
        i +
        '">×</button></span>'
    ).join("");

  $("attachments")
    .querySelectorAll("button")
    .forEach(b=>{

      b.onclick = ()=>{

        state.attachments.splice(
          +b.dataset.i,
          1
        );

        renderAttachments();

      };

    });
}

async function fileToPart(file){

  return new Promise(
    (resolve,reject)=>{

      const rd =
        new FileReader();

      rd.onload = ()=>{

        resolve({
          name:file.name,
          type:file.type,
          size:file.size,
          data:String(rd.result)
        });

      };

      rd.onerror = reject;

      rd.readAsDataURL(file);

    }
  );
}

async function send(){

  const text =
    $("prompt").value.trim();

  if(
    !text &&
    state.attachments.length === 0
  ) return;

  if(state.controller){

    state.controller.abort();
    return;
  }

  const parts = [];

  if(text)
    parts.push({
      type:"text",
      text
    });

  for(
    const file of state.attachments
  ){

    try{

      const p =
        await fileToPart(file);

      if(
        file.type.startsWith("image/")
      ){

        parts.push({
          type:"image_url",
          image_url:{
            url:p.data
          }
        });

      }else{

        parts.push({
          type:"text",
          text:
            "\n\n[Attached file: " +
            p.name +
            "]\n" +
            p.data
        });

      }

    }catch(e){}

  }

  state.messages.push({
    role:"user",
    content:
      text ||
      "[Attached files]"
  });

  const assistant = {
    role:"assistant",
    content:"",
    sources:[]
  };

  state.messages.push(assistant);

  $("prompt").value = "";

  state.attachments = [];

  renderAttachments();
  render();

  $("status").textContent =
    "Thinking...";

  $("send").textContent =
    "Stop";

  $("send").classList.add("stop");

  state.controller =
    new AbortController();

  try{

    const r =
      await fetch(
        "/api/chat",
        {
          method:"POST",

          headers:{
            "content-type":
              "application/json"
          },

          body:JSON.stringify({

            model:$("model").value,

            messages:
              state.messages
                .slice(0,-1)
                .map((m,i)=>{

                  if(
                    i ===
                    state.messages.length - 2
                  ){

                    return {
                      role:"user",
                      content:parts
                    };

                  }

                  return {
                    role:m.role,
                    content:m.content
                  };

                }),

            web_search:{
              enable:state.web,
              count:5
            }

          }),

          signal:
            state.controller.signal
        }
      );

    if(!r.ok){

      throw new Error(
        (await r.text()) ||
        ("HTTP " + r.status)
      );

    }

    if(!r.body){

      assistant.content =
        await r.text();

      render();

      return;
    }

    const reader =
      r.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    while(true){

      const x =
        await reader.read();

      if(x.done) break;

      buffer +=
        decoder.decode(
          x.value,
          {stream:true}
        );

      const chunks =
        buffer.split("\n\n");

      buffer =
        chunks.pop() || "";

      for(
        const event of chunks
      ){

        let data = "";

        event
          .split("\n")
          .forEach(line=>{

            if(
              line.startsWith("data:")
            ){

              data +=
                line
                  .slice(5)
                  .trim();

            }

          });

        if(!data) continue;

        if(data === "[DONE]")
          continue;

        try{

          const j =
            JSON.parse(data);

          if(j.delta)
            assistant.content +=
              j.delta;

          if(j.sources)
            assistant.sources =
              j.sources;

        }catch{

          if(data)
            assistant.content +=
              data;

        }

        render();
      }
    }

  }catch(e){

    if(e.name !== "AbortError"){

      assistant.content =
        "Error: " + e.message;

      render();

    }

  }finally{

    state.controller = null;

    $("send").textContent =
      "Send";

    $("send")
      .classList.remove("stop");

    $("status").textContent =
      "Ready";

    if(state.messages.length)
      renderHistory();

  }
}

async function council(){

  const text =
    $("prompt").value.trim();

  if(!text) return;

  state.messages.push({
    role:"user",
    content:text
  });

  state.messages.push({
    role:"assistant",
    content:"Running AI Council...",
    sources:[]
  });

  render();

  $("prompt").value = "";

  try{

    const r =
      await fetch(
        "/api/council",
        {
          method:"POST",

          headers:{
            "content-type":
              "application/json"
          },

          body:JSON.stringify({
            prompt:text,
            web_search:state.web
          })
        }
      );

    const d =
      await r.json();

    state.messages[
      state.messages.length - 1
    ].content =
      d.answer ||
      d.error ||
      "No council result.";

    render();

  }catch(e){

    state.messages[
      state.messages.length - 1
    ].content =
      "Council error: " +
      e.message;

    render();

  }
}

async function generateImage(){

  $("modalTitle").textContent =
    "Image generation";

  $("modalBody").innerHTML =
    '<div class="drop">Generating image...</div>';

  $("modalOverlay")
    .classList.add("show");

  const prompt =
    $("prompt").value.trim() ||
    state.messages
      .filter(x=>x.role==="user")
      .at(-1)?.content ||
    "";

  if(!prompt){

    $("modalBody").textContent =
      "Enter an image prompt first.";

    return;
  }

  try{

    const r =
      await fetch(
        "/api/image",
        {
          method:"POST",

          headers:{
            "content-type":
              "application/json"
          },

          body:JSON.stringify({
            prompt
          })
        }
      );

    const d =
      await r.json();

    if(!r.ok)
      throw new Error(
        d.error ||
        "Image request failed"
      );

    if(d.url){

      $("modalBody").innerHTML =
        '<img src="' +
        esc(d.url) +
        '" alt="Generated image">';

      return;
    }

    if(!d.id)
      throw new Error(
        "No image job id returned"
      );

    pollImage(d.id);

  }catch(e){

    $("modalBody").textContent =
      e.message;

  }
}

async function pollImage(id){

  for(let i=0;i<150;i++){

    await new Promise(
      r=>setTimeout(r,2000)
    );

    try{

      const r =
        await fetch(
          "/api/image/status?id=" +
          encodeURIComponent(id)
        );

      const d =
        await r.json();

      if(
        d.status === "succeeded" &&
        d.url
      ){

        $("modalBody").innerHTML =
          '<img src="' +
          esc(d.url) +
          '" alt="Generated image">';

        return;
      }

      if(
        d.status === "failed" ||
        d.status === "blocked"
      ){

        throw new Error(
          d.error ||
          d.status
        );

      }

    }catch(e){

      $("modalBody").textContent =
        e.message;

      return;

    }
  }

  $("modalBody").textContent =
    "Image generation timed out.";
}

$("send").onclick = send;

$("newChat").onclick =
  newChat;

$("councilBtn").onclick =
  council;

$("imageBtn").onclick =
  generateImage;

$("webBtn").onclick = ()=>{

  state.web =
    !state.web;

  $("webBtn").textContent =
    "Web search: " +
    (state.web ? "On" : "Off");

  $("webBtn")
    .classList.toggle(
      "on",
      state.web
    );
};

$("fileBtn").onclick =
  ()=>$("fileInput").click();

$("fileInput").onchange = ()=>{

  state.attachments.push(
    ...Array.from(
      $("fileInput").files
    )
  );

  $("fileInput").value = "";

  renderAttachments();
};

$("closeModal").onclick =
  ()=>$("modalOverlay")
    .classList.remove("show");

$("menuBtn").onclick =
  ()=>$("sidebar")
    .classList.toggle("open");

$("prompt").addEventListener(
  "keydown",
  e=>{

    if(
      e.key === "Enter" &&
      !e.shiftKey
    ){

      e.preventDefault();

      send();

    }

  }
);

$("prompt").addEventListener(
  "input",
  e=>{

    e.target.style.height =
      "auto";

    e.target.style.height =
      Math.min(
        e.target.scrollHeight,
        180
      ) + "px";

  }
);

renderHistory();
render();
loadModels();

</script>

</body>
</html>`;

const JSON_HEADERS = {
  "content-type":
    "application/json; charset=utf-8",

  "access-control-allow-origin":"*",

  "access-control-allow-headers":
    "Content-Type, Authorization",

  "access-control-allow-methods":
    "GET,POST,OPTIONS"
};

function json(
  data,
  status=200,
  extra={}
){

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers:{
        ...JSON_HEADERS,
        ...extra
      }
    }
  );
}

function base(env){

  return (
    env.XKIRO_BASE_URL ||
    "https://api.xkiro.com/v1"
  ).replace(/\/$/,"");
}

function key(env){

  return env.XKIRO_API_KEY || "";
}

async function xfetch(
  env,
  path,
  opts={}
){

  const headers =
    new Headers(
      opts.headers || {}
    );

  headers.set(
    "authorization",
    "Bearer " + key(env)
  );

  headers.set(
    "content-type",
    headers.get(
      "content-type"
    ) || "application/json"
  );

  return fetch(
    base(env) + path,
    {
      ...opts,
      headers
    }
  );
}

async function publicModels(
  env,
  modality
){

  const q =
    modality === "image"
      ? "?modality=image"
      : "";

  const r =
    await fetch(
      base(env) +
      "/models" +
      q
    );

  if(!r.ok){

    throw new Error(
      "xKiro model catalog HTTP " +
      r.status
    );
  }

  return r.json();
}

function freeModels(data){

  return (
    data?.data || []
  ).filter(
    m =>
      m.access_tier === "free"
  );
}

async function listChatModels(env){

  const d =
    await publicModels(env);

  return freeModels(d);
}

async function listImageModels(env){

  const d =
    await publicModels(
      env,
      "image"
    );

  return freeModels(d);
}

function extractText(obj){

  if(!obj)
    return "";

  const c =
    obj.choices?.[0]
      ?.message
      ?.content;

  if(typeof c === "string")
    return c;

  if(Array.isArray(c)){

    return c
      .map(x=>x.text || "")
      .join("");

  }

  return (
    obj.output_text ||
    obj.text ||
    ""
  );
}

function sourceList(obj){

  return (
    obj?.sources ||
    obj?.web_search?.sources ||
    obj?.citations ||
    []
  );
}

async function chat(
  env,
  body
){

  if(!key(env)){

    return json(
      {
        error:
          "XKIRO_API_KEY is not configured on the Worker."
      },
      500
    );
  }

  const messages =
    Array.isArray(body.messages)
      ? body.messages
      : [];

  if(!messages.length){

    return json(
      {
        error:
          "messages is required"
      },
      400
    );
  }

  const payload = {
    model:body.model,
    messages,
    stream:true
  };

  if(body.temperature != null)
    payload.temperature =
      body.temperature;

  if(body.max_tokens != null)
    payload.max_tokens =
      body.max_tokens;

  if(
    body.web_search?.enable
  ){

    payload.web_search = {
      enable:true,
      count:Math.min(
        Number(
          body.web_search.count
        ) || 5,
        10
      )
    };

  }

  const r =
    await xfetch(
      env,
      "/chat/completions",
      {
        method:"POST",

        body:
          JSON.stringify(
            payload
          )
      }
    );

  if(!r.ok){

    const t =
      await r.text();

    return new Response(
      t,
      {
        status:r.status,
        headers:{
          ...JSON_HEADERS
        }
      }
    );
  }

  return new Response(
    r.body,
    {
      status:200,

      headers:{
        "content-type":
          "text/event-stream; charset=utf-8",

        "cache-control":
          "no-cache, no-transform",

        "connection":
          "keep-alive",

        "access-control-allow-origin":
          "*"
      }
    }
  );
}

async function council(
  env,
  body
){

  const prompt =
    String(
      body.prompt || ""
    ).trim();

  if(!prompt){

    return json(
      {
        error:
          "prompt is required"
      },
      400
    );
  }

  const models =
    (
      await listChatModels(env)
    ).slice(0,3);

  if(!models.length){

    return json(
      {
        error:
          "No free chat models are currently listed by xKiro."
      },
      503
    );
  }

  const answers = [];

  for(
    const m of models
  ){

    const requestBody = {
      model:m.id,

      messages:[
        {
          role:"system",

          content:
            "Answer independently and concisely. You are one member of an AI council."
        },

        {
          role:"user",
          content:prompt
        }
      ],

      stream:false
    };

    if(body.web_search){

      requestBody.web_search = {
        enable:true,
        count:5
      };

    }

    const r =
      await xfetch(
        env,
        "/chat/completions",
        {
          method:"POST",

          body:
            JSON.stringify(
              requestBody
            )
        }
      );

    if(r.ok){

      const d =
        await r.json();

      answers.push({
        model:m.id,
        answer:extractText(d),
        sources:sourceList(d)
      });

    }

  }

  if(!answers.length){

    return json(
      {
        error:
          "Council models returned no successful answers."
      },
      502
    );
  }

  const synthesis =
    await xfetch(
      env,
      "/chat/completions",
      {
        method:"POST",

        body:
          JSON.stringify({

            model:
              answers[0].model,

            messages:[
              {
                role:"system",

                content:
                  "Synthesize the council answers into one accurate response. Do not mention internal orchestration unless useful."
              },

              {
                role:"user",

                content:
                  JSON.stringify({
                    question:prompt,
                    answers
                  })
              }
            ],

            stream:false
          })
      }
    );

  if(!synthesis.ok){

    return json(
      {
        answer:
          answers
            .map(
              a =>
                "## " +
                a.model +
                "\n" +
                a.answer
            )
            .join(
              "\n\n---\n\n"
            ),

        answers
      },
      200
    );
  }

  const sd =
    await synthesis.json();

  return json(
    {
      answer:
        extractText(sd),

      answers,

      sources:
        sourceList(sd)
    },
    200
  );
}

async function imageCreate(
  env,
  body
){

  if(!key(env)){

    return json(
      {
        error:
          "XKIRO_API_KEY is not configured on the Worker."
      },
      500
    );
  }

  const prompt =
    String(
      body.prompt || ""
    ).trim();

  if(!prompt){

    return json(
      {
        error:
          "prompt is required"
      },
      400
    );
  }

  let model =
    body.model;

  if(!model){

    const ims =
      await listImageModels(
        env
      );

    model =
      ims[0]?.id;
  }

  if(!model){

    return json(
      {
        error:
          "No free image model is currently available."
      },
      503
    );
  }

  const r =
    await xfetch(
      env,
      "/images/generations",
      {
        method:"POST",

        body:
          JSON.stringify({
            model,
            prompt
          })
      }
    );

  const text =
    await r.text();

  let d;

  try{

    d =
      JSON.parse(text);

  }catch{

    d = {
      error:text
    };

  }

  if(!r.ok)
    return json(
      d,
      r.status
    );

  return json(
    d,
    200
  );
}

async function imageStatus(
  env,
  id
){

  if(!key(env)){

    return json(
      {
        error:
          "XKIRO_API_KEY is not configured on the Worker."
      },
      500
    );
  }

  if(!id){

    return json(
      {
        error:
          "id is required"
      },
      400
    );
  }

  const r =
    await xfetch(
      env,
      "/images/generations/" +
      encodeURIComponent(id),
      {
        method:"GET"
      }
    );

  const text =
    await r.text();

  let d;

  try{

    d =
      JSON.parse(text);

  }catch{

    d = {
      error:text
    };

  }

  return json(
    d,
    r.status
  );
}

export default {

  async fetch(
    request,
    env
  ){

    const url =
      new URL(
        request.url
      );

    if(
      request.method ===
      "OPTIONS"
    ){

      return new Response(
        null,
        {
          status:204,
          headers:JSON_HEADERS
        }
      );

    }

    try{

      if(
        url.pathname === "/" ||
        url.pathname === "/index.html"
      ){

        return new Response(
          HTML,
          {
            headers:{
              "content-type":
                "text/html; charset=utf-8",

              "cache-control":
                "no-store"
            }
          }
        );

      }

      if(
        url.pathname ===
        "/api/health"
      ){

        return json({
          ok:true,
          worker:"my-ai",
          xkiro_base:
            base(env),
          has_key:
            !!key(env),
          time:
            new Date()
              .toISOString()
        });

      }

      if(
        url.pathname ===
        "/api/models" &&
        request.method === "GET"
      ){

        const models =
          await listChatModels(
            env
          );

        return json({
          models,

          source:
            "xKiro /v1/models",

          free_only:true
        });

      }

      if(
        url.pathname ===
        "/api/image-models" &&
        request.method === "GET"
      ){

        const models =
          await listImageModels(
            env
          );

        return json({
          models,

          source:
            "xKiro /v1/models?modality=image",

          free_only:true
        });

      }

      if(
        url.pathname ===
        "/api/chat" &&
        request.method === "POST"
      ){

        return chat(
          env,
          await request.json()
        );

      }

      if(
        url.pathname ===
        "/api/council" &&
        request.method === "POST"
      ){

        return council(
          env,
          await request.json()
        );

      }

      if(
        url.pathname ===
        "/api/image" &&
        request.method === "POST"
      ){

        return imageCreate(
          env,
          await request.json()
        );

      }

      if(
        url.pathname ===
        "/api/image/status" &&
        request.method === "GET"
      ){

        return imageStatus(
          env,
          url.searchParams.get("id")
        );

      }

      return json(
        {
          error:
            "Not found"
        },
        404
      );

    }catch(e){

      return json(
        {
          error:
            e?.message ||
            String(e)
        },
        500
      );

    }

  }

};
