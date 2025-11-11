# Cloud Save Schema (2025-11-10)

최근 클라이언트/서버 간 동기화를 안전하게 유지하기 위해 저장 포맷을 개편했습니다. 이 문서는 새로운 스키마와 런타임 처리 흐름을 정리합니다.

## 1. 저장 방식 변경 요약

- **기존**: `collection`, `playerDeck`에 카드 전체 객체(`Card`)를 통째로 직렬화해서 저장  
- **문제점**: 카드 기획이 갱신될 때(효과/텍스트 등) 기존 세이브 데이터가 구버전 상태로 남아 UI/전투 로직이 어긋남
- **신규 스키마**: `cardId + count`의 집계 방식으로 저장

```json
{
  "collection": [
    { "cardId": "ATT_ARIANA_NO_001", "count": 3 },
    { "cardId": "SPE_LEON_EP_127", "count": 1 }
  ],
  "playerDeck": [
    { "cardId": "ATT_ARIANA_NO_001", "count": 3 },
    { "cardId": "ATT_DARIUS_LE_020", "count": 1 }
  ]
}
```

## 2. 런타임 동작

| 단계 | 처리 내용 |
| --- | --- |
| **로딩** | `loadCloudSave()` → `applyCloudSave()`에서 카드 엔트리를 읽고 `hydrateEntries()`로 최신 `cards.json` 기반의 `Card` 객체로 재구성 |
| **저장** | `selectPersistentState()`가 현재 덱/컬렉션을 `aggregateCardEntries()`로 요약한 뒤 Supabase에 업서트 |
| **마이그레이션** | 구형 포맷(`Card[]`)을 읽을 경우 자동으로 집계 포맷으로 변환 후 즉시 재저장 |

> ⚠️  `cardId`가 비어 있거나 일치하는 카드 정의가 없을 때는 해당 엔트리가 무시되며 콘솔에 경고가 출력됩니다. 카드 ID는 `cards.json`과 동일한 최신 식별자를 사용하세요.

## 3. 개발/테스트 체크리스트

- [ ] 새로운 카드 ID를 배포할 때, 기존 저장 데이터에 동일 ID가 있는지 확인
- [ ] 단위 테스트: `hydrateEntries`/`aggregateCardEntries`에 대한 스냅샷 추가 예정
- [ ] 수동 QA: 로그인 → 덱 편집 → 로그아웃 후 재로그인 시 카드 효과/텍스트가 최신 상태인지 확인

## 4. 자주 묻는 질문

- **Q. 카드 텍스트가 구버전으로 보입니다.**  
  → DB에 카드 전체 객체가 남아 있는지 확인 후, 본 스키마 형식으로 수동 업데이트하세요.

- **Q. 덱이 비어 있는 상태로 로딩됩니다.**  
  → 새로운 스키마로 저장하기 전에 덱이 구성되어 있지 않았다면 20장 자동 덱이 재생성됩니다. 카드 수량이 부족하면 콘솔 경고가 출력됩니다.

---

필요한 내용이 더 있다면 `web/src/cloudSave.ts` / `cloudSave.js`의 주석과 함께 이 문서를 확장해 주세요.

