import { type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function Screen({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.brand}>WEOUT</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, backgroundColor: '#F7F8F2' },
  brand: { color: '#22634B', fontWeight: '800', letterSpacing: 3, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#173F35', marginBottom: 12 },
  description: { fontSize: 17, lineHeight: 26, color: '#526259' },
  content: { gap: 16, marginTop: 28 },
});
