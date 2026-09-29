/** PIN attempt limiting: 5 wrong tries lock input for 30 seconds. */
export const PIN_LENGTH = 6;
export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 30_000;

export interface PinGate {
  failures: number;
  lockedUntil: number | null;
}

export const INITIAL_GATE: PinGate = { failures: 0, lockedUntil: null };

export function lockRemainingMs(gate: PinGate, nowMs: number): number {
  return gate.lockedUntil === null ? 0 : Math.max(0, gate.lockedUntil - nowMs);
}

export function checkPin(
  gate: PinGate,
  entered: string,
  actual: string,
  nowMs: number,
): { ok: boolean; gate: PinGate; remaining: number; locked: boolean } {
  if (lockRemainingMs(gate, nowMs) > 0) {
    return { ok: false, gate, remaining: 0, locked: true };
  }
  // An expired lock starts a fresh count.
  const current = gate.lockedUntil !== null ? INITIAL_GATE : gate;

  if (entered === actual) {
    return { ok: true, gate: INITIAL_GATE, remaining: MAX_ATTEMPTS, locked: false };
  }
  const failures = current.failures + 1;
  if (failures >= MAX_ATTEMPTS) {
    return { ok: false, gate: { failures, lockedUntil: nowMs + LOCKOUT_MS }, remaining: 0, locked: true };
  }
  return { ok: false, gate: { failures, lockedUntil: null }, remaining: MAX_ATTEMPTS - failures, locked: false };
}
