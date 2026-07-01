/**
 * Firebase initialization — Doprovázení CRM (Mobile / Expo)
 *
 * Stejný Firebase projekt jako web (pestouni-crm-prototyp/src/services/firebase.js).
 *
 * Klíčové bezpečnostní rozhodnutí (platí i na mobilu):
 *   - Role/oprávnění se NIKDY nečtou z Custom Claims (id token).
 *   - Jediný zdroj: Firestore users/{uid} (nové B2B schéma, viz orgAuth.js/
 *     orgService.js) — legacy user_roles/{uid} (auth.js) zůstává pro starší
 *     obrazovky, ale mobil od 2026-07-01 pracuje jen s users/{uid}.
 *
 * Session persistence (2026-07-01, Krok 4 zadání) — expo-secure-store:
 *   - iOS/Android: getReactNativePersistence(SecureStoreAdapter) — refresh
 *     token appky se ukládá do OS keystore/keychainu (šifrováno OS), NE do
 *     prostého AsyncStorage. Bezpečnější pro terénní zařízení, které může
 *     být ztraceno/odcizeno.
 *   - SecureStore má limit ~2048 B na hodnotu — Firebase Auth persistovaný
 *     stav (tokeny) se do limitu vejde; pro jistotu fallback na AsyncStorage,
 *     pokud SecureStore zápis selže (setItemFallback).
 *   - Web (Expo --web): SecureStore neexistuje → getAuth(app) s výchozí
 *     browser persistencí (stejná větev jako dřív).
 *
 * Firestore offline persistence (2026-07-01, Krok 4 zadání):
 *   - initializeFirestore(app, { localCache: persistentLocalCache() }) —
 *     moderní Firestore JS SDK (v10.8+) podporuje perzistentní lokální cache
 *     i na React Native (dřív jen web/IndexedDB). Data zůstávají čitelná
 *     i po restartu appky bez signálu (terénní návštěvy bez pokrytí).
 *   - Fallback na getFirestore(app) (jen in-memory cache), pokud
 *     initializeFirestore selže (starší/neznámé prostředí) — appka nepadá.
 */

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// Konfigurace z Expo environment variables (EXPO_PUBLIC_ prefix, nikdy natvrdo v kódu)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Ochrana proti dvojí inicializaci (Metro fast refresh při vývoji)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Adaptér SecureStore -> tvar očekávaný getReactNativePersistence (getItem/setItem/removeItem).
const SecureStoreAdapter = {
  async getItem(key) {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    return SecureStore.deleteItemAsync(key);
  },
};

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(SecureStoreAdapter) });

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({}),
  });
  console.info('[Firebase] Firestore persistentLocalCache: ON (offline-first)');
} catch (err) {
  // Např. Fast Refresh znovu volá initializeFirestore na už inicializovaném app —
  // Firestore v takovém případě vyhodí chybu; padneme zpět na existující instanci.
  console.warn('[Firebase] persistentLocalCache selhal, fallback na getFirestore():', err.message);
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

export default app;
