import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import { KnowledgeList } from '@/components/knowledge-list';
import { DiaryTimeline } from '@/components/diary-timeline';
import { MemoList } from '@/components/memo-list';
import { getPublishedPosts } from '@/lib/queries';
import { CAT_DESC, CAT_LABEL, parseCategory } from '@/lib/types';

interface Params { cat: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { cat } = await params;
  const c = parseCategory(cat);
  if (!c) return {};
  return { title: `${CAT_LABEL[c]} · kh.log`, description: CAT_DESC[c] };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { cat } = await params;
  const c = parseCategory(cat);
  if (!c) notFound();
  const list = await getPublishedPosts({ category: c });

  const wrap = c === 'KNOWLEDGE' ? 'screen container-wide' : 'screen container';

  return (
    <div className={wrap}>
      <header className="pt-16 pb-8">
        <div className="t-meta-up mb-2">CATEGORY</div>
        <h1 className="t-display m-0 text-3xl tracking-display flex items-baseline gap-[14px]">
          {CAT_LABEL[c]}
          <span className="font-mono text-md font-normal text-ink-3">{list.length}편</span>
        </h1>
        <p className="mt-2 mb-0 text-ink-2 text-md">
          {CAT_DESC[c]}
        </p>
      </header>

      {list.length === 0 ? (
        <p className="py-8 text-ink-3">아직 글이 없습니다.</p>
      ) : c === 'KNOWLEDGE' ? (
        <KnowledgeList list={list} />
      ) : c === 'DIARY' ? (
        <DiaryTimeline list={list} />
      ) : (
        <MemoList list={list} />
      )}

      <Footer />
    </div>
  );
}
