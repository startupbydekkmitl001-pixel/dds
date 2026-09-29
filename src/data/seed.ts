/**
 * Deterministic sample data for the pitch prototype. Everything is generated
 * relative to "now" so the demo always looks current. No real student data.
 */
import { isSchoolDay } from '@/lib/attendance';
import { toISODate } from '@/lib/clock';
import { parseISODate } from '@/lib/format';
import { SEMESTERS } from './calendar';
import type {
  Announcement,
  AppAlert,
  Assessment,
  AttendanceDay,
  AttendanceStatus,
  BankTransfer,
  BehaviorEvent,
  LeaveRequest,
  SemesterId,
  Settings,
  Student,
  Transaction,
  Wallet,
} from './types';

export const DEMO_PIN = '123456';

export const SCHOOL_ACCOUNT = {
  bank: 'ธนาคารตัวอย่าง',
  number: '123-4-56789-0',
  name: 'โรงเรียนตัวอย่างวิทยา',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  faceId: true,
  notify: { topup: true, leave: true, announcement: true, attendance: true, behavior: true },
  demo: { visible: false, networkErrors: false, slipMode: 'auto', fastLeave: false, arrival: 'arrived' },
};

export interface AppData {
  student: Student;
  wallet: Wallet;
  attendance: Record<SemesterId, AttendanceDay[]>;
  leaves: LeaveRequest[];
  behavior: BehaviorEvent[];
  assessments: Assessment[];
  alerts: AppAlert[];
  announcements: Announcement[];
}

const STUDENT: Student = {
  id: '24815',
  firstName: 'ภูมิภัทร',
  lastName: 'ศรีสุข',
  nickname: 'ภูมิ',
  classroom: 'ม.5/3',
  school: 'โรงเรียนตัวอย่างวิทยา',
  phone: null,
  guardianName: 'นางสมศรี ศรีสุข',
  guardianPhone: '081-234-5678',
  advisor: { name: 'ครูวรรณา ใจดี', phone: '089-765-4321' },
  deviceId: 'DS-7F3A-24815',
  academicYear: 2569,
};

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const at = (date: string, h: number, m: number) => {
  const d = parseISODate(date);
  d.setHours(h, m, 0, 0);
  return d;
};

function weightedStatus(r: number): AttendanceStatus {
  if (r < 0.88) return 'present';
  if (r < 0.93) return 'late';
  if (r < 0.95) return 'noScan';
  if (r < 0.98) return 'sick';
  if (r < 0.99) return 'personal';
  return 'absent';
}

function buildAttendance(now: Date, rand: () => number): Record<SemesterId, AttendanceDay[]> {
  const yesterday = toISODate(addDays(now, -1));
  const out = {} as Record<SemesterId, AttendanceDay[]>;
  for (const sem of Object.values(SEMESTERS)) {
    const last = sem.end < yesterday ? sem.end : yesterday;
    const days: AttendanceDay[] = [];
    for (let d = parseISODate(sem.start); toISODate(d) <= last; d = addDays(d, 1)) {
      const date = toISODate(d);
      if (!isSchoolDay(date)) continue;
      const status = weightedStatus(rand());
      const minute = Math.floor(rand() * 46);
      days.push(dayRecord(date, status, minute));
    }
    // A clean recent run so the on-time streak is something to celebrate.
    for (let i = Math.max(0, days.length - 12); i < days.length; i++) {
      days[i] = dayRecord(days[i].date, 'present', 10 + (i % 40));
    }
    out[sem.id] = days;
  }
  return out;
}

function dayRecord(date: string, status: AttendanceStatus, minute: number): AttendanceDay {
  if (status === 'present') {
    const total = 7 * 60 + 10 + (minute % 46);
    return { date, status, checkIn: `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`, gate: 'ประตู 1' };
  }
  if (status === 'late') return { date, status, checkIn: `08:${pad2(5 + (minute % 36))}`, gate: 'ประตู 1' };
  if (status === 'sick') return { date, status, checkIn: null, gate: null, note: 'มีไข้ ไปพบแพทย์' };
  if (status === 'personal') return { date, status, checkIn: null, gate: null, note: 'ธุระครอบครัว' };
  return { date, status, checkIn: null, gate: null };
}

const LUNCH_SHOPS = ['ร้านข้าวมันไก่ป้าน้อย', 'ร้านก๋วยเตี๋ยวเรือลุงแดง', 'ร้านข้าวแกงแม่มาลี'];

