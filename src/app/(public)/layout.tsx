import { Nav } from '@/components/nav';
import { getSearchIndex } from '@/lib/queries';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const searchPosts = await getSearchIndex();
  return (
    <>
      <Nav searchPosts={searchPosts} />
      <main>{children}</main>
    </>
  );
}
