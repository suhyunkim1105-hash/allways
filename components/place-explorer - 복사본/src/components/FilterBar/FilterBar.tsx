import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./FilterBar.css";

/**
 * Tourism Filter Bar — React/TSX port of filter-search-bar.component.html
 *
 * Usage
 * -----
 *   <FilterBar onChange={(state, matches) => {
 *     // state: { region: string[], category: string[],
 *     //          accessibility: AccessibilityValue[], search: string }
 *     // matches: (item: MatchableItem) => boolean
 *   }} />
 *
 * An optional ref exposes the same imperative API the vanilla
 * component's `root.filterBar` object had:
 *   const ref = useRef<FilterBarHandle>(null);
 *   ref.current?.getState();
 *   ref.current?.buildMatcher();
 *   ref.current?.clearAll();
 *
 * Layout
 * ------
 * The primary row (`.filter-bar__form`, `flex-wrap: nowrap`) shows, in
 * order: an "All" pill + one emoji pill per Category (multi-select —
 * each toggles independently and grows an inline "×" once selected, so
 * it can be removed without hunting for a separate control), a "…"
 * button that opens a popover with the Region and Accessibility groups
 * (kept out of the main row to leave room for the search box), and the
 * search box itself. Each group's `<legend>` stays in the DOM for
 * screen readers, just visually hidden — the pill labels themselves
 * (e.g. "Gwanghwamun", "History & Heritage") are already
 * self-descriptive. If the primary row overflows a narrow container it
 * scrolls horizontally rather than wrapping to a second line.
 *
 * The chips row below the primary row still lists every active filter
 * across all four groups (region/category/accessibility/search) with
 * its own removable "×" — handy now that Region/Accessibility live
 * behind "…" and wouldn't otherwise be visible at a glance.
 *
 * There is intentionally no Travel Schedule / date filter — it was
 * part of an earlier version of this component and has been removed.
 *
 * Map overlay usage
 * -----------------
 * This bar is designed to float across the top of a Google Map (the
 * intended real-page placement), not just sit in normal page flow.
 * Every pill and the search input carry a soft drop shadow by default
 * so they stay legible over busy map imagery. To actually position it
 * as an overlay, give the map container `position: relative` and pass
 * the `filter-bar--overlay` modifier through the `className` prop:
 *
 *   <div style={{ position: "relative" }}>
 *     <GoogleMap ... />
 *     <FilterBar className="filter-bar--overlay" onChange={...} />
 *   </div>
 *
 * `filter-bar--overlay` absolutely positions the bar near the top of
 * its nearest positioned ancestor with a sensible z-index. Omit it
 * (the default) to let the bar sit inline in normal document flow.
 *
 * Filtering logic
 * ---------------
 * OR within a single filter group, AND across different groups —
 * i.e. checking both "Gwanghwamun" and "Yongsan" broadens results to
 * either region, while also checking "All-Way" narrows those results
 * down to accessible places in either region.
 *
 * `MatchableItem` expects the shape:
 *   { region: 'gwanghwamun', categories: ['history'], accessibility: 'accessible' }
 *
 * Free-text search
 * -----------------
 * The search box matches (case-insensitive substring) against an
 * item's `name` or any of its `tags`, ANDed together with every other
 * filter group. It gets its own removable chip, plus an inline "×"
 * clear button inside the input itself.
 *
 * Accessibility chips
 * -------------------
 * Uses the real verdict-badge component (owner: 명진, from the
 * approved verdict-badge.js / verdict-badge.css asset), inlined
 * verbatim in FilterBar.css — see the "VERDICT-BADGE COMPONENT" /
 * "FILTER-BAR ADDITIONS ON TOP OF VERDICT-BADGE" comments inside it.
 * Icons, tooltip title/desc copy, and pill labels are the final
 * approved content from that asset — not placeholders. One deviation
 * from the asset: `.verdict-badge--caution`'s background is a solid
 * opaque color here instead of the asset's translucent
 * `rgba(250, 204, 21, 0.16)`, since a translucent pill lets whatever
 * sits behind it (e.g. a map) show through — see the note next to
 * that rule in FilterBar.css.
 *
 * The hover/focus tooltip opens below each badge and is rendered via
 * a React portal into `document.body` (not inline next to the badge),
 * so it can't be clipped by `.filter-bar__form`'s `overflow-y: hidden`
 * (needed for the single-row horizontal-scroll layout above) — see
 * VerdictAccessibilityOption and the comment on `.verdict-badge-tip`
 * in FilterBar.css.
 *
 * Styles
 * ------
 * All CSS lives in the sibling `FilterBar.css` file, imported at the
 * top of this file (`import "./FilterBar.css"`) — keep both files
 * together when copying this component elsewhere. The `fonts/`
 * subfolder referenced by FilterBar.css's @font-face rules (APHont,
 * self-hosted — not on Google Fonts or any public CDN) needs to ship
 * alongside it too.
 *
 * Requires React 18+ (uses useId()).
 */

