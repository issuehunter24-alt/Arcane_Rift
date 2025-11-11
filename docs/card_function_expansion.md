# 카드 기능 확장 로드맵 (총 50종)

본 문서는 `docs/card_function_baseline.md`에서 정리한 16개 핵심 기능을 출발점으로, 캐릭터 콘셉트를 반영한 총 50종(기존 16 + 신규 34)의 카드 기능을 정의합니다. 각 항목은 구현 시 사용할 타입, 주요 효과 조합, 예상 주력 캐릭터(또는 파벌), 추가로 필요한 시스템 노트를 포함합니다.

> **표기 규칙**  
> - 번호 접두어는 카드 타입을 의미합니다: `A`=Attack, `D`=Defense, `H`=Heal, `S`=Special  
> - `(Legacy)` 표시는 현재 구현되어 있는 16개 기존 기능입니다.  
> - `New Effect` 표기에선 새 `CardEffect` 타입 또는 상태 키워드가 필요함을 뜻합니다.

---

## 공격 (Attack) – 15종

1. **A01. 기본 공격** (Legacy)  
   - 효과: `Damage 20`  
   - 캐릭터: 전원 공용

2. **A02. 파이어볼** (Legacy)  
   - 효과: `Damage 30` + `ApplyStatus Burn 1`  
   - 캐릭터: Ariana, Mira, Seraphina, Seraphine

3. **A03. 화염 폭발** (Legacy 개편)  
   - 효과: `Damage 36` + `ApplyStatus Burn stacks=2 duration=2` + `ApplyStatus Vulnerable stacks=1 duration=2`  
   - 캐릭터: Ariana, Seraphina, Iris  
   - 노트: 단일 보스전에 맞춘 강력한 화상 폭발기

4. **A04. 처형** (Legacy)  
   - 효과: `Damage 50` + `Conditional targetHp<=30% → Damage 30`  
   - 캐릭터: Darius, Marcus, Garen, Lucian

5. **A05. 혈월의 일격** (신규 구현됨)  
   - 효과: `Damage 26` + `ApplyBleed stacks=2 duration=2 dmgPer=6`  
   - 캐릭터: Seraphina, Mira  
   - 노트: 신규 `ApplyBleed` 이미 구현 완료

6. **A06. 폭풍 연격**  
   - 효과: `Damage 18` + `Chain targets=2 ratio=0.6` + `ApplyStatus Shock 1`  
   - 캐릭터: Kai, Elder  
   - 노트: Shock 스택이 누적 시 다음 공격 데미지를 증폭하도록 설계

7. **A07. 얼음 척살**  
   - 효과: `Damage 24` + `ApplyStatus Freeze duration=1` + `Conditional targetFrozen → Damage 10`  
   - 캐릭터: Elena, Seraphine  
   - 노트: Freeze 키워드 재활용

8. **A08. 균열 투척**  
   - 효과: `Damage 22` + `ArmorBreak guard=15 shield=15` *(New Effect)*  
   - 캐릭터: Lucian, Garen  
   - 노트: 적의 Guard/Shield를 고정값만큼 제거하는 신규 효과 필요

9. **A09. 룬식 충격**  
   - 효과: `Damage 20` + `ApplyStatus Vulnerable stacks=1 duration=2` + `GainAction value=1 delayed=true delayTurns=1`  
   - 캐릭터: Marcus, Leon  
   - 노트: 다음 턴 행동력을 선충전하는 룬 기동

10. **A10. 심연 파동**  
    - 효과: `Damage 16` (multi-hit 4×4) + `Leech ratio=0.5` *(New Effect)*  
    - 캐릭터: Darius, Mira  
    - 노트: 누적 히트 기반 흡혈. `Leech`는 가한 피해 비례 회복

11. **A11. 성광 일섬**  
    - 효과: `Damage 28` + `Cleanse maxStacks=2 (self)` + `Buff stat=attack value=10 duration=1`  
    - 캐릭터: Iris, Seraphine  
    - 노트: 공격형 클렌즈, 광휘 콘셉트

