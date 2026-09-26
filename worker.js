const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b0d">
<title>Aether AI</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b0b0d;color:#f5f5f5}
body{overflow:hidden}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
button:disabled{cursor:not-allowed;opacity:.5}

:root{
  --bg:#0b0b0d;
  --panel:#111114;
  --panel2:#17171b;
  --panel3:#1d1d22;
  --border:#29292f;
  --muted:#85858d;
  --text:#f4f4f5;
  --accent:#f4f4f5;
  --danger:#ff7777;
}

.app{display:flex;width:100%;height:100dvh;background:var(--bg)}

.sidebar{
  width:278px;
  flex:none;
  background:#111113;
  border-right:1px solid #242428;
  display:flex;
  flex-direction:column;
  height:100%;
  z-index:40
}

.side-top{padding:16px}

.brand{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:750;
  font-size:18px;
  margin-bottom:16px
}

.brand-icon{
  width:35px;
  height:35px;
  border-radius:10px;
  background:#f4f4f5;
  color:#111;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900
}

.new-chat{
  width:100%;
  border:1px solid #303036;
  background:#19191d;
  color:#fff;
  padding:11px 13px;
  border-radius:10px;
  text-align:left
}

.new-chat:hover{background:#222228}

.history{
  flex:1;
  overflow:auto;
  padding:8px
}

.history-title{
  font-size:11px;
  color:#777780;
  padding:8px 10px;
  text-transform:uppercase;
  letter-spacing:.08em
}

.history-item{
  padding:10px;
  border-radius:9px;
  color:#d8d8dc;
  font-size:13px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  margin-bottom:2px
}

.history-item:hover{background:#1d1d21}

.history-empty{
  color:#66666e;
  font-size:12px;
  padding:10px
}

.side-bottom{
  padding:12px;
  border-top:1px solid #242428;
  color:#777780;
  font-size:11px
}

.main{
  flex:1;
  min-width:0;
  height:100%;
  display:flex;
  flex-direction:column
}

.topbar{
  height:62px;
  flex:none;
  border-bottom:1px solid #242428;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 16px;
  background:#0e0e10;
  z-index:10
}

.menu-btn{
  display:none;
  width:38px;
  height:38px;
  border:0;
  background:transparent;
  color:#ddd;
  align-items:center;
  justify-content:center;
  font-size:22px
}

.model-wrap{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0
}

.model-select{
  max-width:360px;
  background:#17171a;
  border:1px solid #303036;
  color:#eee;
  padding:8px 10px;
  border-radius:9px;
  outline:none
}

.status{
  font-size:11px;
  color:#777780;
  white-space:nowrap
}

.top-actions{
  margin-left:auto;
  display:flex;
  gap:7px;
  align-items:center
}

.top-btn{
  border:1px solid #303036;
  background:#18181c;
  color:#ddd;
  padding:8px 11px;
  border-radius:9px;
  font-size:12px
}

.top-btn:hover{background:#222228}

.top-btn.active{
  background:#292932;
  border-color:#62626c
}

.chat{
  flex:1;
  overflow:auto;
  scroll-behavior:smooth;
  position:relative
}

.empty{
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:30px;
  text-align:center
}

.empty-inner{max-width:720px}

.empty-logo{
  width:54px;
  height:54px;
  margin:0 auto 18px;
  border-radius:16px;
  background:#f4f4f5;
  color:#111;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
  font-weight:900
}

.empty h1{
  font-size:34px;
  margin:0 0 10px;
  letter-spacing:-.03em
}

.empty p{
  color:#85858d;
  margin:0;
  line-height:1.6
}

.quick-actions{
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  gap:8px;
  margin-top:22px
}

.quick{
  border:1px solid #303036;
  background:#151518;
  color:#cfcfd3;
  border-radius:10px;
  padding:9px 12px;
  font-size:12px
}

.quick:hover{background:#202025}

.messages{
  max-width:940px;
  margin:0 auto;
  padding:30px 20px 180px
}

.msg{
  display:flex;
  gap:13px;
  margin:24px 0
}

.avatar{
  width:34px;
  height:34px;
  flex:none;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:800
}

.msg.user .avatar{
  background:#34343a
}

.msg.assistant .avatar{
  background:#f4f4f5;
  color:#111
}

.msg-body{
  min-width:0;
  flex:1;
  line-height:1.68;
  font-size:15px;
  overflow-wrap:anywhere
}

.msg.user .msg-body{
  white-space:pre-wrap
}

.msg-body p{
  margin:0 0 12px
}

.msg-body p:last-child{margin-bottom:0}

.msg-body h1,
.msg-body h2,
.msg-body h3{
  line-height:1.3;
  margin:20px 0 10px
}

.msg-body h1{font-size:25px}
.msg-body h2{font-size:21px}
.msg-body h3{font-size:17px}

.msg-body pre{
  background:#101013;
  border:1px solid #29292e;
  border-radius:10px;
  padding:14px;
  overflow:auto;
  position:relative;
  margin:12px 0
}

.msg-body pre code{
  background:none;
  padding:0;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:13px;
  line-height:1.55
}

.msg-body code{
  background:#1b1b1f;
  border-radius:5px;
  padding:2px 5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:.9em
}

.msg-body ul,
.msg-body ol{
  padding-left:25px
}

.msg-body blockquote{
  border-left:3px solid #555;
  padding-left:14px;
  color:#b7b7bd;
  margin-left:0
}

.msg-body a{
  color:#d8d8dc;
  text-decoration:underline
}

.typing{
  color:#8b8b93
}

.error{
  color:#ff8c8c
}

.message-tools{
  display:flex;
  gap:5px;
  margin-top:9px;
  opacity:.75
}

.message-tool{
  border:1px solid #29292e;
  background:#151518;
  color:#9999a1;
  border-radius:7px;
  padding:4px 7px;
  font-size:10px
}

.message-tool:hover{
  color:#eee;
  background:#202024
}

.sources{
  margin-top:13px;
  border:1px solid #29292e;
  background:#131316;
  border-radius:11px;
  overflow:hidden
}

.sources-head{
  padding:9px 11px;
  color:#9999a1;
  font-size:11px;
  border-bottom:1px solid #29292e
}

.source{
  display:block;
  padding:9px 11px;
  color:#d6d6da;
  text-decoration:none;
  border-bottom:1px solid #222226
}

.source:last-child{border-bottom:0}

.source:hover{background:#1b1b20}

.source-title{
  font-size:12px;
  font-weight:600
}

.source-domain{
  font-size:10px;
  color:#777780;
  margin-top:3px
}

.attachments{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  margin-top:10px
}

.attachment{
  border:1px solid #303036;
  background:#17171a;
  border-radius:9px;
  padding:7px 9px;
  font-size:11px;
  color:#bdbdc3
}

.image-result{
  margin-top:12px;
  border-radius:14px;
  overflow:hidden;
  border:1px solid #2c2c31;
  max-width:760px;
  background:#111114
}

.image-result img{
  display:block;
  width:100%;
  height:auto
}

.image-link{
  display:block;
  padding:10px;
  background:#151519;
  color:#ddd;
  text-decoration:none;
  font-size:12px
}

.council-panel{
  margin:3px 0;
  padding:14px;
  border:1px solid #303036;
  border-radius:12px;
  background:#141417
}

.council-head{
  font-weight:700;
  margin-bottom:10px
}

.council-model{
  padding:9px 0;
  border-bottom:1px solid #252529;
  font-size:12px
}

.council-model:last-child{border-bottom:0}

.council-status{
  color:#85858d;
  font-size:12px
}

.composer-wrap{
  position:fixed;
  left:278px;
  right:0;
  bottom:0;
  padding:14px 18px 17px;
  background:linear-gradient(transparent,#0b0b0d 28%)
}

.composer{
  max-width:940px;
  margin:auto;
  background:#17171a;
  border:1px solid #303036;
  border-radius:17px;
  padding:10px;
  box-shadow:0 -10px 40px rgba(0,0,0,.14)
}

.input-row{
  display:flex;
  align-items:flex-end;
  gap:7px
}

textarea{
  flex:1;
  resize:none;
  background:transparent;
  border:0;
  outline:none;
  color:#fff;
  min-height:46px;
  max-height:180px;
  padding:10px;
  font-size:15px;
  line-height:1.5
}

textarea::placeholder{color:#707078}

.icon-btn,
.send-btn{
  width:40px;
  height:40px;
  flex:none;
  border-radius:10px;
  border:1px solid #303036;
  background:#202025;
  color:#ddd;
  display:flex;
  align-items:center;
  justify-content:center
}

.send-btn{
  background:#f4f4f5;
  color:#111;
  border-color:#f4f4f5
}

.send-btn.stop{
  background:#29292f;
  border-color:#39393f;
  color:#fff
}

.file-input{display:none}

.attach-preview{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  padding:4px 8px 8px
}

.preview{
  background:#202024;
  border:1px solid #303036;
  border-radius:8px;
  padding:6px 8px;
  font-size:11px;
  color:#bbb
}

.preview button{
  background:none;
  border:0;
  color:#888;
  margin-left:4px
}

.note{
  font-size:10px;
  color:#68686f;
  text-align:center;
  margin-top:7px
}

.drawer-overlay{
  display:none;
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  z-index:30
}

.toast{
  position:fixed;
  left:50%;
  bottom:100px;
  transform:translateX(-50%) translateY(10px);
  background:#25252a;
  color:#eee;
  border:1px solid #3a3a40;
  border-radius:10px;
  padding:9px 13px;
  font-size:12px;
  opacity:0;
  pointer-events:none;
  transition:.2s;
  z-index:100
}

.toast.show{
  opacity:1;
  transform:translateX(-50%) translateY(0)
}

@media(max-width:760px){
  .sidebar{
    position:fixed;
    left:-292px;
    top:0;
    bottom:0;
    transition:left .2s ease;
    box-shadow:10px 0 30px rgba(0,0,0,.3)
  }

  .sidebar.open{left:0}
  .drawer-overlay.open{display:block}

  .menu-btn{display:flex}

  .topbar{
    padding:0 9px;
    height:58px
  }

  .model-select{
    max-width:165px;
    min-width:0
  }

  .status{display:none}

  .top-actions{gap:5px}

  .top-btn{
    padding:8px 8px;
    font-size:11px
  }

  .composer-wrap{
    left:0;
    padding:8px 8px 10px
  }

  .messages{
    padding:20px 12px 160px
  }

  .empty h1{font-size:28px}

  .msg{gap:9px}

  .avatar{
    width:30px;
    height:30px;
    border-radius:8px
  }

  .msg-body{font-size:14px}

  .quick-actions{
    flex-direction:column;
    max-width:260px;
    margin-left:auto;
    margin-right:auto
  }

  .quick{width:100%}
}

@media(prefers-reduced-motion:reduce){
  *{scroll-behavior:auto!important;transition:none!important}
}
</style>
</head>

<body>
<div class="app">

<aside class="sidebar" id="sidebar">
  <div class="side-top">
    <div class="brand">
      <div class="brand-icon">A</div>
      <span>Aether AI</span>
    </div>

    <button class="new-chat" id="newChat">＋ New chat</button>
  </div>

  <div class="history" id="history"></div>

  <div class="side-bottom">
    <div>Free xKiro models</div>
    <div style="margin-top:4px">Live catalog · Web search</div>
  </div>
</aside>

<div class="drawer-overlay" id="overlay"></div>

<main class="main">

<header class="topbar">
  <button class="menu-btn" id="menuBtn">☰</button>

  <div class="model-wrap">
    <select class="model-select" id="modelSelect">
      <option>Loading free models...</option>
    </select>
    <span class="status" id="status">Connecting...</span>
  </div>

  <div class="top-actions">
    <button class="top-btn" id="councilBtn">AI Council</button>
    <button class="top-btn" id="healthBtn">Status</button>
  </div>
</header>

<section class="chat" id="chat">

  <div class="empty" id="empty">
    <div class="empty-inner">
      <div class="empty-logo">A</div>
      <h1>How can I help?</h1>
      <p>Free xKiro models · automatic web research · image generation · files · AI Council</p>

      <div class="quick-actions">
        <button class="quick" data-prompt="Explain quantum computing simply.">Explain something</button>
        <button class="quick" data-prompt="Research the latest important developments in AI and summarize them.">Research a topic</button>
        <button class="quick" data-prompt="Help me analyze this problem step by step.">Analyze a problem</button>
        <button class="quick" data-prompt="Create an image of a futuristic city at night.">Generate an image</button>
      </div>
    </div>
  </div>

  <div class="messages" id="messages"></div>
</section>

<div class="composer-wrap">
  <div class="composer">

    <div class="attach-preview" id="attachPreview"></div>

    <div class="input-row">

      <input
        class="file-input"
        id="fileInput"
        type="file"
        multiple
        accept="image/*,.txt,.md,.json,.js,.jsx,.ts,.tsx,.html,.css,.py,.java,.c,.cpp,.h,.hpp,.rs,.go,.php,.rb,.swift,.kt,.xml,.yaml,.yml,.csv"
      >

      <button class="icon-btn" id="fileBtn" title="Attach files">＋</button>

      <textarea
        id="prompt"
        rows="1"
        placeholder="Message Aether AI..."
      ></textarea>

      <button class="send-btn" id="sendBtn" title="Send">↑</button>

    </div>

    <div class="note">
      Web research is automatic. Ask for an image and Aether AI will use a free image model automatically.
    </div>

  </div>
</div>

</main>
</div>

<div class="toast" id="toast"></div>

<script>
(function(){
"use strict";

var state={
  models:[],
  imageModels:null,
  selectedModel:"",
  messages:[],
  attachments:[],
  council:false,
  busy:false,
  controller:null,
  chatId:null,
  lastSources:[]
};

var el={
  sidebar:document.getElementById("sidebar"),
  overlay:document.getElementById("overlay"),
  menuBtn:document.getElementById("menuBtn"),
  newChat:document.getElementById("newChat"),
  history:document.getElementById("history"),
  modelSelect:document.getElementById("modelSelect"),
  status:document.getElementById("status"),
  councilBtn:document.getElementById("councilBtn"),
  healthBtn:document.getElementById("healthBtn"),
  chat:document.getElementById("chat"),
  empty:document.getElementById("empty"),
  messages:document.getElementById("messages"),
  prompt:document.getElementById("prompt"),
  sendBtn:document.getElementById("sendBtn"),
  fileBtn:document.getElementById("fileBtn"),
  fileInput:document.getElementById("fileInput"),
  attachPreview:document.getElementById("attachPreview"),
  toast:document.getElementById("toast")
};

function escapeHtml(value){
  return String(value==null?"":value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function sleep(ms){
  return new Promise(function(resolve){
    setTimeout(resolve,ms);
  });
}

function showToast(text){
  el.toast.textContent=text;
  el.toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer=setTimeout(function(){
    el.toast.classList.remove("show");
  },2600);
}

function errorText(data,status){
  if(!data){
    return "Request failed ("+status+")";
  }

  if(typeof data==="string"){
    return data;
  }

  if(data.error){
    if(typeof data.error==="string"){
      return data.error;
    }

    if(data.error.message){
      return String(data.error.message);
    }

    if(data.error.code){
      return String(data.error.code);
    }
  }

  if(data.message){
    return String(data.message);
  }

  try{
    return JSON.stringify(data);
  }catch(e){
    return "Request failed ("+status+")";
  }
}

async function apiJson(url,options){
  var response;

  try{
    response=await fetch(url,options||{});
  }catch(error){
    if(error.name==="AbortError"){
      throw new Error("Request cancelled.");
    }

    throw new Error("Network error: "+error.message);
  }

  var text=await response.text();
  var data={};

  try{
    data=text?JSON.parse(text):{};
  }catch(e){
    if(!response.ok){
      throw new Error(text||("Request failed ("+response.status+")"));
    }

    return {};
  }

  if(!response.ok){
    throw new Error(errorText(data,response.status));
  }

  return data;
}

function capabilityScore(model){
  var caps=model && model.capabilities || {};
  var score=0;

  if(caps.reasoning) score+=45;
  if(caps.vision) score+=22;
  if(caps.tools) score+=13;

  var context=Number(model.context_length||0);
  var output=Number(model.max_output_tokens||0);

  score+=Math.min(context/10000,30);
  score+=Math.min(output/5000,20);

  var id=String(model.id||"").toLowerCase();

  if(id.indexOf("reason")>=0) score+=5;
  if(id.indexOf("thinking")>=0) score+=5;

  return score;
}

function modelLabel(model){
  return String(
    model.display_name||
    model.name||
    model.id||
    "Unknown model"
  );
}

function modelSupportsVision(model){
  return !!(
    model &&
    model.capabilities &&
    model.capabilities.vision
  );
}

async function loadModels(){
  el.status.textContent="Loading free models...";

  try{
    var data=await apiJson("/api/models");

    state.models=Array.isArray(data.models)
      ? data.models
      : [];

    if(!state.models.length){
      throw new Error("No free chat models are currently available.");
    }

    state.models.sort(function(a,b){
      return capabilityScore(b)-capabilityScore(a);
    });

    state.selectedModel=state.models[0].id;

    el.modelSelect.innerHTML="";

    state.models.forEach(function(model){
      var option=document.createElement("option");

      option.value=model.id;
      option.textContent=modelLabel(model);

      el.modelSelect.appendChild(option);
    });

    el.modelSelect.value=state.selectedModel;

    el.status.textContent=
      state.models.length+
      " free model"+
      (state.models.length===1?"":"s");

  }catch(error){
    el.status.textContent="Model loading failed";
    el.modelSelect.innerHTML=
      "<option>Models unavailable</option>";

    showSystemError(error.message);
  }
}

async function refreshModels(){
  await loadModels();
  showToast("Model catalog refreshed.");
}

function closeDrawer(){
  el.sidebar.classList.remove("open");
  el.overlay.classList.remove("open");
}

function openDrawer(){
  el.sidebar.classList.add("open");
  el.overlay.classList.add("open");
}

function markdownToHtml(text){
  var value=String(text==null?"":text);

  var fence=String.fromCharCode(96)+
    String.fromCharCode(96)+
    String.fromCharCode(96);

  var lines=value.split("\n");
  var html="";
  var inCode=false;
  var codeBuffer=[];

  function inlineMarkdown(s){
    var v=escapeHtml(s);

    v=v.replace(
      /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\\s\)\]\+\)$end:math:text$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    v=v.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );

    v=v.replace(
      /(^|[^*])\*([^*]+)\*/g,
      "$1<em>$2</em>"
    );

    var inlineCode=String.fromCharCode(96);

    var pieces=v.split(inlineCode);

    if(pieces.length>1){
      var rebuilt="";

      for(var x=0;x<pieces.length;x++){
        if(x%2===1){
          rebuilt+="<code>"+pieces[x]+"</code>";
        }else{
          rebuilt+=pieces[x];
        }
      }

      v=rebuilt;
    }

    return v;
  }

  for(var i=0;i<lines.length;i++){
    var line=lines[i];

    if(line.indexOf(fence)===0){
      if(!inCode){
        inCode=true;
        codeBuffer=[];
      }else{
        inCode=false;

        html+=
          "<pre><code>"+
          escapeHtml(codeBuffer.join("\n"))+
          "</code></pre>";

        codeBuffer=[];
      }

      continue;
    }

    if(inCode){
      codeBuffer.push(line);
      continue;
    }

    if(/^### /.test(line)){
      html+="<h3>"+inlineMarkdown(line.slice(4))+"</h3>";
      continue;
    }

    if(/^## /.test(line)){
      html+="<h2>"+inlineMarkdown(line.slice(3))+"</h2>";
      continue;
    }

    if(/^# /.test(line)){
      html+="<h1>"+inlineMarkdown(line.slice(2))+"</h1>";
      continue;
    }

    if(/^> /.test(line)){
      html+="<blockquote>"+inlineMarkdown(line.slice(2))+"</blockquote>";
      continue;
    }

    if(/^[-*] /.test(line)){
      html+="<ul><li>"+inlineMarkdown(line.slice(2))+"</li></ul>";
      continue;
    }

    if(/^\d+\. /.test(line)){
      html+="<ol><li>"+inlineMarkdown(line.replace(/^\d+\. /,""))+"</li></ol>";
      continue;
    }

    if(!line.trim()){
      html+="<br>";
      continue;
    }

    html+="<p>"+inlineMarkdown(line)+"</p>";
  }

  if(inCode){
    html+=
      "<pre><code>"+
      escapeHtml(codeBuffer.join("\n"))+
      "</code></pre>";
  }

  return html;
}

function renderSources(sources){
  if(!Array.isArray(sources)||!sources.length){
    return "";
  }

  var html=
    '<div class="sources">'+
    '<div class="sources-head">Web sources</div>';

  sources.slice(0,10).forEach(function(source){
    var url=String(source.url||"");

    if(!/^https?:\/\//i.test(url)){
      return;
    }

    var title=escapeHtml(
      source.title||
      source.source||
      url
    );

    var domain="";

    try{
      domain=new URL(url).hostname;
    }catch(e){}

    html+=
      '<a class="source" href="'+
      escapeHtml(url)+
      '" target="_blank" rel="noopener noreferrer">'+
      '<div class="source-title">'+title+"</div>"+
      '<div class="source-domain">'+
      escapeHtml(domain)+
      "</div>"+
      "</a>";
  });

  html+="</div>";

  return html;
}

function addMessage(role,text,attachments,meta){
  var message={
    role:role,
    content:text,
    attachments:attachments||[],
    sources:meta&&meta.sources||[]
  };

  state.messages.push(message);

  renderMessages();
  saveCurrentChat();

  return message;
}

function renderMessages(){
  el.empty.style.display=
    state.messages.length?"none":"flex";

  el.messages.innerHTML="";

  state.messages.forEach(function(message,index){
    var row=document.createElement("div");
    row.className="msg "+message.role;

    var avatar=document.createElement("div");
    avatar.className="avatar";
    avatar.textContent=
      message.role==="user"?"You":"AI";

    var body=document.createElement("div");
    body.className="msg-body";

    if(message.role==="user"){
      body.innerHTML=
        "<div>"+
        escapeHtml(message.content||"")+
        "</div>";
    }else{
      body.innerHTML=
        markdownToHtml(message.content||"")+
        renderSources(message.sources||[]);

      var tools=document.createElement("div");
      tools.className="message-tools";

      var copy=document.createElement("button");
      copy.className="message-tool";
      copy.textContent="Copy";

      copy.onclick=function(){
        copyText(message.content||"");
      };

      tools.appendChild(copy);

      if(index===state.messages.length-1){
        var regen=document.createElement("button");
        regen.className="message-tool";
        regen.textContent="Regenerate";

        regen.onclick=function(){
          regenerate();
        };

        tools.appendChild(regen);
      }

      body.appendChild(tools);
    }

    if(message.attachments&&message.attachments.length){
      var attachments=document.createElement("div");
      attachments.className="attachments";

      message.attachments.forEach(function(file){
        var item=document.createElement("div");
        item.className="attachment";
        item.textContent=file.name||"Attachment";
        attachments.appendChild(item);
      });

      body.appendChild(attachments);
    }

    row.appendChild(avatar);
    row.appendChild(body);

    el.messages.appendChild(row);
  });

  requestAnimationFrame(function(){
    el.chat.scrollTop=el.chat.scrollHeight;
  });
}

function showSystemError(message){
  var row=document.createElement("div");
  row.className="msg assistant";

  var avatar=document.createElement("div");
  avatar.className="avatar";
  avatar.textContent="AI";

  var body=document.createElement("div");
  body.className="msg-body error";

  body.textContent=String(
    message||"Unknown error"
  );

  row.appendChild(avatar);
  row.appendChild(body);

  el.messages.appendChild(row);

  el.empty.style.display="none";

  requestAnimationFrame(function(){
    el.chat.scrollTop=el.chat.scrollHeight;
  });
}

function showAssistantPlaceholder(){
  var row=document.createElement("div");
  row.className="msg assistant";
  row.id="streamingMessage";

  var avatar=document.createElement("div");
  avatar.className="avatar";
  avatar.textContent="AI";

  var body=document.createElement("div");
  body.className="msg-body typing";
  body.innerHTML="Thinking...";

  row.appendChild(avatar);
  row.appendChild(body);

  el.messages.appendChild(row);
  el.empty.style.display="none";

  requestAnimationFrame(function(){
    el.chat.scrollTop=el.chat.scrollHeight;
  });

  return body;
}

function removeStreamingMessage(){
  var old=document.getElementById("streamingMessage");

  if(old){
    old.remove();
  }
}

function setBusy(value){
  state.busy=value;

  el.prompt.disabled=value;
  el.fileBtn.disabled=value;
  el.councilBtn.disabled=value;

  if(value){
    el.sendBtn.disabled=false;
    el.sendBtn.classList.add("stop");
    el.sendBtn.textContent="■";
    el.sendBtn.title="Stop";
    el.status.textContent="Working...";
  }else{
    el.sendBtn.classList.remove("stop");
    el.sendBtn.textContent="↑";
    el.sendBtn.title="Send";

    el.status.textContent=
      state.models.length+
      " free model"+
      (state.models.length===1?"":"s");
  }
}

function parseSSEBlock(block){
  var lines=block.split(/\r?\n/);
  var dataLines=[];

  lines.forEach(function(line){
    if(line.indexOf("data:")===0){
      dataLines.push(
        line.slice(5).trim()
      );
    }
  });

  if(!dataLines.length){
    return null;
  }

  var raw=dataLines.join("\n");

  if(raw==="[DONE]"){
    return {done:true};
  }

  try{
    return JSON.parse(raw);
  }catch(e){
    return null;
  }
}

async function streamChat(payload,onText,onSources){
  state.controller=new AbortController();

  var response;

  try{
    response=await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(payload),
      signal:state.controller.signal
    });
  }catch(error){
    if(error.name==="AbortError"){
      throw new Error("Generation stopped.");
    }

    throw new Error(
      "Network error: "+error.message
    );
  }

  if(!response.ok){
    var errorBody=await response.text();
    var errorData;

    try{
      errorData=JSON.parse(errorBody);
    }catch(e){
      errorData=errorBody;
    }

    throw new Error(
      errorText(errorData,response.status)
    );
  }

  if(!response.body){
    throw new Error(
      "Streaming is not supported by this response."
    );
  }

  var reader=response.body.getReader();
  var decoder=new TextDecoder();

  var buffer="";
  var finalText="";
  var sources=[];

  while(true){
    var result=await reader.read();

    if(result.done){
      break;
    }

    buffer+=decoder.decode(
      result.value,
      {stream:true}
    );

    var blocks=buffer.split(/\r?\n\r?\n/);

    buffer=blocks.pop()||"";

    for(var i=0;i<blocks.length;i++){
      var event=parseSSEBlock(blocks[i]);

      if(!event){
        continue;
      }

      if(event.error){
        throw new Error(
          event.error.message||
          event.error.code||
          "Upstream model error"
        );
      }

      if(event.web_search&&
         Array.isArray(event.web_search.results)){
        sources=event.web_search.results;

        if(onSources){
          onSources(sources);
        }
      }

      if(event.done){
        continue;
      }

      var choices=event.choices||[];

      if(!choices.length){
        continue;
      }

      var delta=choices[0].delta||{};
      var piece=delta.content||"";

      if(piece){
        finalText+=piece;

        onText(finalText);
      }
    }
  }

  if(buffer.trim()){
    var last=parseSSEBlock(buffer);

    if(last&&last.choices&&last.choices[0]){
      var lastPiece=
        last.choices[0].delta &&
        last.choices[0].delta.content||
        "";

      if(lastPiece){
        finalText+=lastPiece;
        onText(finalText);
      }
    }
  }

  state.controller=null;

  return {
    text:finalText,
    sources:sources
  };
}

function buildUserContent(text,attachments){
  if(!attachments||!attachments.length){
    return text;
  }

  var parts=[
    {
      type:"text",
      text:text
    }
  ];

  attachments.forEach(function(file){
    if(file.kind==="image"){
      parts.push({
        type:"image_url",
        image_url:{
          url:file.data
        }
      });
    }else{
      parts.push({
        type:"text",
        text:
          "\n\n--- FILE: "+
          file.name+
          " ---\n"+
          file.data+
          "\n--- END FILE ---\n"
      });
    }
  });

  return parts;
}

function isImageRequest(text){
  var t=String(text||"").toLowerCase();

  var patterns=[
    "generate an image",
    "generate image",
    "create an image",
    "create image",
    "make an image",
    "make image",
    "draw an image",
    "draw image",
    "draw me",
    "render an image",
    "render image",
    "design an image",
    "design image",
    "generate a picture",
    "create a picture",
    "make a picture",
    "draw a picture",
    "image generation",
    "image of",
    "picture of",
    "wallpaper of",
    "poster of",
    "logo of",
    "create a wallpaper",
    "generate a wallpaper",
    "make a wallpaper"
  ];

  for(var i=0;i<patterns.length;i++){
    if(t.indexOf(patterns[i])>=0){
      return true;
    }
  }

  return false;
}

async function getImageModels(){
  if(Array.isArray(state.imageModels)){
    return state.imageModels;
  }

  var data=await apiJson(
    "/api/image-models"
  );

  state.imageModels=
    Array.isArray(data.models)
      ? data.models
      : [];

  return state.imageModels;
}

async function startImage(prompt){
  return apiJson("/api/image",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      prompt:prompt
    })
  });
}

async function pollImage(jobId){
  var deadline=Date.now()+5*60*1000;

  while(Date.now()<deadline){
    await sleep(2200);

    var data=await apiJson(
      "/api/image-status?id="+
      encodeURIComponent(jobId)
    );

    if(data.status==="succeeded"){
      return data;
    }

    if(
      data.status==="failed"||
      data.status==="blocked"
    ){
      throw new Error(
        data.error||
        "Image generation "+data.status
      );
    }
  }

  throw new Error(
    "Image generation timed out."
  );
}

function addImageMessage(result){
  var row=document.createElement("div");
  row.className="msg assistant";

  var avatar=document.createElement("div");
  avatar.className="avatar";
  avatar.textContent="AI";

  var body=document.createElement("div");
  body.className="msg-body";

  var title=document.createElement("div");
  title.textContent="Generated image";
  title.style.fontWeight="700";
  title.style.marginBottom="10px";

  body.appendChild(title);

  var imageBox=document.createElement("div");
  imageBox.className="image-result";

  var img=document.createElement("img");
  img.src=result.url;
  img.alt="Generated image";

  var link=document.createElement("a");
  link.className="image-link";
  link.href=result.url;
  link.target="_blank";
  link.rel="noopener noreferrer";
  link.textContent="Open image";

  imageBox.appendChild(img);
  imageBox.appendChild(link);

  body.appendChild(imageBox);

  row.appendChild(avatar);
  row.appendChild(body);

  el.messages.appendChild(row);

  state.messages.push({
    role:"assistant",
    content:"Generated an image.",
    attachments:[],
    sources:[]
  });

  saveCurrentChat();

  requestAnimationFrame(function(){
    el.chat.scrollTop=el.chat.scrollHeight;
  });
}

async function sendNormal(){
  var text=el.prompt.value.trim();

  if(!text&&!state.attachments.length){
    return;
  }

  if(state.busy){
    if(state.controller){
      state.controller.abort();
    }

    return;
  }

  var attachments=state.attachments.slice();

  var historyAttachments=attachments.map(
    function(file){
      return {
        name:file.name,
        kind:file.kind
      };
    }
  );

  var finalPrompt=
    text||
    "Please analyze the attached files.";

  addMessage(
    "user",
    finalPrompt,
    historyAttachments
  );

  el.prompt.value="";
  autoResize();

  state.attachments=[];
  renderAttachments();

  setBusy(true);

  try{
    if(
      isImageRequest(text)&&
      !attachments.some(function(file){
        return file.kind==="image";
      })
    ){
      var started=await startImage(text);

      if(!started.jobId){
        throw new Error(
          "Image service did not return a job ID."
        );
      }

      var placeholder=showAssistantPlaceholder();

      placeholder.textContent=
        "Generating image...";

      var image=await pollImage(
        started.jobId
      );

      removeStreamingMessage();

      addImageMessage(image);

      return;
    }

    var body=showAssistantPlaceholder();
    var sourceBox=[];

    var conversation=state.messages
      .filter(function(m){
        return (
          m.role==="user"||
          m.role==="assistant"
        );
      })
      .slice(-20);

    var payloadMessages=conversation.map(
      function(message,index,array){
        if(
          index===array.length-1&&
          message.role==="user"
        ){
          return {
            role:"user",
            content:buildUserContent(
              finalPrompt,
              attachments
            )
          };
        }

        return {
          role:message.role,
          content:message.content
        };
      }
    );

    var result=await streamChat(
      {
        model:state.selectedModel,
        messages:payloadMessages
      },
      function(current){
        body.className="msg-body";
        body.innerHTML=
          markdownToHtml(current)+
          renderSources(sourceBox);

        requestAnimationFrame(function(){
          el.chat.scrollTop=
            el.chat.scrollHeight;
        });
      },
      function(sources){
        sourceBox=sources||[];

        body.innerHTML=
          markdownToHtml(
            body.textContent||""
          )+
          renderSources(sourceBox);
      }
    );

    removeStreamingMessage();

    if(!result.text){
      throw new Error(
        "The model returned an empty answer."
      );
    }

    addMessage(
      "assistant",
      result.text,
      [],
      {
        sources:result.sources
      }
    );

  }catch(error){
    removeStreamingMessage();

    if(error.message!=="Generation stopped."){
      showSystemError(error.message);
    }
  }finally{
    state.controller=null;
    setBusy(false);
  }
}

async function sendCouncil(){
  var text=el.prompt.value.trim();

  if(!text&&!state.attachments.length){
    return;
  }

  if(state.busy){
    return;
  }

  var attachments=state.attachments.slice();

  var historyAttachments=attachments.map(
    function(file){
      return {
        name:file.name,
        kind:file.kind
      };
    }
  );

  var question=
    text||
    "Please analyze the attached files.";

  addMessage(
    "user",
    question,
    historyAttachments
  );

  el.prompt.value="";
  autoResize();

  state.attachments=[];
  renderAttachments();

  setBusy(true);

  try{
    var row=document.createElement("div");
    row.className="msg assistant";

    var avatar=document.createElement("div");
    avatar.className="avatar";
    avatar.textContent="AI";

    var body=document.createElement("div");
    body.className="msg-body";

    var panel=document.createElement("div");
    panel.className="council-panel";

    panel.innerHTML=
      '<div class="council-head">AI Council</div>'+
      '<div class="council-status">Independent models are analyzing...</div>';

    body.appendChild(panel);
    row.appendChild(avatar);
    row.appendChild(body);

    el.messages.appendChild(row);

    requestAnimationFrame(function(){
      el.chat.scrollTop=el.chat.scrollHeight;
    });

    var result=await apiJson(
      "/api/council",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          question:buildUserContent(
            question,
            attachments
          )
        })
      }
    );

    var inner=
      '<div class="council-head">AI Council final answer</div>'+
      markdownToHtml(
        result.answer||
        "No final answer returned."
      );

    if(
      result.participants&&
      result.participants.length
    ){
      inner+=
        '<div class="council-model">'+
        "Participants: "+
        escapeHtml(
          result.participants.join(", ")
        )+
        "</div>";
    }

    if(
      result.failed&&
      result.failed.length
    ){
      inner+=
        '<div class="council-model">'+
        "Failed members: "+
        escapeHtml(
          result.failed.map(
            function(x){
              return x.model;
            }
          ).join(", ")
        )+
        "</div>";
    }

    panel.innerHTML=inner;

    state.messages.push({
      role:"assistant",
      content:
        result.answer||
        "No final answer returned.",
      attachments:[],
      sources:[]
    });

    saveCurrentChat();

  }catch(error){
    showSystemError(error.message);
  }finally{
    setBusy(false);
  }
}

