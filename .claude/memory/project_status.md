---
name: fridge_magnets_project_status
description: Current status and setup of Fridge Magnets app (React/Supabase/Vercel)
metadata:
  type: project
---

## Project: Fridge Magnets V2 - React App

**Live App:** https://fridge-magnets-three.vercel.app

### Current Status

✅ **Deployed to Vercel** - Auto-deploys from GitHub on push
✅ **Supabase Backend Connected** - Project ID: lrynubanuhhmmcfytbsk, Region: eu-west-1
✅ **GitHub Repository** - https://github.com/izhan1506/Fridge-Magnets (code pushed via SSH)
✅ **Environment Variables Set** in Vercel:
  - VITE_SUPABASE_URL=https://lrynubanuhhmmcfytbsk.supabase.co
  - VITE_SUPABASE_ANON_KEY=[stored in Vercel secrets]

### Latest Features Implemented (Recent Session)

**Trip Photo System:**
1. ✅ Trip photo integrated into magnet details screen (no separate step)
2. ✅ Trip photo preview on details screen with ability to change/remove
3. ✅ Trip photos stored as separate field (`trip_photo_url`) from magnet photo
4. ✅ Trip photos display full-screen in story viewer (takes priority over magnet photo)
5. ✅ Trip photo editor in MagnetSettings with single Save button
6. ✅ Gallery/file picker access for all photo uploads (Add button, Upload button)

**UI/UX Improvements:**
7. ✅ Combined Instagram link + trip photo editing into single form with one Save button
8. ✅ Removed "Delete Instagram link" button - users clear text and save instead
9. ✅ Delete magnet button moved to header as trash icon (not in form)
10. ✅ Back arrows at top of screens (consistent across app)
11. ✅ Toast notifications with white X close button (no background)

**Reliability Fixes:**
12. ✅ Background removal auto-compresses images (1024×1024, quality 0.8) before processing
13. ✅ Better error messages for background removal failures with actionable tips
14. ✅ Fixed navigation after setting home base on first login
15. ✅ Fixed file input refs for proper gallery access

**Database Schema:**
16. ✅ Added `trip_photo_url` field mapping in store.ts
17. ✅ Fixed `magnetFromRow`, `magnetToRow`, and `updateMagnet` functions
18. ✅ All toast imports updated to use custom utility with close buttons

### Tech Stack

- **Frontend:** React 18.3.1 + Vite 6.3.5
- **Styling:** Tailwind CSS 4.1.12 + Radix UI components
- **Backend:** Supabase + PostgreSQL
- **Storage:** Supabase Storage for magnet photos
- **Maps:** MapLibre GL + OpenFreeMap (free tiles, no API key needed)
- **Hosting:** Vercel (auto-deploys on GitHub push)
- **Authentication:** Supabase Auth (email/password + Google OAuth)

### Key Components

- **FridgeScreen** - Main fridge view with magnets displayed, notification bell
- **AddMagnet** - Multi-step flow: GPS → Camera → Background Removal → Details → Trip Photo → Save
- **MagnetSettings** - Edit magnets (Instagram link, trip photo, delete)
- **StoryViewer** - Story playback (auto-advance, tap navigation, Instagram embed support)
- **SetHomeBase** - Onboarding screen to set user's home base location on map
- **MapScreen** - View all public fridges clustered on world map, visit other users' fridges

### Database Schema

**profiles table:**
- id, name, email, home_lat, home_lng, home_label, map_public, created_at

**magnets table:**
- id, user_id, city, country, lat, lng, caption, instagram_url, photo_url, trip_photo_url, color, verified, rotation, scale, pos_x, pos_y, created_at

### Known Gotchas / Fixed Issues

- **Email Rate Limit:** Supabase rate-limits sign-ups (15-30 min wait if testing with same email repeatedly)
- **SSH Auth:** GitHub SSH key must be added to GitHub account for git push to work
- **Environment Variables:** Must be set in Vercel dashboard (not just .env locally)
- **Onboarding State:** Now properly checks homeLat/homeLng as numbers, not just undefined
- **Trip Photo:** Stored as data URL in database (could optimize with external storage later)

### Recent Commits

- 72f5b17: Fix onboarding check and navigation
- 4245100: Add close button to notification toast
- c452e87: Add trip photo editor to MagnetSettings
- c9f590f: Make SetHomeBase heading darker
- 91e4450: Fix skip onboarding if user has home base
- ee3f312: Configure Vercel output directory to dist
- 59e188b: Add trip photo feature + fix mobile story viewer

### Permissions Auto-Allow (Claude Code Settings)

Configured in `.claude/settings.local.json`:
- `Bash(git *)`, `Bash(gh *)`, `Bash(ssh*)` - Git and GitHub CLI
- `Read`, `Write`, `Edit` - File operations
- `Bash(mkdir *)`, `Bash(chmod *)`, etc. - File system operations

### LAUNCH CHECKLIST - CRITICAL

**Database Setup (Must verify in Supabase):**
- [ ] `profiles` table exists with all required columns
- [ ] `magnets` table exists with ALL columns including `trip_photo_url`
- [ ] Indexes created on `user_id` and `created_at`
- [ ] RLS policies configured on both tables
- [ ] `magnet-photos` storage bucket created and public
- [ ] Auth trigger for auto-creating profiles on signup
- [ ] Google OAuth redirect URL set correctly

**Testing Before Launch:**
- [ ] Sign up with email works
- [ ] Set home base works
- [ ] Create magnet with background removal works
- [ ] Add trip photo during magnet creation works
- [ ] Trip photo displays in story viewer when clicking magnet
- [ ] Edit magnet to add/change trip photo works
- [ ] Delete magnet from settings works
- [ ] View public map shows other users' fridges
- [ ] Sign in with Google works

**See:** `SUPABASE_SETUP.md` in repo root for complete configuration guide

### Future Enhancement Ideas

- Compress/optimize trip photos before storing (currently stored as data URLs)
- Add location verification for magnets (proof-of-visit badge)
- Social features (like, comment, save magnets)
- Magnet analytics (view count, most-liked)
- Search by location/city
- User profiles with stats
