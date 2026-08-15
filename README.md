# AllWays — Landing Page (First Screen)

이 폴더는 랜딩페이지(첫 화면) 담당 파일만 포함합니다. `landingpage-filtering.component`는
포함되어 있지 않고, 수정하지도 않았습니다.

## 파일 구성

```
index.html                 첫 화면 마크업
styles.css                 스타일 (색상 토큰, 폰트, 애니메이션)
script.js                  인사말 순환 로직 + Start 버튼 연결 훅
assets/allways-logo.png             로고 (배경만 투명 처리, 로고 자체 디자인은 무수정)
assets/allways-logo-original.png    첨부해주신 원본 PNG (배경 옅은 흰색, 백업용 보관)
assets/fonts/                       첨부해주신 APHont 폰트 (ttf 원본 + woff2 변환본)
components/site-footer/             전 화면 공통 하단 푸터 (아래 "하단 공통 푸터" 참고)
```

## 하단 공통 푸터 (Footer)

전 화면 하단에 공통으로 들어가는 띠: 로고 · 슬로건 · 정보 라인(팀명 · KF 행사명 ·
데이터 기준일). 이번 랜딩페이지(`index.html`)에 우선 적용했고, 재사용 가능한
버전은 `components/site-footer/`에 따로 뒀습니다 (다른 화면 담당자가 그대로
가져다 쓸 수 있도록 `verdict-badge` 컴포넌트와 동일한 구성 — `.css` + `.js` +
단독 데모 html).

- 로고: 기존 `assets/allways-logo.png`(투명 배경) 그대로 재사용, 무수정.
- 슬로건: 랜딩페이지와 동일하게 "Always, AllWays." (컬러도 Primary Blue
  `#0046FF`로 동일하게 맞춤).
