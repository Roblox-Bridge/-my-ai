const DEFAULT_MODEL =
  "@cf/meta/llama-3.1-8b-instruct-fast";

const GROQ_MODEL =
  "llama-3.3-70b-versatile";

const IMAGE_MODEL =
  "@cf/stabilityai/stable-diffusion-xl-base-1.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

const PERSONAS = {
  architect: {
    name: "Software Architect",
    instruction:
      "Act as a senior software architect. " +
      "Design maintainable, secure and scalable systems. " +
      "When code is requested, provide complete working code."
  },

  researcher: {
    name: "Data Researcher",
    instruction:
      "Act as a careful data researcher. " +
      "Separate facts from assumptions and explain uncertainty. " +
      "Use structured reasoning and concise evidence-based answers."
  },

  creative: {
    name: "Creative Strategist",
    instruction:
      "Act as a creative strategist. " +
      "Generate original ideas, practical strategies and " +
      "clear actionable plans."
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value, fallback = "") {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      m =>
        m &&
        typeof m === "object" &&
        ["system", "user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
    )
    .slice(-30)
    .map(m => ({
      role: m.role,
      content: m.content.slice(0, 16000)
    }));
}

async function askGroq(
  apiKey,
  messages,
  persona
) {
  const payload = {
    model: GROQ_MODEL,

    messages: [
      {
        role: "system",
        content:
          "You are AetherAI, a modern AI assistant.\n\n" +
          persona.instruction
      },
      ...messages
    ],

    temperature: 0.7,
    max_tokens: 4096
  };

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },

      body: JSON.stringify(payload)
    }
  );

  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "Groq returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      `Groq HTTP ${response.status}`
    );
  }

  const answer =
    data?.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error(
      "Groq returned no assistant response."
    );
  }

  return answer;
}

async function askCloudflare(
  env,
  messages,
  persona
) {
  if (!env.AI) {
    throw new Error(
      "Workers AI binding is missing."
    );
  }

  const conversation = messages
    .map(m => {
      const role =
        m.role === "assistant"
          ? "Assistant"
          : m.role === "system"
            ? "System"
            : "User";

      return `${role}: ${m.content}`;
    })
    .join("\n\n");

  const prompt =
    "You are AetherAI, a helpful AI assistant.\n\n" +
    persona.instruction +
    "\n\n" +
    "Conversation:\n" +
    conversation +
    "\n\nAssistant:";

  const result = await env.AI.run(
    env.DEFAULT_MODEL || DEFAULT_MODEL,
    {
      prompt,
      max_tokens: 2048,
      temperature: 0.7
    }
  );

  if (typeof result === "string") {
    return result;
  }

  if (
    result &&
    typeof result.response === "string"
  ) {
    return result.response;
  }

  if (
    result &&
    typeof result.text === "string"
  ) {
    return result.text;
  }

  throw new Error(
    "Workers AI returned an unexpected response."
  );
}

async function chat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Invalid JSON request."
      },
      400
    );
  }

  const messages =
    normalizeMessages(body.messages);

  if (!messages.length) {
    return json(
      {
        ok: false,
        error: "No messages supplied."
      },
      400
    );
  }

  const personaKey =
    clean(body.persona, "architect");

  const persona =
    PERSONAS[personaKey] ||
    PERSONAS.architect;

  const groqApiKey =
    clean(body.groqApiKey);

  try {
    let response;
    let provider;

    if (groqApiKey) {
      response = await askGroq(
        groqApiKey,
        messages,
        persona
      );

      provider = "groq";
    } else {
      response = await askCloudflare(
        env,
        messages,
        persona
      );

      provider = "cloudflare";
    }

    return json({
      ok: true,
      response,
      provider,

      model:
        provider === "groq"
          ? GROQ_MODEL
          : env.DEFAULT_MODEL ||
            DEFAULT_MODEL,

      persona: persona.name
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "AI request failed."
      },
      502
    );
  }
}

async function generateImage(
  request,
  env
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Invalid JSON request."
      },
      400
    );
  }

  const prompt =
    clean(body.prompt);

  if (!prompt) {
    return json(
      {
        ok: false,
        error: "Image prompt is required."
      },
      400
    );
  }

  if (prompt.length > 4000) {
    return json(
      {
        ok: false,
        error: "Image prompt is too long."
      },
      400
    );
  }

  if (!env.AI) {
    return json(
      {
        ok: false,
        error:
          "Workers AI binding is not configured."
      },
      500
    );
  }

  try {
    const result = await env.AI.run(
      env.IMAGE_MODEL || IMAGE_MODEL,
      {
        prompt,

        negative_prompt:
          clean(body.negativePrompt),

        width: 1024,
        height: 1024,

        num_steps: 20,
        guidance: 7.5
      }
    );

    if (
      result instanceof ReadableStream ||
      result instanceof ArrayBuffer ||
      result instanceof Uint8Array
    ) {
      return new Response(result, {
        status: 200,

        headers: {
          ...CORS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    if (result?.image) {
      let image = result.image;

      if (typeof image === "string") {
        image = Uint8Array.from(
          atob(image),
          c => c.charCodeAt(0)
        );
      }

      return new Response(image, {
        status: 200,

        headers: {
          ...CORS,
          "Content-Type": "image/png",
          "Cache-Control": "no-store"
        }
      });
    }

    throw new Error(
      "SDXL returned an invalid image response."
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Image generation failed."
      },
      502
    );
  }
}

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS
      });
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ) {
      return chat(request, env);
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/generate-image"
    ) {
      return generateImage(request, env);
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/health"
    ) {
      return json({
        ok: true,
        service: "AetherAI Studio",
        cloudflare:
          env.DEFAULT_MODEL ||
          DEFAULT_MODEL,
        groq: GROQ_MODEL,
        image:
          env.IMAGE_MODEL ||
          IMAGE_MODEL,
        aiBinding: Boolean(env.AI)
      });
    }

    return fetch(
      new Request(
        new URL(
          "/index.html",
          request.url
        ),
        request
      )
    );
  }
};