12. **A12. 용연 연격**  
    - 효과: `Damage 15` + `DuplicateNext typeFilter=Attack times=1` + `Heal value=5 self`  
    - 캐릭터: Leon, Garen  
    - 노트: 공격 후 다음 공격을 준비시키는 전사 콘셉트

13. **A13. 자음 포화**  
    - 효과: `Damage 30` + `ApplyStatus Shock stacks=2` + `TempoBoost amount=1 turns=1`  
    - 캐릭터: Kai, Marcus  
    - 노트: Shock 스택과 에너지 가속 시너지

14. **A14. 유리령 사격**  
    - 효과: `Damage 18` + `Evasion charges=1 duration=1 (self)` + `Draw value=1`  
    - 캐릭터: Mira  
    - 노트: 은신 사격, 다음 턴 생존 보조
15. **A15. 연성 폭연**  
    - 효과: `Damage 22` + `ApplyStatus Burn 1` + `ApplyStatus Vulnerable stacks=1 duration=1`  
    - 캐릭터: Ariana, Lucian  
    - 노트: 화상과 방어 연성 콘셉트

16. **A16. 한기 관통**  
   - 효과: `Damage 26` + `ApplyStatus Freeze duration=1 target=enemy` + `ApplyStatus Vulnerable stacks=1 duration=2 target=enemy`  
   - 캐릭터: Elena  
   - 노트: 단일 대상의 방어력을 낮추면서 빙결을 부여

17. **A17. 절대 영도**  
   - 효과: `Damage 30` + `TempoBoost amount=1 turns=1 scope='self'` + `ApplyStatus Freeze duration=2 target=enemy`  
   - 캐릭터: Elena  
   - 노트: 강력한 일격 후 속도를 끌어올리며 장기 빙결 적용

18. **A18. 성광 파동**  
   - 효과: `Damage 26` + `Heal value=10` (self) + `Cleanse maxStacks=2`  
   - 캐릭터: Iris, Seraphine  
   - 노트: 공격과 동시에 자신을 정화하며 회복하는 빛 속성 일격

19. **A19. 시공 절단**  
   - 효과: `Damage 28` + `GainAction value=1 delayed=true delayTurns=1` + `TempoBoost amount=1 turns=2 scope='self'`  
   - 캐릭터: Kai  
   - 노트: 순간 가속을 준비하면서 다음 턴 에너지 흐름을 앞당김

18. **A18. 성광 파동**  
   - 효과: `Damage 26` + `Heal value=10` (self) + `Cleanse maxStacks=2`  
   - 캐릭터: Iris  
   - 노트: 공격과 동시에 자신을 정화하며 회복하는 빛 속성 일격

---

## 방어 (Defense) – 12종

1. **D01. 방패 올리기** (Legacy)  
   - 효과: `Shield 20 duration=1`

2. **D02. 받아치기** (Legacy)  
   - 효과: `Counter 20 duration=1`  
   - 캐릭터: Darius, Leon

3. **D03. 무효의 벽** (Legacy)  
   - 효과: `Nullify times=1`  
   - 캐릭터: Ariana, Leon

4. **D04. 성스러운 보호** (Legacy)  
   - 효과: `Shield 40 duration=2` + `Immune keywords=['Burn'] duration=1`  
   - 캐릭터: Ariana, Iris, Seraphina, Seraphine

5. **D05. 반응 장갑 전개** (신규 구현됨)  
   - 효과: `ReactiveArmor charges=2 reflect=35% shield=25% duration=2` + `Guard 8 duration=2`  
   - 캐릭터: Lucian, Kai

6. **D06. 결빙 장막**  
   - 효과: `Shield 18 duration=2` + `ApplyStatus Freeze duration=1 (attacker on hit)` *(New Trigger: onHit)*  
   - 캐릭터: Elena, Seraphine

