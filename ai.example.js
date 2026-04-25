// Google Gemini AI Integration Template
// =====================================================
// PRODUCTION RECOMMENDATION: use proxy mode so API keys are never exposed in frontend.
// 1. Deploy backend/cloudflare-worker.js
// 2. Set window.NUTRIMATE_AI_PROXY_URL in this file
// 3. Keep GEMINI_API_KEY as placeholder in production
// =====================================================

window.NUTRIMATE_AI_PROXY_URL = "https://your-worker-name.your-subdomain.workers.dev";

// Keep direct key only for local fallback testing.
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// Main logic lives in js/ai.js.
// This template exists so each developer can configure local runtime values safely.