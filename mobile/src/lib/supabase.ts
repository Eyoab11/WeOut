import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// No fake credentials: navigation preview works before backend setup.
export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Set the Supabase URL and publishable key in mobile/.env, then restart Expo.');
  return supabase;
}

// Root layout owns this listener, so unmounts and Fast Refresh clean it up.
export function manageAuthRefresh() {
  if (!supabase || Platform.OS === 'web') return;
  const client = supabase;
  const refresh = (state: string) => {
    if (state === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  };
  refresh(AppState.currentState);
  const listener = AppState.addEventListener('change', refresh);
  return () => {
    listener.remove();
    client.auth.stopAutoRefresh();
  };
}
