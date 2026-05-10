import Link from 'next/link';
import { AboutIntroForm } from './about-intro-form';
import { getSiteSetting } from '@/lib/queries';

export const metadata = { title: '사이트 설정 · kh.log admin' };

export default async function AdminSitePage() {
  const aboutIntro = await getSiteSetting('about_intro', '');

  return (
    <>
      <header className="admin-h">
        <div>
          <div className="crumb">관리 / 사이트</div>
          <h1>사이트 설정</h1>
        </div>
        <Link href="/about" target="_blank" className="btn ghost sm">About 보기 ↗</Link>
      </header>

      <section className="max-w-[640px]">
        <h2 className="t-display text-lg font-semibold m-0 mb-1">About 인트로</h2>
        <p className="t-meta mb-4">
          <Link href="/about" className="underline" target="_blank">/about</Link> 첫 단락에 표시되는 문장입니다. 줄바꿈은 그대로 반영돼요.
        </p>
        <AboutIntroForm initial={aboutIntro} />
      </section>
    </>
  );
}
