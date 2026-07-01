# CURRENT_STATE — pestouni-crm-mobile

**Verze:** 0.1.1 (Expo scaffold downgradován na SDK 56, web platform fix)
**Architektura:** Samostatná React Native / Expo app — NE responsive web, NE @media přelití.
Sdílí Firebase projekt s webem (`pestouni-crm-prototyp`), stejný Firestore tenant model
(`tenants/{tenantId}/data_objects`) a stejné bezpečnostní pravidlo: role se čtou
VÝHRADNĚ z `user_roles/{uid}`, nikdy z Custom Claims.

**Co je funkční:**
- **Expo SDK 56** (React Native 0.85.3, React 19), JS (ne TypeScript) — downgradováno z 57 (vydáno 2026-06-30, Expo Go v obchodech ho ještě nepodporuje — viz Errors níže)
- `App.js` — auth bootstrap (`initAuth`), loading splash, podmíněné Login/Tabs
- `src/services/firebase.js` — Firebase init, platform-specific persistence: `getReactNativePersistence(AsyncStorage)` na iOS/Android, `getAuth(app)` (browser persistence) na webu
- `src/services/auth.js`, `src/services/dataService.js` — 1:1 port logiky z webu (ROLE_CAPS, fetchDataObjects bez composite indexu)
- `src/screens/LoginScreen.js` — nativní formulář (TextInput, KeyboardAvoidingView), stejné mapování Firebase chyb jako web
- `src/screens/DashboardScreen.js` — KPI karty + seznam posledních rodin, pull-to-refresh (`RefreshControl`)
- `src/navigation/RootNavigator.js` — bottom tab bar (Přehled/Pěstouni/Děti/Kalendář/Více), max 5 položek dle UX pravidla
- `src/screens/MoreScreen.js` — profil, role, odhlášení
- `src/screens/PlaceholderScreen.js` — stub pro Pěstouni/Děti/Kalendář (čeká na implementaci)
- `.env.local` — `EXPO_PUBLIC_FIREBASE_*` (stejný Firebase projekt jako web), gitignored
- `react-dom` + `react-native-web` doinstalováno (umožňuje `npx expo start --web`)
- Ověřeno: `npx expo export --platform android` i `--platform web` na SDK 56 — 0 chyb

**Vyřešené chyby (2026-06-30):**
- `npm install expo` omylem spuštěný ve WEBOVÉM projektu (`pestouni-crm-prototyp`) — ERESOLVE konflikt, ale npm selhal ještě před jakoukoli změnou; web projekt ověřeně nedotčen (`package.json`/`package-lock.json`/`node_modules` čisté, build proběhl).
- `--web` chybělo `react-dom`/`react-native-web` → doinstalováno.
- `[TypeError] getReactNativePersistence is not a function` na webu — `firebase/auth` exportuje tuto funkci jen pro RN build, ne web. Opraveno větvením podle `Platform.OS` v `firebase.js`.
- „Project is incompatible with this version of Expo Go" i po aktualizaci appky — SDK 57.0.1 vyšlo prakticky ve stejný den, Expo Go v App Store/Google Play release lag. **Řešeno downgradem na SDK 56.0.x** (`npx expo install expo@^56.0.0 && npx expo install --fix`).

**Jak spustit:**
```
cd pestouni-crm-mobile
npx expo start
```
Naskenovat QR v Expo Go appce (iOS/Android), nebo `npx expo start --android` / `--ios` s emulátorem.

**Chybí / TODO:**
- Pěstouni/Děti/Kalendář — reálná implementace (zatím PlaceholderScreen)
- Dokumenty, Vzdělávání, Kontakty, Nastavení, Uživatelé — nejsou v bottom tab baru (limit 5), plán: dostupné přes „Více"
- Firestore offline persistence na RN je jen in-memory (JS SDK nemá IndexedDB ekvivalent) — pro plné offline-first by bylo nutné `@react-native-firebase/firestore` (nativní modul, V8/produkční vylepšení)
- Push notifikace, kamera (OCR dokladů), biometrika — nejsou součástí tohoto MVP scaffoldu
- Appka nebyla zatím testována na reálném zařízení/emulátoru (jen Metro export bez chyb) — doporučeno ověřit `npx expo start` + Expo Go před dalším rozšiřováním
