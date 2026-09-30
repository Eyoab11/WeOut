import { create } from 'zustand';
type LocalTrip = { id: string; title: string; destination: string; dates: string };
type LocalPost = { id: string; caption: string; place: string };
type Profile = { name: string; username: string; bio: string; avatar: string | null; style: string[] };
type TravelState = {
  profile: Profile; preview: boolean; ownerKey: string;
  saved: string[]; liked: string[]; activeQuests: string[]; connections: string[];
  trips: LocalTrip[]; posts: LocalPost[]; comments: string[];
  enter: (name: string, username: string, preview: boolean, userId?: string) => void;
  editProfile: (profile: Profile) => void;
  toggleSave: (id: string) => void; toggleLike: (id: string) => void;
  startQuest: (id: string) => void; connect: (id: string) => void;
  addTrip: (trip: Omit<LocalTrip, 'id'>) => void;
  addPost: (post: Omit<LocalPost, 'id'>) => void;
  addComment: (text: string) => void;
  reset: () => void;
};
const initial = {
  profile: { avatar: null as string | null, style: ['Adventure', 'Local Food', 'Hidden Gems', 'Nature', 'Culture', 'Sustainable Travel', 'Meet People'], name: 'Alex Rivera', username: 'alexrivera', bio: 'Exploring new places, meeting amazing people, and trying to make travel a force for good.' },
  ownerKey: 'preview:alexrivera', preview: true, saved: [] as string[], liked: [] as string[], activeQuests: [] as string[], connections: [] as string[],
  trips: [] as LocalTrip[], posts: [] as LocalPost[], comments: [] as string[],
};
let nextId = 0;
const createId = () => Date.now().toString(36) + '-' + (nextId++).toString(36);
const toggle = (items: string[], id: string) => items.includes(id) ? items.filter(item => item !== id) : [...items, id];
export const useTravelStore = create<TravelState>((set) => ({
  ...initial,
  enter: (name, username, preview, userId) => set({ ...initial, preview, ownerKey: preview ? `preview:${username}` : `user:${userId || username}`,  profile: { ...initial.profile, name, username } }),
  editProfile: profile => set({ profile }),
  toggleSave: id => set(state => ({ saved: toggle(state.saved, id) })),
  toggleLike: id => set(state => ({ liked: toggle(state.liked, id) })),
  startQuest: id => set(state => ({ activeQuests: state.activeQuests.includes(id) ? state.activeQuests : [...state.activeQuests, id] })),
  connect: id => set(state => ({ connections: state.connections.includes(id) ? state.connections : [...state.connections, id] })),
  addTrip: trip => set(state => ({ trips: [...state.trips, { ...trip, id: createId() }] })),
  addPost: post => set(state => ({ posts: [{ ...post, id: createId() }, ...state.posts] })),
  addComment: text => set(state => ({ comments: [...state.comments, text] })),
  reset: () => set(initial),
}));
