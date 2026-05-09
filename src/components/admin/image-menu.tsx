'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

interface Pos { top: number; left: number; width: number }

export function ImageMenu({ editor }: { editor: Editor | null }) {
  const [pos, setPos] = useState<Pos | null>(null);
  const [attrs, setAttrs] = useState<{ size: string | null; align: string | null; caption: string }>({
    size: null, align: null, caption: '',
  });
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      if (!editor.isActive('image')) { setPos(null); return; }
      const { from } = editor.state.selection;
      const dom = editor.view.nodeDOM(from) as HTMLElement | null;
      if (!dom || !(dom instanceof HTMLElement)) { setPos(null); return; }
      const rect = dom.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY - 50,
        left: rect.left + window.scrollX + rect.width / 2,
        width: rect.width,
      });
      const a = editor.getAttributes('image');
      const next = {
        size: (a.size as string | null) ?? null,
        align: (a.align as string | null) ?? null,
        caption: (a.caption as string) ?? '',
      };
      setAttrs(next);
      setCaption(next.caption);
    };
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    update();
    const onScroll = () => update();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [editor]);

  if (!editor || !pos) return null;

  const setSize  = (size: string | null)  => editor.chain().focus().updateAttributes('image', { size }).run();
  const setAlign = (align: string | null) => editor.chain().focus().updateAttributes('image', { align }).run();
  const remove   = () => editor.chain().focus().deleteSelection().run();
  const commitCaption = () => {
    if (caption !== attrs.caption) {
      editor.chain().focus().updateAttributes('image', { caption }).run();
    }
  };

  const btn = (label: string, on: boolean, op: () => void) => (
    <button
      type="button"
      className={`tb-btn ${on ? 'on' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={op}
    >
      {label}
    </button>
  );

  return (
    <div
      className="image-menu -translate-x-1/2"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="image-menu-row">
        {btn('작게', attrs.size === 'sm', () => setSize('sm'))}
        {btn('기본', !attrs.size,         () => setSize(null))}
        {btn('크게', attrs.size === 'lg', () => setSize('lg'))}
        <span className="image-menu-sep" />
        {btn('⬅', attrs.align === 'left',                          () => setAlign('left'))}
        {btn('▢', !attrs.align || attrs.align === 'center',         () => setAlign(null))}
        {btn('➡', attrs.align === 'right',                          () => setAlign('right'))}
        <span className="image-menu-sep" />
        <button
          type="button"
          className="tb-btn danger"
          onMouseDown={(e) => e.preventDefault()}
          onClick={remove}
        >
          삭제
        </button>
      </div>
      <input
        className="image-menu-caption"
        placeholder="캡션 (선택)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={commitCaption}
        onKeyDown={(e) => {
          // Stop arrow / enter from leaking into the editor's keymap.
          if (e.key === 'Enter') { e.preventDefault(); commitCaption(); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'
                || e.key === 'ArrowUp'   || e.key === 'ArrowDown') {
            e.stopPropagation();
          }
        }}
      />
    </div>
  );
}
