import React, { useMemo, useState } from 'react';

/* =========================================================================
 * PlaceListPanel.tsx
 * -------------------------------------------------------------------------
 * A standalone, fixed left-side sidebar/panel that lists places next to a
 * map view (map renders in the remaining space to the right). Drop this
 * file into your project as-is — it has no external CSS/UI-kit dependency,
 * only `react`.
 *
 * This is just the list itself — no logo/nav header and no filter/sort
 * sub-header. If you need those back, wrap this component with your own
 * header instead of adding them back in here.
 *
 * Data model
 * -------------------------------------------------------------------------
 * Feed it real data by mapping your Excel/CSV rows (e.g. parsed with the
 * `xlsx` or `papaparse` package) into `PlaceItem[]` and passing that array
 * in via the `places` prop. The bundled SAMPLE_PLACES below was generated
 * exactly this way from "Allways데이터시트_수정본.xlsx":
 *
 *   // `places` sheet → name/keywords, `survey` sheet → verdict
 *   const placeRows = XLSX.utils.sheet_to_json(placesSheet);
 *   const surveyByTarget = new Map(
 *     XLSX.utils.sheet_to_json(surveySheet).map((r) => [r['대상_id'], r['판정']])
 *   );
 *   const VERDICT_MAP = { 초록: 'accessible', 노랑: 'caution', 빨강: 'difficult' };
 *
 *   const places: PlaceItem[] = placeRows
 *     .filter((row) => row['장소명_영문'])
 *     .map((row) => ({
 *       id: String(row['코스내순서']),
 *       name: row['장소명_영문'],
 *       // Rule: never invent a verdict — no survey row (or "정보없음") -> 'not-surveyed'.
 *       verdict: VERDICT_MAP[surveyByTarget.get(row['코스내순서'])] ?? 'not-surveyed',
 *       keywords: String(row['태그'] ?? '')
 *         .trim()
 *         .split(/\s+/)
 *         .filter(Boolean)
 *         .map((t) => (t.startsWith('#') ? t : `#${t}`))
 *         .slice(0, 3),
 *       // no `address` text column in this sheet — carry lat/lng instead
 *       // (see the "Address (English)" section below), or map your own
 *       // address column in here if one exists (e.g. address: row['주소']).
 *       lat: row['위도'],
 *       lng: row['경도'],
 *     }));
 *
 *   <PlaceListPanel places={places} />
 *
 * Address (English) — TODO once you have a Google Maps API key
 * -------------------------------------------------------------------------
 * The sheet has 위도/경도 (lat/lng, carried on `lat`/`lng` below) but no
 * address text, so `address` is left unset in SAMPLE_PLACES for now. Once
 * you have a Google Maps Geocoding API key, reverse-geocode each place
 * and fill in `address` — run this once as a batch/build step, not on
 * every render:
 *
 *   async function reverseGeocodeEn(lat: number, lng: number, apiKey: string) {
 *     const url =
 *       `https://maps.googleapis.com/maps/api/geocode/json` +
 *       `?latlng=${lat},${lng}&language=en&key=${apiKey}`;
 *     const res = await fetch(url);
 *     const data = await res.json();
 *     return data.results?.[0]?.formatted_address as string | undefined;
 *   }
 *
 *   const withAddresses = await Promise.all(
 *     places.map(async (p) => ({
 *       ...p,
 *       address:
 *         p.lat != null && p.lng != null
 *           ? await reverseGeocodeEn(p.lat, p.lng, GOOGLE_MAPS_API_KEY)
 *           : undefined,
 *     }))
 *   );
 *
 * Card layout (list row)
 * -------------------------------------------------------------------------
 * Each card shows, top to bottom: name (bold) with the BF certification
 * mark inline to its right, the English address underneath, then the
 * keyword chips. No photo thumbnail and no verdict badge in this row
 * anymore — both were pulled per a design correction. `photoUrl` and
 * `verdict` stay on `PlaceItem` (PlaceMap still colors markers by
 * `verdict`, and a future detail view may still want the photo) but
 * neither renders here now.
 *
 * BF certification mark
 * -------------------------------------------------------------------------
 * `BFMark` below is still a placeholder — no official BF (Barrier-Free)
 * certification logo asset has been supplied yet, so it's a generic
 * circular stand-in matching the reference layout's shape/position.
 * Swap in the real logo (and gate it on real per-place data, e.g. the
 * `places` sheet's BF인증_등급 column) once that's available.
 * =======================================================================*/

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The 4 fixed verdict states from verdictbadge.css. */
export type VerdictState = 'accessible' | 'caution' | 'difficult' | 'not-surveyed';

