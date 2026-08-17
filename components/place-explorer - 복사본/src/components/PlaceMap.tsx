import { useEffect, useState } from 'react';
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import type { PlaceItem } from './PlaceListPanel';
import type { AppPlace, Category } from '../data/places';
import { ROUTE_SEGMENTS, type SegmentVerdict } from '../data/segments';
import markerHistory from '../assets/markers/history.png';
import markerArts from '../assets/markers/arts.png';
import markerNature from '../assets/markers/nature.png';
import markerShopping from '../assets/markers/shopping.png';

// Turn the route-segment overlay (see segments.ts) on/off in one place —
// flip to `false` to revert to the plain map with no route lines, no
// need to remove any code.
const SHOW_ROUTE_SEGMENTS = true;

// Only two verdict colors on the map, per request: 기본(초록/ok) → blue,
// 위험구간 → orange. 빨강/danger is folded into the same orange as
// 노랑/caution — it's still "위험구간", just a more severe one, so it
// doesn't get its own (red) color. 정보없음/pending (not yet walked) stays
// gray-dashed since that's a "no data yet" state, not a hazard rating.
const SEGMENT_COLOR: Record<SegmentVerdict, string> = {
  ok: '#2563EB',
  caution: '#F97316',
  danger: '#F97316',
  pending: '#9CA3AF',
};

/* =========================================================================
 * PlaceMap.tsx
 * -------------------------------------------------------------------------
 * Google Maps view meant to fill the space to the right of
 * PlaceListPanel. Each marker uses a category pin icon (history/arts/
 * nature/shopping — see CATEGORY_ICON below) matching the place's `category`
 * field from the source data. Clicking a marker calls `onSelectPlace` (same
 * as clicking a place card elsewhere in the app — the caller navigates to
 * that place's detail page), and separately, whichever place is currently
 * active (via the `activePlaceId` prop, driven by the route) gets its pin
 * enlarged and the map pans/zooms to it.
 *
 * Also draws each accessibility route segment (see `segments.ts`) — blue
 * for a normal (초록) segment, orange for any flagged/hazardous one
 * (both 노랑/caution and 빨강/danger — only two colors on the map, so a
 * more severe hazard doesn't get its own red), and gray-dashed for a
 * segment that hasn't been walked/measured yet (its two endpoints
 * joined by a straight line as a placeholder). A small marker also flags any
 * specific hazard point or route "gap" (e.g. take an elevator here)
 * along a segment, with the detail note shown as a native hover
 * tooltip — never a click popup. Toggle `SHOW_ROUTE_SEGMENTS` below to
 * turn the whole overlay on/off.
 *
 * Requires a Google Maps JavaScript API key — pass it in via the
 * `apiKey` prop. This demo reads it from `VITE_GOOGLE_MAPS_API_KEY` in
 * `.env` (see `.env.example`). Without a key, a placeholder is shown
 * instead of a broken map.
 * =======================================================================*/

// Pin artwork provided for each category — 106×136px source images (a
// teardrop pin with a white circle + glyph), imported so Vite bundles them
// (and inlines them as base64 in the single-file demo build).
const CATEGORY_ICON: Record<Category, string> = {
  history: markerHistory,
  arts: markerArts,
  nature: markerNature,
  shopping: markerShopping,
};

// Source images are 106×136 (about 0.78 width:height) — scale down while
// keeping that ratio, and anchor at the bottom-center tip of the pin so it
// points exactly at the place's coordinates.
const ICON_SIZE = { width: 34, height: 44 };
const ICON_SIZE_ACTIVE = { width: 44, height: 57 };

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

// Roughly central to the sample data (Gwanghwamun/Yongsan area, Seoul).
const DEFAULT_CENTER = { lat: 37.555, lng: 126.975 };
const DEFAULT_ZOOM = 13;
const FOCUSED_ZOOM = 16;

interface PlaceMapProps {
  places: AppPlace[];
  activePlaceId?: string;
  onSelectPlace?: (place: PlaceItem) => void;
  apiKey: string;
}

