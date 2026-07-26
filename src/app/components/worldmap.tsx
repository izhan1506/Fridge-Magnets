import { type ReactNode } from "react";
import Map, { Marker, NavigationControl, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Real slippy map powered by MapLibre GL + OpenFreeMap vector tiles.
 * Free, no API key / token required. Styled with the light "Positron" theme to
 * match the app's soft pastel aesthetic. Markers are real React nodes.
 */

// OpenFreeMap — free, no-signup vector tiles (https://openfreemap.org).
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render: (screenScale: number) => ReactNode;
}

export function WorldMap({
  markers,
  visited = [],
  className = "",
  initialCenter,
  initialZoom = 1,
  onBackgroundClick,
}: {
  markers: MapMarker[];
  /** Home lat/lng of the viewer's visited places — tonally highlighted. */
  visited?: { lat: number; lng: number }[];
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onBackgroundClick?: (lat: number, lng: number) => void;
}) {
  const center = initialCenter ?? { lat: 20, lng: 10 };

  function handleClick(e: MapLayerMouseEvent) {
    onBackgroundClick?.(e.lngLat.lat, e.lngLat.lng);
  }

  return (
    <div className={`relative ${className}`}>
      <Map
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: initialZoom }}
        mapStyle={MAP_STYLE}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        onClick={onBackgroundClick ? handleClick : undefined}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Visited highlight halos in the primary tone. */}
        {visited.map((v, i) => (
          <Marker key={`v-${i}`} longitude={v.lng} latitude={v.lat}>
            <span
              className="block rounded-full"
              style={{ width: 26, height: 26, background: "rgba(127,119,221,0.28)" }}
            />
          </Marker>
        ))}

        {markers.map((m) => (
          <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="bottom">
            {m.render(1)}
          </Marker>
        ))}
      </Map>
    </div>
  );
}
