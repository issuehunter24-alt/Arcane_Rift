# 카드 기능 재배치 계획 (Step 3 준비)

`card_function_expansion.md`에서 정의한 50개 기능을 실제 카드 데이터(`web/public/data/cards.json`)에 반영하기 위한 1차 배치 초안입니다.  
각 항목은 기본 캐릭터 12인(Ariana, Darius, Elder, Elena, Garen, Iris, Kai, Leon, Lucian, Marcus, Mira, Seraphina/Seraphine)의 카드 슬롯(Attack/Defense/Heal/Special × Normal~Legendary)에 어떤 기능을 할당할지 요약합니다.

## 1. 캐릭터 콘셉트 스냅샷

- **Ariana**: 불/속성 변환, 광역/연속 마법, Tempo & 지원형.
- **Darius**: 헌터/출혈/사령, 고위험 고피해, 흡혈 및 표식.
- **Elder**: 폭풍/연쇄/충격, 다단 히트와 Tempo 연계.
- **Elena**: 냉기/빙결/체인, Root·OnHit 상태 운용.
- **Garen**: 방패/가드/팀 버프, ArmorBreak 대응.
- **Iris**: 빛/정화/Immune, UndoDamage·팀 회복.
- **Kai**: 속도/TempoBoost/연속 공격, 지연 에너지.
- **Leon**: 전사/복제/덱 조작, StealCard/리사이클.
- **Lucian**: 금속/기계, ReactiveArmor·ArmorBreak·Tempo.
- **Marcus**: 전략/시간 조작, TurnSkip·UndoDamage.
- **Mira**: 암살/은신, OnHit 상태·표식·회피.
- **Seraphina**: 그림자/표창/출혈·혼령.
- **Seraphine**: 성가/지원, 팀 Regen·Immune·Tempo.

## 2. 기능 매핑 표