function autoResize(){
  el.prompt.style.height="auto";

  el.prompt.style.height=
    Math.min(
      el.prompt.scrollHeight,
      180
    )+"px";
}

function readFile(file){
  var maxTextSize=2*1024*1024;

  if(file.type.indexOf("image/")===0){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();

      reader.onload=function(){
        resolve({
          name:file.name,
          kind:"image",
          data:reader.result
        });
      };

      reader.onerror=function(){
        reject(
          new Error(
            "Could not read image: "+file.name
          )
        );
      };

      reader.readAsDataURL(file);
    });
  }

  if(file.size>maxTextSize){
    throw new Error(
      file.name+
      " is too large. Maximum text/code file size is 2 MB."
    );
  }

  return new Promise(function(resolve,reject){
    var reader=new FileReader();

    reader.onload=function(){
      resolve({
        name:file.name,
        kind:"text",
        data:String(
          reader.result||""
        )
      });
    };

    reader.onerror=function(){
      reject(
        new Error(
          "Could not read file: "+file.name
        )
      );
    };

    reader.readAsText(file);
  });
}

async function handleFiles(files){
  try{
    for(var i=0;i<files.length;i++){
      var parsed=await readFile(files[i]);

      state.attachments.push(parsed);
    }

    renderAttachments();

  }catch(error){
    showSystemError(error.message);
  }
}

