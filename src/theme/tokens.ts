/**
 * Design tokens — "Frosted pastel": frosted, glossy glass floating over soft
 * ambient light. Muted pastels, one deep ink for emphasis, soft diffuse shadows.
 * Components read colours only from here (via useTheme). Every text pair is
 * contrast-checked against the worst case: glass over the brightest ambient glow.
 */
import type { AttendanceStatus, FeatureKey } from '@/data/types';

export interface ColorTokens {
  /** Base colour beneath the ambient light. */
  canvas: string;
  /** Opaque stand-in for glass over the canvas (QR paper frames, contrast checks). */
  card: string;
  cardRaised: string;
  /** Separators, tracks and quiet outlines. */
  hairline: string;
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  link: string;
  pressed: string;
  /** Mid stop of the student-pass gradient (see `idCard`). */
  idCardBg: string;
  idCardText: string;
  danger: string;
  /** Danger colour safe for text and destructive button fills. */
  dangerText: string;
  onDanger: string;
  success: string;
  /** Success colour safe for text (positive amounts). */
  successText: string;
  warning: string;
  /** Translucent veil for modal backdrops (sits over a blur). */
  scrim: string;

  /** Frosted card fill. */
  glass: string;
  /** Denser fill for chrome and sheets that sit over moving content. */
  glassStrong: string;
  /** Bright rim that catches the light. */
  glassBorder: string;
  /** Specular gloss at the top edge of glass. */
  gloss: string;
  /** Soft, tinted, diffuse shadow colour. */
  shadow: string;
  /** Lavender accent for selection, focus and badges (never body text). */
  accent: string;
  onAccent: string;
  /** Ambient light orbs behind every screen (#rrggbb). */
  ambient: readonly [string, string, string, string];
  /** Peak opacity of an ambient orb. */
  ambientOpacity: number;
  /** Student-pass gradient stops. */
  idCard: readonly [string, string, string];
  /** Icy tint for the frozen card. */
  frost: string;
  /** Strength of the icy tint (kept low enough that text on a frozen card stays AA). */
  frostAlpha: number;
  /** Snowflakes and ice crystals: must read against the frosted card. */
  frostInk: string;
}

/** Muted status hues: distinguishable, never neon; always paired with a label or symbol. */
export const statusColor: Record<AttendanceStatus, string> = {
  present: '#4aa77c',
  late: '#d9a043',
  noScan: '#9a9189',
  sick: '#6c8ee0',
  personal: '#5fb3d6',
  absent: '#df746d',
};

