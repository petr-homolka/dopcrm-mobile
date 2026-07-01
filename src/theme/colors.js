/**
 * colors.js — sdílené barevné tokeny (Mobile / Expo)
 *
 * Stejné hodnoty jako MUI theme na webu (pestouni-crm-prototyp/src/core/theme.js),
 * aby appka na mobilu i webu vizuálně držela jednu identitu.
 * React Native nepoužívá MUI — ploché konstanty pro StyleSheet.
 */

export const colors = {
  primary: '#4F46E5',
  primaryLight: '#7C73F0',
  primaryDark: '#3730A3',

  secondary: '#FFDB4D',   // brand žlutá
  secondaryDark: '#E0B82E',
  onSecondary: '#111111',

  background: '#F7F7FB',
  surface: '#FFFFFF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B80',

  border: '#E6E6F0',
  success: '#16A34A',
  error: '#DC2626',

  // Bento Grid tokeny (shoda s web bento.* v theme.js)
  cardRadius: 20,
  cardShadowColor: '#0F172A',
};
