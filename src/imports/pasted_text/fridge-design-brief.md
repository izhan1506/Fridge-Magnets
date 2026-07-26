# Design brief: Fridge — a travel memory app

Paste this whole document into Figma's AI design tool, or into a Claude Opus
chat, as your starting prompt. Sections are ordered so you can also generate
screen-by-screen if a tool can't handle the whole thing in one go.

## 1. One-line concept

A travel app where every trip becomes a digital fridge magnet: users
photograph a souvenir magnet in-app, its background is removed automatically,
and it's pinned to their personal digital fridge and to a shared world map.
Other users' fridges are discoverable on the same map via their home
location.

## 2. Platform and format

Mobile-first responsive web app (PWA), designed at 390×844 base frame
(iPhone-sized), with layouts that also hold up at a 768px tablet/desktop
breakpoint. Design every screen as its own frame, named clearly (see the
screen list in section 6).

## 3. The two-language design system — read this before designing anything

This app deliberately uses **two visual languages**, kept strictly separate:

- **App chrome** — onboarding, navigation, settings, map UI, buttons, forms,
  modals, badges. Follows **Google Material 3**: tonal color roles (primary /
  secondary / tertiary containers), rounded corners, generous whitespace,
  flat surfaces, no heavy shadows.
- **The fridge screen only** — deliberately **skeuomorphic**: a textured
  fridge-door background, magnets with real drop-shadows and a slight random
  rotation (like something stuck on by hand), tactile and warm. This is the
  "reward" screen and should feel tangibly different from the rest of the
  app — do not flatten it into Material 3 cards, and do not let its texture
  bleed into the nav bar, buttons, or any other screen.

## 4. Color palette

Direction inspired by this reference (soft pastels, warm neutrals, tonal
color use): https://www.behance.net/gallery/98386999/UI-UX-Design-for-a-Minimal-Travel-App

**Material 3 roles (for app chrome):**
| Role | Hex |
|---|---|
| Primary | #7F77DD (soft purple) |
| Primary container | #EEEDFE |
| Secondary | #D85A30 (warm coral) |
| Secondary container | #FAECE7 |
| Tertiary | #1D9E75 (muted teal) |
| Tertiary container | #E1F5EE |
| Surface | #FFFDF9 (warm off-white) |
| On-surface | #1C1B1F |
| Neutral / outline | #888780 |

**Magnet accent colors** (used as placeholder tile backgrounds before a
photo is added, and for map pin variety): coral #F0997B, pink #ED93B1, blue
#85B7EB, amber #EF9F27, teal #5DCAA5, purple #AFA9EC.

**Fridge skins** (pick from at onboarding — design all three as distinct
textured surfaces):
1. **Steel** — brushed-metal gradient, cool light gray, #EDEAE2 → #E3DFD4
2. **Pastel enamel** — soft mint or blush enamel surface, subtle sheen
3. **Wood panel** — warm wood-grain texture, #C69C6D → #A97C50

## 5. Typography

- **App chrome**: Roboto or Google Sans (Material 3 default) — clean, neutral.
- **Fridge screen labels/headers only**: a warmer, rounder display face
  (e.g. Quicksand, Fredoka, or Nunito) to match the tactile, personal feel —
  used sparingly, just for the fridge owner's name label and empty-state text.

## 6. Iconography

Material Symbols (outlined style) for all chrome icons — nav, buttons,
badges. On the fridge screen, magnet tiles show the user's actual
background-removed souvenir photo, not icons.

## 7. Screens to design (in build order)

**Onboarding**
1. Welcome / splash
2. Sign up or log in (email + Google)
3. Set home base — full-screen map picker with search bar, confirm button
4. Choose fridge skin — gallery of the 3 skins above, single-select cards
5. Empty state — "Add your first magnet" prompt

**Add-magnet flow** (each as its own frame/step)
6. GPS detecting location (brief loading state)
7. In-app camera — live capture screen, shutter button, "place magnet on a
   plain surface" tip text
8. Processing — background removal loading state
9. Cutout preview — confirm or retake, transparent PNG on a neutral checker
   background so transparency is visible
10. Details — auto-filled city/country (editable text field), caption field,
    optional Instagram link field with a clear "skip" affordance
11. Saved confirmation — magnet appears on fridge

**Nudge (day 2 / day 7)**
12. In-app banner or notification mock: "Add your [city] story?" with
    dismiss and add actions

**Fridge**
13. Own fridge — grid/scatter of magnet tiles on the chosen skin, owner name
    label, tab nav to Map at top
14. Magnet detail modal — place name, date, verified badge, "view story"
    button (opens Instagram externally)
15. Someone else's fridge — same layout, read-only (no add-tile)
16. Empty fridge state — new user, zero magnets

**Map**
17. Unified map — full-screen map; the viewer's visited countries/cities
    tonally filled in; other users' home bases marked with their top magnet
    image instead of a generic avatar pin
18. Cluster state — zoomed out, dense area shows a "12 fridges here" bubble
19. Pin tap preview — small card with a mini fridge preview + "view full
    fridge" button

**Settings**
20. Profile/settings — edit home base, change fridge skin, map visibility
    toggle (public/private), log out

**Error/edge states**
21. Location permission denied
22. Camera permission denied
23. Background removal failed — retry option

## 8. Shared component library to build first

Design these as reusable components before the screens, so screens can
instance them:
- Buttons: primary (filled), secondary (tonal), text button — Material 3 style
- Top tab nav (pill-shaped, dark background, active/inactive states) — the
  fridge/map switcher
- Magnet tile (with photo, rotation, drop-shadow) — states: with photo,
  placeholder color, "add new" dashed tile
- Verified badge (small checkmark chip)
- Map pin — home-base marker using a circular cropped magnet image
- Cluster bubble
- Bottom sheet / modal container
- Text input, search bar
- Notification/toast banner

## 9. Copy voice

Sentence case everywhere, no exclamation points on system copy, active
voice ("Add a magnet", not "Magnet can be added"). Empty states should invite
action ("Start your first fridge") rather than apologize ("Nothing here
yet"). Refer to the user's things as "your fridge", never "my fridge" in
system copy (the fridge owner's own view can use their name, e.g. "Priya's
fridge").

## 10. What NOT to design

- Native Instagram Story playback inside the app — the only IG-related UI
  is a link field and a "view story" button that opens Instagram externally.
- Live/real-time location display — home base is fixed, set once.
- Multiple separate fridges per user — only multiple fridge skins to choose
  from.