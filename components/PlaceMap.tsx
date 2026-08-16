// AllWays — Place Detail Home 화면 전용 UI 문구
//
// 데이터 표시 규칙 (2026-08-16 확정, 사용자 지시):
//   - 조사는 했지만 값이 없는 항목  -> NOT_SURVEYED ("Not surveyed")
//   - 조사 결과 해당 요소가 없었던 경우 (예: 위험요소 없음) -> NONE_IDENTIFIED ("None identified")
//   두 문구는 의미가 다르므로 절대 섞어 쓰지 않는다.
//
// "Not Surveyed" 대소문자는 claude/common-ui-text-decisions.md에서 확정한
// 표기(타이틀 케이스)를 따른다. 이 파일의 화면(Place Detail Home)에서는
// 문장 속에 자연스럽게 녹아드는 자리가 많아 "Not surveyed"(문두 대문자만)로
// 사용한다 — VERDICT 배지 자체의 라벨("Not Surveyed")과는 별개.

export const NOT_SURVEYED = "Not surveyed";
export const NONE_IDENTIFIED = "None identified";

export const PLACE_DETAIL_TABS = {
  home: "Home",
  reviews: "Reviews",
  accessibilityInfo: "Accessibility Info",
} as const;

export type PlaceDetailTabKey = keyof typeof PLACE_DETAIL_TABS;

export const REVIEWS_COMING_SOON = "Coming soon";
// Short inline suffix — matches the "(soon)" convention already used in
// components/Header.tsx for Padlet/MY, so wording stays consistent and
// the tab bar doesn't wrap awkwardly in the narrow detail-panel column.
export const COMING_SOON_SHORT = "(soon)";
export const ACCESSIBILITY_INFO_PLACEHOLDER =
  "Detailed accessibility info for this tab is coming soon.";

export const SECTION_LABELS = {
  visitInfo: "Visit Info",
  onSiteMeasurements: "On-site Measurements",
  facilities: "Facilities",
  subwayBoarding: "Subway Boarding Tips",
  photos: "Photos",
  accessibilityFacilities: "Accessibility Facilities",
};

export const FIELD_LABELS = {
  category: "Category",
  openingHours: "Opening Hours",
  closedDays: "Closed Days",
  admission: "Admission",
  website: "Official Website",
  // 실측 정보 (on-site measurements)
  stepHeight: "Step Height",
  slope: "Slope",
  doorClearWidth: "Door Clear Width",
  hazards: "Hazards",
  detourRoute: "Detour Route",
  // 편의시설 (facilities) — components/common-ui-text 글로서리 표기와 통일
  entranceDoor: "Entrance Door",
  elevatorInside: "Elevators on All Floors",
  accessibleRestroom: "Accessible Restroom",
};

export const BF_CERTIFIED_LABEL = "BF Certified";

/** bf_grade ("최우수" | "우수" | null) -> 배지 문구. 인증 자체가 없으면 null. */
export function bfGradeLabel(grade: string | null | undefined): string | null {
  if (grade === "최우수") return "Barrier-free certification: highest grade";
  if (grade === "우수") return "Barrier-free certification: excellent grade";
  return null;
}

export const SUBWAY_BOARDING_NOTE =
  "Board the recommended car (car-door) to be near wheelchair space with the best platform gap; “move” = cars to walk after alighting to reach the elevator.";

export const SURVEYED_ON = (date: string) => `Surveyed by our team on ${date}`;
export const NOT_YET_SURVEYED_NOTE =
  "Not yet surveyed — figures shown are official info only.";
