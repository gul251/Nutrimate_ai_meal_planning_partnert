// NutriMate AI Proxy (Cloudflare Worker)
// Deploy this worker and set GEMINI_API_KEY as a Worker secret.
// Optional: set ALLOWED_ORIGIN to your frontend domain (e.g. https://your-app.web.app)

const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash"
];

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(env)
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, env);
    }

    try {
      const body = await request.json();
      const profile = body?.profile || {};
      const prompt = createPrompt(profile);

      if (!env.GEMINI_API_KEY) {
        return json({ error: "Missing GEMINI_API_KEY secret" }, 500, env);
      }

      let lastError = "No meal plan generated";
      for (const model of GEMINI_MODELS) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        const apiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        });

        if (!apiResponse.ok) {
          let errorText = `Gemini request failed (${apiResponse.status})`;
          try {
            const errorBody = await apiResponse.json();
            errorText = errorBody?.error?.message || errorText;
          } catch (_error) {
            // Keep default error text when response is not JSON.
          }

          if (apiResponse.status === 404 || /not found|not supported/i.test(errorText)) {
            lastError = errorText;
            continue;
          }

          return json({ error: errorText }, apiResponse.status, env);
        }

        const data = await apiResponse.json();
        const mealPlan = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (mealPlan) {
          return json({
            mealPlan,
            provider: "gemini",
            model
          }, 200, env);
        }
      }

      return json({ error: lastError }, 502, env);
    } catch (error) {
      return json({ error: error?.message || "Unexpected proxy error" }, 500, env);
    }
  }
};

function createPrompt(profile) {
  const weight = Number(profile?.weight || 0);
  const goal = String(profile?.goal || "Maintain weight");
  const activity = String(profile?.activity || "Moderate");
  const diet = String(profile?.diet || "Balanced");
  const foodTypes = Array.isArray(profile?.foodTypes) ? profile.foodTypes.join(", ") : "No specific preference";

  return `Create a personalized daily meal plan for a person with these details:\n- Current Weight: ${weight} kg\n- Goal: ${goal}\n- Food Preferences: ${foodTypes}\n- Activity Level: ${activity}\n- Diet Type: ${diet}\n\nPlease provide:\n1. Breakfast with approximate calories\n2. Lunch with approximate calories\n3. Dinner with approximate calories\n4. Snacks (2) with approximate calories\n\nFormat each meal clearly with dish name and calories. Keep it simple, healthy, and realistic.`;
}

function corsHeaders(env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(payload, status, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env)
    }
  });
}
