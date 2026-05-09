import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata = { title: '관리자 로그인 · kh.log' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-[360px]">
        <div className="t-meta-up mb-2">ADMIN</div>
        <h1 className="t-display m-0 mb-6 text-2xl tracking-display">
          kh.log 관리자
        </h1>
        <LoginForm />
        <p className="t-meta mt-5 text-center">
          공개 블로그로 <Link href="/" className="border-b border-current">돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
