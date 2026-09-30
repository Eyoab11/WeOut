import { currentCoordinates } from '@/features/discovery/useDiscovery';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { Chips, IconButton, Page, Tag, ui } from '@/components/travel/Primitives';
import { colors } from '@/constants/theme';
import { CATEGORIES, generateQuest, questSchema, type Category } from './model';
import { newQuestId, useQuests } from './useQuests';
import { useTravelStore } from '@/stores/useTravelStore';
export default function CreateQuestScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const generated = mode === 'generate';
  const router = useRouter();
  const q = useQuests();
  const style = useTravelStore(s => s.profile.style);
  const [category, setCategory] = useState<Category>(CATEGORIES.find(c => style.includes(c)) || 'Adventure');
  const [minutes, setMinutes] = useState('20');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachLocation, setAttachLocation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function generate() {
    const quest = generateQuest(category, Number(minutes));
    setTitle(quest.title); setDescription(quest.description); setError('');
  }
  async function save() {
    if (busy) return;
    const result = questSchema.safeParse({ title, description, category, minutes });
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setBusy(true); setError('');
    try {
      const coordinates = attachLocation && q.live ? await currentCoordinates() : {};
      const kind = generated ? 'generated' : 'custom';
      await q.add({ ...result.data, ...coordinates, id: kind + '-' + newQuestId(), kind, tag: generated ? 'FOR YOU' : 'COMMUNITY', xp: Math.min(150, 50 + Number(minutes)), distance: 'Your area' });
      router.replace('/sidequests');
    } catch(e) { setError(e instanceof Error ? e.message : 'Could not save your quest. Try again.'); }
    finally { setBusy(false); }
  }
  return <Page><Stack.Screen options={{ headerShown: false }} />
    <View style={ui.header}><IconButton icon="arrow-left" label="Go back" onPress={() => router.back()} /><Tag>{generated ? 'MADE FOR YOUR DAY' : 'YOUR IDEA, YOUR ADVENTURE'}</Tag></View>
    <Text style={ui.title}>{generated ? 'A little inspiration.' : 'Create a SideQuest.'}</Text>
    <Text style={[ui.body, { marginVertical: 15 }]}>{generated ? 'Pick your mood and your time. We’ll build an idea from a curated collection for you to try.' : 'Give people something worth stepping outside for. Tell them what to do and what photo to share.'}</Text>
    <Text style={ui.sectionTitle}>Category</Text><Chips options={[...CATEGORIES]} selected={category} onSelect={v => setCategory(v as Category)} />
    <Text style={[ui.sectionTitle, { marginTop: 14 }]}>Time you have</Text><Chips options={['10', '20', '30', '60']} selected={minutes} onSelect={setMinutes} />
    {generated && <View style={{ marginVertical: 12 }}><ActionButton label={title ? 'Generate another idea' : 'Generate my SideQuest'} icon="zap" onPress={generate} /></View>}
    <View style={{ gap: 15, marginTop: 17 }}>
      <FormField label="SideQuest title" icon="edit-3" value={title} onChangeText={setTitle} autoCapitalize="sentences" maxLength={100} />
      <FormField label="What should someone do and photograph?" icon="file-text" value={description} onChangeText={setDescription} multiline autoCapitalize="sentences" maxLength={1000} />
      <Text style={ui.small}>Every completion requires a photo post. {q.live ? 'Your quest will appear for signed-in travelers.' : 'Your quest is saved on this device and appears in your SideQuests.'}</Text>
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error}</Text>}
      <View style={ui.row}><Text style={[ui.body, { flex: 1 }]}>Place this quest at my current location (visible to other travelers)</Text><Switch value={attachLocation} disabled={busy || !q.live} onValueChange={setAttachLocation} accessibilityLabel="Attach current location to quest" /></View>
      <ActionButton label={busy ? 'Adding…' : 'Add to SideQuests'} disabled={busy || !q.ready} onPress={save} />
    </View>
  </Page>;
}
