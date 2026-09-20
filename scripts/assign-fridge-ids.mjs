#!/usr/bin/env node
/**
 * Backfill `profiles.fridge_id` after migration 0004, preserving every link
 * that already works.
 *
 * Shareable ids used to be computed on the fly as `abs(hash(userId)) % 10000`.
 * Migration 0004 turns that into a stored, unique column. This script fills it
 * in, giving each existing profile the exact id it already resolves under —
 * so a `/fridge/fridge-0426` someone bookmarked or shared keeps pointing at the
 * same fridge.
 *
 * It imports the real `generateFridgeId` from `src/app/lib/fridge-id.ts` rather
 * than reimplementing the hash, which is the whole reason the backfill lives
 * here and not in the SQL: a plpgsql copy of that hash (int32 wraparound and
 * all) would be a second implementation that nothing checks against the first.
 *
 * ── Collisions ───────────────────────────────────────────────────────────────
 * If two profiles hash to the same id, the older account (by created_at) keeps
 * it — its link has been live longest — and the newer one is given a random
 * free id. That is a link change, and the script says so loudly. Among the 15
 * public profiles there are currently 0 collisions, but private profiles are
 * invisible to the anon key, so this can only be confirmed with the
 * service-role key, i.e. by running this.
 *
 * ── Why you have to run this, not Claude ─────────────────────────────────────
 * The rows belong to several different users, so RLS blocks the anon key from
 * updating them. It needs the service-role key, which is a full-database
 * credential and is deliberately not in `.env`.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *   # dry run (default): reports exactly what it would do, writes nothing
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/assign-fridge-ids.mjs
 *
 *   # do it
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/assign-fridge-ids.mjs --apply
 *
 * Run migration 0004 first. Safe to re-run: rows that already hold a fridge_id
 * are skipped, so an interrupted run just resumes.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { argv, env, exit } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const APPLY = argv.includes("--apply");

// ── Config ───────────────────────────────────────────────────────────────────
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
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("✘ VITE_SUPABASE_URL not found in the environment or .env");
  exit(1);
}
if (!SERVICE_KEY) {
  console.error(
    "✘ SUPABASE_SERVICE_ROLE_KEY is required.\n" +
      "  RLS blocks the anon key from updating other users' profiles.\n" +
      "  Supabase → Project Settings → API → service_role, then:\n\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=... node scripts/assign-fridge-ids.mjs\n",
  );
  exit(1);
}

// ── Load the app's own hash, not a copy of it ────────────────────────────────
const src = new URL("../src/app/lib/fridge-id.ts", import.meta.url);
const esbuild = new URL("../node_modules/.bin/esbuild", import.meta.url);
const out = join(mkdtempSync(join(tmpdir(), "fridge-id-")), "fridge-id.mjs");
try {
  execFileSync(fileURLToPath(esbuild), [fileURLToPath(src), "--format=esm", `--outfile=${out}`, "--log-level=warning"]);
} catch {
  console.error("✘ Could not compile src/app/lib/fridge-id.ts (is esbuild installed? run npm install)");
  exit(1);
}
const { generateFridgeId } = await import(pathToFileURL(out).href);

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

const ID_SPACE = 10000;
const asId = (n) => `fridge-${String(n).padStart(4, "0")}`;

// ── Run ──────────────────────────────────────────────────────────────────────
console.log(`\nProject : ${new URL(SUPABASE_URL).host}`);
console.log(`Mode    : ${APPLY ? "APPLY — will write" : "DRY RUN — no writes (pass --apply to commit)"}\n`);

const listRes = await fetch(
  `${SUPABASE_URL}/rest/v1/profiles?select=id,name,map_public,fridge_id,created_at&order=created_at.asc`,
  { headers },
);
if (!listRes.ok) {
  const body = await listRes.text();
  if (/fridge_id/.test(body)) {
    console.error(
      `✘ profiles.fridge_id does not exist.\n` +
        `  Run supabase/migrations/0004_fridge_id.sql first ` +
        `(Supabase → SQL Editor).\n`,
    );
    exit(1);
  }
  console.error(`✘ Could not read profiles: ${listRes.status} ${body}`);
  exit(1);
}
const rows = await listRes.json();

const already = rows.filter((r) => r.fridge_id);
const pending = rows.filter((r) => !r.fridge_id);

console.log(`${rows.length} profile(s):`);
console.log(`  ${already.length} already have a fridge_id → skipping`);
console.log(`  ${pending.length} to assign\n`);

if (pending.length === 0) {
  console.log("Nothing to do.\n");
  exit(0);
}

// Every id that is spoken for, so a reassignment can't land on a live link.
const taken = new Set(already.map((r) => r.fridge_id));

/** A free id, chosen at random so reassignments aren't clustered. */
function randomFreeId() {
  if (taken.size >= ID_SPACE) {
    console.error("✘ fridge id space is exhausted (10,000 taken)");
    exit(1);
  }
  let candidate;
  do {
    candidate = asId(Math.floor(Math.random() * ID_SPACE));
  } while (taken.has(candidate));
  return candidate;
}

// Oldest account first, so on a clash the longest-lived link is the one kept.
const plan = [];
for (const row of pending) {
  const preferred = generateFridgeId(row.id);
  const clash = taken.has(preferred);
  const assigned = clash ? randomFreeId() : preferred;
  taken.add(assigned);
  plan.push({ row, preferred, assigned, clash });
}

const label = (r) => `${(r.name || "(no name)").slice(0, 20).padEnd(20)} ${r.id.slice(0, 8)}`;

for (const p of plan) {
  console.log(
    `  ${p.assigned}  ${label(p.row)}  ${p.row.map_public ? "public " : "private"}` +
      (p.clash ? `  ⚠ LINK CHANGED — ${p.preferred} was already taken` : ""),
  );
}

const changed = plan.filter((p) => p.clash);
console.log(
  `\n${plan.length} to assign, ${changed.length} of which collide with an id ` +
    `already in use.`,
);
if (changed.length) {
  console.log(
    `⚠ Those ${changed.length} fridge(s) get a NEW url. Any previously shared\n` +
      `  link to them stops resolving — that is the bug this column fixes,\n` +
      `  surfacing at the moment it gets fixed.`,
  );
}
console.log("");

if (!APPLY) {
  console.log("Re-run with --apply to commit these changes.\n");
  exit(0);
}

let assigned = 0;
let failed = 0;

for (const p of plan) {
  // Guard on fridge_id being null so a concurrent run can't double-assign.
  const patch = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${p.row.id}&fridge_id=is.null`,
    {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ fridge_id: p.assigned }),
    },
  );
  if (!patch.ok) {
    console.log(`  ✘ ${label(p.row)}: ${patch.status} ${(await patch.text()).slice(0, 200)}`);
    failed++;
    continue;
  }
  const updated = await patch.json();
  if (!Array.isArray(updated) || updated.length !== 1) {
    console.log(
      `  ✘ ${label(p.row)}: update affected ${updated?.length ?? 0} rows ` +
        `(already assigned by another run?)`,
    );
    failed++;
    continue;
  }
  console.log(`  ✔ ${p.assigned}  ${label(p.row)}`);
  assigned++;
}

console.log(`\nAssigned: ${assigned}${failed ? `   Failed: ${failed}` : ""}\n`);
if (failed === 0) {
  console.log("Done. Verify with:\n  node scripts/check-fridge-ids.mjs\n");
}

exit(failed > 0 ? 1 : 0);
