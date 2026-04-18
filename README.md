# NutriMate - AI Meal Planning Partner

NutriMate is an intelligent meal planning web application that helps users track their weight, set dietary goals, and get personalized meal recommendations using AI. Built with Firebase and Google Gemini AI.

## 🌟 Features

- **User Authentication** - Secure email/password signup and login with Firebase Auth
- **Profile Management** - Track weight, height, age, activity level, and dietary preferences
- **AI Meal Planning** - Get personalized meal suggestions using Google Gemini AI
- **Meal Database** - Save and manage your favorite meals
- **Weight Tracking** - Log and monitor weight progress over time
- **Goal Setting** - Set calorie and protein targets
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Poppins, Montserrat, Inter, Roboto)

### Backend & Services
- **Firebase Authentication** - User authentication and session management
- **Cloud Firestore** - NoSQL database for user data
- **Google Gemini AI** - AI-powered meal plan generation (FREE tier)

## 📁 Project Structure

```
Nutrimate_ai_meal_planning_partnert/
├── css/
│   ├── global.css              # Shared styles for all pages
│   └── dashboardstyle.css      # Dashboard-specific styles
│
├── js/
│   ├── config.example.js       # Firebase config template (copy to config.js)
│   ├── ai.example.js           # AI config template (copy to ai.js)
│   ├── auth.js                 # Authentication logic
│   ├── database.js             # Firestore helper functions
│   └── dashboard.js            # Dashboard functionality
│
├── assets/
│   └── images/                 # Image assets
│
├── welcome.html                # Landing page
├── login.html                  # Login page
├── createaccount.html          # Signup page
├── dashboard.html             # Main dashboard
├── howitworks.html             # How it works page
│
├── .gitignore                  # Git ignore rules
├── FIREBASE_SETUP.md           # Detailed Firebase setup guide
└── README.md                   # This file
```

## ⚙️ Setup Instructions

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Google account for Firebase
- Text editor (VS Code recommended)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Nutrimate_ai_meal_planning_partnert
```

### Step 2: Firebase Configuration

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project" and name it `NutriMate`
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - Navigate to **Authentication** → **Sign-in method**
   - Enable **Email/Password** authentication

3. **Create Firestore Database**
   - Navigate to **Firestore Database**
   - Click "Create database"
   - Start in **production mode**
   - Choose your region

4. **Set Firestore Security Rules**
   - Go to **Rules** tab and paste:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
       match /meals/{mealId} {
         allow read: if request.auth != null;
       }
     }
   }
   ```

5. **Get Firebase Config**
   - Go to **Project Settings** (⚙️ icon)
   - Scroll to "Your apps" → Click **Web icon** (`</>`)
   - Register app as "NutriMate Web"
   - Copy the `firebaseConfig` object

6. **Create Configuration File**
   - Copy `js/config.example.js` and rename it to `js/config.js`:
   ```bash
   # PowerShell
   Copy-Item js\config.example.js js\config.js
   
   # Or just duplicate the file manually
   ```
   - Open `js/config.js`
   - Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### Step 3: Google Gemini AI Setup (Proxy-First)

1. **Deploy AI Proxy (recommended for security + reliability)**
   - Use `backend/cloudflare-worker.js`
   - Follow `backend/README.md`
   - Set worker secret: `GEMINI_API_KEY`
   - Deploy and copy your worker URL

2. **Configure Frontend Proxy URL**
   - Open `js/ai.js`
   - Set:
   ```javascript
   const NUTRIMATE_AI_PROXY_URL = "https://your-worker-name.your-subdomain.workers.dev";
   ```

3. **Optional Direct Key (local testing only)**
   - Go to https://aistudio.google.com/app/apikey
   - Create a Gemini key
   - Set `GEMINI_API_KEY` in `js/ai.js` only if you cannot use proxy yet
   - Do not commit real keys to git

### Step 4: Run Locally

Since this is a static web app, you can run it using any of these methods:

**Option 1: Live Server (VS Code Extension)**
```bash
# Install "Live Server" extension in VS Code
# Right-click on welcome.html → "Open with Live Server"
```

**Option 2: Python HTTP Server**
```bash
python -m http.server 8000
# Open http://localhost:8000/welcome.html
```

**Option 3: Node.js HTTP Server**
```bash
npx http-server -p 8000
# Open http://localhost:8000/welcome.html
```

**Option 4: Just open the file**
```bash
# Simply open welcome.html in your browser
# Note: Firebase requires HTTPS in production but works with file:// for testing
```

