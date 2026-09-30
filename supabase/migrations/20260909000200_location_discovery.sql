-- Run after 20260909000100_quest_progress.sql.
-- Presence is opt-in, approximate (~1 km), and expires after two hours.
begin;
create table public.discovery_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  sharing boolean not null default false,
  status text not null default 'exploring' check (status in ('exploring','traveling')),
  updated_at timestamptz not null default now()
);
alter table public.discovery_presence enable row level security;
revoke all on public.discovery_presence from anon, authenticated;
grant select on public.discovery_presence to authenticated;
create policy presence_own on public.discovery_presence for select to authenticated using (user_id = (select auth.uid()));

alter table public.quest_catalog add column latitude double precision,
  add column longitude double precision,
  add constraint quest_coordinates check ((latitude is null and longitude is null) or
    (latitude is not null and longitude is not null and latitude between -90 and 90 and longitude between -180 and 180));
grant insert (latitude,longitude) on public.quest_catalog to authenticated;

create table public.travel_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  destination text not null check (char_length(destination) between 2 and 200),
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  shared boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.travel_trips enable row level security;
revoke all on public.travel_trips from anon, authenticated;
grant select, insert, update, delete on public.travel_trips to authenticated;
create policy trips_own on public.travel_trips for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Bounded spherical distance; longitude wrap and poles are handled by cosine.
create function public.discovery_distance(a double precision,b double precision,c double precision,d double precision)
returns double precision language sql immutable strict set search_path = '' as $$
  select 6371.0 * acos(least(1.0,greatest(-1.0,sin(radians(a))*sin(radians(c)) + cos(radians(a))*cos(radians(c))*cos(radians(d-b))));
$$;
revoke all on function public.discovery_distance(double precision,double precision,double precision,double precision) from public,anon,authenticated;

create function public.discovery_update(p_latitude double precision,p_longitude double precision,p_sharing boolean default null,p_status text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first'; end if;
  if p_latitude is null or p_longitude is null or not (p_latitude between -90 and 90) or not (p_longitude between -180 and 180) then raise exception 'Invalid coordinates'; end if;
  if p_status is not null and p_status not in ('exploring','traveling') then raise exception 'Invalid travel status'; end if;
  insert into public.discovery_presence(user_id,latitude,longitude,sharing,status)
  values(uid,round(p_latitude::numeric,2),round(p_longitude::numeric,2),coalesce(p_sharing,false),coalesce(p_status,'exploring'))
  on conflict(user_id) do update set latitude=excluded.latitude,longitude=excluded.longitude,
    sharing=coalesce(p_sharing,discovery_presence.sharing),status=coalesce(p_status,discovery_presence.status),updated_at=now();
end $$;
revoke all on function public.discovery_update(double precision,double precision,boolean,text) from public,anon,authenticated;
grant execute on function public.discovery_update(double precision,double precision,boolean,text) to authenticated;

create function public.discovery_nearby(p_latitude double precision,p_longitude double precision,p_radius_km double precision default 25)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); result jsonb;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  if p_latitude is null or p_longitude is null or not (p_latitude between -90 and 90) or not (p_longitude between -180 and 180)
    or p_radius_km is null or not (p_radius_km between 1 and 100) then raise exception 'Invalid search area'; end if;
  select jsonb_build_object(
    'sharing',coalesce((select sharing from public.discovery_presence where user_id=uid),false),
    'status',coalesce((select status from public.discovery_presence where user_id=uid),'exploring'),
    'people',coalesce((select jsonb_agg(to_jsonb(person)) from (
      select l.user_id as id,left(coalesce(nullif(p.display_name,''),u.raw_user_meta_data->>'display_name','Traveler'),80) as name,
        l.latitude,l.longitude,l.status,l.updated_at,
        public.discovery_distance(p_latitude,p_longitude,l.latitude,l.longitude) as distance_km,
        coalesce((select jsonb_agg(q.title) from public.quest_enrollments e join public.quest_catalog q on q.id=e.quest_id
          where e.user_id=l.user_id and e.joined_at > now()-interval '7 days'
          and (q.daily_day is null or q.daily_day=(now() at time zone 'UTC')::date)
          and not exists(select 1 from public.quest_completions c where c.user_id=e.user_id and c.quest_id=e.quest_id)), '[]'::jsonb) as quests
      from public.discovery_presence l join auth.users u on u.id=l.user_id left join public.profiles p on p.id=l.user_id
      where l.user_id<>uid and l.sharing and l.updated_at>now()-interval '2 hours'
        and public.discovery_distance(p_latitude,p_longitude,l.latitude,l.longitude)<=p_radius_km
      order by distance_km limit 100
    ) person),'[]'::jsonb),
    'quests',coalesce((select jsonb_agg(to_jsonb(quest)) from (
      select q.id,q.title,q.category,q.latitude,q.longitude,
        public.discovery_distance(p_latitude,p_longitude,q.latitude,q.longitude) as distance_km
      from public.quest_catalog q where q.latitude is not null
        and public.discovery_distance(p_latitude,p_longitude,q.latitude,q.longitude)<=p_radius_km
      order by distance_km limit 100
    ) quest),'[]'::jsonb),
    'trips',coalesce((select jsonb_agg(to_jsonb(trip)) from (
      select t.id,t.title,t.destination,t.starts_on,t.ends_on,t.latitude,t.longitude,
        left(coalesce(nullif(p.display_name,''),u.raw_user_meta_data->>'display_name','Traveler'),80) as name,
        public.discovery_distance(p_latitude,p_longitude,t.latitude,t.longitude) as distance_km
      from public.travel_trips t join auth.users u on u.id=t.user_id left join public.profiles p on p.id=t.user_id
      where t.shared and t.ends_on >= (now() at time zone 'UTC')::date
        and public.discovery_distance(p_latitude,p_longitude,t.latitude,t.longitude)<=p_radius_km
      order by distance_km,t.starts_on limit 100
    ) trip),'[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.discovery_nearby(double precision,double precision,double precision) from public,anon,authenticated;
grant execute on function public.discovery_nearby(double precision,double precision,double precision) to authenticated;
create index discovery_presence_recent on public.discovery_presence(updated_at) where sharing;
create index travel_trips_shared_dates on public.travel_trips(ends_on) where shared;
notify pgrst, 'reload schema';
commit;
