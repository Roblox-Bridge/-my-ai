const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b0d">
<title>Aether AI</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b0b0d;color:#f4f4f5}
body{overflow:hidden}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
.app{display:flex;width:100%;height:100vh;background:#0b0b0d}
.sidebar{
width:270px;flex:none;background:#111113;border-right:1px solid #242428;
display:flex;flex-direction:column;height:100%;z-index:20
}
.side-top{padding:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;margin-bottom:16px}
.brand-icon{
width:34px;height:34px;border-radius:10px;background:#f4f4f5;color:#111;
display:flex;align-items:center;justify-content:center;font-weight:800
}
.new-chat{
width:100%;border:1px solid #303036;background:#19191d;color:#fff;
padding:11px 13px;border-radius:10px;text-align:left
}
.new-chat:hover{background:#222228}
.history{flex:1;overflow:auto;padding:8px}
.history-title{font-size:12px;color:#85858d;padding:8px 10px}
.history-item{
padding:10px;border-radius:9px;color:#d8d8dc;font-size:13px;
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px
}
.history-item:hover{background:#1d1d21}
.side-bottom{padding:12px;border-top:1px solid #242428;color:#85858d;font-size:12px}
.main{flex:1;min-width:0;height:100%;display:flex;flex-direction:column}
.topbar{
height:60px;flex:none;border-bottom:1px solid #242428;
display:flex;align-items:center;gap:10px;padding:0 16px;background:#0e0e10
}
.menu-btn{display:none}
.model-wrap{display:flex;align-items:center;gap:8px;min-width:0}
.model-select{
max-width:350px;background:#17171a;border:1px solid #303036;
color:#eee;padding:8px 10px;border-radius:9px;outline:none
}
.status{font-size:12px;color:#777780;white-space:nowrap}
.top-actions{margin-left:auto;display:flex;gap:8px}
.council-btn{
border:1px solid #39393f;background:#18181c;color:#eee;
padding:8px 12px;border-radius:9px
}
.council-btn.active{background:#292932;border-color:#676773}
.chat{
flex:1;overflow:auto;scroll-behavior:smooth
}
.empty{
height:100%;display:flex;align-items:center;justify-content:center;
padding:30px;text-align:center
}
.empty-inner{max-width:700px}
.empty h1{font-size:34px;margin:0 0 10px}
.empty p{color:#85858d;margin:0}
.messages{max-width:900px;margin:0 auto;padding:30px 20px 170px}
.msg{display:flex;gap:14px;margin:24px 0}
.avatar{
width:34px;height:34px;flex:none;border-radius:10px;
display:flex;align-items:center;justify-content:center;
font-size:13px;font-weight:700
}
.msg.user .avatar{background:#34343a}
.msg.assistant .avatar{background:#f4f4f5;color:#111}
.msg-body{min-width:0;flex:1;line-height:1.65;font-size:15px}
.msg.user .msg-body{white-space:pre-wrap}
.msg-body p{margin:0 0 12px}
.msg-body p:last-child{margin-bottom:0}
.msg-body pre{
background:#111114;border:1px solid #29292e;border-radius:10px;
padding:14px;overflow:auto
}
.msg-body code{
background:#1b1b1f;border-radius:5px;padding:2px 5px;font-size:.92em
}
.msg-body pre code{background:none;padding:0}
.msg-body ul,.msg-body ol{padding-left:25px}
.msg-body blockquote{
border-left:3px solid #555;padding-left:14px;color:#b7b7bd
}
.attachments{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.attachment{
border:1px solid #303036;background:#17171a;border-radius:9px;
padding:7px 9px;font-size:12px;color:#bdbdc3
}
.image-result{
margin-top:12px;border-radius:14px;overflow:hidden;
border:1px solid #2c2c31;max-width:760px
}
.image-result img{display:block;width:100%;height:auto}
.image-link{display:block;padding:10px;background:#151519;color:#ddd;text-decoration:none;font-size:12px}
.composer-wrap{
position:fixed;left:270px;right:0;bottom:0;padding:14px 18px 18px;
background:linear-gradient(transparent,#0b0b0d 30%)
}
.composer{
max-width:900px;margin:auto;background:#17171a;
border:1px solid #303036;border-radius:16px;padding:10px
}
.input-row{display:flex;align-items:flex-end;gap:8px}
textarea{
flex:1;resize:none;background:transparent;border:0;outline:none;color:#fff;
min-height:46px;max-height:180px;padding:10px;font-size:15px
}
.icon-btn,.send-btn{
width:40px;height:40px;border-radius:10px;border:1px solid #303036;
background:#202025;color:#ddd;display:flex;align-items:center;justify-content:center
}
.send-btn{background:#f4f4f5;color:#111;border-color:#f4f4f5}
.send-btn:disabled{opacity:.4;cursor:not-allowed}
.file-input{display:none}
.attach-preview{display:flex;gap:7px;flex-wrap:wrap;padding:4px 8px 8px}
.preview{
background:#202024;border:1px solid #303036;border-radius:8px;
padding:6px 8px;font-size:12px;color:#bbb
}
.note{font-size:11px;color:#68686f;text-align:center;margin-top:7px}
.typing{color:#8b8b93}
.error{color:#ff8c8c}
.council-panel{
margin:15px 0;padding:14px;border:1px solid #303036;
border-radius:12px;background:#141417
}
.council-head{font-weight:700;margin-bottom:10px}
.council-model{
padding:8px 0;border-bottom:1px solid #252529;font-size:13px
}
.council-model:last-child{border-bottom:0}
.drawer-overlay{
display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:30
}
@media(max-width:760px){
.sidebar{
position:fixed;left:-285px;top:0;bottom:0;transition:left .2s ease;
box-shadow:10px 0 30px rgba(0,0,0,.3)
}
.sidebar.open{left:0}
.drawer-overlay.open{display:block}
.menu-btn{
display:flex;width:38px;height:38px;border:0;background:transparent;
color:#ddd;align-items:center;justify-content:center;font-size:22px
}
.topbar{padding:0 10px}
.model-select{max-width:170px}
.status{display:none}
.council-btn{padding:8px 9px;font-size:12px}
.composer-wrap{left:0;padding:9px 8px 10px}
.messages{padding:20px 12px 155px}
.empty h1{font-size:28px}
.msg{gap:9px}
.avatar{width:30px;height:30px;border-radius:8px}
.msg-body{font-size:14px}
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
    <div class="history" id="history">
      <div class="history-title">Recent chats</div>
    </div>
    <div class="side-bottom">
      Free xKiro models · Live catalog
    </div>
  </aside>

  <div class="drawer-overlay" id="overlay"></div>

  <main class="main">
    <header class="topbar">
      <button class="menu-btn" id="menuBtn">☰</button>

      <div class="model-wrap">
        <select class="model-select" id="modelSelect">
          <option>Loading models...</option>
        </select>
        <span class="status" id="status">Connecting...</span>
      </div>

      <div class="top-actions">
        <button class="council-btn" id="councilBtn">AI Council</button>
      </div>
    </header>

    <section class="chat" id="chat">
      <div class="empty" id="empty">
        <div class="empty-inner">
          <h1>How can I help?</h1>
          <p>Ask anything. Web research is automatically enabled.</p>
        </div>
      </div>
      <div class="messages" id="messages"></div>
    </section>

    <div class="composer-wrap">
      <div class="composer">
        <div class="attach-preview" id="attachPreview"></div>

        <div class="input-row">
          <input class="file-input" id="fileInput" type="file"
            multiple
            accept="image/*,.txt,.md,.json,.js,.jsx,.ts,.tsx,.html,.css,.py,.java,.c,.cpp,.h,.hpp,.rs,.go,.php,.rb,.swift,.kt,.xml,.yaml,.yml,.csv">

          <button class="icon-btn" id="fileBtn" title="Attach files">＋</button>

          <textarea id="prompt"
            rows="1"
            placeholder="Message Aether AI..."></textarea>

          <button class="send-btn" id="sendBtn" title="Send">↑</button>
        </div>

        <div class="note">
          Web search is automatic. Image requests automatically use an available free image model.
        </div>
      </div>
    </div>
  </main>
</div>

<script>
(function(){
  "use strict";

  var state = {
    models: [],
    imageModels: [],
    selectedModel: "",
    messages: [],
    attachments: [],
    council: false,
    busy: false,
    chatId: null
  };

  var el = {
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("overlay"),
    menuBtn: document.getElementById("menuBtn"),
    newChat: document.getElementById("newChat"),
    history: document.getElementById("history"),
    modelSelect: document.getElementById("modelSelect"),
    status: document.getElementById("status"),
    councilBtn: document.getElementById("councilBtn"),
    chat: document.getElementById("chat"),
    empty: document.getElementById("empty"),
    messages: document.getElementById("messages"),
    prompt: document.getElementById("prompt"),
    sendBtn: document.getElementById("sendBtn"),
    fileBtn: document.getElementById("fileBtn"),
    fileInput: document.getElementById("fileInput"),
    attachPreview: document.getElementById("attachPreview")
  };

  function escapeHtml(value){
    return String(value == null ? "" : value)
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

  function errorText(data,status){
    if(!data) return "Request failed (" + status + ")";

    if(typeof data === "string"){
      return data;
    }

    if(data.error){
      if(typeof data.error === "string") return data.error;
      if(data.error.message) return data.error.message;
      if(data.error.code) return String(data.error.code);
    }

    if(data.message) return data.message;

    try{
      return JSON.stringify(data);
    }catch(e){
      return "Request failed (" + status + ")";
    }
  }

  async function apiJson(url,options){
    var response;

    try{
      response = await fetch(url,options || {});
    }catch(err){
      throw new Error("Network error: " + err.message);
    }

    var text = await response.text();
    var data;

    try{
      data = text ? JSON.parse(text) : {};
    }catch(e){
      if(!response.ok){
        throw new Error(text || ("Request failed (" + response.status + ")"));
      }
      return {};
    }

    if(!response.ok){
      throw new Error(errorText(data,response.status));
    }

    return data;
  }

  function capabilityScore(model){
    var score = 0;

    if(model.reasoning) score += 40;
    if(model.vision) score += 20;
    if(model.tools) score += 10;

    var context = Number(
      model.context_window ||
      model.context_length ||
      model.max_context ||
      0
    );

    var output = Number(
      model.max_output_tokens ||
      model.max_tokens ||
      0
    );

    score += Math.min(context / 10000,30);
    score += Math.min(output / 5000,20);

    var id = String(model.id || "").toLowerCase();

    if(id.indexOf("reason") >= 0) score += 5;
    if(id.indexOf("thinking") >= 0) score += 5;
    if(id.indexOf("pro") >= 0) score += 2;

    return score;
  }

  function modelLabel(model){
    var id = String(model.id || "");
    return id || "Unknown model";
  }

  async function loadModels(){
    el.status.textContent = "Loading free models...";

    try{
      var chatData = await apiJson("/api/models");
      state.models = Array.isArray(chatData.models) ? chatData.models : [];
      state.imageModels = Array.isArray(chatData.imageModels)
        ? chatData.imageModels
        : [];

      if(!state.models.length){
        throw new Error("No free chat models are currently available.");
      }

      state.models.sort(function(a,b){
        return capabilityScore(b) - capabilityScore(a);
      });

      state.selectedModel = state.models[0].id;

      el.modelSelect.innerHTML = "";

      state.models.forEach(function(model){
        var option = document.createElement("option");
        option.value = model.id;
        option.textContent = modelLabel(model);
        el.modelSelect.appendChild(option);
      });

      el.modelSelect.value = state.selectedModel;
      el.status.textContent =
        state.models.length + " free model" +
        (state.models.length === 1 ? "" : "s");

    }catch(err){
      el.status.textContent = "Model loading failed";
      el.modelSelect.innerHTML = "<option>No free models</option>";
      showSystemError(err.message);
    }
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
    var value = String(text == null ? "" : text);

    value = escapeHtml(value);

    /*
      We intentionally avoid literal backtick characters here.
      This prevents the outer Worker HTML template from breaking.
    */

    var codeFence = String.fromCharCode(96) +
      String.fromCharCode(96) +
      String.fromCharCode(96);

    var parts = value.split(codeFence);

    if(parts.length > 1){
      var rebuilt = "";

      for(var i=0;i<parts.length;i++){
        if(i % 2 === 1){
          rebuilt += "<pre><code>" + parts[i].trim() + "</code></pre>";
        }else{
          rebuilt += parts[i];
        }
      }

      value = rebuilt;
    }

    value = value.replace(
      /\\*\\*(.+?)\\*\\*/g,
      "<strong>$1</strong>"
    );

    value = value.replace(
      /\\*([^*]+)\\*/g,
      "<em>$1</em>"
    );

    value = value.replace(
      /^### (.+)$/gm,
      "<h3>$1</h3>"
    );

    value = value.replace(
      /^## (.+)$/gm,
      "<h2>$1</h2>"
    );

    value = value.replace(
      /^# (.+)$/gm,
      "<h1>$1</h1>"
    );

    value = value.replace(
      /^> (.+)$/gm,
      "<blockquote>$1</blockquote>"
    );

    value = value.replace(
      /^[-*] (.+)$/gm,
      "<li>$1</li>"
    );

    value = value.replace(
      /(<li>.*<\\/li>)/gs,
      "<ul>$1</ul>"
    );

    value = value.replace(
      /\$begin:math:display$\(\[\^\\$end:math:display$]+)\\]\$begin:math:text$\(https\?\:\\\\\/\\\\\/\[\^\\\\s\)\]\+\)\\$end:math:text$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    value = value.replace(
      /\\n{2,}/g,
      "</p><p>"
    );

    value = "<p>" + value + "</p>";

    value = value.replace(
      /<p>(<h[1-3]>)/g,
      "$1"
    );

    value = value.replace(
      /(<\\/h[1-3]>)<\\/p>/g,
      "$1"
    );

    value = value.replace(
      /<p>(<pre>)/g,
      "$1"
    );

    value = value.replace(
      /(<\\/pre>)<\\/p>/g,
      "$1"
    );

    value = value.replace(
      /<p>(<ul>)/g,
      "$1"
    );

    value = value.replace(
      /(<\\/ul>)<\\/p>/g,
      "$1"
    );

    value = value.replace(
      /<p>(<blockquote>)/g,
      "$1"
    );

    value = value.replace(
      /(<\\/blockquote>)<\\/p>/g,
      "$1"
    );

    return value;
  }

  function addMessage(role,text,attachments){
    var message = {
      role: role,
      content: text,
      attachments: attachments || []
    };

    state.messages.push(message);
    renderMessages();
    saveCurrentChat();

    return message;
  }

  function renderMessages(){
    el.empty.style.display = state.messages.length ? "none" : "flex";

    el.messages.innerHTML = "";

    state.messages.forEach(function(message,index){
      var row = document.createElement("div");
      row.className = "msg " + message.role;

      var avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = message.role === "user" ? "You" : "AI";

      var body = document.createElement("div");
      body.className = "msg-body";

      if(message.role === "user"){
        body.innerHTML = "<div>" + escapeHtml(message.content || "") + "</div>";
      }else{
        body.innerHTML = markdownToHtml(message.content || "");
      }

      if(message.attachments && message.attachments.length){
        var attachments = document.createElement("div");
        attachments.className = "attachments";

        message.attachments.forEach(function(file){
          var item = document.createElement("div");
          item.className = "attachment";
          item.textContent = file.name || "Attachment";
          attachments.appendChild(item);
        });

        body.appendChild(attachments);
      }

      row.appendChild(avatar);
      row.appendChild(body);
      el.messages.appendChild(row);
    });

    requestAnimationFrame(function(){
      el.chat.scrollTop = el.chat.scrollHeight;
    });
  }

  function showSystemError(message){
    var row = document.createElement("div");
    row.className = "msg assistant";

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";

    var body = document.createElement("div");
    body.className = "msg-body error";
    body.textContent = message;

    row.appendChild(avatar);
    row.appendChild(body);
    el.messages.appendChild(row);

    el.empty.style.display = "none";

    requestAnimationFrame(function(){
      el.chat.scrollTop = el.chat.scrollHeight;
    });
  }

  function showAssistantPlaceholder(){
    var row = document.createElement("div");
    row.className = "msg assistant";
    row.id = "streamingMessage";

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";

    var body = document.createElement("div");
    body.className = "msg-body typing";
    body.innerHTML = "Thinking...";

    row.appendChild(avatar);
    row.appendChild(body);
    el.messages.appendChild(row);

    el.empty.style.display = "none";

    requestAnimationFrame(function(){
      el.chat.scrollTop = el.chat.scrollHeight;
    });

    return body;
  }

  function removeStreamingMessage(){
    var old = document.getElementById("streamingMessage");
    if(old) old.remove();
  }

  function setBusy(value){
    state.busy = value;
    el.sendBtn.disabled = value;
    el.councilBtn.disabled = value;
    el.fileBtn.disabled = value;
    el.prompt.disabled = value;

    if(value){
      el.status.textContent = "Working...";
    }else{
      el.status.textContent =
        state.models.length + " free model" +
        (state.models.length === 1 ? "" : "s");
    }
  }

  function parseSSEBlock(block){
    var lines = block.split("\\n");
    var dataLines = [];

    for(var i=0;i<lines.length;i++){
      var line = lines[i];

      if(line.indexOf("data:") === 0){
        dataLines.push(line.slice(5).trim());
      }
    }

    if(!dataLines.length) return null;

    var raw = dataLines.join("\\n");

    if(raw === "[DONE]"){
      return {done:true};
    }

    try{
      return JSON.parse(raw);
    }catch(e){
      return null;
    }
  }

  async function streamChat(payload,onText){
    var response;

    try{
      response = await fetch("/api/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(payload)
      });
    }catch(err){
      throw new Error("Network error: " + err.message);
    }

    if(!response.ok){
      var errorBody = await response.text();
      var errorData;

      try{
        errorData = JSON.parse(errorBody);
      }catch(e){
        errorData = errorBody;
      }

      throw new Error(errorText(errorData,response.status));
    }

    if(!response.body){
      throw new Error("Streaming is not supported by this response.");
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";
    var finalText = "";

    while(true){
      var result = await reader.read();

      if(result.done) break;

      buffer += decoder.decode(result.value,{stream:true});

      var blocks = buffer.split("\\n\\n");
      buffer = blocks.pop();

      for(var i=0;i<blocks.length;i++){
        var event = parseSSEBlock(blocks[i]);

        if(!event) continue;

        if(event.error){
          throw new Error(
            event.error.message ||
            event.error.code ||
            "Upstream model error"
          );
        }

        if(event.done){
          continue;
        }

        var choices = event.choices || [];

        if(!choices.length) continue;

        var delta = choices[0].delta || {};
        var piece = delta.content || "";

        if(piece){
          finalText += piece;
          onText(finalText);
        }
      }
    }

    return finalText;
  }

  function buildUserContent(text){
    if(!state.attachments.length){
      return text;
    }

    var parts = [
      {
        type:"text",
        text:text
      }
    ];

    state.attachments.forEach(function(file){
      if(file.kind === "image"){
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
            "\\n\\n--- FILE: " +
            file.name +
            " ---\\n" +
            file.data +
            "\\n--- END FILE ---\\n"
        });
      }
    });

    return parts;
  }

  function isImageRequest(text){
    var t = String(text || "").toLowerCase();

    var patterns = [
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
      "logo of"
    ];

    for(var i=0;i<patterns.length;i++){
      if(t.indexOf(patterns[i]) >= 0){
        return true;
      }
    }

    return false;
  }

  async function generateImage(prompt){
    var response = await apiJson("/api/image",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        prompt:prompt
      })
    });

    return response;
  }

  function addImageMessage(result){
    var row = document.createElement("div");
    row.className = "msg assistant";

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";

    var body = document.createElement("div");
    body.className = "msg-body";

    var title = document.createElement("div");
    title.textContent = "Generated image";
    title.style.marginBottom = "10px";
    title.style.fontWeight = "700";

    body.appendChild(title);

    var imageBox = document.createElement("div");
    imageBox.className = "image-result";

    var img = document.createElement("img");
    img.src = result.url;
    img.alt = "Generated image";

    var link = document.createElement("a");
    link.className = "image-link";
    link.href = result.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open image";

    imageBox.appendChild(img);
    imageBox.appendChild(link);
    body.appendChild(imageBox);

    row.appendChild(avatar);
    row.appendChild(body);

    el.messages.appendChild(row);

    state.messages.push({
      role:"assistant",
      content:"Generated an image.",
      attachments:[]
    });

    saveCurrentChat();

    requestAnimationFrame(function(){
      el.chat.scrollTop = el.chat.scrollHeight;
    });
  }

  async function sendNormal(){
    var text = el.prompt.value.trim();

    if(!text && !state.attachments.length) return;
    if(state.busy) return;

    var attachmentsForHistory = state.attachments.map(function(file){
      return {
        name:file.name,
        kind:file.kind
      };
    });

    addMessage("user",text || "Please analyze the attached files.",attachmentsForHistory);

    var content = buildUserContent(
      text || "Please analyze the attached files."
    );

    el.prompt.value = "";
    autoResize();
    renderAttachments();

    var filesBeforeClear = state.attachments;
    state.attachments = [];

    setBusy(true);

    try{
      if(isImageRequest(text) && !filesBeforeClear.some(function(f){
        return f.kind === "image";
      })){
        var imageResult = await generateImage(text);

        addImageMessage(imageResult);
        return;
      }

      var body = showAssistantPlaceholder();

      var payloadMessages = state.messages
        .filter(function(m){
          return m.role === "user" || m.role === "assistant";
        })
        .slice(-20)
        .map(function(m,index,array){
          if(index === array.length - 1 && m.role === "user"){
            return {
              role:"user",
              content:content
            };
          }

          return {
            role:m.role,
            content:m.content
          };
        });

      var finalText = await streamChat({
        model:state.selectedModel,
        messages:payloadMessages
      },function(current){
        body.className = "msg-body";
        body.innerHTML = markdownToHtml(current);

        requestAnimationFrame(function(){
          el.chat.scrollTop = el.chat.scrollHeight;
        });
      });

      removeStreamingMessage();

      if(!finalText){
        throw new Error("The model returned an empty answer.");
      }

      addMessage("assistant",finalText,[]);

    }catch(err){
      removeStreamingMessage();
      showSystemError(err.message);
    }finally{
      setBusy(false);
    }
  }

  async function sendCouncil(){
    var text = el.prompt.value.trim();

    if(!text && !state.attachments.length) return;
    if(state.busy) return;

    var attachmentsForHistory = state.attachments.map(function(file){
      return {
        name:file.name,
        kind:file.kind
      };
    });

    addMessage(
      "user",
      text || "Please analyze the attached files.",
      attachmentsForHistory
    );

    var content = buildUserContent(
      text || "Please analyze the attached files."
    );

    el.prompt.value = "";
    autoResize();
    renderAttachments();

    state.attachments = [];

    setBusy(true);

    try{
      var panel = document.createElement("div");
      panel.className = "council-panel";
      panel.innerHTML =
        "<div class='council-head'>AI Council meeting</div>" +
        "<div id='councilStatus'>The council is analyzing...</div>";

      var row = document.createElement("div");
      row.className = "msg assistant";

      var avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = "AI";

      var body = document.createElement("div");
      body.className = "msg-body";
      body.appendChild(panel);

      row.appendChild(avatar);
      row.appendChild(body);
      el.messages.appendChild(row);

      requestAnimationFrame(function(){
        el.chat.scrollTop = el.chat.scrollHeight;
      });

      var result = await apiJson("/api/council",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          question:content,
          model:state.selectedModel
        })
      });

      panel.innerHTML =
        "<div class='council-head'>AI Council final answer</div>" +
        markdownToHtml(result.answer || "No final answer returned.");

      if(result.participants && result.participants.length){
        var info = document.createElement("div");
        info.style.marginTop = "15px";
        info.style.color = "#777780";
        info.style.fontSize = "11px";

        info.textContent =
          "Participants: " +
          result.participants.join(", ");

        panel.appendChild(info);
      }

      state.messages.push({
        role:"assistant",
        content:result.answer || "No final answer returned.",
        attachments:[]
      });

      saveCurrentChat();

    }catch(err){
      showSystemError(err.message);
    }finally{
      setBusy(false);
    }
  }

  async function send(){
    if(state.council){
      await sendCouncil();
    }else{
      await sendNormal();
    }
  }

  function autoResize(){
    el.prompt.style.height = "auto";
    el.prompt.style.height =
      Math.min(el.prompt.scrollHeight,180) + "px";
  }

  async function readFile(file){
    var maxTextSize = 1024 * 1024 * 2;

    if(file.type.indexOf("image/") === 0){
      return new Promise(function(resolve,reject){
        var reader = new FileReader();

        reader.onload = function(){
          resolve({
            name:file.name,
            kind:"image",
            data:reader.result
          });
        };

        reader.onerror = function(){
          reject(new Error("Could not read image: " + file.name));
        };

        reader.readAsDataURL(file);
      });
    }

    if(file.size > maxTextSize){
      throw new Error(
        file.name +
        " is too large. Text/code files must be 2 MB or smaller."
      );
    }

    return new Promise(function(resolve,reject){
      var reader = new FileReader();

      reader.onload = function(){
        resolve({
          name:file.name,
          kind:"text",
          data:String(reader.result || "")
        });
      };

      reader.onerror = function(){
        reject(new Error("Could not read file: " + file.name));
      };

      reader.readAsText(file);
    });
  }

  async function handleFiles(files){
    try{
      for(var i=0;i<files.length;i++){
        var parsed = await readFile(files[i]);
        state.attachments.push(parsed);
      }

      renderAttachments();

    }catch(err){
      showSystemError(err.message);
    }
  }

  function renderAttachments(){
    el.attachPreview.innerHTML = "";

    state.attachments.forEach(function(file,index){
      var item = document.createElement("div");
      item.className = "preview";

      var label = document.createElement("span");
      label.textContent =
        (file.kind === "image" ? "🖼 " : "📄 ") +
        file.name;

      var remove = document.createElement("button");
      remove.textContent = " ×";
      remove.style.background = "none";
      remove.style.border = "0";
      remove.style.color = "#999";
      remove.style.cursor = "pointer";

      remove.onclick = function(){
        state.attachments.splice(index,1);
        renderAttachments();
      };

      item.appendChild(label);
      item.appendChild(remove);
      el.attachPreview.appendChild(item);
    });
  }

  function newChat(){
    state.messages = [];
    state.attachments = [];
    state.chatId = null;
    el.messages.innerHTML = "";
    el.empty.style.display = "flex";
    renderAttachments();
    closeDrawer();
  }

  function chatTitle(){
    var first = state.messages.find(function(m){
      return m.role === "user";
    });

    if(!first) return "New chat";

    var title = String(first.content || "").replace(/\\s+/g," ").trim();

    if(title.length > 45){
      title = title.slice(0,45) + "...";
    }

    return title || "New chat";
  }

  function saveCurrentChat(){
    if(!state.messages.length) return;

    if(!state.chatId){
      state.chatId =
        Date.now().toString(36) +
        Math.random().toString(36).slice(2,8);
    }

    var chats;

    try{
      chats = JSON.parse(
        localStorage.getItem("aether_chats") || "[]"
      );
    }catch(e){
      chats = [];
    }

    var item = {
      id:state.chatId,
      title:chatTitle(),
      messages:state.messages,
      updated:Date.now()
    };

    var found = false;

    chats = chats.map(function(chat){
      if(chat.id === item.id){
        found = true;
        return item;
      }

      return chat;
    });

    if(!found){
      chats.unshift(item);
    }

    chats.sort(function(a,b){
      return b.updated - a.updated;
    });

    chats = chats.slice(0,30);

    try{
      localStorage.setItem("aether_chats",JSON.stringify(chats));
    }catch(e){}

    renderHistory();
  }

  function renderHistory(){
    var title = document.createElement("div");
    title.className = "history-title";
    title.textContent = "Recent chats";

    el.history.innerHTML = "";
    el.history.appendChild(title);

    var chats;

    try{
      chats = JSON.parse(
        localStorage.getItem("aether_chats") || "[]"
      );
    }catch(e){
      chats = [];
    }

    chats.forEach(function(chat){
      var item = document.createElement("div");
      item.className = "history-item";
      item.textContent = chat.title || "New chat";
      item.title = chat.title || "New chat";

      item.onclick = function(){
        loadChat(chat.id);
        closeDrawer();
      };

      el.history.appendChild(item);
    });
  }

  function loadChat(id){
    var chats;

    try{
      chats = JSON.parse(
        localStorage.getItem("aether_chats") || "[]"
      );
    }catch(e){
      return;
    }

    var chat = chats.find(function(item){
      return item.id === id;
    });

    if(!chat) return;

    state.chatId = chat.id;
    state.messages = Array.isArray(chat.messages)
      ? chat.messages
      : [];

    state.attachments = [];

    renderMessages();
    renderAttachments();
  }

  el.menuBtn.addEventListener("click",function(){
    if(el.sidebar.classList.contains("open")){
      closeDrawer();
    }else{
      openDrawer();
    }
  });

  el.overlay.addEventListener("click",closeDrawer);

  el.newChat.addEventListener("click",newChat);

  el.modelSelect.addEventListener("change",function(){
    state.selectedModel = el.modelSelect.value;
  });

  el.councilBtn.addEventListener("click",function(){
    state.council = !state.council;
    el.councilBtn.classList.toggle("active",state.council);

    if(state.council){
      el.councilBtn.textContent = "Council ON";
    }else{
      el.councilBtn.textContent = "AI Council";
    }
  });

  el.sendBtn.addEventListener("click",send);

  el.prompt.addEventListener("keydown",function(event){
    if(event.key === "Enter" && !event.shiftKey){
      event.preventDefault();
      send();
    }
  });

  el.prompt.addEventListener("input",autoResize);

  el.fileBtn.addEventListener("click",function(){
    el.fileInput.click();
  });

  el.fileInput.addEventListener("change",function(){
    handleFiles(Array.from(el.fileInput.files || []));
    el.fileInput.value = "";
  });

  renderHistory();
  loadModels();

})();
</script>
</body>
</html>`;

const DEFAULT_BASE_URL = "https://api.xkiro.com/v1";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function getBaseUrl(env) {
  return String(env.XKIRO_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function getApiKey(env) {
  return env.XKIRO_API_KEY || env.XKIRO_API_TOKEN || env.API_KEY || "";
}

function authHeaders(env) {
  const key = getApiKey(env);

  return {
    "Authorization": "Bearer " + key,
    "Content-Type": "application/json"
  };
}

async function readJsonSafe(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: {
        message: text
      }
    };
  }
}

function upstreamError(data, status) {
  let message = "xKiro request failed (" + status + ")";

  if (data && data.error) {
    if (typeof data.error === "string") {
      message = data.error;
    } else if (data.error.message) {
      message = data.error.message;
    } else if (data.error.code) {
      message = data.error.code;
    }
  } else if (data && data.message) {
    message = data.message;
  }

  return {
    error: {
      message,
      status
    }
  };
}

async function xkiroFetch(env, path, init = {}) {
  const key = getApiKey(env);

  if (!key) {
    throw new Error(
      "XKIRO_API_KEY is missing in Cloudflare Worker environment variables."
    );
  }

  const response = await fetch(
    getBaseUrl(env) + path,
    {
      ...init,
      headers: {
        ...authHeaders(env),
        ...(init.headers || {})
      }
    }
  );

  return response;
}

function modelScore(model) {
  let score = 0;

  if (model.reasoning) score += 40;
  if (model.vision) score += 20;
  if (model.tools) score += 10;

  const context = Number(
    model.context_window ||
    model.context_length ||
    model.max_context ||
    0
  );

  const output = Number(
    model.max_output_tokens ||
    model.max_tokens ||
    0
  );

  score += Math.min(context / 10000, 30);
  score += Math.min(output / 5000, 20);

  const id = String(model.id || "").toLowerCase();

  if (id.includes("reason")) score += 5;
  if (id.includes("thinking")) score += 5;

  return score;
}

async function listModels(env, modality = "chat") {
  const suffix =
    modality === "chat"
      ? ""
      : "?modality=" + encodeURIComponent(modality);

  const response = await xkiroFetch(env, "/models" + suffix, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      upstreamError(data, response.status).error.message
    );
  }

  const models = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.models)
      ? data.models
      : [];

  return models;
}

function isFreeModel(model) {
  return String(model.access_tier || "").toLowerCase() === "free";
}

function isChatModel(model) {
  const modality = String(model.modality || "chat").toLowerCase();

  return modality === "chat" || modality === "text";
}

async function getFreeModels(env) {
  const models = await listModels(env, "chat");

  return models
    .filter(isFreeModel)
    .filter(isChatModel)
    .sort((a, b) => modelScore(b) - modelScore(a));
}

async function getFreeImageModels(env) {
  const models = await listModels(env, "image");

  return models
    .filter(isFreeModel)
    .filter((model) => {
      const modality = String(model.modality || "image").toLowerCase();
      return modality === "image";
    });
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  };
}

function sseError(message, code = "upstream_error") {
  return (
    "data: " +
    JSON.stringify({
      error: {
        message,
        code
      }
    }) +
    "\n\n"
  );
}

function sseDone() {
  return "data: [DONE]\n\n";
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: {
          message: "Invalid JSON request."
        }
      },
      400
    );
  }

  const freeModels = await getFreeModels(env);

  if (!freeModels.length) {
    return json(
      {
        error: {
          message: "No free xKiro chat models are currently available."
        }
      },
      503
    );
  }

  const requestedModel = String(body.model || "");

  const allowed = freeModels.some(
    (model) => model.id === requestedModel
  );

  const model = allowed
    ? requestedModel
    : freeModels[0].id;

  const messages = Array.isArray(body.messages)
    ? body.messages
    : [];

  const upstreamBody = {
    model,
    messages,
    stream: true,

    web_search: {
      enable: true,
      count: 5
    }
  };

  if (body.reasoning_effort) {
    upstreamBody.reasoning_effort = body.reasoning_effort;
  }

  let upstream;

  try {
    upstream = await xkiroFetch(
      env,
      "/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(upstreamBody)
      }
    );
  } catch (error) {
    return json(
      {
        error: {
          message: error.message
        }
      },
      502
    );
  }

  if (!upstream.ok) {
    const data = await readJsonSafe(upstream);

    return json(
      upstreamError(data, upstream.status),
      upstream.status
    );
  }

  if (!upstream.body) {
    return json(
      {
        error: {
          message: "xKiro returned no streaming body."
        }
      },
      502
    );
  }

  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();

      let buffer = "";

      try {
        while (true) {
          const result = await reader.read();

          if (result.done) break;

          buffer += decoder.decode(result.value, {
            stream: true
          });

          const blocks = buffer.split("\n\n");

          buffer = blocks.pop() || "";

          for (const block of blocks) {
            const lines = block.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;

              const raw = line.slice(5).trim();

              if (!raw) continue;

              if (raw === "[DONE]") {
                controller.enqueue(
                  new TextEncoder().encode(
                    sseDone()
                  )
                );

                continue;
              }

              let parsed;

              try {
                parsed = JSON.parse(raw);
              } catch {
                continue;
              }

              if (parsed.error) {
                const message =
                  parsed.error.message ||
                  parsed.error.code ||
                  "xKiro upstream error";

                controller.enqueue(
                  new TextEncoder().encode(
                    sseError(message)
                  )
                );

                continue;
              }

              controller.enqueue(
                new TextEncoder().encode(
                  "data: " +
                  JSON.stringify(parsed) +
                  "\n\n"
                )
              );
            }
          }
        }

        controller.enqueue(
          new TextEncoder().encode(
            sseDone()
          )
        );

        controller.close();
      } catch (error) {
        controller.enqueue(
          new TextEncoder().encode(
            sseError(error.message || "Streaming failed")
          )
        );

        controller.enqueue(
          new TextEncoder().encode(
            sseDone()
          )
        );

        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: sseHeaders()
  });
}

function questionToText(question) {
  if (typeof question === "string") {
    return question;
  }

  if (!Array.isArray(question)) {
    return String(question || "");
  }

  return question
    .filter((part) => part && part.type === "text")
    .map((part) => part.text || "")
    .join("\n");
}

function normalizeCouncilMessages(question) {
  if (typeof question === "string") {
    return [
      {
        role: "user",
        content: question
      }
    ];
  }

  if (Array.isArray(question)) {
    return [
      {
        role: "user",
        content: question
      }
    ];
  }

  return [
    {
      role: "user",
      content: String(question || "")
    }
  ];
}

async function councilCall(env, model, messages) {
  const response = await xkiroFetch(
    env,
    "/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        web_search: {
          enable: true,
          count: 5
        }
      })
    }
  );

  const data = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      upstreamError(data, response.status).error.message
    );
  }

  const answer =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message
      ? data.choices[0].message.content
      : "";

  if (!answer) {
    throw new Error(
      "Model returned an empty council analysis."
    );
  }

  return answer;
}

async function handleCouncil(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: {
          message: "Invalid JSON request."
        }
      },
      400
    );
  }

  const freeModels = await getFreeModels(env);

  if (!freeModels.length) {
    return json(
      {
        error: {
          message: "No free council models are available."
        }
      },
      503
    );
  }

  const selected = freeModels.slice(
    0,
    Math.min(3, freeModels.length)
  );

  const baseMessages = normalizeCouncilMessages(
    body.question
  );

  const analyses = await Promise.allSettled(
    selected.map((model) => {
      const messages = [
        {
          role: "system",
          content:
            "You are one member of an AI research council. " +
            "Analyze the user's request independently. " +
            "Be factual, identify uncertainty, check important " +
            "claims with web search when useful, and provide " +
            "useful evidence for a final judge."
        },
        ...baseMessages
      ];

      return councilCall(
        env,
        model.id,
        messages
      );
    })
  );

  const successful = [];

  for (let i = 0; i < analyses.length; i++) {
    const result = analyses[i];

    if (result.status === "fulfilled") {
      successful.push({
        model: selected[i].id,
        answer: result.value
      });
    }
  }

  if (!successful.length) {
    const errors = analyses
      .map((result, index) => {
        if (result.status === "rejected") {
          return (
            selected[index].id +
            ": " +
            result.reason.message
          );
        }

        return null;
      })
      .filter(Boolean);

    return json(
      {
        error: {
          message:
            "All council models failed.\n\n" +
            errors.join("\n")
        }
      },
      502
    );
  }

  const discussion = successful
    .map((item, index) => {
      return (
        "COUNCIL MEMBER " +
        (index + 1) +
        " (" +
        item.model +
        "):\n" +
        item.answer
      );
    })
    .join("\n\n====================\n\n");

  let finalAnswer = "";

  if (successful.length === 1) {
    finalAnswer = successful[0].answer;
  } else {
    const judgeModel = successful[0].model;

    const judgeMessages = [
      {
        role: "system",
        content:
          "You are the final chair of an AI council. " +
          "Several independent AI researchers analyzed the " +
          "same request. Synthesize their work into one final " +
          "answer. Resolve contradictions using evidence. " +
          "Do not mention internal implementation unless useful. " +
          "Do not blindly trust a majority. Be clear and direct."
      },
      {
        role: "user",
        content:
          "Original request:\n" +
          questionToText(body.question) +
          "\n\nCouncil discussion:\n\n" +
          discussion
      }
    ];

    try {
      finalAnswer = await councilCall(
        env,
        judgeModel,
        judgeMessages
      );
    } catch (error) {
      finalAnswer =
        successful[0].answer +
        "\n\n[Final council synthesis unavailable: " +
        error.message +
        "]";
    }
  }

  return json({
    answer: finalAnswer,
    participants: successful.map(
      (item) => item.model
    ),
    failed: analyses
      .map((result, index) => {
        if (result.status === "rejected") {
          return {
            model: selected[index].id,
            error: result.reason.message
          };
        }

        return null;
      })
      .filter(Boolean)
  });
}

async function waitForImageJob(env, jobId) {
  const deadline = Date.now() + 5 * 60 * 1000;

  let waitMs = 2000;

  while (Date.now() < deadline) {
    await new Promise((resolve) => {
      setTimeout(resolve, waitMs);
    });

    waitMs = Math.min(
      Math.floor(waitMs * 1.5),
      10000
    );

    const response = await xkiroFetch(
      env,
      "/images/generations/" +
        encodeURIComponent(jobId),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await readJsonSafe(response);

    if (!response.ok) {
      throw new Error(
        upstreamError(data, response.status).error.message
      );
    }

    if (data.status === "succeeded") {
      const item =
        Array.isArray(data.data) &&
        data.data.length
          ? data.data[0]
          : null;

      const url =
        item &&
        (item.url ||
          item.image_url ||
          item.uri);

      if (!url) {
        throw new Error(
          "Image job succeeded but no image URL was returned."
        );
      }

      return {
        url,
        model: data.model,
        jobId: data.id
      };
    }

    if (
      data.status === "failed" ||
      data.status === "blocked"
    ) {
      const message =
        data.error &&
        data.error.message
          ? data.error.message
          : "Image generation " +
            data.status;

      throw new Error(message);
    }
  }

  throw new Error(
    "Image generation timed out after 5 minutes."
  );
}

async function handleImage(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: {
          message: "Invalid JSON request."
        }
      },
      400
    );
  }

  const prompt = String(body.prompt || "").trim();

  if (!prompt) {
    return json(
      {
        error: {
          message: "Image prompt is empty."
        }
      },
      400
    );
  }

  const imageModels = await getFreeImageModels(env);

  if (!imageModels.length) {
    return json(
      {
        error: {
          message:
            "No free image-generation model is currently available in your xKiro catalog."
        }
      },
      503
    );
  }

  const model = imageModels[0];

  const response = await xkiroFetch(
    env,
    "/images/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model.id,
        prompt,
        n: 1,
        size: "1024x1024"
      })
    }
  );

  const data = await readJsonSafe(response);

  if (!response.ok) {
    return json(
      upstreamError(data, response.status),
      response.status
    );
  }

  const jobId =
    data.id ||
    data.job_id;

  if (!jobId) {
    return json(
      {
        error: {
          message:
            "xKiro accepted the image request but did not return a job ID."
        }
      },
      502
    );
  }

  try {
    const result = await waitForImageJob(
      env,
      jobId
    );

    return json(result);
  } catch (error) {
    return json(
      {
        error: {
          message: error.message
        }
      },
      502
    );
  }
}

async function handleModels(env) {
  try {
    const chatModels = await getFreeModels(env);

    let imageModels = [];

    try {
      imageModels = await getFreeImageModels(env);
    } catch {
      imageModels = [];
    }

    return json({
      models: chatModels,
      imageModels
    });
  } catch (error) {
    return json(
      {
        error: {
          message: error.message
        }
      },
      502
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization",
          "Access-Control-Allow-Methods":
            "GET,POST,OPTIONS"
        }
      });
    }

    if (
      url.pathname === "/" ||
      url.pathname === "/index.html"
    ) {
      return new Response(HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    if (
      url.pathname === "/api/models" &&
      request.method === "GET"
    ) {
      return handleModels(env);
    }

    if (
      url.pathname === "/api/chat" &&
      request.method === "POST"
    ) {
      return handleChat(request, env);
    }

    if (
      url.pathname === "/api/council" &&
      request.method === "POST"
    ) {
      return handleCouncil(request, env);
    }

    if (
      url.pathname === "/api/image" &&
      request.method === "POST"
    ) {
      return handleImage(request, env);
    }

    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
};
