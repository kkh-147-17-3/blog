'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CommentForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ authorName: name.trim() || null, content: text.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? '저장하지 못했습니다.');
      }
      setText('');
      setName('');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border border-rule rounded-md p-4 mb-5 bg-bg-tint"
    >
      <input
        placeholder="닉네임 (선택)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-rule-soft py-[6px] px-0 text-sm text-ink outline-none [font-family:inherit]"
      />
      <textarea
        placeholder="이 글에 대한 생각을 남겨주세요…"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full mt-[10px] bg-transparent border-0 resize-y p-0 text-sm leading-[1.7] text-ink outline-none [font-family:inherit] min-h-[64px]"
      />
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-rule-soft">
        <span className="t-meta">
          {err ? <span className="text-cat-diary">{err}</span>
               : '익명으로 남기면 닉네임은 비워두셔도 돼요.'}
        </span>
        <button type="submit" className="btn sm" disabled={busy || !text.trim()}>
          {busy ? '저장 중…' : '등록'}
        </button>
      </div>
    </form>
  );
}
