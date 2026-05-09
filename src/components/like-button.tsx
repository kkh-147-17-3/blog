'use client';

import { useState } from 'react';

export function LikeButton({ slug, initial }: { slug: string; initial: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      await fetch(`/api/posts/${slug}/like`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ liked: next }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className={`btn ${liked ? 'solid' : ''}`} onClick={toggle} disabled={busy}>
      {liked ? '♥' : '♡'} {count}
    </button>
  );
}
