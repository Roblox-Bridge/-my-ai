const BASE = "https://www.codecraftapi.com/v1";

const HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>AetherAI</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b0d10;color:#f5f7fa}
button,input,select{font:inherit}
button{cursor:pointer}
.app{display:flex;height:100dvh;overflow:hidden}
.sidebar{width:280px;background:#111318;border-right:1px solid #242831;display:flex;flex-direction:column;flex-shrink:0}
.brand{padding:20px;font-size:21px;font-weight:800;border-bottom:1px solid #242831}
.brand span{opacity:.55}
.newchat{margin:14px;padding:12px 14px;border:1px solid #303641;background:#191d24;color:white;border-radius:12px}
.history{padding:8px 12px;overflow:auto;flex:1}
.history-title{font-size:12px;color:#8c94a3;padding:8px}
.history-item{padding:10px;border-radius:9px;color:#dce1e8;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.history-item:hover{background:#1b2028}
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.topbar{height:62px;border-bottom:1px solid #242831;display:flex;align-items:center;gap:10px;padding:0 16px}
.menu{display:none}
.model{max-width:310px;background:#151920;color:#f5f7fa;border:1px solid #303641;border-radius:10px;padding:9px 12px}
.iconbtn{border:1px solid #303641;background:#151920;color:#e8ebef;border-radius:10px;padding:9px 11px}
.spacer{flex:1}
.status{font-size:12px;color:#7f8998;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chat{flex:1;overflow:auto}
.messages{max-width:900px;margin:auto;padding:30px 18px 150px}
.empty{text-align:center;padding-top:14vh;color:#89919f}
.empty h1{font-size:30px;color:#f4f5f7;margin-bottom:8px}
.msg{display:flex;gap:12px;margin:22px 0}
.avatar{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#20252e;font-size:13px;flex-shrink:0}
.msg.user .avatar{background:#303743}
.bubble{min-width:0;flex:1;line-height:1.65;font-size:15px}
.bubble pre{background:#101318;border:1px solid #282e37;border-radius:10px;padding:14px;overflow:auto}
.bubble code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.bubble p{margin:0 0 12px}
.bubble p:last-child{margin-bottom:0}
.bubble img{max-width:100%;border-radius:10px}
.actions{margin-top:8px;display:flex;gap:6px}
.smallbtn{font-size:12px;padding:5px 8px;border:1px solid #2d333d;background:#151920;color:#aeb6c2;border-radius:7px}
.composer-wrap{position:absolute;bottom:0;left:280px;right:0;padding:18px;background:linear-gradient(transparent,#0b0d10 28%)}
.composer{max-width:900px;margin:auto;border:1px solid #303641;background:#15181e;border-radius:16px;padding:10px}
.inputrow{display:flex;align-items:flex-end;gap:8px}
textarea{flex:1;resize:none;max-height:180px;min-height:42px;border:0;outline:0;background:transparent;color:#f4f5f7;padding:10px}
.send{width:42px;height:42px;border:0;border-radius:11px;background:#f4f5f7;color:#101216}
.attach{width:42px;height:42px;border:1px solid #303641;border-radius:11px;background:#191d24;color:#dfe3e8}
.file-preview{display:flex;gap:8px;flex-wrap:wrap;padding:5px}
.file-chip{font-size:12px;background:#20252d;border-radius:8px;padding:6px 9px;color:#cbd1da}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10}
.overlay.show{display:block}
.drawer{position:fixed;left:0;top:0;bottom:0;width:290px;background:#111318;z-index:11;transform:translateX(-100%);transition:.2s;padding-top:10px}
.drawer.show{transform:translateX(0)}
.modal{position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.65);z-index:20}
.modal.show{display:grid}
.modalbox{width:min(600px,92vw);max-height:80vh;overflow:auto;background:#15181e;border:1px solid #303641;border-radius:15px;padding:20px}
.modalbox h2{margin-top:0}
.modelcard{padding:12px;border:1px solid #292f38;border-radius:10px;margin:8px 0}
@media(max-width:700px){
.sidebar{display:none}
.menu{display:block}
.composer-wrap{left:0}
.messages{padding-left:12px;padding-right:12px}
.model{max-width:190px}
.status{display:none}
}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<div class="brand">Aether<span>AI</span></div>
<button class="newchat" id="newChat">＋ New chat</button>
<div class="history" id="history"></div>
</aside>

<main class="main">
<header class="topbar">
<button class="iconbtn menu" id="menu">☰</button>
<select class="model" id="model">
<option>Loading models…</option>
</select>
<button class="iconbtn" id="councilBtn">Council</button>
<button class="iconbtn" id="infoBtn">ⓘ</button>
<div class="spacer"></div>
<div class="status" id="status"></div>
</header>

<section class="chat" id="chat">
<div class="messages" id="messages">
<div class="empty" id="empty">
<h1>How can I help?</h1>
<div>Ask anything or attach a file.</div>
</div>
</div>
</section>

<div class="composer-wrap">
<div class="composer">
<div class="file-preview" id="files"></div>
<div class="inputrow">
<input id="fileInput" type="file" hidden multiple>
<button class="attach" id="attach">＋</button>
<textarea id="input" placeholder="Message AetherAI…" rows="1"></textarea>
<button class="send" id="send">↑</button>
</div>
</div>
</div>
</main>
</div>

<div class="overlay" id="overlay"></div>
<div class="drawer" id="drawer">
<div class="brand">Aether<span>AI</span></div>
<button class="newchat" id="drawerNew">＋ New chat</button>
<div class="history" id="drawerHistory"></div>
</div>

<div class="modal" id="modal">
<div class="modalbox">
<h2>Available Models</h2>
<div id="modelInfo">Loading…</div>
<button class="iconbtn" id="closeModal">Close</button>
</div>
</div>

<script>
const $ = id => document.getElementById(id);

const state = {
  models: [],
  messages: [],
  files: [],
  busy: false
};

function escapeHtml(s){
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function md(s){
  let x = escapeHtml(s);

  x = x.replace(
    /```([\\s\\S]*?)```/g,
    "<pre><code>$1</code></pre>"
  );

  x = x.replace(
    /\\*\\*(.+?)\\*\\*/g,
    "<strong>$1</strong>"
  );

  x = x.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
  );

  x = x.replace(
    /\\n\\n+/g,
    "</p><p>"
  );

  x = x.replace(
    /\\n/g,
    "<br>"
  );

  return "<p>" + x + "</p>";
}

function render(){
  const box = $("messages");

  if(!state.messages.length){
    box.innerHTML =
      '<div class="empty" id="empty"><h1>How can I help?</h1><div>Ask anything or attach a file.</div></div>';
    return;
  }

  box.innerHTML = "";

  state.messages.forEach((m,i)=>{
    const row = document.createElement("div");
    row.className = "msg " + m.role;

    const av = document.createElement("div");
    av.className = "avatar";
    av.textContent = m.role === "user" ? "You" : "AI";

    const body = document.createElement("div");
    body.className = "bubble";

    if(m.role === "assistant"){
      body.innerHTML = md(m.content || "");

      const actions = document.createElement("div");
      actions.className = "actions";

      const copy = document.createElement("button");
      copy.className = "smallbtn";
      copy.textContent = "Copy";
      copy.onclick = async()=>{
        await navigator.clipboard.writeText(m.content || "");
        copy.textContent = "Copied";
        setTimeout(()=>copy.textContent="Copy",1000);
      };

      actions.appendChild(copy);
      body.appendChild(actions);
    }else{
      body.textContent = m.content || "";
    }

    row.appendChild(av);
    row.appendChild(body);
    box.appendChild(row);
  });

  $("chat").scrollTop = $("chat").scrollHeight;
}

function saveHistory(){
  try{
    localStorage.setItem("aether_history",JSON.stringify(state.messages));
  }catch{}
}

function loadHistory(){
  try{
    const x = JSON.parse(localStorage.getItem("aether_history") || "[]");
    if(Array.isArray(x)) state.messages = x;
  }catch{}
  render();
}

function renderHistory(){
  const lists = [$("history"),$("drawerHistory")];

  lists.forEach(list=>{
    list.innerHTML = "";

    const first = state.messages.find(x=>x.role==="user");

    if(first){
      const item = document.createElement("div");
      item.className = "history-item";
      item.textContent = first.content || "New chat";
      item.onclick = closeDrawer;
      list.appendChild(item);
    }
  });
}

async function loadModels(){
  const select = $("model");
  select.innerHTML = "<option>Loading models…</option>";

  try{
    const r = await fetch("/api/models",{cache:"no-store"});
    const d = await r.json();

    if(!r.ok){
      throw new Error(d.error?.message || d.error || ("HTTP " + r.status));
    }

    state.models = d.data || [];
    select.innerHTML = "";

    state.models.forEach((m)=>{
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent =
        (m.name || m.id) +
        (Array.isArray(m.capabilities) && m.capabilities.includes("reasoning")
          ? " · reasoning"
          : "");

      select.appendChild(option);
    });

    const preferred = [
      "gpt-5.6-luna",
      "claude-opus-4.8",
      "deepseek-v4-flash-0731"
    ];

    const preferredModel =
      preferred.find(x=>state.models.some(m=>m.id===x));

    if(preferredModel){
      select.value = preferredModel;
    }

    $("status").textContent =
      state.models.length + " models available";

  }catch(e){
    select.innerHTML =
      '<option value="">Models failed — retry</option>';

    $("status").textContent = e.message;
  }
}

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();

    reader.onload = ()=>{
      const result = String(reader.result);
      resolve(result);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildUserMessage(text){
  if(!state.files.length){
    return {
      role:"user",
      content:text
    };
  }

  const parts = [];

  if(text){
    parts.push({
      type:"text",
      text:text
    });
  }

  for(const file of state.files){
    if(file.type.startsWith("image/")){
      const data = await fileToBase64(file);

      parts.push({
        type:"image_url",
        image_url:{
          url:data
        }
      });
    }else{
      const content = await file.text();

      parts.push({
        type:"text",
        text:
          "\\n\\n[Attached file: " +
          file.name +
          "]\\n" +
          content
      });
    }
  }

  return {
    role:"user",
    content:parts
  };
}

function clearFiles(){
  state.files = [];
  $("files").innerHTML = "";
  $("fileInput").value = "";
}

function renderFiles(){
  const box = $("files");
  box.innerHTML = "";

  state.files.forEach(file=>{
    const chip = document.createElement("div");
    chip.className = "file-chip";
    chip.textContent = file.name;
    box.appendChild(chip);
  });
}

async function send(){
  if(state.busy) return;

  const input = $("input");
  const text = input.value.trim();

  if(!text && !state.files.length) return;

  state.busy = true;
  $("send").disabled = true;

  try{
    const userMessage = await buildUserMessage(text);

    state.messages.push({
      role:"user",
      content:text || "[Attached file]"
    });

    const assistant = {
      role:"assistant",
      content:""
    };

    state.messages.push(assistant);

    input.value = "";
    clearFiles();
    render();
    renderHistory();

    const payload = {
      model:$("model").value,
      messages:[
        ...state.messages
          .slice(0,-1)
          .map(m=>({
            role:m.role,
            content:m.content
          })),
        userMessage
      ],
      stream:true
    };

    const response = await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(payload)
    });

    if(!response.ok){
      const data = await response.json().catch(()=>null);
      throw new Error(
        data?.error?.message ||
        data?.error ||
        ("HTTP " + response.status)
      );
    }

    if(!response.body){
      throw new Error("Streaming response unavailable");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while(true){
      const {value,done} = await reader.read();

      if(done) break;

      buffer += decoder.decode(value,{stream:true});

      const events = buffer.split("\\n\\n");
      buffer = events.pop() || "";

      for(const event of events){
        const lines = event.split("\\n");

        for(const line of lines){
          if(!line.startsWith("data:")) continue;

          const raw = line.slice(5).trim();

          if(!raw || raw === "[DONE]") continue;

          try{
            const data = JSON.parse(raw);

            if(data.error){
              throw new Error(
                data.error.message ||
                "Model error"
              );
            }

            const delta =
              data.choices?.[0]?.delta?.content;

            if(delta){
              assistant.content += delta;
              render();
            }
          }catch(err){
            if(err.message !== "Unexpected end of JSON input"){
              if(err.message && !err.message.includes("Unexpected")){
                throw err;
              }
            }
          }
        }
      }
    }

    saveHistory();
    renderHistory();

  }catch(e){
    state.messages[state.messages.length-1].content =
      "Error: " + e.message;

    render();
  }finally{
    state.busy = false;
    $("send").disabled = false;
  }
}

async function council(){
  if(state.busy) return;

  const text = $("input").value.trim();

  if(!text) return;

  state.busy = true;
  $("send").disabled = true;

  try{
    state.messages.push({
      role:"user",
      content:text
    });

    state.messages.push({
      role:"assistant",
      content:"Council is thinking…"
    });

    $("input").value = "";
    render();

    const selected =
      state.models
        .filter(m=>m.id)
        .slice(0,3)
        .map(m=>m.id);

    const response = await fetch("/api/council",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        models:selected,
        message:text
      })
    });

    const data = await response.json();

    if(!response.ok){
      throw new Error(
        data.error?.message ||
        data.error ||
        "Council failed"
      );
    }

    state.messages[state.messages.length-1].content =
      data.answer || "Council did not return an answer.";

    saveHistory();
    render();

  }catch(e){
    state.messages[state.messages.length-1].content =
      "Council error: " + e.message;

    render();

  }finally{
    state.busy = false;
    $("send").disabled = false;
  }
}

function openDrawer(){
  $("drawer").classList.add("show");
  $("overlay").classList.add("show");
}

function closeDrawer(){
  $("drawer").classList.remove("show");
  $("overlay").classList.remove("show");
}

function newChat(){
  state.messages = [];
  clearFiles();
  render();
  renderHistory();
  saveHistory();
  closeDrawer();
}

$("send").onclick = send;

$("input").addEventListener("keydown",e=>{
  if(e.key==="Enter" && !e.shiftKey){
    e.preventDefault();
    send();
  }
});

$("input").addEventListener("input",()=>{
  const x = $("input");
  x.style.height = "auto";
  x.style.height = Math.min(x.scrollHeight,180) + "px";
});

$("attach").onclick = ()=>{
  $("fileInput").click();
};

$("fileInput").onchange = ()=>{
  state.files = [...$("fileInput").files];
  renderFiles();
};

$("newChat").onclick = newChat;
$("drawerNew").onclick = newChat;

$("menu").onclick = openDrawer;
$("overlay").onclick = closeDrawer;

$("councilBtn").onclick = council;

$("infoBtn").onclick = ()=>{
  const box = $("modelInfo");

  box.innerHTML = "";

  state.models.forEach(m=>{
    const div = document.createElement("div");
    div.className = "modelcard";

    const caps =
      Array.isArray(m.capabilities)
        ? m.capabilities.join(", ")
        : "—";

    div.innerHTML =
      "<strong>" +
      escapeHtml(m.name || m.id) +
      "</strong><br>" +
      "<small>" +
      escapeHtml(m.id) +
      "<br>Context: " +
      escapeHtml(m.context_window || "—") +
      "<br>Capabilities: " +
      escapeHtml(caps) +
      "</small>";

    box.appendChild(div);
  });

  $("modal").classList.add("show");
};

$("closeModal").onclick = ()=>{
  $("modal").classList.remove("show");
};

loadHistory();
renderHistory();
loadModels();
</script>
</body>
</html>`;

function corsHeaders(){
  return {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type, Authorization",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
  };
}

function json(data,status=200){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        ...corsHeaders()
      }
    }
  );
}

function auth(env){
  return env.CODECRAFT_API_KEY || "";
}

async function upstream(env,path,options={}){
  const key = auth(env);

  if(!key){
    return json({
      error:{
        message:"CODECRAFT_API_KEY is not configured."
      }
    },500);
  }

  const headers = new Headers(options.headers || {});

  headers.set("Authorization","Bearer " + key);

  if(options.body){
    headers.set("Content-Type","application/json");
  }

  return fetch(BASE + path,{
    ...options,
    headers
  });
}

async function models(env){
  const r = await upstream(env,"/models",{
    method:"GET"
  });

  const text = await r.text();

  return new Response(text,{
    status:r.status,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}

async function chat(env,body){
  if(!body || !body.model || !Array.isArray(body.messages)){
    return json({
      error:{
        message:"model and messages are required."
      }
    },400);
  }

  const allowed = {
    model:body.model,
    messages:body.messages,
    stream:true
  };

  const optional = [
    "max_tokens",
    "temperature",
    "top_p",
    "tools",
    "tool_choice",
    "response_format",
    "stop",
    "frequency_penalty",
    "presence_penalty",
    "seed"
  ];

  optional.forEach(key=>{
    if(body[key] !== undefined){
      allowed[key] = body[key];
    }
  });

  const r = await upstream(env,"/chat/completions",{
    method:"POST",
    body:JSON.stringify(allowed)
  });

  if(!r.ok){
    const text = await r.text();

    return new Response(text,{
      status:r.status,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        ...corsHeaders()
      }
    });
  }

  return new Response(r.body,{
    status:r.status,
    headers:{
      "Content-Type":"text/event-stream; charset=utf-8",
      "Cache-Control":"no-cache, no-transform",
      "Connection":"keep-alive",
      ...corsHeaders()
    }
  });
}

async function council(env,body){
  const modelsList = Array.isArray(body.models)
    ? body.models.filter(Boolean).slice(0,3)
    : [];

  const message = String(body.message || "").trim();

  if(!message){
    return json({
      error:{
        message:"Council message is required."
      }
    },400);
  }

  if(!modelsList.length){
    return json({
      error:{
        message:"No council models selected."
      }
    },400);
  }

  const answers = [];

  for(const model of modelsList){
    const r = await upstream(env,"/chat/completions",{
      method:"POST",
      body:JSON.stringify({
        model,
        messages:[
          {
            role:"system",
            content:"You are one member of an AI Council. Analyze the user's request independently and provide useful factual reasoning."
          },
          {
            role:"user",
            content:message
          }
        ],
        stream:false
      })
    });

    if(r.ok){
      const data = await r.json();

      const content =
        data.choices?.[0]?.message?.content;

      if(content){
        answers.push({
          model,
          answer:content
        });
      }
    }
  }

  if(!answers.length){
    return json({
      error:{
        message:"Council models did not return an answer."
      }
    },502);
  }

  const synthesisPrompt =
    "You are the final Council synthesizer. Compare the following independent model responses and produce one clear, useful answer to the original user. Do not mention internal API details unless necessary.\\n\\n" +
    answers.map((x,i)=>
      "MODEL " + (i+1) + " (" + x.model + "):\\n" + x.answer
    ).join("\\n\\n");

  const synthesisModel = modelsList[0];

  const finalResponse = await upstream(
    env,
    "/chat/completions",
    {
      method:"POST",
      body:JSON.stringify({
        model:synthesisModel,
        messages:[
          {
            role:"system",
            content:"You synthesize multiple AI responses into one accurate final response."
          },
          {
            role:"user",
            content:synthesisPrompt
          }
        ],
        stream:false
      })
    }
  );

  if(finalResponse.ok){
    const data = await finalResponse.json();

    const answer =
      data.choices?.[0]?.message?.content;

    if(answer){
      return json({
        answer,
        responses:answers
      });
    }
  }

  return json({
    answer:answers
      .map(x=>"[" + x.model + "]\\n" + x.answer)
      .join("\\n\\n"),
    responses:answers
  });
}

async function handle(request,env){
  const url = new URL(request.url);

  if(request.method === "OPTIONS"){
    return new Response(null,{
      status:204,
      headers:corsHeaders()
    });
  }

  if(url.pathname === "/"){
    return new Response(HTML,{
      headers:{
        "Content-Type":"text/html; charset=utf-8",
        ...corsHeaders()
      }
    });
  }

  if(url.pathname === "/api/health"){
    return json({
      ok:true,
      provider:"CodeCraft API",
      has_key:!!auth(env),
      base:BASE
    });
  }

  if(url.pathname === "/api/models"){
    return models(env);
  }

  if(url.pathname === "/api/chat" && request.method === "POST"){
    let body;

    try{
      body = await request.json();
    }catch{
      return json({
        error:{
          message:"Invalid JSON."
        }
      },400);
    }

    return chat(env,body);
  }

  if(url.pathname === "/api/council" && request.method === "POST"){
    let body;

    try{
      body = await request.json();
    }catch{
      return json({
        error:{
          message:"Invalid JSON."
        }
      },400);
    }

    return council(env,body);
  }

  return json({
    error:{
      message:"Not found."
    }
  },404);
}

export default {
  async fetch(request,env){
    try{
      return await handle(request,env);
    }catch(error){
      return json({
        error:{
          message:error?.message || "Internal server error."
        }
      },500);
    }
  }
};
