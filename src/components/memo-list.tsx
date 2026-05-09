import Link from 'next/link';
import type { Post } from '@/lib/types';
import { catSlug, fmtDateShort } from '@/lib/types';

export function MemoList({ list }: { list: Post[] }) {
  return (
    <section className="pt-2">
      {list.map((p) => (
        <Link
          key={p.slug}
          href={`/${catSlug(p.category)}/${p.slug}`}
          className="memo-row grid grid-cols-[72px_1fr_auto] gap-5 items-baseline py-4 border-t border-rule-soft last:border-b last:border-rule-soft"
        >
          <span className="t-mono text-[11px] text-ink-3">
            {p.publishedAt ? fmtDateShort(p.publishedAt) : '—'}
          </span>
          <span>
            <div className="t-display text-md font-medium leading-[1.45] mb-[3px]">{p.title}</div>
            {p.excerpt && (
              <div className="text-sm text-ink-2 leading-[1.65]">{p.excerpt}</div>
            )}
          </span>
          <span className="flex gap-[6px]">
            {p.tags.slice(0, 2).map((t) => (
              <span key={t} className="t-meta">#{t}</span>
            ))}
          </span>
        </Link>
      ))}
    </section>
  );
}
