/**
 * Design tokens — "Daylight editorial" (spec §4): Superhuman's parchment and
 * wine, Origin's colour-coded feature tiles and obsidian dark mode, Vivid+Co's
 * prism. Components read colours only from here (via useTheme).
 */
import type { AttendanceStatus, FeatureKey } from '@/data/types';

export interface ColorTokens {
  canvas: string;
  card: string;
  cardRaised: string;
  hairline: string;
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  link: string;
  pressed: string;
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
  /** Translucent veil for modal backdrops. */
  scrim: string;
}

export const statusColor: Record<AttendanceStatus, string> = {
  present: '#2f9e6a',
  late: '#d99a1e',
  noScan: '#8a7a66',
  sick: '#3b6fd8',
  personal: '#3aa3e0',
  absent: '#e0473e',
};

export const palette: { light: ColorTokens; dark: ColorTokens } = {
  light: {
    canvas: '#f2f0eb',
    card: '#ffffff',
    cardRaised: '#ffffff',
    hairline: '#e3e3e2',
    text: '#292827',
    textSecondary: '#666666',
    primary: '#421d24',
    onPrimary: '#ffffff',
    secondary: '#d4c7ff',
    onSecondary: '#292827',
    link: '#714cb6',
    pressed: '#e9e6df',
    idCardBg: '#421d24',
    idCardText: '#ffffff',
    danger: statusColor.absent,
    dangerText: '#b3261e',
    onDanger: '#ffffff',
    success: statusColor.present,
    successText: '#1c6e47',
    warning: statusColor.late,
    scrim: 'rgba(41,40,39,0.38)',
  },
  dark: {
    canvas: '#0f1011',
    card: '#1c1c1d',
    cardRaised: '#2e2e2e',
    hairline: '#2e2e2e',
    text: '#f5f5f7',
    textSecondary: '#9f9fa0',
    primary: '#ffffff',
    onPrimary: '#000000',
    secondary: '#3f4041',
    onSecondary: '#f5f5f7',
    link: '#b9a8ff',
    pressed: '#3f4041',
    idCardBg: '#2e2e2e',
    idCardText: '#f5f5f7',
    danger: statusColor.absent,
    dangerText: '#ff8a80',
    onDanger: '#000000',
    success: statusColor.present,
    successText: '#6fd6a2',
    warning: statusColor.late,
    scrim: 'rgba(0,0,0,0.6)',
  },
};

/** One Origin colour per feature, used everywhere that feature appears. */
export const feature: Record<FeatureKey, { fill: string; ink: string }> = {
  attendance: { fill: '#847dff', ink: '#16123f' },
  wallet: { fill: '#dd90d8', ink: '#3a1238' },
  behavior: { fill: '#90b8f0', ink: '#0c2a52' },
  leave: { fill: '#d1c9ff', ink: '#2a2270' },
  assessments: { fill: '#4b49aa', ink: '#ffffff' },
  announcements: { fill: '#0c4243', ink: '#ffffff' },
};

/** Vivid+Co RGB dispersion — only inside the prism shimmer. */
export const prism: [string, string, string] = ['#ff2a2a', '#2a7fff', '#2aff2a'];

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, x3: 32, x4: 40, x5: 48 } as const;
export const screenPad = 20;

export const radius = { tile: 28, card: 16, button: 16, input: 12, chip: 999, sheet: 28 } as const;

/** Apply an alpha (0–1) to a #rrggbb colour. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