7. **D07. 천벌 결계**  
   - 효과: `Shield 25 duration=2` + `ApplyStatus Shock stacks=1 (attacker)` + `TempoBoost amount=1 turns=1` *(self)*  
   - 캐릭터: Kai, Elder

8. **D08. 그림자 회피술**  
   - 효과: `Evasion charges=2 duration=1` + `Counter value=12 duration=1`  
   - 캐릭터: Seraphina, Mira

9. **D09. 철벽 방진**  
   - 효과: `Guard 18 duration=2` + `GainAction value=1` (next turn only)  
   - 캐릭터: Garen, Leon, Lucian, Marcus  
   - 노트: 턴 종료 시 에너지 반환 로직 필요

10. **D10. 성역 구축**  
    - 효과: `Shield 30 duration=3` + `Regen value=5 duration=3`  
    - 캐릭터: Iris, Seraphine

11. **D11. 속박 덫**  
    - 효과: `Guard 10 duration=2` + `ApplyStatus Root duration=1` *(New Status)*  
    - 캐릭터: Marcus, Mira  
    - 노트: Root는 이동/회피 차단, 우선순위 -1 등 효과 설계 필요

12. **D12. 마력 역류**  
   - 효과: `Nullify times=1` + `GainAction value=1 delayed`  
   - 캐릭터: Ariana, Marcus, Iris, Lucian  
    - 노트: Nullify 성공 시 보상 트리거

13. **D13. 지각 단층**  
    - 효과: `Shield 20 duration=2` + `ApplyStatus Vulnerable stacks=1 duration=2 (attacker)`  
    - 캐릭터: Darius, Garen

14. **D14. 회오리 방출**  
   - 효과: `Evasion charges=1 duration=1` + `Damage 16` + `ApplyStatus Shock stacks=1 duration=2`  
   - 캐릭터: Kai, Elder, Elena, Seraphina  
   - 노트: 회피 후 단일 적에게 쇼크를 부여하는 반격형 기술

16. **D16. 얼음 결계**  
   - 효과: `Shield 35 duration=2` + `OnHitStatus Freeze duration=1 chance=100` + `Nullify times=1`  
   - 캐릭터: Elena  
   - 노트: 공격을 막아내며 적을 즉시 동결시키고 다음 공격을 무효화

15. **D15. 폭풍심 재가동**  
   - 효과: `Shield 30 duration=2` + `TempoBoost amount=2 turns=2` + `ApplyStatus Shock stacks=1 duration=2 target=enemy`  
   - 캐릭터: Elder  
   - 노트: 방패로 충격을 흡수하며 템포를 끌어올린 뒤 공격자에게 쇼크 확산

---

## 회복 (Heal) – 11종

1. **H01. 기본 회복** (Legacy) – `Heal 20`  
2. **H02. 강한 회복** (Legacy) – `Heal 40`  
3. **H03. 완전 회복** (Legacy) – `Heal 60`  
4. **H04. 축복** (Legacy) – `Heal 60` + `Buff attack +20% duration=2`  
5. **H05. 빛의 넘침** (신규 구현됨) – `Heal 24 overflow→Shield` + `Regen 6 duration=2`  
   - 캐릭터: Ariana, Lucian, Kai, Marcus

6. **H06. 정화의 숨결**  
   - 효과: `Heal 25` + `Cleanse maxStacks=3 self`  
   - 캐릭터: Iris, Seraphine

7. **H07. 생명 전이**  
   - 효과: `TransferHp value=25 from=player to=ally` *(coop future)* + `Shield 15 ally`  
   - 캐릭터: Mira, Leon  
   - 노트: 현재 1v1 기준 self-target 형태로 구현 (HP를 적에게서 훔치도록 수정 가능)

8. **H08. 월광 재생**  
   - 효과: `Heal 18` + `Regen 8 duration=3` + `ApplyBleed stacks=1 (enemy)`  
   - 캐릭터: Seraphina  
   - 노트: 흡혈 + 딜 하이브리드

9. **H09. 불굴의 맹세**  
   - 효과: `Heal 20` + `Guard 12 duration=2` + `Counter 15 duration=1`  
   - 캐릭터: Garen, Leon

