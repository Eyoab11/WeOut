# Types

Generate database types here after applying migrations: from the repository root run `npx supabase gen types typescript --local > mobile/src/types/database.ts`. Then pass `Database` to `createClient<Database>`.
