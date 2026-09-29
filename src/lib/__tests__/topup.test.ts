import { initialTopup, stepIndex, topupReducer, validateAmount, type TopupState } from '@/lib/topup';

describe('validateAmount', () => {
  test('accepts plain, padded, comma-grouped and Thai-digit input', () => {
    expect(validateAmount('50')).toEqual({ ok: true, amount: 50 });
    expect(validateAmount(' 50 ')).toEqual({ ok: true, amount: 50 });
    expect(validateAmount('1,000')).toEqual({ ok: true, amount: 1000 });
    expect(validateAmount('๑๐๐')).toEqual({ ok: true, amount: 100 });
  });
  test('rejects empty and non-integer input', () => {
    expect(validateAmount('')).toEqual({ ok: false, error: 'ใส่จำนวนเงิน' });
    expect(validateAmount('   ')).toEqual({ ok: false, error: 'ใส่จำนวนเงิน' });
    expect(validateAmount('12.5')).toEqual({ ok: false, error: 'ใส่เป็นจำนวนเต็มบาท' });
    expect(validateAmount('abc')).toEqual({ ok: false, error: 'ใส่เป็นจำนวนเต็มบาท' });
  });
  test('enforces ฿10–฿2,000', () => {
    expect(validateAmount('9')).toEqual({ ok: false, error: 'ขั้นต่ำ ฿10' });
    expect(validateAmount('2001')).toEqual({ ok: false, error: 'สูงสุด ฿2,000' });
    expect(validateAmount('2000')).toEqual({ ok: true, amount: 2000 });
  });
});

describe('topupReducer', () => {
  test('NEXT without an amount stays on the amount step', () => {
    expect(topupReducer(initialTopup, { type: 'NEXT' }).step).toBe('amount');
  });

  test('walks amount → transfer → slip → scanning with BACK support', () => {
    let s: TopupState = topupReducer(topupReducer(initialTopup, { type: 'SET_AMOUNT', amount: 50 }), { type: 'NEXT' });
    expect(s).toEqual({ step: 'transfer', amount: 50, slipUri: null });
    expect(topupReducer(s, { type: 'BACK' }).step).toBe('amount');
    s = topupReducer(s, { type: 'NEXT' });
    expect(s.step).toBe('slip');
    expect(topupReducer(s, { type: 'BACK' }).step).toBe('transfer');
    s = topupReducer(s, { type: 'SLIP_PICKED', uri: 'demo://slip' });
    expect(s).toEqual({ step: 'scanning', amount: 50, slipUri: 'demo://slip' });
    expect(topupReducer(s, { type: 'BACK' })).toBe(s);
    expect(topupReducer(s, { type: 'RETRY' })).toEqual({ step: 'slip', amount: 50, slipUri: null });
    expect(topupReducer(s, { type: 'SCAN_DONE', result: 'verified' }).step).toBe('verified');
    expect(topupReducer(s, { type: 'SCAN_DONE', result: 'pending' }).step).toBe('pending');
    const rej = topupReducer(s, { type: 'SCAN_DONE', result: 'rejected' });
    expect(topupReducer(rej, { type: 'RETRY' })).toEqual({ step: 'slip', amount: 50, slipUri: null });
  });

  test('events outside their step are ignored', () => {
    expect(topupReducer(initialTopup, { type: 'SLIP_PICKED', uri: 'x' })).toBe(initialTopup);
    expect(topupReducer(initialTopup, { type: 'RETRY' })).toBe(initialTopup);
  });

  test('stepIndex maps result steps to the slip step', () => {
    expect([stepIndex('amount'), stepIndex('transfer'), stepIndex('pending')]).toEqual([0, 1, 2]);
  });
});
