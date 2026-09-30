import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { travelImages } from '@/features/travel/data';
import { type TravelMapProps } from './TravelMap.types';

const region = { latitude: 41.391, longitude: 2.179, latitudeDelta: 0.048, longitudeDelta: 0.048 };
export default function TravelMap({ places, showFriends, onPlace, onFriend, reset }: TravelMapProps) {
  const map = useRef<MapView>(null);
  useEffect(() => { if (reset) map.current?.animateToRegion(region, 500); }, [reset]);
  return <MapView ref={map} style={{ flex: 1 }} initialRegion={region} showsPointsOfInterests={false} showsCompass={false} rotateEnabled={false}
    accessibilityLabel="Barcelona preview map. Pins show sample destinations." mapType="standard">
    {places.map(place => <Marker key={place.id} coordinate={place} title={place.name} pinColor="#287554" onPress={() => onPlace(place.id)} />)}
    {showFriends && [{ latitude: 41.398, longitude: 2.160, image: travelImages.emma }, { latitude: 41.379, longitude: 2.177, image: travelImages.alex }].map((person, index) =>
      <Marker key={index} coordinate={person} onPress={onFriend}>
        <View style={{ padding: 3, backgroundColor: 'white', borderRadius: 30 }}><Image source={person.image} style={{ width: 39, height: 39, borderRadius: 25 }} /><View style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, backgroundColor: '#48BC8C', borderRadius: 5, borderWidth: 2, borderColor: 'white' }} /></View>
      </Marker>)}
    <Marker coordinate={{ latitude: 41.386, longitude: 2.184 }}><View style={{ alignItems: 'center' }}><View style={{ width: 18, height: 18, borderRadius: 10, backgroundColor: '#4398F0', borderColor: 'white', borderWidth: 3 }} /><Text style={{ backgroundColor: '#4398F0', color: 'white', padding: 3, borderRadius: 5, fontSize: 9 }}>Start here</Text></View></Marker>
  </MapView>;
}
