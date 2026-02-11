import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    // Fallback to dummy values to prevent build failure on Netlify if env vars are missing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    console.log('[Supabase] Init URL:', supabaseUrl === 'https://placeholder.supabase.co' ? 'USING PLACEHOLDER ⚠️' : 'Real URL Set ✅');
    if (supabaseUrl.includes('placeholder')) console.warn('Login will fail because environment variables are missing.');

    return createBrowserClient(supabaseUrl, supabaseKey);
}
