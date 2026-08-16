// Display-language layer.
// appdata.json stays identical to the team DB (Korean field notes kept as recorded).
// Everything the user sees goes through here, so the DB stays auditable and the
// screen stays English-only. Add a key here — never edit the data file.

export const REGION_EN: Record<string, string> = {
  "광화문": "Gwanghwamun",
  "용산": "Yongsan",
};

export const COURSE_EN: Record<string, string> = {
  "광화문1코스": "Gwanghwamun Course 1",
  "광화문2코스": "Gwanghwamun Course 2",
  "용산코스": "Yongsan Course",
  "표시만": "Map only",
};

export const STATION_EN: Record<string, string> = {
  "시청역": "City Hall Stn.",
  "광화문역": "Gwanghwamun Stn.",
  "경복궁역": "Gyeongbokgung Stn.",
  "용산역": "Yongsan Stn.",
  "삼각지역": "Samgakji Stn.",
  "이촌역": "Ichon Stn.",
};

export const BF_GRADE_EN: Record<string, string> = {
  "최우수": "highest grade",
  "우수": "excellent grade",
};

export const SLOPE_CLASS_EN: Record<string, string> = {
  "가파름": "Steep",
  "보통": "Moderate",
  "완만함": "Gentle",
};

export const DOOR_EN: Record<string, string> = {
  "자동문": "Automatic",
  "상시개방": "Always open",
  "수동_레버": "Manual (lever)",
  // The sheet export escapes underscores; keep both spellings so a stray
  // backslash never silently turns into "Not surveyed" on screen.
  "수동\\_레버": "Manual (lever)",
  "수동\\_돌림": "Manual (knob)",
  "수동\\_여닫이문": "Manual (swing)",
  "수동_돌림": "Manual (knob)",
  "수동_여닫이문": "Manual (swing)",
  "회전문": "Revolving",
};

// "없음" = surveyed and confirmed absent. "해당 없음" = the item does not apply here.
// Neither means "not surveyed" — an empty cell means that.
export const NONE_EN: Record<string, string> = {
  "없음": "None",
  "해당 없음": "Not applicable",
  "해당없음": "Not applicable",
  "Y": "Yes",
  "N": "No",
  "좁음": "narrow",
  "보통": "average",
  "넓음": "wide",
};

export const RESTROOM_NOTE_EN: Record<string, string> = {
  "1층 로비 옆, 회전공간 충분": "Beside the 1F lobby; ample turning space",
  "1층(로비), 5층": "1F (lobby) and 5F",
  "1층, 지하1층에 장애인 화장실": "Accessible restrooms on 1F and B1",
  "2번 출구 인근 장애인화장실": "Accessible restroom near Exit 2",
  "3번 출구 인근 장애인화장실": "Accessible restroom near Exit 3",
  "4, 5번 출구 화장실": "Restrooms near Exits 4 and 5",
  "4곳, 내부가 좁아 주의 필요": "Four locations; interiors are tight, use with care",
  "9, 10번 출구 화장실": "Restrooms near Exits 9 and 10",
  "각 층 장애인화장실, 리빙파크 6층 수유실": "Accessible restroom on every floor; nursing room on Living Park 6F",
  "각층 장애인 화장실 2개씩 (1-3층)": "Two accessible restrooms per floor (1F–3F)",
  "광화문역 장애인화장실 이용": "Use the accessible restroom inside Gwanghwamun Station",
  "국립현대미술관 덕수궁 옆 화장실": "Restroom beside MMCA Deoksugung",
  "남자화장실 2층(로비), 여자화장실 1층·지하1층": "Men's on 2F (lobby); women's on 1F and B1",
  "대합실 장애인화장실": "Accessible restroom in the station concourse",
  "미술관 휴관으로 내부 미확인": "Museum closed for renovation — interior not verified",
  "장애인 화장실 (상시 개방)": "Accessible restroom, open at all times",
  "카페어울림, 잼잼카페 인근": "Near Cafe Eoullim and Jamjam Cafe",
};

