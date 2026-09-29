import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const THAI_CONSONANT = /[ก-ฮ]/;

/** Initial-letter avatar (no real photo in the prototype). */
export function MonogramAvatar({ name, size }: { name: string; size: number }) {
  const { feature } = useTheme();
  const letter = name.match(THAI_CONSONANT)?.[0] ?? name.charAt(0);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: feature.leave.fill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="display" size={Math.round(size * 0.5)} color={feature.leave.ink}>
        {letter}
      </Text>
    </View>
  );
}
