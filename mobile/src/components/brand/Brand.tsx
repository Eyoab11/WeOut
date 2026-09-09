import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';

export function Brand({ small = false }: { small?: boolean }) {
  return <View accessible accessibilityLabel="WeOut. Places, people, purpose." style={styles.brand}>
    <Svg width={small ? 66 : 92} height={small ? 42 : 58} viewBox="0 0 100 62">
      <Path d="M3 58 43 3 65 39 48 29 28 54Z" fill="#116343" />
      <Path d="m43 3 8 28-8-7-15 30 20-25 17 10Z" fill="#3E896A" />
      <Path d="m49 57 25-46 25 47-19-7-7-17-13 25Z" fill="#80AB94" />
      <Path d="m49 57 14-28 10 5 7 17-16-11Z" fill="#286F50" />
    </Svg>
    <Text style={[styles.name, small && { fontSize: 30, lineHeight: 33 }]}>WeOut</Text>
    <Text style={[styles.tag, small && { fontSize: 6, letterSpacing: 2.5 }]}>PLACES  PEOPLE  PURPOSE</Text>
  </View>;
}
const styles = StyleSheet.create({
  brand: { alignItems: 'center' },
  name: { color: colors.ink, fontSize: 43, fontWeight: '800', letterSpacing: -2, lineHeight: 46 },
  tag: { color: colors.ink, fontSize: 7, fontWeight: '600', letterSpacing: 3, marginTop: 9 },
});

export function MountainFooter() {
  return <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, opacity: 0.65 }}>
    <Svg width="100%" height="100%" viewBox="0 0 400 110" preserveAspectRatio="none">
      <Path d="M0 110 85 63 124 78 223 9 240 13 284 56 331 39 400 75V110Z" fill="#DCE3DF" />
      <Path d="m0 81 40-25 51 9 57 33 34-13 43 11 52-29 52 20 34-5 37 8v20H0Z" fill="#A3BAB0" />
      <Path d="m0 58 20 7 22 27 22-9 28 19 44-6 31 14H0Z" fill="#648D7A" />
      <Path d="m187 110 64-10 34-11 48 13 31-14 36 9v13Z" fill="#3D7059" />
    </Svg>
  </View>;
}
