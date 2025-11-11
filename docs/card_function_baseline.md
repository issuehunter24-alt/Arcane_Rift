# 기본 카드 기능 16종 정리

현재 `cards.json`에 배포된 168장의 카드가 공통적으로 사용하는 16개의 핵심 기능을 타입별로 정리했습니다. 각 기능은 동일하거나 유사한 수치로 여러 캐릭터·레어도에 반복 배치된 상태입니다.

## 공격 카드 (4종)

| 구분 | 대표 카드 | 효과 요약 | 세부 설명 |
| --- | --- | --- | --- |
| 1. 기본 공격 | `ATT_ARIANA_NO_001` | 단일 대상 피해 20 | 순수 `Damage` 효과만 포함. 레어도·캐릭터에 따라 수치만 소폭 차이. |
| 2. 파이어볼 | `ATT_ARIANA_RA_002` | 피해 30 + 화상 1중첩 | `Damage` 후 `ApplyStatus`(`Burn`). 화상 스택은 고정 1. |
| 3. 화염 폭발 | `ATT_ARIANA_EP_003` | 광역 피해 40 + 화상 1중첩 | `Damage`(`aoe: true`) 후 `ApplyStatus`(`Burn`). 광역+도트 조합. |
| 4. 처형 | `ATT_ARIANA_LE_004` | 피해 50, 대상 HP 30% 이하 추가 피해 30 | `Damage` + `Conditional`(`targetHp<=30%` 시 보너스 `Damage`). |

## 회복 카드 (4종)

| 구분 | 대표 카드 | 효과 요약 | 세부 설명 |
| --- | --- | --- | --- |
| 5. 기본 회복 | `HEA_ARIANA_NO_005` | 회복 20 | 순수 `Heal` 효과만 포함. |
| 6. 강한 회복 | `HEA_ARIANA_RA_006` | 회복 40 | `Heal` 수치만 강화. |
| 7. 완전 회복 | `HEA_ARIANA_EP_007` | 회복 60 | `Heal` 최대치. 부가 효과 없음. |
| 8. 축복 | `HEA_ARIANA_LE_008` | 회복 60 + 공격력 20% 증가(2턴) | `Heal` + `Buff`(`stat: attack`, `duration: 2`). |

## 특수 카드 (4종)

| 구분 | 대표 카드 | 효과 요약 | 세부 설명 |
| --- | --- | --- | --- |
| 9. 추가 드로우 | `SPE_ARIANA_NO_009` | 카드 2장 드로우 | `Draw` 효과 단일 구성. |
| 10. 행동력 증가 | `SPE_ARIANA_RA_010` | 행동력 +1 | `GainAction` 1회. 우선순위·부가 효과 없음. |
| 11. 더블캐스트 | `SPE_ARIANA_EP_011` | 다음 공격 카드 1회 추가 사용 | `DuplicateNext`(`typeFilter: Attack`, `times: 1`). |
| 12. 복제 | `SPE_ARIANA_LE_012` | 덱의 공격 카드 1장을 손패로 복사 | `CopyCard`(`from: deck`, `filter: type:Attack`, `to: hand`). |

## 방어 카드 (4종)

| 구분 | 대표 카드 | 효과 요약 | 세부 설명 |
| --- | --- | --- | --- |
| 13. 방패 올리기 | `DEF_ARIANA_NO_013` | 보호막 20 (1턴) | `Shield`(`value: 20`, `duration: 1`). |
| 14. 받아치기 | `DEF_ARIANA_RA_014` | 반격 20 (1턴) | `Counter`(`value: 20`, `duration: 1`). |
| 15. 무효의 벽 | `DEF_ARIANA_EP_015` | 다음 상대 행동 1회 무효 | `Nullify`(`times: 1`). 지속시간 없음(즉시 보유). |
| 16. 성스러운 보호 | `DEF_ARIANA_LE_016` | 보호막 40 (2턴) + 화상 면역 (1턴) | `Shield` + `Immune`(`keywords: ['Burn']`, `duration: 1`). |

---

### 확인 방법
- 모든 기능은 `cards.json`에서 각 캐릭터/레어도 조합에 복제되어 있으며, 수치만 동일하게 유지됩니다.
- 신규 기능 확장 시 이 문서를 기준으로 **기존 기능을 재분류**하고, 추가 설계되는 기능은 별도 문서에 누적할 수 있습니다.


