/* =========================================
   NutriMate Dashboard JS — FINAL FIXED
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {

  // =========================================
  // AUTH CHECK
  // =========================================
  if (typeof checkAuth === "function") {
    try {
      await checkAuth(true);
    } catch (e) {
      console.log(e);
    }
  }

  // =========================================
  // ELEMENTS
  // =========================================
  const todayMealsEl = document.getElementById("todayMeals");
  const planDateEl = document.getElementById("planDate");
  const aiArea = document.getElementById("aiSuggestions");

  // Default Date
  if (planDateEl && !planDateEl.value) {
    planDateEl.value = new Date().toISOString().split("T")[0];
  }

  // ── IMAGE SLIDER ─────────────────────────────────────────
  const slides = document.querySelectorAll(".slider img");
  const dots   = document.querySelectorAll(".dot");
  let idx = 0;

  function showSlide(i) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d   => d.classList.remove("active"));
    if (slides[i]) slides[i].classList.add("active");
    if (dots[i])   dots[i].classList.add("active");
  }

  if (slides.length > 1) {
    setInterval(() => { idx = (idx + 1) % slides.length; showSlide(idx); }, 3500);
    dots.forEach((d, i) => d.addEventListener("click", () => { idx = i; showSlide(idx); }));
  }


  // =========================================
  // UPDATE TOTALS
  // =========================================
  function updateTotals(meals = []) {

    const sum = (key) =>
      meals.reduce((t, m) => t + (parseFloat(m[key]) || 0), 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("totalCals", Math.round(sum("calories")));
    set("totalProtein", Math.round(sum("protein")));
    set("totalCost", Math.round(sum("cost")));
  }

  // =========================================
  // RENDER MEALS
  // =========================================
  async function renderMeals() {

    if (!todayMealsEl) return;

    const date =
      planDateEl?.value ||
      new Date().toISOString().split("T")[0];

    todayMealsEl.innerHTML = `<p>Loading meals...</p>`;

    try {

      const res = await fetch(`/get_meals?date=${date}`);
      const meals = await res.json();

      if (!Array.isArray(meals) || meals.length === 0) {

        todayMealsEl.innerHTML = `
          <p>No meals found</p>
        `;

        updateTotals([]);
        return;
      }

      todayMealsEl.innerHTML = meals.map(m => `

        <div class="meal-card">

          <div class="meal-info">
            <strong>${m.name || "Meal"}</strong>
            <small>${m.mealType || "General"}</small>
          </div>

          <div class="stats">
            <span>${m.calories || 0} kcal</span>
            <span>${m.protein || 0}g protein</span>
            <span>Rs ${m.cost || 0}</span>
          </div>

          <button 
            class="deleteMealBtn"
            data-id="${m.id}"
          >
            ✕
          </button>

        </div>

      `).join("");

      updateTotals(meals);

      // DELETE BUTTONS
      document.querySelectorAll(".deleteMealBtn")
        .forEach(btn => {

          btn.addEventListener("click", async () => {

            try {

              await fetch(
                `/delete_meal/${btn.dataset.id}`,
                {
                  method: "DELETE"
                }
              );

              renderMeals();

            } catch (e) {
              console.log(e);
            }

          });

        });

    } catch (err) {

      console.log(err);

      todayMealsEl.innerHTML = `
        <p>Error loading meals</p>
      `;
    }
  }

  // INITIAL LOAD
  renderMeals();

  // DATE CHANGE
  if (planDateEl) {
    planDateEl.addEventListener("change", renderMeals);
  }

  // =========================================
  // ADD CUSTOM MEAL
  // =========================================
  const addBtn = document.getElementById("addCustomMealBtn");

  if (addBtn) {

    addBtn.addEventListener("click", async (e) => {

      e.preventDefault();

      const payload = {

        name:
          document.getElementById("searchMeal")?.value || "",

        mealType:
          document.getElementById("mealSlot")?.value || "Meal",

        calories:
          parseInt(
            document.getElementById("mealCalories")?.value
          ) || 0,

        protein:
          parseInt(
            document.getElementById("mealProtein")?.value
          ) || 0,

        cost:
          parseInt(
            document.getElementById("mealCost")?.value
          ) || 0,

        date: planDateEl?.value
      };

      if (!payload.name.trim()) {
        alert("Please enter meal name");
        return;
      }

      try {

        const res = await fetch("/add_meal", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {

          alert("Meal added successfully");

          // CLEAR INPUTS
          [
            "searchMeal",
            "mealCalories",
            "mealProtein",
            "mealCost"
          ].forEach(id => {

            const el = document.getElementById(id);

            if (el) el.value = "";
          });

          renderMeals();

        } else {

          alert(data.error || "Failed to add meal");
        }

      } catch (e) {

        console.log(e);

        alert("Server error");
      }

    });
  }

  // =========================================
  // PROFILE BUTTON
  // =========================================
  const profileBtn = document.getElementById("profileBtn");

  if (profileBtn) {

    profileBtn.addEventListener("click", () => {

      const profileData = {

        name:
          document.getElementById("name")?.value,

        age:
          document.getElementById("age")?.value,

        weight:
          document.getElementById("weight")?.value,

        height:
          document.getElementById("height")?.value
      };

      console.log("Profile Saved:", profileData);

      alert("Profile saved successfully!");
    });
  }

  // =========================================
  // GOAL BUTTON
  // =========================================
  const goalBtn = document.getElementById("goalBtn");

  if (goalBtn) {

    goalBtn.addEventListener("click", () => {

      const goalData = {

        goal:
          document.getElementById("goalType")?.value,

        calories:
          document.getElementById("calTarget")?.value,

        protein:
          document.getElementById("proteinTarget")?.value
      };

      console.log("Goals Saved:", goalData);

      alert("Goals saved successfully!");
    });
  }

  // =========================================
  // CLEAR DAY
  // =========================================
  const clearBtn = document.getElementById("clearDayBtn");

  if (clearBtn) {

    clearBtn.addEventListener("click", async () => {

      try {

        const date = planDateEl?.value;

        await fetch(`/clear_meals?date=${date}`, {
          method: "DELETE"
        });

        renderMeals();

      } catch (e) {

        console.log(e);
      }

    });
  }

  // =========================================
  // CALCULATE GOALS
  // =========================================
  const calcBtn = document.getElementById("calcGoalBtn");

  if (calcBtn) {

    calcBtn.addEventListener("click", () => {

      const weight =
        parseFloat(
          document.getElementById("weight")?.value
        ) || 70;

      const activity =
        document.getElementById("activity")?.value ||
        "moderate";

      const goal =
        document.getElementById("goalType")?.value ||
        "maintain";

      const mult = {

        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725

      }[activity] || 1.55;

      let calories = weight * 24 * mult;

      if (goal === "loss") calories -= 300;
      if (goal === "gain") calories += 300;

      document.getElementById("calTarget").value =
        Math.round(calories);

      document.getElementById("proteinTarget").value =
        Math.round(weight * 1.6);
    });
  }
// =========================================
// AI PREDICT — FINAL CLEAN VERSION
// =========================================

const aiBtn = document.getElementById("suggestMealsBtn");

if (aiBtn) {

  aiBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!aiArea) return;

    // Loading state
    aiArea.innerHTML = `
      <p class="loading-inline">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Generating your meal plan…
      </p>
    `;

    // Payload
    const payload = {
      age: document.getElementById("age")?.value || 25,
      weight: document.getElementById("weight")?.value || 70,
      height: document.getElementById("height")?.value || 170,
      gender: document.getElementById("gender")?.value || "male",
      goal: document.getElementById("goalType")?.value || "maintain",
      disease: document.getElementById("disease")?.value || "none",
      activity: document.getElementById("activity")?.value || "moderate"
    };

    try {

      const res = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // API error handling
      if (!data.success) {
        aiArea.innerHTML = `
          <div class="ai-error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            ${data.error || "No AI data found"}
          </div>
        `;
        return;
      }

      // Build UI
      let html = `
        <div class="bmi-box">
          <p><strong>BMI:</strong> ${data.bmi}</p>
          <p><strong>Status:</strong> ${data.bmi_level}</p>
        </div>
      `;

      html += (data.recommendations || []).map(m => `
        <div class="ai-result">
          <h3>${m.meal}</h3>
          <p>${m.type}</p>
          <p>${m.calories} kcal</p>

          ${m.image_data?.image
            ? `<img src="${m.image_data.image}" width="150">`
            : ""
          }
        </div>
      `).join("");

      aiArea.innerHTML = html;

    } catch (err) {

      console.log(err);

      aiArea.innerHTML = `
        <div class="ai-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          AI server unavailable. Make sure Flask is running.
        </div>
      `;
    }

  });
}
  
  // =========================================
  // CHATBOT
  // =========================================
  window.sendChat = async function () {

    const input = document.getElementById("chatInput");
    const box = document.getElementById("chatBox");

    if (!input || !box) return;

    if (!input.value.trim()) return;

    const userText = input.value;

    // USER MESSAGE
    box.innerHTML += `

      <div class="chat-msg user">
        ${userText}
      </div>

    `;

    input.value = "";

    try {

      const res = await fetch("/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: userText
        })
      });

      const data = await res.json();

      box.innerHTML += `

        <div class="chat-msg bot">

          Recommended Meal:
          ${
            data.data?.[0]?.meal ||
            "Healthy Meal"
          }

        </div>

      `;

    } catch (e) {

      console.log(e);

      box.innerHTML += `

        <div class="chat-msg bot">
          AI unavailable
        </div>

      `;
    }
  };

});

