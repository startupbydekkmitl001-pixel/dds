import { FONT_ASSETS, FONT_LINE, lineHeightFor } from '@/theme/typography';

// Jest runs in Node; the app's TypeScript config has no Node types, so name just what's used.
const { readFileSync } = jest.requireActual<{ readFileSync(path: string): Uint8Array }>('fs');
const resolve = (require as unknown as { resolve(id: string): string }).resolve;

/** hhea ascender + |descender| + lineGap over unitsPerEm: the line height iOS and Android give the font. */
function naturalLineHeight(file: string): number {
  const bytes = readFileSync(file);
  const font = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = font.getUint16(4);
  const table = (tag: string) => {
    for (let i = 0; i < tables; i++) {
      const at = 12 + i * 16;
      if (String.fromCharCode(...bytes.subarray(at, at + 4)) === tag) return font.getUint32(at + 8);
    }
    throw new Error(`${file} has no ${tag} table`);
  };
  const unitsPerEm = font.getUint16(table('head') + 18);
  const hhea = table('hhea');
  return (font.getInt16(hhea + 4) - font.getInt16(hhea + 6) + font.getInt16(hhea + 8)) / unitsPerEm;
}

const FILES: Record<keyof typeof FONT_ASSETS, string> = {
  Trirong_300Light: 'trirong/300Light/Trirong_300Light.ttf',
  Trirong_300Light_Italic: 'trirong/300Light_Italic/Trirong_300Light_Italic.ttf',
  IBMPlexSansThai_400Regular: 'ibm-plex-sans-thai/400Regular/IBMPlexSansThai_400Regular.ttf',
  IBMPlexSansThai_500Medium: 'ibm-plex-sans-thai/500Medium/IBMPlexSansThai_500Medium.ttf',
  IBMPlexMono_400Regular: 'ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf',
  IBMPlexMono_500Medium: 'ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf',
};

test.each(Object.entries(FILES))('FONT_LINE matches the bundled %s', (family, file) => {
  const natural = naturalLineHeight(resolve(`@expo-google-fonts/${file}`));
  expect(FONT_LINE[family as keyof typeof FONT_LINE]).toBeGreaterThanOrEqual(natural);
  expect(FONT_LINE[family as keyof typeof FONT_LINE]).toBeCloseTo(natural, 2);
});

test('lineHeightFor rounds the font line up to whole points', () => {
  expect(lineHeightFor(40, 'Trirong_300Light')).toBe(70);
  expect(lineHeightFor(20, 'IBMPlexSansThai_500Medium')).toBe(33);
  expect(lineHeightFor(16, 'IBMPlexMono_500Medium')).toBe(21);
  // An unknown family is treated like the UI font, never tighter.
  expect(lineHeightFor(16)).toBe(27);
});
