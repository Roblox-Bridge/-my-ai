export default {
  async fetch(request, env, ctx) {
    // CORS Headers for Frontend API Calls
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 1. Text Generation Endpoint (Multi-Agent Routing)
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { prompt, model, systemPrompt, groqApiKey } = body;

        // If Groq API Key is provided, use Groq Llama-3 70B for maximum power
        if (groqApiKey) {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model || 'llama3-70b-8192',
              messages: [
                { role: 'system', content: systemPrompt || 'You are AetherAI, an ultra-intelligent multi-agent system.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7
            })
          });

          const data = await groqResponse.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Fallback to Cloudflare Workers Native AI (100% Free Built-in)
        const answer = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt || 'You are AetherAI Multi-Agent Router.' },
            { role: 'user', content: prompt }
          ]
        });

        return new Response(JSON.stringify({ choices: [{ message: { content: answer.response } }] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Image Generation Endpoint (Flux / Stable Diffusion)
    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { prompt } = body;

        const inputs = { prompt: prompt };

        // Running Stable Diffusion XL on Cloudflare Workers AI
        const imageBuffer = await env.AI.run(
          '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          inputs
        );

        return new Response(imageBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/png',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('AetherAI Cloudflare Engine Running 24/7', { status: 200, headers: corsHeaders });
  }
};
