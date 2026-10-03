const CODECRAFT_BASE = "https://www.codecraftapi.com/v1";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    ...extra
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      ...extra
    }
  });
}

function getApiKey(env) {
  return env.CODECRAFT_API_KEY || env.XKIRO_API_KEY || "";
}

/*
 * CodeCraft API request helper.
 *
 * Important:
 * The timeout only covers establishing the upstream response.
 * Once fetch() receives response headers, the timer is cleared,
 * so long-running SSE streams are NOT accidentally aborted.
 */
async function codecraftFetch(env, path, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();

  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const headers = new Headers(options.headers || {});

    const apiKey = getApiKey(env);

    if (apiKey && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${apiKey}`);
    }

    headers.set("Accept", "application/json");

    return await fetch(CODECRAFT_BASE + path, {
      ...options,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (timedOut) {
      throw new Error(
        `CodeCraft request timed out after ${timeoutMs / 1000}s`
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/* -----------------------------------------------------------
   MODEL HELPERS
----------------------------------------------------------- */

function modelId(model) {
  return String(model?.id || "").trim();
}

function modelCapabilities(model) {
  const caps = model?.capabilities;

  if (Array.isArray(caps)) {
    return caps.map(x => String(x).toLowerCase());
  }

  return [];
}

function modelType(model) {
  return String(
    model?.type ||
    model?.object ||
    ""
  ).toLowerCase();
}

function isChatModel(model) {
  const type = modelType(model);
  const id = modelId(model);

  if (!id) return false;

  if (
    type === "chat" ||
    type === "model" ||
    type === ""
  ) {
    return true;
  }

  return (
    !type.includes("embedding") &&
    !id.toLowerCase().includes("embed")
  );
}

function hasCapability(model, capability) {
  return modelCapabilities(model).includes(
    String(capability).toLowerCase()
  );
}

function hasWebSearch(model) {
  return hasCapability(model, "web_search");
}

function supportsStreaming(model) {
  const caps = modelCapabilities(model);

  if (!caps.length) return true;

  return caps.includes("streaming");
}

function supportsVision(model) {
  return hasCapability(model, "vision");
}

function isReasoningModel(model) {
  return hasCapability(model, "reasoning");
}

/*
 * Score models for normal chat.

 * We do NOT hardcode a model ID because CodeCraft can change
 * available models.
 */
function scoreNormalModel(model) {
  const id = modelId(model).toLowerCase();
  const caps = modelCapabilities(model);

  let score = 0;

  if (isChatModel(model)) score += 100;

  if (caps.includes("streaming")) score += 20;
  if (caps.includes("reasoning")) score += 30;
  if (caps.includes("vision")) score += 10;
  if (caps.includes("tools")) score += 5;

  /*
   * Prefer flagship/reasoning models when available.
   */
  if (
    id.includes("opus") ||
    id.includes("gpt-5") ||
    id.includes("sol") ||
    id.includes("pro")
  ) {
    score += 60;
  }

  if (
    id.includes("mini") ||
    id.includes("flash") ||
    id.includes("haiku")
  ) {
    score += 20;
  }

  return score;
}

function chooseBestModel(models) {
  const candidates = models
    .filter(isChatModel)
    .sort((a, b) => {
      return scoreNormalModel(b) - scoreNormalModel(a);
    });

  return candidates[0] || null;
}

function chooseResearchModel(models) {
  const candidates = models
    .filter(isChatModel)
    .filter(hasWebSearch)
    .sort((a, b) => {
      return scoreNormalModel(b) - scoreNormalModel(a);
    });

  if (candidates.length) {
    return {
      model: candidates[0],
      fallback: false
    };
  }

  return {
    model: chooseBestModel(models),
    fallback: true
  };
}

/* -----------------------------------------------------------
   MODEL API
----------------------------------------------------------- */

async function getModels(env) {
  const response = await codecraftFetch(
    env,
    "/models",
    {
      method: "GET"
    },
    15000
  );

  const raw = await response.text();

  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `CodeCraft /models returned invalid JSON. HTTP ${response.status}.`
    );
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `CodeCraft /models failed with HTTP ${response.status}`;

    throw new Error(message);
  }

  let models = [];

  if (Array.isArray(data)) {
    models = data;
  } else if (Array.isArray(data?.data)) {
    models = data.data;
  } else if (Array.isArray(data?.models)) {
    models = data.models;
  }

  if (!models.length) {
    throw new Error(
      "CodeCraft returned an empty model list."
    );
  }

  return models;
}

async function handleModels(env) {
  try {
    const allModels = await getModels(env);

    const models = allModels
      .filter(isChatModel)
      .map(model => ({
        ...model,
        id: modelId(model),
        capabilities: modelCapabilities(model)
      }))
      .filter(model => model.id);

    if (!models.length) {
      return json({
        ok: false,
        models: [],
        best: null,
        researchBest: null,
        hasWebSearch: false,
        error: "No chat models are available."
      });
    }

    const best = chooseBestModel(models);
    const research = chooseResearchModel(models);

    return json({
      ok: true,
      models,
      best: best?.id || null,
      researchBest: research.model?.id || null,
      hasWebSearch:
        models.some(model => hasWebSearch(model)),
      timestamp: Date.now()
    });
  } catch (error) {
    return json(
      {
        ok: false,
        models: [],
        best: null,
        researchBest: null,
        hasWebSearch: false,
        error: error?.message || "Unable to load models."
      },
      200
    );
  }
}

/* -----------------------------------------------------------
   MESSAGE NORMALIZATION
----------------------------------------------------------- */

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(message => {
      return (
        message &&
        typeof message === "object" &&
        ["system", "user", "assistant", "tool"].includes(
          message.role
        )
      );
    })
    .map(message => {
      const result = {
        role: message.role,
        content:
          message.content == null
            ? ""
            : message.content
      };

      if (message.name) {
        result.name = String(message.name);
      }

      if (message.tool_call_id) {
        result.tool_call_id = String(message.tool_call_id);
      }

      if (Array.isArray(message.tool_calls)) {
        result.tool_calls = message.tool_calls;
      }

      return result;
    });
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role !== "user") continue;

    const content = messages[i].content;

    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .filter(x => x?.type === "text")
        .map(x => x.text || "")
        .join(" ");
    }
  }

  return "";
}

/* -----------------------------------------------------------
   RESEARCH DETECTION
----------------------------------------------------------- */

function shouldResearch(text) {
  const value = String(text || "").toLowerCase().trim();

  if (!value) return false;

  const patterns = [
    /\blatest\b/,
    /\bcurrent\b/,
    /\btoday\b/,
    /\btonight\b/,
    /\byesterday\b/,
    /\brecent\b/,
    /\bnews\b/,
    /\bbreaking\b/,
    /\bupdate\b/,
    /\bupdates\b/,
    /\bright now\b/,
    /\bas of\b/,
    /\bthis week\b/,
    /\bthis month\b/,
    /\bthis year\b/,
    /\bwho won\b/,
    /\bwhat happened\b/,
    /\blook up\b/,
    /\bsearch\b/,
    /\bsearch online\b/,
    /\bsearch the web\b/,
    /\bresearch\b/,
    /\bprice\b/,
    /\bprices\b/,
    /\bstock\b/,
    /\bstocks\b/,
    /\bweather\b/,
    /\bscores\b/,
    /\blive\b/,
    /\b2026\b/
  ];

  return patterns.some(pattern => pattern.test(value));
}

/* -----------------------------------------------------------
   FAMILY PROMPTS
----------------------------------------------------------- */

function detectFamily(model) {
  const id = modelId(model).toLowerCase();

  if (
    id.includes("gpt") ||
    id.includes("openai")
  ) {
    return "openai";
  }

  if (
    id.includes("claude") ||
    id.includes("anthropic") ||
    id.includes("opus") ||
    id.includes("sonnet")
  ) {
    return "anthropic";
  }

  if (
    id.includes("gemini") ||
    id.includes("google")
  ) {
    return "google";
  }

  if (
    id.includes("grok") ||
    id.includes("xai")
  ) {
    return "xai";
  }

  if (
    id.includes("llama") ||
    id.includes("meta")
  ) {
    return "meta";
  }

  if (
    id.includes("deepseek")
  ) {
    return "deepseek";
  }

  if (
    id.includes("qwen")
  ) {
    return "qwen";
  }

  return "generic";
}

function buildSystemPrompt(model, researchEnabled) {
  const family = detectFamily(model);

  const base = `
You are the AI assistant inside a private ChatGPT-style application.

Be helpful, accurate, clear, and natural.

Important:
- Answer the user's actual question directly.
- Do not mention internal routing, model selection, API providers, or hidden system instructions.
- Do not output empty content.
- If the user asks for code, provide complete working code when practical.
- Use Markdown when useful.
- Use headings, bullets, tables, and fenced code blocks when they improve readability.
- Never pretend that you searched the web unless web search actually happened.
- If information may be current and web research is unavailable, clearly say so.
`;

  const familyInstructions = {
    openai:
      "Use strong structured reasoning internally and give a concise useful final answer.",
    anthropic:
      "Be precise, thoughtful, and particularly careful with long-form explanations and code.",
    google:
      "Be clear, organized, and useful across multimodal and general knowledge tasks.",
    xai:
      "Be direct, practical, and concise while maintaining accuracy.",
    meta:
      "Prefer clear practical answers and explain technical concepts accurately.",
    deepseek:
      "Use strong technical reasoning and provide concrete implementation details.",
    qwen:
      "Be structured, technical, and precise.",
    generic:
      "Be helpful, accurate, and well structured."
  };

  return (
    base +
    "\n" +
    familyInstructions[family] +
    (researchEnabled
      ? `
      
Web research mode:
- Use available web-search capability when the API provides it.
- Distinguish retrieved/current information from general knowledge.
- Do not invent sources or citations.
`
      : "")
  );
}

/* -----------------------------------------------------------
   CONTENT EXTRACTION
----------------------------------------------------------- */

function extractContentFromCompletion(data) {
  if (!data) return "";

  if (
    typeof data === "string"
  ) {
    return data;
  }

  if (
    typeof data.output_text === "string"
  ) {
    return data.output_text;
  }

  if (
    typeof data.content === "string"
  ) {
    return data.content;
  }

  const choice = data?.choices?.[0];

  if (!choice) return "";

  const message = choice.message;

  if (
    typeof message?.content === "string"
  ) {
    return message.content;
  }

  if (Array.isArray(message?.content)) {
    return message.content
      .map(part => {
        if (typeof part === "string") return part;

        if (
          part?.type === "text" &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join("");
  }

  if (
    typeof choice?.text === "string"
  ) {
    return choice.text;
  }

  if (
    typeof choice?.delta?.content === "string"
  ) {
    return choice.delta.content;
  }

  return "";
}

function extractErrorMessage(data, fallback) {
  return (
    data?.error?.message ||
    data?.message ||
    data?.error ||
    fallback
  );
}

/* -----------------------------------------------------------
   NON-STREAM FALLBACK
----------------------------------------------------------- */

async function requestNonStreaming(
  env,
  model,
  messages,
  options = {}
) {
  const body = {
    model: modelId(model),
    messages,
    stream: false,

    /*
     * Reasoning models may spend completion tokens on reasoning.
     * 8192 avoids the empty-visible-content problem caused by
     * an unnecessarily small completion budget.
     */
    max_tokens: options.max_tokens || 8192,

    temperature:
      typeof options.temperature === "number"
        ? options.temperature
        : 0.7
  };

  if (options.top_p != null) {
    body.top_p = options.top_p;
  }

  if (options.webSearch) {
    body.web_search = true;
    body.enable_web_search = true;
  }

  const response = await codecraftFetch(
    env,
    "/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    },
    30000
  );

  const raw = await response.text();

  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `CodeCraft returned invalid JSON (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        data,
        `CodeCraft request failed with HTTP ${response.status}`
      )
    );
  }

  const content = extractContentFromCompletion(data);

  if (!content.trim()) {
    const reasoning =
      data?.choices?.[0]?.message?.reasoning_content ||
      data?.choices?.[0]?.reasoning_content ||
      "";

    if (reasoning) {
      return reasoning;
    }

    throw new Error(
      "The model returned no visible content."
    );
  }

  return content;
}

