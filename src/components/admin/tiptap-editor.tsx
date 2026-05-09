'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent, ReactRenderer, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './image-extension';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion';
import { common, createLowlight } from 'lowlight';
import tippy, { type Instance, type Props as TippyProps } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { SlashMenu, type SlashItem, type SlashMenuRef } from './slash-menu';
import { ImageMenu } from './image-menu';

const lowlight = createLowlight(common);

// ───── Slash command extension ────────────────────────────────────────
const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: { command: (e: Editor) => void } }) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...(this.options.suggestion as object),
      }),
    ];
  },
});

// ───── Item factory (Korean labels) ───────────────────────────────────
function makeSlashItems(opts: {
  uploadImage: () => void;
}): (q: { query: string }) => SlashItem[] {
  return ({ query }) => {
    const all: SlashItem[] = [
      { title: '제목 1', hint: 'H2', command: () => editorRef.current?.chain().focus().toggleHeading({ level: 2 }).run() },
      { title: '제목 2', hint: 'H3', command: () => editorRef.current?.chain().focus().toggleHeading({ level: 3 }).run() },
      { title: '본문',   hint: 'P',  command: () => editorRef.current?.chain().focus().setParagraph().run() },
      { title: '글머리 기호', hint: 'UL', command: () => editorRef.current?.chain().focus().toggleBulletList().run() },
      { title: '번호 매기기', hint: 'OL', command: () => editorRef.current?.chain().focus().toggleOrderedList().run() },
      { title: '체크리스트', hint: '✓',  command: () => editorRef.current?.chain().focus().toggleTaskList().run() },
      { title: '인용',   hint: '"',  command: () => editorRef.current?.chain().focus().toggleBlockquote().run() },
      { title: '코드블록', hint: '```', command: () => editorRef.current?.chain().focus().toggleCodeBlock().run() },
      { title: '구분선', hint: '—',  command: () => editorRef.current?.chain().focus().setHorizontalRule().run() },
      { title: '이미지', hint: '⬆',  command: () => opts.uploadImage() },
    ];
    if (!query) return all;
    return all.filter((it) =>
      it.title.toLowerCase().includes(query.toLowerCase()) ||
      it.hint?.toLowerCase().includes(query.toLowerCase()),
    );
  };
}

// Editor reference shared with the slash items factory (set in component body).
const editorRef: { current: Editor | null } = { current: null };

// ───── Component ──────────────────────────────────────────────────────
interface Props {
  initialHtml: string;
  onChange: (html: string) => void;
}

