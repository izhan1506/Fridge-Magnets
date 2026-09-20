-- Give every profile a real, stored, unique fridge id.
--
-- Shareable links (`/fridge/fridge-0426`) used to be derived on the fly from
-- `abs(hash(userId)) % 10000`. Nothing enforced uniqueness, so two users could
-- hash to the same number — and because the resolver scans public profiles and
-- takes the first match, the loser's fridge simply became unreachable. At 15
-- users there are 0 collisions; the birthday bound puts the odds at ~50% by
-- ~118 users.
--
-- This migration adds the column and the constraint. It deliberately does NOT
-- backfill: reproducing the JavaScript hash in plpgsql (int32 wraparound and
-- all) would be a second implementation of it that nothing checks against the
-- first. `scripts/assign-fridge-ids.mjs` does the backfill instead, importing
-- the real `generateFridgeId` so existing links keep working.
--
-- Order: run this, then the script, then deploy. The resolver falls back to the
-- old hash scan while a row's fridge_id is still null, so nothing breaks in
-- between.

alter table public.profiles
  add column fridge_id text;

-- Keep the URL shape honest. Matches isFridgeId() in src/app/lib/fridge-id.ts.
alter table public.profiles
  add constraint profiles_fridge_id_format
  check (fridge_id ~ '^fridge-[0-9]{4}$');

-- The actual fix. Null is exempt in Postgres, which is what lets the backfill
-- run as a separate step. Declared as a table constraint rather than a bare
-- unique index so the name is reported as `constraint_name` when it fires —
-- handle_new_user() below matches on exactly that to decide what to retry.
alter table public.profiles
  add constraint profiles_fridge_id_key unique (fridge_id);

-- Pick a fridge id nobody holds. Scans the 10,000-wide space rather than
-- guessing, so it stays correct as the space fills instead of degrading into
-- retries; at these row counts the cost is irrelevant.
create function public.allocate_fridge_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  select id into candidate
  from (
    select 'fridge-' || lpad(g::text, 4, '0') as id
    from generate_series(0, 9999) g
  ) space
  where not exists (
    select 1 from public.profiles p where p.fridge_id = space.id
  )
  order by random()
  limit 1;

  if candidate is null then
    raise exception 'fridge id space is exhausted (10,000 taken)';
  end if;

  return candidate;
end;
$$;

-- Safety net for any insert that doesn't go through the trigger below.
alter table public.profiles
  alter column fridge_id set default public.allocate_fridge_id();

-- Assign an id at signup. allocate_fridge_id() reads committed rows, so two
-- concurrent signups can still pick the same id; the unique index catches that
-- and the loop retries rather than failing the signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt    int := 0;
  violated   text;
begin
  loop
    begin
      insert into public.profiles (id, email, name, fridge_id)
      values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        public.allocate_fridge_id()
      );
      return new;
    exception when unique_violation then
      get stacked diagnostics violated = constraint_name;
      -- Only a fridge id clash is worth retrying. A duplicate profile id is a
      -- real error and must surface.
      if violated is distinct from 'profiles_fridge_id_key' then
        raise;
      end if;
      attempt := attempt + 1;
      if attempt >= 20 then
        raise exception 'could not allocate a free fridge id after % attempts', attempt;
      end if;
    end;
  end loop;
end;
$$;
