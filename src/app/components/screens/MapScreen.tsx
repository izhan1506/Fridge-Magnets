import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { useSession } from "../../lib/session";
import { getPublicFridges } from "../../lib/store";
import { haversine, offsetCoords, ringSlot, pixelsToKm } from "../../lib/geo";
import type { PublicFridge } from "../../lib/types";
import { WorldMap, type MapMarker } from "../worldmap";
import { HomePin, ClusterBubble, PinPreviewCard, ClusterListSheet } from "../mappins";
import { BottomNavBar } from "../glass-nav";

/** A fridge paired with the position its pin is drawn at (jittered, not true). */
interface PlacedFridge {
  fridge: PublicFridge;
  lat: number;
  lng: number;
}

interface Cluster {
  id: string;
  lat: number;
  lng: number;
  fridges: PublicFridge[];
  /** Same fridges, carrying the position each pin is drawn at. */
  members: PlacedFridge[];
}

const INITIAL_ZOOM = 1.2;

/** Gap between pins that would otherwise share one coordinate. */
const PIN_SPACING_KM = 1;

/**
 * Pins closer together than this many screen pixels collapse into a bubble.
 *
 * Expressed in pixels, not km, because that's what legibility actually depends
 * on: the radius was a fixed 1200km, so London/Paris/Dublin were one dot at
 * every zoom and no amount of coordinate precision could separate them. Scaling
 * with zoom means a city groups when you're viewing a continent, and its
 * members separate once you're close enough for 1km to be more than a few px.
 */
const CLUSTER_RADIUS_PX = 44;

/** Greedy proximity clustering so dense areas collapse into bubbles. */
function clusterFridges(placed: PlacedFridge[], radiusKm: number): Cluster[] {
  const clusters: Cluster[] = [];
  for (const p of placed) {
    const home = clusters.find((c) => haversine(c.lat, c.lng, p.lat, p.lng) < radiusKm);
    if (home) {
      home.fridges.push(p.fridge);
      // Re-centre on the members' drawn positions, not their stored ones.
      home.members.push(p);
      home.lat = home.members.reduce((s, x) => s + x.lat, 0) / home.members.length;
      home.lng = home.members.reduce((s, x) => s + x.lng, 0) / home.members.length;
    } else {
      clusters.push({
        id: p.fridge.profile.id,
        lat: p.lat,
        lng: p.lng,
        fridges: [p.fridge],
        members: [p],
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
  /* Zoom drives the cluster radius. Rounded to 0.25 steps so panning doesn't
     re-cluster on every animation frame. */
  const [view, setView] = useState({ zoom: INITIAL_ZOOM, lat: 20 });

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
              email: profile.email,
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

  /* Home base is stored as a city centroid, so everyone who picked the same
     city shares one exact coordinate and their pins land on top of each other.
     Fan those groups out onto rings ~1km apart so each is individually
     clickable. Anyone who doesn't collide keeps their real coordinate, and
     nothing is written back — this is display only. */
  const placed: PlacedFridge[] = useMemo(() => {
    const groups = new Map<string, PublicFridge[]>();
    for (const f of fridges) {
      const key = `${f.profile.homeLat},${f.profile.homeLng}`;
      const group = groups.get(key);
      if (group) group.push(f);
      else groups.set(key, [f]);
    }

    const out: PlacedFridge[] = [];
    for (const group of groups.values()) {
      // Sorted by id so a given user keeps the same slot across reloads
      // regardless of what order the query returned them in.
      const ordered = [...group].sort((a, b) => a.profile.id.localeCompare(b.profile.id));
      ordered.forEach((fridge, i) => {
        const { distanceKm, angleRad } = ringSlot(i, PIN_SPACING_KM);
        out.push({
          fridge,
          ...offsetCoords(fridge.profile.homeLat, fridge.profile.homeLng, distanceKm, angleRad),
        });
      });
    }
    return out;
  }, [fridges]);

  const clusterRadiusKm = useMemo(
    () => pixelsToKm(CLUSTER_RADIUS_PX, view.zoom, view.lat),
    [view.zoom, view.lat],
  );

  const clusters = useMemo(
    () => clusterFridges(placed, clusterRadiusKm),
    [placed, clusterRadiusKm],
  );

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
        for (const { fridge: f, lat, lng } of c.members) {
          out.push({
            id: f.profile.id,
            // Jittered position, matching what clustering used — reading the
            // stored centroid here would snap pins back together the moment a
            // cluster expanded.
            lat,
            lng,
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
        initialZoom={INITIAL_ZOOM}
        initialCenter={profile ? { lat: profile.homeLat, lng: profile.homeLng } : { lat: 20, lng: 10 }}
        onViewChange={(v) =>
          setView((prev) => {
            // Quantise so a pan/zoom gesture doesn't re-cluster every frame.
            const zoom = Math.round(v.zoom * 4) / 4;
            const lat = Math.round(v.lat);
            return prev.zoom === zoom && prev.lat === lat ? prev : { zoom, lat };
          })
        }
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
