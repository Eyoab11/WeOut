import { type Place } from '@/features/travel/data';
export type TravelMapProps = { places: Place[]; showFriends: boolean; onPlace: (id: string) => void; onFriend: () => void; reset: number };
