// Firebase Configuration Template
// =====================================================
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Go to https://console.firebase.google.com
// 3. Create new project (name: NutriMate)
// 4. Enable Authentication (Email/Password)
// 5. Create Firestore Database (start in production mode)
// 6. Go to Project Settings > General > Your apps
// 7. Click "Web" icon (</>) to add web app
// 8. Copy the firebaseConfig and replace values below
// 9. See FIREBASE_SETUP.md for detailed instructions
// =====================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  alert("Firebase configuration error. Please check js/config.js");
}

// Make auth and db available globally
window.auth = auth;
window.db = db;
