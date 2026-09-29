import { router } from 'expo-router';
import { useEffect } from 'react';
import { appStore } from '@/data/store';

/** Opens the welcome intro once, the first time the signed-in app appears. */
export function useWelcomeIntro() {
  useEffect(() => {
    if (!appStore.getState().settings.introSeen) router.push('/intro');
  }, []);
}
