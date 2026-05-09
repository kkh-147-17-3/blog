'use client';

import { useEffect } from 'react';

export function ViewPinger({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `jh.view.${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`/api/posts/${slug}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);
  return null;
}