function renderAttachments(){
  el.attachPreview.innerHTML="";

  state.attachments.forEach(
    function(file,index){
      var item=document.createElement("div");
      item.className="preview";

      var label=document.createElement("span");

      label.textContent=
        (file.kind==="image"?"🖼 ":"📄 ")+
        file.name;

      var remove=document.createElement("button");
      remove.textContent="×";

      remove.onclick=function(){
        state.attachments.splice(index,1);
        renderAttachments();
      };

      item.appendChild(label);
      item.appendChild(remove);

      el.attachPreview.appendChild(item);
    }
  );
}

function newChat(){
  if(state.busy&&state.controller){
    state.controller.abort();
  }

  state.messages=[];
  state.attachments=[];
  state.chatId=null;

  el.messages.innerHTML="";
  el.empty.style.display="flex";

  renderAttachments();
  closeDrawer();
}

function chatTitle(){
  var first=state.messages.find(
    function(m){
      return m.role==="user";
    }
  );

  if(!first){
    return "New chat";
  }

  var title=String(
    first.content||""
  ).replace(/\s+/g," ").trim();

  if(title.length>45){
    title=title.slice(0,45)+"...";
  }

  return title||"New chat";
}

function saveCurrentChat(){
  if(!state.messages.length){
    return;
  }

  if(!state.chatId){
    state.chatId=
      Date.now().toString(36)+
      Math.random().toString(36).slice(2,8);
  }

  var chats=[];

  try{
    chats=JSON.parse(
      localStorage.getItem(
        "aether_chats"
      )||"[]"
    );
  }catch(e){
    chats=[];
  }

  var item={
    id:state.chatId,
    title:chatTitle(),
    messages:state.messages,
    updated:Date.now()
  };

  var found=false;

  chats=chats.map(function(chat){
    if(chat.id===item.id){
      found=true;
      return item;
    }

    return chat;
  });

  if(!found){
    chats.unshift(item);
  }

  chats.sort(function(a,b){
    return b.updated-a.updated;
  });

  chats=chats.slice(0,30);

  try{
    localStorage.setItem(
      "aether_chats",
      JSON.stringify(chats)
    );
  }catch(e){}

  renderHistory();
}