/* -----------------------------------------------------------
   STREAMING
----------------------------------------------------------- */

async function handleStreamingChat(
  env,
  model,
  messages,
  options = {}
) {
  const body = {
    model: modelId(model),
    messages,
    stream: true,

    /*
     * IMPORTANT:
     * Do not use a tiny max_tokens value with reasoning models.
     */
    max_tokens: options.max_tokens || 8192,

    temperature:
      typeof options.temperature === "number"
        ? options.temperature
        : 0.7
  };

  if (options.top_p != null) {
    body.top_p = options.top_p;
  }

  if (options.webSearch) {
    body.web_search = true;
    body.enable_web_search = true;
  }

  const response = await codecraftFetch(
    env,
    "/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(body)
    },
    30000
  );

  /*
   * If CodeCraft rejects the request before opening the stream,
   * return the actual API error instead of an empty response.
   */
  if (!response.ok) {
    const raw = await response.text();

    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    const message = extractErrorMessage(
      data,
      raw ||
        `CodeCraft returned HTTP ${response.status}`
    );

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error(
      "CodeCraft opened the request but returned no response stream."
    );
  }

  /*
   * We proxy the upstream SSE directly.
   *
   * CodeCraft format:
   *
   * data: {"choices":[{"delta":{"content":"Hello"}}]}
   *
   * data: [DONE]
   *
   * This prevents the frontend from receiving an empty response
   * caused by trying to parse the entire stream as normal JSON.
   */
  return new Response(response.body, {
    status: 200,
    headers: corsHeaders({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    })
  });
}