export function TiptapEditor({ initialHtml, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPosRef = useRef<{ from: number; to: number } | null>(null);

  // image upload helper (calls /api/admin/upload)
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.set('file', file);
    let r: Response;
    try {
      r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[upload] network', msg);
      alert(`업로드 실패 (네트워크): ${msg}`);
      return null;
    }
    if (!r.ok) {
      const j = await r.json().catch(() => ({} as { error?: string; raw?: string }));
      const msg = j.error ?? `${r.status} ${r.statusText}`;
      console.error('[upload] server', r.status, j);
      alert(`업로드 실패: ${msg}`);
      return null;
    }
    const { url } = await r.json();
    return url as string;
  }, []);

  const triggerImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Build slash items factory — uses shared editorRef.
  const slashItemsFactory = useRef(makeSlashItems({ uploadImage: triggerImagePicker })).current;

  const editor = useEditor({
    immediatelyRender: false, // SSR-safe in Next.js 15
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by lowlight version
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return '제목';
          return "본문을 적습니다. '/' 누르면 블록 메뉴가 열려요.";
        },
        showOnlyCurrent: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'ts' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommand.configure({
        suggestion: {
          char: '/',
          items: slashItemsFactory,
          render: () => {
            let component: ReactRenderer<SlashMenuRef> | null = null;
            let popup: Instance<TippyProps>[] | null = null;
            return {
              onStart: (props: SuggestionProps<SlashItem>) => {
                component = new ReactRenderer(SlashMenu, {
                  props: { items: props.items, command: props.command },
                  editor: props.editor,
                });
                if (!props.clientRect) return;
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  arrow: false,
                  theme: 'jh',
                });
              },
              onUpdate: (props: SuggestionProps<SlashItem>) => {
                component?.updateProps({ items: props.items, command: props.command });
                if (props.clientRect) {
                  popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
                }
              },
              onKeyDown: (props: SuggestionKeyDownProps) => {
                if (props.event.key === 'Escape') { popup?.[0]?.hide(); return true; }
                return component?.ref?.onKeyDown(props.event) ?? false;
              },
              onExit: () => {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
          command: ({ editor, range, props }: {
            editor: Editor;
            range: { from: number; to: number };
            props: SlashItem;
          }) => {
            // Delete the slash + query, then run the picked item's action.
            editor.chain().focus().deleteRange(range).run();
            props.command();
          },
        },
      }),
    ],
    content: initialHtml || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tt-editor prose',
      },
      handlePaste: (view, event) => {
        const item = Array.from(event.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
        if (!item) return false;
        const file = item.getAsFile();
        if (!file) return false;
        event.preventDefault();
        uploadFile(file).then((url) => {
          if (url && editor) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        });
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith('image/')) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        uploadFile(file).then((url) => {
          if (!url || !editor) return;
          if (coords) {
            editor.chain().focus().insertContentAt(coords.pos, { type: 'image', attrs: { src: url, alt: file.name } }).run();
          } else {
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          }
        });
        return true;
      },
    },
  });

  // expose editor to module-level ref so slash items can reach it
  useEffect(() => {
    editorRef.current = editor;
    return () => { if (editorRef.current === editor) editorRef.current = null; };
  }, [editor]);

  // when image upload finishes via the file input, store the position before opening the picker
  // so we can insert at that location after upload completes
  const onPickerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    const url = await uploadFile(file);
    if (!url) return;
    const at = pendingPosRef.current;
    pendingPosRef.current = null;
    if (at) {
      editor.chain().focus().insertContentAt(at.from, { type: 'image', attrs: { src: url, alt: file.name } }).run();
    } else {
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    }
  };

  // capture cursor position when triggering picker (so slash command can insert at correct spot)
  const triggerImagePickerCaptured = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      pendingPosRef.current = { from, to };
    }
    fileInputRef.current?.click();
  };

  // ─ Toolbar ───────────────────────────────────────────────────────
  const tb = (label: React.ReactNode, op: () => void, active?: boolean, title?: string) => (
    <button
      type="button"
      className={`tb-btn ${active ? 'on' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={op}
      title={title}
    >
      {label}
    </button>
  );

  // Word-style alignment icons — stacked horizontal lines aligned to a side.
  const alignIcon = (variant: 'left' | 'center' | 'right' | 'justify') => {
    // Each row's x range; second/fourth rows are short to convey alignment.
    const rows: Record<typeof variant, [number, number][]> = {
      left:    [[2, 14], [2, 10], [2, 14], [2, 10]],
      center:  [[2, 14], [4, 12], [2, 14], [4, 12]],
      right:   [[2, 14], [6, 14], [2, 14], [6, 14]],
      justify: [[2, 14], [2, 14], [2, 14], [2, 14]],
    };
    const ys = [4, 7, 10, 13];
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {rows[variant].map(([x1, x2], i) => (
          <line key={i} x1={x1} x2={x2} y1={ys[i]} y2={ys[i]} />
        ))}
      </svg>
    );
  };

  if (!editor) {
    return <div className="text-ink-3 py-5">에디터 로딩 중…</div>;
  }

  return (
    <div className="tt-shell">
      <div className="editor-toolbar">
        {tb('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {tb('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        <div className="tb-sep" />
        {tb('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {tb('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {tb('S', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
        {tb('Code', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'))}
        <div className="tb-sep" />
        {tb('“”', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        {tb('— —', () => editor.chain().focus().setHorizontalRule().run())}
        <div className="tb-sep" />
        {tb('• 리스트', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {tb('1. 번호', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {tb('✓ 할 일', () => editor.chain().focus().toggleTaskList().run(), editor.isActive('taskList'))}
        <div className="tb-sep" />
        {tb(alignIcon('left'),    () => editor.chain().focus().setTextAlign('left').run(),    editor.isActive({ textAlign: 'left' }),    '왼쪽 정렬')}
        {tb(alignIcon('center'),  () => editor.chain().focus().setTextAlign('center').run(),  editor.isActive({ textAlign: 'center' }),  '가운데 정렬')}
        {tb(alignIcon('right'),   () => editor.chain().focus().setTextAlign('right').run(),   editor.isActive({ textAlign: 'right' }),   '오른쪽 정렬')}
        {tb(alignIcon('justify'), () => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }), '양쪽 정렬')}
        <div className="tb-sep" />
        {tb('```code', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'))}
        {tb('🔗', () => {
          const prev = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('링크 URL', prev ?? 'https://');
          if (url === null) return;
          if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
          else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }, editor.isActive('link'))}
        {tb('이미지', triggerImagePickerCaptured)}
      </div>
      <EditorContent editor={editor} />
      <ImageMenu editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickerChange}
      />
    </div>
  );
}
