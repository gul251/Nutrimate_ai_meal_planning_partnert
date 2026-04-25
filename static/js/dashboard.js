// ================= NUTRIMATE DASHBOARD JS =================
document.addEventListener("DOMContentLoaded", async () => {

//login & Logout
  const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "/login";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "/welcome";
  });
}

  // ================= AUTH CHECK =================
  const user = await (typeof checkAuth === "function"
    ? checkAuth(true)
    : Promise.resolve(true));

  if (!user) return;

  // ================= BMI FUNCTION =================
  function getBMICategory(bmi) {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  }

  // ================= RULE BASED SYSTEM =================
  function ruleBasedMealPlan(profile) {

    const weight = parseFloat(profile.weight) || 70;
    const height = (parseFloat(profile.height) || 170) / 100;
    const goal = (profile.goal || "").toLowerCase();
    const disease = (profile.disease || "").toLowerCase();

    const bmi = weight / (height * height);
    const bmiCategory = getBMICategory(bmi);

    let meals = [];

    if (disease.includes("diabetes")) {
      meals = [
        { name: "Oats + Chia Seeds", calories: 250, protein: 10 },
        { name: "Grilled Chicken Salad", calories: 400, protein: 35 },
        { name: "Boiled Eggs + Veggies", calories: 300, protein: 25 }
      ];
    }
    else if (goal.includes("loss") || bmiCategory === "overweight" || bmiCategory === "obese") {
      meals = [
        { name: "Green Tea + Nuts", calories: 150, protein: 5 },
        { name: "Chicken Salad", calories: 350, protein: 30 },
        { name: "Vegetable Soup", calories: 200, protein: 10 }
      ];
    }
    else if (goal.includes("gain") || bmiCategory === "underweight") {
      meals = [
        { name: "Banana Shake", calories: 400, protein: 15 },
        { name: "Rice + Chicken", calories: 600, protein: 35 },
        { name: "Peanut Butter Toast", calories: 300, protein: 10 }
      ];
    }
    else {
      meals = [
        { name: "Egg Breakfast", calories: 300, protein: 20 },
        { name: "Chicken Rice", calories: 500, protein: 30 },
        { name: "Fruit Bowl", calories: 200, protein: 5 }
      ];
    }

    return { source: "rule_based", meals };
  }

  // ================= HAMBURGER MENU =================
  const menuBtn = document.getElementById("menuBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");

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

  // ================= ML + FLASK + AI =================
  document.getElementById("suggestMealsBtn")?.addEventListener("click", async () => {

    const aiArea = document.getElementById("aiSuggestions");
    if (!aiArea) return;

    aiArea.innerHTML = "Generating AI meal...";

    const profile = {
      weight: document.getElementById("weight")?.value || 70,
      height: document.getElementById("height")?.value || 170,
      goal: document.getElementById("goalType")?.value || "maintain",
      disease: "none"
    };

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: document.getElementById("age")?.value || 25,
          weight: profile.weight,
          height: profile.height,
          gender: "male",
          goal: profile.goal,
          disease: profile.disease
        })
      });

      const result = await res.json();

      if (result.success) {
        aiArea.innerHTML = `
          <div class="ai-card">
            <h3>AI Recommended Meal</h3>
            <p>🍽 ${result.meal}</p>
          </div>
        `;
        return;
      }

    } catch (err) {
      console.log("ML Error:", err);
    }

    // ================= FALLBACK =================
    const mealPlan = ruleBasedMealPlan(profile);

    aiArea.innerHTML = "<h3>Smart Meal Plan</h3>";

    mealPlan.meals.forEach(m => {
      aiArea.insertAdjacentHTML("beforeend", `
        <div class="meal-card">
          <b>${m.name}</b><br>
          ${m.calories} cal | ${m.protein}g protein
        </div>
      `);
    });

  });

});