// ============================================================
// Types
// ============================================================

export type AccessibilityValue = "accessible" | "caution" | "difficult" | "unsurveyed";

export interface FilterBarState {
  region: string[];
  category: string[];
  accessibility: AccessibilityValue[];
  /** Free-text search query, already trimmed. "" when empty. */
  search: string;
}

export interface MatchableItem {
  region?: string;
  categories?: string[];
  accessibility?: string;
  /** Matched against the search box (case-insensitive substring). */
  name?: string;
  /** Also matched against the search box, in addition to `name`. */
  tags?: string[];
}

export type FilterMatcher = (item: MatchableItem) => boolean;

export interface FilterBarHandle {
  getState: () => FilterBarState;
  buildMatcher: () => FilterMatcher;
  clearAll: () => void;
}

export interface FilterBarProps {
  /** Called after every change with the new state and a ready-made matcher. */
  onChange?: (state: FilterBarState, matches: FilterMatcher) => void;
  /** Optional extra class name on the root <section>. */
  className?: string;
}

interface SimpleOption {
  value: string;
  label: string;
}

interface CategoryOption extends SimpleOption {
  /** Short single-word label shown on the compact pill (e.g. "History"
   *  instead of the full "History & Heritage"). The full `label` is
   *  still used for the chips row / anywhere space isn't tight. */
  shortLabel: string;
  /** Emoji shown on the pill, matching the map marker's category icon
   *  (see PlaceMap.tsx's CATEGORY_ICON) so the same category reads the
   *  same way in both places. */
  icon: string;
}

interface AccessibilityOption {
  value: AccessibilityValue;
  label: string;
  cssModifier: string; // verdict-badge--<cssModifier>
  tooltipTitle?: string;
  tooltipDesc?: string;
}

// ============================================================
// Static data
// ============================================================

const REGION_OPTIONS: SimpleOption[] = [
  { value: "gwanghwamun", label: "Gwanghwamun" },
  { value: "yongsan", label: "Yongsan" },
];

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "history", label: "History & Heritage", shortLabel: "History", icon: "🏛️" },
  { value: "arts", label: "Arts & Culture", shortLabel: "Arts", icon: "🎨" },
  { value: "nature", label: "Nature & Leisure", shortLabel: "Nature", icon: "🌿" },
  { value: "shopping", label: "Shopping & Entertainment", shortLabel: "Shopping", icon: "🛍️" },
];

// `label` is verdict-badge.js's `shortLabel` — what's shown ON the
// pill itself (All-Way / Step-Way / Re-Way / Not surveyed). The
// fuller state name + explanation (tooltipTitle/tooltipDesc) is the
// asset's `title`/`desc` — final approved copy, not a placeholder.
// Our internal `value` stays "unsurveyed" (used throughout
// matching/state) even though the asset's CSS class is the
// hyphenated "not-surveyed" — cssModifier bridges the two.
// "Not surveyed" intentionally has no tooltip, per the asset's own
// comment ("nothing to explain about data that doesn't exist yet").
const ACCESSIBILITY_OPTIONS: AccessibilityOption[] = [
  {
    value: "accessible",
    label: "All-Way",
    cssModifier: "accessible", // ●
    tooltipTitle: "Accessible",
    tooltipDesc: "Fully accessible independently for all people.",
  },
  {
    value: "caution",
    label: "Step-Way",
    cssModifier: "caution", // ▲
    tooltipTitle: "Caution needed",
    tooltipDesc: "Accessible, but assistance or caution may be required.",
  },
  {
    value: "difficult",
    label: "Re-Way",
    cssModifier: "difficult", // ■
    tooltipTitle: "Difficult",
    tooltipDesc: "Restricted access due to barriers.",
  },
  { value: "unsurveyed", label: "Not surveyed", cssModifier: "not-surveyed" }, // ○ — no tooltip
];

