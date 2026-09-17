#!/usr/bin/env node
/**
 * Report how trip photos are currently stored, and what each magnet's owner
 * pays to open their own fridge.
 *
 * Read-only, and runs on the anon key from `.env` — no service-role key needed.
 * Use it before and after `migrate-trip-photos.mjs` to see the change land.
 *
 *   node scripts/check-trip-photos.mjs
 */

import { readFileSync } from "node:fs";
import { env, exit } from "node:process";

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

const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(`\nProject: ${new URL(SUPABASE_URL).host}\n`);

// What a fridge open actually costs: the full row, as getMagnets() selects it.
const t0 = Date.now();
const res = await fetch(`${SUPABASE_URL}/rest/v1/magnets?select=*`, { headers });
const body = await res.text();
const fullMs = Date.now() - t0;
if (!res.ok) {
  console.error(`✘ ${res.status} ${body.slice(0, 200)}`);
  exit(1);
}
const rows = JSON.parse(body);
const fullBytes = Buffer.byteLength(body);

const withPhoto = rows.filter((r) => r.trip_photo_url);
const inline = withPhoto.filter((r) => r.trip_photo_url.startsWith("data:"));
const stored = withPhoto.filter((r) => !r.trip_photo_url.startsWith("data:"));

console.log(`${rows.length} magnets, ${withPhoto.length} with a trip photo`);
console.log(`  base64 inline on the row : ${inline.length}`);
console.log(`  URL into Storage         : ${stored.length}\n`);

console.log(`select("*") over every magnet: ${mb(fullBytes)} in ${fullMs}ms`);

// Per-owner cost, which is what getMagnets(userId) actually fetches.
const byUser = new Map();
for (const r of rows) {
  const cost = Buffer.byteLength(JSON.stringify(r));
  const cur = byUser.get(r.user_id) ?? { bytes: 0, n: 0 };
  byUser.set(r.user_id, { bytes: cur.bytes + cost, n: cur.n + 1 });
}
const worst = [...byUser.entries()].sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 5);
console.log(`\nheaviest fridges (what the owner downloads per open):`);
for (const [uid, v] of worst) {
  console.log(`  ${uid.slice(0, 8)}  ${String(v.n).padStart(2)} magnets  ${mb(v.bytes)}`);
}

if (inline.length) {
  console.log(`\nstill inline (run scripts/migrate-trip-photos.mjs):`);
  for (const r of inline.sort((a, b) => b.trip_photo_url.length - a.trip_photo_url.length)) {
    console.log(
      `  ${kb(Buffer.byteLength(r.trip_photo_url)).padStart(10)}  ${r.city ?? "(no city)"} ${r.id.slice(0, 8)}  ${r.trip_photo_url.slice(0, 24)}…`,
    );
  }
}

if (stored.length) {
  console.log(`\nStorage-backed trip photos — checking each is really fetchable:`);
  for (const r of stored) {
    const head = await fetch(r.trip_photo_url, { method: "HEAD" });
    const size = head.headers.get("content-length");
    console.log(
      `  ${head.ok ? "✔" : "✘"} ${head.status}  ${size ? kb(+size).padStart(10) : "?".padStart(10)}  ${r.city ?? "(no city)"} ${r.id.slice(0, 8)}`,
    );
  }
}

console.log("");
