/**
 * Origin's three voices, adapted for Thai (spec §4.2): Trirong for emotion,
 * IBM Plex Sans Thai for UI, IBM Plex Mono for money/times/dates.
 * Line height is always ≥ 1.2× so Thai vowel and tone marks never clip.
 */
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSansThai_400Regular, IBMPlexSansThai_500Medium } from '@expo-google-fonts/ibm-plex-sans-thai';
import { Trirong_300Light, Trirong_300Light_Italic } from '@expo-google-fonts/trirong';

export const FONT_ASSETS = {
  Trirong_300Light,
  Trirong_300Light_Italic,
  IBMPlexSansThai_400Regular,
  IBMPlexSansThai_500Medium,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

export type TypeVariant =
  | 'display'
  | 'displayItalic'
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'caption'
  | 'data'
  | 'eyebrow';

export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

export const typeScale: Record<TypeVariant, TypeStyle> = {
  display: { fontFamily: 'Trirong_300Light', fontSize: 40, lineHeight: 50, letterSpacing: -0.4 },
  displayItalic: { fontFamily: 'Trirong_300Light_Italic', fontSize: 40, lineHeight: 50, letterSpacing: -0.4 },
  title: { fontFamily: 'Trirong_300Light', fontSize: 30, lineHeight: 38, letterSpacing: -0.2 },
  heading: { fontFamily: 'IBMPlexSansThai_500Medium', fontSize: 20, lineHeight: 28 },
  body: { fontFamily: 'IBMPlexSansThai_400Regular', fontSize: 16, lineHeight: 24 },
  label: { fontFamily: 'IBMPlexSansThai_500Medium', fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: 'IBMPlexSansThai_400Regular', fontSize: 13, lineHeight: 18 },
  data: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 16, lineHeight: 22 },
  eyebrow: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
};

/** Line height for an overridden size (keeps the ≥1.2× Thai rule). */
export const lineHeightFor = (size: number) => Math.round(size * 1.25);
