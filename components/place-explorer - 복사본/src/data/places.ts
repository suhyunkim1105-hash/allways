/* =========================================================================
 * places.ts
 * -------------------------------------------------------------------------
 * Real place data from "Allways데이터시트_수정본 1.xlsx":
 *   region/category ← `places` sheet, 권역/유형 (added in this revision so
 *   FilterBar's Region/Category filters have real data to match against)
 *   name/keywords   ← `places` sheet, 장소명_영문/태그
 *   description     ← `places` sheet, 한줄설명_영문 (shown in PlaceMap's
 *                      InfoWindow beneath the place name)
 *   verdict         ← `survey` sheet, 판정 for the matching 대상_id
 *                     (초록→accessible, 노랑→caution, 빨강→difficult;
 *                      no survey row → not-surveyed, same rule as before)
 *   lat/lng         ← `places` sheet, 위도/경도
 *
 * `region`/`category` use the same value strings as FilterBar's
 * REGION_OPTIONS/CATEGORY_OPTIONS (`gwanghwamun`/`yongsan`,
 * `history`/`arts`/`nature`/`shopping`), so they can be passed straight
 * into a `MatchableItem` with no extra translation. See
 * `toMatchableItem()` in App.tsx for the one translation that IS still
 * needed: verdict's `not-surveyed` (PlaceItem/verdict-badge spelling)
 * vs FilterBar's `unsurveyed`.
 * =======================================================================*/

import type { PlaceItem } from '../components/PlaceListPanel';

export type Region = 'gwanghwamun' | 'yongsan';
export type Category = 'history' | 'arts' | 'nature' | 'shopping';

export interface AppPlace extends PlaceItem {
  region: Region;
  category: Category;
}

