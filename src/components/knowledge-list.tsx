'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Post } from '@/lib/types';
import { catSlug, fmtDate } from '@/lib/types';

export function KnowledgeList({ list }: { list: Post[] }) {
  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {};
    list.forEach((p) => p.tags.forEach((t) => { c[t] = (c[t] ?? 0) + 1; }));
    return c;
  }, [list]);
  const allTags = useMemo(
    () => Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]),
    [tagCounts],
  );

  const [tag, setTag] = useState<string | null>(null);
  const filtered = tag ? list.filter((p) => p.tags.includes(tag)) : list;

  return (
    <div className="layout-knowledge grid grid-cols-[minmax(0,1fr)_180px] gap-12 items-start pt-2">
      <section>
        {tag && (
          <div className="flex items-center gap-2 pb-4 border-b border-rule-soft mb-2">
            <span className="t-meta">필터:</span>
            <span className="chip on">#{tag}</span>
            <button onClick={() => setTag(null)} className="t-meta border-b border-ink-4 cursor-pointer">
              해제
            </button>
            <span className="flex-1" />
            <span className="t-meta">{filtered.length}편</span>
          </div>
        )}
        {filtered.map((p) => (
          <Link key={p.slug} href={`/${catSlug(p.category)}/${p.slug}`} className="card-link">
            <div className="card-title mt-0">{p.title}</div>
            {p.excerpt && <div className="card-excerpt">{p.excerpt}</div>}
            <div className="card-meta">
              <span>{p.publishedAt ? fmtDate(p.publishedAt) : '—'}</span>
              <span className="dot" />
              <span>{p.readMinutes}분</span>
              <span className="dot stat-extra" />
              <span className="stat-extra">조회 {p.views}</span>
              <span className="dot" />
              <span>♡ {p.likes}</span>
              <span className="flex-spacer flex-1" />
              <span className="card-tags">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className={tag === t ? 'text-ink' : 'text-ink-4'}>
                    #{t}
                  </span>
                ))}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-3 text-sm">
            이 태그에는 아직 글이 없습니다.
          </div>
        )}
      </section>

      <aside className="sticky top-20 pl-5 border-l border-rule-soft">
        <div className="t-meta-up mb-3">TAGS</div>
        <ul className="list-none p-0 m-0">
          <li>
            <button
              onClick={() => setTag(null)}
              className={`flex justify-between w-full py-[5px] text-sm cursor-pointer ${tag === null ? 'text-ink font-medium' : 'text-ink-2'}`}
            >
              <span>전체</span>
              <span className="t-mono text-[11px] text-ink-4">
                {list.length}
              </span>
            </button>
          </li>
          {allTags.map((t) => (
            <li key={t}>
              <button
                onClick={() => setTag(tag === t ? null : t)}
                className={`flex justify-between w-full py-[5px] text-sm text-left cursor-pointer ${tag === t ? 'text-ink font-medium' : 'text-ink-2'}`}
              >
                <span>#{t}</span>
                <span className="t-mono text-[11px] text-ink-4">
                  {tagCounts[t]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
