const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>AetherAI</title>

<style>
*{box-sizing:border-box}

html,body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  background:#212121;
  color:#ececec;
}

button,input,textarea,select{
  font:inherit;
}

button{
  cursor:pointer;
}

.app{
  width:100%;
  height:100%;
  display:flex;
}

/* SIDEBAR */

.sidebar{
  width:280px;
  height:100%;
  background:#171717;
  border-right:1px solid #303030;
  display:flex;
  flex-direction:column;
  flex-shrink:0;
  z-index:50;
}

.sidebar-top{
  display:flex;
  gap:8px;
  padding:12px;
}

.new-chat{
  flex:1;
  height:42px;
  border:1px solid #3a3a3a;
  background:#212121;
  color:#eee;
  border-radius:10px;
  text-align:left;
  padding:0 14px;
}

.close-sidebar{
  width:42px;
  height:42px;
  border:1px solid #3a3a3a;
  background:#212121;
  color:#eee;
  border-radius:10px;
  display:none;
}

.history{
  flex:1;
  overflow-y:auto;
  padding:5px 10px;
}

.history-item{
  padding:11px 12px;
  border-radius:9px;
  color:#ddd;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  margin-bottom:3px;
  cursor:pointer;
}

.history-item:hover,
.history-item.active{
  background:#2a2a2a;
}

.no-history{
  color:#777;
  padding:15px 10px;
  font-size:13px;
}

.sidebar-bottom{
  padding:13px;
  color:#777;
  font-size:11px;
  border-top:1px solid #292929;
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
  height:64px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  gap:9px;
  padding:0 18px;
  border-bottom:1px solid #2d2d2d;
}

.hamburger{
  display:none;
  width:40px;
  height:40px;
  border:0;
  background:transparent;
  color:#ddd;
  font-size:23px;
}

.logo{
  font-size:17px;
  font-weight:650;
  white-space:nowrap;
}

.model-select{
  max-width:350px;
  min-width:120px;
  padding:8px 10px;
  border-radius:9px;
  border:1px solid #3b3b3b;
  background:#2a2a2a;
  color:#eee;
  outline:none;
}

.council-button{
  margin-left:auto;
  padding:8px 12px;
  border-radius:9px;
  border:1px solid #414141;
  background:#2a2a2a;
  color:#eee;
}

.council-button.active{
  background:#3a3a3a;
  border-color:#777;
}

/* CHAT */

.chat{
  flex:1;
  overflow-y:auto;
  min-height:0;
}

.welcome{
  max-width:760px;
  margin:16vh auto 0;
  padding:20px;
}

.welcome h1{
  margin:0 0 12px;
  font-size:34px;
}

.welcome p{
  color:#999;
  line-height:1.6;
}

.messages{
  max-width:850px;
  margin:0 auto;
  padding:28px 20px 170px;
}

.message{
  display:flex;
  gap:14px;
  margin-bottom:30px;
}

.avatar{
  width:31px;
  height:31px;
  border-radius:8px;
  background:#303030;
  flex-shrink:0;
  display:grid;
  place-items:center;
  font-size:12px;
}

.message.user .avatar{
  background:#414141;
}

.message-body{
  min-width:0;
  flex:1;
  font-size:15.5px;
  line-height:1.65;
  overflow-wrap:anywhere;
}

.message-body p{
  margin:0 0 12px;
}

.message-body strong{
  color:#fff;
}

.message-body code{
  background:#303030;
  padding:2px 5px;
  border-radius:5px;
}

.message-body pre{
  background:#111;
  border:1px solid #333;
  border-radius:10px;
  padding:14px;
  overflow:auto;
}

.message-body pre code{
  background:transparent;
  padding:0;
}

.chat-image{
  display:block;
  max-width:min(100%,650px);
  border-radius:12px;
  margin-top:10px;
}

.message-actions{
  display:flex;
  gap:5px;
  margin-top:7px;
}

.copy-button{
  border:0;
  background:transparent;
  color:#888;
  font-size:12px;
  padding:4px 0;
}

.copy-button:hover{
  color:#ddd;
}

.council-label{
  display:inline-block;
  border:1px solid #555;
  border-radius:999px;
  padding:3px 9px;
  color:#bbb;
  font-size:11px;
  margin-bottom:8px;
}

.sources{
  margin-top:13px;
  border-top:1px solid #333;
  padding-top:9px;
}

.sources-title{
  color:#888;
  font-size:12px;
  margin-bottom:5px;
}

