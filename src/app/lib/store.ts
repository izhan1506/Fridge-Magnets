import type { Magnet, Profile, PublicFridge } from "./types";
import { supabase } from "./supabase";
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
  };
}

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
      redirectTo: window.location.origin + "/onboarding/home",
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
  // Delete the Storage object first
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

  if (profileError) throw profileError;

  // Batch fetch magnets for all those users
  const profileIds = (profiles || []).map((p) => p.id);
  let magnets: any[] = [];

  if (profileIds.length > 0) {
    const { data: magData, error: magError } = await supabase
      .from("magnets")
      .select("*")
      .in("user_id", profileIds)
      .order("created_at", { ascending: false });

    if (magError) throw magError;
    magnets = magData || [];
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

  // Build PublicFridge[] and filter excludeUserId
  return (profiles || [])
    .map((p) => ({
      profile: profileFromRow(p),
      magnets: magsByUser[p.id] || [],
    }))
    .filter((f) => f.profile.id !== excludeUserId);
}

export async function getFridge(userId: string): Promise<PublicFridge | null> {
  // Fetch the profile (RLS will allow only if it's public or the user's own)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // If not found or RLS denied it, return null
  if (profileError || !profile) return null;

  // Fetch magnets for this user (RLS will allow only if public)
  const { data: magnets, error: magError } = await supabase
    .from("magnets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (magError) throw magError;

  return {
    profile: profileFromRow(profile),
    magnets: (magnets || []).map(magnetFromRow),
  };
}
