# Git 버전 관리 방침 (Arcane Rift)

## 1. 필수 원칙
- 모든 변경 사항은 Git으로 추적한다.
- 로컬 변경 → 커밋 → 원격 저장소(`origin`)에 푸시한다.
- 주요 기능/수정은 브랜치를 분리해서 작업 후 `main`에 머지한다.

## 2. 브랜치 전략
| 용도 | 브랜치 이름 규칙 | 설명 |
|------|-------------------|------|
| 기본 브랜치 | `main` | 배포 가능한 안정 버전 유지. |
| 기능 | `feature/<topic>` | 예: `feature/add-mailbox`. 단위 기능 개발. |
| 버그 수정 | `fix/<issue>` | 예: `fix/login-error`. 재현 가능한 버그 수정. |
| 긴급 핫픽스 | `hotfix/<issue>` | 배포 후 문제 발생 시 즉시 대응. |

## 3. 커밋 규칙
1. 작은 단위로 커밋하고 관련 변경만 포함.
2. 커밋 메시지 형식:  
   ```
   <태그>: <간결한 설명>
   ```
   - 태그 예시: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`.
   - 예: `feat: add announcement modal on menu`.
3. 본문(선택): 상세 설명, 테스트 결과, 이슈 번호 등을 추가.
4. 커밋 전 `git status`로 추적 내용 확인. 불필요한 파일은 `.gitignore`에 추가.

## 4. Pull Request(선택)
- 팀 협업 시 기능/버그 브랜치 → PR → 코드 리뷰 후 `main`으로 머지.
- 리뷰 항목: 동작 확인, 영향 범위, 코드 스타일, 테스트 여부.

## 5. 버전 태그
- 릴리스 시 `vX.Y.Z` 형식 태그 사용.  
  예: `git tag v0.1.0 && git push origin v0.1.0`.
- 주요 기능/버그 수정 누적 후 배포 단위로 태그 부여.

## 6. 작업 흐름 예시
```
# 1. 최신 내용 받기
git fetch origin
git checkout main
git pull

# 2. 브랜치 생성
git checkout -b feature/add-mailbox

# 3. 작업 & 커밋
git add .
git commit -m "feat: add mailbox API endpoints"

# 4. 브랜치 푸시
git push -u origin feature/add-mailbox

# 5. PR 생성 후 리뷰/머지
```

## 7. 권장 도구 & 참고
- Git GUI (GitKraken, SourceTree) 사용 OK.
- GitHub Actions, 레포 설정 등은 추후 문서에 업데이트.
- 추가 요청/개정 사항은 `docs/git_versioning_guidelines.md` PR 로 제안.

