import { unstable_cache } from 'next/cache';
import { createAnonClient, createClient } from '@/lib/supabase/server';
import type { Category, Comment, CommentStatus, Post, PostStatus } from '@/lib/types';

// ───── Public read path ─────────────────────────────────────────────

interface RawPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  content_md: string | null;
  category: Category;
  status: PostStatus;
  thumbnail_url: string | null;
  read_minutes: number;
  likes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  post_tags?: { tags: { name: string } | null }[] | null;
  post_views?: { view_count: number } | null;
}

const POST_SELECT = `
  id, slug, title, excerpt, content_html, content_md, category, status,
  thumbnail_url, read_minutes, likes, published_at, created_at, updated_at,
  post_tags ( tags ( name ) ),
  post_views ( view_count )
`;

function mapPost(raw: RawPost): Post {
  const ptArr = (raw.post_tags ?? []) as unknown as
    { tags: { name: string } | { name: string }[] | null }[];
  const tags = ptArr
    .flatMap((pt) => Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [])
    .map((t) => t.name)
    .filter(Boolean);
  const pv = raw.post_views as unknown as { view_count: number } | { view_count: number }[] | null | undefined;
  const views = Array.isArray(pv) ? (pv[0]?.view_count ?? 0) : (pv?.view_count ?? 0);
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    contentHtml: raw.content_html,
    contentMd: raw.content_md,
    category: raw.category,
    status: raw.status,
    thumbnailUrl: raw.thumbnail_url,
    readMinutes: raw.read_minutes,
    likes: raw.likes,
    views,
    tags,
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

interface RawComment {
  id: string;
  post_id: string;
  author_name: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
}

function mapComment(raw: RawComment): Comment {
  return {
    id: raw.id,
    postId: raw.post_id,
    authorName: raw.author_name,
    content: raw.content,
    status: raw.status,
    createdAt: raw.created_at,
  };
}

export async function getPublishedPosts(opts: { category?: Category; limit?: number } = {}): Promise<Post[]> {
  const supa = await createClient();
  let q = supa
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as unknown as RawPost[]).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supa = await createClient();
  // params.slug arrives percent-encoded in some Next.js routing paths; decode defensively.
  let decoded = slug;
  try { decoded = decodeURIComponent(slug); } catch { /* already decoded or malformed */ }
  const nfc = decoded.normalize('NFC');
  const { data } = await supa
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', nfc)
    .eq('status', 'PUBLISHED')
    .maybeSingle();
  if (data) return mapPost(data as unknown as RawPost);

  // Fallback: existing rows may have been stored in NFD (or any other normalization).
  // Compare NFC-normalized slugs JS-side so legacy data still resolves.
  const { data: candidates } = await supa
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'PUBLISHED');
  const found = (candidates as unknown as RawPost[] | null)?.find(
    (p) => p.slug.normalize('NFC') === nfc,
  );
  return found ? mapPost(found) : null;
}

export async function getRelatedPosts(post: Post, limit = 2): Promise<Post[]> {
  const supa = await createClient();
  const { data, error } = await supa
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('category', post.category)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as RawPost[]).map(mapPost);
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const supa = await createClient();
  const { data, error } = await supa
    .from('comments')
    .select('id, post_id, author_name, content, status, created_at')
    .eq('post_id', postId)
    .eq('status', 'VISIBLE')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as unknown as RawComment[]).map(mapComment);
}

/** Cached across requests; busted via revalidateTag('posts') in admin actions. */
export const getSearchIndex = unstable_cache(
  async (): Promise<Pick<Post, 'slug' | 'title' | 'excerpt' | 'category' | 'tags' | 'publishedAt'>[]> => {
    const supa = createAnonClient();
    const { data, error } = await supa
      .from('posts')
      .select(POST_SELECT)
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as unknown as RawPost[]).map(mapPost).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
      publishedAt: p.publishedAt,
    }));
  },
  ['search-index'],
  { tags: ['posts'], revalidate: 300 },
);

// ───── Site settings (key/value) ───────────────────────────────────

export async function getSiteSetting(key: string, fallback = ''): Promise<string> {
  const supa = await createClient();
  const { data } = await supa
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  const row = data as { value: string } | null;
  return row?.value ?? fallback;
}

// ───── Admin read path ─────────────────────────────────────────────

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  category: Category;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminCommentRow {
  id: string;
  authorName: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  post: { slug: string; title: string; category: Category } | null;
}

