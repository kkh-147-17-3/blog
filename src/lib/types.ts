export type Category = 'KNOWLEDGE' | 'DIARY' | 'MEMO';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'PRIVATE';
export type CommentStatus = 'VISIBLE' | 'HIDDEN' | 'DELETED';

/** Domain type — camelCase fields, UPPERCASE enum values (matching DB enums). */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  contentMd: string | null;
  category: Category;
  status: PostStatus;
  thumbnailUrl: string | null;
  readMinutes: number;
  views: number;
  likes: number;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export const CAT_LABEL: Record<Category, string> = {
  KNOWLEDGE: '지식',
  DIARY: '일기',
  MEMO: '메모',
};

export const CAT_DESC: Record<Category, string> = {
  KNOWLEDGE: '직접 만들고 부딪히며 정리한 것',
  DIARY: '하루의 정리',
  MEMO: '짧게 남긴 인용·생각',
};

/** Lowercase slug — used in URLs and CSS classes (CSS rules + data-cat attr stay lowercase). */
export type CatSlug = 'knowledge' | 'diary' | 'memo';

export function catSlug(c: Category): CatSlug {
  return c.toLowerCase() as CatSlug;
}

export function parseCategory(s: string): Category | null {
  const u = s.toUpperCase();
  return u === 'KNOWLEDGE' || u === 'DIARY' || u === 'MEMO' ? (u as Category) : null;
}

export function parsePostStatus(s: string): PostStatus | null {
  const u = s.toUpperCase();
  return u === 'DRAFT' || u === 'PUBLISHED' || u === 'PRIVATE' ? (u as PostStatus) : null;
}

export function parseCommentStatus(s: string): CommentStatus | null {
  const u = s.toUpperCase();
  return u === 'VISIBLE' || u === 'HIDDEN' || u === 'DELETED' ? (u as CommentStatus) : null;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}.${day}`;
}
