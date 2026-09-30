import { LiveTripCreate } from '@/features/discovery/LiveTrips';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { z } from 'zod';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { IconButton, Page, ui } from '@/components/travel/Primitives';
import { useTravelStore } from '@/stores/useTravelStore';
import { colors } from '@/constants/theme';

const tripSchema = z.object({ title: z.string().trim().min(2), destination: z.string().trim().min(2), start: z.iso.date(), end: z.iso.date() }).refine(d => d.end >= d.start, { message: 'End date must be after the start date.' });
export default function CreateScreen({ kind }: { kind: 'trip' | 'post' }) {
  const preview = useTravelStore(s => s.preview);
  return !preview && kind === 'trip' ? <LiveTripCreate /> : <PreviewCreateScreen kind={kind} />;
}
function PreviewCreateScreen({ kind }: { kind: 'trip' | 'post' }) {
  const router = useRouter();
  const addTrip = useTravelStore(s => s.addTrip);
  const addPost = useTravelStore(s => s.addPost);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');
  function submit() {
    if (kind === 'trip') {
      const result = tripSchema.safeParse({ title, destination, start, end });
      if (!result.success) { setError('Add a trip name, destination, and valid YYYY-MM-DD dates. The end must be on or after the start.'); return; }
      addTrip({ title: result.data.title, destination: result.data.destination, dates: start + ' – ' + end });
      router.replace('/trips');
    } else {
      if (title.trim().length < 5 || !destination.trim()) { setError('Add a location and a caption of at least 5 characters.'); return; }
      addPost({ caption: title.trim(), place: destination.trim() });
      router.replace('/explore');
    }
  }
  return <Page>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={ui.header}><IconButton icon="arrow-left" label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} /></View>
    <Text style={ui.title}>{kind === 'trip' ? 'Let’s get out there.' : 'A moment worth keeping.'}</Text>
    <Text style={[ui.body, { marginVertical: 17 }]}>{kind === 'trip' ? 'Give your next adventure a little shape. Leave room for the unexpected.' : 'Share a thought from your travels. A sample cover photo is used for this preview.'}</Text>
    <View style={{ gap: 15 }}>
      <FormField label={kind === 'trip' ? 'Trip name' : 'Your travel moment'} icon={kind === 'trip' ? 'map' : 'edit-3'} value={title} onChangeText={setTitle} multiline={kind === 'post'} autoCapitalize="sentences" />
      <FormField label="Destination" icon="map-pin" value={destination} onChangeText={setDestination} autoCapitalize="words" />
      {kind === 'trip' && <><FormField label="Start date · YYYY-MM-DD" icon="calendar" value={start} onChangeText={setStart} /><FormField label="End date · YYYY-MM-DD" icon="calendar" value={end} onChangeText={setEnd} /></>}
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error}</Text>}
      <Text style={ui.small}>Saved only in this preview session. Nothing is published or booked.</Text>
      <ActionButton label={kind === 'trip' ? 'Save my plan' : 'Add to my preview feed'} onPress={submit} />
    </View>
  </Page>;
}
