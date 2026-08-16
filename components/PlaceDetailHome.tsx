"use client";
// Place Detail — Home tab.
// Design source: 세린 8/14 Figma "Place Detail Home (Final)" (node-id 217-1713).
// Reuses existing components as-is: VerdictBadge (판정 배지), and the same
// Google Maps loading technique as app/map/page.tsx via PlaceMap.
//
// Tab order follows the Figma layout (Home / Reviews / Accessibility Info).
// Behavior per tab follows the spec: Home is active with real content,
// Accessibility Info is clickable but has no content yet, Reviews is
// disabled and shows "Coming soon".
import { useState } from "react";
import VerdictBadge from "@/components/VerdictBadge";
import PlaceMap from "@/components/PlaceMap";
import { Boarding, Place, Survey } from "@/lib/data";
import {
  ACCESSIBILITY_INFO_PLACEHOLDER,
  BF_CERTIFIED_LABEL,
  bfGradeLabel,
  COMING_SOON_SHORT,
  FIELD_LABELS,
  NONE_IDENTIFIED,
  NOT_SURVEYED,
  NOT_YET_SURVEYED_NOTE,
  PLACE_DETAIL_TABS,
  PlaceDetailTabKey,
  REVIEWS_COMING_SOON,
  SECTION_LABELS,
  SUBWAY_BOARDING_NOTE,
  SURVEYED_ON,
} from "@/lib/copy";

// Same Korean -> English survey-value dictionary as the previous
// implementation (kept verbatim so wording doesn't drift).
const KO_EN: Record<string, string> = {
  "자동문": "Automatic", "상시개방": "Always open", "수동_레버": "Manual (lever)",
  "수동_돌림": "Manual (knob)", "수동_여닫이문": "Manual (swing)", "회전문": "Revolving",
  "Y": "Yes", "N": "No", "좁음": "narrow", "보통": "average", "넓음": "wide",
};
const tr = (v: string) => KO_EN[v] ?? v;

/**
 * Renders a single surveyed value, distinguishing:
 *   - no value at all               -> "Not surveyed"
 *   - surveyed, and result is "없음" -> "None identified" (when emptyMeansNone)
 *                                       or "N/A" (default, e.g. not-applicable fields)
 *   - a real value                  -> translated value (+ unit)
 */
function fieldValue(
  v?: string,
  opts: { unit?: string; emptyMeansNone?: boolean } = {}
): React.ReactNode {
  const { unit = "", emptyMeansNone = false } = opts;
  if (!v || v === "") return <span className="text-verdict-none">{NOT_SURVEYED}</span>;
  const isNoneKo = v === "없음" || v === "해당 없음" || v === "해당없음";
  if (isNoneKo) {
    return emptyMeansNone
      ? <span className="text-muted">{NONE_IDENTIFIED}</span>
      : <span className="text-muted">N/A</span>;
  }
  return <span>{tr(v)}{unit}</span>;
}

function StatCard({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
      {extra}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <span aria-hidden="true" className="mt-0.5 w-5 flex-none text-center">{icon}</span>
      <span className="w-28 flex-none text-muted">{label}</span>
      <span className="flex-1 font-bold text-ink">{value}</span>
    </div>
  );
}

