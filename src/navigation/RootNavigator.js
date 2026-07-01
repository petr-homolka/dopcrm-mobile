/**
 * RootNavigator.js — spodní tab bar (Mobile / Expo)
 *
 * Max 5 položek v bottom navu (UX pravidlo bottom-nav-limit). Zrcadlí
 * MVP_NAV z webu (Přehled/Pěstouni/Děti/Kalendář), zbytek (Kontakty,
 * Dokumenty, Vzdělávání, Nastavení, Uživatelé) je dostupný přes „Více".
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen.js';
import MoreScreen from '../screens/MoreScreen.js';
import { createPlaceholderScreen } from '../screens/PlaceholderScreen.js';
import { colors } from '../theme/colors.js';

const FamiliesScreen = createPlaceholderScreen(
  'Pěstouni',
  'Seznam pěstounských rodin — připravujeme pro mobil.',
  'people-outline'
);
const ChildrenScreen = createPlaceholderScreen(
  'Děti',
  'Přehled dětí v péči — připravujeme pro mobil.',
  'happy-outline'
);
const CalendarScreen = createPlaceholderScreen(
  'Kalendář',
  'Návštěvy a termíny — připravujeme pro mobil.',
  'calendar-outline'
);

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { borderTopColor: colors.border },
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
