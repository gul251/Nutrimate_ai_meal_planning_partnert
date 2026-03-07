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




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPEV2Yravnr8gxPjXW9hwDSOUtgAYOqW8",
  authDomain: "nutrimate-ai-7e761.firebaseapp.com",
  projectId: "nutrimate-ai-7e761",
  storageBucket: "nutrimate-ai-7e761.firebasestorage.app",
  messagingSenderId: "737411805388",
  appId: "1:737411805388:web:174a47d24e13e437569269",
  measurementId: "G-TDJ1D2LKVV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
