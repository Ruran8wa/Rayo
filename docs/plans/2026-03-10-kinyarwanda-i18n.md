# Kinyarwanda i18n Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full English ↔ Kinyarwanda translation support to the Rayo mobile app, replacing all 200+ hardcoded strings with i18next translation keys across all 13 screens and 26 components.

**Architecture:** i18next + react-i18next for translation engine and React hooks; expo-localization for device locale detection; AsyncStorage for persisting user language preference. Single flat namespace with keys grouped by screen/feature in `en.json` / `rw.json`.

**Tech Stack:** React Native / Expo SDK 54, Expo Router v6, TypeScript, i18next, react-i18next, expo-localization

**Worktree:** Create a new git worktree at `~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n` on branch `feature/kinyarwanda-i18n`.

---

## Chunk 1: i18n Infrastructure + Translation Files

### Task 1: Create worktree and install packages

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Create the worktree and branch**

```bash
cd /home/ruran8wa/Dev/Capstone/Rayo
git worktree add ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n -b feature/kinyarwanda-i18n
```

- [ ] **Step 2: Install i18n packages**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n/frontend
npm install i18next react-i18next expo-localization
```

Expected: packages added to `node_modules/` and `package.json` updated.

- [ ] **Step 3: Verify packages and expo-localization API**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n/frontend
node -e "require('i18next'); require('react-i18next'); console.log('ok')"
node -e "const L = require('expo-localization'); console.log(typeof L.getLocales)"
```

