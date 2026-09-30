-- Photo-backed quests and UTC activity streaks. No client may write completions or activity days.
create table public.quest_catalog (
  id text primary key,
  title text not null check (char_length(title) between 4 and 100),
  description text not null check (char_length(description) between 15 and 1000),
  category text not null check (category in ('Adventure','Nature','Food','Culture','Hidden Gems','Photography','Wellness','Community')),
  minutes integer not null check (minutes between 5 and 180),
  xp integer not null default 100 check (xp between 0 and 230),
  kind text not null check (kind in ('builtin','custom','generated','daily')),
  creator_id uuid references auth.users(id) on delete cascade,
  daily_day date unique,
  created_at timestamptz not null default now(),
  check ((kind = 'daily') = (daily_day is not null)),
  check ((kind in ('custom','generated')) = (creator_id is not null))
);
create table public.quest_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null references public.quest_catalog(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);
create index quest_enrollments_quest on public.quest_enrollments(quest_id);
create table public.travel_photo_posts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  caption text not null check (char_length(caption) between 5 and 2000),
  place text not null check (char_length(place) between 1 and 200),
  storage_path text not null unique,
  quest_id text references public.quest_catalog(id),
  created_at timestamptz not null default now()
);
create index travel_photo_posts_user on public.travel_photo_posts(user_id, created_at);
create table public.quest_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null references public.quest_catalog(id),
  post_id text not null unique references public.travel_photo_posts(id),
  completed_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);
create table public.activity_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_day date not null,
  primary key (user_id, activity_day)
);
alter table public.quest_catalog enable row level security;
alter table public.quest_enrollments enable row level security;
alter table public.travel_photo_posts enable row level security;
alter table public.quest_completions enable row level security;
alter table public.activity_days enable row level security;
revoke all on public.quest_catalog, public.quest_enrollments, public.travel_photo_posts, public.quest_completions, public.activity_days from anon, authenticated;
grant select on public.quest_catalog, public.quest_enrollments, public.travel_photo_posts, public.quest_completions, public.activity_days to authenticated;
grant insert (id,title,description,category,minutes,xp,kind,creator_id) on public.quest_catalog to authenticated;
create policy quest_catalog_read on public.quest_catalog for select to authenticated using (true);
create policy quest_catalog_create on public.quest_catalog for insert to authenticated with check (
  creator_id = (select auth.uid()) and kind in ('custom','generated') and id like kind || '-%'
);
create policy enrollment_own on public.quest_enrollments for select to authenticated using (user_id = (select auth.uid()));
create policy photo_posts_read on public.travel_photo_posts for select to authenticated using (true);
create policy completions_own on public.quest_completions for select to authenticated using (user_id = (select auth.uid()));
create policy activity_own on public.activity_days for select to authenticated using (user_id = (select auth.uid()));

insert into public.quest_catalog (id,title,description,category,minutes,xp,kind) values
('sunrise','Sunrise Viewpoint Quest','Hike to the top and capture the sunrise. Share your view and what it means to you.','Adventure',45,150,'builtin'),
('hidden-beach','Hidden Beach Discovery','Find a beach and share your photo. Leave only footprints behind.','Hidden Gems',25,100,'builtin'),
('local-food','Local Food Challenge','Try a local dish and tell us about it. Ask for a neighborhood favorite.','Food',30,80,'builtin'),
('historic-streets','Historic Streets Walk','Explore the old town and share a moment that made you stop and look.','Culture',35,100,'builtin'),
('secret-viewpoint','Secret Viewpoint Hike','Find a safe trail, reach a viewpoint and share your own photo.','Nature',60,120,'builtin');

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('quest-evidence','quest-evidence',false,8388608,array['image/jpeg'])
on conflict (id) do nothing;
create policy quest_photo_upload on storage.objects for insert to authenticated with check (
 bucket_id = 'quest-evidence' and split_part(name,'/',1) = (select auth.uid())::text and lower(name) like '%.jpg'
);
create policy quest_photo_read on storage.objects for select to authenticated using (
 bucket_id = 'quest-evidence' and (split_part(name,'/',1) = (select auth.uid())::text
 or exists (select 1 from public.travel_photo_posts p where p.storage_path = name))
);
create policy quest_photo_cleanup on storage.objects for delete to authenticated using (
 bucket_id = 'quest-evidence' and split_part(name,'/',1) = (select auth.uid())::text
 and not exists (select 1 from public.travel_photo_posts p where p.storage_path = name)
);

create function public.quest_ensure_daily() returns text language plpgsql security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'UTC')::date;
  slot integer := mod(today - date '1970-01-01', 7) + 1;
  quest_id text := 'daily-' || today::text;
  titles text[] := array['Notice something green','A taste of somewhere','Look up, look closer','Take the scenic route','A moment of calm','A small act of care','Find a local story'];
  categories text[] := array['Nature','Food','Photography','Adventure','Wellness','Community','Culture'];
  descriptions text[] := array[
    'Step outside and photograph a plant, tree, or green space you noticed today. Share one detail that caught your eye.',
    'Try a dish or ingredient that tells a local story. Post your own photo and tell us what you discovered.',
    'Find an interesting architectural detail in a public place. Photograph it and share what made you pause.',
    'Choose a safe, accessible route you do not usually take. Photograph a discovery along the way.',
    'Spend ten quiet minutes outside or by a window. Photograph the view that helped you slow down.',
    'Do a small act of care for your surroundings. Photograph the result without including anyone without permission.',
    'Find a public artwork, landmark, or historical detail. Photograph it and share what you learned.'
  ];
begin
  insert into public.quest_catalog(id,title,description,category,minutes,xp,kind,daily_day)
  values(quest_id,titles[slot],descriptions[slot],categories[slot],20,100,'daily',today) on conflict(id) do nothing;
  return quest_id;
