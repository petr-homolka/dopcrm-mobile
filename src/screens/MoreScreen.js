/**
 * MoreScreen.js — „Více" (Mobile / Expo)
 *
 * Zrcadlí uživatelský footer z webového Layoutu: jméno, role, odhlášení.
 * Odpovídá MVP_NAV koncepci — zbylé/málo používané položky (Nastavení,
 * Uživatelé) jsou zde, ne v bottom tab baru (max. 5 položek dle UX pravidel).
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, currentUser, currentRole } from '../services/auth.js';
import { colors } from '../theme/colors.js';

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  vedeni: 'Vedení',
  ko: 'Klíčová osoba',
  asistent: 'Asistent',
  pestoun: 'Pěstoun',
  dite: 'Dítě',
  externista: 'Externista',
};

function initials(user) {
  if (!user) return '?';
  const name = user.displayName ?? user.email ?? '';
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  );
}

const MENU_ITEMS = [
  { key: 'settings', icon: 'settings-outline', label: 'Nastavení' },
  { key: 'users', icon: 'people-outline', label: 'Uživatelé' },
];

export default function MoreScreen() {
  const user = currentUser();
  const role = currentRole();
  const roleLabel = ROLE_LABELS[role?.role] ?? role?.role ?? 'Uživatel';

  const handleSignOut = useCallback(() => {
    Alert.alert('Odhlásit se', 'Opravdu se chcete odhlásit?', [
      { text: 'Zrušit', style: 'cancel' },
      {
        text: 'Odhlásit',
        style: 'destructive',
        onPress: () => {
          // Po signOut() App.js přes initAuth automaticky přepne na LoginScreen.
          signOut();
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.displayName ?? user?.email?.split('@')[0] ?? 'Uživatel'}</Text>
          <Text style={styles.role}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuRow, idx < MENU_ITEMS.length - 1 && styles.menuRowDivider]}
            activeOpacity={0.6}
          >
            <Ionicons name={item.icon} size={20} color={colors.textPrimary} style={{ marginRight: 12 }} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.signOutText}>Odhlásit se</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: 20 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: colors.cardRadius,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.onSecondary },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  role: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: colors.cardRadius,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, minHeight: 44 },
  menuRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 15, color: colors.textPrimary },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: colors.cardRadius,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    minHeight: 44,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: colors.error },
});
