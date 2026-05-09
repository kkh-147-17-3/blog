import Link from 'next/link';
import { CatLabel } from '@/components/cat-label';
import { Footer } from '@/components/footer';
import { getPublishedPosts } from '@/lib/queries';
import { catSlug, fmtDate } from '@/lib/types';

export default async function HomePage() {
  const posts = await getPublishedPosts();

  if (posts.length === 0) {
    return (
      <div className="screen container" style={{ padding: 'var(--s-20) 0' }}>
        <p style={{ color: 'var(--ink-3)' }}>아직 발행된 글이 없습니다.</p>
        <Footer />
      </div>
    );
  }

  const [hero, ...rest] = posts;

  return (
    <div className="screen container">
      <section style={{ padding: 'var(--s-16) 0 var(--s-12)' }}>
        <div className="t-meta-up" style={{ marginBottom: 'var(--s-3)' }}>가장 최근 글</div>
        <Link href={`/${catSlug(hero.category)}/${hero.slug}`} style={{ display: 'block', maxWidth: 620 }}>
          <div style={{ marginBottom: 'var(--s-4)' }}><CatLabel cat={hero.category} /></div>
          <h1
            className="t-display"
            style={{ fontSize: 'var(--t-3xl)', lineHeight: 1.12, letterSpacing: '-0.025em', margin: 0 }}
          >
            {hero.title}
          </h1>
          {hero.excerpt && (
            <p style={{
              marginTop: 'var(--s-4)', fontSize: 'var(--t-md)',
              color: 'var(--ink-2)', lineHeight: 1.7, maxWidth: 540,
            }}>
              {hero.excerpt}
            </p>
          )}
          <div className="card-meta" style={{ marginTop: 'var(--s-5)' }}>
            <span>{hero.publishedAt ? fmtDate(hero.publishedAt) : '—'}</span>
            <span className="dot" />
            <span>{hero.readMinutes}분</span>
            <span className="dot" />
            <span>조회 {hero.views}</span>
          </div>
        </Link>
      </section>

      <hr className="rule-soft" />

      <section style={{ padding: 'var(--s-10) 0 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 'var(--s-4)',
        }}>
          <h2 className="t-display" style={{ margin: 0, fontSize: 'var(--t-xl)', whiteSpace: 'nowrap' }}>이전 글</h2>
          <Link href="/knowledge" className="t-meta" style={{ borderBottom: '1px solid var(--ink-4)' }}>
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
