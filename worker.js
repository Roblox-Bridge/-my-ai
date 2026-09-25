// ============================================================
// AetherAI Studio
// Cloudflare Worker + xKiro
// ============================================================

const HTML = String.raw`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AetherAI Studio</title>

<style>
* {
  box-sizing: border-box;
}

:root {
  --bg: #212121;
  --panel: #171717;
  --panel2: #2a2a2a;
  --border: #3a3a3a;
  --text: #f5f5f5;
  --muted: #999;
  --accent: #10a37f;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  overflow: hidden;
}

button,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
}

.sidebar {
  width: 270px;
  background: var(--panel);
  border-right: 1px solid #303030;
  display: flex;
  flex-direction: column;
  padding: 12px;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px 16px;
  font-weight: 700;
  font-size: 17px;
}

.logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10a37f, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.new-chat {
  width: 100%;
  padding: 11px 13px;
  border-radius: 9px;
  border: 1px solid #444;
  background: #222;
  color: white;
  text-align: left;
  margin-bottom: 14px;
}

.new-chat:hover {
  background: #2d2d2d;
}

.sidebar-title {
  color: #888;
  font-size: 12px;
  padding: 7px 8px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.chat-history {
  overflow-y: auto;
  flex: 1;
}

.history-item {
  padding: 9px 10px;
  border-radius: 8px;
  color: #ddd;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.history-item:hover {
  background: #292929;
}

.sidebar-bottom {
  border-top: 1px solid #303030;
  padding-top: 10px;
}

.small-status {
  color: #777;
  font-size: 11px;
  padding: 6px 8px;
}

.main {
  min-width: 0;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 58px;
  border-bottom: 1px solid #303030;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.mobile-menu {
  display: none;
  background: transparent;
  color: white;
  border: 0;
  font-size: 22px;
}

.title {
  font-size: 15px;
  font-weight: 650;
}

.model-select {
  min-width: 210px;
  max-width: 400px;
  background: #292929;
  color: white;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 8px 10px;
  outline: none;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  color: #ddd;
  border: 1px solid transparent;
}

.icon-btn:hover {
  background: #2b2b2b;
  border-color: #3a3a3a;
}

.messages {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.messages-inner {
  width: min(900px, calc(100% - 32px));
  margin: 0 auto;
  padding: 30px 0 160px;
}

.welcome {
  min-height: calc(100vh - 260px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-box {
  text-align: center;
  max-width: 650px;
}

.welcome-box h1 {
  font-size: 32px;
  margin: 0 0 10px;
}

.welcome-box p {
  color: #999;
  line-height: 1.6;
}

.message {
  display: flex;
  gap: 14px;
  margin: 26px 0;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.user-avatar {
  background: #444;
}

.ai-avatar {
  background: linear-gradient(135deg, #10a37f, #2563eb);
}

.message-main {
  min-width: 0;
  flex: 1;
}

.message-header {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 7px;
}

.message-content {
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.message-content p {
  margin: 0 0 12px;
}

.message-content p:last-child {
  margin-bottom: 0;
}

.message-content pre {
  background: #111;
  border: 1px solid #333;
  padding: 14px;
  border-radius: 9px;
  overflow-x: auto;
  margin: 12px 0;
}

.message-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.message-content h1,
.message-content h2,
.message-content h3 {
  margin-top: 18px;
  margin-bottom: 8px;
}

.message-actions {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.message-action {
  border: 0;
  background: transparent;
  color: #888;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.message-action:hover {
  color: #eee;
  background: #2b2b2b;
}

.generated-image {
  max-width: min(700px, 100%);
  border-radius: 12px;
  display: block;
  margin-top: 8px;
  border: 1px solid #444;
}

.image-loading {
  border: 1px solid #3b3b3b;
  background: #1c1c1c;
  border-radius: 12px;
  padding: 20px;
  color: #aaa;
}

.composer-area {
  position: fixed;
  left: 270px;
  right: 0;
  bottom: 0;
  padding: 12px 20px 20px;
  background: linear-gradient(to bottom, transparent, rgba(33,33,33,.94) 20%);
}

.composer {
  width: min(900px, calc(100% - 10px));
  margin: 0 auto;
  border: 1px solid #444;
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,.25);
}

.composer textarea {
  width: 100%;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: white;
  padding: 15px 16px 8px;
  min-height: 58px;
  max-height: 180px;
  line-height: 1.5;
}

.composer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 9px 9px;
}

.composer-tools {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tool-btn {
  border: 0;
  background: transparent;
  color: #aaa;
  padding: 7px 9px;
  border-radius: 7px;
  font-size: 13px;
}

.tool-btn:hover {
  background: #363636;
  color: white;
}

.tool-btn.active {
  color: #10a37f;
  background: rgba(16,163,127,.12);
}

.send-btn {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 9px;
  background: white;
  color: black;
  font-weight: 800;
}

.send-btn:hover {
  opacity: .9;
}

.send-btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.notice {
  text-align: center;
  color: #666;
  font-size: 11px;
  padding-top: 7px;
}

.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: pulse 1s infinite;
}

.typing span:nth-child(2) {
  animation-delay: .15s;
}

.typing span:nth-child(3) {
  animation-delay: .3s;
}

@keyframes pulse {
  0%,100% { opacity: .3; }
  50% { opacity: 1; }
}

@media(max-width:800px) {

  .sidebar {
    position: fixed;
    z-index: 20;
    left: -280px;
    top: 0;
    bottom: 0;
    transition: left .2s;
  }

  .sidebar.open {
    left: 0;
  }

  .mobile-menu {
    display: block;
  }

  .composer-area {
    left: 0;
    padding-left: 10px;
    padding-right: 10px;
  }

  .model-select {
    min-width: 150px;
    max-width: 210px;
  }

  .messages-inner {
    width: calc(100% - 20px);
  }

  .welcome-box h1 {
    font-size: 25px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar" id="sidebar">

    <div class="brand">
      <div class="logo">A</div>
      <div>AetherAI Studio</div>
    </div>

    <button class="new-chat" id="newChat">
      + New chat
    </button>

    <div>
      <div class="sidebar-title">Chats</div>
      <div class="chat-history" id="chatHistory"></div>
    </div>

    <div class="sidebar-bottom">
      <div class="small-status" id="statusText">
        Connecting to xKiro...
      </div>
    </div>

  </aside>

  <main class="main">

    <header class="topbar">

      <div class="top-left">

        <button
          class="mobile-menu"
          id="mobileMenu"
          aria-label="Menu"
        >☰</button>

        <div class="title">
          AetherAI
        </div>

        <select
          class="model-select"
          id="modelSelect"
        >
          <option>Loading models...</option>
        </select>

      </div>

      <div class="top-actions">

        <button
          class="icon-btn"
          id="refreshModels"
          title="Refresh models"
        >↻</button>

      </div>

    </header>

    <section class="messages" id="messages">

      <div class="messages-inner" id="messagesInner">

        <div class="welcome" id="welcome">

          <div class="welcome-box">

            <h1>How can I help?</h1>

            <p>
              Chat with AI, generate images, search the web,
              and switch between available xKiro models.
            </p>

          </div>

        </div>

      </div>

    </section>

  </main>

</div>

<div class="composer-area">

  <div class="composer">

    <textarea
      id="input"
      rows="1"
      placeholder="Message AetherAI..."
    ></textarea>

    <div class="composer-bottom">

      <div class="composer-tools">

        <button
          class="tool-btn"
          id="webSearch"
          title="Enable web search"
        >🌐 Web</button>

        <button
          class="tool-btn"
          id="imageMode"
          title="Generate an image"
        >✦ Image</button>

      </div>

      <button
        class="send-btn"
        id="send"
        title="Send"
      >↑</button>

    </div>

  </div>

  <div class="notice">
    AetherAI Studio · Powered by xKiro
  </div>

</div>


<script>
(function () {

  "use strict";

  var state = {
    messages: [],
    histories: [],
    models: [],
    imageModels: [],
    currentChatId: null,
    webSearch: false,
    imageMode: false,
    streaming: false
  };

  var messagesInner = document.getElementById("messagesInner");
  var messagesBox = document.getElementById("messages");
  var input = document.getElementById("input");
  var sendButton = document.getElementById("send");
  var modelSelect = document.getElementById("modelSelect");
  var webSearchButton = document.getElementById("webSearch");
  var imageModeButton = document.getElementById("imageMode");
  var historyBox = document.getElementById("chatHistory");
  var statusText = document.getElementById("statusText");
  var sidebar = document.getElementById("sidebar");
  var welcome = document.getElementById("welcome");

  function escapeHtml(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }

  /*
   * IMPORTANT:
   * We intentionally do not put literal backtick characters
   * inside this HTML template.
   *
   * String.fromCharCode(96) gives us the backtick character
   * safely when we need to process Markdown code blocks.
   */

  function markdownToHtml(text) {

    var safe = escapeHtml(text);

    var bt =
      String.fromCharCode(96);

    var triple =
      bt + bt + bt;

    var codeBlockRegex =
      new RegExp(
        triple +
        "([\\\\s\\\\S]*?)" +
        triple,
        "g"
      );

    var inlineCodeRegex =
      new RegExp(
        bt +
        "([^" +
        bt +
        "]+)" +
        bt,
        "g"
      );

    safe = safe.replace(
      codeBlockRegex,
      function (match, code) {
        return "<pre><code>" +
          code +
          "</code></pre>";
      }
    );

    safe = safe.replace(
      inlineCodeRegex,
      function (match, code) {
        return "<code>" +
          code +
          "</code>";
      }
    );

    safe = safe.replace(
      /^### (.*)$/gm,
      "<h3>$1</h3>"
    );

    safe = safe.replace(
      /^## (.*)$/gm,
      "<h2>$1</h2>"
    );

    safe = safe.replace(
      /^# (.*)$/gm,
      "<h1>$1</h1>"
    );

    safe = safe.replace(
      /\\*\\*(.*?)\\*\\*/g,
      "<strong>$1</strong>"
    );

    safe = safe.replace(
      /\\*(.*?)\\*/g,
      "<em>$1</em>"
    );

    safe = safe.replace(
      /^- (.*)$/gm,
      "• $1"
    );

    safe = safe.replace(
      /\\n\\n+/g,
      "</p><p>"
    );

    safe = safe.replace(
      /\\n/g,
      "<br>"
    );

    return "<p>" +
      safe +
      "</p>";

  }

  function saveState() {

    try {

      localStorage.setItem(
        "aether_messages",
        JSON.stringify(
          state.messages
        )
      );

      localStorage.setItem(
        "aether_histories",
        JSON.stringify(
          state.histories
        )
      );

    } catch (error) {

      console.warn(
        "Could not save state",
        error
      );

    }

  }

  function loadState() {

    try {

      var messages =
        localStorage.getItem(
          "aether_messages"
        );

      var histories =
        localStorage.getItem(
          "aether_histories"
        );

      if (messages) {

        state.messages =
          JSON.parse(messages);

      }

      if (histories) {

        state.histories =
          JSON.parse(histories);

      }

    } catch (error) {

      console.warn(
        "Could not load state",
        error
      );

    }

  }

  function createId() {

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2)
    );

  }

  function scrollBottom() {

    messagesBox.scrollTop =
      messagesBox.scrollHeight;

  }

  function clearWelcome() {

    if (welcome) {

      welcome.remove();
      welcome = null;

    }

  }

  function addUserMessage(text) {

    clearWelcome();

    var wrapper =
      document.createElement("div");

    wrapper.className =
      "message";

    wrapper.innerHTML =
      '<div class="avatar user-avatar">U</div>' +
      '<div class="message-main">' +
      '<div class="message-header">You</div>' +
      '<div class="message-content"></div>' +
      '</div>';

    var content =
      wrapper.querySelector(
        ".message-content"
      );

    content.innerHTML =
      markdownToHtml(text);

    messagesInner.appendChild(
      wrapper
    );

    scrollBottom();

  }

  function addAssistantMessage(initialText) {

    clearWelcome();

    var wrapper =
      document.createElement("div");

    wrapper.className =
      "message";

    wrapper.innerHTML =
      '<div class="avatar ai-avatar">A</div>' +
      '<div class="message-main">' +
      '<div class="message-header">AetherAI</div>' +
      '<div class="message-content"></div>' +
      '<div class="message-actions"></div>' +
      '</div>';

    var content =
      wrapper.querySelector(
        ".message-content"
      );

    var actions =
      wrapper.querySelector(
        ".message-actions"
      );

    if (initialText) {

      content.innerHTML =
        markdownToHtml(
          initialText
        );

    } else {

      content.innerHTML =
        '<div class="typing">' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</div>';

    }

    var copy =
      document.createElement("button");

    copy.className =
      "message-action";

    copy.textContent =
      "Copy";

    copy.addEventListener(
      "click",
      function () {

        var text =
          content.innerText || "";

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          navigator.clipboard
            .writeText(text)
            .then(function () {

              copy.textContent =
                "Copied";

              setTimeout(
                function () {
                  copy.textContent =
                    "Copy";
                },
                1200
              );

            });

        }

      }
    );

    actions.appendChild(copy);

    messagesInner.appendChild(
      wrapper
    );

    scrollBottom();

    return {
      wrapper: wrapper,
      content: content,
      actions: actions
    };

  }

  function addImageMessage(url) {

    clearWelcome();

    var wrapper =
      document.createElement("div");

    wrapper.className =
      "message";

    wrapper.innerHTML =
      '<div class="avatar ai-avatar">A</div>' +
      '<div class="message-main">' +
      '<div class="message-header">AetherAI</div>' +
      '<div class="message-content"></div>' +
      '<div class="message-actions"></div>' +
      '</div>';

    var content =
      wrapper.querySelector(
        ".message-content"
      );

    var actions =
      wrapper.querySelector(
        ".message-actions"
      );

    var image =
      document.createElement("img");

    image.className =
      "generated-image";

    image.src =
      url;

    image.alt =
      "Generated image";

    content.appendChild(
      image
    );

    var copy =
      document.createElement("button");

    copy.className =
      "message-action";

    copy.textContent =
      "Copy image URL";

    copy.addEventListener(
      "click",
      function () {

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          navigator.clipboard
            .writeText(url)
            .then(function () {

              copy.textContent =
                "Copied";

              setTimeout(
                function () {
                  copy.textContent =
                    "Copy image URL";
                },
                1200
              );

            });

        }

      }
    );

    actions.appendChild(
      copy
    );

    messagesInner.appendChild(
      wrapper
    );

    scrollBottom();

  }

  function addImageLoading() {

    clearWelcome();

    var wrapper =
      document.createElement("div");

    wrapper.className =
      "message";

    wrapper.innerHTML =
      '<div class="avatar ai-avatar">A</div>' +
      '<div class="message-main">' +
      '<div class="message-header">AetherAI</div>' +
      '<div class="message-content">' +
      '<div class="image-loading">' +
      'Generating image...' +
      '</div>' +
      '</div>' +
      '</div>';

    messagesInner.appendChild(
      wrapper
    );

    scrollBottom();

    return wrapper;

  }

  function renderHistory() {

    historyBox.innerHTML =
      "";

    state.histories
      .slice()
      .reverse()
      .forEach(
        function (item) {

          var div =
            document.createElement("div");

          div.className =
            "history-item";

          div.textContent =
            item.title ||
            "New chat";

          div.addEventListener(
            "click",
            function () {

              loadConversation(
                item.id
              );

            }
          );

          historyBox.appendChild(
            div
          );

        }
      );

  }

  function loadConversation(id) {

    var found =
      state.histories.find(
        function (item) {
          return item.id === id;
        }
      );

    if (!found) {
      return;
    }

    state.currentChatId =
      found.id;

    state.messages =
      found.messages || [];

    messagesInner.innerHTML =
      "";

    if (!state.messages.length) {

      messagesInner.innerHTML =
        '<div class="welcome" id="welcome">' +
        '<div class="welcome-box">' +
        '<h1>How can I help?</h1>' +
        '<p>' +
        'Chat with AI, generate images, search the web, ' +
        'and switch between available xKiro models.' +
        '</p>' +
        '</div>' +
        '</div>';

      welcome =
        document.getElementById(
          "welcome"
        );

    } else {

      state.messages.forEach(
        function (message) {

          if (
            message.role === "user"
          ) {

            addUserMessage(
              message.content
            );

          }

          if (
            message.role === "assistant"
          ) {

            addAssistantMessage(
              message.content
            );

          }

          if (
            message.role === "image"
          ) {

            addImageMessage(
              message.url
            );

          }

        }
      );

    }

    renderHistory();

  }

  function saveCurrentConversation() {

    if (!state.currentChatId) {

      state.currentChatId =
        createId();

      state.histories.push({
        id: state.currentChatId,
        title: "New chat",
        messages: []
      });

    }

    var current =
      state.histories.find(
        function (item) {
          return (
            item.id ===
            state.currentChatId
          );
        }
      );

    if (!current) {
      return;
    }

    current.messages =
      state.messages;

    var firstUser =
      state.messages.find(
        function (item) {
          return (
            item.role === "user"
          );
        }
      );

    if (firstUser) {

      current.title =
        String(
          firstUser.content
        ).slice(0, 45);

    }

    saveState();
    renderHistory();

  }

  function newChat() {

    state.currentChatId =
      createId();

    state.messages =
      [];

    messagesInner.innerHTML =
      '<div class="welcome" id="welcome">' +
      '<div class="welcome-box">' +
      '<h1>How can I help?</h1>' +
      '<p>' +
      'Chat with AI, generate images, search the web, ' +
      'and switch between available xKiro models.' +
      '</p>' +
      '</div>' +
      '</div>';

    welcome =
      document.getElementById(
        "welcome"
      );

    saveCurrentConversation();

  }

  async function loadModels() {

    statusText.textContent =
      "Loading xKiro models...";

    try {

      var response =
        await fetch(
          "/api/models?modality=chat"
        );

      if (!response.ok) {

        throw new Error(
          "Model request failed"
        );

      }

      var data =
        await response.json();

      state.models =
        Array.isArray(data.data)
          ? data.data
          : [];

      modelSelect.innerHTML =
        "";

      var freeModels =
        state.models.filter(
          function (model) {

            return (
              String(
                model.access_tier ||
                ""
              ).toLowerCase() ===
              "free"
            );

          }
        );

      var added = {};

      if (freeModels.length) {

        var freeGroup =
          document.createElement(
            "optgroup"
          );

        freeGroup.label =
          "Free models";

        freeModels.forEach(
          function (model) {

            if (
              !model.id ||
              added[model.id]
            ) {
              return;
            }

            added[model.id] =
              true;

            var option =
              document.createElement(
                "option"
              );

            option.value =
              model.id;

            option.textContent =
              model.id;

            freeGroup.appendChild(
              option
            );

          }
        );

        modelSelect.appendChild(
          freeGroup
        );

      }

      var allGroup =
        document.createElement(
          "optgroup"
        );

      allGroup.label =
        "All models";

      state.models.forEach(
        function (model) {

          if (
            !model.id ||
            added[model.id]
          ) {
            return;
          }

          added[model.id] =
            true;

          var option =
            document.createElement(
              "option"
            );

          option.value =
            model.id;

          option.textContent =
            model.id +
            (
              model.access_tier
                ? " · " +
                  model.access_tier
                : ""
            );

          allGroup.appendChild(
            option
          );

        }
      );

      if (
        allGroup.children.length
      ) {

        modelSelect.appendChild(
          allGroup
        );

      }

      if (
        !modelSelect.options.length
      ) {

        var fallback =
          document.createElement(
            "option"
          );

        fallback.value =
          "openai/gpt-5.6-sol";

        fallback.textContent =
          "openai/gpt-5.6-sol";

        modelSelect.appendChild(
          fallback
        );

      }

      statusText.textContent =
        freeModels.length +
        " free · " +
        state.models.length +
        " total models";

    } catch (error) {

      console.error(error);

      statusText.textContent =
        "Could not load models";

      modelSelect.innerHTML =
        '<option value="openai/gpt-5.6-sol">' +
        'openai/gpt-5.6-sol' +
        '</option>';

    }

  }

  async function loadImageModels() {

    try {

      var response =
        await fetch(
          "/api/models?modality=image"
        );

      if (!response.ok) {
        return;
      }

      var data =
        await response.json();

      state.imageModels =
        Array.isArray(data.data)
          ? data.data
          : [];

    } catch (error) {

      console.warn(
        "Image models unavailable",
        error
      );

    }

  }

  function extractDelta(data) {

    if (
      data &&
      data.choices &&
      data.choices[0]
    ) {

      var choice =
        data.choices[0];

      if (
        choice.delta &&
        typeof choice.delta.content ===
        "string"
      ) {

        return choice.delta.content;

      }

      if (
        typeof choice.text ===
        "string"
      ) {

        return choice.text;

      }

    }

    if (
      data &&
      typeof data.content ===
      "string"
    ) {

      return data.content;

    }

    return "";

  }

  async function sendText() {

    var text =
      input.value.trim();

    if (
      !text ||
      state.streaming
    ) {

      return;

    }

    state.streaming =
      true;

    sendButton.disabled =
      true;

    input.value =
      "";

    resizeTextarea();

    addUserMessage(text);

    state.messages.push({
      role: "user",
      content: text
    });

    saveCurrentConversation();

    if (state.imageMode) {

      await generateImage(
        text
      );

      state.streaming =
        false;

      sendButton.disabled =
        false;

      return;

    }

    var assistant =
      addAssistantMessage(
        ""
      );

    var accumulated =
      "";

    try {

      var response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                model:
                  modelSelect.value,

                messages:
                  state.messages.filter(
                    function (message) {

                      return (
                        message.role ===
                          "user" ||
                        message.role ===
                          "assistant"
                      );

                    }
                  ),

                web_search:
                  state.webSearch
              })
          }
        );

      if (!response.ok) {

        var errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Chat request failed"
        );

      }

      if (!response.body) {

        throw new Error(
          "Streaming response unavailable"
        );

      }

      var reader =
        response.body.getReader();

      var decoder =
        new TextDecoder();

      var buffer =
        "";

      while (true) {

        var result =
          await reader.read();

        if (result.done) {
          break;
        }

        buffer +=
          decoder.decode(
            result.value,
            {
              stream: true
            }
          );

        var lines =
          buffer.split("\n");

        buffer =
          lines.pop() || "";

        for (
          var i = 0;
          i < lines.length;
          i++
        ) {

          var line =
            lines[i].trim();

          if (
            !line ||
            line.indexOf("data:") !== 0
          ) {

            continue;

          }

          var payload =
            line.slice(5).trim();

          if (
            payload === "[DONE]"
          ) {

            continue;

          }

          try {

            var json =
              JSON.parse(
                payload
              );

            var delta =
              extractDelta(
                json
              );

            if (delta) {

              accumulated +=
                delta;

              assistant
                .content
                .innerHTML =
                markdownToHtml(
                  accumulated
                );

              scrollBottom();

            }

          } catch (parseError) {

            console.warn(
              "SSE parse error",
              parseError
            );

          }

        }

      }

      if (!accumulated) {

        accumulated =
          "The model returned an empty response.";

        assistant
          .content
          .innerHTML =
          markdownToHtml(
            accumulated
          );

      }

      state.messages.push({
        role: "assistant",
        content: accumulated
      });

      saveCurrentConversation();

    } catch (error) {

      console.error(error);

      assistant
        .content
        .innerHTML =
        markdownToHtml(
          "Error: " +
          (
            error.message ||
            "Unknown error"
          )
        );

    } finally {

      state.streaming =
        false;

      sendButton.disabled =
        false;

      scrollBottom();

    }

  }

  async function generateImage(prompt) {

    var loading =
      addImageLoading();

    try {

      var imageModel =
        "";

      if (
        state.imageModels.length
      ) {

        var free =
          state.imageModels.find(
            function (item) {

              return (
                String(
                  item.access_tier ||
                  ""
                ).toLowerCase() ===
                "free"
              );

            }
          );

        imageModel =
          free
            ? free.id
            : state.imageModels[0].id;

      }

      var response =
        await fetch(
          "/api/images",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                prompt: prompt,
                model: imageModel
              })
          }
        );

      if (!response.ok) {

        var errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Image generation failed"
        );

      }

      var data =
        await response.json();

      var jobId =
        data.id ||
        data.job_id ||
        (
          data.data &&
          data.data.id
        );

      var directUrl =
        findImageUrl(data);

      if (directUrl) {

        loading.remove();

        addImageMessage(
          directUrl
        );

        state.messages.push({
          role: "image",
          url: directUrl
        });

        saveCurrentConversation();

        return;

      }

      if (!jobId) {

        throw new Error(
          "No image job ID returned"
        );

      }

      var imageUrl =
        await pollImage(
          jobId
        );

      loading.remove();

      addImageMessage(
        imageUrl
      );

      state.messages.push({
        role: "image",
        url: imageUrl
      });

      saveCurrentConversation();

    } catch (error) {

      loading.remove();

      var assistant =
        addAssistantMessage(
          ""
        );

      assistant
        .content
        .innerHTML =
        markdownToHtml(
          "Image generation error: " +
          (
            error.message ||
            "Unknown error"
          )
        );

    }

  }

  function findImageUrl(data) {

    if (!data) {
      return "";
    }

    if (
      typeof data.url ===
      "string"
    ) {

      return data.url;

    }

    if (
      typeof data.image_url ===
      "string"
    ) {

      return data.image_url;

    }

    if (
      Array.isArray(data.data)
    ) {

      for (
        var i = 0;
        i < data.data.length;
        i++
      ) {

        var item =
          data.data[i];

        if (
          item &&
          typeof item.url ===
          "string"
        ) {

          return item.url;

        }

      }

    }

    return "";

  }

  async function pollImage(jobId) {

    for (
      var attempt = 0;
      attempt < 120;
      attempt++
    ) {

      await new Promise(
        function (resolve) {
          setTimeout(
            resolve,
            2000
          );
        }
      );

      var response =
        await fetch(
          "/api/images/" +
          encodeURIComponent(
            jobId
          )
        );

      if (!response.ok) {

        var errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Image status request failed"
        );

      }

      var data =
        await response.json();

      var url =
        findImageUrl(data);

      if (url) {
        return url;
      }

      var status =
        String(
          data.status ||
          (
            data.data &&
            data.data.status
          ) ||
          ""
        ).toLowerCase();

      if (
        status === "failed" ||
        status === "error" ||
        status === "cancelled"
      ) {

        throw new Error(
          data.error ||
          "Image generation failed"
        );

      }

    }

    throw new Error(
      "Image generation timed out"
    );

  }

  function resizeTextarea() {

    input.style.height =
      "auto";

    input.style.height =
      Math.min(
        input.scrollHeight,
        180
      ) + "px";

  }

  input.addEventListener(
    "input",
    resizeTextarea
  );

  input.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendText();

      }

    }
  );

  sendButton.addEventListener(
    "click",
    sendText
  );

  document
    .getElementById("newChat")
    .addEventListener(
      "click",
      newChat
    );

  document
    .getElementById("refreshModels")
    .addEventListener(
      "click",
      function () {

        loadModels();
        loadImageModels();

      }
    );

  document
    .getElementById("mobileMenu")
    .addEventListener(
      "click",
      function () {

        sidebar.classList.toggle(
          "open"
        );

      }
    );

  webSearchButton.addEventListener(
    "click",
    function () {

      state.webSearch =
        !state.webSearch;

      webSearchButton.classList.toggle(
        "active",
        state.webSearch
      );

    }
  );

  imageModeButton.addEventListener(
    "click",
    function () {

      state.imageMode =
        !state.imageMode;

      imageModeButton.classList.toggle(
        "active",
        state.imageMode
      );

      input.placeholder =
        state.imageMode
          ? "Describe the image you want..."
          : "Message AetherAI...";

    }
  );

  loadState();

  renderHistory();

  loadModels();

  loadImageModels();

})();
</script>

</body>
</html>
`;


