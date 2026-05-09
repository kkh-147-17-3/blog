import Link from 'next/link';
import { CatLabel } from '@/components/cat-label';
import { Footer } from '@/components/footer';
import { getPublishedPosts } from '@/lib/queries';
import { CAT_DESC, CAT_LABEL, catSlug, fmtDateShort } from '@/lib/types';
import type { Category } from '@/lib/types';

export default async function AboutPage() {
  const posts = await getPublishedPosts();

  const cats: { id: Category; title: string; sub: string; count: number }[] = (
    ['KNOWLEDGE', 'DIARY', 'MEMO'] as Category[]
  ).map((id) => ({
    id,
    title: CAT_LABEL[id],
    sub: CAT_DESC[id],
    count: posts.filter((p) => p.category === id).length,
  }));

  const startHere = ['editor-self', 'autumn-short', 'rls-notes']
    .map((s) => posts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 3);

  return (
    <div className="screen container">
      <header style={{ padding: 'var(--s-20) 0 var(--s-8)' }}>
        <div className="t-meta-up" style={{ marginBottom: 8 }}>ABOUT</div>
        <h1 className="t-display" style={{
          margin: 0, fontSize: 'var(--t-3xl)',
          letterSpacing: '-0.025em', maxWidth: 540, lineHeight: 1.2,
        }}>
          이 블로그에 대하여
        </h1>
        <p style={{
          marginTop: 'var(--s-5)', maxWidth: 540,
          fontSize: 'var(--t-md)', color: 'var(--ink-2)', lineHeight: 1.85,
        }}>
          여기에는 직접 만들면서 배운 것, 일상에서 짧게 본 것, 한참 머물렀던 문장 같은 걸
          나눠 적습니다. 한 자리에 두면 어울리지 않을 글들이지만, 제 안에서는 같은 곳에서 나오는 것 같아요.
        </p>
      </header>

      <hr className="rule-soft" />

      <section style={{ padding: 'var(--s-10) 0 0' }}>
        <h2 style={{
          margin: '0 0 var(--s-5)', fontSize: 11, fontWeight: 500,
          color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: 'var(--font-mono)',
        }}>여기에 있는 것</h2>
        <div className="about-cats" style={{
          display: 'grid', gap: 'var(--s-3)',
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/${catSlug(c.id)}`}
              style={{
                padding: 'var(--s-5)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg)',
                transition: 'border-color 150ms, transform 150ms',
                position: 'relative', overflow: 'hidden',
                display: 'block',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: `var(--cat-${catSlug(c.id)})`, marginBottom: 12,
              }} />
              <div className="t-display" style={{
                fontSize: 'var(--t-xl)', fontWeight: 600,
                letterSpacing: '-0.02em', marginBottom: 4,
              }}>{c.title}</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>
                {c.count} 편
              </div>
              <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {c.sub}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {startHere.length > 0 && (
        <section style={{ padding: 'var(--s-10) 0 0' }}>
          <h2 style={{
            margin: '0 0 var(--s-2)', fontSize: 11, fontWeight: 500,
            color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: 'var(--font-mono)',
          }}>여기서 시작하면 좋을 글</h2>
          <div>
            {startHere.map((p, i) => (
              <Link
                key={p.slug}
                href={`/${catSlug(p.category)}/${p.slug}`}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 'var(--s-4)',
                  padding: 'var(--s-4) 0',
                  borderTop: i === 0 ? 0 : '1px solid var(--rule-soft)',
                }}
              >
                <span className="t-mono" style={{ width: 24, color: 'var(--ink-4)', fontSize: 11 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CatLabel cat={p.category} />
                    <span className="t-display" style={{ fontSize: 'var(--t-md)', fontWeight: 500 }}>
                      {p.title}
                    </span>
                  </div>
                  <div className="t-meta" style={{ marginTop: 4, lineHeight: 1.5 }}>{p.excerpt}</div>
                </span>
                <span className="t-meta">{p.publishedAt ? fmtDateShort(p.publishedAt) : '—'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: 'var(--s-10) 0 0' }}>
        <h2 style={{
          margin: '0 0 var(--s-3)', fontSize: 11, fontWeight: 500,
          color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: 'var(--font-mono)',
        }}>구독·연락</h2>
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <a className="btn solid" href="/feed.xml">RSS</a>
          <a className="btn" href="mailto:kkh147.17.3@gmail.com">메일</a>
          <a className="btn ghost" href="https://github.com/kkh147173" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