/* -----------------------------------------------------------
   CHAT
----------------------------------------------------------- */

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Invalid JSON request body."
      },
      400
    );
  }

  const incomingMessages = normalizeMessages(
    body?.messages
  );

  if (!incomingMessages.length) {
    return json(
      {
        ok: false,
        error: "No messages were provided."
      },
      400
    );
  }

  const userText = lastUserText(
    incomingMessages
  );

  let allModels;

  try {
    allModels = await getModels(env);
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error?.message ||
          "Could not load CodeCraft models."
      },
      503
    );
  }

  const chatModels = allModels.filter(
    isChatModel
  );

  if (!chatModels.length) {
    return json(
      {
        ok: false,
        error: "No chat models are available."
      },
      503
    );
  }

  const requestedModelId =
    typeof body?.model === "string"
      ? body.model.trim()
      : "";

  let selectedModel = null;

  if (requestedModelId) {
    selectedModel =
      chatModels.find(
        model =>
          modelId(model) === requestedModelId
      ) || null;
  }

  if (!selectedModel) {
    selectedModel = chooseBestModel(
      chatModels
    );
  }

  if (!selectedModel) {
    return json(
      {
        ok: false,
        error: "Unable to select a chat model."
      },
      503
    );
  }

  /*
   * Research can be explicitly requested by frontend:
   * body.research = true
   *
   * Otherwise we detect current-information questions.
   */
  const researchRequested =
    body?.research === true ||
    shouldResearch(userText);

  let researchModel = selectedModel;
  let researchFallback = false;

  if (researchRequested) {
    if (!hasWebSearch(selectedModel)) {
      const researchChoice =
        chooseResearchModel(chatModels);

      researchModel =
        researchChoice.model ||
        selectedModel;

      researchFallback =
        researchChoice.fallback;
    }
  }

  if (
    researchRequested &&
    !hasWebSearch(researchModel)
  ) {
    /*
     * Do NOT falsely claim web search happened.
     * We still answer using the selected model.
     */
    researchFallback = true;
  }

  const finalModel =
    researchRequested
      ? researchModel
      : selectedModel;

  const actualWebSearch =
    researchRequested &&
    hasWebSearch(finalModel);

  const systemPrompt =
    buildSystemPrompt(
      finalModel,
      actualWebSearch
    );

  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    ...incomingMessages
  ];

  /*
   * 8192 is deliberately used for reasoning models.
   */
  const maxTokens =
    Number.isFinite(Number(body?.max_tokens)) &&
    Number(body.max_tokens) >= 2048
      ? Number(body.max_tokens)
      : 8192;

  const temperature =
    Number.isFinite(Number(body?.temperature))
      ? Math.min(
          2,
          Math.max(
            0,
            Number(body.temperature)
          )
        )
      : 0.7;

  try {
    const response =
      await handleStreamingChat(
        env,
        finalModel,
        messages,
        {
          max_tokens: maxTokens,
          temperature,
          webSearch: actualWebSearch
        }
      );

    /*
     * Metadata is exposed to your frontend without
     * modifying the upstream SSE data.
     */
    const headers = new Headers(
      response.headers
    );

    headers.set(
      "X-Model-Used",
      modelId(finalModel)
    );

    headers.set(
      "X-Model-Family",
      detectFamily(finalModel)
    );

    headers.set(
      "X-Research-Mode",
      researchRequested
        ? "true"
        : "false"
    );

    headers.set(
      "X-Research-Active",
      actualWebSearch
        ? "true"
        : "false"
    );

    headers.set(
      "X-Research-Fallback",
      researchFallback
        ? "true"
        : "false"
    );

    return new Response(
      response.body,
      {
        status: response.status,
        headers
      }
    );
  } catch (error) {
    /*
     * Streaming may fail before the response opens.
     * Return JSON so the frontend can display the
     * real error instead of "empty response".
     */
    return json(
      {
        ok: false,
        error:
          error?.message ||
          "The model request failed.",
        model: modelId(finalModel),
        researchRequested,
        webSearchActive: actualWebSearch
      },
      502
    );
  }
}

