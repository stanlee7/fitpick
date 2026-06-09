# FitPick 열람 추적 API (Railway 배포)

제안서 열람을 기록/집계하는 작은 Node(Express) + Postgres 서비스.

## Railway 배포 순서

1. **railway.com → New Project → Deploy from GitHub repo** → `stanlee7/fitpick` 선택
2. 생성된 서비스 **Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start` (자동 감지될 수 있음)
3. 같은 프로젝트에 **+ New → Database → Add PostgreSQL** 추가
4. 서비스의 **Variables** 탭에서 DB 연결 변수 추가:
   - `DATABASE_URL` = Postgres 서비스의 `DATABASE_URL` 참조 (`${{Postgres.DATABASE_URL}}`)
   - (Railway 내부 연결에서 SSL 오류가 나면) `PGSSL` = `disable`
5. 배포 완료 후 서비스 **Settings → Networking → Generate Domain** 으로 공개 URL 생성
   - 예: `https://fitpick-production.up.railway.app`
6. 확인: 브라우저로 그 URL을 열어 `{"ok":true,"service":"fitpick-tracking"}` 가 보이면 정상

## 프론트(Vercel)와 연결

Vercel 프로젝트(fitpick) → Settings → Environment Variables:

- `NEXT_PUBLIC_API_URL` = 위에서 만든 Railway 공개 URL (끝에 `/` 없이)

저장 후 **재배포**(`vercel --prod`)해야 정적 빌드에 반영됨. 그러면 대시보드에
"보낸 제안서 열람 현황" 패널이 나타나고, 공유 링크 열람이 기록된다.

## 엔드포인트

- `POST /api/opens` body `{ pid, client, title }` — 열람 1건 기록
- `GET /api/opens?pids=a,b,c` — pid별 `{ pid, count, lastOpenedAt }` 집계

테이블 `proposal_opens` 는 서버 기동 시 자동 생성된다.
