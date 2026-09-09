# Database plan

## Implemented foundation

Timestamped migrations enable PostGIS and create `profiles` with owner-only RLS and column-level grants. Users create their profile during future onboarding; there is no signup trigger. Private date of birth/personality data is not exposed to other users. XP, level, streaks and verification cannot be changed through client grants.

## Planned migrations

Add schema and RLS together for each domain, then add authorization tests before use:

| Domain | Tables |
| --- | --- |
| Social | friendships, follows, blocks |
| Places | places with indexed PostGIS geography |
| Posts | posts, post_media, post_likes, comments, post_user_tags |
| Sidequests | sidequests, sidequest_completions, streaks |
| Trips | trips, trip_members, trip_items |
| Companions | travel_intents, companion_preferences, companion_swipes, companion_matches |
| Chat | conversations, conversation_members, messages |
| Location | user_location_shares and selected recipients |

Enforce post media positions 1–20 with a unique (post_id, position) constraint. Match creation and conversation membership need trusted writes. Chat reads must require membership. Avoid recursive membership RLS. Add indexes to foreign keys and spatial lookups.

Storage buckets, Realtime publication, all remaining domain SQL and business policies are intentionally pending. Do not interpret the navigation placeholders as completed backend features.
