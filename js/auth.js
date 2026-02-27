// Authentication Logic for NutriMate
// =====================================================
// Handles user signup, login, logout, and auth state
// =====================================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {object} userData - Additional user data (name, weight, goal, foodTypes)
 * @returns {Promise<object>} User object on success
 */
async function signUp(email, password, userData) {
  try {
    // Create user account in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log("✅ User account created:", user.uid);

    // Save user profile to Firestore
    await db.collection('users').doc(user.uid).set({
      name: userData.name || '',
      email: email,
      weight: parseFloat(userData.weight) || 0,
      goal: userData.goal || 'Maintain Weight',
      foodTypes: userData.foodTypes || [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ User profile saved to Firestore");

    // Show success message
    showMessage("Account created successfully! Redirecting...", "success");

    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'dashboardd.html';
    }, 1500);

    return user;

  } catch (error) {
    console.error("❌ Signup error:", error);
    handleAuthError(error);
    throw error;
  }
}

/**
 * Log in existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} User object on success
 */
async function login(email, password) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log("✅ User logged in:", user.uid);

    // Update last login timestamp
    await db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Show success message
    showMessage("Login successful! Redirecting...", "success");

    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = 'dashboardd.html';
    }, 1000);

    return user;

  } catch (error) {
    console.error("❌ Login error:", error);
    handleAuthError(error);
    throw error;
  }
}

/**
 * Log out current user
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    await auth.signOut();
    console.log("✅ User logged out");
    
    showMessage("Logged out successfully", "success");
    
    // Redirect to welcome page
    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 1000);

  } catch (error) {
    console.error("❌ Logout error:", error);
    showMessage("Error logging out. Please try again.", "error");
  }
}

/**
 * Check if user is authenticated
 * @param {boolean} redirectIfNot - Redirect to login if not authenticated
 * @returns {Promise<object|null>} User object if authenticated, null otherwise
 */
function checkAuth(redirectIfNot = false) {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ User is authenticated:", user.uid);
        resolve(user);
      } else {
        console.log("ℹ️ No user authenticated");
        if (redirectIfNot) {
          window.location.href = 'login.html';
        }
        resolve(null);
      }
    });
  });
}

/**
 * Get current authenticated user
 * @returns {object|null} Current user or null
 */
function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Check if user is on login/signup page and redirect if already logged in
 */
function redirectIfAuthenticated() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'login.html' || currentPage === 'createaccount.html' || currentPage === 'welcome.html') {
        console.log("✅ User already logged in, redirecting to dashboard");
        window.location.href = 'dashboardd.html';
      }
    }
  });
}

/**
 * Handle Firebase authentication errors with user-friendly messages
 * @param {object} error - Firebase error object
 */
function handleAuthError(error) {
  let message = "An error occurred. Please try again.";

  switch (error.code) {
    case 'auth/email-already-in-use':
      message = "This email is already registered. Please login instead.";
      break;
    case 'auth/invalid-email':
      message = "Invalid email address format.";
      break;
    case 'auth/weak-password':
      message = "Password is too weak. Use at least 6 characters.";
      break;
    case 'auth/user-not-found':
      message = "No account found with this email. Please sign up first.";
      break;
    case 'auth/wrong-password':
      message = "Incorrect password. Please try again.";
      break;
    case 'auth/too-many-requests':
      message = "Too many failed attempts. Please try again later.";
      break;
    case 'auth/network-request-failed':
      message = "Network error. Please check your internet connection.";
      break;
    case 'auth/user-disabled':
      message = "This account has been disabled. Contact support.";
      break;
    default:
      message = error.message || "An unexpected error occurred.";
  }

  showMessage(message, "error");
}

/**
 * Display a message to the user
 * @param {string} message - Message text
 * @param {string} type - Message type: "success", "error", "info"
 */
function showMessage(message, type = "info") {
  // Check if a message container exists, if not create one
  let messageDiv = document.getElementById('authMessage');
  
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'authMessage';
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 30px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease-out;
    `;
    document.body.appendChild(messageDiv);
  }

  // Set message and styling based on type
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';

  if (type === "success") {
    messageDiv.style.backgroundColor = "#A3E635";
    messageDiv.style.color = "white";
  } else if (type === "error") {
    messageDiv.style.backgroundColor = "#ef4444";
    messageDiv.style.color = "white";
  } else {
    messageDiv.style.backgroundColor = "#0D9488";
    messageDiv.style.color = "white";
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 4000);
}

// Add CSS animation for message
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Enable session persistence (user stays logged in after closing browser)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log("✅ Session persistence enabled");
  })
  .catch((error) => {
    console.error("❌ Session persistence error:", error);
  });

console.log("✅ Auth.js loaded successfully");
