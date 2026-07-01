/**
 * DashboardScreen.js — Přehled (Mobile / Expo)
 *
 * Nativní obrazovka (ne přelitý web design): SafeAreaView, ScrollView
 * s pull-to-refresh, KPI karty vedle sebe, seznam nejnovějších rodin.
 * Data ze stejného Firestore tenantu jako web (dataService.js).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchFamilies, fetchChildren } from '../services/dataService.js';
import { currentUser } from '../services/auth.js';
import { colors } from '../theme/colors.js';

function formatDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('cs-CZ');
}

function formatTodayLong() {
  return new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function firstName(user) {
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? '';
  return name.split(/[\s.]+/)[0] || 'tam';
}

function StatCard({ icon, label, value, tint }) {
  return (
    <View style={[styles.statCard, { backgroundColor: tint }]}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={20} color={colors.textPrimary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);

  const load = useCallback(async () => {
    setError('');
    try {
      const [familiesData, childrenData] = await Promise.all([
        fetchFamilies({ orderByField: 'createdAt', orderDirection: 'desc' }),
        fetchChildren(),
      ]);
      setFamilies(familiesData);
      setChildrenCount(childrenData.length);
    } catch (err) {
      console.error('[DashboardScreen] Načtení dat selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const activeFamiliesCount = families.filter((f) => f.status === 'active').length;
  const recentFamilies = families.slice(0, 5);
  const user = currentUser();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>Dobrý den, {firstName(user)}</Text>
        <Text style={styles.dateText}>{formatTodayLong()}</Text>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Načítám data…</Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error && (
          <>
            <View style={styles.statsRow}>
              <StatCard
                icon="people-outline"
                label="AKTIVNÍ RODINY"
                value={activeFamiliesCount}
                tint="#EEF2FF"
              />
              <StatCard
                icon="happy-outline"
                label="DĚTI V PÉČI"
                value={childrenCount}
                tint="#FFF8E1"
              />
            </View>

            <Text style={styles.sectionTitle}>Nejnovější rodiny</Text>

            <View style={styles.listCard}>
              {recentFamilies.length === 0 && (
                <Text style={styles.emptyText}>Žádné rodiny k zobrazení.</Text>
              )}
              {recentFamilies.map((family, idx) => (
                <View
                  key={family.id}
                  style={[styles.row, idx < recentFamilies.length - 1 && styles.rowDivider]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{family.name ?? '(bez jména)'}</Text>
                    <Text style={styles.rowSubtitle}>{formatDate(family.createdAt)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      family.status === 'active' ? styles.statusChipActive : styles.statusChipDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        family.status === 'active' && styles.statusChipTextActive,
                      ]}
                    >
                      {family.status ?? 'neznámý'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  dateText: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: 20, textTransform: 'capitalize' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 32, justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: colors.cardRadius,
    padding: 16,
    minHeight: 110,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: colors.cardRadius,
    paddingHorizontal: 16,
    shadowColor: colors.cardShadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusChipActive: { backgroundColor: '#DCFCE7' },
  statusChipDefault: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  statusChipText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  statusChipTextActive: { color: colors.success },
  emptyText: { color: colors.textSecondary, fontSize: 14, paddingVertical: 24, textAlign: 'center' },
});