// ============================================================
// JSON helper
// ============================================================

function json(data, status = 200) {

  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store"
      }
    }
  );

}


// ============================================================
// Error helper
// ============================================================

function errorResponse(
  message,
  status = 500
) {

  return json(
    {
      error: message
    },
    status
  );

}


// ============================================================
// xKiro configuration
// ============================================================

function getBaseUrl(env) {

  return (
    env.XKIRO_BASE_URL ||
    "https://api.xkiro.com/v1"
  ).replace(
    /\/+$/,
    ""
  );

}

function getApiKey(env) {

  return String(
    env.XKIRO_API_KEY ||
    ""
  ).trim();

}

function requireApiKey(env) {

  var key =
    getApiKey(env);

  if (!key) {

    throw new Error(
      "XKIRO_API_KEY is not configured."
    );

  }

  return key;

}


// ============================================================
// xKiro request helper
// ============================================================

async function xkiroFetch(
  env,
  path,
  options = {}
) {

  var apiKey =
    requireApiKey(env);

  var headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    "Authorization",
    "Bearer " + apiKey
  );

  headers.set(
    "x-api-key",
    apiKey
  );

  if (!headers.has("Accept")) {

    headers.set(
      "Accept",
      "application/json"
    );

  }

  return fetch(
    getBaseUrl(env) + path,
    {
      ...options,
      headers: headers
    }
  );

}


