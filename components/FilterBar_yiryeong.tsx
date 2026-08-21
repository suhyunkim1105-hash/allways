"use client";

/**
 * FilterBar — Owner: 이령
 *
 * The Region + Category + Accessibility ("verdict") pill selectors for
 * the places list screen (app/places/page.tsx). Purely
 * presentational/controlled: the parent owns the selected-value state
 * and passes it in here along with toggle callbacks. This component
 * never holds its own copy of the selection, so it can't drift out of
 * sync with the parent's filtering/sorting logic.
 *
 * Intentionally Tailwind-only — no custom CSS classes, no separate
 * stylesheet. This app is Tailwind-based; a new global CSS file here
 * would leak its class names onto every other screen. `chipClass`
 * below reproduces exactly the pill look the list screen already had
 * before this component existed, using the app's existing design
 * tokens:
 *   selected pill -> bg-brand text-white
 *   default pill  -> bg-surface border-line text-ink
 *
 * The "active filter tag" (bg-brand/10 text-brand) chips-below-the-bar
 * and the "Clear all" action intentionally stay in app/places/page.tsx
 * exactly as they were before — this component only owns the
 * clickable pill rows themselves, nothing else, to keep this change
 * small and avoid touching anything already working.
 */

export type Verdict = "초록" | "노랑" | "빨강" | "정보없음";

export interface FilterBarProps {
  region: string[];
  category: string[];
  verdict: Verdict[];
  onToggleRegion: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onToggleVerdict: (value: Verdict) => void;
  className?: string;
}

const REGION_OPTIONS = [
  { value: "광화문", label: "Gwanghwamun" },
  { value: "용산", label: "Yongsan" },
] as const;

const CATEGORY_OPTIONS = [
  "History & Heritage",
  "Arts & Culture",
  "Nature & Leisure",
  "Shopping & Entertainment",
] as const;

const VERDICT_OPTIONS: { value: Verdict; label: string }[] = [
  { value: "초록", label: "● Accessible" },
  { value: "노랑", label: "▲ Caution" },
  { value: "빨강", label: "■ Difficult" },
  { value: "정보없음", label: "○ Not surveyed" },
];

const chipClass = (selected: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
    selected
      ? "border-brand bg-brand font-bold text-white"
      : "border-line bg-surface text-ink hover:border-brand"
  }`;

export default function FilterBar({
  region,
  category,
  verdict,
  onToggleRegion,
  onToggleCategory,
  onToggleVerdict,
  className,
}: FilterBarProps) {
  return (
    <div className={className} data-component="filter-bar">
      <div className="flex flex-wrap items-center gap-2">
        {REGION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={region.includes(opt.value)}
            className={chipClass(region.includes(opt.value))}
            onClick={() => onToggleRegion(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category.includes(c)}
            className={chipClass(category.includes(c))}
            onClick={() => onToggleCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {VERDICT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={verdict.includes(opt.value)}
            className={chipClass(verdict.includes(opt.value))}
            onClick={() => onToggleVerdict(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
