const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>AetherAI</title>
<style>
:root{color-scheme:dark;--bg:#090b10;--panel:#10141b;--panel2:#171c25;--border:#293140;--text:#edf1f7;--muted:#8d98a9;--accent:#7d8cff;--danger:#e56b75}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;background:var(--bg);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input,textarea,select{font:inherit}
button{color:inherit;cursor:pointer}
body{overflow:hidden}
.app{height:100dvh;display:flex}
.side{width:275px;flex:none;background:#0d1016;border-right:1px solid var(--border);display:flex;flex-direction:column}
.brand{padding:19px 17px;font-size:19px;font-weight:800;border-bottom:1px solid var(--border)}
.brand b{color:var(--accent)}
.new{margin:14px;padding:11px 13px;border-radius:11px;border:1px solid var(--border);background:var(--panel);text-align:left}
.hist{overflow:auto;padding:0 9px 20px}
.histTitle{font-size:11px;color:var(--muted);padding:8px;text-transform:uppercase;letter-spacing:.08em}
.item{padding:10px 11px;border-radius:9px;color:#c9d0dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.item:hover{background:var(--panel2)}
.main{min-width:0;flex:1;display:flex;flex-direction:column}
.top{height:62px;display:flex;align-items:center;gap:10px;padding:0 15px;border-bottom:1px solid var(--border);background:#0b0e13}
.hamb{display:none}
.name{font-weight:750}
.controls{margin-left:auto;display:flex;gap:8px;align-items:center}
.select,.btn,.icon{background:var(--panel);border:1px solid var(--border);border-radius:10px;color:var(--text)}
.select{max-width:290px;padding:8px 10px}
.btn{padding:8px 11px}
.btn.active{border-color:var(--accent);color:#d8dcff}
.icon{width:38px;height:38px}
.chat{flex:1;overflow:auto}
.messages{max-width:930px;margin:auto;padding:28px 19px 145px}
.msg{display:flex;gap:12px;margin-bottom:25px}
.ava{width:34px;height:34px;flex:none;border-radius:10px;background:var(--panel2);display:grid;place-items:center;font-size:12px;font-weight:800}
.bubble{min-width:0;flex:1;line-height:1.65}
.bubble p{margin:0 0 11px}
.bubble p:last-child{margin:0}
.bubble pre{background:#07090d;border:1px solid var(--border);border-radius:10px;padding:13px;overflow:auto}
.bubble code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}
.bubble :not(pre)>code{background:#1a2029;padding:2px 5px;border-radius:5px}
.bubble a{color:#aab2ff}
.sources{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
.source{border:1px solid var(--border);background:var(--panel);padding:6px 8px;border-radius:8px;font-size:12px;color:#c4cbd7;text-decoration:none}
.composerWrap{position:fixed;left:275px;right:0;bottom:0;padding:13px 19px 19px;background:linear-gradient(transparent,var(--bg) 28%)}
.composer{max-width:930px;margin:auto;background:#11151c;border:1px solid var(--border);border-radius:16px;padding:10px}
.chips{display:flex;gap:7px;flex-wrap:wrap;padding:2px 2px 8px}
.chip{font-size:12px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:6px 8px}
.row{display:flex;gap:8px;align-items:end}
.prompt{flex:1;min-height:44px;max-height:190px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:9px}
.send{background:var(--accent);border:0;color:white;font-weight:750;border-radius:11px;padding:11px 17px}
.send.stop{background:var(--danger)}
.foot{display:flex;align-items:center;gap:8px;padding-top:7px}
.small{font-size:12px;color:var(--muted)}
.grow{flex:1}
.modalBack{position:fixed;inset:0;background:#000b;display:none;align-items:center;justify-content:center;padding:18px;z-index:50}
.modalBack.show{display:flex}
.modal{width:min(780px,100%);max-height:90dvh;overflow:auto;background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:18px}
.modalHead{display:flex;gap:10px;align-items:center}
.modalHead h3{margin:0;flex:1}
.modelCard{padding:11px;border:1px solid var(--border);border-radius:10px;margin-top:8px}
.tag{display:inline-block;font-size:11px;padding:3px 6px;background:var(--panel2);border-radius:6px;margin:2px}
.error{color:#ff9a9a}
.ok{color:#9fe0b2}

@media(max-width:800px){
.side{position:fixed;z-index:40;top:0;bottom:0;left:-285px;transition:left .2s}
.side.open{left:0}
.hamb{display:block}
.composerWrap{left:0}
.controls .select{max-width:160px}
.controls .btn{display:none}
.messages{padding-left:12px;padding-right:12px}
}
</style>
</head>

<body>
<div class="app">

<aside class="side" id="side">
<div class="brand">Aether<b>AI</b></div>
<button class="new" id="newBtn">＋ New chat</button>
<div class="hist">
<div class="histTitle">History</div>
<div id="history"></div>
</div>
</aside>

<main class="main">

<header class="top">
<button class="icon hamb" id="menu">☰</button>
<div class="name">AetherAI</div>

<div class="controls">
<select class="select" id="model">
<option>Loading models…</option>
</select>

<button class="btn" id="council">♟ Council</button>

<button class="icon" id="modelInfo" title="Model info">ⓘ</button>
</div>
</header>

<section class="chat" id="chat">
<div class="messages" id="messages"></div>
</section>

<div class="composerWrap">
<div class="composer">

<div class="chips" id="chips"></div>

<div class="row">
<textarea
class="prompt"
id="prompt"
rows="1"
placeholder="Message AetherAI…"
></textarea>

<button class="send" id="send">Send</button>
</div>

<div class="foot">

<button class="icon" id="fileBtn" title="Attach image or text file">＋</button>

<input
id="files"
type="file"
multiple
hidden
accept="image/png,image/jpeg,image/webp,image/gif,.txt,.md,.json,.csv,.js,.html,.css,.py,.java,.cpp,.c,.ts">

<span class="small" id="status">Ready</span>

<span class="grow"></span>

<span class="small" id="usage"></span>

</div>
</div>
</div>

</main>
</div>

<div class="modalBack" id="back">
<div class="modal">

<div class="modalHead">
<h3 id="modalTitle">Model</h3>
<button class="icon" id="close">×</button>
</div>

<div id="modalBody"></div>

</div>
</div>

<script>

const $=id=>document.getElementById(id);

const state={
  models:[],
  messages:[],
  history:JSON.parse(localStorage.getItem("aether_history")||"[]"),
  files:[],
  controller:null
};

const bt=String.fromCharCode(96);

function esc(s){
  return String(s??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function md(s){

  let v=esc(s);

  const blocks=[];

  const fence=new RegExp(
    bt+bt+bt+"([\\s\\S]*?)"+bt+bt+bt,
    "g"
  );

  const inline=new RegExp(
    bt+"([^"+bt+"]+)"+bt,
    "g"
  );

  v=v.replace(
    fence,
    (m,c)=>{
      const i=blocks.push(
        "<pre><code>"+c+"</code></pre>"
      )-1;

      return "__BLOCK_"+i+"__";
    }
  );

  v=v.replace(
    new RegExp("\\*\\*(.+?)\\*\\*","g"),
    "<strong>$1</strong>"
  );

  v=v.replace(
    new RegExp("\\*(.+?)\\*","g"),
    "<em>$1</em>"
  );

  v=v.replace(
    inline,
    "<code>$1</code>"
  );

  v=v.replace(
    new RegExp(
      "\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)",
      "g"
    ),
    "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>"
  );

  v=v.replace(
    new RegExp("(^|\\n)### (.+)","g"),
    "$1<h3>$2</h3>"
  );

  v=v.replace(
    new RegExp("(^|\\n)## (.+)","g"),
    "$1<h2>$2</h2>"
  );

  v=v.replace(
    new RegExp("(^|\\n)# (.+)","g"),
    "$1<h1>$2</h1>"
  );

  v=v.replace(
    new RegExp("\\n{2,}","g"),
    "</p><p>"
  );

  v=v.replace(
    new RegExp("\\n","g"),
    "<br>"
  );

  v="<p>"+v+"</p>";

  v=v.replace(
    new RegExp("<p>(<h[1-3]>)","g"),
    "$1"
  );

  v=v.replace(
    new RegExp("(<\\/h[1-3]>)<\\/p>","g"),
    "$1"
  );

  v=v.replace(
    new RegExp("<p>(<pre>)","g"),
    "$1"
  );

  v=v.replace(
    new RegExp("(<\\/pre>)<\\/p>","g"),
    "$1"
  );

  blocks.forEach(
    (x,i)=>{
      v=v.replace("__BLOCK_"+i+"__",x);
    }
  );

  return v;
}

function save(){
  localStorage.setItem(
    "aether_history",
    JSON.stringify(
      state.history.slice(-40)
    )
  );
}

function renderHistory(){

  $("history").innerHTML="";

  state.history
    .slice()
    .reverse()
    .forEach((h,i)=>{

      const d=document.createElement("div");

      d.className="item";

      d.textContent=h.title||"New chat";

      d.onclick=()=>{
        state.messages=h.messages||[];
        render();
        $("side").classList.remove("open");
      };

      $("history").appendChild(d);

    });
}

function render(){

  const box=$("messages");

  box.innerHTML="";

  if(!state.messages.length){

    box.innerHTML=
      '<div style="text-align:center;padding-top:18vh;color:#8d98a9">'+
      '<h1 style="color:#edf1f7">How can I help?</h1>'+
      '<div>Ask anything, attach a file, or use Council.</div>'+
      '</div>';

    return;
  }

  for(const m of state.messages){

    const e=document.createElement("div");

    e.className="msg";

    let sources="";

    if(m.sources?.length){

      sources=
        '<div class="sources">'+
        m.sources.map(s=>
          '<a class="source" target="_blank" rel="noopener" href="'+
          esc(s.url||s.link||"#")+
          '">'+
          esc(s.title||s.name||s.url||"Source")+
          '</a>'
        ).join("")+
        "</div>";
    }

    e.innerHTML=
      '<div class="ava">'+
      (m.role==="user"?"U":"A")+
      '</div>'+
      '<div class="bubble">'+
      md(m.content||"")+
      sources+
      '</div>';

    box.appendChild(e);
  }

  $("chat").scrollTop=$("chat").scrollHeight;
}

function reset(){

  if(state.messages.length){

    state.history.push({
      title:
        (
          state.messages.find(
            x=>x.role==="user"
          )?.content||
          "New chat"
        ).slice(0,70),

      messages:state.messages
    });

    save();
  }

  state.messages=[];
  state.files=[];

  renderFiles();
  render();
}

function renderFiles(){

  $("chips").innerHTML=
    state.files.map(
      (f,i)=>
        '<span class="chip">'+
        esc(f.name)+
        ' <button data-i="'+i+'">×</button>'+
        '</span>'
    ).join("");

  $("chips")
    .querySelectorAll("button")
    .forEach(
      b=>{
        b.onclick=()=>{
          state.files.splice(+b.dataset.i,1);
          renderFiles();
        };
      }
    );
}

async function filePart(file){

  if(file.type.startsWith("image/")){

    if(file.size>5*1024*1024){
      throw new Error(
        file.name+" is larger than 5 MB"
      );
    }

    return await new Promise(
      (res,rej)=>{

        const r=new FileReader();

        r.onload=()=>{
          res({
            type:"image_url",
            image_url:{
              url:String(r.result)
            }
          });
        };

        r.onerror=rej;

        r.readAsDataURL(file);
      }
    );
  }

  if(file.size>1024*1024){
    throw new Error(
      file.name+" is larger than 1 MB"
    );
  }

  return {
    type:"text",
    text:
      "\\n\\n--- FILE: "+
      file.name+
      " ---\\n"+
      (await file.text())
  };
}

async function loadModels(){

  const s=$("model");

  s.innerHTML=
    "<option>Loading models…</option>";

  try{

    const r=await fetch(
      "/api/models",
      {cache:"no-store"}
    );

    const d=await r.json();

    if(!r.ok){

      throw new Error(
        d.error?.message||
        d.error||
        "HTTP "+r.status
      );
    }

    state.models=d.data||[];

    s.innerHTML="";

    state.models.forEach(
      m=>{

        const o=document.createElement("option");

        o.value=m.id;

        o.textContent=
          (m.name||m.id)+
          (
            m.capabilities?.includes("reasoning")
            ?" · reasoning"
            :""
          );

        s.appendChild(o);
      }
    );

    if(!state.models.length){

      s.innerHTML=
        "<option>No models available</option>";

    }else{

      const preferred=[
        "gpt-5.6-luna",
        "claude-opus-4.8",
        "deepseek-v4-flash-0731"
      ];

      const p=
        preferred.find(
          x=>state.models.some(
            m=>m.id===x
          )
        );

      if(p)s.value=p;
    }

    $("status").textContent=
      state.models.length+
      " models available";

  }catch(e){

    s.innerHTML=
      '<option value="">Models failed — retry</option>';

    $("status").textContent=
      e.message;
  }
}

function selected(){

  return state.models.find(
    m=>m.id===$("model").value
  );
}

async function send(){

  const text=$("prompt").value.trim();

  if(!text&&!state.files.length){
    return;
  }

  if(state.controller){

    state.controller.abort();

    return;
  }

  let content=text;

  try{

    for(const f of state.files){

      const p=await filePart(f);

      if(p.type==="text"){

        content+=p.text;

      }else if(Array.isArray(content)){

        content.push(p);

      }else{

        content=[
          {
            type:"text",
            text:content
          },
          p
        ];
      }
    }

  }catch(e){

    $("status").textContent=
      e.message;

    return;
  }

  state.messages.push({
    role:"user",
    content:text||"[Attached file(s)]"
  });

  const a={
    role:"assistant",
    content:""
  };

  state.messages.push(a);

  $("prompt").value="";

  state.files=[];

  renderFiles();

  render();

  $("status").textContent=
    "Thinking…";

  $("send").textContent=
    "Stop";

  $("send").classList.add("stop");

  state.controller=
    new AbortController();

  try{

    const apiMessages=
      state.messages
      .slice(0,-1)
      .map(
        (m,i)=>{

          if(
            i===
            state.messages.length-2
          ){

            return{
              role:"user",
              content
            };

          }

          return{
            role:m.role,
            content:m.content
          };
        }
      );

    const r=await fetch(
      "/api/chat",
      {
        method:"POST",

        headers:{
          "content-type":
            "application/json"
        },

        body:JSON.stringify({
          model:$("model").value,
          messages:apiMessages,
          stream:true
        }),

        signal:state.controller.signal
      }
    );

    if(!r.ok){

      const t=await r.text();

      throw new Error(
        t||
        ("HTTP "+r.status)
      );
    }

    const reader=
      r.body.getReader();

    const dec=
      new TextDecoder();

    let buf="";

    while(true){

      const q=
        await reader.read();

      if(q.done)break;

      buf+=
        dec.decode(
          q.value,
          {stream:true}
        );

      const events=
        buf.split("\n\n");

      buf=
        events.pop()||"";

      for(const ev of events){

        let data="";

        for(
          const line
          of ev.split("\n")
        ){

          if(
            line.startsWith("data:")
          ){

            data+=
              line.slice(5).trim();
          }
        }

        if(
          !data||
          data==="[DONE]"
        ){
          continue;
        }

        let j;

        try{

          j=JSON.parse(data);

        }catch{

          continue;
        }

        if(j.error){

          throw new Error(
            j.error.message||
            j.error
          );
        }

        const delta=
          j.choices?.[0]?.delta?.content;

        if(delta){

          a.content+=delta;

        }

        if(j.usage){

          $("usage").textContent=
            (
              j.usage.total_tokens||0
            )+
            " tokens";
        }

        render();
      }
    }

  }catch(e){

    if(e.name!=="AbortError"){

      a.content=
        "Error: "+
        e.message;
    }

    render();

  }finally{

    state.controller=null;

    $("send").textContent=
      "Send";

    $("send").classList.remove(
      "stop"
    );

    $("status").textContent=
      "Ready";
  }
}

async function council(){

  const prompt=
    $("prompt").value.trim();

  if(!prompt)return;

  $("prompt").value="";

  const candidates=
    state.models
      .filter(
        m=>m.type==="chat"
      )
      .slice(0,3);

  if(!candidates.length){

    $("status").textContent=
      "No chat models available";

    return;
  }

  state.messages.push({
    role:"user",
    content:prompt
  });

  const a={
    role:"assistant",
    content:"Running Council…"
  };

  state.messages.push(a);

  render();

  try{

    const r=
      await fetch(
        "/api/council",
        {
          method:"POST",

          headers:{
            "content-type":
              "application/json"
          },

          body:JSON.stringify({
            prompt,
            models:
              candidates.map(
                x=>x.id
              )
          })
        }
      );

    const d=
      await r.json();

    if(!r.ok){

      throw new Error(
        d.error?.message||
        d.error||
        "Council failed"
      );
    }

    a.content=
      d.answer||
      "No council answer.";

    render();

  }catch(e){

    a.content=
      "Council error: "+
      e.message;

    render();
  }
}

$("send").onclick=
  send;

$("council").onclick=
  council;

$("newBtn").onclick=
  reset;

$("menu").onclick=
  ()=>$("side").classList.toggle(
    "open"
  );

$("fileBtn").onclick=
  ()=>$("files").click();

$("files").onchange=
  ()=>{
    state.files.push(
      ...Array.from(
        $("files").files
      )
    );

    $("files").value="";

    renderFiles();
  };

$("prompt").addEventListener(
  "keydown",
  e=>{
    if(
      e.key==="Enter"&&
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

    e.target.style.height=
      "auto";

    e.target.style.height=
      Math.min(
        e.target.scrollHeight,
        190
      )+
      "px";
  }
);

$("modelInfo").onclick=
  ()=>{

    const m=selected();

    $("modalTitle").textContent=
      m?.name||
      m?.id||
      "Model";

    $("modalBody").innerHTML=
      m?

      '<p>'+
      esc(
        m.description||""
      )+
      '</p>'+

      '<p>Context: '+
      esc(
        m.context_window||"?"
      )+
      '</p>'+

      '<div>'+
      (
        (m.capabilities||[])
        .map(
          x=>
            '<span class="tag">'+
            esc(x)+
            '</span>'
        )
        .join("")
      )+
      '</div>'+

      '<p class="small">'+
      'Input /1K: '+
      esc(
        m.pricing?.input_per_1k??"?"
      )+
      ' · Output /1K: '+
      esc(
        m.pricing?.output_per_1k??"?"
      )+
      '</p>'

      :

      "No model selected";

    $("back").classList.add(
      "show"
    );
  };

$("close").onclick=
  ()=>$("back").classList.remove(
    "show"
  );

renderHistory();

render();

loadModels();

</script>
</body>
</html>`;

const BASE =
  "https://www.codecraftapi.com/v1";

const JSON_HEADERS={
  "content-type":
    "application/json; charset=utf-8",

  "access-control-allow-origin":
    "*",

  "access-control-allow-headers":
    "Content-Type, Authorization",

  "access-control-allow-methods":
    "GET,POST,OPTIONS"
};

function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:JSON_HEADERS
    }
  );
}

function auth(env){

  return env.CODECRAFT_API_KEY||"";
}

async function cc(
  env,
  path,
  opts={}
){

  const h=
    new Headers(
      opts.headers||{}
    );

  h.set(
    "Authorization",
    "Bearer "+auth(env)
  );

  if(
    opts.body&&
    !h.has("content-type")
  ){

    h.set(
      "content-type",
      "application/json"
    );
  }

  return fetch(
    BASE+path,
    {
      ...opts,
      headers:h
    }
  );
}

async function models(env){

  const r=
    await cc(
      env,
      "/models",
      {
        method:"GET"
      }
    );

  const t=
    await r.text();

  let d;

  try{

    d=JSON.parse(t);

  }catch{

    d={
      error:t
    };
  }

  return{
    r,
    d
  };
}

async function chat(
  env,
  body
){

  if(!auth(env)){

    return json(
      {
        error:
          "CODECRAFT_API_KEY is not configured."
      },
      500
    );
  }

  if(
    !body?.model||
    !Array.isArray(
      body.messages
    )
  ){

    return json(
      {
        error:
          "model and messages are required"
      },
      400
    );
  }

  const payload={
    model:
      body.model,

    messages:
      body.messages,

    stream:true,

    max_tokens:
      body.max_tokens||8192
  };

  for(
    const k of [
      "temperature",
      "top_p",
      "tools",
      "tool_choice",
      "response_format",
      "stop",
      "frequency_penalty",
      "presence_penalty",
      "seed"
    ]
  ){

    if(
      body[k]!==undefined
    ){

      payload[k]=
        body[k];
    }
  }

  const r=
    await cc(
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

    return new Response(
      await r.text(),
      {
        status:r.status,
        headers:
          JSON_HEADERS
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

        "x-accel-buffering":
          "no",

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

  const prompt=
    String(
      body?.prompt||""
    ).trim();

  const ids=
    Array.isArray(
      body?.models
    )
      ?
        body.models.slice(0,3)
      :
        [];

  if(
    !prompt||
    !ids.length
  ){

    return json(
      {
        error:
          "prompt and models are required"
      },
      400
    );
  }

  const answers=[];

  for(
    const model of ids
  ){

    const r=
      await cc(
        env,
        "/chat/completions",
        {
          method:"POST",

          body:
            JSON.stringify({
              model,

              messages:[
                {
                  role:"system",

                  content:
                    "You are one independent member of an AI council. Give a useful answer and state uncertainty when appropriate."
                },

                {
                  role:"user",
                  content:prompt
                }
              ],

              stream:false,

              max_tokens:4096
            })
        }
      );

    if(r.ok){

      const d=
        await r.json();

      answers.push({
        model,

        answer:
          d.choices?.[0]?.message?.content||
          ""
      });
    }
  }

  if(!answers.length){

    return json(
      {
        error:
          "No council model returned a successful answer."
      },
      502
    );
  }

  const synthModel=
    answers[0].model;

  const r=
    await cc(
      env,
      "/chat/completions",
      {
        method:"POST",

        body:
          JSON.stringify({

            model:
              synthModel,

            messages:[
              {
                role:"system",

                content:
                  "Synthesize the independent council answers into one clear, accurate response. Do not blindly agree; resolve contradictions using evidence in the answers."
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

            stream:false,

            max_tokens:8192
          })
      }
    );

  if(!r.ok){

    return json({
      answer:
        answers
          .map(
            x=>
              "## "+
              x.model+
              "\n"+
              x.answer
          )
          .join(
            "\n\n---\n\n"
          ),

      answers
    });
  }

  const d=
    await r.json();

  return json({
    answer:
      d.choices?.[0]?.message?.content||
      "",

    answers
  });
}

export default{

  async fetch(
    request,
    env
  ){

    const u=
      new URL(
        request.url
      );

    if(
      request.method===
      "OPTIONS"
    ){

      return new Response(
        null,
        {
          status:204,
          headers:
            JSON_HEADERS
        }
      );
    }

    try{

      if(
        u.pathname===
          "/"||
        u.pathname===
          "/index.html"
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
        u.pathname===
        "/api/health"
      ){

        return json({
          ok:true,

          provider:
            "CodeCraft API",

          has_key:
            !!auth(env),

          base:
            BASE
        });
      }

      if(
        u.pathname===
          "/api/models"&&
        request.method===
          "GET"
      ){

        const {
          r,
          d
        }=
          await models(env);

        return json(
          d,
          r.status
        );
      }

      if(
        u.pathname===
          "/api/chat"&&
        request.method===
          "POST"
      ){

        return chat(
          env,
          await request.json()
        );
      }

      if(
        u.pathname===
          "/api/council"&&
        request.method===
          "POST"
      ){

        return council(
          env,
          await request.json()
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
            e?.message||
            String(e)
        },
        500
      );
    }
  }
};
