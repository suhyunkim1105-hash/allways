import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlaceDetailView from "@/components/PlaceDetailView";
import { getPlace, getPlaces, getSurvey, getPhotos, getBoarding, getSegments } from "@/lib/data";

export function generateStaticParams() {
  return getPlaces().map((p) => ({ id: p.place_id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = getPlace(params.id);
  if (!p) return {};
  return {
    title: `${p.name_en} — accessibility | AllWays`,
    description: p.summary_en || `On-site surveyed accessibility information for ${p.name_en}, Seoul.`,
  };
}

export default function PlaceDetail({ params }: { params: { id: string } }) {
  const place = getPlace(params.id);
  if (!place) notFound();

  const related = getSegments().filter(
    (s) => s.from_id === place.place_id || s.to_id === place.place_id
  );
  const neighbourIds = new Set(
    related.flatMap((s) => [s.from_id, s.to_id]).filter((id) => id?.startsWith("GH") || id?.startsWith("YS"))
  );
  neighbourIds.add(place.place_id);

  const pins = getPlaces()
    .filter((p) => neighbourIds.has(p.place_id))
    .map((p) => ({
      id: p.place_id, lat: p.lat, lng: p.lng, name: p.name_en,
      verdict: getSurvey(p.place_id)?.verdict || "정보없음", category: p.category,
    }));

  return (
    <PlaceDetailView
      place={place}
      sv={getSurvey(place.place_id)}
      photos={getPhotos(place.place_id)}
      boarding={getBoarding(place.place_id)}
      related={related}
      pins={pins}
    />
  );
}
