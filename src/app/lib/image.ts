/**
 * Image optimization for anything the user contributes.
 *
 * Everything the user gives us is re-encoded to WebP before it's stored: WebP
 * carries an alpha channel (required for the background-removed magnet cutouts,
 * which a JPEG would flatten onto black) and is typically 25–70% smaller than
 * the PNG/JPEG a phone camera produces.
 *
 * Optimization is best-effort and must never be the reason a save fails — every
 * failure path returns the original blob untouched.
 */

export type OptimizeOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /** 0–1, WebP encoder quality. */
  quality?: number;
};

const DEFAULTS: Required<OptimizeOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = url;
  });
}

/**
 * Re-encode an image as WebP, scaling it down to fit within the given bounds.
 *
 * Returns the ORIGINAL blob unchanged if the browser can't encode WebP, if the
 * image can't be decoded, or if the re-encode somehow came out bigger — callers
 * can always upload whatever comes back, and should read `.type` rather than
 * assuming `image/webp`.
 */
export async function toWebp(blob: Blob, options: OptimizeOptions = {}): Promise<Blob> {
  const { maxWidth, maxHeight, quality } = { ...DEFAULTS, ...options };

  // Canvas can't encode SVG/GIF meaningfully, and re-encoding an existing WebP
  // just loses quality for nothing.
  if (blob.type === "image/webp" || blob.type === "image/gif" || blob.type === "image/svg+xml") {
    return blob;
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (!width || !height) return blob;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    // The canvas starts fully transparent and we never paint a backdrop, so a
    // cutout's alpha survives the round-trip.
    ctx.drawImage(img, 0, 0, width, height);

    const encoded = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );

    // toBlob silently falls back to PNG when the browser can't encode WebP
    // (Safari < 16), so only accept a result that genuinely is WebP.
    if (!encoded || encoded.type !== "image/webp") return blob;

    return encoded.size < blob.size ? encoded : blob;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Optimize a picked file and return it as a data URL.
 *
 * For the trip photo, which is persisted inline on the magnet row rather than
 * uploaded to Storage — base64 inflates bytes by ~33%, so shrinking first
 * matters more here than anywhere else in the app.
 */
export async function fileToOptimizedDataUrl(
  file: Blob,
  options: OptimizeOptions = {},
): Promise<string> {
  return blobToDataUrl(await toWebp(file, options));
}

/** Trip photos are viewed full-bleed but never printed — 1600px is plenty. */
export const TRIP_PHOTO_OPTIONS: OptimizeOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.82 };
