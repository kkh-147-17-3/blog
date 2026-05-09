// Hand-written Database types — minimal, mirrors schema.sql.
// Currently NOT applied to the Supabase clients (we use untyped clients to keep
// TypeScript flexible against join shapes). Kept for documentation; if you want
// strict typing across the app, run `supabase gen types typescript` and replace
// this file, then add the generic to createBrowserClient/createServerClient calls.

export type Database = {
  public: {
    Tables: {
      posts: { Row: Record<string, unknown> };
      tags: { Row: Record<string, unknown> };
      post_tags: { Row: Record<string, unknown> };
      post_views: { Row: Record<string, unknown> };
      comments: { Row: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
