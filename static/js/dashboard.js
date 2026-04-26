document.addEventListener("DOMContentLoaded", async () => {

  const user = await (typeof checkAuth === "function" ? checkAuth(true) : Promise.resolve(true));
  if (!user) console.log("User not logged in");

  const menuBtn      = document.getElementById("menuBtn");
  const sidebarMenu  = document.getElementById("sidebarMenu");
  const suggestBtn   = document.getElementById("suggestMealsBtn");
  const aiArea       = document.getElementById("aiSuggestions");
  const todayMealsEl = document.getElementById("todayMeals");
  const planDateEl   = document.getElementById("planDate");

  // Default date to today
  if (planDateEl && !planDateEl.value) {
    planDateEl.value = new Date().toISOString().split("T")[0];
  }

  // ===== HAMBURGER =====
  if (menuBtn && sidebarMenu) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebarMenu.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!sidebarMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebarMenu.classList.remove("open");
      }
    });
  }

  // ===== IMAGE SLIDER =====
  const slides = document.querySelectorAll(".slider img");
  const dots   = document.querySelectorAll(".dot");
  let index = 0;

  function showSlide(i) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    if (slides[i]) slides[i].classList.add("active");
    if (dots[i])   dots[i].classList.add("active");
  }

  if (slides.length > 0) setInterval(() => { index = (index + 1) % slides.length; showSlide(index); }, 3500);

  // ===== RENDER MEALS =====
  function updateTotals(meals) {
    const cal  = meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0);
    const prot = meals.reduce((s, m) => s + (parseFloat(m.protein)  || 0), 0);
    const cost = meals.reduce((s, m) => s + (parseFloat(m.cost)     || 0), 0);
    const el = id => document.getElementById(id);
    if (el("totalCals"))    el("totalCals").textContent    = Math.round(cal);
    if (el("totalProtein")) el("totalProtein").textContent = Math.round(prot);
    if (el("totalCost"))    el("totalCost").textContent    = cost.toFixed(0);
  }

  async function renderMeals() {
    if (!todayMealsEl) return;
    const date = planDateEl?.value || new Date().toISOString().split("T")[0];
    todayMealsEl.innerHTML = \'<p class="loading-inline">Loading meals…</p>\';
    try {
      const meals = await getMealPlans(date);
      if (!meals.length) {
        todayMealsEl.innerHTML = \'<div class="no-meals"><i class="fa-solid fa-plate-wheat"></i><p>No meals logged yet. Add one above!</p></div>\';
        updateTotals([]);
        return;
      }
      todayMealsEl.innerHTML = meals.map(m => `
        <div class="meal-card">
          <div class="meal-card-info">
            <div class="meal-card-name">${m.name || "—"}</div>
            <span class="meal-card-slot">${m.mealType || "Meal"}</span>
          </div>
          <div class="meal-card-stats">
            <span class="meal-stat"><i class="fa-solid fa-fire"></i>${m.calories || 0} kcal</span>
            <span class="meal-stat"><i class="fa-solid fa-dumbbell"></i>${m.protein || 0}g</span>
            <span class="meal-stat"><i class="fa-solid fa-tag"></i>Rs ${m.cost || 0}</span>
          </div>
          <button class="deleteMealBtn" data-id="${m.id}" title="Remove meal"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `).join("");
      updateTotals(meals);
      todayMealsEl.querySelectorAll(".deleteMealBtn").forEach(btn => {
        btn.addEventListener("click", async () => { await deleteMealPlan(btn.dataset.id); renderMeals(); });
      });
    } catch (err) {
      todayMealsEl.innerHTML = \'<p class="no-meals">Could not load meals. Check your connection.</p>\';
    }
  }

  renderMeals();
  if (planDateEl) planDateEl.addEventListener("change", renderMeals);

  // ===== ADD MEAL =====
  document.getElementById("addCustomMealBtn")?.addEventListener("click", async () => {
    const name = document.getElementById("searchMeal")?.value?.trim();
    if (!name) { showMessage("Please enter a meal name", "error"); return; }

    await addMealPlan({
      name,
      mealType: document.getElementById("mealSlot")?.value  || "Meal",
      calories: parseFloat(document.getElementById("mealCalories")?.value) || 0,
      protein:  parseFloat(document.getElementById("mealProtein")?.value)  || 0,
      cost:     parseFloat(document.getElementById("mealCost")?.value)     || 0,
      date:     planDateEl?.value || new Date().toISOString().split("T")[0]
    });

    ["searchMeal","mealCalories","mealProtein","mealCost"].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    renderMeals();
  });

  // ===== CLEAR DAY =====
  document.getElementById("clearDayBtn")?.addEventListener("click", async () => {
    const date  = planDateEl?.value || new Date().toISOString().split("T")[0];
    const meals = await getMealPlans(date);
    await Promise.all(meals.map(m => deleteMealPlan(m.id, true)));
    showMessage("Day cleared", "success");
    renderMeals();
  });

  // ===== CALCULATE GOALS =====
  document.getElementById("calcGoalBtn")?.addEventListener("click", () => {
    const weight   = parseFloat(document.getElementById("weight")?.value   || 70);
    const activity = document.getElementById("activity")?.value || "moderate";
    const goal     = document.getElementById("goalType")?.value || "maintain";

    let mult = 1.4;
    if (activity === "sedentary") mult = 1.2;
    else if (activity === "active") mult = 1.65;

    let calories = weight * 24 * mult;
    if (goal === "loss") calories -= 300;
    if (goal === "gain") calories += 300;

    document.getElementById("calTarget").value     = Math.round(calories);
    document.getElementById("proteinTarget").value = Math.round(weight * 1.6);
  });

  // ===== SAVE GOALS =====
  document.getElementById("saveGoalsBtn")?.addEventListener("click", async () => {
    await saveGoals({
      calorieTarget:  document.getElementById("calTarget")?.value,
      proteinTarget:  document.getElementById("proteinTarget")?.value,
      goalType:       document.getElementById("goalType")?.value
    });
  });

  // ===== AI SUGGEST =====
  if (suggestBtn) {
    suggestBtn.addEventListener("click", async () => {
      aiArea.innerHTML = \'<p class="loading-inline"><i class="fa-solid fa-spinner fa-spin"></i> Generating your meal plan…</p>\';

      const payload = {
        age:      document.getElementById("age")?.value      || 25,
        weight:   document.getElementById("weight")?.value   || 70,
        height:   document.getElementById("height")?.value   || 170,
        gender:   "male",
        goal:     document.getElementById("goalType")?.value || "maintain",
        disease:  "none",
        activity: document.getElementById("activity")?.value || "moderate"
      };

      try {
        const res    = await fetch("/predict", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        const result = await res.json();

        if (result.success) {
          aiArea.innerHTML = `
            <div class="ai-result">
              <h3><i class="fa-solid fa-wand-magic-sparkles"></i> AI Meal Suggestion</h3>
              <p>🍽 ${result.meal}</p>
              <span class="ai-bmi">BMI: ${result.bmi} — ${result.bmi_level}</span>
            </div>`;
        } else throw new Error(result.error);

      } catch (err) {
        aiArea.innerHTML = \'<div class="ai-error"><i class="fa-solid fa-triangle-exclamation"></i> AI unavailable. Make sure the Flask model is running.</div>\';
      }
    });
  }

});