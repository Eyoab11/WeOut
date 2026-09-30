import { type Coordinates, type Discovery } from './useDiscovery';
export type NearbyMapProps = { center: Coordinates; data?: Discovery; mode: string; reset: number; onQuest: (id: string) => void; onPerson: () => void };
