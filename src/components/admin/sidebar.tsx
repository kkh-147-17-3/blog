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
      <Link href="/admin" className="brand" style={{ marginBottom: 'var(--s-5)' }}>
        <span className="brand-dot" />kh.log <span style={{ color: 'var(--ink-3)' }}>/admin</span>
      </Link>

      <div className="admin-nav-section">관리</div>
      {item('/admin', '대시보드')}
      {item('/admin/posts', '글')}
      {item('/admin/comments', '댓글')}

      <div className="admin-nav-section">사이트</div>
      <Link href="/" className="admin-nav-link" target="_blank">공개 블로그 보기 ↗</Link>

      <div style={{ flex: 1 }} />

      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--rule-soft)',
        marginTop: 'var(--s-3)',
      }}>
        <div className="t-meta" style={{ marginBottom: 6, wordBreak: 'break-all' }}>{email ?? '—'}</div>
        <form action={logout}>
          <button type="submit" className="btn ghost sm" style={{ width: '100%' }}>로그아웃</button>
        </form>
      </div>
    </aside>
  );
}
