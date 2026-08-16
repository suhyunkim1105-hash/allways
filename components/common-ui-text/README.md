# AllWays — Common UI Text

이 폴더는 **공통 영문 UI 문구**만 담당합니다. 다른 팀원의 파일
(`FilterBar.tsx` 등)은 전혀 수정하지 않았고, 문구만 확인해서 아래에
반영했습니다.

## 왜 만들었나

화면마다 같은 개념(판정 배지, 에러 메시지, 푸터 정보 등)에 대해 각자
다른 영문 표현을 쓰고 있어서, 하나의 기준 파일로 모았습니다. 새 화면을
만들 때는 여기서 문구를 가져다 쓰고, 없는 문구는 임의로 만들지 말고
이 파일에 먼저 추가해달라고 요청해주세요.

## 파일 구성

```
components/common-ui-text/
  common-ui-text.js         plain <script> 포함용 (verdict-badge.js와 동일 패턴)
  common-ui-text.ts         Next.js/TSX import용 (verdictBadgePort.tsx와 동일 패턴)
  glossary/
    판정_필터_키워드 용어영문모음.xlsx   원본 용어집 (수정 없이 그대로 보관)
    GLOSSARY.md              위 xlsx를 저장소에 정식 반영한 표 (56개 항목)
  README.md                  이 문서
```

`common-ui-text.js`와 `common-ui-text.ts`는 내용이 100% 동일해야 합니다 —
하나를 고치면 다른 하나도 같이 고쳐주세요.

## 우선순위 기준

1. `glossary/GLOSSARY.md` (= `glossary/판정_필터_키워드 용어영문모음.xlsx`
   원본) 의 "표준 영문 표기" — `common-ui-text.*`의 `GLOSSARY_*` 로 시작하는
   값들은 전부 이 용어집 원문 그대로이며, 임의로 수정하지 않았습니다.
   용어집이 갱신되면 `GLOSSARY.md`와 `GLOSSARY_*` 값을 함께 갱신하세요
   (자세한 절차는 `glossary/GLOSSARY.md` 맨 아래 참고).
2. 용어집에 없는 표현(판정 배지 짧은 라벨, 인사말, 에러 화면 문구, 푸터
   정보 등)은 2026-08-15 검토에서 팀과 함께 확정한 값입니다.

## 이번 검토에서 확정한 주요 결정 사항

- **`All-Way` / `Step-Way` / `Re-Way`**: 용어집에는 없지만, 판정 배지의
  공식 짧은 표기로 별도 승인했습니다 (용어집의 긴 판정 문구는
  `GLOSSARY_ACCESSIBILITY_JUDGEMENT`로 그대로 남겨뒀습니다 — 짧은
  라벨이 필요 없는 화면에서는 이쪽을 쓰면 됩니다).
- **툴팁 문구는 두 버전을 각각 용도별로 확정**: `verdict-badge.js`의
  짧은 버전(`VERDICT.*.tooltip`)은 일반 배지용, `FilterBar.tsx`의 긴
  버전(`VERDICT.*.filterTooltip`, 원래 "placeholder"라고 주석 표시돼
  있던 문구)은 필터 등 상세 설명이 필요한 곳에 쓰는 것으로 각각 공식
  확정했습니다. 하나로 통일하지 않았습니다.
- **`Not Surveyed`**: 대문자를 살리는 것으로 확정했습니다 (용어집 원문과
  일치, 나머지 세 라벨의 타이틀 케이스와도 통일). 다만 현재
  `verdict-badge.js`(명진 소유)와 `FilterBar.tsx`(yiryeong 소유) 코드는
  둘 다 소문자 `Not surveyed`로 남아있습니다 — 각자 담당 파일에서
  업데이트해주세요.
- **로고 alt 텍스트**: `LandingPage`의 `"AllWays logo"`로 통일했습니다
  (기존에 `site-footer` 쪽은 `"AllWays"`만 쓰고 있었습니다).
- 그 외 용어집에 없던 나머지 문구(인사말, 에러 화면, 푸터 정보, 검색창
  placeholder, 빈 상태 문구 등)는 현재 코드에 이미 반영된 그대로
  공식 확정했습니다.

## 아직 확인 필요 (`NEEDS_CONFIRMATION`)

- **Navigation / Tabs**: 저장소에 아직 구현된 화면이 없습니다.
- **Subway information**: 저장소에 아직 구현된 화면이 없습니다.
- **Place details / Facility information**: `GLOSSARY_MOVEMENT`,
  `GLOSSARY_RENTAL_AMENITIES`는 용어집 기준으로 이미 확정돼 있지만,
  이 문구들을 실제로 쓰는 화면이 아직 없습니다. 나중에 해당 화면을
  만들 때 새로 번역하지 말고 이 값을 그대로 가져다 쓰면 됩니다.

이 두 항목이 실제 화면으로 구현되면 이 README와 `NEEDS_CONFIRMATION`
객체를 업데이트해주세요.
