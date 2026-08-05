import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { useSession } from "../../lib/session";
import { getPublicFridges } from "../../lib/store";
import { haversine } from "../../lib/geo";
import type { PublicFridge } from "../../lib/types";
import { WorldMap, type MapMarker } from "../worldmap";
import { HomePin, ClusterBubble, PinPreviewCard, ClusterListSheet } from "../mappins";
import { BottomNavBar } from "../glass-nav";

interface Cluster {
  id: string;
  lat: number;
  lng: number;
  fridges: PublicFridge[];
}

/** Greedy proximity clustering (~1200km) so dense areas collapse into bubbles. */
function clusterFridges(fridges: PublicFridge[]): Cluster[] {
  const clusters: Cluster[] = [];
  for (const f of fridges) {
    const home = clusters.find(
      (c) => haversine(c.lat, c.lng, f.profile.homeLat, f.profile.homeLng) < 1200,
    );
    if (home) {
      home.fridges.push(f);
      home.lat = home.fridges.reduce((s, x) => s + x.profile.homeLat, 0) / home.fridges.length;
      home.lng = home.fridges.reduce((s, x) => s + x.profile.homeLng, 0) / home.fridges.length;
    } else {
      clusters.push({
        id: f.profile.id,
        lat: f.profile.homeLat,
        lng: f.profile.homeLng,
        fridges: [f],
      });
    }
  }
  return clusters;
}

export function MapScreen() {
  const nav = useNavigate();
  const { profile, magnets } = useSession();
  const [tab, setTab] = useState<"fridge" | "map">("map");
  const [fridges, setFridges] = useState<PublicFridge[]>([]);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<PublicFridge[] | null>(null);
  const [selected, setSelected] = useState<PublicFridge | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const publicFridges = await getPublicFridges(profile?.id);
        console.log(`[Map] Loaded ${publicFridges.length} public fridges`);

        // Always include current user's fridge if they have a home base set
        if (profile && profile.homeLat !== 0 && profile.homeLng !== 0) {
          const userFridge: PublicFridge = {
            profile: {
              id: profile.id,
              name: profile.name,
              homeLat: profile.homeLat,
              homeLng: profile.homeLng,
              homeLabel: profile.homeLabel,
              mapPublic: profile.mapPublic,
            },
            magnets: magnets,
          };
          console.log(`[Map] Including current user's fridge (${magnets.length} magnets)`);
          setFridges([userFridge, ...publicFridges]);
        } else {
          setFridges(publicFridges);
        }
      } catch (error) {
        console.error("[Map] Error loading public fridges:", error);
      }
    })();
  }, [profile?.id, profile?.homeLat, profile?.homeLng, magnets]);

  const clusters = useMemo(() => clusterFridges(fridges), [fridges]);

  const markers: MapMarker[] = useMemo(() => {
    const out: MapMarker[] = [];
    for (const c of clusters) {
      if (c.fridges.length > 1 && expandedClusterId !== c.id) {
        out.push({
          id: `c-${c.id}`,
          lat: c.lat,
          lng: c.lng,
          render: () => (
            <ClusterBubble
              count={c.fridges.length}
              onClick={() => {
                console.log(`[Map] Cluster clicked: ${c.id}`);
                setExpandedClusterId(c.id);
                setSelectedCluster(c.fridges);
              }}
            />
          ),
        });
      } else {
        for (const f of c.fridges) {
          out.push({
            id: f.profile.id,
            lat: f.profile.homeLat,
            lng: f.profile.homeLng,
            render: () => (
              <HomePin
                fridge={f}
                onClick={() => {
                  console.log(`[Map] Pin clicked for fridge: ${f.profile.name} (${f.profile.id})`);
                  setSelected(f);
                }}
              />
            ),
          });
        }
      }
    }
    return out;
  }, [clusters, expandedClusterId]);

  const visited = useMemo(
    () => magnets.map((m) => ({ lat: m.lat, lng: m.lng })),
    [magnets],
  );

  return (
    <div className="relative flex h-full flex-col">
      <WorldMap
        className="flex-1"
        markers={markers}
        visited={visited}
        initialZoom={1.2}
        initialCenter={profile ? { lat: profile.homeLat, lng: profile.homeLng } : { lat: 20, lng: 10 }}
        onBackgroundClick={() => {
          console.log("[Map] Background clicked");
          setExpandedClusterId(null);
          setSelectedCluster(null);
          setSelected(null);
        }}
      />

      <AnimatePresence>
        {selectedCluster && selectedCluster.length > 1 && (
          <ClusterListSheet
            key="cluster-list"
            fridges={selectedCluster}
            onSelectFridge={(fridge) => {
              console.log(`[Map] Selected fridge from cluster: ${fridge.profile.name}`);
              setSelected(fridge);
            }}
            onClose={() => {
              console.log("[Map] Cluster list closed");
              setSelectedCluster(null);
              setExpandedClusterId(null);
            }}
          />
        )}
        {selected && (
          <>
            {console.log(`[MapScreen] Rendering PinPreviewCard for ${selected.profile.name}`)}
            <PinPreviewCard
              key={selected.profile.id}
              fridge={selected}
              onClose={() => {
                console.log("[MapScreen] Closing PinPreviewCard");
                setSelected(null);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <BottomNavBar
        value={tab}
        onTabChange={(v) => {
          if (v === "fridge") {
            setTab(v);
            nav("/fridge");
          }
        }}
        onAdd={() => nav("/add")}
      />
    </div>
  );
}
