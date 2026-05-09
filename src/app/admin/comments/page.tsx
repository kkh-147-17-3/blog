import Link from 'next/link';
import { CommentRow } from './comment-row';
import { getAdminComments } from '@/lib/queries';
import { fmtDate, parseCommentStatus, catSlug } from '@/lib/types';
import type { CommentStatus } from '@/lib/types';

export const metadata = { title: '댓글 관리 · kh.log admin' };

interface SearchParams { status?: string }

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status: CommentStatus = parseCommentStatus(sp.status ?? '') ?? 'VISIBLE';
  const comments = await getAdminComments(status);

  const tabs: { id: CommentStatus; label: string }[] = [
    { id: 'VISIBLE', label: '공개' },
    { id: 'HIDDEN',  label: '숨김' },
    { id: 'DELETED', label: '삭제됨' },
  ];

  return (
    <>
      <header className="admin-h">
        <div>
          <div className="crumb">관리 / 댓글</div>
          <h1>댓글 ({comments.length})</h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 'var(--s-2)', marginBottom: 'var(--s-5)' }}>
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/comments?status=${t.id}`}
            className={`btn ${status === t.id ? 'solid' : 'ghost'}`}
            style={{ padding: '5px 14px' }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div>
        {comments.map((c) => (
          <div key={c.id} style={{ padding: 'var(--s-4) 0', borderTop: '1px solid var(--rule-soft)' }}>
            <div className="card-meta" style={{ margin: 0, marginBottom: 6 }}>
              <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{c.authorName || '익명'}</strong>
              <span className="dot" />
              <span>{fmtDate(c.createdAt)}</span>
              {c.post && (
                <>
                  <span className="dot" />
                  <Link href={`/${catSlug(c.post.category)}/${c.post.slug}`} style={{ color: 'var(--ink-2)' }}>
                    {c.post.title}
                  </Link>
                </>
              )}
            </div>
            <div style={{
              fontSize: 'var(--t-sm)', color: 'var(--ink-2)',
              lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8,
            }}>
              {c.content}
            </div>
            <CommentRow id={c.id} status={c.status} />
          </div>
        ))}
        {comments.length === 0 && (
          <p className="t-meta" style={{ padding: 'var(--s-8) 0', textAlign: 'center' }}>
            댓글이 없습니다.
          </p>
        )}
      </div>
    </>
  );
}
