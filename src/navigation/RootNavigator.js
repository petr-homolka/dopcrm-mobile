/**
 * RootNavigator.js — spodní tab bar (Mobile / Expo)
 *
 * Krok 4 zadání (2026-07-03): 5 tabů dle DESIGN.md §5.1 —
 * Dnes · Rodiny · [+] · Dokumenty · Profil. Centrální [+] nenaviguje,
 * jen otevře CaptureSheet (bottom sheet rychlého záznamu, zatím
 * vypnuté volby — viz CaptureSheet.js).
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen.js';
import FosterFamiliesScreen from '../screens/FosterFamiliesScreen.js';
import FosterFamilyDetailScreen from '../screens/FosterFamilyDetailScreen.js';
import MoreScreen from '../screens/MoreScreen.js';
import { createPlaceholderScreen } from '../screens/PlaceholderScreen.js';
import CaptureSheet from '../components/CaptureSheet.js';
import { colors, radius } from '../theme/tokens.js';

const DocumentsScreen = createPlaceholderScreen(
  'Dokumenty',
  'Dokumenty zatím zpracovávejte na webu (moje.doprovazeni.com).',
  'document-text-outline'
);

// Tab „+“ nikdy nezobrazí obsah — tabPress se přebírá v screenOptions níže.
function EmptyScreen() {
  return null;
}

// Vlastní stack pro tab „Rodiny" — seznam přidělených rodin -> detail
// s dětmi (Krok 4 zadání 2026-07-01). Hlavičku (title/back šipka) řeší
// tento stack, bottom tab navigator má headerShown:false.
const FosterStack = createNativeStackNavigator();
function FamiliesScreen() {
  return (
    <FosterStack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
      <FosterStack.Screen name="FosterFamiliesList" component={FosterFamiliesScreen} options={{ headerShown: false }} />
      <FosterStack.Screen name="FosterFamilyDetail" component={FosterFamilyDetailScreen} options={{ title: 'Rodina' }} />
    </FosterStack.Navigator>
  );
}

const ICONS = {
  Dnes: 'today-outline',
  Rodiny: 'people-outline',
  Dokumenty: 'document-text-outline',
  Profil: 'person-circle-outline',
};

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Dnes"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary600,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { borderTopColor: colors.divider },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Dnes" component={DashboardScreen} />
        <Tab.Screen name="Rodiny" component={FamiliesScreen} />
        <Tab.Screen
          name="+"
          component={EmptyScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setCaptureOpen(true);
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View style={styles.plusButton}>
                <Ionicons name="add" size={26} color={colors.surface} />
              </View>
            ),
          }}
        />
        <Tab.Screen name="Dokumenty" component={DocumentsScreen} />
        <Tab.Screen name="Profil" component={MoreScreen} />
      </Tab.Navigator>

      <CaptureSheet visible={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
