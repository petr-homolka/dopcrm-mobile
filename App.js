/**
 * App.js — vstupní bod (Mobile / Expo)
 *
 * Nové B2B SaaS schéma (2026-07-01, Krok 4 zadání):
 *   1. onAuthStateChanged (Firebase Auth, session v expo-secure-store) —
 *      identita (kdo jsi).
 *   2. onSnapshot na users/{uid} — role + organizationId (NIKDY Custom Claims).
 *   3. loading=true → splash, zabrání bliknutí LoginScreen/špatné obrazovky.
 *   4. Bez session → LoginScreen.
 *   5. Se session, role != 'klicova_osoba' → NotSupportedScreen (appka je
 *      primárně terénní nástroj pro klíčové osoby; org_admin/superadmin mají
 *      svůj dashboard na webu).
 *   6. Se session, role == 'klicova_osoba' → NavigationContainer + RootNavigator.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { auth, db } from './src/services/firebase.js';
import { signOut } from './src/services/orgAuth.js';
import LoginScreen from './src/screens/LoginScreen.js';
import RootNavigator from './src/navigation/RootNavigator.js';
import { colors } from './src/theme/tokens.js';

function NotSupportedScreen({ role }) {
  return (
    <SafeAreaView style={styles.notSupportedRoot}>
      <Text style={styles.notSupportedTitle}>Tato appka je pro klíčové osoby</Text>
      <Text style={styles.notSupportedText}>
        Váš účet má roli „{role ?? 'neznámá'}“. Mobilní appka je terénní nástroj pro klíčové osoby
        — správu organizace/SaaS řešte na webu (moje.doprovazeni.com).
      </Text>
      <TouchableOpacity style={styles.notSupportedBtn} onPress={() => signOut()}>
        <Text style={styles.notSupportedBtnText}>Odhlásit se</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function App() {
  const [authState, setAuthState] = useState({ loading: true, user: null, profile: null });
  const profileUnsubRef = useRef(null);

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (user) => {
      profileUnsubRef.current?.();
      profileUnsubRef.current = null;

      if (!user) {
        setAuthState({ loading: false, user: null, profile: null });
        return;
      }

      setAuthState((s) => ({ ...s, loading: true, user }));

      // Real-time subscription na users/{uid} — role/organizace se může
      // změnit za běhu (org_admin může uživatele přeřadit) bez re-loginu.
      profileUnsubRef.current = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          setAuthState({ loading: false, user, profile: snap.exists() ? snap.data() : null });
        },
        (err) => {
          console.error('[App] users/{uid} subscription selhala:', err);
          setAuthState({ loading: false, user, profile: null });
        }
      );
    });
    return () => {
      authUnsub();
      profileUnsubRef.current?.();
    };
  }, []);

  let content;
  if (authState.loading) {
    content = (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  } else if (!authState.user) {
    content = <LoginScreen />;
  } else if (authState.profile?.role !== 'klicova_osoba') {
    content = <NotSupportedScreen role={authState.profile?.role} />;
  } else {
    content = (
      <NavigationContainer>
        <RootNavigator profile={authState.profile} user={authState.user} />
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {content}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notSupportedRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  notSupportedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  notSupportedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  notSupportedBtn: {
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notSupportedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
});
