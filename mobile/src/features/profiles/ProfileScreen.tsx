import { useQuests } from '@/features/sidequests/useQuests';
import { StreakCard } from '@/features/sidequests/StreakCard';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { IconButton, Page, Section, Sheet, Tag, ui } from '@/components/travel/Primitives';
import { QuestRow } from '@/components/travel/Cards';
import { places, quests, travelImages } from '@/features/travel/data';
import { useTravelStore } from '@/stores/useTravelStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useTravelStore(s => s.profile);
  const saved = useTravelStore(s => s.saved);
  const progress = useQuests();
  const active = progress.started.filter(id => !progress.completed[id] && (!id.startsWith('daily-') || id === progress.daily.id));
  const connections = useTravelStore(s => s.connections);
  const trips = useTravelStore(s => s.trips);
  const preview = useTravelStore(s => s.preview);
  const edit = useTravelStore(s => s.editProfile);
  const reset = useTravelStore(s => s.reset);
  const [sheet, setSheet] = useState<'edit' | 'settings' | 'memories' | 'quests' | null>(null);
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function leave() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (supabase) { const { error: authError } = await supabase.auth.signOut(); if (authError) throw authError; }
      reset(); setSheet(null); router.replace('/welcome');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not sign out. Try again.'); }
    finally { setBusy(false); }
  }
  async function chooseAvatar() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) edit({ ...profile, avatar: result.assets[0].uri });
    } catch {
      setDraft(profile); setError('Could not open your photos. Please try again.'); setSheet('edit');
    }
  }
  function editProfile() { setDraft(profile); setError(''); setSheet('edit'); }
  return <Page>
    <View style={{ height: 156, marginHorizontal: -18 }}>
      <Image source={travelImages.mountain} style={{ width: '100%', height: '100%' }} />
      <View style={{ position: 'absolute', top: 8, right: 12, backgroundColor: '#FFFFFFB8', borderRadius: 22 }}><IconButton icon="settings" label="Profile settings" onPress={() => { setError(''); setSheet('settings'); }} /></View>
    </View>
    <View style={{ alignItems: 'center', marginTop: -39 }}>
      <View style={{ borderWidth: 4, borderColor: 'white', borderRadius: 60 }}><Image source={profile.avatar ? { uri: profile.avatar } : travelImages.alex} style={{ width: 86, height: 86, borderRadius: 50 }} /><Pressable accessibilityRole="button" accessibilityLabel="Choose a profile photo" onPress={chooseAvatar} style={{ position: 'absolute', right: -9, bottom: -3, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><View style={{ backgroundColor: colors.leaf, borderRadius: 15, padding: 7, borderWidth: 2, borderColor: 'white' }}><Feather name="camera" size={13} color="white" /></View></Pressable></View>
      <Text style={{ fontSize: 23, fontWeight: '700', color: colors.ink, marginTop: 9, letterSpacing: -0.7 }}>{profile.name}</Text>
      <Text style={ui.small}>⌖ Barcelona, Spain {preview ? '· Preview profile' : ''}</Text>
      <Text style={[ui.small, { textAlign: 'center', paddingHorizontal: 25, marginTop: 8, lineHeight: 17 }]}>{profile.bio}</Text>
      <Pressable accessibilityRole="button" onPress={editProfile} style={{ paddingHorizontal: 22, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 15, marginTop: 10, minHeight: 36, justifyContent: 'center' }}><Text style={{ fontSize: 11, color: colors.muted }}>Edit Profile</Text></Pressable>
    </View>
    <View style={[ui.card, { flexDirection: 'row', marginTop: 17, paddingVertical: 15 }]}>
      {[{ value: saved.length, label: 'Saved' }, { value: Object.keys(progress.completed).length, label: 'SideQuests' }, { value: connections.length, label: 'Connections' }, { value: trips.length, label: 'Trips' }].map((stat, i) => <View key={stat.label} style={{ flex: 1, alignItems: 'center', gap: 4, borderRightWidth: i < 3 ? 1 : 0, borderColor: colors.line }}><Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{stat.value}</Text><Text style={{ fontSize: 9, color: colors.muted }}>{stat.label}</Text></View>)}
    </View>
    <StreakCard /><Section title="My Travel Style" action="Edit" onPress={editProfile} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{profile.style.map(t => <Tag key={t}>{t}</Tag>)}</View>
    <Section title="Recent Travel Memories" onPress={() => setSheet('memories')} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{[travelImages.coast, travelImages.hike, travelImages.lake, travelImages.city].map((image, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={'Open inspiration photo ' + (i + 1)} onPress={() => setSheet('memories')}><Image source={image} style={{ width: 99, height: 93, borderRadius: 12 }} /></Pressable>)}</ScrollView>
    <Text style={[ui.small, { marginTop: 6 }]}>A little inspiration for your next chapter.</Text>
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
      <Pressable accessibilityRole="button" onPress={() => setSheet('quests')} style={[ui.card, { padding: 13, flex: 1, gap: 8 }]}><Feather name="award" size={22} color={colors.leaf} /><Text style={ui.small}>Your active SideQuests</Text><Text style={ui.sectionTitle}>{active.length} <Text style={ui.link}> View all ›</Text></Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/trips')} style={[ui.card, { padding: 13, flex: 1, gap: 8 }]}><Feather name="map" size={22} color={colors.leaf} /><Text style={ui.small}>Your next adventure</Text><Text style={ui.sectionTitle}>{trips[0]?.destination || 'Barcelona'} ›</Text></Pressable>
    </View>
    <Sheet title={sheet === 'edit' ? 'Make it yours' : sheet === 'settings' ? 'Your account' : sheet === 'quests' ? 'Your active SideQuests' : 'Places worth remembering'} visible={!!sheet} onClose={() => setSheet(null)}>
      {sheet === 'edit' ? <>
        <Text style={ui.body}>Profile edits are saved for this preview session.</Text>
        <FormField label="Display name" icon="user" value={draft.name} onChangeText={name => setDraft(p => ({ ...p, name }))} autoCapitalize="words" />
        <FormField label="Username" icon="at-sign" value={draft.username} onChangeText={username => setDraft(p => ({ ...p, username }))} />
        <FormField label="A little about you" icon="edit-3" value={draft.bio} onChangeText={bio => setDraft(p => ({ ...p, bio }))} multiline />
        <Text style={ui.sectionTitle}>Your travel style</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{['Adventure', 'Local Food', 'Hidden Gems', 'Nature', 'Culture', 'Sustainable Travel', 'Meet People'].map(t =>
          <Pressable key={t} accessibilityRole="checkbox" accessibilityState={{ checked: draft.style.includes(t) }} onPress={() => setDraft(p => ({ ...p, style: p.style.includes(t) ? p.style.filter(v => v !== t) : [...p.style, t] }))} style={{ padding: 11, borderRadius: 18, backgroundColor: draft.style.includes(t) ? colors.leaf : colors.mint }}><Text style={{ fontSize: 11, color: draft.style.includes(t) ? 'white' : colors.green }}>{t}</Text></Pressable>
        )}</View>
        <ActionButton label="Save profile" onPress={() => {
          if (draft.name.trim().length < 2 || !/^[a-z0-9_]{3,30}$/.test(draft.username)) { setError('Add a name and a username with 3–30 lowercase letters, numbers or underscores.'); return; }
          edit({ ...draft, name: draft.name.trim() }); setSheet(null);
        }} />
      </> : sheet === 'settings' ? <>
        <Text style={ui.body}>Travel content and social interactions are a local preview. Your saved places and plans last for this app session.</Text>
        <ActionButton label={busy ? 'Signing out…' : preview ? 'Leave preview' : 'Sign out'} disabled={busy} icon="log-out" onPress={leave} />
      </> : sheet === 'quests' ? <>{progress.all.filter(q => active.includes(q.id)).map(q => <QuestRow key={q.id} quest={q} />)}{!active.length && <Text style={ui.body}>Pick a SideQuest in Explore to begin your next little adventure.</Text>}</> : <>{places.map(p => <Pressable key={p.id} onPress={() => { setSheet(null); router.push({ pathname: '/place/[id]', params: { id: p.id } }); }} style={{ gap: 8 }}><Image source={p.image} style={{ width: '100%', height: 170, borderRadius: 14 }} /><Text style={ui.sectionTitle}>{p.name}</Text></Pressable>)}</>}
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>{error}</Text>}
    </Sheet>
  </Page>;
}
