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
    <section style={{ padding: 'var(--s-4) 0 0' }}>
      {months.map((ym, mi) => (
        <div key={ym} className="diary-row" style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: 'var(--s-8)',
          padding: 'var(--s-8) 0',
          borderTop: mi === 0 ? 0 : '1px solid var(--rule-soft)',
        }}>
          <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <div className="t-display" style={{
              fontSize: 'var(--t-lg)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {monthLabel(ym)}
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
              {groups[ym].length} 편
            </div>
          </div>

          <div style={{
            position: 'relative',
            paddingLeft: 'var(--s-6)',
            borderLeft: '1px solid var(--rule)',
          }}>
            {groups[ym].map((p, i) => {
              const day = p.publishedAt ? new Date(p.publishedAt).getDate() : '—';
              return (
                <Link
                  key={p.slug}
                  href={`/${catSlug(p.category)}/${p.slug}`}
                  style={{
                    display: 'block',
                    position: 'relative',
                    padding: 'var(--s-3) 0 var(--s-5)',
                    borderTop: i === 0 ? 0 : '1px dashed var(--rule-soft)',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: 'calc(var(--s-6) * -1 - 4.5px)',
                    top: i === 0 ? 18 : 22,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--cat-diary)',
                  }} />
                  <div className="t-meta" style={{ marginBottom: 4 }}>
                    <span className="t-mono">{day}일</span>
                    <span className="dot" />
                    <span>{p.readMinutes}분</span>
                  </div>
                  <div className="t-display" style={{
                    fontSize: 'var(--t-lg)', fontWeight: 500,
                    letterSpacing: '-0.015em', marginBottom: 4,
                  }}>{p.title}</div>
                  {p.excerpt && (
                    <div style={{
                      fontSize: 'var(--t-sm)', color: 'var(--ink-2)',
                      lineHeight: 1.7,
                    }}>{p.excerpt}</div>
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
