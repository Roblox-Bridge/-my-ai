export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json(
            { error: "Message is empty." },
            { status: 400 }
          );
        }

        const result = await env.AI.run(
  "@cf/meta/llama-3.1-8b-instruct",
  {
    messages: [
      {
        role: "system",
        content: "You are My AI, a helpful AI assistant."
      },
      {
        role: "user",
        content: message
      }
    ]
  }
);

return Response.json({
  reply: result.response ?? null,
  raw: result
});

      } catch (error) {
        return Response.json(
          {
            error: "AI request failed.",
            details: error.message
          },
          { status: 500 }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width,initial-scale=1,viewport-fit=cover">

<title>My AI</title>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Display",
    "Segoe UI",
    sans-serif;
  background: #0b0b0f;
  color: #f5f5f7;
}

body {
  overflow: hidden;
}

.app {
  display: flex;
  width: 100%;
  height: 100dvh;
}

.sidebar {
  width: 270px;
  background: #111116;
  border-right: 1px solid #24242c;
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.logo {
  font-size: 21px;
  font-weight: 700;
  margin-bottom: 24px;
}

.new-chat {
  width: 100%;
  border: 1px solid #303039;
  background: #19191f;
  color: white;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  cursor: pointer;
}

.sidebar-bottom {
  margin-top: auto;
  color: #858590;
  font-size: 12px;
  line-height: 1.5;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 62px;
  border-bottom: 1px solid #24242c;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 600;
}

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 30px 18px 160px;
}

.welcome {
  max-width: 760px;
  margin: 12vh auto 0;
  text-align: center;
}

.welcome h1 {
  font-size: clamp(30px, 5vw, 52px);
  margin: 0 0 12px;
  letter-spacing: -1.5px;
}

.welcome p {
  color: #91919b;
  font-size: 16px;
}

.messages {
  max-width: 850px;
  margin: auto;
}

.message {
  display: flex;
  margin: 18px 0;
}

.message.user {
  justify-content: flex-end;
}

.bubble {
  max-width: min(760px, 88%);
  padding: 13px 16px;
  border-radius: 17px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.user .bubble {
  background: #27272f;
}

.assistant .bubble {
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.composer-wrap {
  position: fixed;
  left: 270px;
  right: 0;
  bottom: 0;
  padding: 18px;
  background: linear-gradient(
    transparent,
    #0b0b0f 28%
  );
}

.composer {
  max-width: 850px;
  margin: auto;
  display: flex;
  gap: 10px;
  padding: 8px;
  background: #17171d;
  border: 1px solid #303039;
  border-radius: 18px;
}

textarea {
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: white;
  padding: 10px 12px;
  font-size: 15px;
  min-height: 44px;
  max-height: 140px;
}

textarea::placeholder {
  color: #777782;
}

.send {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 13px;
  background: white;
  color: #111;
  font-size: 18px;
  cursor: pointer;
  align-self: flex-end;
}

.send:disabled {
  opacity: .45;
}

@media (max-width: 700px) {
  .sidebar {
    display: none;
  }

  .composer-wrap {
    left: 0;
    padding: 12px;
  }

  .chat {
    padding-left: 13px;
    padding-right: 13px;
  }

  .topbar {
    padding: 0 15px;
  }
}
</style>
</head>

<body>

<div class="app">

  <aside class="sidebar">
    <div class="logo">My AI</div>

    <button class="new-chat" id="newChat">
      + New chat
    </button>

    <div class="sidebar-bottom">
      AI system foundation<br>
      Cloudflare Workers AI
    </div>
  </aside>

  <main class="main">

    <header class="topbar">
      My AI
    </header>

    <section class="chat" id="chat">

      <div class="welcome" id="welcome">
        <h1>How can I help?</h1>
        <p>Your personal AI starts here.</p>
      </div>

      <div class="messages" id="messages"></div>

    </section>

    <div class="composer-wrap">

      <form class="composer" id="composer">

        <textarea
          id="input"
          rows="1"
          placeholder="Message My AI..."
          autocomplete="off"
        ></textarea>

        <button class="send" id="send" type="submit">
          ↑
        </button>

      </form>

    </div>

  </main>

</div>

<script>
const input = document.getElementById("input");
const composer = document.getElementById("composer");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const send = document.getElementById("send");
const newChat = document.getElementById("newChat");
const chat = document.getElementById("chat");

function addMessage(role, text) {
  welcome.style.display = "none";

  const row = document.createElement("div");
  row.className = "message " + role;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  messages.appendChild(row);

  chat.scrollTop = chat.scrollHeight;

  return bubble;
}

composer.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text || send.disabled) return;

  addMessage("user", text);

  input.value = "";
  input.style.height = "44px";

  send.disabled = true;

  const assistant = addMessage(
    "assistant",
    "Thinking..."
  );

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    assistant.textContent =
      data.reply || "No response received.";

  } catch (error) {
    assistant.textContent =
      "AI error: " + error.message;
  }

  send.disabled = false;
  input.focus();
});

input.addEventListener("input", () => {
  input.style.height = "44px";
  input.style.height =
    Math.min(input.scrollHeight, 140) + "px";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

newChat.addEventListener("click", () => {
  messages.innerHTML = "";
  welcome.style.display = "block";
  input.focus();
});
</script>

</body>
</html>`;
