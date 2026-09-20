import type { Magnet, Profile, PublicFridge } from "./types";
import { supabase } from "./supabase";
import { generateFridgeId } from "./fridge-id";
import { deleteMagnetPhoto } from "./storage";

/**
 * Persistence layer for Fridge, now backed by Supabase.
 * Every function is async and returns the same shapes as before.
 */

// Row mappers: convert Postgres snake_case to app camelCase
function profileFromRow(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    homeLat: row.home_lat,
    homeLng: row.home_lng,
    homeLabel: row.home_label,
    mapPublic: row.map_public,
    // Null until migration 0004 + scripts/assign-fridge-ids.mjs have both run;
    // callers fall back to generateFridgeId() while it is.
    fridgeId: row.fridge_id ?? undefined,
  };
}

/**
 * Every magnet column EXCEPT `trip_photo_url`.
 *
 * Trip photos are Storage objects now, so this column holds a short URL for any
 * magnet created since that change — but rows predating it still carry a base64
 * data URL inline, one of them 7.5 MB, until the migration in
 * `scripts/migrate-trip-photos.mjs` has been run against the project.
 *
 * Either way the map list has no use for trip photos: it draws a name and a
 * magnet count. Keeping them out of list queries is correct independently of
 * how they're stored, so this stays after the migration. Fetch the full row
 * only where the story viewer actually needs it.
 */
const MAGNET_LIST_COLUMNS =
  "id,user_id,city,country,lat,lng,caption,instagram_url,photo_url,color,verified,rotation,scale,pos_x,pos_y,created_at";

function magnetFromRow(row: any): Magnet {
  return {
    id: row.id,
    userId: row.user_id,
    city: row.city,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    caption: row.caption,
    instagramUrl: row.instagram_url,
    photoUrl: row.photo_url,
    tripPhotoUrl: row.trip_photo_url,
    color: row.color,
    verified: row.verified,
    rotation: row.rotation,
    scale: row.scale,
    posX: row.pos_x,
    posY: row.pos_y,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function magnetToRow(magnet: Magnet): any {
  return {
    id: magnet.id,
    user_id: magnet.userId,
    city: magnet.city,
    country: magnet.country,
    lat: magnet.lat,
    lng: magnet.lng,
    caption: magnet.caption,
    instagram_url: magnet.instagramUrl,
    photo_url: magnet.photoUrl,
    trip_photo_url: magnet.tripPhotoUrl,
    color: magnet.color,
    verified: magnet.verified,
    rotation: magnet.rotation,
    scale: magnet.scale,
    pos_x: magnet.posX,
    pos_y: magnet.posY,
    created_at: new Date(magnet.createdAt).toISOString(),
  };
}

// ── Auth ──
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<Profile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Sign up failed");

  // The trigger on auth.users will have created a profiles row automatically.
  // Fetch it to return.
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (fetchError) throw fetchError;
  return profileFromRow(profile);
}

export async function signIn(
  email: string,
  password: string,
): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Sign in failed");

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (fetchError) throw fetchError;
  return profileFromRow(profile);
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/fridge",
    },
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Profile | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) return null;

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .single();

  if (fetchError) return null; // Profile doesn't exist yet (new user mid-flow)
  return profileFromRow(profile);
}

// ── Profile ──
export async function saveProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: profile.name,
      home_lat: profile.homeLat,
      home_lng: profile.homeLng,
      home_label: profile.homeLabel,
      map_public: profile.mapPublic,
    })
    .eq("id", profile.id)
    .select()
    .single();

  if (error) throw error;
  return profileFromRow(data);
}

