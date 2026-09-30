import { useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { IconButton, Sheet, ui } from '@/components/travel/Primitives';
import { ActionButton } from '@/components/ui/ActionButton';
import { useTravelStore } from '@/stores/useTravelStore';
import { colors } from '@/constants/theme';
import { travelImages } from '@/features/travel/data';

export type PreviewPost = { id: string; author: string; location: string; caption: string; image: number | string; avatar: number | string; gallery?: (number | string)[]; questTitle?: string };
export function TravelPostCard({ post }: { post: PreviewPost }) {
  const [photo, setPhoto] = useState(0);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const liked = useTravelStore(s => s.liked.includes(post.id));
  const saved = useTravelStore(s => s.saved.includes(post.id));
  const toggleLike = useTravelStore(s => s.toggleLike);
  const toggleSave = useTravelStore(s => s.toggleSave);
  const gallery = post.gallery || [post.image, travelImages.mountain, travelImages.coast, travelImages.city];
  return <View style={[ui.card, { marginTop: 12 }]}>
    <View style={[ui.row, { padding: 11 }]}><Image source={post.avatar} style={{ width: 35, height: 35, borderRadius: 20 }} />
      <View style={{ flex: 1 }}><Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }}>{post.author}</Text><Text style={ui.small}>{post.location} · Travel inspiration</Text></View>
      <IconButton icon="more-horizontal" label="Post details" onPress={() => setOpen(true)} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Photo ${photo + 1} of ${gallery.length}. Show next photo.`} onPress={() => setPhoto(n => (n + 1) % gallery.length)}>
      <Image source={gallery[photo]} style={{ width: '100%', height: 238 }} contentFit="cover" />
      <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#193D3BAB', padding: 6, borderRadius: 15 }}><Text style={{ fontSize: 9, color: 'white' }}>{photo + 1}/{gallery.length}</Text></View>
    </Pressable>
    {post.questTitle && <Text style={[ui.link, { paddingHorizontal: 12, paddingTop: 10 }]}>Completed: {post.questTitle}</Text>}
    <Text style={{ paddingHorizontal: 12, paddingTop: 11, color: colors.ink, fontSize: 13, lineHeight: 19 }}>{post.caption}</Text>
    <View style={[ui.row, { paddingHorizontal: 3, gap: 0 }]}>
      <IconButton icon="heart" active={liked} label={liked ? 'Unlike post' : 'Like post'} onPress={() => toggleLike(post.id)} /><Text style={ui.small}>{(post.gallery ? 0 : 428) + Number(liked)}</Text>
      <IconButton icon="message-circle" label="Read comments" onPress={() => setOpen(true)} /><Text style={ui.small}>{comments.length}</Text>
      <IconButton icon="share" label="Share this travel inspiration" onPress={() => { Share.share({ message: post.caption + ' — Inspiration from WeOut' }).catch(() => {}); }} />
      <View style={{ flex: 1 }} /><IconButton icon={saved ? 'check' : 'bookmark'} active={saved} label={saved ? 'Unsave post' : 'Save post'} onPress={() => toggleSave(post.id)} />
    </View>
    <Sheet title="A little conversation" visible={open} onClose={() => setOpen(false)}>
      <Text style={ui.body}>Comments in this preview stay on this screen.</Text>
      {comments.length ? comments.map((text, i) => <View key={i} style={[ui.card, { padding: 14 }]}><Text style={ui.sectionTitle}>You</Text><Text style={ui.body}>{text}</Text></View>) : <Text style={ui.body}>Be the first to share a thought.</Text>}
      <TextInput accessibilityLabel="Your comment" placeholder="What caught your eye?" value={comment} onChangeText={setComment} multiline style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, minHeight: 70, color: colors.ink }} />
      <ActionButton label="Add comment" disabled={!comment.trim()} onPress={() => { setComments(list => [...list, comment.trim()]); setComment(''); }} />
    </Sheet>
  </View>;
}
