import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

type Props = TextInputProps & { label: string; icon: ComponentProps<typeof Feather>['name']; error?: string; password?: boolean };
export function FormField({ label, icon, error, password, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return <View style={{ gap: 5 }}>
    <View style={[styles.field, focused && styles.focused, !!error && { borderColor: colors.error }]}>
      <Feather name={icon} size={18} color={focused ? colors.green : colors.muted} />
      <TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor="#87908A" autoCapitalize="none"
        {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        secureTextEntry={password && !visible} style={styles.input} />
      {password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        onPress={() => setVisible(!visible)} style={styles.eye}>
        <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
      </Pressable>}
    </View>
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  field: { minHeight: 54, borderWidth: 1, borderColor: colors.line, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingLeft: 15, gap: 12, backgroundColor: '#FFFFFF80' },
  focused: { borderColor: colors.leaf, backgroundColor: 'white' },
  input: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 14, paddingVertical: 15, paddingRight: 12 },
  eye: { minWidth: 46, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.error, fontSize: 12, paddingLeft: 3 },
});
