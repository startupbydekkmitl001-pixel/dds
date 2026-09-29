import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from './IconButton';
import { Text } from './Text';

/** Editorial header: mono eyebrow, Trirong title, optional italic word on its own line. */
export function ScreenHeader({
  eyebrow,
  title,
  italicWord,
  back,
  right,
}: {
  eyebrow?: string;
  title: string;
  italicWord?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {back || right ? (
        <View style={styles.bar}>
          {back ? <IconButton icon={ChevronLeft} label="ย้อนกลับ" onPress={() => router.back()} /> : <View />}
          {right ?? <View />}
        </View>
      ) : null}
      {eyebrow ? (
        <Text variant="eyebrow" tone="secondary">
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {italicWord ? <Text variant="displayItalic">{italicWord}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 20, gap: 4 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, marginBottom: 8 },
});
