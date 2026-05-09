import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata = { title: '관리자 로그인 · kh.log' };

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--s-8)',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div className="t-meta-up" style={{ marginBottom: 8 }}>ADMIN</div>
        <h1 className="t-display" style={{
          margin: 0, fontSize: 'var(--t-2xl)', letterSpacing: '-0.02em', marginBottom: 'var(--s-6)',
        }}>
          kh.log 관리자
        </h1>
        <LoginForm />
        <p className="t-meta" style={{ marginTop: 'var(--s-5)', textAlign: 'center' }}>
          공개 블로그로 <Link href="/" style={{ borderBottom: '1px solid currentColor' }}>돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
