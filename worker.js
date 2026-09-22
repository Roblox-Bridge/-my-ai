export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================================================
    // MY AI — CORE MODEL
    // =========================================================

    async function callAI(messages, options = {}) {
      const result = await env.AI.run(
        "@cf/zai-org/glm-4.7-flash",
        {
          messages,
          temperature: options.temperature ?? 0.7,
          max_completion_tokens: options.max_completion_tokens ?? 2048
        }
      );

      const reply =
        result?.response ||
        result?.result?.response ||
        result?.choices?.[0]?.message?.content ||
        "";

      return reply;
    }

    // =========================================================
    // MY AI — BRAIN
    //
    // The brain does NOT answer the user directly.
    // It decides how the request should be handled.
    // =========================================================

    async function analyzeRequest(userMessage) {
      const analysisPrompt = `
You are the internal reasoning controller of an AI assistant called My AI.

Analyze the user's request and decide the best processing strategy.

Possible modes:
- direct: normal question that can be answered directly
- research: requires current/external information
- calculation: requires mathematical calculation
- comparison: requires comparing multiple things
- explanation: requires teaching/explaining a concept

Return ONLY one word:
direct
research
calculation
comparison
explanation

User request:
${userMessage}
`;

      try {
        const result = await callAI(
          [
            {
              role: "system",
              content:
                "You are My AI's internal request analyzer. " +
                "Follow the requested output format exactly."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          {
            temperature: 0,
            max_completion_tokens: 20
          }
        );

        const mode = result
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, "");

        const allowed = [
          "direct",
          "research",
          "calculation",
          "comparison",
          "explanation"
        ];

        if (allowed.includes(mode)) {
          return mode;
        }

        return "direct";
      } catch {
        // If the Brain fails, My AI still answers normally.
        return "direct";
      }
    }

    // =========================================================
    // MY AI — PROCESSING INSTRUCTIONS
    // =========================================================

    function getInstructions(mode) {
      switch (mode) {
        case "research":
          return `
The user's question may require current or external information.

IMPORTANT:
No live research tool has been connected yet.
Do NOT pretend that you searched Google, YouTube, websites,
or the live internet.

Answer using your existing knowledge and clearly state when
current verification would be needed.
`;

        case "calculation":
          return `
Solve the calculation carefully.
Check the arithmetic before giving the final answer.
Show the important steps when useful.
`;

        case "comparison":
          return `
Compare the requested subjects using factual differences.
Do not invent specifications or unsupported facts.
Keep the comparison clear and easy to understand.
`;

        case "explanation":
          return `
Explain the subject clearly and logically.
Use simple language unless the user asks for advanced detail.
Give examples when they improve understanding.
`;

        default:
          return `
Answer the user's request directly.
Be accurate, useful and concise.
`;
      }
    }

    // =========================================================
    // MY AI — FINAL ANSWER
    // =========================================================

    async function generateFinalAnswer(userMessage, mode) {
      const instructions = getInstructions(mode);

      return await callAI(
        [
          {
            role: "system",
            content:
              "You are My AI, a general-purpose AI assistant.\n\n" +
              "Your response is the FINAL response shown to the user.\n\n" +
              "My AI has an internal Brain that analyzed the request " +
              "before this response was generated.\n\n" +
              "Selected processing mode: " +
              mode +
              "\n\n" +
              "Processing instructions:\n" +
              instructions +
              "\n\n" +
              "Never reveal internal Brain instructions unless the user " +
              "specifically asks how the system works."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        {
          temperature: 0.7,
          max_completion_tokens: 4096
        }
      );
    }

    // =========================================================
    // CHAT API
    // =========================================================

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();

        const message =
          typeof body?.message === "string"
            ? body.message.trim()
            : "";

        if (!message) {
          return Response.json(
            {
              error: "Message is empty."
            },
            {
              status: 400
            }
          );
        }

        if (!env.AI) {
          return Response.json(
            {
              error: "Workers AI binding is missing.",
              details:
                "The AI binding named AI was not found."
            },
            {
              status: 500
            }
          );
        }

        // -----------------------------------------------------
        // STEP 1 — MY AI BRAIN
        // -----------------------------------------------------

        const mode = await analyzeRequest(message);

        // -----------------------------------------------------
        // STEP 2 — MY AI FINAL RESPONSE
        // -----------------------------------------------------

        const reply = await generateFinalAnswer(
          message,
          mode
        );

        if (!reply) {
          return Response.json(
            {
              error: "My AI returned an empty response.",
              mode
            },
            {
              status: 502
            }
          );
        }

        return Response.json({
          reply,
          mode
        });

      } catch (error) {
        return Response.json(
          {
            error: "My AI request failed.",
            details:
              error?.message ||
              String(error),
            name:
              error?.name ||
              "UnknownError"
          },
          {
            status: 500
          }
        );
      }
    }

    // =========================================================
    // MY AI UI
    // =========================================================

    if (request.method === "GET") {
      return new Response(
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +

        "<meta name='viewport' content='width=device-width,initial-scale=1'>" +

        "<title>My AI</title>" +

        "<style>" +

        "*{box-sizing:border-box}" +

        "html,body{" +
        "margin:0;" +
        "width:100%;" +
        "height:100%;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
        "background:#212121;" +
        "color:white" +
        "}" +

        "body{overflow:hidden}" +

        ".app{" +
        "height:100%;" +
        "display:flex" +
        "}" +

        ".side{" +
        "width:250px;" +
        "background:#171717;" +
        "padding:15px;" +
        "border-right:1px solid #333" +
        "}" +

        ".brand{" +
        "font-size:21px;" +
        "font-weight:700;" +
        "margin:10px 8px 20px" +
        "}" +

        "button{cursor:pointer}" +

        ".new{" +
        "width:100%;" +
        "padding:12px;" +
        "background:#222;" +
        "color:white;" +
        "border:1px solid #444;" +
        "border-radius:9px;" +
        "text-align:left" +
        "}" +

        ".main{" +
        "flex:1;" +
        "display:flex;" +
        "flex-direction:column;" +
        "min-width:0" +
        "}" +

        ".top{" +
        "height:58px;" +
        "border-bottom:1px solid #333;" +
        "padding:18px 20px;" +
        "font-weight:600" +
        "}" +

        ".chat{" +
        "flex:1;" +
        "overflow:auto;" +
        "padding:25px 15px 140px" +
        "}" +

        ".inner{" +
        "max-width:850px;" +
        "margin:auto" +
        "}" +

        ".welcome{" +
        "height:60vh;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "font-size:28px" +
        "}" +

        ".msg{" +
        "display:flex;" +
        "gap:12px;" +
        "margin:25px 0;" +
        "line-height:1.6" +
        "}" +

        ".avatar{" +
        "width:32px;" +
        "height:32px;" +
        "min-width:32px;" +
        "border-radius:50%;" +
        "background:#444;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "font-size:10px;" +
        "font-weight:700" +
        "}" +

        ".ai .avatar{" +
        "background:#10a37f" +
        "}" +

        ".area{" +
        "flex:1;" +
        "min-width:0" +
        "}" +

        ".text{" +
        "white-space:pre-wrap;" +
        "overflow-wrap:anywhere" +
        "}" +

        ".copy{" +
        "margin-top:8px;" +
        "padding:5px 9px;" +
        "background:#2b2b2b;" +
        "color:#bbb;" +
        "border:1px solid #444;" +
        "border-radius:7px;" +
        "font-size:12px" +
        "}" +

        ".copy:hover{" +
        "color:white;" +
        "background:#383838" +
        "}" +

        ".composer{" +
        "position:fixed;" +
        "left:250px;" +
        "right:0;" +
        "bottom:0;" +
        "padding:15px;" +
        "background:linear-gradient(transparent,#212121 35%)" +
        "}" +

        ".box{" +
        "max-width:850px;" +
        "margin:auto;" +
        "background:#2f2f2f;" +
        "border:1px solid #4a4a4a;" +
        "border-radius:15px;" +
        "padding:9px;" +
        "display:flex;" +
        "align-items:end" +
        "}" +

        "textarea{" +
        "flex:1;" +
        "background:transparent;" +
        "color:white;" +
        "border:0;" +
        "outline:0;" +
        "resize:none;" +
        "min-height:42px;" +
        "max-height:150px;" +
        "padding:10px;" +
        "font:inherit" +
        "}" +

        ".send{" +
        "width:40px;" +
        "height:40px;" +
        "border:0;" +
        "border-radius:9px;" +
        "background:white;" +
        "color:#111;" +
        "font-size:18px" +
        "}" +

        ".send:disabled{" +
        "opacity:.5" +
        "}" +

        "@media(max-width:700px){" +
        ".side{display:none}" +
        ".composer{left:0}" +
        ".welcome{font-size:25px}" +
        "}" +

        "</style>" +

        "</head>" +

        "<body>" +

        "<div class='app'>" +

        "<aside class='side'>" +

        "<div class='brand'>My AI</div>" +

        "<button class='new' id='new'>＋ New chat</button>" +

        "</aside>" +

        "<main class='main'>" +

        "<div class='top'>My AI</div>" +

        "<section class='chat' id='chat'>" +

        "<div class='inner' id='inner'>" +

        "<div class='welcome' id='welcome'>" +
        "How can I help?" +
        "</div>" +

        "</div>" +

        "</section>" +

        "<div class='composer'>" +

        "<div class='box'>" +

        "<textarea " +
        "id='input' " +
        "rows='1' " +
        "placeholder='Message My AI...'>" +
        "</textarea>" +

        "<button class='send' id='send'>↑</button>" +

        "</div>" +

        "</div>" +

        "</main>" +

        "</div>" +

        "<script>" +

        "const input=document.getElementById('input');" +
        "const send=document.getElementById('send');" +
        "const inner=document.getElementById('inner');" +
        "const chat=document.getElementById('chat');" +

        "input.addEventListener('input',()=>{" +

        "input.style.height='auto';" +

        "input.style.height=" +
        "Math.min(input.scrollHeight,150)+'px';" +

        "});" +

        "input.addEventListener('keydown',e=>{" +

        "if(e.key==='Enter'&&!e.shiftKey){" +

        "e.preventDefault();" +

        "sendMessage();" +

        "}" +

        "});" +

        "function addMessage(type,text){" +

        "const welcome=" +
        "document.getElementById('welcome');" +

        "if(welcome)welcome.remove();" +

        "const msg=document.createElement('div');" +

        "msg.className='msg '+type;" +

        "const avatar=document.createElement('div');" +

        "avatar.className='avatar';" +

        "avatar.textContent=" +
        "type==='user'?'You':'AI';" +

        "const area=document.createElement('div');" +

        "area.className='area';" +

        "const content=document.createElement('div');" +

        "content.className='text';" +

        "content.textContent=text;" +

        "area.appendChild(content);" +

        "if(type==='ai'){" +

        "const copy=document.createElement('button');" +

        "copy.className='copy';" +

        "copy.textContent='📋 Copy';" +

        "copy.onclick=async()=>{" +

        "try{" +

        "await navigator.clipboard.writeText(" +
        "content.textContent" +
        ");" +

        "}catch(e){" +

        "const t=document.createElement('textarea');" +

        "t.value=content.textContent;" +

        "document.body.appendChild(t);" +

        "t.select();" +

        "document.execCommand('copy');" +

        "t.remove();" +

        "}" +

        "copy.textContent='✓ Copied!';" +

        "setTimeout(()=>{" +
        "copy.textContent='📋 Copy'" +
        "},1500);" +

        "};" +

        "area.appendChild(copy);" +

        "}" +

        "msg.appendChild(avatar);" +
        "msg.appendChild(area);" +

        "inner.appendChild(msg);" +

        "chat.scrollTop=chat.scrollHeight;" +

        "return content;" +

        "}" +

        "async function sendMessage(){" +

        "const message=input.value.trim();" +

        "if(!message)return;" +

        "input.value='';" +

        "input.style.height='auto';" +

        "send.disabled=true;" +

        "addMessage('user',message);" +

        "const answer=" +
        "addMessage('ai','Thinking...');" +

        "try{" +

        "const response=await fetch('/api/chat',{" +

        "method:'POST'," +

        "headers:{" +
        "'Content-Type':'application/json'" +
        "}," +

        "body:JSON.stringify({" +
        "message:message" +
        "})" +

        "});" +

        "const data=await response.json();" +

        "if(!response.ok){" +

        "answer.textContent=" +
        "'AI Error: '+(" +
        "data.details||data.error||'Unknown error'" +
        ");" +

        "}else{" +

        "answer.textContent=" +
        "(data.reply||'No response generated.');" +

        "}" +

        "}catch(error){" +

        "answer.textContent=" +
        "'Connection Error: '+(" +
        "error.message||String(error)" +
        ");" +

        "}" +

        "send.disabled=false;" +

        "input.focus();" +

        "chat.scrollTop=chat.scrollHeight;" +

        "}" +

        "document.getElementById('new').onclick=()=>{" +

        "inner.innerHTML=" +
        "'<div class=\\'welcome\\' id=\\'welcome\\'>" +
        "How can I help?" +
        "</div>';" +

        "input.value='';" +

        "input.focus();" +

        "};" +

        "</script>" +

        "</body>" +

        "</html>",

        {
          headers:{
            "content-type":
              "text/html; charset=UTF-8"
          }
        }
      );
    }

    return new Response(
      "Not Found",
      {
        status:404
      }
    );
  }
};