/* -----------------------------------------------------------
   IMAGE GENERATION
----------------------------------------------------------- */

async function handleImage(request, env) {
  if (!env.AI) {
    return json(
      {
        ok: false,
        error:
          "Cloudflare AI binding is not configured."
      },
      503
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Invalid JSON request body."
      },
      400
    );
  }

  const prompt =
    typeof body?.prompt === "string"
      ? body.prompt.trim()
      : "";

  if (!prompt) {
    return json(
      {
        ok: false,
        error: "Image prompt is required."
      },
      400
    );
  }

  try {
    const result = await env.AI.run(
      IMAGE_MODEL,
      {
        prompt
      }
    );

    /*
     * Cloudflare AI image models commonly return
     * an ArrayBuffer for the generated image.
     */
    if (
      result instanceof ArrayBuffer
    ) {
      return new Response(result, {
        status: 200,
        headers: corsHeaders({
          "Content-Type": "image/png"
        })
      });
    }

    /*
     * Handle Uint8Array-like results too.
     */
    if (
      result &&
      result.buffer instanceof ArrayBuffer
    ) {
      return new Response(
        result.buffer,
        {
          status: 200,
          headers: corsHeaders({
            "Content-Type": "image/png"
          })
        }
      );
    }

    /*
     * Some Cloudflare responses can be objects.
     */
    return json({
      ok: true,
      result
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error?.message ||
          "Image generation failed."
      },
      500
    );
  }
}

