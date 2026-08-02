import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { PublicFridge } from "../../lib/types";
import { getFridge } from "../../lib/store";
import { generateFridgeId } from "../../lib/fridge-id";
import { BottomNavBar } from "../glass-nav";
import { FridgeView } from "./FridgeView";

export function OtherFridge() {
  const nav = useNavigate();
  const { fridgeId } = useParams();
  const location = useLocation();
  const [fridge, setFridge] = useState<PublicFridge | null>(null);
  const [loading, setLoading] = useState(true);

  // Get userId from state (passed via nav) or try to derive it
  const userId = (location.state as { userId?: string })?.userId;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log(`[OtherFridge] Loading fridge for fridgeId: ${fridgeId}, userId: ${userId}`);
        const data = userId ? await getFridge(userId) : null;
        console.log(`[OtherFridge] Loaded fridge:`, data);
        setFridge(data);
      } catch (error) {
        console.error(`[OtherFridge] Error loading fridge:`, error);
        setFridge(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pb-3 pt-11">
        <button onClick={() => nav(-1)} className="rounded-xl border border-white/30 bg-white/15 p-2 backdrop-blur-[7px] transition hover:bg-white/25">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-fridge text-[1.4rem]">{fridge ? `${fridge.profile.name}'s fridge` : "Fridge"}</h2>
      </div>
      <div className="flex flex-1 flex-col bg-background">
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
