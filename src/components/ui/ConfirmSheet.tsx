import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { GlassSheet } from './GlassSheet';
import { Text } from './Text';

/** Floating glass confirmation for consequential actions (freeze card, log out, reset). */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <GlassSheet visible={visible} onClose={onCancel}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" tone="secondary">
        {body}
      </Text>
      <View style={styles.actions}>
        <Button title={confirmLabel} variant="primary" destructive={destructive} onPress={onConfirm} />
        <Button title="ยกเลิก" variant="ghost" onPress={onCancel} />
      </View>
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 12, gap: 4 },
});
