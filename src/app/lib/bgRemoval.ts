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
    img.onabort = () => reject(new Error("Image load aborted"));
    img.src = URL.createObjectURL(blob);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Processing timeout — try a smaller or simpler photo")), ms)
    )
  ]);
}

export async function removeMagnetBackground(source: Blob): Promise<Blob> {
  let removeBackground: (input: Blob) => Promise<Blob>;
  try {
    // Dynamic import keeps the heavy WASM bundle out of the initial load and
    // lets the app boot even before the dependency is installed.
    const mod = await import("@imgly/background-removal");
    removeBackground = mod.removeBackground;
  } catch {
    throw new Error("Background removal service is unavailable — please try again");
  }

  // Retry with progressively more aggressive compression
  const attempts = [
    { width: 1024, height: 1024, quality: 0.8, timeout: 30000 },
    { width: 768, height: 768, quality: 0.7, timeout: 25000 },
    { width: 512, height: 512, quality: 0.6, timeout: 20000 },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      const compressed = await compressImage(source, attempt.width, attempt.height, attempt.quality);
      const result = await withTimeout(removeBackground(compressed), attempt.timeout);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      // Continue to next attempt
      continue;
    }
  }

  // All attempts failed
  const msg = lastError?.message || "Unknown error";
  if (msg.includes("timeout") || msg.includes("unavailable")) {
    throw new Error(`${msg} — try a smaller photo or simpler background`);
  }
  throw new Error(`Background removal failed: ${msg} — try a different photo`);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
