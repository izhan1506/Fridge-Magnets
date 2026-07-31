# Supabase Setup Checklist for Fridge Magnets

Before going live, verify all these tables, storage, auth, and RLS policies are configured in Supabase.

## Database Tables

### 1. **profiles** table
Required columns:
- `id` (UUID, primary key) — matches auth.users.id
- `name` (text) — user's display name
- `email` (text) — user's email
- `home_lat` (numeric) — home base latitude
- `home_lng` (numeric) — home base longitude
- `home_label` (text) — home base label (e.g., "San Francisco, USA")
- `map_public` (boolean, default: false) — whether fridge is visible on world map
- `created_at` (timestamp, default: now()) — profile creation time

**Row Level Security (RLS):**
- Users can read their own profile
- Users can read any profile marked as map_public=true
- Users can only update their own profile
- Enable RLS for this table

### 2. **magnets** table
Required columns:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to profiles.id)
- `city` (text) — city name
- `country` (text) — country name
- `lat` (numeric) — latitude
- `lng` (numeric) — longitude
- `caption` (text) — user's caption/description
- `instagram_url` (text, nullable) — Instagram post/reel link
- `photo_url` (text) — Storage URL of the magnet photo (or data URL for old data)
- `trip_photo_url` (text, nullable) — Optional trip photo (data URL)
- `color` (text) — magnet color (coral, pink, blue, amber, teal, purple)
- `verified` (boolean) — true if location was verified by GPS
- `rotation` (numeric) — rotation in degrees (-6 to +6)
- `scale` (numeric, default: 1) — size multiplier
- `pos_x` (numeric, nullable) — fridge position X [0-1]
- `pos_y` (numeric, nullable) — fridge position Y [0-1]
- `created_at` (timestamp, default: now()) — magnet creation time

**Indexes:**
- Index on `user_id` (for fast user magnet lookups)
- Index on `created_at DESC` (for ordering)

**Row Level Security (RLS):**
- Users can read magnets from their own fridge (user_id = auth.uid())
- Users can read magnets from fridges marked as public
- Users can only insert/update/delete their own magnets
- Enable RLS for this table

---

## Storage Buckets

### **magnet-photos** bucket
- **Visibility:** Public (anyone can read)
- **Path format:** `{user_id}/{magnet_id}.png`
- **Upload permissions:** Authenticated users can only upload to their own folder
- **Size limit:** Recommend 5MB per file
- **Auto cleanup:** Consider lifecycle policy for abandoned files

**Storage RLS Policy:**
```
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (string_to_array(name, '/'))[1]);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'magnet-photos');
```

---

## Authentication Setup

### Email/Password
- ✅ Enabled (Supabase Auth)
- Email confirmation recommended for production
- Consider rate limiting (15-30 min between signup attempts)

### Google OAuth
- ✅ Enabled (Supabase Auth)
- Redirect URL: `https://fridge-magnets-three.vercel.app/onboarding/home`
- Credentials: Stored in Supabase Auth settings

### Database Trigger
Create a trigger that automatically creates a profile when a user signs up:

```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Deployment Checklist

- [ ] All 2 tables created with correct schema
- [ ] All columns present (especially `trip_photo_url` on magnets)
- [ ] Primary keys and foreign keys set up
- [ ] Indexes created for performance
- [ ] Row Level Security enabled on both tables
- [ ] RLS policies configured correctly
- [ ] Storage bucket created and public
- [ ] Storage RLS policies set
- [ ] Auth trigger for profile creation working
- [ ] Google OAuth redirect URL matches Vercel domain
- [ ] Environment variables set in Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## Testing Before Launch

1. **Sign up with email** → Profile should auto-create
2. **Set home base** → homeLat/homeLng/homeLabel should update
3. **Toggle map public** → mapPublic should update
4. **Create magnet** → Should appear in user's fridge
5. **Add Instagram link** → instagramUrl should update
6. **Add trip photo** → tripPhotoUrl should save
7. **Edit magnet position** → posX/posY should update
8. **Delete magnet** → Should delete from DB and Storage
9. **View public map** → Should show all public fridges
10. **Sign in with Google** → Should redirect to home base setup

---

## Project ID Reference
- **Supabase Project:** lrynubanuhhmmcfytbsk
- **Region:** eu-west-1
- **API URL:** https://lrynubanuhhmmcfytbsk.supabase.co
