# AllWays — integrated app (1차 배포용)

팀원 코드/데이터를 하나로 조립한 실행 가능한 Next.js 앱입니다.
- 데이터: 실측 21곳 + 실측 사진 106장 + GPX 경로선 15구간 (전부 실데이터, 지어낸 값 없음)
- 용산 SG13~18 구간은 실측 데이터 대기 중이라 "Survey data pending" 처리
- `components/FilterBar_yiryeong.tsx` = 이령 원본 (병합 대기)
- 각 파일 상단 주석에 담당자(owner) 표기 — 팀원 버전이 오면 그 파일만 교체

## 올리는 법 (수현)
1. 이 폴더 전체를 저장소 루트에 복사 (기존 components/* 브랜치는 그대로 둠)
2. git add -A && git commit -m "feat: integrated app skeleton" && git push origin main
3. Vercel 환경변수: NEXT_PUBLIC_GOOGLE_MAPS_KEY = (구글 지도 키)

## 로컬 실행
npm install && npm run dev
