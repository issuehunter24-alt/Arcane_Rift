import { create } from 'zustand';
import { supabase } from './supabaseClient';
import { useBattleStore } from './store';
const defaultNickname = '소환사';
function normalizeNickname(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function resolveSessionNickname(session) {
    if (!session) {
        return null;
    }
    const meta = (session?.user?.user_metadata) ?? {};
    if (typeof meta !== 'object' || meta === null) {
        return null;
    }
    return (normalizeNickname(meta.display_name) ?? normalizeNickname(meta.nickname) ?? null);
}
export const useAuthStore = create((set, get) => ({
    session: null,
    initializing: true,
    loading: false,
    error: null,
    message: null,
    authView: 'sign-in',
    profileNickname: defaultNickname,
    async initialize() {
        set({ initializing: true });
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('[Auth] 세션 초기화 실패', error);
            set({ error: '세션 정보를 불러오지 못했습니다.', initializing: false });
        }
        else {
            const session = data.session ?? null;
            const metaNickname = resolveSessionNickname(session);
            set({
                session,
                initializing: false,
                error: null,
                message: null,
                profileNickname: metaNickname ?? defaultNickname,
            });
            if (session?.user?.id) {
                await get().refreshProfileNickname();
            }
        }
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                const metaNickname = resolveSessionNickname(session);
                set({
                    session,
                    loading: false,
                    error: null,
                    message: null,
                    profileNickname: metaNickname ?? defaultNickname,
                });
                void get().refreshProfileNickname();
            }
            else if (event === 'SIGNED_OUT') {
                set({ session: null, loading: false, message: null, profileNickname: defaultNickname });
            }
            else if (event === 'TOKEN_REFRESHED') {
                set({ session, loading: false });
            }
        });
    },
    setAuthView(view) {
        set({ authView: view, error: null, message: null });
    },
    setProfileNickname(nickname) {
        set({ profileNickname: normalizeNickname(nickname) ?? defaultNickname });
    },
    async refreshProfileNickname() {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (!session) {
            set({ profileNickname: defaultNickname });
            return;
        }
        const sessionNickname = resolveSessionNickname(session);
        const { data, error } = await supabase
            .from('profiles')
            .select('display_name, nickname')
            .eq('user_id', session.user.id)
            .maybeSingle();
        if (error) {
            console.warn('[Auth] 프로필 닉네임 불러오기 실패', error);
            set({ profileNickname: sessionNickname ?? defaultNickname });
            return;
        }
        const profileNickname = normalizeNickname(data?.display_name) ?? normalizeNickname(data?.nickname) ?? sessionNickname ?? defaultNickname;
        set({ profileNickname });
    },
    async signIn(email, password) {
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('[Auth] 로그인 실패', error);
            set({ error: error.message, loading: false });
            return;
        }
        const { data } = await supabase.auth.getSession();
        const session = data.session ?? null;
        const metaNickname = resolveSessionNickname(session);
        set({ loading: false, message: '환영합니다!', profileNickname: metaNickname ?? defaultNickname });
        void get().refreshProfileNickname();
    },
    async signUp(email, password, nickname) {
        set({ loading: true, error: null });
        const normalizedNickname = normalizeNickname(nickname) ?? defaultNickname;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: normalizedNickname
                }
            }
        });
        if (error) {
            console.error('[Auth] 회원가입 실패', error);
            set({ error: error.message, loading: false });
            return;
        }
        const session = data.session ?? null;
        if (session) {
            await supabase.from('profiles').upsert({
                user_id: session.user.id,
                display_name: normalizedNickname,
                nickname: normalizedNickname,
                locale: 'ko',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
        set({ loading: false, message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.' });
        set({ profileNickname: normalizedNickname });
    },
    async signOut() {
        set({ loading: true, error: null });
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                set({ session: null, loading: false, message: '이미 로그아웃된 상태입니다.' });
                return;
            }
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error && !/auth session missing/i.test(error.message)) {
                throw error;
            }
            set({ session: null, loading: false, message: '로그아웃 되었습니다.', profileNickname: defaultNickname });
            useBattleStore.getState().setGameScreen('intro');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth-force-overlay'));
            }
        }
        catch (error) {
            console.error('[Auth] 로그아웃 실패', error);
            set({ error: error instanceof Error ? error.message : String(error), loading: false });
        }
    }
}));
export function requireSession() {
    const state = useAuthStore.getState();
    return state.session;
}
