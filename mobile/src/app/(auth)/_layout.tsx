import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';
export default function AuthLayout() {
  const reduced = useReducedMotion();
  return <Stack screenOptions={{ headerShown: false, animation: reduced ? 'none' : 'fade_from_bottom', contentStyle: { backgroundColor: '#F8FAF7' } }} />;
}
