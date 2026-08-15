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

/**
 * Tourism Filter Search Bar — React/TSX port of filter-search-bar.component.html
 *
 * Usage
 * -----
 *   <FilterSearchBar onChange={(state, matches) => {
 *     // state: { region: string[], category: AccessibilityValue-agnostic string[],
 *     //          accessibility: AccessibilityValue[],
 *     //          date: null | { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', mode: 'single' | 'range' },
 *     //          search: string }
 *     // matches: (item: MatchableItem) => boolean
 *   }} />
 *
 * An optional ref exposes the same imperative API the vanilla
 * component's `root.filterBar` object had:
 *   const ref = useRef<FilterSearchBarHandle>(null);
 *   ref.current?.getState();
 *   ref.current?.buildMatcher();
 *   ref.current?.clearAll();
 *
 * Filtering logic
 * ---------------
 * OR within a single filter group, AND across different groups —
 * i.e. checking both "Gwanghwamun" and "Yongsan" broadens results to
 * either region, while also checking "All-Way" narrows those results
 * down to accessible places in either region.
 *
 * `MatchableItem` expects the shape:
 *   { region: 'gwanghwamun', categories: ['history'], accessibility: 'accessible', closedDays: [1] }
 * (closedDays is optional — an array of 0–6 weekday numbers the item
 * is unavailable, checked against the Travel Schedule filter.)
 *
 * Travel Schedule (single date / date range)
 * -------------------------------------------
 * The calendar cycles through a 3-click pattern:
 *   1st click  -> selects a single day                 ("Aug 12, 2026")
 *   2nd click  -> extends that day into a range with    ("Aug 12, 2026 ~ Aug 15, 2026")
 *                 whichever date was clicked (order-independent)
 *   3rd click  -> discards the previous selection and starts
 *                 a new single-day selection at the clicked date
 * A single date matches an item if it's available (not in
 * `closedDays`) on that date. A range matches if the item is
 * available on *any* date within the range.
 *
 * Free-text search
 * -----------------
 * A search box sits below the filter groups, above the chips row.
 * It matches (case-insensitive substring) against an item's `name`
 * or any of its `tags`, ANDed together with every other filter group
 * (same as Region/Category/Accessibility/Travel Schedule). It gets
 * its own removable chip, plus an inline "×" clear button inside the
 * input itself.
 *
 * Accessibility chips
 * -------------------
 * Uses the real verdict-badge component (owner: 명진), inlined
 * verbatim in STYLES below — see the "VERDICT-BADGE COMPONENT" /
 * "FILTER-BAR ADDITIONS ON TOP OF VERDICT-BADGE" comments inside it.
 * tooltipTitle/tooltipDesc copy is still placeholder text pending
 * the real approved microcopy. Icon SVGs are placeholders matching
 * this project's ●▲■○ icon language — swap for the real assets.
 *
 * APHont is not on Google Fonts or any public CDN — self-host the
 * actual font files at the paths referenced in the @font-face rules
 * below (NASA distributes APHont for free; confirm the license
 * covers your intended use before shipping it).
 *
 * Requires React 18+ (uses useId()).
 */

// ============================================================
// Types
// ============================================================

export type AccessibilityValue = "accessible" | "caution" | "difficult" | "unsurveyed";

export interface FilterDateSelection {
  start: string; // ISO date, e.g. "2026-08-12"
  end: string; // ISO date; equals `start` for a single-day selection
  mode: "single" | "range";
}

export interface FilterBarState {
  region: string[];
  category: string[];
  accessibility: AccessibilityValue[];
  date: FilterDateSelection | null;
  /** Free-text search query, already trimmed. "" when empty. */
  search: string;
}

export interface MatchableItem {
  region?: string;
  categories?: string[];
  accessibility?: string;
  closedDays?: number[]; // 0 (Sun) – 6 (Sat)
  /** Matched against the search box (case-insensitive substring). */
  name?: string;
  /** Also matched against the search box, in addition to `name`. */
  tags?: string[];
}

export type FilterMatcher = (item: MatchableItem) => boolean;

export interface FilterSearchBarHandle {
  getState: () => FilterBarState;
  buildMatcher: () => FilterMatcher;
  clearAll: () => void;
}

