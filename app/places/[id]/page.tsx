import { notFound } from "next/navigation";
import VerdictBadge from "@/components/VerdictBadge";
import { getPlace, getPlaces, getSurvey, getPhotos, getBoarding } from "@/lib/data";

export function generateStaticParams() {
  return getPlaces().map(p => ({ id: p.place_id }));
}

const KO_EN: Record<string, string> = {
  "자동문": "Automatic", "상시개방": "Always open", "수동_레버": "Manual (lever)",
  "수동_돌림": "Manual (knob)", "수동_여닫이문": "Manual (swing)", "회전문": "Revolving",
  "Y": "Yes", "N": "No", "좁음": "narrow", "보통": "average", "넓음": "wide",
};
const tr = (v: string) => KO_EN[v] ?? v;
const NA = <span className="text-verdict-none">○ Not surveyed</span>;
const show = (v?: string, unit = "") =>
  !v || v === "" ? NA : v === "없음" || v === "해당 없음" || v === "해당없음" ? <span className="text-muted">N/A</span> : <span>{tr(v)}{unit}</span>;

export default function PlaceDetail({ params }: { params: { id: string } }) {
  const place = getPlace(params.id);
  if (!place) notFound();
  const sv = getSurvey(place.place_id);
  const photos = getPhotos(place.place_id);
  const boarding = getBoarding(place.place_id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{place.name_en}</h1>
          <p className="text-muted">{place.name_ko} · {place.category}</p>
          <p className="mt-1 flex flex-wrap gap-2 text-xs text-brand">{place.tags.map(t => <span key={t}>{t}</span>)}</p>
        </div>
        {place.bf_grade ? (
          <span title={`Barrier-Free certification: ${place.bf_grade} (reference only — not used in our verdict)`}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted">BF Certified</span>
        ) : null}
      </div>

      <div className="mt-4"><VerdictBadge verdict={sv?.verdict || "정보없음"} size="lg" /></div>

      {photos.length > 0 && (
        <div className="mt-6 flex gap-2 overflow-x-auto rounded-xl">
          {photos.slice(0, 8).map(f => (
            <img key={f} src={`/photos/${f}`} alt={`${place.name_en} — ${f.split("_")[1]}`} className="h-44 w-auto flex-none rounded-lg object-cover" />
          ))}
        </div>
      )}

      <p className="mt-6 text-ink">{place.summary_en}</p>

      {/* Tabs: Home / Accessibility active, Reviews disabled */}
      <div className="mt-8 border-b border-line text-sm font-bold">
        <span className="inline-block border-b-2 border-brand px-4 py-2 text-brand">Accessibility</span>
        <span className="inline-block px-4 py-2 text-verdict-none" title="Coming soon">Reviews (soon)</span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid--cols-2 sm:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-bold">On-site measurements</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Max step</dt><dd>{show(sv?.step_cm, " cm")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Slope</dt><dd>{show(sv?.slope_deg, "°")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Door</dt><dd>{show(sv?.door)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Door clear width</dt><dd>{show(sv?.door_width_cm, " cm")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Elevator inside</dt><dd>{show(sv?.elevator)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Accessible restroom</dt><dd>{show(sv?.restroom)}</dd></div>
          </dl>
          {sv?.restroom_note && sv.restroom_note !== "없음" ? <p className="mt-3 text-xs text-muted">Restroom: {sv.restroom_note}</p> : null}
          {sv?.hazard && sv.hazard !== "없음" ? <p className="mt-1 text-xs text-verdict-red">⚠ {sv.hazard}</p> : null}
          {sv?.detour && sv.detour !== "없음" ? <p className="mt-1 text-xs text-muted">Detour: {sv.detour}</p> : null}
          {sv?.date ? <p className="mt-3 text-[11px] text-verdict-none">Surveyed by our team on {sv.date}</p> : <p className="mt-3 text-[11px] text-verdict-none">Not yet surveyed — figures shown are official info only.</p>}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-bold">Visit info</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-muted">Hours</dt><dd className="whitespace-pre-line">{place.open_hours}</dd></div>
            <div><dt className="text-muted">Closed</dt><dd>{place.closed_days}</dd></div>
            <div><dt className="text-muted">Admission</dt><dd>{place.admission}</dd></div>
          </dl>
          <p className="mt-3 whitespace-pre-line text-xs text-muted">{place.access_note_en}</p>
        </section>
      </div>

      {boarding.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-bold">Subway boarding tips</h2>
          <p className="mt-1 text-xs text-muted">Board the recommended car (car-door) to be near wheelchair space with the best platform gap; “move” = cars to walk after alighting to reach the elevator.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-line text-xs text-muted">
                <th className="py-1 pr-3">Line</th><th className="py-1 pr-3">Direction</th><th className="py-1 pr-3">Board at</th><th className="py-1 pr-3">Platform gap</th><th className="py-1">Elevator / move</th>
              </tr></thead>
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
    </div>
  );
}
