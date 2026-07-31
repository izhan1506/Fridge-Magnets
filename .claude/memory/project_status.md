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

### Latest Features Implemented (This Session)

1. **Trip Photo Feature** - Users can upload optional trip photos when creating magnets, displayed full-screen in story viewer
2. **Trip Photo Editor** - Users can add/edit trip photos on existing magnets from MagnetSettings screen
3. **Mobile Story Viewer** - Fixed positioning (absolute instead of fixed) to stay within mobile frame
4. **Onboarding UX** - Fixed so users don't get sent back to "Set Home Base" after first login
5. **Notification Close Button** - Added X button on notification toast for dismissal
6. **Dark Heading on Map** - SetHomeBase heading now dark/readable on light map background

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

### Next Ideas for Enhancement

- Compress/optimize trip photos before storing
- Add location verification for magnets (proof-of-visit)
- Social features (like, comment on magnets)
- Magnet analytics (view count, etc.)
