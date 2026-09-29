import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { startSimulations } from '@/data/simulations';
import { appStore, useApp } from '@/data/store';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { FONT_ASSETS } from '@/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const { c, scheme } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.canvas).catch(() => undefined);
  }, [c.canvas]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas } }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const hydrated = useApp((s) => s.hydrated);
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => startSimulations(appStore), []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
