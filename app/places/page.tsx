"use client";
// Owner: 이령 — list screen. Her FilterBar.tsx wires in here at merge.
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PlaceCard from "@/components/PlaceCard";
import FilterBar, { type Verdict } from "@/components/FilterBar_yiryeong";
import { getPlaces, getSurvey } from "@/lib/data";
import { verdictRank } from "@/lib/verdict";
import { regionEn } from "@/lib/i18n";

const REGIONS = [["광화문", "Gwanghwamun"], ["용산", "Yongsan"]] as const;
const VERDICTS: [Verdict, string][] = [
  ["초록", "● Accessible"],
  ["노랑", "▲ Caution"],
  ["빨강", "■ Difficult"],
  ["정보없음", "○ Not surveyed"],
];

function toggle<T>(arr: T[], set: (v: T[]) => void, v: T) {
  set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
}

function PlacesInner() {
  const q = (useSearchParams().get("q") || "").trim().toLowerCase();
  const [region, setRegion] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<Verdict[]>([]);
  const [sort, setSort] = useState<"verdict" | "name">("verdict");

  let list = getPlaces().filter((p) => {
    const v = (getSurvey(p.place_id)?.verdict || "정보없음") as Verdict;
    const hay = `${p.name_en} ${p.name_ko} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
    return (
      (q === "" || hay.includes(q)) &&
      (region.length === 0 || region.includes(p.region)) &&
      (category.length === 0 || category.includes(p.category)) &&
      (verdict.length === 0 || verdict.includes(v))
    );
  });

  list = [...list].sort((a, b) =>
    sort === "name"
      ? a.name_en.localeCompare(b.name_en)
      : verdictRank(getSurvey(a.place_id)?.verdict || "정보없음") -
        verdictRank(getSurvey(b.place_id)?.verdict || "정보없음")
  );

  const reset = () => { setRegion([]); setCategory([]); setVerdict([]); };
  const active = region.length + category.length + verdict.length;

  // 선택된 조건을 칩으로 보여주고 X로 하나씩 해제 — 이령님 FilterBar 설계 반영
  const VERDICT_LABEL = Object.fromEntries(VERDICTS) as Record<string, string>;
  const REGION_LABEL = Object.fromEntries(REGIONS) as Record<string, string>;
  const chips = [
    ...region.map((v) => ({ key: `r-${v}`, label: REGION_LABEL[v], off: () => toggle(region, setRegion, v) })),
    ...category.map((v) => ({ key: `c-${v}`, label: v, off: () => toggle(category, setCategory, v) })),
    ...verdict.map((v) => ({ key: `v-${v}`, label: VERDICT_LABEL[v], off: () => toggle(verdict, setVerdict, v) })),
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[27px] font-bold text-ink">All places</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {q ? <>Results for &ldquo;{q}&rdquo; · </> : null}
            21 places across Gwanghwamun and Yongsan, each visited and measured by our team.
          </p>
        </div>
        <Link href="/map" className="text-[13px] font-bold text-brand hover:underline">Open the map →</Link>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
        {/* Region + Category + Accessibility pill rows — now 이령's
            FilterBar component (components/FilterBar_yiryeong.tsx)
            instead of hand-rolled buttons. This page still owns the
            actual state/filtering; FilterBar is just the controlled
            pill UI on top of it. */}
        <FilterBar
          region={region}
          category={category}
          verdict={verdict}
          onToggleRegion={(v) => toggle(region, setRegion, v)}
          onToggleCategory={(v) => toggle(category, setCategory, v)}
          onToggleVerdict={(v) => toggle(verdict, setVerdict, v)}
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <label className="text-[12.5px] text-muted">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as never)}
              className="ml-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink">
              <option value="verdict">Most accessible first</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <span className="ml-auto text-[12.5px] text-muted">
            {list.length} of {getPlaces().length} places
            {active > 0 && (
              <button onClick={reset} className="ml-3 font-bold text-brand hover:underline">Reset filters</button>
            )}
          </span>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] text-muted">Active filters</span>
          {chips.map((c) => (
            <span key={c.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-3 pr-1.5 text-[12px] font-bold text-brand">
              {c.label}
              <button onClick={c.off} aria-label={`Remove filter ${c.label}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-brand hover:bg-brand hover:text-white">
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
          <button onClick={reset} className="ml-1 text-[12px] text-muted underline underline-offset-2 hover:text-brand">
            Clear all
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-14 text-center text-muted">
          No places match.
          <button onClick={reset} className="ml-2 font-bold text-brand hover:underline">Reset filters</button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <PlaceCard key={p.place_id} place={p} />)}
        </div>
      )}
      <p className="mt-8 text-[11.5px] text-muted">
        A blank field means we have not measured that item yet. It never means the feature is absent.
        Regions shown: {REGIONS.map(([v]) => regionEn(v)).join(", ")}.
      </p>
    </div>
  );
}

export default function Places() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1440px] px-6 py-8 text-muted">Loading places…</div>}>
      <PlacesInner />
    </Suspense>
  );
}
