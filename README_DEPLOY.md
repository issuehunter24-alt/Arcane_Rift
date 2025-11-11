# 🚀 Gals Card Game - 배포 가이드

## 📦 Alpha 0.1 Release

이 문서는 **Gals Card Game**의 알파 버전을 빌드하고 배포하는 방법을 설명합니다.

---

## 🎯 빠른 시작

### 개발 서버 실행
```bash
cd web
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드
```bash
cd web
npm run build
```

빌드 결과물: `web/dist/` 폴더

---

## 📋 빌드 옵션

### 1. 기본 빌드 (코드만)
```bash
npm run build
```
- TypeScript 컴파일 + Vite 번들링
- 이미지 에셋은 기존 파일 사용
- **빌드 시간**: ~10초

### 2. 전체 빌드 (에셋 포함)
```bash
npm run build:full
```
- 카드 이미지 PNG 준비
- WebP 변환 (품질 85)
- TypeScript 컴파일 + Vite 번들링
- **빌드 시간**: ~1-2분

### 3. ZIP 아카이브 생성
```bash
npm run build:zip
```
- 전체 빌드 실행
- `dist.zip` 파일 생성 (배포용)
- **결과물**: `web/dist.zip`

---

## 🌐 정적 호스팅 배포

### Option 1: Netlify (추천)

**자동 배포 설정**:
1. Netlify에 GitHub 저장소 연결
2. 빌드 설정:
   ```yaml
   Base directory: web
   Build command: npm run build
   Publish directory: web/dist
   ```
3. 환경 변수 (필요시):
   ```
   NODE_VERSION=18
   ```

**수동 배포**:
```bash
cd web
npm run build
# Netlify CLI 사용
npx netlify deploy --prod --dir=dist
```

**결과**: `https://your-app.netlify.app`

---

### Option 2: Vercel

**자동 배포 설정**:
1. Vercel에 GitHub 저장소 연결
2. Framework Preset: **Vite**
3. 빌드 설정:
   ```yaml
   Root Directory: web
   Build Command: npm run build
   Output Directory: dist
   ```

**수동 배포**:
```bash
cd web
npm run build
# Vercel CLI 사용
npx vercel --prod
```

**결과**: `https://your-app.vercel.app`

---

### Option 3: GitHub Pages

**설정**:
1. `vite.config.ts`에 base path 추가:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   });
   ```

2. GitHub Actions 워크플로우 생성 (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - name: Install and Build
           run: |
             cd web
             npm ci
             npm run build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./web/dist
   ```

3. GitHub Settings → Pages → Source: **gh-pages branch**

**결과**: `https://username.github.io/repo-name/`

---

### Option 4: 자체 서버 (Apache/Nginx)

