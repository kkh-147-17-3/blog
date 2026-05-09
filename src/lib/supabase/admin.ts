import { createClient as createSbClient } from '@supabase/supabase-js';

/**
 * Service-role client — RLS bypass. Use ONLY in server-side code that needs
 * to read drafts / privates / hidden comments, or run admin maintenance.
 *
 * Reads SUPABASE_SECRET_KEY (the new "secret" key, formerly "service_role").
 */
export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
