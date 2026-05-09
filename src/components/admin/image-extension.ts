import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

/** Tiptap Image with `size`, `align`, and `caption` attrs.
 *
 *  Renders as `<figure><img/><figcaption>...</figcaption></figure>` when a caption
 *  is set, otherwise as a bare `<img>`. parseHTML reads both shapes back.
 *
 *  size:    'sm' | 'lg' | null   (null = default, max-width 100%)
 *  align:   'left' | 'right' | null   (null = default, centered)
 *  caption: string
 */
export const ResizableImage = Image.extend({
  addAttributes() {
    const parent = this.parent?.() ?? {};
    return {
      ...parent,
      size: {
        default: null,
        renderHTML: (attrs: { size?: string | null }) =>
          attrs.size ? { 'data-size': attrs.size } : {},
        parseHTML: (el: HTMLElement) => el.getAttribute('data-size') || null,
      },
      align: {
        default: null,
        renderHTML: (attrs: { align?: string | null }) =>
          attrs.align ? { 'data-align': attrs.align } : {},
        parseHTML: (el: HTMLElement) => el.getAttribute('data-align') || null,
      },
      caption: {
        default: '',
        // Caption never rendered on the <img> element directly — it goes in <figcaption>.
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        // <figure><img/><figcaption>...</figcaption></figure>
        tag: 'figure',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          const img = el.querySelector('img');
          if (!img) return false;
          const fc = el.querySelector('figcaption');
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            size: img.getAttribute('data-size') || el.getAttribute('data-size') || null,
            align: img.getAttribute('data-align') || el.getAttribute('data-align') || null,
            caption: fc?.textContent ?? '',
          };
        },
      },
      // bare <img> fallback
      { tag: 'img[src]' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const caption = (node.attrs.caption as string | undefined) ?? '';
    const imgAttrs = mergeAttributes({}, HTMLAttributes);
    if (!caption) return ['img', imgAttrs];
    // Mirror the data-* attrs onto the figure too so block-level CSS (alignment, width)
    // can hang off the wrapper.
    const figureAttrs: Record<string, string> = {};
    if (node.attrs.size)  figureAttrs['data-size']  = node.attrs.size as string;
    if (node.attrs.align) figureAttrs['data-align'] = node.attrs.align as string;
    return [
      'figure',
      figureAttrs,
      ['img', imgAttrs],
      ['figcaption', {}, caption],
    ];
  },
});
