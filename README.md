# AetherAI Studio

Cloudflare Worker frontend/backend using xKiro as the unified AI gateway.

## API key
Do NOT put the real key in `worker.js` or GitHub.

Production:

```bash
npx wrangler secret put XKIRO_API_KEY
```

Local development: create `.dev.vars`:

```env
XKIRO_API_KEY="PASTE_YOUR_XKIRO_API_KEY_HERE"
```

## Deploy

```bash
npm install
npx wrangler login
npx wrangler secret put XKIRO_API_KEY
npx wrangler deploy
```

## Features

- Dynamic xKiro chat model selector
- Free-model filter
- Streaming chat
- Personas
- Live web-search toggle through xKiro
- Image model selector
- Async image generation polling
- Modern responsive dark UI
- Key stays server-side
