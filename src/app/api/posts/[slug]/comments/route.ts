import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: raw } = await params;
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* already decoded */ }
  const slug = decoded.normalize('NFC');
  const body = await req.json().catch(() => ({}));
  const authorName = typeof body.authorName === 'string' && body.authorName.trim()
    ? body.authorName.trim().slice(0, 40)
    : null;
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: '댓글이 너무 깁니다.' }, { status: 400 });

  const supa = await createClient();
  const { data: post, error: pErr } = await supa
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .maybeSingle();
  if (pErr || !post) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { error } = await supa
    .from('comments')
    .insert({ post_id: (post as { id: string }).id, author_name: authorName, content, status: 'VISIBLE' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
