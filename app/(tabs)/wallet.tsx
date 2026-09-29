import { router } from 'expo-router';
import { Utensils } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { PressableScale, StaggerIn } from '@/components/motion';
import { Card, EmptyState, LoadGate, Screen, ScreenHeader, Skeleton, Text } from '@/components/ui';
import { spendByDay } from '@/data/selectors';
import { useApp } from '@/data/store';
import { useResource } from '@/data/useResource';
import { formatBaht } from '@/lib/format';
import { springSoft } from '@/theme/motion';
import { useNow } from '@/lib/useNow';
import { BalanceCard } from '@/features/home/BalanceCard';
import { CardDetailsSheet } from '@/features/wallet/CardDetailsSheet';
import { SpendChart } from '@/features/wallet/SpendChart';
import { TxList } from '@/features/wallet/TxList';
import { WalletActions } from '@/features/wallet/WalletActions';

function WalletSkeleton() {
  return (
    <View style={styles.stack}>
      <Skeleton height={150} radius={28} />
      <Skeleton height={90} />
      <Skeleton height={170} />
    </View>
  );
}

/** Spec §5.3 — the digital food-court wallet. */
export default function WalletScreen() {
  const res = useResource('wallet');
  const t = useNow();
  const transactions = useApp((s) => s.wallet.transactions);
  const chart = useMemo(() => spendByDay(transactions, t), [transactions, t]);
  const weekTotal = chart.reduce((s, d) => s + d.total, 0);
  const [details, setDetails] = useState(false);
  const reduced = useReducedMotion();
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = reduced ? 0 : withSpring(details ? 1 : 0, springSoft);
  }, [details, reduced, lift]);
  // The card steps back and up as its details sheet rises in front of it.
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value * 10 }, { scale: 1 - lift.value * 0.05 }] }));

  return (
    <Screen
      title="กระเป๋าเงิน"
      header={<ScreenHeader eyebrow="ศูนย์อาหารดิจิทัล" title="กระเป๋าเงิน" />}
      onRefresh={res.refresh}
      refreshing={res.refreshing}
    >
      <LoadGate status={res.status} retry={res.retry} skeleton={<WalletSkeleton />}>
        <View style={styles.stack}>
          <StaggerIn index={0}>
            <Animated.View style={cardStyle}>
              <BalanceCard size="lg" showActions={false} onDetails={() => setDetails(true)} />
            </Animated.View>
          </StaggerIn>
          <StaggerIn index={1}>
            <WalletActions />
          </StaggerIn>
          <StaggerIn index={2}>
            <Card>
              <View style={styles.cardHead}>
                <Text variant="label">ใช้จ่าย 7 วันล่าสุด</Text>
                <Text variant="data" size={14} tone="secondary">
                  {formatBaht(weekTotal)}
                </Text>
              </View>
              <SpendChart data={chart} />
            </Card>
          </StaggerIn>
          <View style={styles.sectionHead}>
            <Text variant="heading">รายการล่าสุด</Text>
            <PressableScale accessibilityLabel="ดูประวัติทั้งหมด" onPress={() => router.push('/wallet-history')} hitSlop={8}>
              <Text variant="label" tone="link">
                ดูทั้งหมด
              </Text>
            </PressableScale>
          </View>
          {transactions.length === 0 ? (
            <EmptyState feature="wallet" icon={Utensils} title="ยังไม่มีรายการ" body="เติมเงินแล้วใช้จ่ายที่ศูนย์อาหารด้วย QR" />
          ) : (
            <TxList transactions={transactions} limit={10} />
          )}
        </View>
      </LoadGate>
      <CardDetailsSheet visible={details} onClose={() => setDetails(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
});
