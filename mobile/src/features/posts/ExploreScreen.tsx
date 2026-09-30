import { useQuests } from '@/features/sidequests/useQuests';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Chips, EmptyState, Header, Page, SearchBox, Section, ui } from '@/components/travel/Primitives';
import { QuestRow } from '@/components/travel/Cards';
import { quests, travelImages } from '@/features/travel/data';
import { useTravelStore } from '@/stores/useTravelStore';
import { TravelPostCard, type PreviewPost } from './TravelPostCard';

const posts: PreviewPost[] = [
  { id: 'lake-post', author: 'Sofia Carter', location: 'Lake Como, Italy', image: travelImages.lake, avatar: travelImages.sofia, caption: 'Still finding places that feel unreal. Lake Como, you have my heart. 💚' },
  { id: 'hike-post', author: 'Emma Chen', location: 'A morning in the mountains', image: travelImages.hike, avatar: travelImages.emma, caption: 'The best kind of plans? A trail, a sunrise, and good company.' },
  { id: 'food-post', author: 'Alex Rivera', location: 'Barcelona, Spain', image: travelImages.food, avatar: travelImages.alex, caption: 'Follow the locals. There’s always something delicious around the next corner.' },
];
export default function ExploreScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('For You');
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const localPosts = useQuests().posts;
  const name = useTravelStore(s => s.profile.name);
  const base = filter === 'Food' || filter === 'Nearby' ? [posts[2]] : filter === 'Nature' || filter === 'Friends' ? [posts[1]] : [posts[0]];
  const shown = [...localPosts.map(p => ({ id: p.id, author: name, location: p.place, caption: p.caption, image: p.photoUri, gallery: [p.photoUri], questTitle: p.questTitle, avatar: travelImages.alex })), ...base].filter(p => (p.caption + p.location + p.author).toLowerCase().includes(query.toLowerCase()));
  return <Page>
    <Header title="Explore" onPress={() => setSearch(!search)} />
    {search && <SearchBox value={query} onChange={setQuery} placeholder="Search travel inspiration…" />}
    <Chips segmented options={['Travel Photos', 'SideQuests']} selected="Travel Photos" onSelect={v => v === 'SideQuests' && router.navigate('/sidequests')} />
    <Chips options={['For You', 'Friends', 'Nearby', 'Food', 'Nature']} selected={filter} onSelect={setFilter} />
    {shown.map(post => <TravelPostCard key={post.id} post={post} />)}
    {!shown.length && <EmptyState title="No moments found" message="Try a destination, name, or a different category." />}
    <Section title="Recommended SideQuests" onPress={() => router.navigate('/sidequests')} />
    <View style={[ui.card, { paddingHorizontal: 11 }]}>{quests.slice(4).concat(quests.slice(1, 2)).map(quest => <QuestRow key={quest.id} quest={quest} />)}</View>
    <Section title="Better together" action="Find people" onPress={() => router.navigate('/companions')} />
    <Text style={ui.body}>Find someone who’s just as curious as you are.</Text>
  </Page>;
}
