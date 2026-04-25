document.addEventListener("DOMContentLoaded", async () => {

  // ================= AUTH SAFE CHECK =================
  const user = await (typeof checkAuth === "function" ? checkAuth(true) : Promise.resolve(true));
  if (!user) console.log("User not logged in (auth skipped)");

  // ================= ELEMENTS =================
  const menuBtn = document.getElementById("menuBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const suggestBtn = document.getElementById("suggestMealsBtn");
  const aiArea = document.getElementById("aiSuggestions");

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

  // ================= AI + FLASK ML CALL =================
  if (suggestBtn) {
    suggestBtn.addEventListener("click", async () => {

      if (aiArea) aiArea.innerHTML = "Loading AI meal...";

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
            </div>
          `;
        } else {
          throw new Error(result.error);
        }

      } catch (err) {
        console.log("AI failed → fallback used", err);

        aiArea.innerHTML = `
          <div class="error">
            AI unavailable. Try again.
          </div>
        `;
      }
    });
  }

});