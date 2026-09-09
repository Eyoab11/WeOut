import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { FloatingArtwork } from '@/components/ui/FloatingArtwork';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/constants/theme';
import { PlacesArt, QuestArt, PeopleArt, JourneyArt } from './artwork';

const slides = [
  { title: 'Discover\nIncredible Places', description: 'Explore new destinations, hidden gems, and real experiences from travelers around the world.', Art: PlacesArt },
  { title: 'Complete\nSideQuests', description: 'Turn your travels into exciting challenges. Explore, capture, experience and earn rewards.', Art: QuestArt },
  { title: 'Meet\nAmazing People', description: 'Find travel companions who share your interests, destination and travel style.', Art: PeopleArt },
  { title: 'Make the World\nYour Next Story', description: 'Save a place. Make a plan. Say yes to something new. Your next adventure starts with WeOut.', Art: JourneyArt },
];
export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const list = useRef<FlatList>(null);
  const viewability = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActive(viewableItems[0].index);
  }).current;
  function next() {
    if (active === slides.length - 1) router.push('/signup');
    else list.current?.scrollToIndex({ index: active + 1, animated: !reduced });
  }
  return <SafeAreaView style={styles.page}>
    <View style={styles.top}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to welcome" onPress={() => router.back()} style={styles.textButton}><Text style={styles.back}>←</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.textButton}><Text style={styles.skip}>Skip</Text></Pressable>
    </View>
    <FlatList ref={list} data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      key={width} initialScrollIndex={active} keyExtractor={(item) => item.title}
      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      onViewableItemsChanged={viewability} viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      renderItem={({ item, index }) => <ScrollView style={{ width }} contentContainerStyle={styles.slide} showsVerticalScrollIndicator={false}>
        <View style={styles.copy}><Text style={styles.count}>0{index + 1} / 04</Text>
          <Text style={styles.title}>{item.title}</Text><Text style={styles.description}>{item.description}</Text></View>
        <Animated.View entering={FadeInDown.duration(650)} style={styles.art}><FloatingArtwork active={active === index}><item.Art /></FloatingArtwork></Animated.View>
      </ScrollView>} />
    <View style={styles.bottom}>
      <View style={styles.dots}>{slides.map((_, index) => <Pressable key={index} accessibilityRole="button"
        accessibilityLabel={`Go to introduction ${index + 1}`} accessibilityState={{ selected: active === index }}
        onPress={() => list.current?.scrollToIndex({ index, animated: !reduced })} style={styles.dotHit}>
        <View style={[styles.dot, active === index && styles.activeDot]} />
      </Pressable>)}</View>
      <ActionButton circle label={active === 3 ? 'Create your account' : 'Next introduction'} onPress={next} />
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  textButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  back: { fontSize: 25, color: colors.ink }, skip: { fontSize: 13, fontWeight: '500', color: colors.ink },
  slide: { flexGrow: 1, paddingHorizontal: 28, maxWidth: 520, width: '100%', alignSelf: 'center' },
  copy: { paddingTop: 18 }, count: { fontSize: 11, color: colors.leaf, fontWeight: '600', letterSpacing: 1.5, marginBottom: 18 },
  title: { fontSize: 33, lineHeight: 38, fontWeight: '700', color: colors.ink, letterSpacing: -1.1 },
  description: { fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 16, maxWidth: 330 },
  art: { flex: 1, justifyContent: 'center', paddingTop: 16, paddingBottom: 6 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingBottom: 20, paddingTop: 6, width: '100%', maxWidth: 520, alignSelf: 'center' },
  dots: { flexDirection: 'row' }, dotHit: { width: 24, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#CBD4CD' },
  activeDot: { width: 8, backgroundColor: colors.green },
});