- 정보 라인: `Team Ctrl+K · 2026 KF Digital Public Diplomacy Academy ·
  Data surveyed Aug 2026`. 값이 없는 화면에서는 `SiteFooter.render()`가
  임의로 값을 지어내지 않고 `—`로 표시합니다 (verdict-badge의 "never
  fabricate" 규칙과 동일).
- 미리보기: `components/site-footer/site-footer-demo.html`을 브라우저로
  열면 정적 마크업 / JS 렌더 / `<site-footer>` 커스텀 엘리먼트 세 가지
  사용 방식을 모두 확인할 수 있습니다.

## 적용한 디자인 값

- Desktop 1440px 기준
- Background `#F0F2F5`, Primary Blue `#0046FF`, Accent Orange `#FF8040`
- Font: APHont (첨부 파일 그대로 사용, Regular/Bold/Italic/BoldItalic 전부 포함)
- 로고: 로고 자체(글자/도형/색상)는 전혀 손대지 않았고, 요청에 따라 배경만
  페이지 배경(`#F0F2F5`)과 자연스럽게 어울리도록 투명 처리했습니다. 기존
  옅은 흰색 배경 원본은 `assets/allways-logo-original.png`로 남겨두었습니다.
  1440px 기준 표시 크기는 520px로 확대했습니다. 또한 원본 PNG 캔버스에
  로고 글자 주위로 넓은 투명 여백이 있어서(위/아래로 캔버스의 26~34%),
  슬로건을 로고 바로 밑에 붙이려 해도 CSS margin만으로는 그 투명 여백
  때문에 실제로는 안 붙어 보였습니다. 그래서 로고 디자인은 그대로 두고
  불필요한 투명 여백만 살짝 남기고 크롭했습니다(글자 픽셀 자체는 무수정).

## 인사말 순환 요소

"환영합니다 / Welcome" 기준으로, "Welcome"을 여러 나라 말로 라틴 문자(영어
알파벳) 표기로 순환 표시합니다 (Welcome, Bienvenue, Bienvenido, Benvenuto,
Willkommen, Bem-vindo, Youkoso, Huanying, Hwanyeong, Swagat). 화면 표시
문구는 모두 영어(라틴 문자)로 유지된다는 조건에 맞춘 목록이며, `script.js`
상단의 `GREETINGS` 배열만 수정하면 목록/순서를 바꿀 수 있습니다.

## Google 로그인 → landingpage-filtering.component 연결 (중요)

Start 버튼을 "Sign in with Google" 버튼으로 교체했습니다. 실제 Google
OAuth(Client ID 보유)까지 연결하기로 하셨는데, **실제 Client ID 값을 아직
받지 못해서 `script.js` 상단에 빈 값으로 TODO 표시만 해두었습니다.**

```js
// script.js
var GOOGLE_CLIENT_ID = ''; // TODO: 실제 Client ID로 교체
```

Client ID를 알려주시면 이 한 줄만 채워서 실제 로그인이 동작하도록 만들어
드리겠습니다. (배포 도메인을 Google Cloud Console의 "Authorized JavaScript
origins"에 등록하는 작업은 Google 계정 쪽 설정이라 제가 대신 해드릴 수는
없고, 팀에서 직접 등록하셔야 합니다.)

Client ID가 없는 지금 상태에서는 Google 공식 버튼과 동일한 모양의 대체
버튼(`#googleFallbackBtn`)이 대신 보이고, 클릭해도 아직 로그인은 되지
않습니다 (콘솔에 안내 로그만 출력).

로그인 성공 시 `landingpage-filtering.component`로 연결하는 방식은 이전과
동일하게, 경로/태그명을 임의로 추측해 넣지 않고 훅만 만들어 두었습니다.

1. 로그인 성공 시 `document`에 커스텀 이벤트 `allways:start`를 발생시키고,
   Google이 반환한 credential(ID 토큰)을 `event.detail.credential`에 담습니다.
   → `document.addEventListener('allways:start', fn)`으로 받으면 됩니다.
2. 전역 함수 `window.onAllWaysStart(credentialResponse)`가 정의되어 있으면
   그것도 호출합니다.

연결 방식(경로/URL/태그명)이 확정되면 이 두 훅 중 하나만
`landingpage-filtering.component` 쪽 파일에서 구현하시면 되고, 이 랜딩페이지
파일들은 다시 수정할 필요가 없습니다.

## 전 세계 가입자 수 문구

"n people around the world have joined." 문구를 CTA 버튼 아래 fade-in으로
넣었습니다. 실제 가입자 수 데이터가 없어서 `n`을 그대로 자리표시자로 두었고,
실제 숫자를 알려주시면 `index.html`의 `#statsText` 텍스트만 교체하면 됩니다.

## 참고사항

- 슬로건은 최종적으로 "Always, AllWays."로 표시됩니다 (title/meta/화면 h1 모두 반영).
- 인사말 텍스트 크기도 요청에 따라 확대했습니다 (20px → 32px, bold). 인사말
  목록/애니메이션 자체는 이전 상태 그대로 유지했습니다.
- 첫 화면 배경은 기존 Cool White(`#F0F2F5`) 그대로 유지했습니다 (파란
  배경으로 바꾸지 않음).

## Toss TDS / Apple HIG 참고 반영

공유해주신 두 디자인 시스템을 참고해서 세 가지를 반영했습니다.

- **슬로건 타이포그래피**: 토스 스타일의 크고 굵은 헤드라인 느낌으로
  40px→64px, letter-spacing -0.025em, line-height 1.12로 더 타이트하고
  임팩트 있게 조정했습니다. (로고-슬로건 간격은 이전 요청대로 붙어있는
  상태 유지)
- **여백/간격**: 애플 HIG의 "넉넉한 여백" 원칙에 맞춰 히어로 영역 상하
  패딩과 좌우 여백을 늘리고, 버튼의 세로 크기를 44pt 이상(48px)으로
  키워 터치 타겟 기준을 맞췄습니다.
- **버튼 누르기(press) 느낌**: Google 버튼의 색상 자체는 가이드라인상
  임의 변경할 수 없어 그대로 두되, hover/press 시 배경색을 급하게
  바꾸는 대신 얇은 dim 레이어가 살짝 씌워지듯 부드럽게 나타나고, 누르면
  버튼이 아주 살짝(0.98배) 눌리는 토스식 tactile feedback을 추가했습니다.

## 배경 지도/동선 요소

AllWays가 "경로/여정" 브랜드라는 점에 맞춰, 배경에 아주 희미한 지도
점 패턴과 점선 경로(동선) 2개, 경유지 점들을 SVG로 추가했습니다.
불투명도를 0.16~0.25 수준으로 낮게 잡아 로고/슬로건/버튼 등 실제
콘텐츠를 가리지 않도록 했고, 페이지 로드 시 은은하게 fade-in됩니다.