export interface FilterSearchBarProps {
  /** Called after every change with the new state and a ready-made matcher. */
  onChange?: (state: FilterBarState, matches: FilterMatcher) => void;
  /** Optional extra class name on the root <section>. */
  className?: string;
}

interface SimpleOption {
  value: string;
  label: string;
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

const CATEGORY_OPTIONS: SimpleOption[] = [
  { value: "history", label: "History & Heritage" },
  { value: "arts", label: "Arts & Culture" },
  { value: "nature", label: "Nature & Leisure" },
  { value: "shopping", label: "Shopping & Entertainment" },
];

// `label` uses the exact product terminology (All-Way / Step-Way /
// Re-Way) from the reference design, not a generic description —
// the fuller phrase lives in tooltipTitle instead. Our internal
// `value` stays "unsurveyed" (used throughout matching/state) even
// though verdict-badge.css's class is the hyphenated "not-surveyed"
// — cssModifier bridges the two. "Not surveyed" intentionally has
// no tooltip, per verdict-badge.css's own comment ("nothing to
// explain about data that doesn't exist yet").
const ACCESSIBILITY_OPTIONS: AccessibilityOption[] = [
  {
    value: "accessible",
    label: "All-Way",
    cssModifier: "accessible", // ●
    tooltipTitle: "All-Way Accessible",
    tooltipDesc:
      "The route from the entrance to key facilities is step-free and confirmed accessible for wheelchairs and other mobility devices.",
  },
  {
    value: "caution",
    label: "Step-Way",
    cssModifier: "caution", // ▲
    tooltipTitle: "Step-Way (Caution Needed)",
    tooltipDesc:
      "Some sections include steps, slopes, or uneven surfaces. Assistance or an alternate path may be needed along the way.",
  },
  {
    value: "difficult",
    label: "Re-Way",
    cssModifier: "difficult", // ■
    tooltipTitle: "Re-Way (Difficult Access)",
    tooltipDesc:
      "The main route isn't accessible. Check for an alternate entrance or route before visiting, or contact the venue directly.",
  },
  { value: "unsurveyed", label: "Not surveyed", cssModifier: "not-surveyed" }, // ○ — no tooltip
];

// Placeholder icons matching this project's established ●▲■○ icon
// language — swap for 명진's real icon SVGs when available.
const VERDICT_ICONS: Record<AccessibilityValue, string> = {
  accessible:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle></svg>',
  caution:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5L23 21H1L12 2.5Z"></path></svg>',
  difficult:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"></rect></svg>',
  unsurveyed:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle></svg>',
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ============================================================
// Pure helpers (date formatting / availability)
// ============================================================

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIsoDate(y: number, m: number, d: number): string {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

// "Aug 12, 2026"
function formatSingleDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// "Aug 12, 2026" (single) or "Aug 12, 2026 ~ Aug 15, 2026" (range)
function formatDateSelection(startIso: string, endIso: string): string {
  if (!startIso) return "";
  if (startIso === endIso) return formatSingleDate(startIso);
  return `${formatSingleDate(startIso)} ~ ${formatSingleDate(endIso)}`;
}

function isDateAvailable(item: MatchableItem, iso: string): boolean {
  if (!item.closedDays) return true;
  const weekday = new Date(`${iso}T00:00:00`).getDay();
  return item.closedDays.indexOf(weekday) === -1;
}

// True if `item` is available on at least one day within [startIso, endIso].
function isAvailableInRange(item: MatchableItem, startIso: string, endIso: string): boolean {
  if (!item.closedDays) return true;
  const cursor = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (item.closedDays.indexOf(weekday) === -1) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

function toggleInSet<T>(set: Set<T>, value: T, checked: boolean): Set<T> {
  const next = new Set(set);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return next;
}

interface CalendarCell {
  iso: string;
  day: number;
  isOutside: boolean;
  isToday: boolean;
}

function buildCalendarCells(year: number, month: number, todayIso: string): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - firstWeekday + 1;
    let cellYear = year;
    let cellMonth = month;
    let cellDay = dayNumber;
    let isOutside = false;

    if (dayNumber < 1) {
      cellMonth = month - 1;
      cellYear = cellMonth < 0 ? year - 1 : year;
      cellMonth = (cellMonth + 12) % 12;
      cellDay = daysInPrevMonth + dayNumber;
      isOutside = true;
    } else if (dayNumber > daysInMonth) {
      cellDay = dayNumber - daysInMonth;
      cellMonth = month + 1;
      cellYear = cellMonth > 11 ? year + 1 : year;
      cellMonth = cellMonth % 12;
      isOutside = true;
    }

    const iso = toIsoDate(cellYear, cellMonth, cellDay);
    cells.push({ iso, day: cellDay, isOutside, isToday: iso === todayIso });
  }
  return cells;
}

// ============================================================
// Small presentational subcomponents
// ============================================================

function VerdictBadge({ opt, sizeClass = "verdict-badge--card" }: { opt: AccessibilityOption; sizeClass?: string }) {
  return (
    <span className={`verdict-badge ${sizeClass} verdict-badge--${opt.cssModifier}`} data-verdict={opt.value}>
      <span
        className="verdict-badge__icon"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: VERDICT_ICONS[opt.value] }}
      />
      <span className="verdict-badge__label">{opt.label}</span>
    </span>
  );
}

