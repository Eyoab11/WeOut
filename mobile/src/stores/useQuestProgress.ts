import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { applyPhotoPost, blankProgress, type PhotoPost, type Progress, type StoredQuest } from '@/features/sidequests/model';
type State = {
  accounts: Record<string, Progress>;
  addQuest: (owner: string, quest: StoredQuest) => void;
  start: (owner: string, id: string) => void;
  publish: (owner: string, post: PhotoPost, quest?: StoredQuest) => void;
};
export const EMPTY_PROGRESS = blankProgress();
export const useQuestProgress = create<State>()(persist((set) => ({
  accounts: {},
  addQuest: (owner, quest) => set(s => { const p = s.accounts[owner] || blankProgress(); return { accounts: { ...s.accounts, [owner]: { ...p, quests: [quest, ...p.quests] } } }; }),
  start: (owner, id) => set(s => { const p = s.accounts[owner] || blankProgress(); return { accounts: { ...s.accounts, [owner]: { ...p, started: [...new Set([...p.started, id])] } } }; }),
  publish: (owner, post, quest) => set(s => ({ accounts: { ...s.accounts, [owner]: applyPhotoPost(s.accounts[owner] || blankProgress(), post, quest) } })),
}), { name: 'weout-quest-progress-v1', storage: createJSONStorage(() => AsyncStorage), partialize: s => ({ accounts: s.accounts }) }));
