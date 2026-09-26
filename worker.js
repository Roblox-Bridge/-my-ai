const HTML = [
'<!doctype html>',
'<html lang="en">',
'<head>',
'<meta charset="UTF-8">',
'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
'<title>AetherAI</title>',
'<style>',
'*{box-sizing:border-box}',
'html,body{margin:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#212121;color:#ececec}',
'button,input,textarea,select{font:inherit}',
'button{cursor:pointer}',
'.app{height:100%;display:flex;overflow:hidden}',
'.sidebar{width:280px;background:#171717;display:flex;flex-direction:column;border-right:1px solid #303030;flex:none;z-index:30}',
'.side-head{height:64px;padding:12px;display:flex;align-items:center;gap:8px}',
'.newchat,.close-side{border:1px solid #383838;background:#212121;color:#eee;border-radius:10px;height:40px}',
'.newchat{flex:1;text-align:left;padding:0 14px}',
'.close-side{width:40px;display:none}',
'.history{padding:8px 10px;overflow:auto;flex:1}',
'.history-item{padding:11px 12px;border-radius:9px;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}',
'.history-item:hover,.history-item.active{background:#2a2a2a}',
'.side-foot{padding:12px;color:#999;font-size:12px}',
'.main{min-width:0;flex:1;display:flex;flex-direction:column;background:#212121}',
'.topbar{height:64px;display:flex;align-items:center;padding:0 18px;border-bottom:1px solid #2d2d2d;gap:10px}',
'.hamb{display:none;border:0;background:transparent;color:#ddd;font-size:25px;width:40px;height:40px}',
'.brand{font-weight:650;font-size:17px}',
'.model-select{background:#2a2a2a;color:#eee;border:1px solid #3b3b3b;border-radius:9px;padding:8px 10px;max-width:360px;margin-left:4px}',
'.council-btn{margin-left:auto;border:1px solid #3d3d3d;background:#2a2a2a;color:#eee;border-radius:9px;padding:8px 12px}',
'.council-btn.active{background:#343434;border-color:#777}',
'.chat{flex:1;overflow:auto}',
'.welcome{max-width:760px;margin:16vh auto 0;padding:20px}',
'.welcome h1{font-size:34px;margin:0 0 12px}',
'.welcome p{color:#aaa}',
'.messages{max-width:850px;margin:0 auto;padding:28px 20px 160px}',
'.msg{display:flex;gap:14px;margin:0 0 30px}',
'.avatar{width:30px;height:30px;border-radius:7px;background:#303030;display:grid;place-items:center;flex:none;font-size:13px}',
'.msg.user .avatar{background:#444}',
'.body{min-width:0;flex:1;line-height:1.65;font-size:15.5px}',
'.body p{margin:0 0 12px}',
'.body pre{background:#111;border:1px solid #333;border-radius:10px;padding:14px;overflow:auto}',
'.body code{background:#2c2c2c;padding:2px 5px;border-radius:5px}',
'.body pre code{background:none;padding:0}',
'.body img.chat-image{max-width:min(100%,600px);border-radius:12px;display:block;margin-top:10px}',
'.actions{display:flex;gap:6px;margin-top:7px}',
'.copy{border:0;background:transparent;color:#888;font-size:12px;padding:4px}',
'.sources{margin-top:12px;padding-top:10px;border-top:1px solid #333}',
'.sources a{display:block;color:#9ec5ff;text-decoration:none;font-size:13px;margin:5px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.composer-wrap{position:fixed;bottom:0;left:280px;right:0;background:linear-gradient(transparent,#212121 28%);padding:35px 20px 20px;z-index:10}',
'.composer{max-width:800px;margin:auto;background:#2f2f2f;border:1px solid #484848;border-radius:16px;padding:8px 10px}',
'.attachments{display:flex;gap:7px;flex-wrap:wrap;padding:2px 4px 6px}',
'.chip{background:#222;border:1px solid #444;border-radius:8px;padding:6px 8px;font-size:12px;display:flex;gap:6px;align-items:center}',
'.chip img{width:32px;height:32px;object-fit:cover;border-radius:5px}',
'.chip button{background:none;border:0;color:#aaa}',
'.row{display:flex;align-items:flex-end;gap:7px}',
'.attach{width:38px;height:38px;border:0;background:transparent;color:#ccc;font-size:23px}',
'.prompt{flex:1;resize:none;min-height:40px;max-height:180px;background:transparent;border:0;outline:0;color:#eee;padding:9px 5px;line-height:1.45}',
'.send{width:38px;height:38px;border:0;border-radius:10px;background:#eee;color:#111;font-weight:700}',
'.send:disabled{opacity:.35}',
'.hint{max-width:800px;margin:8px auto 0;text-align:center;color:#777;font-size:11px}',
'.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:20}',
'.status{font-size:12px;color:#999;margin-top:7px}',
'.empty{color:#777;padding:20px 8px}',
'.council-badge{display:inline-block;border:1px solid #555;border-radius:999px;padding:3px 8px;font-size:11px;color:#bbb;margin-bottom:8px}',
'.file-note{color:#aaa;font-size:12px;margin-top:5px}',
'@media(max-width:760px){',
'.sidebar{position:fixed;left:0;top:0;bottom:0;transform:translateX(-105%);transition:transform .18s ease;box-shadow:10px 0 30px #0008}',
'.sidebar.open{transform:translateX(0)}',
'.overlay.open{display:block}',
'.close-side{display:block}',
'.hamb{display:block}',
'.topbar{padding:0 10px}',
'.model-select{max-width:180px}',
'.council-btn{padding:8px;font-size:12px}',
'.composer-wrap{left:0;padding:30px 10px 12px}',
'.messages{padding-left:12px;padding-right:12px}',
'.welcome{margin-top:12vh;padding:18px}',
'.welcome h1{font-size:28px}',
'.side-head{padding:12px 10px}',
'}',
'</style>',
'</head>',
'<body>',
'<div class="app">',
'<aside class="sidebar" id="sidebar">',
'<div class="side-head">',
'<button class="newchat" id="newChat">＋ New chat</button>',
'<button class="close-side" id="closeSide">×</button>',
'</div>',
'<div class="history" id="history"></div>',
'<div class="side-foot">Free models only • Web search always on</div>',
'</aside>',
'<div class="overlay" id="overlay"></div>',
'<main class="main">',
'<header class="topbar">',
'<button class="hamb" id="hamb">☰</button>',
'<div class="brand">AetherAI</div>',
'<select class="model-select" id="modelSelect"></select>',
'<button class="council-btn" id="councilBtn">AI Council</button>',
'</header>',
'<section class="chat" id="chat">',
'<div id="welcome" class="welcome">',
'<h1>How can I help?</h1>',
'<p>Ask anything. Web search is always available. Image requests automatically use a free image model.</p>',
'</div>',
'<div class="messages" id="messages"></div>',
'</section>',
'</main>',
'<div class="composer-wrap">',
'<div class="composer">',
'<div class="attachments" id="attachments"></div>',
'<div class="row">',
'<button class="attach" id="attachBtn" title="Attach files">＋</button>',
'<textarea id="prompt" class="prompt" placeholder="Message AetherAI..." rows="1"></textarea>',
'<button class="send" id="send">↑</button>',
'</div>',
'<div class="status" id="status"></div>',
'</div>',
'<div class="hint">AetherAI can make mistakes. Check important information.</div>',
'</div>',
'</div>',
'<input id="fileInput" type="file" hidden multiple accept="image/*,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.yaml,.yml">',
'<script>',
'const $=id=>document.getElementById(id);',

'const state={',
'messages:[],',
'history:JSON.parse(localStorage.getItem("aether_history")||"[]"),',
'currentId:null,',
'models:[],',
'selected:"",',
'council:false,',
'attachments:[]',
'};',

'function escapeHtml(s){',
'return String(s??"")',
'.replace(/&/g,"&amp;")',
'.replace(/</g,"&lt;")',
'.replace(/>/g,"&gt;")',
'.replace(/"/g,"&quot;")',
'.replace(/\\x27/g,"&#39;")',
'}',

'function markdown(s){',
'let x=escapeHtml(s);',
'x=x.replace(/```([\\s\\S]*?)```/g,function(m,c){',
'return "<pre><code>"+c.replace(/^\\w+\\n/,"")+"</code></pre>";',
'});',
'x=x.replace(/`([^`]+)`/g,"<code>$1</code>");',
'x=x.replace(/\\*\\*(.*?)\\*\\*/g,"<strong>$1</strong>");',
'x=x.replace(/\\*([^*]+)\\*/g,"<em>$1</em>");',
'x=x.replace(/\\n/g,"<br>");',
'return x;',
'}',

'function saveHistory(){',
'const clean=state.history.slice(0,30).map(function(x){',
'return {',
'id:x.id,',
'title:x.title,',
'messages:x.messages.map(function(m){',
'return {role:m.role,content:typeof m.content==="string"?m.content:"[attachment]"};',
'})',
'};',
'});',
'localStorage.setItem("aether_history",JSON.stringify(clean));',
'}',

'function renderHistory(){',
'const h=$("history");',
'h.innerHTML="";',
'if(!state.history.length){',
'h.innerHTML="<div class=\\"empty\\">No previous chats</div>";',
'return;',
'}',
'state.history.forEach(function(x){',
'const b=document.createElement("div");',
'b.className="history-item"+(x.id===state.currentId?" active":"");',
'b.textContent=x.title||"New chat";',
'b.onclick=function(){loadChat(x.id)};',
'h.appendChild(b);',
'});',
'}',

'function renderAttachments(){',
'const a=$("attachments");',
'a.innerHTML="";',
'state.attachments.forEach(function(f,i){',
'const c=document.createElement("div");',
'c.className="chip";',
'if(f.type.startsWith("image/")){',
'const im=document.createElement("img");',
'im.src=f.data;',
'c.appendChild(im);',
'}',
'const sp=document.createElement("span");',
'sp.textContent=f.name;',
'c.appendChild(sp);',
'const b=document.createElement("button");',
'b.textContent="×";',
'b.onclick=function(){',
'state.attachments.splice(i,1);',
'renderAttachments();',
'};',
'c.appendChild(b);',
'a.appendChild(c);',
'});',
'}',

'function renderMessages(){',
'const m=$("messages");',
'm.innerHTML="";',
'$("welcome").style.display=state.messages.length?"none":"block";',

'state.messages.forEach(function(x){',
'const row=document.createElement("div");',
'row.className="msg "+x.role;',

'const av=document.createElement("div");',
'av.className="avatar";',
'av.textContent=x.role==="user"?"U":"AI";',

'const body=document.createElement("div");',
'body.className="body";',

'if(x.role==="assistant"&&x.council){',
'body.innerHTML+="<span class=\\"council-badge\\">AI Council</span>";',
'}',

'body.innerHTML+=markdown(x.content||x.displayText||"");',

'if(x.image){',
'const im=document.createElement("img");',
'im.className="chat-image";',
'im.src=x.image;',
'im.alt="Generated image";',
'body.appendChild(im);',
'}',

'if(x.files&&x.files.length){',
'const note=document.createElement("div");',
'note.className="file-note";',
'note.textContent="📎 "+x.files.join(", ");',
'body.appendChild(note);',
'}',

'if(x.sources&&x.sources.length){',
'const d=document.createElement("div");',
'd.className="sources";',
'const title=document.createElement("div");',
'title.style="font-size:12px;color:#888;margin-bottom:5px";',
'title.textContent="Sources";',
'd.appendChild(title);',

'x.sources.slice(0,8).forEach(function(s){',
'if(!s.url)return;',
'const a=document.createElement("a");',
'a.href=s.url;',
'a.target="_blank";',
'a.rel="noopener noreferrer";',
'a.textContent=s.title||s.url;',
'd.appendChild(a);',
'});',

'body.appendChild(d);',
'}',

'if(x.role==="assistant"){',
'const act=document.createElement("div");',
'act.className="actions";',
'const cp=document.createElement("button");',
'cp.className="copy";',
'cp.textContent="Copy";',
'cp.onclick=function(){navigator.clipboard.writeText(x.content||"")};',
'act.appendChild(cp);',
'body.appendChild(act);',
'}',

'row.appendChild(av);',
'row.appendChild(body);',
'm.appendChild(row);',
'});',

'$("chat").scrollTop=$("chat").scrollHeight;',
'}',

'function addMessage(x){',
'state.messages.push(x);',
'renderMessages();',
'}',

'function setStatus(s){',
'$("status").textContent=s||"";',
'}',

'function imageRequest(t){',
'const s=String(t||"").toLowerCase();',
'return /\\b(generate|create|make|draw|render|design|produce)\\b.{0,80}\\b(image|picture|photo|wallpaper|poster|logo|illustration|art|portrait)\\b/i.test(s)',
'||/\\b(image|picture|photo|wallpaper|poster|logo|illustration|tasveer|تصویر)\\b.{0,50}\\b(banao|bnao|bana|bana do|bna do|banado|bna de|generate|create|make|draw|design)\\b/i.test(s)',
'||/^(image|picture|wallpaper|logo)\\s*(please|plz)?$/i.test(s);',
'}',

'function autoGrow(){',
'const p=$("prompt");',
'p.style.height="auto";',
'p.style.height=Math.min(p.scrollHeight,180)+"px";',
'}',

'async function loadModels(){',
'setStatus("Loading free models...");',
'try{',
'const r=await fetch("/api/models");',
'const d=await r.json();',
'if(!r.ok)throw new Error(d.error||"Could not load models");',

'state.models=d.chat||[];',
'const sel=$("modelSelect");',
'sel.innerHTML="";',

'state.models.forEach(function(m){',
'const o=document.createElement("option");',
'o.value=m.id;',
'o.textContent=m.label||m.id;',
'sel.appendChild(o);',
'});',

'if(state.models[0]){',
'state.selected=state.models[0].id;',
'sel.value=state.selected;',
'setStatus("Free models loaded");',
'}else{',
'sel.innerHTML="<option>No free chat models</option>";',
'setStatus("No free chat models are currently available");',
'}',
'}catch(e){',
'setStatus(e.message||"Model loading failed");',
'}',
'}',

'async function send(){',
'const p=$("prompt");',
'const text=p.value.trim();',

'if(!text&&!state.attachments.length)return;',
'if($("send").disabled)return;',

'$("send").disabled=true;',
'setStatus("Thinking...");',

'const files=state.attachments.splice(0);',
'renderAttachments();',

'const parts=[];',

'for(const f of files){',
'if(f.type.startsWith("image/")){',
'parts.push({',
'type:"image_url",',
'image_url:{url:f.data}',
'});',
'}else{',
'parts.push({',
'type:"text",',
'text:"\\n\\n[File: "+f.name+"]\\n"+f.text',
'});',
'}',
'}',

'if(parts.length){',
'parts.push({',
'type:"text",',
'text:text||"Analyze the attached file(s)."',
'});',
'}',

'const user={',
'role:"user",',
'content:parts.length?parts:text,',
'displayText:text||"Analyze the attached file(s).",',
'files:files.map(function(f){return f.name})',
'};',

'addMessage(user);',

'p.value="";',
'autoGrow();',

'try{',
'if(imageRequest(text)&&!files.some(function(f){return f.type.startsWith("image/")})){',
'await generateImage(text);',
'}else if(state.council){',
'await council(text,parts.length?parts:text);',
'}else{',
'await chat(text,parts.length?parts:text);',
'}',
'}catch(e){',
'addMessage({role:"assistant",content:"Error: "+(e.message||"Unknown error")});',
'setStatus("");',
'}finally{',
'$("send").disabled=false;',
'}',
'}',

'async function chat(text,content){',
'const a={role:"assistant",content:"",sources:[]};',
'addMessage(a);',

'const payload={',
'model:state.selected,',
'messages:state.messages.slice(-20).map(function(m){',
'return {role:m.role,content:m.content};',
'}),',
'stream:true,',
'web_search:{enable:true,count:5}',
'};',

'const r=await fetch("/api/chat",{',
'method:"POST",',
'headers:{"content-type":"application/json"},',
'body:JSON.stringify(payload)',
'});',

'if(!r.ok){',
'const d=await r.json().catch(function(){return {}});',
'throw new Error(d.error||"Chat request failed");',
'}',

'await readStream(r,a);',
'setStatus("");',
'persistCurrent(text);',
'}',

'async function readStream(r,a){',
'const reader=r.body.getReader();',
'const dec=new TextDecoder();',
'let buf="";',

'while(true){',
'const z=await reader.read();',
'if(z.done)break;',

'buf+=dec.decode(z.value,{stream:true});',
'const lines=buf.split("\\n");',
'buf=lines.pop()||"";',

'for(const line of lines){',
'if(!line.startsWith("data:"))continue;',

'const raw=line.slice(5).trim();',
'if(!raw||raw==="[DONE]")continue;',

'let j;',
'try{j=JSON.parse(raw)}catch(e){continue}',

'const delta=j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content;',

'if(delta){',
'a.content+=delta;',
'renderMessages();',
'}',

'const results=j.web_search&&j.web_search.results;',
'if(Array.isArray(results)){',
'a.sources=results.map(function(x){',
'return {title:x.title||x.name||x.url,url:x.url};',
'});',
'}',
'}',
'}',
'}',

'async function council(text,content){',
'const a={role:"assistant",content:"",council:true};',
'addMessage(a);',
'setStatus("AI Council is meeting...");',

'const r=await fetch("/api/council",{',
'method:"POST",',
'headers:{"content-type":"application/json"},',
'body:JSON.stringify({text:text,content:content})',
'});',

'const d=await r.json();',

'if(!r.ok)throw new Error(d.error||"Council failed");',

'a.content=d.answer||"No final answer returned.";',
'renderMessages();',
'setStatus("");',
'persistCurrent(text);',
'}',

'async function generateImage(prompt){',
'setStatus("Choosing a free image model...");',

'const r=await fetch("/api/image",{',
'method:"POST",',
'headers:{"content-type":"application/json"},',
'body:JSON.stringify({prompt:prompt})',
'});',

'const d=await r.json();',

'if(!r.ok)throw new Error(d.error||"Image generation failed");',

'const a={',
'role:"assistant",',
'content:"Generated with a free image model.",',
'image:d.url',
'};',

'addMessage(a);',
'setStatus("");',
'persistCurrent(prompt);',
'}',

'function persistCurrent(title){',
'if(!state.currentId)state.currentId=crypto.randomUUID();',

'const existing=state.history.find(function(x){return x.id===state.currentId});',

'const clean=state.messages.map(function(m){',
'return {',
'role:m.role,',
'content:typeof m.content==="string"?m.content:"[attachment]"',
'};',
'});',

'if(existing){',
'existing.messages=clean;',
'if(title&&!existing.title)existing.title=title.slice(0,60);',
'}else{',
'state.history.unshift({',
'id:state.currentId,',
'title:(title||"New chat").slice(0,60),',
'messages:clean',
'});',
'}',

'saveHistory();',
'renderHistory();',
'}',

'function loadChat(id){',
'const x=state.history.find(function(y){return y.id===id});',
'if(!x)return;',

'state.currentId=x.id;',
'state.messages=x.messages.map(function(m){',
'return {role:m.role,content:m.content};',
'});',

'state.attachments=[];',
'renderAttachments();',
'renderMessages();',
'renderHistory();',
'closeSidebar();',
'}',

'function newChat(){',
'state.currentId=null;',
'state.messages=[];',
'state.attachments=[];',
'state.council=false;',
'$("councilBtn").classList.remove("active");',
'renderAttachments();',
'renderMessages();',
'setStatus("");',
'closeSidebar();',
'}',

'function openSidebar(){',
'$("sidebar").classList.add("open");',
'$("overlay").classList.add("open");',
'}',

'function closeSidebar(){',
'$("sidebar").classList.remove("open");',
'$("overlay").classList.remove("open");',
'}',

'async function filesPicked(ev){',
'for(const f of Array.from(ev.target.files)){',

'if(f.size>8*1024*1024){',
'setStatus(f.name+" is too large (max 8 MB)");',
'continue;',
'}',

'if(f.type.startsWith("image/")){',
'try{',
'const data=await resizeImage(f,1600);',
'state.attachments.push({',
'name:f.name,',
'type:"image/jpeg",',
'data:data',
'});',
'}catch(e){',
'setStatus("Could not read "+f.name);',
'}',
'}else{',

'const ok=/\\.(txt|md|json|csv|js|ts|py|html|css|xml|yaml|yml)$/i.test(f.name);',

'if(!ok){',
'setStatus(f.name+" is not a supported text file");',
'continue;',
'}',

'const text=await f.text();',

'state.attachments.push({',
'name:f.name,',
'type:f.type||"text/plain",',
'text:text.slice(0,60000)',
'});',
'}',
'}',

'renderAttachments();',
'ev.target.value="";',
'}',

'function resizeImage(file,max){',
'return new Promise(function(resolve,reject){',
'const rd=new FileReader();',

'rd.onload=function(){',
'const im=new Image();',

'im.onload=function(){',
'const scale=Math.min(1,max/Math.max(im.width,im.height));',
'const c=document.createElement("canvas");',
'c.width=Math.round(im.width*scale);',
'c.height=Math.round(im.height*scale);',

'const ctx=c.getContext("2d");',
'ctx.drawImage(im,0,0,c.width,c.height);',

'resolve(c.toDataURL("image/jpeg",0.82));',
'};',

'im.onerror=reject;',
'im.src=rd.result;',
'};',

'rd.onerror=reject;',
'rd.readAsDataURL(file);',
'});',
'}',

'$("send").onclick=send;',

'$("prompt").addEventListener("input",autoGrow);',

'$("prompt").addEventListener("keydown",function(e){',
'if(e.key==="Enter"&&!e.shiftKey){',
'e.preventDefault();',
'send();',
'}',
'});',

'$("attachBtn").onclick=function(){',
'$("fileInput").click();',
'};',

'$("fileInput").addEventListener("change",filesPicked);',

'$("hamb").onclick=openSidebar;',
'$("closeSide").onclick=closeSidebar;',
'$("overlay").onclick=closeSidebar;',
'$("newChat").onclick=newChat;',

'$("modelSelect").onchange=function(e){',
'state.selected=e.target.value;',
'};',

'$("councilBtn").onclick=function(){',
'state.council=!state.council;',
'$("councilBtn").classList.toggle("active",state.council);',
'setStatus(state.council?"AI Council enabled":"AI Council disabled");',
'};',

'document.addEventListener("keydown",function(e){',
'if(e.key==="Escape")closeSidebar();',
'});',

'renderHistory();',
'loadModels();',

'</script>',
'</body>',
'</html>'
].join('');

