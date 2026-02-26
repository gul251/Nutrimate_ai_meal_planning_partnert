# Firebase Setup Guide for NutriMate

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Click "Add project"**
3. **Enter project name**: `NutriMate` (or `nutrimate-ai`)
4. **Disable Google Analytics** (optional, can enable later)
5. **Click "Create Project"**

---

## Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** from left sidebar
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Click **Email/Password**
5. **Enable** the first toggle (Email/Password)
6. Click **Save**

---

## Step 3: Create Firestore Database

1. Click **Firestore Database** from left sidebar
2. Click **Create database**
3. Select **Start in production mode** (we'll set rules later)
4. Choose location closest to users (e.g., `us-central1`)
5. Click **Enable**

---

## Step 4: Set Firestore Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading user's subcollections
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public meals library (read-only for authenticated users)
    match /meals/{mealId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can add meals (via console)
    }
  }
}
```

3. Click **Publish**

---

## Step 5: Get Firebase Config Credentials

1. Click **Project Settings** (⚙️ gear icon in left sidebar)
2. Scroll down to **Your apps** section
3. Click the **Web icon** (`</>`) to add a web app
4. **Register app**: Enter nickname `NutriMate Web`
5. **Don't check** "Firebase Hosting" (we'll do that later)
6. Click **Register app**
7. **Copy the firebaseConfig object** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nutrimate-xxxxx.firebaseapp.com",
  projectId: "nutrimate-xxxxx",
  storageBucket: "nutrimate-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

8. **Open** `js/config.js` in your code editor
9. **Replace** the placeholder values with your actual config
10. **Save the file**

---

## Step 6: Test Firebase Connection

1. Open `welcome.html` in your browser
2. Open **Developer Console** (F12)
3. You should see: `✅ Firebase initialized successfully`
4. If you see errors, check that:
   - Config values are correct
   - No typos in API key
   - Firebase SDK scripts are loaded in HTML

---

## Step 7: Get Gemini AI API Key (FREE)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with `nutrimate.test@gmail.com` (or your account)
3. Click **"Get API Key"**
4. Click **"Create API key in new project"**
5. **Copy the API key**
6. Open `js/ai.js` (will be created in next step)
7. Paste the key in `GEMINI_API_KEY` variable

---

## Quick Reference

### Firebase Console URLs
- **Project Dashboard**: https://console.firebase.google.com/project/YOUR_PROJECT_ID
- **Authentication**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication
- **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore

### Firestore Structure
```
firestore/
├── users/{userId}/
│   ├── profile: { name, email, weight, age, height, goal, diet }
│   ├── mealPlans/{planId}
│   ├── favorites/{mealId}
│   └── weightLogs/{date}
└── meals/{mealId}
    └── { name, calories, protein, price, image }
```

---

## Troubleshooting

**Error: "Firebase not defined"**
- Make sure Firebase SDK scripts are loaded in HTML before `config.js`

**Error: "Permission denied"**
- Check Firestore rules
- Make sure user is authenticated before reading/writing

**Error: "Invalid API key"**
- Double-check you copied the entire key
- Make sure there are no extra spaces

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs
- Firestore Docs: https://firebase.google.com/docs/firestore
