import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import { ActionButton } from '@/components/ui/ActionButton';
import { Sheet, ui, type IconName } from './Primitives';

const tabs: { name: string; href: '/home' | '/explore' | '/trips' | '/profile'; icon: IconName }[] = [
  { name: 'Home', href: '/home', icon: 'home' }, { name: 'Explore', href: '/explore', icon: 'compass' },
  { name: 'Trips', href: '/trips', icon: 'briefcase' }, { name: 'Profile', href: '/profile', icon: 'user' },
];
export function AppTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const renderTab = (tab: typeof tabs[number]) => {
    const active = pathname === tab.href || (tab.name === 'Explore' && ['/sidequests', '/companions'].includes(pathname));
    return <Pressable key={tab.name} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.name}
      onPress={() => router.navigate(tab.href)} style={styles.tab}>
      <Feather name={tab.icon} size={22} color={active ? colors.leaf : '#879399'} />
      <Text style={[styles.label, active && { color: colors.green, fontWeight: '700' }]}>{tab.name}</Text>
      {active && <View style={styles.dot} />}
    </Pressable>;
  };
  function go(path: '/post/create' | '/trip/create' | '/companions' | '/sidequests') { setOpen(false); router.push(path); }
  return <>
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.slice(0, 2).map(renderTab)}
      <View style={styles.plus}><ActionButton circle label="Start an adventure" icon="plus" onPress={() => setOpen(true)} /></View>
      {tabs.slice(2).map(renderTab)}
    </View>
    <Sheet title="What’s your next adventure?" visible={open} onClose={() => setOpen(false)}>
      <Text style={ui.body}>Make a memory. Make a plan. Find your people.</Text>
      <ActionButton label="Share a travel moment" icon="camera" onPress={() => go('/post/create')} />
      <ActionButton label="Plan a trip" icon="map" onPress={() => go('/trip/create')} />
      <ActionButton label="Find a companion" icon="users" onPress={() => go('/companions')} />
      <ActionButton label="Discover a SideQuest" icon="zap" onPress={() => go('/sidequests')} />
    </Sheet>
  </>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 9, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E7EDE8' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 49, gap: 4 },
  label: { fontSize: 9, color: '#7B898C' }, dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.leaf },
  plus: { marginHorizontal: 9, marginTop: -16, padding: 4, borderRadius: 40, backgroundColor: '#EEF4EE' },
});
