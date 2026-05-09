import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="screen container py-20">
      <div className="t-meta-up mb-3">404</div>
      <h1 className="t-display text-3xl tracking-[-0.025em] m-0">
        없는 페이지입니다.
      </h1>
      <p className="mt-4 text-ink-2">
        주소를 다시 확인하거나, 아래에서 다른 글을 둘러봐 주세요.
      </p>
      <div className="flex gap-2 mt-5">
        <Link className="btn" href="/">홈으로</Link>
        <Link className="btn ghost" href="/knowledge">지식</Link>
        <Link className="btn ghost" href="/diary">일기</Link>
        <Link className="btn ghost" href="/memo">메모</Link>
      </div>
    </div>
  );
}
