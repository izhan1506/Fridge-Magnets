#!/usr/bin/env node
/**
 * Move base64 trip photos out of the `magnets` table and into Supabase Storage.
 *
 * Trip photos used to be persisted as `data:` URLs directly on the magnet row.
 * One real row is 7.5 MB, and because `getMagnets()` and `getFridge()` select
 * every column, that magnet's owner re-downloaded those 7.5 MB every single
 * time they opened their own fridge. The app writes trip photos to Storage now;
 * this backfills the rows that predate that change.
 *
 * For each row whose `trip_photo_url` starts with `data:`, it
 *   1. decodes the base64 payload,
 *   2. uploads it to `magnet-photos/<user_id>/<magnet_id>-trip.<ext>`
 *      (the same `<user_id>/` prefix the cutouts use, so the bucket's existing
 *      RLS policies apply unchanged — no new bucket, no new policy),
 *   3. replaces the row's `trip_photo_url` with the public URL.
 *
 * ── Why you have to run this, not Claude ──────────────────────────────────────
 * The rows belong to several different users, so RLS blocks the anon key from
 * touching them. It needs the service-role key, which is a full-database
 * credential and is deliberately not in `.env`.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *   # dry run (default): reports exactly what it would do, writes nothing
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-trip-photos.mjs
 *
 *   # do it
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-trip-photos.mjs --apply
 *
 * Grab the key from Supabase → Project Settings → API → `service_role`.
 * VITE_SUPABASE_URL is read from `.env`.
 *
 * Safe to re-run: rows already holding an `https://` URL are skipped, and the
 * upload uses upsert, so an interrupted run just resumes. The row is only
 * rewritten after its upload is confirmed, so a failure mid-way leaves that
 * magnet still pointing at its (intact) base64 copy.
 *
 * ── What this does NOT do ────────────────────────────────────────────────────
 * It moves the bytes verbatim; it does not re-encode them. Dropping base64
 * takes ~25% off (7.5 MB row → 5.6 MB object), but the Berlin photo is a large
 * JPEG and stays one. That's fine for the problem being solved: the row becomes
 * ~200 bytes, so opening your own fridge no longer downloads it at all, and the
 * object is fetched only when the story viewer actually shows that magnet.
 * Photos uploaded through the app from now on are downscaled to 1600px and
 * WebP-encoded first, so this only affects the legacy rows.
 */

import { readFileSync } from "node:fs";
import { argv, env, exit } from "node:process";

const APPLY = argv.includes("--apply");
const BUCKET = "magnet-photos";

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
      "  RLS blocks the anon key from updating rows that belong to other users.\n" +
      "  Supabase → Project Settings → API → service_role, then:\n\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-trip-photos.mjs\n",
  );
  exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Kept in step with EXT_BY_MIME in src/app/lib/storage.ts. */
const EXT_BY_MIME = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/** Decode a `data:<mime>;base64,<payload>` URL into bytes. */
function decodeDataUrl(url) {
  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(url);
  if (!match) return null;
  const [, mimeType, base64Flag, payload] = match;
  const bytes = base64Flag
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  return { mimeType, bytes };
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

// ── Run ──────────────────────────────────────────────────────────────────────
console.log(`\nProject : ${new URL(SUPABASE_URL).host}`);
console.log(`Mode    : ${APPLY ? "APPLY — will write" : "DRY RUN — no writes (pass --apply to commit)"}\n`);

const listRes = await fetch(
  `${SUPABASE_URL}/rest/v1/magnets?select=id,user_id,city,trip_photo_url&trip_photo_url=not.is.null`,
  { headers },
);
if (!listRes.ok) {
  console.error(`✘ Could not read magnets: ${listRes.status} ${await listRes.text()}`);
  exit(1);
}
const rows = await listRes.json();

const pending = rows.filter((r) => r.trip_photo_url?.startsWith("data:"));
const already = rows.filter((r) => !r.trip_photo_url?.startsWith("data:"));

console.log(`${rows.length} magnet(s) have a trip photo:`);
console.log(`  ${pending.length} still inline as base64  → to migrate`);
console.log(`  ${already.length} already in Storage       → skipping\n`);

if (pending.length === 0) {
  console.log("Nothing to do.\n");
  exit(0);
}

const totalBytes = pending.reduce((a, r) => a + Buffer.byteLength(r.trip_photo_url), 0);
console.log(`Row weight to be reclaimed: ${mb(totalBytes)}\n`);

let migrated = 0;
let failed = 0;

for (const row of pending) {
  const label = `${row.city ?? "(no city)"} ${row.id.slice(0, 8)}`;
  const decoded = decodeDataUrl(row.trip_photo_url);

  if (!decoded) {
    console.log(`  ✘ ${label}: trip_photo_url is not a decodable data URL — left alone`);
    failed++;
    continue;
  }

  const ext = EXT_BY_MIME[decoded.mimeType] ?? "png";
  const path = `${row.user_id}/${row.id}-trip.${ext}`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  console.log(
    `  ${label}\n` +
      `      ${decoded.mimeType}, row ${kb(Buffer.byteLength(row.trip_photo_url))} → object ${kb(decoded.bytes.length)}\n` +
      `      ${path}`,
  );

  if (!APPLY) {
    migrated++;
    continue;
  }

  // 1. upload the bytes
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": decoded.mimeType, "x-upsert": "true" },
    body: decoded.bytes,
  });
  if (!up.ok) {
    console.log(`      ✘ upload failed: ${up.status} ${(await up.text()).slice(0, 200)}`);
    failed++;
    continue;
  }

  // 2. confirm it is actually fetchable before pointing the row at it
  const head = await fetch(publicUrl, { method: "HEAD" });
  if (!head.ok) {
    console.log(`      ✘ uploaded but not publicly readable (${head.status}) — row left unchanged`);
    failed++;
    continue;
  }

  // 3. only now swap the row over
  const patch = await fetch(`${SUPABASE_URL}/rest/v1/magnets?id=eq.${row.id}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ trip_photo_url: publicUrl }),
  });
  if (!patch.ok) {
    console.log(`      ✘ row update failed: ${patch.status} ${(await patch.text()).slice(0, 200)}`);
    failed++;
    continue;
  }
  const updated = await patch.json();
  if (!Array.isArray(updated) || updated.length !== 1) {
    console.log(`      ✘ row update affected ${updated?.length ?? 0} rows — check RLS`);
    failed++;
    continue;
  }

  console.log(`      ✔ migrated`);
  migrated++;
}

console.log(
  `\n${APPLY ? "Migrated" : "Would migrate"}: ${migrated}` +
    (failed ? `   Failed: ${failed}` : "") +
    `\n`,
);

if (!APPLY) {
  console.log("Re-run with --apply to commit these changes.\n");
} else if (failed === 0) {
  console.log(
    "Done. Verify with:\n" +
      "  node scripts/check-trip-photos.mjs\n",
  );
}

exit(failed > 0 ? 1 : 0);