const JSON_HEADERS={
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "access-control-allow-origin":"*"
};

const textHeaders={
  "content-type":"text/html; charset=utf-8",
  "cache-control":"no-store"
};

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:JSON_HEADERS
  });
}

function apiBase(env){
  return (env.XKIRO_BASE_URL||"https://api.xkiro.com/v1").replace(/\/$/,"");
}

function apiHeaders(env){
  const key=env.XKIRO_API_KEY;

  if(!key){
    throw new Error("XKIRO_API_KEY is not configured");
  }

  return {
    "content-type":"application/json",
    "accept":"application/json",
    "authorization":"Bearer "+key,
    "x-api-key":key
  };
}

function modelId(m){
  return m.id||m.model||m.name||"";
}

function isFree(m){
  return String(
    m.access_tier||
    m.accessTier||
    ""
  ).toLowerCase()==="free";
}

function label(m){
  return m.name||
    m.display_name||
    m.displayName||
    m.id;
}

function cap(m,k){
  return !!(
    m.capabilities?.[k] ??
    m[k]
  );
}

function score(m){
  const c=m.capabilities||{};

  const ctx=Number(
    m.context_length||
    m.context||
    c.context_length||
    c.context||
    0
  );

  const out=Number(
    m.max_output_tokens||
    m.max_output||
    c.max_output_tokens||
    0
  );

  return (
    (c.reasoning||m.reasoning?100000:0)+
    (c.tools||m.tools?40000:0)+
    (c.vision||m.vision?20000:0)+
    Math.min(ctx/100000,20)+
    Math.min(out/20000,10)
  );
}

