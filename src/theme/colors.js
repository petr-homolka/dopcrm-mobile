/**
 * colors.js — DEPRECATED, zachováno jen kvůli stávajícím importům.
 *
 * Jediný zdroj pravdy je teď tokens.js (forest teal paleta dle DESIGN.md).
 * Nové soubory importují VÝHRADNĚ z './tokens.js', tenhle re-export
 * nerozšiřuj ani nepoužívej v nových obrazovkách.
 */

import { colors as tokenColors } from './tokens.js';

export const colors = tokenColors;
