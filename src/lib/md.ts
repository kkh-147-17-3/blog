// Minimal Markdown → HTML for prose rendering. Intentionally tiny — supports the
// blocks the design uses: h2/h3, paragraphs, blockquote, fenced code, ul/ol, hr, inline code, links, em/strong.
// For a fuller renderer, swap in `remark` or `marked` later.

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let out = escape(s);
  // links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic _text_ or *text*
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/(^|\W)_([^_]+)_/g, '$1<em>$2</em>');
  // inline code `c`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

export function md2html(src: string): string {
  if (!src) return '';
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const codeOpen = line.match(/^```(\w*)\s*$/);
    if (codeOpen) {
      closeList();
      const lang = codeOpen[1] || '';
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing ```
      out.push(`<pre>${lang ? `<span class="lang">${lang}</span>` : ''}${escape(buf.join('\n'))}</pre>`);
      continue;
    }

    // headings
    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) { closeList(); const lvl = h[1].length; out.push(`<h${lvl} id="${slugify(h[2])}">${inline(h[2])}</h${lvl}>`); i++; continue; }

    // hr
    if (/^---+\s*$/.test(line)) { closeList(); out.push('<hr />'); i++; continue; }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }

    // ordered list
    const ol = line.match(/^(\d+)\.\s+(.+)$/);
    if (ol) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${inline(ol[2])}</li>`);
      i++;
      continue;
    }

    // unordered list
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    // blank line
    if (line.trim() === '') { closeList(); i++; continue; }

    // paragraph (collect contiguous non-empty lines)
    closeList();
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{2,3}|>|---|```|\d+\.|[-*]\s)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  closeList();
  return out.join('\n');
}

export function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'sec';
}

/** Inject id="..." into <h2>/<h3> tags that don't already have one. Tiptap doesn't add ids
 *  natively — we post-process the editor's HTML before saving so the TOC has anchor targets. */
export function addHeadingIds(html: string): string {
  const used = new Set<string>();
  let counter = 0;
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_, lvl, attrs = '', inner) => {
    if (/\sid=/.test(attrs)) return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    let id = slugify(text) || `sec-${++counter}`;
    if (used.has(id)) {
      let n = 2;
      while (used.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    used.add(id);
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
}

export function extractToc(html: string): { id: string; label: string; lvl: 2 | 3 }[] {
  const out: { id: string; label: string; lvl: 2 | 3 }[] = [];
  // Match <h2 ... id="..."> regardless of attribute order.
  const re = /<h([23])(?:\s[^>]*?id="([^"]+)"|\s[^>]*?)*[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (!m[2]) continue;
    out.push({ lvl: Number(m[1]) as 2 | 3, id: m[2], label: m[3].replace(/<[^>]+>/g, '') });
  }
  return out;
}
