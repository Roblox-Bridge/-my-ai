const CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AetherAI Studio</title>

<script src="https://cdn.tailwindcss.com"></script>

<style>
*{box-sizing:border-box}

html,body{
  margin:0;
  min-height:100%;
  background:#07070b;
  color:#f4f4f5;
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}

body{
  background:
    radial-gradient(circle at 10% 0%,rgba(99,102,241,.20),transparent 32%),
    radial-gradient(circle at 90% 100%,rgba(168,85,247,.16),transparent 34%),
    #07070b;
}

.glass{
  background:rgba(18,18,25,.72);
  border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(22px);
  -webkit-backdrop-filter:blur(22px);
}

textarea{resize:none}

.message{
  white-space:pre-wrap;
  line-height:1.7;
  overflow-wrap:anywhere;
}

::-webkit-scrollbar{width:7px}
::-webkit-scrollbar-thumb{
  background:#303038;
  border-radius:999px;
}

select option{
  background:#111116;
  color:white;
}

button:disabled{
  opacity:.5;
  cursor:not-allowed;
}
</style>
</head>

<body>

<div class="min-h-screen flex">

<!-- SIDEBAR -->
<aside class="hidden md:flex w-72 shrink-0 border-r border-white/10
bg-black/20 flex-col p-4">

  <div class="flex items-center gap-3 mb-7">
    <div class="w-11 h-11 rounded-2xl
      bg-gradient-to-br from-indigo-500 to-purple-600
      flex items-center justify-center font-bold text-lg">
      A
    </div>

    <div>
      <div class="font-bold">AetherAI</div>
      <div class="text-xs text-zinc-500">Studio</div>
    </div>
  </div>

  <button onclick="newChat()"
    class="w-full py-3 rounded-xl bg-white text-black
    font-semibold hover:bg-zinc-200 transition">
    + New conversation
  </button>

  <div class="mt-7 mb-2 text-[11px] uppercase
    tracking-[.18em] text-zinc-600">
    Workspace
  </div>

  <button onclick="showChat()"
    class="w-full text-left px-3 py-3 rounded-xl
    bg-white/5 hover:bg-white/10 transition">
    💬 AI Chat
  </button>

  <button onclick="showImage()"
    class="mt-2 w-full text-left px-3 py-3 rounded-xl
    hover:bg-white/10 transition">
    🎨 Image Studio
  </button>

  <div class="mt-auto text-xs text-zinc-600">
    AetherAI Studio
  </div>
</aside>


<!-- MAIN -->
<main class="flex-1 min-w-0">

<header class="h-16 border-b border-white/10
flex items-center justify-between px-4 md:px-8">

  <div class="font-semibold" id="pageTitle">
    AI Chat
  </div>

  <div class="flex items-center gap-3">

    <select id="persona"
      class="glass rounded-xl px-3 py-2 text-sm outline-none">
      <option value="architect">Software Architect</option>
      <option value="researcher">Research Analyst</option>
      <option value="creative">Creative Strategist</option>
    </select>

    <div id="status"
      class="flex items-center gap-2 text-xs text-yellow-400">
      <span id="statusDot"
        class="w-2 h-2 rounded-full bg-yellow-400"></span>
      <span id="statusText">Checking</span>
    </div>

  </div>
</header>


<!-- CHAT VIEW -->
<section id="chatView"
class="flex flex-col h-[calc(100vh-4rem)]">

<div id="messages"
class="flex-1 overflow-y-auto px-4 md:px-8 py-8">

<div id="welcome"
class="max-w-4xl mx-auto min-h-full
flex flex-col justify-center">

  <div class="text-4xl md:text-6xl font-bold tracking-tight">
    Build with
    <span class="bg-gradient-to-r from-indigo-400
    to-purple-400 bg-clip-text text-transparent">
      AetherAI
    </span>
  </div>

  <p class="mt-5 text-zinc-400 text-lg max-w-2xl">
    Your AI workspace for conversations,
    research, coding and creative work.
  </p>

  <div class="grid md:grid-cols-3 gap-3 mt-8">

    <button onclick="useSuggestion(
      'Design a modern architecture for my AI application'
    )"
    class="glass p-5 rounded-2xl text-left
    hover:bg-white/10 transition">
      <div class="text-lg">🏗️</div>
      <b class="block mt-2">Architecture</b>
      <div class="text-sm text-zinc-500 mt-1">
        Design a software system
      </div>
    </button>

    <button onclick="useSuggestion(
      'Explain this topic and organize the important information clearly'
    )"
    class="glass p-5 rounded-2xl text-left
    hover:bg-white/10 transition">
      <div class="text-lg">🔎</div>
      <b class="block mt-2">Research</b>
      <div class="text-sm text-zinc-500 mt-1">
        Analyze and explain
      </div>
    </button>

    <button onclick="useSuggestion(
      'Give me 10 original ideas for an AI project'
    )"
    class="glass p-5 rounded-2xl text-left
    hover:bg-white/10 transition">
      <div class="text-lg">✨</div>
      <b class="block mt-2">Ideas</b>
      <div class="text-sm text-zinc-500 mt-1">
        Generate new concepts
      </div>
    </button>

  </div>
