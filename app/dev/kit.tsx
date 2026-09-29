import { Bell, CalendarCheck, FileText, ShieldCheck, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BorderTrace, NumberTicker, PrismShimmer, StaggerIn } from '@/components/motion';
import {
  Button,
  Card,
  Chip,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  ProgressSteps,
  Screen,
  ScreenHeader,
  Segmented,
  Skeleton,
  Text,
  Tile,
  toast,
} from '@/components/ui';
import { formatBaht } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** Component gallery for visual QA (reachable from Settings → demo mode). */
export default function KitScreen() {
  const { c, radius } = useTheme();
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [chip, setChip] = useState(50);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState(1245);
  const [traceKey, setTraceKey] = useState(0);

  return (
    <Screen title="ชุดคอมโพเนนต์" back header={<ScreenHeader back eyebrow="Design system" title="ชุดคอมโพเนนต์" italicWord="Dschool" />}>
      <View style={styles.stack}>
        <Text variant="display">สวัสดีตอนเช้า</Text>
        <Text variant="heading">หัวข้อ · Heading</Text>
        <Text variant="body">ข้อความเนื้อหาภาษาไทย ที่มีสระบนล่าง เช่น ปู่ ฟ้า ญี่ปุ่น ฎีกา ฐิติ</Text>
        <Text variant="caption" tone="secondary">คำอธิบายรอง · caption</Text>
        <Text variant="eyebrow" tone="secondary">EYEBROW 2569</Text>

        <View style={styles.row}>
          <Button title="เติมเงิน" variant="primary" onPress={() => toast('เติมเงิน ฿50 สำเร็จ', { kind: 'success' })} style={styles.flex} />
          <Button title="จ่าย QR" onPress={() => toast('ข้อความทดสอบ')} style={styles.flex} />
        </View>
        <Button title="ลบข้อมูล" variant="primary" destructive onPress={() => setSheet(true)} />
        <Button title="ปุ่มแบบโปร่ง" variant="ghost" onPress={() => undefined} />
        <Button title="กำลังส่ง" variant="primary" loading onPress={() => undefined} />

        <View style={styles.row}>
          <Tile feature="attendance" icon={CalendarCheck} value="12 วัน" label="มาตรงเวลาติดต่อกัน 12 วัน" onPress={() => undefined} />
          <Tile feature="wallet" icon={Wallet} value="฿1,245" label="กระเป๋าเงิน" onPress={() => undefined} />
        </View>
        <View style={styles.row}>
          <Tile feature="behavior" icon={ShieldCheck} value="100" label="คะแนนพฤติกรรม" onPress={() => undefined} />
          <Tile feature="leave" icon={FileText} label="ยื่นใบลา" caption="ยังไม่มีใบลาในภาคเรียนนี้" onPress={() => undefined} />
        </View>

        <Segmented
          options={[
            { value: 'a', label: 'ทั้งหมด' },
            { value: 'b', label: 'เติมเงิน' },
            { value: 'c', label: 'ใช้จ่าย' },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <View style={styles.wrap}>
          {[20, 50, 100, 200].map((n) => (
            <Chip key={n} label={formatBaht(n)} selected={chip === n} onPress={() => setChip(n)} />
          ))}
        </View>
        <Chip size="lg" label="จริงบางครั้ง" selected onPress={() => undefined} />
        <ProgressSteps steps={['จำนวนเงิน', 'โอนเงิน', 'ส่งสลิป']} current={1} />

        <Card padded={false}>
          <ListRow icon={ShieldCheck} title="พฤติกรรม" value="100 คะแนน" onPress={() => undefined} />
          <ListRow icon={Bell} title="การแจ้งเตือน" subtitle="เติมเงิน ใบลา ประกาศ" onPress={() => undefined} />
        </Card>

        <View style={[styles.balance, { backgroundColor: c.idCardBg, borderRadius: radius.tile }]}>
          <PrismShimmer radius={radius.tile} />
          <Text variant="eyebrow" color={c.idCardText}>
            BALANCE
          </Text>
          <NumberTicker value={amount} from={0} format={formatBaht} size={40} color={c.idCardText} />
          <Button title="+ ฿50" onPress={() => setAmount((a) => a + 50)} size="sm" style={styles.self} />
        </View>

        <View style={styles.row}>
          <View style={styles.trace}>
            <BorderTrace key={traceKey} width={120} height={72} radius={20} color={c.primary} mode="once" />
            <Text variant="caption">once</Text>
          </View>
          <View style={styles.trace}>
            <BorderTrace width={120} height={72} radius={20} color={c.primary} mode="countdown" durationMs={10_000} cycleKey={traceKey} />
            <Text variant="caption">countdown</Text>
          </View>
          <IconButton icon={Bell} label="แจ้งเตือน" badge={2} onPress={() => setTraceKey((k) => k + 1)} />
        </View>

        <StaggerIn index={2}>
          <Skeleton height={20} />
        </StaggerIn>
        <Skeleton height={88} />
        <EmptyState feature="leave" icon={FileText} title="ยังไม่มีใบลาในภาคเรียนนี้" body="ถ้าป่วยหรือมีธุระ ยื่นใบลาได้จากที่นี่" actionLabel="ยื่นใบลา" onAction={() => undefined} />
        <ErrorState onRetry={() => undefined} />
      </View>

      <ConfirmSheet
        visible={sheet}
        title="อายัดบัตร?"
        body="ระหว่างอายัด จะจ่ายเงินด้วย QR หรือบัตรไม่ได้ ยอดเงินยังอยู่ครบ ยกเลิกอายัดได้ทุกเมื่อ"
        confirmLabel="อายัดบัตร"
        destructive
        onConfirm={() => setSheet(false)}
        onCancel={() => setSheet(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  self: { alignSelf: 'flex-start' },
  balance: { padding: 20, gap: 6, overflow: 'hidden' },
  trace: { width: 120, height: 72, alignItems: 'center', justifyContent: 'center' },
});
