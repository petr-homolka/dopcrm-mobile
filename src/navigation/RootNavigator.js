/**
 * RootNavigator.js — spodní tab bar (Mobile / Expo)
 *
 * Max 5 položek v bottom navu (UX pravidlo bottom-nav-limit). Zrcadlí
 * MVP_NAV z webu (Přehled/Pěstouni/Děti/Kalendář), zbytek (Kontakty,
 * Dokumenty, Vzdělávání, Nastavení, Uživatelé) je dostupný přes „Více".
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen.js';
import FosterFamiliesScreen from '../screens/FosterFamiliesScreen.js';
import FosterFamilyDetailScreen from '../screens/FosterFamilyDetailScreen.js';
import MoreScreen from '../screens/MoreScreen.js';
import { createPlaceholderScreen } from '../screens/PlaceholderScreen.js';
import { colors } from '../theme/tokens.js';

const ChildrenScreen = createPlaceholderScreen(
  'Děti',
  'Přehled dětí v péči — otevřete kartu rodiny v „Pěstouni".',
  'happy-outline'
);
const CalendarScreen = createPlaceholderScreen(
  'Kalendář',
  'Návštěvy a termíny — připravujeme pro mobil.',
  'calendar-outline'
);

// Vlastní stack pro tab „Pěstouni" — seznam přidělených rodin -> detail
// s dětmi (Krok 4 zadání). Hlavičku (title/back šipka) řeší tento stack,
// bottom tab navigator má headerShown:false (viz screenOptions níže).
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
  Přehled: 'grid-outline',
  Pěstouni: 'people-outline',
  Děti: 'happy-outline',
  Kalendář: 'calendar-outline',
  Více: 'menu-outline',
};

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Přehled"
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
      <Tab.Screen name="Přehled" component={DashboardScreen} />
      <Tab.Screen name="Pěstouni" component={FamiliesScreen} />
      <Tab.Screen name="Děti" component={ChildrenScreen} />
      <Tab.Screen name="Kalendář" component={CalendarScreen} />
      <Tab.Screen name="Více" component={MoreScreen} />
    </Tab.Navigator>
  );
}
