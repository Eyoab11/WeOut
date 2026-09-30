# WeOut

Go out. Explore more. Together.

Expo + React Native + TypeScript mobile scaffold with a Supabase backend foundation.

## Structure

```text
WeOut/
├── mobile/
│   ├── src/
│   │   ├── app/          # Auth, tabs, posts, places, quests, trips, companions, chat
│   │   ├── components/   # UI and domain components
│   │   ├── features/     # Domain logic
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── lib/
│   ├── assets/
│   └── .env.example
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── config.toml
│   └── seed.sql
└── docs/
```

## Run the mobile preview

Use Node.js 22.13 or newer (Node 22 LTS recommended).

```powershell
cd mobile
npm ci
npm start
```

The navigation preview runs without credentials. To enable backend calls:

```powershell
Copy-Item .env.example .env
```

Fill in your Supabase project URL and publishable key, then restart Expo. Never place a service-role or secret key in an EXPO_PUBLIC variable.

## Test on an iPhone from Windows

Install Expo Go on your iPhone, connect the computer and phone to the same Wi-Fi, run `npm start` in mobile, and scan the QR code using the iPhone Camera. This project uses Expo SDK 57; the installed Expo Go must support that SDK. See [Expo Go compatibility](https://expo.dev/go).

If LAN connectivity fails, try `npx expo start --tunnel` (Expo may prompt to install its tunnel dependency). The iOS simulator requires macOS; a physical iPhone does not. For custom native modules and production features, use an [Expo development build](https://docs.expo.dev/develop/development-builds/introduction/).

## Supabase setup

For a hosted project, create a Supabase project named `weout` and copy its URL and publishable key into mobile/.env. Applying remote migrations is a separate step: review the SQL before linking and pushing.

For local development, install Docker Desktop, then run from the repository root:

```powershell
npm ci
npx supabase start
npx supabase db reset
```

Database reset recreates the local database. Use `npx supabase status` to find local connection details. On a physical phone, localhost refers to the phone; use the computer's reachable LAN address for a local backend, or use a hosted Supabase project.

## Checks

```powershell
npm run typecheck
npm run check:expo
```

## Current scope

Designed welcome, onboarding, loading, account, Home, Explore, SideQuests, Trips, Companion Finder and Profile screens with shared preview interactions. Supabase client/session refresh, auth API helpers, query provider, private profile migration, PostGIS and Edge Function placeholders are included. Product features and the rest of the database are planned, not implemented. No hosted backend has been created or deployed.

See [architecture](docs/architecture.md) and [database plan](docs/database.md). App identity: `WeOut`, slug/scheme `weout`, bundle/package `com.weout.app`.

See [verification notes](docs/verification.md) for completed checks and known dependency advisories.

See [welcome and account UI](docs/ui.md) for the preview flow and implementation details.

See [travel screens and auth behavior](docs/travel-ui.md) for the new pages, Home redirects, and preview data boundaries.

SideQuest creation, daily challenges, photo proof, streaks, and backend setup: [SideQuests guide](docs/sidequests.md).
