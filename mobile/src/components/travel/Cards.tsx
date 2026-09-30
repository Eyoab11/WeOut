import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useTravelStore } from '@/stores/useTravelStore';
import { type Place, type Quest } from '@/features/travel/data';
import { IconButton, Tag, ui } from './Primitives';

export function PlaceCard({ place }: { place: Place }) {
  const router = useRouter();
  const saved = useTravelStore(s => s.saved.includes(place.id));
  const toggle = useTravelStore(s => s.toggleSave);
  return <View style={[ui.card, { width: 145 }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={'View ' + place.name} onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}>
      <Image source={place.image} style={{ width: '100%', height: 105 }} contentFit="cover" />
      <View style={{ padding: 9, gap: 4 }}><Text numberOfLines={1} style={styles.placeTitle}>{place.name}</Text><Text style={ui.small}>{place.distance} · Great for a detour</Text><Tag>{place.tag}</Tag></View>
    </Pressable>
    <View style={styles.bookmark}><IconButton icon={saved ? 'check' : 'heart'} active={saved} label={saved ? 'Unsave place' : 'Save place'} onPress={() => toggle(place.id)} /></View>
  </View>;
}
export function QuestRow({ quest }: { quest: Quest }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sidequest/[id]', params: { id: quest.id } })} style={styles.questRow}>
    <Image source={quest.image} style={styles.thumb} /><View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}><Text style={styles.questTitle}>{quest.title}</Text><Tag warm={quest.category === 'Food'}>{quest.tag}</Tag></View>
      <Text numberOfLines={2} style={ui.small}>{quest.description}</Text><QuestMeta quest={quest} />
    </View><Feather name="chevron-right" size={17} color={colors.muted} />
  </Pressable>;
}
export function QuestMeta({ quest }: { quest: Quest }) {
  return <View style={[ui.row, { gap: 16 }]}><Text style={styles.xp}>✦ +{quest.xp} XP</Text><Text style={ui.small}>⌖ {quest.distance}</Text></View>;
}
export function FeaturedQuest({ quest }: { quest: Quest }) {
  const router = useRouter();

  return <View style={[ui.card, { marginTop: 10 }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={'View ' + quest.title} onPress={() => router.push({ pathname: '/sidequest/[id]', params: { id: quest.id } })}>
      <Image source={quest.image} style={{ width: '100%', height: 205 }} contentFit="cover" />
      <View style={styles.featureBadge}><Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>✦ FEATURED</Text></View>
    </Pressable>
    <View style={{ padding: 13, gap: 6 }}>
      <Text style={[ui.sectionTitle, { fontSize: 16 }]}>{quest.title}</Text>
      <Text style={ui.body}>{quest.description}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
        <QuestMeta quest={quest} />
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sidequest/[id]', params: { id: quest.id } })} style={styles.start}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>{'View Quest'}</Text>
        </Pressable>
      </View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  placeTitle: { fontSize: 11, fontWeight: '700', color: colors.ink },
  bookmark: { position: 'absolute', right: 1, top: 1, borderRadius: 22, backgroundColor: '#FFFFFFBC', transform: [{ scale: 0.8 }] },
  questRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderColor: '#EDF0EC' },
  thumb: { width: 78, height: 83, borderRadius: 11 },
  questTitle: { fontSize: 12, fontWeight: '700', color: colors.ink },
  xp: { color: '#E6912E', fontSize: 11, fontWeight: '700' },
  featureBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.leaf, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 7 },
  start: { backgroundColor: colors.leaf, borderRadius: 18, paddingHorizontal: 15, minHeight: 38, justifyContent: 'center' },
});
