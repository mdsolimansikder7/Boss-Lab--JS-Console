import type { CSSProperties } from 'react';
import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Cyan',
    bg: '#0b0f19',
    panelBg: '#111827',
    editorBg: '#0f172a',
    consoleBg: '#080d1a',
    text: '#e2e8f0',
    textMuted: '#64748b',
    accent: '#38bdf8',
    border: '#1e293b',
    lineNumBg: '#0b0f19',
    lineNumText: '#475569',
    activeLineBg: '#1e293b66'
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark',
    bg: '#0d1117',
    panelBg: '#161b22',
    editorBg: '#0d1117',
    consoleBg: '#010409',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    accent: '#58a6ff',
    border: '#30363d',
    lineNumBg: '#0d1117',
    lineNumText: '#484f58',
    activeLineBg: '#21262d66'
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Neon',
    bg: '#1e1f1c',
    panelBg: '#272822',
    editorBg: '#1e1f1c',
    consoleBg: '#191a17',
    text: '#f8f8f2',
    textMuted: '#75715e',
    accent: '#a6e22e',
    border: '#3e3d32',
    lineNumBg: '#1e1f1c',
    lineNumText: '#59584d',
    activeLineBg: '#3e3d3266'
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Terminal',
    bg: '#020d04',
    panelBg: '#051809',
    editorBg: '#031006',
    consoleBg: '#010803',
    text: '#22c55e',
    textMuted: '#15803d',
    accent: '#4ade80',
    border: '#14532d',
    lineNumBg: '#020d04',
    lineNumText: '#166534',
    activeLineBg: '#14532d66'
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Night',
    bg: '#21222c',
    panelBg: '#282a36',
    editorBg: '#21222c',
    consoleBg: '#191a21',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    accent: '#bd93f9',
    border: '#44475a',
    lineNumBg: '#21222c',
    lineNumText: '#6272a4',
    activeLineBg: '#44475a66'
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    bg: '#0f1621',
    panelBg: '#16202e',
    editorBg: '#111a26',
    consoleBg: '#0b121b',
    text: '#e5e9f0',
    textMuted: '#7b8ba3',
    accent: '#88c0d0',
    border: '#22303f',
    lineNumBg: '#111a26',
    lineNumText: '#4c5b6e',
    activeLineBg: '#1c2a3a80'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Ember',
    bg: '#140f17',
    panelBg: '#1d1622',
    editorBg: '#171119',
    consoleBg: '#100b12',
    text: '#f5e6e8',
    textMuted: '#a28a96',
    accent: '#fb7185',
    border: '#33232e',
    lineNumBg: '#171119',
    lineNumText: '#6d5562',
    activeLineBg: '#2a1d27aa'
  },
  light: {
    id: 'light',
    name: 'Daylight Paper',
    bg: '#f6f8fb',
    panelBg: '#ffffff',
    editorBg: '#ffffff',
    consoleBg: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#0284c7',
    border: '#e2e8f0',
    lineNumBg: '#f8fafc',
    lineNumText: '#94a3b8',
    activeLineBg: '#e2e8f088'
  }
};

export const isLightTheme = (id: ThemeId): boolean => id === 'light';

/** Text color that stays readable on top of the theme accent color. */
export const accentContrast = (id: ThemeId): string =>
  isLightTheme(id) ? '#ffffff' : '#07121f';

/** Convert a #rgb / #rrggbb color to an rgba() string. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Monaco's theme colors only accept hex values, so alpha has to be encoded as
 * the 8th/4th hex digit rather than rgba().
 */
export function withHexAlpha(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned.slice(0, 6);
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${full}${a}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const value = parseInt(full, 16);
  if (Number.isNaN(value)) return { r: 255, g: 255, b: 255 };
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

/**
 * CSS custom properties exposed on the app shell so every component can use
 * the same palette without hard-coded Tailwind grays (which broke light mode).
 */
export function themeCssVars(theme: ThemeConfig): CSSProperties {
  const light = isLightTheme(theme.id);
  return {
    '--app-bg': theme.bg,
    '--panel-bg': theme.panelBg,
    '--editor-bg': theme.editorBg,
    '--console-bg': theme.consoleBg,
    '--text': theme.text,
    '--text-muted': theme.textMuted,
    '--accent': theme.accent,
    '--accent-contrast': accentContrast(theme.id),
    '--accent-soft': withAlpha(theme.accent, light ? 0.1 : 0.14),
    '--accent-line': withAlpha(theme.accent, light ? 0.35 : 0.45),
    '--border': theme.border,
    '--hover': light ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.06)',
    '--scroll-thumb': light ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.28)',
    '--scroll-thumb-hover': light ? 'rgba(71, 85, 105, 0.55)' : 'rgba(148, 163, 184, 0.5)',
  } as CSSProperties;
}
