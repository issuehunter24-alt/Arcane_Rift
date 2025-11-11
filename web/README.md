Web MVP - Gals Card Game

1) Prerequisites
- Node.js 18+

2) Setup
- cd D:\AI_Projects\Gals\web
- npm i (or pnpm i)
- `.env.local` 생성 후 Supabase 키 입력
  ```
  VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```
- npm run dev (포트 5173 고정)

Supabase 설정 참고
- 프로젝트 생성 후 Authentication → Email/Password 활성화
- Table editor에서 `profiles`, `saves`, `collections`, `daily_progress`, `match_history` 테이블 생성 (문서 스펙 참조)
- 각 테이블 Row Level Security 활성화 및 `auth.uid()` 기반 정책 적용
  - 예시: `saves` 테이블 → `user_id uuid references auth.users primary key`, `save_blob jsonb`, `updated_at timestamptz default now()`
    ```sql
    create table if not exists public.saves (
      user_id uuid primary key references auth.users on delete cascade,
      save_blob jsonb not null,
      updated_at timestamptz not null default now()
    );

    alter table public.saves enable row level security;
    create policy "Users manage own save" on public.saves
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    ```
- Edge Function/Storage는 추후 확장 시 사용

Quick setup (Windows):
- PowerShell: D:\AI_Projects\Gals\Scripts\SetupWeb.ps1 -Root D:\AI_Projects\Gals

3) Assets
- Prepare public assets: copy PNG cards to web/public/cards
- Use the provided PowerShell: D:\AI_Projects\Gals\Scripts\PrepareWebAssets.ps1
 - Optional: Convert to WebP: D:\AI_Projects\Gals\Scripts\ConvertCardsToWebP.ps1

NPM scripts
- npm run prepare:png   # copy PNG cards to web/public/cards
- npm run convert:webp  # convert PNGs to WebP in web/public/cards
- npm run assets        # run both of the above
- npm run dev:full      # assets + start dev server
- npm run build:full    # assets + production build

4) Run
- Open the dev URL (default http://localhost:5173)
- 최초 실행 시 이메일/비밀번호로 로그인하거나 회원가입 후 게임 화면 진입
- 로그인 후 PixiJS 캔버스와 HUD(에너지/라운드 표시)를 확인

Node/NPM PATH 이슈 시:
- PowerShell(대안):
  - powershell -NoLogo -NoProfile -Command "Set-Location 'D:\\AI_Projects\\Gals\\web'; & 'C:\\Program Files\\nodejs\\node.exe' .\\node_modules\\vite\\bin\\vite.js --strictPort --port 5173"
  - 위 명령은 PATH 설정 없이도 실행됩니다.

5) Deploy (static hosting)
- Build zipped artifact: npm run build:zip (outputs web/dist.zip)
- Preview production build locally: npm run preview:dist (http://localhost:4173)