export interface PlaceItem {
  id: string;
  name: string;
  /** Photo thumbnail shown to the left of the name. Leave unset if you
   *  don't have one yet — it renders as an empty placeholder box rather
   *  than a broken image (no photo data source is wired up currently). */
  photoUrl?: string;
  /** Optional — omit when the source data (e.g. an Excel sheet) has no address field.
   *  The address row simply doesn't render when this is left out. */
  address?: string;
  /** Short one-line English description (e.g. Excel's 한줄설명_영문 column).
   *  Shown in PlaceMap's InfoWindow beneath the place name. */
  description?: string;
  /** Coordinates carried along so `address` can be filled in later via
   *  reverse geocoding (e.g. Google Maps Geocoding API) once you have a
   *  key — see the file-level comment above. Not rendered directly. */
  lat?: number;
  lng?: number;
  /** Accessibility verdict shown below the name.
   *  Leave unset when there's no survey data for this place — it renders
   *  as 'not-surveyed' rather than guessing (see verdictbadge.css rule #4). */
  verdict?: VerdictState;
  keywords: string[]; // up to 3 — rendered as `#tag` chips
}

export type SortOption = 'Recommend' | 'Distance' | 'Name';

export interface PlaceListPanelProps {
  /** List of places to render. Defaults to bundled sample data if omitted. */
  places?: PlaceItem[];
  /** Called when a card is clicked — hook this up to your map to pan/zoom. */
  onSelectPlace?: (place: PlaceItem) => void;
  /** Currently selected place id, if any, to visually highlight its card. */
  activePlaceId?: string;
  /** Called whenever the sort dropdown (above the list) changes. The
   *  component already re-orders its own rendered list for you (Name
   *  alphabetically; Distance is a demo stand-in — see PlaceListPanel
   *  below); use this callback if the parent needs to know too. */
  onSortChange?: (sort: SortOption) => void;
  /** While true, renders shimmering skeleton cards instead of `places` —
   *  set this from whatever async call is fetching your data (an API
   *  request, etc.) so the list has a loading state instead of popping
   *  in empty/blank. */
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Sample data (used only if no `places` prop is supplied)
// -----------------------------------------------------------------------
// Sourced from "Allways데이터시트_수정본.xlsx":
//   name     ← `places` sheet, 장소명_영문
//   keywords ← `places` sheet, 태그 (split on whitespace, up to 3)
//   verdict  ← `survey` sheet, 판정 for the matching 대상_id
//              (초록→accessible, 노랑→caution, 빨강→difficult;
//               "정보없음" or no survey row at all → not-surveyed)
//   lat/lng  ← `places` sheet, 위도/경도 — carried along so `address` can
//              be filled in later via Google Maps Geocoding (see the
//              file-level comment above). Not rendered directly yet.
// ---------------------------------------------------------------------------

export const SAMPLE_PLACES: PlaceItem[] = [
  {
    id: 'GH01',
    name: 'Seoul Museum of Art (SeMA)',
    verdict: 'accessible',
    lat: 37.5640625,
    lng: 126.9738125,
    keywords: ['#ContemporaryArt', '#ArtGallery', '#FreeEntry'],
  },
  {
    id: 'GH02',
    name: 'Deoksugung',
    verdict: 'accessible',
    lat: 37.5658862,
    lng: 126.9749017,
    keywords: ['#RoyalPalace', '#History'],
  },
  {
    id: 'GH03',
    name: 'Cheonggye Plaza',
    verdict: 'caution',
    lat: 37.5690744,
    lng: 126.9775921,
    keywords: ['#CityWalk', '#Riverside'],
  },
  {
    id: 'GH05',
    name: 'Garden of Gratitude',
    verdict: 'difficult',
    lat: 37.5732978,
    lng: 126.9764085,
    keywords: ['#NewSpot', '#MediaArt', '#CityPark'],
  },
  {
    id: 'GH06',
    name: 'National Museum of Korean Contemporary History',
    verdict: 'accessible',
    lat: 37.5739432,
    lng: 126.9779299,
    keywords: ['#History', '#Museum'],
  },
  {
    id: 'GH07',
    name: 'National Palace Museum of Korea',
    verdict: 'accessible',
    lat: 37.5766084,
    lng: 126.974951,
    keywords: ['#RoyalPalace', '#Museum'],
  },
  {
    id: 'GH08',
    name: 'Gyeongbokgung Palace',
    verdict: 'caution',
    lat: 37.579617,
    lng: 126.977041,
    keywords: ['#RoyalPalace', '#History', '#Hanbok'],
  },
  {
    id: 'GH09',
    name: 'National Folk Museum of Korea',
    verdict: 'accessible',
    lat: 37.5816456,
    lng: 126.9789948,
    keywords: ['#TraditionalLife', '#Museum'],
  },
  {
    id: 'GH10',
    name: 'National Museum of Modern and Contemporary Art',
    verdict: 'accessible',
    lat: 37.5788333,
    lng: 126.9804281,
    keywords: ['#ContemporaryArt', '#ArtGallery'],
  },
  {
    id: 'GH04',
    name: 'Gwanghwamun Square',
    verdict: 'accessible',
    lat: 37.572389,
    lng: 126.9769117,
    keywords: ['#KingSejong', '#HeartOfSeoul', '#CityWalk'],
  },
  {
    id: 'YS01',
    name: 'The War Memorial of Korea',
    verdict: 'caution',
    lat: 37.5366131,
    lng: 126.9771068,
    keywords: ['#WarHistory', '#KoreanHistory', '#Museum'],
  },
  {
    id: 'YS02',
    name: 'IPARK Mall Yongsan Branch',
    verdict: 'accessible',
    lat: 37.52939,
    lng: 126.9650925,
    keywords: ['#ShoppingMall', '#DiningAndShopping', '#IndoorLeisure'],
  },
  {
    id: 'YS03',
    name: 'Amorepacific Museum of Art',
    verdict: 'not-surveyed',
    lat: 37.528786,
    lng: 126.968395,
    keywords: ['#ContemporaryArt', '#ModernArchitecture', '#ArtGallery'],
  },
  {
    id: 'YS04',
    name: 'Yongsan Family Park',
    verdict: 'difficult',
    lat: 37.5211389,
    lng: 126.9839378,
    keywords: ['#CityPark', '#CityWalk', '#FamilyPark'],
  },
  {
    id: 'YS05',
    name: "Yongsan Children's Garden",
    verdict: 'caution',
    lat: 37.5277404,
    lng: 126.9706923,
    keywords: ['#GardenWalk', '#FamilyTrip', '#CityPark'],
  },
  {
    id: 'YS06',
    name: 'National Museum of Korea',
    verdict: 'accessible',
    lat: 37.5238506,
    lng: 126.9804702,
    keywords: ['#History', '#CulturalHeritage', '#NationalMuseum'],
  },
  {
    id: 'YS07',
    name: 'Seoul Hyochang Park',
    // no survey row for this place — left unset, renders as not-surveyed
    lat: 37.5450482,
    lng: 126.9603142,
    keywords: ['#History', '#CityPark'],
  },
  {
    id: 'YS08',
    name: 'N Seoul Tower',
    lat: 37.5511694,
    lng: 126.9882266,
    keywords: ['#SeoulLandmark', '#NightView'],
  },
  {
    id: 'YS09',
    name: 'Nodeul Island',
    lat: 37.5177627,
    lng: 126.9596671,
    keywords: ['#SunsetSpot', '#Riverside'],
  },
  {
    id: 'YS10',
    name: 'Leeum Museum of Art',
    lat: 37.5379389,
    lng: 126.9992749,
    keywords: ['#ContemporaryArt', '#ArtGallery'],
  },
  {
    id: 'YS11',
    name: 'Ichon Hangang Park',
    lat: 37.5169202,
    lng: 126.9717022,
    keywords: ['#HangangPark', '#PicnicSpot', '#RiversideWalk'],
  },
];

// ---------------------------------------------------------------------------
// BF certification mark — PLACEHOLDER
// -----------------------------------------------------------------------
// TODO: this is a stand-in only. No official BF (Barrier-Free)
// certification logo asset has been supplied yet — swap this circular
// mark for the real icon/design and gate it on real per-place data (e.g.
// the `places` sheet's BF인증_등급 column) once that's ready. For now it
// always renders next to the name so the layout can be reviewed/demoed.
// ---------------------------------------------------------------------------
const BFMark: React.FC = () => (
  <span style={styles.bfMark} title="BF 인증 (placeholder)" aria-label="BF certified (placeholder)">
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#eef1f4" />
      <path
        d="M8 17.5c0-2.8 1.8-5 4-5"
        fill="none"
        stroke="#2f9e52"
        strokeWidth={2.1}
        strokeLinecap="round"
      />
      <circle cx="8.6" cy="10.4" r="1.7" fill="#2f9e52" />
      <path
        d="M12.5 17.5 15.3 12l2.7 1.4-2.4 2.1 1.6 2.6"
        fill="none"
        stroke="#e8791b"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.1" cy="8.4" r="1.7" fill="#e8791b" />
    </svg>
  </span>
);

// ---------------------------------------------------------------------------
// APHont font-face
// -----------------------------------------------------------------------
// APHont (American Printing House for the Blind) is designed for
// readability by people with low vision — a good fit alongside this app's
// accessibility focus. Unlike the CSS above, font files are binary and too
// large to embed as base64 directly in this source file without bloating
// it, so this references relative paths instead:
//
//   ./fonts/APHont-Regular.ttf
//   ./fonts/APHont-Bold.ttf
//   ./fonts/APHont-Italic.ttf
//   ./fonts/APHont-BoldItalic.ttf
//
// Copy the 4 .ttf files (delivered alongside this component) into a
// `fonts/` folder next to wherever your bundler serves static assets
// (e.g. `public/fonts/`), and adjust FONT_BASE_PATH below to match your
// project's public path if it differs.
// ---------------------------------------------------------------------------
const FONT_BASE_PATH = './fonts';

const FONT_FACE_CSS = `
@font-face {
  font-family: 'APHont';
  src: url('${FONT_BASE_PATH}/APHont-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'APHont';
  src: url('${FONT_BASE_PATH}/APHont-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'APHont';
  src: url('${FONT_BASE_PATH}/APHont-Italic.ttf') format('truetype');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'APHont';
  src: url('${FONT_BASE_PATH}/APHont-BoldItalic.ttf') format('truetype');
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}
`;

// ---------------------------------------------------------------------------
// PlaceCard
// ---------------------------------------------------------------------------

interface PlaceCardProps {
  place: PlaceItem;
  active?: boolean;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, active, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        ...styles.card,
        ...(active ? styles.cardActive : {}),
      }}
    >
      {/* Title row: name (bold) + BF certification mark */}
      <div style={styles.titleRow}>
        <span style={styles.placeName}>{place.name}</span>
        <BFMark />
      </div>

      {/* One-line description: directly under the name (only rendered when present) */}
      {place.description && <div style={styles.descriptionRow}>{place.description}</div>}

      {/* Address row: only rendered when present */}
      {place.address && <div style={styles.addressRow}>{place.address}</div>}

      {/* Keyword chips row */}
      <div style={styles.tagRow}>
        {place.keywords.slice(0, 3).map((keyword, idx) => (
          <span key={idx} style={styles.tagChip}>
            {keyword.startsWith('#') ? keyword : `#${keyword}`}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Skeleton loading state
// -----------------------------------------------------------------------
// Shown instead of real cards while `loading` is true — mirrors PlaceCard's
// shape (title + BF mark circle, address bar, keyword pills) as gray
// shimmering blocks, so the list's layout doesn't jump once real data
// arrives. The shimmer itself is a moving gradient sweep, driven by the
// `@keyframes` below (injected once via a <style> tag in PlaceListPanel's
// return, same pattern as FONT_FACE_CSS).
// ---------------------------------------------------------------------------
const SKELETON_CSS = `
@keyframes place-skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.place-skeleton-block {
  background-image: linear-gradient(90deg, #eceef1 25%, #f7f8f9 37%, #eceef1 63%);
  background-size: 400% 100%;
  animation: place-skeleton-shimmer 1.4s ease-in-out infinite;
}
`;

const SkeletonCard: React.FC = () => (
  <div style={styles.card} aria-hidden="true">
    <div style={styles.titleRow}>
      <span
        className="place-skeleton-block"
        style={{ height: 22, width: '65%', borderRadius: 6 }}
      />
      <span className="place-skeleton-block" style={{ ...styles.bfMark, borderRadius: '50%' }} />
    </div>
    <span className="place-skeleton-block" style={{ height: 13, width: '92%', borderRadius: 6 }} />
    <span className="place-skeleton-block" style={{ height: 13, width: '58%', borderRadius: 6 }} />
    <div style={styles.tagRow}>
      <span className="place-skeleton-block" style={{ height: 28, width: 84, borderRadius: 999 }} />
      <span className="place-skeleton-block" style={{ height: 28, width: 70, borderRadius: 999 }} />
      <span className="place-skeleton-block" style={{ height: 28, width: 96, borderRadius: 999 }} />
    </div>
  </div>
);

const SKELETON_CARD_COUNT = 5;

// ---------------------------------------------------------------------------
// PlaceListPanel (main export) — just the list now, no logo/nav header.
// Sort row sits directly above the list.
// ---------------------------------------------------------------------------

const PANEL_WIDTH = 440;
const SORT_OPTIONS: SortOption[] = ['Recommend', 'Distance', 'Name'];

const ChevronDownIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 9l6 6 6-6"
      stroke="#555"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlaceListPanel: React.FC<PlaceListPanelProps> = ({
  places,
  onSelectPlace,
  activePlaceId,
  onSortChange,
  loading = false,
}) => {
  const baseData = useMemo(() => places ?? SAMPLE_PLACES, [places]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Recommend');

  // Demo-reasonable client-side sort so the dropdown visibly does
  // something out of the box. Swap for real logic once you have it (e.g.
  // actual distance from the user using each place's lat/lng) — that's
  // exactly what `onSortChange` is for.
  const data = useMemo(() => {
    if (sortBy === 'Name') {
      return [...baseData].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'Distance') {
      return [...baseData].reverse();
    }
    return baseData; // 'Recommend' keeps original order
  }, [baseData, sortBy]);

  const handleSortSelect = (option: SortOption) => {
    setSortBy(option);
    setSortOpen(false);
    onSortChange?.(option);
  };

  return (
    <>
      {/* APHont @font-face declarations */}
      <style>{FONT_FACE_CSS}</style>
      {/* Skeleton shimmer keyframes, used only while `loading` is true */}
      <style>{SKELETON_CSS}</style>

      <aside style={styles.panel} aria-label="Place list panel">
        {/* ---------------- Sort row: directly above the list ---------------- */}
        <div style={styles.sortRow}>
          <div style={styles.sortWrapper}>
            <button
              type="button"
              style={styles.sortButton}
              onClick={() => setSortOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <span>Sort by {sortBy}</span>
              <ChevronDownIcon />
            </button>

            {sortOpen && (
              <ul style={styles.sortMenu} role="listbox">
                {SORT_OPTIONS.map((option) => (
                  <li key={option} role="option" aria-selected={option === sortBy}>
                    <button
                      type="button"
                      style={{
                        ...styles.sortMenuItem,
                        ...(option === sortBy ? styles.sortMenuItemActive : {}),
                      }}
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ---------------- Scrollable place card list ---------------- */}
        <div style={styles.list}>
          {loading ? (
            Array.from({ length: SKELETON_CARD_COUNT }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : (
            <>
              {data.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  active={place.id === activePlaceId}
                  onClick={() => onSelectPlace?.(place)}
                />
              ))}

              {data.length === 0 && <div style={styles.emptyState}>No places to show.</div>}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default PlaceListPanel;

// ---------------------------------------------------------------------------
// Styles (plain inline style objects — no external CSS/Tailwind required)
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: PANEL_WIDTH,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '4px 0 16px rgba(0,0,0,0.06)',
    zIndex: 1000,
    transition: 'transform 0.25s ease',
    fontFamily:
      "'APHont', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  sortRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 16px 0',
    flexShrink: 0,
  },
  sortWrapper: {
    position: 'relative',
  },
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f4f5f7',
    border: 'none',
    borderRadius: 20,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
  },
  sortMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
    listStyle: 'none',
    margin: 0,
    padding: 6,
    width: 140,
    zIndex: 10,
  },
  sortMenuItem: {
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderRadius: 6,
    padding: '8px 10px',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
  },
  sortMenuItemActive: {
    background: '#eef2ff',
    color: '#4338ca',
    fontWeight: 600,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    border: '1px solid #d1d5db',
    borderRadius: 20,
    padding: '18px 20px',
    cursor: 'pointer',
    background: '#ffffff',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
  },
  cardActive: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 2px rgba(99,102,241,0.15)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  placeName: {
    fontSize: 19,
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#111827',
  },
  bfMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flexShrink: 0,
  },
  descriptionRow: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 1.45,
  },
  addressRow: {
    fontSize: 13,
    color: '#6b7280',
  },
  tagRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagChip: {
    background: '#ffffff',
    color: '#111827',
    fontSize: 12.5,
    fontWeight: 500,
    borderRadius: 999,
    padding: '5px 14px',
    border: '1.5px solid #111827',
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    padding: '40px 0',
  },
};
