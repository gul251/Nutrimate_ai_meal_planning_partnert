// Firestore Database Helper Functions for NutriMate
// =====================================================
// Provides reusable functions for all database operations
// =====================================================

/**
 * Get current user's profile from Firestore
 * @returns {Promise<object|null>} User profile data or null
 */
async function getUserProfile() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const docRef = db.collection('users').doc(user.uid);
    const doc = await docRef.get();

    if (doc.exists) {
      console.log("✅ User profile loaded");
      return doc.data();
    } else {
      console.log("ℹ️ No profile found");
      return null;
    }
  } catch (error) {
    console.error("❌ Error loading profile:", error);
    throw error;
  }
}

/**
 * Update user profile in Firestore
 * @param {object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
async function updateUserProfile(profileData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    await db.collection('users').doc(user.uid).update({
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Profile updated successfully");
    showMessage("Profile saved successfully!", "success");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    showMessage("Failed to save profile", "error");
    throw error;
  }
}

/**
 * Add a meal to user's meal plans
 * @param {object} mealData - Meal data {name, calories, protein, date, mealType}
 * @returns {Promise<string>} Document ID of created meal
 */
async function addMealPlan(mealData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const mealPlanRef = await db.collection('users').doc(user.uid)
      .collection('mealPlans').add({
        ...mealData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    console.log("✅ Meal plan added:", mealPlanRef.id);
    return mealPlanRef.id;
  } catch (error) {
    console.error("❌ Error adding meal plan:", error);
    throw error;
  }
}

/**
 * Get all meal plans for current user
 * @param {string} date - Optional date filter (YYYY-MM-DD format)
 * @returns {Promise<Array>} Array of meal plans
 */
async function getMealPlans(date = null) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    let query = db.collection('users').doc(user.uid).collection('mealPlans');

    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const mealPlans = [];
    snapshot.forEach(doc => {
      mealPlans.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Loaded ${mealPlans.length} meal plans`);
    return mealPlans;
  } catch (error) {
    console.error("❌ Error loading meal plans:", error);
    throw error;
  }
}

/**
 * Delete a meal plan
 * @param {string} mealPlanId - ID of meal plan to delete
 * @returns {Promise<void>}
 */
async function deleteMealPlan(mealPlanId) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    await db.collection('users').doc(user.uid)
      .collection('mealPlans').doc(mealPlanId).delete();

    console.log("✅ Meal plan deleted");
    showMessage("Meal removed", "success");
  } catch (error) {
    console.error("❌ Error deleting meal plan:", error);
    showMessage("Failed to delete meal", "error");
    throw error;
  }
}

/**
 * Add weight log entry
 * @param {number} weight - Weight in kg
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<string>} Document ID
 */
async function addWeightLog(weight, date) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const logRef = await db.collection('users').doc(user.uid)
      .collection('weightLogs').add({
        weight: parseFloat(weight),
        date: date,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    console.log("✅ Weight log added");
    showMessage("Weight logged successfully", "success");
    return logRef.id;
  } catch (error) {
    console.error("❌ Error adding weight log:", error);
    showMessage("Failed to log weight", "error");
    throw error;
  }
}

/**
 * Get weight logs for current user
 * @param {number} limit - Number of recent logs to fetch
 * @returns {Promise<Array>} Array of weight logs
 */
async function getWeightLogs(limit = 30) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const snapshot = await db.collection('users').doc(user.uid)
      .collection('weightLogs')
      .orderBy('date', 'desc')
      .limit(limit)
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Loaded ${logs.length} weight logs`);
    return logs;
  } catch (error) {
    console.error("❌ Error loading weight logs:", error);
    throw error;
  }
}

/**
 * Add meal to favorites
 * @param {object} mealData - Meal data to save
 * @returns {Promise<string>} Document ID
 */
async function addFavorite(mealData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const favRef = await db.collection('users').doc(user.uid)
      .collection('favorites').add({
        ...mealData,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    console.log("✅ Added to favorites");
    showMessage("Added to favorites!", "success");
    return favRef.id;
  } catch (error) {
    console.error("❌ Error adding favorite:", error);
    showMessage("Failed to add favorite", "error");
    throw error;
  }
}

/**
 * Get all favorites for current user
 * @returns {Promise<Array>} Array of favorite meals
 */
async function getFavorites() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const snapshot = await db.collection('users').doc(user.uid)
      .collection('favorites')
      .orderBy('addedAt', 'desc')
      .get();

    const favorites = [];
    snapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Loaded ${favorites.length} favorites`);
    return favorites;
  } catch (error) {
    console.error("❌ Error loading favorites:", error);
    throw error;
  }
}

/**
 * Remove meal from favorites
 * @param {string} favoriteId - ID of favorite to remove
 * @returns {Promise<void>}
 */
async function removeFavorite(favoriteId) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    await db.collection('users').doc(user.uid)
      .collection('favorites').doc(favoriteId).delete();

    console.log("✅ Removed from favorites");
    showMessage("Removed from favorites", "success");
  } catch (error) {
    console.error("❌ Error removing favorite:", error);
    showMessage("Failed to remove favorite", "error");
    throw error;
  }
}

/**
 * Save user goals (calories, protein targets)
 * @param {object} goals - Goals data {calorieTarget, proteinTarget, etc.}
 * @returns {Promise<void>}
 */
async function saveGoals(goals) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    await db.collection('users').doc(user.uid).update({
      goals: goals,
      goalsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Goals saved");
    showMessage("Goals updated!", "success");
  } catch (error) {
    console.error("❌ Error saving goals:", error);
    showMessage("Failed to save goals", "error");
    throw error;
  }
}

/**
 * Get meals from public meals library
 * @param {number} limit - Number of meals to fetch
 * @returns {Promise<Array>} Array of meals
 */
async function getPublicMeals(limit = 50) {
  try {
    const snapshot = await db.collection('meals')
      .limit(limit)
      .get();

    const meals = [];
    snapshot.forEach(doc => {
      meals.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Loaded ${meals.length} public meals`);
    return meals;
  } catch (error) {
    console.error("❌ Error loading public meals:", error);
    throw error;
  }
}

/**
 * Listen to real-time profile updates
 * @param {function} callback - Callback function to handle profile updates
 * @returns {function} Unsubscribe function
 */
function listenToProfile(callback) {
  const user = getCurrentUser();
  if (!user) {
    console.error("No authenticated user");
    return () => {};
  }

  const unsubscribe = db.collection('users').doc(user.uid)
    .onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data());
      }
    }, (error) => {
      console.error("❌ Profile listener error:", error);
    });

  return unsubscribe;
}

/**
 * Listen to real-time meal plans updates
 * @param {function} callback - Callback function to handle meal plans updates
 * @returns {function} Unsubscribe function
 */
function listenToMealPlans(callback) {
  const user = getCurrentUser();
  if (!user) {
    console.error("No authenticated user");
    return () => {};
  }

  const unsubscribe = db.collection('users').doc(user.uid)
    .collection('mealPlans')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const mealPlans = [];
      snapshot.forEach(doc => {
        mealPlans.push({ id: doc.id, ...doc.data() });
      });
      callback(mealPlans);
    }, (error) => {
      console.error("❌ Meal plans listener error:", error);
    });

  return unsubscribe;
}

console.log("✅ Database.js loaded successfully");
