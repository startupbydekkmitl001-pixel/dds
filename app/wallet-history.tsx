import { Receipt } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState, Screen, ScreenHeader, Segmented } from '@/components/ui';
import { useApp } from '@/data/store';
import { TxList } from '@/features/wallet/TxList';

type Filter = 'all' | 'topup' | 'purchase';

export default function WalletHistory() {
  const transactions = useApp((s) => s.wallet.transactions);
  const [filter, setFilter] = useState<Filter>('all');
  const shown = useMemo(() => (filter === 'all' ? transactions : transactions.filter((t) => t.kind === filter)), [transactions, filter]);

  return (
    <Screen title="ประวัติการใช้เงิน" back header={<ScreenHeader back title="ประวัติการใช้เงิน" />}>
      <View style={styles.stack}>
        <Segmented
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'topup', label: 'เติมเงิน' },
            { value: 'purchase', label: 'ใช้จ่าย' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {shown.length === 0 ? (
          <EmptyState feature="wallet" icon={Receipt} title="ยังไม่มีรายการ" body="รายการจะแสดงที่นี่เมื่อมีการเติมเงินหรือใช้จ่าย" />
        ) : (
          <TxList transactions={shown} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
});