export const HAZARD_EN: Record<string, string> = {
  "6호선 12번 출입구 엘리베이터 보수중": "Line 6 Exit 12 elevator is under repair",
  "근정전 전방 박석구간": "Rough stone paving in front of Geunjeongjeon Hall",
  "동선에서 단차1 : 2.5cm, 단차 2 : 5.3cm, 돌길 350-400m 존재(약 364m) 경사는 일부 구간만 가파름(약 30초~1분 정도의 거리)":
    "Two steps on the route (2.5 cm and 5.3 cm) and about 364 m of stone paving. The slope is steep only on a short stretch, roughly 30–60 seconds of travel",
  "마사토 산책로 다수, 그늘 부족": "Many decomposed-granite paths; little shade",
  "바닥 미세 틈 일부 구간": "Narrow surface gaps in some sections",
  "앞·뒤 진입로 모두 오르막길": "Both the front and rear approaches are uphill",
  "야외 전시장 일부 자갈 구간": "Gravel sections in part of the outdoor exhibition area",
  "자갈길 일부, 모래길 일부, 일부 건물 내부 진입불가(계단)":
    "Some gravel and sand paths; a few buildings cannot be entered (stairs only)",
  "지하 전시홀 계단(진입불가)": "The basement exhibition hall is reached by stairs only",
};

export const DETOUR_EN: Record<string, string> = {
  "4호선 1-2번 출구 엘리베이터로 우회": "Detour via the elevator at Line 4 Exits 1–2",
  "근정전 외 중앙 박석구간 → 가장자리 흙길로 우회 가능":
    "The central stone paving can be bypassed on the packed-earth path along the edge",
  "야외 전시장은 포장로로 우회 가능": "The outdoor exhibition area can be bypassed on the paved path",
  "없음(국중박 → 공원) 국중박 → 이촌역  → 공원으로 우회경로 찾아야됨":
    "No step-free link found yet between the museum and the park; a route via Ichon Station is still being surveyed",
  "주요 동선은 포장로 이용 가능": "The main route can be taken entirely on paved surfaces",
};

export const ROUTE_NOTE_EN: Record<string, string> = {
  "경복궁역 4번출구 근처 엘리베이터": "Elevator near Gyeongbokgung Station Exit 4",
  "광화문역 1번출구 근처 엘리베이터": "Elevator near Gwanghwamun Station Exit 1",
};

// Surveyor notes. Entries mapped to null are internal QA memos for the team and
// are never shown on screen.
export const SURVEY_NOTE_EN: Record<string, string | null> = {
  "2026-08-31까지 휴관, 외부만 측정": "Closed for renovation until 31 Aug 2026 — exterior measured only",
  "4-6호선 환승 무빙워크 있음": "A moving walkway links the Line 4 and Line 6 transfer",
  "경사 4도이지만 미세 구간이라 초록 판정": null,
  "경사 6도는 기준상 가파름이라 판정 빨강. 확인 필요": null,
  "근정전 올라가는 길은 전부 계단, 외부에서만 관람 가능":
    "The approach up to Geunjeongjeon Hall is all stairs; it can be viewed from outside only",
  "내부1호기 종각방향 / 내부2호기 서울역방향": "Inside elevator 1 serves the Jonggak side, elevator 2 the Seoul Station side",
  "시청 1호선 출발 경사01-03 / 시청 2호선 출발 경사04-07": null,
  "용산역 직결 통로 단차 없음": "The direct passage from Yongsan Station has no steps",
  "일부 구간 빨강 판정 (경사1~3)": null,
  "입장 시 신분증 확인, 보안 검색 있음": "Photo ID check and a security screening at entry",
  "지상 정원(감사의정원) 장소 등재 가능, 지하 전시홀(프리덤홀) 등재 불가능": null,
  "출입문 두 개": "Two entrance doors",
  "출입문 두 개. 1 수동(상시개방 여부 불확실) / 2 자동문. 손잡이 형태 확인 필요":
    "Two entrance doors — one manual, one automatic",
  "코레일 관할, 개찰구에서 아이파크몰까지 엘리베이터 연결":
    "Operated by KORAIL; an elevator connects the ticket gates to IPARK Mall",
  "휠체어 대여 안내데스크, 전층 엘리베이터": "Wheelchairs can be borrowed at the information desk; elevators on every floor",
};

/** Translate a stored value, or return null if it should not be shown. */
export function en(
  value: string | null | undefined,
  dict: Record<string, string | null> = {}
): string | null {
  if (value == null) return null;
  const v = value.trim();
  if (v === "") return null;
  if (v in dict) return dict[v];
  if (v in NONE_EN) return NONE_EN[v];
  // Anything already English passes through; anything Korean we have not mapped
  // is withheld rather than shown untranslated.
  return /[가-힣]/.test(v) ? null : v;
}

export const regionEn = (v: string) => REGION_EN[v] ?? v;
export const courseEn = (v: string) => COURSE_EN[v] ?? v;
export const placeNameEn = (ko: string, lookup: Record<string, string>) =>
  lookup[ko] ?? STATION_EN[ko] ?? ko;
