import Link from 'next/link';
import type { Post } from '@/lib/types';
import { catSlug, fmtDateShort } from '@/lib/types';

export function MemoList({ list }: { list: Post[] }) {
  return (
    <section style={{ padding: 'var(--s-2) 0 0' }}>
      {list.map((p, i) => (
        <Link
          key={p.slug}
          href={`/${catSlug(p.category)}/${p.slug}`}
          className="memo-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 1fr auto',
            gap: 'var(--s-5)',
            alignItems: 'baseline',
            padding: 'var(--s-4) 0',
            borderTop: '1px solid var(--rule-soft)',
            borderBottom: i === list.length - 1 ? '1px solid var(--rule-soft)' : 0,
          }}
        >
          <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {p.publishedAt ? fmtDateShort(p.publishedAt) : '—'}
          </span>
          <span>
            <div className="t-display" style={{
              fontSize: 'var(--t-md)', fontWeight: 500,
              lineHeight: 1.45, marginBottom: 3,
            }}>{p.title}</div>
            {p.excerpt && (
              <div style={{
                fontSize: 'var(--t-sm)', color: 'var(--ink-2)',
                lineHeight: 1.65,
              }}>{p.excerpt}</div>
            )}
          </span>
          <span style={{ display: 'flex', gap: 6 }}>
            {p.tags.slice(0, 2).map((t) => (
              <span key={t} className="t-meta">#{t}</span>
            ))}
          </span>
        </Link>
      ))}
    </section>
  );
}