</div>

</div>


<!-- COMPOSER -->
<div class="p-4 md:p-6">

<div class="max-w-4xl mx-auto glass rounded-2xl p-3">

<textarea id="prompt"
rows="2"
placeholder="Message AetherAI..."
class="w-full bg-transparent outline-none px-3 py-2
text-white placeholder-zinc-600"></textarea>

<div class="flex items-center justify-between mt-2">

<div class="text-xs text-zinc-600 px-3">
AetherAI
</div>

<button id="sendBtn"
onclick="sendMessage()"
class="px-5 py-2.5 rounded-xl bg-white text-black
font-semibold hover:bg-zinc-200 transition">
Send
</button>

</div>
</div>
</div>

</section>


<!-- IMAGE VIEW -->
<section id="imageView"
class="hidden p-5 md:p-10">

<div class="max-w-5xl mx-auto">

<h1 class="text-3xl font-bold">
Image Studio
</h1>

<p class="text-zinc-500 mt-2">
Generate images with Cloudflare Workers AI.
</p>

<div class="glass rounded-2xl p-5 mt-8">

<label class="text-sm text-zinc-400">
Prompt
</label>

<textarea id="imagePrompt"
rows="5"
class="w-full mt-2 rounded-xl bg-black/30
border border-white/10 p-4 outline-none"
placeholder="A cinematic futuristic city at night..."></textarea>

<label class="block mt-5 text-sm text-zinc-400">
Negative prompt
</label>

<textarea id="negativePrompt"
rows="2"
class="w-full mt-2 rounded-xl bg-black/30
border border-white/10 p-4 outline-none"
placeholder="blurry, low quality"></textarea>

<button id="imageBtn"
onclick="generateImage()"
class="mt-5 px-6 py-3 rounded-xl
bg-white text-black font-semibold">
Generate image
</button>

</div>

<div id="imageResult" class="mt-8"></div>

</div>
</section>

</main>
</div>


<script>
let history = [];

const messages =
document.getElementById("messages");

const prompt =
document.getElementById("prompt");

const sendBtn =
document.getElementById("sendBtn");

