# 🚀 Google OAuth Setup - START HERE

## The 4-Minute Setup

Your app **already has the Google button**. You just need to connect it to Google.

### Right Now, Do This:

#### 1️⃣ Go to Google Cloud Console (2 min)

```
https://console.cloud.google.com
```

- Create new project: **"Fridge Magnets"**
- Enable API: Search **"Google+ API"** → Enable
- Create OAuth credentials:
  - Go to **Credentials**
  - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
  - [If popup: Create consent screen → fill basic info → save]
  - Choose **Web application**
  - Add **Authorized JavaScript origins**: `http://localhost:5173`
  - Add **Authorized redirect URIs**: `http://localhost:5173/auth/callback`
  - Click **CREATE**
  - **COPY and SAVE your Client ID and Client Secret** ✅

#### 2️⃣ Go to Supabase Dashboard (1 min)

```
https://app.supabase.com
```

- Go to your **Fridge Magnets** project
- Click **Authentication** → **Providers**
- Find **Google**
- **Copy the "Redirect URL"** (you need it for Google)
- Go back to Google Cloud Console
- Add that Supabase URL to Google: **Authorized redirect URIs** → Add: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

#### 3️⃣ Back to Supabase (1 min)

- In Google provider section:
  - Toggle **Enabled** → ON
  - Paste **Client ID** (from Google)
  - Paste **Client Secret** (from Google)
  - Click **SAVE**

#### 4️⃣ Test It (30 seconds)

```
http://localhost:5173/auth
```

- Click **"Continue with Google"**
- Sign in with your Google account
- Should see home base setup screen ✅

---

## That's It!

Your Google login is now live. Users can:
- Click "Continue with Google"
- Sign in instantly
- Set home base
- Start using Fridge Magnets

---

## Need More Details?

📋 **Full Step-by-Step:** `GOOGLE_OAUTH_STEP_BY_STEP.md`
🎨 **Visual Guide:** `GOOGLE_OAUTH_VISUAL_GUIDE.md`
⚡ **Quick Reference:** `GOOGLE_OAUTH_QUICK_START.md`

---

## Troubleshooting Quick Fixes

**"Redirect URI mismatch"**
→ Make sure `http://localhost:5173/auth/callback` is in Google Cloud Console

**"Invalid client"**
→ Double-check Client ID and Secret (no extra spaces!)

**Button does nothing**
→ Make sure Google is enabled in Supabase (toggle ON)

**See errors in browser (F12)**
→ Check Client ID/Secret match exactly

---

## Production Later

When deploying to production:
1. Add your domain to Google Cloud Console
2. Example: `https://your-domain.com`
3. That's it! Supabase works automatically.

---

## Your Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth credentials
- [ ] Copied Client ID and Secret
- [ ] Got Supabase callback URL
- [ ] Added Supabase URL to Google
- [ ] Enabled Google in Supabase
- [ ] Pasted Client ID in Supabase
- [ ] Pasted Client Secret in Supabase
- [ ] Tested at http://localhost:5173/auth
- [ ] Google login works! ✅

---

## What The Code Does (Already Ready)

When user clicks "Continue with Google":

```javascript
// This is already in your app
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin + "/onboarding/home"
  }
});
```

**You don't need to change any code.** Just add the credentials!

---

## Files Ready to Use

- ✅ `src/app/components/screens/Auth.tsx` - Google button UI
- ✅ `src/app/lib/store.ts` - Google signin logic
- ✅ `src/app/lib/session.tsx` - Auth state management
- ✅ All imports and dependencies ready

**Nothing to code. Just configure credentials.**

---

## One More Thing

After users sign in with Google:
1. They land on home base setup
2. They set their location
3. Their profile is auto-created in Supabase
4. They can add magnets
5. Profile saved with home location

Everything is connected and ready! 🎉

---

## Need Help?

1. **Stuck on Google Cloud Console?** → Read `GOOGLE_OAUTH_STEP_BY_STEP.md` Part 1
2. **Stuck on Supabase?** → Read `GOOGLE_OAUTH_STEP_BY_STEP.md` Part 2
3. **Want to see all options?** → Read `GOOGLE_OAUTH_VISUAL_GUIDE.md`
4. **Quick reference?** → Read `GOOGLE_OAUTH_QUICK_START.md`

---

**Ready? Go to Step 1 above and start! ⏱️**

Takes 4 minutes. Your Google login will be ready to test.
