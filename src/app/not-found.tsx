import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="screen container" style={{ padding: 'var(--s-20) 0' }}>
      <div className="t-meta-up" style={{ marginBottom: 'var(--s-3)' }}>404</div>
      <h1 className="t-display" style={{
        fontSize: 'var(--t-3xl)', letterSpacing: '-0.025em', margin: 0,
      }}>
        없는 페이지입니다.
      </h1>
      <p style={{ marginTop: 'var(--s-4)', color: 'var(--ink-2)' }}>
        주소를 다시 확인하거나, 아래에서 다른 글을 둘러봐 주세요.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-5)' }}>
        <Link className="btn" href="/">홈으로</Link>
        <Link className="btn ghost" href="/knowledge">지식</Link>
        <Link className="btn ghost" href="/diary">일기</Link>
        <Link className="btn ghost" href="/memo">메모</Link>
      </div>
    </div>
  );
}