function buildWallet(now: Date, rand: () => number): Wallet {
  const tx: Transaction[] = [];
  let n = 0;
  const push = (t: Omit<Transaction, 'id'>) => {
    if (new Date(t.at).getTime() <= now.getTime()) tx.push({ id: `tx_${++n}`, ...t });
  };
  const start = addDays(now, -30);
  push({ kind: 'topup', amount: 1000, at: at(toISODate(start), 8, 0).toISOString(), title: 'เติมเงินผ่านสลิป', source: 'slip' });
  for (let d = addDays(start, 1); toISODate(d) <= toISODate(now); d = addDays(d, 1)) {
    const date = toISODate(d);
    if (!isSchoolDay(date)) continue;
    if (rand() < 0.7) {
      push({ kind: 'topup', amount: rand() < 0.5 ? 40 : 50, at: at(date, 11, 25 + Math.floor(rand() * 10)).toISOString(), title: 'เติมเงินผ่านสลิป', source: 'slip' });
    }
    const shop = LUNCH_SHOPS[Math.floor(rand() * LUNCH_SHOPS.length)];
    push({ kind: 'purchase', amount: 35 + 5 * Math.floor(rand() * 3), at: at(date, 12, Math.floor(rand() * 20)).toISOString(), title: shop, source: 'qr' });
    if (rand() < 0.6) {
      push({ kind: 'purchase', amount: 10 + 5 * Math.floor(rand() * 3), at: at(date, 14, 25 + Math.floor(rand() * 10)).toISOString(), title: 'ร้านน้ำหวานลุงชัย', source: 'qr' });
    }
  }
  tx.sort((a, b) => (a.at < b.at ? 1 : -1));
  const balance = tx.reduce((sum, t) => sum + (t.kind === 'topup' ? t.amount : -t.amount), 0);

  const transfers: BankTransfer[] = [];
  for (let i = 0; i < 5; i++) {
    const hoursAgo = 2 + Math.floor(rand() * 66);
    const when = new Date(now.getTime() - hoursAgo * 3_600_000);
    transfers.push({ id: `tr_${i + 1}`, at: when.toISOString(), amount: 10 * (1 + Math.floor(rand() * 8)), claimed: false });
  }
  transfers.sort((a, b) => (a.at < b.at ? 1 : -1));

  return { balance, frozen: false, transactions: tx, transfers, pending: [] };
}

const EQ_OPTIONS = [
  { label: 'ไม่จริง', value: 1 },
  { label: 'จริงบางครั้ง', value: 2 },
  { label: 'ค่อนข้างจริง', value: 3 },
  { label: 'จริงมาก', value: 4 },
];

const SDQ_OPTIONS = [
  { label: 'ไม่จริง', value: 0 },
  { label: 'จริงบางครั้ง', value: 1 },
  { label: 'จริงแน่นอน', value: 2 },
];

/** Original, generic sample items — not taken from any licensed instrument. */
function buildAssessments(): Assessment[] {
  const eq: [string, string][] = [
    ['ดี', 'ฉันรู้ตัวเมื่อเริ่มรู้สึกหงุดหงิด'],
    ['ดี', 'ฉันรับฟังความคิดเห็นของเพื่อนแม้จะไม่ตรงกับของฉัน'],
    ['ดี', 'เมื่อทำผิด ฉันยอมรับและขอโทษได้'],
    ['เก่ง', 'ฉันตั้งเป้าหมายเล็ก ๆ และทำให้สำเร็จได้'],
    ['เก่ง', 'เมื่อเจอปัญหา ฉันลองหาทางแก้หลายวิธี'],
    ['เก่ง', 'ฉันกล้าบอกความคิดของตัวเองในกลุ่ม'],
    ['เก่ง', 'ฉันทำงานร่วมกับคนอื่นได้ดีแม้ไม่ใช่เพื่อนสนิท'],
    ['สุข', 'ฉันหาเรื่องเล็ก ๆ ที่ทำให้ยิ้มได้ในแต่ละวัน'],
    ['สุข', 'เมื่อเครียด ฉันมีวิธีผ่อนคลายที่ได้ผล'],
    ['สุข', 'ฉันรู้สึกพอใจในตัวเองเป็นส่วนใหญ่'],
  ];
  const sdq: [string, string][] = [
    ['อารมณ์', 'ฉันจัดการความกังวลก่อนสอบได้'],
    ['อารมณ์', 'ฉันนอนหลับพักผ่อนได้เพียงพอเกือบทุกคืน'],
    ['อารมณ์', 'ช่วงนี้ฉันรู้สึกมีพลังในการมาโรงเรียน'],
    ['เพื่อน', 'ฉันมีเพื่อนที่คุยเรื่องสำคัญด้วยได้'],
    ['เพื่อน', 'ฉันรู้สึกเป็นส่วนหนึ่งของห้องเรียน'],
    ['สมาธิ', 'ฉันจดจ่อกับงานได้นานพอจะทำเสร็จ'],
    ['สมาธิ', 'ฉันวางแผนทำการบ้านล่วงหน้าได้'],
    ['สมาธิ', 'ฉันเก็บโทรศัพท์ได้เมื่อต้องตั้งใจเรียน'],
    ['น้ำใจ', 'ฉันชอบช่วยเหลือเพื่อนที่มีปัญหา'],
    ['น้ำใจ', 'ฉันแบ่งปันสิ่งของหรือความรู้ให้คนอื่น'],
  ];
  return [
    {
      id: 'eq',
      title: 'แบบประเมินความฉลาดทางอารมณ์ (EQ)',
      description: 'สำรวจด้านดี เก่ง สุข ของตัวเอง ใช้เวลาประมาณ 3 นาที',
      questions: eq.map(([dimension, text], i) => ({ id: `eq${i + 1}`, text, dimension, options: EQ_OPTIONS })),
      completedAt: null,
      result: null,
    },
    {
      id: 'sdq',
      title: 'แบบสำรวจจุดแข็งและความยากลำบาก (ตัวอย่าง)',
      description: 'ช่วยให้ครูแนะแนวดูแลเราได้ตรงจุด ใช้เวลาประมาณ 3 นาที',
      questions: sdq.map(([dimension, text], i) => ({ id: `sdq${i + 1}`, text, dimension, options: SDQ_OPTIONS })),
      completedAt: null,
      result: null,
    },
  ];
}

