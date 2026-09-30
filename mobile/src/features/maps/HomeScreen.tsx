import { useTravelStore } from '@/stores/useTravelStore';
import DiscoveryScreen from '@/features/discovery/DiscoveryScreen';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { MountainMark } from '@/components/brand/Brand';
import { Chips, EmptyState, IconButton, Page, SearchBox, Section, Sheet, ui } from '@/components/travel/Primitives';
import { PlaceCard } from '@/components/travel/Cards';
import TravelMap from '@/components/map/TravelMap';
import { places, quests } from '@/features/travel/data';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  const preview = useTravelStore(s => s.preview);
  return preview ? <PreviewHomeScreen /> : <DiscoveryScreen />;
}
function PreviewHomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('Map');
  const [reset, setReset] = useState(0);
  const [notifications, setNotifications] = useState(false);
  const filtered = places.filter(p => (p.name + p.category).toLowerCase().includes(query.toLowerCase()));
  function selectMode(value: string) {
    if (value === 'SideQuests') router.navigate('/sidequests');
    else if (value === 'Friends') { setMode(value); }
    else setMode(value);
  }
  return <Page>
    <View style={ui.header}>
      <View style={s.wordmark}><MountainMark width={46} /><View><Text style={s.name}>WeOut</Text><Text style={s.tagline}>PLACES · PEOPLE · PURPOSE</Text></View></View>
      <View><IconButton icon="bell" label="Notifications" onPress={() => setNotifications(true)} /><View style={s.notificationDot} /></View>
    </View>
    <SearchBox value={query} onChange={setQuery} placeholder="Search destinations, places, or experiences…" />
    <Chips options={['Map', 'SideQuests', 'Friends']} selected={mode} onSelect={selectMode} segmented />
    <View style={s.map}>
      <TravelMap places={filtered} showFriends={mode === 'Friends' || !query} reset={reset} onPlace={id => router.push({ pathname: '/place/[id]', params: { id } })} onFriend={() => router.navigate('/companions')} />
      <View style={s.preview}><Text style={s.previewText}>PREVIEW · BARCELONA</Text></View>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sidequest/[id]', params: { id: 'sunrise' } })} style={s.quest}>
        <Image source={quests[0].image} style={{ width: '100%', height: 62, borderRadius: 7 }} />
        <Text style={s.questTitle}>Sunrise Viewpoint Quest</Text><Text numberOfLines={2} style={{ fontSize: 9, color: colors.muted }}>Find the hidden rooftop, snap a view & share what travel means to you.</Text>
        <Text style={{ fontSize: 10, color: '#D78A28', marginTop: 4 }}>✦ +150 XP  <Text style={{ color: colors.muted }}>⌖ 0.3 km</Text></Text>
      </Pressable>
      {mode === 'Friends' && <Pressable onPress={() => router.navigate('/companions')} accessibilityRole="button" style={s.friendCta}><Text style={{ color: colors.green, fontSize: 11, fontWeight: '600' }}>Find your travel people →</Text></Pressable>}
      <View style={s.mapBottom}><View style={s.weather}><Feather name="sun" size={23} color="#E8A33B" /><View><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 15 }}>24°</Text><Text style={{ fontSize: 8, color: colors.muted }}>A little sunshine inspiration</Text></View></View>
        <View style={s.recenter}><IconButton icon="navigation" label="Recenter Barcelona map" onPress={() => setReset(n => n + 1)} /></View></View>
    </View>
    <Section title="Nearby in Barcelona" onPress={() => router.navigate('/explore')} />
    {filtered.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>{filtered.map(place => <PlaceCard key={place.id} place={place} />)}</ScrollView> : <EmptyState title="A little further afield?" message="Try another place or category." />}
    <Sheet title="A little inspiration" visible={notifications} onClose={() => setNotifications(false)}>
      <Text style={ui.body}>Your adventure starts here. These are preview suggestions, not live notifications.</Text>
      <Pressable onPress={() => { setNotifications(false); router.navigate('/sidequests'); }} style={[ui.card, { padding: 18, gap: 5 }]}><Text style={ui.sectionTitle}>A new view is waiting</Text><Text style={ui.body}>Discover a SideQuest for your next day out →</Text></Pressable>
      <Pressable onPress={() => { setNotifications(false); router.navigate('/companions'); }} style={[ui.card, { padding: 18, gap: 5 }]}><Text style={ui.sectionTitle}>Better with good company</Text><Text style={ui.body}>Meet travelers with a similar wish list →</Text></Pressable>
    </Sheet>
  </Page>;
}
const s = StyleSheet.create({
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 12 }, name: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.7 },
  tagline: { fontSize: 5, letterSpacing: 1.4, color: colors.muted }, notificationDot: { position: 'absolute', width: 5, height: 5, borderRadius: 5, backgroundColor: '#E8A33B', right: 12, top: 10 },
  map: { height: 365, borderRadius: 17, overflow: 'hidden', marginTop: 5, backgroundColor: '#DDEBDC' },
  preview: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFFFFFDD', padding: 6, borderRadius: 9 },
  previewText: { fontSize: 7, letterSpacing: 0.8, color: colors.muted },
  quest: { position: 'absolute', top: 12, right: 10, width: 163, borderRadius: 11, padding: 6, backgroundColor: 'white', boxShadow: '0 4px 15px #173E3020' },
  questTitle: { fontSize: 11, fontWeight: '700', color: colors.ink, marginTop: 6, marginBottom: 3 },
  mapBottom: { position: 'absolute', bottom: 28, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weather: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: 'white', padding: 9, borderRadius: 12 },
  recenter: { borderRadius: 28, backgroundColor: 'white', boxShadow: '0 3px 10px #153C301A' },
  friendCta: { position: 'absolute', top: 175, left: 20, backgroundColor: 'white', padding: 12, borderRadius: 15 },
});
