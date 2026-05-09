-- kh.log — seed data (mirrors the design's POSTS array)
-- Auto-applied by `supabase db reset --linked` after migrations.

insert into public.posts (slug, title, excerpt, category, status, read_minutes, likes, published_at, content_md) values
  ('editor-self', '에디터를 직접 만들기로 했다',
    '블록 기반 에디터를 자체 구현하기로 결정한 이유와, 거기서 마주친 데이터 모델 문제들을 정리한다.',
    'KNOWLEDGE', 'PUBLISHED', 7, 12, '2025-10-30 09:00:00+09',
    '회사에서 쓰는 위키와 개인 블로그의 글쓰기 환경이 점점 분리되는 게 신경 쓰였다.\n\n## 왜 직접 만드는가\n\nTiptap이나 Lexical 같은 잘 만들어진 라이브러리가 있는데도 직접 만들기로 결정한 이유는 단 하나다 — 글쓰기 환경 자체를 디자인 대상으로 두고 싶었기 때문이다.\n\n## 구조 결정\n\n저장 포맷은 두 갈래다.\n\n### 데이터 모델\n\n한 글은 `{ type, attrs, children }` 트리로 표현한다.\n\n### 렌더 전략\n\n읽기 화면은 캐시된 HTML을 그대로 내보내고, 관리자 화면은 JSON을 다시 트리로 들고 와서 편집한다.\n\n## 다음 단계\n\n우선 글 작성 → 발행 → 읽기까지의 순환만 닫고, 이미지 업로드와 자동 저장을 그 위에 얹을 계획이다.'),
  ('app-router-notes', 'Next.js App Router 메모',
    'Route Handlers와 Server Components를 실제 블로그에 적용하면서 정리한 짧은 메모.',
    'KNOWLEDGE', 'PUBLISHED', 12, 8, '2025-10-21 09:00:00+09',
    '## Server Components\n\n기본은 RSC, 인터랙션이 필요한 부분만 ''use client''.\n\n## Route Handlers\n\nGET/POST/PUT/DELETE를 같은 프로젝트 안에서 처리한다.'),
  ('autumn-short', '가을이 짧아진 것 같다',
    '아침에 두꺼운 옷을 꺼내다가 든 생각. 짧은 가을에 대해 길게 쓰는 일.',
    'DIARY', 'PUBLISHED', 4, 14, '2025-10-28 09:00:00+09',
    '아침에 일어나서 옷장을 열었다.\n\n## 가을\n\n해마다 가을이 짧아지고 있는 것 같다.'),
  ('rls-notes', 'Supabase RLS 실전 정리',
    'Row Level Security 정책을 작성하면서 자주 쓰인 패턴 다섯 가지.',
    'KNOWLEDGE', 'PUBLISHED', 9, 17, '2025-10-12 09:00:00+09',
    '## RLS 패턴\n\n1. 작성자만 수정\n2. 공개 글은 누구나 읽기\n3. 관리자는 모든 권한\n4. 익명 댓글은 visible만 insert\n5. View count 증가는 SECURITY DEFINER 함수로'),
  ('music', '요즘 듣는 음악들',
    '한 줄씩 메모로 쌓아둔 트랙 목록.',
    'MEMO', 'PUBLISHED', 2, 5, '2025-10-19 09:00:00+09',
    '- Tycho — Awake\n- Bonobo — Cirrus\n- Nils Frahm — Says'),
  ('tiptap', 'Tiptap을 보다',
    '직접 만들기 전에 검토한 에디터 라이브러리들.',
    'KNOWLEDGE', 'PUBLISHED', 5, 6, '2025-09-30 09:00:00+09',
    '## 검토한 라이브러리\n\n- Tiptap\n- Lexical\n- ProseMirror'),
  ('weekend-nothing', '이번 주말은 아무것도 안 했다',
    '아무것도 안 한 주말의 시간감각에 대하여.',
    'DIARY', 'PUBLISHED', 3, 11, '2025-10-26 09:00:00+09',
    '아무것도 안 했다.'),
  ('vercel-free', 'Vercel 무료 플랜 정리',
    '개인 블로그 기준 무료 플랜의 실제 한계선.',
    'KNOWLEDGE', 'PUBLISHED', 6, 9, '2025-09-18 09:00:00+09',
    '## 한계\n\n- 100GB 대역폭\n- 6,000분 빌드'),
  ('css-grid', 'CSS subgrid 실전',
    '카드 레이아웃을 subgrid로 다시 짜본 메모.',
    'KNOWLEDGE', 'PUBLISHED', 8, 11, '2025-09-05 09:00:00+09',
    '## subgrid\n\n중첩 grid에서 부모의 트랙을 따라간다.'),
  ('pg-index', 'Postgres 인덱스 다시 보기',
    'B-tree, GIN, BRIN을 실제 쿼리에 적용해보면서.',
    'KNOWLEDGE', 'PUBLISHED', 11, 14, '2025-08-20 09:00:00+09',
    '## 인덱스 종류\n\n- B-tree: 등호/범위\n- GIN: 배열/jsonb\n- BRIN: 큰 정렬된 데이터'),
  ('rain-cafe', '비 오는 날의 카페',
    '창가 자리에 앉아 두 시간을 보냈다. 아무것도 안 했다.',
    'DIARY', 'PUBLISHED', 3, 8, '2025-10-14 09:00:00+09',
    '비가 왔다.'),
  ('late-call', '늦은 통화',
    '오랜만에 친구와 한 시간을 통화했다.',
    'DIARY', 'PUBLISHED', 4, 9, '2025-10-05 09:00:00+09',
    '오랜만에.'),
  ('walk-han', '한강을 걸었다',
    '저녁 산책을 처음으로 길게.',
    'DIARY', 'PUBLISHED', 5, 11, '2025-09-22 09:00:00+09',
    '한강을 걸었다.'),
  ('reread', '다시 읽는 책',
    '같은 책을 두 번째 읽으면 다른 책이 된다.',
    'DIARY', 'PUBLISHED', 6, 16, '2025-09-08 09:00:00+09',
    '두 번째 읽기.'),
  ('summer-end', '여름의 끝',
    '8월의 마지막 일요일에 적은 짧은 글.',
    'DIARY', 'PUBLISHED', 3, 12, '2025-08-31 09:00:00+09',
    '여름이 끝났다.'),
  ('borges', '보르헤스에서',
    '"거울과 부성은 가증스럽다. 두 가지 모두 인간을 증식시키니까."',
    'MEMO', 'PUBLISHED', 1, 4, '2025-10-22 09:00:00+09',
    '> 거울과 부성은 가증스럽다. 두 가지 모두 인간을 증식시키니까.'),
  ('links-1031', '이번 주 본 링크들',
    '글 다섯 개, 영상 하나, 트위터 스레드 두 개.',
    'MEMO', 'PUBLISHED', 2, 3, '2025-10-31 09:00:00+09',
    '- 링크 1\n- 링크 2'),
  ('reading-list', '11월에 읽을 책',
    '도서관에서 빌려온 다섯 권을 책상에 쌓아두었다.',
    'MEMO', 'PUBLISHED', 1, 5, '2025-11-02 09:00:00+09',
    '도서관에서 빌렸다.'),
  ('one-line', '한 줄 메모 — 가을',
    '가을은 자주 어디로 가버리는 걸까.',
    'MEMO', 'PUBLISHED', 1, 7, '2025-10-08 09:00:00+09',
    '가을은 자주 어디로 가버리는 걸까.')
on conflict (slug) do nothing;

-- tags
insert into public.tags (name) values
  ('nextjs'), ('editor'), ('회고'), ('typescript'), ('react'), ('ssr'),
  ('일기'), ('supabase'), ('security'), ('postgres'), ('음악'), ('주말'),
  ('vercel'), ('deploy'), ('비용'), ('css'), ('layout'), ('database'),
  ('산책'), ('독서'), ('인용'), ('링크'), ('리스트'), ('한줄'), ('리뷰')
on conflict (name) do nothing;

-- post_tags
with s as (
  select p.id as post_id, t.id as tag_id
  from public.posts p
  join public.tags t on t.name = any (
    case p.slug
      when 'editor-self'   then array['nextjs','editor','회고','typescript']
      when 'app-router-notes' then array['nextjs','react','ssr']
      when 'autumn-short'  then array['일기']
      when 'rls-notes'     then array['supabase','security','postgres']
      when 'music'         then array['음악']
      when 'tiptap'        then array['editor','react','리뷰']
      when 'weekend-nothing' then array['일기','주말']
      when 'vercel-free'   then array['vercel','deploy','비용']
      when 'css-grid'      then array['css','layout']
      when 'pg-index'      then array['postgres','database']
      when 'rain-cafe'     then array['일기']
      when 'late-call'     then array['일기']
      when 'walk-han'      then array['일기','산책']
      when 'reread'        then array['일기','독서']
      when 'summer-end'    then array['일기']
      when 'borges'        then array['인용']
      when 'links-1031'    then array['링크']
      when 'reading-list'  then array['독서','리스트']
      when 'one-line'      then array['한줄']
      else array[]::text[]
    end
  )
)
insert into public.post_tags (post_id, tag_id) select post_id, tag_id from s
on conflict do nothing;

-- post_views
insert into public.post_views (post_id, view_count)
select id, case slug
  when 'editor-self' then 421
  when 'app-router-notes' then 318
  when 'autumn-short' then 96
  when 'rls-notes' then 502
  when 'music' then 71
  when 'tiptap' then 244
  when 'weekend-nothing' then 88
  when 'vercel-free' then 401
  when 'css-grid' then 287
  when 'pg-index' then 366
  when 'rain-cafe' then 64
  when 'late-call' then 52
  when 'walk-han' then 78
  when 'reread' then 102
  when 'summer-end' then 88
  when 'borges' then 39
  when 'links-1031' then 55
  when 'reading-list' then 41
  when 'one-line' then 28
  else 0
end
from public.posts
on conflict (post_id) do nothing;

-- a few sample comments
insert into public.comments (post_id, author_name, content) values
  ((select id from public.posts where slug='editor-self'), '익명1',
    '구조 결정 부분에 동의합니다. 캐시를 별도로 두는 게 핵심이네요.'),
  ((select id from public.posts where slug='editor-self'), '익명2',
    '저는 Tiptap 쓰고 있는데, 그래도 직접 만든다는 선택이 끌리네요.'),
  ((select id from public.posts where slug='editor-self'), '익명3',
    '다음 글 기다립니다.');
