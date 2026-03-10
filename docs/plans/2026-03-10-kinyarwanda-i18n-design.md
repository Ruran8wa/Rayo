# Kinyarwanda i18n Design

**Goal:** Add full English ↔ Kinyarwanda translation support to the Rayo mobile app, covering all visible strings across all 13 screens and 26 components.

**Branch:** `feature/kinyarwanda-i18n` off `main`

---

## Architecture

**Libraries:**
- `i18next` — translation engine
- `react-i18next` — React hooks (`useTranslation`)
- `expo-localization` — device locale detection

**Language detection flow (on app start):**
1. Check `AsyncStorage` for saved language preference
2. If found → use it
3. If not → read device locale via `expo-localization`
4. Device locale starts with `rw` → Kinyarwanda; otherwise → English

**Persistence:** Language choice saved to `AsyncStorage` under a `language` key. Updated whenever user changes language in onboarding or Profile.

---

## New Files

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18next init, AsyncStorage language detector, expo-localization fallback |
| `src/i18n/locales/en.json` | All English strings (~200 keys) |
| `src/i18n/locales/rw.json` | All Kinyarwanda strings (~200 keys) |
| `src/i18n/types.ts` | TypeScript key types for `t()` autocomplete |

---

## Translation File Structure

Single flat namespace, keys grouped by screen/feature:

```json
{
  "onboarding": { ... },
  "tabs": { ... },
  "map": { ... },
  "browse": { ... },
  "building": { ... },
  "site": { ... },
  "review": { ... },
  "profile": { ... },
  "auth": { ... },
  "badges": { ... },
  "common": { ... }
}
```

Any key missing from `rw.json` automatically falls back to English.

---

## UI Changes

### Onboarding (first launch)
- Add a **language selection slide as slide 0** (before the existing 3 slides)
- Two large buttons: "English" and "Kinyarwanda / Ikinyarwanda"
- On selection: call `i18n.changeLanguage()` + save to AsyncStorage
- Subtitle in both languages: "Choose your language / Hitamo ururimi rwawe"

### Profile tab
- Add a **"Language / Ururimi" row** in the Settings section
- Shows current language as a subtitle ("English" or "Kinyarwanda")
- EN / RW toggle pills — tapping switches instantly via `i18n.changeLanguage()` + AsyncStorage

---

## Modified Files

- `app/_layout.tsx` — wrap root in `<I18nextProvider>`
- `app/onboarding.tsx` — add language slide 0
- `app/(tabs)/profile.tsx` — add Language row
- All 13 screens — replace hardcoded strings with `t('key')`
- All 26 components — replace hardcoded strings with `t('key')`

**Not changed:** backend API, navigation structure, styles, colors, assets.

---

## Notes

- Kinyarwanda strings in `rw.json` should be reviewed by a native speaker for accuracy
- i18next fallback language is English — partial `rw.json` is safe during development
- TypeScript types generated from `en.json` shape give full autocomplete on all translation keys
