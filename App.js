/**
 * App.js — vstupní bod (Mobile / Expo)
 *
 * Stejný princip jako web (core/router.jsx AuthProvider + RequireAuth):
 *   1. initAuth() při startu — onAuthStateChanged + načtení role z Firestore.
 *   2. loading=true → splash (ActivityIndicator), zabrání bliknutí LoginScreen.
 *   3. Bez session → LoginScreen.
 *   4. Se session → NavigationContainer + RootNavigator (bottom tabs).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { initAuth, currentUser } from './src/services/auth.js';
import LoginScreen from './src/screens/LoginScreen.js';
import RootNavigator from './src/navigation/RootNavigator.js';
import { colors } from './src/theme/colors.js';

export default function App() {
  const [authState, setAuthState] = useState(() => ({
    loading: true,
    session: currentUser() ? { user: currentUser() } : null,
  }));
  const unsubRef = useRef(null);

  useEffect(() => {
    unsubRef.current = initAuth((session) => {
      setAuthState({ loading: false, session });
    });
    return () => unsubRef.current?.();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {authState.loading ? (
        <View style={styles.loadingRoot}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : authState.session ? (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <LoginScreen />
      )}
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
});
