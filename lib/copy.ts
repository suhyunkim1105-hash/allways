/**
 * AllWays — Screen Copy (single source of truth)
 * Owner: 명진 (공통 영문 문구 전담)
 *
 * 이 파일 하나로 화면 곳곳에 흩어져 있던 영문 버튼·안내·상태 문구를
 * 통합합니다. 새 화면을 만들 때는 여기서 값을 가져다 쓰고, 없는 문구는
 * 임의로 만들지 말고 이 파일에 먼저 추가한 뒤 사용하세요.
 *
 * 우선순위
 *   1. 용어집 "판정_필터_키워드 용어영문모음" 시트(56개 항목, 헤더 포함
 *      57행)의 "표준 영문 표기" — GLOSSARY_* 로 시작하는 값은 전부 그
 *      시트 내용 그대로이며, 임의로 수정하지 않았습니다.
 *   2. 용어집에 없는 표현(판정 배지 짧은 라벨, 인사말, 에러 화면 문구,
 *      푸터 정보 등)은 2026-08-15 팀 검토에서 확정한 값입니다
 *      (아래 각 섹션에 근거를 남겨뒀습니다).
 *
 * 다른 팀원 파일(FilterBar.tsx 등)은 이 파일이 수정하지 않습니다 —
 * 그 파일들의 문구가 여기 값과 다르면, 각 담당자가 자기 파일에서
 * 이 파일의 값을 가져다 쓰도록 맞추면 됩니다.
 */

// ============================================================
// 1. Glossary — 용어영문모음 시트 원문 그대로 (임의 수정 금지)
// ============================================================

/** 접근성 판정 — 배지의 짧은 라벨이 아니라, 더 긴 판정 문구가 필요할 때 사용 */
export const GLOSSARY_ACCESSIBILITY_JUDGEMENT = {
  fullyAccessible: 'Fully Accessible',
  cautionNeededPartiallyAccessible: 'Caution Needed / Partially Accessible',
  difficultNotAccessible: 'Difficult / Not Accessible',
  notSurveyed: 'Not Surveyed',
} as const;

/** 이동 & 단차 */
export const GLOSSARY_MOVEMENT = {
  stepFreeAccess: 'Step-Free Access',
  rampAccess: 'Ramp Access',
  elevatorsOnAllFloors: 'Elevators on All Floors',
  elevators: 'Elevators',
  wheelchairLift: 'Wheelchair Lift',
} as const;

/** 대여 & 편의시설 */
export const GLOSSARY_RENTAL_AMENITIES = {
  wheelchairRental: 'Wheelchair Rental',
  strollerRental: 'Stroller Rental',
  strollerAndWheelchairRental: 'Stroller & Wheelchair Rental',
  wheelchairChargingStation: 'Wheelchair Charging Station',
  accessibleRestrooms: 'Accessible Restrooms',
  nursingRoom: 'Nursing Room',
  diaperChangingStation: 'Diaper Changing Station',
  nursingAndDiaperChangingRoom: 'Nursing & Diaper Changing Room',
  accessibleParking: 'Accessible Parking',
  priorityTicketing: 'Priority Ticketing',
  serviceAnimalsWelcome: 'Service Animals Welcome',
  signLanguageVideoGuide: 'Sign Language Video Guide',
  brailleAndAudioGuide: 'Braille & Audio Guide',
} as const;

/** 메인 카테고리 — FilterBar.tsx(yiryeong)가 이미 이 값 그대로 사용 중, 확인 완료 */
export const GLOSSARY_MAIN_CATEGORIES = {
  artsAndCulture: 'Arts & Culture',
  historyAndHeritage: 'History & Heritage',
  natureAndLeisure: 'Nature & Leisure',
  shoppingAndEntertainment: 'Shopping & Entertainment',
} as const;

/** 탐색 태그 — 용어집의 그룹 헤더별로 정리 */
export const GLOSSARY_EXPLORE_TAGS = {
  artsAndCulture: [
    '#ContemporaryArt',
    '#ArtGallery',
    '#MediaArt',
    '#ModernArchitecture',
    '#FreeEntry',
  ],
  history: [
    '#RoyalPalace',
    '#Museum',
    '#NationalMuseum',
    '#CulturalHeritage',
    '#History',
    '#KoreanHistory',
    '#WarHistory',
    '#TraditionalLife',
    '#KingSejong',
    '#Hanbok',
  ],
  natureAndLeisure: [
    '#SeoulLandmark',
    '#HeartOfSeoul',
    '#CityWalk',
    '#CityPark',
    '#FamilyPark / #FamilyTrip',
    '#HangangPark',
    '#RiversideWalk / #Riverside',
    '#PicnicSpot',
    '#NightView',
    '#SunsetSpot',
    '#GardenWalk',
  ],
  shoppingAndLeisure: [
    '#ShoppingMall',
    '#DiningAndShopping',
    '#IndoorLeisure',
    '#NewSpot',
  ],
} as const;

// ============================================================
// 2. Accessibility verdict badge — 용어집에 없는 짧은 라벨 + 툴팁 문구
//    (2026-08-15 팀 검토에서 확정)
// ============================================================

export type VerdictStatus = 'accessible' | 'caution' | 'difficult' | 'notSurveyed';

export interface VerdictTooltip {
  title: string;
  desc: string;
}

