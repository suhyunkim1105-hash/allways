# FilterBar

A React/TypeScript tourism destination filter bar: Region, Category, and
Accessibility pill filters plus a free-text search box, all laid out in a
single horizontally-scrolling row, designed to float across the top of a
Google Map. Selected filters appear as removable chips below the bar,
with a "Clear All" action.

## Files in this package

- **`FilterBar.tsx`** — the component.
- **`FilterBar.css`** — all of its styling (imported at the top of
  `FilterBar.tsx` via `import "./FilterBar.css"`). Keep these two files
  together.
- **`fonts/`** — the actual APHont font files (self-hosted; APHont isn't
  on Google Fonts or any public CDN), referenced by `FilterBar.css`'s
  `@font-face` rules. Each of the 4 weights/styles ships as `.woff2`
  (primary), `.woff` (fallback), and `.ttf` (last-resort fallback).
- **`verdict-badge.css`** / **`verdict-badge.js`** — the original
  source assets for the Accessibility badges (owner: 명진). Their icons,
  labels, and tooltip copy are inlined/ported into `FilterBar.css` /
  `FilterBar.tsx` already (see "Accessibility badges" below); these
  copies are included only for reference / attribution.
- **`preview.html`** — a self-contained, pre-bundled demo (real font
  included) — open it directly in a browser, no build step or server
  required.

## Requirements

- React 18+ (the component uses `useId()`) with `react-dom` available
  (the Accessibility tooltip uses `createPortal`, see below)
- TypeScript (compiles clean under `tsc --strict`)
- A bundler that can import `.css` files from a `.tsx` file (Vite, CRA,
  Next.js, webpack — all standard React setups support this out of the
  box)

## Usage

```tsx
import FilterBar, { FilterBarHandle, MatchableItem } from "./FilterBar";
// FilterBar.css is imported automatically by FilterBar.tsx itself —
// you don't need to import it separately.

const destinations: MatchableItem[] = [
  {
    name: "Gyeongbokgung Palace",
    region: "gwanghwamun",
    categories: ["history"],
    accessibility: "caution",
    tags: ["RoyalPalace", "History", "Hanbok"],
  },
  // ...
];

function DestinationsPage() {
  const [visible, setVisible] = useState(destinations);

  return (
    <FilterBar
      onChange={(state, matches) => setVisible(destinations.filter(matches))}
    />
  );
}
```

An optional `ref` exposes an imperative API:

```tsx
const ref = useRef<FilterBarHandle>(null);
ref.current?.getState();     // current FilterBarState
ref.current?.buildMatcher(); // (item: MatchableItem) => boolean
ref.current?.clearAll();     // reset every filter + the search box
```

## Filtering logic

OR within a single filter group, AND across different groups — checking
both "Gwanghwamun" and "Yongsan" broadens results to either region, while
additionally checking "All-Way" narrows those results down to accessible
places in either region. The search box matches (case-insensitive
substring) against an item's `name` or any of its `tags`, ANDed with
every other filter group.

## Layout

Region, Category, Accessibility, and the search box all sit in one
`flex-wrap: nowrap` row. If the row is wider than its container it
scrolls horizontally instead of wrapping to a second line. Each filter
group's `<legend>` stays in the DOM for screen readers but is visually
hidden, since the pill labels themselves (e.g. "Gwanghwamun", "History &
Heritage") are already self-descriptive.

There is intentionally no Travel Schedule / date filter — an earlier
version of this component had one; it's been removed.

## Map overlay usage

This bar is designed to float across the top of a Google Map, not just
sit in normal page flow. Every pill and the search input carry a soft
drop shadow by default so they stay legible over busy map imagery. To
actually position it as an overlay, give the map container
`position: relative` and pass the `filter-bar--overlay` modifier through
the `className` prop:

```tsx
<div style={{ position: "relative" }}>
  <GoogleMap ... />
  <FilterBar className="filter-bar--overlay" onChange={...} />
</div>
```

`filter-bar--overlay` absolutely positions the bar near the top of its
nearest positioned ancestor with a sensible z-index. Omit it (the
default) to let the bar sit inline in normal document flow.

## Accessibility badges

The All-Way / Step-Way / Re-Way / Not surveyed pills use the real
verdict-badge icons (check-circle, warning-triangle, no-entry-circle,
confused-face) and the final approved tooltip copy from 명진's
`verdict-badge.js` / `verdict-badge.css` asset — ported into React
(`VerdictBadge` / `VerdictAccessibilityOption` in `FilterBar.tsx`) rather
than loaded as a separate `<script>`, so this stays a single
dependency-free component.

**One intentional deviation from the source asset**: `.verdict-badge--caution`
(Step-Way) uses a solid opaque background (`#fef7da`) in `FilterBar.css`
instead of the asset's translucent `rgba(250, 204, 21, 0.16)`. The
translucent version lets whatever sits behind the pill (e.g. the map)
bleed through and look inconsistent with the other three badges, which
are already opaque. `#fef7da` is that same rgba value pre-composited
over white, so it looks identical on a plain background but stays solid
everywhere else. Everything else is applied verbatim from the asset.

**Tooltip behavior**: hovering or focusing a badge opens its detail
tooltip *below* the pill. It's rendered through a React portal straight
into `document.body` (not as a DOM child of the badge) — this is a
structural fix, not a style choice: `.filter-bar__form` uses
`overflow-x: auto` / `overflow-y: hidden` to get its single-row
horizontal-scroll layout, and that `overflow-y: hidden` would otherwise
clip the tooltip the instant it needs more vertical space than the row
itself (the tooltip is much taller than the ~48px row). The portal
sidesteps that entirely, and the tooltip's position is recomputed from
the badge's real on-screen position on every hover/focus and while
scrolling, so it stays correctly anchored even if the row is scrolled
horizontally underneath it.

## Before shipping

- **APHont license**: the real font files are included in `fonts/` —
  confirm NASA's license covers your intended use before shipping it
  publicly.
