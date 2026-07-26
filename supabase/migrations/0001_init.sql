-- Fridge Magnets: profiles and magnets tables with RLS

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  home_lat    double precision not null default 0,
  home_lng    double precision not null default 0,
  home_label  text not null default '',
  map_public  boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Owner can read their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Owner can update their own row
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Owner can insert their own row
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Anyone can read public profiles (powers map discovery)
create policy "profiles_select_public" on public.profiles
  for select using (map_public = true);

-- Magnets table
create table public.magnets (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  city           text not null,
  country        text not null default '',
  lat            double precision not null,
  lng            double precision not null,
  caption        text not null default '',
  instagram_url  text,
  photo_url      text not null,
  color          text not null check (color in ('coral','pink','blue','amber','teal','purple')),
  verified       boolean not null default false,
  rotation       double precision not null default 0,
  scale          double precision,
  pos_x          double precision,
  pos_y          double precision,
  created_at     timestamptz not null default now()
);

create index magnets_user_id_idx on public.magnets(user_id);

alter table public.magnets enable row level security;

-- Owner can do everything to their own magnets
create policy "magnets_all_own" on public.magnets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anyone can read magnets belonging to a public profile
create policy "magnets_select_public" on public.magnets
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = magnets.user_id and p.map_public = true
    )
  );

-- Auto-create profile row on auth signup via trigger
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