10. **H10. 시간 회귀**  
    - 효과: `Heal 30` + `UndoDamage percent=30 lastTurn` *(New Effect)*  
    - 캐릭터: Marcus, Kai, Lucian, Mira  
    - 노트: 직전 턴 받은 피해의 일부를 복원

11. **H11. 연금 촉진**  
    - 효과: `Heal 18` + `Regen value=4 duration=2` + `GainAction value=1`  
    - 캐릭터: Ariana, Lucian, Kai, Marcus  
    - 노트: 적을 치유하지 않는 단일 회복 버스트

12. **H12. 천위 강림**  
    - 효과: `Heal 35` + `Immune keywords=['Burn','Shock'] duration=1` + `PriorityBoost value=1 duration=1`  
    - 캐릭터: Seraphine, Iris

13. **H13. 그림자 봉합**  
    - 효과: `Heal 18` + `Evasion charges=1 duration=1` + `DuplicateNext typeFilter=Defense times=1`  
    - 캐릭터: Mira, Seraphina

---

## 특수 (Special) – 12종

1. **S01. 추가 드로우** (Legacy) – `Draw 2`  
2. **S02. 행동력 증가** (Legacy) – `GainAction 1`  
3. **S03. 더블캐스트** (Legacy) – `DuplicateNext Attack 1`  
4. **S04. 복제** (Legacy) – `CopyCard deck→hand filter=Attack`  

5. **S05. 전술 시계** (신규 구현됨)  
   - 효과: `TempoBoost amount=2 turns=2` + `Draw 1`  
   - 캐릭터: Marcus, Elder, Iris, Kai

6. **S06. 원소 전환**  
   - 효과: `ElementShift from='Fire' to='Lightning' duration=2` + `Damage 15`  
   - 캐릭터: Ariana, Elder  
   - 노트: 속성 시너지 시스템 활용

7. **S07. 감응 증폭**  
   - 효과: `ApplyStatus Shock stacks=1 duration=2` + `Conditional targetShocked → GainAction value=1`  
   - 캐릭터: Kai, Marcus  
   - 노트: 쇼크 상태 적에게 추가 에너지 회수

8. **S08. 빙정 봉인**  
   - 효과: `ApplyStatus Freeze duration=1` + `Nullify times=1 (next attack)`  
   - 캐릭터: Elena, Seraphine

9. **S09. 혼령 소환**  
   - 효과: `Summon wraith attack=12 hp=20 duration=2` *(New Effect: Summon)*  
   - 캐릭터: Darius, Mira  
   - 노트: 소환수는 턴 종료 시 자동 공격

10. **S10. 사령 개시**  
    - 효과: `Revive value=20 chance=100` (self) + `ApplyBleed stacks=2 (enemy)`  
    - 캐릭터: Darius, Seraphina  
    - 노트: 체력 0 시 한 번 부활하는 버프

11. **S11. 오라 공진**  
   - 효과: `Buff stat=attack value=15 duration=2` + `Buff stat=speed value=10 duration=2` + `Draw 1`  
   - 캐릭터: Iris, Seraphine, Garen

12. **S12. 기계 과부하**  
    - 효과: `GainAction value=1` + `Damage 16` + `ApplyStatus Vulnerable stacks=1 duration=1` (self)  
    - 캐릭터: Lucian, Leon  
    - 노트: 단일 대상 폭딜과 리스크(자신 취약) 동시 부여

13. **S13. 미러 폴드**  
   - 효과: `CopyCard opponentHand→playerHand filter=lowestCost` *(New Effect: StealCard)*  
   - 캐릭터: Mira, Marcus, Leon  
    - 노트: PvP/AI 대전 시 재미 요소