.sources a{
  display:block;
  color:#9ec5ff;
  font-size:13px;
  text-decoration:none;
  margin:5px 0;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

/* COMPOSER */

.composer-area{
  position:fixed;
  left:280px;
  right:0;
  bottom:0;
  z-index:20;
  padding:35px 20px 18px;
  background:linear-gradient(transparent,#212121 27%);
}

.composer{
  max-width:800px;
  margin:auto;
  background:#2f2f2f;
  border:1px solid #484848;
  border-radius:17px;
  padding:8px 10px;
}

.attachments{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  padding:2px 4px 7px;
}

.file-chip{
  display:flex;
  align-items:center;
  gap:7px;
  background:#222;
  border:1px solid #444;
  border-radius:8px;
  padding:5px 7px;
  font-size:12px;
}

.file-chip img{
  width:34px;
  height:34px;
  object-fit:cover;
  border-radius:5px;
}

.file-chip button{
  border:0;
  background:transparent;
  color:#aaa;
}

.composer-row{
  display:flex;
  align-items:flex-end;
  gap:7px;
}

.attach-button{
  width:38px;
  height:38px;
  border:0;
  background:transparent;
  color:#ccc;
  font-size:23px;
}

.prompt{
  flex:1;
  min-height:40px;
  max-height:180px;
  resize:none;
  outline:none;
  border:0;
  background:transparent;
  color:#eee;
  padding:9px 4px;
  line-height:1.45;
}

.prompt::placeholder{
  color:#888;
}

.send-button{
  width:38px;
  height:38px;
  border:0;
  border-radius:10px;
  background:#eee;
  color:#111;
  font-weight:700;
}

.send-button:disabled{
  opacity:.35;
}

.status{
  min-height:16px;
  color:#888;
  font-size:11px;
  margin-top:5px;
}

.hint{
  max-width:800px;
  margin:7px auto 0;
  color:#666;
  text-align:center;
  font-size:10px;
}

/* MOBILE */

.overlay{
  display:none;
}

@media(max-width:760px){

  .sidebar{
    position:fixed;
    top:0;
    bottom:0;
    left:0;
    transform:translateX(-105%);
    transition:transform .18s ease;
    box-shadow:12px 0 35px rgba(0,0,0,.45);
  }

  .sidebar.open{
    transform:translateX(0);
  }

  .overlay.open{
    display:block;
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.5);
    z-index:40;
  }

  .close-sidebar{
    display:block;
  }

  .hamburger{
    display:block;
  }

  .topbar{
    padding:0 10px;
  }

  .model-select{
    max-width:180px;
  }

  .council-button{
    padding:8px;
    font-size:12px;
  }

  .composer-area{
    left:0;
    padding:30px 10px 12px;
  }

  .messages{
    padding-left:12px;
    padding-right:12px;
  }

  .welcome{
    margin-top:12vh;
    padding:18px;
  }

  .welcome h1{
    font-size:28px;
  }
}
</style>
</head>

<body>

<div class="app">

<aside class="sidebar" id="sidebar">

  <div class="sidebar-top">
    <button class="new-chat" id="newChat">＋ New chat</button>
    <button class="close-sidebar" id="closeSidebar">×</button>
  </div>

  <div class="history" id="history"></div>

  <div class="sidebar-bottom">
    Free models only · Web search always on
  </div>

</aside>

<div class="overlay" id="overlay"></div>

<main class="main">

<header class="topbar">

  <button class="hamburger" id="hamburger">☰</button>

  <div class="logo">AetherAI</div>

  <select class="model-select" id="modelSelect"></select>

  <button class="council-button" id="councilButton">
    AI Council
  </button>

</header>

<section class="chat" id="chat">

  <div class="welcome" id="welcome">
    <h1>How can I help?</h1>
    <p>
      Ask anything. Web search is always available.
      Ask for an image and AetherAI will automatically use
      a free image model.
    </p>
  </div>

  <div class="messages" id="messages"></div>

</section>

</main>

<div class="composer-area">

  <div class="composer">

    <div class="attachments" id="attachments"></div>

    <div class="composer-row">

      <button
        class="attach-button"
        id="attachButton"
        title="Attach files"
      >＋</button>

      <textarea
        class="prompt"
        id="prompt"
        rows="1"
        placeholder="Message AetherAI..."
      ></textarea>

      <button
        class="send-button"
        id="sendButton"
      >↑</button>

    </div>

    <div class="status" id="status"></div>

  </div>

  <div class="hint">
    AetherAI can make mistakes. Check important information.
  </div>

</div>

</div>

<input
  id="fileInput"
  type="file"
  hidden
  multiple
  accept="image/*,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.yaml,.yml"
/>

<script>

const $ = id => document.getElementById(id);

const state = {
  messages: [],
  history: JSON.parse(
    localStorage.getItem("aether_history") || "[]"
  ),
  currentId: null,
  models: [],
  selectedModel: "",
  council: false,
  attachments: []
};


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}


/* =========================
   MARKDOWN
========================= */

