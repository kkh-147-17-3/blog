// Custom Tiptap block nodes that emit the hifi prose HTML structure.
// All four nodes are inserted from the slash menu; their renderHTML output
// matches the CSS in globals.css (.prose .callout/.pullquote/.link-card/details.fold).

import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout:   { setCallout: (variant?: 'note' | 'warn' | 'tip') => ReturnType };
    pullquote: { setPullquote: (cite?: string) => ReturnType };
    linkCard:  { setLinkCard: (attrs: { href: string; title?: string; desc?: string; url?: string }) => ReturnType };
    fold:      { setFold: (summary?: string) => ReturnType };
  }
}

const CALLOUT_LABELS: Record<'note' | 'warn' | 'tip', string> = {
  note: '참고',
  warn: '주의',
  tip:  '팁',
};

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'note',
        parseHTML: (el) => {
          if (el.classList.contains('warn')) return 'warn';
          if (el.classList.contains('tip')) return 'tip';
          return 'note';
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside.callout' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = (node.attrs.variant as 'note' | 'warn' | 'tip') ?? 'note';
    const label = CALLOUT_LABELS[variant];
    return [
      'aside',
      mergeAttributes(HTMLAttributes, { class: `callout ${variant}` }),
      ['div', { class: 'callout-label', contenteditable: 'false' }, label],
      ['div', {}, 0],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant = 'note') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [{ type: 'paragraph' }],
          }),
    };
  },
});

export const Pullquote = Node.create({
  name: 'pullquote',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      cite: {
        default: '',
        parseHTML: (el) => el.querySelector('cite')?.textContent ?? '',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figure.pullquote' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const cite = (node.attrs.cite as string) ?? '';
    const children: (string | unknown[])[] = [['p', {}, 0]];
    if (cite) children.push(['cite', { contenteditable: 'false' }, cite]);
    return [
      'figure',
      mergeAttributes(HTMLAttributes, { class: 'pullquote' }),
      ...(children as never[]),
    ];
  },

  addCommands() {
    return {
      setPullquote:
        (cite = '') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { cite },
          }),
    };
  },
});

export const LinkCard = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href:  { default: '#' },
      title: { default: '' },
      desc:  { default: '' },
      url:   { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'a.link-card' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { href, title, desc, url } = node.attrs as {
      href: string; title: string; desc: string; url: string;
    };
    return [
      'a',
      mergeAttributes(HTMLAttributes, { class: 'link-card', href: href || '#' }),
      [
        'div',
        { class: 'lc-body' },
        ['div', { class: 'lc-title' }, title || href],
        ...(desc ? [['div', { class: 'lc-desc' }, desc]] : []),
        ['div', { class: 'lc-url' }, url || href],
      ],
      ['div', { class: 'lc-thumb' }],
    ];
  },

  addCommands() {
    return {
      setLinkCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              href: attrs.href,
              title: attrs.title ?? '',
              desc: attrs.desc ?? '',
              url: attrs.url ?? attrs.href,
            },
          }),
    };
  },
});

export const Fold = Node.create({
  name: 'fold',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      summary: {
        default: '자세히',
        parseHTML: (el) => el.querySelector('summary > span')?.textContent ?? '자세히',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'details.fold' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const summary = (node.attrs.summary as string) || '자세히';
    return [
      'details',
      mergeAttributes(HTMLAttributes, { class: 'fold', open: 'open' }),
      ['summary', { contenteditable: 'false' }, ['span', {}, summary]],
      ['div', { class: 'fold-body' }, 0],
    ];
  },

  addCommands() {
    return {
      setFold:
        (summary = '자세히') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { summary },
            content: [{ type: 'paragraph' }],
          }),
    };
  },
});
