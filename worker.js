const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AetherAI — Next-Gen AI Workspace</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        brand: {
                            50: '#eef2ff',
                            500: '#6366f1',
                            600: '#4f46e5',
                            700: '#4338ca',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #090d16; color: #f3f4f6; }
        .glass-panel { background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-input { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); }
        .glass-input:focus { border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.25); }
        .glow-effect { box-shadow: 0 0 30px -5px rgba(99, 102, 241, 0.15); }
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">

    <!-- Top Navigation -->
    <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-6 py-3.5 flex justify-between items-center z-50">
        <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                ⚡
            </div>
            <div>
                <div class="flex items-center space-x-2">
                    <h1 class="font-bold text-base text-white tracking-wide">AetherAI Studio</h1>
                    <span class="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">v3.0 Pro</span>
                </div>
                <p class="text-[11px] text-slate-400">Multi-Model Cloudflare & Groq Orchestrator</p>
            </div>
        </div>

        <div class="flex items-center space-x-3">
            <div class="hidden sm:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs text-emerald-400 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Llama 3.1 8B Active</span>
            </div>
        </div>
    </header>

    <!-- App Layout -->
    <div class="flex-1 flex overflow-hidden">

        <!-- Sidebar / Controls -->
        <aside class="w-80 border-r border-white/10 bg-slate-950/40 p-5 flex flex-col justify-between hidden md:flex overflow-y-auto">
            <div class="space-y-6">
                <!-- API Engine Config -->
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Accelerator Key (Optional)</label>
                    <input type="password" id="groqKey" placeholder="Paste Groq API Key (gsk_...)" class="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all">
                    <p class="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Adds dynamic routing to Llama 3.3 70B for complex tasks.</p>
                </div>

                <!-- Execution Mode -->
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Operational Mode</label>
                    <select id="modeSelect" class="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer">
                        <option value="text">✨ Text & Logic Engine</option>
                        <option value="image">🎨 SDXL Image Generation</option>
                    </select>
                </div>

                <!-- Agent Persona -->
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">System Persona</label>
                    <div class="space-y-2">
                        <label class="flex items-center p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition">
                            <input type="radio" name="agent" value="You are a Senior Software Architect and Expert Programmer." checked class="text-indigo-600 focus:ring-0">
                            <span class="ml-2.5 text-xs font-medium text-slate-300">Software Architect</span>
                        </label>
                        <label class="flex items-center p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition">
                            <input type="radio" name="agent" value="You are a Technical Researcher and Data Analyst." class="text-indigo-600 focus:ring-0">
                            <span class="ml-2.5 text-xs font-medium text-slate-300">Data Researcher</span>
                        </label>
                        <label class="flex items-center p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition">
                            <input type="radio" name="agent" value="You are an AI Prompt Engineer and Creative Writer." class="text-indigo-600 focus:ring-0">
                            <span class="ml-2.5 text-xs font-medium text-slate-300">Creative Strategist</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Footer Badge -->
            <div class="pt-4 border-t border-white/10 text-center">
                <span class="text-[11px] text-slate-500 font-mono">Workers AI Engine v3.1</span>
            </div>
        </aside>

        <!-- Main Chat / Canvas -->
        <main class="flex-1 flex flex-col bg-slate-950/20 relative">
            
            <!-- Chat Feed -->
            <div id="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- Welcome Banner -->
                <div id="welcomeCard" class="max-w-2xl mx-auto my-12 text-center space-y-4">
                    <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 text-2xl shadow-inner">
                        🚀
                    </div>
                    <h2 class="text-xl font-semibold text-white">How can AetherAI assist you today?</h2>
                    <p class="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                        Powered by upgraded Llama 3.1 models on Cloudflare's global edge network. Fast, reliable, and deprecation-free.
                    </p>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-white/10 bg-slate-950/60 backdrop-blur-md">
                <div class="max-w-4xl mx-auto relative flex items-center">
                    <textarea id="userInput" rows="1" placeholder="Type your message or image description..." class="w-full glass-input rounded-2xl pl-4 pr-24 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none transition-all" onkeydown="handleKeyDown(event)"></textarea>
                    
                    <button onclick="executeTask()" id="sendBtn" class="absolute right-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-500/25">
                        <span>Send</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            </div>

        </main>
    </div>

    <script>
        function handleKeyDown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                executeTask();
            }
        }

        async function executeTask() {
            const inputEl = document.getElementById('userInput');
            const prompt = inputEl.value.trim();
            if (!prompt) return;

            const chatContainer = document.getElementById('chatContainer');
            const welcomeCard = document.getElementById('welcomeCard');
            if (welcomeCard) welcomeCard.remove();

            const mode = document.getElementById('modeSelect').value;
            const groqKey = document.getElementById('groqKey').value.trim();
            const systemPrompt = document.querySelector('input[name="agent"]:checked').value;
            const sendBtn = document.getElementById('sendBtn');

            // Render User Prompt
            chatContainer.innerHTML += \`
                <div class="flex justify-end max-w-4xl mx-auto">
                    <div class="bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] shadow-md leading-relaxed">
                        \${escapeHtml(prompt)}
                    </div>
                </div>
            \`;

            inputEl.value = '';
            chatContainer.scrollTop = chatContainer.scrollHeight;
            sendBtn.disabled = true;
            sendBtn.classList.add('opacity-50');

            // Render Loading State
            const loadingId = 'load-' + Date.now();
            chatContainer.innerHTML += \`
                <div id="\${loadingId}" class="flex justify-start max-w-4xl mx-auto">
                    <div class="glass-panel text-slate-300 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] flex items-center space-x-3">
                        <div class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                        <span class="text-xs text-slate-400 font-mono">Processing via AI Engine...</span>
                    </div>
                </div>
            \`;
            chatContainer.scrollTop = chatContainer.scrollHeight;

            try {
                if (mode === 'text') {
                    const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt, systemPrompt, groqApiKey: groqKey })
                    });
                    
                    const data = await res.json();
                    document.getElementById(loadingId).remove();

                    if(data.error) throw new Error(data.error);

                    const reply = data.choices[0].message.content;
                    chatContainer.innerHTML += \`
                        <div class="flex justify-start max-w-4xl mx-auto">
                            <div class="glass-panel text-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 text-sm max-w-[85%] leading-relaxed border border-white/10 shadow-lg whitespace-pre-wrap">
                                \${escapeHtml(reply)}
                            </div>
                        </div>
                    \`;
                } else {
                    const res = await fetch('/api/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt })
                    });

                    document.getElementById(loadingId).remove();
                    if (!res.ok) throw new Error('Failed to generate image');

                    const blob = await res.blob();
                    const imgUrl = URL.createObjectURL(blob);

                    chatContainer.innerHTML += \`
                        <div class="flex justify-start max-w-4xl mx-auto">
                            <div class="glass-panel rounded-2xl rounded-tl-sm p-2 border border-white/10">
                                <img src="\${imgUrl}" class="rounded-xl max-w-sm w-full object-cover shadow-2xl">
                            </div>
                        </div>
                    \`;
                }
            } catch (err) {
                document.getElementById(loadingId).remove();
                chatContainer.innerHTML += \`
                    <div class="flex justify-start max-w-4xl mx-auto">
                        <div class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 text-xs">
                            ❌ Error: \${err.message}
                        </div>
                    </div>
                \`;
            }

            sendBtn.disabled = false;
            sendBtn.classList.remove('opacity-50');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function escapeHtml(text) {
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 1. Text Generation API
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { prompt, systemPrompt, groqApiKey } = body;

        if (groqApiKey) {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt || 'You are an AI Assistant.' },
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

        // Active Cloudflare Model (Llama 3.1 8B Instruct)
        const answer = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt || 'You are an AI Assistant.' },
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

    // 2. Image Generation API
    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { prompt } = body;

        const imageBuffer = await env.AI.run(
          '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          { prompt }
        );

        return new Response(imageBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'image/png' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. UI Dashboard
    return new Response(HTML_CONTENT, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
