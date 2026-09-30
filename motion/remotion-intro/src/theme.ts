/** Colours from the app's src/theme/tokens.ts, so the film's app act is the app. */
export type ThemeName = 'light' | 'dark';
export type FeatureKey = 'attendance' | 'behavior' | 'leave' | 'assessments';

export const PALETTE = {
  light: {
    canvas: '#eef0f7',
    text: '#1c1d2b',
    text2: '#4f5369',
    glass: 'rgba(255,255,255,0.58)',
    glassStrong: 'rgba(250,250,255,0.82)',
    glassBorder: 'rgba(255,255,255,0.85)',
    gloss: 'rgba(255,255,255,0.75)',
    shadow: 'rgba(72,66,140,0.10)',
    shadowDeep: 'rgba(72,66,140,0.18)',
    ambient: ['#c9c2f2', '#bcd6f4', '#c4e8d8', '#f3d2da'],
    ambientOpacity: 0.5,
    idCard: ['#e6e2fb', '#dbe8f8', '#dcf1e8'],
    idCardText: '#1c1d2b',
    success: '#4aa77c',
    successText: '#16663f',
    grainOpacity: 0.08,
    grainBlend: 'multiply',
    sheen: 'rgba(255,255,255,0.75)',
  },
  dark: {
    canvas: '#0d0e18',
    text: '#f1f1f8',
    text2: '#b1b4ca',
    glass: 'rgba(255,255,255,0.075)',
    glassStrong: 'rgba(24,25,40,0.78)',
    glassBorder: 'rgba(255,255,255,0.13)',
    gloss: 'rgba(255,255,255,0.10)',
    shadow: 'rgba(0,0,0,0.42)',
    shadowDeep: 'rgba(0,0,0,0.55)',
    ambient: ['#3f3a78', '#1f4262', '#1d4a44', '#4d2c4c'],
    ambientOpacity: 0.55,
    idCard: ['#2a2750', '#1d2e4a', '#1b3834'],
    idCardText: '#f1f1f8',
    success: '#4aa77c',
    successText: '#80dab0',
    grainOpacity: 0.1,
    grainBlend: 'overlay',
    sheen: 'rgba(255,255,255,0.22)',
  },
} as const;

export const FEATURES: Record<ThemeName, Record<FeatureKey, { fill: string; ink: string; glow: string }>> = {
  light: {
    attendance: { fill: '#dcd7fb', ink: '#2e2870', glow: '#a99cf0' },
    behavior: { fill: '#d4e5f8', ink: '#163e66', glow: '#9cc3ee' },
    leave: { fill: '#d5efe4', ink: '#1b5440', glow: '#9ed9c0' },
    assessments: { fill: '#f8e7cb', ink: '#5c4211', glow: '#f0c98e' },
  },
  dark: {
    attendance: { fill: '#2b2850', ink: '#dcd7ff', glow: '#7b6fd0' },
    behavior: { fill: '#1f3149', ink: '#d0e4fb', glow: '#6d9bcf' },
    leave: { fill: '#1c3a31', ink: '#caefdf', glow: '#6fb597' },
    assessments: { fill: '#3a3020', ink: '#f6e2bd', glow: '#c9a265' },
  },
};

/** The avatar monogram uses the leave pastel, as in the app. */
export const AVATAR = FEATURES;

export const FONT = {
  display: '"DS Trirong", serif',
  ui: '"DS Plex Thai", sans-serif',
  mono: '"DS Plex Mono", monospace',
};
