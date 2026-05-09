import { notFound } from 'next/navigation';
import { getAdminPostForEdit } from '@/lib/queries';
import { PostEditor } from '@/components/admin/post-editor';

export const metadata = { title: '글 수정 · kh.log admin' };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getAdminPostForEdit(id);
  if (!post) notFound();

  return (
    <PostEditor
      mode="edit"
      initial={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? '',
        contentHtml: post.contentHtml ?? undefined,
        contentMd: post.contentMd ?? undefined,
        category: post.category,
        status: post.status,
        readMinutes: post.readMinutes,
        tags: post.tags,
      }}
    />
  );
}
