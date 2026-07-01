/**
 * PlaceholderScreen.js — stub obrazovka pro moduly čekající na implementaci
 * (Mobile / Expo), zrcadlí stub stránky na webu (DashboardPage.jsx apod.
 * než byly dotaženy). createPlaceholderScreen(title, description, icon)
 * vrací hotovou komponentu pro použití v navigátoru.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors.js';

export function createPlaceholderScreen(title, description, icon = 'construct-outline') {
  return function PlaceholderScreen() {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </SafeAreaView>
    );
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  description: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
