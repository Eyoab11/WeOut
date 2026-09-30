import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { requireSupabase } from '@/lib/supabase';
import { useTravelStore } from '@/stores/useTravelStore';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { Chips, EmptyState, Header, Page, ui } from '@/components/travel/Primitives';
import { currentCoordinates } from './useDiscovery';
import { colors } from '@/constants/theme';

type Trip = { id: string; title: string; destination: string; starts_on: string; ends_on: string; shared: boolean };
export function LiveTrips() {
  const router = useRouter();
  const owner = useTravelStore(s => s.ownerKey);
  const client = useQueryClient();
  const [tab, setTab] = useState('Upcoming');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ['trips', owner], queryFn: async () => {
    const { data, error } = await requireSupabase().from('travel_trips').select('id,title,destination,starts_on,ends_on,shared').order('starts_on');
    if (error) throw new Error(error.message);
    return data as Trip[];
  } });
  const today = new Date().toISOString().slice(0, 10);
  const trips = query.data?.filter(t => tab === 'Past' ? t.ends_on < today : t.ends_on >= today) || [];
  async function share(trip: Trip, shared: boolean) {
    setBusy(true); setError('');
    try {
      const { error } = await requireSupabase().from('travel_trips').update({ shared }).eq('id', trip.id);
      if (error) throw new Error(error.message);
      await client.invalidateQueries({ queryKey: ['trips', owner] });
      await client.invalidateQueries({ queryKey: ['discovery', owner] });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update trip.'); }
    finally { setBusy(false); }
  }
  return <Page><Header title="Your trips" icon="plus-circle" onPress={() => router.push('/trip/create')} />
    <Chips options={['Upcoming', 'Past']} selected={tab} onSelect={setTab} />
    {query.isPending && <Text style={ui.body}>Loading your plans?</Text>}
    {!!(query.error || error) && <><Text style={{ color: colors.error }}>{error || query.error?.message}</Text><ActionButton label="Retry" onPress={() => { void query.refetch(); }} /></>}
    {trips.map(trip => <View key={trip.id} style={[ui.card, { padding: 18, gap: 10, marginTop: 12 }]}>
      <Text style={ui.sectionTitle}>{trip.title}</Text><Text style={ui.body}>{trip.destination}</Text><Text style={ui.small}>{trip.starts_on} to {trip.ends_on}</Text>
      <View style={ui.row}><Text style={[ui.body, { flex: 1 }]}>Share destination with travelers</Text><Switch accessibilityLabel={'Share ' + trip.title} disabled={busy} value={trip.shared} onValueChange={value => { void share(trip, value); }} /></View>
    </View>)}
    {!query.isPending && !query.error && !trips.length && <EmptyState title="Make room for adventure" message="Your saved trips will appear here. Add a destination and dates to start." />}
  </Page>;
}
export function LiveTripCreate() {
  const router = useRouter();
  const client = useQueryClient();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function locate(here: boolean) {
    setBusy(true); setError('');
    try {
      const results = here ? [await currentCoordinates()] : await Location.geocodeAsync(destination);
      if (!results.length) throw new Error('Destination not found. Try a city and country, or enter coordinates.');
      if (!here && results.length > 1) throw new Error('Several places match. Add the country or a more specific address.');
      setLatitude(String(results[0].latitude)); setLongitude(String(results[0].longitude));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not find destination. Enter its coordinates below.'); }
    finally { setBusy(false); }
  }
  async function save() {
    if (busy) return;
    const lat = Number(latitude), lng = Number(longitude);
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    if (title.trim().length < 2 || destination.trim().length < 2 || !validDate(start) || !validDate(end) || end < start) { setError('Add a title, destination, and valid YYYY-MM-DD dates. End must be on or after start.'); return; }
    if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { setError('Locate your destination or enter valid coordinates.'); return; }
    setBusy(true); setError('');
    try {
      const { error } = await requireSupabase().from('travel_trips').insert({ title: title.trim(), destination: destination.trim(), starts_on: start, ends_on: end, latitude: lat, longitude: lng, shared });
      if (error) throw new Error(error.message);
      await client.invalidateQueries({ queryKey: ['trips'] });
      await client.invalidateQueries({ queryKey: ['discovery'] });
      router.replace('/trips');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your trip.'); }
    finally { setBusy(false); }
  }
  return <Page><Header title="Plan an adventure" icon="arrow-left" onPress={() => router.back()} />
    <View style={{ gap: 15 }}>
      <FormField label="Trip name" icon="map" value={title} onChangeText={setTitle} maxLength={100} />
      <FormField label="Destination (city, country)" icon="map-pin" value={destination} onChangeText={value => { setDestination(value); setLatitude(''); setLongitude(''); }} maxLength={200} />
      <ActionButton label="Locate destination" icon="search" disabled={busy || destination.trim().length < 2} onPress={() => { void locate(false); }} />
      <ActionButton label="Use my current location as destination" icon="navigation" disabled={busy} onPress={() => { void locate(true); }} />
      <Text style={ui.small}>Check the destination coordinates before saving. You can enter them manually if address lookup is unavailable.</Text>
      <FormField label="Destination latitude" icon="map-pin" value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" />
      <FormField label="Destination longitude" icon="map-pin" value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" />
      <FormField label="Start date ? YYYY-MM-DD" icon="calendar" value={start} onChangeText={setStart} />
      <FormField label="End date ? YYYY-MM-DD" icon="calendar" value={end} onChangeText={setEnd} />
      <View style={ui.row}><Text style={[ui.body, { flex: 1 }]}>Show this destination and dates to nearby travelers</Text><Switch accessibilityLabel="Share trip destination" value={shared} disabled={busy} onValueChange={setShared} /></View>
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error}</Text>}
      <ActionButton label={busy ? 'Saving?' : 'Save my plan'} disabled={busy} onPress={() => { void save(); }} />
    </View>
  </Page>;
}
