# AllWays — Confirmed Glossary (판정_필터_키워드 용어영문모음)

이 문서는 첨부받은 `판정_필터_키워드 용어영문모음.xlsx`를 저장소에 정식으로 반영한 버전입니다.
**원본 xlsx가 1차 기준(source of truth)이며, 이 표는 그 내용을 그대로 옮긴 것입니다 — 값을 임의로 수정하지 않았습니다.**
코드에서 쓸 때는 이 표를 다시 옮겨적지 말고 `../common-ui-text.js` / `../common-ui-text.ts`의 `GLOSSARY_*` 객체를 import해서 쓰세요 (아래 값과 100% 동일합니다).

| 구분 | 국문 키워드 | 표준 영문 표기 |
|---|---|---|
| 접근성 판정 | 전체 접근 가능 | Fully Accessible |
|  | 부분 접근 가능 / 주의 필요 | Caution Needed / Partially Accessible |
|  | 접근 불가 / 휠체어 제한 | Difficult / Not Accessible |
|  | 조사 전 / 정보 없음 | Not Surveyed |
| 이동 & 단차 | 단차 없음 (평지 진입) | Step-Free Access |
|  | 경사로 진입 / 완비 | Ramp Access |
|  | 전 층 엘리베이터 운행 | Elevators on All Floors |
|  | 엘리베이터 | Elevators |
|  | 휠체어 리프트 | Wheelchair Lift |
| 대여 & 편의시설 | 휠체어 대여 | Wheelchair Rental |
|  | 유모차 대여 | Stroller Rental |
|  | 유모차 & 휠체어 대여 | Stroller & Wheelchair Rental |
|  | 전동휠체어 급속충전기 | Wheelchair Charging Station |
|  | 장애인 화장실 | Accessible Restrooms |
|  | 수유실 | Nursing Room |
|  | 기저귀 교환대 | Diaper Changing Station |
|  | 수유실 및 기저귀 교환실 | Nursing & Diaper Changing Room |
|  | 장애인 전용 주차구역 | Accessible Parking |
|  | 우선 매표 / 패스트트랙 | Priority Ticketing |
|  | 안내견 동반 가능 | Service Animals Welcome |
|  | 수어 영상 가이드 | Sign Language Video Guide |
|  | 점자 및 오디오 가이드 | Braille & Audio Guide |
| 메인 카테고리 | 예술 · 문화 | Arts & Culture |
|  | 역사 · 유적 | History & Heritage |
|  | 자연 · 힐링 | Nature & Leisure |
|  | 쇼핑 · 엔터테인먼트 | Shopping & Entertainment |
| 탐색 태그 (Art & Culture) | 현대미술 | #ContemporaryArt |
|  | 미술관 / 갤러리 | #ArtGallery |
|  | 미디어아트 | #MediaArt |
|  | 현대건축 | #ModernArchitecture |
|  | 무료입장 | #FreeEntry |
| 탐색 태그 (History) | 고궁 / 궁궐 | #RoyalPalace |
|  | 박물관 | #Museum |
|  | 국립박물관 | #NationalMuseum |
|  | 문화유산 | #CulturalHeritage |
|  | 역사 | #History |
|  | 한국사 | #KoreanHistory |
|  | 전쟁역사 | #WarHistory |
|  | 전통생활사 | #TraditionalLife |
|  | 세종대왕 | #KingSejong |
|  | 한복체험 | #Hanbok |
| 탐색 태그 (Nature & Leisure) | 서울랜드마크 | #SeoulLandmark |
|  | 서울도심 | #HeartOfSeoul |
|  | 도심산책 | #CityWalk |
|  | 도심공원 | #CityPark |
|  | 가족나들이 | #FamilyPark / #FamilyTrip |
|  | 한강공원 | #HangangPark |
|  | 수변산책로 | #RiversideWalk / #Riverside |
|  | 피크닉 | #PicnicSpot |
|  | 야경명소 | #NightView |
|  | 일몰명소 / 노을 | #SunsetSpot |
|  | 정원산책 | #GardenWalk |
| 탐색 태그 (Shopping & Leisure) | 복합쇼핑몰 | #ShoppingMall |
|  | 쇼핑과 식음 | #DiningAndShopping |
|  | 실내여가 | #IndoorLeisure |
|  | 신규명소 / 핫플 | #NewSpot |

## 총 항목 수
56개 (그룹 8개)

## 갱신 방법
용어집이 바뀌면:
1. 이 `GLOSSARY.md` 표를 새 xlsx 내용으로 갱신하고,
2. `../common-ui-text.js`와 `../common-ui-text.ts`의 `GLOSSARY_*` 값도 같은 내용으로 갱신한 뒤,
3. 저장소에 커밋하세요. (두 군데가 항상 같은 내용이어야 합니다.)