| 캐릭터 | 슬롯 | 기능 코드 | 상세 효과 요약 |
| --- | --- | --- | --- |
| Ariana | ATT Normal | A02 파이어볼 | Damage+Burn |
| | ATT Rare | A15 연성 폭연 | Damage+Burn+Vulnerable |
| | ATT Epic | A06 폭풍 연격 | Damage+Chain+Shock |
| | ATT Legendary | A03 화염 폭발 | Damage + Burn×2 + Vulnerable |
| | DEF Normal | D01 방패 올리기 | Shield 20 |
| | DEF Rare | D12 마력 역류 | Nullify + 에너지 보상 |
| | DEF Epic | D07 천벌 결계 | Shield+Shock on hit+Tempo |
| | DEF Legendary | D04 성스러운 보호 | Shield+Immune |
| | HEA Normal | H11 연금 촉진 | Heal + Regen + GainAction |
| | HEA Rare | H06 정화의 숨결 | Heal + Cleanse |
| | HEA Epic | H12 천위 강림 | Heal + Immune + Priority |
| | HEA Legendary | H04 축복 | Heal + Buff |
| | SPC Normal | S01 추가 드로우 | Draw 2 |
| | SPC Rare | S06 원소 전환 | ElementShift + Damage |
| | SPC Epic | S11 오라 공진 | Buff atk/speed + Draw |
| | SPC Legendary | S18 빛의 선언 | Immune + GainAction |
| Darius | ATT Normal | A01 기본 공격 | Damage 20 |
| | ATT Rare | A10 심연 파동 | Multi-hit + Leech |
| | ATT Epic | A05 혈월의 일격 | Damage + Bleed |
| | ATT Legendary | A04 처형 | Execute |
| | DEF Normal | D02 받아치기 | Counter |
| | DEF Rare | D13 지각 단층 | Shield + Apply Vulnerable |
| | DEF Epic | D08 그림자 회피술 | Evasion + Counter |
| | DEF Legendary | D14 회오리 방출 | Evasion + Damage + Shock |
| | HEA Normal | H01 기본 회복 | Heal 20 |
| | HEA Rare | H09 불굴의 맹세 | Heal + Guard + Counter |
| | HEA Epic | H08 월광 재생 | Heal + Regen + Bleed |
| | HEA Legendary | H10 시간 회귀 | Heal + UndoDamage |
| | SPC Normal | S02 행동력 증가 | GainAction 1 |
| | SPC Rare | S19 황혼 선포 | Burn + Bleed + Damage |
| | SPC Epic | S10 사령 개시 | Revive + ApplyBleed |
| | SPC Legendary | S13 미러 폴드 | StealCard |
| Elder | ATT Normal | A01 폭풍 개시 | Damage 20 |
| | ATT Rare | A06 연쇄 낙뢰 | Damage + Chain + Shock |
| | ATT Epic | A13 자음 포화 | Damage + Shock×2 + Tempo |
| | ATT Legendary | A14 유리령 사격 | Damage + Evasion + Draw |
| | DEF Normal | D01 방풍 장막 | Shield 20 |
| | DEF Rare | D07 천벌 결계 | Shield + Shock(on hit) + Tempo |
| | DEF Epic | D14 회오리 방출 | Evasion + Damage + Shock |
| | DEF Legendary | D15 폭풍심 재가동 | Shield + TempoBoost + Shock |
| | HEA Normal | H05 바람의 수선 | Heal + Overflow Shield + Regen |
| | HEA Rare | H11 서클 리제너 | Heal + Regen + GainAction |
| | HEA Epic | H12 폭풍 진동 | Heal + Immune + Priority |
| | HEA Legendary | H13 회오리 정비 | Heal + Evasion + Duplicate Defense |
| | SPC Normal | S06 원소 전환 | ElementShift + Damage |
| | SPC Rare | S05 윤회 가속 | TempoBoost + Draw |
| | SPC Epic | S11 오라 공진 | Buff atk/speed + Draw |
| | SPC Legendary | S21 천둥 각성 | TempoBoost + GainAction + Shock |
| Elena | ATT Normal | A01 서릿발 베기 | Damage 20 |
| | ATT Rare | A07 얼음 척살 | Damage + Freeze + Bonus vs Frozen |
| | ATT Epic | A16 한기 관통 | Damage + Freeze + Vulnerable |
| | ATT Legendary | A17 절대 영도 | Damage + Freeze(2턴) + Tempo Boost |
| | DEF Normal | D01 방풍 장막 | Shield 20 |
| | DEF Rare | D06 결빙 장막 | Shield + Freeze(on hit) |
| | DEF Epic | D14 회오리 방출 | Evasion + Damage + Shock |
| | DEF Legendary | D16 얼음 결계 | Shield + OnHit Freeze + Nullify |
| | HEA Normal | H05 바람의 수선 | Heal + Overflow Shield + Regen |
| | HEA Rare | H06 정화의 숨결 | Heal + Cleanse |
| | HEA Epic | H12 폭풍 진동 | Heal + Immune + Priority |
| | HEA Legendary | H13 회오리 정비 | Heal + Evasion + Duplicate Defense |
| | SPC Normal | S01 추가 드로우 | Draw 2 |
| | SPC Rare | S08 빙정 봉인 | Freeze + Nullify |
| | SPC Epic | S23 서릿빛 공명 | Tempo Boost + Draw + Freeze |
| | SPC Legendary | S22 빙하 각성 | GainAction + Tempo Boost + Freeze |
| Garen | ATT Normal | A01 강철 참격 | Damage 20 |
| | ATT Rare | A08 균열 타격 | Damage + ArmorBreak |
| | ATT Epic | A12 승리의 연격 | Damage + Duplicate Attack + Self Heal |
| | ATT Legendary | A04 정의의 심판 | Execute |
| | DEF Normal | D01 방패 자세 | Shield 20 |
| | DEF Rare | D09 전열 방진 | Guard + Delayed GainAction |
| | DEF Epic | D13 균열 방진 | Shield + Apply Vulnerable |
| | DEF Legendary | D04 철벽 수호 | Shield + Immune Burn |
| | HEA Normal | H01 전열 재정비 | Heal 20 |
| | HEA Rare | H09 불굴의 맹세 | Heal + Guard + Counter |
| | HEA Epic | H02 강인한 재생 | Heal 40 |
| | HEA Legendary | H10 결의의 회복 | Heal + UndoDamage |
| | SPC Normal | S02 전장의 구령 | GainAction 1 |
| | SPC Rare | S20 합동 진군 | TempoBoost + Shield + GainAction |
| | SPC Epic | S11 전우의 함성 | Buff atk/speed + Draw |
| | SPC Legendary | S24 결의의 함성 | Guard + Attack Buff + Delayed GainAction |
| Iris | ATT Normal | A01 광휘 베기 | Damage 20 |
| | ATT Rare | A11 성광 일섬 | Damage + Cleanse + Attack Buff |
| | ATT Epic | A18 성광 파동 | Damage + Heal + Cleanse |
| | ATT Legendary | A03 천상 폭발 | Damage + Burn×2 + Vulnerable |
| | DEF Normal | D03 천상의 방벽 | Nullify |
| | DEF Rare | D10 성역 구축 | Shield + Regen |
| | DEF Epic | D12 정화의 결계 | Nullify + Delayed GainAction |
| | DEF Legendary | D04 빛의 수호 | Shield + Immune Burn |
| | HEA Normal | H02 치유의 기원 | Heal 40 |
| | HEA Rare | H06 정화의 숨결 | Heal + Cleanse |
| | HEA Epic | H12 천위 강림 | Heal + Immune + Priority |
| | HEA Legendary | H04 축복 | Heal + Attack Buff |
| | SPC Normal | S01 빛의 영감 | Draw 2 |
| | SPC Rare | S05 전술 시계 | TempoBoost + Draw |
| | SPC Epic | S11 오라 공진 | Buff atk/speed + Draw |
| | SPC Legendary | S18 빛의 선언 | Immune All + GainAction |
| Kai | ATT Normal | A01 질풍 베기 | Damage 20 |
| | ATT Rare | A06 연쇄 전격 | Damage + Chain + Shock |
| | ATT Epic | A13 쇼크 공진 | Damage + Shock×2 + Tempo |
| | ATT Legendary | A19 시공 절단 | Damage + Delayed GainAction + Tempo |
| | DEF Normal | D01 전위 방벽 | Shield 20 |
| | DEF Rare | D07 충격 대응 | Shield + Shock(on hit) + Tempo |
| | DEF Epic | D14 회오리 반사 | Evasion + Damage + Shock |
| | DEF Legendary | D05 반응 장갑 전개 | ReactiveArmor + Guard |
| | HEA Normal | H01 응급 회복 | Heal 20 |
| | HEA Rare | H05 순풍 재생 | Heal overflow + Regen |
| | HEA Epic | H11 순환 촉진 | Heal + Regen + GainAction |
| | HEA Legendary | H10 시간 역행 | Heal + UndoDamage |
| | SPC Normal | S02 신속 배치 | GainAction 1 |
| | SPC Rare | S07 감응 증폭 | Apply Shock + GainAction 조건 |
| | SPC Epic | S05 전술 시계 | TempoBoost + Draw |
| | SPC Legendary | S21 천둥 각성 | TempoBoost + GainAction + Shock |
| Leon | ATT Normal | A01 용병의 베기 | Damage 20 |
| | ATT Rare | A09 룬식 충격 | Damage + Vulnerable + Delayed GainAction |
| | ATT Epic | A12 전술 연격 | Damage + Duplicate Attack + Self Heal |
| | ATT Legendary | A04 결전의 일격 | Execute |
| | DEF Normal | D02 반격 자세 | Counter |
| | DEF Rare | D09 철벽 방진 | Guard + Delayed GainAction |
| | DEF Epic | D11 속박 덫 | Guard + Apply Root |
| | DEF Legendary | D03 무효의 벽 | Nullify |
| | HEA Normal | H01 응급 치료 | Heal 20 |
| | HEA Rare | H07 생명 전이 | TransferHp + Heal |
| | HEA Epic | H09 불굴의 맹세 | Heal + Guard + Counter |
| | HEA Legendary | H04 축복 | Heal + Attack Buff |
| | SPC Normal | S02 전술 명령 | GainAction 1 |
| | SPC Rare | S03 더블캐스트 | DuplicateNext Attack |
| | SPC Epic | S12 기계 과부하 | GainAction + Damage + Self Vulnerable |
| | SPC Legendary | S13 미러 폴드 | StealCard |
| Lucian | ATT Normal | A01 기계화 참격 | Damage 20 |
| | ATT Rare | A08 합금 균열 | Damage + ArmorBreak |
| | ATT Epic | A15 열압 폭연 | Damage + Burn + Vulnerable |
| | ATT Legendary | A04 종결 프로토콜 | Execute |
| | DEF Normal | D01 강철 방벽 | Shield 20 |
| | DEF Rare | D05 반응 장갑 전개 | ReactiveArmor + Guard |
| | DEF Epic | D09 전술 재배치 | Guard + Delayed GainAction |
| | DEF Legendary | D12 차폐 매트릭스 | Nullify + GainAction on trigger |
| | HEA Normal | H01 응급 수리 | Heal 20 |
| | HEA Rare | H05 재생 코팅 | Heal overflow + Regen |
| | HEA Epic | H11 순환 촉진 | Heal + Regen + GainAction |
| | HEA Legendary | H10 시간 역행 프로토콜 | Heal + UndoDamage |
| | SPC Normal | S02 작전 지령 | GainAction 1 |
| | SPC Rare | S12 과부하 실행 | GainAction + Damage + Self Vulnerable |
| | SPC Epic | S20 합금 가속기 | TempoBoost + Shield + GainAction |
| | SPC Legendary | S21 과충전 돌격 | TempoBoost + GainAction + Shock |
| Marcus | ATT Normal | A01 전술 타격 | Damage 20 |
| | ATT Rare | A09 룬식 교란 | Damage + Vulnerable + Delayed GainAction |
| | ATT Epic | A13 자음 포화 | Damage + Shock×2 + Tempo |
| | ATT Legendary | A04 시간의 처단 | Execute |
| | DEF Normal | D01 전술 방벽 | Shield 20 |
| | DEF Rare | D09 재편 방진 | Guard + Delayed GainAction |
| | DEF Epic | D11 속박 지휘 | Guard + Apply Root |
| | DEF Legendary | D12 차원 차단 | Nullify + Delayed GainAction |
| | HEA Normal | H01 응급 재정비 | Heal 20 |
| | HEA Rare | H11 순환 재배치 | Heal + Regen + GainAction |
| | HEA Epic | H05 재생 코어 | Heal overflow + Regen |
| | HEA Legendary | H10 시간 회귀 프로토콜 | Heal + UndoDamage |
| | SPC Normal | S02 작전 지령 | GainAction 1 |
| | SPC Rare | S13 미러 폴드 | StealCard |
| | SPC Epic | S05 전술 시계 | TempoBoost + Draw |
| | SPC Legendary | S14 시간 정지 | GainAction + TurnSkip |
| Mira | ATT Normal | A01 그림자 찌르기 | Damage 20 |
| | ATT Rare | A14 유령 사격 | Damage + Evasion + Draw |
| | ATT Epic | A10 심연 흡혈 | Multi-hit Damage + Leech |
| | ATT Legendary | A05 혈월 침투 | Damage + Bleed |
| | DEF Normal | D01 은신 장막 | Shield 20 |
| | DEF Rare | D08 그림자 회피술 | Evasion + Counter |
| | DEF Epic | D11 속박 지휘 | Guard + Apply Root |
| | DEF Legendary | D12 차원 차단 | Nullify + Delayed GainAction |
| | HEA Normal | H01 응급 재정비 | Heal 20 |
| | HEA Rare | H07 생명 전이 | TransferHp + Shield |
| | HEA Epic | H13 그림자 봉합 | Heal + Evasion + Duplicate Defense |
| | HEA Legendary | H10 시간 회귀 의식 | Heal + UndoDamage |
| | SPC Normal | S02 은신 명령 | GainAction 1 |
| | SPC Rare | S09 영혼 소환 | Summon Wraith |
| | SPC Epic | S13 그림자 탈취 | StealCard |
| | SPC Legendary | S14 시간 전조 | GainAction + TurnSkip |
| Seraphina | ATT Normal | A01 그림자 일섬 | Damage 20 |
| | ATT Rare | A02 홍염 투척 | Damage + Burn |
| | ATT Epic | A05 혈월의 일격 | Damage + Bleed |
| | ATT Legendary | A03 영혼 폭발 | Damage + Burn×2 + Vulnerable |
| | DEF Normal | D01 어둠의 장막 | Shield 20 |
| | DEF Rare | D08 그림자 회피술 | Evasion + Counter |
| | DEF Epic | D14 월식 폭쇄 | Evasion + Damage + Shock |
| | DEF Legendary | D04 홍염 결계 | Shield + Burn Immune |
| | HEA Normal | H01 응급 치유 | Heal 20 |
| | HEA Rare | H08 월광 재생 | Heal + Regen + ApplyBleed |
| | HEA Epic | H13 그림자 봉합 | Heal + Evasion + Duplicate Defense |
| | HEA Legendary | H03 완전 회복 | Heal 60 |
| | SPC Normal | S02 긴급 지휘 | GainAction 1 |
| | SPC Rare | S01 전술 재정비 | Draw 2 |
| | SPC Epic | S19 황혼 선언 | Damage + Burn + Bleed |
| | SPC Legendary | S10 혼령 각성 | Revive + ApplyBleed |
| Seraphine | ATT Normal | A02 빛의 선율 | Damage + Burn |
| | ATT Rare | A07 빙결 아리아 | Damage + Freeze + Bonus vs Frozen |
| | ATT Epic | A11 성가의 일섬 | Damage + Cleanse + Attack Buff |
| | ATT Legendary | A18 천상의 레퀴엠 | Damage + Self Heal + Cleanse |
| | DEF Normal | D01 수호의 장막 | Shield 20 |
| | DEF Rare | D06 빙결 선율 보호 | Shield + Freeze(on hit) |
| | DEF Epic | D10 성가의 결계 | Shield + Regen |
| | DEF Legendary | D04 성스러운 포옹 | Shield + Burn Immune |
| | HEA Normal | H01 치유의 화음 | Heal 20 |
| | HEA Rare | H06 정화의 코러스 | Heal + Cleanse |
| | HEA Epic | H12 천상의 합창 | Heal + Immune + Priority |
| | HEA Legendary | H03 완전한 앙코르 | Heal 60 |
| | SPC Normal | S01 차분한 조율 | Draw 2 |
| | SPC Rare | S08 빙결 서곡 | Freeze + Nullify |
| | SPC Epic | S15 은빛 성가 | Regen + Cleanse |
| | SPC Legendary | S18 빛의 선언 | Immune + GainAction |

