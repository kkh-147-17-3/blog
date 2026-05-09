'use client';

import { useState } from 'react';

interface TocItem { id: string; label: string; lvl: 2 | 3 }

export function TocFab({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <>
      <button className="toc-fab" onClick={() => setOpen((o) => !o)} aria-label="목차 열기">
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 4h12M2 8h12M2 12h8" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {open && (
        <>
          <div className="toc-fab-scrim" onClick={() => setOpen(false)} />
          <div className="toc-fab-panel">
            <div className="toc-fab-head">
              <span>목차</span>
              <span className="t-mono" style={{ color: 'var(--ink-4)', fontSize: 11 }}>{items.length}</span>
            </div>
            <ul>
              {items.map((s) => (
                <li key={s.id} className={s.lvl === 3 ? 'lvl2' : ''}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
