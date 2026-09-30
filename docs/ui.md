# Welcome and account UI

## Preview flow

The root route opens the mountain welcome screen. Continue to four swipeable introduction pages, then create an account or sign in. Skip goes straight to sign-in. "Take a look around" on either account screen opens the animated globe loading screen, then the existing home scaffold.

Routes: /, /welcome, /onboarding, /login, /signup, /loading, /home.

## Implementation

- Thin Expo Router routes compose screens in features/auth and features/onboarding.
- Shared brand artwork, animated buttons and form fields live in components.
- Colors and handwriting font are defined in constants/theme.ts.
- Reanimated handles page entrances, button springs, floating illustrations and loading progress, respecting reduced-motion preferences.
- Photography and the handwriting font are bundled locally, so they do not need a network request at runtime.
- Auth forms use Zod validation, field-specific errors, password visibility controls, and keyboard-aware scrolling.

Sign-in and sign-up now redirect to Home in preview mode, and use real Supabase Auth when configured. See travel-ui.md for confirmation and error behavior. OAuth and recovery remain preview-only; policies remain draft placeholders.

The native splash configuration takes effect in a new development/production build. Expo Go controls its own native launch screen; the full-screen mountain welcome is visible in Expo Go after launch.

## Verification

TypeScript, iOS and web bundle compilation, and Expo dependency compatibility checks passed. Browser automation is unavailable in this environment, so a rendered device review is still needed.

On iPhone: restart Expo with npx expo start --clear; use the same Expo account on CLI and Expo Go. Check horizontal swipes, every pagination dot, Skip, back navigation, sign-in/signup links, empty/invalid forms, password visibility, terms/privacy dialogs, password recovery feedback, social option feedback, and the preview-to-loading-to-home transition. Also check the keyboard on a smaller screen and iOS Reduce Motion.