**Nginx 설정 예시** (`/etc/nginx/sites-available/gals`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gals/dist;
    index index.html;

    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 캐싱 설정
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

**배포**:
```bash
# 빌드
cd web
npm run build

# 서버로 전송
scp -r dist/* user@server:/var/www/gals/dist/

# Nginx 재시작
ssh user@server "sudo systemctl restart nginx"
```

---

## ✅ 배포 전 체크리스트

### 필수 항목
- [ ] `npm run build` 성공 (에러 없음)
- [ ] `npm run test:run` 통과
- [ ] 브라우저 콘솔 에러 없음
- [ ] 카드 이미지 로딩 확인 (WebP/PNG)
- [ ] i18n 한국어/영어 전환 테스트
- [ ] 모바일 반응형 확인

### 권장 항목
- [ ] Lighthouse 점수 확인 (Performance > 80)
- [ ] 다양한 브라우저 테스트 (Chrome, Firefox, Safari)
- [ ] 로딩 시간 확인 (< 3초)
- [ ] 전투 1회 완료 테스트
- [ ] 덱 편집 기능 테스트
- [ ] 상점 구매 기능 테스트

### 보안 항목
- [ ] HTTPS 적용 (프로덕션)
- [ ] CSP 헤더 설정 (선택)
- [ ] 불필요한 소스맵 제거 (프로덕션)

---

## 🔍 로컬 프리뷰

빌드된 파일을 로컬에서 테스트:

```bash
npm run preview:dist
```

브라우저에서 `http://localhost:4173` 접속

**차이점**:
- 개발 서버 (`npm run dev`): Hot Reload, 디버깅 활성화
- 프리뷰 서버 (`npm run preview:dist`): 프로덕션 환경 시뮬레이션

---

## 📊 빌드 산출물 구조

```
web/dist/
├── index.html              # 엔트리 포인트
├── assets/
│   ├── index-*.js         # 번들된 JavaScript (해시)
│   ├── index-*.css        # 번들된 CSS (해시)
│   └── *.webp/.png        # 최적화된 이미지
├── cards/                  # 카드 이미지 (WebP 우선)
│   ├── Ariana_Attack_Normal.webp
│   ├── Ariana_Attack_Normal.png
│   └── ...
├── data/
│   └── cards.json         # 카드 데이터
└── favicon.svg            # 파비콘
```

**용량 예상**:
- HTML/CSS/JS: ~500KB (gzip 압축 시 ~150KB)
- 카드 이미지 (40장): ~2-3MB
- **총합**: ~3-4MB

---

## 🛠️ 트러블슈팅

### 1. 빌드 실패: TypeScript 에러
```bash
# TypeScript 컴파일 체크
npm run build

# 에러 확인
tsc -b
```
**해결**: `web/src/` 폴더의 TypeScript 에러 수정

---

### 2. 이미지 로딩 실패 (404)
**증상**: 카드가 회색 박스로 표시
**원인**: 이미지 경로 또는 파일 누락

**해결**:
```bash
# 에셋 재생성
npm run assets

# 빌드 재실행
npm run build
```

---

### 3. 배포 후 새로고침 시 404 에러
**증상**: `yoursite.com/deck-editor` 접속 시 404
**원인**: SPA 라우팅 미설정

**해결 (Netlify)**:
`web/public/_redirects` 파일 생성:
```
/*    /index.html   200
```

**해결 (Vercel)**:
`web/vercel.json` 파일 생성:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### 4. 모바일에서 느린 로딩
**해결**:
1. WebP 이미지 확인 (PNG보다 30-50% 작음)
2. 이미지 프리로딩 확인 (`assetLoader.ts`)
3. 네트워크 탭에서 병목 확인

---

### 5. 브라우저 호환성 문제
**최소 요구사항**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**폴백**:
- WebP 미지원 → PNG 자동 대체
- ES2020 미지원 → Vite 자동 폴리필

---

## 📈 성능 최적화 팁

### 이미지 최적화
```bash
# WebP 품질 조정 (현재: 85)
npm run convert:webp -- -Quality 75  # 더 작은 파일
npm run convert:webp -- -Quality 95  # 더 높은 품질
```

### 번들 사이즈 분석
```bash
# 번들 분석 (package.json에 추가 필요)
npm install -D rollup-plugin-visualizer
# vite.config.ts에 플러그인 추가
```

### CDN 활용
- PixiJS를 CDN에서 로드 (선택)
- 폰트를 Google Fonts에서 로드 (선택)

---

## 🔐 환경 변수 (필요시)

`.env.production` 파일 생성:
```bash
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-XXXXX-X
```

코드에서 사용:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📞 지원

**문제 발생 시**:
1. GitHub Issues에 보고
2. 로그 첨부 (브라우저 콘솔)
3. 환경 정보 (OS, 브라우저, Node 버전)

**연락처**:
- GitHub: [프로젝트 저장소]
- Email: [이메일 주소]

---

## 📝 버전 정보

- **현재 버전**: Alpha 0.1.0
- **빌드 날짜**: 2025-11-01
- **Node 버전**: 18.x 이상
- **npm 버전**: 9.x 이상

---

## 🎉 배포 완료!

축하합니다! 게임이 성공적으로 배포되었습니다.

**다음 단계**:
1. 🎮 알파 테스터 초대
2. 📝 피드백 수집
3. 🐛 버그 수정
4. 🎨 Beta 준비 (연출 강화)

Happy Gaming! 🃏✨

