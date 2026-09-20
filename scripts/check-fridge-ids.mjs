#!/usr/bin/env node
/**
 * Report the state of shareable fridge ids: who holds which, whether the stored
 * column agrees with the legacy hash, and whether anything collides.
 *
 * Read-only, and runs on the anon key from `.env` — no service-role key needed.
 * Use it before and after `assign-fridge-ids.mjs` to see the change land.
 *
 *   node scripts/check-fridge-ids.mjs
 *
 * RLS means the anon key only ever sees public profiles, so the collision count
 * here is a lower bound: a private profile could hold a colliding id and this
 * would not show it. Only the backfill script, which runs on the service-role
 * key, sees every row.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env, exit } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split("\n")
        .filter((l) => l.trim() && !l.trim().startsWith("#"))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

const fileEnv = readEnvFile(new URL("../.env", import.meta.url));
const SUPABASE_URL = env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("✘ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not found in .env");
  exit(1);
}

// Use the app's own hash so "matches the legacy id" means exactly that.
const src = new URL("../src/app/lib/fridge-id.ts", import.meta.url);
const esbuild = new URL("../node_modules/.bin/esbuild", import.meta.url);
const out = join(mkdtempSync(join(tmpdir(), "fridge-id-")), "fridge-id.mjs");
try {
  execFileSync(fileURLToPath(esbuild), [fileURLToPath(src), "--format=esm", `--outfile=${out}`, "--log-level=warning"]);
} catch {
  console.error("✘ Could not compile src/app/lib/fridge-id.ts (run npm install)");
  exit(1);
}
const { generateFridgeId } = await import(pathToFileURL(out).href);

const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

console.log(`\nProject: ${new URL(SUPABASE_URL).host}\n`);

// Ask for fridge_id, but survive the column not existing yet.
let hasColumn = true;
let res = await fetch(
  `${SUPABASE_URL}/rest/v1/profiles?select=id,name,map_public,home_lat,home_lng,fridge_id`,
  { headers },
);
if (!res.ok) {
  const body = await res.text();
  if (/fridge_id/.test(body)) {
    hasColumn = false;
    res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,name,map_public,home_lat,home_lng`,
      { headers },
    );
  }
  if (!res.ok) {
    console.error(`✘ ${res.status} ${(await res.text()).slice(0, 300)}`);
    exit(1);
  }
}
const rows = await res.json();

if (!hasColumn) {
  console.log("profiles.fridge_id does not exist yet — ids are still derived");
  console.log("from the hash at request time. Run migrations/0004_fridge_id.sql,");
  console.log("then scripts/assign-fridge-ids.mjs.\n");
}

console.log(`${rows.length} profile(s) visible to the anon key (RLS => public only)\n`);

const effective = (r) => (hasColumn && r.fridge_id ? r.fridge_id : generateFridgeId(r.id));

const byId = new Map();
for (const r of rows) {
  const id = effective(r);
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(r);
}

let stored = 0;
let derived = 0;
let moved = 0;

for (const [, group] of [...byId].sort()) {
  for (const r of group) {
    const legacy = generateFridgeId(r.id);
    const id = effective(r);
    const isStored = hasColumn && !!r.fridge_id;
    if (isStored) stored++;
    else derived++;
    const flag = !isStored
      ? "derived"
      : id === legacy
        ? "stored "
        : `stored, MOVED from ${legacy}`;
    if (isStored && id !== legacy) moved++;
    const at00 = r.home_lat === 0 && r.home_lng === 0 ? " (0,0)" : "";
    console.log(`  ${id}  ${flag.padEnd(24)}  ${(r.name || "(no name)").slice(0, 22)}${at00}`);
  }
}

const collisions = [...byId.values()].filter((g) => g.length > 1);

console.log(`\n  stored in the column : ${stored}`);
console.log(`  still derived        : ${derived}`);
if (moved) console.log(`  moved off their hash : ${moved}`);
console.log(`\ndistinct ids: ${byId.size} / ${rows.length}`);
console.log(`collisions  : ${collisions.length}${collisions.length ? "" : "  ✔"}`);
for (const g of collisions) {
  console.log(`  ✘ ${effective(g[0])} shared by ${g.map((r) => r.id.slice(0, 8)).join(", ")}`);
}

// The headroom question that motivates the column in the first place.
const n = rows.length;
const pCollide = 1 - Math.exp((-n * (n - 1)) / (2 * 10000));
console.log(
  `\nid space 10,000 · ${n} profiles visible · ` +
    `birthday odds of at least one collision ≈ ${(pCollide * 100).toFixed(1)}%`,
);
console.log("");

exit(collisions.length > 0 ? 1 : 0);
