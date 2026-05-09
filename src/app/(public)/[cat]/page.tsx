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
      <header style={{ padding: 'var(--s-16) 0 var(--s-8)' }}>
        <div className="t-meta-up" style={{ marginBottom: 8 }}>CATEGORY</div>
        <h1 className="t-display" style={{
          margin: 0, fontSize: 'var(--t-3xl)',
          letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 14,
        }}>
          {CAT_LABEL[c]}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--t-md)',
            fontWeight: 400, color: 'var(--ink-3)',
          }}>{list.length}편</span>
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--ink-2)', fontSize: 'var(--t-md)' }}>
          {CAT_DESC[c]}
        </p>
      </header>

      {list.length === 0 ? (
        <p style={{ padding: 'var(--s-8) 0', color: 'var(--ink-3)' }}>아직 글이 없습니다.</p>
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
