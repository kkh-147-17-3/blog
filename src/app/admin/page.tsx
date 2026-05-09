import Link from 'next/link';
import { getAdminCounts, getAdminRecentPosts, getAdminRecentComments } from '@/lib/queries';
import { fmtDate } from '@/lib/types';
import type { Category, PostStatus } from '@/lib/types';

export const metadata = { title: '대시보드 · kh.log admin' };

export default async function AdminDashboardPage() {
  const [counts, recent, recentComments] = await Promise.all([
    getAdminCounts(),
    getAdminRecentPosts(8),
    getAdminRecentComments(5),
  ]);

  return (
    <>
      <header className="admin-h">
        <div>
          <div className="crumb">대시보드</div>
          <h1>안녕하세요</h1>
        </div>
        <Link href="/admin/posts/new" className="btn solid">+ 새 글</Link>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', marginBottom: 'var(--s-8)' }}>
        <Stat label="전체 글" num={counts.totalPosts} />
        <Stat label="발행" num={counts.published} />
        <Stat label="초안" num={counts.drafts} />
        <Stat label="댓글" num={counts.comments} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-6)' }}>
        <div>
          <div className="t-meta-up" style={{ marginBottom: 'var(--s-3)' }}>최근 글</div>
          <table className="admin-table">
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td className="row-title">
                    <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                  </td>
                  <td><StatusTag status={p.status} /></td>
                  <td><CatTag cat={p.category} /></td>
                  <td className="t-meta">{fmtDate(p.updatedAt)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={4} className="t-meta" style={{ textAlign: 'center', padding: 'var(--s-6) 0' }}>
                  아직 글이 없습니다.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className="t-meta-up" style={{ marginBottom: 'var(--s-3)' }}>최근 댓글</div>
          <div>
            {recentComments.map((c) => (
              <div key={c.id} style={{ padding: 'var(--s-3) 0', borderTop: '1px solid var(--rule-soft)' }}>
                <div className="card-meta" style={{ margin: 0, marginBottom: 4 }}>
                  <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{c.authorName || '익명'}</strong>
                  <span className="dot" />
                  <span>{fmtDate(c.createdAt)}</span>
                </div>
                <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-2)' }}>{c.content}</div>
              </div>
            ))}
            {recentComments.length === 0 && (
              <div className="t-meta" style={{ padding: 'var(--s-6) 0' }}>아직 댓글이 없습니다.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, num }: { label: string; num: number }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="num">{num}</div>
    </div>
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
