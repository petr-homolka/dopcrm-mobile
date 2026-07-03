/**
 * FosterFamiliesScreen.js — Krok 4 zadání (2026-07-01), terénní modul
 *
 * Hlavní obrazovka klíčové osoby: stáhne a zobrazí POUZE pěstouny přidělené
 * aktuálně přihlášené klíčové osobě (assignedTo == uid) — ne celou organizaci.
 * Funguje offline z Firestore persistentLocalCache (firebase.js) — po ztrátě
 * signálu v terénu appka dál zobrazuje naposledy stažená data.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase.js';
import { listFostersAssignedTo } from '../services/orgService.js';
import { colors } from '../theme/tokens.js';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };

function initials(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

function FamilyRow({ family, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(family.name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{family.name ?? '(bez jména)'}</Text>
        {!!family.address && <Text style={styles.rowSubtitle} numberOfLines={1}>{family.address}</Text>}
      </View>
      <View style={[styles.statusChip, family.status === 'active' && styles.statusChipActive]}>
        <Text style={[styles.statusChipText, family.status === 'active' && styles.statusChipTextActive]}>
          {STATUS_LABELS[family.status] ?? family.status ?? '—'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  );
}

export default function FosterFamiliesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);

  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setError('');
    try {
      setFamilies(await listFostersAssignedTo(uid));
    } catch (err) {
      console.error('[FosterFamiliesScreen] Načtení selhalo:', err);
      setError(err.message ?? 'Rodiny se nepodařilo načíst.');
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

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje rodiny</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Načítám…' : `${families.length} přidělených rodin`}
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary600} />
        </View>
      )}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={families}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary600} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Zatím vám nejsou přidělené žádné rodiny.</Text>
          }
          renderItem={({ item }) => (
            <FamilyRow family={item} onPress={() => navigation.navigate('FosterFamilyDetail', { familyId: item.id, familyName: item.name })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  loadingBox: { paddingVertical: 32, alignItems: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10, padding: 12,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  separator: { height: 1, backgroundColor: colors.divider },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.familyBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', color: colors.primary600, fontSize: 14 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.divider },
  statusChipActive: { backgroundColor: '#DCFCE7', borderColor: 'transparent' },
  statusChipText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  statusChipTextActive: { color: colors.success },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 40 },
});
