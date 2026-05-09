import Link from 'next/link';
import { CatLabel } from '@/components/cat-label';
import { Footer } from '@/components/footer';
import { getPublishedPosts } from '@/lib/queries';
import { catSlug, fmtDate } from '@/lib/types';

export default async function HomePage() {
  const posts = await getPublishedPosts();

  if (posts.length === 0) {
    return (
      <div className="screen container py-20">
        <p className="text-ink-3">아직 발행된 글이 없습니다.</p>
        <Footer />
      </div>
    );
  }

  const [hero, ...rest] = posts;

  return (
    <div className="screen container">
      <section className="pt-16 pb-12">
        <div className="t-meta-up mb-3">가장 최근 글</div>
        <Link href={`/${catSlug(hero.category)}/${hero.slug}`} className="block max-w-[620px]">
          <div className="mb-4"><CatLabel cat={hero.category} /></div>
          <h1 className="t-display text-3xl leading-[1.12] tracking-[-0.025em] m-0">
            {hero.title}
          </h1>
          {hero.excerpt && (
            <p className="mt-4 text-md text-ink-2 leading-[1.7] max-w-[540px]">
              {hero.excerpt}
            </p>
          )}
          <div className="card-meta mt-5">
            <span>{hero.publishedAt ? fmtDate(hero.publishedAt) : '—'}</span>
            <span className="dot" />
            <span>{hero.readMinutes}분</span>
            <span className="dot" />
            <span>조회 {hero.views}</span>
          </div>
        </Link>
      </section>

      <hr className="rule-soft" />

      <section className="pt-10">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="t-display m-0 text-xl whitespace-nowrap">이전 글</h2>
          <Link href="/knowledge" className="t-meta border-b border-ink-4">
            전체 보기 →
          </Link>
        </div>
        <div>
          {rest.map((p) => (
            <Link key={p.slug} href={`/${catSlug(p.category)}/${p.slug}`} className="card-link">
              <CatLabel cat={p.category} />
              <div className="card-title">{p.title}</div>
              {p.excerpt && <div className="card-excerpt">{p.excerpt}</div>}
              <div className="card-meta">
                <span>{p.publishedAt ? fmtDate(p.publishedAt) : '—'}</span>
                <span className="dot" />
                <span>{p.readMinutes}분</span>
                <span className="dot" />
                <span>♡ {p.likes}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
