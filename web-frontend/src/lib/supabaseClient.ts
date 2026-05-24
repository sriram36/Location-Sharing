import { createBrowserClient } from '@supabase/ssr';

// createBrowserClient from @supabase/ssr is internally a singleton per URL/key,
// so calling this multiple times is safe and returns the same client instance.
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
