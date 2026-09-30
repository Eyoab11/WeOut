import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { ActionButton } from '@/components/ui/ActionButton';
import { Chips, EmptyState, Header, Page, SearchBox, Section, Sheet, Tag, ui } from '@/components/travel/Primitives';
import { FeaturedQuest, QuestRow } from '@/components/travel/Cards';
import { colors } from '@/constants/theme';
import { CATEGORIES } from './model';
import { useQuests } from './useQuests';
import { StreakCard } from './StreakCard';
export default function SideQuestsScreen() {
  const router = useRouter();
  const q = useQuests();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<'actions' | 'people' | null>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const filtered = q.all.filter(quest => quest.kind !== 'daily' && (category === 'All' || quest.category === category) && (quest.title + quest.description).toLowerCase().includes(query.toLowerCase()));
  const featured = filtered[featuredIndex % (filtered.length || 1)];
  const joined = q.started.includes(q.daily.id);
  async function join() {
    if (joining) return;
    setJoining(true); setError('');
    try { await q.start(q.daily); } catch(e) { setError(e instanceof Error ? e.message : 'Could not join. Try again.'); }
    finally { setJoining(false); }
  }
  return <View style={{ flex: 1 }}>
    <Page>
      <Header title="SideQuests" onPress={() => setSearch(!search)} />
      <StreakCard />
      <View style={[ui.card, { padding: 17, backgroundColor: '#E8F1EA', gap: 10 }]}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><Tag>DAILY · SAME CHALLENGE FOR EVERYONE</Tag><Feather name="sun" size={21} color={colors.leaf} /></View>
        <Text style={[ui.sectionTitle, { fontSize: 21 }]}>{q.daily.title}</Text>
        <Text style={ui.body}>{q.daily.description}</Text>
        <Text style={ui.small}>{q.day} · resets at 00:00 UTC · photo proof required</Text>
        <Pressable accessibilityRole="button" onPress={() => setSheet('people')} style={[ui.row, { minHeight: 42 }]}>
          <View style={{ flexDirection: 'row' }}>{q.participants.slice(0, 4).map((p, i) => <View key={i} style={{ width: 29, height: 29, borderRadius: 18, backgroundColor: colors.leaf, borderWidth: 2, borderColor: '#E8F1EA', marginLeft: i ? -7 : 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 11 }}>{p.name.slice(0, 1).toUpperCase()}</Text></View>)}</View>
          <Text style={ui.link}>{q.participantCount} taking part · View people ›</Text>
        </Pressable>
        {q.completed[q.daily.id] ? <Text style={{ color: colors.green, fontWeight: '700' }}>✓ Completed with your photo</Text> :
          <ActionButton label={joining ? 'Joining…' : joined ? 'Post photo & finish' : 'I’m doing this'} disabled={!q.ready || joining}
            icon={joined ? 'camera' : 'user-plus'} onPress={() => joined ? router.push({ pathname: '/post/create', params: { questId: q.daily.id } }) : void join()} />}
        <Text style={ui.small}>{q.live ? 'Joining makes your display name visible to other participants.' : 'Local preview: only your participation is shown. Community participants appear when using a connected account.'}</Text>
      </View>
      {!!error && <Text accessibilityLiveRegion="polite" style={{ color: colors.error, marginTop: 8 }}>{error}</Text>}
      {q.error && <Pressable onPress={() => void q.refresh()} style={ui.textButton}><Text style={{ color: colors.error }}>Could not load shared quests. Tap to retry.</Text></Pressable>}
      {search && <SearchBox value={query} onChange={setQuery} placeholder="Find your next SideQuest…" />}
      <Chips options={['All', ...CATEGORIES]} selected={category} onSelect={v => { setCategory(v); setFeaturedIndex(0); }} />
      {featured ? <FeaturedQuest quest={featured} /> : <EmptyState title={q.ready ? 'Make the first move' : 'Loading your quests…'} message="Choose another category or add a SideQuest of your own." />}
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>{filtered.slice(0, 10).map((quest, i) => <Pressable key={quest.id} accessibilityRole="button" accessibilityLabel={'Feature ' + quest.title} accessibilityState={{ selected: featured?.id === quest.id }} onPress={() => setFeaturedIndex(i)} style={{ width: 28, minHeight: 34, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: featured?.id === quest.id ? 12 : 4, height: 4, borderRadius: 4, backgroundColor: featured?.id === quest.id ? colors.leaf : '#D2DAD3' }} /></Pressable>)}</View>
      {!!q.started.length && <><Section title="Your active quests" /><View style={[ui.card, { paddingHorizontal: 12 }]}>{q.all.filter(quest => q.started.includes(quest.id) && !q.completed[quest.id] && (quest.kind !== 'daily' || quest.day === q.day)).map(quest => <QuestRow key={quest.id} quest={quest} />)}</View></>}
      <Section title="Discover more" action="All categories" onPress={() => { setCategory('All'); setQuery(''); }} />
      <View style={[ui.card, { paddingHorizontal: 12 }]}>{filtered.filter(quest => quest.id !== featured?.id).map(quest => <QuestRow key={quest.id} quest={quest} />)}</View>
      {!!Object.keys(q.completed).length && <><Section title="Completed adventures" />{q.all.filter(quest => q.completed[quest.id]).map(quest => <QuestRow key={quest.id} quest={quest} />)}</>}
      <View style={{ height: 85 }} />
    </Page>
    <View style={{ position: 'absolute', right: 22, bottom: 20, borderRadius: 40, padding: 4, backgroundColor: '#FBFCFA', boxShadow: '0 5px 22px #123D3030' }}>
      <ActionButton circle icon="plus" label="Create or generate a SideQuest" onPress={() => setSheet('actions')} />
    </View>
    <Sheet title={sheet === 'people' ? 'Doing this together' : 'Find your next little adventure'} visible={!!sheet} onClose={() => setSheet(null)}>
      {sheet === 'actions' ? <>
        <ActionButton icon="zap" label="Generate a SideQuest" onPress={() => { setSheet(null); router.push({ pathname: '/sidequest/create', params: { mode: 'generate' } }); }} />
        <ActionButton icon="edit-3" label="Add your own SideQuest" onPress={() => { setSheet(null); router.push({ pathname: '/sidequest/create', params: { mode: 'custom' } }); }} />
      </> : <>
        <Text style={ui.body}>{q.live ? 'Travelers taking part in today’s shared challenge. Showing up to 100 participants.' : 'This is your local participation list. No sample people or invented counts are included.'}</Text>
        {q.participants.map((person, i) => <View key={i} style={[ui.card, { padding: 14, flexDirection: 'row', justifyContent: 'space-between' }]}><Text style={ui.sectionTitle}>{person.name}</Text><Text style={ui.small}>{person.completed ? 'Photo posted ✓' : 'Taking part'}</Text></View>)}
        {!q.participants.length && <Text style={ui.body}>Be the first to take part.</Text>}
      </>}
    </Sheet>
  </View>;
}
