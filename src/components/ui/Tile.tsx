import { View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import type { FeatureKey } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** Origin's colour-coded feature tile: the colour *is* the feature. */
export function Tile({
  feature: key,
  icon,
  label,
  value,
  caption,
  onPress,
}: {
  feature: FeatureKey;
  icon: LucideIcon;
  label: string;
  value?: string;
  caption?: string;
  onPress: () => void;
}) {
  const { feature, radius } = useTheme();
  const f = feature[key];
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      accessibilityLabel={[value, label, caption].filter(Boolean).join(' ')}
      style={{ flex: 1, backgroundColor: f.fill, borderRadius: radius.tile, padding: 16, minHeight: 132, justifyContent: 'space-between', gap: 12 }}
    >
      <Icon icon={icon} color={f.ink} size={22} />
      <View>
        {value !== undefined ? (
          <Text variant="data" size={28} color={f.ink}>
            {value}
          </Text>
        ) : null}
        <Text variant="label" color={f.ink}>
          {label}
        </Text>
        {caption ? (
          <Text variant="caption" color={f.ink}>
            {caption}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
