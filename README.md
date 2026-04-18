# NutriMate - AI Meal Planning Partner

NutriMate is a web app for meal planning, nutrition goal tracking, and progress monitoring. It uses Firebase for authentication/data and a proxy-first AI integration (Cloudflare Worker + Gemini) for secure meal recommendations with resilient local fallback.

## Features

- Email/password authentication with Firebase Auth
- Profile management: age, height, weight, activity level, and diet type
- Goal management: calorie and protein targets
- Daily meal planner with totals (calories, protein, cost)
- AI meal suggestions with diagnostics/status feedback
- Local fallback plan when AI provider is unavailable or limited
- Favorites and grocery list generation
- Weight logging with charted progress
- Responsive dashboard and content pages

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome
- Google Fonts (Poppins, Montserrat, Roboto)

### Backend and Services

- Firebase Authentication
- Cloud Firestore
- Cloudflare Worker (AI proxy)
- Google Gemini API (via proxy, optional direct local testing)

## Project Structure

```text
Nutrimate_ai_meal_planning_partnert/
|- assets/
|  \- images/
|- backend/
|  |- cloudflare-worker.js
|  |- wrangler.toml
|  \- README.md
|- css/
|  |- dashboardstyle.css
|  \- global.css
|- js/
|  |- ai.example.js
|  |- ai.js
|  |- auth.js
|  |- config.example.js
|  |- config.js
|  |- dashboard.js
|  \- database.js
|- about.html
|- contact.html
|- createaccount.html
|- dashboard.html
|- faq.html
|- howitworks.html
|- login.html
|- privacy-policy.html
|- terms.html
|- welcome.html
|- FIREBASE_SETUP.md
\- README.md
```

## Setup

### 1) Clone

```bash
git clone <repository-url>
cd Nutrimate_ai_meal_planning_partnert
```

### 2) Firebase setup

1. Create a Firebase project.
2. Enable Email/Password auth.
3. Create Firestore database.
4. Add rules (example):

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

5. Create `js/config.js` from `js/config.example.js` and fill your Firebase config.

### 3) AI setup (proxy-first)

Recommended: use Cloudflare Worker proxy so API keys are not exposed in frontend.

1. Go to `backend/` and deploy worker:

```powershell
cd backend
npm i -g wrangler
wrangler login
wrangler secret put GEMINI_API_KEY
wrangler secret put ALLOWED_ORIGIN
wrangler deploy
```

2. Set proxy URL in `js/ai.js`:

```javascript
const NUTRIMATE_AI_PROXY_URL = "https://your-worker-name.your-subdomain.workers.dev";
```

3. Optional local testing only:
- Keep direct key placeholder in frontend or set temporary direct key in `js/ai.js` for local testing.
- Do not commit real keys.

### 4) Run locally

Option A: Live Server in VS Code

Option B:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/welcome.html
```

## Usage Flow

1. Open `welcome.html` and create account.
2. Login via `login.html`.
3. Complete profile in `dashboard.html`.
4. Set/calculate goals.
5. Add meals or generate AI meal suggestions.
6. Use AI diagnostics panel to inspect mode/status.
7. Track weight and review progress chart.

## AI Behavior Notes

- AI path is proxy-first.
- If proxy/provider fails, app auto-falls back to local plan generation.
- Dashboard shows AI status banner and diagnostics details.
- Fallback mode ensures meal planning still works without provider availability.

## Pages Included

- `welcome.html`
- `login.html`
- `createaccount.html`
- `dashboard.html`
- `howitworks.html`
- `about.html`
- `privacy-policy.html`
- `terms.html`
- `contact.html`
- `faq.html`

## Color Palette

- Primary: `#0D9488` (Teal)
- Secondary: `#F59E0B` (Amber)
- Accent: `#F8FAFC` (Light Gray)
- Text: `#0F172A` (Dark Blue)

## Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### AI Proxy

See `backend/README.md` for worker deployment and secrets.

## Troubleshooting

### Auth or Firestore issues

- Verify values in `js/config.js`.
- Confirm Email/Password auth is enabled.
- Re-check Firestore rules.

### AI suggestions not working

- Confirm worker is deployed and reachable.
- Confirm `GEMINI_API_KEY` secret is set in Cloudflare Worker.
- Confirm proxy URL in `js/ai.js`.
- Check dashboard AI diagnostics panel.

## Contact

Support and collaboration:

- Email: `nutrimte.test@gmail.com`

## License

Educational Final Year Project (FYP).
