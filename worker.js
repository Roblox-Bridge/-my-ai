
const PROVIDERS = {
  codecraft: {
    name: "CodeCraft",
    base: "https://www.codecraftapi.com/v1",
    keyEnv: "CODECRAFT_API_KEY"
  },
  cometapi: {
    name: "CometAPI",
    base: "https://api.cometapi.com/v1",
    keyEnv: "COMETAPI_API_KEY"
  }
};

const DEFAULT_PROVIDER = "codecraft";
const DEFAULT_MODEL = "";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const MAX_BODY_SIZE = 10 * 1024 * 1024;

const APP_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#101010">
<meta name="description" content="Your personal AI chat workspace">
<link rel="manifest" href="/manifest.json">
<title>My AI</title>
<style>
:root{color-scheme:dark;--bg:#101010;--panel:#171717;--panel2:#202020;--line:#303030;--text:#f5f5f5;--muted:#a0a0a0;--accent:#d8d8d8}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
button:disabled{opacity:.45;cursor:not-allowed}
.app{display:flex;height:100dvh;overflow:hidden}
.sidebar{width:270px;flex-shrink:0;background:#151515;border-right:1px solid var(--line);display:flex;flex-direction:column;padding:14px;gap:12px;z-index:5}
.brand{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;padding:8px 4px}
.logo{width:32px;height:32px;border-radius:11px;background:#f2f2f2;color:#111;display:grid;place-items:center;font-weight:900}
.btn{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:11px;padding:10px 12px}
.btn:hover{background:#2b2b2b}
.btn.primary{background:#f0f0f0;color:#111;border-color:#f0f0f0;font-weight:650}
.btn.full{width:100%;text-align:left}
.sidebar-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin:8px 4px 0}
.history{flex:1;overflow:auto;display:flex;flex-direction:column;gap:4px}
.history-item{display:flex;gap:6px;align-items:center;border-radius:9px;padding:8px 9px;color:#ddd}
.history-item.active,.history-item:hover{background:#252525}
.history-title{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer}
.icon-btn{border:0;background:transparent;color:#aaa;border-radius:8px;padding:6px}
.icon-btn:hover{background:#333;color:white}
.side-bottom{display:grid;gap:7px}
.main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}
.topbar{height:60px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px;padding:0 18px}
.topbar-title{font-weight:650;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.select{background:#1c1c1c;color:#eee;border:1px solid var(--line);border-radius:9px;padding:8px;max-width:190px;min-width:0}
.content{flex:1;overflow:auto;scroll-behavior:smooth}
.welcome{max-width:760px;margin:12vh auto 30px;padding:20px}
.welcome h1{font-size:clamp(28px,5vw,42px);letter-spacing:-1.5px;line-height:1.15;margin:0 0 12px}
.sub{color:var(--muted)}
.suggestions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:28px}
.suggestion{background:#181818;border:1px solid var(--line);color:#ddd;border-radius:14px;padding:14px;text-align:left}
.suggestion:hover{background:#222}
.messages{max-width:850px;margin:0 auto;padding:25px 22px 36px}
.message{display:flex;gap:12px;margin:0 0 26px;min-width:0}
.avatar{width:30px;height:30px;border:1px solid var(--line);border-radius:10px;display:grid;place-items:center;flex-shrink:0;font-size:12px;background:#1c1c1c}
.message-body{flex:1;min-width:0;overflow-wrap:anywhere}
.message-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:650;margin-bottom:5px}
.message-text{line-height:1.75}
.message-text p{margin:0 0 12px}
.message-text h1,.message-text h2,.message-text h3{line-height:1.3;margin:22px 0 10px}
.message-text h1{font-size:1.5em}.message-text h2{font-size:1.3em}.message-text h3{font-size:1.12em}
.message-text ul,.message-text ol{padding-left:24px}
.message-text blockquote{margin:12px 0;border-left:3px solid #666;padding:4px 14px;color:#bbb}
.message-text a{color:#c5dfff}
.message-text pre{position:relative;overflow:auto;background:#090909;border:1px solid #303030;border-radius:12px;padding:42px 14px 14px;margin:12px 0;white-space:pre}
.message-text code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}
.message-text p code,.message-text li code{background:#292929;border-radius:5px;padding:2px 5px}
.message-text pre code{background:none;padding:0}
.code-copy{position:absolute;right:8px;top:7px}
.msg-tools{display:flex;gap:4px;margin-top:7px;opacity:.85}
.msg-tools button{font-size:12px}
.message-image{display:block;max-width:min(100%,600px);max-height:520px;object-fit:contain;border-radius:12px;border:1px solid var(--line);margin:10px 0}
.file-chip{font-size:12px;border:1px solid var(--line);background:#202020;border-radius:8px;padding:5px 8px;display:inline-block;margin:0 0 8px;color:#ccc}
.composer-area{padding:10px 18px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(transparent,var(--bg) 20%)}
.composer{max-width:850px;margin:auto;border:1px solid #3a3a3a;border-radius:19px;background:#1b1b1b;padding:10px 12px;box-shadow:0 8px 32px #0003}
.composer textarea{width:100%;resize:none;max-height:190px;min-height:42px;border:0;outline:0;background:transparent;color:#fff;padding:8px;font-size:15px;line-height:1.55}
.composer-bottom{display:flex;align-items:center;gap:7px}
.composer-bottom .spacer{flex:1}
.round{width:39px;height:39px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:#2b2b2b;color:white;font-size:17px}
.round.send{background:#f5f5f5;color:#111;border-color:#f5f5f5}
.round.selected{background:#424242;border-color:#777}
.hint{text-align:center;color:#777;font-size:11px;margin-top:8px}
.status{font-size:12px;color:#aaa;padding:0 4px;min-height:18px}
.attachments{display:flex;gap:6px;flex-wrap:wrap}
.attachment{font-size:12px;background:#303030;border-radius:8px;padding:4px 8px;display:flex;align-items:center;gap:6px}
.overlay{display:none;position:fixed;inset:0;background:#0009;z-index:10}
.overlay.show{display:block}
.drawer{position:absolute;left:0;top:0;bottom:0;width:min(300px,85vw);background:#151515;padding:14px;display:flex;flex-direction:column;gap:12px}
.modal-backdrop{position:fixed;inset:0;background:#000a;display:none;place-items:center;z-index:20;padding:18px}
.modal-backdrop.show{display:grid}
.modal{width:min(500px,100%);max-height:85dvh;overflow:auto;background:#191919;border:1px solid var(--line);border-radius:16px;padding:20px}
.modal h2{margin-top:0}
.modal textarea,.modal input{width:100%;background:#101010;color:white;border:1px solid var(--line);border-radius:9px;padding:10px;margin:6px 0 12px}
.modal textarea{min-height:130px}
.hidden{display:none!important}
.toast{position:fixed;bottom:105px;left:50%;transform:translateX(-50%);background:#ededed;color:#111;padding:9px 15px;border-radius:10px;font-size:13px;z-index:40;box-shadow:0 4px 20px #0006}
@media(max-width:700px){.sidebar{display:none}.topbar{padding:0 10px;height:56px}.topbar .select{max-width:125px;font-size:12px;padding:7px}.welcome{margin:8vh auto 20px;padding:18px}.suggestions{grid-template-columns:1fr}.messages{padding:20px 13px 25px}.composer-area{padding:8px 10px calc(10px + env(safe-area-inset-bottom))}.message{gap:9px}.avatar{width:27px;height:27px}.hint{font-size:10px}}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<div class="brand"><div class="logo">M</div><span>My AI</span></div>
<button class="btn full primary" id="newChat">＋ New chat</button>
<button class="btn full" id="searchChats">⌕ Search chats</button>
<div class="sidebar-label">Recent chats</div>
<div class="history" id="history"></div>
<div class="side-bottom">
<button class="btn full" id="memoryBtn">▤ Local memory</button>
<button class="btn full" id="installBtn">⇩ Install app</button>
<button class="btn full" id="clearBtn">Clear chat history</button>
<div class="status" id="modelStatus">Connecting…</div>
</div>
</aside>
<main class="main">
<header class="topbar">
<button class="icon-btn" id="menuBtn" aria-label="Open menu">☰</button>
<div class="topbar-title" id="topTitle">New chat</div>
<select class="select" id="providerSelect" aria-label="API provider">
<option value="codecraft">CodeCraft</option>
<option value="cometapi">CometAPI</option>
</select>
<select class="select" id="modelSelect" aria-label="AI model">
<option value="">Loading models…</option>
</select>
</header>
<section class="content" id="content">
<div class="welcome" id="welcome">
<h1>What can I help with?</h1>
<div class="sub">Your personal AI workspace. Ask, create, explore and learn.</div>
<div class="suggestions">
<button class="suggestion" data-prompt="Explain a difficult topic in simple English, step by step.">✦ Learn something new<br><span class="sub">Clear, simple explanations</span></button>
<button class="suggestion" data-prompt="Help me write clean, reliable code. Explain the solution and common mistakes.">⌘ Write or debug code<br><span class="sub">Understand the solution</span></button>
<button class="suggestion" data-prompt="Research this topic. If live web search is available, use recent sources and clearly cite them.">⌕ Research a topic<br><span class="sub">Sources when actually available</span></button>
<button class="suggestion" data-prompt="Give me three creative ideas for a useful personal project, with a practical first step for each.">✧ Brainstorm ideas<br><span class="sub">Turn ideas into a plan</span></button>
</div>
</div>
<div class="messages hidden" id="messages"></div>
</section>
<div class="composer-area">
<div class="composer">
<div class="attachments" id="attachments"></div>
<textarea id="prompt" rows="1" placeholder="Message My AI…" aria-label="Message"></textarea>
<div class="composer-bottom">
<button class="round" id="attachBtn" title="Attach a file">＋</button>
<button class="round" id="imageModeBtn" title="Generate an image">▧</button>
<div class="spacer"></div>
<button class="round" id="stopBtn" title="Stop generating" disabled>■</button>
<button class="round send" id="sendBtn" title="Send message">↑</button>
</div>
</div>
<div class="hint">AI can make mistakes. Check important information.</div>
<input id="fileInput" class="hidden" type="file" multiple accept="image/*,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.log">
</div>
</main>
</div>
<div class="overlay" id="overlay"><div class="drawer">
<div class="brand"><div class="logo">M</div><span>My AI</span><button class="icon-btn" id="closeMenu" style="margin-left:auto">✕</button></div>
<button class="btn full primary" id="drawerNew">＋ New chat</button>
<div class="sidebar-label">Recent chats</div><div class="history" id="drawerHistory"></div>
<button class="btn full" id="drawerMemory">▤ Local memory</button>
<button class="btn full" id="drawerClear">Clear chat history</button>
</div></div>
<div class="modal-backdrop" id="memoryModal">
<div class="modal"><h2>Local memory</h2><p class="sub">Saved only in this browser on this device. Add preferences or context you want the AI to use.</p>
<textarea id="memoryText" placeholder="Example: Explain things in simple English."></textarea>
<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="memoryCancel">Cancel</button><button class="btn primary" id="memorySave">Save memory</button></div></div>
</div>
<div class="modal-backdrop" id="searchModal">
<div class="modal"><h2>Search chats</h2><input id="searchInput" placeholder="Search chat titles and messages">
<div id="searchResults"></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" id="searchClose">Close</button></div></div>
</div>
<div id="toast" class="toast hidden"></div>
<script>
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var KEYS={history:"my_ai_history_v10",current:"my_ai_current_v10",memory:"my_ai_memory_v10",model:"my_ai_model_v10",provider:"my_ai_provider_v10"};
var chats=[],currentId="",memory="",busy=false,controller=null,attachments=[],imageMode=false,toastTimer=null;
var deferredInstall=null;
var tick=String.fromCharCode(96);
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function safeParse(value,fallback){try{return JSON.parse(value)}catch(e){return fallback}}
function save(){try{localStorage.setItem(KEYS.history,JSON.stringify(chats));localStorage.setItem(KEYS.current,currentId)}catch(e){notify("Browser storage is full. Try clearing older chats.")}}
function notify(message){var t=$("toast");t.textContent=message;t.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.add("hidden")},2600)}
function escapeHTML(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function currentChat(){return chats.find(function(c){return c.id===currentId})}
function createChat(){var c={id:uid(),title:"New chat",messages:[],updated:Date.now()};chats.unshift(c);currentId=c.id;save();renderAll();closeDrawer();$("prompt").focus()}
function chooseChat(id){if(!chats.some(function(c){return c.id===id}))return;currentId=id;save();renderAll();closeDrawer()}
function closeDrawer(){$("overlay").classList.remove("show")}
function renderHistory(targetId){
var root=$(targetId);root.innerHTML="";
chats.slice().sort(function(a,b){return b.updated-a.updated}).forEach(function(c){
var row=document.createElement("div");row.className="history-item"+(c.id===currentId?" active":"");
var title=document.createElement("div");title.className="history-title";title.textContent=c.title||"New chat";title.onclick=function(){chooseChat(c.id)};
var del=document.createElement("button");del.className="icon-btn";del.textContent="×";del.title="Delete chat";del.onclick=function(e){e.stopPropagation();if(!confirm("Delete this chat?"))return;chats=chats.filter(function(x){return x.id!==c.id});if(currentId===c.id)currentId=chats.length?chats[0].id:"";if(!currentId){createChat();return}save();renderAll()};
row.appendChild(title);row.appendChild(del);root.appendChild(row)
})
}
function renderAll(){renderHistory("history");renderHistory("drawerHistory");renderMessages();var c=currentChat();$("topTitle").textContent=c?(c.title||"New chat"):"New chat"}
function scrollBottom(force){if(force)$("content").scrollTop=$("content").scrollHeight}
function formatInline(text){
var parts=text.split(tick),out="";
for(var i=0;i<parts.length;i++){
if(i%2===1){out+="<code>"+escapeHTML(parts[i])+"</code>";continue}
var s=escapeHTML(parts[i]);
s=s.replace(/\\*\\*(.+?)\\*\\*/g,"<strong>$1</strong>").replace(/~~(.+?)~~/g,"<del>$1</del>").replace(/\\*(?!\\s)(.+?)(?<!\\s)\\*/g,"<em>$1</em>");
s=s.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
out+=s
}
return out
}
function markdown(src){
var lines=String(src||"").replace(/\\r/g,"").split("\\n"),out=[],para=[],inCode=false,code=[],codeLang="";
function flush(){if(para.length){out.push("<p>"+para.map(formatInline).join("<br>")+"</p>");para=[]}}
function flushCode(){out.push('<pre><button class="btn code-copy" data-copy-code="1">Copy code</button><code>'+escapeHTML(code.join("\\n"))+"</code></pre>");code=[]}
for(var i=0;i<lines.length;i++){
var line=lines[i],trim=line.trim();
if(trim.startsWith(tick.repeat(3))){
if(!inCode){flush();inCode=true;codeLang=trim.slice(3).trim();code=[]}else{flushCode();inCode=false}
continue
}
if(inCode){code.push(line);continue}
if(!trim){flush();continue}
var hm=trim.match(/^(#{1,3})\\s+(.+)$/);
if(hm){flush();var level=hm[1].length;out.push("<h"+level+">"+formatInline(hm[2])+"</h"+level+">");continue}
if(/^[-*_]{3,}$/.test(trim)){flush();out.push("<hr>");continue}
if(trim.startsWith(">")){flush();out.push("<blockquote>"+formatInline(trim.replace(/^>\\s?/,""))+"</blockquote>");continue}
var ul=trim.match(/^[-*+]\\s+(.+)$/),ol=trim.match(/^\\d+[.)]\\s+(.+)$/);
if(ul||ol){
flush();var tag=ul?"ul":"ol",items=[];
while(i<lines.length){var m=lines[i].trim().match(ul?/^[-*+]\\s+(.+)$/:/^\\d+[.)]\\s+(.+)$/);if(!m){i--;break}items.push("<li>"+formatInline(m[1])+"</li>");i++}
out.push("<"+tag+">"+items.join("")+"</"+tag+">");continue
}
para.push(line)
}
if(inCode)flushCode();flush();return out.join("\\n")
}
function renderMessages(){
var c=currentChat(),root=$("messages"),welcome=$("welcome");
if(!c||!c.messages.length){welcome.classList.remove("hidden");root.classList.add("hidden");root.innerHTML="";return}
welcome.classList.add("hidden");root.classList.remove("hidden");root.innerHTML="";
c.messages.forEach(function(m,index){
var row=document.createElement("article");row.className="message";
var avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=m.role==="user"?"Y":"M";
var body=document.createElement("div");body.className="message-body";
var head=document.createElement("div");head.className="message-head";head.textContent=m.role==="user"?"You":"My AI";
body.appendChild(head);
if(m.fileNames&&m.fileNames.length){m.fileNames.forEach(function(n){var chip=document.createElement("div");chip.className="file-chip";chip.textContent="📎 "+n;body.appendChild(chip)})}
var text=document.createElement("div");text.className="message-text";
if(m.content)text.innerHTML=markdown(m.content);
if(m.imageUrl){var img=document.createElement("img");img.className="message-image";img.alt="Generated image";img.src=m.imageUrl;text.appendChild(img)}
if(!m.content&&!m.imageUrl&&m.role==="assistant")text.innerHTML='<span class="sub">No response content was returned.</span>';
body.appendChild(text);
var tools=document.createElement("div");tools.className="msg-tools";
if(m.content){var cp=document.createElement("button");cp.className="icon-btn";cp.textContent="Copy";cp.onclick=function(){copyText(m.content)};tools.appendChild(cp)}
if(m.role==="assistant"&&m.content){var regen=document.createElement("button");regen.className="icon-btn";regen.textContent="Regenerate";regen.onclick=function(){regenerate(index)};tools.appendChild(regen)}
if(tools.childNodes.length)body.appendChild(tools);
row.appendChild(avatar);row.appendChild(body);root.appendChild(row)
});
root.querySelectorAll("[data-copy-code]").forEach(function(btn){btn.onclick=function(){var code=btn.parentElement.querySelector("code");copyText(code?code.textContent:"")}});
if(!busy)scrollBottom(false)
}
function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(String(text)).then(function(){notify("Copied")}).catch(function(){fallbackCopy(text)})}else fallbackCopy(text)}
function fallbackCopy(text){var ta=document.createElement("textarea");ta.value=String(text);ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{var ok=document.execCommand("copy");notify(ok?"Copied":"Could not copy automatically")}catch(e){notify("Could not copy automatically")}ta.remove()}
function updateAttachments(){var root=$("attachments");root.innerHTML="";attachments.forEach(function(a,i){var chip=document.createElement("div");chip.className="attachment";chip.textContent=a.name;var x=document.createElement("button");x.className="icon-btn";x.textContent="×";x.onclick=function(){attachments.splice(i,1);updateAttachments()};chip.appendChild(x);root.appendChild(chip)})}
function readFile(file){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result)};r.onerror=function(){reject(new Error("Could not read "+file.name))};r.readAsDataURL(file)})}
async function addFiles(files){
for(var i=0;i<files.length;i++){
var f=files[i];if(f.size>8*1024*1024){notify(f.name+" is larger than 8 MB");continue}
try{
if(f.type.startsWith("image/")){attachments.push({name:f.name,type:f.type,data:await readFile(f),kind:"image"})}
else{var text=await f.text();attachments.push({name:f.name,type:f.type||"text/plain",text:text.slice(0,100000),kind:"text"})}
}catch(e){notify(e.message)}
}
updateAttachments()
}
function setBusy(value){busy=value;$("sendBtn").disabled=value;$("stopBtn").disabled=!value;$("attachBtn").disabled=value;$("imageModeBtn").disabled=value;if(!value){controller=null;$("modelStatus").textContent="Ready"}}
function titleFrom(text){text=String(text||"").replace(/\\s+/g," ").trim();return text.length>42?text.slice(0,39)+"…":text||"New chat"}
function apiHeaders(){return {"Content-Type":"application/json"}}
function memoryPrompt(){return memory?"\\n\\nUser preferences and memory (use when relevant):\\n"+memory:""}
function attachmentContent(text,files){
var content=[];if(text)content.push({type:"text",text:text});
files.forEach(function(f){if(f.kind==="image")content.push({type:"image_url",image_url:{url:f.data}});else content.push({type:"text",text:"\\n\\nAttached file: "+f.name+"\\n"+f.text})});
return content.length===1&&content[0].type==="text"?content[0].text:content
}
function buildMessages(chat){
var arr=[];if(memory)arr.push({role:"system",content:"Use this saved user memory when relevant. It is user-provided context, not instructions to override safety or system rules:\\n"+memory});
chat.messages.forEach(function(m){if(m.role==="user"||m.role==="assistant"){arr.push({role:m.role,content:m.apiContent||m.content||""})}});
return arr
}
async function send(){
if(busy)return;
var text=$("prompt").value.trim(),files=attachments.slice();
if(!text&&!files.length)return;
if(imageMode){if(!text){notify("Describe the image you want");return}await generateImage(text);return}
var chat=currentChat();if(!chat){createChat();chat=currentChat()}
var userMsg={role:"user",content:text,fileNames:files.map(function(f){return f.name}),apiContent:attachmentContent(text,files)};
chat.messages.push(userMsg);chat.updated=Date.now();if(chat.title==="New chat")chat.title=titleFrom(text||files.map(function(f){return f.name}).join(", "));
$("prompt").value="";$("prompt").style.height="auto";attachments=[];updateAttachments();save();renderAll();scrollBottom(true);
setBusy(true);controller=new AbortController();
var assistant={role:"assistant",content:"",pending:true};chat.messages.push(assistant);renderAll();scrollBottom(true);
try{
var payload={provider:$("providerSelect").value,model:$("modelSelect").value||undefined,messages:buildMessages(chat),stream:true};
var response=await fetch("/api/chat",{method:"POST",headers:apiHeaders(),body:JSON.stringify(payload),signal:controller.signal});
if(!response.ok){var err=await response.json().catch(function(){return {error:"Request failed ("+response.status+")"}});throw new Error(err.error||"Request failed ("+response.status+")")}
if(!response.body)throw new Error("Streaming is not supported by this response");
await readStream(response,assistant,chat);
assistant.pending=false;
if(!assistant.content.trim())assistant.content="The provider returned no text. Try another model or check the API provider settings.";
}catch(e){
assistant.pending=false;
assistant.content=e.name==="AbortError"?(assistant.content?"\\n\\n*Generation stopped.*":"Generation stopped."):"Request error: "+(e.message||"Unknown error");
}finally{
setBusy(false);chat.updated=Date.now();save();renderAll();renderHistory("history");renderHistory("drawerHistory")
}
}
async function readStream(response,assistant,chat){
var reader=response.body.getReader(),decoder=new TextDecoder(),buffer="",done=false,received=false;
while(!done){
var result=await reader.read();done=result.done;
buffer+=decoder.decode(result.value||new Uint8Array(),{stream:!done});
var lines=buffer.split("\\n");buffer=lines.pop()||"";
for(var i=0;i<lines.length;i++){
var line=lines[i].replace(/\\r$/,"").trim();
if(!line||line.startsWith(":")||!line.startsWith("data:"))continue;
var raw=line.slice(5).trim();if(raw==="[DONE]"){done=true;break}
var obj;try{obj=JSON.parse(raw)}catch(e){continue}
if(obj.error)throw new Error(typeof obj.error==="string"?obj.error:(obj.error.message||"Provider error"));
var delta=obj.choices&&obj.choices[0]&&obj.choices[0].delta;
var piece=delta&&delta.content;
if(Array.isArray(piece))piece=piece.map(function(p){return p.text||""}).join("");
if(typeof piece==="string"&&piece){assistant.content+=piece;received=true;renderMessages();if($("content").scrollTop+ $("content").clientHeight >= $("content").scrollHeight-160)scrollBottom(true)}
}
}
if(buffer.trim().startsWith("data:")){
var rawEnd=buffer.trim().slice(5).trim();if(rawEnd&&rawEnd!=="[DONE]"){try{var objEnd=JSON.parse(rawEnd);var d=objEnd.choices&&objEnd.choices[0]&&objEnd.choices[0].delta;var p=d&&d.content;if(typeof p==="string")assistant.content+=p}catch(e){}}
}
if(!received&&!assistant.content)assistant.content=""
}
async function generateImage(prompt){
var chat=currentChat();if(!chat){createChat();chat=currentChat()}
chat.messages.push({role:"user",content:"Generate an image: "+prompt});if(chat.title==="New chat")chat.title=titleFrom(prompt);save();renderAll();scrollBottom(true);
setBusy(true);controller=new AbortController();
try{
var response=await fetch("/api/generate-image",{method:"POST",headers:apiHeaders(),body:JSON.stringify({prompt:prompt,provider:$("providerSelect").value}),signal:controller.signal});
var data=await response.json();if(!response.ok)throw new Error(data.error||"Image generation failed");
chat.messages.push({role:"assistant",content:"Generated image",imageUrl:data.image});
}catch(e){chat.messages.push({role:"assistant",content:"Image generation error: "+e.message})}
finally{setBusy(false);imageMode=false;$("imageModeBtn").classList.remove("selected");$("prompt").placeholder="Message My AI…";chat.updated=Date.now();save();renderAll();scrollBottom(true)}
}
function stop(){if(controller)controller.abort();setBusy(false)}
async function regenerate(index){
if(busy)return;var chat=currentChat();if(!chat)return;
if(index<0||index>=chat.messages.length||chat.messages[index].role!=="assistant")return;
chat.messages=chat.messages.slice(0,index);save();renderAll();
var lastUser=-1;for(var i=chat.messages.length-1;i>=0;i--){if(chat.messages[i].role==="user"){lastUser=i;break}}
if(lastUser<0)return;
var original=chat.messages.slice(lastUser+1);chat.messages=chat.messages.slice(0,lastUser+1);save();renderAll();
var assistant={role:"assistant",content:"",pending:true};chat.messages.push(assistant);setBusy(true);controller=new AbortController();
try{
var response=await fetch("/api/chat",{method:"POST",headers:apiHeaders(),body:JSON.stringify({provider:$("providerSelect").value,model:$("modelSelect").value||undefined,messages:buildMessages(chat),stream:true}),signal:controller.signal});
if(!response.ok){var err=await response.json().catch(function(){return {error:"Request failed"}});throw new Error(err.error||"Request failed")}
await readStream(response,assistant,chat);assistant.pending=false;
}catch(e){assistant.pending=false;assistant.content="Request error: "+e.message}
finally{setBusy(false);chat.updated=Date.now();save();renderAll();scrollBottom(true)}
}
async function loadModels(){
var provider=$("providerSelect").value,select=$("modelSelect"),status=$("modelStatus");
select.innerHTML='<option value="">Loading models…</option>';status.textContent="Loading models…";
var lastError="";
for(var attempt=0;attempt<3;attempt++){
var ctrl=new AbortController(),timer=setTimeout(function(){ctrl.abort()},12000);
try{
var r=await fetch("/api/models?provider="+encodeURIComponent(provider),{signal:ctrl.signal});var data=await r.json();
if(!r.ok)throw new Error(data.error||"Could not load models");
var models=Array.isArray(data.models)?data.models:[];
select.innerHTML="";
if(!models.length){select.innerHTML='<option value="">Enter model manually in request</option>';status.textContent="No models listed";return}
models.forEach(function(m){var opt=document.createElement("option");opt.value=m.id;opt.textContent=m.name||m.id;select.appendChild(opt)});
var saved=localStorage.getItem(KEYS.model+"_"+provider)||localStorage.getItem(KEYS.model)||"";
if(models.some(function(m){return m.id===saved}))select.value=saved;
else if(models.some(function(m){return m.id===DEFAULT_MODEL}))select.value=DEFAULT_MODEL;
else select.selectedIndex=0;
status.textContent=models.length+" models available";return
}catch(e){lastError=e.name==="AbortError"?"Model request timed out":e.message}
finally{clearTimeout(timer)}
}
select.innerHTML='<option value="">Models unavailable</option>';status.textContent="Models unavailable";
notify(lastError+" — check provider API key");
}
function saveSettings(){try{localStorage.setItem(KEYS.provider,$("providerSelect").value);localStorage.setItem(KEYS.model+"_"+$("providerSelect").value,$("modelSelect").value)}catch(e){}}
function loadState(){
try{chats=safeParse(localStorage.getItem(KEYS.history)||"[]",[]);if(!Array.isArray(chats))chats=[];chats=chats.filter(function(c){return c&&typeof c.id==="string"&&Array.isArray(c.messages)});memory=localStorage.getItem(KEYS.memory)||"";currentId=localStorage.getItem(KEYS.current)||"";if(!chats.some(function(c){return c.id===currentId}))currentId=chats.length?chats[0].id:"";if(!currentId){var c={id:uid(),title:"New chat",messages:[],updated:Date.now()};chats.unshift(c);currentId=c.id}var provider=localStorage.getItem(KEYS.provider);if(provider&&PROVIDER_VALUES.indexOf(provider)>=0)$("providerSelect").value=provider}catch(e){chats=[];memory="";var c={id:uid(),title:"New chat",messages:[],updated:Date.now()};chats=[c];currentId=c.id}
}
var PROVIDER_VALUES=["codecraft","cometapi"];
function openMemory(){$("memoryText").value=memory;$("memoryModal").classList.add("show")}
function runSearch(){
var q=$("searchInput").value.trim().toLowerCase(),root=$("searchResults");root.innerHTML="";
var matches=chats.filter(function(c){return !q||(c.title+" "+c.messages.map(function(m){return m.content||""}).join(" ")).toLowerCase().includes(q)}).slice(0,30);
if(!matches.length){root.textContent="No matching chats.";return}
matches.forEach(function(c){var b=document.createElement("button");b.className="btn full";b.style.margin="4px 0";b.textContent=c.title||"New chat";b.onclick=function(){$("searchModal").classList.remove("show");chooseChat(c.id)};root.appendChild(b)})
}
$("newChat").onclick=createChat;$("drawerNew").onclick=createChat;
$("menuBtn").onclick=function(){$("overlay").classList.add("show")};$("closeMenu").onclick=closeDrawer;$("overlay").onclick=function(e){if(e.target===$("overlay"))closeDrawer()};
$("memoryBtn").onclick=openMemory;$("drawerMemory").onclick=openMemory;
$("memoryCancel").onclick=function(){$("memoryModal").classList.remove("show")};
$("memorySave").onclick=function(){memory=$("memoryText").value.trim();try{localStorage.setItem(KEYS.memory,memory)}catch(e){}$("memoryModal").classList.remove("show");notify("Memory saved on this device")};
$("clearBtn").onclick=$("drawerClear").onclick=function(){if(!confirm("Delete all chat history on this device?"))return;chats=[];currentId="";save();createChat();notify("Chat history cleared")};
$("searchChats").onclick=function(){$("searchModal").classList.add("show");$("searchInput").value="";runSearch();$("searchInput").focus()};
$("searchClose").onclick=function(){$("searchModal").classList.remove("show")};$("searchInput").oninput=runSearch;
$("sendBtn").onclick=send;$("stopBtn").onclick=stop;
$("prompt").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("prompt").addEventListener("input",function(){this.style.height="auto";this.style.height=Math.min(this.scrollHeight,190)+"px"});
$("attachBtn").onclick=function(){$("fileInput").click()};
$("fileInput").onchange=function(){addFiles(Array.from(this.files||[]));this.value=""};
$("imageModeBtn").onclick=function(){imageMode=!imageMode;this.classList.toggle("selected",imageMode);$("prompt").placeholder=imageMode?"Describe the image to generate…":"Message My AI…";$("prompt").focus();if(imageMode)notify("Image generation mode enabled")};
document.querySelectorAll("[data-prompt]").forEach(function(b){b.onclick=function(){$("prompt").value=b.getAttribute("data-prompt");$("prompt").focus();$("prompt").dispatchEvent(new Event("input"))}});
$("providerSelect").onchange=function(){saveSettings();loadModels()};
$("modelSelect").onchange=saveSettings;
$("installBtn").onclick=function(){if(deferredInstall){deferredInstall.prompt();deferredInstall=null}else notify("On iPhone: open Share, then Add to Home Screen")};
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredInstall=e});
window.addEventListener("online",function(){notify("Back online")});
if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}
loadState();renderAll();loadModels();
})();
</script>
</body>
</html>`;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "X-Content-Type-Options": "nosniff"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function html(source) {
  return new Response(source, {
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}

function getProvider(name, env) {
  const key = name || DEFAULT_PROVIDER;
  const provider = PROVIDERS[key];
  if (!provider) throw new Error("Unknown API provider.");
  if (!env[provider.keyEnv]) {
    throw new Error(provider.name + " API key is missing. Add " + provider.keyEnv + " in Cloudflare Worker Secrets.");
  }
  return { ...provider, key: env[provider.keyEnv] };
}

async function readBody(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_SIZE) throw new Error("Request is too large. Keep uploads below 10 MB.");
  const text = await request.text();
  if (text.length > MAX_BODY_SIZE) throw new Error("Request is too large. Keep uploads below 10 MB.");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("Invalid JSON request.");
  }
}

async function providerFetch(url, init, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The API request timed out. Please retry.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && ["system", "user", "assistant"].includes(m.role))
    .slice(-60)
    .map(m => {
      let content = m.content;
      if (typeof content !== "string" && !Array.isArray(content)) content = String(content ?? "");
      if (Array.isArray(content)) {
        content = content.map(part => {
          if (!part || typeof part !== "object") return { type: "text", text: String(part ?? "") };
          if (part.type === "text") return { type: "text", text: String(part.text ?? "") };
          if (part.type === "image_url" && part.image_url) {
            return { type: "image_url", image_url: part.image_url };
          }
          return { type: "text", text: "" };
        });
      }
      return { role: m.role, content };
    });
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      const content = messages[i].content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content.map(p => p && p.type === "text" ? p.text : "").join(" ");
      }
    }
  }
  return "";
}

function isResearchQuery(text) {
  return /\b(latest|current|today|tonight|yesterday|this week|this month|recent|news|price|prices|forecast|weather|research|sources|citations|202[5-9]|compare online|look up|search the web|what happened|new release|release date|updates?)\b/i.test(text || "");
}

function researchPrompt() {
  return [
    "You are an accurate research assistant.",
    "For factual claims, distinguish known information from uncertain information.",
    "Use live web search only if the API provider/model actually supplies it.",
    "Never invent sources, URLs, search results, quotations, or citations.",
    "If live search is unavailable, clearly say that you could not verify current information.",
    "When real sources are supplied by the provider, cite them clearly.",
    "Prefer concise, structured answers and state relevant dates."
  ].join(" ");
}

function baseSystemPrompt(model, research) {
  const family = String(model || "").toLowerCase();
  let style = "Be helpful, accurate, clear, and direct. Use the user's language. Format answers with readable Markdown.";
  if (/claude|anthropic/.test(family)) {
    style = "Use careful reasoning, natural prose, useful headings, and a helpful Claude-like writing style. Do not claim hidden reasoning.";
  } else if (/gpt|openai|o[134]-|chatgpt/.test(family)) {
    style = "Use a polished ChatGPT-like style: conversational, structured, practical, and concise unless detail is requested.";
  } else if (/gemini|google/.test(family)) {
    style = "Use a clear, organized, exploratory style with practical examples when useful.";
  } else if (/deepseek/.test(family)) {
    style = "Be technically precise and organized. Explain code and calculations carefully when relevant.";
  } else if (/llama|meta/.test(family)) {
    style = "Be direct, approachable, and well structured. Avoid unnecessary filler.";
  } else if (/qwen/.test(family)) {
    style = "Be multilingual, precise, and well organized. Use examples when they clarify the answer.";
  }
  return style + (research ? " " + researchPrompt() : "");
}

async function getModels(provider) {
  const response = await providerFetch(provider.base + "/models", {
    headers: { Authorization: "Bearer " + provider.key, Accept: "application/json" }
  }, 15000);

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("The provider returned an unreadable models response.");
  }

  if (!response.ok) {
    throw new Error((data.error && data.error.message) || data.message || ("Models request failed (" + response.status + ")."));
  }

  const source = Array.isArray(data.data) ? data.data :
    Array.isArray(data.models) ? data.models :
    Array.isArray(data) ? data : [];

  return source
    .map(item => {
      if (typeof item === "string") return { id: item, name: item };
      const id = item && (item.id || item.name || item.model);
      if (!id || typeof id !== "string") return null;
      return { id, name: item.name || item.id || item.model || id };
    })
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)
    .slice(0, 500);
}

async function handleModels(url, env) {
  try {
    const provider = getProvider(url.searchParams.get("provider"), env);
    const models = await getModels(provider);
    return json({ provider: provider.name, models });
  } catch (error) {
    return json({ error: error.message || "Could not load models." }, 502);
  }
}

async function handleChat(request, env) {
  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  let provider;
  try {
    provider = getProvider(body.provider, env);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const messages = normalizeMessages(body.messages);
  if (!messages.length) return json({ error: "Add a message before sending." }, 400);

  const model = typeof body.model === "string" ? body.model.trim() : "";
  if (!model) {
    return json({ error: "No model selected. Load models and select one, then retry." }, 400);
  }

  const research = body.research === true || isResearchQuery(lastUserText(messages));
  const system = { role: "system", content: baseSystemPrompt(model, research) };
  const finalMessages = messages[0] && messages[0].role === "system"
    ? [system, ...messages.filter(m => m.role !== "system")]
    : [system, ...messages];

  const payload = {
    model,
    messages: finalMessages,
    stream: true,
    temperature: research ? 0.2 : 0.7,
    max_tokens: research ? 8192 : 4096
  };

  if (research) {
    payload.web_search = true;
    payload.enable_web_search = true;
    payload.metadata = { web_search: true, research_mode: true };
  }

  let upstream;
  try {
    upstream = await providerFetch(provider.base + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + provider.key,
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json"
      },
      body: JSON.stringify(payload)
    }, 60000);
  } catch (error) {
    return json({ error: error.message || "Could not connect to the provider." }, 502);
  }

  if (!upstream.ok) {
    const raw = await upstream.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      message = (parsed.error && (parsed.error.message || parsed.error)) || parsed.message || raw;
      if (typeof message !== "string") message = JSON.stringify(message);
    } catch {}
    return json({
      error: "Provider error (" + upstream.status + "): " + String(message).slice(0, 1500)
    }, upstream.status === 429 ? 429 : 502);
  }

  if (!upstream.body) return json({ error: "The provider returned an empty response." }, 502);

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": upstream.headers.get("content-type") || "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    }
  });
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

async function handleImage(request, env) {
  if (!env.AI) {
    return json({ error: "Cloudflare AI binding is missing. Check the AI binding in wrangler.jsonc." }, 503);
  }

  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return json({ error: "Describe the image you want to generate." }, 400);
  if (prompt.length > 3000) return json({ error: "Image prompt is too long. Use 3000 characters or fewer." }, 400);

  try {
    const result = await env.AI.run(IMAGE_MODEL, { prompt });
    if (result instanceof Response) {
      const contentType = result.headers.get("content-type") || "image/png";
      const buffer = await result.arrayBuffer();
      return json({ image: "data:" + contentType + ";base64," + toBase64(buffer) });
    }
    if (result && result.image) {
      if (typeof result.image === "string") {
        const value = result.image.startsWith("data:") ? result.image : "data:image/png;base64," + result.image;
        return json({ image: value });
      }
      return json({ image: "data:image/png;base64," + toBase64(result.image) });
    }
    if (result instanceof ArrayBuffer || ArrayBuffer.isView(result)) {
      const buffer = result instanceof ArrayBuffer ? result : result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
      return json({ image: "data:image/png;base64," + toBase64(buffer) });
    }
    return json({ error: "Cloudflare AI returned an unexpected image format." }, 502);
  } catch (error) {
    return json({ error: "Image generation failed: " + (error.message || "Unknown error") }, 502);
  }
}

const MANIFEST = {
  name: "My AI",
  short_name: "My AI",
  description: "Your personal AI workspace",
  start_url: "/",
  display: "standalone",
  background_color: "#101010",
  theme_color: "#101010"
};

const SERVICE_WORKER = `
const CACHE_NAME = "my-ai-shell-v1";
self.addEventListener("install", event => {
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return html(APP_HTML);
    }

    if (url.pathname === "/manifest.json") {
      return new Response(JSON.stringify(MANIFEST), {
        headers: { ...corsHeaders(), "Content-Type": "application/manifest+json" }
      });
    }

    if (url.pathname === "/sw.js") {
      return new Response(SERVICE_WORKER, {
        headers: {
          ...corsHeaders(),
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-cache"
        }
      });
    }

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        app: "my-ai",
        providers: Object.keys(PROVIDERS),
        imageGeneration: Boolean(env.AI)
      });
    }

    if (url.pathname === "/api/models" && request.method === "GET") {
      return handleModels(url, env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/generate-image" && request.method === "POST") {
      return handleImage(request, env);
    }

    return json({ error: "Not found." }, 404);
  }
};