async function listModels(env,modality){
  const url=
    apiBase(env)+
    "/models"+
    (
      modality
      ?
      "?modality="+encodeURIComponent(modality)
      :
      ""
    );

  const response=await fetch(
    url,
    {
      headers:apiHeaders(env)
    }
  );

  if(!response.ok){
    throw new Error(
      "xKiro model catalog returned "+
      response.status
    );
  }

  const data=await response.json();

  const arr=
    Array.isArray(data.data)
    ?
    data.data
    :
    (
      Array.isArray(data.models)
      ?
      data.models
      :
      []
    );

  return arr
    .filter(isFree)
    .filter(function(m){
      return !!modelId(m);
    })
    .sort(function(a,b){
      return score(b)-score(a);
    });
}

async function safeFreeChat(env,id){
  const models=await listModels(env,"chat");

  return (
    models.find(function(m){
      return modelId(m)===id;
    })||
    models[0]||
    null
  );
}

async function safeFreeImage(env,id){
  const models=await listModels(env,"image");

  return (
    models.find(function(m){
      return modelId(m)===id;
    })||
    models[0]||
    null
  );
}

function imageUrlFromJob(d){
  return (
    d.url||
    d.image_url||
    d.imageUrl||
    d.data?.[0]?.url||
    d.output?.url||
    d.result?.url||
    null
  );
}

