import { useEffect, type ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ResourceStatus } from '@/data/useResource';
import { dur, ease } from '@/theme/motion';
import { ErrorState } from './ErrorState';

function FadeIn({ children }: { children: ReactNode }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: dur.fast, easing: ease.standard });
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Skeleton while loading, ErrorState with retry on failure, content fades in when ready. */
export function LoadGate({
  status,
  retry,
  skeleton,
  children,
}: {
  status: ResourceStatus;
  retry: () => void;
  skeleton: ReactNode;
  children: ReactNode;
}) {
  if (status === 'loading') return <>{skeleton}</>;
  if (status === 'error') return <ErrorState onRetry={retry} />;
  return <FadeIn>{children}</FadeIn>;
}