// ============================================================
// Model list
// ============================================================

async function handleModels(
  request,
  env
) {

  var url =
    new URL(
      request.url
    );

  var modality =
    url.searchParams.get(
      "modality"
    );

  var endpoint =
    "/models";

  if (modality) {

    endpoint +=
      "?modality=" +
      encodeURIComponent(
        modality
      );

  }

  var response =
    await xkiroFetch(
      env,
      endpoint
    );

  var body =
    await response.text();

  return new Response(
    body,
    {
      status:
        response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json",

        "Cache-Control":
          "no-store"
      }
    }
  );

}


// ============================================================
// Chat completion
// ============================================================

async function handleChat(
  request,
  env
) {

  var body;

  try {

    body =
      await request.json();

  } catch (error) {

    return errorResponse(
      "Invalid JSON request.",
      400
    );

  }

  var model =
    body.model ||
    env.DEFAULT_CHAT_MODEL ||
    "openai/gpt-5.6-sol";

  var messages =
    Array.isArray(
      body.messages
    )
      ? body.messages
      : [];

  if (!messages.length) {

    return errorResponse(
      "Messages are required.",
      400
    );

  }

  var payload = {
    model: model,
    messages: messages,
    stream: true
  };

  if (body.web_search) {

    payload.web_search =
      true;

  }

  var upstream =
    await xkiroFetch(
      env,
      "/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  if (!upstream.ok) {

    var errorText =
      await upstream.text();

    return new Response(
      errorText ||
      "xKiro chat request failed.",
      {
        status:
          upstream.status,

        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  }

  return new Response(
    upstream.body,
    {
      status: 200,

      headers: {
        "Content-Type":
          "text/event-stream; charset=utf-8",

        "Cache-Control":
          "no-cache, no-transform",

        "Connection":
          "keep-alive",

        "X-Accel-Buffering":
          "no"
      }
    }
  );

}


// ============================================================
// Image generation
// ============================================================

async function handleImageCreate(
  request,
  env
) {

  var body;

  try {

    body =
      await request.json();

  } catch (error) {

    return errorResponse(
      "Invalid JSON request.",
      400
    );

  }

  var prompt =
    String(
      body.prompt ||
      ""
    ).trim();

  if (!prompt) {

    return errorResponse(
      "Image prompt is required.",
      400
    );

  }

  var payload = {
    prompt: prompt
  };

  if (body.model) {

    payload.model =
      body.model;

  }

  var response =
    await xkiroFetch(
      env,
      "/images/generations",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  var bodyText =
    await response.text();

  return new Response(
    bodyText,
    {
      status:
        response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json",

        "Cache-Control":
          "no-store"
      }
    }
  );

}


// ============================================================
// Image status
// ============================================================

async function handleImageStatus(
  jobId,
  env
) {

  var response =
    await xkiroFetch(
      env,
      "/images/generations/" +
      encodeURIComponent(
        jobId
      )
    );

  var body =
    await response.text();

  return new Response(
    body,
    {
      status:
        response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type"
          ) ||
          "application/json",

        "Cache-Control":
          "no-store"
      }
    }
  );

}