export interface AdminPostEdit {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  contentMd: string | null;
  category: Category;
  status: PostStatus;
  readMinutes: number;
  tags: string[];
}

function mapListItem(r: {
  id: string; slug: string; title: string;
  category: Category; status: PostStatus;
  published_at: string | null; updated_at: string;
}): PostListItem {
  return {
    id: r.id, slug: r.slug, title: r.title,
    category: r.category, status: r.status,
    publishedAt: r.published_at, updatedAt: r.updated_at,
  };
}

export async function getAdminCounts() {
  const supa = await createClient();
  const [{ count: totalPosts }, { count: drafts }, { count: comments }, { count: published }] =
    await Promise.all([
      supa.from('posts').select('*', { count: 'exact', head: true }),
      supa.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
      supa.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'VISIBLE'),
      supa.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    ]);
  return {
    totalPosts: totalPosts ?? 0,
    published: published ?? 0,
    drafts: drafts ?? 0,
    comments: comments ?? 0,
  };
}

export async function getAdminRecentPosts(limit = 8): Promise<PostListItem[]> {
  const supa = await createClient();
  const { data } = await supa
    .from('posts')
    .select('id, slug, title, category, status, updated_at, published_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  type Row = Parameters<typeof mapListItem>[0];
  return ((data as unknown as Row[]) ?? []).map(mapListItem);
}

export async function getAdminRecentComments(limit = 5): Promise<{
  id: string; content: string; authorName: string | null; createdAt: string;
}[]> {
  const supa = await createClient();
  const { data } = await supa
    .from('comments')
    .select('id, content, author_name, created_at')
    .eq('status', 'VISIBLE')
    .order('created_at', { ascending: false })
    .limit(limit);
  type Row = { id: string; content: string; author_name: string | null; created_at: string };
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    content: r.content,
    authorName: r.author_name,
    createdAt: r.created_at,
  }));
}

/** Admin posts list — accepts lowercase URL params, uppercases at the boundary. */
export async function getAdminPosts(filters: { q?: string; cat?: string; status?: string } = {}): Promise<PostListItem[]> {
  const supa = await createClient();
  let q = supa
    .from('posts')
    .select('id, slug, title, category, status, updated_at, published_at')
    .order('updated_at', { ascending: false });
  if (filters.q)      q = q.ilike('title', `%${filters.q}%`);
  if (filters.cat)    q = q.eq('category', filters.cat.toUpperCase());
  if (filters.status) q = q.eq('status', filters.status.toUpperCase());
  const { data } = await q;
  type Row = Parameters<typeof mapListItem>[0];
  return ((data as unknown as Row[]) ?? []).map(mapListItem);
}

export async function getAdminPostForEdit(id: string): Promise<AdminPostEdit | null> {
  const supa = await createClient();
  const { data } = await supa
    .from('posts')
    .select('id, slug, title, excerpt, content_html, content_md, category, status, read_minutes, post_tags ( tags ( name ) )')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  type Row = {
    id: string; slug: string; title: string; excerpt: string | null;
    content_html: string | null; content_md: string | null;
    category: Category; status: PostStatus; read_minutes: number;
    post_tags: unknown;
  };
  const row = data as unknown as Row;
  const ptArr = (row.post_tags ?? []) as unknown as
    { tags: { name: string } | { name: string }[] | null }[];
  const tags = ptArr
    .flatMap((pt) => Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [])
    .map((t) => t.name)
    .filter(Boolean);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentHtml: row.content_html,
    contentMd: row.content_md,
    category: row.category,
    status: row.status,
    readMinutes: row.read_minutes,
    tags,
  };
}

export async function getAdminComments(status: CommentStatus): Promise<AdminCommentRow[]> {
  const supa = await createClient();
  const { data } = await supa
    .from('comments')
    .select('id, content, author_name, created_at, status, posts ( slug, title, category )')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100);
  type Row = {
    id: string; content: string; author_name: string | null; created_at: string;
    status: CommentStatus;
    posts: { slug: string; title: string; category: Category } | { slug: string; title: string; category: Category }[] | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => {
    const post = Array.isArray(r.posts) ? r.posts[0] ?? null : r.posts;
    return {
      id: r.id,
      authorName: r.author_name,
      content: r.content,
      status: r.status,
      createdAt: r.created_at,
      post: post ?? null,
    };
  });
}
