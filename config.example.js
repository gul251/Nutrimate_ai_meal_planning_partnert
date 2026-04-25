// Firebase Configuration Template (Compat SDK)
// =====================================================
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Go to https://console.firebase.google.com
// 3. Create/Select your project and open Project Settings
// 4. In "Your apps", create a Web app and copy firebaseConfig values
// 5. Replace the placeholders below
// 6. Keep script order in HTML:
//    firebase-app-compat.js -> firebase-auth-compat.js -> firebase-firestore-compat.js -> config.js
// 7. See FIREBASE_SETUP.md for complete setup details
// =====================================================

var auth;
var db;

(function initFirebase() {
  if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Make sure compat scripts are included before config.js");
    return;
  }

  var firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  auth = firebase.auth();
  db = firebase.firestore();

  window.auth = auth;
  window.db = db;

  console.log("Firebase initialized successfully");
})();
