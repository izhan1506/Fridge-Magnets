import { supabase } from "./supabase";
import { toWebp, TRIP_PHOTO_OPTIONS } from "./image";

/** The one bucket both the cutout and the trip photo live in. */
const BUCKET = "magnet-photos";

/**
 * Extensions we may have written an object under, newest first.
 *
 * Deletes have to try all of them: magnets predating the WebP switch are stored
 * as `.png`/`.jpg`, and a browser that can't encode WebP still writes one today.
 */
const PHOTO_EXTS = ["webp", "png", "jpg", "jpeg", "gif", "avif", "svg"] as const;

/**
 * MIME type → extension.
 *
 * Covers more than WebP because `toWebp` deliberately passes some types through
 * untouched (an animated GIF would lose its animation; an SVG can't be drawn to
 * a canvas meaningfully), and the file picker accepts `image/*`. Every type
 * listed here has a matching entry in PHOTO_EXTS, so a delete can still find
 * whatever an upload wrote.
 */
const EXT_BY_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * Extension for a blob's real MIME type.
 *
 * Read off the blob rather than assumed, because `canvas.toBlob` silently falls
 * back to PNG when the browser can't encode WebP (Safari < 16), and storing a
 * JPEG under `.png` with the wrong content type would serve it back broken.
 */
function extFor(mimeType: string): string {
  // Fall back to PNG rather than an unknown extension: canvas.toBlob's own
  // fallback is PNG, so that's the likeliest thing an unlabelled blob is.
  return EXT_BY_MIME[mimeType] ?? "png";
}

/** Object path for a magnet's background-removed cutout. */
function cutoutPath(userId: string, magnetId: string, ext: string): string {
  return `${userId}/${magnetId}.${ext}`;
}

/**
 * Object path for a magnet's trip photo.
 *
 * Deliberately under the same `${userId}/` prefix as the cutout: the bucket's
 * RLS policies key off the first path segment, so trip photos need no new
 * bucket and no new policy to be writable by their owner.
 */
function tripPath(userId: string, magnetId: string, ext: string): string {
  return `${userId}/${magnetId}-trip.${ext}`;
}

async function uploadTo(path: string, blob: Blob): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
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
  return uploadTo(cutoutPath(userId, magnetId, extFor(optimized.type)), optimized);
}

/**
 * Optimize and upload a magnet's trip photo, returning its public URL.
 *
 * Trip photos used to be base64'd onto the magnet row itself, which made one
 * real row 7.5 MB and meant the owner re-downloaded it on every fridge open.
 * They're Storage objects now; the row holds a URL.
 */
export async function uploadTripPhoto(
  userId: string,
  magnetId: string,
  blob: Blob,
): Promise<string> {
  const optimized = await toWebp(blob, TRIP_PHOTO_OPTIONS);
  return uploadTo(tripPath(userId, magnetId, extFor(optimized.type)), optimized);
}

/**
 * Remove every object belonging to a magnet — cutout and trip photo, in all the
 * extensions either could have been written under. Missing paths are a no-op,
 * so this never fails for a magnet that has no trip photo.
 */
export async function deleteMagnetPhoto(
  userId: string,
  magnetId: string,
): Promise<void> {
  const paths = PHOTO_EXTS.flatMap((ext) => [
    cutoutPath(userId, magnetId, ext),
    tripPath(userId, magnetId, ext),
  ]);
  await supabase.storage.from(BUCKET).remove(paths);
}

/** Remove just a magnet's trip photo, leaving the cutout alone. */
export async function deleteTripPhoto(
  userId: string,
  magnetId: string,
): Promise<void> {
  await supabase.storage
    .from(BUCKET)
    .remove(PHOTO_EXTS.map((ext) => tripPath(userId, magnetId, ext)));
}
