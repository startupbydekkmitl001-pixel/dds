import { DEFAULT_SETTINGS, buildSeed } from '@/data/seed';
import { unreadCount } from '@/data/selectors';
import { createAppStore } from '@/data/store';

const T = new Date(2026, 8, 29, 9).getTime();
const fresh = () => createAppStore(buildSeed(new Date(T)), { persist: false });
const seedWallet = buildSeed(new Date(T)).wallet;

describe('slip top-ups', () => {
  test('auto mode credits once per clientId and raises an alert', () => {
    const st = fresh();
    const b0 = st.getState().wallet.balance;
    expect(st.getState().submitSlip({ clientId: 'c1', amount: 50, nowMs: T })).toBe('verified');
    st.getState().submitSlip({ clientId: 'c1', amount: 50, nowMs: T });
    expect(st.getState().wallet.balance).toBe(b0 + 50);
    expect(st.getState().wallet.transactions[0]).toMatchObject({ kind: 'topup', amount: 50, source: 'slip' });
    expect(st.getState().alerts[0]).toMatchObject({ kind: 'topup', read: false, link: '/wallet', title: 'เติมเงิน ฿50 สำเร็จ' });
  });

  test('pending mode settles on the tick at dueAt', () => {
    const st = fresh();
    const b0 = st.getState().wallet.balance;
    st.getState().updateDemo({ slipMode: 'pending' });
    expect(st.getState().submitSlip({ clientId: 'c2', amount: 40, nowMs: T })).toBe('pending');
    st.getState().tick(T + 19_999);
    expect(st.getState().wallet.balance).toBe(b0);
    st.getState().tick(T + 20_000);
    expect(st.getState().wallet.balance).toBe(b0 + 40);
    expect(st.getState().wallet.pending).toHaveLength(0);
  });

  test('an overdue pending item from a previous session settles on the first tick', () => {
    const st = createAppStore(
      { ...buildSeed(new Date(T)), wallet: { ...seedWallet, pending: [{ id: 'p', clientId: 'x', amount: 30, dueAt: T - 1 }] } },
      { persist: false },
    );
    st.getState().tick(T);
    expect(st.getState().wallet.balance).toBe(seedWallet.balance + 30);
  });

  test('reject mode changes nothing and allows a retry with the same clientId', () => {
    const st = fresh();
    const b0 = st.getState().wallet.balance;
    st.getState().updateDemo({ slipMode: 'reject' });
    expect(st.getState().submitSlip({ clientId: 'c3', amount: 40, nowMs: T })).toBe('rejected');
    expect(st.getState().wallet.balance).toBe(b0);
    st.getState().updateDemo({ slipMode: 'auto' });
    expect(st.getState().submitSlip({ clientId: 'c3', amount: 40, nowMs: T })).toBe('verified');
    expect(st.getState().wallet.balance).toBe(b0 + 40);
  });
});

describe('purchases', () => {
  test('frozen card and insufficient balance are refused without going negative', () => {
    const st = fresh();
    st.getState().setFrozen(true);
    expect(st.getState().purchase({ amount: 35, title: 'x', nowMs: T })).toEqual({ ok: false, reason: 'frozen' });
    st.getState().setFrozen(false);
    const b0 = st.getState().wallet.balance;
    expect(st.getState().purchase({ amount: 999_999, title: 'x', nowMs: T })).toEqual({ ok: false, reason: 'insufficient' });
    expect(st.getState().wallet.balance).toBe(b0);
  });

  test('a valid purchase deducts and records a QR transaction', () => {
    const st = fresh();
    const b0 = st.getState().wallet.balance;
    expect(st.getState().purchase({ amount: 35, title: 'ร้านข้าวมันไก่ป้าน้อย', nowMs: T })).toEqual({ ok: true });
    expect(st.getState().wallet.balance).toBe(b0 - 35);
    expect(st.getState().wallet.transactions[0]).toMatchObject({ kind: 'purchase', amount: 35, source: 'qr' });
  });
});

test('a bank transfer can be claimed only once', () => {
  const st = fresh();
  const tr = st.getState().wallet.transfers[0];
  const b0 = st.getState().wallet.balance;
  expect(st.getState().claimTransfer(tr.id, T)).toBe(true);
  expect(st.getState().claimTransfer(tr.id, T)).toBe(false);
  expect(st.getState().wallet.balance).toBe(b0 + tr.amount);
});