function escapeHtml(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function removeWelcome(){
  const w=document.getElementById("welcome");
  if(w) w.remove();
}

function addMessage(role,text){
  removeWelcome();

  const box=document.createElement("div");

  box.className="max-w-4xl mx-auto mb-7";

  const user=role==="user";

  box.innerHTML=\`
    <div class="flex gap-3">

      <div class="w-9 h-9 rounded-xl shrink-0
      flex items-center justify-center
      \${user
        ?"bg-zinc-800"
        :"bg-gradient-to-br from-indigo-500 to-purple-600"}">
        \${user?"U":"A"}
      </div>

      <div class="flex-1 min-w-0">

        <div class="text-xs text-zinc-500 mb-1">
          \${user?"You":"AetherAI"}
        </div>

        <div class="message text-zinc-200">
          \${escapeHtml(text)}
        </div>

      </div>
    </div>
  \`;

  messages.appendChild(box);
  messages.scrollTop=messages.scrollHeight;
}

function useSuggestion(text){
  prompt.value=text;
  prompt.focus();
}

function newChat(){
  history=[];

  messages.innerHTML=\`
    <div id="welcome"
    class="max-w-4xl mx-auto min-h-full
    flex flex-col justify-center">

      <div class="text-4xl md:text-6xl font-bold">
        Build with
        <span class="bg-gradient-to-r
        from-indigo-400 to-purple-400
        bg-clip-text text-transparent">
          AetherAI
        </span>
      </div>

      <p class="mt-5 text-zinc-400 text-lg">
        Start a new conversation.
      </p>
    </div>
  \`;
}

function showChat(){
  document.getElementById("chatView")
  .classList.remove("hidden");

  document.getElementById("imageView")
  .classList.add("hidden");

  document.getElementById("pageTitle")
  .textContent="AI Chat";
}

function showImage(){
  document.getElementById("chatView")
  .classList.add("hidden");

  document.getElementById("imageView")
  .classList.remove("hidden");

  document.getElementById("pageTitle")
  .textContent="Image Studio";
}

async function sendMessage(){

  const text=prompt.value.trim();

  if(!text || sendBtn.disabled) return;

  prompt.value="";
  addMessage("user",text);

  history.push({
    role:"user",
    content:text
  });

  sendBtn.disabled=true;
  sendBtn.textContent="Thinking...";

  try{

    const response=await fetch("/api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        messages:history,
        persona:document.getElementById("persona").value
      })
    });

    const data=await response.json();

    if(!response.ok || !data.success){
      throw new Error(
        data.error || "AI request failed"
      );
    }

    addMessage("assistant",data.answer);

    history.push({
      role:"assistant",
      content:data.answer
    });

  }catch(error){

    addMessage(
      "assistant",
      "Error: "+error.message
    );

  }finally{

    sendBtn.disabled=false;
    sendBtn.textContent="Send";

  }
}

async function generateImage(){

  const p=document
    .getElementById("imagePrompt")
    .value.trim();

  const negative=document
    .getElementById("negativePrompt")
    .value.trim();

  const result=document
    .getElementById("imageResult");

  const btn=document
    .getElementById("imageBtn");

  if(!p){
    result.innerHTML=
      '<div class="text-red-400">Enter an image prompt.</div>';
    return;
  }

  btn.disabled=true;
  btn.textContent="Generating...";

  result.innerHTML=\`
    <div class="glass rounded-2xl p-6 text-zinc-400">
      Generating your image...
    </div>
  \`;

  try{

    const response=await fetch(
      "/api/generate-image",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          prompt:p,
          negativePrompt:negative
        })
      }
    );

    if(!response.ok){

      let message="Image generation failed.";

      try{
        const data=await response.json();
        message=data.error || message;
      }catch{}

      throw new Error(message);
    }

    const blob=await response.blob();

    const url=URL.createObjectURL(blob);

    result.innerHTML=\`
      <div class="glass rounded-2xl p-4">
        <img
          src="\${url}"
          alt="Generated image"
          class="w-full rounded-xl"
        >
      </div>
    \`;

  }catch(error){

    result.innerHTML=\`
      <div class="glass rounded-2xl p-5 text-red-400">
        \${escapeHtml(error.message)}
      </div>
    \`;

  }finally{

    btn.disabled=false;
    btn.textContent="Generate image";

  }
}

prompt.addEventListener("keydown",function(event){

  if(
    event.key==="Enter" &&
    !event.shiftKey
  ){
    event.preventDefault();
    sendMessage();
  }

});

async function health(){

  try{

    const response=
      await fetch("/api/health");

    const data=
      await response.json();

    if(data.success){

      document.getElementById("statusDot")
        .className=
        "w-2 h-2 rounded-full bg-green-400";

      document.getElementById("statusText")
        .textContent="Online";

      document.getElementById("status")
        .className=
        "flex items-center gap-2 text-xs text-green-400";

    }else{
      throw new Error();
    }

  }catch{

    document.getElementById("statusDot")
      .className=
      "w-2 h-2 rounded-full bg-red-400";

    document.getElementById("statusText")
      .textContent="Offline";

    document.getElementById("status")
      .className=
      "flex items-center gap-2 text-xs text-red-400";
  }
}

health();
</script>

</body>
</html>`;


function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      ...CORS,
      "Content-Type":"application/json;charset=UTF-8"
    }
  });
}


function clean(value,fallback=""){
  return typeof value==="string"
    ? value.trim()
    : fallback;
}


function normalizeMessages(messages){

  if(!Array.isArray(messages))
    return [];

  return messages
    .filter(m=>m && typeof m==="object")
    .map(m=>({
      role:
        m.role==="assistant"
          ? "assistant"
          : "user",
      content:clean(m.content)
    }))
    .filter(m=>m.content);
}


