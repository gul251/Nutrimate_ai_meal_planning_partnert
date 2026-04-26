// ai.js — Gemini proxy (optional, disabled by default)
// NutriMate now uses local Flask ML model as primary AI.
// This file is kept as a stub so pages load without errors.
// To re-enable Gemini fallback, configure NUTRIMATE_AI_PROXY_URL below.

const NUTRIMATE_AI_PROXY_URL = "";  // set your Cloudflare Worker URL here to enable

async function generateMealPlan(userProfile) {
  // Stub — local model in dashboard.js handles recommendations
  return null;
}
