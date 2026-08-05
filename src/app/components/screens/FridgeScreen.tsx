import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { toast } from "../../lib/toast";
import { useSession } from "../../lib/session";
import { BottomNavBar, GlassSquareIconButton } from "../glass-nav";
import { FridgeView } from "./FridgeView";

export function FridgeScreen() {
  const nav = useNavigate();
  const { profile, magnets } = useSession();
  const [tab, setTab] = useState<"fridge" | "map">("fridge");

  if (!profile) return null;

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <FridgeView
          fridge={{ profile, magnets }}
          headerAction={
            <div className="flex items-center gap-2">
              <GlassSquareIconButton
                icon={<Bell size={20} strokeWidth={1.75} />}
                label="Notifications"
                onClick={() => {
                  toast("No new notifications");
                }}
              />
              <GlassSquareIconButton onClick={() => nav("/settings")} label="Profile" />
            </div>
          }
        />
      </div>

      <BottomNavBar
        value={tab}
        onTabChange={(v) => {
          if (v === "map") {
            setTab(v);
            nav("/map");
          }
        }}
        onAdd={() => nav("/add")}
      />
    </div>
  );
}
