// Google Maps look for AllWays.
//
// This is the legacy JSON style array. It works with nothing but an API key —
// no Cloud console setup — as long as the map is created WITHOUT a mapId.
// (If a mapId is passed, Google ignores `styles` and uses the cloud style instead.)
// To move to Cloud-based styling later: create a map style in Google Cloud
// Console, attach a Map ID, then pass `mapId` here and drop `styles`.
//
// Intent: strip the commercial POI clutter so our own pins and routes are the
// only things competing for attention, while keeping the two label families our
// users actually need — subway stations and parks.

export const MAP_STYLE: Record<string, unknown>[] = [
  { elementType: "geometry", stylers: [{ color: "#F4F6F8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5B6470" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 3 }] },

  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#DFE3E8" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },

  // Shops, restaurants, offices — off. They are noise for this task.
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#E2EDE3" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "on" }] },

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "labels.text", stylers: [{ visibility: "on" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ECEFF3" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#E1E5EA" }] },

  // Subway matters to our users, so stations keep their names.
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#E1E5EA" }] },
  { featureType: "transit.station", elementType: "labels.text", stylers: [{ visibility: "on" }] },
  { featureType: "transit.station.airport", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D8E5F1" }] },
  { featureType: "water", elementType: "labels.text", stylers: [{ visibility: "off" }] },
];

export const VERDICT_HEX: Record<string, string> = {
  "초록": "#15803d",
  "노랑": "#facc15",
  "빨강": "#c62828",
  "정보없음": "#8A97A8",
};

export const CAT_ICON: Record<string, string> = {
  "History & Heritage": "🏛",
  "Arts & Culture": "🎨",
  "Nature & Leisure": "🌳",
  "Shopping & Entertainment": "🛍",
};

/** Teardrop pin, filled by verdict, white ring, category icon dropped in the middle. */
export function pinIcon(g: any, verdict: string, active = false) {
  const fill = VERDICT_HEX[verdict] ?? VERDICT_HEX["정보없음"];
  const s = active ? 1.24 : 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
<path d="M20 50.5C20 50.5 37 30.2 37 19A17 17 0 1 0 3 19C3 30.2 20 50.5 20 50.5Z" fill="${fill}" stroke="#FFFFFF" stroke-width="2.5"/>
<circle cx="20" cy="19" r="11.5" fill="#FFFFFF"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(40 * s, 52 * s),
    anchor: new g.maps.Point(20 * s, 51 * s),
    labelOrigin: new g.maps.Point(20 * s, 19 * s),
  };
}
