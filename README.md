
# Fridge Magnets

A mobile-first travel memory app: every trip becomes a digital fridge magnet, pinned to your virtual fridge and to a shared world map.

**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS, with Supabase for auth, database, and storage. MapLibre GL + OpenFreeMap for maps (free, no API keys).

## Local Development

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) and sign up.

## Deploying to Vercel + Supabase

See **[`docs/DEPLOY.md`](./docs/DEPLOY.md)** for step-by-step instructions:
- Create a Supabase project and run migrations.
- Set up the Storage bucket for magnet photos.
- Configure Google OAuth (optional).
- Deploy to Vercel and link environment variables.

## Scripts

- `npm run dev` — Start dev server on http://localhost:5173.
- `npm run build` — Build for production to `dist/`.
- `npm run preview` — Preview the production build locally.
- `npm run typecheck` — Run TypeScript type checking.
  