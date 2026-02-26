// Google Gemini AI Integration Template
// =====================================================
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to "ai.js"
// 2. Go to https://aistudio.google.com/app/apikey
// 3. Click "Get API Key" (it's FREE!)
// 4. Create API key in new project
// 5. Copy and paste your API key below
// 6. See FIREBASE_SETUP.md for detailed instructions
// =====================================================

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Generate a full day meal plan based on user profile
 * @param {Object} userProfile - User's profile with weight, goal, foodTypes, etc.
 * @returns {Promise<string>} - Generated meal plan
 */
async function generateMealPlan(userProfile) {
  if (!userProfile) {
    showMessage("Please complete your profile first", "error");
    return null;
  }

  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    showMessage("Please configure your Gemini API key in js/ai.js", "error");
    return null;
  }

  try {
    const prompt = createMealPlanPrompt(userProfile);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    const mealPlan = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!mealPlan) {
      throw new Error("No meal plan generated");
    }

    return mealPlan;

  } catch (error) {
    console.error("Error generating meal plan:", error);
    showMessage("Failed to generate meal plan. Check API key or try again.", "error");
    return null;
  }
}

/**
 * Create a personalized prompt for meal planning
 * @param {Object} profile - User profile
 * @returns {string} - Formatted prompt
 */
function createMealPlanPrompt(profile) {
  const { weight, goal, foodTypes, activity, diet } = profile;
  
  const foodPreference = foodTypes?.join(", ") || "No specific preference";
  const activityLevel = activity || "Moderate";
  const dietType = diet || "Balanced";
  const goalDescription = goal || "Maintain weight";

  return `Create a personalized daily meal plan for a person with these details:
- Current Weight: ${weight} kg
- Goal: ${goalDescription}
- Food Preferences: ${foodPreference}
- Activity Level: ${activityLevel}
- Diet Type: ${dietType}

Please provide:
1. **Breakfast** with approximate calories
2. **Lunch** with approximate calories
3. **Dinner** with approximate calories
4. **Snacks (2)** with approximate calories

Format each meal clearly with dish name and calories. Keep it simple, healthy, and realistic.`;
}

/**
 * Generate a quick meal suggestion for specific meal type
 * @param {string} mealType - breakfast, lunch, dinner, or snack
 * @param {Object} userProfile - User's profile
 * @returns {Promise<string>} - Meal suggestion
 */
async function generateQuickSuggestion(mealType, userProfile) {
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    showMessage("Please configure your Gemini API key in js/ai.js", "error");
    return null;
  }

  const foodPreference = userProfile?.foodTypes?.join(", ") || "Any";
  
  const prompt = `Suggest a quick and healthy ${mealType} for someone who prefers ${foodPreference} food. 
Include the dish name and approximate calories. Keep it brief and realistic.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text;

  } catch (error) {
    console.error("Error generating quick suggestion:", error);
    return null;
  }
}

/**
 * Analyze nutritional content of a meal
 * @param {string} mealName - Name of the meal
 * @returns {Promise<Object>} - Nutritional breakdown
 */
async function analyzeMealNutrition(mealName) {
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    showMessage("Please configure your Gemini API key in js/ai.js", "error");
    return null;
  }

  const prompt = `Provide nutritional breakdown for: ${mealName}
Format:
Calories: X kcal
Protein: X g
Carbs: X g
Fats: X g

Be concise and accurate.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 150
        }
      })
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const nutritionText = data.candidates[0]?.content?.parts[0]?.text;
    
    // Parse the response into an object
    const lines = nutritionText.split("\n");
    const nutrition = {};
    
    lines.forEach(line => {
      if (line.includes("Calories:")) {
        nutrition.calories = parseInt(line.match(/\d+/)[0]);
      } else if (line.includes("Protein:")) {
        nutrition.protein = parseInt(line.match(/\d+/)[0]);
      } else if (line.includes("Carbs:")) {
        nutrition.carbs = parseInt(line.match(/\d+/)[0]);
      } else if (line.includes("Fats:")) {
        nutrition.fats = parseInt(line.match(/\d+/)[0]);
      }
    });

    return nutrition;

  } catch (error) {
    console.error("Error analyzing nutrition:", error);
    return null;
  }
}

/**
 * Display meal plan in a formatted way
 * @param {string} elementId - ID of element to display in
 * @param {string} mealPlan - Generated meal plan text
 */
function displayMealPlan(elementId, mealPlan) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Format the meal plan with better styling
  const formattedPlan = mealPlan
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  element.innerHTML = `<div class="meal-plan-content">${formattedPlan}</div>`;
}