> **생략 안내**  
> 전체 12명 × 16슬롯 = 192행 분량이므로, 문서의 나머지 부분은 `docs/card_function_assignment_full.csv`(추후 작성)로 관리 예정입니다. 현재 표에는 Ariana, Darius, Elder, Elena, Garen, Iris, Kai, Leon, Lucian, Marcus, Mira 열한 캐릭터의 배치를 우선 공유했습니다.

## 3. 데이터 변경 전략

1. `cards.json`을 캐릭터/타입/레어도별로 정렬하여 기능 코드를 대응시킬 준비를 합니다.  
2. 각 카드에 대해:
   - `effects` 배열을 새로운 기능 정의에 맞게 교체
   - 필요시 `tags`, `keywords`, `effectText`, `levelCurve`, `vfxKey`, `sfxKey` 업데이트
   - 신규 필드(`hits`, `lifestealRatio`, `delayed`, `delayTurns`, `shield`, `guard` 등) 반영
3. 기능 확장으로 레어도/코스트 밸런스가 흔들리지 않도록 초기 수치(피해량, 코스트 등)를 표 기준으로 설정하고, 이후 테스트 결과에 따라 조정합니다.

## 4. 후속 TODO

- 전체 캐릭터 매핑 CSV 작성 및 공유  
- `cards.json` 대량 수정 (자동화 스크립트 고려)  
- 신규 기능별 최소 검증 카드 선정 및 수동 플레이 테스트  
- Summon/Nullify Trigger 등 고난도 효과 구현 범위 확정 (Step 4 전까지)

이 문서는 Step 3 진행을 위한 중간 산출물이며, 의견이 확정되면 CSV/JSON 작업을 이어서 진행합니다.

