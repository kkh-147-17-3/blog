'use client';

import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';

export interface SlashItem {
  title: string;
  hint?: string;
  /** Grouping header (기본 / 미디어 / 코드·데이터). Items without a group land in 기본. */
  group?: string;
  command: () => void;
}

export interface SlashMenuRef {
  onKeyDown: (e: KeyboardEvent) => boolean;
}

interface Props {
  items: SlashItem[];
  /** Suggestion-plugin command — invokes the SlashCommand `.configure()` command,
   *  which deletes the slash range first, then runs the item's action. */
  command: (item: SlashItem) => void;
}

export const SlashMenu = forwardRef<SlashMenuRef, Props>(({ items, command }, ref) => {
  const [sel, setSel] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // reset selection when the list changes (e.g. user types to filter)
  useEffect(() => setSel(0), [items]);

  // scroll the selected item into view on keyboard nav
  useEffect(() => {
    itemRefs.current[sel]?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (e) => {
      if (items.length === 0) return false;
      if (e.key === 'ArrowDown') { setSel((s) => (s + 1) % items.length); return true; }
      if (e.key === 'ArrowUp')   { setSel((s) => (s + items.length - 1) % items.length); return true; }
      if (e.key === 'Enter')     {
        const it = items[sel];
        if (it) command(it);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return <div className="slash-menu"><div className="slash-empty">결과 없음</div></div>;
  }

  // Preserve insertion order while collapsing into ordered group buckets.
  const groups: { name: string; items: { item: SlashItem; idx: number }[] }[] = [];
  items.forEach((item, idx) => {
    const name = item.group ?? '기본';
    let g = groups.find((x) => x.name === name);
    if (!g) { g = { name, items: [] }; groups.push(g); }
    g.items.push({ item, idx });
  });

  return (
    <div className="slash-menu" role="listbox">
      {groups.map((g) => (
        <div key={g.name}>
          <div className="slash-group">{g.name}</div>
          {g.items.map(({ item: it, idx: i }) => (
            <button
              key={it.title}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={`slash-item ${i === sel ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={(e) => { e.preventDefault(); command(it); }}
              type="button"
            >
              <span className="slash-title">{it.title}</span>
              {it.hint && <span className="slash-hint">{it.hint}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
