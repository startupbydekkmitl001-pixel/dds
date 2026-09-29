/** Haptic vocabulary (spec §4.4). No-ops on web. */
import * as Haptics from 'expo-haptics';
import { isNative } from './platform';

const run = (fn: () => Promise<void>) => {
  if (isNative) fn().catch(() => undefined);
};

export const haptic = {
  selection: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
