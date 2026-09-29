import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Chip, Text } from '@/components/ui';
import { formatBaht } from '@/lib/format';
import { TOPUP_PRESETS, validateAmount } from '@/lib/topup';
import { useTheme } from '@/theme/ThemeProvider';
import { lineHeightFor, typeScale } from '@/theme/typography';

/** Step ① — quick preset chips or a custom amount, validated inline. */
export function AmountStep({ initial, onNext }: { initial: number | null; onNext: (amount: number) => void }) {
  const { c, radius } = useTheme();
  const isPreset = initial !== null && (TOPUP_PRESETS as readonly number[]).includes(initial);
  const [choice, setChoice] = useState<number | 'custom' | null>(initial === null ? 50 : isPreset ? initial : 'custom');
  const [custom, setCustom] = useState(initial !== null && !isPreset ? String(initial) : '');
  const [error, setError] = useState<string | null>(null);

  const parsed = choice === 'custom' ? validateAmount(custom) : null;
  const amount = choice === 'custom' ? (parsed?.ok ? parsed.amount : null) : choice;

  const next = () => {
    if (choice === 'custom') {
      const r = validateAmount(custom);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      onNext(r.amount);
      return;
    }
    if (choice === null) {
      setError('เลือกจำนวนเงิน');
      return;
    }
    onNext(choice);
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text variant="title">เติมเงินเท่าไหร่?</Text>
        <Text variant="body" tone="secondary">
          ขั้นต่ำ ฿10 · สูงสุด ฿2,000 ต่อครั้ง
        </Text>
      </View>

      <Text variant="data" size={52} accessibilityLiveRegion="polite">
        {amount !== null ? formatBaht(amount) : '฿—'}
      </Text>

      <View style={styles.chips}>
        {TOPUP_PRESETS.map((n) => (
          <Chip
            key={n}
            label={formatBaht(n)}
            selected={choice === n}
            onPress={() => {
              setChoice(n);
              setError(null);
            }}
          />
        ))}
        <Chip
          label="จำนวนอื่น"
          selected={choice === 'custom'}
          onPress={() => {
            setChoice('custom');
            setError(null);
          }}
        />
      </View>

      {choice === 'custom' ? (
        <View style={styles.field}>
          <Text variant="label">จำนวนเงิน (บาท)</Text>
          <TextInput
            value={custom}
            onChangeText={(v) => {
              setCustom(v);
              setError(null);
            }}
            keyboardType="number-pad"
            placeholder="150"
            placeholderTextColor={c.textSecondary}
            autoFocus
            accessibilityLabel="จำนวนเงินที่ต้องการเติม"
            style={[
              typeScale.data,
              styles.input,
              { fontSize: 24, lineHeight: lineHeightFor(24, typeScale.data.fontFamily), color: c.text, backgroundColor: c.card, borderColor: error ? c.dangerText : c.hairline, borderRadius: radius.input },
            ]}
          />
        </View>
      ) : null}

      <View style={styles.error}>
        {error ? (
          <Text variant="caption" color={c.dangerText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>

      <Button title={amount !== null ? `ถัดไป · ${formatBaht(amount)}` : 'ถัดไป'} variant="primary" onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { gap: 6 },
  input: { height: 56, borderWidth: 1, paddingHorizontal: 16 },
  error: { minHeight: 18 },
});
