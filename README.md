# kh.log

**차분한 다목적 개인 블로그** — 지식 / 일기 / 메모.

기획문서: [`nextjs-vercel-personal-blog-plan.md`](./nextjs-vercel-personal-blog-plan.md)
디자인 출처: Claude Design 핸드오프 번들 (hifi: Home A · 지식 B / 일기 D / 메모 A · Detail A · About B · ⌘K)

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| 데이터 | Supabase Postgres + Auth + Storage |
| 배포 | Vercel |
| 폰트 | Pretendard · IBM Plex Sans KR · JetBrains Mono |

## 시작하기

```bash
# 1. 의존성
npm install

# 2. 환경변수
cp .env.example .env.local
# Supabase Dashboard → Project Settings → API Keys 에서 채우기:
#   NEXT_PUBLIC_SUPABASE_URL              = Project URL
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  = sb_publishable_... (구 anon key)
#   SUPABASE_SECRET_KEY                   = sb_secret_...      (구 service_role)

# 3. Supabase 프로젝트 연결 (Settings → General → Reference ID 사용)
#    `supabase login` 한 번 (브라우저 인증), 그 다음 link.
npx supabase login
npm run db:link        # 프로젝트 ref 입력 → DB 비밀번호 입력
# 또는: npx supabase link --project-ref <your-ref>

# 4. 스키마 + seed 적용
npm run db:reset       # 마이그레이션 + seed.sql 모두 자동 실행

# 5. 관리자 계정
#    Supabase Dashboard → Auth → Users → Add user (email + password)

# 6. 개발 서버
npm run dev
```

## DB 마이그레이션 (Supabase CLI)

| 명령 | 무엇을 하는가 |
|---|---|
| `npm run db:link` | 로컬 프로젝트를 Supabase 프로젝트와 연결 (한 번만) |
| `npm run db:push` | `supabase/migrations/*.sql` 의 새 파일들을 원격에 적용 (seed 미적용) |
| `npm run db:reset` | 원격 DB 초기화 + 모든 마이그레이션 + `seed.sql` 까지 적용 (개발 단계용) |
| `npm run db:diff` | 원격과 로컬 마이그레이션 간 차이 SQL 출력 |
| `npm run db:types` | DB 스키마 → `src/lib/supabase/types.ts` TypeScript 타입 생성 |

**새 변경 추가하기**:
```bash
# 1. 새 마이그레이션 파일 생성
npx supabase migration new add_thumbnails

# 2. supabase/migrations/<timestamp>_add_thumbnails.sql 편집

# 3. 원격에 적용
npm run db:push
```

`supabase/seed.sql` 은 `db:reset` 시에만 실행됩니다 — 운영 데이터는 절대 reset 하지 마세요.

## 라우트

### 공개
- `/` — 홈 (히어로 + 이전 글)
- `/knowledge` · `/diary` · `/memo` — 카테고리별 (지식은 태그 사이드바, 일기는 월별 타임라인, 메모는 단순 리스트)
- `/<cat>/<slug>` — 글 상세 (TOC, 좋아요, 공유, 댓글)
- `/about` — 메타 페이지
- `/feed.xml` — RSS

### 관리자 (Supabase Auth 로그인 필요)
- `/admin/login`
- `/admin` — 대시보드
- `/admin/posts` · `/admin/posts/new` · `/admin/posts/[id]` — 에디터
- `/admin/comments`

## 코드 컨벤션

- **TypeScript 필드명: camelCase** — 예: `publishedAt`, `readMinutes`, `authorName`
- **DB 컬럼: snake_case** — 예: `published_at`, `read_minutes`, `author_name`
- **경계 매핑**: `src/lib/queries.ts` 의 `mapPost`/`mapComment`/`mapListItem` 이 Supabase row → 도메인 타입 변환을 담당. 그 외 어디서도 snake_case 가 보이지 않아야 함.

## 디자인 시스템

`src/app/globals.css` — 토큰 + 컴포넌트 + 모바일까지 한 파일.

- 흑백 베이스 + 카테고리당 한 점 (`--cat-knowledge` 청록 / `--cat-diary` 테라코타 / `--cat-memo` 모스 그린)
- `<body data-cat>` 로 배경 미세 틴트, `<body data-mode>` 로 라이트/다크
- 본문 17px Pretendard / line-height 1.85, 제목 IBM Plex Sans KR
- 모바일: TOC 우하단 FAB, 태그 가로 스크롤

## 다음 단계

- [x] 리치 에디터 (Tiptap) + 슬래시 명령어
- [x] 이미지 업로드 (Supabase Storage)
- [ ] 자동 저장 (debounced)
- [ ] 시리즈 / 방명록
- [ ] 뉴스레터
- [ ] 풀텍스트 검색 (`tsvector`)
- [ ] sitemap.xml

## 에디터

`/admin/posts/new` 또는 `/admin/posts/[id]` 에서 Tiptap 기반 블록 에디터:

- **슬래시 명령어**: 빈 줄에서 `/` 누르면 블록 메뉴 (제목/리스트/체크리스트/인용/코드블록/구분선/이미지)
- **이미지**: 툴바의 "이미지" 버튼, 또는 클립보드 붙여넣기, 드래그앤드롭. 모두 `post-images` Supabase Storage 버킷으로 업로드 후 본문에 임베드
- **코드블록**: lowlight syntax highlighting (JS/TS/Python/SQL/HTML/CSS 등 common 언어 묶음)
- **저장 포맷**: Tiptap 의 HTML 을 `posts.content_html` 에 그대로 저장. `addHeadingIds()` 가 서버에서 h2/h3 에 자동으로 `id` 부여 → TOC 동작
