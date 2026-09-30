import { useState } from 'react';
import { useQuests } from '@/features/sidequests/useQuests';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActionButton } from '@/components/ui/ActionButton';
import { EmptyState, IconButton, Page, Section, Tag, ui } from '@/components/travel/Primitives';
import { QuestMeta } from '@/components/travel/Cards';
import { places, quests, travelImages } from './data';
import { useTravelStore } from '@/stores/useTravelStore';
import { Itinerary } from '@/features/trips/TripsScreen';

export default function DetailScreen({ kind }: { kind: 'place' | 'quest' | 'trip' }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const saved = useTravelStore(s => s.saved);
  const toggleSave = useTravelStore(s => s.toggleSave);
  const progress = useQuests();
  const active = progress.started;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const localTrips = useTravelStore(s => s.trips);
  const place = kind === 'place' ? places.find(p => p.id === id) : undefined;
  const quest = kind === 'quest' ? progress.all.find(q => q.id === id) : undefined;
  const trip = kind === 'trip' ? localTrips.find(t => t.id === id) : undefined;
  const sampleTrip = kind === 'trip' && id === 'barcelona';
  const found = place || quest || trip || sampleTrip;
  const title = place?.name || quest?.title || trip?.title || 'Barcelona Weekend';
  return <Page>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={ui.header}><IconButton icon="arrow-left" label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} /><Text style={ui.sectionTitle}>{kind === 'quest' ? 'SideQuest' : kind === 'trip' ? 'Your itinerary' : 'A place to remember'}</Text><View style={{ width: 44 }} /></View>
    {!found ? <EmptyState title="This adventure isn’t here" message="Go back and choose another place or quest." /> : <>
      <Image source={place?.image || quest?.image || travelImages.city} style={{ width: '100%', height: 280, borderRadius: 20 }} />
      <View style={{ marginVertical: 17, gap: 9 }}><Tag>{place?.category || quest?.category || 'TRAVEL PLAN'}</Tag><Text style={ui.title}>{title}</Text><Text style={ui.body}>{place?.description || quest?.description || (trip ? trip.destination + ' · ' + trip.dates : 'Four days of wandering, good food, and little discoveries. A sample itinerary to make your own.')}</Text></View>
      {quest ? <>
        <QuestMeta quest={quest} /><Section title="Your little challenge" />
        <Text style={ui.body}>1. Make your way there at your own pace.{ '\n' }2. Pause and take in the moment.{ '\n' }3. Capture a memory to share with your travel people.</Text>
        <Text style={[ui.small, { marginVertical: 16 }]}>{quest.minutes} minutes · Reward shown for inspiration. Preview actions do not award XP.</Text>
        <Text style={[ui.small, { marginBottom: 12 }]}>Finish by posting your own photo of this challenge. Completion adds one activity day to your streak.</Text>
        {!!error && <Text style={ui.body}>{error}</Text>}
        <ActionButton disabled={busy || !progress.ready || !!progress.completed[id]} label={progress.completed[id] ? 'Completed with photo' : busy ? 'Joining?' : active.includes(id) ? 'Post photo & finish' : 'Start Quest'} icon={active.includes(id) ? 'camera' : 'zap'} onPress={async () => {
          if (busy) return;
          if (active.includes(id)) { router.push({ pathname: '/post/create', params: { questId: id } }); return; }
          setBusy(true); setError('');
          try { await progress.start(quest); } catch (e) { setError(e instanceof Error ? e.message : 'Could not join. Try again.'); } finally { setBusy(false); }
        }} />
        {progress.posts.filter(p => p.id === progress.completed[id]).map(p => <Image key={p.id} source={p.photoUri} style={{ width: '100%', height: 240, borderRadius: 16, marginTop: 14 }} />)}
      </> : place ? <>
        <Section title="The details" /><Text style={[ui.body, { marginBottom: 20 }]}>Barcelona, Spain · {place.distance} from the sample starting point.{ '\n' }Save it for a spontaneous afternoon or add a little detour to your next trip.</Text>
        <ActionButton label={saved.includes(id) ? 'Saved to your places' : 'Save this place'} icon={saved.includes(id) ? 'check' : 'bookmark'} onPress={() => toggleSave(id)} />
      </> : sampleTrip ? <><Section title="Your Barcelona days" /><Itinerary full /><ActionButton label="Make your own plan" icon="plus" onPress={() => router.push('/trip/create')} /></> : <><Section title="Leave room for a little wonder" /><Text style={[ui.body, { marginBottom: 20 }]}>Your plan is saved for this preview session. Explore places for your itinerary.</Text><ActionButton label="Find a little inspiration" onPress={() => router.navigate('/explore')} /></>}
    </>}
  </Page>;
}
