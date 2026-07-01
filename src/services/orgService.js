/**
 * orgService.js — čtení z nového B2B SaaS schématu (Mobile / Expo)
 *
 * Port 1:1 (jen relevantní část pro terénní modul klíčové osoby) z webu
 * (pestouni-crm-prototyp/src/services/orgService.js). Mobil je čistě
 * READ-ONLY klient pro tento MVP krok (žádné zakládání rodin/dětí z terénu).
 *
 * Firestore.rules zajišťují, že klíčová osoba čte celou svou organizaci,
 * ale pro hlavní obrazovku (Krok 4 zadání) chceme JEN jí přidělené rodiny
 * → dotaz filtrovaný přes assignedTo == uid (ne přes organizationId).
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase.js';

/** Profil aktuálně přihlášeného zaměstnance — users/{uid}. */
export async function getMyProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Rodiny přidělené konkrétní klíčové osobě (hlavní terénní obrazovka). */
export async function listFostersAssignedTo(uid) {
  const snap = await getDocs(
    query(collection(db, 'foster_families'), where('assignedTo', '==', uid))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFoster(familyId) {
  const snap = await getDoc(doc(db, 'foster_families', familyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Děti svěřené konkrétní rodině (detail pěstouna). */
export async function listChildrenByFamily(fosterFamilyId) {
  const snap = await getDocs(
    query(collection(db, 'children'), where('fosterFamilyId', '==', fosterFamilyId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
