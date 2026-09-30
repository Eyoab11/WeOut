import { createElement } from 'react';
import { type NearbyMapProps } from './NearbyMap.types';

export default function NearbyMap({ center }: NearbyMapProps) {
  const { latitude: lat, longitude: lng } = center;
  const bbox = [lng - 0.04, Math.max(-90, lat - 0.04), lng + 0.04, Math.min(90, lat + 0.04)].join(',');
  return createElement('iframe', { title: 'Your location on OpenStreetMap', width: '100%', height: '100%', style: { border: 0 },
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=' + encodeURIComponent(bbox) + '&layer=mapnik&marker=' + lat + ',' + lng });
}