// Verbatim icon markup from verdict-badge.js (Owner: 명진) — the
// approved check-circle / warning-triangle / no-entry-circle /
// confused-face glyphs, not placeholders. `fill="currentColor"` on
// the base shape picks up the badge's text color automatically; the
// white accents are fixed white on purpose (contrast against the
// colored shape, not the page background). Keyed by our
// AccessibilityValue ("unsurveyed") rather than the asset's
// "not-surveyed" string key.
const VERDICT_ICONS: Record<AccessibilityValue, string> = {
  accessible:
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
    '<path d="M7.2 12.5 10.3 15.6 17 8.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>",
  caution:
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 2.7 22.3 21H1.7L12 2.7Z" fill="currentColor"/>' +
    '<rect x="11.05" y="8.6" width="1.9" height="6.2" rx="0.95" fill="#fff"/>' +
    '<rect x="11.05" y="16.2" width="1.9" height="1.9" rx="0.95" fill="#fff"/>' +
    "</svg>",
  difficult:
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
    '<rect x="6.5" y="11" width="11" height="2" rx="1" fill="#fff"/>' +
    "</svg>",
  unsurveyed:
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="10.5" cy="12.5" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="7.6" cy="10.8" r="0.9" fill="currentColor"/>' +
    '<circle cx="13.4" cy="10.8" r="0.9" fill="currentColor"/>' +
    '<path d="M7.6 15.8c1.1-1.3 2.9-1.3 4.2-.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="17.2" cy="5.6" r="4.1" fill="currentColor"/>' +
    '<path d="M15.9 4.75a1.25 1.25 0 1 1 1.85 1.15c-.35.25-.55.42-.55.8" fill="none" stroke="#fff" stroke-width="0.85" stroke-linecap="round"/>' +
    '<circle cx="17.2" cy="7.75" r="0.32" fill="#fff"/>' +
    "</svg>",
};

// ============================================================
// Pure helpers
// ============================================================

function toggleInSet<T>(set: Set<T>, value: T, checked: boolean): Set<T> {
  const next = new Set(set);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return next;
}

// ============================================================
// Small presentational subcomponents
// ============================================================

function VerdictBadge({
  opt,
  sizeClass = "verdict-badge--card",
  trailing,
}: {
  opt: AccessibilityOption;
  sizeClass?: string;
  /** Extra content rendered as the last child inside the pill itself —
   *  used by VerdictAccessibilityOption to show an inline "×" once the
   *  badge is checked, without changing this shared component's look
   *  everywhere else it's used (e.g. the chips row). */
  trailing?: React.ReactNode;
}) {
  return (
    <span className={`verdict-badge ${sizeClass} verdict-badge--${opt.cssModifier}`} data-verdict={opt.value}>
      <span
        className="verdict-badge__icon"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: VERDICT_ICONS[opt.value] }}
      />
      <span className="verdict-badge__label">{opt.label}</span>
      {trailing}
    </span>
  );
}

function VerdictTooltipContent({
  opt,
  entering,
  pos,
}: {
  opt: AccessibilityOption;
  entering: boolean;
  pos: { top: number; left: number };
}) {
  // Order matches verdict-badge.js's renderWithTooltip() exactly:
  // title, then desc, then the repeated badge at the bottom.
  // top/left are inline since they're computed per-hover from the
  // badge's real on-screen position (see VerdictAccessibilityOption) —
  // everything else about the tooltip's box lives in FilterBar.css.
  return (
    <span
      className={`verdict-badge-tip${entering ? " verdict-badge-tip--entering" : ""}`}
      role="tooltip"
      style={{ top: pos.top, left: pos.left }}
    >
      <p className="verdict-badge-tip__title">{opt.tooltipTitle}</p>
      <p className="verdict-badge-tip__desc">{opt.tooltipDesc}</p>
      <span className="verdict-badge-tip__badge-row">
        <VerdictBadge opt={opt} sizeClass="verdict-badge--card" />
      </span>
    </span>
  );
}

/**
 * The badge + its hover/focus tooltip, as one unit.
 *
 * The tooltip itself is rendered through `createPortal` into
 * `document.body` instead of sitting in the DOM next to the badge —
 * see the comment above `.verdict-badge-tip` in FilterBar.css for why
 * (short version: `.filter-bar__form`'s `overflow-y: hidden`, needed
 * for the single-row horizontal-scroll layout, would otherwise clip
 * it). Position is computed from the badge wrapper's own
 * `getBoundingClientRect()` on open, and kept in sync with scroll/
 * resize while the tooltip is showing.
 */
