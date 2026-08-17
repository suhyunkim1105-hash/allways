# Place Explorer (demo)

세 컴포넌트를 한 페이지로 합친 데모 프로젝트입니다.

- `PlaceListPanel` — 왼쪽 고정 사이드바 (장소 목록)
- `PlaceMap` — 오른쪽 나머지 공간을 채우는 Google 지도 (신규 작성)
- `FilterBar` — 지도 위에 떠 있는 오버레이 필터 바
- `src/data/places.ts` — `Allways데이터시트_수정본 1.xlsx`에서 추출한 실제
  장소 데이터 (권역/카테고리 포함, 신규 작성)

## 실행 방법

```bash
npm install
cp .env.example .env
# .env 파일을 열어 VITE_GOOGLE_MAPS_API_KEY 값을 채워주세요
npm run dev
```

Google Maps API 키는 https://console.cloud.google.com/google/maps-apis 에서
"Maps JavaScript API"를 활성화한 뒤 발급받을 수 있습니다. 키가 없으면 지도
자리에 안내 문구가 대신 표시됩니다.

## 현재 연결 상태

- 목록 카드 클릭 ↔ 지도 마커 클릭: 서로 연동되어 같은 장소가 하이라이트/포커스됩니다.
- FilterBar의 Region/Category/Accessibility 필터 + 검색창: 이제 실제로 목록과
  지도를 함께 좁혀줍니다. 엑셀의 `places` 시트에 있는 권역/유형 컬럼을
  `src/data/places.ts`에서 FilterBar가 쓰는 값(`gwanghwamun`/`yongsan`,
  `history`/`arts`/`nature`/`shopping`)으로 매핑해뒀습니다.
- `PlaceListPanel`의 접기/펼치기 토글은 컴포넌트 내부 상태라서, 접었을 때
  지도 영역의 여백은 그대로 유지됩니다.

## 데이터 갱신 방법

`src/data/places.ts`는 업로드해주신 엑셀 파일에서 한 번 추출해 만든
정적 데이터입니다. 장소가 추가되거나 권역/카테고리/판정이 바뀌면 이
파일을 직접 수정하거나, 엑셀을 다시 주시면 같은 방식으로 재생성해
드릴 수 있어요.
