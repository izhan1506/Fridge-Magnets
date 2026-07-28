import { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { M3Button, SearchBar } from "../chrome";
import { WorldMap } from "../worldmap";
import { searchCities, reverseGeocode } from "../../lib/geo";
import { useSession } from "../../lib/session";

export function SetHomeBase() {
  const nav = useNavigate();
  const { updateProfile, onboarded } = useSession();
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const results = searchCities(query);

  async function confirm() {
    if (!pick) return;
    await updateProfile({ homeLat: pick.lat, homeLng: pick.lng, homeLabel: pick.label });
    toast.success("Home base set");
    nav(onboarded ? "/settings" : "/fridge");
  }

  async function pickPoint(lat: number, lng: number) {
    const { city, country } = await reverseGeocode(lat, lng);
    setPick({ lat, lng, label: `${city}, ${country}` });
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute inset-x-0 top-0 z-10 px-4 pb-4 pt-14">
        <div className="mb-3 flex items-center gap-3">
          <button onClick={() => nav(-1)} className="rounded-xl border border-white/30 bg-white/15 p-2 text-white backdrop-blur-[7px] transition hover:bg-white/25">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-foreground font-bold">Set your home base</h2>
        </div>
        <SearchBar
          placeholder="Search for your city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-2xl bg-card shadow-lg">
            {results.map((c) => (
              <button
                key={`${c.city}-${c.country}`}
                onClick={() => {
                  setPick({ lat: c.lat, lng: c.lng, label: `${c.city}, ${c.country}` });
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted"
              >
                <MapPin size={18} className="text-muted-foreground" />
                <span>{c.city}, <span className="text-muted-foreground">{c.country}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>

      <WorldMap
        className="flex-1"
        initialZoom={1.4}
        initialCenter={pick ?? { lat: 20, lng: 10 }}
        onBackgroundClick={pickPoint}
        markers={
          pick
            ? [
                {
                  id: "pick",
                  lat: pick.lat,
                  lng: pick.lng,
                  render: () => (
                    <div className="flex flex-col items-center">
                      <MapPin size={40} className="fill-primary text-primary drop-shadow" />
                    </div>
                  ),
                },
              ]
            : []
        }
      />

      <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-background via-background/90 to-transparent p-4 pt-8">
        {pick && (
          <p className="text-center text-muted-foreground">
            Home base: <span className="text-foreground">{pick.label}</span>
          </p>
        )}
        <p className="text-center text-muted-foreground">Tap the map or search to drop your pin</p>
        <M3Button full disabled={!pick} onClick={confirm}>
          Confirm home base
        </M3Button>
      </div>
    </div>
  );
}