## 🎯 Usage Guide

### 1. Create Account
- Open `welcome.html` in your browser
- Click "Create Now"
- Fill in your details:
  - Name, email, password
  - Weight and fitness goal
  - Food preferences (Vegetarian, Non-Veg, Vegan)
- Click "Create Account"

### 2. Login
- Enter your email and password
- Click "Login"
- You'll be redirected to the dashboard

### 3. Complete Profile
- Fill in additional details (age, height, activity level)
- Click "Calculate Goals" to save

### 4. Generate AI Meal Plan
- Click "Suggest Meals" button
- AI will generate personalized meal suggestions based on your profile
- Meals are displayed with calorie information
- If AI is limited/unavailable, NutriMate automatically shows a local fallback plan
- Use the "AI Diagnostics" panel on dashboard to inspect current AI mode/status

### 5. Add Custom Meals
- Enter meal name, calories, and protein
- Click "Add Meal" to save to your meal database

### 6. Track Weight
- Enter your current weight
- Click "Save Weight" to log progress

## 🔥 Firebase Database Structure

```
firestore/
├── users/{userId}/
│   ├── profile: {
│   │     name: string,
│   │     email: string,
│   │     weight: number,
│   │     age: number,
│   │     height: number,
│   │     goal: string,
│   │     foodTypes: array,
│   │     diet: string,
│   │     activity: string,
│   │     goals: {calorieTarget, proteinTarget}
│   │   }
│   │
│   ├── mealPlans/{planId}/
│   │     └── {name, calories, protein, date, mealType}
│   │
│   ├── weightLogs/{logId}/
│   │     └── {weight, date, createdAt}
│   │
│   └── favorites/{favoriteId}/
│         └── {name, calories, protein, addedAt}
│
└── meals/{mealId}/  (public library)
      └── {name, calories, protein, price, image}
```

## 🎨 Color Palette

- **Primary:** `#0D9488` (Teal)
- **Secondary:** `#A3E635` (Lime Green)
- **Accent:** `#F8FAFC` (Light Gray)
- **Text:** `#0F172A` (Dark Blue)

## 📱 Responsive Breakpoints

- **Desktop:** > 768px
- **Mobile:** ≤ 768px

## 🔐 Security Features

- Firebase Authentication with email verification
- Firestore security rules enforce user data isolation
- API keys protected via `.gitignore`
- Session persistence for seamless user experience

## 🚀 Deployment

### Deploy to Firebase Hosting (FREE)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   # Select your Firebase project
   # Public directory: . (current directory)
   # Configure as single-page app: No
   # Don't overwrite existing files
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

5. **Access your live site**
   ```
   https://your-project-id.web.app
   ```

## 📚 API Documentation

### Authentication Functions (`js/auth.js`)
- `signUp(email, password, userData)` - Create new user account
- `login(email, password)` - Authenticate user
- `logout()` - Sign out current user
- `checkAuth(redirectIfNot)` - Verify authentication status

### Database Functions (`js/database.js`)
- `getUserProfile()` - Get current user's profile
- `updateUserProfile(data)` - Update profile information
- `addMealPlan(mealData)` - Save meal to plan
- `getMealPlans(date)` - Fetch user's meal plans
- `deleteMealPlan(id)` - Remove meal from plan
- `addWeightLog(weight, date)` - Log weight entry
- `getWeightLogs(limit)` - Fetch weight history
- `addFavorite(mealData)` / `getFavorites()` / `removeFavorite(id)` - Manage favorites
- `saveGoals(goals)` - Save calorie/protein targets

### AI Functions (`js/ai.js`)
- `generateMealPlan(userProfile)` - Generate full day meal plan
- `generateQuickSuggestion(mealType, profile)` - Get quick meal ideas
- `analyzeMealNutrition(mealName)` - Get nutritional breakdown

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify API keys in `js/config.js`
- Check browser console for errors
- Ensure Firebase project is active

### AI Not Working
- Verify Gemini API key in `js/ai.js`
- Check API quota limits (free tier: 60 requests/minute)
- Ensure internet connection is stable

### Authentication Errors
- Clear browser cache and cookies
- Check Firestore security rules
- Verify email/password authentication is enabled

## 📄 License

This project is part of a Final Year Project (FYP) for educational purposes.

## 🔗 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detailed setup guide

## 📞 Support

For issues or questions, please refer to:
- Firebase Console: https://console.firebase.google.com
- Google AI Studio: https://aistudio.google.com

---

**Built with ❤️ using Firebase and Google Gemini AI**