export default function PlaceMap({ places, activePlaceId, onSelectPlace, apiKey }: PlaceMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'place-explorer-google-maps',
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Which marker the cursor is currently over — enlarges just that pin,
  // same as the "active" (selected) size, until the cursor moves away.
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | undefined>(undefined);

  // Pan/zoom to whichever place is currently active (selected from the
  // list or a marker click) whenever it changes.
  useEffect(() => {
    if (!map || !activePlaceId) return;
    const target = places.find((p) => p.id === activePlaceId);
    if (target?.lat != null && target?.lng != null) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(FOCUSED_ZOOM);
    }
  }, [map, activePlaceId, places]);

  if (!apiKey) {
    return (
      <div style={placeholderStyle}>
        <p style={{ margin: 0, fontWeight: 600 }}>Google Maps API 키가 설정되지 않았습니다.</p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>
          프로젝트 루트의 <code>.env</code> 파일에 <code>VITE_GOOGLE_MAPS_API_KEY</code> 값을 채운 뒤
          다시 시작해주세요. (<code>.env.example</code> 참고)
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return <MapSkeleton />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      onLoad={(m) => setMap(m)}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {SHOW_ROUTE_SEGMENTS &&
        ROUTE_SEGMENTS.map((segment) => (
          <PolylineF
            key={segment.id}
            path={segment.path}
            options={{
              strokeColor: SEGMENT_COLOR[segment.verdict],
              // A pending (unmeasured) segment is drawn as a light dashed
              // line — it's only a straight-line placeholder, not a real
              // walked path, so it shouldn't look as solid/confident as
              // the measured segments.
              strokeOpacity: segment.measured ? 0.85 : 0,
              strokeWeight: segment.measured ? 4 : 0,
              icons: segment.measured
                ? undefined
                : [
                    {
                      icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, scale: 3 },
                      offset: '0',
                      repeat: '14px',
                    },
                  ],
              zIndex: 1,
            }}
          />
        ))}
      {SHOW_ROUTE_SEGMENTS &&
        ROUTE_SEGMENTS.flatMap((segment) => {
          const points: { key: string; lat: number; lng: number; title: string; color: string }[] = [];
          if (segment.hazard) {
            points.push({
              key: `${segment.id}-hazard`,
              lat: segment.hazard.lat,
              lng: segment.hazard.lng,
              title: `⚠️ ${segment.hazard.note}`,
              // Same orange as a caution/danger segment line — keeping the
              // map to just blue/orange, no separate red anywhere.
              color: '#F97316',
            });
          }
          if (segment.gap) {
            points.push({
              key: `${segment.id}-gap`,
              lat: segment.gap.lat,
              lng: segment.gap.lng,
              title: `🔀 ${segment.gap.note}`,
              color: '#2563EB',
            });
          }
          return points.map((point) => (
            <MarkerF
              key={point.key}
              position={{ lat: point.lat, lng: point.lng }}
              title={point.title}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: point.color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              zIndex={900}
            />
          ));
        })}
      {places
        .filter((place) => place.lat != null && place.lng != null)
        .map((place) => {
          const active = place.id === activePlaceId;
          const hovered = place.id === hoveredPlaceId;
          const enlarged = active || hovered;
          const size = enlarged ? ICON_SIZE_ACTIVE : ICON_SIZE;
          return (
            <MarkerF
              key={place.id}
              position={{ lat: place.lat as number, lng: place.lng as number }}
              title={place.name}
              onClick={() => onSelectPlace?.(place)}
              onMouseOver={() => setHoveredPlaceId(place.id)}
              onMouseOut={() =>
                setHoveredPlaceId((current) => (current === place.id ? undefined : current))
              }
              icon={{
                url: CATEGORY_ICON[place.category],
                scaledSize: new google.maps.Size(size.width, size.height),
                anchor: new google.maps.Point(size.width / 2, size.height),
              }}
              zIndex={enlarged ? 1000 : undefined}
            />
          );
        })}
    </GoogleMap>
  );
}

// Shimmer while the Google Maps script itself is still loading — same
// shimmer treatment as PlaceListPanel's skeleton cards, so the two loading
// states feel like one system instead of two different UIs.
const MAP_SKELETON_CSS = `
@keyframes place-map-skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.place-map-skeleton {
  background-image: linear-gradient(90deg, #e9ebee 25%, #f5f6f7 37%, #e9ebee 63%);
  background-size: 400% 100%;
  animation: place-map-skeleton-shimmer 1.4s ease-in-out infinite;
}
`;

function MapSkeleton() {
  return (
    <div style={{ ...placeholderStyle, position: 'relative', border: 'none', padding: 0 }}>
      <style>{MAP_SKELETON_CSS}</style>
      <div className="place-map-skeleton" style={{ position: 'absolute', inset: 0 }} />
      <p style={{ position: 'relative', margin: 0, color: '#6b7280', fontSize: 13 }}>
        지도를 불러오는 중…
      </p>
    </div>
  );
}

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: '#f4f5f7',
  border: '1px dashed #d1d5db',
  boxSizing: 'border-box',
  padding: 24,
};
