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
  const liked = Boolean(body.liked);

  const supa = await createClient();
  const { data: post, error } = await supa
    .from('posts')
    .select('id, likes')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .maybeSingle();
  if (error || !post) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const next = Math.max(0, post.likes + (liked ? 1 : -1));
  const { error: upErr } = await supa.from('posts').update({ likes: next }).eq('id', post.id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ likes: next });
}
