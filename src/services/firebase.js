/**
 * Firebase initialization — Doprovázení CRM (Mobile / Expo)
 *
 * Stejný Firebase projekt jako web (pestouni-crm-prototyp/src/services/firebase.js).
 *
 * Klíčové bezpečnostní rozhodnutí (platí i na mobilu):
 *   - Role/oprávnění se NIKDY nečtou z Custom Claims (id token).
 *   - Jediný zdroj: Firestore user_roles/{uid}. Viz auth.js.
 *
 * Persistence — platform-specific:
 *   - iOS/Android: getReactNativePersistence(AsyncStorage) — obnoví session
 *     po zavření appky (ekvivalent IndexedDB persistence na webu).
 *   - Web (Expo --web): getReactNativePersistence NEEXISTUJE ve web buildu
 *     firebase/auth (je to čistě RN export) → na webu se použije getAuth(app)
 *     s výchozí browser persistence. Bez tohoto větvení appka na webu padá
 *     na "getReactNativePersistence is not a function".
 *   - Firestore: enableIndexedDbPersistence NEEXISTUJE na RN (jen pro web).
 *     Firestore JS SDK na RN běží s výchozí memory cache — offline čtení
 *     funguje jen po dobu běhu appky, ne po restartu. Pro plné offline-first
 *     chování by bylo nutné přejít na @react-native-firebase/firestore
 *     (nativní modul) — ponecháno jako V8/produkční vylepšení.
 */

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

export default app;
