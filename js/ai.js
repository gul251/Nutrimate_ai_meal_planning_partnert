// Google Gemini AI Integration for NutriMate
// =====================================================
// Generates personalized meal plans using AI
// Get your FREE API key: https://aistudio.google.com/app/apikey
// =====================================================

// API Configuration
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Replace with your actual API key
const GEMINI_MODEL = "gemini-1.5-flash"; // Free and fast model
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generate AI meal plan based on user profile
 * @param {object} userProfile - User's profile data {weight, goal, foodTypes, activity}
 * @returns {Promise<string>} AI-generated meal plan
 */
async function generateMealPlan(userProfile = {}) {
  try {
    // Validate API key
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("Please add your Gemini API key in js/ai.js");
    }

    // Get current user profile if not provided
    let profile = userProfile;
    if (!profile.weight || !profile.goal) {
      profile = await getUserProfile();
      if (!profile) {
        throw new Error("No user profile found. Please complete your profile first.");
      }
    }

    // Build context-aware prompt
    const prompt = createMealPlanPrompt(profile);

    console.log("🤖 Sending request to Gemini AI...");

    // Call Gemini API
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    
    // Extract AI response
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error("No response from AI");
    }

    console.log("✅ AI meal plan generated successfully");
    return aiText;

  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    
    if (error.message.includes("API key")) {
      showMessage("AI API key not configured. Check js/ai.js", "error");
    } else if (error.message.includes("quota")) {
      showMessage("API quota exceeded. Try again later.", "error");
    } else {
      showMessage("Failed to generate meal plan: " + error.message, "error");
    }
    
    throw error;
  }
}

/**
 * Create a detailed prompt for Gemini based on user profile
 * @param {object} profile - User profile data
 * @returns {string} Formatted prompt
 */
function createMealPlanPrompt(profile) {
  const weight = profile.weight || 70;
  const goal = profile.goal || "Maintain Weight";
  const foodTypes = profile.foodTypes || [];
  const activity = profile.activity || "Moderate";
  const diet = profile.diet || "";

  // Determine dietary restrictions
  let dietaryRestrictions = "";
  if (foodTypes.length > 0) {
    dietaryRestrictions = `The user prefers: ${foodTypes.join(", ")} food.`;
  } else if (diet) {
    dietaryRestrictions = `The user follows a ${diet} diet.`;
  }

  const prompt = `You are a professional nutritionist and meal planning expert. Generate a healthy, balanced 1-day meal plan for a user with the following profile:

- Current Weight: ${weight} kg
- Goal: ${goal}
- Activity Level: ${activity}
${dietaryRestrictions ? `- Dietary Preferences: ${dietaryRestrictions}` : ""}

Please provide:
1. **Breakfast** - A nutritious morning meal with approximate calories
2. **Lunch** - A balanced midday meal with approximate calories
3. **Dinner** - A healthy evening meal with approximate calories
4. **Snacks** (optional) - 1-2 healthy snack suggestions

Format your response clearly with meal names, brief descriptions, and estimated calories for each meal. Keep it simple and practical with easily available ingredients.`;

  return prompt;
}

/**
 * Generate quick meal suggestions for a specific meal type
 * @param {string} mealType - "breakfast", "lunch", "dinner", or "snack"
 * @param {object} userProfile - Optional user profile
 * @returns {Promise<string>} AI-generated suggestions
 */
async function generateQuickSuggestion(mealType = "breakfast", userProfile = {}) {
  try {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("Please add your Gemini API key in js/ai.js");
    }

    let profile = userProfile;
    if (!profile.weight) {
      profile = await getUserProfile() || {};
    }

    const goal = profile.goal || "Maintain Weight";
    const foodTypes = profile.foodTypes || [];
    const dietary = foodTypes.length > 0 ? foodTypes.join(", ") : "any";

    const prompt = `Suggest 3 quick and healthy ${mealType} options for someone with goal: ${goal}, dietary preference: ${dietary}. 
    
Format as:
1. [Meal Name] - [Brief description] (~[calories] cal)
2. [Meal Name] - [Brief description] (~[calories] cal)
3. [Meal Name] - [Brief description] (~[calories] cal)

Keep it concise and practical.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("No response from AI");
    }

    return aiText;

  } catch (error) {
    console.error("❌ Quick Suggestion Error:", error);
    showMessage("Failed to generate suggestions", "error");
    throw error;
  }
}

/**
 * Get nutritional analysis for a meal
 * @param {string} mealName - Name/description of the meal
 * @returns {Promise<object>} Nutritional breakdown {calories, protein, carbs, fats}
 */
async function analyzeMealNutrition(mealName) {
  try {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("Please add your Gemini API key in js/ai.js");
    }

    const prompt = `Provide a nutritional estimate for: "${mealName}"

Return ONLY in this exact JSON format:
{
  "calories": <number>,
  "protein": <grams>,
  "carbs": <grams>,
  "fats": <grams>
}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        }
      })
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Try to parse JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const nutrition = JSON.parse(jsonMatch[0]);
      return nutrition;
    }

    throw new Error("Could not parse nutrition data");

  } catch (error) {
    console.error("❌ Nutrition Analysis Error:", error);
    // Return default values on error
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };
  }
}

/**
 * Display AI-generated meal plan in a specific element
 * @param {string} elementId - ID of element to display in
 * @param {string} mealPlan - AI-generated text
 */
function displayMealPlan(elementId, mealPlan) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  // Format the meal plan for better display
  const formattedPlan = mealPlan
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\n/g, '<br>'); // Line breaks

  element.innerHTML = `<div class="ai-meal-plan">${formattedPlan}</div>`;
}

console.log("✅ AI.js loaded successfully");
