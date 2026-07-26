import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Camera, X, RotateCcw, Check, MapPin, Loader2, ImageUp, AlertTriangle, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { M3Button, TextField } from "../chrome";
import { useSession } from "../../lib/session";
import { reverseGeocode } from "../../lib/geo";
import { removeMagnetBackground, blobToDataUrl } from "../../lib/bgRemoval";
import { randomMagnetColor } from "../../lib/skins";
import { uploadMagnetPhoto } from "../../lib/storage";
import type { Magnet } from "../../lib/types";

type Step =
  | "gps"
  | "gps-denied"
  | "camera"
  | "camera-denied"
  | "processing"
  | "processing-failed"
  | "cutout"
  | "details"
  | "saved";

export function AddMagnet() {
  const nav = useNavigate();
  const { profile, addMagnet } = useSession();
  const [step, setStep] = useState<Step>("gps");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [rawBlob, setRawBlob] = useState<Blob | null>(null);
  const [cutout, setCutout] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [scale, setScale] = useState(1);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [caption, setCaption] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saved, setSaved] = useState<Magnet | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── 1. Detect location ──
  useEffect(() => {
    if (step !== "gps") return;
    if (!navigator.geolocation) {
      setStep("gps-denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        const { city, country } = await reverseGeocode(c.lat, c.lng);
        setCity(city);
        setCountry(country);
        setStep("camera");
      },
      () => setStep("gps-denied"),
      { timeout: 8000 },
    );
  }, [step]);

  // ── 2. Camera ──
  useEffect(() => {
    if (step !== "camera") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setStep("camera-denied");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [step]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setRawBlob(blob);
        process(blob);
      }
    }, "image/png");
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setRawBlob(file);
      process(file);
    }
  }

  // ── 3. Background removal ──
  async function process(blob: Blob) {
    setStep("processing");
    try {
      const out = await removeMagnetBackground(blob);
      setCutout(await blobToDataUrl(out));
      setCutoutBlob(out);
      setStep("cutout");
    } catch {
      setStep("processing-failed");
    }
  }

  // ── 5. Save ──
  async function save() {
    if (!profile || !cutoutBlob) return;

    try {
      setStep("processing");

      // Generate client-side UUID for the magnet
      const magnetId = crypto.randomUUID();

      // Upload to Supabase Storage
      const photoUrl = await uploadMagnetPhoto(profile.id, magnetId, cutoutBlob);

      // Create magnet record with real Storage URL
      const magnet: Magnet = {
        id: magnetId,
        userId: profile.id,
        city: city.trim() || "Somewhere",
        country: country.trim(),
        lat: coords?.lat ?? profile.homeLat,
        lng: coords?.lng ?? profile.homeLng,
        caption: caption.trim(),
        instagramUrl: instagram.trim() || undefined,
        photoUrl,
        color: randomMagnetColor(),
        verified: !!coords,
        rotation: Math.random() * 12 - 6,
        scale,
        createdAt: Date.now(),
      };

      await addMagnet(magnet);
      setSaved(magnet);
      setStep("saved");
    } catch (e) {
      toast.error("Couldn't save your photo — try again");
      setStep("processing-failed");
    }
  }

  const close = () => nav("/fridge");

  // ── Render per step ──
  if (step === "gps") return <FullCenter><Loader2 className="animate-spin text-primary" size={40} /><p className="mt-4 text-muted-foreground">Finding where you are…</p></FullCenter>;

  if (step === "gps-denied")
    return (
      <ErrorState
        icon={<MapPin size={40} />}
        title="Location is off"
        body="We couldn't detect your location. Add the place manually — you can still make a magnet."
        primaryLabel="Continue to camera"
        onPrimary={() => setStep("camera")}
        onClose={close}
      />
    );

  if (step === "camera")
    return (
      <div className="relative flex h-full flex-col bg-black">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-14 z-10 flex items-center gap-3 px-4 text-white">
          <button onClick={close} className="shrink-0 rounded-full bg-black/40 p-2">
            <X size={22} />
          </button>
          <p className="rounded-full bg-black/40 px-4 py-2">Take picture on plain surface</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-8 pb-10">
          <label className="cursor-pointer rounded-full bg-white/15 p-3 text-white">
            <ImageUp size={24} />
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
          <button
            onClick={capture}
            className="h-18 w-18 rounded-full border-4 border-white p-1"
            style={{ height: 76, width: 76 }}
          >
            <span className="block h-full w-full rounded-full bg-white" />
          </button>
          <span className="w-[52px]" />
        </div>
      </div>
    );

  if (step === "camera-denied")
    return (
      <ErrorState
        icon={<Camera size={40} />}
        title="Camera is off"
        body="We need camera access to snap your magnet. Grant access in your browser, or upload a photo from your library."
        primaryLabel="Try camera again"
        onPrimary={() => setStep("camera")}
        secondary={
          <label className="cursor-pointer text-primary">
            Upload a photo instead
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        }
        onClose={close}
      />
    );

  if (step === "processing")
    return (
      <FullCenter>
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="mt-4">Removing the background</p>
        <p className="text-muted-foreground">Cutting your magnet out…</p>
      </FullCenter>
    );

  if (step === "processing-failed")
    return (
      <ErrorState
        icon={<AlertTriangle size={40} />}
        title="Background removal failed"
        body="Something went wrong cutting out your magnet. Give it another try."
        primaryLabel="Retry"
        onPrimary={() => rawBlob && process(rawBlob)}
        secondary={
          <button className="text-primary" onClick={() => setStep("camera")}>
            Retake photo
          </button>
        }
        onClose={close}
      />
    );

  if (step === "cutout")
    return (
      <div className="flex h-full flex-col px-6 pb-8 pt-10">
        <h1>Looking good?</h1>
        <p className="mt-1 text-muted-foreground">Background removed — drag to resize your magnet.</p>
        <div className="my-6 flex flex-1 items-center justify-center overflow-hidden rounded-3xl checker">
          {cutout && (
            <img
              src={cutout}
              alt="Magnet cutout preview"
              className="max-h-[46vh] object-contain transition-transform"
              style={{ transform: `scale(${scale})` }}
            />
          )}
        </div>
        <div className="mb-5 flex items-center gap-3">
          <button
            aria-label="Smaller"
            onClick={() => setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(2)))}
            className="rounded-full bg-muted p-2 text-foreground active:brightness-90"
          >
            <Minus size={18} />
          </button>
          <input
            type="range"
            min={0.6}
            max={1.5}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(+e.target.value)}
            aria-label="Magnet size"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <button
            aria-label="Bigger"
            onClick={() => setScale((s) => Math.min(1.5, +(s + 0.1).toFixed(2)))}
            className="rounded-full bg-muted p-2 text-foreground active:brightness-90"
          >
            <Plus size={18} />
          </button>
          <span className="w-11 text-right text-muted-foreground tabular-nums">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex gap-3">
          <M3Button variant="tonal" full icon={<RotateCcw size={18} />} onClick={() => { setScale(1); setStep("camera"); }}>
            Retake
          </M3Button>
          <M3Button full icon={<Check size={18} />} onClick={() => setStep("details")}>
            Use this
          </M3Button>
        </div>
      </div>
    );

  if (step === "details")
    return (
      <div className="flex h-full flex-col px-6 pb-8 pt-10">
        <h1>Add the details</h1>
        <p className="mt-1 text-muted-foreground">
          {coords ? "Auto-filled from your location — edit anything." : "Tell us where this is from."}
        </p>
        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} className="flex-1" />
            <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="flex-1" />
          </div>
          <TextField
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A little piece of the trip"
          />
          <TextField
            label="Instagram link"
            hint="Optional — a post or Reel link plays inline; other links just open Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/p/…"
          />
        </div>
        <div className="mt-auto space-y-2 pt-8">
          <M3Button full onClick={save}>
            Save to fridge
          </M3Button>
          <button className="w-full text-center text-muted-foreground" onClick={() => setInstagram("")}>
            Skip the Instagram link
          </button>
        </div>
      </div>
    );

  // saved
  return (
    <FullCenter>
      {saved?.photoUrl && (
        <img
          src={saved.photoUrl}
          alt={`Magnet from ${saved.city}`}
          className="mb-6 h-40 w-40 rounded-2xl object-cover"
          style={{ rotate: `${saved.rotation}deg`, filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.3))" }}
        />
      )}
      <h1 className="font-fridge">Pinned to your fridge</h1>
      <p className="mt-1 text-muted-foreground">{[saved?.city, saved?.country].filter(Boolean).join(", ")}</p>
      <M3Button className="mt-8" onClick={close}>
        View my fridge
      </M3Button>
    </FullCenter>
  );
}

function FullCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      {children}
    </div>
  );
}

function ErrorState({
  icon,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondary,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondary?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container text-secondary">
        {icon}
      </div>
      <h1 className="mt-6">{title}</h1>
      <p className="mt-2 max-w-xs text-muted-foreground">{body}</p>
      <M3Button className="mt-8" onClick={onPrimary}>
        {primaryLabel}
      </M3Button>
      {secondary && <div className="mt-4">{secondary}</div>}
      <button className="mt-6 text-muted-foreground" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
