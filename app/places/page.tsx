"use client";
// Owner: 이령 — list screen. Her FilterBar.tsx (yiryeong branch) wires in here at merge.
import { useState } from "react";
import PlaceCard from "@/components/PlaceCard";
import { getPlaces, getSurvey } from "@/lib/data";
import { verdictRank } from "@/lib/verdict";

const REGIONS = [["광화문", "Gwanghwamun"], ["용산", "Yongsan"]] as const;
const VERDICTS = [["초록", "● Accessible"], ["노랑", "▲ Caution"], ["빨강", "■ Difficult"], ["정보없음", "○ Not surveyed"]] as const;

export default function Places() {
  const [region, setRegion] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<string[]>([]);
  const [sort, setSort] = useState<"verdict" | "name">("verdict");
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  let list = getPlaces().filter(p => {
    const sv = getSurvey(p.place_id);
    const v = sv?.verdict || "정보없음";
    return (region.length === 0 || region.includes(p.region)) && (verdict.length === 0 || verdict.includes(v));
  });
  list = [...list].sort((a, b) => sort === "name"
    ? a.name_en.localeCompare(b.name_en)
    : verdictRank(getSurvey(a.place_id)?.verdict || "정보없음") - verdictRank(getSurvey(b.place_id)?.verdict || "정보없음"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Places</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3 text-sm">
        {REGIONS.map(([v, label]) => (
          <button key={v} onClick={() => toggle(region, setRegion, v)} aria-pressed={region.includes(v)}
            className={`rounded-full border px-3 py-1 ${region.includes(v) ? "border-brand bg-brand text-white" : "border-line bg-surface"}`}>{label}</button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        {VERDICTS.map(([v, label]) => (
          <button key={v} onClick={() => toggle(verdict, setVerdict, v)} aria-pressed={verdict.includes(v)}
            className={`rounded-full border px-3 py-1 ${verdict.includes(v) ? "border-brand bg-brand text-white" : "border-line bg-surface"}`}>{label}</button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <label className="text-muted">Sort
          <select value={sort} onChange={e => setSort(e.target.value as never)} className="ml-2 rounded border border-line bg-surface px-2 py-1">
            <option value="verdict">Most accessible first</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <span className="ml-auto text-muted">{list.length} places</span>
      </div>
      {list.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          No places match.
          <button onClick={() => { setRegion([]); setVerdict([]); }} className="ml-2 font-bold text-brand">Reset filters</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(p => <PlaceCard key={p.place_id} place={p} />)}
        </div>
      )}
    </div>
  );
}
