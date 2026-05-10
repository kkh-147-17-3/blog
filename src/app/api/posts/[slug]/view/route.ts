import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: raw } = await params;
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* already decoded */ }
  const slug = decoded.normalize('NFC');
  const supa = await createClient();
  const { error } = await supa.rpc('increment_post_view', { p_slug: slug });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
