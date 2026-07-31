-- Add trip_photo_url column to magnets table
-- This column stores an optional background-removed trip photo for display in the story viewer

alter table public.magnets
  add column trip_photo_url text;

-- Add index on created_at for efficient ordering (DESC for recent-first queries)
create index magnets_created_at_idx on public.magnets(created_at desc);
