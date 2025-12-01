import { create } from 'zustand';
import { supabase } from './supabaseClient';
import { useBattleStore } from './store.js';
import { enableGuestSaveMode, disableGuestSaveMode } from './cloudSave';
const defaultNickname = '소환사';
const guestNicknameStorageKey = 'gals_guest_nickname';
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
    const meta = session.user?.user_metadata ?? {};
    if (typeof meta !== 'object' || meta === null) {
        return null;
    }
    const metaRecord = meta;
    return (normalizeNickname(metaRecord.display_name) ??
        normalizeNickname(metaRecord.nickname) ??
        null);
}
function generateGuestNickname() {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    return `게스트 ${randomId}`;
}
function getStoredGuestNickname() {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem(guestNicknameStorageKey);
}
function persistGuestNickname(nickname) {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(guestNicknameStorageKey, nickname);
}
export const useAuthStore = create((set, get) => ({
    session: null,
    mode: 'user',
    guestSessionActive: false,
    guestId: null,
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
                mode: session ? 'user' : 'user',
                initializing: false,
                error: null,
                message: null,
                profileNickname: metaNickname ?? defaultNickname,
                guestSessionActive: false,
                guestId: null,
            });
            if (session?.user?.id) {
                disableGuestSaveMode();
                await get().refreshProfileNickname();
            }
        }
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                const metaNickname = resolveSessionNickname(session);
                get().exitGuestMode();
                set({
                    session,
                    mode: 'user',
                    loading: false,
                    error: null,
                    message: null,
                    profileNickname: metaNickname ?? defaultNickname,
                });
                void get().refreshProfileNickname();
            }
            else if (event === 'SIGNED_OUT') {
                set({
                    session: null,
                    mode: 'user',
                    guestSessionActive: false,
                    guestId: null,
                    loading: false,
                    message: null,
                    profileNickname: defaultNickname
                });
            }
            else if (event === 'TOKEN_REFRESHED') {
                set({ session, mode: 'user', loading: false });
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
        const profileNickname = normalizeNickname(data?.display_name) ??
            normalizeNickname(data?.nickname) ??
            sessionNickname ??
            defaultNickname;
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
        get().exitGuestMode();
        set({
            loading: false,
            message: '환영합니다!',
            profileNickname: metaNickname ?? defaultNickname,
            session,
            mode: 'user'
        });
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
        set({
            loading: false,
            message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
            profileNickname: normalizedNickname,
            mode: 'user',
            guestSessionActive: false
        });
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
            set({
                session: null,
                mode: 'user',
                guestSessionActive: false,
                guestId: null,
                loading: false,
                message: '로그아웃 되었습니다.',
                profileNickname: defaultNickname
            });
            useBattleStore.getState().setGameScreen('intro');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth-force-overlay'));
            }
        }
        catch (error) {
            console.error('[Auth] 로그아웃 실패', error);
            set({ error: error instanceof Error ? error.message : String(error), loading: false });
        }
    },
    startGuestMode() {
        if (get().guestSessionActive) {
            return;
        }
        const storedNickname = getStoredGuestNickname();
        const nickname = storedNickname ?? generateGuestNickname();
        persistGuestNickname(nickname);
        disableGuestSaveMode();
        enableGuestSaveMode();
        set({
            session: null,
            mode: 'guest',
            guestSessionActive: true,
            guestId: `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            initializing: false,
            loading: false,
            error: null,
            message: '게스트 모드로 플레이합니다.',
            profileNickname: nickname,
        });
    },
    exitGuestMode() {
        if (!get().guestSessionActive) {
            return;
        }
        disableGuestSaveMode();
        set({
            guestSessionActive: false,
            guestId: null,
            mode: 'user',
        });
    }
}));
export function requireSession() {
    const state = useAuthStore.getState();
    return state.session;
}
