import { continueRender, delayRender, staticFile } from 'remotion';

/** The app's own typefaces (SIL OFL 1.1), loaded before the first frame is captured. */
const FACES: { family: string; file: string; weight: string; style?: string }[] = [
  { family: 'DS Trirong', file: 'fonts/Trirong_300Light.ttf', weight: '300' },
  { family: 'DS Trirong', file: 'fonts/Trirong_300Light_Italic.ttf', weight: '300', style: 'italic' },
  { family: 'DS Plex Thai', file: 'fonts/IBMPlexSansThai_400Regular.ttf', weight: '400' },
  { family: 'DS Plex Thai', file: 'fonts/IBMPlexSansThai_500Medium.ttf', weight: '500' },
  { family: 'DS Plex Mono', file: 'fonts/IBMPlexMono_400Regular.ttf', weight: '400' },
  { family: 'DS Plex Mono', file: 'fonts/IBMPlexMono_500Medium.ttf', weight: '500' },
];

const handle = delayRender('Loading the app fonts');
Promise.all(
  FACES.map(async (f) => {
    const face = new FontFace(f.family, `url('${staticFile(f.file)}') format('truetype')`, {
      weight: f.weight,
      style: f.style ?? 'normal',
    });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
