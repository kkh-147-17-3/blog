import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatLabel } from '@/components/cat-label';
import { Footer } from '@/components/footer';
import { TocSide } from '@/components/toc-side';
import { TocFab } from '@/components/toc-fab';
import { LikeButton } from '@/components/like-button';
import { ShareButtons } from '@/components/share-buttons';
import { CommentForm } from '@/components/comment-form';
import { DetailCatBinder } from '@/components/detail-cat-binder';
import { ViewPinger } from '@/components/view-pinger';
import { getCommentsForPost, getPostBySlug, getRelatedPosts } from '@/lib/queries';
import { extractToc, md2html } from '@/lib/md';
import { catSlug, fmtDate, fmtDateShort, parseCategory } from '@/lib/types';

interface Params { cat: string; slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} · kh.log`, description: post.excerpt ?? undefined };
}

export default async function DetailPage({ params }: { params: Promise<Params> }) {
  const { cat, slug } = await params;
  const c = parseCategory(cat);
  if (!c) notFound();

  const post = await getPostBySlug(slug);
  if (!post || post.category !== c) notFound();

  const html = post.contentHtml ?? md2html(post.contentMd ?? '');
  const toc = extractToc(html);

  const [related, comments] = await Promise.all([
    getRelatedPosts(post, 2),
    getCommentsForPost(post.id),
  ]);

  return (
    <article className="screen container-wide" style={{ paddingTop: 'var(--s-12)' }}>
      <DetailCatBinder cat={post.category} />
      <ViewPinger slug={post.slug} />

      <div className="layout-detail" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 200px',
        gap: 'var(--s-16)',
        alignItems: 'start',
      }}>
        <div style={{ maxWidth: 640, justifySelf: 'center', width: '100%' }}>
          <header style={{ marginBottom: 'var(--s-8)' }}>
            <div style={{ marginBottom: 'var(--s-4)' }}><CatLabel cat={post.category} /></div>
            <h1 className="t-display" style={{
              margin: 0, fontSize: 'var(--t-3xl)',
              lineHeight: 1.15, letterSpacing: '-0.025em',
            }}>
              {post.title}
            </h1>
            <div className="card-meta" style={{ marginTop: 'var(--s-5)' }}>
              <span>{post.publishedAt ? fmtDate(post.publishedAt) : '—'}</span>
              <span className="dot" />
              <span>{post.readMinutes}분</span>
              <span className="dot" />
              <span>조회 {post.views}</span>
            </div>
          </header>

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          <div style={{
            marginTop: 'var(--s-12)', paddingTop: 'var(--s-6)',
            borderTop: '1px solid var(--rule)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 'var(--s-3)',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <LikeButton slug={post.slug} initial={post.likes} />
              <ShareButtons title={post.title} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {post.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
            </div>
          </div>

          {related.length > 0 && (
            <section style={{ marginTop: 'var(--s-16)' }}>
              <h3 className="t-display" style={{ margin: '0 0 var(--s-3)', fontSize: 'var(--t-lg)' }}>
                같은 카테고리의 다른 글
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${catSlug(r.category)}/${r.slug}`}
                    style={{
                      padding: 'var(--s-4) var(--s-5)',
                      border: '1px solid var(--rule)', borderRadius: 'var(--r-md)',
                      transition: 'background 150ms',
                    }}
                  >
                    <CatLabel cat={r.category} />
                    <div className="t-display" style={{
                      fontSize: 'var(--t-md)', fontWeight: 600,
                      marginTop: 6, lineHeight: 1.4,
                    }}>{r.title}</div>
                    <div className="t-meta" style={{ marginTop: 4 }}>
                      {r.publishedAt ? fmtDate(r.publishedAt) : '—'} · {r.readMinutes}분
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginTop: 'var(--s-12)' }}>
            <h3 className="t-display" style={{ margin: '0 0 var(--s-4)', fontSize: 'var(--t-lg)' }}>
              댓글 <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>{comments.length}</span>
            </h3>

            <CommentForm slug={post.slug} />

            {comments.map((c) => (
              <div key={c.id} style={{ padding: 'var(--s-4) 0', borderTop: '1px solid var(--rule-soft)' }}>
                <div className="card-meta" style={{ margin: 0, marginBottom: 4 }}>
                  <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>
                    {c.authorName || '익명'}
                  </strong>
                  <span className="dot" />
                  <span>{fmtDateShort(c.createdAt)}</span>
                </div>
                <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </div>
              </div>
            ))}
          </section>

          <Footer />
        </div>

        <TocSide items={toc} likes={post.likes} views={post.views} />
      </div>

      <TocFab items={toc} />
    </article>
  );
}