function VerdictAccessibilityOption({
  opt,
  inputId,
  checked,
  onToggle,
}: {
  opt: AccessibilityOption;
  inputId: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [entering, setEntering] = useState(false);
  const hasTooltip = Boolean(opt.tooltipTitle);

  const updatePos = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 10, left: rect.left + rect.width / 2 });
  }, []);

  const openTip = useCallback(() => {
    if (!hasTooltip) return;
    updatePos();
    setEntering(true);
  }, [hasTooltip, updatePos]);

  const closeTip = useCallback(() => setPos(null), []);

  // Once the tooltip mounts (pos becomes non-null), drop the
  // "--entering" class on the next frame so the opacity/transform
  // change is a transition rather than an instant jump.
  useEffect(() => {
    if (pos === null) return;
    const raf = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(raf);
  }, [pos]);

  // Keep the tooltip aligned with the badge while it's open — the
  // filter bar's own row can scroll horizontally underneath it.
  // `capture: true` also catches scroll events from that inner
  // scroll container, since plain window-level scroll listeners only
  // see window's own scroll by default.
  useEffect(() => {
    if (pos === null) return;
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [pos, updatePos]);

  return (
    <span
      className="verdict-badge-wrap"
      ref={wrapRef}
      onMouseEnter={openTip}
      onMouseLeave={closeTip}
      onFocus={openTip}
      onBlur={closeTip}
    >
      <label className="filter-bar__option-label filter-bar__option-label--verdict" htmlFor={inputId}>
        <input
          type="checkbox"
          className="filter-bar__checkbox filter-bar__checkbox--verdict"
          id={inputId}
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <VerdictBadge
          opt={opt}
          sizeClass="verdict-badge--card"
          trailing={
            checked ? (
              <span className="filter-bar__verdict-remove" aria-hidden="true">
                ×
              </span>
            ) : null
          }
        />
      </label>
      {hasTooltip &&
        pos !== null &&
        createPortal(<VerdictTooltipContent opt={opt} entering={entering} pos={pos} />, document.body)}
    </span>
  );
}

// ============================================================
// Main component
// ============================================================

