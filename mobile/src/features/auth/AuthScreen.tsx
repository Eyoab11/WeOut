import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Brand, MountainFooter } from '@/components/brand/Brand';
import { ActionButton } from '@/components/ui/ActionButton';
import { FormField } from '@/components/ui/FormField';
import { colors } from '@/constants/theme';
import { signInSchema, signUpSchema } from './validation';
import { authenticateAccount } from './accountFlow';
import { supabase } from '@/lib/supabase';
import { useTravelStore } from '@/stores/useTravelStore';
import { styles as s } from './auth.styles';

export default function AuthScreen({ mode }: { mode: 'signin' | 'signup' }) {
  const signup = mode === 'signup';
  const router = useRouter();
  const enter = useTravelStore(s => s.enter);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [values, setValues] = useState({ fullName: '', email: '', username: '', password: '' });
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<'forgot' | 'terms' | 'privacy' | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');
  const update = (field: keyof typeof values) => (value: string) => {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setNotice('');
  };
  async function submit() {
    if (submitting.current) return;
    const result = (signup ? signUpSchema : signInSchema).safeParse({ ...values, email: values.email.trim(), agreed: checked });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      setNotice('');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setErrors({});
    setNotice('');
    try {
      const account = await authenticateAccount(supabase, signup, values);
      if (account.kind === 'confirmation') {
        setNotice(signup ? 'Check your email to confirm your account, then come back and sign in.' : 'Finish signing in to continue.');
        return;
      }
      enter(account.name, account.username, account.preview, account.userId);
      router.replace('/home');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  function openModal(value: typeof modal) { setResetFeedback(''); setModal(value); }
  return <SafeAreaView style={s.page}>
    <MountainFooter />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={s.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/welcome')}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Animated.View entering={FadeInDown.duration(550)} style={s.content}>
          <View style={s.brand}><Brand small /></View>
          <Text style={s.title}>{signup ? 'Create Your Account' : 'Welcome Back'}</Text>
          <Text style={s.subtitle}>{signup ? 'Join a community of travelers, explorers\nand doers.' : 'Sign in to continue your journey.'}</Text>
          <View style={s.fields}>
            {signup && <FormField label="Full name" icon="user" value={values.fullName} onChangeText={update('fullName')} autoCapitalize="words" autoComplete="name" error={errors.fullName} />}
            <FormField label="Email address" icon="mail" value={values.email} onChangeText={update('email')} keyboardType="email-address" autoComplete="email" error={errors.email} />
            {signup && <FormField label="Username" icon="at-sign" value={values.username} onChangeText={update('username')} autoComplete="username-new" error={errors.username} />}
            <FormField label="Password" icon="lock" password value={values.password} onChangeText={update('password')}
              autoComplete={signup ? 'new-password' : 'current-password'} error={errors.password} returnKeyType="done" onSubmitEditing={submit} />
          </View>
          <View style={s.options}>
            {(signup || !supabase) && <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={signup ? 'Agree to the terms and privacy policy' : 'Remember me'}
              onPress={() => { setChecked(!checked); setErrors(previous => ({ ...previous, agreed: '' })); }} style={s.checkboxRow}>
              <View style={[s.checkbox, checked && { backgroundColor: colors.leaf, borderColor: colors.leaf }]}>
                {checked && <Feather name="check" size={11} color="white" />}
              </View>
              <Text style={s.optionText}>{signup ? 'I agree to the' : 'Remember me'}</Text>
            </Pressable>}
            {signup ? <View style={s.legalLinks}>
              <Pressable onPress={() => openModal('terms')} accessibilityRole="button" style={s.inlineLink}><Text style={s.linkSmall}>Terms of Service</Text></Pressable>
              <Text style={s.optionText}>and</Text>
              <Pressable onPress={() => openModal('privacy')} accessibilityRole="button" style={s.inlineLink}><Text style={s.linkSmall}>Privacy Policy</Text></Pressable>
            </View> : <Pressable accessibilityRole="button" style={s.inlineLink} onPress={() => openModal('forgot')}><Text style={s.linkSmall}>Forgot password?</Text></Pressable>}
          </View>
          {!!errors.agreed && <Text accessibilityLiveRegion="polite" style={s.error}>{errors.agreed}</Text>}
          {!supabase && <Text style={[s.optionText, { marginBottom: 12 }]}>Preview mode · no account is created or credentials sent.</Text>}
          <ActionButton label={busy ? 'Please wait…' : !supabase ? (signup ? 'Preview Sign Up' : 'Preview Sign In') : signup ? 'Create Account' : 'Sign In'} disabled={busy} onPress={submit} />
          {!!notice && <View style={s.notice} accessibilityLiveRegion="polite"><Text style={s.noticeText}>{notice}</Text></View>}
          <View style={s.divider}><View style={s.line} /><Text style={s.dividerText}>or continue with</Text><View style={s.line} /></View>
          <View style={s.socials}>
            {(['apple', 'google', 'email'] as const).map(provider => <Pressable key={provider} accessibilityRole="button" accessibilityLabel={`Continue with ${provider}`}
              onPress={() => setNotice(provider === 'email' ? 'Use the email and password fields above to preview this form.' : `${provider === 'apple' ? 'Apple' : 'Google'} sign-in will be available when accounts launch. You can explore the preview below.`)}
              style={({ pressed }) => [s.social, pressed && { backgroundColor: colors.mint }]}>
              {provider === 'apple' ? <Ionicons name="logo-apple" size={24} color={colors.ink} /> : provider === 'google' ? <Ionicons name="logo-google" size={22} color="#4285F4" /> : <Feather name="mail" size={22} color={colors.ink} />}
            </Pressable>)}
          </View>
          <View style={s.switchRow}><Text style={s.switchText}>{signup ? 'Already have an account?' : 'Don’t have an account?'}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace(signup ? '/login' : '/signup')} style={s.inlineLink}><Text style={s.link}>{signup ? 'Sign In' : 'Sign Up'}</Text></Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/loading')} style={s.preview}><Text style={s.previewText}>Take a look around ↗</Text></Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
    <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
      <KeyboardAvoidingView style={s.scrim} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modal} accessibilityViewIsModal>
          <Pressable accessibilityRole="button" accessibilityLabel="Close dialog" onPress={() => setModal(null)} style={s.close}><Feather name="x" size={22} color={colors.ink} /></Pressable>
          <Text style={[s.title, { paddingRight: 35 }]}>{modal === 'forgot' ? 'Find your way back' : modal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</Text>
          {modal === 'forgot' ? <>
            <Text style={s.subtitle}>Enter your email to preview password recovery.</Text>
            <FormField label="Email address" icon="mail" value={resetEmail} onChangeText={setResetEmail} keyboardType="email-address" />
            <ActionButton label="Reset password" onPress={() => setResetFeedback(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim()) ? 'Password recovery isn’t connected yet. No email has been sent.' : 'Enter a valid email address.')} />
            {!!resetFeedback && <Text accessibilityLiveRegion="polite" style={s.noticeText}>{resetFeedback}</Text>}
          </> : <Text style={s.subtitle}>We’re preparing this policy for launch. Registration is currently a preview; no account is created and your form details are not submitted.</Text>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}
