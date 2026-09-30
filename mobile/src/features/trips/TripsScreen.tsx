import { LiveTrips } from '@/features/discovery/LiveTrips';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Chips, EmptyState, Header, Page, Section, Sheet, Tag, ui } from '@/components/travel/Primitives';
import { PlaceCard } from '@/components/travel/Cards';
import { useTravelStore } from '@/stores/useTravelStore';
import { itinerary, places, travelImages } from '@/features/travel/data';
import { colors } from '@/constants/theme';

export function Itinerary({ full = false }: { full?: boolean }) {
  return <View>{itinerary.slice(0, full ? itinerary.length : 3).map((item, i) => <View key={item.title} style={{ flexDirection: 'row', gap: 10 }}>
    <View style={{ width: 13, alignItems: 'center' }}><View style={{ width: 7, height: 7, borderRadius: 5, backgroundColor: colors.leaf, marginTop: 5 }} />{i < (full ? itinerary.length : 3) - 1 && <View style={{ width: 1, flex: 1, backgroundColor: '#CEE0D3' }} />}</View>
    <Text style={[ui.small, { width: 66, paddingBottom: 19 }]}>{item.time}</Text><View style={{ flex: 1, paddingBottom: 19 }}><Text style={{ fontSize: 12, color: colors.ink, fontWeight: '600' }}>{item.title}</Text><Text style={ui.small}>{item.note}</Text></View>
  </View>)}</View>;
}
export default function TripsScreen() {
  const preview = useTravelStore(s => s.preview);
  return preview ? <PreviewTripsScreen /> : <LiveTrips />;
}
function PreviewTripsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Upcoming');
  const [sheet, setSheet] = useState<'plan' | 'essentials' | null>(null);
  const [packed, setPacked] = useState<string[]>([]);
  const saved = useTravelStore(s => s.saved);
  const localTrips = useTravelStore(s => s.trips);
  const savedPlaces = places.filter(p => saved.includes(p.id));
  return <Page>
    <Header title="Trips" icon="plus-circle" onPress={() => router.push('/trip/create')} />
    <Chips segmented options={['Upcoming', 'Past', 'Saved']} selected={tab} onSelect={setTab} />
    {tab === 'Past' ? <EmptyState title="Your story is just beginning" message="The adventures you’ve been on will find a home here." /> : tab === 'Saved' ? <>
      <Section title="Places for another day" />
      {savedPlaces.length ? <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>{savedPlaces.map(p => <PlaceCard key={p.id} place={p} />)}</ScrollView> : <EmptyState title="Keep a little inspiration" message="Tap the heart on a nearby place to save it here." />}
    </> : <>
      {localTrips.map(trip => <Pressable key={trip.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })} style={[ui.card, { padding: 16, marginTop: 10, gap: 4 }]}><Tag>YOUR PLAN</Tag><Text style={ui.sectionTitle}>{trip.title}</Text><Text style={ui.body}>{trip.destination} · {trip.dates}</Text></Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Open Barcelona Weekend trip" onPress={() => router.push({ pathname: '/trip/[id]', params: { id: 'barcelona' } })} style={[ui.card, { marginTop: 12 }]}>
        <Image source={travelImages.city} style={{ width: '100%', height: 185 }} />
        <LinearGradient colors={['transparent', '#0F3028D9']} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        <View style={{ position: 'absolute', right: 10, top: 12 }}><Tag>SAMPLE ITINERARY</Tag></View>
        <View style={{ position: 'absolute', bottom: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: 'white', fontSize: 19, fontWeight: '700' }}>Barcelona Weekend</Text><Text style={{ color: '#E2E8E4', fontSize: 11, marginTop: 4 }}>May 10 – May 14, 2027</Text></View><Feather name="arrow-right-circle" color="white" size={25} /></View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 11 }}>{[{ icon: 'calendar' as const, value: '4 Days', label: 'A little getaway' }, { icon: 'dollar-sign' as const, value: '€800', label: 'Sample budget' }, { icon: 'bookmark' as const, value: String(savedPlaces.length), label: 'Saved places' }].map(stat => <View key={stat.value + stat.label} style={[ui.card, { flex: 1, padding: 11, flexDirection: 'row', gap: 7, alignItems: 'center' }]}><Feather name={stat.icon} size={18} color={colors.leaf} /><View><Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>{stat.value}</Text><Text style={{ fontSize: 8, color: colors.muted }}>{stat.label}</Text></View></View>)}</View>
      <Section title="Itinerary" action="See full plan" onPress={() => setSheet('plan')} />
      <View style={[ui.card, { padding: 15, paddingBottom: 0 }]}><Itinerary /></View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 13 }}>
        <Pressable accessibilityRole="button" onPress={() => setSheet('essentials')} style={[ui.card, { flex: 1, padding: 14, gap: 13 }]}><Text style={ui.sectionTitle}>Essentials ›</Text><View style={ui.row}><Feather name="briefcase" color={colors.leaf} size={18} /><Text style={ui.small}>{packed.length}/4 packed</Text></View></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setTab('Saved')} style={[ui.card, { flex: 1, padding: 14, gap: 8 }]}><Text style={ui.sectionTitle}>Saved Places ›</Text><View style={ui.row}>{places.map(p => <Image key={p.id} source={p.image} style={{ width: 27, height: 33, borderRadius: 5 }} />)}</View></Pressable>
      </View>
    </>}
    <Sheet title={sheet === 'plan' ? 'Your Barcelona days' : 'The little essentials'} visible={!!sheet} onClose={() => setSheet(null)}>
      {sheet === 'plan' ? <Itinerary full /> : ['Travel documents', 'Phone & charger', 'Reusable water bottle', 'Comfortable shoes'].map(item => <Pressable key={item} accessibilityRole="checkbox" accessibilityState={{ checked: packed.includes(item) }} onPress={() => setPacked(list => list.includes(item) ? list.filter(v => v !== item) : [...list, item])} style={[ui.row, { padding: 14, backgroundColor: 'white', borderRadius: 12 }]}><Feather name={packed.includes(item) ? 'check-square' : 'square'} color={colors.leaf} size={20} /><Text style={ui.body}>{item}</Text></Pressable>)}
    </Sheet>
  </Page>;
}
