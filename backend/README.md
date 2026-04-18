# NutriMate AI Proxy (Cloudflare Worker)

This backend proxy keeps your Gemini API key secret and returns meal plans to the frontend.

## 1) Deploy the worker
1. Install Wrangler CLI: `npm i -g wrangler`
2. Login: `wrangler login`
3. In this folder, create a worker project or use this file as your entry file.
4. Add secrets:
   - `wrangler secret put GEMINI_API_KEY`
   - Optional: `wrangler secret put ALLOWED_ORIGIN` (example: `https://your-project.web.app`)
5. Deploy: `wrangler deploy`

## 2) Configure frontend
In `js/ai.js`, set:

```javascript
const NUTRIMATE_AI_PROXY_URL = "https://your-worker-name.your-subdomain.workers.dev";
```

When proxy URL is set, frontend uses proxy first and does not require exposing Gemini key.

## 3) Validate
1. Open dashboard and click `Suggest Meals`.
2. Check `AI status` banner and diagnostics panel.
3. Confirm a meal plan still appears even if proxy fails (local fallback).
