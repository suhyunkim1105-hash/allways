"use client";
// Place detail — Figma "Place Detail Home (Final)". Left info panel + live map.
import { useState } from "react";
import Link from "next/link";
import MapCanvas, { MapLine, MapPin } from "@/components/MapCanvas";
import VerdictBadge from "@/components/VerdictBadge";
import type { Boarding, Place, Segment, Survey } from "@/lib/data";
import {
  en, regionEn, BF_GRADE_EN, DOOR_EN, SLOPE_CLASS_EN, RESTROOM_NOTE_EN,
  HAZARD_EN, DETOUR_EN, SURVEY_NOTE_EN, ROUTE_NOTE_EN, STATION_EN,
} from "@/lib/i18n";
import { photoAlt } from "@/lib/photoAlt";

const NOT_SURVEYED = <span className="text-verdict-none">Not surveyed</span>;

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 shrink-0 text-muted" aria-hidden="true">{icon}</span>
      <span className="w-[104px] shrink-0 text-[12.5px] text-muted">{label}</span>
      <span className="text-[12.5px] leading-relaxed text-ink">{children}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2.5">
      <p className="text-[10.5px] text-muted">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-bold leading-snug text-ink">{value}</p>
    </div>
  );
}

const I = {
  tag: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" /></svg>,
  clock: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  cal: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  ticket: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2.5 2.5 0 0 0 0 5 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.6" /></svg>,
  globe: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="currentColor" strokeWidth="1.4" /></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

export default function PlaceDetailView({
  place, sv, photos, boarding, related, pins,
}: {
  place: Place; sv?: Survey; photos: string[]; boarding: Boarding[];
  related: Segment[]; pins: MapPin[];
}) {
  const [tab, setTab] = useState<"home" | "access">("home");
  const [openSummary, setOpenSummary] = useState(true);
  const verdict = sv?.verdict || "정보없음";

  const lines: MapLine[] = related
    .filter((s) => s.path?.length)
    .map((s) => ({
      id: s.segment_id, path: s.path as [number, number][], verdict: s.verdict,
      label: `${s.from_name} → ${s.to_name}`, hazard: s.hazard ?? null,
    }));

  // "None" / "Not applicable" are real survey answers, but they make for empty
  // callout boxes — keep them out of the narrative blocks.
  const said = (t: string | null) => (t && t !== "None" && t !== "Not applicable" ? t : null);
  const restroomNote = said(en(sv?.restroom_note, RESTROOM_NOTE_EN));
  const hazard = said(en(sv?.hazard, HAZARD_EN));
  const detour = said(en(sv?.detour, DETOUR_EN));
  const note = said(en(sv?.note, SURVEY_NOTE_EN));

  // Venue blurbs arrive as one run-on line ("Accessible Parking: B1 Wheelchair
  // Rental: ..."). Break them back into labelled rows when the shape is obvious.
  const venueRows = (() => {
    const t = place.access_note_en?.trim();
    if (!t) return null;
    const parts = t.split(/(?=[A-Z][A-Za-z&/' ]{2,34}:\s)/).map((x) => x.trim()).filter(Boolean);
    return parts.length >= 2 && parts.every((x) => x.includes(":")) ? parts : null;
  })();
  const val = (v: string | undefined, dict = {}, unit = "") => {
    const t = en(v, dict);
    return t == null ? NOT_SURVEYED : <>{t}{t === "None" || t === "Not applicable" ? "" : unit}</>;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-[400px] shrink-0 overflow-y-auto border-r border-line bg-surface">
        <div className="px-6 pb-10 pt-6">
          <Link href="/map" className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-brand">
            <span aria-hidden="true">←</span> All routes
          </Link>

          <h1 className="text-[27px] font-bold leading-tight text-ink">{place.name_en}</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {place.name_ko} · {regionEn(place.region)}, Seoul
          </p>

          <div className="mt-3"><VerdictBadge verdict={verdict} size="md" /></div>
          {place.bf_grade && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-verdict-green/10 px-2 py-1 text-[11px] font-bold text-verdict-green">
                <span aria-hidden="true">✓</span> BF Certified
              </span>
              <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-bold text-ink">
                Official rating: {BF_GRADE_EN[place.bf_grade] ?? place.bf_grade}
              </span>
            </div>
          )}

          {place.tags?.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {place.tags.map((t) => (
                <li key={t} className="rounded-md bg-canvas px-2 py-1 text-[11px] text-muted">
                  {t.replace(/^#/, "").replace(/([a-z])([A-Z])/g, "$1 $2")}
                </li>
              ))}
            </ul>
          )}

          {place.summary_en && (
            <div className="mt-4 rounded-xl border border-line px-3.5 py-3">
              <button onClick={() => setOpenSummary((v) => !v)} aria-expanded={openSummary}
                className="flex w-full items-start justify-between gap-2 text-left">
                <p className={`text-[12.5px] leading-relaxed text-ink ${openSummary ? "" : "line-clamp-2"}`}>
                  {place.summary_en}
                </p>
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-muted">{openSummary ? "⌃" : "⌄"}</span>
              </button>
            </div>
          )}

          {/* tabs */}
          <div className="mt-5 flex border-b border-line text-[13px]" role="tablist">
            {([["home", "Home"], ["access", "Accessibility Info"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`px-3.5 py-2.5 ${tab === k ? "-mb-px border-b-2 border-brand font-bold text-brand" : "text-muted hover:text-ink"}`}>
                {l}
              </button>
            ))}
            <span aria-disabled="true" title="Coming in the next release"
              className="cursor-not-allowed px-3.5 py-2.5 text-verdict-none">Reviews</span>
          </div>

          {tab === "home" ? (
            <>
              <div className="mt-3 divide-y divide-line/70">
                <Row icon={I.tag} label="Category">{place.category}</Row>
                <Row icon={I.clock} label="Opening Hours">{place.open_hours || NOT_SURVEYED}</Row>
                <Row icon={I.cal} label="Closed Days">{place.closed_days || NOT_SURVEYED}</Row>
                <Row icon={I.ticket} label="Admission">{place.admission || NOT_SURVEYED}</Row>
                {place.official_url && (
                  <Row icon={I.globe} label="Official info">
                    <a href={place.official_url} target="_blank" rel="noopener noreferrer"
                      className="font-bold text-brand underline-offset-2 hover:underline">
                      {new URL(place.official_url).hostname.replace(/^(www|m)\./, "")}
                    </a>
                    {!place.has_access_page && (
                      <span className="block text-[11px] text-muted">No dedicated accessibility page — main site shown</span>
                    )}
                  </Row>
                )}
                <Row icon={I.check} label="Surveyed">
                  {sv?.date ? `${sv.date} · on-site by our team` : "Not yet surveyed"}
                </Row>
              </div>

              <h2 className="mt-6 text-[14px] font-bold text-ink">Accessibility facilities</h2>
              <p className="mt-1 text-[11.5px] text-muted">
                Every figure below was measured on site. A blank field means we have not
                measured it yet — it does not mean the feature is missing.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <Fact label="Step height" value={val(sv?.step_cm, {}, " cm")} />
                <Fact label="Slope" value={
                  sv?.slope_deg
                    ? <>{sv.slope_deg}°{en(sv.slope_class, SLOPE_CLASS_EN) ? ` (${en(sv.slope_class, SLOPE_CLASS_EN)?.toLowerCase()})` : ""}</>
                    : NOT_SURVEYED} />
                <Fact label="Entrance door" value={val(sv?.door, DOOR_EN)} />
                <Fact label="Door clear width" value={
                  sv?.door_width_cm === "없음" || sv?.door_width_cm === "0" ? "No door" : val(sv?.door_width_cm, {}, " cm")} />
                <Fact label="Elevators" value={val(sv?.elevator)} />
                <Fact label="Accessible restroom" value={val(sv?.restroom)} />
              </div>
              {restroomNote && <p className="mt-2 text-[11.5px] text-muted">Restroom: {restroomNote}</p>}

              {photos.length > 0 && (
                <>
                  <h2 className="mt-6 text-[14px] font-bold text-ink">Survey photos</h2>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {photos.slice(0, 10).map((f) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={f} src={`/photos/${f}`} alt={photoAlt(f, place.name_en)} title={photoAlt(f, place.name_en)}
                        className="h-28 w-auto flex-none rounded-lg border border-line object-cover" />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-line px-3.5 py-3">
                <VerdictBadge verdict={verdict} size="md" />
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  The overall verdict is the lowest grade among the items we measured.
                  Items we did not measure are left out of the calculation.{" "}
                  <Link href="/guide" className="font-bold text-brand hover:underline">How we rate →</Link>
                  {place.source_url && (
                    <>
                      <br />
                      Venue information checked against{" "}
                      <a href={place.source_url} target="_blank" rel="noopener noreferrer"
                        className="font-bold text-brand hover:underline">the official site</a>.
                    </>
                  )}
                </p>
              </div>

              {hazard && (
                <div className="mt-3 rounded-xl bg-accent/15 px-3.5 py-3">
                  <p className="text-[12px] font-bold text-ink">Watch out for</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink">{hazard}</p>
                </div>
              )}
              {detour && (
                <div className="mt-2.5 rounded-xl border border-line px-3.5 py-3">
                  <p className="text-[12px] font-bold text-ink">Alternative route</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{detour}</p>
                </div>
              )}
              {note && (
                <div className="mt-2.5 rounded-xl border border-line px-3.5 py-3">
                  <p className="text-[12px] font-bold text-ink">Surveyor&apos;s note</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{note}</p>
                </div>
              )}
              {place.access_note_en && (
                <div className="mt-2.5 rounded-xl border border-line px-3.5 py-3">
                  <p className="text-[12px] font-bold text-ink">From the venue</p>
                  <p className="mt-0.5 text-[10.5px] text-muted">Published by the venue — not measured by us.</p>
                  {venueRows ? (
                    <dl className="mt-2 space-y-1.5 text-[12px] leading-relaxed">
                      {venueRows.map((r) => {
                        const i = r.indexOf(":");
                        return (
                          <div key={r} className="flex gap-2">
                            <dt className="w-[118px] shrink-0 text-muted">{r.slice(0, i)}</dt>
                            <dd className="text-ink">{r.slice(i + 1).trim()}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-muted">{place.access_note_en}</p>
                  )}
                </div>
              )}

              {boarding.length > 0 && (
                <>
                  <h2 className="mt-6 text-[14px] font-bold text-ink">Subway boarding</h2>
                  <p className="mt-1 text-[11.5px] text-muted">
                    Board the listed car to arrive nearest the elevator with the smallest platform gap.
                  </p>
                  <table className="mt-2 w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-line text-muted">
                        <th className="py-1 pr-2 font-normal">Line</th>
                        <th className="py-1 pr-2 font-normal">Toward</th>
                        <th className="py-1 pr-2 font-normal">Car</th>
                        <th className="py-1 font-normal">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boarding.map((b, i) => (
                        <tr key={i} className="border-b border-line/60">
                          <td className="py-1.5 pr-2">{b.line}</td>
                          <td className="py-1.5 pr-2">{b.direction}</td>
                          <td className="py-1.5 pr-2 font-bold text-brand">{b.board_car}</td>
                          <td className="py-1.5">{b.platform_gap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {related.length > 0 && (
                <>
                  <h2 className="mt-6 text-[14px] font-bold text-ink">Routes through here</h2>
                  <ul className="mt-2 space-y-2">
                    {related.map((s) => (
                      <li key={s.segment_id} className="rounded-lg border border-line px-3 py-2.5">
                        <p className="text-[12.5px] font-bold text-ink">
                          {STATION_EN[s.from_name] ?? s.from_name} <span className="text-muted">→</span>{" "}
                          {STATION_EN[s.to_name] ?? s.to_name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-muted">
                          {s.distance_m ? `${s.distance_m} m · ${s.wheelchair_min} min by wheelchair` : "Survey in progress"}
                        </p>
                        {en(s.route_note, ROUTE_NOTE_EN) && (
                          <p className="mt-1 text-[11.5px] text-muted">{en(s.route_note, ROUTE_NOTE_EN)}</p>
                        )}
                        <div className="mt-1.5"><VerdictBadge verdict={s.verdict} size="sm" /></div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </aside>

      <div className="flex-1">
        <MapCanvas pins={pins} lines={lines} activePinId={place.place_id} className="h-full w-full" />
      </div>
    </div>
  );
}
