'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Mode = 'light' | 'dark';
type Cat = 'knowledge' | 'diary' | 'memo' | 'none';

interface ThemeCtx {
  mode: Mode;
  setMode: (m: Mode) => void;
  cat: Cat;
  setCat: (c: Cat) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

function readPathCat(path: string): Cat {
  if (path.startsWith('/knowledge')) return 'knowledge';
  if (path.startsWith('/diary')) return 'diary';
  if (path.startsWith('/memo')) return 'memo';
  return 'none';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [mode, setModeState] = useState<Mode>('light');
  const [cat, setCatState] = useState<Cat>('none');

  // Read mode from localStorage on mount
  useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem('jh.mode') as Mode | null)
      : null);
    if (stored === 'dark' || stored === 'light') setModeState(stored);
  }, []);

  // Apply mode + cat to <body> data attrs
  useEffect(() => {
    document.body.setAttribute('data-mode', mode);
    try { localStorage.setItem('jh.mode', mode); } catch {}
  }, [mode]);

  // Auto-derive cat from pathname (overridable via setCat for detail pages)
  useEffect(() => {
    if (pathname.startsWith('/admin')) return; // admin is neutral
    const auto = readPathCat(pathname);
    setCatState(auto);
  }, [pathname]);

  useEffect(() => {
    document.body.setAttribute('data-cat', cat);
  }, [cat]);

  const setMode = (m: Mode) => setModeState(m);
  const setCat = (c: Cat) => setCatState(c);

  return <Ctx.Provider value={{ mode, setMode, cat, setCat }}>{children}</Ctx.Provider>;
}
