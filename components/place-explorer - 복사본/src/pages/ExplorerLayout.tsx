import { useEffect, useMemo, useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import type { PlaceItem } from '../components/PlaceListPanel';
import FilterBar, { type FilterMatcher, type MatchableItem } from '../components/FilterBar/FilterBar';
import PlaceMap from '../components/PlaceMap';
import { PLACES, type AppPlace } from '../data/places';

/* =========================================================================
 * ExplorerLayout.tsx — persistent shell shared by the list view ("/") and
 * the detail view ("/places/:id"), so the map + filter bar on the right
 * never unmount/reload when navigating between them. Only the fixed-width
 * left slot swaps, via <Outlet/>:
 *
 *   <Route element={<ExplorerLayout />}>
 *     <Route index element={<PlaceListSlot />} />        (left: list)
 *     <Route path="places/:id" element={<PlaceDetailSlot />} />  (left: detail)
 *   </Route>
 *
 * The left slot always occupies the same fixed position/size — PANEL_WIDTH
 * mirrors PlaceListPanel's own internal constant (see the comment there),
 * and PlaceDetailSlot mirrors PlaceListPanel's outer panel styling too so
 * both slots look and sit identically.
 *
 * Clicking a place — a list card OR a map marker — navigates to its detail
 * page (see `handleSelectPlace` below). Either way, the map auto-highlights
 * (enlarges the pin) and pans/zooms to that place, driven purely by the
 * `/places/:id` route param (`activePlaceId`) — so the map always stays in
 * sync with whatever's showing on the left.
 * =======================================================================*/

// Mirrors PlaceListPanel's internal `PANEL_WIDTH` constant — keep these
// two in sync if that value ever changes.
export const PANEL_WIDTH = 440;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

// FilterBar's AccessibilityValue spells the 4th state "unsurveyed";
// PlaceItem/verdict-badge (PlaceListPanel/PlaceMap) spell it
// "not-surveyed". Region/category values already match 1:1 (see
// places.ts), so this is the only translation a place needs before it
// can be checked against FilterBar's matcher.
function toMatchableItem(place: AppPlace): MatchableItem {
  return {
    region: place.region,
    categories: [place.category],
    accessibility: place.verdict === 'not-surveyed' ? 'unsurveyed' : place.verdict,
    name: place.name,
    tags: place.keywords,
  };
}

export interface ExplorerOutletContext {
  visiblePlaces: AppPlace[];
  activePlaceId: string | undefined;
  /** List card click (or a map marker click) → navigates to /places/:id
   *  (see PlaceListSlot / ExplorerLayout's <PlaceMap>). */
  onSelectPlace: (place: PlaceItem) => void;
  /**
   * True for a brief moment after mount, simulating the place list's
   * initial data fetch — PlaceListSlot forwards this straight into
   * PlaceListPanel's `loading` prop so it shows skeleton cards instead of
   * popping in empty/blank. Swap the `setTimeout` below for your real
   * fetch's pending state once one exists.
   */
  placesLoading: boolean;
}

// How long to show the skeleton list before "loading" finishes. Stands in
// for a real async fetch — replace with an actual request's pending state
// when this app has one.
const SIMULATED_LOAD_MS = 900;

export default function ExplorerLayout() {
  const navigate = useNavigate();

  // Both the list and the map now navigate to /places/:id on click, so the
  // route param is always what determines the active/highlighted place —
  // no separate "just clicked, didn't navigate" state to track anymore.
  const detailMatch = useMatch('/places/:id');
  const activePlaceId = detailMatch?.params.id;

  const [matcher, setMatcher] = useState<FilterMatcher | null>(null);

  // Simulated initial fetch delay for the place list (see
  // `ExplorerOutletContext.placesLoading` above).
  const [placesLoading, setPlacesLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPlacesLoading(false), SIMULATED_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  // List card click OR map marker click → go to the detail page. (The
  // detail page is a stub for now — see PlaceDetailSlot.tsx — built by
  // someone else and swapped in later; only the route/plumbing lives here.)
  const handleSelectPlace = (place: PlaceItem) => {
    navigate(`/places/${place.id}`);
  };

  // Re-filter PLACES whenever FilterBar reports a change. `matcher` is
  // null until FilterBar's first onChange fires (on mount), at which
  // point it's a no-op filter (every field empty) — so this also just
  // shows everything until then.
  const visiblePlaces = useMemo(() => {
    if (!matcher) return PLACES;
    return PLACES.filter((place) => matcher(toMatchableItem(place)));
  }, [matcher]);

  const outletContext: ExplorerOutletContext = {
    visiblePlaces,
    activePlaceId,
    onSelectPlace: handleSelectPlace,
    placesLoading,
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Left slot: list or detail, same fixed position/size either way. */}
      <Outlet context={outletContext} />

      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: PANEL_WIDTH,
          overflow: 'hidden',
        }}
      >
        {GOOGLE_MAPS_API_KEY ? (
          <PlaceMap
            places={visiblePlaces}
            activePlaceId={activePlaceId}
            onSelectPlace={handleSelectPlace}
            apiKey={GOOGLE_MAPS_API_KEY}
          />
        ) : (
          // Don't even mount PlaceMap (and its useJsApiLoader call) without
          // a key — there's nothing to load, so skip straight to the
          // placeholder instead of letting the loader retry against a
          // key-less URL.
          <MapKeyPlaceholder />
        )}

        <FilterBar
          className="filter-bar--overlay"
          // setMatcher(() => matches) — not setMatcher(matches) — since
          // useState would otherwise treat a bare function argument as an
          // updater function instead of the next state value.
          onChange={(_state, matches) => setMatcher(() => matches)}
        />
      </div>
    </div>
  );
}

function MapKeyPlaceholder() {
  return (
    <div
      style={{
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
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>Google Maps API 키가 설정되지 않았습니다.</p>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>
        프로젝트 루트의 <code>.env</code> 파일에 <code>VITE_GOOGLE_MAPS_API_KEY</code> 값을 채운 뒤 다시
        시작해주세요. (<code>.env.example</code> 참고)
      </p>
    </div>
  );
}
