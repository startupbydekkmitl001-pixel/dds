import type { CSSProperties } from 'react';
import { Img, Loop, OffthreadVideo, staticFile } from 'remotion';
import { QrArt } from './bits';
import { FEATURES, FONT, PALETTE, type ThemeName } from './theme';

export const CARD_W = 900;
export const CARD_H = 600;
const R = 64;

/** Engraved guilloché lines, as on the app's pass. */
function contours(w: number, h: number): string {
  const lines: string[] = [];
  for (let k = 0; k < 9; k++) {
    const y0 = h * (0.2 + k * 0.085);
    const a = h * (0.05 + k * 0.006);
    lines.push(`M 0 ${y0} C ${w * 0.3} ${y0 - a * 2}, ${w * 0.55} ${y0 + a * 2.4}, ${w} ${y0 - a}`);
  }
  return lines.join(' ');
}

/** The school seal: the 60 fps loop while its face is showing, its first frame otherwise. */
function Seal({ size, live }: { size: number; live: boolean }) {
  const box: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flex: 'none',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.8), 0 14px 34px rgba(20,24,60,0.3)',
  };
  const fill: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  return (
    <div style={box}>
      {live ? (
        <Loop durationInFrames={360} layout="none">
          <OffthreadVideo muted src={staticFile('loops/seal.mp4')} style={fill} />
        </Loop>
      ) : (
        <Img src={staticFile('loops/seal-poster.jpg')} style={fill} />
      )}
    </div>
  );
}

function Surface({ theme }: { theme: ThemeName }) {
  const c = PALETTE[theme];
  const glowA = theme === 'light' ? '#eea8c0' : '#c27792';
  const glowB = theme === 'light' ? '#a99cf0' : '#7b6fd0';
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${c.idCard[0]}, ${c.idCard[1]} 55%, ${c.idCard[2]})` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 100% 4%, ${glowA}73 0%, transparent 38%), radial-gradient(circle at 4% 100%, ${glowB}66 0%, transparent 42%)` }} />
      <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', inset: 0 }}>
        <path d={contours(CARD_W, CARD_H)} stroke={c.idCardText} strokeOpacity={0.08} strokeWidth={2} fill="none" />
      </svg>
    </>
  );
}

/**
 * The student pass. `flip` is the turn in degrees (0 front, 180 back). Each face is switched
 * off the moment it turns edge-on, so a face never shows through the other.
 */
export function StudentCard({ theme, flip, sheen }: { theme: ThemeName; flip: number; sheen: number }) {
  const c = PALETTE[theme];
  const avatar = FEATURES[theme].leave;
  const backShowing = Math.cos((flip * Math.PI) / 180) < 0;
  const face: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: R,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    border: `3px solid ${c.glassBorder}`,
    boxShadow: `inset 0 3px 0 ${c.gloss}`,
    color: c.idCardText,
    fontFamily: FONT.ui,
  };
  const sheenBand: CSSProperties = {
    position: 'absolute',
    top: -200,
    left: 0,
    width: 360,
    height: CARD_H + 400,
    background: `linear-gradient(90deg, transparent, ${c.sheen} 50%, transparent)`,
    transform: `translateX(${-420 + sheen * 1720}px) rotate(18deg)`,
    mixBlendMode: 'soft-light',
    opacity: sheen > 0 && sheen < 1 ? 1 : 0,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
      {/* Front */}
      <div style={{ ...face, opacity: backShowing ? 0 : 1 }}>
        <Surface theme={theme} />
        <div style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Seal size={138} live={!backShowing} />
            <div>
              <div style={{ font: `500 50px/1.35 ${FONT.ui}` }}>โรงเรียนราชดำริ</div>
              <div style={{ font: `500 24px/1.4 ${FONT.mono}`, letterSpacing: '0.18em', opacity: 0.9 }}>DSCHOOL · STUDENT ID</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <div
              style={{
                width: 138,
                height: 138,
                borderRadius: '50%',
                border: '5px solid #fff',
                background: avatar.fill,
                color: avatar.ink,
                display: 'grid',
                placeItems: 'center',
                font: `300 70px/1 ${FONT.display}`,
              }}
            >
              ภ
            </div>
            <div>
              <div style={{ font: `500 56px/1.35 ${FONT.ui}` }}>ภูมิภัทร ศรีสุข</div>
              <div style={{ font: `400 40px/1.35 ${FONT.ui}`, opacity: 0.9 }}>ม.5/3</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ font: `500 44px/1.2 ${FONT.mono}` }}>รหัส 24815</div>
            <div style={{ font: `400 34px/1.35 ${FONT.ui}` }}>ปีการศึกษา 2569</div>
          </div>
        </div>
        <div style={sheenBand} />
      </div>

      {/* Back */}
      <div style={{ ...face, transform: 'rotateY(180deg)', opacity: backShowing ? 1 : 0 }}>
        <Surface theme={theme} />
        <div style={{ position: 'absolute', inset: 0, padding: 48, display: 'flex', alignItems: 'center', gap: 44 }}>
          <div style={{ background: '#fff', padding: 26, borderRadius: 36, boxShadow: `0 18px 40px ${c.shadow}` }}>
            <QrArt size={392} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Seal size={104} live={backShowing} />
            <div style={{ font: `500 42px/1.35 ${FONT.ui}`, marginTop: 14 }}>ปีการศึกษา 2569</div>
            <div style={{ font: `400 34px/1.35 ${FONT.ui}` }}>โรงเรียนราชดำริ</div>
            <div style={{ font: `400 27px/1.4 ${FONT.ui}`, opacity: 0.85, marginTop: 10, maxWidth: 300 }}>หากพบบัตรนี้ กรุณาส่งคืนโรงเรียน</div>
          </div>
        </div>
        <div style={sheenBand} />
      </div>
    </div>
  );
}
