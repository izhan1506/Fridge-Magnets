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

export async function removeMagnetBackground(source: Blob): Promise<Blob> {
  let removeBackground: (input: Blob) => Promise<Blob>;
  try {
    // Dynamic import keeps the heavy WASM bundle out of the initial load and
    // lets the app boot even before the dependency is installed.
    const mod = await import("@imgly/background-removal");
    removeBackground = mod.removeBackground;
  } catch {
    throw new Error("Background removal is unavailable right now");
  }

  const result = await removeBackground(source);
  return result;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
