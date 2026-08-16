import { notFound } from "next/navigation";
import PlaceDetailHome from "@/components/PlaceDetailHome";
import { getBoarding, getPhotos, getPlace, getPlaces, getSurvey } from "@/lib/data";

export function generateStaticParams() {
  return getPlaces().map(p => ({ id: p.place_id }));
}

export default function PlaceDetail({ params }: { params: { id: string } }) {
  const place = getPlace(params.id);
  if (!place) notFound();

  const survey = getSurvey(place.place_id);
  const photos = getPhotos(place.place_id);
  const boarding = getBoarding(place.place_id);

  return <PlaceDetailHome place={place} survey={survey} photos={photos} boarding={boarding} />;
}
