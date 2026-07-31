# Fridge Magnets — Pre-Launch Verification Checklist

This checklist verifies that your Supabase schema matches the app requirements before deploying to production.

**Status**: ⚠️ **Action Required** — Missing `trip_photo_url` column (see Database Schema section).

---

## Database Schema Verification

### ✅ Profiles Table
- [x] Table `public.profiles` exists
- [x] Column `id` (UUID, PK, FK to auth.users)
- [x] Column `name` (text)
- [x] Column `email` (text)
- [x] Column `home_lat` (double precision)
- [x] Column `home_lng` (double precision)
- [x] Column `home_label` (text)
- [x] Column `map_public` (boolean, default: true)
- [x] Column `created_at` (timestamptz, default: now())
- [x] RLS enabled
- [x] Policy: `profiles_select_own` — users read their own
- [x] Policy: `profiles_update_own` — users update their own
- [x] Policy: `profiles_insert_own` — users insert their own
- [x] Policy: `profiles_select_public` — anyone reads public profiles (map_public=true)

### ⚠️ Magnets Table — NEEDS UPDATE
- [x] Table `public.magnets` exists
- [x] Column `id` (UUID, PK)
- [x] Column `user_id` (UUID, FK to profiles.id)
- [x] Column `city` (text)
- [x] Column `country` (text)
- [x] Column `lat` (double precision)
- [x] Column `lng` (double precision)
- [x] Column `caption` (text)
- [x] Column `instagram_url` (text, nullable)
- [x] Column `photo_url` (text)
- [x] Column `color` (text, with CHECK constraint)
- [x] Column `verified` (boolean)
- [x] Column `rotation` (double precision)
- [x] Column `scale` (double precision, nullable)
- [x] Column `pos_x` (double precision, nullable)
- [x] Column `pos_y` (double precision, nullable)
- [x] Column `created_at` (timestamptz, default: now())
- **❌ Column `trip_photo_url` (text, nullable) — MISSING**
  - The app code references `tripPhotoUrl` for optional trip photos in the story viewer
  - **Action**: Run migration `0003_add_trip_photo.sql` after deploying 0001/0002

### ✅ Indexes
- [x] Index on `magnets(user_id)` — exists
- ❌ Index on `magnets(created_at DESC)` — MISSING (needed for efficient recent-first queries)
  - **Action**: Included in migration `0003_add_trip_photo.sql`

### ✅ Row Level Security (Magnets)
- [x] RLS enabled
- [x] Policy: `magnets_all_own` — users full control (CRUD) their own magnets
- [x] Policy: `magnets_select_public` — anyone reads magnets from public profiles

### ✅ Auth Trigger
- [x] Function `public.handle_new_user()` exists
- [x] Trigger `on_auth_user_created` fires on auth.users INSERT
- [x] Auto-creates profile row with id, email, name

---

## Storage Bucket Verification

### ⚠️ Magnet Photos Bucket
Before deploying, verify in Supabase > Storage:

- [ ] Bucket `magnet-photos` exists
- [ ] Bucket is set to **Public** (not private)
- [ ] Storage policies are created (run `0002_storage.sql`):
  - [ ] Policy: `magnet_photos_public_read` — anyone can GET files
  - [ ] Policy: `magnet_photos_owner_insert` — owner can upload to their folder
  - [ ] Policy: `magnet_photos_owner_delete` — owner can delete their files
  - [ ] Policy: `magnet_photos_owner_update` — owner can update their files

**File path format**: `{user_id}/{magnet_id}.png`

---

## Authentication & Configuration

### Google OAuth
- [ ] Go to Supabase > Authentication > Providers > Google
- [ ] Confirm **Google** provider is **enabled**
- [ ] Client ID and Client Secret are set (from Google Cloud Console)
- [ ] Authorized redirect URI in Google Console includes: `https://<supabase-ref>.supabase.co/auth/v1/callback`

### Email/Password Auth
- [ ] Email/Password provider is enabled in Supabase > Authentication > Providers

### Auth Redirect URLs (Supabase)
Update these AFTER you have your Vercel domain:

- [ ] Site URL: `https://fridge-magnets.vercel.app` (or your domain)
- [ ] Redirect URLs include:
  - [ ] `https://fridge-magnets.vercel.app/onboarding/home`
  - [ ] `https://fridge-magnets.vercel.app/fridge`

---

## Deployment Checklist (Vercel)

- [ ] Push code to GitHub with all migrations committed
- [ ] Import project to Vercel
- [ ] Set environment variables in Vercel:
  - [ ] `VITE_SUPABASE_URL` = your Supabase Project URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
  - [ ] Variables set for **Production**, **Preview**, and **Development**
