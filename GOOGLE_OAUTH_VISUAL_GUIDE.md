# Google OAuth - Visual Click-by-Click Guide

## QUICK MAP OF ALL PLACES TO CLICK

### Place 1: Google Cloud Console
```
console.cloud.google.com
│
├─ Top dropdown: "Select a Project" → "NEW PROJECT"
│  │
│  └─ Name: "Fridge Magnets" → CREATE
│
├─ Left sidebar: "APIs & Services"
│  │
│  ├─ Click: "Enabled APIs & services"
│  │  │
│  │  └─ Click: "+ ENABLE APIS AND SERVICES"
│  │     │
│  │     └─ Search: "Google+ API" → ENABLE
│  │
│  └─ Click: "Credentials"
│     │
│     ├─ Click: "+ CREATE CREDENTIALS" → "OAuth client ID"
│     │  │
│     │  ├─ [If popup] "CREATE CONSENT SCREEN" → External
│     │  │  │
│     │  │  ├─ Fill: App name, email
│     │  │  └─ "SAVE AND CONTINUE" (skip scopes, test users)
│     │  │
│     │  └─ Back to credentials → "+ CREATE CREDENTIALS" → "OAuth client ID"
│     │
│     └─ Select: "Web application"
│        │
│        ├─ Name: "Fridge Magnets Web"
│        │
│        ├─ "Authorized JavaScript origins" → "ADD URI"
│        │  └─ http://localhost:5173
│        │
│        ├─ "Authorized redirect URIs" → "ADD URI"
│        │  ├─ http://localhost:5173/auth/callback
│        │  └─ [After Step 2.2] https://PROJECT.supabase.co/auth/v1/callback
│        │
│        └─ "CREATE" → COPY Client ID & Secret
```

### Place 2: Supabase Dashboard
```
app.supabase.com
│
├─ Select your "Fridge Magnets" project
│
└─ Left sidebar: "Authentication"
   │
   └─ "Providers"
      │
      └─ Find "Google"
         │
         ├─ Copy "Redirect URL" (needed for Google Cloud)
         │
         ├─ Toggle "Enabled" → ON
         │
         ├─ Paste "Client ID" (from Google Cloud)
         │
         ├─ Paste "Client Secret" (from Google Cloud)
         │
         └─ "SAVE"
```

### Place 3: Your App
```
http://localhost:5173/auth
│
└─ Click: "Continue with Google" button
   │
   ├─ Google login popup
   ├─ Select account
   ├─ Allow permissions
   │
   └─ Redirects to: /onboarding/home
      │
      └─ Set home base → Fridge appears! ✅
```

---

## EXACT STEPS (Copy-Paste Ready)

### Google Cloud Setup

#### Step A: Create Project
```
1. google.cloud.google.com
2. Select dropdown (top) → "NEW PROJECT"
3. Name: Fridge Magnets
4. CREATE
5. Wait 30 seconds
```

#### Step B: Enable Google+ API
```
1. Left sidebar → "APIs & Services"
2. Click "Enabled APIs & services"
3. "+ ENABLE APIS AND SERVICES"
4. Search: "Google+ API"
5. Click result → "ENABLE"
6. Wait for loading
```

#### Step C: Create OAuth Credentials
```
1. Left sidebar → "APIs & Services" → "Credentials"
2. "+ CREATE CREDENTIALS" → "OAuth client ID"
3. [If prompted] "CREATE CONSENT SCREEN"
   - Select "External"
   - Click "CREATE"
   - Fill:
     * App name: Fridge Magnets
     * User support: youremail@gmail.com
     * Developer contact: youremail@gmail.com
   - "SAVE AND CONTINUE"
   - Skip scopes → "SAVE AND CONTINUE"
   - "SAVE AND CONTINUE" (test users)
   - "BACK TO DASHBOARD"
4. "+ CREATE CREDENTIALS" → "OAuth client ID"
5. Select "Web application"
6. Name: Fridge Magnets Web
7. "Authorized JavaScript origins" → "ADD URI"
   - Add: http://localhost:5173
8. "Authorized redirect URIs" → "ADD URI"
   - Add: http://localhost:5173/auth/callback
9. "CREATE"
10. ✅ Copy and save somewhere:
    - Client ID (looks like: 123456789-abc...@apps.googleusercontent.com)
    - Client Secret (looks like: GOCSP...)
```

