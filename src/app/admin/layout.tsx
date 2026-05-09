import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();

  // Login page renders without sidebar.
  // We can't know the route here in a server component — show sidebar only when user exists.
  if (!user) return <>{children}</>;

  return (
    <div className="admin-shell">
      <AdminSidebar email={user.email ?? null} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
