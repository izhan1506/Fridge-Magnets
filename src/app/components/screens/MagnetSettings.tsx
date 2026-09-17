import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Link, MoreVertical, Trash2, ImageUp, X } from "lucide-react";
import { toast } from "../../lib/toast";
import { useSession } from "../../lib/session";
import { MAGNET_COLORS } from "../../lib/skins";
import { toWebp, TRIP_PHOTO_OPTIONS } from "../../lib/image";
import { uploadTripPhoto, deleteTripPhoto } from "../../lib/storage";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

      <BottomSheet
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setShowDeleteConfirm(false);
        }}
        title={editing ? `${editing.city}, ${editing.country}` : undefined}
        action={
          editing
            ? {
                icon: <Trash2 size={20} />,
                onClick: () => setShowDeleteConfirm(true),
                label: "Delete magnet",
              }
            : undefined
        }
      >
        {editing && (
          <div className="space-y-5">
            {showDeleteConfirm ? (
              <DeleteConfirmation
                magnet={editing}
                onConfirmed={() => {
                  setEditing(null);
                  setShowDeleteConfirm(false);
                }}
                onCanceled={() => setShowDeleteConfirm(false)}
              />
            ) : (
              <EditMagnetForm magnet={editing} onDone={() => setEditing(null)} />
            )}
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

function EditMagnetForm({ magnet, onDone }: { magnet: Magnet; onDone: () => void }) {
  const { profile, updateMagnet } = useSession();
  const [url, setUrl] = useState(magnet.instagramUrl ?? "");
  /* `preview` is whatever should be shown: the magnet's existing trip photo
     (a Storage URL, or a legacy base64 data URL on an unmigrated row), or an
     object URL for a freshly picked file. `picked` holds the bytes only in that
     last case, which is also how save() knows an upload is needed. */
  const [preview, setPreview] = useState<string | null>(magnet.tripPhotoUrl ?? null);
  const [picked, setPicked] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objectUrlRef = useRef<string | null>(null);
  function choose(blob: Blob | null) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const next = blob ? URL.createObjectURL(blob) : null;
    objectUrlRef.current = next;
    setPreview(next);
    setPicked(blob);
  }
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const removed = !preview && !!magnet.tripPhotoUrl;
  const hasChanges = url !== (magnet.instagramUrl ?? "") || !!picked || removed;

  async function save() {
    if (!profile) return;
    setBusy(true);
    try {
      /* Three cases, and only the first two touch Storage:
           picked  → upload the new bytes, store the returned URL
           removed → drop the row's reference, then delete the object
           neither → leave trip_photo_url exactly as it was (which may still be
                     a legacy data URL; re-sending it would be a pointless
                     multi-MB round trip) */
      let tripPhotoUrl = magnet.tripPhotoUrl;
      if (picked) {
        tripPhotoUrl = await uploadTripPhoto(profile.id, magnet.id, picked);
      } else if (removed) {
        tripPhotoUrl = undefined;
      }

      await updateMagnet(magnet.id, {
        instagramUrl: url.trim() || undefined,
        tripPhotoUrl,
      });

      // Only after the row no longer points at it — orphaning an object is
      // recoverable, a row pointing at a deleted object is a broken image.
      if (removed) await deleteTripPhoto(profile.id, magnet.id);

      toast("Changes saved");
      onDone();
    } catch (e) {
      console.error("[MagnetSettings] Save failed:", e);
      toast.error("Couldn't save your changes — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <TextField
          label="Instagram post link"
          placeholder="https://instagram.com/p/... or /reel/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          hint="A post or Reel link plays inline on this magnet's story card. Story links can't be embedded (Instagram blocks that), so those just show as an outbound link. Leave blank to remove."
          autoFocus
        />
      </div>

      <div className="h-px bg-border" />

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
          <M3Button
            full
            icon={<ImageUp size={18} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? "Change photo" : "Add photo"}
          </M3Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Same optimization as AddMagnet; uploaded on save.
                choose(await toWebp(file, TRIP_PHOTO_OPTIONS));
              }
            }}
          />
          {preview && (
            <button
              onClick={() => choose(null)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 text-destructive transition hover:bg-destructive/10"
            >
              <X size={18} />
              Remove
            </button>
          )}
        </div>
      </div>

      <M3Button variant="tonal" full onClick={save} disabled={busy || !hasChanges}>
        {busy ? "Saving…" : "Save"}
      </M3Button>
    </div>
  );
}

function DeleteConfirmation({
  magnet,
  onConfirmed,
  onCanceled,
}: {
  magnet: Magnet;
  onConfirmed: () => void;
  onCanceled: () => void;
}) {
  const { removeMagnet } = useSession();
  const [busy, setBusy] = useState(false);

  async function del() {
    setBusy(true);
    await removeMagnet(magnet.id);
    setBusy(false);
    toast("Magnet deleted");
    onConfirmed();
  }

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
      <p className="text-center">Delete this magnet permanently? This can't be undone.</p>
      <div className="mt-4 flex gap-2">
        <M3Button variant="tonal" full onClick={onCanceled} disabled={busy}>
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