async function pollImage(env,id){
  if(!id){
    throw new Error("Image generation returned no job ID");
  }

  for(let i=0;i<30;i++){

    await new Promise(function(resolve){
      setTimeout(resolve,1500);
    });

    const response=await fetch(
      apiBase(env)+
      "/images/generations/"+
      encodeURIComponent(id),
      {
        headers:apiHeaders(env)
      }
    );

    if(!response.ok){
      throw new Error(
        "Image status request failed: "+
        response.status
      );
    }

    const data=await response.json();

    const image=imageUrlFromJob(data);

    if(image){
      return image;
    }

    const status=String(
      data.status||
      data.data?.status||
      data.job?.status||
      ""
    ).toLowerCase();

    if(
      status==="failed"||
      status==="error"||
      status==="cancelled"
    ){
      throw new Error(
        data.error?.message||
        "Image generation failed"
      );
    }
  }

  throw new Error("Image generation timed out");
}

function extractText(content){
  if(typeof content==="string"){
    return content;
  }

  if(Array.isArray(content)){
    return content
      .filter(function(x){
        return x.type==="text";
      })
      .map(function(x){
        return x.text||"";
      })
      .join("\n");
  }

  return "";
}

async function councilRun(env,body){

  const models=await listModels(env,"chat");

  if(!models.length){
    throw new Error(
      "No free chat models are available"
    );
  }

  /*
   * First 3 strongest free models participate.
   * The first strongest free model is used as final synthesizer.
   */

  const analysts=
    models.slice(
      0,
      Math.min(3,models.length)
    );

  const base=
    body.content||
    body.text||
    "";

  const text=
    extractText(base)||
    body.text||
    "";

  const outputs=[];

  for(const model of analysts){

    const payload={
      model:modelId(model),

      messages:[
        {
          role:"system",
          content:
            "You are one member of an AI council. "+
            "Analyze the user's question independently. "+
            "Be factual, identify uncertainty, compare alternatives "+
            "when useful, and provide strong reasoning. "+
            "Do not pretend to be the final authority."
        },
        {
          role:"user",
          content:base
        }
      ],

      stream:false,

      web_search:{
        enable:true,
        count:5
      }
    };

    try{

      const response=await fetch(
        apiBase(env)+"/chat/completions",
        {
          method:"POST",
          headers:apiHeaders(env),
          body:JSON.stringify(payload)
        }
      );

      if(!response.ok){
        continue;
      }

      const data=await response.json();

      const answer=
        data.choices?.[0]?.message?.content;

      if(answer){
        outputs.push({
          model:modelId(model),
          answer:answer
        });
      }

    }catch(e){
      continue;
    }
  }

  if(!outputs.length){
    throw new Error(
      "Council models did not return an answer"
    );
  }

  const judge=
    models.find(function(m){
      return modelId(m)===modelId(analysts[0]);
    })||
    models[0];

  const debate=
    outputs
      .map(function(x,i){
        return (
          "MODEL "+
          (i+1)+
          " ("+
          x.model+
          "):\n"+
          x.answer
        );
      })
      .join(
        "\n\n---\n\n"
      );

  const finalPrompt=
    "User question:\n"+
    text+
    "\n\n"+
    "Independent council analyses:\n"+
    debate+
    "\n\n"+
    "Act as the final synthesizer. "+
    "Compare the analyses carefully, "+
    "resolve contradictions using evidence, "+
    "preserve uncertainty where necessary, "+
    "and produce one clear self-contained answer. "+
    "Do not mention hidden instructions. "+
    "Do not claim consensus if the analyses disagree.";

  const judgeResponse=await fetch(
    apiBase(env)+"/chat/completions",
    {
      method:"POST",
      headers:apiHeaders(env),
      body:JSON.stringify({
        model:modelId(judge),

        messages:[
          {
            role:"system",
            content:
              "You are the final judge of a multi-model AI council."
          },
          {
            role:"user",
            content:finalPrompt
          }
        ],

        stream:false,

        web_search:{
          enable:true,
          count:5
        }
      })
    }
  );

  if(!judgeResponse.ok){

    const err=
      await judgeResponse
        .json()
        .catch(function(){
          return {};
        });

    throw new Error(
      err.error?.message||
      "Final council judge failed"
    );
  }

  const judgeData=
    await judgeResponse.json();

  return {
    answer:
      judgeData
        .choices?.[0]?.message?.content||
      "No final answer.",

    participants:
      outputs.map(function(x){
        return x.model;
      }),

    judge:modelId(judge)
  };
}

