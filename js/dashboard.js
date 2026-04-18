// ================== NutriMate Dashboard - Firebase Integration ==================
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication - redirect to login if not authenticated
  const user = await checkAuth(true);
  if (!user) return;

  // ---------- MENU BAR ----------
  const menuBtn = document.getElementById("menuBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");

  if (menuBtn && sidebarMenu) {
    const closeSidebar = () => {
      sidebarMenu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    };

    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.addEventListener("click", () => {
      sidebarMenu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", sidebarMenu.classList.contains("open") ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!sidebarMenu.classList.contains("open")) return;
      if (sidebarMenu.contains(event.target) || menuBtn.contains(event.target)) return;
      closeSidebar();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    });
  }

  // ---------- IMAGE SLIDER ----------
  const images = document.querySelectorAll(".slider img");
  const dots = document.querySelectorAll(".dot");
  let current = 0;

  if (images.length > 0 && dots.length === images.length) {
    function nextSlide() {
      images[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (current + 1) % images.length;
      images[current].classList.add("active");
      dots[current].classList.add("active");
    }

    setInterval(nextSlide, 3000);
  }

  // ---------- PROFILE ----------
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loadBtn = document.getElementById("loadBtn");
  const calculateGoalsBtn = document.getElementById("calcGoalBtn");

  if (loginBtn) loginBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";

  function calculateTargets(profileData) {
    const weight = Math.max(35, parseFloat(profileData.weight) || 70);
    const activity = String(profileData.activity || "moderate").toLowerCase();
    const goal = String(profileData.goal || "maintain").toLowerCase();

    let multiplier = 1.4;
    if (activity.includes("sedentary")) multiplier = 1.2;
    else if (activity.includes("light")) multiplier = 1.35;
    else if (activity.includes("active")) multiplier = 1.65;

    let calorieTarget = weight * 24 * multiplier;
    if (goal.includes("loss") || goal.includes("lose")) calorieTarget -= 300;
    if (goal.includes("gain") || goal.includes("muscle")) calorieTarget += 300;

    calorieTarget = Math.max(1200, Math.min(3500, Math.round(calorieTarget)));
    const proteinTarget = Math.max(50, Math.round(weight * 1.6));

    return { calorieTarget, proteinTarget };
  }

  async function loadProfile() {
    try {
      const profile = await getUserProfile();
      if (!profile) return;

      document.getElementById("name").value = profile.name || "";
      document.getElementById("age").value = profile.age || "";
      document.getElementById("height").value = profile.height || "";
      document.getElementById("weight").value = profile.weight || "";
      document.getElementById("activity").value = profile.activity || "sedentary";
      document.getElementById("dietType").value = profile.diet || "omnivore";

      if (profile.goals) {
        const calTarget = document.getElementById("calTarget");
        const proteinTarget = document.getElementById("proteinTarget");
        const goalType = document.getElementById("goalType");
        if (calTarget) calTarget.value = profile.goals.calorieTarget || "";
        if (proteinTarget) proteinTarget.value = profile.goals.proteinTarget || "";
        if (goalType) goalType.value = profile.goals.goalType || profile.goal || "maintain";
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  function updateAiStatusBanner() {
    const statusEl = document.getElementById("aiStatus");
    if (!statusEl) return;

    if (typeof getAiPlannerStatus !== "function") {
      statusEl.className = "ai-status-banner warning";
      statusEl.textContent = "AI planner script not loaded. Local suggestions will still work.";
      return;
    }

    const status = getAiPlannerStatus();
    if (status.mode === "missing_key") {
      statusEl.className = "ai-status-banner warning";
      statusEl.textContent = "AI key not configured. Using local fallback meal plans.";
      return;
    }

    if (status.mode === "fallback_only") {
      statusEl.className = "ai-status-banner warning";
      statusEl.textContent = `AI usage limited right now (${status.requestsUsed}/${status.requestsLimit} today). Local fallback remains available.`;
      return;
    }

    statusEl.className = "ai-status-banner ready";
    statusEl.textContent = `AI ready (${status.requestsUsed}/${status.requestsLimit} used today).`;
  }

  // Auto-load profile on page load
  loadProfile();
  updateAiStatusBanner();
  setInterval(updateAiStatusBanner, 5 * 60 * 1000);
  loadBtn?.addEventListener("click", loadProfile);

  calculateGoalsBtn?.addEventListener("click", async () => {
    try {
      const name = document.getElementById("name")?.value?.trim() || "";
      const age = parseInt(document.getElementById("age")?.value, 10) || 0;
      const height = parseFloat(document.getElementById("height")?.value) || 0;
      const weight = parseFloat(document.getElementById("weight")?.value) || 0;

      if (!name || name.length < 2) {
        showMessage("Enter a valid name (2+ chars)", "error");
        return;
      }
      if (age < 5 || age > 120) {
        showMessage("Age must be 5-120", "error");
        return;
      }
      if (weight <= 0 || weight > 500) {
        showMessage("Weight must be 1-500 kg", "error");
        return;
      }
      if (height <= 0 || height > 300) {
        showMessage("Height must be 1-300 cm", "error");
        return;
      }

      const profileData = {
        name,
        age,
        height,
        weight,
        activity: document.getElementById("activity")?.value || "moderate",
        diet: document.getElementById("dietType")?.value || "omnivore",
        goal: document.getElementById("goalType")?.value || "maintain"
      };

      const targets = calculateTargets(profileData);
      const calTarget = document.getElementById("calTarget");
      const proteinTarget = document.getElementById("proteinTarget");
      if (calTarget) calTarget.value = String(targets.calorieTarget);
      if (proteinTarget) proteinTarget.value = String(targets.proteinTarget);

      await updateUserProfile({
        ...profileData,
        goals: {
          calorieTarget: targets.calorieTarget,
          proteinTarget: targets.proteinTarget,
          goalType: profileData.goal
        }
      });
    } catch (error) {
      console.error("Error calculating goals:", error);
      showMessage("Failed to calculate goals. Check profile data.", "error");
    }
  });

  // ---------- DAILY PLANNER ----------
  const planDate = document.getElementById("planDate");
  const mealSlot = document.getElementById("mealSlot");
  const addMealBtn = document.getElementById("addCustomMealBtn");
  const mealNameInput = document.getElementById("searchMeal");
  const mealCaloriesInput = document.getElementById("mealCalories");
  const mealProteinInput = document.getElementById("mealProtein");
  const mealCostInput = document.getElementById("mealCost");
  const mealsArea = document.getElementById("todayMeals");
  const totalCals = document.getElementById("totalCals");
  const totalProtein = document.getElementById("totalProtein");
  const totalCost = document.getElementById("totalCost");

  let currentEditingMealId = null;

  function escapeHTML(value) {
    const raw = String(value ?? "");
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function validateMealInputs() {
    const name = mealNameInput?.value?.trim() || "";
    const calories = parseInt(mealCaloriesInput?.value, 10) || 0;
    const protein = parseInt(mealProteinInput?.value, 10) || 0;
    const cost = parseFloat(mealCostInput?.value) || 0;

    if (!name) {
      showMessage("Meal name is required", "error");
      return null;
    }
    if (name.length > 100) {
      showMessage("Meal name too long (max 100 chars)", "error");
      return null;
    }
    if (calories < 0 || calories > 5000) {
      showMessage("Calories must be 0-5000", "error");
      return null;
    }
    if (protein < 0 || protein > 500) {
      showMessage("Protein must be 0-500g", "error");
      return null;
    }
    if (cost < 0 || cost > 10000) {
      showMessage("Cost must be Rs 0-10000", "error");
      return null;
    }

    return { name, calories, protein, cost };
  }

  function clearMealForm() {
    if (mealNameInput) mealNameInput.value = "";
    if (mealCaloriesInput) mealCaloriesInput.value = "";
    if (mealProteinInput) mealProteinInput.value = "";
    if (mealCostInput) mealCostInput.value = "";
    currentEditingMealId = null;
    const addBtn = document.getElementById("addCustomMealBtn");
    if (addBtn) addBtn.textContent = "Add";
  }

  function beginEditMeal(mealId, mealData) {
    currentEditingMealId = mealId;
    if (mealNameInput) mealNameInput.value = mealData.name || "";
    if (mealCaloriesInput) mealCaloriesInput.value = mealData.calories || 0;
    if (mealProteinInput) mealProteinInput.value = mealData.protein || 0;
    if (mealCostInput) mealCostInput.value = mealData.cost || 0;
    if (mealSlot) mealSlot.value = mealData.mealType || "custom";
    const addBtn = document.getElementById("addCustomMealBtn");
    if (addBtn) addBtn.textContent = "Update";
    mealNameInput?.focus();
  }

  if (planDate && !planDate.value) {
    planDate.value = new Date().toISOString().split("T")[0];
  }

  function updateTotals(meals) {
    const calories = meals.reduce((sum, meal) => sum + (parseInt(meal.calories, 10) || 0), 0);
    const protein = meals.reduce((sum, meal) => sum + (parseInt(meal.protein, 10) || 0), 0);
    const cost = meals.reduce((sum, meal) => sum + (parseFloat(meal.cost) || 0), 0);

    if (totalCals) totalCals.textContent = String(calories);
    if (totalProtein) totalProtein.textContent = String(protein);
    if (totalCost) totalCost.textContent = String(Math.round(cost));
  }

  async function fetchMeals() {
    if (!mealsArea) return;

    try {
      const selectedDate = planDate?.value || null;
      const meals = await getMealPlans(selectedDate);
      mealsArea.innerHTML = "";

      if (meals.length === 0) {
        mealsArea.innerHTML = "<p>No meals added for this date yet.</p>";
        updateTotals([]);
        return;
      }

      meals.forEach((meal) => {
        const div = document.createElement("div");
        div.classList.add("meal-card");
        const safeName = escapeHTML(meal.name || "Unnamed Meal");
        const safeType = escapeHTML(meal.mealType || "custom");
        const safeDate = escapeHTML(meal.date || "No date");
        const safeCost = Number.isFinite(parseFloat(meal.cost)) ? Math.round(parseFloat(meal.cost)) : 0;
        div.innerHTML = `
          <strong>${safeName}</strong>
          <span>(${safeType})</span> |
          Cal: ${meal.calories || 0} |
          Protein: ${meal.protein || 0}g |
          Cost: Rs ${safeCost} |
          ${safeDate}
          <button class="editMealBtn" data-id="${meal.id}">Edit</button>
          <button class="deleteMealBtn" data-id="${meal.id}">Delete</button>
        `;
        mealsArea.appendChild(div);
      });

      updateTotals(meals);

      mealsArea.querySelectorAll(".editMealBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (!id) return;
          const mealData = meals.find(m => m.id === id);
          if (mealData) {
            beginEditMeal(id, mealData);
          }
        });
      });

      mealsArea.querySelectorAll(".deleteMealBtn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (!id) return;
          if (confirm("Delete this meal?")) {
            await deleteMealPlan(id);
            await fetchMeals();
          }
        });
      });
    } catch (error) {
      console.error("Error fetching meals:", error);
      mealsArea.innerHTML = "<p>Error loading meals.</p>";
      updateTotals([]);
    }
  }

  planDate?.addEventListener("change", fetchMeals);

  addMealBtn?.addEventListener("click", async () => {
    const validated = validateMealInputs();
    if (!validated) return;

    const { name, calories, protein, cost } = validated;
    const mealData = {
      name,
      calories,
      protein,
      cost,
      date: planDate?.value || new Date().toISOString().split("T")[0],
      mealType: mealSlot?.value || "custom"
    };

    try {
      if (currentEditingMealId) {
        await updateMealPlan(currentEditingMealId, mealData);
        clearMealForm();
      } else {
        await addMealPlan(mealData);
        clearMealForm();
      }
      await fetchMeals();
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  });

  await fetchMeals();

  // ---------- GOALS ----------
  const saveGoalsBtn = document.getElementById("saveGoalsBtn");
  saveGoalsBtn?.addEventListener("click", async () => {
    try {
      const calTarget = parseInt(document.getElementById("calTarget")?.value, 10) || 0;
      const proteinTarget = parseInt(document.getElementById("proteinTarget")?.value, 10) || 0;

      if (calTarget < 800 || calTarget > 5000) {
        showMessage("Calorie target must be 800-5000", "error");
        return;
      }
      if (proteinTarget < 20 || proteinTarget > 500) {
        showMessage("Protein target must be 20-500g", "error");
        return;
      }

      const goals = {
        calorieTarget: calTarget,
        proteinTarget,
        goalType: document.getElementById("goalType")?.value || "maintain"
      };
      await saveGoals(goals);
    } catch (error) {
      console.error("Error saving goals:", error);
      showMessage("Failed to save goals. Check values.", "error");
    }
  });

  // ---------- DAY PLANS ----------
  const clearDayBtn = document.getElementById("clearDayBtn");
  clearDayBtn?.addEventListener("click", async () => {
    const selectedDate = planDate?.value || new Date().toISOString().split("T")[0];
    if (confirm(`Clear all meals for ${selectedDate}?`)) {
      const meals = await getMealPlans(selectedDate);
      for (const meal of meals) {
        await deleteMealPlan(meal.id, true);
      }
      await fetchMeals();
      showMessage("Day cleared!", "success");
    }
  });

  // ---------- GROCERY ----------
  const generateGrocery = document.getElementById("generateGrocery");
  const clearGrocery = document.getElementById("clearGrocery");
  generateGrocery?.addEventListener("click", () => {
    showMessage("Grocery list generation coming soon!", "info");
  });
  clearGrocery?.addEventListener("click", () => {
    showMessage("Grocery list cleared", "info");
  });

  // ---------- PROGRESS ----------
  const saveWeight = document.getElementById("saveWeight");
  const recordWeight = document.getElementById("recordWeight");

  saveWeight?.addEventListener("click", async () => {
    const weight = parseFloat(recordWeight?.value || "");
    const date = new Date().toISOString().split("T")[0];

    if (!Number.isFinite(weight) || weight <= 0) {
      showMessage("Enter a valid positive weight", "error");
      return;
    }

    try {
      await addWeightLog(weight, date);
      if (recordWeight) recordWeight.value = "";
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  });

  // ---------- AI SUGGESTIONS ----------
  const suggestMealsBtn = document.getElementById("suggestMealsBtn");
  suggestMealsBtn?.addEventListener("click", async () => {
    const aiArea = document.getElementById("aiSuggestions");

    if (!aiArea) {
      showMessage("Display area not found", "error");
      return;
    }

    if (typeof generateMealPlan !== "function" || typeof displayMealPlan !== "function") {
      showMessage("AI module is unavailable right now. Please refresh and try again.", "error");
      return;
    }

    aiArea.innerHTML = "<p>Generating AI meal plan... Please wait...</p>";
    updateAiStatusBanner();
    suggestMealsBtn.disabled = true;
    suggestMealsBtn.textContent = "Generating...";

    try {
      let profile = await getUserProfile();

      if (!profile) {
        // Fallback: use current form fields if profile doc is missing.
        const fallbackProfile = {
          name: document.getElementById("name")?.value?.trim() || "",
          age: parseInt(document.getElementById("age")?.value, 10) || 0,
          height: parseFloat(document.getElementById("height")?.value) || 0,
          weight: parseFloat(document.getElementById("weight")?.value) || 0,
          activity: document.getElementById("activity")?.value || "moderate",
          diet: document.getElementById("dietType")?.value || "omnivore",
          goal: document.getElementById("goalType")?.value || "maintain",
          foodTypes: []
        };

        if (!fallbackProfile.name || fallbackProfile.weight <= 0) {
          showMessage("Please complete your profile first", "error");
          aiArea.innerHTML = "<p>Please fill out your profile information to get personalized meal suggestions.</p>";
          return;
        }

        await updateUserProfile(fallbackProfile);
        profile = fallbackProfile;
      }

      const mealPlan = await generateMealPlan(profile);
      if (!mealPlan) {
        aiArea.innerHTML = "<p>Unable to generate a meal plan. Check your AI API key and try again.</p>";
        return;
      }

      displayMealPlan(aiArea.id, mealPlan);
      const meta = typeof getLastMealPlanMeta === "function" ? getLastMealPlanMeta() : null;
      if (meta?.source === "ai") {
        showMessage("AI meal plan generated!", "success");
      } else if (meta?.source === "cache") {
        showMessage("Showing your cached plan for today.", "info");
      } else {
        showMessage("Using local fallback meal plan.", "info");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      aiArea.innerHTML = "<p>Failed to generate meal plan. Please check your API key in js/ai.js</p>";
    } finally {
      suggestMealsBtn.disabled = false;
      suggestMealsBtn.textContent = "Suggest Meals";
      updateAiStatusBanner();
    }
  });

  // ---------- LOGOUT ----------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await logout();
    });
  }

  const sidebarLogout = document.getElementById("sidebarLogout");
  if (sidebarLogout) {
    sidebarLogout.addEventListener("click", async (event) => {
      event.preventDefault();
      await logout();
    });
  }
});
