'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/admin/actions';

export function AdminSidebar({ email }: { email: string | null }) {
  const path = usePathname() ?? '/admin';
  const item = (href: string, label: string) => (
    <Link href={href} className={`admin-nav-link ${path === href || (href !== '/admin' && path.startsWith(href)) ? 'active' : ''}`}>
      {label}
    </Link>
  );

  return (
    <aside>
      <Link href="/admin" className="brand mb-5">
        <span className="brand-dot" />kh.log <span className="text-ink-3">/admin</span>
      </Link>

      <div className="admin-nav-section">관리</div>
      {item('/admin', '대시보드')}
      {item('/admin/posts', '글')}
      {item('/admin/comments', '댓글')}
      {item('/admin/site', '사이트 설정')}

      <div className="admin-nav-section">사이트</div>
      <Link href="/" className="admin-nav-link" target="_blank">공개 블로그 보기 ↗</Link>

      <div className="flex-1" />

      <div className="p-[10px] border-t border-rule-soft mt-3">
        <div className="t-meta mb-[6px] break-all">{email ?? '—'}</div>
        <form action={logout}>
          <button type="submit" className="btn ghost sm w-full">로그아웃</button>
        </form>
      </div>
    </aside>
  );
}
