const DEFAULT_MODEL = "openai/gpt-5.6-sol";
const MAX_MESSAGES = 60;
const MAX_CHARS = 16000;
const PERSONAS = {
  default: "You are Aether, a helpful, accurate and direct AI assistant. Do not fabricate facts.",
  coder: "You are a senior full-stack engineer. Give secure, maintainable, production-quality solutions.",
  researcher: "You are a careful research assistant. Separate facts from uncertainty and do not invent sources.",
  creative: "You are a creative assistant. Produce original, polished and useful ideas.",
  tutor: "You are a patient tutor. Explain difficult concepts clearly and step-by-step."
};

const BASE = (env) => String(env.XKIRO_BASE_URL || "https://api.xkiro.com/v1").replace(/\/+$/, "");

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra
    }
  });
}
function err(message, status = 400, code = "bad_request") {
  return json({ error: { message, code } }, status);
}
function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization"
  };
}
async function body(request) {
  try { return await request.json(); }
  catch { throw new Error("Invalid JSON request body."); }
}
function key(env) {
  const k = String(env.XKIRO_API_KEY || "").trim();
  if (!k) throw new Error("XKIRO_API_KEY is not configured. Add it with: npx wrangler secret put XKIRO_API_KEY");
  return k;
}
async function xfetch(env, path, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${key(env)}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${BASE(env)}${path}`, { ...init, headers });
}
function messages(input) {
  if (!Array.isArray(input)) throw new Error("messages must be an array.");
  return input.slice(-MAX_MESSAGES).map(m => {
    if (!m || typeof m !== "object") return null;
    const role = ["user", "assistant", "system", "tool"].includes(m.role) ? m.role : "user";
    const content = String(m.content ?? "").trim().slice(0, MAX_CHARS);
    return content ? { role, content } : null;
  }).filter(Boolean);
}

async function models(request, env) {
  const u = new URL(request.url);
  const modality = u.searchParams.get("modality") || "chat";
  const allowed = new Set(["chat","image","tts","stt","embedding","ocr","moderation","video","music","all"]);
  if (!allowed.has(modality)) return err("Invalid modality.");
  const r = await fetch(`${BASE(env)}/models?modality=${encodeURIComponent(modality)}`);
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") || "application/json", "cache-control": "public, max-age=120", ...cors() }
  });
}

async function chat(request, env) {
  let b;
  try { b = await body(request); } catch (e) { return err(e.message); }
  let msgs;
  try { msgs = messages(b.messages); } catch (e) { return err(e.message); }
  if (!msgs.length) return err("At least one message is required.");
  const model = String(b.model || env.DEFAULT_CHAT_MODEL || DEFAULT_MODEL).trim();
  const persona = PERSONAS[String(b.persona || "default")] || PERSONAS.default;
  const safe = msgs.filter(m => m.role !== "system");
  const payload = {
    model,
    messages: [{ role: "system", content: persona }, ...safe],
    stream: true,
    max_tokens: Math.min(8192, Math.max(128, Number(b.max_tokens) || 4096))
  };
  if (b.webSearch === true) payload.web_search = { enable: true, count: 5 };
  if (b.reasoningEffort) payload.reasoning_effort = String(b.reasoningEffort);
  else payload.temperature = Math.min(2, Math.max(0, Number(b.temperature ?? 0.7)));

  let r;
  try { r = await xfetch(env, "/chat/completions", { method: "POST", body: JSON.stringify(payload), headers: { accept: "text/event-stream" } }); }
  catch (e) { return err(e.message, 502, "gateway_unreachable"); }
  if (!r.ok) return new Response(await r.text(), { status: r.status, headers: { "content-type": r.headers.get("content-type") || "application/json", ...cors() } });
  return new Response(r.body, { status: 200, headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", ...cors() } });
}

async function image(request, env) {
  let b;
  try { b = await body(request); } catch (e) { return err(e.message); }
  const prompt = String(b.prompt || "").trim().slice(0, 8000);
  const model = String(b.model || "").trim();
  if (!prompt) return err("Image prompt is required.");
  if (!model) return err("Select an image model first.");
  const size = ["1024x1024","1536x1024","1024x1536","1792x1024"].includes(b.size) ? b.size : "1024x1024";
  let r;
  try { r = await xfetch(env, "/images/generations", { method: "POST", body: JSON.stringify({ model, prompt, n: 1, size }) }); }
  catch (e) { return err(e.message, 502, "gateway_unreachable"); }
  const job = await r.json().catch(() => null);
  if (!r.ok) return json(job || { error: { message: `xKiro returned HTTP ${r.status}.` } }, r.status);
  if (!job?.id) return err("xKiro did not return an image job ID.", 502);

  const waits = [1000,1500,2250,3375,5000,7500,10000];
  for (let i = 0; i < 50; i++) {
    await new Promise(resolve => setTimeout(resolve, waits[Math.min(i, waits.length - 1)]));
    const p = await xfetch(env, `/images/generations/${encodeURIComponent(job.id)}`, { method: "GET", headers: { "accept": "application/json" } });
    const data = await p.json().catch(() => null);
    if (!p.ok) return json(data || { error: { message: `Image polling failed (${p.status}).` } }, p.status);
    if (data?.status === "succeeded") return json({ id: job.id, status: "succeeded", model: data.model || model, url: data.data?.[0]?.url || null });
    if (data?.status === "failed" || data?.status === "blocked") return err(data?.error?.message || `Image generation ${data.status}.`, 502);
  }
  return err("Image generation timed out while waiting for xKiro.", 504, "image_timeout");
}

const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#08090d"><title>AetherAI Studio</title><style>
:root{--bg:#08090d;--side:#0d0f14;--panel:#13161c;--panel2:#191d25;--border:#282e38;--text:#f5f7fb;--muted:#8992a1;--accent:#8173ff;--user:#252b34;--ok:#55d38a}*{box-sizing:border-box}html,body{height:100%;margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select,textarea{font:inherit}button{cursor:pointer}.app{height:100dvh;display:flex;overflow:hidden}.side{width:285px;flex:none;background:var(--side);border-right:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:20px}.brand{display:flex;align-items:center;gap:10px}.logo{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#a093ff,#5748e8);box-shadow:0 12px 35px #5d4fff22}.brand b{font-size:15px}.brand small{display:block;color:var(--muted);font-size:10px;margin-top:2px}.label{font-size:10px;color:#6f7886;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}.modes{display:grid;gap:6px}.mode{border:1px solid transparent;background:transparent;color:var(--muted);border-radius:11px;padding:10px;text-align:left;display:flex;align-items:center;gap:10px}.mode.active,.mode:hover{background:var(--panel2);border-color:var(--border);color:var(--text)}.ico{width:28px;height:28px;border-radius:8px;background:#20242c;display:grid;place-items:center}.control{display:grid;gap:7px}select{width:100%;background:#090b0f;color:var(--text);border:1px solid var(--border);border-radius:10px;padding:10px;outline:none}.row{display:flex;gap:6px}.row select{min-width:0}.refresh{width:40px;border:1px solid var(--border);background:var(--panel2);color:var(--text);border-radius:10px}.toggle{font-size:11px;color:var(--muted);display:flex;justify-content:space-between;align-items:center}.note{font-size:10px;color:#606976;line-height:1.45}.footer{margin-top:auto;color:#555d69;font-size:10px}.main{min-width:0;flex:1;display:flex;flex-direction:column}.top{height:60px;flex:none;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px}.title{font-size:14px;font-weight:750}.status{font-size:11px;color:var(--muted);display:flex;gap:7px;align-items:center}.dot{width:7px;height:7px;border-radius:50%;background:var(--ok);box-shadow:0 0 10px #55d38a66}.chat{flex:1;overflow:auto}.inner{width:min(900px,100%);margin:auto;padding:35px 22px 155px}.welcome{text-align:center;padding:65px 0 40px}.wlogo{width:60px;height:60px;border-radius:18px;margin:auto auto 17px;display:grid;place-items:center;font-size:23px;font-weight:900;background:linear-gradient(135deg,#a093ff,#5748e8)}h1{margin:0 0 9px;font-size:34px}.welcome p,.sub{color:var(--muted);font-size:13px}.msg{display:flex;gap:12px;margin:25px 0}.avatar{width:31px;height:31px;border-radius:10px;flex:none;display:grid;place-items:center;font-size:11px;font-weight:800}.user .avatar{background:#343b47}.assistant .avatar{background:linear-gradient(135deg,#a093ff,#5748e8)}.body{min-width:0;flex:1}.name{font-size:11px;font-weight:700;margin:2px 0 7px}.text{font-size:14px;line-height:1.7;color:#dce1e8;white-space:pre-wrap;overflow-wrap:anywhere}.user .text{display:inline-block;background:var(--user);border:1px solid #303742;border-radius:14px;padding:10px 13px}.typing{display:flex;gap:5px;padding:8px 0}.typing i{width:6px;height:6px;border-radius:50%;background:#9aa3b1;animation:p 1.1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes p{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}.composer-wrap{position:fixed;left:285px;right:0;bottom:0;padding:17px 22px;background:linear-gradient(to top,var(--bg) 60%,transparent)}.composer{width:min(900px,100%);margin:auto;background:#15181f;border:1px solid var(--border);border-radius:16px;display:flex;align-items:flex-end;padding:9px;gap:8px;box-shadow:0 15px 50px #0008}#message{flex:1;min-height:43px;max-height:180px;resize:none;background:transparent;border:0;outline:0;color:var(--text);padding:10px;line-height:1.5}.send{width:43px;height:43px;border:0;border-radius:11px;background:#6f5df5;color:white;font-size:18px}.send:disabled{opacity:.4}.hint{text-align:center;color:#5f6875;font-size:9px;margin-top:7px}.imageview{flex:1;overflow:auto}.imagepanel{width:min(900px,100%);margin:auto;padding:40px 22px}.imagepanel textarea{width:100%;min-height:145px;resize:vertical;background:var(--panel);color:var(--text);border:1px solid var(--border);border-radius:14px;padding:14px;outline:0}.primary{margin-top:10px;border:0;border-radius:10px;padding:11px 16px;background:#6f5df5;color:#fff;font-weight:750}.out{margin-top:25px}.out img{max-width:100%;border-radius:16px;border:1px solid var(--border)}.hidden{display:none!important}@media(max-width:760px){.side{width:70px;padding:12px 9px}.brand-copy,.label,.mode span,.control,.note,.footer{display:none}.mode{justify-content:center}.composer-wrap{left:70px}.top{padding:0 13px}.inner{padding-left:14px;padding-right:14px}}
</style></head><body><div class="app"><aside class="side"><div class="brand"><div class="logo">A</div><div class="brand-copy"><b>AetherAI Studio</b><small>Unified AI workspace</small></div></div><section><div class="label">Mode</div><div class="modes"><button class="mode active" data-mode="chat"><div class="ico">✦</div><span>Text AI</span></button><button class="mode" data-mode="image"><div class="ico">◈</div><span>Images</span></button></div></section><section class="control"><div class="label">Persona</div><select id="persona"><option value="default">Aether — General</option><option value="coder">Developer</option><option value="researcher">Researcher</option><option value="creative">Creative</option><option value="tutor">Tutor</option></select></section><section class="control" id="chatControls"><div class="label">Chat model</div><div class="row"><select id="model"></select><button class="refresh" id="refresh">↻</button></div><label class="toggle"><span>Free models only</span><input id="free" type="checkbox" checked></label><label class="toggle"><span>Web research</span><input id="web" type="checkbox"></label><div class="note">Models are loaded live from xKiro. Web research uses xKiro's live-search option when enabled.</div></section><section class="control hidden" id="imageControls"><div class="label">Image model</div><select id="imageModel"></select></section><div class="footer">Cloudflare Worker · xKiro</div></aside><main class="main"><header class="top"><div class="title" id="title">Text AI</div><div class="status"><span class="dot"></span><span id="status">Ready</span></div></header><section class="chat" id="chat"><div class="inner" id="inner"><div class="welcome" id="welcome"><div class="wlogo">A</div><h1>How can I help?</h1><p>Select a model and start chatting.</p></div></div></section><section class="imageview hidden" id="imageview"><div class="imagepanel"><h1>Generate an image</h1><div class="sub">Choose an xKiro image model and describe your idea.</div><textarea id="prompt" placeholder="A cinematic futuristic city at sunset, detailed architecture, atmospheric lighting..."></textarea><button class="primary" id="gen">Generate</button><div class="out" id="out"></div></div></section><div class="composer-wrap" id="composer"><div class="composer"><textarea id="message" rows="1" placeholder="Message Aether..."></textarea><button class="send" id="send">↑</button></div><div class="hint">Enter to send · Shift + Enter for a new line</div></div></main></div><script>
const S={mode:"chat",messages:[],busy:false,models:[],images:[]};const $=s=>document.querySelector(s);const chat=$("#chat"),inner=$("#inner"),welcome=$("#welcome"),message=$("#message"),send=$("#send"),status=$("#status");
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function bottom(){requestAnimationFrame(()=>chat.scrollTop=chat.scrollHeight)}
function add(role,text){welcome.classList.add("hidden");const e=document.createElement("div");e.className="msg "+role;e.innerHTML='<div class="avatar">'+(role==="assistant"?"A":"U")+'</div><div class="body"><div class="name">'+(role==="assistant"?"Aether":"You")+'</div><div class="text">'+esc(text)+'</div></div>';inner.appendChild(e);bottom();return e}
function typing(on){const old=$("#typing");if(old)old.remove();if(!on)return;const e=document.createElement("div");e.className="msg assistant";e.id="typing";e.innerHTML='<div class="avatar">A</div><div class="body"><div class="name">Aether</div><div class="typing"><i></i><i></i><i></i></div></div>';inner.appendChild(e);bottom()}
function busy(v){S.busy=v;send.disabled=v;message.disabled=v;status.textContent=v?"Thinking…":"Ready";typing(v)}
function render(){const only=$("#free").checked;const list=only?S.models.filter(m=>m.access_tier==="free"):S.models;$("#model").innerHTML=list.length?list.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.display_name||m.id)+(m.access_tier?" · "+esc(m.access_tier):"")+"</option>").join(""):"<option value=''>No models found</option>";$("#imageModel").innerHTML=S.images.length?S.images.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.display_name||m.id)+"</option>").join(""):"<option value=''>No image models found</option>"}
async function load(){status.textContent="Loading models…";try{const[a,b]=await Promise.all([fetch("/api/models?modality=chat"),fetch("/api/models?modality=image")]);const x=await a.json(),y=await b.json();S.models=Array.isArray(x.data)?x.data:[];S.images=Array.isArray(y.data)?y.data:[];render();status.textContent="Ready"}catch(e){status.textContent="Model error";add("assistant","Could not load models: "+e.message)}}
async function sendMsg(){if(S.busy)return;const text=message.value.trim();if(!text)return;const selected=$("#model").value;if(!selected){add("assistant","Select a chat model first.");return}message.value="";message.style.height="auto";S.messages.push({role:"user",content:text});add("user",text);busy(true);try{const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model:selected,persona:$("#persona").value,messages:S.messages,webSearch:$("#web").checked})});if(!r.ok){const e=await r.json().catch(()=>null);throw new Error(e?.error?.message||"Request failed")};const reader=r.body.getReader(),dec=new TextDecoder();let buf="",answer="",live=null;while(true){const q=await reader.read();if(q.done)break;buf+=dec.decode(q.value,{stream:true});const lines=buf.split("\\n");buf=lines.pop()||"";for(const line of lines){const t=line.trim();if(!t.startsWith("data:"))continue;const p=t.slice(5).trim();if(p==="[DONE]")continue;try{const o=JSON.parse(p),d=o?.choices?.[0]?.delta?.content;if(d){answer+=d;if(!live){typing(false);live=add("assistant","");}live.querySelector(".text").textContent=answer;bottom()}}catch{}}}if(!answer)throw new Error("The model returned no text.");S.messages.push({role:"assistant",content:answer})}catch(e){typing(false);add("assistant","Error: "+e.message)}finally{busy(false)}}
async function gen(){const prompt=$("#prompt").value.trim(),m=$("#imageModel").value,out=$("#out"),btn=$("#gen");if(!prompt||!m){out.innerHTML='<div class="text">Enter a prompt and choose an image model.</div>';return}btn.disabled=true;btn.textContent="Generating…";out.innerHTML='<div class="text">Generating image…</div>';try{const r=await fetch("/api/generate-image",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model:m,prompt,size:"1024x1024"})});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error?.message||"Generation failed");if(!d.url)throw new Error("No image URL returned.");out.innerHTML='<img src="'+esc(d.url)+'" alt="Generated image">'}catch(e){out.innerHTML='<div class="text">Error: '+esc(e.message)+'</div>'}finally{btn.disabled=false;btn.textContent="Generate"}}
document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.mode=b.dataset.mode;const c=S.mode==="chat";$("#chat").classList.toggle("hidden",!c);$("#imageview").classList.toggle("hidden",c);$("#composer").classList.toggle("hidden",!c);$("#chatControls").classList.toggle("hidden",!c);$("#imageControls").classList.toggle("hidden",c);$("#title").textContent=c?"Text AI":"Image Generator"});$("#free").onchange=render;$("#refresh").onclick=load;send.onclick=sendMsg;message.oninput=()=>{message.style.height="auto";message.style.height=Math.min(message.scrollHeight,180)+"px"};message.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}};$("#gen").onclick=gen;load();
</script></body></html>`;

export default { async fetch(request, env) {
  const u = new URL(request.url), method = request.method.toUpperCase();
  if (method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  try {
    if (method === "GET" && u.pathname === "/api/models") return models(request, env);
    if (method === "POST" && u.pathname === "/api/chat") return chat(request, env);
    if (method === "POST" && u.pathname === "/api/generate-image") return image(request, env);
    if (method === "GET" && (u.pathname === "/" || u.pathname === "/index.html")) return new Response(HTML, { headers: { "content-type":"text/html; charset=utf-8", "cache-control":"no-cache", "x-content-type-options":"nosniff" } });
    if (method === "GET" && u.pathname === "/health") return json({ ok:true, service:"aetherai-studio" });
    return err("Not found.",404,"not_found");
  } catch (e) { return err(e?.message || "Internal error.",500,"internal_error"); }
} };
