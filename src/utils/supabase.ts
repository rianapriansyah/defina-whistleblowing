import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

if (!supabaseUrl?.trim() || !supabaseKey?.trim()) {
  throw new Error(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY). ' +
      'On Vercel: Project → Settings → Environment Variables, add them for Production, then redeploy (Vite bakes them in at build time). ' +
      'Names must start with VITE_ to be available in the browser.'
  );
}

const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());

export default supabase;