import DiscoveryScreen from '@/features/discovery/DiscoveryScreen';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Chips, EmptyState, Header, IconButton, Page, Sheet, Tag, ui } from '@/components/travel/Primitives';
import { ActionButton } from '@/components/ui/ActionButton';
import { travelers } from '@/features/travel/data';
import { useTravelStore } from '@/stores/useTravelStore';
import { colors } from '@/constants/theme';

export default function CompanionScreen() {
  const preview = useTravelStore(s => s.preview);
  return preview ? <PreviewCompanionScreen /> : <DiscoveryScreen companions />;
}
function PreviewCompanionScreen() {
  const [tab, setTab] = useState('Places');
  const [destination, setDestination] = useState('Anywhere');
  const [interest, setInterest] = useState('Any style');
  const [quest, setQuest] = useState('Any quest');
  const [filters, setFilters] = useState(false);
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const saved = useTravelStore(s => s.saved);
  const connections = useTravelStore(s => s.connections);
  const connect = useTravelStore(s => s.connect);
  const toggleSave = useTravelStore(s => s.toggleSave);
  const candidates = travelers.filter(p => (destination === 'Anywhere' || p.destinations.includes(destination)) && (interest === 'Any style' || p.interests.includes(interest)) && (quest === 'Any quest' || p.quests.includes(quest)));
  const person = candidates[index % (candidates.length || 1)];
  function next(direction = 1) { setNotice(''); setIndex(i => (i + direction + Math.max(candidates.length, 1)) % Math.max(candidates.length, 1)); }
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 24 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
    onPanResponderRelease: (_, gesture) => { if (Math.abs(gesture.dx) > 55) { setNotice(''); setIndex(i => (i + (gesture.dx < 0 ? 1 : -1) + Math.max(candidates.length, 1)) % Math.max(candidates.length, 1)); } },
  }), [candidates.length]);
  const options = tab === 'Places' ? ['Anywhere', 'Japan', 'Iceland', 'Italy'] : tab === 'Preferences' ? ['Any style', 'Hiking', 'Food', 'Photography', 'Culture'] : ['Any quest', 'Hidden Beaches', 'Local Food', 'Sunrise Hikes'];
  return <Page>
    <Header title="Companion Finder" icon="sliders" onPress={() => setFilters(true)} />
    <Chips segmented options={['Places', 'Preferences', 'SideQuests']} selected={tab} onSelect={setTab} />
    <Chips options={options} selected={tab === 'Places' ? destination : tab === 'Preferences' ? interest : quest} onSelect={v => { setIndex(0); setNotice(''); if (tab === 'Places') setDestination(v); else if (tab === 'Preferences') setInterest(v); else setQuest(v); }} />
    {person ? <Animated.View key={person.id} entering={FadeInRight.duration(350)} style={[ui.card, { marginTop: 7 }]}>
      <View {...pan.panHandlers} style={{ height: 355 }}>
        <Image source={person.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        <LinearGradient colors={['transparent', '#0E241ADC']} locations={[0.28, 1]} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        <View style={{ position: 'absolute', left: 12, top: 12, backgroundColor: '#F5FCF8', padding: 8, borderRadius: 18 }}><Text style={{ fontSize: 11, color: '#2B6A61', fontWeight: '700' }}>◉ {person.match}% Match</Text></View>
        <Text style={{ position: 'absolute', right: 14, top: 17, fontSize: 10, color: 'white' }}>{index % candidates.length + 1}/{candidates.length}</Text>
        <View style={{ position: 'absolute', bottom: 15, left: 14, right: 14, gap: 7 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', letterSpacing: -0.6 }}>{person.name}, {person.age} <Feather name="check-circle" size={16} color="#8BDFB7" /></Text>
          <Text style={{ color: '#E8F3E9', fontSize: 11 }}>⌖ {person.city}</Text>
          <Text style={{ color: '#E8F3E9', fontSize: 12, lineHeight: 17 }}>{person.bio}</Text>
          <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>{person.interests.map(item => <View key={item} style={{ padding: 6, backgroundColor: '#357251DF', borderRadius: 12 }}><Text style={{ fontSize: 8, color: 'white' }}>{item}</Text></View>)}</View>
        </View>
      </View>
      <View style={{ padding: 12, flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 6 }}><Text style={ui.small}>Dream Destinations</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>{person.destinations.map(d => <Tag key={d}>{d}</Tag>)}</View></View>
        <View style={{ flex: 1, gap: 6 }}><Text style={ui.small}>SideQuests I Want To Do</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>{person.quests.map(q => <Tag key={q}>{q}</Tag>)}</View></View>
      </View>
      <View style={[ui.row, { paddingHorizontal: 13, paddingBottom: 12 }]}>
        <IconButton icon="x" label="Skip to next traveler" onPress={() => next()} />
        <IconButton icon={saved.includes('traveler:' + person.id) ? 'check' : 'bookmark'} label="Save traveler" active={saved.includes('traveler:' + person.id)} onPress={() => toggleSave('traveler:' + person.id)} />
        <View style={{ flex: 1 }}><ActionButton label={connections.includes(person.id) ? 'Requested' : 'Connect'} icon={connections.includes(person.id) ? 'check' : 'user-plus'} onPress={() => { connect(person.id); setNotice('Connection saved in this preview. No request has been sent.'); }} /></View>
      </View>
    </Animated.View> : <EmptyState title="Try a different adventure" message="No preview travelers match these filters. Change a filter or reset them." />}
    {!!notice && <Text accessibilityLiveRegion="polite" style={[ui.body, { marginTop: 10, color: colors.leaf }]}>{notice}</Text>}
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}><IconButton icon="chevron-left" label="Previous traveler" onPress={() => next(-1)} /><Text style={ui.small}>Preview travelers · swipe to explore</Text><IconButton icon="chevron-right" label="Next traveler" onPress={() => next()} /></View>
    <Sheet title="Your kind of company" visible={filters} onClose={() => setFilters(false)}>
      <Text style={ui.sectionTitle}>Dream destination</Text><Chips options={['Anywhere', 'Japan', 'Iceland', 'Italy']} selected={destination} onSelect={setDestination} />
      <Text style={ui.sectionTitle}>Travel style</Text><Chips options={['Any style', 'Hiking', 'Food', 'Photography', 'Culture']} selected={interest} onSelect={setInterest} />
      <ActionButton label="Show travelers" onPress={() => { setIndex(0); setFilters(false); }} />
      <Pressable onPress={() => { setDestination('Anywhere'); setInterest('Any style'); setQuest('Any quest'); setIndex(0); }} style={ui.textButton}><Text style={[ui.link, { textAlign: 'center' }]}>Reset filters</Text></Pressable>
    </Sheet>
  </Page>;
}
