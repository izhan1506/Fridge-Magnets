/**
 * Automatic background removal for magnet photos.
 *
 * Uses `@imgly/background-removal` (in-browser WASM, no API key) when it's
 * installed. If the package or model can't load, we throw so the UI can show
 * the "background removal failed — retry" state described in the brief.
 */

// The bundled ONNX runtime logs benign warnings when the preview isn't
// cross-origin isolated (so WASM multi-threading is unavailable and it falls
// back to single-threading). That's expected here and can't be configured
// away, so we filter just those two messages to keep the console clean.
(function silenceWasmThreadWarnings() {
  const g = globalThis as { __fridgeWarnPatched?: boolean };
  if (g.__fridgeWarnPatched) return;
  g.__fridgeWarnPatched = true;
  const original = console.warn.bind(console);
  const noisy = ["env.wasm.numThreads", "multi-threading is not supported"];
  console.warn = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (noisy.some((n) => first.includes(n))) return;
    original(...args);
  };
})();

async function compressImage(blob: Blob, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Scale down if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (compressed) => {
          if (compressed) resolve(compressed);
          else reject(new Error("Failed to compress image"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(blob);
  });
}

export async function removeMagnetBackground(source: Blob): Promise<Blob> {
  let removeBackground: (input: Blob) => Promise<Blob>;
  try {
    // Dynamic import keeps the heavy WASM bundle out of the initial load and
    // lets the app boot even before the dependency is installed.
    const mod = await import("@imgly/background-removal");
    removeBackground = mod.removeBackground;
  } catch {
    throw new Error("Background removal service is unavailable");
  }

  try {
    // Compress image first to reduce memory usage and improve reliability
    const compressed = await compressImage(source);
    const result = await removeBackground(compressed);
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Background removal failed: ${msg} — try a different photo or a clearer background`);
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
