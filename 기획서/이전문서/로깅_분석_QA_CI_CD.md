## 로깅/분석/QA/CI-CD

### 1. 로깅/텔레메트리
- 전투 이벤트: 시작/종료, 카드 사용, 승패, 라운드 수, 에너지 잔량.
- 개인정보 최소, 시드/재현 로그 분리.

#### 1-1. 이벤트 스키마(예시)
- combat_start { matchId, mode, seed }
- card_play { matchId, turn, actor, cardId, cost, targets[] }
- effect_apply { matchId, keyword, amount, target }
- combat_end { matchId, winner, rounds, durationSec }

### 2. 대시보드
- 지표: 승률, 평균 턴수, 카드 사용 빈도, 스테이지 실패율.

#### 2-1. 메타 리포트
- 상·하위 승률 카드 Top5, 과다 사용/저사용 카드, 속성별 승률 분포.

### 3. QA
- E2E(Playwright), 스냅샷(렌더/레이아웃), 리그레션 테스트.
- 브라우저/디바이스 지원 매트릭스 인증.

#### 3-1. 테스트 매트릭스
- 브라우저: Chrome/Safari/Edge 최근 2버전 × 해상도(모바일/데스크톱) × DPR(1/2)
- 시나리오: 캠페인 10스테이지, 일일 던전, 덱 편집/상점, 전투 50전 자동화

### 4. CI/CD
- GitHub Actions → Pages/CDN 배포. 버저닝/릴리즈 노트 정책.

#### 4-1. 파이프라인 단계
- Lint/Build → Unit/E2E → Bundle size 체크 → WebP 변환/아틀라스 → 배포 → 캐시 무효화


