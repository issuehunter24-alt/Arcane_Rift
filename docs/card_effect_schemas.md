# 신규 카드 효과/상태 설계 초안 (Step 1)

카드 기능 확장 로드맵(`card_function_expansion.md`)을 구현하기 위해 추가/변경이 필요한 `CardEffect` 타입과 상태 키워드를 정리한 문서입니다. 이 정의를 기준으로 `types.ts`, `store.ts`, 테스트 코드 업데이트를 진행합니다.

## 1. 신규 `CardEffect` 타입

| 키 | 설명 | 주요 필드 |
| --- | --- | --- |
| `ArmorBreak` | 대상의 Guard/Shield를 고정 수치만큼 제거 | `guard?: number`, `shield?: number` |
| `Damage` 확장 | 멀티 히트 및 흡혈 지원 | `hits?: number`, `lifestealRatio?: number` |
| `GainAction` 확장 | 소수점 에너지, 지연 지급 | `value: number`, `delayed?: boolean`, `delayTurns?: number` |
| `OnHitStatus` | 일정 턴 동안 공격 받으면 상태 부여 | `status: CardEffect`(또는 `key`, `stacks`, `duration`), `duration: number` |
| `Leech` (대안) | 독립 효과로 흡혈 제공 시 사용 | `ratio: number` |
| `UndoDamage` | 직전 턴 받은 피해 일부 복원 | `percent: number`, `max?: number`, `turns?: number` |
| `Summon` | 소환수 생성 | `id: string`, `attack: number`, `hp: number`, `duration: number`, `abilities?: string[]` |
| `StealCard` | 상대 손패에서 카드 복사 | `from: 'opponentHand' | 'opponentDeck'`, `filter?: string`, `count?: number` |
| `TurnSkip` | 상대 턴 스킵 시도 | `chance: number` |
| `Mark` | 마크 상태 적용 (추가 피해) | `duration: number`, `damageAmpPercent: number` |
| `LeechAura` (옵션) | 팀 기반 지속 흡혈 제공 시 사용 | `ratio: number`, `duration: number` |
| `DelayedEnergy` | 다음 턴 에너지 지급 | `amount: number`, `turns: number` *(대안: `GainAction` 확장으로 처리)* |
| `TempoBoost` 확장 | 적용 대상/중첩 관리 | `amount: number`, `turns: number`, `scope?: 'self' | 'team'` |
| `ConditionalTrigger` | Nullify 성공 등 이벤트 기반 발동 | `event: 'nullify' | 'kill' | ...`, `effects: CardEffect[]` |

> **구현 메모**  
> - 기존 타입을 확장할 수 있는 경우(`Damage` 멀티 히트, `GainAction` 소수점)에는 새로운 타입 대신 기존 인터페이스에 optional 필드를 추가하는 방향을 우선 고려합니다.  
> - `Summon`은 전투 루프에 소환수 턴 처리 로직이 없으므로 Phase 1에서는 대체 효과(즉시 공격, 버프 등)로 치환하거나, 미니언을 가시화하는 간소화된 로직(유지형 도트)으로 설계할 수 있습니다.

## 2. 신규/확장 상태 키워드

| 키워드 | 설명 | 필요 로직 |
| --- | --- | --- |
| `Root` | 대상 이동/회피 차단, 우선순위 감소 | 회피(Evasion) 비활성화, Priority -1, 턴마다 감소 |
| `Mark` | 공격 시 추가 피해 | 공격 계산 시 damage × (1 + amp%) |
| `ArmorBreak` | Guard/Shield 감소 효과 | Guard/Shield 값을 즉시 감소 |
| `Shock` 확장 | 스택별 데미지/에너지 상호작용 | 공격 시 체인/추가 피해, TempoBoost 연동 |
| `Bleed` (기존) | 신규 카드에서 사용, 이미 구현됨 | - |
| `Burn`/`Freeze` | 기존, onHit 트리거 고려 | `OnHitStatus`와 연계 |

## 3. 이벤트 트리거/메커니즘

- **OnHit**: 일정 턴 동안 공격을 받으면 상대에게 상태를 부여 (`D06 결빙 장막`).  
  구현 방안: `EntityStatus`에 `onHitStatus` 큐를 추가하고 `dealDamage` 호출 시 처리.

- **Delayed Energy**: 카드 사용 턴이 아닌 다음 턴에 에너지 지급 (`D09 철벽 방진`, `TempoBoost`).  
  이미 존재하는 `TempoBoost`를 재활용하고, `GainAction`에 `delayed` 옵션 추가.

- **Nullify Trigger**: Nullify 성공 시 추가 효과 발동 (`D12 마력 역류`).  
  `EntityStatus`에 `onNullify` 배열을 추가하거나, Nullify 처리 시 바로 카드 효과 평가.

- **TurnSkip**: 확률로 상대 턴을 건너뜀 (`S14 시간 정지`).  
  전투 라운드 루프에 플래그(`skipEnemyTurnOnce`)를 추가하여 다음 턴 시작 시 소진.

- **Summon**: Phase 1에서는 UI/턴 시스템 부담이 크므로 다음과 같이 단순화 제안:  
  - `Summon` 효과를 `Damage` + `Guard` + `Conditional` 조합으로 대체하거나  
  - `duration` 동안 자동으로 고정 피해를 주는 `DamageOverTime` 새 타입을 사용

## 4. 데이터/엔진 반영 체크리스트

- [ ] `types.ts`: `CardEffect` 유니온 타입 및 관련 Type Guard 업데이트  
- [ ] `store.ts`:  
  - 데미지 계산 (`dealDamage`) 흡혈/Mark/ArmorBreak 반영  
  - 상태 틱 (`_tickEntityStatus`)에 Root, OnHitStatus 등 추가  
  - Nullify/GainAction/TempoBoost 확장  
- [ ] 테스트(`__tests__`): 신규 효과별 단위 테스트 추가  
- [ ] `cards.json` 재작성 시 신규 필드(`hits`, `lifestealRatio`, `guardReduction` 등) 적용  
- [ ] UI/로그: 새 효과를 설명하는 로그 문자열 추가 (`addLog` 사용)

## 5. 1차 우선 구현 대상 제안

Phase 1에서는 구현 난이도 대비 효과가 좋은 기능부터 처리합니다.

1. **쉬운 확장**: `Damage` 멀티 히트/흡혈, `GainAction` 소수점, `ArmorBreak`, `UndoDamage`, `TempoBoost` 확장  
2. **중간 난이도**: `OnHitStatus`, `Nullify Trigger`, `TurnSkip`, `StealCard`  
3. **고난도/보류**: `Summon`(AI/턴 로직), 팀 단위 버프/협동 효과 → 후속 스프린트로 분리

이 설계를 바탕으로 Step 2(엔진 구현)을 진행할 수 있습니다. 필요한 조정 사항이 있으면 우선 논의한 뒤 반영하겠습니다.