function FilterBarImpl(
  { onChange, className }: FilterBarProps,
  ref: React.ForwardedRef<FilterBarHandle>
) {
  const uid = useId();

  const [region, setRegion] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [accessibility, setAccessibility] = useState<Set<AccessibilityValue>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------- "…" overflow popover (Region + Accessibility) ----------------
  // Rendered through a portal into document.body (not inline next to the
  // toggle button) for the same reason the verdict tooltip is — see the
  // comment on VerdictAccessibilityOption / .verdict-badge-tip in
  // FilterBar.css: .filter-bar__form needs overflow-y: hidden for its
  // single-row horizontal-scroll layout, which would otherwise clip any
  // popover taller than the row itself. Position is computed from the
  // toggle button's own getBoundingClientRect() on open and kept in sync
  // with scroll/resize while it's showing.
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePos, setMorePos] = useState<{ top: number; left: number } | null>(null);
  const moreToggleRef = useRef<HTMLButtonElement>(null);
  const morePopoverRef = useRef<HTMLDivElement>(null);

  const updateMorePos = useCallback(() => {
    const el = moreToggleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMorePos({ top: rect.bottom + 8, left: rect.left });
  }, []);

  const toggleMore = useCallback(() => {
    setMoreOpen((open) => {
      if (!open) updateMorePos();
      return !open;
    });
  }, [updateMorePos]);

  useEffect(() => {
    if (!moreOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        moreToggleRef.current &&
        !moreToggleRef.current.contains(target) &&
        morePopoverRef.current &&
        !morePopoverRef.current.contains(target)
      ) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updateMorePos, true);
    window.addEventListener("resize", updateMorePos);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateMorePos, true);
      window.removeEventListener("resize", updateMorePos);
    };
  }, [moreOpen, updateMorePos]);

  // ---------------- checkbox toggle handlers ----------------
  const handleRegionChange = useCallback((value: string, checked: boolean) => {
    setRegion((prev) => toggleInSet(prev, value, checked));
  }, []);

  const handleCategoryChange = useCallback((value: string, checked: boolean) => {
    setCategory((prev) => toggleInSet(prev, value, checked));
  }, []);

  const handleAccessibilityChange = useCallback((value: AccessibilityValue, checked: boolean) => {
    setAccessibility((prev) => toggleInSet(prev, value, checked));
  }, []);

  // ---------------- free-text search ----------------
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  // ---------------- clear all ----------------
  const clearAll = useCallback(() => {
    setRegion(new Set());
    setCategory(new Set());
    setAccessibility(new Set());
    setSearchQuery("");
  }, []);

  // ---------------- chip removal ----------------
  const removeRegionChip = useCallback((value: string) => handleRegionChange(value, false), [handleRegionChange]);
  const removeCategoryChip = useCallback((value: string) => handleCategoryChange(value, false), [handleCategoryChange]);
  const removeAccessibilityChip = useCallback(
    (value: AccessibilityValue) => handleAccessibilityChange(value, false),
    [handleAccessibilityChange]
  );

  // ---------------- OR/AND matching ----------------
  const buildMatcher = useCallback((): FilterMatcher => {
    return (item: MatchableItem) => {
      const regionOk = region.size === 0 || (item.region !== undefined && region.has(item.region));
      const categoryOk =
        category.size === 0 || (item.categories ?? []).some((c) => category.has(c));
      const accessibilityOk =
        accessibility.size === 0 ||
        (item.accessibility !== undefined && accessibility.has(item.accessibility as AccessibilityValue));

      const trimmedQuery = searchQuery.trim().toLowerCase();
      const searchOk =
        trimmedQuery === "" ||
        (item.name !== undefined && item.name.toLowerCase().includes(trimmedQuery)) ||
        (item.tags ?? []).some((tag) => tag.toLowerCase().includes(trimmedQuery));

      return regionOk && categoryOk && accessibilityOk && searchOk;
    };
  }, [region, category, accessibility, searchQuery]);

  const currentState = useMemo<FilterBarState>(
    () => ({
      region: Array.from(region),
      category: Array.from(category),
      accessibility: Array.from(accessibility),
      search: searchQuery.trim(),
    }),
    [region, category, accessibility, searchQuery]
  );

  // Fire onChange after every state change — mirrors the vanilla
  // component's `filterbar:change` event, minus the DOM event.
  useEffect(() => {
    onChange?.(currentState, buildMatcher());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  useImperativeHandle(
    ref,
    () => ({
      getState: () => currentState,
      buildMatcher,
      clearAll,
    }),
    [currentState, buildMatcher, clearAll]
  );

  const chips = useMemo(() => {
    const list: Array<{ key: string; group: string; node: React.ReactNode; onRemove: () => void }> = [];

    region.forEach((v) => {
      const opt = REGION_OPTIONS.find((o) => o.value === v)!;
      list.push({
        key: `region-${v}`,
        group: "region",
        node: <span className="filter-bar__chip-label">{opt.label}</span>,
        onRemove: () => removeRegionChip(v),
      });
    });
    category.forEach((v) => {
      const opt = CATEGORY_OPTIONS.find((o) => o.value === v)!;
      list.push({
        key: `category-${v}`,
        group: "category",
        node: <span className="filter-bar__chip-label">{opt.label}</span>,
        onRemove: () => removeCategoryChip(v),
      });
    });
    accessibility.forEach((v) => {
      const opt = ACCESSIBILITY_OPTIONS.find((o) => o.value === v)!;
      list.push({
        key: `accessibility-${v}`,
        group: "accessibility",
        node: <VerdictBadge opt={opt} sizeClass="verdict-badge--list" />,
        onRemove: () => removeAccessibilityChip(v),
      });
    });
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery !== "") {
      list.push({
        key: "search",
        group: "search",
        node: <span className="filter-bar__chip-label">&#8220;{trimmedQuery}&#8221;</span>,
        onRemove: clearSearch,
      });
    }

    return list;
  }, [
    region,
    category,
    accessibility,
    searchQuery,
    removeRegionChip,
    removeCategoryChip,
    removeAccessibilityChip,
    clearSearch,
  ]);

  const moreActiveCount = region.size + accessibility.size;

  return (
    <section className={`filter-bar${className ? ` ${className}` : ""}`} data-component="filter-bar" aria-label="Destination filters">
      {/*
        Primary row: an "All" pill + one pill per category (multi-select —
        each toggles independently, showing an inline "×" once selected),
        then the "…" overflow button (Region + Accessibility live inside
        its popover instead of the main row), then the search box.
      */}
      <form className="filter-bar__form" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="filter-bar__group filter-bar__group--category">
          <legend className="filter-bar__legend">Category</legend>
          <div className="filter-bar__cat-pills">
            <button
              type="button"
              className={`filter-bar__cat-pill filter-bar__cat-pill--all${
                category.size === 0 ? " filter-bar__cat-pill--active" : ""
              }`}
              aria-pressed={category.size === 0}
              onClick={() => setCategory(new Set())}
            >
              <span className="filter-bar__cat-pill-icon" aria-hidden="true">✨</span>
              All
            </button>

            {CATEGORY_OPTIONS.map((opt) => {
              const selected = category.has(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-bar__cat-pill${selected ? " filter-bar__cat-pill--active" : ""}`}
                  aria-pressed={selected}
                  data-value={opt.value}
                  onClick={() => handleCategoryChange(opt.value, !selected)}
                >
                  <span className="filter-bar__cat-pill-icon" aria-hidden="true">{opt.icon}</span>
                  {opt.shortLabel}
                  {selected && (
                    <span
                      className="filter-bar__cat-pill-remove"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remove ${opt.shortLabel} filter`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(opt.value, false);
                      }}
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="filter-bar__more-wrap">
          <button
            type="button"
            ref={moreToggleRef}
            className={`filter-bar__more-toggle${moreOpen ? " filter-bar__more-toggle--open" : ""}`}
            aria-haspopup="true"
            aria-expanded={moreOpen}
            aria-label="More filters (Region, Accessibility)"
            onClick={toggleMore}
          >
            •••
            {moreActiveCount > 0 && <span className="filter-bar__more-badge">{moreActiveCount}</span>}
          </button>

          {moreOpen &&
            morePos !== null &&
            createPortal(
              <div
                className="filter-bar__more-popover"
                ref={morePopoverRef}
                role="dialog"
                aria-label="More filters"
                style={{ top: morePos.top, left: morePos.left }}
              >
                <fieldset className="filter-bar__group filter-bar__group--stacked">
                  <legend className="filter-bar__popover-legend">Region</legend>
                  <div className="filter-bar__options filter-bar__options--wrap">
                    {REGION_OPTIONS.map((opt) => {
                      const inputId = `${uid}-region-${opt.value}`;
                      return (
                        <div className="filter-bar__option" key={opt.value} data-value={opt.value}>
                          <input
                            type="checkbox"
                            className="filter-bar__checkbox"
                            id={inputId}
                            checked={region.has(opt.value)}
                            onChange={(e) => handleRegionChange(opt.value, e.target.checked)}
                          />
                          <label className="filter-bar__option-label" htmlFor={inputId}>
                            {opt.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="filter-bar__group filter-bar__group--stacked">
                  <legend className="filter-bar__popover-legend">Accessibility</legend>
                  <div className="filter-bar__options filter-bar__options--wrap">
                    {ACCESSIBILITY_OPTIONS.map((opt) => {
                      const inputId = `${uid}-accessibility-${opt.value}`;
                      return (
                        <div className="filter-bar__option filter-bar__option--verdict" key={opt.value} data-value={opt.value}>
                          <VerdictAccessibilityOption
                            opt={opt}
                            inputId={inputId}
                            checked={accessibility.has(opt.value)}
                            onToggle={(checked) => handleAccessibilityChange(opt.value, checked)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              </div>,
              document.body,
            )}
        </div>

        <div className="filter-bar__search">
          <span className="filter-bar__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="search"
            className="filter-bar__search-input"
            placeholder="Search destinations…"
            aria-label="Search destinations"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery !== "" && (
            <button
              type="button"
              className="filter-bar__search-clear"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              ×
            </button>
          )}
        </div>
      </form>

      <div className="filter-bar__chips" aria-live="polite">
        {chips.map((chip) => (
          <span className="filter-bar__chip" key={chip.key} data-group={chip.group}>
            {chip.node}
            <button
              type="button"
              className="filter-bar__chip-remove"
              aria-label="Remove filter"
              onClick={chip.onRemove}
            >
              ×
            </button>
          </span>
        ))}

        {chips.length > 0 && (
          <button type="button" className="filter-bar__clear-all" onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>
    </section>
  );
}

const FilterBar = forwardRef<FilterBarHandle, FilterBarProps>(FilterBarImpl);
FilterBar.displayName = "FilterBar";

export default FilterBar;
