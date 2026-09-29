import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '@/data/store';
import type { FeatureKey, ThemePref } from '@/data/types';
import { features, palette, radius, space, statusColor, type ColorTokens, type FeatureColor } from './tokens';
import { typeScale } from './typography';

export type Scheme = 'light' | 'dark';

export function resolveScheme(pref: ThemePref, system: Scheme | null | undefined): Scheme {
  if (pref === 'light' || pref === 'dark') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export interface Theme {
  scheme: Scheme;
  c: ColorTokens;
  feature: Record<FeatureKey, FeatureColor>;
  statusColor: typeof statusColor;
  space: typeof space;
  radius: typeof radius;
  type: typeof typeScale;
  /** Soft layered shadow for floating glass (CSS box-shadow syntax, all platforms). */
  elevation: { low: string; high: string };
}

export const buildTheme = (scheme: Scheme): Theme => {
  const c = palette[scheme];
  return {
    scheme,
    c,
    feature: features[scheme],
    statusColor,
    space,
    radius,
    type: typeScale,
    elevation: {
      low: `0px 6px 18px 0px ${c.shadow}`,
      high: `0px 18px 40px -8px ${c.shadow}, 0px 4px 12px 0px ${c.shadow}`,
    },
  };
};

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pref = useApp((s) => s.settings.theme);
  const system = useColorScheme();
  const scheme = resolveScheme(pref, system === 'dark' || system === 'light' ? system : null);
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
