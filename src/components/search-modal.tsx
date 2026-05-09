'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CatLabel } from './cat-label';
import { catSlug, fmtDateShort } from '@/lib/types';
import type { Post } from '@/lib/types';

type SearchPost = Pick<Post, 'slug' | 'title' | 'excerpt' | 'category' | 'tags' | 'publishedAt'>;

interface Props {
  open: boolean;
  onClose: () => void;
  posts: SearchPost[];
}

export function SearchModal({ open, onClose, posts }: Props) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else { setQ(''); setSel(0); }
  }, [open]);

  const matches = q
    ? posts
        .filter((p) =>
          (p.title + (p.excerpt ?? '') + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 6)
    : posts.slice(0, 4);

  const jump = (p: SearchPost) => {
    onClose();
    router.push(`/${catSlug(p.category)}/${p.slug}`);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, matches.length - 1)); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (e.key === 'Enter')     { e.preventDefault(); if (matches[sel]) jump(matches[sel]); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matches, sel]);

  if (!open) return null;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="modal-input"
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          placeholder="제목, 본문, 태그 검색…"
        />
        {!q && (
          <div className="modal-section">
            <div className="modal-section-head">최근 검색</div>
            <div style={{ padding: '4px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['nextjs', '회고', '일기'].map((t) => (
                <span key={t} className="chip" onClick={() => setQ(t)}>{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="modal-section">
          <div className="modal-section-head">{q ? `결과 ${matches.length}` : '추천'}</div>
          {matches.length === 0 && (
            <div style={{ padding: '14px 12px', fontSize: 'var(--t-sm)', color: 'var(--ink-3)' }}>
              결과가 없습니다.
            </div>
          )}
          {matches.map((p, i) => (
            <button
              key={p.slug}
              className={`modal-item ${i === sel ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => jump(p)}
            >
              <CatLabel cat={p.category} />
              <span style={{ flex: 1 }}>{p.title}</span>
              <span className="meta">{p.publishedAt ? fmtDateShort(p.publishedAt) : '—'}</span>
            </button>
          ))}
        </div>
        <div className="modal-foot">
          <span><span className="kbd">↵</span> 열기 · <span className="kbd">Esc</span> 닫기</span>
          <span><span className="kbd">⌘K</span> 어디서나 호출</span>
        </div>
      </div>
    </div>
  );
}
