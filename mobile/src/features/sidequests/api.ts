import { decode } from 'base64-arraybuffer';
import { requireSupabase } from '@/lib/supabase';
import { type StoredQuest, type PhotoPost } from './model';
export type Dashboard = {
  day: string; catalog: StoredQuest[]; daily: StoredQuest; started: string[];
  completed: Record<string, string>; days: string[];
  participants: { name: string; completed: boolean }[]; participant_count: number;
  posts: (PhotoPost & { storagePath: string })[];
};
export async function fetchDashboard(): Promise<Dashboard> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('quest_dashboard');
  if (error) throw error;
  const dashboard = data as Dashboard;
  if (dashboard.posts.length) {
    const { data: signed, error: signError } = await client.storage.from('quest-evidence').createSignedUrls(dashboard.posts.map(post => post.storagePath), 3600);
    if (signError) throw signError;
    dashboard.posts = dashboard.posts.map((post, i) => {
      const photoUri = signed?.[i]?.signedUrl;
      if (!photoUri) throw new Error('Could not load your photos. Please retry.');
      return { ...post, photoUri };
    });
  }
  return dashboard;
}
export async function joinQuest(id: string) {
  const { error } = await requireSupabase().rpc('quest_join', { p_quest_id: id });
  if (error) throw error;
}
export async function createQuest(quest: StoredQuest) {
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw authError || new Error('Sign in to add a SideQuest.');
  const { error } = await client.from('quest_catalog').insert({
    id: quest.id, title: quest.title, description: quest.description, category: quest.category,
    minutes: quest.minutes, xp: quest.xp, kind: quest.kind, creator_id: user.id,
    latitude: quest.latitude ?? null, longitude: quest.longitude ?? null,
  });
  if (error) throw error;
}
export async function publishPhoto(post: PhotoPost, base64: string) {
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw authError || new Error('Sign in to publish.');
  const bytes = decode(base64);
  if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Choose a smaller photo (under 8 MB).');
  const path = user.id + '/' + post.id + '.jpg';
  const { error: uploadError } = await client.storage.from('quest-evidence').upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
  // Retries of an uncertain response reuse the same path and request ID.
  if (uploadError && !uploadError.message.toLowerCase().includes('already exists') && !uploadError.message.toLowerCase().includes('duplicate')) throw uploadError;
  const { error } = await client.rpc('quest_publish_photo', {
    p_id: post.id, p_caption: post.caption, p_place: post.place, p_storage_path: path, p_quest_id: post.questId || null,
  });
  if (error) throw error; // Retain the upload for an idempotent retry; never remove possibly committed proof.
}
