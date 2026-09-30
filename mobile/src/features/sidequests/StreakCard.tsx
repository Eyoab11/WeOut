import { Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import { ui } from '@/components/travel/Primitives';
import { useQuests } from './useQuests';
export function StreakCard() {
  const { streak, ready } = useQuests();
  return <View style={[ui.card, { padding: 16, marginVertical: 12, backgroundColor: '#F0F5E9', gap: 8 }]}>
    <View style={[ui.row, { justifyContent: 'space-between' }]}><View style={ui.row}><Feather name="zap" size={24} color="#C88925" /><Text style={ui.sectionTitle}>{ready ? streak.current : '…'} day streak</Text></View><Text style={ui.small}>Best: {streak.longest} days</Text></View>
    <Text style={ui.body}>{streak.todayDone ? 'Today counts. Come back tomorrow for another adventure.' : 'Post a travel photo or finish any quest with photo proof to keep your streak going.'}</Text>
    <Text style={ui.small}>One credit per UTC day · a day without activity breaks the streak.</Text>
  </View>;
}
