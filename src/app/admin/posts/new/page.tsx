import { PostEditor } from '@/components/admin/post-editor';

export const metadata = { title: '새 글 · kh.log admin' };

export default function NewPostPage() {
  return <PostEditor mode="new" />;
}