function VerdictTooltip({ opt }: { opt: AccessibilityOption }) {
  if (!opt.tooltipTitle) return null;
  return (
    <span className="verdict-badge-tip" role="tooltip">
      <span className="verdict-badge-tip__badge-row">
        <VerdictBadge opt={opt} sizeClass="verdict-badge--card" />
      </span>
      <p className="verdict-badge-tip__title">{opt.tooltipTitle}</p>
      <p className="verdict-badge-tip__desc">{opt.tooltipDesc}</p>
    </span>
  );
}

// ============================================================
// Main component
// ============================================================

function FilterSearchBarImpl(
  { onChange, className }: FilterSearchBarProps,
  ref: React.ForwardedRef<FilterSearchBarHandle>
) {
  const uid = useId();

  const [region, setRegion] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [accessibility, setAccessibility] = useState<Set<AccessibilityValue>>(new Set());

  // Travel Schedule: "" = none selected. dateRangeComplete tracks
  // where we are in the 3-click cycle — see the top-of-file doc
  // comment for the exact state machine.
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [dateRangeComplete, setDateRangeComplete] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const datePopupRef = useRef<HTMLDivElement>(null);

  const todayIso = useMemo(() => {
    const now = new Date();
    return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

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

  // ---------------- Travel Schedule ----------------
  const openDatePopup = useCallback(() => {
    setCalendarView(() => {
      const base = dateStart ? new Date(`${dateStart}T00:00:00`) : new Date();
      return { year: base.getFullYear(), month: base.getMonth() };
    });
    setIsDatePopupOpen(true);
  }, [dateStart]);

  const closeDatePopup = useCallback(() => setIsDatePopupOpen(false), []);

  // Implements the 3-click cycle described in the top-of-file doc
  // comment. The popup intentionally stays open after each click so
  // the user can immediately make the next click in the cycle.
  const handleDayClick = useCallback(
    (iso: string) => {
      if (!dateStart || dateRangeComplete) {
        setDateStart(iso);
        setDateEnd(iso);
        setDateRangeComplete(false);
      } else if (iso < dateStart) {
        setDateEnd(dateStart);
        setDateStart(iso);
        setDateRangeComplete(true);
      } else {
        setDateEnd(iso);
        setDateRangeComplete(true);
      }
    },
    [dateStart, dateRangeComplete]
  );

  const handleClearDate = useCallback(() => {
    setDateStart("");
    setDateEnd("");
    setDateRangeComplete(false);
    closeDatePopup();
  }, [closeDatePopup]);

  const goToPrevMonth = useCallback(() => {
    setCalendarView(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarView(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }));
  }, []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!isDatePopupOpen) return;

    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        datePopupRef.current &&
        !datePopupRef.current.contains(target) &&
        target !== dateTriggerRef.current &&
        !dateTriggerRef.current?.contains(target)
      ) {
        closeDatePopup();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDatePopup();
        dateTriggerRef.current?.focus();
      }
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePopupOpen, closeDatePopup]);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarView.year, calendarView.month, todayIso),
    [calendarView, todayIso]
  );

  const dateTriggerText = dateStart ? formatDateSelection(dateStart, dateEnd) : "Select a date";

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
    setDateStart("");
    setDateEnd("");
    setDateRangeComplete(false);
    setSearchQuery("");
    closeDatePopup();
  }, [closeDatePopup]);

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

      let dateOk = true;
      if (dateStart) {
        dateOk = dateStart === dateEnd ? isDateAvailable(item, dateStart) : isAvailableInRange(item, dateStart, dateEnd);
      }

      const trimmedQuery = searchQuery.trim().toLowerCase();
      const searchOk =
        trimmedQuery === "" ||
        (item.name !== undefined && item.name.toLowerCase().includes(trimmedQuery)) ||
        (item.tags ?? []).some((tag) => tag.toLowerCase().includes(trimmedQuery));

      return regionOk && categoryOk && accessibilityOk && dateOk && searchOk;
    };
  }, [region, category, accessibility, dateStart, dateEnd, searchQuery]);

  const currentState = useMemo<FilterBarState>(
    () => ({
      region: Array.from(region),
      category: Array.from(category),
      accessibility: Array.from(accessibility),
      date: dateStart ? { start: dateStart, end: dateEnd, mode: dateStart === dateEnd ? "single" : "range" } : null,
      search: searchQuery.trim(),
    }),
    [region, category, accessibility, dateStart, dateEnd, searchQuery]
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
    if (dateStart) {
      list.push({
        key: "date",
        group: "date",
        node: <span className="filter-bar__chip-label">{formatDateSelection(dateStart, dateEnd)}</span>,
        onRemove: handleClearDate,
      });
    }
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
    dateStart,
    dateEnd,
    searchQuery,
    removeRegionChip,
    removeCategoryChip,
    removeAccessibilityChip,
    handleClearDate,
    clearSearch,
  ]);

  return (
    <>
      <style>{STYLES}</style>

      <section className={`filter-bar${className ? ` ${className}` : ""}`} data-component="filter-bar" aria-label="Destination filters">
        <form className="filter-bar__form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="filter-bar__group">
            <legend className="filter-bar__legend">Region</legend>
            <div className="filter-bar__options">
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

          <fieldset className="filter-bar__group">
            <legend className="filter-bar__legend">Category</legend>
            <div className="filter-bar__options">
              {CATEGORY_OPTIONS.map((opt) => {
                const inputId = `${uid}-category-${opt.value}`;
                return (
                  <div className="filter-bar__option" key={opt.value} data-value={opt.value}>
                    <input
                      type="checkbox"
                      className="filter-bar__checkbox"
                      id={inputId}
                      checked={category.has(opt.value)}
                      onChange={(e) => handleCategoryChange(opt.value, e.target.checked)}
                    />
                    <label className="filter-bar__option-label" htmlFor={inputId}>
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="filter-bar__group">
            <legend className="filter-bar__legend">Accessibility</legend>
            <div className="filter-bar__options">
              {ACCESSIBILITY_OPTIONS.map((opt) => {
                const inputId = `${uid}-accessibility-${opt.value}`;
                return (
                  <div className="filter-bar__option filter-bar__option--verdict" key={opt.value} data-value={opt.value}>
                    <span className="verdict-badge-wrap">
                      <label className="filter-bar__option-label filter-bar__option-label--verdict" htmlFor={inputId}>
                        <input
                          type="checkbox"
                          className="filter-bar__checkbox filter-bar__checkbox--verdict"
                          id={inputId}
                          checked={accessibility.has(opt.value)}
                          onChange={(e) => handleAccessibilityChange(opt.value, e.target.checked)}
                        />
                        <VerdictBadge opt={opt} sizeClass="verdict-badge--card" />
                      </label>
                      <VerdictTooltip opt={opt} />
                    </span>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="filter-bar__group filter-bar__group--date">
            <span className="filter-bar__legend">Travel Schedule</span>

            <button
              type="button"
              className="filter-bar__date-trigger"
              ref={dateTriggerRef}
              aria-haspopup="dialog"
              aria-expanded={isDatePopupOpen}
              onClick={(e) => {
                e.stopPropagation();
                isDatePopupOpen ? closeDatePopup() : openDatePopup();
              }}
            >
              <span>{dateTriggerText}</span>
              <span aria-hidden="true" data-date-trigger-icon>
                &#9662;
              </span>
            </button>

            {isDatePopupOpen && (
              <div
                className="filter-bar__date-popup"
                ref={datePopupRef}
                role="dialog"
                aria-modal="false"
                aria-label="Choose a travel date"
              >
                <div className="filter-bar__date-header">
                  <button type="button" data-date-prev aria-label="Previous month" onClick={goToPrevMonth}>
                    &#8249;
                  </button>
                  <span aria-live="polite">
                    {MONTH_NAMES[calendarView.month]} {calendarView.year}
                  </span>
                  <button type="button" data-date-next aria-label="Next month" onClick={goToNextMonth}>
                    &#8250;
                  </button>
                </div>

                <div className="filter-bar__date-weekdays" aria-hidden="true">
                  {WEEKDAY_HEADERS.map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </div>

                <div className="filter-bar__date-grid">
                  {calendarCells.map((cell) => {
                    if (cell.isOutside) {
                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          className="filter-bar__date-day"
                          data-outside="true"
                          disabled
                          tabIndex={-1}
                        >
                          {cell.day}
                        </button>
                      );
                    }

                    const isSingleSelected = dateStart && dateStart === dateEnd && cell.iso === dateStart;
                    const isRangeStart = dateStart && dateStart !== dateEnd && cell.iso === dateStart;
                    const isRangeEnd = dateStart && dateStart !== dateEnd && cell.iso === dateEnd;
                    const isInRange = dateStart && dateStart !== dateEnd && cell.iso > dateStart && cell.iso < dateEnd;

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        className="filter-bar__date-day"
                        data-today={cell.isToday ? "true" : undefined}
                        data-selected={isSingleSelected ? "true" : undefined}
                        data-range-start={isRangeStart ? "true" : undefined}
                        data-range-end={isRangeEnd ? "true" : undefined}
                        data-in-range={isInRange ? "true" : undefined}
                        aria-label={`${MONTH_NAMES[new Date(`${cell.iso}T00:00:00`).getMonth()]} ${cell.day}, ${new Date(`${cell.iso}T00:00:00`).getFullYear()}`}
                        onClick={() => handleDayClick(cell.iso)}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="filter-bar__date-footer">
                  <button type="button" className="filter-bar__date-clear" onClick={handleClearDate}>
                    Clear date
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

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
            placeholder="Search destinations or tags…"
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

        <div className="filter-bar__chips" aria-live="polite">
          {chips.length === 0 && <span>No filters applied</span>}

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
    </>
  );
}

const FilterSearchBar = forwardRef<FilterSearchBarHandle, FilterSearchBarProps>(FilterSearchBarImpl);
FilterSearchBar.displayName = "FilterSearchBar";

export default FilterSearchBar;

// ============================================================
// Styles (verbatim CSS, injected via a plain <style> tag so this
// stays a single-file component with no CSS Modules/Tailwind setup
// required). See the in-file section comments below for provenance.
// ============================================================

const STYLES = `
/* APHont is not distributed via Google Fonts or any public CDN — it
   must be self-hosted. Point src at wherever the licensed font files
   are placed (NASA distributes APHont for free, but confirm the
   license covers your intended use before shipping it). Regular and
   Bold weights shown; add Italic/Bold-Italic the same way if needed. */
@font-face {
  font-family: "APHont";
  src: url("fonts/aphont-regular.woff2") format("woff2"),
       url("fonts/aphont-regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "APHont";
  src: url("fonts/aphont-bold.woff2") format("woff2"),
       url("fonts/aphont-bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

.filter-bar * { box-sizing: border-box; }

.filter-bar {
  font-family: "APHont", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.filter-bar__form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.filter-bar__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 11rem;
  flex: 1 1 12rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.filter-bar__legend {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  margin: 0 0 0.125rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #111827;
}

.filter-bar__options {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem;
}

.filter-bar__option {
  position: relative;
  display: inline-flex;
}

/* The checkbox itself is invisible (opacity: 0, not display: none)
   but stays on top of the pill and fully interactive, so the chip
   remains a real, keyboard-reachable checkbox for assistive tech. */
.filter-bar__checkbox {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

/* ---------------- CHIP / PILL BUTTON STYLES ---------------- */
.filter-bar__option-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  background: #F3F4F6;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background-color 120ms ease, color 120ms ease;
}

.filter-bar__checkbox:hover + .filter-bar__option-label {
  background: #E5E7EB;
}

.filter-bar__checkbox:checked + .filter-bar__option-label {
  background: #2563EB;
  color: #FFFFFF;
  font-weight: 600;
}
.filter-bar__checkbox:checked:hover + .filter-bar__option-label {
  background: #1D4ED8;
}

.filter-bar__checkbox:focus-visible + .filter-bar__option-label {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* ---------- Travel Schedule (custom calendar date picker) ---------- */
.filter-bar__group--date {
  position: relative;
}

.filter-bar__date-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  color: #111827;
  font: inherit;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease;
}

.filter-bar__date-trigger:hover {
  border-color: #9CA3AF;
}

.filter-bar__date-trigger[aria-expanded="true"] {
  border-color: #2563EB;
  box-shadow: 0 0 0 1px #2563EB;
}

.filter-bar__date-trigger:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 1px;
}

[data-date-trigger-icon] {
  color: #6B7280;
  font-size: 0.7em;
}

.filter-bar__date-popup {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 10;
  width: 17rem;
  padding: 0.75rem;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
}

.filter-bar__date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #111827;
}

[data-date-prev],
[data-date-next] {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #374151;
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}
[data-date-prev]:hover,
[data-date-next]:hover {
  background: #F3F4F6;
}

.filter-bar__date-weekdays,
.filter-bar__date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.filter-bar__date-weekdays span {
  text-align: center;
  font-size: 0.75em;
  color: #6B7280;
}

.filter-bar__date-day {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #111827;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.filter-bar__date-day:hover:not(:disabled) {
  background: #F3F4F6;
}

.filter-bar__date-day[data-outside="true"] {
  color: #D1D5DB;
  cursor: default;
}

.filter-bar__date-day[data-today="true"] {
  font-weight: 700;
  color: #2563EB;
}

.filter-bar__date-day[data-selected="true"],
.filter-bar__date-day[data-range-start="true"],
.filter-bar__date-day[data-range-end="true"] {
  background: #2563EB;
  color: #FFFFFF;
  font-weight: 600;
}

.filter-bar__date-day[data-in-range="true"] {
  background: #DBEAFE;
  color: #1D4ED8;
  border-radius: 0;
}

.filter-bar__date-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #E5E7EB;
}

.filter-bar__date-clear {
  border: none;
  background: none;
  color: #6B7280;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.filter-bar__date-clear:hover {
  color: #DC2626;
}

/* ---------- Free-text search ---------- */
.filter-bar__search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 24rem;
  margin-top: 1.25rem;
}

.filter-bar__search-icon {
  position: absolute;
  left: 0.75rem;
  display: flex;
  align-items: center;
  color: #9CA3AF;
  pointer-events: none;
}
.filter-bar__search-icon svg {
  width: 1rem;
  height: 1rem;
}

.filter-bar__search-input {
  width: 100%;
  padding: 0.5rem 2.25rem 0.5rem 2.25rem;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  color: #111827;
  font: inherit;
  font-size: 0.875rem;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.filter-bar__search-input::placeholder {
  color: #9CA3AF;
}

/* Suppress the native WebKit "clear" (x) control on type="search"
   inputs — we render our own clear button instead so it looks the
   same across browsers. */
.filter-bar__search-input::-webkit-search-cancel-button,
.filter-bar__search-input::-webkit-search-decoration {
  display: none;
}

.filter-bar__search-input:hover {
  border-color: #9CA3AF;
}

.filter-bar__search-input:focus-visible,
.filter-bar__search-input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 1px #2563EB;
}

.filter-bar__search-clear {
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #6B7280;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}
.filter-bar__search-clear:hover {
  background: #F3F4F6;
  color: #111827;
}

/* ---------- Selected filter chips ---------- */
.filter-bar__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 1.75rem;
}

.filter-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.5rem 0.3rem 0.75rem;
  border-radius: 9999px;
  background: #EFF6FF;
  color: #1D4ED8;
  font-size: 0.8rem;
  font-weight: 500;
}

.filter-bar__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1;
  cursor: pointer;
  border: none;
}

.filter-bar__chip-remove:hover {
  background: rgba(29, 78, 216, 0.15);
}

.filter-bar__chip[data-group="accessibility"] {
  background: none;
  padding: 0 0.3rem 0 0;
  color: inherit;
}
.filter-bar__chip[data-group="accessibility"] .filter-bar__chip-remove:hover {
  background: rgba(17, 24, 39, 0.08);
}

.filter-bar__clear-all {
  margin-left: auto;
  background: none;
  border: none;
  color: #6B7280;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.filter-bar__clear-all:hover {
  color: #DC2626;
}

/* ============================================================
   VERDICT-BADGE COMPONENT
   Inlined verbatim from verdict-badge.css (Owner: 명진). Do not
   hand-edit this block when the source file changes — repaste it
   instead. Our own additions live in the block that follows.
   ============================================================ */

.verdict-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px transparent;
  transition: box-shadow 0.1s ease;
}

.verdict-badge:hover,
.verdict-badge:focus-visible {
  box-shadow: inset 0 0 0 1px currentColor;
}

.verdict-badge__icon {
  display: inline-flex;
  flex-shrink: 0;
}
.verdict-badge__icon svg {
  display: block;
}

.verdict-badge__label {
  line-height: 1;
}

.verdict-badge--list {
  height: 20px;
  padding: 0 8px;
  gap: 4px;
  font-size: 12px;
}
.verdict-badge--list .verdict-badge__icon svg {
  width: 12px;
  height: 12px;
}

.verdict-badge--card {
  height: 26px;
  padding: 0 10px;
  gap: 6px;
  font-size: 13px;
}
.verdict-badge--card .verdict-badge__icon svg {
  width: 14px;
  height: 14px;
}

.verdict-badge--detail {
  height: 36px;
  padding: 0 14px;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}
.verdict-badge--detail .verdict-badge__icon svg {
  width: 18px;
  height: 18px;
}

.verdict-badge--accessible {
  color: #15803d;
  background: #e6f4ea;
}

.verdict-badge--caution {
  color: #b06000;
  background: rgba(250, 204, 21, 0.16);
}

.verdict-badge--difficult {
  color: #c62828;
  background: #fce8e6;
}

.verdict-badge--not-surveyed {
  color: #5f6368;
  background: #f1f3f4;
}

.verdict-badge--muted {
  opacity: 0.72;
}

.verdict-badge-wrap {
  position: relative;
  display: inline-flex;
}

.verdict-badge-tip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  width: 240px;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(12, 12, 13, 0.05),
    0 4px 8px rgba(12, 12, 13, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: left;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity 0.12s ease, transform 0.12s ease;
  z-index: 20;
}

.verdict-badge-tip::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #ffffff;
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 2px 2px 2px rgba(12, 12, 13, 0.05);
}

.verdict-badge-wrap:hover .verdict-badge-tip,
.verdict-badge-wrap:focus-within .verdict-badge-tip {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.verdict-badge-tip__title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.verdict-badge-tip__desc {
  font-size: 13px;
  line-height: 1.45;
  color: #3c4043;
  margin: 0 0 12px;
}

.verdict-badge-tip__badge-row {
  display: flex;
  margin-bottom: 10px;
}

/* ============================================================
   FILTER-BAR ADDITIONS ON TOP OF VERDICT-BADGE
   Everything above this line is verbatim from verdict-badge.css.
   Everything below is specific to using it as a filter chip.
   ============================================================ */

.filter-bar__option-label.filter-bar__option-label--verdict {
  padding: 0;
  background: none;
  border-radius: 0;
}
.filter-bar__checkbox--verdict:hover + .filter-bar__option-label--verdict,
.filter-bar__checkbox--verdict:checked:hover + .filter-bar__option-label--verdict {
  background: none;
}

.filter-bar__checkbox.filter-bar__checkbox--verdict {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  opacity: 1;
}

.filter-bar__checkbox--verdict:checked + .verdict-badge {
  box-shadow: inset 0 0 0 2px currentColor;
}

.filter-bar__checkbox--verdict:focus-visible + .verdict-badge {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
`;
