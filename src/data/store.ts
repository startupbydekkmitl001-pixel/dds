/**
 * The app's single source of truth: sample data + settings + session, with
 * the simulated backend's side effects (credits, approvals, alerts).
 *
 * Selectors passed to `useApp` must return state slices (or primitives);
 * derive new arrays/objects in components with `useMemo`, not in the selector.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, useStore, type StoreApi } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { scoreAssessment } from '@/lib/assessment';
import { isSchoolDay } from '@/lib/attendance';
import { now } from '@/lib/clock';
import { formatBaht, parseISODate, thaiDate } from '@/lib/format';
import { newId } from '@/lib/id';
import { datesBetween, LEAVE_TYPE_LABEL, leaveDelayMs, nextLeaveStatus } from '@/lib/leave';
import { INITIAL_GATE, type PinGate } from '@/lib/pin';
import { SEMESTERS } from './calendar';
import { buildSeed, DEFAULT_SETTINGS, SCHOOL_NAME, type AppData } from './seed';
import type {
  AlertKind,
  AppAlert,
  Assessment,
  AttendanceDay,
  DemoSettings,
  LeaveRequest,
  LeaveType,
  SemesterId,
  Settings,
  Wallet,
} from './types';

export type SlipResult = 'verified' | 'pending' | 'rejected';

export interface AppState extends AppData {
  settings: Settings;
  pinGate: PinGate;
  unlocked: boolean;
  hydrated: boolean;
  /** Recently handled idempotency keys (newest last, capped). */
  processed: string[];

  unlock(): void;
  lock(): void;
  setPinGate(g: PinGate): void;
  submitSlip(p: { clientId: string; amount: number; nowMs: number }): SlipResult;
  claimTransfer(id: string, nowMs: number): boolean;
  purchase(p: { amount: number; title: string; nowMs: number }): { ok: true } | { ok: false; reason: 'frozen' | 'insufficient' };
  setFrozen(frozen: boolean): void;
  submitLeave(p: {
    clientId: string;
    type: LeaveType;
    start: string;
    end: string;
    reason: string;
    photoUri: string | null;
    nowMs: number;
  }): LeaveRequest;
  completeAssessment(id: Assessment['id'], answers: Record<string, number>, nowMs: number): void;
  markRead(id: string): void;
  markAllRead(): void;
  updateSettings(p: Partial<Omit<Settings, 'demo'>>): void;
  updateDemo(p: Partial<DemoSettings>): void;
  tick(nowMs: number): void;
  resetDemo(nowMs: number): void;
}

const SLIP_PENDING_MS = 20_000;
const PROCESSED_CAP = 100;
const iso = (ms: number) => new Date(ms).toISOString();

function makeAlert(settings: Settings, kind: AlertKind, title: string, body: string, link: string, nowMs: number): AppAlert {
  return { id: newId('al'), kind, title, body, at: iso(nowMs), read: !settings.notify[kind], link };
}

function remember(processed: string[], id: string): string[] {
  return [...processed, id].slice(-PROCESSED_CAP);
}

/** Wallet + alert changes for crediting a verified slip. */
function credit(s: Pick<AppState, 'wallet' | 'alerts' | 'settings'>, amount: number, nowMs: number) {
  const wallet: Wallet = {
    ...s.wallet,
    balance: s.wallet.balance + amount,
    transactions: [
      { id: newId('tx'), kind: 'topup', amount, at: iso(nowMs), title: 'เติมเงินผ่านสลิป', source: 'slip' },
      ...s.wallet.transactions,
    ],
  };
  const alert = makeAlert(
    s.settings,
    'topup',
    `เติมเงิน ${formatBaht(amount)} สำเร็จ`,
    'ตรวจสอบสลิปเรียบร้อย ยอดเงินเข้ากระเป๋าแล้ว',
    '/wallet',
    nowMs,
  );
  return { wallet, alerts: [alert, ...s.alerts] };
}

function semesterFor(date: string): SemesterId | null {
  const sem = Object.values(SEMESTERS).find((x) => x.start <= date && date <= x.end);
  return sem ? sem.id : null;
}

