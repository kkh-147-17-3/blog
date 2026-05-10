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
    <article className="screen mx-auto max-w-[1280px] px-6 pt-12">
      <DetailCatBinder cat={post.category} />
      <ViewPinger slug={post.slug} />

      <div className="layout-detail grid grid-cols-[200px_minmax(0,640px)_200px] gap-8 items-start justify-center">
        <div className="layout-detail-spacer" aria-hidden />
        <div className="w-full">
          <header className="mb-8">
            <div className="mb-4"><CatLabel cat={post.category} /></div>
            <h1 className="t-display m-0 text-3xl leading-[1.15] tracking-[-0.025em]">
              {post.title}
            </h1>
            <div className="card-meta mt-5">
              <span>{post.publishedAt ? fmtDate(post.publishedAt) : '—'}</span>
              <span className="dot" />
              <span>{post.readMinutes}분</span>
              <span className="dot" />
              <span>조회 {post.views}</span>
            </div>
          </header>

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="mt-12 pt-6 border-t border-rule flex justify-between items-center flex-wrap gap-3">
            <div className="flex gap-2">
              <LikeButton slug={post.slug} initial={post.likes} />
              <ShareButtons title={post.title} />
            </div>
            <div className="flex gap-[6px] flex-wrap">
              {post.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <h3 className="t-display m-0 mb-3 text-lg">
                같은 카테고리의 다른 글
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${catSlug(r.category)}/${r.slug}`}
                    className="py-4 px-5 border border-rule rounded-md transition-[background] duration-150"
                  >
                    <CatLabel cat={r.category} />
                    <div className="t-display text-md font-semibold mt-[6px] leading-snug">{r.title}</div>
                    <div className="t-meta mt-1">
                      {r.publishedAt ? fmtDate(r.publishedAt) : '—'} · {r.readMinutes}분
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h3 className="t-display m-0 mb-4 text-lg">
              댓글 <span className="text-ink-3 font-normal">{comments.length}</span>
            </h3>

            <CommentForm slug={post.slug} />

            {comments.map((c) => (
              <div key={c.id} className="py-4 border-t border-rule-soft">
                <div className="card-meta m-0 mb-1">
                  <strong className="text-ink font-medium">
                    {c.authorName || '익명'}
                  </strong>
                  <span className="dot" />
                  <span>{fmtDateShort(c.createdAt)}</span>
                </div>
                <div className="text-sm text-ink-2 leading-[1.7] whitespace-pre-wrap">
                  {c.content}
                </div>
              </div>
            ))}
          </section>
        </div>

        <TocSide items={toc} likes={post.likes} views={post.views} />
      </div>

      <Footer />

      <TocFab items={toc} />
    </article>
  );
}