function renderHistory(){
  el.history.innerHTML="";

  var title=document.createElement("div");
  title.className="history-title";
  title.textContent="Recent chats";

  el.history.appendChild(title);

  var chats=[];

  try{
    chats=JSON.parse(
      localStorage.getItem(
        "aether_chats"
      )||"[]"
    );
  }catch(e){
    chats=[];
  }

  if(!chats.length){
    var empty=document.createElement("div");
    empty.className="history-empty";
    empty.textContent="No chats yet.";
    el.history.appendChild(empty);
    return;
  }

  chats.forEach(function(chat){
    var item=document.createElement("div");

    item.className="history-item";
    item.textContent=
      chat.title||"New chat";
    item.title=
      chat.title||"New chat";

    item.onclick=function(){
      loadChat(chat.id);
      closeDrawer();
    };

    el.history.appendChild(item);
  });
}

function loadChat(id){
  var chats=[];

  try{
    chats=JSON.parse(
      localStorage.getItem(
        "aether_chats"
      )||"[]"
    );
  }catch(e){
    return;
  }

  var chat=chats.find(
    function(item){
      return item.id===id;
    }
  );

  if(!chat){
    return;
  }

  state.chatId=chat.id;

  state.messages=
    Array.isArray(chat.messages)
      ?chat.messages
      :[];

  state.attachments=[];

  renderMessages();
  renderAttachments();
}

