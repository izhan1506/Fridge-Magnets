import { supabase } from "./supabase";
import { toWebp } from "./image";

/** Extensions we may have written a cutout under, newest first. */
const PHOTO_EXTS = ["webp", "png"] as const;

function extFor(mimeType: string): string {
  return mimeType === "image/webp" ? "webp" : "png";
}

/**
 * Optimize and upload a magnet cutout, returning its public URL.
 *
 * The blob arrives as a PNG with alpha from background removal; it's re-encoded
 * to WebP first (same transparency, much smaller). If the browser can't encode
 * WebP we upload the original PNG, so the stored extension and content type are
 * both derived from what we actually ended up with rather than assumed.
 */
export async function uploadMagnetPhoto(
  userId: string,
  magnetId: string,
  blob: Blob,
): Promise<string> {
  // Background removal already caps the cutout at 1024px, so this is a
  // re-encode rather than a resize.
  const optimized = await toWebp(blob, { maxWidth: 1024, maxHeight: 1024 });

  const path = `${userId}/${magnetId}.${extFor(optimized.type)}`;
  const { error } = await supabase.storage
    .from("magnet-photos")
    .upload(path, optimized, { contentType: optimized.type, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("magnet-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMagnetPhoto(
  userId: string,
  magnetId: string,
): Promise<void> {
  // Magnets created before the WebP switch are still stored as .png, and a
  // browser without WebP encoding will still write one today — remove both so
  // deleting never silently orphans the file. Missing paths are a no-op.
  await supabase.storage
    .from("magnet-photos")
    .remove(PHOTO_EXTS.map((ext) => `${userId}/${magnetId}.${ext}`));
}
