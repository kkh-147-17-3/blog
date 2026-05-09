import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'post-images';

export async function POST(req: Request) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.', code: 'unauthorized' }, { status: 401 });
  }

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: '잘못된 요청 형식입니다.', code: 'bad_form' }, { status: 400 });

  const file = fd.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 없습니다.', code: 'no_file' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: `이미지가 아닙니다 (${file.type || 'unknown'}).`, code: 'bad_mime' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)} MiB > 5 MiB).`, code: 'too_large' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supa.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    // Surface the underlying Supabase error so the client can hint the user about
    // the most likely cause (missing bucket / RLS policy).
    const msg = error.message;
    const looksLikeMissingBucket = /not found|bucket/i.test(msg);
    const looksLikeRls = /not authorized|new row violates|policy|permission/i.test(msg);
    const hint = looksLikeMissingBucket
      ? `'${BUCKET}' 버킷이 없습니다. \`npm run db:push\` 로 마이그레이션을 적용하거나 Supabase Dashboard → Storage 에서 버킷을 만드세요.`
      : looksLikeRls
        ? `Storage RLS 정책 문제일 가능성. \`npm run db:push\` 로 storage 마이그레이션을 적용했는지 확인하세요.`
        : null;
    console.error('[upload] supabase error:', msg);
    return NextResponse.json({
      error: hint ? `${msg} — ${hint}` : msg,
      code: 'storage_error',
      raw: msg,
    }, { status: 500 });
  }

  const { data: { publicUrl } } = supa.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: publicUrl, path });
}
