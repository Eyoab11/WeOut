import { Link } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';

export default function HomeScreen() {
  return (
    <Screen title="Your next adventure starts outside." description="Find somewhere. Find someone. Go out.">
      <Text>WeOut starter preview. Explore the navigation while the travel features are being built.</Text>
      <Link href="/explore">Explore places and sidequests →</Link>
      <Link href="/trip/create">Plan a trip →</Link>
      <Link href="/post/create">Share an adventure →</Link>
      <Link href="/chat">Open conversations →</Link>
      <Link href="/welcome">View account screens →</Link>
    </Screen>
  );
}
