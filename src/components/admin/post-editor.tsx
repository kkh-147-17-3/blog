'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, deletePost, updatePost } from '@/app/admin/actions';
import { md2html, slugify } from '@/lib/md';
import type { Category, PostStatus } from '@/lib/types';

const TiptapEditor = dynamic(
  () => import('./tiptap-editor').then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="text-ink-3 py-5">에디터 로딩 중…</div> },
);

interface Initial {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Either pre-rendered HTML (preferred — from Tiptap) or legacy markdown that we'll lift into the editor. */
  contentHtml?: string;
  contentMd?: string;
  category: Category;
  status: PostStatus;
  readMinutes: number;
  tags: string[];
  publishedAt?: string | null;
}

interface Props {
  mode: 'new' | 'edit';
  initial?: Initial;
}

const empty = {
  slug: '',
  title: '',
  excerpt: '',
  contentHtml: '',
  category: 'KNOWLEDGE' as Category,
  status: 'DRAFT' as PostStatus,
  readMinutes: 3,
  tags: [] as string[],
  publishedAt: '',
};

// Convert ISO timestamp <-> <input type="datetime-local"> value (local time, no TZ).
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function PostEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Toggle <body class="editor-fullscreen"> so admin shell CSS can hide chrome.
  useEffect(() => {
    if (!fullscreen) return;
    document.body.classList.add('editor-fullscreen');
    return () => document.body.classList.remove('editor-fullscreen');
  }, [fullscreen]);

  // ⌘⇧F toggles, Esc exits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setFullscreen((f) => !f);
      } else if (e.key === 'Escape' && fullscreen) {
        // Only exit if no menu/popup is intercepting (Tiptap suggestion handles its own Esc earlier).
        const target = e.target as HTMLElement | null;
        if (!target?.closest('.tippy-box, .modal, .image-menu')) {
          setFullscreen(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // Lift legacy markdown into HTML once on first mount, then track HTML only.
  const initialHtml =
    initial?.contentHtml ??
    (initial?.contentMd ? md2html(initial.contentMd) : '');

  const [state, setState] = useState({
    ...empty,
    ...(initial && {
      slug: initial.slug,
      title: initial.title,
      excerpt: initial.excerpt,
      category: initial.category,
      status: initial.status,
      readMinutes: initial.readMinutes,
      tags: initial.tags,
      publishedAt: isoToLocalInput(initial.publishedAt),
    }),
    contentHtml: initialHtml,
  });

  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '');
  const parseTags = (s: string) => s.split(',').map((t) => t.trim()).filter(Boolean);

  const slug = state.slug || slugify(state.title);

  const submit = (overrideStatus?: PostStatus) => {
    setErr(null);
    const fd = new FormData();
    fd.set('title', state.title);
    fd.set('slug', slug);
    fd.set('excerpt', state.excerpt);
    fd.set('contentHtml', state.contentHtml);
    fd.set('category', state.category);
    fd.set('status', overrideStatus ?? state.status);
    fd.set('readMinutes', String(state.readMinutes));
    fd.set('tags', parseTags(tagsInput).join(','));
    fd.set('publishedAt', localInputToIso(state.publishedAt));

    start(async () => {
      if (mode === 'new') {
        const r = await createPost(fd);
        if (r && 'error' in r && r.error) setErr(r.error);
      } else {
        const r = await updatePost(initial!.id, fd);
        if (r && 'error' in r && r.error) setErr(r.error);
        else { setToast('저장됨'); setTimeout(() => setToast(null), 1400); }
      }
    });
  };

  const onDelete = () => {
    if (!initial) return;
    if (!confirm('정말 삭제할까요? 되돌릴 수 없습니다.')) return;
    start(async () => {
      const r = await deletePost(initial.id);
      if (r && 'error' in r && r.error) setErr(r.error);
    });
  };

  return (
    <>
      <header className="admin-h">
        <div>
          <div className="crumb">{mode === 'new' ? '새 글' : '글 수정'}</div>
          <h1>{state.title || (mode === 'new' ? '제목 없음' : '글 수정')}</h1>
        </div>
        <div className="flex gap-2 items-center">
          {err && <span className="t-meta text-cat-diary">{err}</span>}
          {mode === 'edit' && !fullscreen && (
            <button type="button" className="btn ghost" onClick={() => router.push('/admin/posts')}>
              ← 목록
            </button>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? '나가기 (⌘⇧F · Esc)' : '전체보기 (⌘⇧F)'}
            aria-label={fullscreen ? '전체보기 나가기' : '전체보기'}
          >
            {fullscreen ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6V3M6 6H3M10 6V3M10 6h3M6 10v3M6 10H3M10 10v3M10 10h3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
              </svg>
            )}
          </button>
          <button type="button" className="btn" onClick={() => submit('DRAFT')} disabled={pending}>
            임시저장
          </button>
          <button type="button" className="btn solid" onClick={() => submit('PUBLISHED')} disabled={pending || !state.title}>
            {pending ? '저장 중…' : '발행'}
          </button>
          {mode === 'edit' && !fullscreen && (
            <button type="button" className="btn danger" onClick={onDelete} disabled={pending}>
              삭제
            </button>
          )}
        </div>
      </header>

      <div className="editor-shell">
        <div>
          <input
            className="editor-title"
            placeholder="제목"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          />
          <TiptapEditor
            initialHtml={initialHtml}
            onChange={(html) => setState((s) => ({ ...s, contentHtml: html }))}
          />
        </div>

        <aside className="editor-meta">
          <div className="field">
            <div className="label">상태</div>
            <select
              className="input"
              value={state.status}
              onChange={(e) => setState((s) => ({ ...s, status: e.target.value as PostStatus }))}
            >
              <option value="DRAFT">초안</option>
              <option value="PUBLISHED">발행</option>
              <option value="PRIVATE">비공개</option>
            </select>
          </div>

          <div className="field">
            <div className="label">작성일자</div>
            <input
              className="input"
              type="datetime-local"
              value={state.publishedAt}
              onChange={(e) => setState((s) => ({ ...s, publishedAt: e.target.value }))}
            />
            <div className="t-meta" style={{ marginTop: 4 }}>
              발행 시 자동 입력됩니다. 직접 지정 가능.
            </div>
          </div>

          <div className="field">
            <div className="label">카테고리</div>
            <select
              className="input"
              value={state.category}
              onChange={(e) => setState((s) => ({ ...s, category: e.target.value as Category }))}
            >
              <option value="KNOWLEDGE">지식</option>
              <option value="DIARY">일기</option>
              <option value="MEMO">메모</option>
            </select>
          </div>

          <div className="field">
            <div className="label">URL slug</div>
            <input
              className="input"
              value={state.slug}
              placeholder={slugify(state.title) || 'auto'}
              onChange={(e) => setState((s) => ({ ...s, slug: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">요약</div>
            <textarea
              className="input"
              rows={3}
              value={state.excerpt}
              onChange={(e) => setState((s) => ({ ...s, excerpt: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">읽기 시간 (분)</div>
            <input
              className="input"
              type="number"
              min={1}
              max={120}
              value={state.readMinutes}
              onChange={(e) => setState((s) => ({ ...s, readMinutes: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="field">
            <div className="label">태그 (쉼표로 구분)</div>
            <input
              className="input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={() => setTagsInput(parseTags(tagsInput).join(', '))}
              placeholder="nextjs, react, 회고"
            />
          </div>
        </aside>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
