# Setup verification

Verified during initialization on 2026-09-08:

- TypeScript: `npm --prefix mobile run typecheck` passed.
- Expo SDK dependency compatibility: `expo install --check` passed.
- iOS JavaScript/Hermes export: `expo export --platform ios --output-dir dist/ios` passed.
- Supabase CLI initialization succeeded; Docker is available.
- No physical iPhone test was performed.
- Database migrations have not been executed. The Supabase database image is not installed locally; run the documented local setup before testing backend behavior.
- Hosted Supabase, Storage and Realtime have not been configured or deployed.

The mobile npm audit reports 14 moderate entries propagated from transitive `uuid` and `decode-uri-component` dependencies through the Expo toolchain/router. No high or critical entries were reported. npm suggests incompatible Expo/Router downgrades for some entries; no forced dependency changes were applied. Review upstream fixes before production.
