# Travel screens and auth

The six reference screens are implemented: Home, Explore, SideQuests, Trips, Companion Finder and Profile. The center action menu opens post creation, trip creation, companion discovery, or quests.

## Account flow

Without Supabase configuration, validated Preview Sign In / Preview Sign Up opens Home and sets a local identity. No credentials are sent or persisted.

With Supabase configured, the forms use Supabase Auth. A successful response with a session opens Home; signup requiring confirmation stays on the form with an email-confirmation message. Errors remain visible on the form. These branches were checked with mocks, not a live project. Public profile records are not written in this UI pass. OAuth, password recovery and policies remain unfinished.

## Interactions

Home has destination search, sample map pins and nearby saves. Explore has category filtering, photo paging, likes, saved posts, local comments and a share sheet. SideQuests has search, categories, featured pagination and active quests. Trips has upcoming/past/saved tabs, itinerary details, packing checks and local plan creation. Companion Finder has destination/style/quest filters, swipe and arrow navigation, saves and local connection requests. Profile supports shared counts, name/bio/style editing, local photo selection, memories and sign out.

## Data boundaries

All travel content is curated sample data, including travelers, compatibility percentages, weather illustration and itinerary dates. The native map uses a Barcelona basemap with sample pins; web uses an illustrated fallback. No device location is requested.

General travel preview state is in memory and resets on restart or entering a new preview. SideQuest progress, streaks and photo posts persist separately per identity. Comments belong to each feed-card instance. Social actions do not transmit requests or award XP. Profile photos remain local. Photo posting and SideQuest progress now use the persistent/photo-backed flow described in [SideQuests](sidequests.md). No trips are booked.

## Structure

Feature screens compose shared components/travel primitives, cards and navigation. Map implementations are split into TravelMap.native.tsx and a web-compatible TravelMap.tsx. Sample data lives in features/travel/data.ts; account outcome logic is in features/auth/accountFlow.ts.

## Verification

TypeScript and seven focused auth/state tests passed. Run npm --prefix mobile run test:preview. Final iOS/web exports and Expo dependency compatibility checks passed.

Browser automation cannot start because its environment helper fails. Device visuals, native map gestures, photo picking and live Supabase were not tested.

On iPhone restart from mobile with npx expo start --clear. Check both preview forms, tabs, center menu, map pins, empty search/filter states, quest pagination, saved state, traveler navigation, trip creation, profile edits, photo-picker cancellation, sign out, keyboard behavior and Reduce Motion.

