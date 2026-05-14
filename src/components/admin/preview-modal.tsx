'use client';

import { useEffect } from 'react';
import { CAT_LABEL, catSlug, type Category } from '@/lib/types';

interface Props {
  title: string;
  contentHtml: string;
  category: Category;
  readMinutes: number;
  onClose: () => void;
}

function formatToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// Split the rendered HTML into top-level block segments so we can show a
// line-numbered "JSON 원본" left pane that mirrors the hifi prototype.
// We don't have access to the Tiptap JSON tree at this layer, so we use the
// serialized HTML — good enough to give a sense of structure.
function splitBlocks(html: string): string[] {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const blocks: string[] = [];
  wrapper.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      blocks.push((n as HTMLElement).outerHTML);
    } else if (n.nodeType === Node.TEXT_NODE) {
      const t = n.textContent?.trim();
      if (t) blocks.push(`<p>${t}</p>`);
    }
  });
  return blocks;
}

export function PreviewModal({ title, contentHtml, category, readMinutes, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const blocks = typeof window === 'undefined' ? [] : splitBlocks(contentHtml);
  const catCls = catSlug(category);

  return (
    <div className="pv-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pv-shell">
        <div className="pv-head">
          <h3>발행 미리보기</h3>
          <span className="pv-meta">{blocks.length}개 블록</span>
          <span className="pv-spacer" />
          <button type="button" className="pv-x" onClick={onClose} aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="pv-body">
          <div className="pv-pane editor">
            <div className="pv-pane-head">
              <span className="pv-dot" style={{ background: 'rgb(var(--cat-memo))' }} />
              <span>작성 (블록 트리)</span>
              <span className="pv-tag">HTML 원본</span>
            </div>
            <div className="pv-pane-body">
              <div className="pv-edoc">
                {blocks.map((b, i) => (
                  <div key={i} className="pv-line">
                    <span className="pv-gut">{String(i + 1).padStart(2, '0')}</span>
                    <div className="pv-c" dangerouslySetInnerHTML={{ __html: b }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pv-pane reader">
            <div className="pv-pane-head">
              <span className="pv-dot" style={{ background: 'rgb(var(--cat-knowledge))' }} />
              <span>발행 후 (독자 화면)</span>
              <span className="pv-tag">미리보기</span>
            </div>
            <div className="pv-pane-body">
              <article className="pv-reader">
                <div className={`cat-label ${catCls} mb-4`}>{CAT_LABEL[category]}</div>
                <h1 className="pv-rt">{title || '(제목 없음)'}</h1>
                <div className="pv-rmeta">
                  <span>{formatToday()}</span>
                  <span className="dot" />
                  <span>약 {Math.max(1, readMinutes)}분</span>
                  <span className="dot" />
                  <span>발행 전</span>
                </div>
                <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml || '<p style="color:rgb(var(--ink-3))">본문을 추가하세요.</p>' }} />
              </article>
            </div>
          </div>
        </div>
        <div className="pv-foot">
          <span><span className="kbd">Esc</span> 닫기 · 오른쪽이 발행 후 모양입니다</span>
          <span>변경은 에디터에서 그대로 반영됩니다</span>
        </div>
      </div>
    </div>
  );
}
