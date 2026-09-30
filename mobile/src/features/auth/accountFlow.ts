import { type SupabaseClient } from '@supabase/supabase-js';

type AccountValues = { fullName: string; username: string; email: string; password: string };
type Result = { kind: 'confirmation' } | { kind: 'ready'; name: string; username: string; preview: boolean; userId?: string };

// The preview never transmits credentials. Configured auth requires a real session.
export async function authenticateAccount(client: Pick<SupabaseClient, 'auth'> | null, signup: boolean, values: AccountValues): Promise<Result> {
  let name = signup ? values.fullName.trim() : values.email.trim().split('@')[0];
  let username = signup ? values.username : values.email.trim().split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);
  if (username.length < 3) username = username.padEnd(3, '_');
  if (!client) return { kind: 'ready', name, username, preview: true };
  const { data, error } = signup
    ? await client.auth.signUp({ email: values.email.trim(), password: values.password, options: { data: { display_name: name, username } } })
    : await client.auth.signInWithPassword({ email: values.email.trim(), password: values.password });
  if (error) throw error;
  if (!data.session) return { kind: 'confirmation' };
  if (typeof data.user?.user_metadata?.display_name === 'string') name = data.user.user_metadata.display_name;
  if (typeof data.user?.user_metadata?.username === 'string') username = data.user.user_metadata.username;
  return { kind: 'ready', name, username, preview: false, ...(data.user?.id ? { userId: data.user.id } : {}) };
}