export const PLACES: AppPlace[] = [
  {
    id: "GH01",
    name: "Seoul Museum of Art (SeMA)",
    description: "Seoul's top public art museum, featuring modern architecture and diverse contemporary art exhibitions.",
    region: "gwanghwamun",
    category: "arts",
    verdict: "accessible",
    lat: 37.5640625,
    lng: 126.9738125,
    keywords: ["#ContemporaryArt", "#ArtGallery", "#FreeEntry"],
  },
  {
    id: "GH02",
    name: "Deoksugung",
    description: "A historic royal palace in central Seoul where Korean imperial history meets traditional and modern architecture.",
    region: "gwanghwamun",
    category: "history",
    verdict: "accessible",
    lat: 37.5658862,
    lng: 126.9749017,
    keywords: ["#RoyalPalace", "#History"],
  },
  {
    id: "GH03",
    name: "Cheonggye Plaza",
    description: "An open public plaza at the start of Cheonggyecheon Stream, perfect for relaxing and events.",
    region: "gwanghwamun",
    category: "nature",
    verdict: "caution",
    lat: 37.5690744,
    lng: 126.9775921,
    keywords: ["#CityWalk", "#Riverside"],
  },
  {
    id: "GH05",
    name: "Garden of Gratitude",
    description: "A light monument honoring the UN nations that protected Korea, sharing messages of peace and gratitude.",
    region: "gwanghwamun",
    category: "arts",
    verdict: "difficult",
    lat: 37.5732978,
    lng: 126.9764085,
    keywords: ["#NewSpot", "#MediaArt", "#CityPark"],
  },
  {
    id: "GH06",
    name: "National Museum of Korean Contemporary History",
    description: "A national museum displaying exhibitions on South Korea's modern and contemporary history.",
    region: "gwanghwamun",
    category: "history",
    verdict: "accessible",
    lat: 37.5739432,
    lng: 126.9779299,
    keywords: ["#History", "#Museum"],
  },
  {
    id: "GH07",
    name: "National Palace Museum of Korea",
    description: "A museum showcasing Joseon royal court culture with rich exhibits and interactive experiences.",
    region: "gwanghwamun",
    category: "history",
    verdict: "accessible",
    lat: 37.5766084,
    lng: 126.974951,
    keywords: ["#RoyalPalace", "#Museum"],
  },
  {
    id: "GH08",
    name: "Gyeongbokgung Palace",
    description: "The main palace of the Joseon Dynasty, representing Korean history and cultural identity.",
    region: "gwanghwamun",
    category: "history",
    verdict: "caution",
    lat: 37.579617,
    lng: 126.977041,
    keywords: ["#RoyalPalace", "#History", "#Hanbok"],
  },
  {
    id: "GH09",
    name: "National Folk Museum of Korea",
    description: "A traditional culture museum offering a look into Korea's rich folk heritage.",
    region: "gwanghwamun",
    category: "history",
    verdict: "accessible",
    lat: 37.5816456,
    lng: 126.9789948,
    keywords: ["#TraditionalLife", "#Museum"],
  },
  {
    id: "GH10",
    name: "National Museum of Modern and Contemporary Art",
    description: "A leading art museum in quiet Samcheong-dong, featuring contemporary art, architecture, and beautiful spaces.",
    region: "gwanghwamun",
    category: "arts",
    verdict: "accessible",
    lat: 37.5788333,
    lng: 126.9804281,
    keywords: ["#ContemporaryArt", "#ArtGallery"],
  },
  {
    id: "GH04",
    name: "Gwanghwamun Square",
    description: "Seoul's main public plaza connecting historical landmarks with the everyday life of citizens.",
    region: "gwanghwamun",
    category: "history",
    verdict: "accessible",
    lat: 37.572389,
    lng: 126.9769117,
    keywords: ["#KingSejong", "#HeartOfSeoul", "#CityWalk"],
  },
  {
    id: "YS01",
    name: "The War Memorial of Korea",
    description: "A history museum exploring Korea's wartime history and the value of peace.",
    region: "yongsan",
    category: "history",
    verdict: "caution",
    lat: 37.5366131,
    lng: 126.9771068,
    keywords: ["#WarHistory", "#KoreanHistory", "#Museum"],
  },
  {
    id: "YS02",
    name: "IPARK Mall Yongsan Branch",
    description: "A trendy cultural complex combining shopping, dining, and leisure in one place.",
    region: "yongsan",
    category: "shopping",
    verdict: "accessible",
    lat: 37.52939,
    lng: 126.9650925,
    keywords: ["#ShoppingMall", "#DiningAndShopping", "#IndoorLeisure"],
  },
  {
    id: "YS03",
    name: "Amorepacific Museum of Art",
    description: "An art museum with a white porcelain-inspired building, featuring traditional and contemporary Korean art.",
    region: "yongsan",
    category: "arts",
    verdict: "not-surveyed",
    lat: 37.528786,
    lng: 126.968395,
    keywords: ["#ContemporaryArt", "#ModernArchitecture", "#ArtGallery"],
  },
  {
    id: "YS04",
    name: "Yongsan Family Park",
    description: "A peaceful city park featuring wide lawns, a scenic pond, and a relaxing atmosphere.",
    region: "yongsan",
    category: "nature",
    verdict: "difficult",
    lat: 37.5211389,
    lng: 126.9839378,
    keywords: ["#CityPark", "#CityWalk", "#FamilyPark"],
  },
  {
    id: "YS05",
    name: "Yongsan Children's Garden",
    description: "A charming garden featuring themed botanical areas and open green lawns.",
    region: "yongsan",
    category: "nature",
    verdict: "caution",
    lat: 37.5277404,
    lng: 126.9706923,
    keywords: ["#GardenWalk", "#FamilyTrip", "#CityPark"],
  },
  {
    id: "YS06",
    name: "National Museum of Korea",
    description: "Korea's main national museum, featuring a huge collection of cultural heritage and diverse exhibitions.",
    region: "yongsan",
    category: "arts",
    verdict: "accessible",
    lat: 37.5238506,
    lng: 126.9804702,
    keywords: ["#History", "#CulturalHeritage", "#NationalMuseum"],
  },
  {
    id: "YS07",
    name: "Seoul Hyochang Park",
    description: "A historic cultural park honoring the history of Korea's independence movement.",
    region: "yongsan",
    category: "nature",
    verdict: "not-surveyed",
    lat: 37.5450482,
    lng: 126.9603142,
    keywords: ["#History", "#CityPark"],
  },
  {
    id: "YS08",
    name: "N Seoul Tower",
    description: "A famous landmark on Namsan Mountain with panoramic views of the Seoul skyline.",
    region: "yongsan",
    category: "nature",
    verdict: "not-surveyed",
    lat: 37.5511694,
    lng: 126.9882266,
    keywords: ["#SeoulLandmark", "#NightView"],
  },
  {
    id: "YS09",
    name: "Nodeul Island",
    description: "A cultural complex on the Han River, combining music, nature, and relaxation.",
    region: "yongsan",
    category: "nature",
    verdict: "not-surveyed",
    lat: 37.5177627,
    lng: 126.9596671,
    keywords: ["#SunsetSpot", "#Riverside"],
  },
  {
    id: "YS10",
    name: "Leeum Museum of Art",
    description: "An art museum designed by famous architects, displaying traditional and contemporary Korean art.",
    region: "yongsan",
    category: "arts",
    verdict: "not-surveyed",
    lat: 37.5379389,
    lng: 126.9992749,
    keywords: ["#ContemporaryArt", "#ArtGallery"],
  },
  {
    id: "YS11",
    name: "Ichon Hangang Park",
    description: "A riverside park along the Han River, ideal for walks and outdoor activities.",
    region: "yongsan",
    category: "nature",
    verdict: "not-surveyed",
    lat: 37.5169202,
    lng: 126.9717022,
    keywords: ["#HangangPark", "#PicnicSpot", "#RiversideWalk"],
  },
];
