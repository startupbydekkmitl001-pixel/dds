import { INITIAL_GATE, checkPin, lockRemainingMs, type PinGate } from '@/lib/pin';

const t0 = 1_000_000;

test('correct PIN passes and keeps a clean gate', () => {
  const r = checkPin(INITIAL_GATE, '123456', '123456', t0);
  expect(r).toMatchObject({ ok: true, remaining: 5, locked: false, gate: { failures: 0, lockedUntil: null } });
});

test('wrong PIN counts down remaining attempts', () => {
  const r = checkPin(INITIAL_GATE, '000000', '123456', t0);
  expect(r).toMatchObject({ ok: false, remaining: 4, locked: false });
});

describe('after five failures', () => {
  let g: PinGate = INITIAL_GATE;
  beforeAll(() => {
    for (let i = 0; i < 5; i++) g = checkPin(g, '000000', '123456', t0).gate;
  });

  test('locks for 30 seconds', () => {
    expect(g.lockedUntil).toBe(t0 + 30_000);
    expect(lockRemainingMs(g, t0 + 10_000)).toBe(20_000);
  });

  test('even the correct PIN is refused while locked', () => {
    expect(checkPin(g, '123456', '123456', t0 + 29_999)).toMatchObject({ ok: false, locked: true, remaining: 0 });
  });

  test('lock expiry resets the count', () => {
    expect(checkPin(g, '123456', '123456', t0 + 30_000)).toMatchObject({ ok: true, gate: { failures: 0, lockedUntil: null } });
    expect(checkPin(g, '000000', '123456', t0 + 30_000).remaining).toBe(4);
  });
});