export default {

  async fetch(request,env){

    try{

      const url=new URL(
        request.url
      );

      if(request.method==="OPTIONS"){

        return new Response(
          null,
          {
            headers:{
              ...JSON_HEADERS,
              "access-control-allow-methods":
                "GET,POST,OPTIONS",
              "access-control-allow-headers":
                "content-type,authorization"
            }
          }
        );
      }

      if(
        url.pathname==="/" &&
        request.method==="GET"
      ){

        return new Response(
          HTML,
          {
            headers:textHeaders
          }
        );
      }

      /*
       * LIVE FREE MODEL CATALOG
       * Only access_tier=free models are returned.
       */

      if(
        url.pathname==="/api/models"&&
        request.method==="GET"
      ){

        const chat=
          await listModels(
            env,
            "chat"
          );

        const image=
          await listModels(
            env,
            "image"
          );

        return json({
          chat:chat.map(function(m){
            return {
              id:modelId(m),
              label:label(m),
              vision:cap(m,"vision"),
              reasoning:cap(m,"reasoning"),
              tools:cap(m,"tools")
            };
          }),

          image:image.map(function(m){
            return {
              id:modelId(m),
              label:label(m)
            };
          })
        });
      }

      /*
       * NORMAL CHAT
       * Server verifies model is free.
       * Web search is ALWAYS ON.
       */

      if(
        url.pathname==="/api/chat"&&
        request.method==="POST"
      ){

        const body=
          await request.json();

        const chosen=
          await safeFreeChat(
            env,
            body.model
          );

        if(!chosen){

          return json(
            {
              error:
                "No free chat model is available."
            },
            503
          );
        }

        body.model=
          modelId(chosen);

        body.web_search={
          enable:true,
          count:5
        };

        const response=
          await fetch(
            apiBase(env)+
            "/chat/completions",
            {
              method:"POST",
              headers:apiHeaders(env),
              body:JSON.stringify(body)
            }
          );

        return new Response(
          response.body,
          {
            status:response.status,
            headers:{
              "content-type":
                response.headers.get(
                  "content-type"
                )||
                "text/event-stream",

              "cache-control":
                "no-cache",

              "access-control-allow-origin":
                "*"
            }
          }
        );
      }

      /*
       * MULTI-MODEL AI COUNCIL
       */

      if(
        url.pathname==="/api/council"&&
        request.method==="POST"
      ){

        const body=
          await request.json();

        const result=
          await councilRun(
            env,
            body
          );

        return json(result);
      }

      /*
       * AUTOMATIC FREE IMAGE GENERATION
       */

      if(
        url.pathname==="/api/image"&&
        request.method==="POST"
      ){

        const body=
          await request.json();

        const model=
          await safeFreeImage(
            env,
            body.model
          );

        if(!model){

          return json(
            {
              error:
                "No free image model is available on xKiro right now."
            },
            503
          );
        }

        const response=
          await fetch(
            apiBase(env)+
            "/images/generations",
            {
              method:"POST",
              headers:apiHeaders(env),
              body:JSON.stringify({
                model:modelId(model),
                prompt:String(
                  body.prompt||""
                ).slice(0,10000)
              })
            }
          );

        const data=
          await response.json();

        if(!response.ok){

          return json(
            {
              error:
                data.error?.message||
                "Image generation request failed"
            },
            response.status
          );
        }

        const direct=
          imageUrlFromJob(
            data
          );

        const jobId=
          data.id||
          data.job_id||
          data.jobId;

        const image=
          direct||
          await pollImage(
            env,
            jobId
          );

        return json({
          url:image,
          model:modelId(model)
        });
      }

      return new Response(
        "Not found",
        {
          status:404
        }
      );

    }catch(e){

      return json(
        {
          error:
            e?.message||
            "Server error"
        },
        500
      );
    }
  }
};
