/**
 * AllWays — Common UI Text (single source of truth)
 * Owner: 명진 (공통 영문 문구 전담)
 *
 * WHY THIS FILE EXISTS
 * Every screen was writing its own English copy for the same concepts
 * (verdict labels, error messages, footer info, etc.), so wording began
 * to drift between screens/teammates. This file is the one place all of
 * that confirmed English copy lives, so every developer imports the same
 * strings instead of retyping their own version.
 *
 * SOURCE OF TRUTH / PRIORITY
 *   1. Attached glossary `판정_필터_키워드 용어영문모음.xlsx` — "표준 영문 표기"
 *      column. Nothing in that glossary was altered here.
 *   2. Where the glossary doesn't cover a term (product-specific badge
 *      labels, greetings, error copy, footer info, etc.), the wording
 *      already shipped in the codebase was reviewed with the team and
 *      confirmed as-is (see CONFIRMATION LOG below).
 *
 * RULES FOR EVERYONE USING THIS FILE
 *   - Do not invent new English copy for something already listed here —
 *     import it from here instead.
 *   - If a screen needs new copy that isn't here yet, ask 명진 to add it
 *     to this file first (mark it 확인 필요 until it's confirmed), don't
 *     just hardcode a guess in your own component.
 *   - This file does NOT modify any other teammate's file (e.g.
 *     `components/FilterBar.tsx`, owner yiryeong). Where that file's
 *     current wording differs from what's confirmed here, that's called
 *     out explicitly below — updating FilterBar.tsx itself is up to its
 *     owner.
 *
 * CONFIRMATION LOG (2026-08-15 review with the team)
 *   - Verdict short labels "All-Way" / "Step-Way" / "Re-Way" are NOT in
 *     the glossary, but were approved as their own official product
 *     terms (distinct from the glossary's longer judgement phrasing —
 *     see GLOSSARY_ACCESSIBILITY_JUDGEMENT below, which stays available
 *     for screens that need the fuller phrase instead of the short pill
 *     label).
 *   - Both existing tooltip styles are kept, on purpose, for different
 *     contexts rather than collapsing into one:
 *       · VERDICT.tooltip   — short badge tooltip (verdict-badge.js's
 *         existing copy), for the compact pill used across most screens.
 *       · VERDICT.filterTooltip — longer, filter-specific detail copy
 *         (currently only in FilterBar.tsx), for contexts that want a
 *         fuller explanation. FilterBar.tsx's own comment calls this
 *         copy a placeholder pending approval — it is now confirmed as
 *         official via this file; FilterBar.tsx itself hasn't been
 *         edited (not our file), so it still has the old inline comment.
 *   - "Not Surveyed" uses title case (matches the glossary exactly, and
 *     matches the capitalization pattern of the other three labels:
 *     All-Way / Step-Way / Re-Way). NOTE: `verdict-badge.js` and
 *     `FilterBar.tsx` currently render the lowercase "Not surveyed" —
 *     each owner should update their own file to "Not Surveyed" to match.
 *   - Everything else not in the glossary (greetings, error screen copy,
 *     footer info line, search placeholder, empty-state text, etc.) was
 *     reviewed and confirmed as-is, matching what's already shipped.
 *
 * USAGE (plain <script> include, no build step — same pattern as
 * verdict-badge.js / site-footer.js):
 *   <script src="components/common-ui-text/common-ui-text.js"></script>
 *   CommonUIText.VERDICT.accessible.shortLabel   // "All-Way"
 *   CommonUIText.BUTTONS.tryAgain                // "Try Again"
 *
 * For Next.js/TSX components, import the mirrored ESM version instead:
 *   import { VERDICT, BUTTONS, ... } from './common-ui-text';
 *   (see common-ui-text.ts in this same folder — kept in sync by hand,
 *   same pattern as verdictBadgePort.tsx mirroring verdict-badge.js)
 */
