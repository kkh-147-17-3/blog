'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addHeadingIds, slugify } from '@/lib/md';
import { catSlug, parseCategory, parsePostStatus } from '@/lib/types';
import type { Category, CommentStatus, PostStatus } from '@/lib/types';

async function requireAdmin() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect('/admin/login');
  return { supa, user };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' };

  const supa = await createClient();
  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/admin');
}

export async function logout() {
  const supa = await createClient();
  await supa.auth.signOut();
  redirect('/admin/login');
}

interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: Category;
  status: PostStatus;
  readMinutes: number;
  tags: string[];
  publishedAt: string | null;
}

function readPostInput(fd: FormData): PostInput | { error: string } {
  const title = String(fd.get('title') ?? '').trim();
  const slugRaw = String(fd.get('slug') ?? '').trim().normalize('NFC');
  const slug = slugRaw || slugify(title);
  const excerpt = String(fd.get('excerpt') ?? '').trim();
  const contentHtml = String(fd.get('contentHtml') ?? '');
  const category = parseCategory(String(fd.get('category') ?? ''));
  const status = parsePostStatus(String(fd.get('status') ?? '')) ?? 'DRAFT';
  const readMinutes = Math.max(1, parseInt(String(fd.get('readMinutes') ?? '3'), 10) || 3);
  const tags = String(fd.get('tags') ?? '')
    .split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12);

  const publishedAtRaw = String(fd.get('publishedAt') ?? '').trim();
  let publishedAt: string | null = null;
  if (publishedAtRaw) {
    const d = new Date(publishedAtRaw);
    if (Number.isNaN(d.getTime())) return { error: '작성일자가 올바르지 않습니다.' };
    publishedAt = d.toISOString();
  }

  if (!category) return { error: '카테고리가 올바르지 않습니다.' };

  return { slug, title, excerpt, contentHtml, category, status, readMinutes, tags, publishedAt };
}

async function syncTags(supa: Awaited<ReturnType<typeof createClient>>, postId: string, tags: string[]) {
  if (tags.length > 0) {
    await supa.from('tags').upsert(tags.map((name) => ({ name })), { onConflict: 'name' });
  }
  const { data: rows } = await supa.from('tags').select('id, name').in('name', tags.length ? tags : ['__none__']);
  const tagIds = (rows ?? []).map((r) => r.id);

  await supa.from('post_tags').delete().eq('post_id', postId);
  if (tagIds.length > 0) {
    await supa.from('post_tags').insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  }
}

export async function createPost(fd: FormData) {
  const { supa } = await requireAdmin();
  const parsed = readPostInput(fd);
  if ('error' in parsed) return parsed;
  const input = parsed;
  if (!input.title) return { error: '제목을 입력해주세요.' };

  const html = addHeadingIds(input.contentHtml);
  const published_at =
    input.status === 'PUBLISHED'
      ? input.publishedAt ?? new Date().toISOString()
      : input.publishedAt;

  const { data, error } = await supa.from('posts').insert({
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt || null,
    content_md: null,
    content_html: html,
    category: input.category,
    status: input.status,
    read_minutes: input.readMinutes,
    published_at,
  }).select('id, slug, category').single();

  if (error || !data) return { error: error?.message ?? '저장 실패' };

  const created = data as { id: string; slug: string; category: Category };
  await syncTags(supa, created.id, input.tags);
  revalidatePath('/');
  revalidatePath(`/${catSlug(created.category)}`);
  revalidateTag('posts');
  redirect(`/admin/posts/${created.id}`);
}

export async function updatePost(id: string, fd: FormData) {
  const { supa } = await requireAdmin();
  const parsed = readPostInput(fd);
  if ('error' in parsed) return parsed;
  const input = parsed;

  const { data: prev } = await supa.from('posts').select('status, published_at').eq('id', id).maybeSingle();
  const html = addHeadingIds(input.contentHtml);
  const prevRow = prev as { status?: PostStatus; published_at?: string | null } | null;
  let published_at: string | null;
  if (input.publishedAt !== null) {
    // User explicitly chose a date — honor it regardless of status.
    published_at = input.publishedAt;
  } else if (input.status === 'PUBLISHED') {
    // Publishing without a date set: keep prior value or stamp now on first publish.
    published_at = prevRow?.status === 'PUBLISHED'
      ? prevRow?.published_at ?? new Date().toISOString()
      : new Date().toISOString();
  } else {
    published_at = null;
  }

  const { error } = await supa.from('posts').update({
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt || null,
    content_md: null,
    content_html: html,
    category: input.category,
    status: input.status,
    read_minutes: input.readMinutes,
    published_at,
  }).eq('id', id);
  if (error) return { error: error.message };

  await syncTags(supa, id, input.tags);
  revalidatePath('/');
  revalidatePath(`/${catSlug(input.category)}`);
  revalidatePath(`/${catSlug(input.category)}/${input.slug}`);
  revalidateTag('posts');
  return { ok: true };
}

export async function deletePost(id: string) {
  const { supa } = await requireAdmin();
  const { error } = await supa.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  revalidateTag('posts');
  redirect('/admin/posts');
}

export async function updateSiteSetting(key: string, fd: FormData) {
  const { supa } = await requireAdmin();
  const value = String(fd.get('value') ?? '');
  const { error } = await supa
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) return { error: error.message };
  revalidatePath('/about');
  revalidatePath('/admin/site');
  return { ok: true };
}

export async function setCommentStatus(id: string, status: CommentStatus) {
  const { supa } = await requireAdmin();
  const { error } = await supa.from('comments').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/comments');
  return { ok: true };
}
