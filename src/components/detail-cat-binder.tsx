'use client';

import { useEffect } from 'react';
import { useTheme } from './theme-provider';
import { catSlug } from '@/lib/types';
import type { Category } from '@/lib/types';

export function DetailCatBinder({ cat }: { cat: Category }) {
  const { setCat } = useTheme();
  useEffect(() => {
    setCat(catSlug(cat));
    return () => setCat('none');
  }, [cat, setCat]);
  return null;
}
