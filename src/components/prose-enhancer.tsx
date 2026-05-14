'use client';

import { useEffect } from 'react';

// Walks .prose <pre> blocks after mount and:
//   1. Wraps each in <figure class="codeblock"> with a bar (lang + copy button).
//   2. If the inner <code> is language-diff, re-renders lines as +/-/ctx diff rows.
//
// Tiptap's CodeBlockLowlight emits <pre><code class="language-X">…</code></pre>; we
// enhance the rendered HTML on the client (after dangerouslySetInnerHTML hydrates)
// instead of post-processing on the server, so this works for any markdown/html source.
export function ProseEnhancer() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>('.prose pre');
    pres.forEach((pre) => {
      if (pre.closest('figure.codeblock')) return;
      const code = pre.querySelector<HTMLElement>('code');
      const langClass = Array.from(code?.classList ?? []).find((c) => c.startsWith('language-'));
      const lang = langClass ? langClass.slice('language-'.length) : '';
      const isDiff = lang === 'diff';

      const figure = document.createElement('figure');
      figure.className = `codeblock${isDiff ? ' diff' : ''}`;

      const bar = document.createElement('div');
      bar.className = 'codeblock-bar';
      if (lang) {
        const langEl = document.createElement('span');
        langEl.className = 'codeblock-lang';
        langEl.textContent = lang;
        bar.appendChild(langEl);
      }
      if (isDiff) {
        const tag = document.createElement('span');
        tag.className = 'difftag';
        tag.textContent = 'diff';
        bar.appendChild(tag);
      } else {
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'codeblock-copy';
        copy.textContent = '복사';
        copy.addEventListener('click', () => {
          const text = (code ?? pre).textContent ?? '';
          const done = () => {
            copy.textContent = '복사됨';
            copy.classList.add('done');
            setTimeout(() => { copy.textContent = '복사'; copy.classList.remove('done'); }, 1500);
          };
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(done);
          } else done();
        });
        copy.style.marginLeft = 'auto';
        bar.appendChild(copy);
      }

      pre.parentNode?.insertBefore(figure, pre);
      figure.appendChild(bar);
      figure.appendChild(pre);

      if (isDiff) {
        const raw = (code ?? pre).textContent ?? '';
        const lines = raw.replace(/^\n/, '').replace(/\n$/, '').split('\n');
        const container = document.createElement('div');
        let ln = 0;
        lines.forEach((rawLine) => {
          const ch = rawLine.charAt(0);
          let cls = 'ctx'; let sign = ' '; let num: number | string = '';
          let text = rawLine.slice(1);
          if (ch === '@') { cls = 'meta'; sign = ' '; num = '⋯'; text = rawLine; }
          else if (ch === '+') { cls = 'add'; sign = '+'; ln++; num = ln; }
          else if (ch === '-') { cls = 'del'; sign = '−'; }
          else { cls = 'ctx'; sign = ' '; ln++; num = ln; }
          const row = document.createElement('div');
          row.className = `diff-line ${cls}`;
          row.innerHTML =
            `<span class="dg-num">${num}</span>` +
            `<span class="dg-sign">${sign}</span>` +
            `<span class="dg-code"></span>`;
          row.querySelector('.dg-code')!.textContent = text || ' ';
          container.appendChild(row);
        });
        pre.innerHTML = '';
        pre.appendChild(container);
      }
    });
  }, []);

  return null;
}
