/**
 * FosterFamilyDetailScreen.js — Krok 4 zadání (2026-07-01)
 *
 * Detail pěstounské rodiny: základní údaje + seznam jí svěřených dětí
 * (children, filtr fosterFamilyId). Dostupné jen pro rodiny přidělené
 * přihlášené klíčové osobě (viz FosterFamiliesScreen) — firestore.rules
 * navíc hlídají čtení na serveru.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFoster, listChildrenByFamily } from '../services/orgService.js';
import { colors } from '../theme/colors.js';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

function InfoRow({ icon, text }) {
  if (!text) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

export default function FosterFamilyDetailScreen({ route, navigation }) {
  const { familyId, familyName } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);

  const load = useCallback(async () => {
    setError('');
    try {
      const [familyData, childrenData] = await Promise.all([
        getFoster(familyId),
        listChildrenByFamily(familyId),
      ]);
      setFamily(familyData);
      setChildren(childrenData);
    } catch (err) {
      console.error('[FosterFamilyDetailScreen] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    }
  }, [familyId]);

  useEffect(() => {
    navigation.setOptions({ title: familyName ?? 'Rodina' });
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load, navigation, familyName]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{family?.name ?? '(bez jména)'}</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>{STATUS_LABELS[family?.status] ?? family?.status ?? '—'}</Text>
              </View>
              <View style={{ marginTop: 12, gap: 8 }}>
                <InfoRow icon="location-outline" text={family?.address} />
                <InfoRow icon="call-outline" text={family?.contactPhone} />
                <InfoRow icon="mail-outline" text={family?.contactEmail} />
              </View>
              {!!family?.note && (
                <>
                  <Text style={styles.noteLabel}>Poznámka</Text>
                  <Text style={styles.noteText}>{family.note}</Text>
                </>
              )}
            </View>

            <Text style={styles.sectionTitle}>Svěřené děti ({children.length})</Text>
            <View style={styles.card}>
              {children.length === 0 && (
                <Text style={styles.emptyText}>Této rodině zatím nejsou přiřazené žádné děti.</Text>
              )}
              {children.map((child, idx) => (
                <View key={child.id} style={[styles.childRow, idx < children.length - 1 && styles.childRowDivider]}>
                  <View style={styles.childAvatar}>
                    <Ionicons name="happy-outline" size={18} color={colors.secondaryDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>
                      {`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || '(bez jména)'}
                    </Text>
                    <Text style={styles.childMeta}>Narození: {formatBirthDate(child.birthDate)}</Text>
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10, padding: 12,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: colors.cardRadius,
    padding: 18,
    marginBottom: 20,
    shadowColor: colors.cardShadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  statusChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  statusChipText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: colors.textSecondary },
  noteLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginTop: 14, marginBottom: 4 },
  noteText: { fontSize: 13, color: colors.textPrimary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  childRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  childAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  childMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
