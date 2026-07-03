/**
 * CaptureSheet.js — bottom sheet centrálního [+] tlačítka (Krok 4 zadání).
 *
 * Zatím jen připravuje UI: čtyři VYPNUTÉ volby s textem „již brzy“.
 * Implementace přijde dle ../../pestouni-crm-prototyp/docs/domain/
 * dokumentova-pipeline.md a audio-pipeline.md v dalších úkolech.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, touch } from '../theme/tokens.js';

const OPTIONS = [
  { key: 'photo', icon: 'camera-outline', label: 'Fotka' },
  { key: 'audio', icon: 'mic-outline', label: 'Nahrávka' },
  { key: 'note', icon: 'create-outline', label: 'Poznámka' },
  { key: 'scan', icon: 'scan-outline', label: 'Skenovat' },
];

export default function CaptureSheet({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Rychlý záznam</Text>
        <Text style={styles.subtitle}>Zatím připravujeme — již brzy.</Text>

        <View style={styles.grid}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={styles.option} disabled activeOpacity={1}>
              <View style={styles.optionIconWrap}>
                <Ionicons name={opt.icon} size={22} color={colors.textTertiary} />
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Text style={styles.optionSoon}>již brzy</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.closeBtnText}>Zavřít</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  option: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: radius.card,
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  optionSoon: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  closeBtn: {
    marginTop: 22,
    height: touch.min,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
