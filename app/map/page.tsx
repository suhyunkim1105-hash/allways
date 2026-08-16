"use client";
// Home / map screen — Figma "All Routes (Final)". Left panel + full-bleed map.
import { useMemo, useState } from "react";
import Link from "next/link";
import MapCanvas, { MapLine, MapPin } from "@/components/MapCanvas";
import VerdictBadge from "@/components/VerdictBadge";
import { getPlaces, getSegments, getSurvey } from "@/lib/data";
import { VERDICT } from "@/lib/verdict";
import { courseEn, regionEn, en, ROUTE_NOTE_EN, STATION_EN } from "@/lib/i18n";

const fmtDist = (m: number | null) =>
  m == null ? null : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

export default function MapPage() {
  const places = getPlaces();
  const segments = getSegments();
  const nameEn = useMemo(
    () => Object.fromEntries(places.map((p) => [p.name_ko, p.name_en])),
    [places]
  );
  const idByName = useMemo(
    () => Object.fromEntries(places.map((p) => [p.name_ko, p.place_id])),
    [places]
  );
  const label = (ko: string) => nameEn[ko] ?? STATION_EN[ko] ?? ko;

  const [tab, setTab] = useState<"routes" | "places">("routes");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [activePin, setActivePin] = useState<string | null>(null);

  const pins: MapPin[] = places.map((p) => ({
    id: p.place_id, lat: p.lat, lng: p.lng, name: p.name_en,
    verdict: getSurvey(p.place_id)?.verdict || "정보없음", category: p.category,
  }));
  const lines: MapLine[] = segments
    .filter((s) => s.path?.length)
    .map((s) => ({
      id: s.segment_id, path: s.path as [number, number][], verdict: s.verdict,
      label: `${label(s.from_name)} → ${label(s.to_name)}`, hazard: s.hazard ?? null,
    }));

  const byCourse = useMemo(() => {
    const g: Record<string, typeof segments> = {};
    segments.forEach((s) => { (g[s.course] ||= []).push(s); });
    Object.values(g).forEach((v) => v.sort((a, b) => a.seq - b.seq));
    return g;
  }, [segments]);

  const surveyedRoutes = segments.filter((s) => s.path?.length).length;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ── left panel ─────────────────────────────────────────── */}
      <aside className="flex w-[400px] shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-2 px-6 pb-3 pt-5">
          <Link href="/" aria-label="Back to start" className="rounded p-1 text-ink hover:bg-canvas">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-[17px] font-bold text-ink">
            {tab === "routes" ? "All Routes" : "All Places"}
          </h1>
        </div>

        <div className="flex gap-1 px-6 pb-3" role="tablist" aria-label="Panel view">
          {(["routes", "places"] as const).map((t) => (
            <button
              key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                tab === t ? "bg-brand font-bold text-white" : "bg-canvas text-muted hover:text-ink"
              }`}
            >
              {t === "routes" ? `Routes (${surveyedRoutes})` : `Places (${places.length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {tab === "routes" ? (
            Object.entries(byCourse).map(([course, segs]) => (
              <section key={course} className="mb-5">
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                  {courseEn(course)}
                </h2>
                <ul className="space-y-2">
                  {segs.map((s) => {
                    const open = openId === s.segment_id;
                    const dist = fmtDist(s.distance_m);
                    const note = en(s.route_note, ROUTE_NOTE_EN);
                    return (
                      <li key={s.segment_id}
                        className={`rounded-xl border bg-surface transition-colors ${
                          activeLine === s.segment_id ? "border-brand ring-1 ring-brand" : "border-line"
                        }`}>
                        <button
                          onClick={() => {
                            setOpenId(open ? null : s.segment_id);
                            setActiveLine(s.path?.length ? s.segment_id : null);
                          }}
                          aria-expanded={open}
                          className="w-full px-3.5 py-3 text-left"
                        >
                          <p className="pr-5 text-[13.5px] font-bold leading-snug text-ink">
                            {label(s.from_name)} <span className="text-muted">→</span> {label(s.to_name)}
                          </p>
                          <p className="mt-1 text-[12px] text-muted">
                            {dist && s.wheelchair_min
                              ? `${dist} · ${s.wheelchair_min} min by wheelchair`
                              : "Survey in progress"}
                          </p>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-brand">
                            More details <span aria-hidden="true">{open ? "⌃" : "⌄"}</span>
                          </span>
                        </button>
                        {open && (
                          <div className="border-t border-line px-3.5 py-3 text-[12.5px]">
                            <VerdictBadge verdict={s.verdict} size="sm" />
                            <dl className="mt-2.5 space-y-1 text-muted">
                              {s.walk_min ? (
                                <div className="flex justify-between">
                                  <dt>Walking</dt><dd className="text-ink">{s.walk_min} min</dd>
                                </div>
                              ) : null}
                              {s.wheelchair_min ? (
                                <div className="flex justify-between">
                                  <dt>Wheelchair</dt><dd className="text-ink">{s.wheelchair_min} min</dd>
                                </div>
                              ) : null}
                              {dist ? (
                                <div className="flex justify-between">
                                  <dt>Distance</dt><dd className="text-ink">{dist}</dd>
                                </div>
                              ) : null}
                            </dl>
                            {note && <p className="mt-2 text-muted">{note}</p>}
                            {s.gap && (
                              <p className="mt-2 rounded-lg bg-canvas px-2.5 py-2 text-ink">
                                <span className="font-bold">Level change: </span>{s.gap.note}
                              </p>
                            )}
                            {s.hazard && (
                              <p className="mt-2 rounded-lg bg-accent/15 px-2.5 py-2 text-ink">
                                <span className="font-bold">Caution: </span>{s.hazard.note}
                              </p>
                            )}
                            {!s.path?.length && (
                              <p className="mt-2 text-muted">
                                This link has not been walked yet, so no line is drawn on the map.
                              </p>
                            )}
                            {idByName[s.to_name] && (
                              <Link href={`/places/${idByName[s.to_name]}`}
                                className="mt-2.5 inline-block font-bold text-brand hover:underline">
                                Open {label(s.to_name)} →
                              </Link>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          ) : (
            <ul className="space-y-2">
              {places.map((p) => {
                const v = getSurvey(p.place_id)?.verdict || "정보없음";
                return (
                  <li key={p.place_id}>
                    <Link
                      href={`/places/${p.place_id}`}
                      onMouseEnter={() => setActivePin(p.place_id)}
                      onMouseLeave={() => setActivePin(null)}
                      className="block rounded-xl border border-line px-3.5 py-3 hover:border-brand"
                    >
                      <p className="text-[13.5px] font-bold leading-snug text-ink">{p.name_en}</p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {regionEn(p.region)} · {p.category}
                      </p>
                      <div className="mt-1.5"><VerdictBadge verdict={v} size="sm" /></div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ── map ────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <MapCanvas
          pins={pins}
          lines={lines}
          activeLineId={activeLine}
          activePinId={activePin}
          onPinClick={(id) => { setTab("places"); setActivePin(id); }}
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute bottom-5 left-5 rounded-xl border border-line bg-surface/95 px-3.5 py-2.5 text-[11.5px] shadow-sm backdrop-blur">
          <p className="mb-1 font-bold text-ink">Accessibility verdict</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {(["초록", "노랑", "빨강", "정보없음"] as const).map((v) => (
              <li key={v} className="flex items-center gap-1 text-muted">
                <span aria-hidden="true" className={VERDICT[v].text}>{VERDICT[v].icon}</span>
                {VERDICT[v].label}
              </li>
            ))}
          </ul>
        </div>
        {activeLine && (
          <button
            onClick={() => { setActiveLine(null); setOpenId(null); }}
            className="absolute right-5 top-5 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-brand shadow-sm"
          >
            Show all routes
          </button>
        )}
      </div>
    </div>
  );
}