function copyText(text){
  navigator.clipboard.writeText(
    String(text||"")
  ).then(
    function(){
      showToast("Copied.");
    },
    function(){
      showToast("Copy failed.");
    }
  );
}

async function regenerate(){
  if(state.busy){
    return;
  }

  var lastUser=-1;

  for(var i=state.messages.length-1;i>=0;i--){
    if(state.messages[i].role==="user"){
      lastUser=i;
      break;
    }
  }

  if(lastUser<0){
    return;
  }

  if(
    state.messages.length&&
    state.messages[state.messages.length-1].role==="assistant"
  ){
    state.messages.pop();
  }

  var message=state.messages[lastUser];

  state.messages=state.messages.slice(
    0,
    lastUser+1
  );

  renderMessages();

  el.prompt.value=
    message.content||"";

  await sendNormal();
}

async function healthCheck(){
  el.status.textContent="Checking...";

  try{
    var data=await apiJson("/api/health");

    if(data.ok){
      showToast(
        "Aether is online · "+
        data.freeModels+
        " free models"
      );
    }else{
      showToast(
        data.message||
        "Health check failed."
      );
    }

  }catch(error){
    showToast(error.message);
  }

  el.status.textContent=
    state.models.length+
    " free model"+
    (state.models.length===1?"":"s");
}

