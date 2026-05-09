import Link from 'next/link';
import type { Post } from '@/lib/types';
import { catSlug } from '@/lib/types';

function ymKey(iso: string | null): string {
  if (!iso) return '0000.00';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function DiaryTimeline({ list }: { list: Post[] }) {
  const groups: Record<string, Post[]> = {};
  list.forEach((p) => {
    const k = ymKey(p.publishedAt);
    (groups[k] ??= []).push(p);
  });
  const months = Object.keys(groups).sort().reverse();
  const monthLabel = (k: string) => {
    const [y, m] = k.split('.');
    return `${y}년 ${parseInt(m, 10)}월`;
  };

  return (
    <section className="pt-4">
      {months.map((ym) => (
        <div
          key={ym}
          className="diary-row grid grid-cols-[120px_1fr] gap-8 py-8 border-t border-rule-soft first:border-t-0"
        >
          <div className="sticky top-20 self-start">
            <div className="t-display text-lg font-semibold tracking-display leading-tight">
              {monthLabel(ym)}
            </div>
            <div className="t-mono text-[11px] text-ink-3 mt-1">
              {groups[ym].length} 편
            </div>
          </div>

          <div className="relative pl-6 border-l border-rule">
            {groups[ym].map((p, i) => {
              const day = p.publishedAt ? new Date(p.publishedAt).getDate() : '—';
              return (
                <Link
                  key={p.slug}
                  href={`/${catSlug(p.category)}/${p.slug}`}
                  className={`block relative pb-5 pt-3 ${i === 0 ? '' : 'border-t border-dashed border-rule-soft'}`}
                >
                  <span
                    className={`absolute w-2 h-2 rounded-full bg-cat-diary -left-[28.5px] ${i === 0 ? 'top-[18px]' : 'top-[22px]'}`}
                  />
                  <div className="t-meta mb-1">
                    <span className="t-mono">{day}일</span>
                    <span className="dot" />
                    <span>{p.readMinutes}분</span>
                  </div>
                  <div className="t-display text-lg font-medium tracking-[-0.015em] mb-1">{p.title}</div>
                  {p.excerpt && (
                    <div className="text-sm text-ink-2 leading-[1.7]">{p.excerpt}</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
