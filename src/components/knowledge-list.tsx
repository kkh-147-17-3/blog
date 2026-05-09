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
    <div className="layout-knowledge" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 180px',
      gap: 'var(--s-12)',
      alignItems: 'start',
      paddingTop: 'var(--s-2)',
    }}>
      <section>
        {tag && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 0 var(--s-4)',
            borderBottom: '1px solid var(--rule-soft)',
            marginBottom: 'var(--s-2)',
          }}>
            <span className="t-meta">필터:</span>
            <span className="chip on">#{tag}</span>
            <button onClick={() => setTag(null)} className="t-meta"
              style={{ borderBottom: '1px solid var(--ink-4)', cursor: 'pointer' }}>
              해제
            </button>
            <span style={{ flex: 1 }} />
            <span className="t-meta">{filtered.length}편</span>
          </div>
        )}
        {filtered.map((p) => (
          <Link key={p.slug} href={`/${catSlug(p.category)}/${p.slug}`} className="card-link">
            <div className="card-title" style={{ marginTop: 0 }}>{p.title}</div>
            {p.excerpt && <div className="card-excerpt">{p.excerpt}</div>}
            <div className="card-meta">
              <span>{p.publishedAt ? fmtDate(p.publishedAt) : '—'}</span>
              <span className="dot" />
              <span>{p.readMinutes}분</span>
              <span className="dot stat-extra" />
              <span className="stat-extra">조회 {p.views}</span>
              <span className="dot" />
              <span>♡ {p.likes}</span>
              <span style={{ flex: 1 }} />
              <span className="card-tags">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} style={{ color: tag === t ? 'var(--ink)' : 'var(--ink-4)' }}>
                    #{t}
                  </span>
                ))}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: 'var(--s-12) 0', textAlign: 'center',
            color: 'var(--ink-3)', fontSize: 'var(--t-sm)',
          }}>
            이 태그에는 아직 글이 없습니다.
          </div>
        )}
      </section>

      <aside style={{
        position: 'sticky', top: 80,
        paddingLeft: 'var(--s-5)',
        borderLeft: '1px solid var(--rule-soft)',
      }}>
        <div className="t-meta-up" style={{ marginBottom: 'var(--s-3)' }}>TAGS</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <button
              onClick={() => setTag(null)}
              style={{
                display: 'flex', justifyContent: 'space-between', width: '100%',
                padding: '5px 0',
                fontSize: 'var(--t-sm)',
                color: tag === null ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: tag === null ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              <span>전체</span>
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                {list.length}
              </span>
            </button>
          </li>
          {allTags.map((t) => (
            <li key={t}>
              <button
                onClick={() => setTag(tag === t ? null : t)}
                style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                  padding: '5px 0',
                  fontSize: 'var(--t-sm)',
                  color: tag === t ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: tag === t ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>#{t}</span>
                <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
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
