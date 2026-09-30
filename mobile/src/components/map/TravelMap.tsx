import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { travelImages } from '@/features/travel/data';
import { type TravelMapProps } from './TravelMap.types';

export default function TravelMap({ places, showFriends, onPlace, onFriend }: TravelMapProps) {
  return <View style={{ flex: 1, backgroundColor: '#E6EBDF' }}>
    <Svg width="100%" height="100%" viewBox="0 0 400 370" preserveAspectRatio="none">
      <Rect width="400" height="370" fill="#E7EDDE" />
      <Path d="M332 0 400 0 400 370 206 370 262 275 318 190 359 100Z" fill="#C0E5EA" />
      <G stroke="#FFFFFF" strokeWidth="6" opacity="0.9">{Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${i * 35 - 120} 0 l280 370 M0 ${i * 35 - 80} l360 80`} />)}</G>
      <Path d="M20 360 185 120 230 0M0 150 300 217" stroke="#F5D49B" strokeWidth="8" />
      <Path d="M28 48 70 13 120 55 88 94Z M155 231 191 214 227 247 185 280Z" fill="#BBD4AB" />
    </Svg>
    <Text style={styles.city}>BARCELONA</Text><Text style={styles.label}>Eixample</Text>
    {places.map((place, i) => <Pressable key={place.id} accessibilityRole="button" accessibilityLabel={place.name} onPress={() => onPlace(place.id)} style={[styles.pin, { top: [115, 245, 165][i], left: [130, 263, 218][i] }]}><Feather name="map-pin" size={31} color="#24714F" /></Pressable>)}
    {showFriends && [travelImages.emma, travelImages.alex].map((image, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel="Find travel companions" onPress={onFriend} style={{ position: 'absolute', left: [35, 285][i], top: [112, 265][i], borderWidth: 3, borderColor: 'white', borderRadius: 25 }}><Image source={image} style={{ width: 42, height: 42, borderRadius: 25 }} /></Pressable>)}
    <View style={styles.start}><View style={styles.dot} /><Text style={{ color: 'white', backgroundColor: '#429BEE', fontSize: 9, padding: 3, borderRadius: 4 }}>Start here</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  city: { position: 'absolute', top: 235, left: 92, fontSize: 12, letterSpacing: 3, color: '#527176', fontWeight: '700' },
  label: { position: 'absolute', top: 157, left: 39, fontSize: 10, color: '#87928B' },
  pin: { position: 'absolute', padding: 5 }, start: { position: 'absolute', left: 170, top: 270, alignItems: 'center' },
  dot: { width: 17, height: 17, borderRadius: 10, borderWidth: 3, borderColor: 'white', backgroundColor: '#429BEE' },
});
