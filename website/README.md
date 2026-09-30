# WeOut website

A separate Next.js App Router + TypeScript web version of the Expo app. The root route is an immediate landing page, with no splash screen. Mobile source and database migrations are unchanged.

## Run

Use Node.js 22.13 or newer.

```powershell
cd website
npm ci
npm run dev
```

Open http://localhost:3000. For production, run `npm run build`, then `npm start`.

## Screens

- /: photo-led landing page and discovery sections.
- /home: searchable places, daily challenge, streaks, and live nearby discovery.
- /explore: sample stories, photo posts, local likes, saves, notes, and sharing.
- /sidequests: filters, active/completed quests, daily challenge, idea generation, custom quests, and photo evidence.
- /trips: upcoming/past/saved plans, creation, live sharing, sample itinerary, and packing lists.
- /companions: sample traveler filters, preview connections, and live discovery.
- /profile: memories, saved places, progress, editing, and sign out.
- /login and /signup: Supabase authentication when configured, or username-only local preview.

Detail routes use query IDs (for example /sidequests/detail?id=sunrise), allowing static hosting while fetching account data from Supabase.

## Use the mobile backend

Copy .env.example to .env.local. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the same public values used by mobile. Never use a service-role key. Rebuild after changing them: Next.js embeds public configuration at build time.

Apply existing repository migrations through your normal Supabase workflow. This website does not apply migrations. Add your web origin and /home confirmation return URL to Supabase Auth's allowed redirect URLs. Use the same account on web and mobile for shared quest progress, photos, trips, and nearby discovery.

The site uses existing quest_dashboard, quest_join, quest_publish_photo, discovery_update, and discovery_nearby RPCs; quest_catalog, travel_trips, profiles; and the private quest-evidence bucket. Supabase enforces row-level security. Photo preparation converts JPEG/PNG/WebP to bounded JPEG. Failed publications retry with their original request ID and photo.

## Preview boundaries

Without a signed-in account, data stays in this browser, isolated by preview username. These are not secure accounts. Browser photo storage has limited capacity; errors are displayed. Preview data does not automatically transfer to Supabase. Different browser origins have separate storage.

Places, stories, travelers, and the Barcelona itinerary are curated samples, matching mobile. General likes, bookmarks, notes, connections, and packing lists remain local. They do not send social requests or messages. Trip planning does not book travel. XP is illustrative. Location is requested on choosing nearby discovery; sharing is opt-in with the backend's approximate location and expiry rules.

Quest rules are copied from mobile/src/features/sidequests/model.ts for a self-contained website. The parity test detects drift; update both copies together. Daily challenges and streaks use UTC. Asset attribution is in public/images.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

The parity test requires the adjacent mobile folder; standalone builds do not. Responsive styles include desktop/tablet/phone layouts, keyboard focus, form labels, native modal focus trapping, reduced motion support, and a skip link. Visual browser QA and live two-device Supabase checks are separate from compilation and unit tests.

Read-only WebMCP quest search is feature-detected. No supported WebMCP context was available for integration verification.
