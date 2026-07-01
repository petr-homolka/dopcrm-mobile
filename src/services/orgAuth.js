/**
 * orgAuth.js — přihlašování pro NOVÉ B2B SaaS schéma (Mobile / Expo)
 *
 * Port 1:1 principu z webu (pestouni-crm-prototyp/src/services/orgAuth.js).
 * Identita = Firebase Auth (persistovaná přes expo-secure-store, viz
 * firebase.js), role/organizace = Firestore users/{uid} (nikdy Custom Claims).
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebase.js';

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
