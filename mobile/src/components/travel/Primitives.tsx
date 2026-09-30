import { type ComponentProps, type PropsWithChildren } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/constants/theme';

export type IconName = ComponentProps<typeof Feather>['name'];
export function IconButton({ icon, label, onPress, active = false }: { icon: IconName; label: string; onPress: () => void; active?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={onPress}
    style={({ pressed }) => [ui.iconButton, pressed && { backgroundColor: colors.mint }]}>
    <Feather name={icon} size={21} color={active ? colors.leaf : colors.ink} />
  </Pressable>;
}
export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={ui.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
      <Animated.View entering={FadeInDown.duration(380)}>{children}</Animated.View>
    </ScrollView></KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Header({ title, icon = 'search', onPress }: { title: string; icon?: IconName; onPress?: () => void }) {
  return <View style={ui.header}><Text style={ui.title}>{title}</Text>{onPress && <IconButton icon={icon} label={icon === 'search' ? 'Search' : title + ' options'} onPress={onPress} />}</View>;
}
export function Chips({ options, selected, onSelect, segmented = false }: { options: string[]; selected: string; onSelect: (item: string) => void; segmented?: boolean }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[ui.chips, segmented && ui.segments]}>
    {options.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: selected === item }} onPress={() => onSelect(item)}
      style={[ui.chip, segmented && { flex: 1, borderWidth: 0 }, selected === item && { backgroundColor: colors.leaf, borderColor: colors.leaf }]}>
      <Text style={[ui.chipText, selected === item && { color: 'white' }]}>{item}</Text>
    </Pressable>)}
  </ScrollView>;
}
export function Tag({ children, warm = false }: PropsWithChildren<{ warm?: boolean }>) {
  return <View style={[ui.tag, warm && { backgroundColor: '#FFF0DE' }]}><Text style={[ui.tagText, warm && { color: '#AF7230' }]}>{children}</Text></View>;
}
export function Section({ title, action = 'See all', onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={ui.section}><Text style={ui.sectionTitle}>{title}</Text>{onPress && <Pressable accessibilityRole="button" onPress={onPress} style={ui.textButton}><Text style={ui.link}>{action} ›</Text></Pressable>}</View>;
}
export function SearchBox({ value, onChange, placeholder = 'Search places, people, or quests…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <View style={ui.search}><Feather name="search" size={17} color={colors.muted} /><TextInput accessibilityLabel={placeholder} placeholder={placeholder} placeholderTextColor={colors.muted} value={value} onChangeText={onChange} style={ui.searchInput} />
    {!!value && <IconButton icon="x" label="Clear search" onPress={() => onChange('')} />}
  </View>;
}
export function Sheet({ title, visible, onClose, children }: PropsWithChildren<{ title: string; visible: boolean; onClose: () => void }>) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ui.scrim}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close panel" style={StyleSheet.absoluteFill} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={ui.sheet} accessibilityViewIsModal>
        <View style={ui.handle} /><View style={ui.header}><Text style={ui.sheetTitle}>{title}</Text><IconButton icon="x" label="Close panel" onPress={onClose} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 18, gap: 14 }}>{children}</ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>;
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return <View style={ui.empty}><Feather name="compass" color={colors.leaf} size={30} /><Text style={ui.sectionTitle}>{title}</Text><Text style={[ui.body, { textAlign: 'center' }]}>{message}</Text></View>;
}
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FBFCFA' }, content: { paddingHorizontal: 18, paddingBottom: 24, width: '100%', maxWidth: 600, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -1.1, color: colors.ink },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  chips: { gap: 7, paddingVertical: 7, minWidth: '100%' }, segments: { backgroundColor: '#EDF3F4', borderRadius: 22, padding: 3, marginVertical: 4 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: '#E5EAE8', alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 11, color: '#50615D', fontWeight: '600' },
  tag: { backgroundColor: '#E7F1E9', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start' },
  tagText: { fontSize: 8, fontWeight: '600', color: '#38765C' },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 17, marginBottom: 9 },
  sectionTitle: { fontSize: 15, color: colors.ink, fontWeight: '700', letterSpacing: -0.4 },
  textButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 }, link: { color: '#448C98', fontSize: 11, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: 'white', paddingLeft: 12, marginVertical: 7 },
  searchInput: { flex: 1, minHeight: 43, minWidth: 0, paddingRight: 10, color: colors.ink, fontSize: 12 },
  card: { borderRadius: 17, backgroundColor: 'white', borderWidth: 1, borderColor: '#EBEFEB', overflow: 'hidden', boxShadow: '0 4px 16px #183C2807' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 }, small: { color: colors.muted, fontSize: 10, lineHeight: 16 },
  scrim: { flex: 1, backgroundColor: '#102C2860', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FBFCFA', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, maxHeight: '85%', width: '100%', maxWidth: 600, alignSelf: 'center' },
  handle: { width: 34, height: 4, backgroundColor: '#D7DFD8', borderRadius: 4, alignSelf: 'center', marginTop: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: colors.ink, flex: 1 },
  empty: { padding: 32, alignItems: 'center', gap: 12 },
});
