import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors, handwritten } from '@/constants/theme';

export const photos = {
  mountains: require('../../../assets/onboarding/mountains.jpg'),
  coast: require('../../../assets/onboarding/coast.jpg'),
  hiker: require('../../../assets/onboarding/hiker.jpg'),
  people: [
    require('../../../assets/onboarding/traveler-1.jpg'),
    require('../../../assets/onboarding/traveler-2.jpg'),
    require('../../../assets/onboarding/traveler-3.jpg'),
  ],
};
function Trail() {
  return <Svg style={StyleSheet.absoluteFill} viewBox="0 0 330 380" width="100%" height="100%">
    <Path d="M-20 330C80 390 48 258 118 291S255 330 235 264 294 236 280 170 213 92 248 39 307 80 346 14" fill="none" stroke="#458463" strokeWidth="1.6" />
  </Svg>;
}
export function PlacesArt() {
  return <View style={styles.art}>
    <Trail />
    <Image source={photos.coast} contentFit="cover" style={styles.roundPhoto} accessibilityLabel="Turquoise coast and dramatic sea cliffs" />
    <View style={styles.explorePill}><Text style={styles.pillText}>Explore</Text><Feather name="map-pin" size={25} color="white" style={{ position: 'absolute', top: 43, left: 25 }} /></View>
    <View style={styles.miniCard}>
      <Image source={photos.mountains} style={{ width: '100%', height: 87, borderRadius: 9 }} />
      <Text style={styles.cardTitle}>Hidden escape</Text>
      <Text style={styles.meta}>⌖  0.3 km away</Text>
    </View>
  </View>;
}
export function QuestArt() {
  return <View style={styles.art}><Trail />
    <View style={styles.questCard}>
      <View><Image source={photos.hiker} style={styles.questPhoto} accessibilityLabel="Hikers exploring a mountain trail" />
        <View style={styles.questBadge}><Feather name="star" color="white" size={11} /><Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}> SIDEQUEST</Text></View>
      </View>
      <View style={{ padding: 14, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>Chase a new viewpoint</Text>
        <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 17 }}>Take the scenic route. The best stories start off the beaten path.</Text>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 3 }}><Text style={{ color: '#D28C31', fontWeight: '700' }}>✦ +150 XP</Text><Text style={styles.meta}>⌖  2.5 km</Text></View>
      </View>
    </View>
  </View>;
}
export function PeopleArt() {
  return <View style={styles.art}>
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 330 380"><Path d="M67 60C303-20 334 132 154 186S83 368 287 291" stroke="#C4D5CA" strokeDasharray="5 5" strokeWidth="1.5" fill="none" /></Svg>
    <Feather name="send" size={26} color="#567965" style={{ position: 'absolute', right: 29, top: 24, transform: [{ rotate: '10deg' }] }} />
    {photos.people.map((photo, index) => <View key={index} style={[styles.person, { top: [35, 137, 244][index], left: [20, 176, 40][index] }]}>
      <Image source={photo} style={{ width: index === 0 ? 124 : 108, height: index === 0 ? 124 : 108, borderRadius: 80, borderWidth: 5, borderColor: colors.background }} />
      <View style={[styles.peoplePill, index === 1 ? { right: 70, top: 66 } : { left: 78, top: 68 }]}>
        <Text style={{ color: 'white', fontSize: 11, lineHeight: 15 }}>{['Same vibe.\nDifferent place.', 'New friends.\nNew stories.', 'Travel together.'][index]}</Text>
      </View>
    </View>)}
  </View>;
}
export function Globe() {
  return <Svg width="100%" height="100%" viewBox="0 0 320 300">
    <Circle cx="158" cy="148" r="108" fill="#E8ECE8" />
    <Ellipse cx="146" cy="144" rx="87" ry="103" fill="#EEF1ED" />
    <Path d="m102 51 32-9 22 12-6 18-25 3-5 21-23 1-15 28-17-10 9-22 13-3 3-25ZM145 110l29-9 23 13 7 25-19 14-4 30-17 25-13-3-9-30-17-15 1-29ZM188 57l37 16 25 27 8 35-22-7-11-26-25 2-16-18ZM207 201l19-10 18 12-8 15-29-2ZM86 162l23 17 10 30-17 15-17-35Z" fill="#CFD8D0" />
    <Path d="M64 178C-18 249 210 207 282 97" fill="none" stroke="#2A8559" strokeWidth="1.6" />
    <Circle cx="137" cy="161" r="7" fill="#2D7951" />
    <Path d="m273 101-16-4 3-4 14 1 11-15 5 1-8 17 8 11-2 4-10-8-7 9-3-1Z" fill="#339E70" />
  </Svg>;
}
export function JourneyArt() {
  return <View style={styles.art}><View style={{ height: 300, width: '100%' }}><Globe /></View><Text style={{ fontFamily: handwritten, fontSize: 30, color: colors.green, textAlign: 'center' }}>A little further. A little freer.</Text></View>;
}
const styles = StyleSheet.create({
  art: { width: 330, maxWidth: '100%', height: 380, alignSelf: 'center', justifyContent: 'center' },
  roundPhoto: { width: 268, height: 268, borderRadius: 150, alignSelf: 'center', marginTop: -35 },
  explorePill: { position: 'absolute', top: 72, right: 26, borderRadius: 30, backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 18, boxShadow: '0 4px 16px #153D3020' },
  pillText: { color: colors.leaf, fontSize: 12, fontWeight: '600' },
  miniCard: { width: 122, backgroundColor: 'white', padding: 7, borderRadius: 12, position: 'absolute', bottom: 28, left: 26, transform: [{ rotate: '-4deg' }], boxShadow: '0 6px 22px #153D3020' },
  cardTitle: { fontSize: 12, fontWeight: '700', color: colors.ink, marginTop: 9, marginBottom: 5 },
  meta: { color: colors.green, fontSize: 11 },
  questCard: { width: 276, padding: 8, borderRadius: 16, alignSelf: 'center', backgroundColor: 'white', transform: [{ rotate: '-7deg' }], boxShadow: '0 12px 30px #153D3020' },
  questPhoto: { width: '100%', height: 197, borderRadius: 10 },
  questBadge: { position: 'absolute', right: 10, top: 10, backgroundColor: colors.green, borderRadius: 7, padding: 7, flexDirection: 'row', alignItems: 'center' },
  person: { position: 'absolute' },
  peoplePill: { position: 'absolute', backgroundColor: colors.leaf, borderRadius: 9, paddingVertical: 9, paddingHorizontal: 12, minWidth: 102, boxShadow: '0 4px 12px #153D3018' },
});