/** Upsert leave days into attendance so the calendar and counts reflect approved leave. */
function markLeaveDays(attendance: AppData['attendance'], leave: LeaveRequest): AppData['attendance'] {
  const next = { ...attendance };
  for (const date of datesBetween(leave.start, leave.end)) {
    if (!isSchoolDay(date)) continue;
    const semId = semesterFor(date);
    if (!semId) continue;
    const day: AttendanceDay = { date, status: leave.type, checkIn: null, gate: null, note: leave.reason };
    next[semId] = [...next[semId].filter((d) => d.date !== date), day].sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  return next;
}

const LEAVE_ALERT_TITLE: Record<'approved' | 'recorded', string> = {
  approved: 'ครูที่ปรึกษาอนุมัติใบลาแล้ว',
  recorded: 'บันทึกใบลาในระบบแล้ว',
};

/** The placeholder school name used before the prototype adopted its real school. */
const SAMPLE_SCHOOL_V1 = 'โรงเรียนตัวอย่างวิทยา';

/** v2: saves that still carry the placeholder school move to SCHOOL_NAME; a school someone chose stays. */
export function migratePersisted(persisted: unknown, version: number): AppState {
  const state = persisted as AppState;
  if (version < 2 && state?.student?.school === SAMPLE_SCHOOL_V1) {
    return { ...state, student: { ...state.student, school: SCHOOL_NAME } };
  }
  return state;
}

export function createAppStore(
  initial: AppData,
  opts: { storage?: StateStorage; persist?: boolean } = {},
): StoreApi<AppState> {
  const usePersist = opts.persist !== false;

  const creator = (set: StoreApi<AppState>['setState'], get: StoreApi<AppState>['getState']): AppState => ({
    ...initial,
    settings: DEFAULT_SETTINGS,
    pinGate: INITIAL_GATE,
    unlocked: false,
    hydrated: !usePersist,
    processed: [],

    unlock: () => set({ unlocked: true }),
    lock: () => set({ unlocked: false }),
    setPinGate: (pinGate) => set({ pinGate }),

    submitSlip: ({ clientId, amount, nowMs }) => {
      const s = get();
      const mode = s.settings.demo.slipMode;
      const result: SlipResult = mode === 'auto' ? 'verified' : mode === 'pending' ? 'pending' : 'rejected';
      if (s.processed.includes(clientId) || result === 'rejected') return result;
      if (result === 'verified') {
        set({ ...credit(s, amount, nowMs), processed: remember(s.processed, clientId) });
      } else {
        const pending = [...s.wallet.pending, { id: newId('pt'), clientId, amount, dueAt: nowMs + SLIP_PENDING_MS }];
        set({ wallet: { ...s.wallet, pending }, processed: remember(s.processed, clientId) });
      }
      return result;
    },

    claimTransfer: (id, nowMs) => {
      const s = get();
      const tr = s.wallet.transfers.find((t) => t.id === id);
      if (!tr || tr.claimed) return false;
      const credited = credit(s, tr.amount, nowMs);
      set({
        ...credited,
        wallet: { ...credited.wallet, transfers: s.wallet.transfers.map((t) => (t.id === id ? { ...t, claimed: true } : t)) },
      });
      return true;
    },

    purchase: ({ amount, title, nowMs }) => {
      const s = get();
      if (s.wallet.frozen) return { ok: false, reason: 'frozen' };
      if (s.wallet.balance < amount) return { ok: false, reason: 'insufficient' };
      set({
        wallet: {
          ...s.wallet,
          balance: s.wallet.balance - amount,
          transactions: [{ id: newId('tx'), kind: 'purchase', amount, at: iso(nowMs), title, source: 'qr' }, ...s.wallet.transactions],
        },
      });
      return { ok: true };
    },

    setFrozen: (frozen) => set((s) => ({ wallet: { ...s.wallet, frozen } })),

    submitLeave: ({ clientId, nowMs, ...fields }) => {
      const s = get();
      const existing = s.leaves.find((l) => l.clientId === clientId);
      if (existing) return existing;
      const leave: LeaveRequest = {
        id: newId('lv'),
        clientId,
        ...fields,
        status: 'submitted',
        history: [{ status: 'submitted', at: iso(nowMs) }],
        createdAt: iso(nowMs),
        nextAt: nowMs + leaveDelayMs('submitted', s.settings.demo.fastLeave),
      };
      const alert = makeAlert(
        s.settings,
        'leave',
        'ส่งใบลาแล้ว',
        `${LEAVE_TYPE_LABEL[leave.type]} · ${thaiDate(parseISODate(leave.start), 'short')}`,
        `/leave/${leave.id}`,
        nowMs,
      );
      set({ leaves: [leave, ...s.leaves], alerts: [alert, ...s.alerts], processed: remember(s.processed, clientId) });
      return leave;
    },

    completeAssessment: (id, answers, nowMs) =>
      set((s) => ({
        assessments: s.assessments.map((a) =>
          a.id === id ? { ...a, completedAt: iso(nowMs), result: scoreAssessment(a, answers) } : a,
        ),
      })),

    markRead: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) })),
    markAllRead: () => set((s) => ({ alerts: s.alerts.map((a) => (a.read ? a : { ...a, read: true })) })),

    updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
    updateDemo: (p) => set((s) => ({ settings: { ...s.settings, demo: { ...s.settings.demo, ...p } } })),

    tick: (nowMs) => {
      const s = get();
      const dueTopups = s.wallet.pending.filter((p) => p.dueAt <= nowMs);
      const dueLeaves = s.leaves.filter((l) => l.nextAt !== null && l.nextAt <= nowMs);
      if (dueTopups.length === 0 && dueLeaves.length === 0) return;

      let draft: Pick<AppState, 'wallet' | 'alerts' | 'settings' | 'leaves' | 'attendance'> = {
        wallet: { ...s.wallet, pending: s.wallet.pending.filter((p) => p.dueAt > nowMs) },
        alerts: s.alerts,
        settings: s.settings,
        leaves: s.leaves,
        attendance: s.attendance,
      };
      for (const p of dueTopups) draft = { ...draft, ...credit(draft, p.amount, nowMs) };

      for (const due of dueLeaves) {
        const next = nextLeaveStatus(due.status);
        const updated: LeaveRequest = next
          ? {
              ...due,
              status: next,
              history: [...due.history, { status: next, at: iso(nowMs) }],
              nextAt: leaveDelayMs(next, s.settings.demo.fastLeave) > 0 ? nowMs + leaveDelayMs(next, s.settings.demo.fastLeave) : null,
            }
          : { ...due, nextAt: null };
        draft.leaves = draft.leaves.map((l) => (l.id === due.id ? updated : l));
        if (next === 'approved' || next === 'recorded') {
          const body = `${LEAVE_TYPE_LABEL[due.type]} · ${thaiDate(parseISODate(due.start), 'short')}`;
          draft.alerts = [makeAlert(s.settings, 'leave', LEAVE_ALERT_TITLE[next], body, `/leave/${due.id}`, nowMs), ...draft.alerts];
        }
        if (next === 'approved') draft.attendance = markLeaveDays(draft.attendance, updated);
      }
      set({ wallet: draft.wallet, alerts: draft.alerts, leaves: draft.leaves, attendance: draft.attendance });
    },

    resetDemo: (nowMs) => {
      const s = get();
      set({
        ...buildSeed(new Date(nowMs)),
        processed: [],
        pinGate: INITIAL_GATE,
        settings: {
          ...DEFAULT_SETTINGS,
          theme: s.settings.theme,
          demo: { ...DEFAULT_SETTINGS.demo, visible: s.settings.demo.visible },
        },
      });
    },
  });

  if (!usePersist) return createStore<AppState>()(creator);

  const store = createStore<AppState>()(
    persist(creator, {
      name: 'dschool-app-v1',
      version: 2,
      migrate: migratePersisted,
      storage: createJSONStorage(() => opts.storage ?? AsyncStorage),
      partialize: (s) => {
        const { unlocked: _u, hydrated: _h, ...rest } = s;
        return rest;
      },
    }),
  );
  const markHydrated = () => store.setState({ hydrated: true });
  if (store.persist.hasHydrated()) markHydrated();
  else store.persist.onFinishHydration(markHydrated);
  return store;
}

/** The app-wide persisted store. */
export const appStore = createAppStore(buildSeed(now()));

if (__DEV__) {
  (globalThis as { __app?: StoreApi<AppState> }).__app = appStore;
}

/** Subscribe to a slice of the app store (shallow-compared). */
export function useApp<T>(selector: (s: AppState) => T): T {
  return useStore(appStore, useShallow(selector));
}
