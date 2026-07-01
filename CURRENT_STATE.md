# CURRENT_STATE — pestouni-crm-mobile

**⏰ ODLOŽENO NA 2026-07-06 — PŘIPOMENOUT:** Uživatel je na dovolené v hotelu, nemá u sebe Android
telefon. Naplánováno na 6.7.2026 (uživatel to ten den řekl sám, automatická připomínka se bohužel
nepodařila nastavit kvůli chybě scheduling nástroje):
1. **Android build** — `eas build --platform android --profile preview` (zdarma, žádný účet, .apk k sideloadu)
2. **iPhone build** — uživatel řekl, že 6.7.2026 vyřeší **Apple Developer Program** (99 $/rok, developer.apple.com,
   nutné pro instalaci na reálný iPhone 17 Pro). Jakmile má účet: `eas build --platform ios` (nebo
   `eas build --platform all` pro obě platformy najednou).
Do té doby (do 6.7.2026): pracovat hlavně na **web appce** (Desktop + PWA na `moje.doprovazeni.com`,
funguje už teď bez dalšího kroku) a dál rozvíjet appku přes **Expo Go** (SDK 54, funguje).

**Verze:** 0.4.0 (EAS Update CI/CD PLNĚ FUNKČNÍ — první zelený běh)
**Stav CI/CD (2026-07-01):** `.github/workflows/eas-update.yml` run #4 (re-run) skončil ✅ **Success** (1m 59s).
Push do `main` teď skutečně publikuje OTA update na kanál `production` bez zásahu.

**Cesta k funkčnímu CI/CD — 3 bugy postupně opravené:**
1. **YAML syntax error** (řádek 48) — `--message "Auto-deploy: ${{ ... }}"` obsahovalo `": "` (dvojtečka+mezera)
   uvnitř nekvótovaného YAML skaláru → YAML parser to čte jako vnořený klíč. **Fix:** blokový skalár `run: |`.
2. **Shell "bad substitution"** — commit message TOHOTO OPRAVNÉHO COMMITU náhodou obsahovala text `${{ ... }}`
   (protože popisovala bug č. 1), což se doslovně interpolovalo do shell příkazu a bash se to pokusil
   vyhodnotit jako proměnnou. **Fix:** commit message přes `env: COMMIT_MESSAGE: ${{ github.event.head_commit.message }}`
   + `"$COMMIT_MESSAGE"` v `run:` — env proměnné se nere-parsují shellem, takže je to i obecně bezpečnější
   vzor proti injection (nikdy needitovaný text nedávat přímo do `run:` přes `${{ }}`).
3. **EXPO_TOKEN autorizační chyba** (`Entity not authorized ... RobotViewerContext`) — token byl vytvořený
   pod OSOBNÍM Expo účtem uživatele, ale EAS projekt patří účtu `doprovazeni.com`. **Fix:** token vytvořen
   znovu na `https://expo.dev/accounts/doprovazeni.com/settings/access-tokens` (organizační účet, ne osobní).

**Poučení:** u vícero-účtových Expo/EAS nastavení vždy zkontrolovat, že robot token je vytvořený
POD SPRÁVNÝM ÚČTEM (tím, co vlastní projekt), ne pod výchozím/osobním účtem uživatele.

**Verze (předchozí):** 0.3.0 (KONEČNĚ FUNKČNÍ v Expo Go — SDK 54)
**Vyřešeno (2026-07-01):** Appka byla nespustitelná kvůli mismatch verzí Expo Go. Diagnostika: uživatelovo
Expo Go hlásilo `client version 1017756, supported sdk 54` — podporuje JEN SDK 54, ne 56 ani 57.
**Downgrade na SDK 54** (`npx expo install expo@^54.0.0 && npx expo install --fix`) + odstranění
`"expo-status-bar"` z `app.json` → `plugins` (SDK 54 verze balíčku nemá platný config plugin, blokovalo
build s `PluginError`). Po opravě: **appka se úspěšně načetla v Expo Go na iOS, LoginScreen zobrazen.**
Poučení pro příště: při "incompatible Expo Go" chybě VŽDY nejdřív zjistit z hlášky telefonu přesné
`supported sdk` číslo (v Expo Go app), ne jen zkoušet "poslední" SDK — release lag Expo Go vs. nové SDK
verze může být týdny.

**Verze (předchozí):** 0.2.0 (GitHub repo + EAS Update CI/CD nastaveno)
**GitHub repo:** https://github.com/petr-homolka/dopcrm-mobile (branch `main`)
**EAS projekt:** `doprovazeni.com/pestouni-crm-mobile` (ID `dbd23f5a-0196-4b96-bc59-f8ad9b814c78`), https://expo.dev/accounts/doprovazeni.com/projects/pestouni-crm-mobile

**CI/CD — EAS Update (2026-07-01):**
- `.github/workflows/eas-update.yml` — push do `main` → `eas update --branch production --non-interactive` (OTA JS/asset update)
- Vyžaduje GitHub secrety v repu (Settings → Secrets and variables → Actions): `EXPO_TOKEN` (robot user token z expo.dev) + 6× `EXPO_PUBLIC_FIREBASE_*` (stejné hodnoty jako `.env.local`, nejsou to skutečná tajemství — Firebase client config je bezpečný ke zveřejnění, ale drženo jako secret kvůli konzistenci s projektovou konvencí)
- **DŮLEŽITÁ MEZERA:** appka se zatím spouští jen přes `npx expo start` + Expo Go (live dev server), NE přes `eas build`. EAS Update publikuje na kanál `production`, ale dokud neexistuje reálný build (`eas build`) nakonfigurovaný na tento kanál, OTA update se nikam neprojeví — je to příprava infrastruktury na budoucnost, ne okamžitě viditelný efekt. Až se mobil rozjede (SDK/Expo Go issue vyřešen), dalším krokem je `eas build --profile preview` (interní distribuce, zdarma, nepotřebuje App Store/Play Store účet) pro reálné ověření OTA update flow.
- Token exponovaný ve screenshotu uživatelem byl doporučen k revoke + regeneraci před použitím

**Verze (předchozí):** 0.1.1 (Expo scaffold downgradován na SDK 56, web platform fix)
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
