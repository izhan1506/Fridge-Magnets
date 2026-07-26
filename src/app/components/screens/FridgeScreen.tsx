import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../../lib/session";
import { BottomNavBar, GlassSquareIconButton } from "../glass-nav";
import { FridgeView } from "./FridgeView";

export function FridgeScreen() {
  const nav = useNavigate();
  const { profile, magnets } = useSession();

  if (!profile) return null;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex flex-1 flex-col bg-background pt-11">
        <FridgeView
          fridge={{ profile, magnets }}
          headerAction={
            <div className="flex items-center gap-2">
              <GlassSquareIconButton
                icon={<Bell size={20} strokeWidth={1.75} />}
                label="Notifications"
                onClick={() => toast("No new notifications")}
              />
              <GlassSquareIconButton onClick={() => nav("/settings")} label="Profile" />
            </div>
          }
        />
      </div>

      <BottomNavBar
        value="fridge"
        onTabChange={(v) => v === "map" && nav("/map")}
        onAdd={() => nav("/add")}
      />
    </div>
  );
}