el.menuBtn.addEventListener(
  "click",
  function(){
    if(
      el.sidebar.classList.contains("open")
    ){
      closeDrawer();
    }else{
      openDrawer();
    }
  }
);

el.overlay.addEventListener(
  "click",
  closeDrawer
);

el.newChat.addEventListener(
  "click",
  newChat
);

el.modelSelect.addEventListener(
  "change",
  function(){
    state.selectedModel=
      el.modelSelect.value;

    var model=state.models.find(
      function(item){
        return item.id===
          state.selectedModel;
      }
    );

    if(model){
      showToast(
        modelLabel(model)
      );
    }
  }
);

el.councilBtn.addEventListener(
  "click",
  function(){
    state.council=!state.council;

    el.councilBtn.classList.toggle(
      "active",
      state.council
    );

    el.councilBtn.textContent=
      state.council
        ?"Council ON"
        :"AI Council";
  }
);

el.healthBtn.addEventListener(
  "click",
  healthCheck
);

el.sendBtn.addEventListener(
  "click",
  sendNormal
);

el.prompt.addEventListener(
  "keydown",
  function(event){
    if(
      event.key==="Enter"&&
      !event.shiftKey
    ){
      event.preventDefault();

      if(state.council){
        sendCouncil();
      }else{
        sendNormal();
      }
    }
  }
);

el.prompt.addEventListener(
  "input",
  autoResize
);

el.fileBtn.addEventListener(
  "click",
  function(){
    if(!state.busy){
      el.fileInput.click();
    }
  }
);

el.fileInput.addEventListener(
  "change",
  function(){
    handleFiles(
      Array.from(
        el.fileInput.files||[]
      )
    );

    el.fileInput.value="";
  }
);

document.querySelectorAll(
  ".quick"
).forEach(function(button){
  button.addEventListener(
    "click",
    function(){
      el.prompt.value=
        button.getAttribute(
          "data-prompt"
        )||"";

      autoResize();
      el.prompt.focus();
    }
  );
});