export const palette: { light: ColorTokens; dark: ColorTokens } = {
  light: {
    canvas: '#eef0f7',
    card: '#f8f9fc',
    cardRaised: '#ffffff',
    hairline: '#dfe1ec',
    text: '#1c1d2b',
    textSecondary: '#4f5369',
    primary: '#262840',
    onPrimary: '#ffffff',
    secondary: '#e4e1fb',
    onSecondary: '#1c1d2b',
    link: '#4b40b5',
    pressed: '#e3e4ef',
    idCardBg: '#dbe8f8',
    idCardText: '#1c1d2b',
    danger: statusColor.absent,
    dangerText: '#a3261f',
    onDanger: '#ffffff',
    success: statusColor.present,
    successText: '#16663f',
    warning: statusColor.late,
    scrim: 'rgba(38,40,64,0.16)',

    glass: 'rgba(255,255,255,0.58)',
    glassStrong: 'rgba(250,250,255,0.78)',
    glassBorder: 'rgba(255,255,255,0.85)',
    gloss: 'rgba(255,255,255,0.75)',
    shadow: 'rgba(72,66,140,0.10)',
    accent: '#8b82e6',
    onAccent: '#ffffff',
    ambient: ['#c9c2f2', '#bcd6f4', '#c4e8d8', '#f3d2da'],
    ambientOpacity: 0.5,
    idCard: ['#e6e2fb', '#dbe8f8', '#dcf1e8'],
    frost: '#cfe3f7',
    frostAlpha: 0.32,
    frostInk: '#7fa7d6',
  },
  dark: {
    canvas: '#0d0e18',
    card: '#20212a',
    cardRaised: '#2a2b3a',
    hairline: '#2a2c40',
    text: '#f1f1f8',
    textSecondary: '#b1b4ca',
    primary: '#e9e7ff',
    onPrimary: '#171830',
    secondary: '#2d2a52',
    onSecondary: '#f1f1f8',
    link: '#b9b1ff',
    pressed: '#262840',
    idCardBg: '#1d2e4a',
    idCardText: '#f1f1f8',
    danger: statusColor.absent,
    dangerText: '#ff9d94',
    onDanger: '#171830',
    success: statusColor.present,
    successText: '#80dab0',
    warning: statusColor.late,
    scrim: 'rgba(4,4,12,0.42)',

    glass: 'rgba(255,255,255,0.075)',
    glassStrong: 'rgba(24,25,40,0.72)',
    glassBorder: 'rgba(255,255,255,0.13)',
    gloss: 'rgba(255,255,255,0.10)',
    shadow: 'rgba(0,0,0,0.42)',
    accent: '#9d95f0',
    onAccent: '#171830',
    ambient: ['#3f3a78', '#1f4262', '#1d4a44', '#4d2c4c'],
    ambientOpacity: 0.55,
    idCard: ['#2a2750', '#1d2e4a', '#1b3834'],
    frost: '#9cc2e8',
    frostAlpha: 0.08,
    frostInk: '#ffffff',
  },
};

export interface FeatureColor {
  /** Pastel tile / chip fill. */
  fill: string;
  /** Text and icons on `fill`. */
  ink: string;
  /** Soft light used for orbs and glows inside tiles. */
  glow: string;
}

/** One pastel per feature, used everywhere that feature appears; deepened for dark mode. */
export const features: { light: Record<FeatureKey, FeatureColor>; dark: Record<FeatureKey, FeatureColor> } = {
  light: {
    attendance: { fill: '#dcd7fb', ink: '#2e2870', glow: '#a99cf0' },
    wallet: { fill: '#f8dce5', ink: '#6a2442', glow: '#eea8c0' },
    behavior: { fill: '#d4e5f8', ink: '#163e66', glow: '#9cc3ee' },
    leave: { fill: '#d5efe4', ink: '#1b5440', glow: '#9ed9c0' },
    assessments: { fill: '#f8e7cb', ink: '#5c4211', glow: '#f0c98e' },
    announcements: { fill: '#d2eaee', ink: '#154a55', glow: '#92cfd8' },
  },
  dark: {
    attendance: { fill: '#2b2850', ink: '#dcd7ff', glow: '#7b6fd0' },
    wallet: { fill: '#3b2536', ink: '#f9d3e0', glow: '#c27792' },
    behavior: { fill: '#1f3149', ink: '#d0e4fb', glow: '#6d9bcf' },
    leave: { fill: '#1c3a31', ink: '#caefdf', glow: '#6fb597' },
    assessments: { fill: '#3a3020', ink: '#f6e2bd', glow: '#c9a265' },
    announcements: { fill: '#1a3a41', ink: '#c7ecf1', glow: '#63a9b4' },
  },
};

/** QR codes stay dark-on-light in both themes; inverted codes scan poorly. */
export const qr = { ink: '#000000', paper: '#ffffff' } as const;

/** Pastel iridescence — the sheen that travels across glossy cards. */
export const prism: [string, string, string] = ['#f6c9dd', '#c6d6fb', '#c4eedd'];

/** Pure white, for specular highlights and snow. */
export const white = '#ffffff';

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, x3: 32, x4: 40, x5: 48 } as const;
export const screenPad = 20;

export const radius = { tile: 28, card: 24, button: 999, input: 16, chip: 999, sheet: 32 } as const;

/** Apply an alpha (0–1) to a #rrggbb colour. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
