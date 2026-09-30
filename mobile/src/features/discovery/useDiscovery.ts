import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { useTravelStore } from '@/stores/useTravelStore';

export type Coordinates = { latitude: number; longitude: number };
export type NearbyPerson = Coordinates & { id: string; name: string; status: string; distance_km: number; quests: string[] };
export type NearbyQuest = Coordinates & { id: string; title: string; category: string; distance_km: number };
export type NearbyTrip = Coordinates & { id: string; title: string; destination: string; name: string; starts_on: string; ends_on: string; distance_km: number };
export type Discovery = { sharing: boolean; status: 'exploring' | 'traveling'; people: NearbyPerson[]; quests: NearbyQuest[]; trips: NearbyTrip[] };

export async function currentCoordinates(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error('Allow location access in your device settings, then tap Retry.');
  if (!await Location.hasServicesEnabledAsync()) throw new Error('Turn on your device location services, then tap Retry.');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
export function useDiscovery(radius = 25) {
  const owner = useTravelStore(s => s.ownerKey);
  const queryClient = useQueryClient();
  const location = useQuery({ queryKey: ['device-location', owner], queryFn: currentCoordinates, staleTime: 60000, retry: false, refetchInterval: 60000 });
  const coordinates = location.data;
  const nearby = useQuery({
    queryKey: ['discovery', owner, coordinates?.latitude, coordinates?.longitude, radius],
    enabled: !!coordinates, retry: 1, refetchInterval: 60000,
    queryFn: async (): Promise<Discovery> => {
      const client = requireSupabase();
      const args = { p_latitude: coordinates!.latitude, p_longitude: coordinates!.longitude };
      const { error: updateError } = await client.rpc('discovery_update', args);
      if (updateError) throw new Error(updateError.message);
      const { data, error } = await client.rpc('discovery_nearby', { ...args, p_radius_km: radius });
      if (error) throw new Error(error.message);
      return data as Discovery;
    },
  });
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') void queryClient.invalidateQueries({ queryKey: ['device-location', owner] });
    });
    return () => listener.remove();
  }, [owner, queryClient]);
  async function update(sharing: boolean, status: 'exploring' | 'traveling') {
    if (!coordinates) return;
    const { error } = await requireSupabase().rpc('discovery_update', {
      p_latitude: coordinates.latitude, p_longitude: coordinates.longitude, p_sharing: sharing, p_status: status,
    });
    if (error) throw new Error(error.message);
    await queryClient.invalidateQueries({ queryKey: ['discovery', owner] });
  }
  return { coordinates, data: nearby.data, loading: location.isPending || (!!coordinates && nearby.isPending),
    error: location.error || nearby.error, update,
    async refresh() { await location.refetch(); await queryClient.invalidateQueries({ queryKey: ['discovery', owner] }); },
  };
}
