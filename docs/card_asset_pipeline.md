# Card Asset Pipeline (2025-11-10)

카드 이미지/사운드 자산을 최신 카드 데이터에 맞게 동기화하는 절차와 스크립트 동작을 정리했습니다.

## 1. 이미지 생성 및 정리

| 단계 | 명령어 | 설명 |
| --- | --- | --- |
| 카드 데이터 → 템플릿 이미지 | `powershell -ExecutionPolicy Bypass -File ./Scripts/BuildAllCharacterCards.ps1` | `web/public/data/cards.json`을 읽어 카드 명/효과/코스트를 카드 템플릿에 렌더링 (PNG) |
| 캐릭터별 PNG 정리 | `npm run prepare:png` | `Scripts/PrepareWebAssets.ps1` 실행. `Cards/Characters/**/final_*.png`을 평탄화하여 `web/public/cards/<Character>_<Type>_<Rarity>.png`로 복사 |
| WebP 변환 | `npm run convert:webp` | `Scripts/ConvertCardsToWebP.ps1` 실행. `web/public/cards`에 있는 PNG가 최신이면 WebP로 변환 |

### 카드 뒷면(`card_back`) 관리

- `Scripts/PrepareWebAssets.ps1`는 카드 템플릿 이미지를 복사하면서 공용 리소스인 `card_back.png`, `card_back.webp`는 **삭제하지 않습니다**.  
- 만약 파일이 누락된 경우 자동으로 `web/dist/cards/`에서 복원하려고 시도합니다.  
- 기본 파일 위치:  
  - `web/public/cards/card_back.png`  
  - `web/public/cards/card_back.webp`

필요 시 커스텀 카드 뒷면을 `web/public/cards/`에 같은 이름으로 배치한 뒤 `npm run prepare:png`를 다시 실행하세요.

## 2. 런타임 로더 (`web/src/assetLoader.ts`)

- 카드 전면 이미지는 `cards/<Character>_<Type>_<Rarity>.webp` → PNG 순으로 로딩
- 카드 뒷면 이미지는 `getCardBackImage()`에서 위의 `card_back.*` 파일을 사용
- 로딩 실패 시 `manifest.failed`에 기록되며 콘솔 경고 출력

## 3. 자주 발생하는 문제

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 카드 이미지가 회색 (미로딩) | `cards.json`의 ID와 파일명 불일치 | `BuildAllCharacterCards.ps1` → `npm run prepare:png` 실행 |
| 카드 뒷면이 투명 | `card_back.*` 삭제됨 | `npm run prepare:png` 실행 또는 `web/dist/cards`에서 수동 복사 |
| 82장 이미지 로딩 실패 | 신규 캐릭터/타입 PNG 미생성 | `BuildAllCharacterCards.ps1` 재실행 후 WebP 변환 |

---

향후 카드 템플릿을 분리하거나 타입 아이콘을 교체할 때 이 문서를 업데이트해 주세요.