- [ ] Build succeeds and deploys (~2 min)
- [ ] Get Vercel domain (e.g., `https://fridge-magnets.vercel.app`)

---

## Pre-Launch Testing (After Deployment)

Test on the live Vercel URL:

### Authentication
- [ ] Sign up with email/password
  - Confirm profile auto-creates in `profiles` table
  - User redirects to `/onboarding/home`
- [ ] Set home city
  - Confirm `home_lat`, `home_lng`, `home_label` update in profiles table
  - User redirects to `/fridge`
- [ ] Sign in with Google (if enabled)
  - Confirm profile auto-creates
  - User redirects to `/onboarding/home` (if not onboarded)

### Magnet Creation
- [ ] Upload/capture a photo on `/add`
- [ ] See background removal work
- [ ] Set caption and Instagram link (optional)
- [ ] Confirm photo uploads to `Supabase Storage > magnet-photos/{userId}/{magnetId}.png`
- [ ] Confirm magnet row appears in `magnets` table with:
  - `photo_url` = public Supabase Storage URL
  - `trip_photo_url` = NULL (or filled if trip photo was added)
  - `verified` = true/false (based on GPS)
- [ ] View fridge — magnet displays correctly

### Story Viewer
- [ ] Tap magnet to open story viewer
- [ ] See full-screen photo (or Instagram embed if linked)
- [ ] Navigate with arrows or auto-advance
- [ ] Close with Esc or tap outside

### Settings & Privacy
- [ ] Update profile name
- [ ] Toggle `map_public` ON
  - Confirm row in profiles table updates
- [ ] Confirm you appear on the public map at your home coordinates
- [ ] Toggle `map_public` OFF
  - Confirm you disappear from map
- [ ] View magnets list
- [ ] Delete a magnet
  - Confirm row disappears from `magnets` table
  - Confirm file disappears from Storage

### Map & Discovery
- [ ] Visit `/map`
- [ ] See your fridge pin at home coordinates (if `map_public=true`)
- [ ] See clustered magnets if multiple users have public fridges
- [ ] Click cluster/pin to preview another user's fridge
- [ ] Tap a magnet in preview to open their full fridge

### Multi-User Test (Optional but Recommended)
- [ ] Sign up a second account
- [ ] Set home base to a different city
- [ ] Add a magnet
- [ ] Toggle `map_public=true`
- [ ] Sign out, sign back in as first user
- [ ] Visit `/map` — confirm second user's fridge appears
- [ ] Click their fridge preview
- [ ] Confirm their magnet loads correctly

---

## Common Issues & Fixes

### "Missing trip_photo_url column" Error on Add Magnet
- **Cause**: Migration `0003_add_trip_photo.sql` hasn't been run yet.
- **Fix**: In Supabase SQL Editor, run `0003_add_trip_photo.sql` before app is live.

### Photos Not Uploading to Storage
- **Cause 1**: `magnet-photos` bucket doesn't exist or isn't public.
  - Fix: Create bucket in Supabase Storage, toggle **Public**.
- **Cause 2**: Storage policies haven't been applied.
  - Fix: Run `0002_storage.sql` in Supabase SQL Editor.
- **Cause 3**: Environment variables aren't set in Vercel.
  - Fix: Go to Vercel > Project Settings > Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### "User already exists" on signup
- **Cause**: Email is already registered in this Supabase project.
- **Fix**: Use a different email, or delete the user from Supabase > Authentication > Users and try again.

### Google sign-in fails with redirect error
- **Cause**: Vercel domain not added to Google Console's authorized URIs, or Supabase Site URL doesn't match.
- **Fix**:
  1. In Google Cloud Console > APIs & Services > Credentials, find your OAuth client.
  2. Add `https://<your-vercel-domain>/auth/v1/callback` to Authorized redirect URIs.
  3. In Supabase > Authentication > URL Configuration, set Site URL to `https://<your-vercel-domain>`.

---

## Summary

**Before You Deploy:**
1. ✅ All schema tables and columns are correct
2. ⚠️ **Run migration `0003_add_trip_photo.sql`** to add missing column and index
3. ✅ All RLS policies are in place
4. ✅ Auth trigger auto-creates profiles
5. ⚠️ Verify storage bucket exists and is public
6. ⚠️ Run storage policies migration (`0002_storage.sql`)

**After Vercel Deployment:**
1. Update Supabase auth URLs to your Vercel domain
2. Run the full testing checklist above
3. Launch with confidence! 🎉

---

**Supabase Project Reference:**
- Project ID: `lrynubanuhhmmcfytbsk`
- Region: `eu-west-1`
- API URL: `https://lrynubanuhhmmcfytbsk.supabase.co`

For details on running these migrations, see [DEPLOY.md](./docs/DEPLOY.md).