/* -----------------------------------------------------------
   HEALTH
----------------------------------------------------------- */

async function handleHealth(env) {
  return json({
    ok: true,
    service: "my-ai",
    codecraft_configured:
      Boolean(getApiKey(env)),
    cloudflare_ai_configured:
      Boolean(env.AI),
    timestamp: Date.now()
  });
}

/* -----------------------------------------------------------
   SIMPLE MANIFEST
----------------------------------------------------------- */

function manifest() {
  return json({
    name: "My AI",
    short_name: "My AI",
    description:
      "Personal AI assistant",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  });
}

/* -----------------------------------------------------------
   ICON
----------------------------------------------------------- */

function iconSvg() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="112" fill="#111116"/>
      <path d="M256 80c-97 0-176 70-176 156 0 49 27 92 69 120l-18 76 77-43c15 4 31 6 48 6 97 0 176-70 176-156S353 80 256 80z" fill="none" stroke="#fff" stroke-width="28"/>
      <circle cx="190" cy="236" r="18" fill="#fff"/>
      <circle cx="256" cy="236" r="18" fill="#fff"/>
      <circle cx="322" cy="236" r="18" fill="#fff"/>
    </svg>`,
    {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type":
          "image/svg+xml; charset=utf-8"
      }
    }
  );
}

/* -----------------------------------------------------------
   SERVICE WORKER
----------------------------------------------------------- */

function serviceWorker() {
  return new Response(
    `
