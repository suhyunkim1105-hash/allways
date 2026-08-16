// Owner: 이령 — list card. Her version replaces this scaffold.
import Link from "next/link";
import VerdictBadge from "./VerdictBadge";
import { Place, getPhotos, getSurvey } from "@/lib/data";
import { regionEn, BF_GRADE_EN } from "@/lib/i18n";
import { photoAlt } from "@/lib/photoAlt";

export default function PlaceCard({ place }: { place: Place }) {
  const photos = getPhotos(place.place_id);
  const sv = getSurvey(place.place_id);
  return (
    <Link
      href={`/places/${place.place_id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="relative h-40 w-full bg-canvas">
        {photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/photos/${photos[0]}`} alt={photoAlt(photos[0], place.name_en)}
            className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center text-[12px] text-verdict-none">No photo yet</div>
        )}
        {place.bf_grade ? (
          <span
            title={`Barrier-free certification: ${BF_GRADE_EN[place.bf_grade] ?? place.bf_grade} (official certification — separate from our own verdict)`}
            className="absolute left-3 top-3 rounded-md bg-surface/95 px-2 py-1 text-[10.5px] font-bold text-verdict-green shadow-sm"
          >
            ✓ BF Certified
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="text-[14.5px] font-bold leading-snug text-ink group-hover:text-brand">{place.name_en}</h3>
        <p className="mt-0.5 text-[11.5px] text-muted">
          {place.name_ko} · {regionEn(place.region)}
        </p>
        <div className="mt-2"><VerdictBadge verdict={sv?.verdict || "정보없음"} size="sm" /></div>
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">{place.summary_en}</p>
        {sv?.date ? (
          <p className="mt-2.5 text-[10.5px] text-verdict-none">Surveyed on site · {sv.date}</p>
        ) : (
          <p className="mt-2.5 text-[10.5px] text-verdict-none">Survey in progress</p>
        )}
      </div>
    </Link>
  );
}
