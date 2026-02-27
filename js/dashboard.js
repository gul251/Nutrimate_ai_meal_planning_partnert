// ================== NutriMate Dashboard - Firebase Integration ==================
document.addEventListener("DOMContentLoaded", async () => {

  // Check authentication - redirect to login if not authenticated
  const user = await checkAuth(true);
  if (!user) return; // Will redirect if no user

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
    try {
      const profile = await getUserProfile();
      if (profile) {
        document.getElementById('name').value = profile.name || '';
        document.getElementById('age').value = profile.age || '';
        document.getElementById('height').value = profile.height || '';
        document.getElementById('weight').value = profile.weight || '';
        document.getElementById('activity').value = profile.activity || '';
        document.getElementById('dietType').value = profile.diet || profile.goal || '';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  // Auto-load profile on page load
  loadProfile();

  loadBtn?.addEventListener("click", loadProfile);

  saveProfileBtn?.addEventListener("click", async () => {
    try {
      const profileData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value) || 0,
        height: parseFloat(document.getElementById('height').value) || 0,
        weight: parseFloat(document.getElementById('weight').value) || 0,
        activity: document.getElementById('activity').value,
        diet: document.getElementById('dietType').value
      };
      
      await updateUserProfile(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  });

  // ---------- MEALS DATABASE ----------
  const addMealDb = document.getElementById("addMealDb");
  const mealsDbArea = document.getElementById("mealsDbArea");

  async function fetchMeals() {
    try {
      const meals = await getMealPlans();
      mealsDbArea.innerHTML = "";
      
      if (meals.length === 0) {
        mealsDbArea.innerHTML = "<p>No meals added yet. Add your first meal!</p>";
        return;
      }

      meals.forEach(meal => {
        const div = document.createElement("div");
        div.classList.add("meal-card");
        div.innerHTML = `
          <strong>${meal.name || 'Unnamed Meal'}</strong> | 
          Cal: ${meal.calories || 0} | 
          Protein: ${meal.protein || 0}g | 
          ${meal.date || 'No date'}
          <button class="deleteMealBtn" data-id="${meal.id}">Delete</button>
        `;
        mealsDbArea.appendChild(div);
      });

      // Delete meal
      document.querySelectorAll(".deleteMealBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (confirm('Delete this meal?')) {
            await deleteMealPlan(id);
            fetchMeals();
          }
        });
      });
    } catch (error) {
      console.error('Error fetching meals:', error);
      mealsDbArea.innerHTML = "<p>Error loading meals</p>";
    }
  }

  addMealDb?.addEventListener("click", async () => {
    const name = document.getElementById("dbName").value;
    const calories = document.getElementById("dbCals").value;
    const protein = document.getElementById("dbProtein").value;

    if(!name) {
      showMessage("Meal name required", "error");
      return;
    }

    const mealData = {
      name,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      date: new Date().toISOString().split('T')[0],
      mealType: 'custom'
    };

    try {
      await addMealPlan(mealData);
      fetchMeals();
      
      // Clear form
      document.getElementById("dbName").value="";
      document.getElementById("dbCals").value="";
      document.getElementById("dbProtein").value="";
      
      showMessage("Meal added successfully!", "success");
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  });

  fetchMeals(); // initial load

  // ---------- GOALS ----------
  const saveGoalsBtn = document.getElementById("saveGoalsBtn");
  saveGoalsBtn?.addEventListener("click", async () => {
    try {
      const goals = {
        calorieTarget: parseInt(document.getElementById("calorieTarget")?.value) || 0,
        proteinTarget: parseInt(document.getElementById("proteinTarget")?.value) || 0
      };
      await saveGoals(goals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  });

  // ---------- DAY PLANS ----------
  const clearDayBtn = document.getElementById("clearDayBtn");
  clearDayBtn?.addEventListener("click", async () => {
    if(confirm("Clear all meals for today?")){
      const today = new Date().toISOString().split('T')[0];
      const meals = await getMealPlans(today);
      for (const meal of meals) {
        await deleteMealPlan(meal.id);
      }
      fetchMeals();
      showMessage("Day cleared!", "success");
    }
  });

  // ---------- GROCERY ----------
  const generateGrocery = document.getElementById("generateGrocery");
  const clearGrocery = document.getElementById("clearGrocery");
  generateGrocery?.addEventListener("click", ()=> {
    showMessage("Grocery list generation coming soon!", "info");
  });
  clearGrocery?.addEventListener("click", ()=> {
    showMessage("Grocery list cleared", "info");
  });

  // ---------- PROGRESS ----------
  const saveWeight = document.getElementById("saveWeight");
  saveWeight?.addEventListener("click", async ()=> {
    const weight = document.getElementById("weight").value;
    const date = new Date().toISOString().split('T')[0];
    if (weight) {
      try {
        await addWeightLog(weight, date);
      } catch (error) {
        console.error('Error saving weight:', error);
      }
    }
  });

  // ---------- AI SUGGESTIONS ----------
  const suggestMealsBtn = document.getElementById("suggestMealsBtn");
  suggestMealsBtn?.addEventListener("click", async () => {
    const aiArea = document.getElementById("mealsDbArea");
    
    if (!aiArea) {
      showMessage("Display area not found", "error");
      return;
    }

    // Show loading state
    aiArea.innerHTML = "<p>🤖 Generating AI meal plan... Please wait...</p>";
    suggestMealsBtn.disabled = true;
    suggestMealsBtn.textContent = "Generating...";

    try {
      // Get user profile
      const profile = await getUserProfile();
      
      if (!profile) {
        showMessage("Please complete your profile first", "error");
        aiArea.innerHTML = "<p>Please fill out your profile information to get personalized meal suggestions.</p>";
        return;
      }

      // Generate meal plan using AI
      const mealPlan = await generateMealPlan(profile);
      
      // Display the AI-generated meal plan
      displayMealPlan("mealsDbArea", mealPlan);
      showMessage("AI meal plan generated!", "success");
      
    } catch (error) {
      console.error('AI generation error:', error);
      aiArea.innerHTML = "<p>❌ Failed to generate meal plan. Please check your API key in js/ai.js</p>";
    } finally {
      // Re-enable button
      suggestMealsBtn.disabled = false;
      suggestMealsBtn.textContent = "Suggest Meals";
    }
  });

  // ---------- LOGOUT ----------
  // Add logout button handler if it exists
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

});
