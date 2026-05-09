'use client';

import { useEffect, useState } from 'react';

interface TocItem { id: string; label: string; lvl: 2 | 3 }

export function TocSide({ items, likes, views }: { items: TocItem[]; likes: number; views: number }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const headings = items.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (headings.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return <aside className="toc toc-side" />;

  return (
    <aside className="toc toc-side">
      <div className="toc-head">목차</div>
      <ul>
        {items.map((s) => (
          <li key={s.id} className={`${s.lvl === 3 ? 'lvl2' : ''} ${active === s.id ? 'on' : ''}`}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActive(s.id);
              }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-3 border-t border-rule-soft flex gap-3 text-[11px] text-ink-3">
        <span>♡ {likes}</span>
        <span>👁 {views}</span>
      </div>
    </aside>
  );
}
