import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '@/data/store';
import type { ThemePref } from '@/data/types';
import { feature, palette, radius, space, statusColor, type ColorTokens } from './tokens';
import { typeScale } from './typography';

export type Scheme = 'light' | 'dark';

export function resolveScheme(pref: ThemePref, system: Scheme | null | undefined): Scheme {
  if (pref === 'light' || pref === 'dark') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export interface Theme {
  scheme: Scheme;
  c: ColorTokens;
  feature: typeof feature;
  statusColor: typeof statusColor;
  space: typeof space;
  radius: typeof radius;
  type: typeof typeScale;
}

const build = (scheme: Scheme): Theme => ({
  scheme,
  c: palette[scheme],
  feature,
  statusColor,
  space,
  radius,
  type: typeScale,
});

const ThemeContext = createContext<Theme>(build('light'));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pref = useApp((s) => s.settings.theme);
  const system = useColorScheme();
  const scheme = resolveScheme(pref, system === 'dark' || system === 'light' ? system : null);
  const theme = useMemo(() => build(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
