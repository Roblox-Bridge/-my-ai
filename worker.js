export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // API: CHAT
    // =========================
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body?.message?.trim();

        if (!message) {
          return Response.json(
            { error: "Please enter a message." },
            { status: 400 }
          );
        }

        if (!env.AI) {
          return Response.json(
            {
              error: "Workers AI binding is missing.",
              details:
                "The AI binding named 'AI' was not available inside the Worker."
            },
            { status: 500 }
          );
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content:
                  "You are My AI, a helpful, accurate and concise general-purpose AI assistant. Answer clearly and naturally."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return Response.json({
          reply:
            result?.response ||
            result?.result?.response ||
            "The AI returned an empty response.",
          raw: result
        });
      } catch (error) {
        return Response.json(
          {
            error: "AI request failed.",
            details: error?.message || String(error),
            name: error?.name || "UnknownError"
          },
          { status: 500 }
        );
      }
    }

    // =========================
    // MAIN WEBSITE
    // =========================
    if (request.method === "GET") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};


// ======================================================
// HTML
// ======================================================

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0">

<title>My AI</title>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

body {
  background: #212121;
  color: #fff;
}

.app {
  display: flex;
  width: 100%;
  height: 100vh;
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
  width: 260px;
  height: 100%;
  background: #171717;
  border-right: 1px solid #303030;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.brand {
  font-size: 21px;
  font-weight: 700;
  padding: 12px 10px 20px;
}

.new-chat {
  width: 100%;
  border: 1px solid #3b3b3b;
  background: #212121;
  color: white;
  border-radius: 9px;
  padding: 12px;
  cursor: pointer;
  text-align: left;
  font-size: 15px;
}

.new-chat:hover {
  background: #2a2a2a;
}

/* =========================
   MAIN
========================= */

.main {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* =========================
   TOPBAR
========================= */

.topbar {
  height: 58px;
  flex-shrink: 0;
  border-bottom: 1px solid #303030;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 17px;
  font-weight: 600;
}

/* =========================
   CHAT
========================= */

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 30px 18px 140px;
}

.chat-inner {
  width: 100%;
  max-width: 850px;
  margin: auto;
}

/* =========================
   WELCOME
========================= */

.welcome {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome h1 {
  font-size: 32px;
  font-weight: 600;
}

/* =========================
   MESSAGE
========================= */

.message {
  display: flex;
  gap: 14px;
  margin: 24px 0;
  line-height: 1.65;
  font-size: 15.5px;
}

.avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.message.user .avatar {
  background: #555;
}

.message.ai .avatar {
  background: #10a37f;
}

.content {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* =========================
   COMPOSER
========================= */

.composer-area {
  position: fixed;
  left: 260px;
  right: 0;
  bottom: 0;
  padding: 18px;
  background:
    linear-gradient(
      to top,
      #212121 70%,
      rgba(33,33,33,0)
    );
}

.composer {
  max-width: 850px;
  margin: auto;
  background: #2f2f2f;
  border: 1px solid #4a4a4a;
  border-radius: 16px;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  box-shadow: 0 5px 30px rgba(0,0,0,.25);
}

textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  min-height: 42px;
  max-height: 160px;
  padding: 10px;
  font-family: inherit;
}

textarea::placeholder {
  color: #aaa;
}

.send {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: white;
  color: #111;
  font-size: 18px;
  cursor: pointer;
}

.send:hover {
  background: #ddd;
}

.send:disabled {
  opacity: .5;
  cursor: default;
}

/* =========================
   LOADING
========================= */

.loading {
  color: #aaa;
  font-style: italic;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

  .sidebar {
    display: none;
  }

  .topbar {
    padding: 0 15px;
  }

  .chat {
    padding-left: 13px;
    padding-right: 13px;
    padding-bottom: 130px;
  }

  .composer-area {
    left: 0;
    padding: 10px;
  }

  .composer {
    border-radius: 14px;
  }

  .welcome h1 {
    font-size: 27px;
  }

  .message {
    gap: 10px;
    font-size: 15px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar">

    <div class="brand">
      My AI
    </div>

    <button class="new-chat" onclick="newChat()">
      ＋ New chat
    </button>

  </aside>


  <main class="main">

    <header class="topbar">
      My AI
    </header>


    <section class="chat" id="chat">

      <div class="chat-inner" id="chatInner">

        <div class="welcome" id="welcome">
          <h1>How can I help?</h1>
        </div>

      </div>

    </section>


    <div class="composer-area">

      <div class="composer">

        <textarea
          id="message"
          placeholder="Message My AI..."
          rows="1"
          autocomplete="off"
        ></textarea>

        <button
          class="send"
          id="send"
          onclick="sendMessage()"
        >
          ↑
        </button>

      </div>

    </div>

  </main>

</div>


<script>

const textarea = document.getElementById("message");
const sendButton = document.getElementById("send");
const chatInner = document.getElementById("chatInner");


// =========================
// AUTO RESIZE
// =========================

textarea.addEventListener("input", () => {

  textarea.style.height = "auto";

  textarea.style.height =
    Math.min(textarea.scrollHeight, 160) + "px";

});


// =========================
// ENTER TO SEND
// =========================

textarea.addEventListener("keydown", (event) => {

  if (event.key === "Enter" && !event.shiftKey) {

    event.preventDefault();

    sendMessage();

  }

});


// =========================
// ADD MESSAGE
// =========================

function addMessage(type, text) {

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.remove();
  }

  const message = document.createElement("div");

  message.className =
    "message " + type;

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    type === "user" ? "You" : "AI";


  const content = document.createElement("div");

  content.className = "content";

  content.textContent = text;


  message.appendChild(avatar);

  message.appendChild(content);

  chatInner.appendChild(message);


  const chat = document.getElementById("chat");

  chat.scrollTop = chat.scrollHeight;

  return content;
}


// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {

  const message =
    textarea.value.trim();

  if (!message) return;


  textarea.value = "";

  textarea.style.height = "auto";

  sendButton.disabled = true;


  addMessage("user", message);


  const aiContent =
    addMessage("ai", "Thinking...");

  aiContent.classList.add("loading");


  try {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })

      });


    const data =
      await response.json();


    aiContent.classList.remove("loading");


    if (!response.ok) {

      aiContent.textContent =
        "AI Error: " +
        (data.details ||
         data.error ||
         "Unknown error");

      sendButton.disabled = false;

      return;
    }


    aiContent.textContent =
      data.reply ||
      "No response generated.";


  } catch (error) {

    aiContent.classList.remove("loading");

    aiContent.textContent =
      "Connection error: " +
      (error.message || error);

  }


  sendButton.disabled = false;

  textarea.focus();


  const chat =
    document.getElementById("chat");

  chat.scrollTop =
    chat.scrollHeight;

}


// =========================
// NEW CHAT
// =========================

function newChat() {

  chatInner.innerHTML = `

    <div class="welcome" id="welcome">
      <h1>How can I help?</h1>
    </div>

  `;

  textarea.value = "";

  textarea.focus();

}

</script>

</body>
</html>`;