14. **S14. 시간 정지**  
    - 효과: `GainAction value=2` + `SkipEnemyTurn chance=40%` *(New Effect: TurnSkip)`  
    - 캐릭터: Marcus, Kai, Mira  
    - 노트: 강력한 특수기로 전투 흐름 변조

15. **S15. 은빛 성가**  
    - 효과: `Regen value=5 duration=3` (팀) + `Cleanse maxStacks=2` (팀)  
    - 캐릭터: Seraphine, Iris  
    - 노트: PvE/Co-op 고려 범위

16. **S16. 전술 리사이클**  
    - 효과: `Draw value=2` + `Discard value=2` + `GainAction value=1 (if discarded defense)`  
    - 캐릭터: Leon, Marcus  
    - 노트: 덱 필터링에 특화된 기능

17. **S17. 그림자 각인**  
    - 효과: `ApplyStatus Mark stacks=1 duration=3` *(New Status: Marked)* + `DamageTakenBoost 20%` *(New Effect)*  
    - 캐릭터: Seraphina, Mira  
    - 노트: 이후 공격마다 추가 피해

18. **S18. 빛의 선언**  
    - 효과: `Immune keywords=['Burn','Bleed','Shock'] duration=2` + `GainAction value=1`  
    - 캐릭터: Seraphine, Iris

19. **S19. 황혼 선포**  
    - 효과: `ApplyStatus Burn 1` + `ApplyStatus Bleed 1` + `Damage 12`  
    - 캐릭터: Darius, Seraphina  
    - 노트: 이중 도트 부여

20. **S20. 합금 가속기**  
   - 효과: `TempoBoost amount=1 turns=3` + `Shield 10 duration=3` + `GainAction value=1 (첫 턴)`  
   - 캐릭터: Lucian, Garen

21. **S21. 천둥 각성**  
   - 효과: `TempoBoost amount=2 turns=2` + `GainAction value=1` + `ApplyStatus Shock stacks=1 duration=2 target=enemy`  
   - 캐릭터: Elder, Kai, Lucian  
   - 노트: 즉시 행동력을 확보하고 적에게 쇼크를 부여해 연계 화력을 극대화

22. **S22. 빙하 각성**  
   - 효과: `GainAction value=1` + `TempoBoost amount=1 turns=1 scope='self'` + `ApplyStatus Freeze duration=1 target=enemy`  
   - 캐릭터: Elena  
   - 노트: 즉시 행동 후 적을 빙결시켜 반격을 차단

23. **S23. 서릿빛 공명**  
   - 효과: `TempoBoost amount=1 turns=2 scope='self'` + `Draw value=1` + `ApplyStatus Freeze duration=1 target=enemy`  
   - 캐릭터: Elena  
   - 노트: 속도를 조율하며 적의 움직임을 묶는 특수기

24. **S24. 결의의 함성**  
   - 효과: `Guard value=15 duration=2` + `Buff stat=attack value=15 duration=2` + `GainAction value=1 delayed=true delayTurns=1`  
   - 캐릭터: Garen, Leon  
   - 노트: 전투 태세를 정비하며 다음 턴 에너지 이득을 준비

---

## 차후 작업 제안

1. **효과 스키마 확장**: `ArmorBreak`, `Leech`, `UndoDamage`, `Summon`, `StealCard`, `TurnSkip`, `Mark` 등 신규 타입/상태 명세를 `src/types.ts` 및 `store.ts`에 추가.  
2. **카드 배치 계획**: 각 캐릭터별로 타입/레어도 비율을 재조정하여 168장의 카드에 고르게 분배.  
3. **테스트 시나리오**: 신규 효과별 유닛 테스트/시뮬레이션 케이스 작성 (`__tests__` 확장).  
4. **아트 & 에셋**: 새로운 카드명에 맞춘 일러스트/아이콘 준비, ImageMagick 스크립트가 `cards.json`을 직접 참조하도록 개편.  
5. **튜토리얼 & 툴팁**: 다변화된 기능을 소개하는 UI/툴팁, 튜토리얼 업데이트.

이 로드맵을 토대로 단계별 구현 범위를 선정하면, 기능 다양성을 확보하면서도 캐릭터 아이덴티티를 강화할 수 있습니다.

