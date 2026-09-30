import { Tabs } from 'expo-router';
import { AppTabBar } from '@/components/travel/AppTabBar';
export default function TabLayout() {
  return <Tabs tabBar={() => <AppTabBar />} screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="home" />
    <Tabs.Screen name="explore" />
    <Tabs.Screen name="trips" />
    <Tabs.Screen name="profile" />
    <Tabs.Screen name="companions" options={{ href: null }} />
    <Tabs.Screen name="sidequests" options={{ href: null }} />
  </Tabs>;
}
