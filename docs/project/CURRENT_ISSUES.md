# Fridge Magnets - Current Issues & Status

**Last Updated**: Aug 1, 2026  
**Status**: BLOCKING - Map view partially broken  
**Live URL**: https://fridge-magnets-three.vercel.app

---

## 🔴 Critical Issues

### Issue #1: Cannot View Other Users' Fridges From Map
**Severity**: CRITICAL - Feature completely broken  
**Component**: `PinPreviewCard` (src/app/components/mappins.tsx)

**What's Broken**:
- Click pin on map → preview card shows ✅
- Click "View full fridge" button → **Nothing happens** ❌
- URL doesn't change
- No error messages in console
- Click seems to not reach the button

**What Works**:
- Map displays public fridges ✅
- Preview card renders ✅
- Close (X) button works ✅
- Card appears/animates correctly ✅

**Investigation Notes**:
- PinPreviewCard now uses `useNavigate()` hook directly (no callback)
- Navigation handler: `nav(/fridge/${fridge.profile.id})`
- Route exists: `/fridge/:userId` → OtherFridge component
- RLS policies allow access to public profiles ✅
- Database has test data (Wajiha Atiq with 2 magnets) ✅

**Suspected Causes**:
1. **Event propagation blocked** - Click not reaching M3Button component
2. **PhoneFrame interference** - Frame wrapper blocking events
3. **AnimatePresence issue** - Motion library preventing click
4. **Z-index still wrong** - Even after fixes
5. **Router issue** - Dynamic route not matching

**Next Steps to Debug**:
```
1. Add console.log to M3Button component when onClick fires
2. Add preventDefault() to button click
3. Check if ANY click event reaches the preview card (use DevTools breakpoints)
4. Test route manually: navigate to /fridge/[userId] directly
5. Try different button component (not M3Button)
6. Check AnimatePresence for event blocking
```

---

### Issue #2: Toggle Navigation (Status Unknown)
**Severity**: MEDIUM - May be working or broken  
**Component**: `BottomNavBar` + `GlassTabNav`

**What User Reports**:
- Clicking "Fridge" button from Map screen doesn't navigate
- Stays on map

**Code Looks Correct**:
- FridgeScreen: `onTabChange={(v) => { if (v === "map") nav("/map"); }}`
- MapScreen: `onTabChange={(v) => { if (v === "fridge") nav("/fridge"); }}`

**To Test**:
```
1. Open browser console (F12)
2. Click "Fridge" button while on Map
3. Look for logs (none currently added)
4. Check if URL changes to /fridge
5. Check if screen switches
```

**If Broken**: Add logging to GlassTabNav.onChange to see if it fires

---

## ✅ Fixed Issues

### Map Display
- ✅ Public fridges show on map
- ✅ Invalid (0,0) coordinates filtered out
- ✅ Users see their own fridge pin
- ✅ Clustering works for nearby fridges
- ✅ Preview card appears on pin click

### RLS & Database
- ✅ RLS policies configured correctly
- ✅ Users can see public profiles
- ✅ Users can see public magnets
- ✅ Photo URLs stored properly

### UI/UX
- ✅ Design system page works at `/designsystem`
- ✅ Mobile responsive layout
- ✅ Navigation buttons styled correctly

---

## 📋 Testing Checklist

### For Map Feature
- [ ] Reload app at https://fridge-magnets-three.vercel.app
- [ ] Login as any user
- [ ] Go to Map tab
- [ ] See pins for public fridges (should see Wajiha Atiq's pink pin)
- [ ] Click pin → preview card should appear
- [ ] Click "View full fridge" button → **Should navigate to /fridge/userId**
- [ ] Check console for error messages
- [ ] Try clicking magnet thumbnails (also clickable)

### For Toggle
- [ ] While on Map, click "Fridge" button
- [ ] Should navigate to your fridge (/fridge)
- [ ] While on Fridge, click "Map" button
- [ ] Should navigate to map (/map)

---

## 🔧 Recent Changes

**Commit**: `54e0e0b` - PinPreviewCard now handles navigation directly
- Moved `useNavigate()` hook into PinPreviewCard
- Removed `onView` callback prop
- Component now navigates directly on button click
- Added console logging for debugging

**Before That**:
- Fixed z-index: BottomNavBar z-10, PinPreviewCard z-20
- Fixed navigation: boolean AND → explicit if statements
- Added RLS policy filtering for invalid (0,0) coordinates

---

## 🧭 File Locations

**Key Files**:
- App router: `src/app/App.tsx` (lines 46-62)
- Map screen: `src/app/components/screens/MapScreen.tsx`
- Fridge screen: `src/app/components/screens/FridgeScreen.tsx`
- Preview card: `src/app/components/mappins.tsx` (PinPreviewCard)
- Bottom nav: `src/app/components/glass-nav.tsx` (BottomNavBar, GlassTabNav)
- Button component: `src/app/components/chrome.tsx` (M3Button)

**Database**:
- Profiles with map_public=true: Should have home_lat/lng ≠ 0
- Magnets: Should have photo_url pointing to Supabase storage
- RLS policies: Check Supabase → Database → Policies

---

## 📞 For Next Session

1. **Start by testing the toggle** - Is it working at all?
2. **Add logging to understand click flow**:
   ```typescript
   // In M3Button component
   onClick={(e) => {
     console.log("[M3Button] Clicked");
     props.onClick?.(e);
   }}
   ```
3. **Check browser DevTools** → Network tab for attempted navigation
4. **Try simplest fix first**: Replace M3Button with native `<button>`
5. **Last resort**: Bypass callback entirely, use link component

---

## 🚀 Deployment

- GitHub branch: `main` (automatic Vercel deploy on push)
- Environment variables set in Vercel dashboard
- Recent commit auto-deploys within 1-2 minutes
