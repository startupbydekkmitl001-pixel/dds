/** Domain model for the Dschool student app (sample-data prototype). */

export type AttendanceStatus = 'present' | 'late' | 'noScan' | 'sick' | 'personal' | 'absent';
export type SemesterId = '2569-1' | '2569-2';

export interface Semester {
  id: SemesterId;
  label: string;
  /** Inclusive `YYYY-MM-DD` bounds. */
  start: string;
  end: string;
}

export interface AttendanceDay {
  date: string;
  status: AttendanceStatus;
  /** `HH:mm`, or null when there was no scan. */
  checkIn: string | null;
  gate: string | null;
  note?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  classroom: string;
  school: string;
  phone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  advisor: { name: string; phone: string | null };
  deviceId: string;
  academicYear: number;
}

export type TxKind = 'topup' | 'purchase';

export interface Transaction {
  id: string;
  kind: TxKind;
  /** Integer baht, always positive; `kind` gives the direction. */
  amount: number;
  /** ISO datetime. */
  at: string;
  title: string;
  source?: 'slip' | 'qr' | 'card';
}

/** A bank-side transfer the student can claim on the slip-check screen. */
export interface BankTransfer {
  id: string;
  at: string;
  amount: number;
  claimed: boolean;
}

export interface PendingTopup {
  id: string;
  clientId: string;
  amount: number;
  dueAt: number;
}

export interface Wallet {
  balance: number;
  frozen: boolean;
  transactions: Transaction[];
  transfers: BankTransfer[];
  pending: PendingTopup[];
}

export type LeaveType = 'sick' | 'personal';
export type LeaveStatus = 'submitted' | 'approved' | 'recorded' | 'rejected';

export interface LeaveRequest {
  id: string;
  clientId: string;
  type: LeaveType;
  start: string;
  end: string;
  reason: string;
  photoUri: string | null;
  status: LeaveStatus;
  history: { status: LeaveStatus; at: string }[];
  createdAt: string;
  /** Epoch ms when the simulated backend advances this request, or null when final. */
  nextAt: number | null;
}

export interface BehaviorEvent {
  id: string;
  delta: number;
  title: string;
  date: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  dimension: string;
  options: { label: string; value: number }[];
}

export interface Assessment {
  id: 'eq' | 'sdq';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  completedAt: string | null;
  result: Record<string, { score: number; max: number }> | null;
}

export type AlertKind = 'topup' | 'leave' | 'announcement' | 'attendance' | 'behavior';

export interface AppAlert {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  /** Expo Router href opened when the alert is tapped. */
  link: string;
}

export interface Announcement {
  id: string;
  category: string;
  title: string;
  body: string;
  at: string;
}

export type ThemePref = 'system' | 'light' | 'dark';

export interface DemoSettings {
  visible: boolean;
  networkErrors: boolean;
  slipMode: 'auto' | 'pending' | 'reject';
  fastLeave: boolean;
  arrival: 'arrived' | 'notYet' | 'onLeave';
}

export interface Settings {
  theme: ThemePref;
  faceId: boolean;
  notify: Record<AlertKind, boolean>;
  demo: DemoSettings;
}

export type FeatureKey = 'attendance' | 'wallet' | 'behavior' | 'leave' | 'assessments' | 'announcements';
