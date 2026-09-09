import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useFonts, Caveat_500Medium } from '@expo-google-fonts/caveat';
import * as SplashScreen from 'expo-splash-screen';
import { useReducedMotion } from 'react-native-reanimated';
import { queryClient } from '@/lib/query-client';
import { manageAuthRefresh } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Caveat_500Medium });
  const reduced = useReducedMotion();
  useEffect(manageAuthRefresh, []);
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  return <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ animation: reduced ? 'none' : 'fade', headerTintColor: '#173F35', headerStyle: { backgroundColor: '#F8FAF7' } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  </SafeAreaProvider>;
}
