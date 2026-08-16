import raw from "@/data/appdata.json";

export type Place = {
  place_id: string; region: string; course: string; course_order: number | null;
  name_ko: string; name_en: string; category: string; tags: string[];
  lat: number; lng: number; open_hours: string; closed_days: string;
  admission: string; summary_en: string; access_note_en: string; bf_grade: string | null;
  official_url: string | null; source_url: string | null; has_access_page: boolean;
};
export type Survey = {
  record_id: string; target: string; step_cm: string; slope_class: string; slope_deg: string;
  door: string; door_width_cm: string; elevator: string; restroom: string; restroom_note: string;
  hazard: string; construction: string; verdict: string; detour: string;
  surveyor: string; date: string; note: string;
};
export type Segment = {
  segment_id: string; course: string; seq: number; from_id: string; from_name: string;
  to_id: string; to_name: string; distance_m: number | null; walk_min: number | null;
  wheelchair_min: number | null; verdict: string; route_note: string | null;
  path: [number, number][] | null;
  gap?: { after_idx: number; type: string; note: string } | null;
  hazard?: { lat: number; lng: number; note: string } | null;
};
export type Boarding = {
  station_id: string; line: string; direction: string; board_car: string;
  platform_gap: string; elevator_car: string | null; move_cars: number | null;
};

const data = raw as unknown as {
  places: Place[]; surveys: Record<string, Survey>; segments: Segment[];
  photos: Record<string, string[]>; boarding: Boarding[]; place_station: Record<string, string[]>;
};

export const getPlaces = () => data.places;
export const getPlace = (id: string) => data.places.find(p => p.place_id === id);
export const getSurvey = (id: string) => data.surveys[id];
export const getSegments = () => data.segments;
export const getPhotos = (id: string) => data.photos[id] ?? [];
export const getBoarding = (placeId: string): Boarding[] => {
  const st = data.place_station[placeId] ?? [];
  return data.boarding.filter(b => st.includes(b.station_id));
};
