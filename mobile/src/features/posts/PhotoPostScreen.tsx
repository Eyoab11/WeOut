import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { IconButton, Page, Tag, ui } from '@/components/travel/Primitives';
import { colors } from '@/constants/theme';
import { newQuestId, useQuests } from '@/features/sidequests/useQuests';
import { keepPhoto } from '@/features/sidequests/photoStorage';
export default function PhotoPostScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const q = useQuests();
  const quest = q.all.find(item => item.id === questId);
  const router = useRouter();
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [place, setPlace] = useState('');
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const requestId = useRef(newQuestId());
  async function choose(camera: boolean) {
    if (busy || processing) return;
    setProcessing(true); setError('');
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) throw new Error('Camera permission is needed to take a photo. You can also choose one from your library.');
      }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const context = ImageManipulator.manipulate(asset.uri);
      if (asset.width > 1440) context.resize({ width: 1440 });
      const rendered = await context.renderAsync();
      const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
      if (!image.base64) throw new Error('Could not prepare that image. Choose another photo.');
      if (image.base64.length * 0.75 > 8 * 1024 * 1024) throw new Error('That photo is too large. Choose one under 8 MB.');
      requestId.current = newQuestId(); setPhoto({ uri: image.uri, base64: image.base64 });
    } catch(e) { setError(e instanceof Error ? e.message : 'Could not open your photo.'); }
    finally { setProcessing(false); }
  }
  async function publish() {
    if (lock.current) return;
    if (!photo) { setError('Add your own photo to continue.'); return; }
    if (caption.trim().length < 5 || !place.trim()) { setError('Add a caption of at least 5 characters and a location.'); return; }
    if (questId && !quest) { setError('This quest is unavailable. Go back and choose an active quest.'); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      const photoUri = q.live ? photo.uri : await keepPhoto(photo.uri, photo.base64, requestId.current);
      await q.publish({ id: requestId.current, caption: caption.trim(), place: place.trim(), photoUri,
        createdAt: new Date().toISOString(), ...(quest ? { questId: quest.id, questTitle: quest.title } : {}) }, photo.base64, quest);
      router.replace(quest ? '/sidequests' : '/explore');
    } catch(e) { setError(e instanceof Error ? e.message : 'Your photo was not posted. Try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page><Stack.Screen options={{ headerShown: false }} />
    <View style={ui.header}><IconButton icon="arrow-left" label="Go back" onPress={() => router.back()} />{quest && <Tag>PHOTO PROOF</Tag>}</View>
    <Text style={ui.title}>{questId ? 'Show your adventure.' : 'A moment worth keeping.'}</Text>
    <Text style={[ui.body, { marginVertical: 15 }]}>{quest ? 'Finish “' + quest.title + '” by posting a photo of yourself doing the challenge, or the result of your activity.' : 'Post your own travel photo. It counts toward today’s adventure streak.'}</Text>
    {!!questId && !quest && <Text style={{ color: colors.error }}>{q.ready ? 'This quest is no longer available.' : 'Loading your quest…'}</Text>}
    {photo ? <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 260, borderRadius: 18, marginBottom: 12 }} /> :
      <View style={[ui.card, { height: 185, alignItems: 'center', justifyContent: 'center', gap: 10, borderStyle: 'dashed' }]}><Feather name="camera" size={34} color={colors.leaf} /><Text style={ui.body}>Your photo belongs here</Text></View>}
    <View style={[ui.row, { marginVertical: 12 }]}>
      <Pressable accessibilityRole="button" disabled={busy || processing} onPress={() => void choose(true)} style={[ui.card, { padding: 15, flex: 1, alignItems: 'center' }]}><Text style={{ color: colors.green }}>Take photo</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={busy || processing} onPress={() => void choose(false)} style={[ui.card, { padding: 15, flex: 1, alignItems: 'center' }]}><Text style={{ color: colors.green }}>Choose photo</Text></Pressable>
    </View>
    {processing && <Text style={ui.small}>Preparing your photo…</Text>}
    <View style={{ gap: 15 }}>
      <FormField label="What did you discover?" icon="edit-3" value={caption} onChangeText={setCaption} multiline autoCapitalize="sentences" maxLength={2000} editable={!busy} />
      <FormField label="Location or destination" icon="map-pin" value={place} onChangeText={setPlace} autoCapitalize="words" maxLength={200} editable={!busy} />
      <Text style={ui.small}>{q.live ? 'Your photo post is visible to signed-in travelers.' : 'Saved on this device, including your photo and streak.'} A photo is required; this does not automatically verify what the image depicts.</Text>
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error}</Text>}
      <ActionButton label={busy ? 'Posting…' : questId ? 'Post photo & complete quest' : 'Post travel photo'} icon="camera" disabled={busy || processing || !q.ready || (!!questId && !quest)} onPress={() => void publish()} />
    </View>
  </Page>;
}
