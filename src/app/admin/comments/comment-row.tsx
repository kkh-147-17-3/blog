'use client';

import { useTransition } from 'react';
import { setCommentStatus } from '../actions';
import type { CommentStatus } from '@/lib/types';

export function CommentRow({ id, status }: { id: string; status: CommentStatus }) {
  const [pending, start] = useTransition();
  const set = (next: CommentStatus) =>
    start(async () => { await setCommentStatus(id, next); });

  return (
    <div className="flex gap-[6px]">
      {status !== 'VISIBLE' && (
        <button className="btn sm" onClick={() => set('VISIBLE')} disabled={pending}>복원</button>
      )}
      {status !== 'HIDDEN' && (
        <button className="btn ghost sm" onClick={() => set('HIDDEN')} disabled={pending}>숨김</button>
      )}
      {status !== 'DELETED' && (
        <button className="btn danger sm" onClick={() => set('DELETED')} disabled={pending}>삭제</button>
      )}
    </div>
  );
}
