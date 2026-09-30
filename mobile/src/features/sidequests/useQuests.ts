import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTravelStore } from '@/stores/useTravelStore';
import { EMPTY_PROGRESS, useQuestProgress } from '@/stores/useQuestProgress';
import { quests as builtins, travelImages } from '@/features/travel/data';
import { dailyQuest, dayKey, streakFor, type Quest, type StoredQuest, type PhotoPost } from './model';
import { createQuest, fetchDashboard, joinQuest, publishPhoto } from './api';

export const newQuestId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
function artwork(category: string) {
  return category === 'Food' ? travelImages.food : category === 'Nature' || category === 'Wellness' ? travelImages.mountain : category === 'Adventure' ? travelImages.hike : category === 'Hidden Gems' ? travelImages.coast : travelImages.city;
}
export function useQuests() {
  const owner = useTravelStore(s => s.ownerKey);
  const preview = useTravelStore(s => s.preview);
  const local = useQuestProgress(s => s.accounts[owner] || EMPTY_PROGRESS);
  const [today, setToday] = useState(dayKey());
  const [hydrated, setHydrated] = useState(useQuestProgress.persist.hasHydrated());
  const live = !!supabase && !preview;
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['quest-dashboard', owner, today], queryFn: fetchDashboard, enabled: live, staleTime: 15000, refetchInterval: 30000, retry: 1 });
  useEffect(() => {
    const unsub = useQuestProgress.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useQuestProgress.persist.hasHydrated());
    const tick = () => setToday(dayKey());
    const interval = setInterval(tick, 30000);
    const listener = AppState.addEventListener('change', s => { if (s === 'active') { tick(); if (live) void queryClient.invalidateQueries({ queryKey: ['quest-dashboard', owner] }); } });
    return () => { unsub(); clearInterval(interval); listener.remove(); };
  }, [live, owner, queryClient]);
  const day = live && query.data ? query.data.day : today;
  const daily = query.data && live ? query.data.daily : dailyQuest(day);
  const catalog: Quest[] = live ? (query.data?.catalog || []).map(q => ({ ...q, image: artwork(q.category) })) :
    [...builtins, ...local.quests.map(q => ({ ...q, image: artwork(q.category) })), ...local.started.filter(id => /^daily-\d{4}-\d{2}-\d{2}$/.test(id) && id !== daily.id).map(id => { const old = dailyQuest(id.slice(6)); return { ...old, image: artwork(old.category) }; })];
  const dailyWithImage: Quest = { ...daily, image: artwork(daily.category) };
  const all = [...catalog.filter(q => q.id !== daily.id), dailyWithImage];
  const started = live ? query.data?.started || [] : local.started;
  const completed = live ? query.data?.completed || {} : local.completed;
  const days = live ? query.data?.days || [] : local.days;
  const posts = live ? query.data?.posts || [] : local.posts;
  const ready = live ? !!query.data : hydrated;
  async function refresh() { await queryClient.invalidateQueries({ queryKey: ['quest-dashboard', owner] }); }
  function assertReady() { if (!ready) throw new Error('Wait for your progress to load, then try again.'); }
  return {
    owner, live, ready, day, daily: dailyWithImage, all, started, completed, posts,
    streak: streakFor(days, day), error: query.error,
    participants: live ? query.data?.participants || [] : started.includes(daily.id) ? [{ name: 'You', completed: !!completed[daily.id] }] : [],
    participantCount: live ? query.data?.participant_count || 0 : Number(started.includes(daily.id)),
    refresh,
    async add(quest: StoredQuest) { assertReady(); if (live) { await createQuest(quest); await refresh(); } else useQuestProgress.getState().addQuest(owner, quest); },
    async start(quest: Quest) {
      assertReady();
      if (!live && quest.kind === 'daily' && quest.day !== dayKey()) throw new Error('A new daily challenge is available. Refresh and try again.');
      if (live) { await joinQuest(quest.id); await refresh(); } else useQuestProgress.getState().start(owner, quest.id);
    },
    async publish(post: PhotoPost, base64: string, quest?: Quest) {
      assertReady();
      if (!post.photoUri || !base64) throw new Error('Add a photo before posting.');
      if (live) { await publishPhoto(post, base64); await refresh(); }
      else useQuestProgress.getState().publish(owner, post, quest);
    },
  };
}
