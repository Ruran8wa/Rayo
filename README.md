# Rayo — Accessibility Navigation App

Rayo helps people with disabilities find and navigate accessible buildings in Kigali, Rwanda. Explore a live map, browse nearby places, view floor-by-floor accessibility details, and submit community reviews.

---

## Demo & Downloads

| | Link |
|-|------|
| 5-minute demo video | *(coming soon)* |
| Android APK | *(coming soon)* |

---

## Deployed Services

| Service | URL |
|---------|-----|
| Backend API | https://rayo-backend-hzh7.onrender.com/api |
| Backend API Docs (Swagger) | https://rayo-backend-hzh7.onrender.com/api/docs |
| ML API | *(not yet deployed)* |
| ML API Docs | *(not yet deployed)* |

---

## Project Structure

```
Rayo/
├── backend/        NestJS REST API — auth, buildings, sites, reviews, badges
├── frontend/       React Native mobile app — Expo + Expo Router
└── ml/             Accessibility prediction model — FastAPI + scikit-learn
    ├── api/            FastAPI prediction endpoint
    ├── data/           Synthetic + real-world datasets
    ├── models/         Trained model artifacts
    ├── notebooks/      Training & validation notebooks
    └── scripts/        Data processing & prediction scripts
```

---

## Tech Stack

- **Frontend:** React Native (Expo), Expo Router, React Query, React Native Maps, TypeScript
- **Backend:** NestJS, Prisma ORM, PostgreSQL (Supabase), Supabase Auth
- **ML:** Python, scikit-learn, FastAPI
- **External APIs:** Google Places API, Google Maps

---

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) ≥ 18 and npm
- [Python](https://python.org/) ≥ 3.11
- [Expo Go](https://expo.dev/go) installed on your phone (iOS or Android), **or** Android Studio with an emulator

---

## Quickest Way to Run (Frontend Only)

The backend is already deployed. To run just the mobile app:

```bash
git clone <repo-url>
cd Rayo/frontend
npm install
```

Create `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://rayo-backend-hzh7.onrender.com/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` to open on an Android emulator.

> If Expo fails to connect to its servers (e.g. no internet access during startup), run `npx expo start --offline` instead.

---

## Full Local Setup

Run all commands from the repo root (`Rayo/`) unless otherwise noted.

### 1. Clone

```bash
git clone <repo-url>
cd Rayo
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>"
SUPABASE_URL="https://<project>.supabase.co"
SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_JWT_SECRET="<jwt-secret>"
SUPABASE_API_SECRET="<service-role-key>"
GOOGLE_MAPS_API_KEY="<google-maps-key>"
```

```bash
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

API runs at `http://localhost:3000/api` — Swagger docs at `http://localhost:3000/api/docs`.

### 3. ML Service

```bash
cd ../ml
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

ML API runs at `http://localhost:8000` — docs at `http://localhost:8000/docs`.

### 4. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

> Use your machine's local network IP (e.g. `192.168.x.x`), not `localhost` — the phone can't reach `localhost` on your computer.

```bash
npx expo start
```

---

## Key Features

- **Live accessibility map** — Color-coded pins (fully / partial / not accessible), filterable by category (Health, Government, Bank, Education, Commercial)
- **Nearby places** — Google Places search with in-database matching; verified locations show full accessibility data
- **Site & building detail** — Floor-by-floor breakdown of mobility, visual, and hearing accessibility, personalized to the user's disability profile
- **Community reviews** — Submit reviews by building, floor, or specific service; visible to all users
- **Badge system** — Automatically earned badges for review contributions (Explorer, Community, Impact)
- **User profiles** — Set disability type to highlight relevant accessibility features throughout the app

---

## Key Files Reference

| Path | Description |
|------|-------------|
| `backend/prisma/schema.prisma` | Database schema — Sites, Buildings, Floors, Services, Reviews |
| `backend/src/` | NestJS modules: auth, buildings, sites, reviews, users |
| `frontend/app/` | Screens: map tab, browse tab, review tab, profile tab, building detail, site detail |
| `frontend/src/services/api/` | API client and service wrappers |
| `frontend/src/components/` | Shared UI components (map, buildings, sheets) |
| `ml/notebooks/model_training_v2.ipynb` | Latest model training notebook |
| `ml/api/main.py` | FastAPI prediction endpoint |
| `ml/scripts/predict.py` | Prediction logic |
| `ml/data/synthetic/` | Synthetic dataset generation scripts |
