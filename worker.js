const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const PERSONAS = {
  architect: {
    name: "Software Architect",
    system:
      "You are an expert software architect. Give practical, accurate and production-oriented answers. Explain important tradeoffs clearly.",
  },

  researcher: {
    name: "Research Analyst",
    system:
      "You are a careful research analyst. Separate known facts from assumptions, avoid inventing information, and give structured answers.",
  },

  creative: {
    name: "Creative Strategist",
    system:
      "You are a highly creative strategist. Generate original ideas while keeping them practical and usable.",
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function clean(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role:
        m.role === "assistant" || m.role === "system"
          ? m.role
          : "user",
      content: clean(m.content),
    }))
    .filter((m) => m.content.length > 0);
}

function buildPrompt(messages, persona) {
  const personaData =
    PERSONAS[persona] || PERSONAS.architect;

  const conversation = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  return `${personaData.system}

You are AetherAI, a helpful AI assistant.

Rules:
- Answer the actual request directly.
- Do not invent facts.
- Use clear formatting.
- When writing code, provide complete usable code when appropriate.
- Keep explanations understandable.
- If something is uncertain, say so.

Conversation:

${conversation}

ASSISTANT:`;
}

async function askCloudflare(env, messages, persona) {
  if (!env.AI) {
    throw new Error("Cloudflare AI binding is missing.");
  }

  const model =
    env.DEFAULT_MODEL || DEFAULT_MODEL;

  const prompt = buildPrompt(messages, persona);

  const result = await env.AI.run(model, {
    prompt,
    max_tokens: 2048,
    temperature: 0.7,
  });

  let answer = "";

  if (typeof result === "string") {
    answer = result;
  } else if (result?.response) {
    answer = result.response;
  } else if (result?.text) {
    answer = result.text;
  } else {
    answer = JSON.stringify(result);
  }

  return {
    answer,
    provider: "cloudflare",
    model,
  };
}

async function askGroq(apiKey, messages, persona, model) {
  const personaData =
    PERSONAS[persona] || PERSONAS.architect;

  const groqMessages = [
    {
      role: "system",
      content: `${personaData.system}

You are AetherAI, a helpful AI assistant.
Answer accurately and directly.
Do not invent facts.`,
    },
    ...messages,
  ];

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `Groq request failed with ${response.status}`
    );
  }

  const answer =
    data?.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error("Groq returned an empty response.");
  }

  return {
    answer,
    provider: "groq",
    model: model || GROQ_MODEL,
  };
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        error: "Invalid JSON request.",
      },
      400
    );
  }

  const messages = normalizeMessages(body.messages);
  const persona = clean(body.persona, "architect");

  if (!messages.length) {
    return json(
      {
        success: false,
        error: "No messages supplied.",
      },
      400
    );
  }

  /*
   * Optional Groq key.
   *
   * The frontend may send it for this session.
   * If no key is supplied, Cloudflare Workers AI
   * is used automatically.
   */
  const groqApiKey = clean(body.groqApiKey);

  try {
    let result;

    if (groqApiKey) {
      result = await askGroq(
        groqApiKey,
        messages,
        persona,
        env.GROQ_MODEL || GROQ_MODEL
      );
    } else {
      result = await askCloudflare(
        env,
        messages,
        persona
      );
    }

    return json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("CHAT_ERROR:", error);

    return json(
      {
        success: false,
        error:
          error?.message ||
          "AI request failed.",
      },
      500
    );
  }
}

async function handleImageGeneration(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        error: "Invalid JSON request.",
      },
      400
    );
  }

  const prompt = clean(body.prompt);

  if (!prompt) {
    return json(
      {
        success: false,
        error: "Image prompt is required.",
      },
      400
    );
  }

  if (!env.AI) {
    return json(
      {
        success: false,
        error: "Cloudflare AI binding is missing.",
      },
      500
    );
  }

  const model =
    env.IMAGE_MODEL || IMAGE_MODEL;

  try {
    const result = await env.AI.run(model, {
      prompt,
      negative_prompt: clean(body.negativePrompt),
      num_steps: Math.min(
        Math.max(Number(body.steps) || 20, 1),
        50
      ),
      guidance:
        Number(body.guidance) || 7.5,
      width:
        Number(body.width) || 1024,
      height:
        Number(body.height) || 1024,
    });

    /*
     * Workers AI image models normally return
     * image bytes.
     */
    if (result instanceof ArrayBuffer) {
      return new Response(result, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    }

    if (result?.image) {
      const bytes =
        typeof result.image === "string"
          ? Uint8Array.from(
              atob(result.image),
              (c) => c.charCodeAt(0)
            )
          : result.image;

      return new Response(bytes, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
        },
      });
    }

    throw new Error(
      "Image model returned an unsupported response."
    );
  } catch (error) {
    console.error("IMAGE_ERROR:", error);

    return json(
      {
        success: false,
        error:
          error?.message ||
          "Image generation failed.",
      },
      500
    );
  }
}

async function handleHealth(env) {
  return json({
    success: true,
    name: "AetherAI Studio",
    status: "online",
    cloudflareAI: Boolean(env.AI),
    assets: Boolean(env.ASSETS),
    model:
      env.DEFAULT_MODEL ||
      DEFAULT_MODEL,
    imageModel:
      env.IMAGE_MODEL ||
      IMAGE_MODEL,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (url.pathname === "/api/health") {
      return handleHealth(env);
    }

    if (
      url.pathname === "/api/chat" &&
      request.method === "POST"
    ) {
      return handleChat(request, env);
    }

    if (
      url.pathname === "/api/generate-image" &&
      request.method === "POST"
    ) {
      return handleImageGeneration(
        request,
        env
      );
    }

    /*
     * Everything that is NOT an API route
     * goes to the static asset system.
     *
     * This is the important fix for:
     * "There is nothing yet here"
     */
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "AetherAI assets binding is not configured.",
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/plain",
        },
      }
    );
  },
};
