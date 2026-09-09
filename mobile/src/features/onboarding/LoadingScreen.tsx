import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { cancelAnimation, Easing, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Brand } from '@/components/brand/Brand';
import { colors, handwritten } from '@/constants/theme';
import { Globe } from './artwork';

export default function LoadingScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const float = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: reduced ? 0 : 2600, easing: Easing.inOut(Easing.quad) });
    if (!reduced) float.value = withRepeat(withTiming(-9, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, true);
    const timer = setTimeout(() => router.replace('/home'), reduced ? 500 : 2900);
    return () => { clearTimeout(timer); cancelAnimation(progress); cancelAnimation(float); };
  }, [router, reduced, progress, float]);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const floating = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  return <SafeAreaView style={styles.page}>
    <Brand small />
    <Animated.View style={[styles.globe, floating]}><Globe /></Animated.View>
    <Animated.View entering={FadeInDown.duration(600)} style={styles.message}>
      <Text style={styles.title}>Getting things ready</Text>
      <Text style={styles.subtitle}>Good places take time…{ '\n' }just a moment.</Text>
    </Animated.View>
    <View accessibilityRole="progressbar" accessibilityLabel="Opening your WeOut preview" style={styles.track}><Animated.View style={[styles.fill, bar]} /></View>
    <View style={styles.values}>{(['compass', 'users', 'zap', 'map'] as const).map((icon, i) => <View key={icon} style={{ alignItems: 'center', gap: 9 }}>
      <Feather name={icon} size={22} color={colors.muted} /><Text style={styles.value}>{['Explore', 'Connect', 'Do', 'Repeat'][i]}</Text>
    </View>)}</View>
    <Text style={styles.note}>See you out there</Text><View style={styles.underline} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 30 },
  globe: { width: 300, maxWidth: '100%', height: 270, marginTop: 28 },
  message: { alignItems: 'center', gap: 8 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { textAlign: 'center', color: colors.muted, fontSize: 14, lineHeight: 21 },
  track: { width: '100%', maxWidth: 310, height: 6, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.line, marginTop: 36 },
  fill: { height: 6, borderRadius: 8, backgroundColor: '#329E72' },
  values: { width: '100%', maxWidth: 310, flexDirection: 'row', justifyContent: 'space-between', marginTop: 42 },
  value: { fontSize: 10, color: colors.muted },
  note: { fontFamily: handwritten, fontSize: 27, color: colors.ink, marginTop: 44, transform: [{ rotate: '-5deg' }] },
  underline: { width: 40, height: 1, backgroundColor: colors.green, transform: [{ rotate: '-8deg' }], marginTop: 6 },
});
