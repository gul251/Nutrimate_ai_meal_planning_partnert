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
  const loadBtn = document.getElementById("loadBtn");
  const saveProfileBtn = document.getElementById("calcGoalBtn");

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
        if (calTarget) calTarget.value = profile.goals.calorieTarget || "";
        if (proteinTarget) proteinTarget.value = profile.goals.proteinTarget || "";
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  // Auto-load profile on page load
  loadProfile();
  loadBtn?.addEventListener("click", loadProfile);

  saveProfileBtn?.addEventListener("click", async () => {
    try {
      const profileData = {
        name: document.getElementById("name").value.trim(),
        age: parseInt(document.getElementById("age").value, 10) || 0,
        height: parseFloat(document.getElementById("height").value) || 0,
        weight: parseFloat(document.getElementById("weight").value) || 0,
        activity: document.getElementById("activity").value,
        diet: document.getElementById("dietType").value,
        goal: document.getElementById("goalType")?.value || "maintain"
      };

      await updateUserProfile(profileData);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  });

  // ---------- DAILY PLANNER ----------
  const planDate = document.getElementById("planDate");
  const mealSlot = document.getElementById("mealSlot");
  const addMealBtn = document.getElementById("addCustomMealBtn");
  const mealNameInput = document.getElementById("searchMeal");
  const mealsArea = document.getElementById("todayMeals");
  const totalCals = document.getElementById("totalCals");
  const totalProtein = document.getElementById("totalProtein");
  const totalCost = document.getElementById("totalCost");

  function escapeHTML(value) {
    const raw = String(value ?? "");
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
        div.innerHTML = `
          <strong>${safeName}</strong>
          <span>(${safeType})</span> |
          Cal: ${meal.calories || 0} |
          Protein: ${meal.protein || 0}g |
          ${safeDate}
          <button class="deleteMealBtn" data-id="${meal.id}">Delete</button>
        `;
        mealsArea.appendChild(div);
      });

      updateTotals(meals);

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
    const name = mealNameInput?.value?.trim();

    if (!name) {
      showMessage("Meal name required", "error");
      return;
    }

    const mealData = {
      name,
      calories: 0,
      protein: 0,
      date: planDate?.value || new Date().toISOString().split("T")[0],
      mealType: mealSlot?.value || "custom"
    };

    try {
      await addMealPlan(mealData);
      if (mealNameInput) mealNameInput.value = "";
      await fetchMeals();
      showMessage("Meal added successfully!", "success");
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  });

  await fetchMeals();

  // ---------- GOALS ----------
  const saveGoalsBtn = document.getElementById("saveGoalsBtn");
  saveGoalsBtn?.addEventListener("click", async () => {
    try {
      const goals = {
        calorieTarget: parseInt(document.getElementById("calTarget")?.value, 10) || 0,
        proteinTarget: parseInt(document.getElementById("proteinTarget")?.value, 10) || 0,
        goalType: document.getElementById("goalType")?.value || "maintain"
      };
      await saveGoals(goals);
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  });

  // ---------- DAY PLANS ----------
  const clearDayBtn = document.getElementById("clearDayBtn");
  clearDayBtn?.addEventListener("click", async () => {
    const selectedDate = planDate?.value || new Date().toISOString().split("T")[0];
    if (confirm(`Clear all meals for ${selectedDate}?`)) {
      const meals = await getMealPlans(selectedDate);
      for (const meal of meals) {
        await deleteMealPlan(meal.id);
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
    const weight = recordWeight?.value;
    const date = new Date().toISOString().split("T")[0];
    if (weight) {
      try {
        await addWeightLog(weight, date);
      } catch (error) {
        console.error("Error saving weight:", error);
      }
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

        if (!fallbackProfile.name && !fallbackProfile.weight) {
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
      showMessage("AI meal plan generated!", "success");
    } catch (error) {
      console.error("AI generation error:", error);
      aiArea.innerHTML = "<p>Failed to generate meal plan. Please check your API key in js/ai.js</p>";
    } finally {
      suggestMealsBtn.disabled = false;
      suggestMealsBtn.textContent = "Suggest Meals";
    }
  });

  // ---------- LOGOUT ----------
  const logoutBtn = document.getElementById("logoutBtn");
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
