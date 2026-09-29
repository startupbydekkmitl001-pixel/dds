import { StyleSheet, View } from 'react-native';
import { Aurora } from '@/components/motion/Aurora';
import { GlossOrb } from '@/components/motion/GlossOrb';
import { PressableScale } from '@/components/motion/PressableScale';
import type { FeatureKey } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** Where the sphere floats in each feature's little scene, so the bento doesn't feel stamped out. */
const SCENE: Record<FeatureKey, { orb: { x: number; y: number }; size: number; lights: [number, number][] }> = {
  attendance: { orb: { x: 0.62, y: 0.12 }, size: 40, lights: [[0.85, 0.1], [0.2, 0.9]] },
  behavior: { orb: { x: 0.5, y: 0.16 }, size: 34, lights: [[0.1, 0.2], [0.9, 0.8]] },
  leave: { orb: { x: 0.66, y: 0.2 }, size: 30, lights: [[0.9, 0.2], [0.3, 0.7]] },
  assessments: { orb: { x: 0.56, y: 0.1 }, size: 38, lights: [[0.2, 0.2], [0.85, 0.9]] },
  wallet: { orb: { x: 0.6, y: 0.14 }, size: 36, lights: [[0.8, 0.2], [0.2, 0.8]] },
  announcements: { orb: { x: 0.6, y: 0.14 }, size: 36, lights: [[0.8, 0.2], [0.2, 0.8]] },
};

/**
 * Bento tile: a small pastel scene (soft light + a floating glossy sphere) on
 * top, the live number and label below on frosted glass. The colour is the feature.
 */
export function Tile({
  feature: key,
  icon,
  label,
  value,
  caption,
  onPress,
  index = 0,
}: {
  feature: FeatureKey;
  icon: LucideIcon;
  label: string;
  value?: string;
  caption?: string;
  onPress: () => void;
  index?: number;
}) {
  const { feature, radius, elevation } = useTheme();
  const f = feature[key];
  const scene = SCENE[key];
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      accessibilityLabel={[value, label, caption].filter(Boolean).join(' ')}
      style={[styles.tile, { borderRadius: radius.tile, boxShadow: elevation.low }]}
    >
      <GlassLayers radius={radius.tile} />
      <View style={[styles.scene, { backgroundColor: f.fill }]}>
        <Aurora
          drift={false}
          orbs={scene.lights.map(([x, y], i) => ({ color: f.glow, x, y, r: i === 0 ? 0.6 : 0.45, opacity: i === 0 ? 0.75 : 0.5 }))}
        />
        <View style={[styles.orb, { left: `${scene.orb.x * 100}%`, top: `${scene.orb.y * 100}%` }]}>
          <GlossOrb size={scene.size} color={f.fill} deep={f.glow} delay={index * 450} />
        </View>
        <Icon icon={icon} color={f.ink} size={20} />
      </View>
      <View style={styles.body}>
        {value !== undefined ? (
          <Text variant="title" size={30} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        <Text variant="label">{label}</Text>
        {caption ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, padding: 6, minHeight: 176 },
  scene: { height: 78, borderRadius: 22, overflow: 'hidden', padding: 12 },
  orb: { position: 'absolute' },
  body: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8, gap: 0, flex: 1, justifyContent: 'flex-end' },
});
