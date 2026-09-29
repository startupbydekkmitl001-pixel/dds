/**
 * Origin's three voices, adapted for Thai (spec §4.2): Trirong for emotion,
 * IBM Plex Sans Thai for UI, IBM Plex Mono for money/times/dates.
 *
 * A line is never shorter than its font's own line height (FONT_LINE). Set any tighter and Thai
 * marks get clipped: iOS keeps the descender and cuts the top off the line (ี ้ ั ิ vanish), and
 * Android trims both ends. The Thai faces need a tall box because their ascender leaves room for
 * a vowel with a tone mark stacked on top.
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

/**
 * Each font's natural line height ((hhea ascender + |descender|) / unitsPerEm, read from the bundled
 * .ttf files) — the height iOS and Android give a line of it, which holds every stacked Thai mark.
 */
export const FONT_LINE: Record<keyof typeof FONT_ASSETS, number> = {
  Trirong_300Light: 1.734,
  Trirong_300Light_Italic: 1.734,
  IBMPlexSansThai_400Regular: 1.65,
  IBMPlexSansThai_500Medium: 1.65,
  IBMPlexMono_400Regular: 1.3,
  IBMPlexMono_500Medium: 1.3,
};

/** Italic Trirong leans past its advance width by up to this much of its size (a tone mark on the last letter). */
export const ITALIC_OVERHANG = 0.25;

/**
 * How far an italic Trirong line (a nickname, an italic word) may tuck up under the Trirong line above
 * it. That line's box keeps room below the baseline for ู and this one keeps room above its tallest mark,
 * so pulling it up this far closes the gap without the two ever touching.
 */
export const ITALIC_TUCK = 12;

/** The shortest line height that still shows every mark of `fontFamily` at `size`, in whole points. */
export function lineHeightFor(size: number, fontFamily?: string): number {
  const ratio = FONT_LINE[fontFamily as keyof typeof FONT_LINE] ?? FONT_LINE.IBMPlexSansThai_400Regular;
  return Math.ceil(size * ratio - 1e-6);
}

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
  fontFamily: keyof typeof FONT_ASSETS;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

export const typeScale: Record<TypeVariant, TypeStyle> = {
  display: { fontFamily: 'Trirong_300Light', fontSize: 40, lineHeight: 70, letterSpacing: -0.4 },
  displayItalic: { fontFamily: 'Trirong_300Light_Italic', fontSize: 40, lineHeight: 70, letterSpacing: -0.4 },
  title: { fontFamily: 'Trirong_300Light', fontSize: 30, lineHeight: 53, letterSpacing: -0.2 },
  heading: { fontFamily: 'IBMPlexSansThai_500Medium', fontSize: 20, lineHeight: 33 },
  body: { fontFamily: 'IBMPlexSansThai_400Regular', fontSize: 16, lineHeight: 27 },
  label: { fontFamily: 'IBMPlexSansThai_500Medium', fontSize: 14, lineHeight: 24 },
  caption: { fontFamily: 'IBMPlexSansThai_400Regular', fontSize: 13, lineHeight: 22 },
  data: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 16, lineHeight: 22 },
  eyebrow: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
};
