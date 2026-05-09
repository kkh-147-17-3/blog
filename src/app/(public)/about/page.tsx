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

  const sectionHeading = 'm-0 mb-5 text-[11px] font-medium text-ink-2 uppercase tracking-wider2 font-mono';

  return (
    <div className="screen container">
      <header className="pt-20 pb-8">
        <div className="t-meta-up mb-2">ABOUT</div>
        <h1 className="t-display m-0 text-3xl tracking-[-0.025em] max-w-[540px] leading-tight">
          이 블로그에 대하여
        </h1>
        <p className="mt-5 max-w-[540px] text-md text-ink-2 leading-[1.85]">
          여기에는 직접 만들면서 배운 것, 일상에서 짧게 본 것, 한참 머물렀던 문장 같은 걸
          나눠 적습니다. 한 자리에 두면 어울리지 않을 글들이지만, 제 안에서는 같은 곳에서 나오는 것 같아요.
        </p>
      </header>

      <hr className="rule-soft" />

      <section className="pt-10">
        <h2 className={sectionHeading}>여기에 있는 것</h2>
        <div className="about-cats grid gap-3 grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/${catSlug(c.id)}`}
              className="block relative overflow-hidden p-5 border border-rule rounded-md bg-bg transition-[border-color,transform] duration-150"
            >
              <div className={`w-2 h-2 rounded-full mb-3 ${
                c.id === 'KNOWLEDGE' ? 'bg-cat-knowledge' :
                c.id === 'DIARY' ? 'bg-cat-diary' : 'bg-cat-memo'
              }`} />
              <div className="t-display text-xl font-semibold tracking-display mb-1">{c.title}</div>
              <div className="t-mono text-[11px] text-ink-3 mb-[10px]">
                {c.count} 편
              </div>
              <div className="text-sm text-ink-2 leading-[1.6]">
                {c.sub}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {startHere.length > 0 && (
        <section className="pt-10">
          <h2 className={`${sectionHeading} mb-2`}>여기서 시작하면 좋을 글</h2>
          <div>
            {startHere.map((p, i) => (
              <Link
                key={p.slug}
                href={`/${catSlug(p.category)}/${p.slug}`}
                className="flex items-baseline gap-4 py-4 border-t border-rule-soft first:border-t-0"
              >
                <span className="t-mono w-6 text-ink-4 text-[11px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <div className="flex items-center gap-[10px]">
                    <CatLabel cat={p.category} />
                    <span className="t-display text-md font-medium">
                      {p.title}
                    </span>
                  </div>
                  <div className="t-meta mt-1 leading-[1.5]">{p.excerpt}</div>
                </span>
                <span className="t-meta">{p.publishedAt ? fmtDateShort(p.publishedAt) : '—'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="pt-10">
        <h2 className={`${sectionHeading} mb-3`}>구독·연락</h2>
        <div className="flex gap-2 flex-wrap">
          <a className="btn solid" href="/feed.xml">RSS</a>
          <a className="btn" href="mailto:kkh147.17.3@gmail.com">메일</a>
          <a className="btn ghost" href="https://github.com/kkh147173" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
