import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
}
export const SUPABASE_URL = supabaseUrl ?? '';
export const SUPABASE_ANON_KEY = supabaseAnonKey ?? '';
const SUPABASE_CLIENT_KEY = '__gals_supabase_client__';
const globalScope = globalThis;
if (!globalScope[SUPABASE_CLIENT_KEY]) {
    globalScope[SUPABASE_CLIENT_KEY] = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storageKey: 'supabase.auth.gals',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
}
export const supabase = globalScope[SUPABASE_CLIENT_KEY];
