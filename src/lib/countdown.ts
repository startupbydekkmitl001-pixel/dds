import { base36 } from './id';

/** Pay-QR codes rotate every 60 seconds. */
export const QR_PERIOD_S = 60;

export function secondsLeft(issuedAtMs: number, nowMs: number, periodS = QR_PERIOD_S): number {
  const remainingMs = periodS * 1000 - (nowMs - issuedAtMs);
  return Math.min(periodS, Math.max(0, Math.ceil(remainingMs / 1000)));
}

export function elapsedFraction(issuedAtMs: number, nowMs: number, periodS = QR_PERIOD_S): number {
  return Math.min(1, Math.max(0, (nowMs - issuedAtMs) / (periodS * 1000)));
}

export function newQrToken(studentId: string, nowMs: number, rand: () => number = Math.random): string {
  return `DSCH:${studentId}:${nowMs.toString(36)}:${base36(rand, 6)}`;
}
