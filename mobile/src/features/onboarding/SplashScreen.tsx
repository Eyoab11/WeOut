import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Brand } from '@/components/brand/Brand';
import { ActionButton } from '@/components/ui/ActionButton';
import { handwritten } from '@/constants/theme';
import { photos } from './artwork';

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <View style={styles.screen}>
    <StatusBar style="dark" />
    <Image source={photos.mountains} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="A quiet mountain escape" />
    <LinearGradient colors={['#F0F6EFEF', '#F0F6EFAB', '#193D3920', '#092B26E8']} locations={[0, 0.28, 0.6, 1]} style={StyleSheet.absoluteFill} />
    <Animated.View entering={FadeIn.duration(1100)} style={[styles.brand, { paddingTop: insets.top + 36 }]}><Brand /></Animated.View>
    <Animated.Text entering={FadeInDown.delay(250).duration(900)} style={styles.handwriting}>Good people.{ '\n' }Brighter places.</Animated.Text>
    <Animated.View entering={FadeInDown.delay(500).duration(800)} style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 18) + 12 }]}>
      <Text style={styles.eyebrow}>A LITTLE CURIOSITY GOES A LONG WAY</Text>
      <Text style={styles.title}>The world is better{ '\n' }when we're out in it.</Text>
      <ActionButton label="Let the adventure begin" onPress={() => router.push('/onboarding')} />
      <Text style={styles.caption}>Find somewhere. Find someone. Go out.</Text>
    </Animated.View>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#DDE7DF' },
  brand: { alignItems: 'center' },
  handwriting: { fontFamily: handwritten, fontSize: 39, lineHeight: 44, color: '#213F34', textAlign: 'center', marginTop: 32, transform: [{ rotate: '-8deg' }] },
  bottom: { marginTop: 'auto', padding: 26, gap: 17, width: '100%', maxWidth: 500, alignSelf: 'center' },
  eyebrow: { color: '#D5E7D8', fontSize: 9, letterSpacing: 2, textAlign: 'center', fontWeight: '600' },
  title: { color: 'white', fontSize: 31, lineHeight: 37, fontWeight: '600', letterSpacing: -1, textAlign: 'center', marginBottom: 5 },
  caption: { color: '#DAE5DE', textAlign: 'center', fontSize: 11 },
});
