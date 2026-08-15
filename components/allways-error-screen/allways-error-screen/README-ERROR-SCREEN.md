# AllWays — Common Error Screen

이 폴더는 **공통 에러 상태 화면** 담당 파일만 포함합니다. 다른 팀원의 파일
(`LandingPage`, `FilterBar`, `verdict-badge` 등)은 전혀 열람·수정하지
않았습니다.

## 왜 "페이지"가 아니라 "컴포넌트"로 만들었나

이 저장소는 `app/`·`pages/` 폴더 없이 `components/` 폴더 아래 각자 담당
파일을 두는 방식으로 진행 중이어서(`LandingPage`, `verdict-badge` 등과
동일), 이 화면도 같은 방식으로 재사용 가능한 하나의 React 컴포넌트
(`<ErrorScreen />`)로 만들었습니다.

```tsx
import ErrorScreen from '../components/ErrorScreen/ErrorScreen';

export default function GlobalError() {
  return <ErrorScreen />;
}
```

## 파일 구성

```
components/ErrorScreen/
  ErrorScreen.tsx            공통 에러 화면 컴포넌트
  ErrorScreen.module.css     스타일 (CSS Module)
  fonts/                     APHont 폰트 (Regular, Bold / woff2, next/font/local 용)
  assets/allways-logo.png    확정 로고 (랜딩페이지와 동일 파일)
```

이 `components/ErrorScreen/` 폴더 하나를 저장소의 `components/` 폴더
안에 그대로 넣으시면 됩니다.

## 디자인 근거

- **톤앤매너**: 현재 `LandingPage`와 동일한 배경(Cool White `#F0F2F5`),
  동일한 fade-in 애니메이션 패턴, 동일한 로고 자산을 사용해 톤을
  맞췄습니다.
- **1440px 데스크톱 기준**, 카드/그라데이션/장식 요소 없이 로고 +
  제목 + 설명 + 버튼 하나로만 구성했습니다.
- **컬러**: 제목은 중립 다크(`#101828`), 설명은 랜딩페이지의 인사말과
  동일한 뮤트 그레이(`#5B6472`), 버튼은 Primary Blue(`#0046FF`) 배경에
  화이트 텍스트, 포커스 아웃라인은 Accent Orange(`#FF8040`)로
  랜딩페이지의 포커스 스타일과 동일하게 맞췄습니다.
- **문구는 전부 영어**: "Something went wrong" / "Please try again in
  a moment." / "Try Again".

## 재사용성

이 컴포넌트는 특정 404 페이지 전용이 아니라 **로딩 실패, 네트워크 에러
등 모든 "무언가 잘못됐을 때" 상태에서 공통으로 쓸 수 있는 화면**입니다.
필요하면 아래처럼 문구나 재시도 동작을 오버라이드할 수 있고, props를
넘기지 않으면 확정된 기본 문구/동작(페이지 새로고침)이 그대로
사용됩니다.

```tsx
<ErrorScreen
  title="Custom title"
  description="Custom description"
  buttonLabel="Retry"
  onRetry={() => refetch()}
/>
```

## 확인 필요 사항

- 로고는 `LandingPage`와 동일한 파일(`allways-logo.png`)을 이 폴더
  안에 복사해 넣었습니다 (다른 컴포넌트 폴더를 import하지 않고 각
  컴포넌트가 자기 자산을 갖는 기존 패턴을 따름).
- 버튼 클릭 시 별도의 `onRetry`를 넘기지 않으면 `window.location.reload()`
  로 동작합니다. 실제 API 재요청 등 구체적인 재시도 로직이 필요하면
  이 화면을 사용하는 쪽에서 `onRetry` prop만 넘기면 됩니다 (이 파일은
  다시 수정할 필요 없음).
