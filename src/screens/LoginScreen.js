/**
 * LoginScreen.js — přihlašovací obrazovka (Mobile / Expo)
 *
 * Logika 1:1 z webové verze (Login.jsx): signIn() + mapování Firebase chyb
 * na české hlášky. Vizuál je nativní (TextInput, KeyboardAvoidingView),
 * ne přelitý web design.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signIn } from '../services/orgAuth.js';
import { colors } from '../theme/tokens.js';

function mapFirebaseError(code) {
  const map = {
    'auth/user-not-found': 'Účet s tímto e-mailem neexistuje.',
    'auth/wrong-password': 'Nesprávné heslo.',
    'auth/invalid-email': 'Neplatný formát e-mailu.',
    'auth/user-disabled': 'Tento účet byl deaktivován. Kontaktujte správce.',
    'auth/too-many-requests': 'Příliš mnoho pokusů. Zkuste to za chvíli.',
    'auth/network-request-failed': 'Síťová chyba. Zkontrolujte připojení.',
    'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
  };
  return map[code] ?? 'Přihlášení se nezdařilo. Zkuste to znovu.';
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  function validate() {
    const errs = { email: '', password: '' };
    let ok = true;

    if (!email.trim()) {
      errs.email = 'E-mail je povinný.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Zadejte platný e-mail.';
      ok = false;
    }

    if (!password) {
      errs.password = 'Heslo je povinné.';
      ok = false;
    } else if (password.length < 6) {
      errs.password = 'Heslo musí mít alespoň 6 znaků.';
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  }

  async function handleSubmit() {
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      // signIn() z orgAuth.js: čistě Firebase Auth. Roli/organizaci (users/{uid})
      // dotáhne App.js přes onAuthStateChanged po přihlášení.
      await signIn(email.trim(), password);
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>D</Text>
        </View>
        <Text style={styles.heading}>Přihlaste se</Text>
        <Text style={styles.subheading}>Doprovázení CRM — podpora pěstounských rodin</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <View style={[styles.inputWrap, fieldErrors.email && styles.inputWrapError]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: '' }));
                if (error) setError('');
              }}
              placeholder="vas@email.cz"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Heslo</Text>
          <View style={[styles.inputWrap, fieldErrors.password && styles.inputWrapError]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 36 }]}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: '' }));
                if (error) setError('');
              }}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPass}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass((v) => !v)}
              disabled={loading}
            >
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.submitText}>Přihlásit se</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>Zapomenuté heslo? Kontaktujte správce organizace.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  brandMarkText: { fontSize: 28, fontWeight: '800', color: colors.surface },
  heading: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subheading: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  inputWrapError: { borderColor: colors.error },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: { position: 'absolute', right: 10, padding: 6 },
  fieldError: { fontSize: 12, color: colors.error, marginTop: 4 },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textSecondary, marginTop: 20 },
});
