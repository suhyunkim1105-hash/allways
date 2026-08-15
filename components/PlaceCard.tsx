// Owner: 이령 — list card. Her version replaces this scaffold.
import Link from "next/link";
import VerdictBadge from "./VerdictBadge";
import { Place, getPhotos, getSurvey } from "@/lib/data";

export default function PlaceCard({ place }: { place: Place }) {
  const photos = getPhotos(place.place_id);
  const sv = getSurvey(place.place_id);
  return (
    <Link href={`/places/${place.place_id}`}
      className="block overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
      <div className="h-40 w-full bg-canvas">
        {photos[0]
          ? <img src={`/photos/${photos[0]}`} alt={`${place.name_en} — survey photo`} className="h-40 w-full object-cover" />
          : <div className="flex h-40 items-center justify-center text-sm text-verdict-none">No photo yet</div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold leading-tight">{place.name_en}</h3>
            <p className="text-xs text-muted">{place.name_ko} · {place.region === "광화문" ? "Gwanghwamun" : "Yongsan"}</p>
          </div>
          {place.bf_grade ? <span title={`Barrier-Free certified: ${place.bf_grade}`} className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-bold text-muted">BF</span> : null}
        </div>
        <div className="mt-2"><VerdictBadge verdict={sv?.verdict || "정보없음"} size="sm" /></div>
        <p className="mt-2 line-clamp-2 text-xs text-muted">{place.summary_en}</p>
        {sv?.date ? <p className="mt-2 text-[10px] text-verdict-none">Surveyed {sv.date}</p> : null}
      </div>
    </Link>
  );
}