function markdownToHtml(value){

  let text = escapeHtml(value);

  text = text.replace(
    /```([\\s\\S]*?)```/g,
    function(_, code){
      return "<pre><code>" +
        code.replace(/^\\w+\\n/,"") +
        "</code></pre>";
    }
  );

  text = text.replace(
    /\`([^\`]+)\`/g,
    "<code>$1</code>"
  );

  text = text.replace(
    /\\*\\*(.*?)\\*\\*/g,
    "<strong>$1</strong>"
  );

  text = text.replace(
    /\\*([^*]+)\\*/g,
    "<em>$1</em>"
  );

  text = text.replace(
    /\\n/g,
    "<br>"
  );

  return text;
}


/* =========================
   STATUS
========================= */

function setStatus(text){

  $("status").textContent = text || "";
}


/* =========================
   HISTORY
========================= */

function saveHistory(){

  const clean = state.history
    .slice(0,30)
    .map(function(chat){

      return {
        id:chat.id,
        title:chat.title,
        messages:chat.messages
          .slice(-40)
          .map(function(message){

            return {
              role:message.role,
              content:
                typeof message.content === "string"
                  ? message.content
                  : "[attachment]"
            };

          })
      };

    });

  localStorage.setItem(
    "aether_history",
    JSON.stringify(clean)
  );
}


function renderHistory(){

  const container = $("history");

  container.innerHTML = "";

  if(!state.history.length){

    const empty = document.createElement("div");

    empty.className = "no-history";

    empty.textContent = "No previous chats";

    container.appendChild(empty);

    return;
  }

  state.history.forEach(function(chat){

    const item = document.createElement("div");

    item.className =
      "history-item" +
      (
        chat.id === state.currentId
          ? " active"
          : ""
      );

    item.textContent =
      chat.title || "New chat";

    item.onclick = function(){

      loadChat(chat.id);

    };

    container.appendChild(item);

  });
}


function persistCurrent(title){

  if(!state.currentId){

    state.currentId =
      crypto.randomUUID();

  }

  const cleanMessages =
    state.messages.map(function(message){

      return {
        role:message.role,
        content:
          typeof message.content === "string"
            ? message.content
            : "[attachment]"
      };

    });

  const existing =
    state.history.find(function(chat){
      return chat.id === state.currentId;
    });

  if(existing){

    existing.messages = cleanMessages;

    if(
      title &&
      (
        !existing.title ||
        existing.title === "New chat"
      )
    ){

      existing.title =
        title.slice(0,60);

    }

  }else{

    state.history.unshift({

      id:state.currentId,

      title:
        (title || "New chat")
          .slice(0,60),

      messages:cleanMessages

    });

  }

  saveHistory();

  renderHistory();
}


function loadChat(id){

  const chat =
    state.history.find(function(x){
      return x.id === id;
    });

  if(!chat) return;

  state.currentId = chat.id;

  state.messages =
    chat.messages.map(function(message){

      return {
        role:message.role,
        content:message.content
      };

    });

  state.attachments = [];

  renderAttachments();

  renderMessages();

  renderHistory();

  closeSidebar();
}


function newChat(){

  state.currentId = null;

  state.messages = [];

  state.attachments = [];

  state.council = false;

  $("councilButton")
    .classList
    .remove("active");

  renderAttachments();

  renderMessages();

  setStatus("");

  closeSidebar();
}


/* =========================
   MESSAGES
========================= */

function addMessage(message){

  state.messages.push(message);

  renderMessages();
}


function renderMessages(){

  const container = $("messages");

  container.innerHTML = "";

  $("welcome").style.display =
    state.messages.length
      ? "none"
      : "block";

  state.messages.forEach(function(message){

    const row =
      document.createElement("div");

    row.className =
      "message " +
      message.role;

    const avatar =
      document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
      message.role === "user"
        ? "U"
        : "AI";

    const body =
      document.createElement("div");

    body.className =
      "message-body";

    if(
      message.role === "assistant" &&
      message.council
    ){

      const badge =
        document.createElement("div");

      badge.className =
        "council-label";

      badge.textContent =
        "AI Council";

      body.appendChild(badge);

    }

    const content =
      document.createElement("div");

    content.innerHTML =
      markdownToHtml(
        message.content || ""
      );

    body.appendChild(content);


    if(message.image){

      const image =
        document.createElement("img");

      image.className =
        "chat-image";

      image.src =
        message.image;

      image.alt =
        "Generated image";

      body.appendChild(image);

    }


    if(message.files){

      const note =
        document.createElement("div");

      note.style =
        "color:#888;font-size:12px;margin-top:7px";

      note.textContent =
        "📎 " +
        message.files.join(", ");

      body.appendChild(note);

    }


    if(
      message.sources &&
      message.sources.length
    ){

      const sourceBox =
        document.createElement("div");

      sourceBox.className =
        "sources";

      const title =
        document.createElement("div");

      title.className =
        "sources-title";

      title.textContent =
        "Sources";

      sourceBox.appendChild(title);


      message.sources
        .slice(0,8)
        .forEach(function(source){

          if(!source.url) return;

          const link =
            document.createElement("a");

          link.href =
            source.url;

          link.target =
            "_blank";

          link.rel =
            "noopener noreferrer";

          link.textContent =
            source.title ||
            source.url;

          sourceBox.appendChild(link);

        });

      body.appendChild(sourceBox);

    }


    if(message.role === "assistant"){

      const actions =
        document.createElement("div");

      actions.className =
        "message-actions";

      const copy =
        document.createElement("button");

      copy.className =
        "copy-button";

      copy.textContent =
        "Copy";

      copy.onclick =
        async function(){

          try{

            await navigator
              .clipboard
              .writeText(
                message.content || ""
              );

            copy.textContent =
              "Copied";

            setTimeout(function(){

              copy.textContent =
                "Copy";

            },1200);

          }catch(e){}

        };

      actions.appendChild(copy);

      body.appendChild(actions);

    }


    row.appendChild(avatar);

    row.appendChild(body);

    container.appendChild(row);

  });

  $("chat").scrollTop =
    $("chat").scrollHeight;
}


/* =========================
   ATTACHMENTS
========================= */

function renderAttachments(){

  const container =
    $("attachments");

  container.innerHTML = "";

  state.attachments
    .forEach(function(file,index){

      const chip =
        document.createElement("div");

      chip.className =
        "file-chip";

      if(
        file.type &&
        file.type.startsWith("image/")
      ){

        const image =
          document.createElement("img");

        image.src =
          file.data;

        chip.appendChild(image);

      }

      const name =
        document.createElement("span");

      name.textContent =
        file.name;

      chip.appendChild(name);

      const remove =
        document.createElement("button");

      remove.textContent =
        "×";

      remove.onclick =
        function(){

          state.attachments
            .splice(index,1);

          renderAttachments();

        };

      chip.appendChild(remove);

      container.appendChild(chip);

    });
}


/* =========================
   IMAGE RESIZE
========================= */

function resizeImage(file,maxSize){

  return new Promise(function(resolve,reject){

    const reader =
      new FileReader();

    reader.onload =
      function(){

        const image =
          new Image();

        image.onload =
          function(){

            const scale =
              Math.min(
                1,
                maxSize /
                Math.max(
                  image.width,
                  image.height
                )
              );

            const canvas =
              document.createElement("canvas");

            canvas.width =
              Math.round(
                image.width * scale
              );

            canvas.height =
              Math.round(
                image.height * scale
              );

            const context =
              canvas.getContext("2d");

            context.drawImage(
              image,
              0,
              0,
              canvas.width,
              canvas.height
            );

            resolve(
              canvas.toDataURL(
                "image/jpeg",
                .82
              )
            );

          };

        image.onerror =
          reject;

        image.src =
          reader.result;

      };

    reader.onerror =
      reject;

    reader.readAsDataURL(file);

  });
}


/* =========================
   FILE PICKER
========================= */

async function filesPicked(event){

  const files =
    Array.from(
      event.target.files
    );

  for(const file of files){

    if(
      file.size >
      8 * 1024 * 1024
    ){

      setStatus(
        file.name +
        " is too large. Maximum 8 MB."
      );

      continue;
    }


    if(
      file.type &&
      file.type.startsWith("image/")
    ){

      try{

        const data =
          await resizeImage(
            file,
            1600
          );

        state.attachments.push({

          name:file.name,

          type:"image/jpeg",

          data:data

        });

      }catch(error){

        setStatus(
          "Could not read " +
          file.name
        );

      }

      continue;
    }


    const supported =
      /\.(txt|md|json|csv|js|ts|py|html|css|xml|yaml|yml)$/i
        .test(file.name);

    if(!supported){

      setStatus(
        file.name +
        " is not a supported text file."
      );

      continue;
    }


    try{

      const text =
        await file.text();

      state.attachments.push({

        name:file.name,

        type:
          file.type ||
          "text/plain",

        text:
          text.slice(0,60000)

      });

    }catch(error){

      setStatus(
        "Could not read " +
        file.name
      );

    }

  }

  renderAttachments();

  event.target.value = "";
}


/* =========================
   IMAGE REQUEST DETECTION
========================= */

function isImageRequest(text){

  const value =
    String(text || "")
      .toLowerCase()
      .trim();

  if(!value) return false;


  const english =
    /\b(generate|create|make|draw|render|design|produce|create)\b[\s\S]{0,100}\b(image|picture|photo|wallpaper|poster|logo|illustration|art|portrait)\b/i;

  const imageFirst =
    /\b(image|picture|photo|wallpaper|poster|logo|illustration)\b[\s\S]{0,70}\b(generate|create|make|draw|render|design)\b/i;

  const romanUrdu =
    /\b(image|tasveer|photo|wallpaper|poster|logo)\b[\s\S]{0,70}\b(banao|bnao|bana|banado|bna do|bana do|tayyar karo)\b/i;

  return (
    english.test(value) ||
    imageFirst.test(value) ||
    romanUrdu.test(value)
  );
}


/* =========================
   LOAD FREE MODELS
========================= */

async function loadModels(){

  setStatus(
    "Loading free models..."
  );

  try{

    const response =
      await fetch(
        "/api/models",
        {
          cache:"no-store"
        }
      );

    const data =
      await response.json();

    if(!response.ok){

      throw new Error(
        data.error ||
        "Could not load models"
      );

    }

    state.models =
      Array.isArray(data.chat)
        ? data.chat
        : [];

    const select =
      $("modelSelect");

    select.innerHTML = "";


    state.models.forEach(function(model){

      const option =
        document.createElement("option");

      option.value =
        model.id;

      option.textContent =
        model.label ||
        model.id;

      select.appendChild(option);

    });


    if(state.models.length){

      /*
       * Backend already sorts free models
       * by capability score.
       * First model = default strongest
       * free model according to catalog data.
       */

      state.selectedModel =
        state.models[0].id;

      select.value =
        state.selectedModel;

      setStatus("");

    }else{

      const option =
        document.createElement("option");

      option.textContent =
        "No free models available";

      select.appendChild(option);

      setStatus(
        "No free chat models are currently available."
      );

    }

  }catch(error){

    setStatus(
      error.message ||
      "Could not load models."
    );

  }
}


/* =========================
   STREAM ERROR PARSER
========================= */

function extractApiError(data){

  if(!data){

    return "Unknown API error";

  }


  if(typeof data === "string"){

    return data;

  }


  if(
    data.error &&
    typeof data.error === "object"
  ){

    return (
      data.error.message ||
      data.error.code ||
      data.error.type ||
      JSON.stringify(data.error)
    );

  }


  if(
    typeof data.error === "string"
  ){

    return data.error;

  }


  if(data.message){

    return data.message;

  }


  return JSON.stringify(data);
}


/* =========================
   READ STREAM
========================= */

async function readStream(response,assistant){

  if(!response.body){

    throw new Error(
      "The AI returned an empty response stream."
    );

  }


  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";


  while(true){

    const chunk =
      await reader.read();

    if(chunk.done){

      break;

    }


    buffer +=
      decoder.decode(
        chunk.value,
        {stream:true}
      );


    const lines =
      buffer.split("\\n");

    buffer =
      lines.pop() || "";


    for(
      const line of lines
    ){

      if(
        !line.startsWith("data:")
      ){

        continue;

      }


      const raw =
        line.slice(5).trim();


      if(
        !raw ||
        raw === "[DONE]"
      ){

        continue;

      }


      let data;

      try{

        data =
          JSON.parse(raw);

      }catch(error){

        continue;

      }


      /*
       * IMPORTANT:
       * xKiro can send an error inside
       * an already-open SSE stream.
       */

      if(data.error){

        throw new Error(
          extractApiError(data)
        );

      }


      const delta =
        data
          ?.choices
          ?.0
          ?.delta
          ?.content;


      if(delta){

        assistant.content +=
          delta;

        renderMessages();

      }


      const searchResults =
        data
          ?.web_search
          ?.results;


      if(
        Array.isArray(searchResults)
      ){

        assistant.sources =
          searchResults.map(
            function(source){

              return {

                title:
                  source.title ||
                  source.name ||
                  source.url,

                url:
                  source.url

              };

            }
          );

      }

    }

  }
}


/* =========================
   NORMAL CHAT
========================= */

async function chatRequest(){

  const userMessage =
    state.messages[
      state.messages.length - 1
    ];

  const assistant = {

    role:"assistant",

    content:"",

    sources:[]

  };

  addMessage(assistant);

  setStatus(
    "Thinking..."
  );


  const payloadMessages =
    state.messages
      .slice(0,-1)
      .concat([userMessage])
      .slice(-20)
      .map(function(message){

        return {

          role:message.role,

          content:message.content

        };

      });


  const response =
    await fetch(
      "/api/chat",
      {
        method:"POST",

        headers:{
          "content-type":
            "application/json"
        },

        body:JSON.stringify({

          model:
            state.selectedModel,

          messages:
            payloadMessages,

          stream:true

        })

      }
    );


  /*
   * Errors before streaming begins.
   */

  if(!response.ok){

    const data =
      await response
        .json()
        .catch(function(){
          return {};
        });

    throw new Error(
      extractApiError(data) ||
      (
        "Chat request failed. HTTP " +
        response.status
      )
    );

  }


  await readStream(
    response,
    assistant
  );


  setStatus("");

  persistCurrent(
    typeof userMessage.content === "string"
      ? userMessage.content
      : userMessage.displayText
  );
}


/* =========================
   COUNCIL
========================= */

async function councilRequest(){

  const userMessage =
    state.messages[
      state.messages.length - 1
    ];

  const assistant = {

    role:"assistant",

    content:"",

    council:true

  };

  addMessage(assistant);

  setStatus(
    "AI Council: models are analyzing..."
  );


  const response =
    await fetch(
      "/api/council",
      {
        method:"POST",

        headers:{
          "content-type":
            "application/json"
        },

        body:JSON.stringify({

          text:
            userMessage.displayText ||
            (
              typeof userMessage.content === "string"
                ? userMessage.content
                : "Analyze the attachment."
            ),

          content:
            userMessage.content

        })

      }
    );


  const data =
    await response
      .json()
      .catch(function(){
        return {};
      });


  if(!response.ok){

    throw new Error(
      extractApiError(data) ||
      (
        "Council failed. HTTP " +
        response.status
      )
    );

  }


  assistant.content =
    data.answer ||
    "The Council returned no final answer.";


  renderMessages();

  setStatus("");

  persistCurrent(
    userMessage.displayText ||
    "Council conversation"
  );
}


/* =========================
   IMAGE GENERATION
========================= */

async function generateImage(prompt){

  setStatus(
    "Choosing a free image model..."
  );


  const response =
    await fetch(
      "/api/image",
      {
        method:"POST",

        headers:{
          "content-type":
            "application/json"
        },

        body:JSON.stringify({

          prompt:prompt

        })

      }
    );


  const data =
    await response
      .json()
      .catch(function(){
        return {};
      });


  if(!response.ok){

    throw new Error(
      extractApiError(data) ||
      (
        "Image generation failed. HTTP " +
        response.status
      )
    );

  }


  if(!data.url){

    throw new Error(
      "Image model returned no image URL."
    );

  }


  addMessage({

    role:"assistant",

    content:
      "Generated with a free image model.",

    image:data.url

  });


  setStatus("");

  persistCurrent(prompt);
}


/* =========================
   SEND
========================= */

async function sendMessage(){

  const prompt =
    $("prompt");

  const text =
    prompt.value.trim();


  if(
    !text &&
    !state.attachments.length
  ){

    return;

  }


  if(
    $("sendButton").disabled
  ){

    return;

  }


  $("sendButton").disabled =
    true;


  const attachments =
    state.attachments.slice();

  state.attachments = [];

  renderAttachments();


  const parts = [];


  for(
    const file of attachments
  ){

    if(
      file.type &&
      file.type.startsWith("image/")
    ){

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
          "\\n\\n[File: " +
          file.name +
          "]\\n" +
          file.text

      });

    }

  }


  if(parts.length){

    parts.push({

      type:"text",

      text:
        text ||
        "Analyze the attached file(s)."

    });

  }


  const userMessage = {

    role:"user",

    content:
      parts.length
        ? parts
        : text,

    displayText:
      text ||
      "Analyze the attached file(s).",

    files:
      attachments.map(
        function(file){
          return file.name;
        }
      )

  };


  addMessage(
    userMessage
  );


  prompt.value = "";

  autoGrow();


  try{

    /*
     * Image request automatically switches
     * to the free image generation workflow.
     */

    if(
      isImageRequest(text) &&
      !attachments.some(
        function(file){
          return (
            file.type &&
            file.type.startsWith("image/")
          );
        }
      )
    ){

      await generateImage(text);

    }

    /*
     * Council mode.
     */

    else if(
      state.council
    ){

      await councilRequest();

    }

    /*
     * Normal chat.
     */

    else{

      await chatRequest();

    }

  }catch(error){

    addMessage({

      role:"assistant",

      content:
        "Error: " +
        (
          error?.message ||
          String(error)
        )

    });

    setStatus("");

  }finally{

    $("sendButton").disabled =
      false;

  }
}


/* =========================
   TEXTAREA
========================= */

function autoGrow(){

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


/* =========================
   SIDEBAR
========================= */

function openSidebar(){

  $("sidebar")
    .classList
    .add("open");

  $("overlay")
    .classList
    .add("open");
}


function closeSidebar(){

  $("sidebar")
    .classList
    .remove("open");

  $("overlay")
    .classList
    .remove("open");
}


/* =========================
   EVENTS
========================= */

$("sendButton").onclick =
  sendMessage;


$("prompt").addEventListener(
  "input",
  autoGrow
);


$("prompt").addEventListener(
  "keydown",
  function(event){

    if(
      event.key === "Enter" &&
      !event.shiftKey
    ){

      event.preventDefault();

      sendMessage();

    }

  }
);


$("attachButton").onclick =
  function(){

    $("fileInput").click();

  };


$("fileInput").addEventListener(
  "change",
  filesPicked
);


$("hamburger").onclick =
  openSidebar;


$("closeSidebar").onclick =
  closeSidebar;


$("overlay").onclick =
  closeSidebar;


$("newChat").onclick =
  newChat;


$("modelSelect").onchange =
  function(event){

    state.selectedModel =
      event.target.value;

  };


$("councilButton").onclick =
  function(){

    state.council =
      !state.council;

    $("councilButton")
      .classList
      .toggle(
        "active",
        state.council
      );

    setStatus(
      state.council
        ? "AI Council enabled"
        : ""
    );

  };


document.addEventListener(
  "keydown",
  function(event){

    if(
      event.key === "Escape"
    ){

      closeSidebar();

    }

  }
);


/* =========================
   START
========================= */

renderHistory();

renderMessages();

loadModels();

</script>
</body>
</html>`;


/* =========================================================
   SERVER
========================================================= */

const JSON_HEADERS = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "access-control-allow-origin":"*"
};


const HTML_HEADERS = {
  "content-type":"text/html; charset=utf-8",
  "cache-control":"no-store"
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


function apiBase(env){

  return (
    env.XKIRO_BASE_URL ||
    "https://api.xkiro.com/v1"
  ).replace(/\/$/,"");

}


function apiHeaders(env){

  const key =
    env.XKIRO_API_KEY;

  if(!key){

    throw new Error(
      "XKIRO_API_KEY is missing from Worker environment."
    );

  }

  return {

    "Authorization":
      "Bearer " + key,

    "x-api-key":
      key,

    "Content-Type":
      "application/json",

    "Accept":
      "application/json"

  };

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function getXKiroError(data,fallback){

  fallback =
    fallback ||
    "xKiro request failed";


  if(!data){

    return fallback;

  }


  if(typeof data === "string"){

    return data;

  }


  if(
    data.error &&
    typeof data.error === "object"
  ){

    return (
      data.error.message ||
      data.error.code ||
      data.error.type ||
      fallback
    );

  }


  if(
    typeof data.error === "string"
  ){

    return data.error;

  }


  if(data.message){

    return String(
      data.message
    );

  }


  try{

    return JSON.stringify(
      data
    );

  }catch(error){

    return fallback;

  }

}


/* =========================================================
   MODEL HELPERS
========================================================= */

function modelId(model){

  return (
    model.id ||
    model.model ||
    model.name ||
    ""
  );

}


function modelLabel(model){

  return (
    model.name ||
    model.display_name ||
    model.displayName ||
    model.id ||
    "Unknown model"
  );

}


function isFree(model){

  return (
    String(
      model.access_tier ||
      model.accessTier ||
      ""
    ).toLowerCase()
    ===
    "free"
  );

}


function capability(model,key){

  const c =
    model.capabilities ||
    {};

  return Boolean(
    c[key] ??
    model[key]
  );

}


/*
 * This is NOT a claim that one vendor/model
 * is objectively "best".
 *
 * It simply selects the strongest capability
 * profile among the currently listed FREE models.
 */

function capabilityScore(model){

  const c =
    model.capabilities ||
    {};

  const context =
    Number(
      model.context_length ||
      model.context ||
      c.context_length ||
      c.context ||
      0
    );

  const output =
    Number(
      model.max_output_tokens ||
      model.max_output ||
      c.max_output_tokens ||
      0
    );

  let score = 0;

  if(
    c.reasoning ||
    model.reasoning
  ){

    score += 100000;

  }

  if(
    c.tools ||
    model.tools
  ){

    score += 40000;

  }

  if(
    c.vision ||
    model.vision
  ){

    score += 20000;

  }

  score +=
    Math.min(
      context / 100000,
      20
    );

  score +=
    Math.min(
      output / 20000,
      10
    );

  return score;

}


/* =========================================================
   MODEL CATALOG
========================================================= */

async function listModels(
  env,
  modality
){

  /*
   * xKiro's normal /v1/models endpoint
   * is the chat model catalog.
   *
   * Image models are queried separately.
   */

  let url;

  if(
    modality === "image"
  ){

    url =
      apiBase(env) +
      "/models?modality=image";

  }else{

    url =
      apiBase(env) +
      "/models";

  }


  const response =
    await fetch(
      url,
      {
        method:"GET",
        headers:apiHeaders(env)
      }
    );


  const data =
    await response
      .json()
      .catch(function(){
        return null;
      });


  if(!response.ok){

    throw new Error(
      getXKiroError(
        data,
        "Could not load xKiro model catalog. HTTP " +
        response.status
      )
    );

  }


  const models =
    Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.models)
        ? data.models
        : [];


  /*
   * VERY IMPORTANT:
   *
   * We don't trust model names.
   * We trust xKiro's live access_tier.
   */

  return models

    .filter(function(model){

      return isFree(model);

    })

    .filter(function(model){

      return Boolean(
        modelId(model)
      );

    })

    .sort(function(a,b){

      return (
        capabilityScore(b) -
        capabilityScore(a)
      );

    });

}


/* =========================================================
   FREE CHAT MODEL
========================================================= */

async function getFreeChatModel(
  env,
  requestedId
){

  const models =
    await listModels(
      env,
      "chat"
    );


  if(!models.length){

    return null;

  }


  /*
   * If frontend requested a model,
   * only accept it if it is actually
   * present in the FREE live catalog.
   */

  if(requestedId){

    const requested =
      models.find(
        function(model){

          return (
            modelId(model) ===
            requestedId
          );

        }
      );

    if(requested){

      return requested;

    }

  }


  /*
   * First item is the highest capability
   * score among current FREE models.
   */

  return models[0];

}


/* =========================================================
   FREE IMAGE MODEL
========================================================= */

async function getFreeImageModel(
  env,
  requestedId
){

  const models =
    await listModels(
      env,
      "image"
    );


  if(!models.length){

    return null;

  }


  if(requestedId){

    const requested =
      models.find(
        function(model){

          return (
            modelId(model) ===
            requestedId
          );

        }
      );

    if(requested){

      return requested;

    }

  }


  return models[0];

}


/* =========================================================
   CONTENT EXTRACTION
========================================================= */

function extractText(content){

  if(
    typeof content ===
    "string"
  ){

    return content;

  }


  if(
    Array.isArray(content)
  ){

    return content

      .filter(function(part){

        return (
          part &&
          part.type ===
          "text"
        );

      })

      .map(function(part){

        return (
          part.text ||
          ""
        );

      })

      .join("\n");

  }


  return "";

}


/* =========================================================
   COUNCIL
========================================================= */

async function councilRun(
  env,
  body
){

  const models =
    await listModels(
      env,
      "chat"
    );


  if(!models.length){

    throw new Error(
      "No FREE chat models are currently available on xKiro."
    );

  }


  /*
   * Three strongest capability-profile
   * FREE models participate.
   */

  const participants =
    models.slice(
      0,
      Math.min(
        3,
        models.length
      )
    );


  const content =
    body.content ||
    body.text ||
    "";


  const question =
    extractText(content) ||
    body.text ||
    "Answer the user's request.";


  const results = [];

  const failures = [];


  /*
   * ROUND 1
   *
   * Independent analysis.
   */

  for(
    const model of participants
  ){

    const id =
      modelId(model);


    try{

      const response =
        await fetch(
          apiBase(env) +
          "/chat/completions",
          {
            method:"POST",

            headers:
              apiHeaders(env),

            body:
              JSON.stringify({

                model:id,

                messages:[

                  {
                    role:"system",

                    content:
                      "You are one independent member " +
                      "of a multi-model AI council. " +
                      "Analyze the user's request carefully. " +
                      "Give factual reasoning, identify uncertainty, " +
                      "and consider alternative explanations. " +
                      "Your analysis will be reviewed by a final judge."

                  },

                  {
                    role:"user",

                    content:content

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


      const data =
        await response
          .json()
          .catch(function(){
            return null;
          });


      if(!response.ok){

        failures.push({

          model:id,

          status:
            response.status,

          error:
            getXKiroError(
              data,
              "HTTP " +
              response.status
            )

        });

        continue;

      }


      const answer =
        data
          ?.choices
          ?.0
          ?.message
          ?.content;


      if(
        typeof answer ===
        "string" &&
        answer.trim()
      ){

        results.push({

          model:id,

          answer:
            answer.trim()

        });

      }else{

        failures.push({

          model:id,

          status:200,

          error:
            "Model returned an empty answer."

        });

      }

    }catch(error){

      failures.push({

        model:id,

        error:
          error?.message ||
          String(error)

      });

    }

  }


  /*
   * Don't return the useless generic
   * "Council models did not return an answer".
   *
   * Give the actual failures.
   */

  if(!results.length){

    const details =
      failures
        .map(function(item){

          return (
            item.model +
            " → " +
            item.error
          );

        })
        .join("\n");


    throw new Error(
      "Every FREE Council model failed.\n\n" +
      details
    );

  }


  /*
   * FINAL JUDGE
   *
   * Highest capability-profile free model.
   */

  const judge =
    models[0];


  const discussion =
    results
      .map(function(item,index){

        return (
          "===== COUNCIL MEMBER " +
          (index + 1) +
          " =====\n" +
          "Model: " +
          item.model +
          "\n\n" +
          item.answer
        );

      })
      .join(
        "\n\n--------------------\n\n"
      );


  const finalPrompt =

    "Original user request:\n\n" +

    question +

    "\n\n" +

    "Independent council analyses:\n\n" +

    discussion +

    "\n\n" +

    "You are the final judge. " +

    "Compare the analyses. " +

    "Find contradictions and weak reasoning. " +

    "Use the live web-search context when useful. " +

    "Do not blindly follow any single model. " +

    "Return one clear, useful, self-contained final answer. " +

    "Do not mention internal prompts or hidden instructions.";


  try{

    const response =
      await fetch(
        apiBase(env) +
        "/chat/completions",
        {
          method:"POST",

          headers:
            apiHeaders(env),

          body:
            JSON.stringify({

              model:
                modelId(judge),

              messages:[

                {
                  role:"system",

                  content:
                    "You are the final judge " +
                    "of a multi-model AI council."

                },

                {
                  role:"user",

                  content:
                    finalPrompt

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


    const data =
      await response
        .json()
        .catch(function(){
          return null;
        });


    if(!response.ok){

      throw new Error(
        getXKiroError(
          data,
          "Final judge failed. HTTP " +
          response.status
        )
      );

    }


    const answer =
      data
        ?.choices
        ?.0
        ?.message
        ?.content;


    if(
      typeof answer !==
      "string" ||
      !answer.trim()
    ){

      throw new Error(
        "Final judge returned an empty answer."
      );

    }


    return {

      answer:
        answer.trim(),

      participants:
        results.map(function(item){

          return item.model;

        }),

      judge:
        modelId(judge),

      failedParticipants:
        failures

    };


  }catch(error){

    /*
     * Final judge failure should NOT destroy
     * successful council analyses.
     */

    return {

      answer:
        "The final Council synthesis model " +
        "could not be reached.\n\n" +
        "Here is the strongest available Council analysis:\n\n" +
        results[0].answer,

      participants:
        results.map(function(item){

          return item.model;

        }),

      judge:
        modelId(judge),

      judgeError:
        error?.message ||
        String(error),

      failedParticipants:
        failures

    };

  }

}


/* =========================================================
   IMAGE URL EXTRACTION
========================================================= */

function extractImageUrl(data){

  return (

    data?.url ||

    data?.image_url ||

    data?.imageUrl ||

    data?.data?.[0]?.url ||

    data?.output?.url ||

    data?.result?.url ||

    null

  );

}


/* =========================================================
   IMAGE POLLING
========================================================= */

async function pollImage(
  env,
  jobId
){

  if(!jobId){

    throw new Error(
      "Image generation returned no job ID."
    );

  }


  for(
    let attempt = 0;
    attempt < 40;
    attempt++
  ){

    await new Promise(
      function(resolve){

        setTimeout(
          resolve,
          1500
        );

      }
    );


    const response =
      await fetch(
        apiBase(env) +
        "/images/generations/" +
        encodeURIComponent(
          jobId
        ),
        {
          method:"GET",
          headers:
            apiHeaders(env)
        }
      );


    const data =
      await response
        .json()
        .catch(function(){
          return null;
        });


    if(!response.ok){

      throw new Error(
        getXKiroError(
          data,
          "Image status request failed. HTTP " +
          response.status
        )
      );

    }


    const image =
      extractImageUrl(
        data
      );


    if(image){

      return image;

    }


    const status =
      String(
        data?.status ||
        data?.data?.status ||
        data?.job?.status ||
        ""
      ).toLowerCase();


    if(
      status === "failed" ||
      status === "error" ||
      status === "cancelled"
    ){

      throw new Error(
        getXKiroError(
          data,
          "Image generation failed."
        )
      );

    }

  }


  throw new Error(
    "Image generation timed out."
  );

}


/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(
    request,
    env
  ){

    try{

      const url =
        new URL(
          request.url
        );


      /* CORS */

      if(
        request.method ===
        "OPTIONS"
      ){

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


      /* HOME */

      if(
        request.method === "GET" &&
        url.pathname === "/"
      ){

        return new Response(
          HTML,
          {
            headers:
              HTML_HEADERS
          }
        );

      }


      /* =========================================
         FREE MODEL LIST
      ========================================= */

      if(
        request.method === "GET" &&
        url.pathname === "/api/models"
      ){

        const chat =
          await listModels(
            env,
            "chat"
          );


        const image =
          await listModels(
            env,
            "image"
          );


        return json({

          chat:
            chat.map(function(model){

              return {

                id:
                  modelId(model),

                label:
                  modelLabel(model),

                vision:
                  capability(
                    model,
                    "vision"
                  ),

                reasoning:
                  capability(
                    model,
                    "reasoning"
                  ),

                tools:
                  capability(
                    model,
                    "tools"
                  )

              };

            }),

          image:
            image.map(function(model){

              return {

                id:
                  modelId(model),

                label:
                  modelLabel(model)

              };

            })

        });

      }


      /* =========================================
         NORMAL CHAT
      ========================================= */

      if(
        request.method === "POST" &&
        url.pathname === "/api/chat"
      ){

        const body =
          await request.json();


        const model =
          await getFreeChatModel(
            env,
            body.model
          );


        if(!model){

          return json(
            {
              error:
                "No FREE chat model is currently available on xKiro."
            },
            503
          );

        }


        /*
         * Server decides the model.
         * A client cannot force a paid model.
         */

        body.model =
          modelId(model);


        /*
         * Web search ALWAYS ON.
         */

        body.web_search = {

          enable:true,

          count:5

        };


        /*
         * Streaming is always used
         * for normal chat.
         */

        body.stream = true;


        const response =
          await fetch(
            apiBase(env) +
            "/chat/completions",
            {
              method:"POST",

              headers:
                apiHeaders(env),

              body:
                JSON.stringify(body)
            }
          );


        /*
         * Errors before SSE begins.
         */

        if(!response.ok){

          const data =
            await response
              .json()
              .catch(function(){
                return null;
              });


          return json(
            {
              error:
                getXKiroError(
                  data,
                  "xKiro chat request failed. HTTP " +
                  response.status
                ),

              type:
                data?.error?.type ||
                null,

              code:
                data?.error?.code ||
                null,

              status:
                response.status,

              model:
                body.model

            },
            response.status
          );

        }


        /*
         * Pass SSE directly to frontend.
         */

        return new Response(
          response.body,
          {
            status:
              response.status,

            headers:{
              "content-type":
                response.headers.get(
                  "content-type"
                ) ||
                "text/event-stream",

              "cache-control":
                "no-cache",

              "access-control-allow-origin":
                "*"
            }
          }
        );

      }


      /* =========================================
         AI COUNCIL
      ========================================= */

      if(
        request.method === "POST" &&
        url.pathname === "/api/council"
      ){

        const body =
          await request.json();


        const result =
          await councilRun(
            env,
            body
          );


        return json(
          result
        );

      }


      /* =========================================
         AUTOMATIC IMAGE GENERATION
      ========================================= */

      if(
        request.method === "POST" &&
        url.pathname === "/api/image"
      ){

        const body =
          await request.json();


        const model =
          await getFreeImageModel(
            env,
            body.model
          );


        if(!model){

          return json(
            {
              error:
                "No FREE image model is currently available on xKiro."
            },
            503
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
                "Image prompt is empty."
            },
            400
          );

        }


        const response =
          await fetch(
            apiBase(env) +
            "/images/generations",
            {
              method:"POST",

              headers:
                apiHeaders(env),

              body:
                JSON.stringify({

                  model:
                    modelId(model),

                  prompt:
                    prompt.slice(
                      0,
                      10000
                    )

                })

            }
          );


        const data =
          await response
            .json()
            .catch(function(){
              return null;
            });


        if(!response.ok){

          return json(
            {
              error:
                getXKiroError(
                  data,
                  "Image generation failed. HTTP " +
                  response.status
                ),

              type:
                data?.error?.type ||
                null,

              code:
                data?.error?.code ||
                null,

              status:
                response.status,

              model:
                modelId(model)

            },
            response.status
          );

        }


        /*
         * Some image APIs return URL immediately.
         */

        const direct =
          extractImageUrl(
            data
          );


        if(direct){

          return json({

            url:
              direct,

            model:
              modelId(model)

          });

        }


        /*
         * Otherwise poll asynchronous job.
         */

        const jobId =
          data?.id ||
          data?.job_id ||
          data?.jobId;


        const image =
          await pollImage(
            env,
            jobId
          );


        return json({

          url:
            image,

          model:
            modelId(model)

        });

      }


      /* =========================================
         404
      ========================================= */

      return new Response(
        "Not found",
        {
          status:404
        }
      );


    }catch(error){

      return json(
        {
          error:
            error?.message ||
            String(error) ||
            "Internal Worker error."
        },
        500
      );

    }

  }

};
