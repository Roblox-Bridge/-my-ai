export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // CHAT API
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
              details: "AI binding was not found in the Worker environment."
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
                  "You are My AI, a helpful, accurate and concise general-purpose AI assistant."
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
            "The AI returned an empty response."
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
    // WEBSITE
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


// =====================================================
// HTML
// =====================================================

const HTML = `<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
/>

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
}

body {
  background: #212121;
  color: #ffffff;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

.app {
  width: 100%;
  height: 100vh;
  display: flex;
}

/* SIDEBAR */

.sidebar {
  width: 260px;
  height: 100%;
  background: #171717;
  border-right: 1px solid #303030;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.brand {
  padding: 12px 10px 20px;
  font-size: 21px;
  font-weight: 700;
}

.new-chat {
  width: 100%;
  padding: 12px;
  border: 1px solid #3b3b3b;
  border-radius: 9px;
  background: #212121;
  color: #ffffff;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.new-chat:hover {
  background: #2a2a2a;
}

/* MAIN */

.main {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* TOP BAR */

.topbar {
  height: 58px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #303030;
  font-size: 17px;
  font-weight: 600;
}

/* CHAT */

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

/* WELCOME */

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

/* MESSAGE */

.message {
  display: flex;
  gap: 14px;
  margin: 24px 0;
  font-size: 15.5px;
  line-height: 1.65;
}

.avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #444444;
  font-size: 11px;
  font-weight: 700;
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

.loading {
  color: #aaaaaa;
}

/* COMPOSER */

.composer-area {
  position: fixed;
  left: 260px;
  right: 0;
  bottom: 0;
  padding: 18px;
  background: linear-gradient(
    to top,
    #212121 70%,
    rgba(33, 33, 33, 0)
  );
}

.composer {
  max-width: 850px;
  margin: auto;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  background: #2f2f2f;
  border: 1px solid #4a4a4a;
  border-radius: 16px;
}

textarea {
  flex: 1;
  min-height: 42px;
  max-height: 160px;
  padding: 10px;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
}

textarea::placeholder {
  color: #aaaaaa;
}

.send {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #ffffff;
  color: #111111;
  font-size: 18px;
  cursor: pointer;
}

.send:hover {
  background: #dddddd;
}

.send:disabled {
  opacity: 0.5;
  cursor: default;
}

/* MOBILE */

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

    <button
      class="new-chat"
      onclick="newChat()"
    >
      ＋ New chat
    </button>

  </aside>


  <main class="main">

    <header class="topbar">
      My AI
    </header>


    <section
      class="chat"
      id="chat"
    >

      <div
        class="chat-inner"
        id="chatInner"
      >

        <div
          class="welcome"
          id="welcome"
        >
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

const textarea =
  document.getElementById("message");

const sendButton =
  document.getElementById("send");

const chatInner =
  document.getElementById("chatInner");


// =========================
// AUTO RESIZE
// =========================

textarea.addEventListener("input", function () {

  textarea.style.height = "auto";

  textarea.style.height =
    Math.min(textarea.scrollHeight, 160) + "px";

});


// =========================
// ENTER TO SEND
// =========================

textarea.addEventListener("keydown", function (event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();

  }

});


// =========================
// ADD MESSAGE
// =========================

function addMessage(type, text) {

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.remove();
  }

  const message =
    document.createElement("div");

  message.className =
    "message " + type;


  const avatar =
    document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    type === "user" ? "You" : "AI";


  const content =
    document.createElement("div");

  content.className = "content";

  content.textContent = text;


  message.appendChild(avatar);

  message.appendChild(content);

  chatInner.appendChild(message);


  const chat =
    document.getElementById("chat");

  chat.scrollTop =
    chat.scrollHeight;


  return content;
}


// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {

  const message =
    textarea.value.trim();

  if (!message) {
    return;
  }


  textarea.value = "";

  textarea.style.height = "auto";

  sendButton.disabled = true;


  addMessage(
    "user",
    message
  );


  const aiContent =
    addMessage(
      "ai",
      "Thinking..."
    );

  aiContent.classList.add("loading");


  try {

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: message
          })
        }
      );


    const data =
      await response.json();


    aiContent.classList.remove(
      "loading"
    );


    if (!response.ok) {

      aiContent.textContent =
        "AI Error: " +
        (
          data.details ||
          data.error ||
          "Unknown error"
        );

      sendButton.disabled = false;

      return;
    }


    aiContent.textContent =
      data.reply ||
      "No response generated.";


  } catch (error) {

    aiContent.classList.remove(
      "loading"
    );

    aiContent.textContent =
      "Connection error: " +
      (
        error.message ||
        String(error)
      );

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

  chatInner.innerHTML =
    '<div class="welcome" id="welcome">' +
      '<h1>How can I help?</h1>' +
    '</div>';

  textarea.value = "";

  textarea.style.height = "auto";

  textarea.focus();

}

</script>

</body>

</html>`;
