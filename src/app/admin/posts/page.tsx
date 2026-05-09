import Link from 'next/link';
import { getAdminPosts } from '@/lib/queries';
import { fmtDate } from '@/lib/types';
import type { Category, PostStatus } from '@/lib/types';

export const metadata = { title: '글 관리 · kh.log admin' };

interface SearchParams { q?: string; cat?: string; status?: string }

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const posts = await getAdminPosts(sp);

  const tabs: { id: string | undefined; label: string }[] = [
    { id: undefined, label: '전체' },
    { id: 'PUBLISHED', label: '발행' },
    { id: 'DRAFT', label: '초안' },
    { id: 'PRIVATE', label: '비공개' },
  ];

  return (
    <>
      <header className="admin-h">
        <div>
          <div className="crumb">관리 / 글</div>
          <h1>글 ({posts.length})</h1>
        </div>
        <Link href="/admin/posts/new" className="btn solid">+ 새 글</Link>
      </header>

      <form style={{ display: 'flex', gap: 'var(--s-3)', marginBottom: 'var(--s-5)', flexWrap: 'wrap' }}>
        <input
          className="input"
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="제목 검색…"
          style={{ maxWidth: 280 }}
        />
        <select className="input" name="cat" defaultValue={sp.cat ?? ''} style={{ maxWidth: 140 }}>
          <option value="">모든 카테고리</option>
          <option value="KNOWLEDGE">지식</option>
          <option value="DIARY">일기</option>
          <option value="MEMO">메모</option>
        </select>
        <button type="submit" className="btn">필터</button>
        {(sp.q || sp.cat || sp.status) && (
          <Link href="/admin/posts" className="btn ghost">초기화</Link>
        )}
      </form>

      <div style={{ display: 'flex', gap: 'var(--s-2)', marginBottom: 'var(--s-5)' }}>
        {tabs.map((t) => {
          const active = (sp.status ?? '') === (t.id ?? '');
          const params = new URLSearchParams();
          if (sp.q) params.set('q', sp.q);
          if (sp.cat) params.set('cat', sp.cat);
          if (t.id) params.set('status', t.id);
          return (
            <Link
              key={t.label}
              href={`/admin/posts?${params}`}
              className={`btn ${active ? 'solid' : 'ghost'}`}
              style={{ padding: '5px 14px' }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>상태</th>
            <th>카테고리</th>
            <th>발행일</th>
            <th>수정일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="row-title">
                <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
              </td>
              <td><StatusTag status={p.status} /></td>
              <td><CatTag cat={p.category} /></td>
              <td className="t-meta">{p.publishedAt ? fmtDate(p.publishedAt) : '—'}</td>
              <td className="t-meta">{fmtDate(p.updatedAt)}</td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr><td colSpan={5} className="t-meta" style={{ textAlign: 'center', padding: 'var(--s-8) 0' }}>
              조건에 맞는 글이 없습니다.
            </td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function StatusTag({ status }: { status: PostStatus }) {
  const cls   = { DRAFT: 'draft', PUBLISHED: 'pub', PRIVATE: 'priv' } as const;
  const label = { DRAFT: '초안', PUBLISHED: '발행', PRIVATE: '비공개' } as const;
  return <span className={`tag ${cls[status]}`}>{label[status]}</span>;
}

function CatTag({ cat }: { cat: Category }) {
  const label = { KNOWLEDGE: '지식', DIARY: '일기', MEMO: '메모' } as const;
  return <span className={`tag ${cat.toLowerCase()}`}>{label[cat]}</span>;
}