#### Step D: Add Supabase URL to Google (AFTER Step F)
```
1. Find your OAuth Client in Credentials
2. Click on "Fridge Magnets Web"
3. "Authorized redirect URIs" → "ADD URI"
4. Paste: https://YOUR-PROJECT-NAME.supabase.co/auth/v1/callback
   [You'll get this in Step F]
5. "SAVE"
```

### Supabase Setup

#### Step E: Get Supabase Callback URL
```
1. app.supabase.com
2. Click your project
3. Left sidebar → "Authentication"
4. Click "Providers"
5. Find "Google" section
6. Copy "Redirect URL"
   ✅ Looks like: https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

#### Step F: Enable Google in Supabase
```
1. In "Google" provider section
2. Toggle "Enabled" → ON
3. Paste in "Client ID": [from Step C]
4. Paste in "Client Secret": [from Step C]
5. "SAVE"
```

### Test Your App

#### Step G: Test Google Login
```
1. Go to: http://localhost:5173/auth
2. Click "Continue with Google" button
3. Select your Google account
4. Click "Allow"
5. Should redirect to home base setup screen
6. Set home base (e.g., "New York")
7. Confirm
8. ✅ See your fridge!
```

---

## WHAT TO PASTE WHERE

### Your Credentials (Save These!)

After Step C, you'll have:
```
CLIENT_ID: ________________________________
CLIENT_SECRET: ________________________________
SUPABASE_CALLBACK: https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

### Into Supabase
```
Google Provider Settings:
  Client ID: [paste CLIENT_ID]
  Client Secret: [paste CLIENT_SECRET]
```

### Into Google Cloud Console
```
Authorized redirect URIs:
  - http://localhost:5173/auth/callback
  - https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

---

## COMMON MISTAKES TO AVOID

❌ **Wrong Parameter in Google Cloud**
- Don't use `?city=` → use `?q=` (only in your app code, not here)

❌ **Forgot to Enable Google+ API**
- You MUST enable it first, before creating credentials

❌ **Redirect URL doesn't match**
- Must be EXACTLY: `http://localhost:5173/auth/callback`
- Not: `http://localhost:5173/`
- Not: `http://localhost:5173/auth`

❌ **Forgot Supabase URL in Google**
- You need to add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` to Google

❌ **Copy-pasted with extra spaces**
- Client ID and Secret must be exact (no extra spaces)

---

## TIMELINE

- **Google Cloud Setup:** 5 minutes
- **Supabase Setup:** 2 minutes
- **Testing:** 1 minute
- **TOTAL:** ~8 minutes ⏱️

---

## If Something Goes Wrong

### "Redirect URI mismatch" Error
→ Check both places have the URL:
  1. Google Cloud Console (Authorized redirect URIs)
  2. Browser address bar matches what you're testing

### "Invalid client" Error
→ Client ID or Secret is wrong
→ Copy-paste again carefully (no spaces!)

### Button does nothing
→ Supabase Google provider might not be enabled
→ Check the toggle is ON

### See error in browser console (F12)
→ Check the exact error message
→ Usually means credentials don't match

---

## SUCCESS SIGNS

✅ Click "Continue with Google"
✅ Google login window appears
✅ Browser redirects back to your app
✅ See "Set your home base" screen
✅ Can search for a city
✅ Can set home base
✅ Can see fridge with magnets

**ALL 6 = YOU DID IT! 🎉**

---

## NEXT: Production Setup

Once you deploy to production (vercel, netlify, etc):

```
Google Cloud Console:
├─ Add production domain to "Authorized JavaScript origins"
│  Example: https://your-domain.com
│
└─ Add production domain to "Authorized redirect URIs"
   Example: https://your-domain.com/auth/callback
```

Supabase: No changes needed (already works for all domains)

---

That's it! You've got this! 💪