function HomeTabContent({ place, survey: sv, boarding, photos }: {
  place: Place; survey?: Survey; boarding: Boarding[]; photos: string[];
}) {
  return (
    <div className="space-y-6">
      <section className="divide-y divide-line/50">
        <InfoRow icon="📍" label={FIELD_LABELS.category} value={place.category} />
        <InfoRow icon="🕐" label={FIELD_LABELS.openingHours} value={<span className="whitespace-pre-line">{place.open_hours}</span>} />
        <InfoRow icon="📅" label={FIELD_LABELS.closedDays} value={place.closed_days} />
        <InfoRow icon="🎫" label={FIELD_LABELS.admission} value={place.admission} />
        {place.website ? (
          <InfoRow
            icon="🌐"
            label={FIELD_LABELS.website}
            value={<a href={place.website} target="_blank" rel="noreferrer" className="text-brand underline">{place.website.replace(/^https?:\/\//, "")}</a>}
          />
        ) : null}
      </section>

      <section>
        <h2 className="font-bold">{SECTION_LABELS.onSiteMeasurements}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label={FIELD_LABELS.stepHeight} value={fieldValue(sv?.step_cm, { unit: " cm" })} />
          <StatCard label={FIELD_LABELS.slope} value={fieldValue(sv?.slope_deg, { unit: "°" })} />
          <StatCard label={FIELD_LABELS.doorClearWidth} value={fieldValue(sv?.door_width_cm, { unit: " cm" })} />
          <StatCard label={FIELD_LABELS.hazards} value={fieldValue(sv?.hazard, { emptyMeansNone: true })} />
          <StatCard label={FIELD_LABELS.detourRoute} value={fieldValue(sv?.detour, { emptyMeansNone: true })} />
        </div>
        {sv?.date
          ? <p className="mt-3 text-[11px] text-verdict-none">{SURVEYED_ON(sv.date)}</p>
          : <p className="mt-3 text-[11px] text-verdict-none">{NOT_YET_SURVEYED_NOTE}</p>}
      </section>

      <section>
        <h2 className="font-bold">{SECTION_LABELS.facilities}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label={FIELD_LABELS.entranceDoor} value={fieldValue(sv?.door)} />
          <StatCard label={FIELD_LABELS.elevatorInside} value={fieldValue(sv?.elevator)} />
          <StatCard
            label={FIELD_LABELS.accessibleRestroom}
            value={fieldValue(sv?.restroom)}
            extra={sv?.restroom_note && sv.restroom_note !== "없음" ? <p className="mt-1 text-xs text-muted">{sv.restroom_note}</p> : null}
          />
        </div>
      </section>

      {boarding.length > 0 && (
        <section>
          <h2 className="font-bold">{SECTION_LABELS.subwayBoarding}</h2>
          <p className="mt-1 text-xs text-muted">{SUBWAY_BOARDING_NOTE}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-1 pr-3">Line</th><th className="py-1 pr-3">Direction</th><th className="py-1 pr-3">Board at</th><th className="py-1 pr-3">Platform gap</th><th className="py-1">Elevator / move</th>
                </tr>
              </thead>
              <tbody>
                {boarding.map((b, i) => (
                  <tr key={i} className="border-b border-line/50">
                    <td className="py-1.5 pr-3">{b.line}</td><td className="py-1.5 pr-3">{b.direction}</td>
                    <td className="py-1.5 pr-3 font-bold text-brand">{b.board_car}</td>
                    <td className="py-1.5 pr-3">{b.platform_gap}</td>
                    <td className="py-1.5">{b.elevator_car ? `${b.elevator_car} · move ${b.move_cars} cars` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section>
          <h2 className="font-bold">{SECTION_LABELS.photos}</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto rounded-xl">
            {photos.slice(0, 8).map(f => (
              <img key={f} src={`/photos/${f}`} alt={`${place.name_en} — ${f.split("_")[1]}`} className="h-44 w-auto flex-none rounded-lg object-cover" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function PlaceDetailHome({ place, survey, photos, boarding }: {
  place: Place; survey?: Survey; photos: string[]; boarding: Boarding[];
}) {
  const [tab, setTab] = useState<PlaceDetailTabKey>("home");
  const [descOpen, setDescOpen] = useState(true);
  const bfLabel = bfGradeLabel(place.bf_grade);
  const tabKeys = Object.keys(PLACE_DETAIL_TABS) as PlaceDetailTabKey[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: detail panel */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <h1 className="text-2xl font-bold leading-tight">{place.name_en}</h1>
          <p className="mt-1 text-sm text-muted">
            {place.address_en ?? <span className="text-verdict-none">{NOT_SURVEYED}</span>}
          </p>

          {place.bf_grade ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-verdict-green/10 px-3 py-1 text-xs font-bold text-verdict-green">✓ {BF_CERTIFIED_LABEL}</span>
              {bfLabel ? <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{bfLabel}</span> : null}
            </div>
          ) : null}

          <div className="mt-3">
            <VerdictBadge verdict={survey?.verdict || "정보없음"} size="md" />
          </div>

          {place.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {place.tags.map(t => (
                <span key={t} className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-bold text-muted">{t}</span>
              ))}
            </div>
          )}

          <div className="relative mt-3 rounded-xl border border-line bg-canvas p-3 pr-9">
            <p className={descOpen ? "text-sm text-ink" : "line-clamp-2 text-sm text-ink"}>{place.summary_en}</p>
            <button
              type="button"
              onClick={() => setDescOpen(o => !o)}
              aria-expanded={descOpen}
              aria-label={descOpen ? "Collapse description" : "Expand description"}
              className="absolute right-2 top-2 text-muted"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className={descOpen ? "rotate-180 transition-transform" : "transition-transform"}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Tabs: Home (active + real content) / Reviews (disabled, coming soon) / Accessibility Info (clickable, no content yet) */}
          <div className="mt-6 flex overflow-x-auto border-b border-line text-sm font-bold">
            {tabKeys.map(key => {
              const label = PLACE_DETAIL_TABS[key];
              const isReviews = key === "reviews";
              const isActive = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isReviews}
                  aria-disabled={isReviews}
                  aria-selected={isActive}
                  title={isReviews ? REVIEWS_COMING_SOON : undefined}
                  onClick={() => !isReviews && setTab(key)}
                  className={
                    isReviews
                      ? "flex-none cursor-not-allowed whitespace-nowrap px-3 py-2 text-verdict-none"
                      : `flex-none whitespace-nowrap px-3 py-2 ${isActive ? "border-b-2 border-brand text-brand" : "text-ink hover:text-brand"}`
                  }
                >
                  {label}
                  {isReviews ? <span className="ml-1 text-[10px] font-normal">{COMING_SOON_SHORT}</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            {tab === "home" && <HomeTabContent place={place} survey={survey} boarding={boarding} photos={photos} />}
            {tab === "accessibilityInfo" && (
              <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">{ACCESSIBILITY_INFO_PLACEHOLDER}</p>
            )}
          </div>
        </div>

        {/* Right: map — same Google Maps technique as the existing Map page, unchanged there */}
        <div className="h-[360px] w-full flex-1 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <PlaceMap place={place} />
        </div>
      </div>
    </div>
  );
}
