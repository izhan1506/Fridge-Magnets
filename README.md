
  # Fridge

  A mobile-first travel memory app: every trip becomes a digital fridge
  magnet, pinned to your fridge and to a shared world map. Originally
  generated from the Figma project at
  https://www.figma.com/design/qlNPbfhUuUBshNHHyn8uuH/App-Creation.

  The map runs on MapLibre GL + OpenFreeMap vector tiles (free, no API key).

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deploying

  Static build, no backend or API keys required. `npm run build` outputs
  `dist/`. On Vercel, the included `vercel.json` adds the SPA rewrite needed
  so client-side routes (e.g. `/map`, `/fridge`) don't 404 on refresh.
  