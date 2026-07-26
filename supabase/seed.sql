-- Seed data: 3 demo fridges + their magnets
-- These users are created via auth.users so they exist, but have no usable password.
-- They serve purely to satisfy the foreign key constraint and act as demo content.
--
-- Note: You may need to create these auth.users rows using one of these methods:
-- 1. Via Supabase CLI: supabase auth admin create-user --email priya@example.com --password <random>
-- 2. Via SQL (requires superuser or specific grant): insert into auth.users (...)
-- 3. Via the Supabase web dashboard's auth UI, then export
--
-- For now, this file assumes the auth.users rows exist. If they don't, the foreign key
-- constraint on profiles.id will fail. Create them first, then run this seed SQL.

insert into public.profiles (id, name, email, home_lat, home_lng, home_label, map_public)
values
  ('seed-priya-uuid', 'Priya', 'priya@example.com', 19.076, 72.8777, 'Mumbai, India', true),
  ('seed-marco-uuid', 'Marco', 'marco@example.com', 41.9028, 12.4964, 'Rome, Italy', true),
  ('seed-ana-uuid', 'Ana', 'ana@example.com', -23.5505, -46.6333, 'São Paulo, Brazil', true)
on conflict (id) do nothing;

insert into public.magnets (id, user_id, city, country, lat, lng, caption, photo_url, color, verified, rotation)
values
  ('seed-priya-magnet-1', 'seed-priya-uuid', 'Kyoto', 'Japan', 35.0116, 135.7681, 'A little piece of Kyoto.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=300&fit=crop&auto=format', 'purple', true, 3),
  ('seed-priya-magnet-2', 'seed-priya-uuid', 'Lisbon', 'Portugal', 38.7223, -9.1393, 'A little piece of Lisbon.', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=300&h=300&fit=crop&auto=format', 'coral', true, -2),
  ('seed-priya-magnet-3', 'seed-priya-uuid', 'Reykjavík', 'Iceland', 64.1466, -21.9426, 'A little piece of Reykjavík.', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=300&h=300&fit=crop&auto=format', 'blue', false, 4),

  ('seed-marco-magnet-1', 'seed-marco-uuid', 'Marrakesh', 'Morocco', 31.6295, -7.9811, 'A little piece of Marrakesh.', 'https://images.unsplash.com/photo-1598305209783-5b9b8e0d6e8f?w=300&h=300&fit=crop&auto=format', 'amber', true, 1),
  ('seed-marco-magnet-2', 'seed-marco-uuid', 'Athens', 'Greece', 37.9838, 23.7275, 'A little piece of Athens.', 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=300&h=300&fit=crop&auto=format', 'teal', true, -3),

  ('seed-ana-magnet-1', 'seed-ana-uuid', 'Cusco', 'Peru', -13.5319, -71.9675, 'A little piece of Cusco.', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&h=300&fit=crop&auto=format', 'pink', true, 2),
  ('seed-ana-magnet-2', 'seed-ana-uuid', 'Cartagena', 'Colombia', 10.391, -75.4794, 'A little piece of Cartagena.', 'https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=300&h=300&fit=crop&auto=format', 'coral', false, -4),
  ('seed-ana-magnet-3', 'seed-ana-uuid', 'Mexico City', 'Mexico', 19.4326, -99.1332, 'A little piece of Mexico City.', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=300&h=300&fit=crop&auto=format', 'amber', true, 3)
on conflict (id) do nothing;
