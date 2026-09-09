-- Initial private profile foundation. Public discovery needs a separate safe projection.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  home_city text,
  country_code text,
  date_of_birth date,
  personality jsonb not null default '{}'::jsonb,
  travel_preferences text[] not null default '{}',
  languages text[] not null default '{}',
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, username, display_name, bio, avatar_url, cover_url, home_city,
  country_code, date_of_birth, personality, travel_preferences, languages)
  on public.profiles to authenticated;
grant update (username, display_name, bio, avatar_url, cover_url, home_city,
  country_code, date_of_birth, personality, travel_preferences, languages)
  on public.profiles to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
