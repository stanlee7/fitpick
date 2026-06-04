# 📊 FitPick 측정(Analytics) 설정 가이드

3주차 그로스 미션용 — **실제 사용자 사용 기록**을 모으기 위한 측정 인프라.
코드는 이미 다 심어져 있어요. 아래 **계정 발급 + 환경변수 + 재배포**만 하면 진짜 데이터가 잡힙니다.

---

## 무엇이 측정되나 (이미 코드에 심음)

| 항목 | 어떻게 | 코드 위치 |
|---|---|---|
| 페이지 방문 / 유입 | GA4 자동 page_view | `src/app/layout.tsx` |
| 유입 채널 (`?from=`) | 방문 시 `visit_source` 이벤트 + localStorage 기억 | `src/components/AnalyticsTracker.tsx`, `src/lib/analytics.ts` |
| 앱 다운로드 클릭 | `app_download` 이벤트 | `src/app/download/page.tsx` |
| 강사 등록 | `instructor_added` 이벤트 | `src/app/page.tsx` |
| 제안서 생성 | `proposal_created` (강사 수·템플릿 포함) | `src/components/CurationPanel.tsx` |
| 제안서 PDF 내보내기 | `proposal_pdf_export` | `src/components/CurationPanel.tsx` |
| 상담 신청 | `consult_request` | `src/components/CurationPanel.tsx` |
| 피드백 클릭 | `feedback_click` | `IntroView.tsx`, `page.tsx` |

> 환경변수가 없으면 GA4·피드백 버튼은 **자동으로 비활성**돼요(안전). 값만 넣으면 켜집니다.

---

## 1️⃣ GA4 측정 ID 발급 (약 15분)

1. analytics.google.com → 로그인 → **측정 시작**
2. 계정/속성 만들기 — **시간대·통화: 대한민국** 꼭 선택
3. 데이터 스트림 → **웹** → URL `https://fitpick-nine.vercel.app` 입력
4. 발급된 **측정 ID `G-XXXXXXXXXX`** 복사

## 2️⃣ 구글폼 피드백 폼 (약 5분)

1. forms.google.com → 빈 양식, 질문 3개만:
   - 어떤 점이 가장 좋았나요? (장문)
   - 어떤 점이 아쉬웠나요? (장문)
   - 다시 쓰실 의향이 있나요? (1~5점)
2. 우상단 **보내기 → 링크 복사**

## 3️⃣ 환경변수 등록

**로컬 개발:** `.env.local.example` 를 `.env.local` 로 복사 후 값 채우기
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FEEDBACK_URL=https://forms.gle/xxxxxxxx
```

**Vercel 배포:** 대시보드 → 프로젝트 → **Settings → Environment Variables** 에
위 두 키를 동일하게 등록 → **Deployments 탭에서 Redeploy**
(NEXT_PUBLIC_ 변수는 빌드 시 주입되므로 재배포가 꼭 필요)

## 4️⃣ 채널별 링크 뿌리기 (UTM)

채널마다 꼬리표를 다르게:
```
https://fitpick-nine.vercel.app/?from=openchat     ← 카카오 오픈채팅
https://fitpick-nine.vercel.app/?from=linkedin     ← 링크드인
https://fitpick-nine.vercel.app/?from=dm           ← 지인 DM
```
→ GA4 **이벤트 → visit_source** 의 `source` 파라미터에서 채널별로 구분돼요.

## 5️⃣ 검증 (2분)

1. 배포 후 `https://fitpick-nine.vercel.app/?from=test` 접속
2. GA4 → **보고서 → 실시간** 에 본인 접속 1 표시되면 성공 ✅
3. 강사 등록·제안서 생성·PDF 한 번씩 → GA4 → **실시간 → 이벤트 수** 에
   `instructor_added` / `proposal_created` / `proposal_pdf_export` 뜨는지 확인

---

## ⚠️ FitPick 특성상 한계 (회고 거리)

- **데스크톱 앱(Electron)** 사용은 `file://` 환경이라 GA4가 잘 안 잡혀요.
  → 웹(fitpick-nine.vercel.app) 사용 + 다운로드 수까지가 신뢰 가능한 측정 범위.
- 앱 내부 행동(로컬-퍼스트, DB 없음)은 중앙 집계 불가 → 깊은 사용은 **사용자 자가보고/인터뷰**로 보완.
- 더 정밀히 보려면 4주차에 "익명 사용 이벤트 ping" 추가가 후보.