describe('leave requests', () => {
  const input = { clientId: 'L1', type: 'sick' as const, start: '2026-09-30', end: '2026-10-01', reason: 'ไข้หวัดใหญ่', photoUri: null, nowMs: T };

  test('double submit creates one request', () => {
    const st = fresh();
    const lv = st.getState().submitLeave(input);
    const again = st.getState().submitLeave(input);
    expect(st.getState().leaves).toHaveLength(1);
    expect(again.id).toBe(lv.id);
    expect(lv).toMatchObject({ status: 'submitted', nextAt: T + 30_000 });
  });

  test('ticks advance submitted → approved → recorded and mark attendance', () => {
    const st = fresh();
    const lv = st.getState().submitLeave(input);
    st.getState().tick(T + 29_999);
    expect(st.getState().leaves[0].status).toBe('submitted');
    st.getState().tick(T + 30_000);
    expect(st.getState().leaves[0]).toMatchObject({ status: 'approved', nextAt: T + 40_000 });
    expect(st.getState().leaves[0].history.map((h) => h.status)).toEqual(['submitted', 'approved']);
    expect(st.getState().alerts[0]).toMatchObject({ kind: 'leave', link: `/leave/${lv.id}` });
    const sem1 = st.getState().attendance['2569-1'];
    expect(sem1.find((d) => d.date === '2026-09-30')?.status).toBe('sick');
    expect(sem1.find((d) => d.date === '2026-10-01')?.status).toBe('sick');
    st.getState().tick(T + 40_000);
    expect(st.getState().leaves[0]).toMatchObject({ status: 'recorded', nextAt: null });
  });

  test('fast mode shortens the approval wait', () => {
    const st = fresh();
    st.getState().updateDemo({ fastLeave: true });
    expect(st.getState().submitLeave({ ...input, clientId: 'L2' }).nextAt).toBe(T + 5_000);
  });
});

test('tick with nothing due does not replace state', () => {
  const st = fresh();
  const before = st.getState();
  st.getState().tick(T);
  expect(st.getState()).toBe(before);
});

test('muted alert kinds arrive already read', () => {
  const st = fresh();
  st.getState().updateSettings({ notify: { ...DEFAULT_SETTINGS.notify, topup: false } });
  st.getState().submitSlip({ clientId: 'c4', amount: 20, nowMs: T });
  expect(st.getState().alerts[0].read).toBe(true);
});

test('markRead and markAllRead', () => {
  const st = fresh();
  const first = st.getState().alerts.find((a) => !a.read)!;
  st.getState().markRead(first.id);
  expect(unreadCount(st.getState().alerts)).toBe(1);
  st.getState().markAllRead();
  expect(unreadCount(st.getState().alerts)).toBe(0);
});

test('completeAssessment stores the scored result', () => {
  const st = fresh();
  const eq = st.getState().assessments[0];
  const answers = Object.fromEntries(eq.questions.map((q) => [q.id, 4]));
  st.getState().completeAssessment('eq', answers, T);
  const done = st.getState().assessments[0];
  expect(done.completedAt).toBe(new Date(T).toISOString());
  expect(done.result!['ดี']).toEqual({ score: 12, max: 12 });
});

test('resetDemo restores the seed but keeps theme and demo visibility', () => {
  const st = fresh();
  st.getState().submitLeave({ clientId: 'L9', type: 'sick', start: '2026-09-30', end: '2026-09-30', reason: 'ไข้หวัดใหญ่', photoUri: null, nowMs: T });
  st.getState().updateSettings({ theme: 'dark' });
  st.getState().updateDemo({ visible: true, networkErrors: true });
  st.getState().resetDemo(T);
  expect(st.getState().leaves).toHaveLength(0);
  expect(st.getState().settings.theme).toBe('dark');
  expect(st.getState().settings.demo).toMatchObject({ visible: true, networkErrors: false });
});

test('unlock and lock', () => {
  const st = fresh();
  expect(st.getState().unlocked).toBe(false);
  st.getState().unlock();
  expect(st.getState().unlocked).toBe(true);
  st.getState().lock();
  expect(st.getState().unlocked).toBe(false);
});
