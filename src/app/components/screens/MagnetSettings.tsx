import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Link, MoreVertical, Trash2, ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../../lib/session";
import { MAGNET_COLORS } from "../../lib/skins";
import type { Magnet } from "../../lib/types";
import { M3Button, TextField } from "../chrome";
import { BottomSheet } from "../layout";
import { StoryViewer } from "../story-viewer";
import { ImageWithFallback } from "../figma/ImageWithFallback";

/**
 * Settings screen listing the user's magnets. Tapping a row plays its story
 * right away (same as the fridge door); the ⋮ button opens a per-magnet options
 * sheet for editing its Instagram link or deleting the magnet.
 */
export function MagnetSettings() {
  const nav = useNavigate();
  const { profile, magnets } = useSession();
  const [editing, setEditing] = useState<Magnet | null>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col px-4 pb-10 pt-11">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => nav("/settings")} className="rounded-xl border border-white/30 bg-white/15 p-2 backdrop-blur-[7px] transition hover:bg-white/25">
          <ArrowLeft size={22} />
        </button>
        <h1>Magnets</h1>
      </div>

      {magnets.length === 0 ? (
        <p className="text-muted-foreground">You haven't added any magnets yet.</p>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card border border-border">
          {magnets.map((m, i) => (
            <div key={m.id}>
              {i > 0 && <div className="mx-4 h-px bg-border" />}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <button
                  onClick={() => setStoryIndex(i)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="h-12 w-12 shrink-0 overflow-hidden rounded-xl"
                    style={{ backgroundColor: MAGNET_COLORS[m.color] }}
                  >
                    {m.photoUrl && (
                      <ImageWithFallback src={m.photoUrl} alt={m.city} className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="flex-1">
                    <p>{m.city}</p>
                    <p className="text-muted-foreground">{m.country}</p>
                  </span>
                  {m.instagramUrl && <Link size={18} className="text-primary" />}
                </button>
                <button
                  onClick={() => setEditing(m)}
                  aria-label={`Options for ${m.city}`}
                  className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={editing ? `${editing.city}, ${editing.country}` : undefined}>
        {editing && (
          <div className="space-y-5">
            <InstagramLinkForm magnet={editing} onDone={() => setEditing(null)} />
            <div className="h-px bg-border" />
            <TripPhotoForm magnet={editing} onDone={() => setEditing(null)} />
            <div className="h-px bg-border" />
            <DeleteMagnetButton magnet={editing} onDeleted={() => setEditing(null)} />
          </div>
        )}
      </BottomSheet>

      {storyIndex !== null && profile && (
        <StoryViewer
          magnets={magnets}
          startIndex={storyIndex}
          ownerName={profile.name}
          onClose={() => setStoryIndex(null)}
        />
      )}
    </div>
  );
}

function InstagramLinkForm({ magnet, onDone }: { magnet: Magnet; onDone: () => void }) {
  const { updateMagnet } = useSession();
  const [url, setUrl] = useState(magnet.instagramUrl ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await updateMagnet(magnet.id, { instagramUrl: url.trim() || undefined });
    setBusy(false);
    toast.success(url.trim() ? "Instagram link added" : "Instagram link removed");
    onDone();
  }

  async function remove() {
    setBusy(true);
    await updateMagnet(magnet.id, { instagramUrl: undefined });
    setBusy(false);
    toast.success("Instagram link removed");
    onDone();
  }

  return (
    <div>
      <TextField
        label="Instagram post link"
        placeholder="https://instagram.com/p/... or /reel/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        hint="A post or Reel link plays inline on this magnet's story card. Story links can't be embedded (Instagram blocks that), so those just show as an outbound link. Leave blank to remove."
        autoFocus
      />
      <M3Button full className="mt-5" onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save"}
      </M3Button>
      {magnet.instagramUrl && (
        <button
          onClick={remove}
          disabled={busy}
          className="mt-3 w-full text-center text-destructive hover:underline disabled:opacity-40"
        >
          Delete Instagram link
        </button>
      )}
    </div>
  );
}

function TripPhotoForm({ magnet, onDone }: { magnet: Magnet; onDone: () => void }) {
  const { updateMagnet } = useSession();
  const [preview, setPreview] = useState(magnet.tripPhotoUrl ?? null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await updateMagnet(magnet.id, { tripPhotoUrl: preview || undefined });
    setBusy(false);
    toast.success(preview ? "Trip photo added" : "Trip photo removed");
    onDone();
  }

  async function remove() {
    setBusy(true);
    setPreview(null);
    await updateMagnet(magnet.id, { tripPhotoUrl: undefined });
    setBusy(false);
    toast.success("Trip photo removed");
    onDone();
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Trip photo</p>
      {preview ? (
        <div className="mb-3 overflow-hidden rounded-2xl bg-muted">
          <img src={preview} alt="Trip photo preview" className="h-40 w-full object-cover" />
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">No trip photo yet</p>
      )}
      <div className="space-y-2">
        <label className="block w-full">
          <M3Button full icon={<ImageUp size={18} />}>
            {preview ? "Change photo" : "Add photo"}
          </M3Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const dataUrl = event.target?.result as string;
                  setPreview(dataUrl);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 text-destructive transition hover:bg-destructive/10"
          >
            <X size={18} />
            Remove
          </button>
        )}
        {preview !== magnet.tripPhotoUrl && (
          <M3Button full variant="tonal" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </M3Button>
        )}
      </div>
    </div>
  );
}

function DeleteMagnetButton({ magnet, onDeleted }: { magnet: Magnet; onDeleted: () => void }) {
  const { removeMagnet } = useSession();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function del() {
    setBusy(true);
    await removeMagnet(magnet.id);
    setBusy(false);
    toast.success("Magnet deleted");
    onDeleted();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 text-destructive transition hover:bg-destructive/10"
      >
        <Trash2 size={18} />
        Delete magnet
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
      <p className="text-center">Delete this magnet permanently? This can't be undone.</p>
      <div className="mt-4 flex gap-2">
        <M3Button variant="tonal" full onClick={() => setConfirming(false)} disabled={busy}>
          Cancel
        </M3Button>
        <button
          onClick={del}
          disabled={busy}
          className="h-12 w-full rounded-2xl border border-white/30 bg-destructive text-destructive-foreground transition hover:brightness-105 disabled:opacity-40"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
