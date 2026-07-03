# CLAUDE.md — Přítomnost MOBILE (terénní appka)

Nativní appka (Expo / React Native) pro KLÍČOVÉ OSOBY doprovázejících organizací pěstounské
péče. Jediný účel: rychlá práce v terénu — agenda, moje rodiny, zápisy, foto, audio.
Nic jiného sem nepatří (dokumentový workflow, administrace a registrace = webová aplikace).

## Zdroj pravdy (čti v tomto pořadí)
1. **CLAUDE.md** (tento soubor) — pravidla práce
2. `../pestouni-crm-prototyp/DESIGN.md` — závazný design systém (platí pro obě appky;
   zde překlad do React Native přes `src/theme/tokens.js`)
3. **CURRENT_STATE.md** (zdejší) — stav mobilní appky
4. `../pestouni-crm-prototyp/docs/` — doménová dokumentace, datový model, INVENTAR.md

Sesterský web repozitář je MASTER pro doménu: datový model, firestore.rules, workflow
i pipeline specifikace (`docs/domain/dokumentova-pipeline.md`, `audio-pipeline.md`) se
mění POUZE tam. Tady se jen konzumují. Pokud sesterský adresář není dostupný, ZEPTEJ SE —
nikdy si doménová pravidla nedomýšlej.

## Rozsah appky (co ANO / co NE)
- ✅ Přihlášení (jen role klicova_osoba; ostatní role → NotSupportedScreen → web)
- ✅ Dnes (agenda), Moje rodiny, detail rodiny + timeline, detail dítěte
- ✅ Capture: foto, audio poznámka/záznam návštěvy, textová poznámka, sken — dle pipeline
  specifikací; offline-first fronta
- ❌ Editor a generování dokumentů, schvalování, podpisy, odesílání, admin, registrace,
  správa uživatelů — to vše dělá web; sem max. odkaz „otevřít na webu"

## Stack (jediný povolený)
- Expo SDK 54+ / React Native, react-navigation (bottom-tabs + native-stack),
  ikony @expo/vector-icons (Ionicons), StyleSheet + tokeny z `src/theme/tokens.js`
- Firebase: Auth (expo-secure-store persistence), Firestore (persistentLocalCache),
  Storage — vždy přes `src/services/`, obrazovky NIKDY nevolají Firestore přímo
- Zakázáno: MUI a jiné web-UI knihovny, WebView jako náhrada obrazovek, ad-hoc hex barvy
  mimo tokens.js, AsyncStorage pro cokoli citlivého (jen expo-secure-store)

## Design (překlad DESIGN.md do RN)
- Barvy, radius a typografická škála POUZE z `src/theme/tokens.js` (forest teal paleta
  + entity barvy — musí být identické s tailwind.config webu).
- Karty: surface bílá, borderRadius 16, jemný stín (elevation 1–2), ŽÁDNÉ tvrdé bordery.
- Text: nikdy #000, váhy max 600, velikosti 12/14/16/18.
- Bottom tabs: Dnes · Rodiny · [+] · Dokumenty · Profil; centrální [+] otevírá bottom
  sheet rychlého záznamu (nejdůležitější interakce — max 2 ťuknutí).
- Dotykové cíle min 44 pt, SafeArea vždy, pull-to-refresh na seznamech, empty states
  s jednou akcí. Zakázané vzory viz DESIGN.md §9 — platí i zde.

## Pravidla velikosti (tvrdá)
- Žádný soubor nesmí přesáhnout **300 řádků** — rozděl dřív, než pokračuješ.
- Jedna obrazovka = jeden soubor v `src/screens/`; sdílené prvky do `src/components/`;
  jedna služba = jedna doména v `src/services/`.
- `App.js` a `RootNavigator.js` jsou jen směrovače — žádná logika.
- CLAUDE.md neroste; CURRENT_STATE.md max 300 řádků (starší → docs/history.md).

## Doménová pravidla (zkráceně — plné znění v master repu)
- Klíčová osoba vidí JEN své rodiny (`assignedTo == uid`); seznam rodin se získává
  dotazem, nikdy neukládá k uživateli.
- Vše, co roste v čase → podkolekce (timeline, documents); seznamy čtou jen hlavní
  dokumenty, podkolekce až v detailu, stránkované po 20.
- Záznam více osob = JEDEN dokument se `subjectRefs`.
- Citlivá data dětí: nikdy do logů; soubory jen Firebase Storage (komprese dle pipeline).

## Pracovní postup
- Po každé ucelené změně aktualizuj zdejší CURRENT_STATE.md (datum, co, proč, ověření).
- Před commitem: `npx expo export --platform web` i `--platform android` musí projít.
  Připomeň uživateli test v Expo Go na reálném zařízení (offline, secure-store, mikrofon).
- Firestore rules ani schéma z tohoto repa NIKDY neměň — jen master repo.
- Komunikuj česky. Žádná emoji v UI.
