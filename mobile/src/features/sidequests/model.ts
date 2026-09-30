import { z } from 'zod';
export const CATEGORIES = ['Adventure', 'Nature', 'Food', 'Culture', 'Hidden Gems', 'Photography', 'Wellness', 'Community'] as const;
export type Category = typeof CATEGORIES[number];
export type Quest = {
  id: string; title: string; description: string; category: string; tag: string;
  image: number | string; xp: number; distance: string; minutes: number;
  latitude?: number; longitude?: number;
  kind?: 'builtin' | 'custom' | 'generated' | 'daily'; day?: string;
};
export type StoredQuest = Omit<Quest, 'image'>;
export type PhotoPost = { id: string; caption: string; place: string; photoUri: string; createdAt: string; questId?: string; questTitle?: string };
export type Progress = { quests: StoredQuest[]; started: string[]; completed: Record<string, string>; days: string[]; posts: PhotoPost[] };
export const blankProgress = (): Progress => ({ quests: [], started: [], completed: {}, days: [], posts: [] });
export const questSchema = z.object({
  title: z.string().trim().min(4, 'Use at least 4 characters.').max(100),
  description: z.string().trim().min(15, 'Describe what someone should do in at least 15 characters.').max(1000),
  category: z.enum(CATEGORIES),
  minutes: z.coerce.number().int().min(5).max(180),
});
export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);
const dayNumber = (day: string) => Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000);
export function streakFor(days: string[], today = dayKey()) {
  const numbers = [...new Set(days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).map(dayNumber))].filter(n => Number.isFinite(n) && n <= dayNumber(today)).sort((a,b) => a-b);
  let run = 0, longest = 0, previous = -Infinity;
  for (const n of numbers) { run = n === previous + 1 ? run + 1 : 1; longest = Math.max(longest, run); previous = n; }
  return { current: previous >= dayNumber(today) - 1 ? run : 0, longest, todayDone: numbers.includes(dayNumber(today)) };
}
// Same UTC-date rotation on every device and in the database migration.
export const dailyTemplates = [
  ['Notice something green', 'Nature', 'Step outside and photograph a plant, tree, or green space you noticed today. Share one detail that caught your eye.'],
  ['A taste of somewhere', 'Food', 'Try a dish or ingredient that tells a local story. Post your own photo and tell us what you discovered.'],
  ['Look up, look closer', 'Photography', 'Find an interesting architectural detail in a public place. Photograph it and share what made you pause.'],
  ['Take the scenic route', 'Adventure', 'Choose a safe, accessible route you do not usually take. Photograph a discovery along the way.'],
  ['A moment of calm', 'Wellness', 'Spend ten quiet minutes outside or by a window. Photograph the view that helped you slow down.'],
  ['A small act of care', 'Community', 'Do a small act of care for your surroundings. Photograph the result without including anyone without permission.'],
  ['Find a local story', 'Culture', 'Find a public artwork, landmark, or historical detail. Photograph it and share what you learned.'],
] as const;
export function dailyQuest(day = dayKey()): StoredQuest {
  const template = dailyTemplates[((dayNumber(day) % dailyTemplates.length) + dailyTemplates.length) % dailyTemplates.length];
  return { id: 'daily-' + day, title: template[0], category: template[1], description: template[2], minutes: 20, xp: 100, distance: 'Anywhere', tag: 'DAILY', kind: 'daily', day };
}
const ideas: Record<Category, string[]> = {
  Adventure: ['Take a new walking route', 'Find a different perspective', 'Follow a scenic path'],
  Nature: ['Discover a patch of green', 'Notice the smallest details', 'Find a peaceful tree'],
  Food: ['Try a local flavor', 'Discover a neighborhood café', 'Cook a destination-inspired dish'],
  Culture: ['Find a story in the streets', 'Visit a public artwork', 'Explore a local landmark'],
  'Hidden Gems': ['Find a quiet corner', 'Discover an overlooked detail', 'Explore a nearby side street'],
  Photography: ['Capture an interesting reflection', 'Follow light and shadow', 'Photograph three textures'],
  Wellness: ['Take a mindful outdoor break', 'Find a calming view', 'Make time for a gentle walk'],
  Community: ['Care for a shared space', 'Support a local maker', 'Leave a place a little better'],
};
export function generateQuest(category: Category, minutes: number, seed = Date.now()): Omit<StoredQuest, 'id'> {
  const title = ideas[category][Math.abs(seed) % ideas[category].length];
  return { title, category, minutes, description: `Set aside ${minutes} minutes to ${title.toLowerCase()}. Choose somewhere safe and accessible to you. Post your own photo and share what you noticed.`,
    xp: Math.min(150, 50 + minutes), distance: 'Your area', tag: 'FOR YOU', kind: 'generated' };
}
export function applyPhotoPost(progress: Progress, post: PhotoPost, quest?: StoredQuest): Progress {
  if (!post.photoUri.trim()) throw new Error('Add a photo before posting.');
  if (post.caption.trim().length < 5 || !post.place.trim()) throw new Error('Add a caption and a location.');
  if (progress.posts.some(p => p.id === post.id)) return progress;
  const day = dayKey(new Date(post.createdAt));
  if ((post.questId || quest) && (!quest || post.questId !== quest.id)) throw new Error('This SideQuest is no longer available.');
  if (quest) {
    if (!progress.started.includes(quest.id)) throw new Error('Start the SideQuest before completing it.');
    if (progress.completed[quest.id]) throw new Error('You have already completed this SideQuest.');
    if (quest.kind === 'daily' && quest.day !== day) throw new Error('This daily challenge has ended. Try today’s challenge.');
  }
  return { ...progress, posts: [post, ...progress.posts], days: [...new Set([...progress.days, day])],
    completed: quest ? { ...progress.completed, [quest.id]: post.id } : progress.completed };
}
