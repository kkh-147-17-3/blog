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

      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/comments?status=${t.id}`}
            className={`btn ${status === t.id ? 'solid' : 'ghost'} px-[14px] py-[5px]`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div>
        {comments.map((c) => (
          <div key={c.id} className="py-4 border-t border-rule-soft">
            <div className="card-meta m-0 mb-[6px]">
              <strong className="text-ink font-medium">{c.authorName || '익명'}</strong>
              <span className="dot" />
              <span>{fmtDate(c.createdAt)}</span>
              {c.post && (
                <>
                  <span className="dot" />
                  <Link href={`/${catSlug(c.post.category)}/${c.post.slug}`} className="text-ink-2">
                    {c.post.title}
                  </Link>
                </>
              )}
            </div>
            <div className="text-sm text-ink-2 leading-[1.7] whitespace-pre-wrap mb-2">
              {c.content}
            </div>
            <CommentRow id={c.id} status={c.status} />
          </div>
        ))}
        {comments.length === 0 && (
          <p className="t-meta py-8 text-center">
            댓글이 없습니다.
          </p>
        )}
      </div>
    </>
  );
}
