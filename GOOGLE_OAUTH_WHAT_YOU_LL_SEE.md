# Google OAuth - What You'll See at Each Step

## Step 1: Google Cloud Console Homepage

### What You See:
```
┌─ Google Cloud Console ─────────────────────────┐
│                                                 │
│  Google Cloud                                   │
│                                                 │
│  [Select a Project ▼]  [Google Cloud]          │
│                                                 │
│  Getting Started                                │
│  ├─ Create a project                           │
│  ├─ Select a project                           │
│  └─ Quickstarts                                │
│                                                 │
│  Welcome                                        │
│  "Get started with Google Cloud"               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Click:
- Click **"Select a Project"** dropdown at top
- Click **"NEW PROJECT"**

---

## Step 2: Create Project Dialog

### What You See:
```
┌─ New Project ──────────────────────────────────┐
│                                                 │
│  Project name *                                 │
│  [_______________________]                      │
│                                                 │
│  Organization (optional)                        │
│  [Select Organization ▼]                       │
│                                                 │
│                            [CREATE] [CANCEL]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Type: **`Fridge Magnets`**
- Click **"CREATE"**
- Wait for project to load (~30 seconds)

---

## Step 3: APIs & Services

### What You See (After Project Created):
```
┌─ APIs & Services ──────────────────────────────┐
│                                                 │
│  Left Sidebar:                                  │
│  ├─ [Enabled APIs & services]                  │
│  ├─ [Credentials]                              │
│  ├─ OAuth consent screen                       │
│  └─ ...                                        │
│                                                 │
│  Main Area:                                     │
│  "No APIs enabled"                              │
│  [+ ENABLE APIS AND SERVICES]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Click **"+ ENABLE APIS AND SERVICES"** (blue button)

---

## Step 4: Search for Google+ API

### What You See:
```
┌─ APIs Search ──────────────────────────────────┐
│                                                 │
│  [Search box: ___________________]              │
│                                                 │
│  Results:                                       │
│  ├─ Google+ API (SOCIAL MEDIA)                 │
│  ├─ Google Drive API                           │
│  ├─ Google Meet API                            │
│  └─ ...                                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Type: **`Google+ API`**
- Click on **"Google+ API"** result
- Click **"ENABLE"** button

---

## Step 5: Google+ API Enabled

### What You See:
```
┌─ Google+ API ──────────────────────────────────┐
│                                                 │
│  [MANAGE] [SUPPORT] [DOCS]                     │
│                                                 │
│  Google+ API                                    │
│  "Status: API enabled"  ✓                       │
│                                                 │
│  Let you use Google+ features...                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Go to **Left Sidebar** → **"Credentials"**

---

## Step 6: Create OAuth Credentials

### What You See:
```
┌─ Credentials ──────────────────────────────────┐
│                                                 │
│  [+ CREATE CREDENTIALS ▼]                      │
│                                                 │
│  Credentials:                                   │
│  (empty - no credentials yet)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
- Might show: "You need to configure OAuth consent screen first"
  - Click **"CREATE CONSENT SCREEN"**
  - Choose **"External"** → **"CREATE"**

---

## Step 7: OAuth Consent Screen

### What You See:
```
┌─ OAuth consent screen ─────────────────────────┐
│                                                 │
│  App name *                                     │
│  [Fridge Magnets________________]              │
│                                                 │
│  User support email *                           │
│  [your-email@gmail.com__________]              │
│                                                 │
│  Developer contact info *                       │
│  [your-email@gmail.com__________]              │
│                                                 │
│                 [SAVE AND CONTINUE]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Fill in form
- Click **"SAVE AND CONTINUE"**
- Skip scopes page → **"SAVE AND CONTINUE"**
- Skip test users page → **"SAVE AND CONTINUE"**
- Click **"BACK TO DASHBOARD"**

---

## Step 8: Create OAuth Client ID (Again)

### What You See:
```
Same as Step 6 - back to Credentials page
```

### What to Do:
- Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
- Select **"Web application"**

---

## Step 9: Create OAuth Client ID Form

### What You See:
```
┌─ Create OAuth 2.0 Client ID ──────────────────┐
│                                                 │
│  Application type:                              │
│  (●) Web application                           │
│  ( ) Desktop app                               │
│  ( ) iOS                                       │
│  ( ) Android                                   │
│                                                 │
│  Name *                                         │
│  [Fridge Magnets Web_____________]             │
│                                                 │
│  Authorized JavaScript origins *                │
│  [ADD URI]                                     │
│                                                 │
│  Authorized redirect URIs *                     │
│  [ADD URI]                                     │
│                                                 │
│                              [CREATE] [CANCEL] │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Name: `Fridge Magnets Web`
- Click **"ADD URI"** under JavaScript origins
- Type: `http://localhost:5173`
- Click **"ADD URI"** under Redirect URIs
- Type: `http://localhost:5173/auth/callback`
- Click **"CREATE"**

---

## Step 10: Your Credentials Popup