self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", event => {
  /*
   * Network-first behavior.
   * We intentionally do not cache API responses.
   */
});
`,
    {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type":
          "application/javascript; charset=utf-8"
      }
    }
  );
}

/* -----------------------------------------------------------
   MINIMAL FRONTEND
----------------------------------------------------------- */

function appHTML() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta
  name="viewport"
  content="width=device-width,initial-scale=1,viewport-fit=cover"
>
<meta name="theme-color" content="#0b0b0f">
<title>My AI</title>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #0b0b0f;
  color: #f5f5f7;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

body {
  overflow: hidden;
}

button,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

#app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

header {
  height: 58px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid #25252d;
  background: #0d0d12;
}

.logo {
  font-weight: 700;
  font-size: 17px;
}

.status {
  margin-left: auto;
  font-size: 12px;
  color: #8d8d99;
}

#modelSelect {
  max-width: 220px;
  background: #17171e;
  color: #eee;
  border: 1px solid #2a2a33;
  border-radius: 10px;
  padding: 8px 10px;
}

#chat {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 150px;
  scroll-behavior: smooth;
}

.message {
  max-width: 900px;
  margin: 0 auto 24px;
}

.role {
  font-size: 12px;
  color: #8d8d99;
  margin-bottom: 7px;
}

.bubble {
  line-height: 1.65;
  font-size: 15px;
  white-space: normal;
  overflow-wrap: anywhere;
}

.user .bubble {
  background: #191920;
  border-radius: 16px;
  padding: 13px 15px;
}

pre {
  position: relative;
  background: #111117;
  border: 1px solid #292932;
  border-radius: 12px;
  padding: 15px;
  overflow-x: auto;
}

code {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}

.inline-code {
  background: #1b1b22;
  border-radius: 5px;
  padding: 2px 5px;
}

.code-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  border: 1px solid #33333d;
  background: #191920;
  color: #ddd;
  border-radius: 7px;
  padding: 5px 8px;
  font-size: 11px;
}

.actions {
  margin-top: 8px;
  display: flex;
  gap: 7px;
}

.action {
  border: 0;
  background: transparent;
  color: #777782;
  font-size: 12px;
  padding: 4px 0;
}

.action:hover {
  color: #fff;
}

.composer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding:
    12px
    max(12px, env(safe-area-inset-right))
    calc(12px + env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
  background:
    linear-gradient(
      transparent,
      #0b0b0f 18%
    );
}

.composer-inner {
  max-width: 900px;
  margin: auto;
  display: flex;
  gap: 8px;
  background: #15151b;
  border: 1px solid #292932;
  border-radius: 16px;
  padding: 8px;
}

#input {
  flex: 1;
  resize: none;
  min-height: 42px;
  max-height: 180px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  padding: 10px;
}

#send {
  width: 44px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  color: #000;
}

#error {
  max-width: 900px;
  margin: 8px auto;
  color: #ff8585;
  font-size: 13px;
  display: none;
}

@media (max-width: 650px) {
  header {
    padding: 0 9px;
  }

  #modelSelect {
    max-width: 150px;
  }

  #chat {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
</head>

<body>

<div id="app">

<header>
  <div class="logo">My AI</div>

  <select id="modelSelect">
    <option>Loading models…</option>
  </select>

  <div id="status" class="status">
    Loading…
  </div>
</header>

<main id="chat"></main>

<div id="error"></div>

<div class="composer">
  <div class="composer-inner">
    <textarea
      id="input"
      rows="1"
      placeholder="Message My AI…"
    ></textarea>

    <button id="send">↑</button>
  </div>
</div>

</div>

<script>
(function () {
  "use strict";

  const chat =
    document.getElementById("chat");

  const input =
    document.getElementById("input");

  const send =
    document.getElementById("send");

  const modelSelect =
    document.getElementById("modelSelect");

  const status =
    document.getElementById("status");

  const errorBox =
    document.getElementById("error");

  let messages = [];

  let loadingModels = false;
  let sending = false;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMarkdown(text) {
    let source =
      String(text || "");

    const codeBlocks = [];

    source =
      source.replace(
        /\\\`\\\`\\\`(?:[a-zA-Z0-9_-]+)?\\n([\\s\\S]*?)\\\`\\\`\\\`/g,
        function (_, code) {
          const id =
            codeBlocks.length;

          codeBlocks.push(code);

          return (
            '<div class="code-holder" data-code="' +
            id +
            '"></div>'
          );
        }
      );

    source =
      escapeHTML(source);

    source =
      source.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
      );

    source =
      source.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
      );

    source =
      source.replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
      );

    source =
      source.replace(
        /\\*\\*(.*?)\\*\\*/g,
        "<strong>$1</strong>"
      );

    source =
      source.replace(
        /\\*(.*?)\\*/g,
        "<em>$1</em>"
      );

    source =
      source.replace(
        /\\\`([^\\\`]+)\\\`/g,
        '<span class="inline-code">$1</span>'
      );

    source =
      source.replace(
        /^> (.*)$/gm,
        "<blockquote>$1</blockquote>"
      );

    source =
      source.replace(
        /^[-*] (.*)$/gm,
        "• $1"
      );

    source =
      source.replace(
        /\\n/g,
        "<br>"
      );

    codeBlocks.forEach(
      function (code, index) {
        const html =
          '<pre><button class="code-copy" data-copy="' +
          escapeHTML(code) +
          '">Copy</button><code>' +
          escapeHTML(code) +
          "</code></pre>";

        source =
          source.replace(
            '<div class="code-holder" data-code="' +
            index +
            '"></div>',
            html
          );
      }
    );

    return source;
  }

  function nearBottom() {
    return (
      chat.scrollHeight -
      chat.scrollTop -
      chat.clientHeight <
      180
    );
  }

  function scrollBottom() {
    chat.scrollTop =
      chat.scrollHeight;
  }

  function showError(message) {
    errorBox.textContent =
      message || "Unknown error";

    errorBox.style.display =
      "block";
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.style.display =
      "none";
  }

  function addMessage(
    role,
    content,
    streaming
  ) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "message " + role;

    const roleEl =
      document.createElement("div");

    roleEl.className =
      "role";

    roleEl.textContent =
      role === "user"
        ? "You"
        : "AI";

    const bubble =
      document.createElement("div");

    bubble.className =
      "bubble";

    bubble.innerHTML =
      renderMarkdown(content);

    wrapper.appendChild(
      roleEl
    );

    wrapper.appendChild(
      bubble
    );

    if (!streaming) {
      const actions =
        document.createElement("div");

      actions.className =
        "actions";

      const copy =
        document.createElement("button");

      copy.className =
        "action";

      copy.textContent =
        "Copy";

      copy.onclick =
        async function () {
          try {
            await navigator.clipboard.writeText(
              content
            );

            copy.textContent =
              "Copied";

            setTimeout(
              function () {
                copy.textContent =
                  "Copy";
              },
              1200
            );
          } catch {}
        };

      actions.appendChild(copy);

      wrapper.appendChild(actions);
    }

    chat.appendChild(wrapper);

    return {
      wrapper,
      bubble
    };
  }

  function updateStreamingBubble(
    bubble,
    content
  ) {
    bubble.innerHTML =
      renderMarkdown(content);
  }

  async function fetchModelsOnce() {
    const controller =
      new AbortController();

    const timer =
      setTimeout(
        function () {
          controller.abort();
        },
        15000
      );

    try {
      const response =
        await fetch(
          "/api/models?t=" +
            Date.now(),
          {
            cache: "no-store",
            signal:
              controller.signal
          }
        );

      const raw =
        await response.text();

      let data;

      try {
        data =
          raw
            ? JSON.parse(raw)
            : {};
      } catch {
        throw new Error(
          "Models API returned invalid JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Models API failed."
        );
      }

      if (data.ok === false) {
        throw new Error(
          data.error ||
          "Unable to load models."
        );
      }

      return data;
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        throw new Error(
          "Model loading timed out."
        );
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadModels() {
    if (loadingModels) return;

    loadingModels = true;

    status.textContent =
      "Loading models…";

    modelSelect.innerHTML =
      "<option>Loading models…</option>";

    let lastError = null;

    try {
      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        try {
          const data =
            await fetchModelsOnce();

          const models =
            Array.isArray(
              data.models
            )
              ? data.models
              : [];

          if (!models.length) {
            throw new Error(
              "No chat models returned."
            );
          }

          modelSelect.innerHTML =
            "";

          models.forEach(
            function (model) {
              const option =
                document.createElement(
                  "option"
                );

              option.value =
                model.id;

              option.textContent =
                model.name ||
                model.id;

              modelSelect.appendChild(
                option
              );
            }
          );

          const saved =
            localStorage.getItem(
              "my_ai_model_v7"
            );

          const validSaved =
            models.some(
              m =>
                m.id === saved
            );

          const selected =
            validSaved
              ? saved
              : data.best ||
                models[0].id;

          modelSelect.value =
            selected;

          status.textContent =
            data.hasWebSearch
              ? "Ready • Web"
              : "Ready";

          loadingModels = false;

          return;
        } catch (error) {
          lastError = error;

          if (
            attempt < 3
          ) {
            await new Promise(
              resolve =>
                setTimeout(
                  resolve,
                  700 * attempt
                )
            );
          }
        }
      }

      throw lastError ||
        new Error(
          "Models unavailable."
        );
    } catch (error) {
      status.textContent =
        "Models unavailable";

      modelSelect.innerHTML =
        "<option>Retry loading models</option>";

      showError(
        error?.message ||
        "Could not load models."
      );
    } finally {
      loadingModels = false;
    }
  }

  modelSelect.addEventListener(
    "change",
    function () {
      localStorage.setItem(
        "my_ai_model_v7",
        modelSelect.value
      );
    }
  );

  async function sendMessage() {
    if (sending) return;

    const text =
      input.value.trim();

    if (!text) return;

    clearError();

    sending = true;

    send.disabled = true;

    input.value = "";

    messages.push({
      role: "user",
      content: text
    });

    addMessage(
      "user",
      text,
      false
    );

    const ai =
      addMessage(
        "assistant",
        "",
        true
      );

    let fullText = "";

    const wasNearBottom =
      nearBottom();

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              "Accept":
                "text/event-stream"
            },
            body: JSON.stringify({
              model:
                modelSelect.value,
              messages,
              research: false
            })
          }
        );

      /*
       * HTTP errors are JSON, not SSE.
       */
      if (!response.ok) {
        const raw =
          await response.text();

        let data = null;

        try {
          data =
            raw
              ? JSON.parse(raw)
              : null;
        } catch {}

        throw new Error(
          data?.error ||
          raw ||
          "Chat request failed."
        );
      }

      if (!response.body) {
        throw new Error(
          "The model returned no response stream."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      while (true) {
        const result =
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

        /*
         * SSE events end with a blank line.
         */
        const events =
          buffer.split(
            /\\r?\\n\\r?\\n/
          );

        buffer =
          events.pop() || "";

        for (
          const event of events
        ) {
          const lines =
            event.split(
              /\\r?\\n/
            );

          for (
            const line of lines
          ) {
            if (
              !line.startsWith(
                "data:"
              )
            ) {
              continue;
            }

            const payload =
              line.slice(5).trim();

            if (
              payload ===
              "[DONE]"
            ) {
              continue;
            }

            let chunk;

            try {
              chunk =
                JSON.parse(
                  payload
                );
            } catch {
              continue;
            }

            /*
             * CodeCraft can send mid-stream errors.
             */
            if (chunk.error) {
              throw new Error(
                chunk.error.message ||
                "The model returned an error."
              );
            }

            const delta =
              chunk
                ?.choices?.[0]
                ?.delta;

            const content =
              typeof delta?.content ===
              "string"
                ? delta.content
                : "";

            if (content) {
              fullText +=
                content;

              updateStreamingBubble(
                ai.bubble,
                fullText
              );

              /*
               * Only autoscroll if the
               * user was already near
               * the bottom.
               */
              if (
                wasNearBottom
              ) {
                scrollBottom();
              }
            }

            /*
             * Some providers may put
             * visible text into message
             * instead of delta.
             */
            if (
              !content &&
              typeof chunk
                ?.choices?.[0]
                ?.message?.content ===
                "string"
            ) {
              const fallback =
                chunk.choices[0]
                  .message.content;

              if (
                fallback &&
                fallback !==
                  fullText
              ) {
                fullText =
                  fallback;

                updateStreamingBubble(
                  ai.bubble,
                  fullText
                );
              }
            }
          }
        }
      }

      /*
       * Flush remaining decoder text.
       */
      buffer +=
        decoder.decode();

      if (
        !fullText.trim()
      ) {
        throw new Error(
          "The model returned an empty response. The request reached the model, but no visible text was received."
        );
      }

      messages.push({
        role: "assistant",
        content: fullText
      });

      /*
       * Add copy button after
       * streaming is complete.
       */
      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "actions";

      const copy =
        document.createElement(
          "button"
        );

      copy.className =
        "action";

      copy.textContent =
        "Copy";

      copy.onclick =
        async function () {
          try {
            await navigator.clipboard.writeText(
              fullText
            );

            copy.textContent =
              "Copied";

            setTimeout(
              function () {
                copy.textContent =
                  "Copy";
              },
              1200
            );
          } catch {}
        };

      actions.appendChild(copy);

      ai.wrapper.appendChild(
        actions
      );

      if (
        wasNearBottom
      ) {
        scrollBottom();
      }
    } catch (error) {
      ai.bubble.innerHTML =
        "";

      showError(
        error?.message ||
        "Something went wrong."
      );

      const errorText =
        document.createElement(
          "div"
        );

      errorText.style.color =
        "#ff8585";

      errorText.textContent =
        error?.message ||
        "Something went wrong.";

      ai.bubble.appendChild(
        errorText
      );
    } finally {
      sending = false;

      send.disabled = false;

      input.focus();
    }
  }

  send.addEventListener(
    "click",
    sendMessage
  );

  input.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    }
  );

  input.addEventListener(
    "input",
    function () {
      input.style.height =
        "auto";

      input.style.height =
        Math.min(
          input.scrollHeight,
          180
        ) + "px";
    }
  );

  loadModels();
})();
</script>

</body>
</html>`;
}

