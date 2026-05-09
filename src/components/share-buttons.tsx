'use client';

import { useState } from 'react';

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {}
    } else {
      copy();
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <>
      <button className="btn ghost" onClick={share}>공유</button>
      <button className="btn ghost" onClick={copy}>{copied ? '복사됨' : 'URL 복사'}</button>
    </>
  );
}