(function (global) {
  "use strict";

  // ----------------------------------------------------------------
  // 1. Accessibility verdict — badge short labels + both tooltip styles
  //    (glossary doesn't cover the short labels; tooltip copy confirmed
  //    per the CONFIRMATION LOG above)
  // ----------------------------------------------------------------
  var VERDICT = {
    accessible: {
      shortLabel: "All-Way",
      tooltip: {
        title: "Accessible",
        desc: "Fully accessible independently for all people.",
      },
      filterTooltip: {
        title: "All-Way Accessible",
        desc:
          "The route from the entrance to key facilities is step-free and confirmed accessible for wheelchairs and other mobility devices.",
      },
    },
    caution: {
      shortLabel: "Step-Way",
      tooltip: {
        title: "Caution needed",
        desc: "Accessible, but assistance or caution may be required.",
      },
      filterTooltip: {
        title: "Step-Way (Caution Needed)",
        desc:
          "Some sections include steps, slopes, or uneven surfaces. Assistance or an alternate path may be needed along the way.",
      },
    },
    difficult: {
      shortLabel: "Re-Way",
      tooltip: {
        title: "Difficult",
        desc: "Restricted access due to barriers.",
      },
      filterTooltip: {
        title: "Re-Way (Difficult Access)",
        desc:
          "The main route isn't accessible. Check for an alternate entrance or route before visiting, or contact the venue directly.",
      },
    },
    notSurveyed: {
      // Confirmed as title case "Not Surveyed" — see CONFIRMATION LOG.
      // verdict-badge.js / FilterBar.tsx still render lowercase today;
      // each owner updates their own file.
      shortLabel: "Not Surveyed",
      tooltip: null, // by design — nothing to explain about data that doesn't exist yet
      filterTooltip: null,
    },
  };

  // ----------------------------------------------------------------
  // 2. Glossary-verbatim terms — copied 1:1 from
  //    판정_필터_키워드 용어영문모음.xlsx "표준 영문 표기" column.
  //    Do not edit these values without an updated glossary from the team.
  // ----------------------------------------------------------------

  // 접근성 판정 — the glossary's fuller judgement phrasing (distinct from
  // VERDICT.*.shortLabel above; use this set where a screen needs the
  // longer phrase instead of the short pill label).
  var GLOSSARY_ACCESSIBILITY_JUDGEMENT = {
    fullyAccessible: "Fully Accessible",
    cautionNeededPartiallyAccessible: "Caution Needed / Partially Accessible",
    difficultNotAccessible: "Difficult / Not Accessible",
    notSurveyed: "Not Surveyed",
  };

  // 이동 & 단차
  var GLOSSARY_MOVEMENT = {
    stepFreeAccess: "Step-Free Access",
    rampAccess: "Ramp Access",
    elevatorsOnAllFloors: "Elevators on All Floors",
    elevators: "Elevators",
    wheelchairLift: "Wheelchair Lift",
  };

  // 대여 & 편의시설
  var GLOSSARY_RENTAL_AMENITIES = {
    wheelchairRental: "Wheelchair Rental",
    strollerRental: "Stroller Rental",
    strollerAndWheelchairRental: "Stroller & Wheelchair Rental",
    wheelchairChargingStation: "Wheelchair Charging Station",
    accessibleRestrooms: "Accessible Restrooms",
    nursingRoom: "Nursing Room",
    diaperChangingStation: "Diaper Changing Station",
    nursingAndDiaperChangingRoom: "Nursing & Diaper Changing Room",
    accessibleParking: "Accessible Parking",
    priorityTicketing: "Priority Ticketing",
    serviceAnimalsWelcome: "Service Animals Welcome",
    signLanguageVideoGuide: "Sign Language Video Guide",
    brailleAndAudioGuide: "Braille & Audio Guide",
  };

  // 메인 카테고리 — already used verbatim in FilterBar.tsx; confirmed match.
  var GLOSSARY_MAIN_CATEGORIES = {
    artsAndCulture: "Arts & Culture",
    historyAndHeritage: "History & Heritage",
    natureAndLeisure: "Nature & Leisure",
    shoppingAndEntertainment: "Shopping & Entertainment",
  };

  // 탐색 태그 — grouped by the glossary's own section headers.
  var GLOSSARY_EXPLORE_TAGS = {
    artsAndCulture: [
      "#ContemporaryArt",
      "#ArtGallery",
      "#MediaArt",
      "#ModernArchitecture",
      "#FreeEntry",
    ],
    history: [
      "#RoyalPalace",
      "#Museum",
      "#NationalMuseum",
      "#CulturalHeritage",
      "#History",
      "#KoreanHistory",
      "#WarHistory",
      "#TraditionalLife",
      "#KingSejong",
      "#Hanbok",
    ],
    natureAndLeisure: [
      "#SeoulLandmark",
      "#HeartOfSeoul",
      "#CityWalk",
      "#CityPark",
      "#FamilyPark / #FamilyTrip",
      "#HangangPark",
      "#RiversideWalk / #Riverside",
      "#PicnicSpot",
      "#NightView",
      "#SunsetSpot",
      "#GardenWalk",
    ],
    shoppingAndLeisure: [
      "#ShoppingMall",
      "#DiningAndShopping",
      "#IndoorLeisure",
      "#NewSpot",
    ],
  };

  // ----------------------------------------------------------------
  // 3. Terms not in the glossary — confirmed as-is with the team,
  //    matching what's already shipped in the codebase.
  // ----------------------------------------------------------------

  var BRAND = {
    slogan: "Always, AllWays.",
    // Confirmed unified — LandingPage used "AllWays logo", site-footer
    // used "AllWays"; standardizing on the more descriptive one.
    logoAlt: "AllWays logo",
  };

  // Rotating landing-page greeting — "Welcome" in ~10 languages, kept in
  // Latin/romanized script so all on-screen text stays English/Latin.
  var GREETINGS = [
    "Welcome",
    "Bienvenue",
    "Bienvenido",
    "Benvenuto",
    "Willkommen",
    "Bem-vindo",
    "Youkoso",
    "Huanying",
    "Hwanyeong",
    "Swagat",
  ];

  var BUTTONS = {
    signInWithGoogle: "Sign in with Google",
    tryAgain: "Try Again",
    clearAll: "Clear All",
    clearDate: "Clear date",
  };

  var ARIA_LABELS = {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    removeFilter: "Remove filter",
    clearSearch: "Clear search",
    searchDestinations: "Search destinations",
  };

  var ERROR_SCREEN = {
    title: "Something went wrong",
    description: "Please try again in a moment.",
    buttonLabel: "Try Again", // same value as BUTTONS.tryAgain
  };

  var EMPTY_STATES = {
    noFiltersApplied: "No filters applied",
    joinedStatsPlaceholder: "n people around the world have joined.", // "n" until real signup count is confirmed
  };

  var ACCESSIBILITY_GUIDE = {
    pageTitle: "Accessibility Rating Guide",
    subtitle: "See exactly why a place is rated All-Way, Step-Way, or Re-Way.",
    criteria: {
      threshold: "Entrance & Floor Threshold",
      slope: "Ramp Slope",
      passageWidth: "Passage Width",
      door: "Door Type & Space",
      turningSpace: "Turning Space",
      restroom: "Accessible Restroom",
    },
  };

  var FOOTER = {
    team: "Team Ctrl+K",
    event: "2026 KF Digital Public Diplomacy Academy",
    date: "Data surveyed Aug 2026",
  };

  var SEARCH = {
    placeholder: "Search destinations or tags…",
  };

  var DATE_PICKER = {
    selectDate: "Select a date",
    monthNames: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    weekdayHeaders: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  };

  // ----------------------------------------------------------------
  // 4. Still open — flagged, not yet confirmed. Do not use in a shipped
  //    screen until 명진 confirms and moves these into a section above.
  // ----------------------------------------------------------------
  var NEEDS_CONFIRMATION = {
    // Navigation/Tabs: no nav/tab component exists in the repo yet.
    // Subway information: no subway-related screen/copy exists yet.
    // Place/Facility detail screen: GLOSSARY_MOVEMENT and
    //   GLOSSARY_RENTAL_AMENITIES above are confirmed terms, but no
    //   screen in the repo consumes them yet — whoever builds that
    //   screen should pull from those objects rather than retranslating.
  };

  var CommonUIText = {
    VERDICT: VERDICT,
    GLOSSARY_ACCESSIBILITY_JUDGEMENT: GLOSSARY_ACCESSIBILITY_JUDGEMENT,
    GLOSSARY_MOVEMENT: GLOSSARY_MOVEMENT,
    GLOSSARY_RENTAL_AMENITIES: GLOSSARY_RENTAL_AMENITIES,
    GLOSSARY_MAIN_CATEGORIES: GLOSSARY_MAIN_CATEGORIES,
    GLOSSARY_EXPLORE_TAGS: GLOSSARY_EXPLORE_TAGS,
    BRAND: BRAND,
    GREETINGS: GREETINGS,
    BUTTONS: BUTTONS,
    ARIA_LABELS: ARIA_LABELS,
    ERROR_SCREEN: ERROR_SCREEN,
    EMPTY_STATES: EMPTY_STATES,
    ACCESSIBILITY_GUIDE: ACCESSIBILITY_GUIDE,
    FOOTER: FOOTER,
    SEARCH: SEARCH,
    DATE_PICKER: DATE_PICKER,
    NEEDS_CONFIRMATION: NEEDS_CONFIRMATION,
  };

  global.CommonUIText = CommonUIText;

  // Also export for CommonJS/bundler contexts, without disturbing the
  // plain-<script> global usage above.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CommonUIText;
  }
})(typeof window !== "undefined" ? window : this);
