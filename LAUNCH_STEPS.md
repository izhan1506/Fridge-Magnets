# Fridge Magnets — Launch Steps (Updated)

All code changes have been committed and pushed to GitHub. Follow these final steps to launch.

---

## Step 1: Supabase Migrations ⚙️

Run these migrations in your Supabase SQL Editor in order:

### 1a. Run `0001_init.sql` (if not already done)
- Go to **Supabase Dashboard > SQL Editor > New Query**
- Copy & paste content from `supabase/migrations/0001_init.sql`
- Click **Run**
- Confirm: 2 tables (profiles, magnets), RLS policies, auth trigger created

### 1b. Run `0002_storage.sql` (if not already done)
- Copy & paste content from `supabase/migrations/0002_storage.sql`
- Click **Run**
- Confirm: 4 storage policies created

### 1c. Run `0003_add_trip_photo.sql` (NEW - REQUIRED)
- Copy & paste content from `supabase/migrations/0003_add_trip_photo.sql`
- Click **Run**
- Confirm: `trip_photo_url` column added, `created_at DESC` index created

### 1d. Create Storage Bucket
- Go to **Supabase > Storage**
- Click **Create new bucket**
- Name: `magnet-photos`
- Toggle **Public bucket** ON
- Click **Create bucket**

---

## Step 2: Verify Supabase Auth Setup 🔐

### Google OAuth (Optional but Recommended)
- Go to **Supabase > Authentication > Providers > Google**
- Confirm toggle is **ON**
- Confirm Client ID and Client Secret are filled in
- ✅ Done

### Email/Password Auth
- Go to **Supabase > Authentication > Providers > Email**
- Confirm toggle is **ON**
- ✅ Done

---

## Step 3: Vercel Deployment 🚀

### Option A: If NOT yet deployed to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Import Project**
3. Paste GitHub repo URL: `https://github.com/izhan1506/Fridge-Magnets.git`
4. Click **Import**
5. Add environment variables (for all environments: Production, Preview, Development):
   - `VITE_SUPABASE_URL` = `https://lrynubanuhhmmcfytbsk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon public key from Supabase > Settings > API)
6. Click **Deploy**
7. Wait ~2 min for build to complete
8. Get your live URL (e.g., `https://fridge-magnets.vercel.app`)

### Option B: If already deployed, redeploy with latest code
1. Go to **Vercel > Project > Deployments**
2. Click three dots on latest deployment
3. Click **Redeploy**
4. Wait for build (~1-2 min)

---

## Step 4: Update Supabase Auth Redirect URLs 🔗

Now that your app is live on Vercel, update auth URLs:

1. Go to **Supabase > Authentication > URL Configuration**
2. Set **Site URL** to your Vercel domain:
   ```
   https://fridge-magnets.vercel.app
   ```
   (Or whatever your Vercel domain is)

3. Add **Redirect URLs**:
   ```
   https://fridge-magnets.vercel.app/onboarding/home
   https://fridge-magnets.vercel.app/fridge
   ```

4. Click **Save**

---

## Step 5: Pre-Launch Testing ✅

Visit your live Vercel URL and test:

### Quick Test (5 min)
- [ ] Sign up with email/password
- [ ] Set home base
- [ ] Add a magnet (upload a photo)
- [ ] View fridge — magnet displays
- [ ] Check Storage — file appears in `magnet-photos/`
- [ ] Delete magnet — confirms it's gone

### Full Test (15 min)
See **PRE_LAUNCH_CHECKLIST.md** for comprehensive testing:
- Auth (email + Google)
- Photo upload & storage
- Settings & privacy toggle
- Map & discovery
- Story viewer
- Multi-user (optional)

---

## Current Status ✅

| Item | Status |
|------|--------|
| Code on GitHub | ✅ Pushed (commit b071516) |
| Schema Migration (0001) | ⏳ Run in Supabase |
| Storage Policies (0002) | ⏳ Run in Supabase |
| Trip Photo Migration (0003) | ⏳ Run in Supabase |
| Storage Bucket | ⏳ Create in Supabase |
| Vercel Deployment | ⏳ Deploy or Redeploy |
| Auth URLs in Supabase | ⏳ Update after Vercel deployment |
| Pre-Launch Testing | ⏳ Test after all above done |

---

## Quick Reference

**GitHub**: https://github.com/izhan1506/Fridge-Magnets  
**Supabase Project**: `lrynubanuhhmmcfytbsk` (eu-west-1)  
**Vercel Project**: `fridge-magnets` (or rename to `fridgetales`)  

---

**Next Action**: Start with **Step 1a** — run the Supabase migrations.

Need help? Check `PRE_LAUNCH_CHECKLIST.md` for troubleshooting common issues.
