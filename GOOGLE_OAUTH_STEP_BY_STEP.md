# Google OAuth Setup - DETAILED Step by Step

## PART 1: Create Google OAuth Credentials

### Step 1.1: Go to Google Cloud Console

1. Open your browser
2. Go to: **https://console.cloud.google.com**
3. Sign in with your Google account (create one if needed)

### Step 1.2: Create a New Project

1. At the top, look for **"Select a Project"** dropdown
2. Click on it
3. Click **"NEW PROJECT"** button (blue button)
4. Enter Project Name: **`Fridge Magnets`** (or any name)
5. Click **"CREATE"**
6. Wait for project to be created (takes 30 seconds)

### Step 1.3: Enable Google+ API

1. On the left sidebar, click **"APIs & Services"**
2. Click **"Enabled APIs & services"** (second option)
3. Click **"+ ENABLE APIS AND SERVICES"** (blue button at top)
4. In the search box, type: **`Google+ API`**
5. Click on the result that says **"Google+ API"**
6. Click **"ENABLE"** (blue button)
7. Wait for it to enable (shows a loading animation)

### Step 1.4: Create OAuth Credentials

1. On the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"** (first option)
3. Click **"+ CREATE CREDENTIALS"** (blue button)
4. Select **"OAuth client ID"** (from the dropdown)
5. A popup says "You need to configure the OAuth consent screen first"
   - Click **"CREATE CONSENT SCREEN"** button
   - Select **"External"** → Click **"CREATE"**
   - Fill in:
     - App name: `Fridge Magnets`
     - User support email: `your-email@gmail.com` (your Google email)
     - Developer contact: `your-email@gmail.com`
   - Scroll down, click **"SAVE AND CONTINUE"**
   - (Skip scopes, just click "SAVE AND CONTINUE" again)
   - On "Test users" page, click **"SAVE AND CONTINUE"**
   - Click **"BACK TO DASHBOARD"**

6. Now go back to create credentials:
   - Click **"+ CREATE CREDENTIALS"** again
   - Select **"OAuth client ID"**
   - Choose **"Web application"**
   - Name: `Fridge Magnets Web`

### Step 1.5: Add Authorized URLs

In the form that appears:

**Authorized JavaScript origins** - Click "ADD URI" and add:
```
http://localhost:5173
```

**Authorized redirect URIs** - Click "ADD URI" and add:
```
http://localhost:5173/auth/callback
```