renderHistory();
autoResize();
loadModels();

})();
</script>
</body>
</html>`;

const DEFAULT_BASE_URL = "https://api.xkiro.com/v1";

let catalogCache = {
  time: 0,
  models: null
};

let imageCatalogCache = {
  time: 0,
  models: null
};

function json(data,status=200,extraHeaders={}){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "Cache-Control":"no-store",
        ...extraHeaders
      }
    }
  );
}

function getBaseUrl(env){
  return String(
    env.XKIRO_BASE_URL||
    DEFAULT_BASE_URL
  ).replace(/\/+$/,"");
}

function getApiKey(env){
  return String(
    env.XKIRO_API_KEY||
    env.XKIRO_API_TOKEN||
    env.API_KEY||
    ""
  ).trim();
}

function authHeaders(env){
  const key=getApiKey(env);

  return {
    "Authorization":"Bearer "+key,
    "Content-Type":"application/json"
  };
}

function createTimeout(ms){
  const controller=new AbortController();

  const timer=setTimeout(
    ()=>controller.abort(),
    ms
  );

  return {
    signal:controller.signal,
    clear:()=>clearTimeout(timer)
  };
}

async function fetchWithTimeout(
  url,
  init={},
  timeoutMs=15000
){
  const timeout=createTimeout(timeoutMs);

  try{
    return await fetch(
      url,
      {
        ...init,
        signal:timeout.signal
      }
    );
  }finally{
    timeout.clear();
  }
}

async function readJsonSafe(response){
  const text=await response.text();

  if(!text){
    return {};
  }

  try{
    return JSON.parse(text);
  }catch{
    return {
      error:{
        message:text
      }
    };
  }
}

function extractErrorMessage(
  data,
  fallback
){
  if(!data){
    return fallback;
  }

  if(typeof data==="string"){
    return data;
  }

  if(data.error){
    if(typeof data.error==="string"){
      return data.error;
    }

    if(data.error.message){
      return String(
        data.error.message
      );
    }

    if(data.error.code){
      return String(
        data.error.code
      );
    }
  }

  if(data.message){
    return String(
      data.message
    );
  }

  try{
    return JSON.stringify(data);
  }catch{
    return fallback;
  }
}

function upstreamError(data,status){
  return {
    error:{
      message:extractErrorMessage(
        data,
        "xKiro request failed ("+
        status+
        ")"
      ),
      status
    }
  };
}

/*
 * Public catalog.
 *
 * Important:
 * /v1/models is public according to xKiro.
 * Do not make model loading depend on the API key.
 */
async function fetchCatalog(
  env,
  modality="chat"
){
  const now=Date.now();

  const cache=
    modality==="image"
      ?imageCatalogCache
      :catalogCache;

  if(
    cache.models&&
    now-cache.time<120000
  ){
    return cache.models;
  }

  const suffix=
    modality==="chat"
      ?""
      :"?modality="+
       encodeURIComponent(modality);

  const response=
    await fetchWithTimeout(
      getBaseUrl(env)+
      "/models"+
      suffix,
      {
        method:"GET",
        headers:{
          "Accept":
            "application/json"
        }
      },
      12000
    );

  const data=
    await readJsonSafe(response);

  if(!response.ok){
    throw new Error(
      extractErrorMessage(
        data,
        "Model catalog failed ("+
        response.status+
        ")"
      )
    );
  }

  const models=
    Array.isArray(data.data)
      ?data.data
      :Array.isArray(data.models)
        ?data.models
        :[];

  cache.time=now;
  cache.models=models;

  return models;
}

async function xkiroFetch(
  env,
  path,
  init={},
  timeoutMs=90000
){
  const key=getApiKey(env);

  if(!key){
    throw new Error(
      "XKIRO_API_KEY is missing in Cloudflare Worker secrets."
    );
  }

  const headers={
    ...authHeaders(env),
    ...(init.headers||{})
  };

  return fetchWithTimeout(
    getBaseUrl(env)+path,
    {
      ...init,
      headers
    },
    timeoutMs
  );
}

function modelScore(model){
  const caps=
    model.capabilities||
    {};

  let score=0;

  if(caps.reasoning){
    score+=45;
  }

  if(caps.vision){
    score+=22;
  }

  if(caps.tools){
    score+=13;
  }

  const context=
    Number(
      model.context_length||
      0
    );

  const output=
    Number(
      model.max_output_tokens||
      0
    );

  score+=Math.min(
    context/10000,
    30
  );

  score+=Math.min(
    output/5000,
    20
  );

  const id=
    String(
      model.id||
      ""
    ).toLowerCase();

  if(id.includes("reason")){
    score+=5;
  }

  if(id.includes("thinking")){
    score+=5;
  }

  return score;
}

function isFreeModel(model){
  return String(
    model.access_tier||
    ""
  ).toLowerCase()==="free";
}

function isChatModel(model){
  return String(
    model.modality||
    "chat"
  ).toLowerCase()==="chat";
}

function isImageModel(model){
  return String(
    model.modality||
    ""
  ).toLowerCase()==="image";
}

async function getFreeModels(env){
  const models=
    await fetchCatalog(
      env,
      "chat"
    );

  return models
    .filter(isFreeModel)
    .filter(isChatModel)
    .sort(
      (a,b)=>
        modelScore(b)-
        modelScore(a)
    );
}

async function getFreeImageModels(env){
  const models=
    await fetchCatalog(
      env,
      "image"
    );

  return models
    .filter(isFreeModel)
    .filter(isImageModel);
}

function sseHeaders(){
  return {
    "Content-Type":
      "text/event-stream; charset=utf-8",
    "Cache-Control":
      "no-cache, no-transform",
    "Connection":
      "keep-alive",
    "X-Accel-Buffering":
      "no"
  };
}

function sseData(data){
  return (
    "data: "+
    JSON.stringify(data)+
    "\n\n"
  );
}

function sseDone(){
  return "data: [DONE]\n\n";
}

function sseError(
  message,
  code="upstream_error"
){
  return sseData({
    error:{
      message,
      code
    }
  });
}

function modelById(
  models,
  id
){
  return models.find(
    model=>model.id===id
  );
}

function chooseChatModel(
  models,
  requested
){
  const exact=
    requested
      ?modelById(
        models,
        requested
      )
      :null;

  return exact||
    models[0]||
    null;
}

function messagesNeedVision(
  messages
){
  return messages.some(
    message=>{
      if(!Array.isArray(
        message.content
      )){
        return false;
      }

      return message.content.some(
        part=>
          part&&
          part.type==="image_url"
      );
    }
  );
}

function chooseVisionModel(
  models,
  requested,
  messages
){
  if(!messagesNeedVision(
    messages
  )){
    return chooseChatModel(
      models,
      requested
    );
  }

  const requestedModel=
    modelById(
      models,
      requested
    );

  if(
    requestedModel&&
    requestedModel.capabilities&&
    requestedModel.capabilities.vision
  ){
    return requestedModel;
  }

  return (
    models.find(
      model=>
        model.capabilities&&
        model.capabilities.vision
    )||
    models[0]||
    null
  );
}

function buildChatBody(
  model,
  messages
){
  return {
    model:model.id,
    messages,
    stream:true,
    web_search:{
      enable:true,
      count:5
    }
  };
}

async function openChatStream(
  env,
  model,
  messages
){
  return xkiroFetch(
    env,
    "/chat/completions",
    {
      method:"POST",
      headers:{
        "Content-Type":
          "application/json"
      },
      body:JSON.stringify(
        buildChatBody(
          model,
          messages
        )
      )
    },
    90000
  );
}

function parseSSEData(
  block
){
  const lines=
    block.split(/\r?\n/);

  const values=[];

  for(
    const line of lines
  ){
    if(
      line.startsWith("data:")
    ){
      values.push(
        line.slice(5).trim()
      );
    }
  }

  if(!values.length){
    return [];
  }

  return values
    .map(raw=>{
      if(raw==="[DONE]"){
        return {
          done:true
        };
      }

      try{
        return JSON.parse(raw);
      }catch{
        return null;
      }
    })
    .filter(Boolean);
}

async function handleChat(
  request,
  env
){
  let body;

  try{
    body=await request.json();
  }catch{
    return json(
      {
        error:{
          message:
            "Invalid JSON request."
        }
      },
      400
    );
  }

  const messages=
    Array.isArray(body.messages)
      ?body.messages
      :[];

  if(!messages.length){
    return json(
      {
        error:{
          message:
            "At least one message is required."
        }
      },
      400
    );
  }

  let freeModels;

  try{
    freeModels=
      await getFreeModels(env);
  }catch(error){
    return json(
      {
        error:{
          message:
            "Could not load free models: "+
            error.message
        }
      },
      502
    );
  }

  if(!freeModels.length){
    return json(
      {
        error:{
          message:
            "No free xKiro chat models are currently available."
        }
      },
      503
    );
  }

  const primary=
    chooseVisionModel(
      freeModels,
      String(
        body.model||
        ""
      ),
      messages
    );

  if(!primary){
    return json(
      {
        error:{
          message:
            "No compatible free model found."
        }
      },
      503
    );
  }

  /*
   * If the selected model returns a normal HTTP error before
   * streaming begins, automatically try another free model.
   */
  const candidates=[
    primary,
    ...freeModels.filter(
      model=>
        model.id!==primary.id&&
        (
          !messagesNeedVision(
            messages
          )||
          (
            model.capabilities&&
            model.capabilities.vision
          )
        )
    )
  ].slice(0,4);

  let upstream=null;
  let chosen=null;
  let lastError=null;

  for(
    const model of candidates
  ){
    try{
      const response=
        await openChatStream(
          env,
          model,
          messages
        );

      if(response.ok){
        upstream=response;
        chosen=model;
        break;
      }

      const data=
        await readJsonSafe(
          response
        );

      lastError=new Error(
        extractErrorMessage(
          data,
          "Model failed ("+
          response.status+
          ")"
        )
      );

    }catch(error){
      lastError=error;
    }
  }

  if(!upstream){
    return json(
      {
        error:{
          message:
            lastError
              ?lastError.message
              :"All free models failed."
        }
      },
      502
    );
  }

  const reader=
    upstream.body &&
    upstream.body.getReader();

  if(!reader){
    return json(
      {
        error:{
          message:
            "xKiro returned no streaming body."
        }
      },
      502
    );
  }

  const stream=
    new ReadableStream({
      async start(controller){
        const decoder=
          new TextDecoder();

        const encoder=
          new TextEncoder();

        let buffer="";

        try{
          while(true){
            const result=
              await reader.read();

            if(result.done){
              break;
            }

            buffer+=
              decoder.decode(
                result.value,
                {
                  stream:true
                }
              );

            const blocks=
              buffer.split(
                /\r?\n\r?\n/
              );

            buffer=
              blocks.pop()||
              "";

            for(
              const block of blocks
            ){
              const events=
                parseSSEData(
                  block
                );

              for(
                const event of events
              ){
                if(event.done){
                  controller.enqueue(
                    encoder.encode(
                      sseDone()
                    )
                  );

                  continue;
                }

                if(event.error){
                  controller.enqueue(
                    encoder.encode(
                      sseError(
                        extractErrorMessage(
                          event.error,
                          "Upstream error"
                        )
                      )
                    )
                  );

                  continue;
                }

                controller.enqueue(
                  encoder.encode(
                    sseData(event)
                  )
                );
              }
            }
          }

          if(buffer.trim()){
            const events=
              parseSSEData(
                buffer
              );

            for(
              const event of events
            ){
              if(event.done){
                continue;
              }

              controller.enqueue(
                encoder.encode(
                  sseData(event)
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(
              sseData({
                meta:{
                  model:chosen.id
                }
              })
            )
          );

          controller.enqueue(
            encoder.encode(
              sseDone()
            )
          );

          controller.close();

        }catch(error){
          try{
            controller.enqueue(
              encoder.encode(
                sseError(
                  error.message||
                  "Streaming failed"
                )
              )
            );

            controller.enqueue(
              encoder.encode(
                sseDone()
              )
            );

            controller.close();
          }catch{}
        }
      },

      cancel(){
        try{
          reader.cancel();
        }catch{}
      }
    });

  return new Response(
    stream,
    {
      headers:sseHeaders()
    }
  );
}

function questionToText(
  question
){
  if(typeof question==="string"){
    return question;
  }

  if(!Array.isArray(question)){
    return String(
      question||
      ""
    );
  }

  return question
    .filter(
      part=>
        part&&
        part.type==="text"
    )
    .map(
      part=>
        part.text||""
    )
    .join("\n");
}

async function councilCall(
  env,
  model,
  messages
){
  const response=
    await xkiroFetch(
      env,
      "/chat/completions",
      {
        method:"POST",
        headers:{
          "Content-Type":
            "application/json"
        },
        body:JSON.stringify({
          model,
          messages,
          stream:false,
          web_search:{
            enable:true,
            count:5
          }
        })
      },
      90000
    );

  const data=
    await readJsonSafe(
      response
    );

  if(!response.ok){
    throw new Error(
      extractErrorMessage(
        data,
        "Council model failed ("+
        response.status+
        ")"
      )
    );
  }

  const answer=
    data&&
    data.choices&&
    data.choices[0]&&
    data.choices[0].message
      ?data.choices[0].message.content
      :"";

  if(!answer){
    throw new Error(
      "Model returned an empty council analysis."
    );
  }

  return String(answer);
}

async function handleCouncil(
  request,
  env
){
  let body;

  try{
    body=await request.json();
  }catch{
    return json(
      {
        error:{
          message:
            "Invalid JSON request."
        }
      },
      400
    );
  }

  let freeModels;

  try{
    freeModels=
      await getFreeModels(env);
  }catch(error){
    return json(
      {
        error:{
          message:
            error.message
        }
      },
      502
    );
  }

  if(!freeModels.length){
    return json(
      {
        error:{
          message:
            "No free council models are available."
        }
      },
      503
    );
  }

  const selected=
    freeModels.slice(
      0,
      Math.min(
        3,
        freeModels.length
      )
    );

  const question=
    questionToText(
      body.question
    );

  const baseMessage={
    role:"user",
    content:body.question
  };

  const analyses=
    await Promise.allSettled(
      selected.map(
        model=>
          councilCall(
            env,
            model.id,
            [
              {
                role:"system",
                content:
                  "You are an independent member of an AI research council. "+
                  "Analyze the request carefully. "+
                  "Use web search when useful. "+
                  "Separate facts from uncertainty. "+
                  "Give concrete evidence and useful reasoning. "+
                  "Do not assume other council members are correct."
              },
              baseMessage
            ]
          )
      )
    );

  const successful=[];
  const failed=[];

  for(
    let i=0;
    i<analyses.length;
    i++
  ){
    const result=
      analyses[i];

    if(
      result.status==="fulfilled"
    ){
      successful.push({
        model:selected[i].id,
        answer:result.value
      });
    }else{
      failed.push({
        model:selected[i].id,
        error:
          result.reason &&
          result.reason.message
            ?result.reason.message
            :"Unknown failure"
      });
    }
  }

  if(!successful.length){
    return json(
      {
        error:{
          message:
            "All council models failed.",
          details:failed
        }
      },
      502
    );
  }

  if(successful.length===1){
    return json({
      answer:successful[0].answer,
      participants:
        successful.map(
          item=>item.model
        ),
      failed
    });
  }

  const discussion=
    successful.map(
      (item,index)=>
        "COUNCIL MEMBER "+
        (index+1)+
        " ("+
        item.model+
        "):\n"+
        item.answer
    ).join(
      "\n\n====================\n\n"
    );

  /*
   * Use the strongest successful model as the judge.
   * If it fails, fall back to the strongest independent analysis.
   */
  const judge=
    successful[0];

  let finalAnswer;

  try{
    finalAnswer=
      await councilCall(
        env,
        judge.model,
        [
          {
            role:"system",
            content:
              "You are the final chair of an AI council. "+
              "Synthesize independent analyses into one accurate answer. "+
              "Resolve contradictions using evidence. "+
              "Do not blindly follow a majority. "+
              "Do not mention internal council mechanics unless necessary. "+
              "Be direct and useful."
          },
          {
            role:"user",
            content:
              "Original request:\n"+
              question+
              "\n\nIndependent analyses:\n\n"+
              discussion
          }
        ]
      );
  }catch(error){
    finalAnswer=
      judge.answer+
      "\n\nCouncil synthesis was unavailable: "+
      error.message;
  }

  return json({
    answer:finalAnswer,
    participants:
      successful.map(
        item=>item.model
      ),
    failed
  });
}

async function handleImageStart(
  request,
  env
){
  let body;

  try{
    body=await request.json();
  }catch{
    return json(
      {
        error:{
          message:
            "Invalid JSON request."
        }
      },
      400
    );
  }

  const prompt=
    String(
      body.prompt||
      ""
    ).trim();

  if(!prompt){
    return json(
      {
        error:{
          message:
            "Image prompt is empty."
        }
      },
      400
    );
  }

  let models;

  try{
    models=
      await getFreeImageModels(
        env
      );
  }catch(error){
    return json(
      {
        error:{
          message:
            "Could not load free image models: "+
            error.message
        }
      },
      502
    );
  }

  if(!models.length){
    return json(
      {
        error:{
          message:
            "No free image-generation model is currently available."
        }
      },
      503
    );
  }

  const model=models[0];

  let response;

  try{
    response=
      await xkiroFetch(
        env,
        "/images/generations",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            model:model.id,
            prompt,
            n:1,
            size:"1024x1024"
          })
        },
        30000
      );
  }catch(error){
    return json(
      {
        error:{
          message:
            error.message
        }
      },
      502
    );
  }

  const data=
    await readJsonSafe(
      response
    );

  if(!response.ok){
    return json(
      upstreamError(
        data,
        response.status
      ),
      response.status
    );
  }

  const jobId=
    data.id||
    data.job_id;

  if(!jobId){
    return json(
      {
        error:{
          message:
            "xKiro accepted the image request but returned no job ID."
        }
      },
      502
    );
  }

  return json({
    jobId,
    model:model.id,
    status:
      data.status||
      "processing"
  });
}

async function handleImageStatus(
  request,
  env,
  url
){
  const id=
    String(
      url.searchParams.get("id")||
      ""
    ).trim();

  if(!id){
    return json(
      {
        error:{
          message:
            "Missing image job ID."
        }
      },
      400
    );
  }

  try{
    const response=
      await xkiroFetch(
        env,
        "/images/generations/"+
        encodeURIComponent(id),
        {
          method:"GET"
        },
        20000
      );

    const data=
      await readJsonSafe(
        response
      );

    if(!response.ok){
      return json(
        upstreamError(
          data,
          response.status
        ),
        response.status
      );
    }

    if(
      data.status==="succeeded"
    ){
      const item=
        Array.isArray(data.data)&&
        data.data.length
          ?data.data[0]
          :null;

      const imageUrl=
        item&&
        (
          item.url||
          item.image_url||
          item.uri
        );

      if(!imageUrl){
        return json(
          {
            error:{
              message:
                "Image job succeeded but no image URL was returned."
            }
          },
          502
        );
      }

      return json({
        status:"succeeded",
        url:imageUrl,
        model:data.model,
        jobId:data.id
      });
    }

    if(
      data.status==="failed"||
      data.status==="blocked"
    ){
      return json({
        status:data.status,
        error:
          extractErrorMessage(
            data.error,
            "Image generation "+
            data.status
          )
      });
    }

    return json({
      status:
        data.status||
        "processing",
      jobId:data.id
    });

  }catch(error){
    return json(
      {
        error:{
          message:
            error.message
        }
      },
      502
    );
  }
}

async function handleModels(
  env
){
  try{
    const models=
      await getFreeModels(
        env
      );

    return json({
      models,
      selectedModel:
        models[0]
          ?models[0].id
          :null
    });
  }catch(error){
    return json(
      {
        error:{
          message:
            error.message
        }
      },
      502
    );
  }
}

async function handleImageModels(
  env
){
  try{
    const models=
      await getFreeImageModels(
        env
      );

    return json({
      models
    });
  }catch(error){
    return json(
      {
        error:{
          message:
            error.message
        }
      },
      502
    );
  }
}

async function handleHealth(
  env
){
  const started=Date.now();

  try{
    const models=
      await getFreeModels(
        env
      );

    return json({
      ok:true,
      freeModels:models.length,
      strongestFreeModel:
        models[0]
          ?models[0].id
          :null,
      latencyMs:
        Date.now()-started,
      time:
        new Date().toISOString()
    });
  }catch(error){
    return json({
      ok:false,
      freeModels:0,
      message:error.message,
      latencyMs:
        Date.now()-started,
      time:
        new Date().toISOString()
    });
  }
}

export default {
  async fetch(
    request,
    env
  ){
    const url=
      new URL(request.url);

    if(
      request.method==="OPTIONS"
    ){
      return new Response(
        null,
        {
          status:204,
          headers:{
            "Access-Control-Allow-Origin":"*",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization",
            "Access-Control-Allow-Methods":
              "GET,POST,OPTIONS"
          }
        }
      );
    }

    if(
      url.pathname==="/"||
      url.pathname==="/index.html"
    ){
      return new Response(
        HTML,
        {
          headers:{
            "Content-Type":
              "text/html; charset=utf-8",
            "Cache-Control":
              "no-store"
          }
        }
      );
    }

    if(
      url.pathname==="/api/models"&&
      request.method==="GET"
    ){
      return handleModels(env);
    }

    if(
      url.pathname==="/api/image-models"&&
      request.method==="GET"
    ){
      return handleImageModels(env);
    }

    if(
      url.pathname==="/api/health"&&
      request.method==="GET"
    ){
      return handleHealth(env);
    }

    if(
      url.pathname==="/api/chat"&&
      request.method==="POST"
    ){
      return handleChat(
        request,
        env
      );
    }

    if(
      url.pathname==="/api/council"&&
      request.method==="POST"
    ){
      return handleCouncil(
        request,
        env
      );
    }

    if(
      url.pathname==="/api/image"&&
      request.method==="POST"
    ){
      return handleImageStart(
        request,
        env
      );
    }

    if(
      url.pathname==="/api/image-status"&&
      request.method==="GET"
    ){
      return handleImageStatus(
        request,
        env,
        url
      );
    }

    return new Response(
      "Not Found",
      {
        status:404,
        headers:{
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      }
    );
  }
};
