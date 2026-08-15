# AllWays — 메타태그 & 파비콘 (2026-08-15)

`suhyunkim1105-hash/allways` 저장소의 `Myoungjin` 브랜치 `index.html`에 메타태그와 파비콘을 추가한
결과물입니다. GitHub 쓰기 권한이 없어 직접 push하지 못해 파일로 전달합니다 — 아래 파일을
`Myoungjin` 브랜치 루트에 그대로 추가/교체해주세요.

## 포함된 파일

```
index.html                                  루트 index.html 교체본 (head에 메타태그 + 파비콘 링크 추가)
favicon.ico                                  16/32/48px 통합 (구형 브라우저 fallback)
site.webmanifest                             PWA/안드로이드 홈 화면용
assets/favicon/favicon.svg                   벡터 원본 (최신 브라우저 탭 아이콘)
assets/favicon/favicon-16x16.png
assets/favicon/favicon-32x32.png
assets/favicon/apple-touch-icon.png          180×180, iOS 홈 화면
assets/favicon/android-chrome-192x192.png
assets/favicon/android-chrome-512x512.png
```

`index.html`은 기존 파일 전체를 기준으로 `<head>`에만 태그를 추가한 것이라, 그대로 덮어써도
기존 hero/footer/스크립트 내용은 그대로입니다. 병합 전 diff로 한번 확인해주세요.

## 파비콘 디자인

로고(`assets/allways-logo.png`)의 **"Ways"의 "a" 안에 있는 바퀴살(휠체어 바퀴 모티프)**을
그대로 가져와 단독 아이콘으로 다시 그렸습니다: 흰 배경 위에 브랜드 블루(`#0046FF`) 원형 링 +
안쪽 브랜드 오렌지(`#FF8040`) 8-스포크 바퀴. 로고를 그대로 잘라 쓰지 않고 벡터로 재작도한
이유는 16px 같은 작은 탭 아이콘 크기에서도 깨끗하게 보이게 하기 위함입니다 (원본 PNG를 그대로
축소하면 안티앨리어싱 때문에 흐려짐).

`assets/favicon/favicon.svg`가 원본 벡터이므로, 굵기/색 등을 나중에 조정하고 싶으면 이 파일만
고치고 나머지 PNG들을 재생성하면 됩니다.

## 메타태그 내용

- `<title>` / `og:title` / `twitter:title`: 기존 그대로 `AllWays — Always, AllWays.`
- `description` / `og:description` / `twitter:description`: 슬로건 그대로 **`Always, AllWays.`**
  (요청하신 대로 슬로건을 그대로 사용)
- `og:image` / `twitter:image`: 기존 로고 파일(`assets/allways-logo.png`) 재사용 — 별도 소셜
  공유용 배너 이미지는 아직 없어서 새로 만들지 않고 기존 확정 자산만 사용했습니다.
- `theme-color`: `#0046FF` (브랜드 프라이머리 블루)

## 확인이 필요한 부분

- `og:image`, `twitter:image`, 아이콘 경로들은 전부 루트 기준 절대경로(`/...`)로 넣었습니다.
  배포 시 서브경로(예: `/allways/`)를 쓰는 경우 경로를 맞춰주세요.
- 소셜 공유 미리보기용 1200×630 전용 배너 이미지는 이번 작업 범위 밖이라 만들지 않았습니다.
  필요하면 별도로 요청해주세요.
