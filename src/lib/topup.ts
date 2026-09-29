/** Top-up amount rules and the 3-step flow state machine (spec §5.3). */
export const TOPUP_PRESETS = [20, 50, 100, 200] as const;
export const TOPUP_MIN = 10;
export const TOPUP_MAX = 2000;

const THAI_ZERO = 0x0e50;

function normalizeDigits(input: string): string {
  return input.replace(/[๐-๙]/g, (ch) => String(ch.charCodeAt(0) - THAI_ZERO));
}

export function validateAmount(input: string): { ok: true; amount: number } | { ok: false; error: string } {
  const cleaned = normalizeDigits(input).replace(/[\s,]/g, '');
  if (cleaned === '') return { ok: false, error: 'ใส่จำนวนเงิน' };
  if (!/^\d+$/.test(cleaned)) return { ok: false, error: 'ใส่เป็นจำนวนเต็มบาท' };
  const amount = Number(cleaned);
  if (amount < TOPUP_MIN) return { ok: false, error: `ขั้นต่ำ ฿${TOPUP_MIN}` };
  if (amount > TOPUP_MAX) return { ok: false, error: 'สูงสุด ฿2,000' };
  return { ok: true, amount };
}

export type TopupStep = 'amount' | 'transfer' | 'slip' | 'scanning' | 'verified' | 'pending' | 'rejected';

export interface TopupState {
  step: TopupStep;
  amount: number | null;
  slipUri: string | null;
}

export type TopupEvent =
  | { type: 'SET_AMOUNT'; amount: number | null }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SLIP_PICKED'; uri: string }
  | { type: 'SCAN_DONE'; result: 'verified' | 'pending' | 'rejected' }
  | { type: 'RETRY' };

export const initialTopup: TopupState = { step: 'amount', amount: null, slipUri: null };

export function topupReducer(s: TopupState, e: TopupEvent): TopupState {
  switch (e.type) {
    case 'SET_AMOUNT':
      return s.step === 'amount' ? { ...s, amount: e.amount } : s;
    case 'NEXT':
      if (s.step === 'amount' && s.amount !== null) return { ...s, step: 'transfer' };
      if (s.step === 'transfer') return { ...s, step: 'slip' };
      return s;
    case 'BACK':
      if (s.step === 'transfer') return { ...s, step: 'amount' };
      if (s.step === 'slip') return { ...s, step: 'transfer' };
      return s;
    case 'SLIP_PICKED':
      return s.step === 'slip' ? { ...s, step: 'scanning', slipUri: e.uri } : s;
    case 'SCAN_DONE':
      return s.step === 'scanning' ? { ...s, step: e.result } : s;
    case 'RETRY':
      return s.step === 'rejected' || s.step === 'scanning' ? { ...s, step: 'slip', slipUri: null } : s;
  }
}

export function stepIndex(step: TopupStep): 0 | 1 | 2 {
  if (step === 'amount') return 0;
  if (step === 'transfer') return 1;
  return 2;
}