### What You See:
```
┌─ OAuth client created ─────────────────────────┐
│                                                 │
│  Your Client ID:                                │
│  123456789-abc1def2ghi3jkl4mno5pqr6.apps.     │
│  googleusercontent.com                         │
│  [COPY]                                        │
│                                                 │
│  Your Client Secret:                            │
│  GOCSP_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o  │
│  [COPY]                                        │
│                                                 │
│  ⚠️  "Save your Client Secret - you'll only    │
│  see it this one time!"                        │
│                                                 │
│                               [OK]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- **COPY both values** and save somewhere safe (notepad, etc)
- Click **"OK"**

---

## Step 11: Supabase Dashboard

### What You See:
```
┌─ Supabase ─────────────────────────────────────┐
│                                                 │
│  Projects:                                      │
│  ├─ [Fridge Magnets] ← Click this              │
│  ├─ [Other Project]                            │
│  └─ ...                                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Click your **"Fridge Magnets"** project

---

## Step 12: Supabase Authentication

### What You See:
```
┌─ Fridge Magnets Project ──────────────────────┐
│                                                 │
│  Left Sidebar:                                  │
│  ├─ Dashboard                                  │
│  ├─ SQL Editor                                 │
│  ├─ [Authentication]  ← Click this             │
│  ├─ Database                                   │
│  └─ ...                                        │
│                                                 │
│  Main Area:                                     │
│  (Your project settings)                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Click **"Authentication"**

---

## Step 13: Providers List

### What You See:
```
┌─ Authentication ──────────────────────────────┐
│                                                 │
│  [Providers]  ← Click this tab                 │
│                                                 │
│  Email / Password                              │
│  ├─ [Enabled]                                 │
│  ├─ [Auth Providers]                          │
│  └─ [Manage] [Sign Out]                       │
│                                                 │
│  Social Auth Providers:                         │
│  ├─ Google         [Toggle: OFF]               │
│  ├─ GitHub         [Toggle: OFF]               │
│  ├─ Facebook       [Toggle: OFF]               │
│  └─ ...                                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
- Look for **"Google"** section
- Click on **"Google"** to expand it

---

## Step 14: Google Provider Settings

### What You See:
```
┌─ Google Provider ──────────────────────────────┐
│                                                 │
│  [Enabled] Toggle ○ (OFF)                      │
│                                                 │
│  Redirect URL:                                  │
│  https://YOUR-PROJECT.supabase.co/auth/v1/    │
│  callback                                      │
│  [COPY]                                        │
│                                                 │
│  Client ID *                                    │
│  [_______________________]                     │
│                                                 │
│  Client Secret *                                │
│  [_______________________]                     │
│                                                 │
│                              [SAVE] [CANCEL]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to Do:
1. **COPY the Redirect URL** - go back to Google Cloud Console
2. Add it to Google: **Credentials** → Your Client ID → **Authorized redirect URIs** → **ADD URI** → Paste it
3. Come back here
4. Toggle **"Enabled"** to **ON**
5. Paste your **Client ID** (from Step 10)
6. Paste your **Client Secret** (from Step 10)
7. Click **"SAVE"**

---

## Step 15: Test Your App

### What You See:
```
At http://localhost:5173/auth
│
├─ "Create your account"
├─ Email field
├─ Password field
│
├─ ────────────── or ──────────────
│
└─ [🔵 Google 🔴] "Continue with Google"
   
   ↓ CLICK THIS
   
   Google login popup appears:
   "Sign in to your Google account"
   [Select which account...]
   [Enter password if needed]
   [Allow permissions]
   
   ↓
   
   Browser redirects back:
   "Set your home base"
   Search box: [Search for a city...]
   
   ↓ SUCCESS! ✅
```

### What to Do:
- Click **"Continue with Google"**
- Sign in with your Google account
- Set your home base
- See your fridge!

---

## If You See This Error

### Error: "Redirect URI mismatch"
```
Error message:
"The redirect_uri parameter does not match 
the registered redirect_uri values."

FIX:
→ Go back to Google Cloud Console
→ Check your "Authorized redirect URIs"
→ Make sure http://localhost:5173/auth/callback is there
→ Make sure Supabase URL is there
→ Save
→ Reload app and try again
```

### Error: "Invalid client"
```
Error message:
"Client does not have permission..."

FIX:
→ Go to Supabase → Google Provider
→ Check Client ID (copy-paste again, no spaces)
→ Check Client Secret (copy-paste again, no spaces)
→ Click SAVE
→ Reload app and try again
```

---

## Success Screen

When everything works:

```
┌─ Set your home base ──────────────────────────┐
│                                                 │
│  ← Set your home base                          │
│  [Search for your city...]                     │
│                                                 │
│  [World map with pin]                          │
│                                                 │
│  Home base: New York, United States            │
│  Tap the map or search to drop your pin        │
│  [CONFIRM HOME BASE]                          │
│                                                 │
└─────────────────────────────────────────────────┘

THEN:

┌─ Your Fridge ─────────────────────────────────┐
│                                                 │
│  Your amazing fridge! 🧊                       │
│  (with magnets or empty)                       │
│                                                 │
│  [Fridge Map    +]   ← Navigation buttons      │
│  [  🧲   🧲  🧲 ]   ← Magnets/empty           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**YOU DID IT! 🎉**

---

That's what you'll see at each step. Follow along and you'll be done in 4 minutes!
