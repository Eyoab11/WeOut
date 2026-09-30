import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { type NearbyMapProps } from './NearbyMap.types';

export default function NearbyMap({ center, data, mode, reset, onQuest, onPerson }: NearbyMapProps) {
  const map = useRef<MapView>(null);
  useEffect(() => { map.current?.animateToRegion({ ...center, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 600); }, [center.latitude, center.longitude, reset]);
  return <MapView ref={map} style={{ flex: 1 }} initialRegion={{ ...center, latitudeDelta: 0.08, longitudeDelta: 0.08 }} showsUserLocation showsMyLocationButton={false} accessibilityLabel="Your location and nearby travelers and activities">
    {(mode === 'All' || mode === 'People') && data?.people.map(p => <Marker key={p.id} coordinate={p} title={p.name} description={[p.status, ...p.quests].join(' ? ')} pinColor="#429BEE" onCalloutPress={onPerson} />)}
    {(mode === 'All' || mode === 'SideQuests') && data?.quests.map(q => <Marker key={q.id} coordinate={q} title={q.title} description={q.category} pinColor="#287554" onCalloutPress={() => onQuest(q.id)} />)}
    {(mode === 'All' || mode === 'Trips') && data?.trips.map(t => <Marker key={t.id} coordinate={t} title={t.title} description={t.name + ' ? ' + t.starts_on + ' to ' + t.ends_on} pinColor="#D78A28" />)}
  </MapView>;
}
