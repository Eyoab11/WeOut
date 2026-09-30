import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@/components/ui/ActionButton';
import { Chips, EmptyState, Header, IconButton, Page, Section, ui } from '@/components/travel/Primitives';
import { colors } from '@/constants/theme';
import { useDiscovery } from './useDiscovery';
import NearbyMap from './NearbyMap';

export default function DiscoveryScreen({ companions = false }: { companions?: boolean }) {
  const router = useRouter();
  const [radius, setRadius] = useState('25');
  const [mode, setMode] = useState(companions ? 'People' : 'All');
  const [reset, setReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const discovery = useDiscovery(Number(radius));
  const { data, coordinates } = discovery;
  async function update(sharing: boolean, status: 'exploring' | 'traveling') {
    setBusy(true); setError('');
    try { await discovery.update(sharing, status); } catch (e) { setError(e instanceof Error ? e.message : 'Could not update visibility.'); }
    finally { setBusy(false); }
  }
  const openQuest = (id: string) => router.push({ pathname: '/sidequest/[id]', params: { id } });
  return <Page>
    <Header title={companions ? 'People nearby' : 'Explore around you'} icon="refresh-cw" onPress={() => { void discovery.refresh(); }} />
    <Text style={ui.body}>Discover travelers, SideQuests and trips within {radius} km.</Text>
    <Chips options={['5', '25', '50', '100']} selected={radius} onSelect={setRadius} />
    {!companions && <Chips options={['All', 'People', 'SideQuests', 'Trips']} selected={mode} onSelect={setMode} />}
    {discovery.loading && <View style={{ padding: 24, gap: 12 }}><ActivityIndicator color={colors.green} /><Text style={ui.body}>Finding your location and nearby adventures?</Text></View>}
    {!!(discovery.error || error) && <View style={[ui.card, { padding: 16, gap: 12 }]}><Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error || discovery.error?.message}</Text><ActionButton label="Retry" onPress={() => { setError(''); void discovery.refresh(); }} /></View>}
    {coordinates && !companions && <>
      <View style={{ height: 365, borderRadius: 18, overflow: 'hidden', marginTop: 12 }}>
        <NearbyMap center={coordinates} data={data} mode={mode} reset={reset} onQuest={openQuest} onPerson={() => router.navigate('/companions')} />
        <View style={{ position: 'absolute', right: 12, bottom: 25, borderRadius: 30, backgroundColor: 'white' }}><IconButton icon="navigation" label="Recenter on my location" onPress={() => { setReset(n => n + 1); void discovery.refresh(); }} /></View>
      </View>
      {Platform.OS === 'web' && <Text style={ui.small}>Nearby people and activities are listed below the map.</Text>}
    </>}
    {data && <>
      <View style={[ui.card, { padding: 16, marginTop: 16, gap: 10 }]}>
        <View style={ui.row}><Text style={[ui.sectionTitle, { flex: 1 }]}>Show me to nearby travelers</Text><Switch accessibilityLabel="Share approximate location with nearby travelers" value={data.sharing} disabled={busy} onValueChange={value => { void update(value, data.status); }} /></View>
        <Text style={ui.small}>Only your approximate area is shared. Visibility expires two hours after your last update. Your map works with sharing off.</Text>
        <Chips options={['exploring', 'traveling']} selected={data.status} onSelect={value => { if (!busy) void update(data.sharing, value as 'exploring' | 'traveling'); }} />
      </View>
      {(mode === 'All' || mode === 'People') && <><Section title="Travelers nearby" />
        {data.people.length ? data.people.map(person => <View key={person.id} style={[ui.card, { padding: 16, marginBottom: 10, gap: 5 }]}>
          <Text style={ui.sectionTitle}>{person.name}</Text><Text style={ui.small}>About {person.distance_km.toFixed(1)} km away ? {person.status}</Text>
          <Text style={ui.body}>{person.quests.length ? 'Doing: ' + person.quests.join(', ') : 'Exploring the area'}</Text>
        </View>) : <EmptyState title="Be the first around here" message="No travelers are sharing their location in this radius right now. Try a wider area or check again later." />}
      </>}
      {(mode === 'All' || mode === 'SideQuests') && <><Section title="SideQuests near you" onPress={() => router.navigate('/sidequests')} />
        {data.quests.length ? data.quests.map(quest => <Pressable key={quest.id} accessibilityRole="button" onPress={() => openQuest(quest.id)} style={[ui.card, { padding: 16, marginBottom: 10, gap: 5 }]}><Text style={ui.sectionTitle}>{quest.title}</Text><Text style={ui.body}>{quest.category} ? {quest.distance_km.toFixed(1)} km</Text></Pressable>) : <EmptyState title="Leave a little inspiration" message="No location-tagged SideQuests nearby yet. Create one here, or explore the challenges you can do anywhere." />}
      </>}
      {(mode === 'All' || mode === 'Trips') && <><Section title="Trips to this area" onPress={() => router.push('/trip/create')} />
        {data.trips.length ? data.trips.map(trip => <View key={trip.id} style={[ui.card, { padding: 16, marginBottom: 10, gap: 5 }]}><Text style={ui.sectionTitle}>{trip.title}</Text><Text style={ui.body}>{trip.name} ? {trip.destination}</Text><Text style={ui.small}>{trip.starts_on} to {trip.ends_on} ? {trip.distance_km.toFixed(1)} km</Text></View>) : <EmptyState title="An adventure is waiting" message="No shared upcoming trips to this area yet." />}
      </>}
    </>}
  </Page>;
}
