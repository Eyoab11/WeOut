import type { StoredQuest } from "./quest-model";
export const categories = [
  "All",
  "Adventure",
  "Nature",
  "Food",
  "Culture",
  "Hidden Gems",
  "Photography",
  "Wellness",
  "Community",
];
export const places = [
  {
    id: "rooftop",
    name: "Carpe Diem Rooftop",
    category: "Food",
    tag: "Rooftop",
    distance: "0.2 km",
    image: "/images/barcelona.jpg",
    latitude: 41.3851,
    longitude: 2.1734,
    description:
      "A golden-hour escape above the city. Come for the view, stay for a slow evening with friends.",
  },
  {
    id: "beach",
    name: "Barceloneta Beach",
    category: "Nature",
    tag: "Beach",
    distance: "1.1 km",
    image: "/images/beach.jpg",
    latitude: 41.3785,
    longitude: 2.1925,
    description:
      "Kick off your shoes and follow the Mediterranean. A little sea air makes every day better.",
  },
  {
    id: "sagrada",
    name: "Sagrada Família",
    category: "Culture",
    tag: "Must see",
    distance: "1.5 km",
    image: "/images/barcelona.jpg",
    latitude: 41.4036,
    longitude: 2.1744,
    description:
      "Look up. Barcelona’s extraordinary basilica is full of light, color, and details worth slowing down for.",
  },
];
export const quests: StoredQuest[] = [
  {
    id: "sunrise",
    title: "Sunrise Viewpoint Quest",
    category: "Adventure",
    tag: "FEATURED",
    xp: 150,
    distance: "2.5 km",
    minutes: 45,
    description:
      "Hike to the top and capture the sunrise. Share your view and what it means to you.",
  },
  {
    id: "hidden-beach",
    title: "Hidden Beach Discovery",
    category: "Hidden Gems",
    tag: "EASY",
    xp: 100,
    distance: "0.3 km",
    minutes: 25,
    description:
      "Find the hidden beach and share a photo. Leave only footprints behind.",
  },
  {
    id: "local-food",
    title: "Local Food Challenge",
    category: "Food",
    tag: "FOOD",
    xp: 80,
    distance: "1.1 km",
    minutes: 30,
    description:
      "Try a local dish and tell us about it. Ask someone for their favorite neighborhood spot.",
  },
  {
    id: "historic-streets",
    title: "Historic Streets Walk",
    category: "Culture",
    tag: "CULTURE",
    xp: 100,
    distance: "0.8 km",
    minutes: 35,
    description:
      "Explore the old town and share a moment that made you stop and look.",
  },
  {
    id: "secret-viewpoint",
    title: "Secret Viewpoint Hike",
    category: "Nature",
    tag: "NATURE",
    xp: 120,
    distance: "2.4 km",
    minutes: 60,
    description:
      "Find the trail, reach the viewpoint and share your best shot.",
  },
];
export function questImage(category: string) {
  return `/images/${({ Food: "food", Culture: "barcelona", "Hidden Gems": "coast", Nature: "mountains", Photography: "lake-como" } as Record<string, string>)[category] || "hiker"}.jpg`;
}
export const travelers = [
  {
    id: "emma",
    name: "Emma Chen",
    age: 28,
    city: "Vancouver, Canada",
    image: "/images/traveler-1.jpg",
    interests: ["Hiking", "Food", "Photography", "Sustainable Travel"],
    destinations: ["Japan", "Iceland", "New Zealand"],
    bio: "Nature lover, good food enthusiast, and always down for a spontaneous adventure. Looking for like-minded people to explore with!",
  },
  {
    id: "alex",
    name: "Alex Rivera",
    age: 29,
    city: "Barcelona, Spain",
    image: "/images/traveler-2.jpg",
    interests: ["Culture", "Food", "Hiking"],
    destinations: ["Japan", "Italy", "Portugal"],
    bio: "Collecting little moments, mountain mornings, and recipes from every place I visit.",
  },
  {
    id: "sofia",
    name: "Sofia Carter",
    age: 27,
    city: "London, United Kingdom",
    image: "/images/traveler-3.jpg",
    interests: ["Photography", "Nature", "Culture"],
    destinations: ["Italy", "Iceland"],
    bio: "A camera, a good book, and a window seat. Let’s take the scenic route together.",
  },
];
export const itinerary = [
  {
    time: "Day 1 · Morning",
    title: "Arrive in Barcelona",
    note: "Check in, explore El Born",
  },
  { time: "Day 1 · 14:00", title: "Sagrada Família", note: "Guided tour · 2h" },
  {
    time: "Day 1 · 20:00",
    title: "Dinner at Braseria Sol",
    note: "Local cuisine",
  },
  {
    time: "Day 2 · 07:00",
    title: "Sunrise at the viewpoint",
    note: "SideQuest · pack your camera",
  },
  {
    time: "Day 2 · 13:00",
    title: "Barceloneta Beach",
    note: "An afternoon with no plans",
  },
];