(We'll add production URLs later)

### Step 1.6: Copy Your Credentials

1. Click **"CREATE"**
2. A popup appears with your credentials
3. Copy **"Your Client ID"** and save it somewhere (notepad, etc)
   - Looks like: `123456789-abc...apps.googleusercontent.com`
4. Copy **"Your Client Secret"** and save it too
   - Looks like: `GOCSP...`
5. Click **"OK"** to close

✅ **PART 1 COMPLETE** - You now have:
- Client ID
- Client Secret

---

## PART 2: Enable Google in Supabase

### Step 2.1: Go to Supabase Dashboard

1. Open browser
2. Go to: **https://app.supabase.com**
3. Sign in with your Supabase account (create one if needed)
4. Click on your project (Fridge Magnets project)

### Step 2.2: Get Your Supabase Callback URL

1. On left sidebar, click **"Authentication"**
2. Click **"Providers"** (second menu option)
3. Scroll down to find **"Google"** (should see it in the list)
4. Click on **"Google"** to expand it
5. Look for **"Redirect URL"** field
6. It looks like: `https://YOUR-PROJECT-NAME.supabase.co/auth/v1/callback`
7. **COPY THIS URL** - you need it for Google OAuth

### Step 2.3: Add Supabase URL to Google OAuth

1. Go back to Google Cloud Console (in another tab)
2. Go to: **APIs & Services** → **Credentials**
3. Find your OAuth Client ID (named "Fridge Magnets Web")
4. Click on it to edit
5. Under **"Authorized redirect URIs"**, click **"ADD URI"**
6. Paste the Supabase URL from Step 2.2
7. Click **"SAVE"**

### Step 2.4: Enable Google in Supabase

1. Go back to Supabase tab
2. In the **"Google"** provider section, toggle **"Enabled"** (turn it ON)
3. Paste your **"Client ID"** (from Step 1.6) in the "Client ID" field
4. Paste your **"Client Secret"** (from Step 1.6) in the "Client Secret" field
5. Click **"SAVE"**

✅ **PART 2 COMPLETE** - Google OAuth is now enabled in Supabase

---

## PART 3: Test Google Login

### Step 3.1: Start Your App

1. Open terminal
2. Go to your Fridge Magnets app folder:
   ```bash
   cd "/Users/getlicensed/Downloads/Claud Projects/Fridge magnets V2/React Fridge magnets app"
   ```
3. Make sure dev server is running:
   ```bash
   npm run dev
   ```
4. Check the output - should show:
   ```
   ➜ Local: http://localhost:5173/
   ```

### Step 3.2: Test the Login

1. Open browser
2. Go to: **http://localhost:5173/auth**
3. Click **"Continue with Google"** button (the one with Google icon)
4. A Google login popup/window appears
5. Select your Google account
6. Click "Allow" to give permission
7. Browser should redirect back to the app
8. You should see **"Set your home base"** screen ✅

### Step 3.3: Set Home Base

1. Search for a city (e.g., "New York")
2. Click on it
3. Click **"Confirm home base"**
4. You should see your fridge with magnets! ✅

✅ **PART 3 COMPLETE** - Google login is working!

---

## PART 4: Fix Common Issues

### Issue: "Redirect URI mismatch"

**Solution:**
1. Go to Google Cloud Console
2. Go to Credentials
3. Click your OAuth Client ID
4. Make sure `http://localhost:5173/auth/callback` is in "Authorized redirect URIs"
5. Also make sure your Supabase URL is there
6. Click "SAVE"

### Issue: "Invalid client"

**Solution:**
1. Go to Supabase → Authentication → Providers → Google
2. Check that Client ID and Client Secret are correct
3. They should match exactly what's in Google Cloud Console
4. Click "SAVE" again

### Issue: "Google button does nothing"

**Solution:**
1. Make sure you're on `http://localhost:5173/auth` (not localhost:5173)
2. Check browser console (F12) for errors
3. Make sure Supabase is enabled for Google (toggle should be ON)

### Issue: "Can't find the Google button"

**Solution:**
1. Go to http://localhost:5173/auth
2. Scroll down (it's below the email login)
3. Should see orange and blue Google icon

---

## PART 5: Deploy to Production (Later)

When you're ready to deploy to production:

### Step 5.1: Add Production URL to Google

1. Go to Google Cloud Console → Credentials
2. Click your OAuth Client ID
3. Under "Authorized JavaScript origins", click "ADD URI"
4. Add: `https://your-domain.com`
5. Under "Authorized redirect URIs", click "ADD URI"
6. Add: `https://your-domain.com/auth/callback`
7. Click "SAVE"

### Step 5.2: Deploy Your App

1. Deploy to Vercel, Netlify, or your hosting
2. Google login should work automatically!

---

## Checklist - Did You Complete All Steps?

- [ ] Step 1.1: Opened Google Cloud Console
- [ ] Step 1.2: Created new project "Fridge Magnets"
- [ ] Step 1.3: Enabled Google+ API
- [ ] Step 1.4: Created OAuth Client ID (went through consent screen)
- [ ] Step 1.5: Added `http://localhost:5173` as authorized origin
- [ ] Step 1.5: Added `http://localhost:5173/auth/callback` as redirect URI
- [ ] Step 1.6: Copied Client ID and Client Secret
- [ ] Step 2.1: Opened Supabase Dashboard
- [ ] Step 2.2: Copied Supabase Redirect URL
- [ ] Step 2.3: Added Supabase URL to Google OAuth (in Google Cloud)
- [ ] Step 2.4: Enabled Google in Supabase
- [ ] Step 2.4: Pasted Client ID in Supabase
- [ ] Step 2.4: Pasted Client Secret in Supabase
- [ ] Step 3.1: Dev server running on port 5173
- [ ] Step 3.2: Tested Google login at http://localhost:5173/auth
- [ ] Step 3.3: Successfully set home base
- [ ] Step 3.3: See fridge with magnets

## Need Help?

If something doesn't work:
1. Check the issue section (Part 4)
2. Check browser console (F12 → Console tab)
3. Make sure all URLs match exactly
4. Make sure Client ID and Secret are correct (copy-paste, no extra spaces)

---

## You're Done! 🎉

Google login is now working. Users can:
1. Click "Continue with Google"
2. Sign in with Google account
3. Set home base
4. See their fridge
5. Start adding magnets!
