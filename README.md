# Instagram 분석기 백엔드 API

## 구조
```
api/
  instagram.js  → Instagram 데이터 가져오기
  auth.js       → Meta OAuth 로그인 처리
vercel.json     → Vercel 배포 설정
package.json    → 프로젝트 설정
```

## Vercel 환경변수 설정 (필수)
Vercel 대시보드 → Settings → Environment Variables 에서 추가:

| 변수명 | 설명 |
|---|---|
| `META_APP_ID` | Meta 앱 ID |
| `META_APP_SECRET` | Meta 앱 시크릿 |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram 액세스 토큰 |
| `REDIRECT_URI` | OAuth 콜백 주소 |

## API 엔드포인트
- `GET /api/instagram` → 계정 데이터 조회
- `GET /api/auth` → Instagram 로그인 처리