// ============================================================
// Health endpoint
// ============================================================

function handleHealth(env) {

  return json({
    ok: true,

    service:
      "AetherAI Studio",

    xkiroConfigured:
      Boolean(
        getApiKey(env)
      ),

    baseUrl:
      getBaseUrl(env),

    defaultModel:
      env.DEFAULT_CHAT_MODEL ||
      "openai/gpt-5.6-sol"
  });

}


// ============================================================
// Main Worker
// ============================================================

export default {

  async fetch(
    request,
    env,
    ctx
  ) {

    var url =
      new URL(
        request.url
      );

    try {

      if (
        request.method ===
        "OPTIONS"
      ) {

        return new Response(
          null,
          {
            status: 204,

            headers: {
              "Access-Control-Allow-Origin":
                "*",

              "Access-Control-Allow-Methods":
                "GET,POST,OPTIONS",

              "Access-Control-Allow-Headers":
                "Content-Type,Authorization"
            }
          }
        );

      }


      // --------------------------------------------------------
      // Main UI
      // --------------------------------------------------------

      if (
        url.pathname === "/" &&
        request.method === "GET"
      ) {

        return new Response(
          HTML,
          {
            status: 200,

            headers: {
              "Content-Type":
                "text/html; charset=utf-8",

              "Cache-Control":
                "no-store"
            }
          }
        );

      }


      // --------------------------------------------------------
      // Health
      // --------------------------------------------------------

      if (
        url.pathname === "/health" &&
        request.method === "GET"
      ) {

        return handleHealth(
          env
        );

      }


      // --------------------------------------------------------
      // Models
      // --------------------------------------------------------

      if (
        url.pathname === "/api/models" &&
        request.method === "GET"
      ) {

        return await handleModels(
          request,
          env
        );

      }


      // --------------------------------------------------------
      // Chat
      // --------------------------------------------------------

      if (
        url.pathname === "/api/chat" &&
        request.method === "POST"
      ) {

        return await handleChat(
          request,
          env
        );

      }


      // --------------------------------------------------------
      // Image creation
      // --------------------------------------------------------

      if (
        url.pathname === "/api/images" &&
        request.method === "POST"
      ) {

        return await handleImageCreate(
          request,
          env
        );

      }


      // --------------------------------------------------------
      // Image polling
      // --------------------------------------------------------

      if (
        url.pathname.startsWith(
          "/api/images/"
        ) &&
        request.method === "GET"
      ) {

        var jobId =
          decodeURIComponent(
            url.pathname.slice(
              "/api/images/".length
            )
          );

        if (!jobId) {

          return errorResponse(
            "Image job ID is required.",
            400
          );

        }

        return await handleImageStatus(
          jobId,
          env
        );

      }


      // --------------------------------------------------------
      // Not found
      // --------------------------------------------------------

      return new Response(
        "Not Found",
        {
          status: 404,

          headers: {
            "Content-Type":
              "text/plain; charset=utf-8"
          }
        }
      );

    } catch (error) {

      console.error(
        "Worker error:",
        error
      );

      return errorResponse(
        error &&
        error.message
          ? error.message
          : "Internal server error.",
        500
      );

    }

  }

};
