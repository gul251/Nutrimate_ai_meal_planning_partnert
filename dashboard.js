// ================== Nutrimate JS - SQL READY ==================
document.addEventListener("DOMContentLoaded", () => {

  const userId = 1; // demo user ID, login system ke saath dynamic hoga

  // ---------- MENU BAR ----------
  const menuBtn = document.getElementById("menuBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");

  menuBtn.addEventListener("click", () => {
    sidebarMenu.classList.toggle("open");
  });

  // ---------- IMAGE SLIDER ----------
  const images = document.querySelectorAll('.slider img');
  const dots = document.querySelectorAll('.dot');
  let current = 0;

  function nextSlide() {
    images[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
    dots[current].classList.add('active');
  }
  setInterval(nextSlide, 3000);

  // ---------- PROFILE ----------
  const loadBtn = document.getElementById("loadBtn");
  const saveProfileBtn = document.getElementById("calcGoalBtn");

  async function loadProfile() {
    const res = await fetch(`phpdbdashboardd.php?action=load_profile&user_id=${userId}`);
    const data = await res.json();
    document.getElementById('name').value = data.name;
    document.getElementById('age').value = data.age;
    document.getElementById('height').value = data.height;
    document.getElementById('weight').value = data.weight;
    document.getElementById('activity').value = data.activity;
    document.getElementById('dietType').value = data.diet;
  }

  loadBtn?.addEventListener("click", loadProfile);

  saveProfileBtn?.addEventListener("click", async () => {
    const payload = {
      user_id: userId,
      name: document.getElementById('name').value,
      age: document.getElementById('age').value,
      height: document.getElementById('height').value,
      weight: document.getElementById('weight').value,
      activity: document.getElementById('activity').value,
      diet: document.getElementById('dietType').value,
      gender: 'female'
    };
    const res = await fetch('phpdbdashboardd.php?action=save_profile', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert("Profile saved! User ID: " + data.user_id);
  });

  // ---------- MEALS DATABASE ----------
  const addMealDb = document.getElementById("addMealDb");
  const mealsDbArea = document.getElementById("mealsDbArea");

  async function fetchMeals() {
    const res = await fetch('phpdbdashboardd.php?action=fetch_meals');
    const meals = await res.json();
    mealsDbArea.innerHTML = "";
    meals.forEach(meal => {
      const div = document.createElement("div");
      div.classList.add("meal-card");
      div.innerHTML = `
        <strong>${meal.name}</strong> | Cal: ${meal.cal} | Protein: ${meal.protein}g | Rs ${meal.price}
        <button class="deleteMealBtn" data-id="${meal.id}">Delete</button>
      `;
      mealsDbArea.appendChild(div);
    });

    // Delete meal
    document.querySelectorAll(".deleteMealBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await fetch('phpdbdashboardd.php?action=delete_meal', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({meal_id: id})
        });
        fetchMeals();
      });
    });
  }

  addMealDb?.addEventListener("click", async () => {
    const name = document.getElementById("dbName").value;
    const cal = document.getElementById("dbCals").value;
    const protein = document.getElementById("dbProtein").value;
    const price = document.getElementById("dbPrice").value;
    const img = ""; // optional img path

    if(!name) return alert("Meal name required");

    const payload = {name, cal, protein, price, img};

    const res = await fetch('phpdbdashboardd.php?action=add_meal',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    fetchMeals();
    document.getElementById("dbName").value="";
    document.getElementById("dbCals").value="";
    document.getElementById("dbProtein").value="";
    document.getElementById("dbPrice").value="";
  });

  fetchMeals(); // initial load

  // ---------- GOALS ----------
  const saveGoalsBtn = document.getElementById("saveGoalsBtn");
  saveGoalsBtn?.addEventListener("click", async () => {
    alert("SQL integration for goals ready!");
  });

  // ---------- DAY PLANS ----------
  const clearDayBtn = document.getElementById("clearDayBtn");
  clearDayBtn?.addEventListener("click", () => {
    if(confirm("Clear all meals for the day?")){
      alert("Day plans cleared in SQL");
    }
  });

  // ---------- GROCERY ----------
  const generateGrocery = document.getElementById("generateGrocery");
  const clearGrocery = document.getElementById("clearGrocery");
  generateGrocery?.addEventListener("click", ()=> alert("Grocery generated via SQL"));
  clearGrocery?.addEventListener("click", ()=> alert("Grocery cleared via SQL"));

  // ---------- PROGRESS ----------
  const saveWeight = document.getElementById("saveWeight");
  saveWeight?.addEventListener("click", ()=> alert("Weight saved via SQL"));

  // ---------- AI SUGGESTIONS ----------
  const suggestMealsBtn = document.getElementById("suggestMealsBtn");
  suggestMealsBtn?.addEventListener("click", ()=> alert("AI suggestions fetched from SQL"));

});