end $$;
revoke all on function public.quest_ensure_daily() from public, anon, authenticated;

create function public.quest_join(p_quest_id text) returns void language plpgsql security definer set search_path = '' as $$
declare q public.quest_catalog; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first'; end if;
  perform public.quest_ensure_daily();
  select * into q from public.quest_catalog where id = p_quest_id;
  if not found then raise exception 'Quest not found'; end if;
  if q.kind = 'daily' and q.daily_day <> (now() at time zone 'UTC')::date then raise exception 'This daily challenge has ended'; end if;
  insert into public.quest_enrollments(user_id,quest_id) values(uid,p_quest_id) on conflict do nothing;
end $$;
revoke all on function public.quest_join(text) from public, anon, authenticated;
grant execute on function public.quest_join(text) to authenticated;

create function public.quest_publish_photo(p_id text,p_caption text,p_place text,p_storage_path text,p_quest_id text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); q public.quest_catalog; existing public.travel_photo_posts;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  if p_id is null or p_id !~ '^[a-z0-9-]{8,100}$' then raise exception 'Invalid post ID'; end if;
  -- Serialize retries/completion attempts for the same person.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select * into existing from public.travel_photo_posts where id = p_id;
  if found then
    if existing.user_id = uid and existing.storage_path = p_storage_path and existing.caption = btrim(p_caption)
      and existing.place = btrim(p_place) and existing.quest_id is not distinct from p_quest_id then return existing.id; end if;
    raise exception 'This post ID has already been used';
  end if;
  if p_caption is null or char_length(btrim(p_caption)) not between 5 and 2000
    or p_place is null or char_length(btrim(p_place)) not between 1 and 200 then raise exception 'Add a caption and location'; end if;
  if p_storage_path is null or split_part(p_storage_path,'/',1) <> uid::text then raise exception 'Use your own uploaded photo'; end if;
  if not exists(select 1 from storage.objects where bucket_id='quest-evidence' and name=p_storage_path
    and metadata->>'mimetype'='image/jpeg' and (metadata->>'size')::bigint between 1 and 8388608)
    then raise exception 'Upload a JPEG photo before publishing'; end if;
  if p_quest_id is not null then
    select * into q from public.quest_catalog where id=p_quest_id;
    if not found then raise exception 'Quest not found'; end if;
    if q.kind='daily' and q.daily_day <> (now() at time zone 'UTC')::date then raise exception 'This daily challenge has ended'; end if;
    if not exists(select 1 from public.quest_enrollments where user_id=uid and quest_id=p_quest_id)
      then raise exception 'Start the quest before completing it'; end if;
    if exists(select 1 from public.quest_completions where user_id=uid and quest_id=p_quest_id)
      then raise exception 'Quest already completed'; end if;
  end if;
  insert into public.travel_photo_posts(id,user_id,caption,place,storage_path,quest_id)
    values(p_id,uid,btrim(p_caption),btrim(p_place),p_storage_path,p_quest_id);
  if p_quest_id is not null then
    insert into public.quest_completions(user_id,quest_id,post_id) values(uid,p_quest_id,p_id);
  end if;
  insert into public.activity_days(user_id,activity_day) values(uid,(now() at time zone 'UTC')::date) on conflict do nothing;
  return p_id;
end $$;
revoke all on function public.quest_publish_photo(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.quest_publish_photo(text,text,text,text,text) to authenticated;

create function public.quest_dashboard() returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); daily_id text; result jsonb;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  daily_id := public.quest_ensure_daily();
  select jsonb_build_object(
    'day',(now() at time zone 'UTC')::date,
    'daily',(select to_jsonb(q) || jsonb_build_object('day',q.daily_day,'tag','DAILY','distance','Anywhere') from public.quest_catalog q where id=daily_id),
    'catalog',coalesce((select jsonb_agg(to_jsonb(q) || jsonb_build_object('day',q.daily_day,'tag',upper(q.kind),'distance','Your area'))
      from (select * from public.quest_catalog where kind <> 'daily' or id in (select quest_id from public.quest_enrollments where user_id=uid) order by created_at desc limit 500) q),'[]'::jsonb),
    'started',coalesce((select jsonb_agg(quest_id) from public.quest_enrollments where user_id=uid),'[]'::jsonb),
    'completed',coalesce((select jsonb_object_agg(quest_id,post_id) from public.quest_completions where user_id=uid),'{}'::jsonb),
    'days',coalesce((select jsonb_agg(activity_day) from public.activity_days where user_id=uid),'[]'::jsonb),
    'participant_count',(select count(*) from public.quest_enrollments where quest_id=daily_id),
    'participants',coalesce((select jsonb_agg(jsonb_build_object('name',people.name,'completed',people.completed)) from (
       select left(coalesce(p.display_name,u.raw_user_meta_data->>'display_name','Traveler'),80) as name,
       exists(select 1 from public.quest_completions c where c.user_id=e.user_id and c.quest_id=daily_id) as completed
       from public.quest_enrollments e join auth.users u on u.id=e.user_id
       left join public.profiles p on p.id=e.user_id
       where e.quest_id=daily_id order by e.joined_at limit 100
    ) people),'[]'::jsonb),
    'posts',coalesce((select jsonb_agg(jsonb_build_object(
       'id',p.id,'caption',p.caption,'place',p.place,'photoUri','','storagePath',p.storage_path,
       'createdAt',p.created_at,'questId',p.quest_id,'questTitle',q.title
     )) from (select * from public.travel_photo_posts where user_id=uid order by created_at desc limit 100) p
     left join public.quest_catalog q on q.id=p.quest_id),'[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.quest_dashboard() from public, anon, authenticated;
grant execute on function public.quest_dashboard() to authenticated;