/* -----------------------------------------------------------
   ROUTER
----------------------------------------------------------- */

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    try {
      if (
        request.method === "OPTIONS"
      ) {
        return new Response(
          null,
          {
            status: 204,
            headers: corsHeaders()
          }
        );
      }

      if (
        url.pathname === "/" ||
        url.pathname === "/index.html"
      ) {
        return new Response(
          appHTML(),
          {
            status: 200,
            headers: {
              ...corsHeaders(),
              "Content-Type":
                "text/html; charset=utf-8"
            }
          }
        );
      }

      if (
        url.pathname === "/api/health" &&
        request.method === "GET"
      ) {
        return handleHealth(env);
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
        return handleChat(
          request,
          env
        );
      }

      if (
        url.pathname ===
          "/api/generate-image" &&
        request.method === "POST"
      ) {
        return handleImage(
          request,
          env
        );
      }

      if (
        url.pathname ===
          "/manifest.json" &&
        request.method === "GET"
      ) {
        return manifest();
      }

      if (
        url.pathname ===
          "/sw.js" &&
        request.method === "GET"
      ) {
        return serviceWorker();
      }

      if (
        url.pathname ===
          "/icon.svg" &&
        request.method === "GET"
      ) {
        return iconSvg();
      }

      return json(
        {
          ok: false,
          error: "Not found"
        },
        404
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error:
            error?.message ||
            "Internal server error."
        },
        500
      );
    }
  }
};
