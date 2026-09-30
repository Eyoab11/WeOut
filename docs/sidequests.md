# SideQuests and photo activity

SideQuests now has a floating action button for generating an editable idea or adding a custom quest. Eight categories filter the catalog. Generation uses curated templates with the selected category and available time; it does not call an AI service.

Every UTC date has one shared daily challenge. Joining adds a participant; completion requires a photo post. The participant panel distinguishes joined and completed travelers. A regular quest also requires joining and posting a photo. The same composer creates standalone travel photo posts in Explore.

A streak counts distinct UTC days with a published travel photo or a photo-backed quest completion. Multiple events on one day count once. Yesterday's streak remains active until the end of today; missing a full UTC day resets the current streak. The longest streak is retained. Creating or joining a quest alone does not count. XP labels remain illustrative; this feature does not award an XP balance.

## Local use

Without backend configuration, progress is stored with Zustand/AsyncStorage per preview username. Photos are copied into the app documents directory on native devices; web stores compressed image data with progress (browser storage limits apply). Sign in with the same preview username to return to that progress. Profile name edits do not switch the progress owner. Preview identities are not secure accounts. Only your own daily participation is shown locally; no community people are fabricated.

## Supabase setup

Apply the repository migrations in timestamp order, including `supabase/migrations/20260909000100_quest_progress.sql`, to your Supabase project using your normal migration workflow. This task has not applied migrations to a hosted project. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `mobile/.env` and restart Expo. Sign in with a real account.

The migration creates a shared catalog, enrollments, private per-user completion/activity records, and the private `quest-evidence` JPEG bucket (8 MB maximum). RPCs join quests and atomically publish a photo, complete a quest, and record the server's UTC date. Clients cannot directly write completions or activity days. Successful retries reuse a request ID without duplicate credit. Storage uploads are restricted to the authenticated user's path; a post can only reference that user's existing uploaded JPEG. The required photo is self-reported evidence, not image-content verification.

`quest_dashboard` returns the shared challenge, participant display names/status, catalog and the current user's progress/photo posts. The app refreshes every 30 seconds and on foregrounding. The participant panel shows up to 100 people, with a separate total count. Catalog responses are capped at 500 and personal photo history at 100. Published photos are readable by signed-in travelers; the current Explore UI displays the current user's posts alongside curated inspiration, not a global community feed. Signed URLs last one hour. Failed uploads/publish attempts may leave unreferenced objects for retry; automatic orphan cleanup is not implemented. Community moderation and pagination are future work.

## Verification

- `npm --prefix mobile run typecheck`
- `npm --prefix mobile run test:preview`
- `npm --prefix mobile run test:quests`
- `npm run test:quest-db`
- `npm --prefix mobile run check:expo`

Database tests apply this migration in isolated PGlite PostgreSQL with minimal auth/storage stubs. They cover shared daily participation, RLS, missing/foreign photo rejection, duplicate submission, atomic completion, UTC activity uniqueness, custom catalog visibility, expired daily challenges and anonymous access. This does not replace testing real Supabase Storage or camera/library behavior on a device.

Device check: create a custom quest, filter its category, start it, verify submission without a photo is blocked, choose/capture a photo and complete it. Check Explore and Profile, then post a standalone travel photo and verify the streak remains one day. Join/complete the daily challenge and reopen the app using the same identity. With two authenticated devices, confirm the daily challenge and participant statuses agree. Camera permission text changes require a new native build; Expo Go uses its own permission configuration.
