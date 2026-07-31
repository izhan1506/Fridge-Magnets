---
name: database_schema
description: Fridge Magnets database schema and Supabase configuration
metadata:
  type: reference
---

## Critical Database Fields Fixed

**Issues found and fixed before launch:**
- magnetFromRow and magnetToRow were missing `trip_photo_url` field mapping
- updateMagnet function wasn't handling `trip_photo_url` updates
- All toast imports updated to use custom utility with close buttons

## Database Requirements for Launch

**profiles table** (users):
- id, name, email, home_lat, home_lng, home_label, map_public, created_at
- RLS: users read own + public profiles, write own only

**magnets table** (travel memories):
- id, user_id, city, country, lat, lng, caption, instagram_url, photo_url, **trip_photo_url**, color, verified, rotation, scale, pos_x, pos_y, created_at
- RLS: users read own + public magnets, write own only
- Indexes on: user_id, created_at DESC

**Storage: magnet-photos bucket**
- Path: `{user_id}/{magnet_id}.png`
- Public read, authenticated users write own folder only

## Setup Checklist
See SUPABASE_SETUP.md in repo root for complete configuration instructions before launch.
