# Fridge Magnets — Deploy to Vercel + Supabase

This app is now wired to Supabase for authentication, database, and photo storage. Follow these steps to deploy it live.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. Click **New Project** and follow the wizard:
   - **Project name**: anything you like (e.g., "fridge-magnets")
   - **Region**: choose one close to your users (e.g., `us-east-1` for US)
   - **Database password**: save this somewhere safe (you won't need it for this app)
   - Click **Create new project** and wait for provisioning (~1 min).

3. Once ready, go to **Settings > API** and copy:
   - **Project URL** (looks like `https://abc123def.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)
   - Save these for Step 4 below.

## Step 2: Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **New Query** (or + button).
3. Copy & paste the entire content of `supabase/migrations/0001_init.sql` from this repo.
4. Click **Run**. You should see "Success" messages for each table, policy, function, and trigger.
5. Repeat with `supabase/migrations/0002_storage.sql` to create storage policies.

If you prefer to use the Supabase CLI locally:
```bash
npm install -g supabase
supabase link  # authenticate with your account
supabase db push  # pushes all migrations
```

## Step 3: Create the Storage Bucket

1. In your Supabase project, go to **Storage** (left sidebar).
2. Click **Create new bucket**.
3. Name it: **`magnet-photos`**
4. Toggle **Public bucket** ON (so photo URLs are publicly readable).
5. Click **Create bucket**.

The storage policies from Step 2 will handle access control — users can only upload to their own folder, but photos are publicly readable (private users' photos are never referenced by database queries anyway, per Row Level Security).

## Step 4: Enable Google OAuth (Optional but Recommended)

If you want users to be able to sign in with Google:

1. Go to **Authentication > Providers** in Supabase.
2. Find **Google** and toggle it ON.
3. You'll see two fields:
   - **Client ID**
   - **Client Secret**

4. To get these, go to [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project (e.g., "Fridge Magnets App").
   - Go to **APIs & Services > OAuth consent screen**:
     - Choose **External** user type.
     - Fill in app name ("Fridge Magnets"), support email, etc.
     - Save & continue through the scopes screen (no special scopes needed).
   - Go to **APIs & Services > Credentials**:
     - Click **Create Credentials > OAuth client ID**.
     - Choose **Web application**.
     - Add **Authorized redirect URIs**:
       ```
       https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
       ```
       (Replace `<your-supabase-project-ref>` with your actual project ref from the Supabase URL.)
     - Click **Create**. Copy the **Client ID** and **Client Secret**.

5. Paste them into the Supabase Google provider fields and click **Save**.

Note: Supabase has a built-in Google provider setup guide under the provider's toggle — follow it if these steps are unclear.

## Step 5: Configure Auth Redirect URLs

1. Still in Supabase, go to **Authentication > URL Configuration**.
2. Set **Site URL** to your eventual Vercel domain. For now, use:
   ```
   http://localhost:5173
   ```
   (You'll update this to the real Vercel URL after deployment.)

3. Add **Redirect URLs**:
   ```
   http://localhost:5173/onboarding/home
   http://localhost:5173/fridge
   ```

4. Click **Save**.

## Step 6: Seed Demo Data (Optional)

To populate the map with 3 demo fridges on day one, run the seed script:

1. Go back to **SQL Editor** in Supabase.
2. Click **New Query**.
3. Copy & paste `supabase/seed.sql` from this repo.
4. **Important**: This script assumes auth.users rows exist for the 3 demo users. Since they don't yet, you have two options:
   - **Option A (easiest)**: Comment out the seed script for now and skip this step. The 3 seed fridges won't appear on the map, but you can add your own magnets.
   - **Option B (if you want demo data)**: First, use the Supabase Auth UI or admin CLI to create three users:
     ```bash
     supabase auth admin create-user --email priya@example.com --password temp123456
     supabase auth admin create-user --email marco@example.com --password temp123456
     supabase auth admin create-user --email ana@example.com --password temp123456
     ```
     Then run the seed script.

## Step 7: Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

3. Install dependencies and run locally:
   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) and test:
   - Sign up with an email and password.
   - Confirm a profile row appears in Supabase > Database > `profiles` table.
   - Set your home city.
   - Add a magnet (allow camera + location permissions).
   - Check that a file appears in Supabase > Storage > `magnet-photos`.
   - View your fridge — the photo should load.
   - Go to the Map — your public fridge should appear (if `map_public` is true).
   - Sign in with Google (if configured) — test the OAuth redirect.
   - Delete a magnet — confirm both the DB row and Storage file are gone.

## Step 8: Deploy to Vercel

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add -A
   git commit -m "Wire Supabase backend + ready for production"
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/fridge-magnets.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in (or sign up).
   - Click **Import Project**.
   - Paste your GitHub repo URL or select it from the list.
   - Click **Import**.

3. **Set environment variables** in Vercel:
   - After import, you'll see a screen to add Environment Variables.
   - Add two variables for **all three environments** (Production, Preview, Development):
     - `VITE_SUPABASE_URL` = your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
   - Click **Deploy**.

4. **Wait for the build** (~2 min). Once it succeeds, you'll get a live URL (e.g., `https://fridge-magnets.vercel.app`).

## Step 9: Update Supabase Auth URLs

Now that you have your Vercel domain, update the redirect URLs in Supabase:

1. Go to Supabase > **Authentication > URL Configuration**.
2. Change **Site URL** to your Vercel domain:
   ```
   https://fridge-magnets.vercel.app
   ```
3. Add the Vercel domain to **Redirect URLs**:
   ```
   https://fridge-magnets.vercel.app/onboarding/home
   https://fridge-magnets.vercel.app/fridge
   ```
4. Click **Save**.

## Step 10: Verify Production

Visit your live Vercel URL and test:
- Sign up with email/password → confirm a profile is created in Supabase.
- Set home city.
- Add a magnet (use a file upload since browser camera may not work via HTTPS without special permissions).
- Confirm the photo file appears in Supabase Storage.
- View your fridge and the map.
- Sign out and sign back in.
- Delete a magnet.
- Invite a friend to sign up and test that you both see each other's public fridges on the map.

## Troubleshooting

### "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY" error on load

This means the environment variables didn't reach the browser at build time. In Vercel:
- Go to Project Settings > Environment Variables.
- Confirm both variables are set for Production/Preview/Development.
- Redeploy: go to Deployments and click the three dots > Redeploy on the latest deployment.

### Photos not uploading to Storage

- Check that the `magnet-photos` bucket exists and is public.
- Ensure `VITE_SUPABASE_ANON_KEY` is correct — it grants write access to the bucket.
- Check browser console (F12) for any Storage API errors.

### "Email already exists" on sign up

- Each email can only be used once per Supabase project. If you want to test multiple accounts, use different email addresses.
- To reset: delete the user from Supabase > Authentication > Users, then you can re-use that email.

### Google sign-in not working

- Confirm Google OAuth is enabled in Supabase > Authentication > Providers > Google.
- Ensure the Client ID and Client Secret are correct (they must be a matching pair).
- Confirm the Vercel domain is added to Google Cloud Console's Authorized Redirect URIs.
- Check browser console for redirect errors.

## Notes

- **Photos are stored as URLs** in the database, not inline base64. This means they can be arbitrarily large and don't bloat your database.
- **Row Level Security (RLS)** on the `profiles` and `magnets` tables means:
  - Users can only read/update their own profile.
  - Users can only create/delete their own magnets.
  - Everyone can read public users' profiles and magnets (if `map_public = true`).
  - Private users' data is never returned by any query, enforced at the database level.
- **Storage bucket policies** allow public read of all files (for photo URLs to work) and owner-only write/delete. A private user's photo URL is never handed to another user's session, so the data stays private.
- **Email confirmation** is disabled by default in Supabase (you can enable it in Authentication > Providers > Email for extra security, but it requires users to confirm emails before they can log in, adding friction). For this app, it's off so users can sign up and start adding magnets immediately.

---

**Need help?** See [Supabase docs](https://supabase.com/docs) or [Vercel docs](https://vercel.com/docs).
