# WeOut architecture

Expo + React Native + TypeScript is the mobile client. Expo Router provides file-based navigation. Supabase provides Auth, PostgreSQL/PostGIS, Storage, Realtime and Edge Functions; no separate Node API is needed.

## Code ownership

- `mobile/src/app`: thin route screens and layouts.
- `components`: reusable UI, maps, posts, quests and companions.
- `features`: domain queries, mutations, hooks and business logic.
- `lib`: Supabase and TanStack Query clients.
- `hooks`, `services`, `stores`, `types`, `constants`, `utils`: shared foundations.
- `supabase/migrations`: versioned SQL.
- `supabase/functions`: trusted server operations.

TanStack Query manages remote state. Zustand is available for local UI state; Zod for input validation. Native packages are installed for maps, location, images, storage and notifications, but these capabilities are not activated by the starter.

## Scaffold boundaries

All routes are preview placeholders. Auth API helpers are available, but forms, session-based routing and onboarding are not implemented. Navigation runs without backend credentials. The only implemented database domain is private profiles; other domains are planned in database.md. Edge Functions return 501.

Private media must use a private bucket and policies consistent with post visibility. Location sharing must be opt-in with server-enforced friend/selected-friend access. Clients must not award XP, verify accounts, create official quests or create matches without trusted validation.
