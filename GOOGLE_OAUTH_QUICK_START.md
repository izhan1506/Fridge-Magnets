# Google OAuth - Quick Start (5 minutes)

## TL;DR - What You Need to Do

### 1. Create Google OAuth Credentials (2 min)
```
Google Cloud Console → APIs & Services → Credentials
→ Create OAuth 2.0 Client ID (Web application)
→ Copy Client ID and Client Secret
```

**Authorized Origins:**
- `http://localhost:5173`
- `https://your-domain.com`

**Authorized Redirect URIs:**
- `http://localhost:5173/auth/callback`
- `https://[your-project].supabase.co/auth/v1/callback` (see Step 2)

### 2. Enable Google in Supabase (2 min)
```
Supabase Dashboard → Authentication → Providers
→ Find "Google" → Enable
→ Paste Client ID
→ Paste Client Secret
→ Save
```

### 3. Test (1 min)
```
Go to: http://localhost:5173/auth
Click "Continue with Google"
Should redirect to home base setup
```

## Your Current Status

✅ **Already Done:**
- Google button in Auth screen
- Google signin function implemented
- Auth state management connected
- Environment variables configured

❌ **Still Needed:**
- Google OAuth credentials from Google Cloud Console
- Enable Google provider in Supabase
- Add credentials to Supabase dashboard

## The Google Login Flow

```
User clicks "Continue with Google"
         ↓
Browser opens Google signin
         ↓
User authenticates with Google
         ↓
Browser redirected to Supabase callback
         ↓
Supabase creates/finds user
         ↓
User redirected to app's /onboarding/home
         ↓
App loads user profile
         ↓
User sets home base
         ↓
Fridge appears! 🧲
```

## File: Where Google Auth Is Implemented

**Sign-in logic:**
- `src/app/lib/store.ts` line 116-125

**UI Button:**
- `src/app/components/screens/Auth.tsx` line 90-105

**Session management:**
- `src/app/lib/session.tsx` (watches for auth changes)

## What Your Code Does

```typescript
// When user clicks "Continue with Google"
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin + "/onboarding/home"
  }
});
```

That's it! No extra code needed. Just configure the credentials in Google Cloud + Supabase.

## Production Deployment

After local testing, add your production domain:

**Google Cloud Console:**
- Authorized origins: `https://your-domain.com`
- Authorized redirect URI: `https://your-domain.com/auth/callback`

**Supabase:** No changes needed (already configured)

## Support

If you get stuck:
1. Check GOOGLE_OAUTH_SETUP.md for detailed instructions
2. Verify Client ID/Secret are correct
3. Make sure Supabase callback URL is in Google OAuth
4. Check browser console for errors (F12)

---

**Ready to go!** Follow Steps 1-3 above and you'll have Google signin working. ✨
