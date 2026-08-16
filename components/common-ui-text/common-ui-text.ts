/**
 * AllWays — Common UI Text (TypeScript/ESM mirror)
 * Owner: 명진 (공통 영문 문구 전담)
 *
 * Mirrors components/common-ui-text/common-ui-text.js byte-for-byte
 * (same pattern as verdictBadgePort.tsx mirroring verdict-badge.js) —
 * this repo doesn't have a root app/ or pages/ folder yet, so a plain
 * `import` of a UMD-style global-attaching .js file isn't reliable
 * inside Next.js components. Use THIS file from any .tsx component;
 * use common-ui-text.js from any plain <script>-included .html page.
 *
 * DO NOT edit a value here on its own — if common-ui-text.js changes,
 * mirror the change here too, and vice versa.
 *
 * See common-ui-text.js for the full CONFIRMATION LOG / sourcing notes
 * (glossary vs. team-confirmed, the "keep both tooltip styles"
 * decision, the Not Surveyed casing note, etc.) — not repeated here to
 * avoid the two files drifting out of sync in their commentary.
 *
 * Usage:
 *   import { VERDICT, BUTTONS, ERROR_SCREEN } from '../common-ui-text/common-ui-text';
 *   <button>{BUTTONS.tryAgain}</button>
 */

export type VerdictStatus = 'accessible' | 'caution' | 'difficult' | 'notSurveyed';

export interface VerdictTooltip {
  title: string;
  desc: string;
}

export interface VerdictEntry {
  shortLabel: string;
  tooltip: VerdictTooltip | null;
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
    // Confirmed title case "Not Surveyed" — verdict-badge.js/FilterBar.tsx
    // still render lowercase today; each owner updates their own file.
    shortLabel: 'Not Surveyed',
    tooltip: null,
    filterTooltip: null,
  },
};

// Glossary-verbatim — 접근성 판정 (fuller phrasing; distinct from VERDICT.*.shortLabel)
export const GLOSSARY_ACCESSIBILITY_JUDGEMENT = {
  fullyAccessible: 'Fully Accessible',
  cautionNeededPartiallyAccessible: 'Caution Needed / Partially Accessible',
  difficultNotAccessible: 'Difficult / Not Accessible',
  notSurveyed: 'Not Surveyed',
} as const;

// Glossary-verbatim — 이동 & 단차
export const GLOSSARY_MOVEMENT = {
  stepFreeAccess: 'Step-Free Access',
  rampAccess: 'Ramp Access',
  elevatorsOnAllFloors: 'Elevators on All Floors',
  elevators: 'Elevators',
  wheelchairLift: 'Wheelchair Lift',
} as const;

// Glossary-verbatim — 대여 & 편의시설
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

// Glossary-verbatim — 메인 카테고리 (already used verbatim in FilterBar.tsx)
export const GLOSSARY_MAIN_CATEGORIES = {
  artsAndCulture: 'Arts & Culture',
  historyAndHeritage: 'History & Heritage',
  natureAndLeisure: 'Nature & Leisure',
  shoppingAndEntertainment: 'Shopping & Entertainment',
} as const;

// Glossary-verbatim — 탐색 태그, grouped by the glossary's own section headers
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

// Not in the glossary — confirmed with the team, matching what already shipped.
export const BRAND = {
  slogan: 'Always, AllWays.',
  logoAlt: 'AllWays logo', // unified: LandingPage used this, site-footer used "AllWays"
} as const;

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

/**
 * Still open — flagged, not yet confirmed. Do not use in a shipped
 * screen until 명진 confirms and moves these into a section above.
 *   - Navigation/Tabs: no nav/tab component exists in the repo yet.
 *   - Subway information: no subway-related screen/copy exists yet.
 *   - Place/Facility detail screen: GLOSSARY_MOVEMENT and
 *     GLOSSARY_RENTAL_AMENITIES above are confirmed terms, but no
 *     screen in the repo consumes them yet.
 */
export const NEEDS_CONFIRMATION = {} as const;
