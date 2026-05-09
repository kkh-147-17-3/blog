'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SearchModal } from './search-modal';
import { ThemeToggle } from './theme-toggle';
import type { Post } from '@/lib/types';

interface Props {
  searchPosts: Pick<Post, 'slug' | 'title' | 'excerpt' | 'category' | 'tags' | 'publishedAt'>[];
}

export function Nav({ searchPosts }: Props) {
  const pathname = usePathname() ?? '/';
  const [searchOpen, setSearchOpen] = useState(false);

  const match = (kind: 'home' | 'knowledge' | 'diary' | 'memo' | 'about') => {
    if (kind === 'home') return pathname === '/';
    if (kind === 'about') return pathname.startsWith('/about');
    return pathname.startsWith(`/${kind}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="container-wide nav-inner">
          <Link href="/" className="brand">
            <span className="brand-dot" />
            kh.log
          </Link>
          <div className="nav-links">
            <Link href="/" className={match('home') ? 'active' : ''}>홈</Link>
            <Link href="/knowledge" className={match('knowledge') ? 'active' : ''}>지식</Link>
            <Link href="/diary" className={match('diary') ? 'active' : ''}>일기</Link>
            <Link href="/memo" className={match('memo') ? 'active' : ''}>메모</Link>
            <Link href="/about" className={match('about') ? 'active' : ''}>소개</Link>
          </div>
          <div className="nav-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="검색">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5 14 14" strokeLinecap="round" />
              </svg>
              <span>검색</span> <span className="kbd">⌘K</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        posts={searchPosts}
      />
    </>
  );
}