// ── Magnets (current user) ──
export async function getMagnets(userId: string): Promise<Magnet[]> {
  const { data, error } = await supabase
    .from("magnets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(magnetFromRow);
}

export async function addMagnet(magnet: Magnet): Promise<Magnet> {
  const row = magnetToRow(magnet);
  const { data, error } = await supabase
    .from("magnets")
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return magnetFromRow(data);
}

export async function deleteMagnet(userId: string, id: string): Promise<void> {
  // Delete the Storage objects first — cutout and trip photo both
  await deleteMagnetPhoto(userId, id);

  // Then delete the DB row
  const { error } = await supabase.from("magnets").delete().eq("id", id);
  if (error) throw error;
}

export async function updateMagnet(
  id: string,
  patch: Partial<Magnet>,
): Promise<Magnet | null> {
  const updates: any = {};

  if (patch.caption !== undefined) updates.caption = patch.caption;
  if (patch.instagramUrl !== undefined) updates.instagram_url = patch.instagramUrl;
  if (patch.tripPhotoUrl !== undefined) updates.trip_photo_url = patch.tripPhotoUrl;
  if (patch.posX !== undefined) updates.pos_x = patch.posX;
  if (patch.posY !== undefined) updates.pos_y = patch.posY;
  if (patch.scale !== undefined) updates.scale = patch.scale;
  if (patch.color !== undefined) updates.color = patch.color;
  if (patch.rotation !== undefined) updates.rotation = patch.rotation;

  const { data, error } = await supabase
    .from("magnets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return magnetFromRow(data);
}

// ── Public fridges (map + read-only views) ──
export async function getPublicFridges(
  excludeUserId?: string,
): Promise<PublicFridge[]> {
  // Fetch all public profiles
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("map_public", true);

  if (profileError) {
    console.error("[Store] Error fetching public profiles:", profileError);
    throw profileError;
  }

  console.log(`[Store] Found ${profiles?.length || 0} public profiles`);

  // Batch fetch magnets for all those users
  const profileIds = (profiles || []).map((p) => p.id);
  let magnets: any[] = [];

  if (profileIds.length > 0) {
    const { data: magData, error: magError } = await supabase
      .from("magnets")
      .select(MAGNET_LIST_COLUMNS)
      .in("user_id", profileIds)
      .order("created_at", { ascending: false });

    if (magError) {
      console.error("[Store] Error fetching public magnets:", magError);
      throw magError;
    }

    magnets = magData || [];
    console.log(`[Store] Found ${magnets.length} magnets from public profiles`);
  }

  // Group magnets by user
  const magsByUser = magnets.reduce(
    (acc, m) => {
      if (!acc[m.user_id]) acc[m.user_id] = [];
      acc[m.user_id].push(magnetFromRow(m));
      return acc;
    },
    {} as Record<string, Magnet[]>,
  );

  // Build PublicFridge[] and filter excludeUserId + invalid coordinates
  const fridges = (profiles || [])
    .map((p) => ({
      profile: profileFromRow(p),
      magnets: magsByUser[p.id] || [],
    }))
    .filter((f) => f.profile.id !== excludeUserId)
    .filter((f) => {
      // Only show fridges with valid coordinates (not 0,0)
      const hasValidCoords = f.profile.homeLat !== 0 || f.profile.homeLng !== 0;
      if (!hasValidCoords) {
        console.log(`[Store] Skipping fridge ${f.profile.name} — invalid coordinates (0,0)`);
      }
      return hasValidCoords;
    });

  console.log(`[Store] Returning ${fridges.length} public fridges (excluded: ${excludeUserId})`);
  return fridges;
}

/** Postgres `undefined_column`, i.e. migration 0004 has not been run here. */
const UNDEFINED_COLUMN = "42703";

/**
 * Resolve a shareable fridge id (`fridge-0426`) to the fridge it names.
 *
 * Two paths, in order:
 *
 * 1. `profiles.fridge_id`, a stored column with a uniqueness constraint
 *    (migration 0004). This is the real answer: one indexed lookup, and two
 *    fridges can never share an id.
 * 2. Failing that, the legacy behaviour — hash every public profile's user id
 *    and look for a match. `generateFridgeId()` is one-way, so the user id
 *    can't be read out of the URL; scanning is the only way back.
 *
 * The fallback exists because the column is backfilled by a separate script
 * (`scripts/assign-fridge-ids.mjs`, which needs the service-role key), so there
 * is a window where rows have no fridge_id and this still has to work. It also
 * carries the original bug: `abs(hash) % 10000` has no uniqueness guarantee, so
 * if two public profiles collide the second one is unreachable. Once every row
 * has a fridge_id, path 2 can go.
 *
 * Note path 2 also runs when the column exists but holds no match, not only
 * when it is missing. That is deliberate: if the backfill had to move someone
 * off their hashed id to break a collision, their old link still lands on them
 * — unless somebody else now genuinely holds that id, in which case path 1
 * already returned that person and we never got here.
 *
 * Only public profiles are searchable either way, which is the behaviour you
 * want: a private fridge shouldn't be reachable by guessing ids.
 */
export async function getFridgeByPublicId(fridgeId: string): Promise<PublicFridge | null> {
  // 1. The stored column.
  const { data: exact, error: exactError } = await supabase
    .from("profiles")
    .select("id")
    .eq("fridge_id", fridgeId)
    .eq("map_public", true)
    .maybeSingle();

  if (exact) return getFridge(exact.id);

  // A missing column (pre-migration) must not be fatal — fall through to the
  // hash scan. Anything else is a real error. Postgres 42703 is
  // undefined_column; verified against this project, which answers a query for
  // the not-yet-created column with
  // {"code":"42703","message":"column profiles.fridge_id does not exist"}.
  if (exactError) {
    if (exactError.code !== UNDEFINED_COLUMN) {
      console.error("[Store] Error resolving fridge id:", exactError);
      throw exactError;
    }
    console.warn("[Store] profiles.fridge_id unavailable, falling back to the hash scan");
  }

  // 2. Legacy hash scan.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("map_public", true);

  if (error) {
    console.error("[Store] Error resolving fridge id:", error);
    throw error;
  }

  const match = (profiles || []).find((p) => generateFridgeId(p.id) === fridgeId);
  if (!match) {
    console.log(`[Store] No public fridge matches ${fridgeId}`);
    return null;
  }
  return getFridge(match.id);
}

export async function getFridge(userId: string): Promise<PublicFridge | null> {
  console.log(`[Store] Fetching fridge for userId: ${userId}`);

  // Fetch the profile (RLS will allow only if it's public or the user's own)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // If not found or RLS denied it, return null
  if (profileError) {
    console.error(`[Store] Error fetching profile: ${profileError.message}`);
    return null;
  }

  if (!profile) {
    console.log(`[Store] Profile not found for userId: ${userId}`);
    return null;
  }

  console.log(`[Store] Found profile: ${profile.name}, map_public: ${profile.map_public}`);

  // Fetch magnets for this user (RLS will allow only if public)
  const { data: magnets, error: magError } = await supabase
    .from("magnets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (magError) {
    console.error(`[Store] Error fetching magnets: ${magError.message}`);
    throw magError;
  }

  console.log(`[Store] Found ${(magnets || []).length} magnets`);

  return {
    profile: profileFromRow(profile),
    magnets: (magnets || []).map(magnetFromRow),
  };
}
