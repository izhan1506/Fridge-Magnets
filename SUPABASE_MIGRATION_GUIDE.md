# Supabase Migrations — Step-by-Step Guide

Follow this guide to set up your database. Takes ~10 minutes.

---

## Prerequisites

✅ You have a Supabase project created  
✅ You can log into [supabase.com](https://supabase.com)  
✅ You have the migration files from this repo in `supabase/migrations/`

---

## Step 1: Run Migration 0001_init.sql

This creates your profiles and magnets tables.

### 1a. Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Log in with your account
3. Click on your Fridge Magnets project (ID: `lrynubanuhhmmcfytbsk`)

### 1b. Open SQL Editor
1. In the left sidebar, click **SQL Editor** (looks like a database icon)
2. Click the **+ New Query** button (or the + icon in the top right)

### 1c. Copy & Paste Migration 0001
1. Open this file in your code editor:
   ```
   supabase/migrations/0001_init.sql
   ```

2. Copy **ALL the text** from that file

3. Paste it into the Supabase SQL Editor (the text area)

4. It should look like this:
   ```sql
   create table public.profiles (
     id          uuid primary key references auth.users(id) on delete cascade,
     name        text not null default '',
     ...
   );
   ```

### 1d. Run the Query
1. Click the blue **Run** button (or press `Ctrl+Enter`)
2. Wait for it to complete (~5 seconds)
3. You should see green checkmarks ✅ and success messages:
   ```
   ✅ Success: create table "profiles"
   ✅ Success: alter table "profiles" enable row level security
   ✅ Success: create policy "profiles_select_own"
   ... (4-5 more success messages)
   ```

### 1e. Verify
1. In the left sidebar, click **Database** (looks like a table icon)
2. Expand **public** schema
3. You should see two new tables:
   - ✅ `profiles`
   - ✅ `magnets`

✅ **Migration 0001 Complete!**

---

## Step 2: Run Migration 0002_storage.sql

This sets up photo upload permissions.

### 2a. Create a New Query
1. In SQL Editor, click **+ New Query** again
2. A new blank query window opens

### 2b. Copy & Paste Migration 0002
1. Open this file:
   ```
   supabase/migrations/0002_storage.sql
   ```

2. Copy **ALL the text**

3. Paste into the SQL Editor

4. It should look like:
   ```sql
   create policy "magnet_photos_public_read"
     on storage.objects for select
     using (bucket_id = 'magnet-photos');
   ...
   ```

### 2c. Run the Query
1. Click the blue **Run** button
2. Wait for completion (~3 seconds)
3. You should see green checkmarks ✅:
   ```
   ✅ Success: create policy "magnet_photos_public_read"
   ✅ Success: create policy "magnet_photos_owner_insert"
   ✅ Success: create policy "magnet_photos_owner_delete"
   ✅ Success: create policy "magnet_photos_owner_update"
   ```

✅ **Migration 0002 Complete!**

---

## Step 3: Run Migration 0003_add_trip_photo.sql

This adds the missing trip photo column (CRITICAL).

### 3a. Create a New Query
1. Click **+ New Query** again in SQL Editor

### 3b. Copy & Paste Migration 0003
1. Open this file:
   ```
   supabase/migrations/0003_add_trip_photo.sql
   ```

2. Copy **ALL the text**

3. Paste into the SQL Editor

4. It should look like:
   ```sql
   alter table public.magnets
     add column trip_photo_url text;
   
   create index magnets_created_at_idx on public.magnets(created_at desc);
   ```

### 3c. Run the Query
1. Click the blue **Run** button
2. Wait for completion (~3 seconds)
3. You should see green checkmarks ✅:
   ```
   ✅ Success: alter table "magnets"
   ✅ Success: create index "magnets_created_at_idx"
   ```

✅ **Migration 0003 Complete!**

---

## Step 4: Create the Storage Bucket

This is where user photos will be stored.

### 4a. Go to Storage
1. In the left sidebar, click **Storage** (looks like a folder icon)

### 4b. Create New Bucket
1. Click the **Create a new bucket** button (or **New bucket**)
2. A dialog appears asking for the bucket name

### 4c. Name the Bucket
1. Type: `magnet-photos` (exactly this, lowercase, with dash)
2. You should see a toggle for **Public bucket** below
3. Toggle **Public bucket** ON (it should be blue/enabled)
4. Click **Create bucket**

### 4d. Verify
1. You should now see `magnet-photos` in your storage buckets list
2. It should say **Public** next to it (not Private)

✅ **Storage Bucket Created!**

---

## Step 5: Verify Everything Works

### 5a. Check Profiles Table
1. Go to **Database** (left sidebar)
2. Expand **public** > **profiles**
3. You should see these columns:
   - ✅ `id`
   - ✅ `name`
   - ✅ `email`
   - ✅ `home_lat`
   - ✅ `home_lng`
   - ✅ `home_label`
   - ✅ `map_public`
   - ✅ `created_at`

### 5b. Check Magnets Table
1. Expand **public** > **magnets**
2. You should see these columns:
   - ✅ `id`
   - ✅ `user_id`
   - ✅ `city`
   - ✅ `country`
   - ✅ `lat`, `lng`
   - ✅ `caption`
   - ✅ `instagram_url`
   - ✅ `photo_url`
   - ✅ `trip_photo_url` ← This is NEW
   - ✅ `color`
   - ✅ `verified`
   - ✅ `rotation`
   - ✅ `scale`
   - ✅ `pos_x`, `pos_y`
   - ✅ `created_at`

### 5c. Check Indexes
1. Still in the magnets table, click the **Indexes** tab (or look for an indexes section)
2. You should see:
   - ✅ `magnets_user_id_idx` (for fast user lookups)
   - ✅ `magnets_created_at_idx` (for fast ordering) ← This is NEW

✅ **Everything Verified!**

---

## Troubleshooting

### Error: "Relation already exists"
**Cause**: You already ran this migration before.  
**Fix**: That's fine! Your database is already set up. Skip to Step 5 (verify).

### Error: "Column already exists"
**Cause**: `trip_photo_url` column was already added.  
**Fix**: That's fine! The database is ready. Continue to next step.

### Error: "Permission denied" or "Insufficient permissions"
**Cause**: Your Supabase role doesn't have permission to run SQL.  
**Fix**: 
1. Ask your Supabase project owner to give you SQL Editor access
2. Or go to **Project Settings > API > Service Role** and check permissions

### I don't see the new tables/columns
**Cause**: SQL Editor needs to refresh.  
**Fix**: 
1. Refresh the page (Cmd+R or F5)
2. Click **Database** in the left sidebar again
3. The tables should appear

---

## Next Steps

Once all 3 migrations are run and verified:

1. ✅ Go to [LAUNCH_STEPS.md](./LAUNCH_STEPS.md)
2. Follow **Step 2** (Verify Supabase Auth Setup)
3. Follow **Step 3** (Deploy to Vercel)
4. Follow **Step 4** (Update Auth Redirect URLs)
5. Follow **Step 5** (Pre-Launch Testing)

---

## Summary

| Migration | What it does | Status |
|-----------|-------------|--------|
| 0001 | Creates profiles & magnets tables | ⏳ Run in Step 1 |
| 0002 | Sets up photo upload permissions | ⏳ Run in Step 2 |
| 0003 | Adds trip_photo_url column & index | ⏳ Run in Step 3 |
| Storage | Creates magnet-photos bucket | ⏳ Create in Step 4 |

**Estimated time**: 10 minutes  
**Difficulty**: Easy (copy/paste & click Run)

---

**Questions?** Check [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) for more details.
