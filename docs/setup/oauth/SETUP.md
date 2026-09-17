# Google OAuth Setup Guide

Your app already has the Google signin button and code! Now you need to configure Google OAuth in Supabase.

## Step 1: Create Google OAuth App

### 1a. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com
2. Create a new project (or select existing one)
3. Project name: "Fridge Magnets" (or your preference)
4. Click "Create"

### 1b. Enable Google+ API
1. Go to "APIs & Services" → "Enabled APIs & services"
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for "Google+ API"
4. Click on it and click "Enable"

### 1c. Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name: "Fridge Magnets Web"
5. Under "Authorized JavaScript origins" add:
   - `http://localhost:5173` (local development)
   - `http://localhost:3000` (if needed)
   - `https://your-domain.com` (production domain)

6. Under "Authorized redirect URIs" add:
   - `http://localhost:5173/auth/callback`
   - `https://your-domain.com/auth/callback`
   - **IMPORTANT:** Also add your Supabase OAuth callback URL (see Step 2)

7. Click "Create"
8. Copy the **Client ID** (you'll need this for Supabase)

## Step 2: Configure Google OAuth in Supabase

### 2a. Get Your Supabase Redirect URL
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" and click to expand
5. Copy the "Redirect URL" shown (looks like: `https://your-project.supabase.co/auth/v1/callback`)
6. **Add this URL to your Google OAuth app** (in Google Cloud Console under Authorized redirect URIs)

### 2b. Enable Google in Supabase
1. In Supabase Dashboard → "Authentication" → "Providers"
2. Find "Google" and toggle it ON
3. Paste your Google **Client ID** (from Step 1c)
4. You'll need the **Client Secret** from Google Cloud Console:
   - Go back to Google Cloud Console
   - APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Copy the **Client Secret**
5. Paste the **Client Secret** in Supabase
6. Click "Save"

## Step 3: Configure Supabase Redirect URL

The app currently redirects to `/onboarding/home` after Google login. Make sure this is configured:

**File:** `src/app/lib/store.ts` (line 116-122)

Current redirect:
```typescript
redirectTo: window.location.origin + "/onboarding/home"
```

This is correct! After Google OAuth, users will land on the home base setup screen.

## Step 4: Test Google Signin

1. **Refresh your app:** http://localhost:5173/auth
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected to `/onboarding/home`
5. Set your home base
6. You should see your fridge!

## Step 5: Setup User Profile Auto-Creation

When a user signs in with Google, they need a profile created. Check your Supabase SQL:

**Your Supabase Database should have:**
1. `auth.users` table (automatic, managed by Supabase)
2. `public.profiles` table with:
   ```sql
   CREATE TABLE profiles (
     id UUID NOT NULL PRIMARY KEY,
     email TEXT,
     name TEXT,
     homeLat FLOAT DEFAULT 0,
     homeLng FLOAT DEFAULT 0,
     homeLabel TEXT DEFAULT '',
     mapPublic BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
   );
   ```

3. **Auth Trigger** to auto-create profile on signup:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, name)
     VALUES (
       NEW.id,
       NEW.email,
       (NEW.raw_user_meta_data->>'full_name')::TEXT || (NEW.raw_user_meta_data->>'name')::TEXT
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

## Current Implementation Details

### What's Already in Your Code

**Google Login Function** (`src/app/lib/store.ts:116`)
```typescript
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/onboarding/home",
    },
  });
  if (error) throw error;
}
```

**UI Button** (`src/app/components/screens/Auth.tsx:90`)
- Google button with icon
- Calls `signInWithGoogle()` on click
- Shows loading state while authenticating

**Session Management** (`src/app/lib/session.tsx`)
- Listens to `onAuthStateChange` 
- Auto-loads user profile after Google redirect
- Syncs authentication state with app

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Fix:** Make sure the Supabase callback URL is added to Google OAuth authorized redirect URIs

### Issue: "Invalid client"
**Fix:** Check that your Google Client ID is correct in Supabase dashboard

### Issue: "User can't see profile after login"
**Fix:** Make sure the `profiles` table exists and the trigger is set up correctly

### Issue: "Google button doesn't work in production"
**Fix:** Add your production domain to Google OAuth authorized origins

### Issue: "Can't access Google features"
**Fix:** Make sure Google+ API is enabled in Google Cloud Console

## Production Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth credentials created (Client ID & Secret)
- [ ] Authorized origins include production domain
- [ ] Authorized redirect URIs include Supabase callback + production domain
- [ ] Google OAuth enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] User profiles table exists in Supabase
- [ ] Auth trigger created for auto-profile creation
- [ ] Tested Google login locally
- [ ] Tested Google login on production domain

## Next Steps

1. Follow Steps 1-2 above
2. Test on http://localhost:5173/auth
3. Try signing in with Google
4. Verify profile creation in Supabase dashboard
5. Test home base setup after Google login
6. Deploy to production and repeat on production domain

## Files Involved

- `src/app/lib/store.ts` - Google OAuth logic
- `src/app/lib/supabase.ts` - Supabase client
- `src/app/lib/session.tsx` - Auth state management
- `src/app/components/screens/Auth.tsx` - Login UI

All code is ready! Just need to configure Google OAuth credentials.
