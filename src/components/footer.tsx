import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} kh.log · TRY · TEST · TIDY</span>
      <span className="links">
        <a href="/feed.xml">RSS</a>
        <a href="/sitemap.xml">Sitemap</a>
        <a href="mailto:kkh147.17.3@gmail.com">메일</a>
        <Link href="/about">소개</Link>
      </span>
    </footer>
  );
}