export interface VerdictEntry {
  /** 배지 위에 표시되는 짧은 라벨. 용어집엔 없지만 별도 공식 표기로 승인됨. */
  shortLabel: string;
  /** 일반 배지용 짧은 툴팁 (verdict-badge.js 기준) */
  tooltip: VerdictTooltip | null;
  /** 필터 등 상세 설명이 필요한 곳의 긴 툴팁 (FilterBar.tsx 기준, 공식 확정) */
  filterTooltip: VerdictTooltip | null;
}

export const VERDICT: Record<VerdictStatus, VerdictEntry> = {
  accessible: {
    shortLabel: 'All-Way',
    tooltip: {
      title: 'Accessible',
      desc: 'Fully accessible independently for all people.',
    },
    filterTooltip: {
      title: 'All-Way Accessible',
      desc: 'The route from the entrance to key facilities is step-free and confirmed accessible for wheelchairs and other mobility devices.',
    },
  },
  caution: {
    shortLabel: 'Step-Way',
    tooltip: {
      title: 'Caution needed',
      desc: 'Accessible, but assistance or caution may be required.',
    },
    filterTooltip: {
      title: 'Step-Way (Caution Needed)',
      desc: 'Some sections include steps, slopes, or uneven surfaces. Assistance or an alternate path may be needed along the way.',
    },
  },
  difficult: {
    shortLabel: 'Re-Way',
    tooltip: {
      title: 'Difficult',
      desc: 'Restricted access due to barriers.',
    },
    filterTooltip: {
      title: 'Re-Way (Difficult Access)',
      desc: "The main route isn't accessible. Check for an alternate entrance or route before visiting, or contact the venue directly.",
    },
  },
  notSurveyed: {
    // 대문자 "Not Surveyed"로 확정 (용어집 원문 + 다른 3개 라벨과 표기
    // 일관성). verdict-badge.js / FilterBar.tsx 코드는 아직 소문자
    // "Not surveyed"로 남아있음 — 각 담당자가 자기 파일에서 갱신 필요.
    shortLabel: 'Not Surveyed',
    tooltip: null, // 조사된 데이터가 없어 설명할 내용도 없음 (의도된 설계)
    filterTooltip: null,
  },
};

// ============================================================
// 3. 그 외 화면 공통 문구 — 용어집에 없는 것 중 이미 코드에 반영돼 있고
//    팀과 함께 확정한 값 (2026-08-15)
// ============================================================

export const BRAND = {
  slogan: 'Always, AllWays.',
  // LandingPage는 "AllWays logo", site-footer는 "AllWays"만 쓰고 있었음 —
  // 더 설명적인 쪽으로 통일.
  logoAlt: 'AllWays logo',
} as const;

/** 랜딩 페이지 순환 인사말 — "Welcome"을 로마자 표기로 순환 (화면 문구는 항상 영문/라틴 문자 유지) */
export const GREETINGS: string[] = [
  'Welcome',
  'Bienvenue',
  'Bienvenido',
  'Benvenuto',
  'Willkommen',
  'Bem-vindo',
  'Youkoso',
  'Huanying',
  'Hwanyeong',
  'Swagat',
];

export const BUTTONS = {
  signInWithGoogle: 'Sign in with Google',
  tryAgain: 'Try Again',
  clearAll: 'Clear All',
  clearDate: 'Clear date',
} as const;

export const ARIA_LABELS = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  removeFilter: 'Remove filter',
  clearSearch: 'Clear search',
  searchDestinations: 'Search destinations',
} as const;

export const ERROR_SCREEN = {
  title: 'Something went wrong',
  description: 'Please try again in a moment.',
  buttonLabel: 'Try Again',
} as const;

export const EMPTY_STATES = {
  noFiltersApplied: 'No filters applied',
  /** 실제 가입자 수가 확정되기 전까지 "n" 자리표시자 유지 */
  joinedStatsPlaceholder: 'n people around the world have joined.',
} as const;

export const ACCESSIBILITY_GUIDE = {
  pageTitle: 'Accessibility Rating Guide',
  subtitle: 'See exactly why a place is rated All-Way, Step-Way, or Re-Way.',
  criteria: {
    threshold: 'Entrance & Floor Threshold',
    slope: 'Ramp Slope',
    passageWidth: 'Passage Width',
    door: 'Door Type & Space',
    turningSpace: 'Turning Space',
    restroom: 'Accessible Restroom',
  },
} as const;

export const FOOTER = {
  team: 'Team Ctrl+K',
  event: '2026 KF Digital Public Diplomacy Academy',
  date: 'Data surveyed Aug 2026',
} as const;

export const SEARCH = {
  placeholder: 'Search destinations or tags…',
} as const;

export const DATE_PICKER = {
  selectDate: 'Select a date',
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  weekdayHeaders: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
} as const;

// ============================================================
// 4. 아직 확인 필요 — 확정 전까지 화면에 그대로 쓰지 말 것
//   - Navigation / Tabs: 저장소에 아직 구현된 화면 없음
//   - Subway information: 저장소에 아직 구현된 화면 없음
//   - Place details / Facility information: GLOSSARY_MOVEMENT /
//     GLOSSARY_RENTAL_AMENITIES는 용어집 기준 확정 완료, 다만 실제로
//     소비하는 화면이 아직 없음
// ============================================================
export const NEEDS_CONFIRMATION = {} as const;