function buildPrompt(messages,persona){

  const personas={

    architect:
      "You are an expert software architect. Give practical, accurate and production-oriented answers.",

    researcher:
      "You are a careful research analyst. Clearly separate facts, assumptions and uncertainty. Do not invent sources or facts.",

    creative:
      "You are a creative strategist. Generate original, practical and useful ideas."

  };

  const system=
    personas[persona] ||
    personas.architect;

  const conversation=
    messages
      .map(m=>
        m.role.toUpperCase()+": "+m.content
      )
      .join("\\n\\n");

  return system+
    "\\n\\nYou are AetherAI, a helpful AI assistant."+
    "\\nAnswer the actual request directly."+
    "\\nDo not invent facts."+
    "\\nUse clear formatting."+
    "\\n\\nConversation:\\n\\n"+
    conversation+
    "\\n\\nASSISTANT:";
}


async function chat(request,env){

  let body;

  try{
    body=await request.json();
  }catch{
    return json({
      success:false,
      error:"Invalid JSON."
    },400);
  }

  const messages=
    normalizeMessages(body.messages);

  if(!messages.length){
    return json({
      success:false,
      error:"Message is empty."
    },400);
  }

  if(!env.AI){
    return json({
      success:false,
      error:
        "Workers AI binding 'AI' is not connected. Add Workers AI to this Worker."
    },500);
  }

  try{

    const prompt=
      buildPrompt(
        messages,
        clean(body.persona,"architect")
      );

    const result=
      await env.AI.run(
        CHAT_MODEL,
        {
          prompt,
          max_tokens:2048,
          temperature:.7
        }
      );

    const answer=
      typeof result==="string"
        ? result
        : result?.response ||
          result?.text ||
          JSON.stringify(result);

    return json({
      success:true,
      answer,
      provider:"cloudflare-workers-ai",
      model:CHAT_MODEL
    });

  }catch(error){

    console.error(error);

    return json({
      success:false,
      error:
        error?.message ||
        "Workers AI request failed."
    },500);
  }
}


async function generateImage(request,env){

  let body;

  try{
    body=await request.json();
  }catch{
    return json({
      success:false,
      error:"Invalid JSON."
    },400);
  }

  const prompt=
    clean(body.prompt);

  if(!prompt){
    return json({
      success:false,
      error:"Image prompt is required."
    },400);
  }

  if(!env.AI){
    return json({
      success:false,
      error:
        "Workers AI binding 'AI' is not connected."
    },500);
  }

  try{

    const result=
      await env.AI.run(
        IMAGE_MODEL,
        {
          prompt,
          negative_prompt:
            clean(body.negativePrompt),
          width:1024,
          height:1024,
          num_steps:20,
          guidance:7.5
        }
      );

    /*
      SDXL currently returns a ReadableStream
      from the Workers AI binding.
    */

    if(result instanceof ReadableStream){

      return new Response(result,{
        status:200,
        headers:{
          ...CORS,
          "Content-Type":"image/png",
          "Cache-Control":"no-store"
        }
      });

    }

    if(result instanceof ArrayBuffer){

      return new Response(result,{
        status:200,
        headers:{
          ...CORS,
          "Content-Type":"image/png"
        }
      });

    }

    if(result?.image){

      const binary=
        Uint8Array.from(
          atob(result.image),
          c=>c.charCodeAt(0)
        );

      return new Response(binary,{
        status:200,
        headers:{
          ...CORS,
          "Content-Type":"image/png"
        }
      });
    }

    throw new Error(
      "Image model returned an unsupported response."
    );

  }catch(error){

    console.error(error);

    return json({
      success:false,
      error:
        error?.message ||
        "Image generation failed."
    },500);
  }
}


export default {

  async fetch(request,env){

    const url=
      new URL(request.url);

    if(request.method==="OPTIONS"){

      return new Response(null,{
        status:204,
        headers:CORS
      });
    }


    /*
      HOME PAGE
      No index.html or Assets binding required.
    */

    if(
      url.pathname==="/" ||
      url.pathname==="/index.html"
    ){

      return new Response(HTML,{
        status:200,
        headers:{
          "Content-Type":
            "text/html;charset=UTF-8",
          "Cache-Control":
            "no-store"
        }
      });
    }


    if(url.pathname==="/api/health"){

      return json({
        success:true,
        name:"AetherAI Studio",
        status:"online",
        workersAI:Boolean(env.AI),
        chatModel:CHAT_MODEL,
        imageModel:IMAGE_MODEL
      });
    }


    if(
      url.pathname==="/api/chat" &&
      request.method==="POST"
    ){

      return chat(request,env);
    }


    if(
      url.pathname==="/api/generate-image" &&
      request.method==="POST"
    ){

      return generateImage(request,env);
    }


    return json({
      success:false,
      error:"Route not found."
    },404);
  }
};