Expected: `ok` then `function` (confirms SDK 54 `getLocales()` API is present, not the deprecated `locale` string).

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(i18n): install i18next, react-i18next, expo-localization"
```

---

### Task 2: Create translation files

**Files:**
- Create: `frontend/src/i18n/locales/en.json`
- Create: `frontend/src/i18n/locales/rw.json`

> **Note on Kinyarwanda translations:** The `rw.json` values below are provided as a starting point. All Kinyarwanda strings should be reviewed by a native speaker before production release. Keys with `[REVIEW]` comments are most likely to need correction.

- [ ] **Step 1: Create `en.json`**

Create `frontend/src/i18n/locales/en.json`:

```json
{
  "common": {
    "back": "← Back",
    "continue": "Continue",
    "skip": "Skip for now",
    "signIn": "Sign in",
    "createAccount": "Create an account",
    "signOut": "Sign out",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "Something went wrong",
    "open": "Open",
    "closed": "Closed",
    "verified": "Verified",
    "unknown": "Unknown",
    "earned": "Earned",
    "seeAll": "See all",
    "reviews": "reviews",
    "floors": "floors",
    "floor": "floor"
  },
  "accessibility": {
    "fully": "Fully Accessible",
    "partial": "Partially Accessible",
    "none": "Not Accessible",
    "fullyShort": "Fully",
    "partialShort": "Partial",
    "noneShort": "None",
    "unknownShort": "Unknown",
    "mobility": "Mobility",
    "visual": "Visual",
    "hearing": "Hearing"
  },
  "language": {
    "chooseTitle": "Choose your language",
    "chooseSubtitle": "Hitamo ururimi rwawe",
    "english": "English",
    "englishSub": "Continue in English",
    "kinyarwanda": "Kinyarwanda",
    "kinyarwandaSub": "Komeza mu Kinyarwanda",
    "changeHint": "You can change this later in Profile",
    "profileLabel": "Language / Ururimi"
  },
  "tabs": {
    "map": "Map",
    "browse": "Browse",
    "review": "Review",
    "profile": "Profile"
  },
  "onboarding": {
    "step1": "01",
    "step2": "02",
    "step3": "03",
    "slide1Title": "Find accessible spaces near you",
    "slide1Subtitle": "See which public buildings are fully, partially, or not accessible — all on a live map.",
    "slide2Title": "Explore every floor & service",
    "slide2Subtitle": "Drill into any building to see which services on each floor are accessible to you.",
    "slide3Title": "Share your experience",
    "slide3Subtitle": "Help the community by reviewing the accessibility of places you've visited.",
    "stepOf": "Step {{current}} of 3"
  },
  "map": {
    "searchPlaceholder": "Search places...",
    "nearMe": "Near me",
    "noBuildings": "No {{category}} buildings in the database yet",
    "distanceAway": "{{distance}} km away",
    "viewFloorsAndServices": "View floors & services →",
    "buildingsInSystem": "{{count}} building in our system",
    "buildingsInSystem_plural": "{{count}} buildings in our system",
    "notInSystem": "This place isn't in our system yet. Be the first to review its accessibility.",
    "writeFirstReview": "Write the first review"
  },
  "browse": {
    "title": "Browse Places",
    "subtitle": "Public services near you",
    "searchPlaceholder": "Search for a place...",
    "findingPlace": "Finding place...",
    "noPlacesFound": "No places found nearby.",
    "googleRating": "Google rating",
    "noAccessibilityData": "Accessibility data not yet available for this place. Be the first to review it.",
    "writeFirstReview": "Write the first review"
  },
  "building": {
    "loadError": "Could not load building details.",
    "features": "FEATURES",
    "floors": "FLOORS — SWIPE TO EXPLORE",
    "noFloorData": "No floor data available yet.",
    "communityReviews": "COMMUNITY REVIEWS ({{count}})",
    "writeReview": "Write a review",
    "noReviews": "No reviews yet. Be the first!",
    "whyThisScore": "WHY THIS SCORE?",
    "featureContributions": "Feature contributions from the ML model",
    "accessibilityScore": "ACCESSIBILITY SCORE",
    "model": "Model",
    "community": "Community",
    "combined": "Combined",
    "noReviewText": "No review text yet — add reviews to see community score"
  },
  "site": {
    "loadError": "Could not load site details.",
    "buildings": "BUILDINGS",
    "viewBuilding": "View {{name}}"
  },
  "review": {
    "guestTitle": "Share your experience",
    "guestSubtitle": "Sign in to write reviews, earn badges, and help others navigate accessible spaces.",
    "myReviews": "My Reviews",
    "communityImpact": "Your community impact",
    "reviewsStat": "Reviews",
    "savesStat": "Saves",
    "badgesStat": "Badges",
    "writeNew": "Write a new review",
    "myReviewsSection": "MY REVIEWS",
    "earnedBadges": "EARNED BADGES",
    "badgesToEarn": "BADGES TO EARN",
    "nextBadge": "NEXT BADGE",
    "fullyAccessible": "Fully Accessible",
    "partiallyAccessible": "Partially Accessible",
    "notAccessible": "Not Accessible"
  },
  "writeReview": {
    "title": "Write a Review",
    "subtitle": "Help others know what to expect",
    "goBack": "Go back",
    "change": "Change",
    "knownSite": "Known site",
    "otherPlace": "Other place",
    "noSitesFound": "No sites found.",
    "noBuildings": "No buildings found in this site.",
    "buildingCount": "{{count}} building",
    "buildingCount_plural": "{{count}} buildings",
    "placeNameLabel": "PLACE NAME",
    "placeNamePlaceholder": "e.g. Kigali City Tower",
    "addressLabel": "ADDRESS (OPTIONAL)",
    "addressPlaceholder": "e.g. KG 7 Ave, Kigali",
    "fillRatingHint": "✓ Fill in your rating below",
    "whatReviewing": "WHAT ARE YOU REVIEWING?",
    "wholeBuilding": "Whole building",
    "wholeBuildingDesc": "Overall impression",
    "specificFloor": "Specific floor",
    "specificFloorDesc": "Rate one floor",
    "specificService": "Specific service",
    "specificServiceDesc": "Rate one service",
    "accessibilityClass": "ACCESSIBILITY CLASS",
    "fullyAccessible": "Fully\nAccessible",
    "partiallyAccessible": "Partially\nAccessible",
    "notAccessible": "Not\nAccessible",
    "commentLabel": "YOUR COMMENT",
    "commentPlaceholder": "The ramp at the entrance works great, but the restrooms on this floor...",
    "submit": "Submit Review"
  },
  "profile": {
    "guestTitle": "You're browsing as a guest",
    "guestSubtitle": "Create an account to save places, write reviews, and personalize your experience.",
    "accessibilityNeeds": "MY ACCESSIBILITY NEEDS",
    "selectNeed": "Select your accessibility need",
    "selectNeedPlaceholder": "Select your accessibility need…",
    "uiPreferences": "UI PREFERENCES",
    "largeText": "Large text",
    "account": "ACCOUNT",
    "editName": "Edit name",
    "mobilityLabel": "Mobility Impairment",
    "mobilityDesc": "Large targets · Ramp & elevator priority",
    "visualLabel": "Visual Impairment",
    "visualDesc": "High contrast · Screen reader friendly",
    "hearingLabel": "Hearing Impairment",
    "hearingDesc": "Visual alerts · Induction loop info"
  },
  "auth": {
    "signInTitle": "Welcome back",
    "signInSubtitle": "Sign in to your account",
    "emailLabel": "EMAIL",
    "emailPlaceholder": "your@email.com",
    "passwordLabel": "PASSWORD",
    "passwordPlaceholder": "••••••••",
    "fillAllFields": "Please fill in all fields",
    "signInFailed": "Sign in failed",
    "signInButton": "Sign in",
    "noAccount": "Don't have an account?",
    "createAccountLink": "Create account",
    "registerTitle": "Create account",
    "registerSubtitle": "Join the Rayo community",
    "nameLabel": "FULL NAME",
    "namePlaceholder": "Jane Smith",
    "disabilityLabel": "DISABILITY TYPE (OPTIONAL)",
    "disabilityNone": "None",
    "disabilityMobility": "Mobility impairment",
    "disabilityVisual": "Visual impairment",
    "disabilityHearing": "Hearing impairment",
    "disabilityCognitive": "Cognitive",
    "fillRequired": "Please fill in all required fields",
    "registerFailed": "Registration failed",
    "createAccountButton": "Create account",
    "haveAccount": "Already have an account?",
    "signInLink": "Sign in"
  },
  "splash": {
    "tagline": "Every space, made clear."
  },
  "badges": {
    "unlocked": "BADGE UNLOCKED",
    "nice": "Nice!",
    "allBadges": "All Badges",
    "yourBadges": "YOUR BADGES",
    "progress": "{{current}} / {{required}}"
  },
  "filters": {
    "nearMe": "Near me",
    "health": "Health",
    "government": "Government",
    "bank": "Bank",
    "education": "Education",
    "commercial": "Commercial"
  }
}
```

- [ ] **Step 2: Create `rw.json`**

Create `frontend/src/i18n/locales/rw.json`:

> All values below should be reviewed by a native Kinyarwanda speaker.

```json
{
  "common": {
    "back": "← Subira",
    "continue": "Komeza",
    "skip": "Simbuka ubu",
    "signIn": "Injira",
    "createAccount": "Fungura konti",
    "signOut": "Sohoka",
    "save": "Bika",
    "cancel": "Hagarika",
    "loading": "Gutegereza...",
    "error": "Hari ikibazo",
    "open": "Fyanuye",
    "closed": "Bifunze",
    "verified": "Byemejwe",
    "unknown": "Ntizwi",
    "earned": "Yakuwe",
    "seeAll": "Reba byose",
    "reviews": "ibitekerezo",
    "floors": "inyanja",
    "floor": "ingorofa"
  },
  "accessibility": {
    "fully": "Yinjirwa neza",
    "partial": "Yinjirwa igice",
    "none": "Ntiyinjirwa",
    "fullyShort": "Neza",
    "partialShort": "Igice",
    "noneShort": "Oya",
    "unknownShort": "Ntizwi",
    "mobility": "Ubukanguka",
    "visual": "Ibibonwa",
    "hearing": "Gutunga"
  },
  "language": {
    "chooseTitle": "Hitamo ururimi rwawe",
    "chooseSubtitle": "Choose your language",
    "english": "Icyongereza",
    "englishSub": "Komeza mu Cyongereza",
    "kinyarwanda": "Kinyarwanda",
    "kinyarwandaSub": "Komeza mu Kinyarwanda",
    "changeHint": "Ushobora guhindura nyuma mu mwirondoro",
    "profileLabel": "Ururimi / Language"
  },
  "tabs": {
    "map": "Ikarita",
    "browse": "Shakisha",
    "review": "Igitekerezo",
    "profile": "Umwirondoro"
  },
  "onboarding": {
    "step1": "01",
    "step2": "02",
    "step3": "03",
    "slide1Title": "Shaka aho ufashwa hafi yawe",
    "slide1Subtitle": "Reba ibibiriro bifunguye neza, igice, cyangwa bitifunguye — byose ku ikarita.",
    "slide2Title": "Suzuma ingorofa na serivisi",
    "slide2Subtitle": "Injira mu kigo kandi urebe serivisi ku bw'ingorofa ifunguka kuwe.",
    "slide3Title": "Sangira uburambe bwawe",
    "slide3Subtitle": "Fasha umuryango usuzuma aho wajyaga.",
    "stepOf": "Intambwe {{current}} kuri 3"
  },
  "map": {
    "searchPlaceholder": "Shakisha ahantu...",
    "nearMe": "Hafi yanjye",
    "noBuildings": "Nta nyubako za {{category}} zihari none",
    "distanceAway": "{{distance}} km hafi",
    "viewFloorsAndServices": "Reba ingorofa na serivisi →",
    "buildingsInSystem": "Inyubako {{count}} muri sisitemu yacu",
    "buildingsInSystem_plural": "Inyubako {{count}} muri sisitemu yacu",
    "notInSystem": "Aha ntari muri sisitemu yacu. Ba wa mbere usuzume.",
    "writeFirstReview": "Andika igitekerezo cya mbere"
  },
  "browse": {
    "title": "Shakisha Ahantu",
    "subtitle": "Serivisi za leta hafi yawe",
    "searchPlaceholder": "Shakisha ahantu...",
    "findingPlace": "Gushakisha ahantu...",
    "noPlacesFound": "Nta hantu habonetse hafi.",
    "googleRating": "Amanota ya Google",
    "noAccessibilityData": "Amakuru y'ubufashaji ntabwo ahari. Ba wa mbere usuzume.",
    "writeFirstReview": "Andika igitekerezo cya mbere"
  },
  "building": {
    "loadError": "Amakuru y'inyubako ntiyashoboje gupakurwa.",
    "features": "IBIRANGA",
    "floors": "INGOROFA — SUNIKA KUGIRANGO UREBE",
    "noFloorData": "Nta makuru y'ingorofa arahari.",
    "communityReviews": "IBITEKEREZO BY'UMURYANGO ({{count}})",
    "writeReview": "Andika igitekerezo",
    "noReviews": "Nta bitekerezo bihari. Ba wa mbere!",
    "whyThisScore": "KUBERA AKI AMANOTA?",
    "featureContributions": "Umusanzu w'ibiranga biva kuri AI",
    "accessibilityScore": "AMANOTA Y'UBUFASHAJI",
    "model": "Modeli",
    "community": "Umuryango",
    "combined": "Hamwe",
    "noReviewText": "Nta bitekerezo bihari — andika kugirango urebe amanota y'umuryango"
  },
  "site": {
    "loadError": "Amakuru y'aho ntiyashoboje gupakurwa.",
    "buildings": "INYUBAKO",
    "viewBuilding": "Reba {{name}}"
  },
  "review": {
    "guestTitle": "Sangira uburambe bwawe",
    "guestSubtitle": "Injira kugirango wandike ibitekerezo, ubone ibimpango, no gufasha abandi.",
    "myReviews": "Ibitekerezo Byanjye",
    "communityImpact": "Umusanzu wawe ku muryango",
    "reviewsStat": "Ibitekerezo",
    "savesStat": "Ibibitswe",
    "badgesStat": "Ibimpango",
    "writeNew": "Andika igitekerezo gishya",
    "myReviewsSection": "IBITEKEREZO BYANJYE",
    "earnedBadges": "IBIMPANGO BYAKUWE",
    "badgesToEarn": "IBIMPANGO BYO GUKURA",
    "nextBadge": "IKIMPANGO GIKURIKIRA",
    "fullyAccessible": "Yinjirwa neza",
    "partiallyAccessible": "Yinjirwa igice",
    "notAccessible": "Ntiyinjirwa"
  },
  "writeReview": {
    "title": "Andika Igitekerezo",
    "subtitle": "Fasha abandi kumenya icyo bategereze",
    "goBack": "Subira inyuma",
    "change": "Hindura",
    "knownSite": "Aho hazwi",
    "otherPlace": "Ahandi hantu",
    "noSitesFound": "Nta hantu habonetse.",
    "noBuildings": "Nta nyubako zibonetse muri iri site.",
    "buildingCount": "Inyubako {{count}}",
    "buildingCount_plural": "Inyubako {{count}}",
    "placeNameLabel": "IZINA RY'AHO",
    "placeNamePlaceholder": "urugero: Kigali City Tower",
    "addressLabel": "ADERESI (SI NGOMBWA)",
    "addressPlaceholder": "urugero: KG 7 Ave, Kigali",
    "fillRatingHint": "✓ Uzuza amanota yawe hepfo",
    "whatReviewing": "URIMO GUSUZUMA IKI?",
    "wholeBuilding": "Inyubako yose",
    "wholeBuildingDesc": "Igitekerezo rusange",
    "specificFloor": "Ingorofa runaka",
    "specificFloorDesc": "Suzuma ingorofa imwe",
    "specificService": "Serivisi runaka",
    "specificServiceDesc": "Suzuma serivisi imwe",
    "accessibilityClass": "ICYICIRO CY'UBUFASHAJI",
    "fullyAccessible": "Yinjirwa\nneza",
    "partiallyAccessible": "Yinjirwa\nigice",
    "notAccessible": "Ntiyinjirwa",
    "commentLabel": "IGITEKEREZO CYAWE",
    "commentPlaceholder": "Inzira y'abajijuka ku muryango ikora neza, ariko bimwe ku ngorofa...",
    "submit": "Ohereza Igitekerezo"
  },
  "profile": {
    "guestTitle": "Uri kwiga nk'umushyitsi",
    "guestSubtitle": "Fungura konti kugirango ubike ahantu, wandike ibitekerezo, no guhuza uburambe bwawe.",
    "accessibilityNeeds": "IBYO NKENERA BY'UBUFASHAJI",
    "selectNeed": "Hitamo ubufashaji ukeneye",
    "selectNeedPlaceholder": "Hitamo ubufashaji ukeneye…",
    "uiPreferences": "IBYO NOKORA",
    "largeText": "Inyandiko nini",
    "account": "KONTI",
    "editName": "Hindura izina",
    "mobilityLabel": "Ubukanguka buke",
    "mobilityDesc": "Ibirande binini · Inzira y'abajijuka no ascenseur",
    "visualLabel": "Ibibonwa bike",
    "visualDesc": "Ibara rikaze · Isakaza ry'inyandiko",
    "hearingLabel": "Gutunga guke",
    "hearingDesc": "Imenyesha y'amaso · Amakuru y'induction loop"
  },
  "auth": {
    "signInTitle": "Murakaza neza",
    "signInSubtitle": "Injira muri konti yawe",
    "emailLabel": "IMELI",
    "emailPlaceholder": "imeli@yawe.com",
    "passwordLabel": "IJAMBO BANGA",
    "passwordPlaceholder": "••••••••",
    "fillAllFields": "Uzuza ibice byose",
    "signInFailed": "Kwinjira byanze",
    "signInButton": "Injira",
    "noAccount": "Nufite konti?",
    "createAccountLink": "Fungura konti",
    "registerTitle": "Fungura konti",
    "registerSubtitle": "Injira mu muryango wa Rayo",
    "nameLabel": "AMAZINA YOSE",
    "namePlaceholder": "Uwase Amina",
    "disabilityLabel": "UBUMUGA (SI NGOMBWA)",
    "disabilityNone": "Nta bumuga",
    "disabilityMobility": "Ubukanguka buke",
    "disabilityVisual": "Ibibonwa bike",
    "disabilityHearing": "Gutunga guke",
    "disabilityCognitive": "Ubwenge",
    "fillRequired": "Uzuza ibice byose ngombwa",
    "registerFailed": "Gufungura konti byanze",
    "createAccountButton": "Fungura konti",
    "haveAccount": "Usanzwe ufite konti?",
    "signInLink": "Injira"
  },
  "splash": {
    "tagline": "Aho hose, byumvikana."
  },
  "badges": {
    "unlocked": "IKIMPANGO CYAFUNGUWE",
    "nice": "Byiza!",
    "allBadges": "Ibimpango byose",
    "yourBadges": "IBIMPANGO BYAWE",
    "progress": "{{current}} / {{required}}"
  },
  "filters": {
    "nearMe": "Hafi yanjye",
    "health": "Ubuzima",
    "government": "Leta",
    "bank": "Banki",
    "education": "Uburezi",
    "commercial": "Ubucuruzi"
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/src/i18n/locales/
git commit -m "feat(i18n): add en.json and rw.json translation files"
```

---

### Task 3: i18next config and TypeScript types

**Files:**
- Create: `frontend/src/i18n/index.ts`
- Create: `frontend/src/i18n/types.ts`

- [ ] **Step 1: Create `src/i18n/types.ts`**

```typescript
import en from './locales/en.json';

export type TranslationKeys = typeof en;
export type I18nNamespace = 'translation';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}
```

- [ ] **Step 2: Create `src/i18n/index.ts`**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import rw from './locales/rw.json';

export const LANGUAGE_KEY = '@rayo/language';
export const SUPPORTED_LANGUAGES = ['en', 'rw'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export async function getInitialLanguage(): Promise<SupportedLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'rw') return saved;
  } catch {}
  // Fall back to device locale
  const locale = Localization.getLocales()[0]?.languageCode ?? 'en';
  return locale.startsWith('rw') ? 'rw' : 'en';
}

export async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export async function initI18n(): Promise<void> {
  const lng = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        rw: { translation: rw },
      },
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
}

export default i18n;
```

- [ ] **Step 3: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/src/i18n/
git commit -m "feat(i18n): add i18next config and TypeScript types"
```

---

### Task 4: Wire i18next into the app root

**Files:**
- Modify: `frontend/app/_layout.tsx`

- [ ] **Step 1: Read the current `app/_layout.tsx`**

Read the file and note the existing root layout structure.

- [ ] **Step 2: Add i18n init and I18nextProvider**

At the top of `app/_layout.tsx`, add:

```typescript
import '../src/i18n/types'; // register types
import i18n, { initI18n } from '../src/i18n';
import { I18nextProvider } from 'react-i18next';
```

Add an `i18nReady` state and call `initI18n()` in a `useEffect` before the app renders. Wrap the root `<Stack>` (or equivalent) in `<I18nextProvider i18n={i18n}>`:

```typescript
const [i18nReady, setI18nReady] = React.useState(false);

useEffect(() => {
  initI18n().then(() => setI18nReady(true));
}, []);

if (!i18nReady) return null; // or a splash screen

return (
  <I18nextProvider i18n={i18n}>
    {/* existing root layout content */}
  </I18nextProvider>
);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n/frontend
node_modules/.bin/tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```

Expected: No errors related to i18n files.

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/app/_layout.tsx
git commit -m "feat(i18n): wire I18nextProvider into app root"
```

---

## Chunk 2: Language Switcher UI

### Task 5: Onboarding — language selection slide

**Files:**
- Modify: `frontend/app/onboarding.tsx`

- [ ] **Step 1: Read the current `app/onboarding.tsx`**

Note the existing SLIDES array and navigation structure.

- [ ] **Step 2: Add language slide as the first screen**

Import at the top:
```typescript
import { useTranslation } from 'react-i18next';
import i18n, { saveLanguage, type SupportedLanguage } from '../src/i18n';
```

Add a `languageSelected` state (default `false`). Before the slides are shown, if `languageSelected` is false, render the language selection screen:

```tsx
const { t } = useTranslation();
const [languageSelected, setLanguageSelected] = React.useState(false);

async function handleLanguageSelect(lang: SupportedLanguage) {
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
  setLanguageSelected(true);
}

if (!languageSelected) {
  return (
    <View style={langStyles.container}>
      <Text style={langStyles.emoji}>🌍</Text>
      <View style={langStyles.textBlock}>
        <Text style={langStyles.title}>{t('language.chooseTitle')}</Text>
        <Text style={langStyles.subtitle}>{t('language.chooseSubtitle')}</Text>
      </View>
      <Pressable
        style={langStyles.btnPrimary}
        onPress={() => handleLanguageSelect('en')}
        accessibilityRole="button"
      >
        <View>
          <Text style={langStyles.btnPrimaryTitle}>{t('language.english')}</Text>
          <Text style={langStyles.btnPrimarySubtitle}>{t('language.englishSub')}</Text>
        </View>
        <Text style={langStyles.arrow}>→</Text>
      </Pressable>
      <Pressable
        style={langStyles.btnSecondary}
        onPress={() => handleLanguageSelect('rw')}
        accessibilityRole="button"
      >
        <View>
          <Text style={langStyles.btnSecondaryTitle}>{t('language.kinyarwanda')}</Text>
          <Text style={langStyles.btnSecondarySubtitle}>{t('language.kinyarwandaSub')}</Text>
        </View>
        <Text style={langStyles.arrowSecondary}>→</Text>
      </Pressable>
      <Text style={langStyles.hint}>{t('language.changeHint')}</Text>
    </View>
  );
}
```

Add `langStyles` using existing Colors/Spacing/BorderRadius tokens:
```typescript
const langStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  emoji: { fontSize: 48, marginBottom: Spacing.sm },
  textBlock: { alignItems: 'center', gap: Spacing.xs },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  btnPrimary: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnPrimaryTitle: { color: Colors.white, fontWeight: '600', fontSize: 15 },
  btnPrimarySubtitle: { color: Colors.white + '99', fontSize: 12, marginTop: 2 },
  arrow: { color: Colors.white, fontSize: 18 },
  btnSecondary: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnSecondaryTitle: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  btnSecondarySubtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  arrowSecondary: { color: Colors.primary, fontSize: 18 },
  hint: { fontSize: 11, color: Colors.textSecondary, marginTop: Spacing.xs },
});
```

- [ ] **Step 3: Replace remaining hardcoded strings in onboarding.tsx with `t()` calls**

Using the key map:
- `"Find accessible spaces near you"` → `t('onboarding.slide1Title')`
- `"See which public buildings..."` → `t('onboarding.slide1Subtitle')`
- `"Explore every floor & service"` → `t('onboarding.slide2Title')`
- `"Drill into any building..."` → `t('onboarding.slide2Subtitle')`
- `"Share your experience"` → `t('onboarding.slide3Title')`
- `"Help the community..."` → `t('onboarding.slide3Subtitle')`
- `"Create an account"` → `t('common.createAccount')`
- `"Continue as guest"` → `t('common.skip')`
- `"Continue"` → `t('common.continue')`
- `"Skip for now"` → `t('common.skip')`
- `"Step X of 3"` → `t('onboarding.stepOf', { current: X })`

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/app/onboarding.tsx
git commit -m "feat(i18n): add language selection slide to onboarding"
```

---

### Task 6: Profile tab — language toggle row

**Files:**
- Modify: `frontend/app/(tabs)/profile.tsx`

- [ ] **Step 1: Read the current `app/(tabs)/profile.tsx`**

Locate the Settings section to find the right insertion point.

- [ ] **Step 2: Add language row with EN/RW toggle pills**

Import at the top:
```typescript
import { useTranslation } from 'react-i18next';
import i18n, { saveLanguage, type SupportedLanguage } from '../../src/i18n';
```

Inside the component:
```typescript
const { t } = useTranslation();
const currentLang = i18n.language as SupportedLanguage;

async function handleLangChange(lang: SupportedLanguage) {
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
}
```

Add the language row in the Settings section (after the disability row):
```tsx
<View style={styles.settingRow}>
  <Text style={styles.settingIcon}>🌍</Text>
  <View style={styles.settingContent}>
    <Text style={styles.settingTitle}>{t('language.profileLabel')}</Text>
    <Text style={styles.settingSubtitle}>
      {currentLang === 'rw' ? 'Kinyarwanda' : 'English'}
    </Text>
  </View>
  <View style={styles.langPills}>
    <Pressable
      style={[styles.pill, currentLang === 'en' && styles.pillActive]}
      onPress={() => handleLangChange('en')}
      accessibilityRole="button"
    >
      <Text style={[styles.pillText, currentLang === 'en' && styles.pillTextActive]}>EN</Text>
    </Pressable>
    <Pressable
      style={[styles.pill, currentLang === 'rw' && styles.pillActive]}
      onPress={() => handleLangChange('rw')}
      accessibilityRole="button"
    >
      <Text style={[styles.pillText, currentLang === 'rw' && styles.pillTextActive]}>RW</Text>
    </Pressable>
  </View>
</View>
```

Add to `StyleSheet.create`:
```typescript
langPills: { flexDirection: 'row', gap: 4 },
pill: {
  borderRadius: 20,
  paddingHorizontal: Spacing.sm,
  paddingVertical: Spacing.xs,
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.background,
},
pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
pillText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
pillTextActive: { color: Colors.white },
```

- [ ] **Step 3: Replace all hardcoded strings in profile.tsx with `t()` calls**

Using the key map:
- `"You're browsing as a guest"` → `t('profile.guestTitle')`
- `"Create an account to save places..."` → `t('profile.guestSubtitle')`
- `"Sign in"` → `t('common.signIn')`
- `"Create an account"` → `t('common.createAccount')`
- `"MY ACCESSIBILITY NEEDS"` → `t('profile.accessibilityNeeds')`
- `"Mobility Impairment"` → `t('profile.mobilityLabel')`
- `"Large targets · Ramp & elevator priority"` → `t('profile.mobilityDesc')`
- `"Visual Impairment"` → `t('profile.visualLabel')`
- `"High contrast · Screen reader friendly"` → `t('profile.visualDesc')`
- `"Hearing Impairment"` → `t('profile.hearingLabel')`
- `"Visual alerts · Induction loop info"` → `t('profile.hearingDesc')`
- `"UI PREFERENCES"` → `t('profile.uiPreferences')`
- `"Large text"` → `t('profile.largeText')`
- `"ACCOUNT"` → `t('profile.account')`
- `"Sign out"` → `t('common.signOut')`

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/app/(tabs)/profile.tsx
git commit -m "feat(i18n): add language toggle to profile tab"
```

---

## Chunk 3: String Extraction — Screens

### Task 7: Extract strings from tab screens

**Files:**
- Modify: `frontend/app/(tabs)/_layout.tsx`
- Modify: `frontend/app/(tabs)/index.tsx`
- Modify: `frontend/app/(tabs)/browse.tsx`
- Modify: `frontend/app/(tabs)/review.tsx`

For each file, add `import { useTranslation } from 'react-i18next';` and `const { t } = useTranslation();` inside the component, then replace strings per the maps below.

- [ ] **Step 1: `app/(tabs)/_layout.tsx`** — tab labels

`TabLayout` is already a functional component. Add `const { t } = useTranslation();` inside the function body (after existing hooks) and replace the four string literals in-place within the JSX. No structural change needed:

```typescript
// Inside TabLayout():
const { t } = useTranslation();

// Replace in JSX:
// "Map"     → {t('tabs.map')}
// "Browse"  → {t('tabs.browse')}
// "Review"  → {t('tabs.review')}
// "Profile" → {t('tabs.profile')}
```

- [ ] **Step 2: `app/(tabs)/index.tsx`** — map tab

```
"Near me"                                   → t('map.nearMe') / t('filters.nearMe')
"No {category} buildings in the database yet" → t('map.noBuildings', { category })
```

- [ ] **Step 3: `app/(tabs)/browse.tsx`**

```
"Browse Places"                          → t('browse.title')
"Public services near you"               → t('browse.subtitle')
"Search for a place..."                  → t('browse.searchPlaceholder')
"Verified"                               → t('common.verified')
"Unknown"                                → t('common.unknown')
"Finding place..."                       → t('browse.findingPlace')
"No places found nearby."               → t('browse.noPlacesFound')
"Google rating"                          → t('browse.googleRating')
"reviews"                                → t('common.reviews')
"Accessibility data not yet available..." → t('browse.noAccessibilityData')
"Write the first review"                 → t('browse.writeFirstReview')
```

- [ ] **Step 4: `app/(tabs)/review.tsx`**

```
"Share your experience"                 → t('review.guestTitle')
"Sign in to write reviews..."           → t('review.guestSubtitle')
"Sign in"                               → t('common.signIn')
"Create an account"                     → t('common.createAccount')
"My Reviews"                            → t('review.myReviews')
"Your community impact"                 → t('review.communityImpact')
"Reviews"                               → t('review.reviewsStat')
"Saves"                                 → t('review.savesStat')
"Badges"                                → t('review.badgesStat')
"Write a new review"                    → t('review.writeNew')
"MY REVIEWS"                            → t('review.myReviewsSection')
"EARNED BADGES"                         → t('review.earnedBadges')
"BADGES TO EARN"                        → t('review.badgesToEarn')
"NEXT BADGE"                            → t('review.nextBadge')
"Fully Accessible"                      → t('review.fullyAccessible')
"Partially Accessible"                  → t('review.partiallyAccessible')
"Not Accessible"                        → t('review.notAccessible')
```

- [ ] **Step 5: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/app/(tabs)/
git commit -m "feat(i18n): extract strings from tab screens"
```

---

### Task 8: Extract strings from detail and auth screens

**Files:**
- Modify: `frontend/app/building/[id].tsx`
- Modify: `frontend/app/site/[id].tsx`
- Modify: `frontend/app/review/new.tsx`
- Modify: `frontend/app/(auth)/sign-in.tsx`
- Modify: `frontend/app/(auth)/register.tsx`
- Modify: `frontend/app/index.tsx`

- [ ] **Step 1: `app/building/[id].tsx`**

```
"Could not load building details."          → t('building.loadError')
"FEATURES"                                  → t('building.features')
"FLOORS — SWIPE TO EXPLORE"                 → t('building.floors')
"No floor data available yet."              → t('building.noFloorData')
"COMMUNITY REVIEWS ({count})"               → t('building.communityReviews', { count: reviews.length })
"Write a review"                            → t('building.writeReview')
"No reviews yet. Be the first!"             → t('building.noReviews')
"Mobility"                                  → t('accessibility.mobility')
"Visual"                                    → t('accessibility.visual')
"Hearing"                                   → t('accessibility.hearing')
"Fully Accessible" / "Partially Accessible" / "Not Accessible"
  (in the LEVEL_LABELS dict near the top)   → t('accessibility.fully') / t('accessibility.partial') / t('accessibility.none')
"WHY THIS SCORE?"                           → t('building.whyThisScore')
"Feature contributions from the ML model"  → t('building.featureContributions')
"ACCESSIBILITY SCORE"                       → t('building.accessibilityScore')
"Model"                                     → t('building.model')
"Community"                                 → t('building.community')
"Combined"                                  → t('building.combined')
"No review text yet — add reviews..."       → t('building.noReviewText')
```

Note: `LEVEL_LABELS` is a plain object at the top of the file. Convert it to a function or inline `t()` calls at the usage site since hooks cannot be used outside components.

- [ ] **Step 2: `app/site/[id].tsx`**

```
"Could not load site details." → t('site.loadError')
"BUILDINGS"                    → t('site.buildings')
"View {name}"                  → t('site.viewBuilding', { name })
```

- [ ] **Step 3: `app/review/new.tsx`**

Replace all strings per the `writeReview.*` key map in the translation files.

- [ ] **Step 4: `app/(auth)/sign-in.tsx`**

Replace static strings per the `auth.*` key map. **Important:** The `catch` block that calls `setError(e.message)` uses a dynamic API error string — do NOT wrap `e.message` in `t()`. Only replace the static fallback strings (`"Please fill in all fields"` → `t('auth.fillAllFields')` and `"Sign in failed"` → `t('auth.signInFailed')`).

- [ ] **Step 5: `app/(auth)/register.tsx`**

Replace static strings per the `auth.*` key map. Same rule as sign-in: dynamic `e.message` from the API catch block must NOT be wrapped in `t()` — only replace the static `"Please fill in all required fields"` and `"Registration failed"` fallback strings.

- [ ] **Step 6: `app/index.tsx`**

```
"Every space, made clear." → t('splash.tagline')
```

Note: `"rayo"` is the brand name — leave it as-is.

- [ ] **Step 7: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/app/building/ frontend/app/site/ frontend/app/review/ frontend/app/(auth)/ frontend/app/index.tsx
git commit -m "feat(i18n): extract strings from detail, review, and auth screens"
```

---

## Chunk 4: String Extraction — Components

### Task 9: Extract strings from building components

**Files:**
- Modify: `frontend/src/components/buildings/building-card.tsx`
- Modify: `frontend/src/components/buildings/floor-card.tsx`
- Modify: `frontend/src/components/ui/accessibility-badge.tsx`
- Modify: `frontend/src/components/buildings/shap-explanation-card.tsx`
- Modify: `frontend/src/components/buildings/hybrid-score-row.tsx`

For each component, add `import { useTranslation } from 'react-i18next';` and `const { t } = useTranslation();` then replace:

- [ ] **Step 1: `building-card.tsx`**

```
"Open"           → t('common.open')
"Closed"         → t('common.closed')
"{count} floor"  → t('common.floor') / t('common.floors')
```

- [ ] **Step 2: `floor-card.tsx`**

```
"Mobility" → t('accessibility.mobility')
"Visual"   → t('accessibility.visual')
"Hearing"  → t('accessibility.hearing')
"↕ swipe"  → leave as-is (icon hint, universally understood)
```

- [ ] **Step 3: `accessibility-badge.tsx`**

The badge currently uses a static object for labels. Replace with `t()`:
```
"Fully"   → t('accessibility.fullyShort')
"Partial" → t('accessibility.partialShort')
"None"    → t('accessibility.noneShort')
"Unknown" → t('accessibility.unknownShort')
```

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/src/components/buildings/
git commit -m "feat(i18n): extract strings from building components"
```

---

### Task 10: Extract strings from map, review, badge, and onboarding components

**Files:**
- Modify: `frontend/src/components/map/map-search-bar.tsx`
- Modify: `frontend/src/components/map/building-preview-sheet.tsx`
- Modify: `frontend/src/components/map/site-preview-sheet.tsx`
- Modify: `frontend/src/components/map/unverified-place-sheet.tsx`
- Modify: `frontend/src/components/review/badge-strip.tsx`
- Modify: `frontend/src/components/badges/BadgeEarnedModal.tsx`
- Modify: `frontend/src/components/badges/AllBadgesSheet.tsx`
- Modify: `frontend/src/components/onboarding/slide.tsx`

- [ ] **Step 1: Map components**

`map-search-bar.tsx`:
```
"Search places..." → t('map.searchPlaceholder')
```
Note: `"rayo"` brand name — leave as-is.

`building-preview-sheet.tsx`:
```
"{distance} km away"        → t('map.distanceAway', { distance })
"View floors & services →"  → t('map.viewFloorsAndServices')
```

**Important:** The address and distance are composed as a single inline template literal (e.g. `` `${building.address} · ${building.distance_km} km away` ``). Do NOT try to translate the whole template. Instead render them as two sibling `<Text>` nodes, or keep the address as-is and append only the translated distance suffix: `t('map.distanceAway', { distance: building.distance_km })`.

`site-preview-sheet.tsx`:
```
"{count} building(s) in our system" → t('map.buildingsInSystem', { count })
"View {name}"                       → t('site.viewBuilding', { name })
```

`unverified-place-sheet.tsx`:
```
"Unknown"                                   → t('common.unknown')
"This place isn't in our system yet..."     → t('map.notInSystem')
"Write the first review"                    → t('map.writeFirstReview')
```

- [ ] **Step 2: Badge and review components**

`badge-strip.tsx`:
```
"YOUR BADGES" → t('badges.yourBadges')
"See all"     → t('common.seeAll')
"Earned"      → t('common.earned')
```

`BadgeEarnedModal.tsx`:
```
"BADGE UNLOCKED" → t('badges.unlocked')
"Nice!"          → t('badges.nice')
```

`AllBadgesSheet.tsx`:
```
"All Badges"              → t('badges.allBadges')
"Earned"                  → t('common.earned')
"{current} / {required}"  → t('badges.progress', { current, required })
```

- [ ] **Step 3: Onboarding slide component**

`slide.tsx`:
```
"Step {number} of 3" → t('onboarding.stepOf', { current: number })
```

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/src/components/
git commit -m "feat(i18n): extract strings from map, badge, and onboarding components"
```

---

### Task 11: Extract strings from filter store

**Files:**
- Modify: `frontend/src/stores/filter.store.ts`

The filter store likely has category label strings used in the UI. Since Zustand stores run outside React, strings here should be moved to translation keys used at the render site rather than in the store itself.

- [ ] **Step 1: Read `filter.store.ts`**

Identify where category label strings are defined (e.g., `"Near me"`, `"Health"`, etc.).

- [ ] **Step 2: Do NOT change store values**

The filter values (e.g. `"Near me"`, `"Health"`) are also used as API query parameters — changing them would break backend calls. Keep all store values unchanged.

- [ ] **Step 3: Translate at the render site**

In the component that renders filter chips (likely `category-chip-row.tsx` and `browse.tsx`), map each filter value to its translation key at the point where the label is rendered:

```typescript
// In the chip/label render:
const { t } = useTranslation();

// Map store value → translation key at render time
const FILTER_KEY_MAP: Record<string, string> = {
  'Near me':    'filters.nearMe',
  'Health':     'filters.health',
  'Government': 'filters.government',
  'Bank':       'filters.bank',
  'Education':  'filters.education',
  'Commercial': 'filters.commercial',
};

// Then in JSX:
<Text>{t(FILTER_KEY_MAP[filterValue] ?? filterValue)}</Text>
```

- [ ] **Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add frontend/src/stores/filter.store.ts frontend/src/components/map/
git commit -m "feat(i18n): move filter category labels to translation keys"
```

---

### Task 12: Final type-check and smoke test

- [ ] **Step 1: Type-check the frontend**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n/frontend
npm install  # ensure node_modules exist
node_modules/.bin/tsc --noEmit 2>&1 | grep -v node_modules
```

Expected: No errors in `src/` or `app/` files.

- [ ] **Step 2: Verify every key in `en.json` exists in `rw.json`**

```bash
node -e "
const en = require('./src/i18n/locales/en.json');
const rw = require('./src/i18n/locales/rw.json');

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? getKeys(v, prefix ? prefix+'.'+k : k) : [prefix ? prefix+'.'+k : k]
  );
}

const enKeys = getKeys(en);
const rwKeys = getKeys(rw);
const missing = enKeys.filter(k => !rwKeys.includes(k));
if (missing.length) {
  console.log('Missing from rw.json:', missing);
  process.exit(1);
} else {
  console.log('All', enKeys.length, 'keys present in rw.json ✓');
}
"
```

Expected: `All N keys present in rw.json ✓`

- [ ] **Step 3: Commit**

```bash
cd ~/.config/superpowers/worktrees/Rayo/kinyarwanda-i18n
git add -A
git commit -m "feat(i18n): complete Kinyarwanda translation coverage"
```

---

## Notes for Native Speaker Review

The following categories of Kinyarwanda strings in `rw.json` are most likely to need correction by a native speaker:

1. **Accessibility terminology** — `accessibility.*` keys (ubukanguka, ibibonwa, gutunga)
2. **Disability labels** — `profile.mobilityLabel`, `profile.visualLabel`, `profile.hearingLabel`
3. **Technical UI terms** — badge names, score labels
4. **Tagline** — `splash.tagline` ("Aho hose, byumvikana.")

After review, update `rw.json` directly and commit with `fix(i18n): correct Kinyarwanda translations`.
