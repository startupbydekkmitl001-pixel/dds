import {
  CalendarCheck,
  ClipboardList,
  FileText,
  Megaphone,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import type { FeatureKey } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';

export type { LucideIcon };

/** Monoline icon at the system's 1.75 stroke. */
export function Icon({ icon: Glyph, size = 22, color, strokeWidth = 1.75 }: { icon: LucideIcon; size?: number; color?: string; strokeWidth?: number }) {
  const { c } = useTheme();
  return <Glyph size={size} color={color ?? c.text} strokeWidth={strokeWidth} />;
}

export const FEATURE_ICON: Record<FeatureKey, LucideIcon> = {
  attendance: CalendarCheck,
  wallet: Wallet,
  behavior: ShieldCheck,
  leave: FileText,
  assessments: ClipboardList,
  announcements: Megaphone,
};