function buildAnnouncements(now: Date): Announcement[] {
  const ago = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  return [
    { id: 'an_1', category: 'วิชาการ', title: 'สอบปลายภาค 5–9 ต.ค.', body: 'ตารางสอบปลายภาคเรียนที่ 1 ติดที่บอร์ดหน้าห้องวิชาการ นักเรียนต้องแต่งกายชุดนักเรียนและนำบัตรนักเรียนมาทุกวันสอบ', at: ago(5) },
    { id: 'an_2', category: 'กิจกรรม', title: 'ประชุมผู้ปกครอง', body: 'ขอเชิญผู้ปกครองร่วมประชุมพบครูที่ปรึกษาในวันเสาร์ที่ 3 ต.ค. เวลา 09:00 น. ณ หอประชุมใหญ่', at: ago(72) },
    { id: 'an_3', category: 'ประกาศ', title: 'ปิดภาคเรียน 11–31 ต.ค.', body: 'โรงเรียนปิดภาคเรียนที่ 1 ตั้งแต่วันที่ 11 ถึง 31 ตุลาคม และเปิดภาคเรียนที่ 2 วันที่ 1 พฤศจิกายน', at: ago(120) },
    { id: 'an_4', category: 'กิจกรรม', title: 'กีฬาสีภายใน', body: 'การแข่งขันกีฬาสีภายในจัดขึ้นสัปดาห์หน้า นักเรียนตรวจสอบรายชื่อนักกีฬาได้ที่หัวหน้าสี', at: ago(200) },
    { id: 'an_5', category: 'ศูนย์อาหาร', title: 'เปิดใช้ระบบเติมเงินผ่านสลิป', body: 'เติมเงินเข้าบัตรได้เองผ่านแอป โอนเงินแล้วอัปโหลดสลิป ระบบจะตรวจสอบและเติมเงินให้อัตโนมัติ', at: ago(400) },
  ];
}

function buildAlerts(now: Date, wallet: Wallet): AppAlert[] {
  const ago = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  const lastTopup = wallet.transactions.find((t) => t.kind === 'topup');
  const alerts: AppAlert[] = [
    {
      id: 'al_1',
      kind: 'topup',
      title: `เติมเงิน ฿${lastTopup?.amount ?? 50} สำเร็จ`,
      body: 'ตรวจสอบสลิปเรียบร้อย ยอดเงินเข้ากระเป๋าแล้ว',
      at: lastTopup?.at ?? ago(20),
      read: false,
      link: '/wallet',
    },
    { id: 'al_2', kind: 'announcement', title: 'สอบปลายภาค 5–9 ต.ค.', body: 'ดูตารางสอบและข้อปฏิบัติในวันสอบ', at: ago(5), read: false, link: '/announcement/an_1' },
    { id: 'al_3', kind: 'attendance', title: 'ลงเวลาเข้าเรียนแล้ว', body: 'สแกนเข้าโรงเรียนที่ประตู 1', at: ago(26), read: true, link: '/attendance' },
    { id: 'al_4', kind: 'announcement', title: 'ประชุมผู้ปกครอง', body: 'วันเสาร์ที่ 3 ต.ค. เวลา 09:00 น.', at: ago(72), read: true, link: '/announcement/an_2' },
  ];
  return alerts.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function buildSeed(now: Date): AppData {
  const rand = mulberry32(2569);
  const attendance = buildAttendance(now, rand);
  const wallet = buildWallet(now, rand);
  const behavior: BehaviorEvent[] = [
    { id: 'bh_2', delta: 5, title: 'จิตอาสาทำความสะอาด', date: '2026-08-20' },
    { id: 'bh_1', delta: -5, title: 'แต่งกายผิดระเบียบ', date: '2026-06-18' },
  ];
  return {
    student: STUDENT,
    wallet,
    attendance,
    leaves: [],
    behavior,
    assessments: buildAssessments(),
    alerts: buildAlerts(now, wallet),
    announcements: buildAnnouncements(now),
  };
}
