import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '@/constants/theme';

type Props = { label: string; onPress: () => void; circle?: boolean; disabled?: boolean; icon?: ComponentProps<typeof Feather>['name'] };
export function ActionButton({ label, onPress, circle = false, disabled = false, icon = 'arrow-right' }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={animated}>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 13 }); }}
      onPress={onPress} style={[styles.button, circle && styles.circle, disabled && { opacity: 0.5 }]}>
      {!circle && <Text style={styles.label}>{label}</Text>}
      <Feather name={icon} size={21} color="white" />
    </Pressable>
  </Animated.View>;
}
const styles = StyleSheet.create({
  button: { minHeight: 55, borderRadius: 16, backgroundColor: colors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  label: { color: 'white', fontSize: 15, fontWeight: '600' },
  circle: { width: 58, height: 58, borderRadius: 29, paddingHorizontal: 0, backgroundColor: colors.leaf },
});
