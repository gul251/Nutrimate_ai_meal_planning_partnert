document.addEventListener("DOMContentLoaded", async () => {

  // ================= AUTH SAFE CHECK =================
  const user = await (typeof checkAuth === "function" ? checkAuth(true) : Promise.resolve(true));
  if (!user) console.log("User not logged in (auth skipped)");

  // ================= ELEMENTS =================
  const menuBtn = document.getElementById("menuBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const suggestBtn = document.getElementById("suggestMealsBtn");
  const aiArea = document.getElementById("aiSuggestions");
  const todayMealsEl = document.getElementById("todayMeals");
  const planDateEl = document.getElementById("planDate");

  // Set today's date as default
  if (planDateEl && !planDateEl.value) {
    planDateEl.value = new Date().toISOString().split("T")[0];
  }

  // ================= HAMBURGER MENU =================
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

  // ================= AUTO IMAGE SLIDER =================
  const slides = document.querySelectorAll(".slider img");
  const dots = document.querySelectorAll(".dot");
  let index = 0;

  function showSlide(i) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    if (slides[i]) slides[i].classList.add("active");
    if (dots[i]) dots[i].classList.add("active");
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  if (slides.length > 0) {
    setInterval(nextSlide, 3000);
  }

  // ================= RENDER MEALS =================
  function updateTotals(meals) {
    const totalCals = meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0);
    const totalProt = meals.reduce((s, m) => s + (parseFloat(m.protein) || 0), 0);
    const totalCost = meals.reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
    const el = (id) => document.getElementById(id);
    if (el("totalCals")) el("totalCals").textContent = Math.round(totalCals);
    if (el("totalProtein")) el("totalProtein").textContent = Math.round(totalProt);
    if (el("totalCost")) el("totalCost").textContent = totalCost.toFixed(0);
  }

  async function renderMeals() {
    if (!todayMealsEl) return;
    const date = planDateEl?.value || new Date().toISOString().split("T")[0];
    todayMealsEl.innerHTML = '<p class="loading-inline">Loading meals…</p>';
    try {
      const meals = await getMealPlans(date);
      if (!meals.length) {
        todayMealsEl.innerHTML = '<p class="muted">No meals logged for this day.</p>';
        updateTotals([]);
        return;
      }
      todayMealsEl.innerHTML = meals.map(m => `
        <div class="meal-card">
          <span><strong>${m.mealType || "Meal"}</strong> — ${m.name || "—"}</span>
          <span class="muted">${m.calories || 0} kcal · ${m.protein || 0}g protein · Rs ${m.cost || 0}</span>
          <button class="deleteMealBtn" data-id="${m.id}">✕</button>
        </div>
      `).join("");
      updateTotals(meals);

      todayMealsEl.querySelectorAll(".deleteMealBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
          await deleteMealPlan(btn.dataset.id);
          renderMeals();
        });
      });
    } catch (err) {
      console.error("renderMeals error:", err);
      todayMealsEl.innerHTML = '<p class="muted">Could not load meals.</p>';
    }
  }

  // Load meals on page load and when date changes
  renderMeals();
  if (planDateEl) planDateEl.addEventListener("change", renderMeals);

  // ================= ADD CUSTOM MEAL =================
  document.getElementById("addCustomMealBtn")?.addEventListener("click", async () => {
    const name = document.getElementById("searchMeal")?.value?.trim();
    if (!name) { showMessage("Please enter a meal name", "error"); return; }

    const mealData = {
      name,
      mealType: document.getElementById("mealSlot")?.value || "Meal",
      calories: parseFloat(document.getElementById("mealCalories")?.value) || 0,
      protein: parseFloat(document.getElementById("mealProtein")?.value) || 0,
      cost: parseFloat(document.getElementById("mealCost")?.value) || 0,
      date: planDateEl?.value || new Date().toISOString().split("T")[0]
    };

    try {
      await addMealPlan(mealData);
      // Clear inputs
      ["searchMeal", "mealCalories", "mealProtein", "mealCost"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      renderMeals();
    } catch (err) {
      console.error("Add meal error:", err);
    }
  });

  // ================= CLEAR DAY =================
  document.getElementById("clearDayBtn")?.addEventListener("click", async () => {
    const date = planDateEl?.value || new Date().toISOString().split("T")[0];
    try {
      const meals = await getMealPlans(date);
      await Promise.all(meals.map(m => deleteMealPlan(m.id, true)));
      showMessage("Day cleared", "success");
      renderMeals();
    } catch (err) {
      console.error("Clear day error:", err);
    }
  });

  // ================= CALCULATE GOALS =================
  document.getElementById("calcGoalBtn")?.addEventListener("click", () => {
    const weight = parseFloat(document.getElementById("weight")?.value || 70);
    const activity = document.getElementById("activity")?.value || "moderate";
    const goal = document.getElementById("goalType")?.value || "maintain";

    let multiplier = 1.4;
    if (activity.includes("sedentary")) multiplier = 1.2;
    else if (activity.includes("active")) multiplier = 1.65;

    let calories = weight * 24 * multiplier;
    if (goal.includes("loss")) calories -= 300;
    if (goal.includes("gain")) calories += 300;

    document.getElementById("calTarget").value = Math.round(calories);
    document.getElementById("proteinTarget").value = Math.round(weight * 1.6);
  });

  // ================= SAVE GOALS =================
  document.getElementById("saveGoalsBtn")?.addEventListener("click", async () => {
    await saveGoals({
      calorieTarget: document.getElementById("calTarget")?.value,
      proteinTarget: document.getElementById("proteinTarget")?.value,
      goalType: document.getElementById("goalType")?.value
    });
  });

  // ================= AI + FLASK ML CALL =================
  if (suggestBtn) {
    suggestBtn.addEventListener("click", async () => {
      if (aiArea) aiArea.innerHTML = '<p class="loading-inline">Generating AI meal suggestion…</p>';

      const payload = {
        age: document.getElementById("age")?.value || 25,
        weight: document.getElementById("weight")?.value || 70,
        height: document.getElementById("height")?.value || 170,
        gender: "male",
        goal: document.getElementById("goalType")?.value || "maintain",
        disease: "none",
        activity: document.getElementById("activity")?.value || "moderate"
      };

      try {
        console.log("Sending to Flask:", payload);
        const res = await fetch("/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        console.log("Flask Response:", result);

        if (result.success) {
          aiArea.innerHTML = `
            <div class="ai-card">
              <h3>AI Meal Suggestion</h3>
              <p>🍽 ${result.meal}</p>
              <p class="muted">BMI: ${result.bmi} (${result.bmi_level})</p>
            </div>
          `;
        } else {
          throw new Error(result.error);
        }

      } catch (err) {
        console.log("AI failed → fallback used", err);
        aiArea.innerHTML = `
          <div class="error">
            AI unavailable. Make sure the Flask ML model is running. Try again.
          </div>
        `;
      }
    });
  }

});