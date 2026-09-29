import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { useWelcomeIntro } from '@/features/intro/useWelcomeIntro';

export default function TabsLayout() {
  useWelcomeIntro();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="attendance" />
      <Tabs.Screen name="pay" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
