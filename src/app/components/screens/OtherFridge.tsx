import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { PublicFridge } from "../../lib/types";
import { getFridge, getFridgeByPublicId } from "../../lib/store";
import { generateFridgeId } from "../../lib/fridge-id";
import { BottomNavBar } from "../glass-nav";
import { FridgeView } from "./FridgeView";

export function OtherFridge() {
  const nav = useNavigate();
  const { fridgeId } = useParams();
  const location = useLocation();
  const [fridge, setFridge] = useState<PublicFridge | null>(null);
  const [loading, setLoading] = useState(true);

  /* The map's preview card hands the userId over in router state, which saves a
     lookup — but router state does not survive a refresh, a bookmark, or a link
     someone actually shared, and the fridge id is a one-way hash so the userId
     can't be read back out of the URL. Falling back to a lookup by id is what
     makes /fridge/fridge-0426 work for anyone who didn't arrive via the map. */
  const userId = (location.state as { userId?: string })?.userId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        console.log(`[OtherFridge] Loading fridgeId: ${fridgeId} (state userId: ${userId ?? "none"})`);
        const data = userId
          ? await getFridge(userId)
          : fridgeId
            ? await getFridgeByPublicId(fridgeId)
            : null;
        if (cancelled) return;
        console.log(`[OtherFridge] Loaded fridge:`, data);
        setFridge(data);
      } catch (error) {
        if (cancelled) return;
        console.error(`[OtherFridge] Error loading fridge:`, error);
        setFridge(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, fridgeId]);

  return (
    <div className="relative flex h-full flex-col">
      {/* In flow, not absolute — as an overlay it sat on top of the fridge,
          since the content below only offset by mt-10 (40px) against a header
          that's ~88px tall. */}
      <div className="shrink-0 pt-6 pb-6 z-30 flex items-center gap-3 px-4">
        <button onClick={() => nav(-1)} className="rounded-xl border border-white/30 bg-white/15 p-2 backdrop-blur-[7px] transition hover:bg-white/25">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-fridge text-[1.4rem]">{fridge ? `${fridge.profile.name}'s fridge` : "Fridge"}</h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : fridge ? (
          <FridgeView fridge={fridge} readOnly />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            This fridge could not be found.
          </div>
        )}
      </div>

      <BottomNavBar
        value="fridge"
        onTabChange={(v) => nav(v === "map" ? "/map" : "/fridge")}
        onAdd={() => nav("/add")}
      />
    </div>
  );
}
