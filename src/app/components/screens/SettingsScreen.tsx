import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Globe, Link, LogOut, ChevronRight } from "lucide-react";
import { toast } from "../../lib/toast";
import { useSession } from "../../lib/session";

export function SettingsScreen() {
  const nav = useNavigate();
  const { profile, updateProfile, signOut } = useSession();
  if (!profile) return null;

  return (
    <div className="relative flex h-full flex-col px-4 pb-24 pt-11">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => nav("/fridge")} className="rounded-xl border border-white/30 bg-white/15 p-2 backdrop-blur-[7px] transition hover:bg-white/25">
          <ArrowLeft size={22} />
        </button>
        <h1>Settings</h1>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-primary-container p-4 text-on-primary-container">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-fridge text-xl">
          {profile.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-fridge text-lg">{profile.name}</p>
          <p className="opacity-80">{profile.email}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-card border border-border">
        <Row icon={<MapPin size={20} />} label="Home base" value={profile.homeLabel || "Not set"} onClick={() => nav("/onboarding/home")} />
        <Divider />
        <Row icon={<Link size={20} />} label="Magnets" value="Add stories" onClick={() => nav("/settings/magnets")} />
        <Divider />
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="text-muted-foreground"><Globe size={20} /></span>
          <div className="flex-1">
            <p>Show my fridge on the map</p>
            <p className="text-muted-foreground">{profile.mapPublic ? "Public — others can find you" : "Private — hidden from the map"}</p>
          </div>
          <Toggle
            on={profile.mapPublic}
            onChange={(on) => {
              updateProfile({ mapPublic: on });
              toast.success(on ? "Your fridge is public" : "Your fridge is private");
            }}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 px-4">
        <button
          onClick={async () => {
            await signOut();
            nav("/welcome");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-destructive"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground">{value}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}

function Divider() {
  return <div className="mx-4 h-px bg-border" />;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition ${on ? "bg-tertiary" : "bg-switch-background"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}
