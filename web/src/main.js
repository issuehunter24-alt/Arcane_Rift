import { Application, Assets, Sprite, Container, Text, Graphics } from 'pixi.js';
import { getCardImagePath, getCardImagePathFallback } from './cardImage';
import { t, setLocale, getCurrentLocale } from './i18n';
import { useBattleStore, setVFXCallback, setCardUseAnimationCallback, setHandTrackingResetCallback, setEnemyHandUpdateCallback, getBoostedStageReward, getPvpRankInfo, } from './store.js';
import { handleAuthSessionChange } from './cloudSave';
import { useAuthStore } from './authStore';
import { loadSampleCards } from './data';
import { preloadCardImages, getLoadedCardImage, getCardBackImage } from './assetLoader';
import { playerHandPool, enemyHandPool } from './cardPool';
import { vfxManager } from './vfx';
import { tweenNumber, Easing } from './tweens';
import { audioManager, initAudio } from './audio';
import { toastManager, loadingManager } from './toast';
import { getSpecialBackground } from './utils/backgroundVariation';
const STARTER_COLLECTION_CARD_IDS_SAFE = [
    'ATT_ARIANA_NO_001',
    'ATT_ARIANA_NO_001',
    'ATT_DARIUS_NO_017',
    'ATT_KAI_NO_097',
    'ATT_LUCIAN_NO_129',
    'ATT_MARCUS_NO_145',
    'DEF_ARIANA_NO_013',
    'DEF_DARIUS_NO_025',
    'DEF_GAREN_NO_077',
    'DEF_LEON_NO_121',
    'DEF_LUCIAN_NO_137',
    'HEA_ARIANA_NO_005',
    'HEA_IRIS_NO_085',
    'HEA_DARIUS_NO_021',
    'HEA_LUCIAN_NO_133',
    'SPE_ARIANA_NO_009',
    'SPE_DARIUS_NO_029',
    'SPE_KAI_NO_105',
    'SPE_LEON_NO_125',
    'SPE_MARCUS_NO_153',
    'ATT_ELDER_NO_033',
    'DEF_KAI_NO_109',
    'DEF_MARCUS_NO_157',
    'HEA_KAI_NO_101',
    'HEA_MARCUS_NO_149',
    'SPE_ELDER_NO_041',
    'SPE_LUCIAN_NO_213',
];
const app = new Application();
const root = document.getElementById('app');
root.replaceChildren();
let updateBattleLayoutRef = null;
let layoutBattleBgRef = null;
let handContainerRef = null;
let appReady = false;
let lastViewportWidth = 0;
let lastViewportHeight = 0;
let layoutRefreshTimer = null;
function getViewportSize() {
    const vv = window.visualViewport;
    if (vv) {
        return {
            width: Math.max(1, Math.round(vv.width)),
            height: Math.max(1, Math.round(vv.height)),
        };
    }
    return {
        width: Math.max(1, Math.round(window.innerWidth)),
        height: Math.max(1, Math.round(window.innerHeight)),
    };
}
function scheduleLayoutRefresh() {
    layoutRefreshTimer && window.clearTimeout(layoutRefreshTimer);
    applyViewportSize();
    layoutRefreshTimer = window.setTimeout(() => {
        applyViewportSize();
        layoutRefreshTimer = null;
    }, 260);
}
function applyViewportSize() {
    if (!appReady)
        return;
    const { width, height } = getViewportSize();
    if (width === lastViewportWidth && height === lastViewportHeight) {
        return;
    }
    lastViewportWidth = width;
    lastViewportHeight = height;
    app.renderer.resize(width, height);
    layoutBattleBgRef?.();
    updateBattleLayoutRef?.();
    requestAnimationFrame(() => {
        layoutBattleBgRef?.();
        updateBattleLayoutRef?.();
    });
}
function updateViewportFlags() {
    const { width, height } = getViewportSize();
    const isLandscape = width > height;
    const isCompactHeight = height <= 580;
    const shouldApplyCompact = isLandscape && isCompactHeight && width <= 1280;
    document.body.classList.toggle('mobile-landscape', shouldApplyCompact);
    scheduleLayoutRefresh();
}
updateViewportFlags();
window.addEventListener('resize', updateViewportFlags);
window.addEventListener('orientationchange', updateViewportFlags);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportFlags);
}
const { setAuthOverlayEnabled, requestAuthWithCallback } = setupAuthUI();
window.addEventListener('auth-force-overlay', () => {
    setAuthOverlayEnabled(true);
});
// Menu setup
const introRoot = document.getElementById('intro');
const menuRoot = document.getElementById('menu');
const menuUserInfoRoot = document.getElementById('menu-user-info');
const menuUserNicknameEl = document.getElementById('menu-user-nickname');
const menuUserStageEl = document.getElementById('menu-user-stage');
const menuUserRankEl = document.getElementById('menu-user-rank');
const menuButtons = menuRoot.querySelectorAll('.menu-btn');
const deckEditorRoot = document.getElementById('deck-editor');
const cardGalleryRoot = document.getElementById('card-gallery');
const MOBILE_DECK_EDITOR_PAGES = ['collection', 'deck', 'stats'];
let currentMobileDeckEditorPage = 'collection';
const campaignRoot = document.getElementById('campaign');
const dailyRoot = document.getElementById('daily');
const rewardRoot = document.getElementById('reward');
const shopRoot = document.getElementById('shop');
const pvpRoot = document.getElementById('pvp');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const victoryScreen = document.getElementById('victory-screen');
const defeatScreen = document.getElementById('defeat-screen');
const cloudSyncOverlay = document.getElementById('cloud-sync-overlay');
const cloudSyncText = document.getElementById('cloud-sync-text');
let cloudSyncHideTimer = null;
const pvpStatusText = document.getElementById('pvp-status-text');
const pvpOpponentInfo = document.getElementById('pvp-opponent-info');
const pvpOpponentName = document.getElementById('pvp-opponent-name');
const pvpErrorText = document.getElementById('pvp-error');
const pvpStatusIndicator = document.getElementById('pvp-status-indicator');
const pvpSearchBtn = document.getElementById('pvp-search-btn');
const pvpCancelBtn = document.getElementById('pvp-cancel-btn');
const pvpBackBtn = document.getElementById('pvp-back-btn');
pvpCancelBtn.disabled = true;
pvpOpponentInfo.classList.add('hidden');
pvpErrorText.classList.remove('visible');
pvpErrorText.textContent = '';
const announcementModal = document.getElementById('announcement-modal');
const announcementCloseButtons = Array.from(document.querySelectorAll('[data-announcement-close]'));
let announcementHasBeenShown = false;
let announcementDismissedPermanently = false;
let announcementRemindQueued = false;
const PVP_AI_ESTIMATE_MIN_SECONDS = 90;
const PVP_AI_ESTIMATE_MAX_SECONDS = 120;
function formatTimer(seconds) {
    const clamped = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(clamped / 60)
        .toString()
        .padStart(2, '0');
    const secs = (clamped % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}
function openAnnouncementModal() {
    if (!announcementModal || announcementDismissedPermanently)
        return;
    if (announcementModal.classList.contains('active'))
        return;
    announcementModal.classList.add('active');
    document.body.classList.add('modal-open');
    announcementHasBeenShown = true;
    announcementRemindQueued = false;
}
function closeAnnouncementModal(reason = 'close') {
    if (!announcementModal)
        return;
    if (!announcementModal.classList.contains('active'))
        return;
    announcementModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (reason === 'remind') {
        announcementHasBeenShown = false;
        announcementRemindQueued = true;
    }
    else {
        announcementDismissedPermanently = true;
    }
}
if (announcementModal) {
    announcementModal.addEventListener('click', event => {
        if (event.target === announcementModal) {
            closeAnnouncementModal('close');
        }
    });
}
announcementCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.id === 'announcement-remind-later') {
            closeAnnouncementModal('remind');
        }
        else if (button.id === 'announcement-confirm') {
            closeAnnouncementModal('confirm');
        }
        else {
            closeAnnouncementModal('close');
        }
    });
});
const HERO_PORTRAIT_MAP = {
    ARIANA: 'characters/ariana_drake.png',
    DARIUS: 'characters/darius_blackwood.png',
    ELDER: 'characters/elder_belmont.png',
    ELENA: 'characters/elena_drake.png',
    GAREN: 'characters/garen_stone.png',
    IRIS: 'characters/iris_belmont.png',
    KAI: 'characters/kai_drake.png',
    LEON: 'characters/leon_ardenia.png',
    LUCIAN: 'characters/lucian_rosegarden.png',
    MARCUS: 'characters/marcus_belmont.png',
    MIRA: 'characters/mira.png',
    SERAPHINA: 'characters/seraphina_belmont.png',
    SERAPHINE: 'characters/seraphine_winters.png',
};
const DEFAULT_PLAYER_PORTRAIT = 'characters/seraphina_belmont.png';
const DEFAULT_ENEMY_PORTRAIT = 'characters/ariana_drake.png';
const PVP_DEFAULT_BACKGROUND = 'backgrounds/fallback_1.webp';
const STORY_TOTAL_STAGE_TARGET = 50;
const PVP_STATUS_LABELS = {
    idle: '대기 중',
    searching: '매칭 중',
    matched: '상대 발견',
    error: '오류'
};
const PVP_STATUS_CLASSES = ['status-idle', 'status-searching', 'status-matched', 'status-error'];
function resolveDeckPortrait(deck, fallback) {
    if (!Array.isArray(deck) || deck.length === 0) {
        return fallback;
    }
    const counts = {};
    deck.forEach(card => {
        if (!card || !card.id)
            return;
        const baseId = card.id.split('__snap__')[0] ?? card.id;
        const segments = baseId.split('_');
        if (segments.length < 2)
            return;
        const heroKey = segments[1]?.toUpperCase();
        if (!heroKey || !HERO_PORTRAIT_MAP[heroKey])
            return;
        counts[heroKey] = (counts[heroKey] ?? 0) + 1;
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) {
        return fallback;
    }
    entries.sort((a, b) => b[1] - a[1]);
    const [topHero] = entries[0];
    return HERO_PORTRAIT_MAP[topHero] ?? fallback;
}
function showCloudSync(status) {
    if (!cloudSyncOverlay || !cloudSyncText)
        return;
    if (cloudSyncHideTimer !== null) {
        clearTimeout(cloudSyncHideTimer);
        cloudSyncHideTimer = null;
    }
    cloudSyncOverlay.classList.add('active');
    cloudSyncText.textContent = status === 'loading' ? '데이터 불러오는 중...' : '자동 저장 중...';
}
function hideCloudSync(withDelay = true) {
    if (!cloudSyncOverlay)
        return;
    if (cloudSyncHideTimer !== null) {
        clearTimeout(cloudSyncHideTimer);
        cloudSyncHideTimer = null;
    }
    const performHide = () => cloudSyncOverlay.classList.remove('active');
    if (withDelay) {
        cloudSyncHideTimer = window.setTimeout(() => {
            performHide();
            cloudSyncHideTimer = null;
        }, 200);
    }
    else {
        performHide();
    }
}
const CHARACTER_NAME_MAP = {
    'characters/seraphina_belmont.png': '세라피나',
    'characters/ariana_drake.png': '아리아나',
    'characters/darius_blackwood.png': '다리우스',
    'characters/elder_belmont.png': '엘더 벨몬트',
    'characters/elena_drake.png': '엘레나',
    'characters/garen_stone.png': '가렌',
    'characters/iris_belmont.png': '아이리스',
    'characters/kai_drake.png': '카이',
    'characters/leon_ardenia.png': '레온',
    'characters/lucian_rosegarden.png': '루시안',
    'characters/marcus_belmont.png': '마커스',
    'characters/mira.png': '미라',
    'characters/seraphine_winters.png': '세라핀',
};
const GENERIC_VICTORY_LINES = [
    '숨을 고르고 다음 전장을 준비하죠.',
    '승리는 우리 쪽이에요. 이 기세 그대로 이어가요.',
    '카드는 거짓말하지 않네요. 우리 전략이 통했습니다.',
    '좋아요. 이 정도 속도라면 가문이 원하는 답을 보여줄 수 있어요.',
];
const GENERIC_DEFEAT_TAUNTS = [
    '다음엔 좀 더 준비된 모습으로 돌아오길 바라.',
    '너무 서둘렀어. 내 페이스에서 벗어나지 못했군.',
    '실력은 나쁘지 않은데, 집중력이 부족하네.',
    '승부는 끝났어. 아직은 네 차례가 아니야.',
];
const STAGE_VICTORY_LINES = {
    1: ['첫 관문은 통과했어요. 루시안도 이제 저를 인정하겠죠?', '호흡이 안정되니 카드도 제 뜻대로 움직이네요.'],
    2: ['아리아나의 화염도 진정시켰어요. 이젠 나를 불꽃처럼 바라보라고 전해줘야겠어요.', '뜨거운 시련이었지만, 마음은 더 단단해졌어요.'],
    3: ['엘더가 시험한 가문의 규율, 제가 답을 보여줬습니다.', '이 고요한 궁정에서도 제 결의는 흔들리지 않아요.'],
};
const STAGE_DEFEAT_TAUNTS = {
    1: ['기초부터 다시 다져야겠군. 아직 준비가 되지 않았어.', '너무 앞서가면 발이 꼬인다는 걸 잊지 마라.'],
    2: ['내 화염을 견디지 못했네. 다시 오려면 각오부터 단단히 해.', '카이 님 곁에 설 생각이라면, 이 정도 열기는 버텨야지?'],
    3: ['벨몬트의 규율을 가볍게 보면 안 되지. 다시 정돈하고 와라.', '아직 너의 리듬은 흔들린다. 마음을 가다듬고 다시 와라.'],
};
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function pickRandom(items, fallback) {
    if (!items || items.length === 0)
        return fallback;
    const index = Math.floor(Math.random() * items.length);
    return items[index] ?? fallback;
}
function getDisplayNameFromPortrait(portrait, fallback) {
    if (!portrait)
        return fallback;
    return CHARACTER_NAME_MAP[portrait] ?? fallback;
}
let cardPreview = null;
let closeCardPreview = () => {
    const previewEl = cardPreview ?? document.getElementById('card-preview');
    previewEl?.classList.remove('active');
};
let tooltipRoot;
let hideTooltip;
if (cloudSyncOverlay && cloudSyncText) {
    window.addEventListener('cloud-sync-status', (event) => {
        const status = event.detail;
        if (status === 'idle') {
            hideCloudSync(true);
        }
        else {
            showCloudSync(status);
        }
    });
}
useBattleStore.subscribe((state) => {
    const status = state.pvpQueueStatus ?? 'idle';
    const message = state.pvpStatusMessage;
    const error = state.pvpError;
    const match = state.pvpMatch;
    const isBattleScreen = state.gameScreen === 'battle';
    console.log('[PvP] State updated:', {
        status,
        message,
        error,
        matchId: match?.matchId,
        matchStatus: match?.status,
    });
    const statusLabel = PVP_STATUS_LABELS[status] ?? PVP_STATUS_LABELS.idle;
    if (pvpStatusIndicator) {
        pvpStatusIndicator.classList.remove(...PVP_STATUS_CLASSES);
        pvpStatusIndicator.classList.add(`status-${status}`);
        pvpStatusIndicator.textContent = statusLabel;
    }
    const defaultMessage = status === 'idle'
        ? '매칭이 대기 중이지 않습니다.'
        : status === 'searching'
            ? '정확한 실력 평가를 위해 균형 잡힌 상대를 찾고 있습니다...'
            : status === 'matched'
                ? '상대가 확인되었습니다. 전장으로 이동 중입니다...'
                : '매칭 정보를 불러오는 중입니다...';
    let finalMessage = message || defaultMessage;
    if (status === 'searching') {
        const elapsed = state.pvpSearchElapsed ?? 0;
        const estimateMin = state.pvpEstimatedWaitSeconds ?? PVP_AI_ESTIMATE_MIN_SECONDS;
        const estimateRange = `${formatTimer(estimateMin)}~${formatTimer(PVP_AI_ESTIMATE_MAX_SECONDS)}`;
        finalMessage = `매칭 대기 ${formatTimer(elapsed)} (예상 ${estimateRange})`;
        if (elapsed >= estimateMin) {
            finalMessage += ' · 상대가 없으면 AI 모의전으로 전환됩니다.';
        }
    }
    pvpStatusText.textContent = finalMessage;
    if (error) {
        pvpErrorText.textContent = error;
        pvpErrorText.classList.add('visible');
    }
    else {
        pvpErrorText.textContent = '';
        pvpErrorText.classList.remove('visible');
    }
    if (match) {
        pvpOpponentInfo.classList.remove('hidden');
        pvpOpponentName.textContent = match.opponentName ?? '미확인 소환사';
    }
    else {
        pvpOpponentInfo.classList.add('hidden');
        pvpOpponentName.textContent = '-';
    }
    if (!isBattleScreen) {
        const previewEl = cardPreview ?? document.getElementById('card-preview');
        if (previewEl?.classList.contains('active')) {
            closeCardPreview();
        }
        if (tooltipRoot.style.display !== 'none') {
            hideTooltip();
        }
    }
    switch (status) {
        case 'idle':
            pvpSearchBtn.disabled = false;
            pvpCancelBtn.disabled = true;
            break;
        case 'searching':
            pvpSearchBtn.disabled = true;
            pvpCancelBtn.disabled = false;
            break;
        case 'matched':
            pvpSearchBtn.disabled = true;
            pvpCancelBtn.disabled = false;
            break;
        case 'error':
            pvpSearchBtn.disabled = false;
            pvpCancelBtn.disabled = true;
            break;
    }
});
function setupAuthUI() {
    const noopAuthUI = {
        setAuthOverlayEnabled: (_enabled) => { },
        requestAuthWithCallback: (onAuthenticated) => {
            if (typeof onAuthenticated === 'function') {
                onAuthenticated();
            }
        }
    };
    const authScreen = document.getElementById('auth-screen');
    const authTitle = document.getElementById('auth-title');
    const authError = document.getElementById('auth-error');
    const authMessage = document.getElementById('auth-message');
    const signInForm = document.getElementById('auth-sign-in');
    const signUpForm = document.getElementById('auth-sign-up');
    const logoutButton = document.getElementById('auth-sign-out');
    if (!authScreen || !authTitle || !authError || !authMessage || !signInForm || !signUpForm) {
        console.warn('[Auth] UI 요소를 찾을 수 없습니다.');
        return noopAuthUI;
    }
    const signInEmail = signInForm.querySelector('input[name="email"]');
    const signInPassword = signInForm.querySelector('input[name="password"]');
    const signInSubmit = signInForm.querySelector('button[type="submit"]');
    const signUpEmail = signUpForm.querySelector('input[name="email"]');
    const signUpPassword = signUpForm.querySelector('input[name="password"]');
    const signUpNickname = signUpForm.querySelector('input[name="nickname"]');
    const signUpSubmit = signUpForm.querySelector('button[type="submit"]');
    if (!signInEmail || !signInPassword || !signInSubmit || !signUpEmail || !signUpPassword || !signUpNickname || !signUpSubmit) {
        console.warn('[Auth] 폼 요소를 찾을 수 없습니다.');
        return noopAuthUI;
    }
    const toggleButtons = Array.from(document.querySelectorAll('[data-auth-view]'));
    const switchBlocks = Array.from(document.querySelectorAll('[data-auth-visible]'));
    let authOverlayEnabled = false;
    let pendingAuthCallback = null;
    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const view = btn.getAttribute('data-auth-view');
            if (view === 'sign-in' || view === 'sign-up') {
                useAuthStore.getState().setAuthView(view);
                if (view === 'sign-in') {
                    signInEmail.focus();
                }
                else {
                    signUpEmail.focus();
                }
            }
        });
    });
    signUpNickname.addEventListener('input', (event) => {
        const value = event.target.value;
        useAuthStore.getState().setProfileNickname(value);
    });
    signInForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = signInEmail.value.trim();
        const password = signInPassword.value;
        if (!email || !password) {
            useAuthStore.setState({ error: '이메일과 비밀번호를 입력해주세요.' });
            return;
        }
        await useAuthStore.getState().signIn(email, password);
    });
    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = signUpEmail.value.trim();
        const password = signUpPassword.value;
        const nickname = signUpNickname.value.trim();
        if (!email || !password) {
            useAuthStore.setState({ error: '이메일과 비밀번호를 입력해주세요.' });
            return;
        }
        await useAuthStore.getState().signUp(email, password, nickname);
        const state = useAuthStore.getState();
        if (!state.error) {
            const successMessage = state.message;
            useAuthStore.setState({ authView: 'sign-in', error: null, message: successMessage });
            signInEmail.focus();
        }
    });
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await useAuthStore.getState().signOut();
        });
    }
    const inputs = [
        signInEmail,
        signInPassword,
        signUpEmail,
        signUpPassword,
        signUpNickname
    ];
    const updateAuthUIState = () => {
        const state = useAuthStore.getState();
        const isAuthed = !!state.session;
        const shouldShowOverlay = authOverlayEnabled && (!isAuthed || state.initializing);
        const showForms = shouldShowOverlay && !state.initializing;
        if (authOverlayEnabled) {
            authScreen.classList.toggle('auth-hidden', !shouldShowOverlay);
            document.body.classList.toggle('auth-locked', shouldShowOverlay);
        }
        else {
            authScreen.classList.add('auth-hidden');
            document.body.classList.remove('auth-locked');
        }
        if (logoutButton) {
            const shouldShowLogout = authOverlayEnabled && isAuthed;
            logoutButton.classList.toggle('auth-hidden', !shouldShowLogout);
            logoutButton.disabled = state.loading;
        }
        if (state.initializing && authOverlayEnabled) {
            authTitle.textContent = '세션 확인 중...';
        }
        else {
            authTitle.textContent = state.authView === 'sign-in' ? '계정 로그인' : '회원가입';
        }
        signInForm.classList.toggle('auth-hidden', state.authView !== 'sign-in' || !showForms);
        signUpForm.classList.toggle('auth-hidden', state.authView !== 'sign-up' || !showForms);
        switchBlocks.forEach((block) => {
            const visibleFor = block.getAttribute('data-auth-visible');
            block.classList.toggle('auth-hidden', visibleFor !== state.authView || !authOverlayEnabled);
        });
        if (state.error && authOverlayEnabled) {
            authError.textContent = state.error;
            authError.classList.remove('auth-hidden');
        }
        else {
            authError.textContent = '';
            authError.classList.add('auth-hidden');
        }
        if (authOverlayEnabled && (state.message || state.initializing)) {
            authMessage.textContent = state.message || '계정을 확인하는 중입니다...';
            authMessage.classList.remove('auth-hidden');
        }
        else {
            authMessage.textContent = '';
            authMessage.classList.add('auth-hidden');
        }
        const disabled = state.loading || state.initializing;
        inputs.forEach((input) => {
            input.disabled = disabled && authOverlayEnabled;
        });
        signInSubmit.disabled = disabled;
        signUpSubmit.disabled = disabled;
        toggleButtons.forEach((btn) => {
            btn.disabled = disabled;
        });
    };
    const setAuthOverlayEnabled = (enabled) => {
        authOverlayEnabled = enabled;
        updateAuthUIState();
    };
    const requestAuthWithCallback = (onAuthenticated) => {
        const state = useAuthStore.getState();
        if (state.session) {
            onAuthenticated();
            return;
        }
        pendingAuthCallback = onAuthenticated;
        setAuthOverlayEnabled(true);
    };
    updateAuthUIState();
    let lastSessionUserId = null;
    useAuthStore.subscribe((state) => {
        updateAuthUIState();
        const currentUserId = state.session?.user.id ?? null;
        if (currentUserId !== lastSessionUserId) {
            lastSessionUserId = currentUserId;
            handleAuthSessionChange(currentUserId).catch((error) => {
                console.error('[CloudSave] Failed to handle session change', error);
            });
        }
        if (pendingAuthCallback && state.session) {
            const callback = pendingAuthCallback;
            pendingAuthCallback = null;
            setAuthOverlayEnabled(false);
            callback();
        }
        else if (!state.session && pendingAuthCallback) {
            // 세션이 만료된 경우 대기 중인 콜백 취소
            pendingAuthCallback = null;
            setAuthOverlayEnabled(true);
        }
    });
    useAuthStore
        .getState()
        .initialize()
        .catch((error) => {
        console.error('[Auth] 초기화 실패', error);
    });
    return { setAuthOverlayEnabled, requestAuthWithCallback };
}
menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (!mode || btn.disabled)
            return;
        const store = useBattleStore.getState();
        // 모드별 처리
        if (mode === 'campaign') {
            // 캠페인 스테이지 선택 화면으로
            store.setGameScreen('campaign');
        }
        else if (mode === 'daily') {
            store.ensureDailyDungeon();
            store.setGameScreen('daily');
        }
        else if (mode === 'deck') {
            store.setGameScreen('deck-editor');
        }
        else if (mode === 'shop') {
            store.setGameScreen('shop');
        }
        else if (mode === 'pvp') {
            store.setGameScreen('pvp');
        }
    });
});
pvpSearchBtn.addEventListener('click', async () => {
    pvpSearchBtn.disabled = true;
    try {
        await useBattleStore.getState().startPvpMatchmaking();
    }
    catch (error) {
        console.error('[PvP] Failed to start matchmaking', error);
        pvpSearchBtn.disabled = false;
    }
});
pvpCancelBtn.addEventListener('click', async () => {
    pvpCancelBtn.disabled = true;
    try {
        await useBattleStore.getState().cancelPvpMatchmaking();
    }
    catch (error) {
        console.error('[PvP] Failed to cancel matchmaking', error);
    }
    finally {
        pvpSearchBtn.disabled = false;
    }
});
pvpBackBtn?.addEventListener('click', async () => {
    if (pvpBackBtn.disabled)
        return;
    pvpBackBtn.disabled = true;
    try {
        const store = useBattleStore.getState();
        const status = store.pvpQueueStatus;
        if (status === 'searching' || status === 'matched') {
            try {
                await store.cancelPvpMatchmaking();
            }
            catch (error) {
                console.error('[PvP] Failed to cancel matchmaking on back', error);
            }
        }
        store.setGameScreen('menu');
    }
    finally {
        pvpBackBtn.disabled = false;
    }
});
// 성능 옵션: 모바일 및 저해상도 디바이스 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEnd = isMobile || window.innerWidth < 768;
const performanceResolution = isLowEnd ? 1 : Math.min(2, window.devicePixelRatio || 1);
console.log(`[Performance] Mobile: ${isMobile}, LowEnd: ${isLowEnd}, Resolution: ${performanceResolution}`);
app.init({
    background: '#0F1A2C',
    resizeTo: window,
    // performance tuning - 저해상도 옵션 적용
    resolution: performanceResolution,
    antialias: false,
    powerPreference: isLowEnd ? 'low-power' : 'high-performance',
    autoDensity: true
}).then(async () => {
    appReady = true;
    scheduleLayoutRefresh();
    root.appendChild(app.canvas);
    // UI 시스템 초기화
    toastManager.init();
    loadingManager.init();
    // 로딩 화면 표시
    loadingManager.show('게임 로딩 중...');
    // 사운드 시스템 초기화
    initAudio();
    // HUD & Controls & Hand & Log & Tooltip & Card Preview
    const hud = document.getElementById('hud');
    const controls = document.getElementById('controls');
    const handRoot = document.getElementById('hand');
    const logRoot = document.getElementById('log');
    const logToggle = document.getElementById('log-toggle');
    tooltipRoot = document.getElementById('tooltip');
    cardPreview = document.getElementById('card-preview');
    const cardPreviewImage = document.getElementById('card-preview-image');
    const cardPreviewName = document.getElementById('card-preview-name');
    const cardPreviewCost = document.getElementById('card-preview-cost');
    const cardPreviewEffects = document.getElementById('card-preview-effects');
    const cardPreviewKeywords = document.getElementById('card-preview-keywords');
    const cardPreviewClose = document.getElementById('card-preview-close');
    const cardPreviewReady = !!cardPreview &&
        !!cardPreviewImage &&
        !!cardPreviewName &&
        !!cardPreviewCost &&
        !!cardPreviewEffects &&
        !!cardPreviewKeywords &&
        !!cardPreviewClose;
    if (!cardPreviewReady) {
        console.warn('[UI] Card preview elements not found – preview modal disabled');
    }
    // 옵션 & 오디오 컨트롤
    const optionsToggle = document.getElementById('options-toggle');
    const optionsPanel = document.getElementById('options-panel');
    const optionsClose = document.getElementById('options-close');
    const optionsLanguage = document.getElementById('options-language');
    const optionsLogout = document.getElementById('options-logout');
    const volumeMaster = document.getElementById('volume-master');
    const volumeBGM = document.getElementById('volume-bgm');
    const volumeSFX = document.getElementById('volume-sfx');
    const volumeMasterVal = document.getElementById('volume-master-val');
    const volumeBGMVal = document.getElementById('volume-bgm-val');
    const volumeSFXVal = document.getElementById('volume-sfx-val');
    const muteBtn = document.getElementById('mute-btn');
    const store = useBattleStore.getState();
    // =============================
    // Battle background (dimmed stage image behind blue BG)
    // =============================
    const battleBgContainer = new Container();
    const battleBgSprite = new Sprite();
    const battleBgOverlay = new Graphics();
    battleBgContainer.addChild(battleBgSprite);
    battleBgContainer.addChild(battleBgOverlay);
    battleBgContainer.visible = false;
    // Add as the bottom-most layer
    app.stage.addChildAt(battleBgContainer, 0);
    let currentBgPath = null;
    let currentPlayerPortrait = null;
    let currentEnemyPortrait = null;
    function layoutBattleBg() {
        if (!battleBgContainer.visible || !battleBgSprite.texture)
            return;
        const tex = battleBgSprite.texture;
        const { width: w, height: h } = getViewportSize();
        const scale = Math.max(w / tex.width, h / tex.height);
        battleBgSprite.scale.set(scale);
        battleBgSprite.position.set((w - tex.width * scale) / 2, (h - tex.height * scale) / 2);
        // Dark overlay
        battleBgOverlay.clear();
        battleBgOverlay.rect(0, 0, w, h);
        battleBgOverlay.fill({ color: 0x000000, alpha: 0.55 });
    }
    layoutBattleBgRef = layoutBattleBg;
    async function updateBattleBackground() {
        const s = useBattleStore.getState();
        if (s.gameScreen !== 'battle') {
            battleBgContainer.visible = false;
            currentBgPath = null;
            return;
        }
        const isPvpBattle = s.battleContext.type === 'pvp';
        let bgPath = null;
        if (isPvpBattle) {
            bgPath = PVP_DEFAULT_BACKGROUND;
        }
        else if (s.currentStage) {
            const stage = s.campaignStages.find(cs => cs.id === s.currentStage);
            bgPath = stage?.story?.backgroundImage || null;
        }
        if (!bgPath) {
            battleBgContainer.visible = false;
            currentBgPath = null;
            return;
        }
        if (currentBgPath !== bgPath) {
            try {
                await Assets.load(bgPath);
                battleBgSprite.texture = Assets.get(bgPath);
                currentBgPath = bgPath;
            }
            catch (e) {
                console.warn('[BattleBG] Failed to load background:', bgPath, e);
                battleBgContainer.visible = false;
                currentBgPath = null;
                return;
            }
        }
        battleBgContainer.visible = true;
        layoutBattleBg();
    }
    // Re-layout on resize
    window.addEventListener('resize', () => layoutBattleBg());
    // 로그 토글 기능 (모바일)
    logToggle.addEventListener('click', () => {
        logRoot.classList.toggle('mobile-visible');
        logToggle.textContent = logRoot.classList.contains('mobile-visible') ? '✖️' : '📋';
    });
    // 로그 영역 외부 클릭 시 닫기 (모바일)
    if (isMobile || window.innerWidth <= 768) {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (logRoot.classList.contains('mobile-visible') &&
                !logRoot.contains(target) &&
                !logToggle.contains(target)) {
                logRoot.classList.remove('mobile-visible');
                logToggle.textContent = '📋';
            }
        });
    }
    // 카드 프리뷰 모달 닫기
    if (cardPreviewReady) {
        closeCardPreview = function closeCardPreview() {
            cardPreview.classList.remove('active');
        };
        cardPreviewClose.addEventListener('click', closeCardPreview);
        cardPreview.addEventListener('click', (e) => {
            if (e.target === cardPreview) {
                closeCardPreview();
            }
        });
    }
    // 오디오 컨트롤 초기화
    const audioSettings = audioManager.getSettings();
    volumeMaster.value = String(Math.round(audioSettings.masterVolume * 100));
    volumeBGM.value = String(Math.round(audioSettings.bgmVolume * 100));
    volumeSFX.value = String(Math.round(audioSettings.sfxVolume * 100));
    volumeMasterVal.textContent = volumeMaster.value;
    volumeBGMVal.textContent = volumeBGM.value;
    volumeSFXVal.textContent = volumeSFX.value;
    if (audioSettings.muted) {
        muteBtn.classList.add('muted');
        muteBtn.textContent = '🔊 음소거 해제';
    }
    // 옵션 패널 토글
    function closeOptionsPanel() {
        optionsPanel.classList.remove('active');
    }
    optionsToggle.addEventListener('click', () => {
        const nextState = !optionsPanel.classList.contains('active');
        optionsPanel.classList.toggle('active', nextState);
        audioManager.playSFX('button_click', 0.5);
    });
    optionsClose.addEventListener('click', () => {
        closeOptionsPanel();
        audioManager.playSFX('button_click', 0.5);
    });
    // 언어 변경 버튼
    function updateLanguageButton() {
        const currentLang = getCurrentLocale();
        optionsLanguage.textContent = currentLang === 'ko' ? '🌐 언어: 한국어' : '🌐 Language: English';
    }
    optionsLanguage.addEventListener('click', () => {
        audioManager.playSFX('button_click', 0.5);
        const newLocale = getCurrentLocale() === 'ko' ? 'en' : 'ko';
        setLocale(newLocale);
        updateLanguageButton();
    });
    updateLanguageButton();
    optionsLogout.addEventListener('click', async () => {
        audioManager.playSFX('button_click', 0.5);
        const { session, signOut } = useAuthStore.getState();
        if (!session) {
            toastManager.info('이미 로그아웃된 상태입니다.', 1800);
            closeOptionsPanel();
            return;
        }
        await signOut();
        const { error } = useAuthStore.getState();
        if (error) {
            toastManager.error('로그아웃에 실패했습니다.', 2200);
        }
        else {
            toastManager.success('로그아웃되었습니다.', 1800);
        }
        closeOptionsPanel();
    });
    // 볼륨 슬라이더
    volumeMaster.addEventListener('input', () => {
        const value = parseInt(volumeMaster.value);
        volumeMasterVal.textContent = String(value);
        audioManager.setMasterVolume(value / 100);
    });
    volumeBGM.addEventListener('input', () => {
        const value = parseInt(volumeBGM.value);
        volumeBGMVal.textContent = String(value);
        audioManager.setBGMVolume(value / 100);
    });
    volumeSFX.addEventListener('input', () => {
        const value = parseInt(volumeSFX.value);
        volumeSFXVal.textContent = String(value);
        audioManager.setSFXVolume(value / 100);
    });
    // 음소거 버튼
    muteBtn.addEventListener('click', () => {
        const isMuted = audioManager.toggleMute();
        if (isMuted) {
            muteBtn.classList.add('muted');
            muteBtn.textContent = '🔊 음소거 해제';
        }
        else {
            muteBtn.classList.remove('muted');
            muteBtn.textContent = '🔇 음소거';
        }
        audioManager.playSFX('button_click', 0.5);
    });
    // 카드 프리뷰 표시
    function showCardPreview(card) {
        if (!cardPreviewReady ||
            !cardPreview ||
            !cardPreviewImage ||
            !cardPreviewName ||
            !cardPreviewCost ||
            !cardPreviewEffects ||
            !cardPreviewKeywords) {
            console.warn('[UI] Card preview requested but UI components are missing');
            return;
        }
        const imagePath = getLoadedCardImage(card);
        if (imagePath) {
            // PixiJS Assets에서 실제 이미지 URL 가져오기
            const texture = Assets.get(imagePath);
            if (texture && texture.source) {
                cardPreviewImage.src = texture.source.resource?.src || imagePath;
            }
            else {
                cardPreviewImage.src = imagePath;
            }
        }
        else {
            // Fallback placeholder
            cardPreviewImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="420"><rect width="280" height="420" fill="%23556677"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20">No Image</text></svg>';
        }
        cardPreviewName.textContent = card.name;
        cardPreviewCost.textContent = `💎 코스트: ${card.cost}`;
        // Effects 표시: 카드 표면과 동일한 설명 우선 사용
        if (card.effectText && card.effectText.trim().length > 0) {
            cardPreviewEffects.innerHTML = card.effectText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => `<span>${line}</span>`)
                .join('<br>');
        }
        else {
            const effectsText = card.effects.map(eff => {
                if (!eff)
                    return '';
                if (eff.type === 'Damage')
                    return `🗡️ 피해 ${eff.value}${eff.aoe ? ' (광역)' : ''}`;
                if (eff.type === 'Heal')
                    return `💚 회복 ${eff.value}${eff.aoe ? ' (광역)' : ''}`;
                if (eff.type === 'Shield')
                    return `🛡️ 보호막 ${eff.value}`;
                if (eff.type === 'Guard')
                    return `🛡️ 가드 ${eff.value}`;
                if (eff.type === 'Draw')
                    return `📇 드로우 ${eff.value}장`;
                if (eff.type === 'GainAction')
                    return `⚡ 에너지 +${eff.value}`;
                if (eff.type === 'ApplyStatus') {
                    const key = eff.key ?? '상태';
                    const stacks = eff.stacks ?? 1;
                    return `🔖 ${key} ${stacks}중첩`;
                }
                return '';
            }).filter(Boolean).join(' | ');
            cardPreviewEffects.textContent = effectsText || '효과 없음';
        }
        // Keywords 표시
        cardPreviewKeywords.innerHTML = '';
        card.keywords.forEach(kw => {
            const badge = document.createElement('span');
            badge.className = `status-badge status-${kw.toLowerCase()}`;
            badge.textContent = kw;
            cardPreviewKeywords.appendChild(badge);
        });
        cardPreview.classList.add('active');
    }
    // Keyword descriptions for tooltips
    const keywordDescriptions = {
        'Burn': '화상: 턴 시작 시 스택당 10의 피해를 입습니다.',
        'Freeze': '빙결: 행동이 제한되며 지속시간 동안 카드를 사용할 수 없습니다.',
        'Shock': '감전: 다음 공격 시 스택에 따라 연쇄 피해가 발동할 수 있습니다. (1스택: 30%, 2스택: 60%, 3+스택: 90%)',
        'Vulnerable': '취약: 받는 피해가 20% 증가합니다.',
        'Regen': '재생: 턴 시작 시 HP를 회복합니다.',
        'Shield': '보호막: 피해를 일정량 흡수합니다.',
        'Guard': '가드: 받는 피해를 일정량 감소시킵니다.',
        'Nullify': '무효화: 다음 카드의 효과를 무효화합니다.',
        'Counter': '반격: 피해를 입으면 공격자에게 반격 피해를 줍니다.',
        'Immune': '면역: 특정 상태이상에 면역이 됩니다.',
        'Evasion': '회피: 다음 공격을 일정 횟수 회피합니다.',
        'Haste': '신속: 에너지를 추가로 얻습니다.',
        'Draw': '드로우: 카드를 추가로 뽑습니다.',
        'Priority': '우선권: 선공 우선순위가 증가합니다.',
        'Duplicate': '복제: 다음 카드를 복제하여 두 번 사용합니다.',
        'Silence': '침묵: 카드 효과를 사용할 수 없게 됩니다.',
        'Cleanse': '정화: 상태이상을 제거합니다.',
        'Thorns': '가시: 공격받을 때 공격자에게 피해를 줍니다.',
    };
    // Tooltip helper functions
    function showTooltip(card, x, y) {
        const keywordTexts = card.keywords.map(kw => {
            const desc = keywordDescriptions[kw];
            return desc ? `<strong>${kw}</strong>: ${desc}` : kw;
        }).join('<br>');
        const effectText = card.effectText || '효과 설명이 없습니다.';
        const cardTypeKey = `card.type.${card.type}`;
        const translatedType = t(cardTypeKey);
        tooltipRoot.innerHTML = `
      <div class="tooltip-header">${card.name}</div>
      <div>
        <span class="tooltip-cost">💎 ${card.cost}</span>
        <span class="tooltip-type">${translatedType}</span>
      </div>
      <div class="tooltip-effect">${effectText}</div>
      ${card.keywords.length > 0 ? `<div class="tooltip-keywords">${keywordTexts}</div>` : ''}
    `;
        // 위치 조정 (화면 밖으로 나가지 않도록)
        tooltipRoot.style.display = 'block';
        tooltipRoot.style.left = `${Math.min(x + 15, window.innerWidth - tooltipRoot.offsetWidth - 10)}px`;
        tooltipRoot.style.top = `${Math.min(y + 15, window.innerHeight - tooltipRoot.offsetHeight - 10)}px`;
    }
    hideTooltip = function hideTooltip() {
        tooltipRoot.style.display = 'none';
    };
    let energy = store.energy;
    let round = store.round;
    let roundSeed = store.roundSeed;
    let playerHp = store.playerHp;
    let playerMaxHp = store.playerMaxHp;
    let enemyHp = store.enemyHp;
    let enemyMaxHp = store.enemyMaxHp;
    let gameOver = store.gameOver;
    let playerStatus = store.playerStatus;
    let enemyStatus = store.enemyStatus;
    let currentInitiative = store.currentInitiative ?? null;
    // 트윈 애니메이션용 표시 값 (부드럽게 변화)
    let displayEnergy = store.energy;
    let displayPlayerHp = store.playerHp;
    let displayEnemyHp = store.enemyHp;
    function formatStatus(status) {
        const badges = [];
        // 보호 효과 (파란색)
        if (status.shield > 0)
            badges.push(`<span class="status-badge status-defense">🛡️ ${status.shield}<sub>${status.shieldDuration}T</sub></span>`);
        if (status.guard > 0)
            badges.push(`<span class="status-badge status-defense">🛡️ 가드 ${status.guard}<sub>${status.guardDuration}T</sub></span>`);
        if (status.evasionCharges > 0)
            badges.push(`<span class="status-badge status-defense">💨 ${status.evasionCharges}회<sub>${status.evasionDuration}T</sub></span>`);
        if (status.nullifyCharges > 0)
            badges.push(`<span class="status-badge status-defense">🚫 ${status.nullifyCharges}</span>`);
        if (status.counterValue > 0)
            badges.push(`<span class="status-badge status-buff">⚔️ 반격 ${status.counterValue}<sub>${status.counterDuration}T</sub></span>`);
        if (status.immuneKeywords.length > 0)
            badges.push(`<span class="status-badge status-defense">🛡️ ${status.immuneKeywords.join(',')}<sub>${status.immuneDuration}T</sub></span>`);
        // 버프 효과 (초록색)
        if (status.attackBuff > 0)
            badges.push(`<span class="status-badge status-buff">⚔️ +${status.attackBuff}%</span>`);
        if (status.regen > 0)
            badges.push(`<span class="status-badge status-buff">💚 +${status.regen}/T</span>`);
        // 디버프 효과 (빨간색)
        if (status.vulnerable > 0)
            badges.push(`<span class="status-badge status-debuff">⚠️ 취약<sub>${status.vulnerable}T</sub></span>`);
        if (status.shockStacks > 0)
            badges.push(`<span class="status-badge status-debuff">⚡ ${status.shockStacks}</span>`);
        // 상태이상
        status.statuses.forEach(s => {
            const statusConfig = {
                'Burn': { icon: '🔥', type: 'debuff' },
                'Freeze': { icon: '❄️', type: 'debuff' },
                'Shock': { icon: '⚡', type: 'debuff' },
                'Vulnerable': { icon: '⚠️', type: 'debuff' },
                'Regen': { icon: '💚', type: 'buff' },
            };
            const config = statusConfig[s.key] || { icon: '⚪', type: 'debuff' };
            const stacksText = s.stacks && s.stacks > 1 ? ` ×${s.stacks}` : '';
            badges.push(`<span class="status-badge status-${config.type}">${config.icon}${stacksText}<sub>${s.duration}T</sub></span>`);
        });
        return badges.length > 0 ? badges.join(' ') : `<span style="color: #777;">${t('status.none')}</span>`;
    }
    function renderHUD() {
        let gameOverText = '';
        if (gameOver === 'victory') {
            gameOverText = `<div style="color: #4CAF50; font-weight: bold; font-size: 1.2em;">${t('battle.victory')}</div>`;
        }
        else if (gameOver === 'defeat') {
            gameOverText = `<div style="color: #f44336; font-weight: bold; font-size: 1.2em;">${t('battle.defeat')}</div>`;
        }
        // 애니메이션 효과를 위해 소수점 반올림
        const displayPlayerHpInt = Math.round(displayPlayerHp);
        const displayEnemyHpInt = Math.round(displayEnemyHp);
        const initiativeLabel = (() => {
            if (currentInitiative === 'player') {
                return '<span style="color:#66bb6a;font-weight:bold;">👑 플레이어 선공</span>';
            }
            if (currentInitiative === 'enemy') {
                return '<span style="color:#ff8a65;font-weight:bold;">⚔️ 적 선공</span>';
            }
            return '<span style="color:#aaaaaa;">⏳ 선언 대기 중</span>';
        })();
        hud.innerHTML = `
      ${gameOverText}
      <div>${t('battle.round')}: ${round}</div>
      <div style="font-size: 10px; color: #777;">${t('battle.seed')}: ${roundSeed}</div>
      <div style="margin-top: 4px; font-size: 12px;">${t('battle.initiative')}: ${initiativeLabel}</div>
      <div style="margin-top: 8px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
        <div style="font-weight: bold;">${t('battle.player')}</div>
        <div>${t('battle.hp')}: <span style="font-weight: bold; color: ${displayPlayerHpInt < playerHp * 0.3 ? '#f44336' : '#4CAF50'}">${displayPlayerHpInt}</span>/${playerMaxHp}</div>
        <div style="font-size: 11px; color: #aaa; margin-top: 4px;">${formatStatus(playerStatus)}</div>
      </div>
      <div style="margin-top: 8px; padding: 6px; background: rgba(139,0,0,0.3); border-radius: 4px;">
        <div style="font-weight: bold;">${t('battle.enemy')}</div>
        <div>${t('battle.hp')}: <span style="font-weight: bold; color: ${displayEnemyHpInt < enemyHp * 0.3 ? '#f44336' : '#ff9800'}">${displayEnemyHpInt}</span>/${enemyMaxHp}</div>
        <div style="font-size: 11px; color: #aaa; margin-top: 4px;">${formatStatus(enemyStatus)}</div>
      </div>
    `;
    }
    renderHUD();
    // Controls
    function renderControls() {
        controls.innerHTML = '';
        const state = useBattleStore.getState();
        const isMobileView = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const deckColumnMinWidth = isSmallMobile ? 80 : (isMobileView ? 100 : 110);
        const collectionMinWidth = isSmallMobile ? 120 : (isMobileView ? 140 : 160);
        const collectionGap = isSmallMobile ? 10 : (isMobileView ? 14 : 18);
        const deckGap = isSmallMobile ? 6 : 8;
        // 메인 메뉴 버튼 (항상 표시)
        const btnMenu = document.createElement('button');
        btnMenu.textContent = '🏠 메인 메뉴';
        btnMenu.style.cssText = 'background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; margin-bottom: 8px;';
        btnMenu.onclick = () => {
            audioManager.playSFX('button_click', 0.6);
            useBattleStore.getState().setGameScreen('menu');
        };
        controls.append(btnMenu);
        if (state.battleContext.type === 'pvp') {
            const pvpBox = document.createElement('div');
            pvpBox.style.cssText = 'padding: 10px; background: linear-gradient(135deg, rgba(33,47,79,0.9), rgba(19,29,51,0.95)); border: 1px solid rgba(102,187,255,0.35); border-radius: 8px; margin-bottom: 10px; color: #e3f2fd; box-shadow: 0 0 8px rgba(33,150,243,0.2);';
            const statusRow = document.createElement('div');
            statusRow.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;';
            const localStatusColor = state.pvpLocalReady ? '#66bb6a' : '#ffeb3b';
            const opponentStatusColor = state.pvpOpponentReady ? '#66bb6a' : '#ff8a65';
            statusRow.innerHTML = `
        <span style="color:${localStatusColor}">${state.pvpLocalReady ? '✅ 내 선언 완료' : '⏳ 내 선언 선택 중'}</span>
        <span style="color:${opponentStatusColor}">${state.pvpOpponentReady ? '✅ 상대 선언 완료' : '… 상대 대기 중'}</span>
      `;
            pvpBox.appendChild(statusRow);
            const duration = state.pvpTurnDuration || 15;
            const rawRemaining = state.pvpTurnTimeLeft ?? duration;
            const remaining = Math.max(0, Math.min(duration, Math.round(rawRemaining)));
            const countdownActive = state.pvpTurnTimerActive && !state.pvpLocalReady;
            const progressPercent = countdownActive ? (remaining / duration) * 100 : state.pvpLocalReady ? 100 : (state.pvpOpponentReady ? 0 : 100);
            const clampedPercent = Math.max(0, Math.min(100, progressPercent));
            const timeColor = remaining <= 5 && countdownActive ? '#ff5252' : '#4caf50';
            const timerHeader = document.createElement('div');
            timerHeader.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:12px;';
            timerHeader.innerHTML = `
        <span>턴 제한</span>
        <span style="font-weight:700; color:${timeColor};">${remaining.toString().padStart(2, '0')}s</span>
      `;
            pvpBox.appendChild(timerHeader);
            const progressOuter = document.createElement('div');
            progressOuter.style.cssText = 'width:100%; height:8px; border-radius:999px; background:rgba(255,255,255,0.18); overflow:hidden; margin-top:4px;';
            const progressInner = document.createElement('div');
            const barColor = countdownActive
                ? (remaining <= 5 ? 'linear-gradient(90deg, #ff6f61, #ff1744)' : 'linear-gradient(90deg, #4caf50, #2196f3)')
                : (state.pvpLocalReady ? 'linear-gradient(90deg, #66bb6a, #43a047)' : 'linear-gradient(90deg, #29b6f6, #0288d1)');
            progressInner.style.cssText = `width:${clampedPercent.toFixed(0)}%; height:100%; transition:width 0.2s ease; background:${barColor};`;
            progressOuter.appendChild(progressInner);
            pvpBox.appendChild(progressOuter);
            const infoText = document.createElement('div');
            infoText.style.cssText = 'margin-top:4px; font-size:10px; color:#b3e5fc;';
            if (state.pvpLocalReady && !state.pvpOpponentReady) {
                infoText.textContent = '상대의 선언을 기다리는 중입니다…';
            }
            else if (!state.pvpLocalReady && !countdownActive) {
                infoText.textContent = '턴 타이머가 일시 정지되었습니다.';
            }
            else {
                infoText.textContent = '시간이 만료되면 자동으로 턴이 종료됩니다.';
            }
            pvpBox.appendChild(infoText);
            controls.appendChild(pvpBox);
        }
        // 선언 상태 표시
        const declareInfo = document.createElement('div');
        declareInfo.style.cssText = 'padding: 6px 10px; background: rgba(0,0,0,0.5); border-radius: 6px; margin-bottom: 8px; color: #fff; font-size: 12px; border: 1px solid #3a4f75;';
        const queuedCount = state.queuedHandIndices.length;
        const reserved = state.getPendingCost();
        if (queuedCount > 0) {
            declareInfo.innerHTML = `
        <div style="color: #4a9eff; font-weight: bold;">⚡ ${t('battle.declared')}: ${queuedCount}장</div>
        <div style="font-size: 10px; color: #aaa;">${t('battle.reservedEnergy')}: ${reserved}</div>
      `;
            declareInfo.style.borderColor = '#4a9eff';
            declareInfo.style.animation = 'pulse 2s ease-in-out infinite';
        }
        else {
            declareInfo.innerHTML = `<div style="color: #777;">${t('battle.noCards')}</div>`;
        }
        controls.appendChild(declareInfo);
        // 턴 종료 버튼
        const btnEnd = document.createElement('button');
        btnEnd.textContent = queuedCount > 0 ? `${t('battle.endTurn')} (${queuedCount}장 해결)` : t('battle.endTurn');
        btnEnd.disabled = gameOver !== 'none';
        btnEnd.style.cssText = queuedCount > 0
            ? 'background: linear-gradient(135deg, #4a9eff, #1565C0); color: #fff; border: 2px solid #66BB6A; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(74,158,255,0.5); transition: transform 0.1s;'
            : 'background: #20304d; color: #fff; border: 1px solid #3a4f75; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: transform 0.1s;';
        if (gameOver !== 'none') {
            btnEnd.style.opacity = '0.5';
            btnEnd.style.cursor = 'not-allowed';
        }
        btnEnd.onclick = () => {
            const state = useBattleStore.getState();
            if (gameOver === 'none' && !state.isTurnProcessing) {
                audioManager.playSFX('turn_end', 0.8);
                // 애니메이션 효과
                btnEnd.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btnEnd.style.transform = 'scale(1)';
                    useBattleStore.getState().endPlayerTurn();
                }, 100);
            }
        };
        controls.append(btnEnd);
    }
    renderControls();
    // Log UI with filtering and search
    let logViewMode = 'all';
    let logFilter = 'all';
    let logSearchText = '';
    function renderLog() {
        const state = useBattleStore.getState();
        logRoot.innerHTML = '';
        // 필터 컨트롤 추가
        const controls = document.createElement('div');
        controls.style.cssText = 'padding: 4px; background: rgba(0,0,0,0.5); border-bottom: 1px solid #3a4f75; margin-bottom: 4px;';
        // 뷰 모드 토글
        const viewToggle = document.createElement('button');
        viewToggle.textContent = logViewMode === 'all' ? t('log.view.all') : t('log.view.summary');
        viewToggle.style.cssText = 'padding: 2px 6px; margin-right: 4px; font-size: 10px; background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; border-radius: 3px; cursor: pointer;';
        viewToggle.onclick = () => {
            logViewMode = logViewMode === 'all' ? 'summary' : 'all';
            renderLog();
        };
        controls.appendChild(viewToggle);
        // 필터 버튼들
        const filters = [
            { label: t('log.filter.all'), value: 'all' },
            { label: t('log.filter.card'), value: 'card-play' },
            { label: t('log.filter.effect'), value: 'effect' },
            { label: t('log.filter.system'), value: 'system' },
        ];
        filters.forEach(f => {
            const btn = document.createElement('button');
            btn.textContent = f.label;
            btn.style.cssText = `padding: 2px 6px; margin-right: 2px; font-size: 10px; background: ${logFilter === f.value ? '#4a9eff' : '#2a3f5f'}; color: #fff; border: 1px solid #3a4f75; border-radius: 3px; cursor: pointer;`;
            btn.onclick = () => {
                logFilter = f.value;
                renderLog();
            };
            controls.appendChild(btn);
        });
        // 검색창
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = t('log.search');
        searchInput.value = logSearchText;
        searchInput.style.cssText = 'width: 80px; padding: 2px 4px; font-size: 10px; background: #1a2f4f; color: #fff; border: 1px solid #3a4f75; border-radius: 3px; margin-left: 4px;';
        searchInput.oninput = (e) => {
            logSearchText = e.target.value.toLowerCase();
            renderLog();
        };
        controls.appendChild(searchInput);
        logRoot.appendChild(controls);
        // 로그 엔트리 필터링 및 표시
        const entries = state.logs.filter(entry => {
            // 필터 적용
            if (logFilter !== 'all' && entry.type !== logFilter)
                return false;
            // 검색 적용
            if (logSearchText && !entry.message.toLowerCase().includes(logSearchText))
                return false;
            return true;
        });
        // 요약 모드: 마지막 20개만
        const displayEntries = logViewMode === 'summary' ? entries.slice(-20) : entries;
        displayEntries.forEach((entry) => {
            const div = document.createElement('div');
            div.className = `entry ${entry.type}`;
            div.textContent = entry.message;
            logRoot.appendChild(div);
        });
        if (displayEntries.length === 0 && entries.length > 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = 'padding: 8px; color: #777; text-align: center;';
            noResults.textContent = t('log.noResults');
            logRoot.appendChild(noResults);
        }
        logRoot.scrollTop = logRoot.scrollHeight;
    }
    // VFX Layer (최상단)
    const vfxContainer = new Container();
    app.stage.addChild(vfxContainer);
    vfxManager.init(vfxContainer);
    // VFX 업데이트 (매 프레임)
    app.ticker.add(() => {
        vfxManager.update();
    });
    // ================== 덱 시스템 (플레이어 + 적) ==================
    // 덱 생성 헬퍼 함수
    function createDeckContainer(isPlayer) {
        const container = new Container();
        // 모바일 대응 배경 크기 계산
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const bgWidth = isSmallMobile ? 90 : (isMobile ? 105 : 130);
        const bgHeight = isSmallMobile ? 124 : (isMobile ? 145 : 180);
        const bgHalfWidth = bgWidth / 2;
        const bgHalfHeight = bgHeight / 2;
        // 그림자
        const shadow = new Graphics();
        shadow.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        shadow.fill({ color: 0x000000, alpha: 0.3 });
        shadow.x = 6;
        shadow.y = 6;
        container.addChild(shadow);
        // 🎨 캐릭터 일러스트 배경 (옅은 배경만)
        const characterBackground = new Graphics();
        characterBackground.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        characterBackground.fill({ color: 0x1a1a2e, alpha: 0.3 }); // alpha를 0.8에서 0.3으로 낮춤
        container.addChildAt(characterBackground, 0); // 맨 아래에 배치
        // 🎨 캐릭터 일러스트 (나중에 카드 백 위에 배치하기 위해 여기서는 추가하지 않음)
        const characterSprite = new Sprite();
        characterSprite.anchor.set(0.5);
        characterSprite.width = bgWidth;
        characterSprite.height = bgHeight;
        characterSprite.alpha = 1.0; // 명시적으로 alpha 설정
        characterSprite.visible = false; // 텍스처 로드 전까지 숨김
        // 카드 백들 다음에 맨 위에 추가됨 (initDeckVisuals에서)
        // 카드 스프라이트 3장
        const cardBack1 = new Sprite();
        const cardBack2 = new Sprite();
        const cardBack3 = new Sprite();
        // 카드 수 텍스트
        const countText = new Text({
            text: '덱: 0장',
            style: {
                fontSize: isSmallMobile ? 12 : (isMobile ? 14 : 16),
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: isSmallMobile ? 2 : 3 }
            }
        });
        countText.anchor.set(0.5);
        countText.y = bgHalfHeight - 10; // 배경 높이에 맞춰 조정
        container.addChild(countText);
        return { container, cardBack1, cardBack2, cardBack3, countText, shadow, characterSprite, characterBackground };
    }
    // 플레이어 덱 (화면 정중앙 왼쪽)
    const playerDeckData = createDeckContainer(true);
    const playerDeckContainer = playerDeckData.container;
    // 초기 위치는 resize 이벤트에서 설정
    // 적 덱 (화면 정중앙 오른쪽)
    const enemyDeckData = createDeckContainer(false);
    const enemyDeckContainer = enemyDeckData.container;
    // 초기 위치는 resize 이벤트에서 설정
    // VS 텍스트 (중앙)
    const vsText = new Text({
        text: 'VS',
        style: {
            fontSize: 48,
            fill: 0xff0000, // 빨간색
            fontWeight: 'bold',
            stroke: { color: 0x000000, width: 4 }
        }
    });
    vsText.anchor.set(0.5);
    // 초기 위치는 resize 이벤트에서 설정
    // 배틀 요소를 스테이지에 추가
    app.stage.addChild(playerDeckContainer);
    app.stage.addChild(enemyDeckContainer);
    app.stage.addChild(vsText);
    // VFX Layer를 최상단으로 이동 (모든 덱/VS 위에 렌더링되도록)
    app.stage.setChildIndex(vfxContainer, app.stage.children.length - 1);
    // 덱 이미지 로드 및 초기화
    const initDeckVisuals = async () => {
        const cardBackPath = getCardBackImage();
        if (!cardBackPath) {
            console.warn('[Deck] Card back path not found');
            return;
        }
        try {
            const texture = await Assets.load(cardBackPath);
            // 모바일 대응 카드 백 크기
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            const cardBackWidth = isSmallMobile ? 90 : (isMobile ? 105 : 120);
            const cardBackHeight = isSmallMobile ? 124 : (isMobile ? 145 : 165);
            // 플레이어 덱 카드 설정
            [playerDeckData.cardBack1, playerDeckData.cardBack2, playerDeckData.cardBack3].forEach((sprite, i) => {
                sprite.texture = texture;
                sprite.width = cardBackWidth;
                sprite.height = cardBackHeight;
                sprite.anchor.set(0.5);
                sprite.x = i * 4 - 4;
                sprite.y = i * 4 - 4;
                sprite.alpha = 0.5; // 카드 백을 반투명하게 만들어 일러스트가 잘 보이도록
            });
            playerDeckContainer.addChild(playerDeckData.cardBack3);
            playerDeckContainer.addChild(playerDeckData.cardBack2);
            playerDeckContainer.addChild(playerDeckData.cardBack1);
            // 캐릭터 일러스트를 카드 위에 배치
            playerDeckContainer.addChild(playerDeckData.characterSprite);
            // countText를 맨 위에 배치 (일러스트 위에 표시)
            playerDeckContainer.setChildIndex(playerDeckData.countText, playerDeckContainer.children.length - 1);
            // 적 덱 카드 설정
            [enemyDeckData.cardBack1, enemyDeckData.cardBack2, enemyDeckData.cardBack3].forEach((sprite, i) => {
                sprite.texture = texture;
                sprite.width = cardBackWidth;
                sprite.height = cardBackHeight;
                sprite.anchor.set(0.5);
                sprite.x = i * 4 - 4;
                sprite.y = i * 4 - 4;
                sprite.alpha = 0.5; // 카드 백을 반투명하게 만들어 일러스트가 잘 보이도록
            });
            enemyDeckContainer.addChild(enemyDeckData.cardBack3);
            enemyDeckContainer.addChild(enemyDeckData.cardBack2);
            enemyDeckContainer.addChild(enemyDeckData.cardBack1);
            // 캐릭터 일러스트를 카드 위에 배치
            enemyDeckContainer.addChild(enemyDeckData.characterSprite);
            // countText를 맨 위에 배치 (일러스트 위에 표시)
            enemyDeckContainer.setChildIndex(enemyDeckData.countText, enemyDeckContainer.children.length - 1);
            console.log('[Deck] Player & Enemy deck loaded successfully');
        }
        catch (err) {
            console.warn('[Deck] Failed to load card back:', err);
        }
    };
    // 덱 상태 업데이트 함수
    function updateDeckVisuals() {
        const state = useBattleStore.getState();
        // 플레이어 덱
        const playerDeckSize = state.deck.length;
        playerDeckData.countText.text = `플레이어\n덱: ${playerDeckSize}장`;
        playerDeckContainer.alpha = playerDeckSize > 0 ? 1.0 : 0.3;
        playerDeckContainer.visible = state.gameScreen === 'battle';
        // 적 덱
        const enemyDeckSize = state.enemyDeck.length;
        enemyDeckData.countText.text = `적\n덱: ${enemyDeckSize}장`;
        enemyDeckContainer.alpha = enemyDeckSize > 0 ? 1.0 : 0.3;
        enemyDeckContainer.visible = state.gameScreen === 'battle';
        // VS 텍스트
        vsText.visible = state.gameScreen === 'battle';
        // 🎨 캐릭터 일러스트 업데이트
        if (state.gameScreen === 'battle') {
            if (state.currentStage) {
                const stage = state.campaignStages.find(s => s.id === state.currentStage);
                if (stage) {
                    if (stage.characterImage) {
                        console.log('[Deck] Loading player character:', stage.characterImage);
                        Assets.load(stage.characterImage).then(texture => {
                            console.log('[Deck] Player character loaded successfully:', stage.characterImage);
                            playerDeckData.characterSprite.texture = texture;
                            const isMobile = window.innerWidth <= 768;
                            const isSmallMobile = window.innerWidth <= 480;
                            playerDeckData.characterSprite.height = isSmallMobile ? 120 : (isMobile ? 140 : 180);
                            playerDeckData.characterSprite.scale.x = playerDeckData.characterSprite.scale.y;
                            if (!playerDeckData.characterSprite.parent) {
                                playerDeckContainer.addChild(playerDeckData.characterSprite);
                                playerDeckContainer.setChildIndex(playerDeckData.countText, playerDeckContainer.children.length - 1);
                            }
                            playerDeckData.characterSprite.visible = true;
                            currentPlayerPortrait = stage.characterImage ?? null;
                        }).catch(err => {
                            console.warn('[Deck] Failed to load player character:', stage.characterImage, err);
                            playerDeckData.characterSprite.visible = false;
                            currentPlayerPortrait = null;
                        });
                    }
                    else {
                        playerDeckData.characterSprite.visible = false;
                        currentPlayerPortrait = null;
                    }
                    if (stage.enemyImage) {
                        console.log('[Deck] Loading enemy character:', stage.enemyImage);
                        Assets.load(stage.enemyImage).then(texture => {
                            console.log('[Deck] Enemy character loaded successfully:', stage.enemyImage);
                            enemyDeckData.characterSprite.texture = texture;
                            const isMobile = window.innerWidth <= 768;
                            const isSmallMobile = window.innerWidth <= 480;
                            enemyDeckData.characterSprite.height = isSmallMobile ? 120 : (isMobile ? 140 : 180);
                            enemyDeckData.characterSprite.scale.x = enemyDeckData.characterSprite.scale.y;
                            if (!enemyDeckData.characterSprite.parent) {
                                enemyDeckContainer.addChild(enemyDeckData.characterSprite);
                                enemyDeckContainer.setChildIndex(enemyDeckData.countText, enemyDeckContainer.children.length - 1);
                            }
                            enemyDeckData.characterSprite.visible = true;
                            currentEnemyPortrait = stage.enemyImage ?? null;
                        }).catch(err => {
                            console.warn('[Deck] Failed to load enemy character:', stage.enemyImage, err);
                            enemyDeckData.characterSprite.visible = false;
                            currentEnemyPortrait = null;
                        });
                    }
                    else {
                        enemyDeckData.characterSprite.visible = false;
                        currentEnemyPortrait = null;
                    }
                }
            }
            else if (state.battleContext.type === 'pvp') {
                const playerPortraitPath = resolveDeckPortrait(state.playerDeck, DEFAULT_PLAYER_PORTRAIT);
                const enemyPortraitPath = resolveDeckPortrait(state.enemyDeck, DEFAULT_ENEMY_PORTRAIT);
                if (playerPortraitPath !== currentPlayerPortrait) {
                    Assets.load(playerPortraitPath).then(texture => {
                        playerDeckData.characterSprite.texture = texture;
                        const isMobile = window.innerWidth <= 768;
                        const isSmallMobile = window.innerWidth <= 480;
                        playerDeckData.characterSprite.height = isSmallMobile ? 120 : (isMobile ? 140 : 180);
                        playerDeckData.characterSprite.scale.x = playerDeckData.characterSprite.scale.y;
                        if (!playerDeckData.characterSprite.parent) {
                            playerDeckContainer.addChild(playerDeckData.characterSprite);
                            playerDeckContainer.setChildIndex(playerDeckData.countText, playerDeckContainer.children.length - 1);
                        }
                        playerDeckData.characterSprite.visible = true;
                        currentPlayerPortrait = playerPortraitPath;
                    }).catch(err => {
                        console.warn('[Deck] Failed to load PvP player portrait:', playerPortraitPath, err);
                        playerDeckData.characterSprite.visible = false;
                        currentPlayerPortrait = null;
                    });
                }
                else if (playerDeckData.characterSprite.texture) {
                    playerDeckData.characterSprite.visible = true;
                }
                if (enemyPortraitPath !== currentEnemyPortrait) {
                    Assets.load(enemyPortraitPath).then(texture => {
                        enemyDeckData.characterSprite.texture = texture;
                        const isMobile = window.innerWidth <= 768;
                        const isSmallMobile = window.innerWidth <= 480;
                        enemyDeckData.characterSprite.height = isSmallMobile ? 120 : (isMobile ? 140 : 180);
                        enemyDeckData.characterSprite.scale.x = enemyDeckData.characterSprite.scale.y;
                        if (!enemyDeckData.characterSprite.parent) {
                            enemyDeckContainer.addChild(enemyDeckData.characterSprite);
                            enemyDeckContainer.setChildIndex(enemyDeckData.countText, enemyDeckContainer.children.length - 1);
                        }
                        enemyDeckData.characterSprite.visible = true;
                        currentEnemyPortrait = enemyPortraitPath;
                    }).catch(err => {
                        console.warn('[Deck] Failed to load PvP enemy portrait:', enemyPortraitPath, err);
                        enemyDeckData.characterSprite.visible = false;
                        currentEnemyPortrait = null;
                    });
                }
                else if (enemyDeckData.characterSprite.texture) {
                    enemyDeckData.characterSprite.visible = true;
                }
            }
            else {
                playerDeckData.characterSprite.visible = false;
                enemyDeckData.characterSprite.visible = false;
                currentPlayerPortrait = null;
                currentEnemyPortrait = null;
            }
        }
        else {
            playerDeckData.characterSprite.visible = false;
            enemyDeckData.characterSprite.visible = false;
            currentPlayerPortrait = null;
            currentEnemyPortrait = null;
        }
    }
    // 초기화
    initDeckVisuals().then(() => {
        console.log('[Deck] Initialization complete');
    });
    updateDeckVisuals();
    // 캐릭터 일러스트 피격 효과 함수 (효과 타입별 색상 지원)
    function flashCharacterSprite(sprite, effectType = 'damage') {
        if (!sprite.visible || !sprite.texture)
            return;
        // 효과별 색상 정의
        const effectColors = {
            damage: 0xFF6666, // 빨간색 (피해)
            heal: 0x66FF66, // 초록색 (회복)
            shield: 0x6666FF, // 파란색 (보호막)
            energy: 0xFFFF66, // 노란색 (에너지)
            burn: 0xFF6600, // 주황색 (화상)
            freeze: 0x66FFFF, // 청록색 (빙결)
            shock: 0xFFEE66, // 밝은 노란색 (감전)
            vulnerable: 0xFF66FF, // 자주색 (취약)
            buff: 0xFFD700, // 금색 (버프)
            draw: 0xFFFFFF, // 하얀색 (드로우)
            'card-trail': 0x4A9EFF, // 하늘색 (카드 사용)
        };
        const flashColor = effectColors[effectType] || 0xFFFFFF;
        sprite.tint = flashColor;
        // 0.15초 후 원래 색으로 복귀 (항상 흰색으로)
        setTimeout(() => {
            sprite.tint = 0xFFFFFF;
        }, 150);
    }
    // 위치 계산 함수
    function getPosition(target) {
        const centerX = app.renderer.width / 2;
        const centerY = app.renderer.height / 2;
        switch (target) {
            case 'player':
                // 플레이어 덱 위치
                return {
                    x: playerDeckContainer.x,
                    y: playerDeckContainer.y
                };
            case 'enemy':
                // 적 덱 위치
                return {
                    x: enemyDeckContainer.x,
                    y: enemyDeckContainer.y
                };
            case 'center':
                // 화면 중앙
                return {
                    x: centerX,
                    y: centerY
                };
            default:
                return { x: centerX, y: centerY };
        }
    }
    // 카드 사용 애니메이션 콜백 설정
    setCardUseAnimationCallback(async (card, isPlayerCard, handIndex) => {
        await showCardUseAnimation(card, isPlayerCard, handIndex);
    });
    // VFX 콜백 설정 (store에서 VFX 트리거)
    setVFXCallback((type, target, value) => {
        const pos = getPosition(target);
        switch (type) {
            case 'damage':
                vfxManager.playDamageEffect(pos.x, pos.y, value || 0);
                audioManager.playSFX('damage', 0.8);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'damage');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'damage');
                }
                break;
            case 'heal':
                vfxManager.playHealEffect(pos.x, pos.y, value || 0);
                audioManager.playSFX('heal', 0.7);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'heal');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'heal');
                }
                break;
            case 'shield':
                vfxManager.playShieldEffect(pos.x, pos.y);
                audioManager.playSFX('shield', 0.6);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'shield');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'shield');
                }
                break;
            case 'energy':
                vfxManager.playEnergyEffect(pos.x, pos.y);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'energy');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'energy');
                }
                break;
            case 'draw':
                vfxManager.playDrawEffect(pos.x, pos.y);
                audioManager.playSFX('card_draw', 0.5);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'draw');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'draw');
                }
                break;
            case 'burn':
                vfxManager.playBurnEffect(pos.x, pos.y);
                audioManager.playSFX('burn', 0.6);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'burn');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'burn');
                }
                break;
            case 'freeze':
                vfxManager.playFreezeEffect(pos.x, pos.y);
                audioManager.playSFX('freeze', 0.6);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'freeze');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'freeze');
                }
                break;
            case 'shock':
                vfxManager.playShockEffect(pos.x, pos.y);
                audioManager.playSFX('shock', 0.7);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'shock');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'shock');
                }
                break;
            case 'vulnerable':
                vfxManager.playVulnerableEffect(pos.x, pos.y);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'vulnerable');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'vulnerable');
                }
                break;
            case 'buff':
                vfxManager.playBuffEffect(pos.x, pos.y);
                if (target === 'player') {
                    flashCharacterSprite(playerDeckData.characterSprite, 'buff');
                }
                else if (target === 'enemy') {
                    flashCharacterSprite(enemyDeckData.characterSprite, 'buff');
                }
                break;
            case 'victory':
                vfxManager.playVictoryEffect(pos.x, pos.y);
                audioManager.playSFX('victory', 1.0);
                break;
            case 'defeat':
                vfxManager.playDefeatEffect(pos.x, pos.y);
                audioManager.playSFX('defeat', 1.0);
                break;
            case 'card-trail':
                vfxManager.playCardTrailEffect(pos.x, pos.y, value || 0x4a9eff);
                audioManager.playSFX('card_play', 0.5);
                break;
            default:
                console.warn(`[VFX] Unknown effect type: ${type}`);
        }
    });
    // Enemy Hand UI (Pixi Container)
    const enemyHandContainer = new Container();
    enemyHandContainer.y = 50;
    app.stage.addChild(enemyHandContainer);
    // HP 바 컨테이너 생성
    const playerHPBar = new Container();
    const enemyHPBar = new Container();
    // HP 바 설정 함수
    function createHPBar(container, maxWidth, isPlayer) {
        container.removeChildren();
        // 배경 (어두운 바)
        const bgBar = new Graphics();
        bgBar.rect(0, 0, maxWidth, 20);
        bgBar.fill({ color: 0x333333 });
        container.addChild(bgBar);
        // HP 바 (색상 변화)
        const hpBar = new Graphics();
        hpBar.rect(0, 0, maxWidth, 20);
        hpBar.fill({ color: 0x4CAF50 });
        container.addChild(hpBar);
        // 테두리
        const border = new Graphics();
        border.rect(0, 0, maxWidth, 20);
        border.stroke({ color: 0x000000, width: 2 });
        container.addChild(border);
        // HP 텍스트
        const hpText = new Text({
            text: '100/100',
            style: {
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: 3 }
            }
        });
        hpText.anchor.set(0.5);
        hpText.x = maxWidth / 2;
        hpText.y = 10;
        container.addChild(hpText);
        // 이름 라벨
        const nameText = new Text({
            text: isPlayer ? 'PLAYER' : 'ENEMY',
            style: {
                fontSize: 12,
                fill: isPlayer ? 0x4a9eff : 0xff4444,
                fontWeight: 'bold'
            }
        });
        nameText.x = 0;
        nameText.y = -18;
        container.addChild(nameText);
        return { hpBar, hpText, bgBar };
    }
    // HP 바 생성 (모바일 대응 - 전역 변수로 선언하여 리사이즈 시 업데이트 가능하게 함)
    let playerHPBarWidth = 200;
    let enemyHPBarWidth = 200;
    let playerHPComponents = createHPBar(playerHPBar, playerHPBarWidth, true);
    let enemyHPComponents = createHPBar(enemyHPBar, enemyHPBarWidth, false);
    // HP 바 위치 설정은 updateBattleLayout에서 처리
    app.stage.addChild(playerHPBar);
    app.stage.addChild(enemyHPBar);
    // 에너지 바 생성 함수
    function createEnergyBar(container, maxWidth, isPlayer) {
        container.removeChildren();
        // 모바일 대응 - 바 높이와 폰트 크기 조정
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const barHeight = isSmallMobile ? 12 : 16;
        const fontSize = isSmallMobile ? 9 : (isMobile ? 10 : 12);
        // 배경 (어두운 바)
        const bgBar = new Graphics();
        bgBar.rect(0, 0, maxWidth, barHeight);
        bgBar.fill({ color: 0x333333 });
        container.addChild(bgBar);
        // 에너지 바 (황금색)
        const energyBar = new Graphics();
        energyBar.rect(0, 0, maxWidth, barHeight);
        energyBar.fill({ color: 0xffeb3b }); // 황금색
        container.addChild(energyBar);
        // 테두리
        const border = new Graphics();
        border.rect(0, 0, maxWidth, barHeight);
        border.stroke({ color: 0x000000, width: 2 });
        container.addChild(border);
        // 에너지 텍스트
        const energyText = new Text({
            text: '10/10',
            style: {
                fontSize: fontSize,
                fill: 0x000000,
                fontWeight: 'bold'
            }
        });
        energyText.anchor.set(0.5);
        energyText.x = maxWidth / 2;
        energyText.y = barHeight / 2;
        container.addChild(energyText);
        return { energyBar, energyText, bgBar };
    }
    // 에너지 바 컨테이너 생성
    const playerEnergyBar = new Container();
    const enemyEnergyBar = new Container();
    let playerEnergyComponents = createEnergyBar(playerEnergyBar, 200, true);
    let enemyEnergyComponents = createEnergyBar(enemyEnergyBar, 200, false);
    app.stage.addChild(playerEnergyBar);
    app.stage.addChild(enemyEnergyBar);
    // ================== 버프/디버프 UI (HP 바 아래) ==================
    const playerStatusContainer = new Container();
    playerStatusContainer.x = playerHPBar.x;
    playerStatusContainer.y = playerHPBar.y + 30; // HP바 아래
    app.stage.addChild(playerStatusContainer);
    const enemyStatusContainer = new Container();
    enemyStatusContainer.x = enemyHPBar.x;
    enemyStatusContainer.y = enemyHPBar.y + 30; // HP바 아래
    app.stage.addChild(enemyStatusContainer);
    // 상태 아이콘 생성 함수
    function createStatusIcon(emoji, value, duration, color) {
        const container = new Container();
        // 배경
        const bg = new Graphics();
        bg.rect(0, 0, 50, 24);
        bg.fill({ color: color, alpha: 0.8 });
        bg.stroke({ color: 0x000000, width: 1 });
        container.addChild(bg);
        // 이모지 + 값
        const text = new Text({
            text: `${emoji} ${value}`,
            style: {
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        text.x = 4;
        text.y = 4;
        container.addChild(text);
        // 턴 수 (작게)
        if (duration > 0) {
            const durationText = new Text({
                text: `${duration}T`,
                style: {
                    fontSize: 10,
                    fill: 0xcccccc
                }
            });
            durationText.x = 38;
            durationText.y = 2;
            container.addChild(durationText);
        }
        return container;
    }
    // 상태 UI 업데이트 함수
    function updateStatusUI() {
        const state = useBattleStore.getState();
        // 상태 이모지/색상 매핑
        const statusIconMap = {
            'Burn': { emoji: '🔥', color: 0xf44336 },
            'Freeze': { emoji: '❄️', color: 0x03a9f4 },
            'Shock': { emoji: '⚡', color: 0xffeb3b },
            'Vulnerable': { emoji: '💔', color: 0xe91e63 },
            'Weak': { emoji: '😢', color: 0x795548 },
            'Poison': { emoji: '☠️', color: 0x4caf50 },
            'Silence': { emoji: '🤐', color: 0x607d8b },
            'Strength': { emoji: '💪', color: 0xff9800 },
            'Vigor': { emoji: '⚡', color: 0xffc107 },
            'Focus': { emoji: '🎯', color: 0x9c27b0 },
        };
        // 플레이어 상태 초기화
        playerStatusContainer.removeChildren();
        let playerX = 0;
        // 직접 필드 - 보호 효과
        if (state.playerStatus.shield > 0) {
            const icon = createStatusIcon('🛡️', state.playerStatus.shield, state.playerStatus.shieldDuration, 0x4a9eff);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.guard > 0) {
            const icon = createStatusIcon('🛡️', state.playerStatus.guard, state.playerStatus.guardDuration, 0x2196f3);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        // 직접 필드 - 기타 효과
        if (state.playerStatus.attackBuff > 0) {
            const icon = createStatusIcon('💪', state.playerStatus.attackBuff, 0, 0xff9800);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.regen > 0) {
            const icon = createStatusIcon('💚', state.playerStatus.regen, 0, 0x4caf50);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.shockStacks > 0) {
            const icon = createStatusIcon('⚡', state.playerStatus.shockStacks, 0, 0xffeb3b);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.evasionCharges > 0) {
            const icon = createStatusIcon('💨', state.playerStatus.evasionCharges, state.playerStatus.evasionDuration, 0x9c27b0);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.nullifyCharges > 0) {
            const icon = createStatusIcon('🚫', state.playerStatus.nullifyCharges, 0, 0xff9800);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        if (state.playerStatus.counterValue > 0) {
            const icon = createStatusIcon('⚔️', state.playerStatus.counterValue, state.playerStatus.counterDuration, 0xe91e63);
            icon.x = playerX;
            playerStatusContainer.addChild(icon);
            playerX += 54;
        }
        // statuses 배열 - 모든 상태 효과
        state.playerStatus.statuses.forEach((status) => {
            const iconData = statusIconMap[status.key];
            if (iconData) {
                const icon = createStatusIcon(iconData.emoji, status.stacks || 1, status.duration, iconData.color);
                icon.x = playerX;
                playerStatusContainer.addChild(icon);
                playerX += 54;
            }
        });
        // 적 상태 초기화
        enemyStatusContainer.removeChildren();
        let enemyX = 0;
        // 직접 필드 - 보호 효과
        if (state.enemyStatus.shield > 0) {
            const icon = createStatusIcon('🛡️', state.enemyStatus.shield, state.enemyStatus.shieldDuration, 0x4a9eff);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.guard > 0) {
            const icon = createStatusIcon('🛡️', state.enemyStatus.guard, state.enemyStatus.guardDuration, 0x2196f3);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        // 직접 필드 - 기타 효과
        if (state.enemyStatus.attackBuff > 0) {
            const icon = createStatusIcon('💪', state.enemyStatus.attackBuff, 0, 0xff9800);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.regen > 0) {
            const icon = createStatusIcon('💚', state.enemyStatus.regen, 0, 0x4caf50);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.shockStacks > 0) {
            const icon = createStatusIcon('⚡', state.enemyStatus.shockStacks, 0, 0xffeb3b);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.evasionCharges > 0) {
            const icon = createStatusIcon('💨', state.enemyStatus.evasionCharges, state.enemyStatus.evasionDuration, 0x9c27b0);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.nullifyCharges > 0) {
            const icon = createStatusIcon('🚫', state.enemyStatus.nullifyCharges, 0, 0xff9800);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        if (state.enemyStatus.counterValue > 0) {
            const icon = createStatusIcon('⚔️', state.enemyStatus.counterValue, state.enemyStatus.counterDuration, 0xe91e63);
            icon.x = enemyX;
            enemyStatusContainer.addChild(icon);
            enemyX += 54;
        }
        // statuses 배열 - 모든 상태 효과
        state.enemyStatus.statuses.forEach((status) => {
            const iconData = statusIconMap[status.key];
            if (iconData) {
                const icon = createStatusIcon(iconData.emoji, status.stacks || 1, status.duration, iconData.color);
                icon.x = enemyX;
                enemyStatusContainer.addChild(icon);
                enemyX += 54;
            }
        });
        // 전투 화면에서만 표시
        playerStatusContainer.visible = state.gameScreen === 'battle';
        enemyStatusContainer.visible = state.gameScreen === 'battle';
    }
    // 초기 HP 바 설정
    const initialState = useBattleStore.getState();
    updateHPBar(playerHPBar, playerHPComponents, initialState.playerHp, initialState.playerMaxHp, playerHPBarWidth, initialState.playerHp, false);
    updateHPBar(enemyHPBar, enemyHPComponents, initialState.enemyHp, initialState.enemyMaxHp, enemyHPBarWidth, initialState.enemyHp, false);
    // 초기 에너지 바 설정
    updateEnergyBar(playerEnergyBar, playerEnergyComponents, initialState.energy, 10, playerHPBarWidth);
    updateEnergyBar(enemyEnergyBar, enemyEnergyComponents, initialState.enemyEnergy, 10, enemyHPBarWidth);
    // 초기 상태 UI
    updateStatusUI();
    // 배틀 화면 요소 위치 조정 함수 (리사이즈 이벤트에서 호출)
    const updateBattleLayout = () => {
        const { width: viewportWidth, height: viewportHeight } = getViewportSize();
        const isLandscapeCompact = document.body.classList.contains('mobile-landscape');
        const isMobile = viewportWidth <= 768 || viewportHeight <= 620 || isLandscapeCompact;
        const isSmallMobile = viewportWidth <= 480 || viewportHeight <= 380;
        // HP 바 너비 업데이트 및 재생성
        const newPlayerHPBarWidth = isSmallMobile ? 120 : (isLandscapeCompact ? 140 : (isMobile ? 150 : 200));
        const newEnemyHPBarWidth = isSmallMobile ? 120 : (isLandscapeCompact ? 140 : (isMobile ? 150 : 200));
        if (playerHPBarWidth !== newPlayerHPBarWidth) {
            playerHPBarWidth = newPlayerHPBarWidth;
            const state = useBattleStore.getState();
            playerHPComponents = createHPBar(playerHPBar, playerHPBarWidth, true);
            updateHPBar(playerHPBar, playerHPComponents, state.playerHp, state.playerMaxHp, playerHPBarWidth, state.playerHp, false);
            // 에너지 바도 같은 너비로 재생성
            playerEnergyComponents = createEnergyBar(playerEnergyBar, playerHPBarWidth, true);
            updateEnergyBar(playerEnergyBar, playerEnergyComponents, state.energy, 10, playerHPBarWidth);
        }
        if (enemyHPBarWidth !== newEnemyHPBarWidth) {
            enemyHPBarWidth = newEnemyHPBarWidth;
            const state = useBattleStore.getState();
            enemyHPComponents = createHPBar(enemyHPBar, enemyHPBarWidth, false);
            updateHPBar(enemyHPBar, enemyHPComponents, state.enemyHp, state.enemyMaxHp, enemyHPBarWidth, state.enemyHp, false);
            // 에너지 바도 같은 너비로 재생성
            enemyEnergyComponents = createEnergyBar(enemyEnergyBar, enemyHPBarWidth, false);
            updateEnergyBar(enemyEnergyBar, enemyEnergyComponents, state.enemyEnergy, 10, enemyHPBarWidth);
        }
        // 덱 컨테이너 배경 크기 업데이트
        const bgWidth = isSmallMobile ? 90 : (isLandscapeCompact ? 100 : (isMobile ? 105 : 130));
        const bgHeight = isSmallMobile ? 124 : (isLandscapeCompact ? 135 : (isMobile ? 145 : 180));
        const bgHalfWidth = bgWidth / 2;
        const bgHalfHeight = bgHeight / 2;
        // 플레이어 덱 배경 업데이트
        playerDeckData.shadow.clear();
        playerDeckData.shadow.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        playerDeckData.shadow.fill({ color: 0x000000, alpha: 0.3 });
        playerDeckData.characterBackground.clear();
        playerDeckData.characterBackground.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        playerDeckData.characterBackground.fill({ color: 0x1a1a2e, alpha: 0.3 });
        // 적 덱 배경 업데이트
        enemyDeckData.shadow.clear();
        enemyDeckData.shadow.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        enemyDeckData.shadow.fill({ color: 0x000000, alpha: 0.3 });
        enemyDeckData.characterBackground.clear();
        enemyDeckData.characterBackground.rect(-bgHalfWidth, -bgHalfHeight, bgWidth, bgHeight);
        enemyDeckData.characterBackground.fill({ color: 0x1a1a2e, alpha: 0.3 });
        // 모바일에 따라 덱 간격과 위치 조정
        const deckOffsetX = isSmallMobile ? 100 : (isLandscapeCompact ? 140 : (isMobile ? 150 : 200));
        const deckOffsetY = isSmallMobile ? -30 : (isLandscapeCompact ? -24 : (isMobile ? -40 : -60));
        const hpOffsetX = isSmallMobile ? -45 : (isLandscapeCompact ? -55 : (isMobile ? -50 : -100));
        const hpOffsetY = isSmallMobile ? 46 : (isLandscapeCompact ? 48 : (isMobile ? 60 : 60));
        playerHPBar.x = app.renderer.width / 2 - deckOffsetX + hpOffsetX;
        playerHPBar.y = app.renderer.height / 2 + hpOffsetY;
        enemyHPBar.x = app.renderer.width / 2 + deckOffsetX + hpOffsetX;
        enemyHPBar.y = app.renderer.height / 2 + hpOffsetY;
        // 에너지 바 위치 설정 (HP 바 아래)
        const energyBarOffset = isSmallMobile ? 20 : (isLandscapeCompact ? 18 : 25); // 모바일에서는 간격을 줄임
        playerEnergyBar.x = playerHPBar.x;
        playerEnergyBar.y = playerHPBar.y + energyBarOffset;
        enemyEnergyBar.x = enemyHPBar.x;
        enemyEnergyBar.y = enemyHPBar.y + energyBarOffset;
        // 덱 위치도 재조정
        playerDeckContainer.x = app.renderer.width / 2 - deckOffsetX;
        playerDeckContainer.y = app.renderer.height / 2 + deckOffsetY;
        enemyDeckContainer.x = app.renderer.width / 2 + deckOffsetX;
        enemyDeckContainer.y = app.renderer.height / 2 + deckOffsetY;
        // VS 텍스트 위치 재조정
        vsText.x = app.renderer.width / 2;
        vsText.y = app.renderer.height / 2 + deckOffsetY;
        // VS 텍스트 크기 조정
        if (isSmallMobile) {
            vsText.style.fontSize = 32;
            vsText.style.stroke = { color: 0x000000, width: 3 };
        }
        else if (isLandscapeCompact) {
            vsText.style.fontSize = 36;
            vsText.style.stroke = { color: 0x000000, width: 3 };
        }
        else if (isMobile) {
            vsText.style.fontSize = 40;
            vsText.style.stroke = { color: 0x000000, width: 3 };
        }
        else {
            vsText.style.fontSize = 48;
            vsText.style.stroke = { color: 0x000000, width: 4 };
        }
        // 버프/디버프 컨테이너 위치 재조정 (에너지 바 아래)
        const statusContainerOffset = isSmallMobile ? 20 : (isLandscapeCompact ? 18 : 25); // 모바일에서는 간격을 줄임
        playerStatusContainer.x = playerHPBar.x;
        playerStatusContainer.y = playerEnergyBar.y + statusContainerOffset;
        enemyStatusContainer.x = enemyHPBar.x;
        enemyStatusContainer.y = enemyEnergyBar.y + statusContainerOffset;
        if (handContainerRef) {
            const baseHandOffset = isSmallMobile ? 140 : (isLandscapeCompact ? 130 : (isMobile ? 170 : 220));
            handContainerRef.y = app.renderer.height - baseHandOffset;
        }
    };
    updateBattleLayoutRef = updateBattleLayout;
    updateViewportFlags();
    // 초기 위치 설정
    updateBattleLayout();
    scheduleLayoutRefresh();
    // 윈도우 리사이즈 시 HP 바 및 덱 위치 조정
    window.addEventListener('resize', updateBattleLayout);
    // HP 바 이전 값 추적 (번쩍임 효과용)
    let prevPlayerHPForFlash = initialState.playerHp;
    let prevEnemyHPForFlash = initialState.enemyHp;
    // HP 바 번쩍임 효과 함수
    function flashHPBar(container, hpChange) {
        // HP 감소: 빨간색, HP 증가: 초록색
        const flashColor = hpChange < 0 ? 0xff0000 : 0x00ff00;
        // 배경 Graphics 찾기 (bgBar)
        const bgBar = container.getChildAt(0);
        if (!bgBar)
            return;
        // 번쩍임 애니메이션 (0.3초)
        let flashAlpha = 0.6;
        const fadeOutDuration = 300; // 0.3초
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / fadeOutDuration, 1.0);
            flashAlpha = 0.6 * (1 - progress);
            // 오버레이 사각형 그리기
            if (progress < 1.0) {
                // bgBar 위에 번쩍임 오버레이 추가
                if (container.children.length > 4) { // 이미 오버레이가 있으면 제거
                    container.removeChildAt(4);
                }
                const flashOverlay = new Graphics();
                flashOverlay.rect(0, 0, playerHPBarWidth, 20);
                flashOverlay.fill({ color: flashColor, alpha: flashAlpha });
                container.addChildAt(flashOverlay, 4); // 맨 위에 추가
                requestAnimationFrame(animate);
            }
            else {
                // 애니메이션 종료 시 오버레이 제거
                if (container.children.length > 4) {
                    container.removeChildAt(4);
                }
            }
        };
        animate();
    }
    // HP 바 업데이트 함수
    function updateHPBar(container, components, currentHP, maxHP, maxWidth, prevHP, animate = true) {
        const ratio = Math.max(0, Math.min(1, currentHP / maxHP));
        const targetWidth = maxWidth * ratio;
        // 색상 결정 (초록 → 노랑 → 빨강)
        let color;
        if (ratio > 0.6) {
            color = 0x4CAF50; // 초록
        }
        else if (ratio > 0.3) {
            color = 0xffeb3b; // 노랑
        }
        else {
            color = 0xf44336; // 빨강
        }
        // HP 바 너비와 색상 업데이트
        components.hpBar.clear();
        components.hpBar.rect(0, 0, targetWidth, 20);
        components.hpBar.fill({ color });
        // 텍스트 업데이트
        components.hpText.text = `${Math.round(currentHP)}/${maxHP}`;
        // 🎬 번쩍임 효과 (HP가 변화했을 때만)
        if (animate && Math.abs(currentHP - prevHP) > 0.1) {
            const hpChange = currentHP - prevHP;
            flashHPBar(container, hpChange);
        }
    }
    // 에너지 바 업데이트 함수
    function updateEnergyBar(container, components, currentEnergy, maxEnergy, maxWidth) {
        const ratio = Math.max(0, Math.min(1, currentEnergy / maxEnergy));
        const targetWidth = maxWidth * ratio;
        // 모바일 대응 - 바 높이 조정 (createEnergyBar와 동일한 로직)
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const barHeight = isSmallMobile ? 12 : 16;
        // 에너지 바 너비 업데이트
        components.energyBar.clear();
        components.energyBar.rect(0, 0, targetWidth, barHeight);
        components.energyBar.fill({ color: 0xffeb3b }); // 황금색
        // 텍스트 업데이트
        components.energyText.text = `${Math.round(currentEnergy)}/${maxEnergy}`;
    }
    let enemyCardSprites = [];
    let isRenderingEnemyHand = false;
    let pendingEnemyRender = false;
    function renderEnemyHand() {
        // 이미 렌더링 중이면 대기 플래그 설정
        if (isRenderingEnemyHand) {
            pendingEnemyRender = true;
            return;
        }
        isRenderingEnemyHand = true;
        try {
            const state = useBattleStore.getState();
            // Release all pooled cards (재사용을 위해 반환)
            enemyHandPool.releaseAll();
            enemyCardSprites = [];
            enemyHandContainer.removeChildren();
            if (!state.enemyHand || state.enemyHand.length === 0) {
                isRenderingEnemyHand = false;
                return;
            }
            // 🎬 드로우 애니메이션 중이면 일부만 렌더링
            const cardsToShow = isDrawingEnemyCards ? Math.min(enemyCardsToRender, state.enemyHand.length) : state.enemyHand.length;
            // 모바일에서는 적 카드도 약간 조정
            const isMobileView = window.innerWidth <= 768;
            const cardWidth = isMobileView ? 90 : 100;
            const cardHeight = isMobileView ? 135 : 150;
            const spacing = isMobileView ? 6 : 8;
            const startX = (app.renderer.width - (cardsToShow * (cardWidth + spacing) - spacing)) * 0.5;
            for (let idx = 0; idx < cardsToShow; idx++) {
                const card = state.enemyHand[idx];
                // 풀에서 카드 가져오기 (재사용 or 새로 생성)
                const pooledCard = enemyHandPool.acquire(cardWidth, cardHeight);
                const { container, costText, nameText } = pooledCard;
                // ⚠️ 중요: 컨테이너 상태 초기화 (재사용 시 이전 상태 제거)
                container.x = startX + idx * (cardWidth + spacing);
                container.y = 0;
                container.visible = true;
                container.scale.set(1.0);
                container.alpha = 1.0; // 알파 초기화
                container.tint = 0xFFFFFF; // 틴트 초기화
                // 적 카드는 항상 뒷면으로 표시
                const cardBackPath = getCardBackImage();
                if (cardBackPath) {
                    const sprite = Sprite.from(cardBackPath);
                    sprite.width = cardWidth;
                    sprite.height = cardHeight;
                    sprite.tint = 0xFFFFFF; // 스프라이트 틴트 초기화
                    enemyHandPool.replaceSprite(pooledCard, sprite);
                }
                else {
                    // Fallback: create placeholder if card back not loaded
                    const placeholder = new Graphics();
                    placeholder.rect(0, 0, cardWidth, cardHeight);
                    placeholder.fill({ color: 0x2a1a4a }); // 보라색 계열
                    // 간단한 "?" 표시
                    const text = new Text({ text: '?', style: { fontSize: 48, fill: 0xffd700 } });
                    text.anchor.set(0.5);
                    text.x = cardWidth / 2;
                    text.y = cardHeight / 2;
                    placeholder.addChild(text);
                    enemyHandPool.replaceSprite(pooledCard, placeholder);
                }
                // 적 카드는 정보 숨김 (뒷면이므로)
                costText.visible = false;
                nameText.visible = false;
                // 이벤트 설정
                container.eventMode = 'static';
                container.cursor = 'default';
                container.on('pointerenter', () => {
                    container.scale.set(1.1);
                });
                container.on('pointerleave', () => {
                    container.scale.set(1.0);
                });
                enemyHandContainer.addChild(container);
                enemyCardSprites.push({ sprite: pooledCard.sprite, container, index: idx });
            }
        }
        finally {
            isRenderingEnemyHand = false;
            // 대기 중인 렌더링 요청이 있으면 다시 실행
            if (pendingEnemyRender) {
                pendingEnemyRender = false;
                renderEnemyHand();
            }
        }
    }
    // Hand UI (Pixi Container)
    const handContainer = new Container();
    handContainer.y = app.renderer.height - 220;
    app.stage.addChild(handContainer);
    handContainerRef = handContainer;
    // 핸드 스크롤 기능 (모바일)
    let handScrollData = {
        isDragging: false,
        startX: 0,
        startContainerX: 0,
        minX: 0,
        maxX: 0,
    };
    // 핸드 경계 업데이트 (카드 수에 따라)
    function updateHandScrollBounds() {
        const state = useBattleStore.getState();
        if (!state.hand || state.hand.length === 0) {
            handScrollData.minX = 0;
            handScrollData.maxX = 0;
            return;
        }
        const isMobileView = window.innerWidth <= 768;
        const cardWidth = isMobileView ? 100 : 120;
        const spacing = isMobileView ? 8 : 10;
        const totalWidth = state.hand.length * (cardWidth + spacing) - spacing;
        const screenWidth = app.renderer.width;
        // 카드들이 화면보다 넓으면 스크롤 가능
        if (totalWidth > screenWidth) {
            handScrollData.maxX = 0;
            handScrollData.minX = screenWidth - totalWidth - 50; // 50px 여유
        }
        else {
            // 중앙 정렬 유지
            handScrollData.minX = 0;
            handScrollData.maxX = 0;
            handContainer.x = 0;
        }
    }
    // 터치/마우스 드래그 이벤트
    handContainer.eventMode = 'static';
    handContainer.on('pointerdown', (event) => {
        handScrollData.isDragging = true;
        handScrollData.startX = event.global.x;
        handScrollData.startContainerX = handContainer.x;
    });
    handContainer.on('pointermove', (event) => {
        if (!handScrollData.isDragging)
            return;
        const dx = event.global.x - handScrollData.startX;
        let newX = handScrollData.startContainerX + dx;
        // 경계 체크
        newX = Math.max(handScrollData.minX, Math.min(handScrollData.maxX, newX));
        handContainer.x = newX;
    });
    handContainer.on('pointerup', () => {
        handScrollData.isDragging = false;
    });
    handContainer.on('pointerupoutside', () => {
        handScrollData.isDragging = false;
    });
    let cardSprites = [];
    let isRenderingHand = false;
    let pendingRender = false;
    // ================== 카드 사용 연출 애니메이션 ==================
    async function showCardUseAnimation(card, isPlayerCard, handIndex) {
        return new Promise(async (resolve) => {
            const cardImagePath = getCardImagePath(card);
            if (!cardImagePath) {
                console.warn('[CardUse] Card image not found');
                resolve();
                return;
            }
            try {
                // 카드 이미지 로드
                const texture = await Assets.load(cardImagePath);
                // 🎬 손에서의 카드 위치 계산 (renderHand 로직 참고)
                const state = useBattleStore.getState();
                const isMobileView = window.innerWidth <= 768;
                const cardWidth = isMobileView ? 100 : 120;
                const cardHeight = isMobileView ? 150 : 180;
                const spacing = isMobileView ? 8 : 10;
                const handCount = isPlayerCard ? state.hand.length : state.enemyHand.length;
                const startX = (app.renderer.width - (handCount * (cardWidth + spacing) - spacing)) * 0.5;
                let fromX;
                let fromY;
                if (isPlayerCard && handIndex >= 0) {
                    // 플레이어 카드: 손에서의 실제 위치
                    fromX = startX + handIndex * (cardWidth + spacing) + cardWidth / 2;
                    fromY = app.renderer.height - cardHeight / 2 - 20;
                }
                else {
                    // 적 카드: 상단 중앙에서 시작
                    fromX = app.renderer.width / 2;
                    fromY = cardHeight / 2 + 70;
                }
                const toX = app.renderer.width / 2;
                const toY = app.renderer.height / 2;
                // 카드 컨테이너 생성 (손 위치에서 시작)
                const cardContainer = new Container();
                cardContainer.x = fromX;
                cardContainer.y = fromY;
                app.stage.addChild(cardContainer);
                // 카드 스프라이트 (손 크기로 시작)
                const cardSprite = new Sprite(texture);
                cardSprite.anchor.set(0.5);
                cardSprite.width = cardWidth;
                cardSprite.height = cardHeight;
                cardContainer.addChild(cardSprite);
                // 배경 어둡게 (강조 효과)
                const overlay = new Graphics();
                overlay.rect(0, 0, app.renderer.width, app.renderer.height);
                overlay.fill({ color: 0x000000, alpha: 0 });
                app.stage.addChildAt(overlay, app.stage.children.indexOf(cardContainer));
                // 빛나는 테두리
                const glow = new Graphics();
                const glowSize = 210; // 최종 크기 기준
                glow.rect(-glowSize / 2, -glowSize * 275 / 200 / 2, glowSize, glowSize * 275 / 200);
                glow.stroke({ color: isPlayerCard ? 0x4a9eff : 0xff4444, width: 4 });
                glow.alpha = 0;
                cardContainer.addChild(glow);
                // Phase 0: 손에서 중앙으로 이동 (0.4초) 🎴
                const moveDuration = 400;
                const startTime0 = Date.now();
                const moveToCenter = () => {
                    const elapsed = Date.now() - startTime0;
                    const progress = Math.min(elapsed / moveDuration, 1.0);
                    const eased = Easing.easeOutCubic(progress);
                    cardContainer.x = fromX + (toX - fromX) * eased;
                    cardContainer.y = fromY + (toY - fromY) * eased;
                    overlay.alpha = eased * 0.3;
                    if (progress < 1.0) {
                        requestAnimationFrame(moveToCenter);
                    }
                    else {
                        // Phase 1: 확대 (0.5초)
                        expandCard();
                    }
                };
                const expandCard = () => {
                    const expandDuration = 500;
                    const startTime1 = Date.now();
                    const startWidth = cardSprite.width;
                    const startHeight = cardSprite.height;
                    const targetWidth = 200;
                    const targetHeight = 275;
                    const expand = () => {
                        const elapsed = Date.now() - startTime1;
                        const progress = Math.min(elapsed / expandDuration, 1.0);
                        const eased = Easing.easeOutCubic(progress);
                        cardSprite.width = startWidth + (targetWidth - startWidth) * eased;
                        cardSprite.height = startHeight + (targetHeight - startHeight) * eased;
                        overlay.alpha = 0.3 + eased * 0.2; // 0.3 → 0.5
                        glow.alpha = eased * 0.8;
                        if (progress < 1.0) {
                            requestAnimationFrame(expand);
                        }
                        else {
                            // Phase 2: 유지 (0.4초)
                            setTimeout(() => {
                                // Phase 3: 축소 (0.3초)
                                const shrinkDuration = 300;
                                const startTime2 = Date.now();
                                const shrink = () => {
                                    const elapsed = Date.now() - startTime2;
                                    const progress = Math.min(elapsed / shrinkDuration, 1.0);
                                    const eased = Easing.easeInCubic(progress);
                                    cardSprite.width = targetWidth * (1.0 - eased);
                                    cardSprite.height = targetHeight * (1.0 - eased);
                                    cardContainer.alpha = 1.0 - eased;
                                    overlay.alpha = 0.5 - eased * 0.5;
                                    glow.alpha = 0.8 - eased * 0.8;
                                    if (progress < 1.0) {
                                        requestAnimationFrame(shrink);
                                    }
                                    else {
                                        // 정리
                                        app.stage.removeChild(cardContainer);
                                        app.stage.removeChild(overlay);
                                        // 파티클 효과
                                        const centerX = app.renderer.width / 2;
                                        const centerY = app.renderer.height / 2;
                                        vfxManager.playCardTrailEffect(centerX, centerY, isPlayerCard ? 0x4a9eff : 0xff4444);
                                        resolve();
                                    }
                                };
                                shrink();
                            }, 400);
                        }
                    };
                    expand();
                };
                // 애니메이션 시작 (손에서 중앙으로 이동)
                moveToCenter();
            }
            catch (err) {
                console.warn('[CardUse] Failed to load card image:', err);
                resolve();
            }
        });
    }
    // 카드 드로우 애니메이션 함수
    async function animateCardDraw(targetPosition, isPlayerCard = true) {
        return new Promise((resolve) => {
            // 덱 위치에서 시작하는 임시 카드 스프라이트 생성
            const cardSprite = new Sprite();
            const cardBackPath = getCardBackImage();
            if (!cardBackPath) {
                resolve();
                return;
            }
            Assets.load(cardBackPath).then((texture) => {
                cardSprite.texture = texture;
                cardSprite.width = 120;
                cardSprite.height = 165;
                cardSprite.anchor.set(0.5);
                // 시작 위치: 플레이어 또는 적 덱
                const deckContainer = isPlayerCard ? playerDeckContainer : enemyDeckContainer;
                cardSprite.x = deckContainer.x;
                cardSprite.y = deckContainer.y;
                cardSprite.rotation = 0;
                cardSprite.alpha = 1.0;
                app.stage.addChild(cardSprite);
                // 애니메이션 시간
                const duration = 300; // 0.3초
                const startTime = Date.now();
                const startX = cardSprite.x;
                const startY = cardSprite.y;
                // 애니메이션 루프
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1.0);
                    const eased = Easing.easeOutQuad(progress);
                    // 위치 보간
                    cardSprite.x = startX + (targetPosition.x - startX) * eased;
                    cardSprite.y = startY + (targetPosition.y - startY) * eased;
                    // 회전 효과 (뒤집히는 느낌)
                    cardSprite.rotation = Math.PI * 2 * eased;
                    if (progress < 1.0) {
                        requestAnimationFrame(animate);
                    }
                    else {
                        // 애니메이션 완료
                        app.stage.removeChild(cardSprite);
                        // 반짝임 효과
                        vfxManager.playDrawEffect(targetPosition.x, targetPosition.y);
                        // 사운드
                        audioManager.playSFX('card_draw', 0.5);
                        resolve();
                    }
                };
                animate();
            }).catch((err) => {
                console.warn('[DrawAnim] Failed to load card back:', err);
                resolve();
            });
        });
    }
    function renderHand() {
        // 이미 렌더링 중이면 대기 플래그 설정
        if (isRenderingHand) {
            pendingRender = true;
            return;
        }
        isRenderingHand = true;
        try {
            const state = useBattleStore.getState();
            // Release all pooled cards (재사용을 위해 반환)
            playerHandPool.releaseAll();
            cardSprites = [];
            handContainer.removeChildren();
            if (!state.hand || state.hand.length === 0) {
                return;
            }
            // 🎬 드로우 애니메이션 중이면 일부만 렌더링
            const cardsToShow = isDrawingCards ? Math.min(cardsToRender, state.hand.length) : state.hand.length;
            // 모바일에서는 카드를 더 작게 표시
            const isMobileView = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            const cardWidth = isSmallMobile ? 75 : (isMobileView ? 90 : 120);
            const cardHeight = isSmallMobile ? 112 : (isMobileView ? 135 : 180);
            const spacing = isSmallMobile ? 5 : (isMobileView ? 6 : 10);
            const startX = (app.renderer.width - (cardsToShow * (cardWidth + spacing) - spacing)) * 0.5;
            for (let idx = 0; idx < cardsToShow; idx++) {
                const card = state.hand[idx];
                // 풀에서 카드 가져오기 (재사용 or 새로 생성)
                const pooledCard = playerHandPool.acquire(cardWidth, cardHeight);
                const cardContainer = pooledCard.container;
                // ⚠️ 중요: 컨테이너 상태 초기화 (재사용 시 이전 상태 제거)
                cardContainer.x = startX + idx * (cardWidth + spacing);
                cardContainer.y = 0;
                cardContainer.visible = true;
                cardContainer.scale.set(1.0);
                cardContainer.alpha = 1.0; // 알파 초기화
                cardContainer.tint = 0xFFFFFF; // 틴트 초기화
                // 오버레이 제거 (이전 렌더링에서 추가된 것들)
                // 이제 4개의 기본 요소: sprite, costText, typeIcon, nameText
                while (cardContainer.children.length > 4) {
                    cardContainer.removeChildAt(4);
                }
                // 이미지 업데이트
                const imagePath = getLoadedCardImage(card);
                if (imagePath) {
                    const sprite = Sprite.from(imagePath);
                    sprite.width = cardWidth;
                    sprite.height = cardHeight;
                    sprite.tint = 0xFFFFFF; // 스프라이트 틴트 초기화
                    playerHandPool.replaceSprite(pooledCard, sprite);
                }
                else {
                    // Fallback: create placeholder if image not loaded
                    const placeholder = new Graphics();
                    placeholder.rect(0, 0, cardWidth, cardHeight);
                    placeholder.fill({ color: state.energy < card.cost ? 0x444444 : 0x556677 });
                    playerHandPool.replaceSprite(pooledCard, placeholder);
                }
                // Cost label 업데이트 - 항상 재설정하여 위치/색상 오염 방지
                playerHandPool.setupCostText(pooledCard, card.cost, cardWidth, state.energy >= card.cost);
                const updatedCost = pooledCard.costText;
                if (updatedCost instanceof Container) {
                    updatedCost.x = cardWidth - 15;
                    updatedCost.y = 15;
                }
                // Type icon 업데이트 - 타입별로 아이콘 표시
                // 타입별 색상 및 아이콘 경로
                const typeConfig = {
                    'Attack': { color: 0xFF4444, iconPath: 'cardIcons/Type/type_attack.png' },
                    'Defense': { color: 0x4444FF, iconPath: 'cardIcons/Type/type_defense.png' },
                    'Heal': { color: 0x44FF44, iconPath: 'cardIcons/Type/type_heal.png' },
                    'Special': { color: 0xFF44FF, iconPath: 'cardIcons/Type/type_special.png' },
                }[card.type] || { color: 0xFFFFFF, iconPath: 'cardIcons/Type/type_attack.png' };
                playerHandPool.setupTypeIcon(pooledCard, typeConfig.color, typeConfig.iconPath);
                const updatedIcon = pooledCard.typeIcon;
                if (updatedIcon instanceof Container) {
                    updatedIcon.x = 15;
                    updatedIcon.y = 15;
                }
                // Disabled overlay
                if (state.energy < card.cost) {
                    const overlay = new Graphics();
                    overlay.rect(0, 0, cardWidth, cardHeight);
                    overlay.fill({ color: 0x000000, alpha: 0.5 });
                    cardContainer.addChild(overlay);
                    cardContainer.alpha = 0.6;
                }
                // 비주얼: 선언된 카드 하이라이트, 예약 불가 카드 흐림 처리
                const st = useBattleStore.getState();
                const isQueued = st.queuedHandIndices.includes(idx);
                const remaining = st.getRemainingEnergy();
                const canDeclare = !isQueued && st.gameOver === 'none' && card.cost <= remaining;
                // 선언 연출 먼저 설정
                const baseY = cardContainer.y;
                const queuedY = baseY - 20;
                const queuedScale = 1.05;
                if (isQueued) {
                    cardContainer.y = queuedY;
                    cardContainer.scale.set(queuedScale);
                    cardContainer.alpha = 1;
                }
                else {
                    cardContainer.alpha = canDeclare ? 1 : 0.5;
                }
                // Make interactive with hover effects (선언 상태 고려)
                // 🔴 기존 이벤트 핸들러 제거 (중복 등록 방지)
                cardContainer.removeAllListeners();
                cardContainer.eventMode = 'static';
                cardContainer.cursor = canDeclare || isQueued ? 'pointer' : 'not-allowed';
                cardContainer.on('pointerenter', (e) => {
                    const current = useBattleStore.getState();
                    const nowQueued = current.queuedHandIndices.includes(idx);
                    if (nowQueued) {
                        // 선언된 카드: 살짝만 추가 상승
                        cardContainer.y = queuedY - 10;
                        cardContainer.scale.set(queuedScale * 1.05);
                    }
                    else if (canDeclare) {
                        // 선언 가능 카드: 일반 hover
                        cardContainer.y = baseY - 15;
                        cardContainer.scale.set(1.1);
                    }
                    // 툴팁 표시
                    showTooltip(card, e.globalX, e.globalY);
                });
                cardContainer.on('pointerleave', () => {
                    const current = useBattleStore.getState();
                    const nowQueued = current.queuedHandIndices.includes(idx);
                    if (nowQueued) {
                        // 선언 상태로 복귀
                        cardContainer.y = queuedY;
                        cardContainer.scale.set(queuedScale);
                    }
                    else {
                        // 기본 상태로 복귀
                        cardContainer.y = baseY;
                        cardContainer.scale.set(1.0);
                    }
                    // 툴팁 숨김
                    hideTooltip();
                });
                // 롱프레스 감지를 위한 타이머
                let longPressTimer = null;
                let pointerDownTime = 0;
                let pointerDownPos = { x: 0, y: 0 };
                cardContainer.on('pointerdown', (e) => {
                    const currentState = useBattleStore.getState();
                    if (currentState.gameOver !== 'none')
                        return;
                    pointerDownTime = Date.now();
                    pointerDownPos = { x: e.globalX, y: e.globalY };
                    // 롱프레스 타이머 시작 (500ms)
                    longPressTimer = window.setTimeout(() => {
                        // 롱프레스: 카드 프리뷰 표시
                        hideTooltip();
                        showCardPreview(card);
                        longPressTimer = null;
                    }, 500);
                });
                cardContainer.on('pointerup', (e) => {
                    // 롱프레스 타이머 취소
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                    const currentState = useBattleStore.getState();
                    if (currentState.gameOver !== 'none')
                        return;
                    // 짧은 시간 + 작은 이동 = 클릭
                    const pressDuration = Date.now() - pointerDownTime;
                    const moveDistance = Math.hypot(e.globalX - pointerDownPos.x, e.globalY - pointerDownPos.y);
                    if (pressDuration < 500 && moveDistance < 10) {
                        // 툴팁 숨김
                        hideTooltip();
                        // 🔒 턴 처리 중에는 카드 선택 불가
                        if (useBattleStore.getState().isTurnProcessing) {
                            return;
                        }
                        // 토글: 선택되어 있으면 취소, 아니면 선언
                        if (currentState.queuedHandIndices.includes(idx)) {
                            audioManager.playSFX('card_play', 0.4);
                            useBattleStore.getState().unDeclareCard(idx);
                        }
                        else {
                            audioManager.playSFX('card_play', 0.6);
                            useBattleStore.getState().declareCard(idx);
                        }
                    }
                });
                cardContainer.on('pointerupoutside', () => {
                    // 롱프레스 타이머 취소
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                });
                handContainer.addChild(cardContainer);
                // 🔴 카드 추가 직후 기본 상태로 확실히 초기화 (재렌더링 시 잘못된 hover 방지)
                // 다음 프레임에서 마우스가 실제로 카드 위에 있지 않으면 hover 상태 제거
                requestAnimationFrame(() => {
                    // 카드가 여전히 유효한지 확인 (재렌더링 중 제거되었을 수 있음)
                    if (!cardContainer.parent)
                        return;
                    // 현재 마우스 위치 확인 (간단한 방법)
                    const current = useBattleStore.getState();
                    const nowQueued = current.queuedHandIndices.includes(idx);
                    // 이벤트가 자동으로 처리되지만, 혹시 모를 hover 상태 초기화를 위해
                    // 기본 상태를 한 번 더 확실히 설정
                    if (!nowQueued) {
                        cardContainer.y = baseY;
                        cardContainer.scale.set(1.0);
                    }
                });
                cardSprites.push({ sprite: pooledCard.sprite, container: cardContainer, index: idx });
            }
        }
        finally {
            isRenderingHand = false;
            // 스크롤 경계 업데이트
            updateHandScrollBounds();
            // 대기 중인 렌더링 요청이 있으면 다시 실행
            if (pendingRender) {
                pendingRender = false;
                renderHand(); // 비동기로 다시 호출 (await 하지 않음)
            }
        }
    }
    // Handle window resize
    window.addEventListener('resize', async () => {
        if (handContainerRef) {
            handContainerRef.y = app.renderer.height - 220;
        }
        await renderHand();
    });
    // Load cards (but don't initialize game yet)
    let allCards = [];
    let gameInitialized = false;
    let victoryDefeatTimer = null;
    let isInitializingGame = false; // 🔴 게임 초기화 중 플래그
    /**
     * 초기 컬렉션 구성 함수 (20장)
     * 초기 덱과 동일한 카드들로 구성
     */
    function getInitialCollection(allCards) {
        const initialCardIds = [
            'ATT_ARIANA_NO_001', 'ATT_ARIANA_NO_001', 'ATT_ARIANA_NO_001',
            'ATT_DARIUS_NO_017', 'ATT_ELDER_NO_033', 'ATT_ELENA_NO_049',
            'ATT_GAREN_NO_065', 'ATT_IRIS_NO_081',
            'DEF_ARIANA_NO_013', 'DEF_ARIANA_NO_013', 'DEF_ARIANA_NO_013',
            'DEF_ELENA_NO_061', 'DEF_IRIS_NO_093',
            'HEA_ARIANA_NO_005', 'HEA_ARIANA_NO_005', 'HEA_ARIANA_NO_005',
            'HEA_DARIUS_NO_021',
            'SPE_ARIANA_NO_009', 'SPE_ARIANA_NO_009', 'SPE_ELDER_NO_041',
        ];
        const cardMap = new Map(allCards.map(card => [card.id, card]));
        const collection = [];
        for (const cardId of initialCardIds) {
            const card = cardMap.get(cardId);
            if (card) {
                collection.push({ ...card, id: `${card.id}_${Date.now()}_${Math.random()}` });
            }
        }
        return collection;
    }
    try {
        console.log('Loading cards from /data/cards.json...');
        loadingManager.setProgress(10, '카드 데이터 로딩 중...');
        allCards = await loadSampleCards();
        console.log(`Loaded ${allCards.length} cards`);
        // Set collection in store
        useBattleStore.getState().setAllCardsPool(allCards);
        // 초기 컬렉션: 20장만 소유 (초기 덱 구성)
        const storeState = useBattleStore.getState();
        const isLoggedIn = useAuthStore.getState().session !== null;
        if (storeState.collection.length === 0 && !isLoggedIn) {
            const initialCollection = getInitialCollection(allCards);
            storeState.setCollection(initialCollection);
        }
        // Preload all card images (WebP 우선, PNG 폴백)
        loadingManager.setProgress(30, '카드 이미지 로딩 중...');
        await preloadCardImages(allCards);
        loadingManager.setProgress(80, '초기화 중...');
        // 잠시 대기 후 로딩 화면 숨김
        await new Promise(resolve => setTimeout(resolve, 500));
        loadingManager.setProgress(100, '완료!');
        await new Promise(resolve => setTimeout(resolve, 300));
        loadingManager.hide();
        toastManager.success(`${allCards.length}장의 카드 로딩 완료!`, 2000);
    }
    catch (e) {
        console.error('Failed to load sample cards', e);
        loadingManager.hide();
        toastManager.error(`카드 로딩 실패: ${e instanceof Error ? e.message : String(e)}`, 5000);
        handRoot.innerHTML = `<span style="color: #f88;">카드 로딩 실패: ${e instanceof Error ? e.message : String(e)}</span>`;
    }
    // Deck Editor UI
    function renderDeckEditor() {
        // 덱 편집 화면 활성화
        deckEditorRoot.classList.add('active');
        cardGalleryRoot.classList.remove('active');
        const state = useBattleStore.getState();
        const { playerDeck, collection } = state;
        console.log('[UI][DeckEditor] Rendering with state', {
            deckLength: playerDeck.length,
            collectionLength: collection.length,
            deckSampleIds: playerDeck.slice(0, 3).map(card => card.id),
            deckSampleNames: playerDeck.slice(0, 3).map(card => card.name),
            collectionSampleIds: collection.slice(0, 3).map(card => card.id),
            collectionSampleNames: collection.slice(0, 3).map(card => card.name),
        });
        const validity = state.getDeckValidity();
        // 코스트 분포 계산
        const costDistribution = [0, 0, 0, 0, 0, 0]; // 0-5 코스트
        playerDeck.forEach(card => {
            const cost = Math.min(5, Math.max(0, card.cost));
            costDistribution[cost]++;
        });
        // 덱 내 카드 개수 계산
        const deckCardCounts = new Map();
        playerDeck.forEach(card => {
            const count = deckCardCounts.get(card.id) || 0;
            deckCardCounts.set(card.id, count + 1);
        });
        const isMobileView = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const deckColumnMinWidth = isSmallMobile ? 80 : (isMobileView ? 100 : 110);
        const collectionMinWidth = isSmallMobile ? 120 : (isMobileView ? 140 : 160);
        const collectionGap = isSmallMobile ? 10 : (isMobileView ? 14 : 18);
        const deckGap = isSmallMobile ? 6 : 8;
        const totalCost = playerDeck.reduce((sum, card) => sum + (card?.cost ?? 0), 0);
        const averageCost = playerDeck.length > 0 ? (totalCost / playerDeck.length).toFixed(1) : '0.0';
        const legendaryCount = playerDeck.filter(card => card.rarity === 'Legendary').length;
        const uniqueDeckCards = new Set(playerDeck.map(card => (card.id.split('__snap__')[0] ?? card.id)));
        const deckErrorsMarkup = validity.errors.length > 0
            ? `
          <div style="background: rgba(244, 67, 54, 0.2); border: 1px solid #f44336; border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 12px;">
            ${validity.errors.map(err => `<div>⚠️ ${err}</div>`).join('')}
          </div>
        `
            : '';
        const deckStatusSummaryMarkup = validity.valid
            ? `
          <div style="background: rgba(102, 187, 106, 0.18); border: 1px solid rgba(102, 187, 106, 0.45); border-radius: 8px; padding: 10px; font-size: 12px; color: #c8e6c9;">
            ✓ 덱 구성이 유효합니다.
          </div>
        `
            : `
          <div style="background: rgba(244, 67, 54, 0.18); border: 1px solid rgba(244, 67, 54, 0.45); border-radius: 8px; padding: 10px; font-size: 12px; color: #ffab91; line-height: 1.5;">
            ${validity.errors.map(err => `⚠️ ${err}`).join('<br>')}
          </div>
        `;
        const costChartMarkup = `
      <div class="cost-chart">
        <h4 style="margin-top: 0;">코스트 분포</h4>
        ${costDistribution.map((count, cost) => `
          <div class="cost-bar">
            <div class="label">코스트 ${cost}</div>
            <div class="bar">
              <div class="bar-fill" style="width: ${(count / 20) * 100}%"></div>
            </div>
            <div class="count">${count}</div>
          </div>
        `).join('')}
      </div>
    `;
        const deckSummaryMarkup = `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        <div style="background: rgba(33, 150, 243, 0.18); border: 1px solid rgba(33, 150, 243, 0.45); border-radius: 10px; padding: 10px;">
          <div style="font-size: 12px; color: #bbdefb;">평균 코스트</div>
          <div style="font-size: 18px; font-weight: 700; margin-top: 4px;">${averageCost}</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; font-size: 12px;">
          <span>레전더리 카드</span>
          <span style="font-weight: 700;">${legendaryCount}장</span>
        </div>
        <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; font-size: 12px;">
          <span>중복 제외 카드</span>
          <span style="font-weight: 700;">${uniqueDeckCards.size}종</span>
        </div>
      </div>
    `;
        const headerHTML = `
      <div class="header">
        <div>
          <h2>🃏 덱 편집</h2>
          <div style="font-size: 11px; color: #aaa; margin-top: 6px;">
            💡 <strong>PC:</strong> Shift+클릭 또는 우클릭으로 카드 상세 정보 | <strong>모바일:</strong> 길게 눌러서 확인
          </div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button id="deck-menu-btn" style="background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 4px 12px; border-radius: 6px; cursor: pointer;">← 메인 메뉴</button>
            <button id="deck-gallery-btn" style="background: #4a9eff; color: #fff; border: 1px solid #5aaeff; padding: 4px 12px; border-radius: 6px; cursor: pointer;">📚 카드도감</button>
            <button id="deck-auto-btn" style="background: linear-gradient(90deg, rgba(108,92,231,0.9), rgba(94, 53, 177, 0.95)); color: #fefbff; border: 1px solid rgba(123,97,255,0.65); padding: 4px 12px; border-radius: 6px; cursor: pointer;">⚙️ 자동 편성</button>
          </div>
        </div>
        <div class="deck-info">
          <div class="info-item ${validity.valid ? 'valid' : 'invalid'}">
            <strong>덱 크기:</strong> ${playerDeck.length}/20
          </div>
          <div class="info-item ${validity.valid ? 'valid' : 'invalid'}">
            <strong>상태:</strong> ${validity.valid ? '✓ 유효' : '✗ 오류'}
          </div>
        </div>
      </div>
    `;
        let contentHTML = '';
        if (isMobileView) {
            const pageLabels = {
                collection: '컬렉션',
                deck: '현재 덱',
                stats: '덱 정보',
            };
            if (!MOBILE_DECK_EDITOR_PAGES.includes(currentMobileDeckEditorPage)) {
                currentMobileDeckEditorPage = 'collection';
            }
            const tabButtonsMarkup = MOBILE_DECK_EDITOR_PAGES.map(page => {
                const isActive = page === currentMobileDeckEditorPage;
                return `
          <button
            type="button"
            data-deck-tab="${page}"
            style="
              flex: 1;
              padding: 10px 12px;
              border-radius: 999px;
              border: 1px solid ${isActive ? '#4a9eff' : 'rgba(255,255,255,0.25)'};
              background: ${isActive ? 'linear-gradient(90deg, rgba(74,158,255,0.9), rgba(33,150,243,0.9))' : 'rgba(255,255,255,0.08)'};
              color: ${isActive ? '#E3F2FD' : '#cfd8dc'};
              font-size: 13px;
              font-weight: 600;
              transition: all 0.2s ease;
            "
          >
            ${pageLabels[page]}
          </button>
        `;
            }).join('');
            contentHTML = `
        <div class="mobile-tab-nav" style="display: flex; gap: 10px; margin: 12px 0; padding: 0 2px;">
          ${tabButtonsMarkup}
        </div>
        <div class="mobile-page" data-page="collection" style="${currentMobileDeckEditorPage === 'collection' ? '' : 'display:none;'}">
          <h3 style="margin: 8px 0;">카드 컬렉션 (${collection.length}장)</h3>
          <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
            짧게 탭하면 덱에 추가되고, 길게 누르면 상세 정보를 볼 수 있습니다.
          </div>
          <div class="card-grid" id="collection-grid"></div>
        </div>
        <div class="mobile-page" data-page="deck" style="${currentMobileDeckEditorPage === 'deck' ? '' : 'display:none;'}">
          <h3 style="margin: 8px 0;">현재 덱 (${playerDeck.length}/20)</h3>
          <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
            카드를 탭하면 제거 버튼이 나타나고, 길게 누르면 상세 정보를 확인할 수 있습니다.
          </div>
          ${deckErrorsMarkup}
          <div class="deck-card-list" id="deck-list"></div>
        </div>
        <div class="mobile-page" data-page="stats" style="${currentMobileDeckEditorPage === 'stats' ? '' : 'display:none;'}">
          <h3 style="margin: 8px 0;">덱 정보</h3>
          ${deckStatusSummaryMarkup}
          ${deckSummaryMarkup}
          ${costChartMarkup}
        </div>
      `;
        }
        else {
            currentMobileDeckEditorPage = 'collection';
            contentHTML = `
        <div class="content">
          <div class="collection">
            <h3>카드 컬렉션 (${collection.length}장)</h3>
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
              <strong>PC:</strong> 클릭: 추가 | Shift+클릭/우클릭: 상세정보<br>
              <strong>모바일:</strong> 짧게 탭: 추가 | 길게 누르기 (0.5초): 상세정보
            </div>
            <div class="card-grid" id="collection-grid"></div>
          </div>
          <div class="current-deck">
            <h3>현재 덱 (${playerDeck.length}/20)</h3>
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
              <strong>PC:</strong> 호버 → X 버튼 클릭 | Shift+클릭: 상세정보<br>
              <strong>모바일:</strong> 짧게 탭 → X 버튼 탭 | 길게 누르기: 상세정보
            </div>
            ${deckErrorsMarkup}
            <div class="deck-card-list" id="deck-list"></div>
            ${costChartMarkup}
          </div>
        </div>
      `;
        }
        deckEditorRoot.innerHTML = `${headerHTML}${contentHTML}`;
        // 메인 메뉴 버튼 이벤트 리스너
        const menuBtn = document.getElementById('deck-menu-btn');
        menuBtn.onclick = () => {
            useBattleStore.getState().setGameScreen('menu');
        };
        // 카드도감 버튼 이벤트 리스너
        const galleryBtn = document.getElementById('deck-gallery-btn');
        galleryBtn.onclick = () => {
            renderCardGallery();
        };
        const autoBtn = document.getElementById('deck-auto-btn');
        autoBtn.onclick = () => {
            if (playerDeck.length > 0 && !window.confirm('현재 덱을 자동으로 재편성할까요?\n기존 덱 구성이 덮어씌워집니다.')) {
                return;
            }
            const result = useBattleStore.getState().autoBuildDeck();
            if (!result.success) {
                toastManager.warning('자동 편성에 사용할 카드가 충분하지 않습니다.', 3000);
                return;
            }
            if (result.missing > 0) {
                toastManager.warning(`자동 편성 완료! (${result.deckSize}/20) - 카드가 ${result.missing}장 부족합니다.`, 3500);
            }
            else {
                toastManager.success('자동 편성 완료! 덱이 갱신되었습니다.', 2500);
            }
            audioManager.playSFX('card_play', 0.6);
            renderDeckEditor();
        };
        if (isMobileView) {
            const tabButtons = document.querySelectorAll('button[data-deck-tab]');
            tabButtons.forEach(btn => {
                btn.onclick = () => {
                    const targetPage = btn.dataset.deckTab;
                    if (targetPage && targetPage !== currentMobileDeckEditorPage) {
                        currentMobileDeckEditorPage = targetPage;
                        renderDeckEditor();
                    }
                };
            });
        }
        // Render collection cards with images
        const collectionGrid = document.getElementById('collection-grid');
        const tryAddCardToDeck = (card, currentCount) => {
            if (isMobile && !window.confirm(`'${card.name}' 카드를 덱에 추가할까요?`)) {
                return;
            }
            const success = useBattleStore.getState().addCardToDeck(card);
            if (!success && currentCount === 0) {
                toastManager.warning('덱이 가득 찼거나 Legendary 제한에 걸렸습니다.', 2500);
            }
            else if (!success) {
                toastManager.warning(`${card.name}은(는) 이미 3장입니다.`, 2000);
            }
            else {
                toastManager.success(`${card.name} 추가됨`, 1500);
                audioManager.playSFX('card_play', 0.6);
            }
        };
        if (isMobileView) {
            const mobileMinWidth = isSmallMobile ? 130 : 150;
            collectionGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${mobileMinWidth}px, 1fr));
        gap: ${collectionGap}px;
        padding: 8px 4px 12px;
        max-height: 60vh;
        overflow-y: auto;
      `;
            collectionGrid.style.removeProperty('scrollbar-width');
            collectionGrid.style.removeProperty('scrollbar-color');
        }
        else {
            collectionGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${collectionMinWidth}px, 1fr));
        gap: ${collectionGap}px;
        padding: 8px 12px 16px;
        max-height: none;
        overflow-y: auto;
      `;
            collectionGrid.style.removeProperty('scrollbar-width');
            collectionGrid.style.removeProperty('scrollbar-color');
        }
        collection.forEach(card => {
            const inDeckCount = deckCardCounts.get(card.id) || 0;
            const cardDiv = document.createElement('div');
            cardDiv.className = `deck-editor-card ${inDeckCount >= 3 ? 'maxed' : ''}`;
            cardDiv.style.cssText = `
        position: relative;
        cursor: pointer;
        transition: transform 0.2s;
      `;
            // 카드 이미지
            const cardImg = document.createElement('img');
            const imagePath = getCardImagePath(card);
            cardImg.src = imagePath;
            cardImg.alt = card.name;
            cardImg.style.cssText = `
        width: 100%;
        ${isMobileView ? 'height: auto;' : 'height: auto;'}
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        object-fit: cover;
      `;
            cardImg.onerror = () => {
                cardImg.style.display = 'none';
                cardDiv.innerHTML += `
          <div style="background: linear-gradient(135deg, #2a3f5f, #1a2f4f); border: 2px solid #3a4f75; border-radius: 8px; padding: 10px; height: ${isMobileView ? 150 : 180}px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-align: center;">${card.name}</div>
            <div style="font-size: 11px; color: #aaa; display: flex; gap: 8px;">
              <span>💎 ${card.cost}</span>
              <span>${card.type}</span>
            </div>
          </div>
        `;
            };
            // 카드 개수 표시
            if (inDeckCount > 0) {
                const countBadge = document.createElement('div');
                countBadge.className = 'card-count-badge';
                countBadge.textContent = `${inDeckCount}`;
                countBadge.style.cssText = 'position: absolute; top: 8px; right: 8px; background: #4a9eff; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.4);';
                cardDiv.appendChild(countBadge);
            }
            cardDiv.appendChild(cardImg);
            // 호버 효과
            cardDiv.onmouseenter = () => {
                cardDiv.style.transform = 'translateY(-4px)';
                cardImg.style.boxShadow = '0 8px 16px rgba(74, 158, 255, 0.4)';
            };
            cardDiv.onmouseleave = () => {
                cardDiv.style.transform = 'translateY(0)';
                cardImg.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            };
            // 롱프레스 타이머 (모바일용)
            let longPressTimer = null;
            let touchStartTime = 0;
            let suppressClickAfterTouch = false;
            let touchStartX = 0;
            let touchStartY = 0;
            let touchMoved = false;
            cardDiv.ontouchstart = (e) => {
                if (e.touches && e.touches.length > 0) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
                touchStartTime = Date.now();
                longPressTimer = window.setTimeout(() => {
                    showCardPreview(card);
                    longPressTimer = null;
                }, 500);
                touchMoved = false;
            };
            cardDiv.ontouchmove = (e) => {
                if (touchMoved) {
                    return;
                }
                if (e.touches && e.touches.length > 0) {
                    const moveX = e.touches[0].clientX;
                    const moveY = e.touches[0].clientY;
                    const deltaX = Math.abs(moveX - touchStartX);
                    const deltaY = Math.abs(moveY - touchStartY);
                    if (deltaX > 8 || deltaY > 8) {
                        touchMoved = true;
                        if (longPressTimer !== null) {
                            clearTimeout(longPressTimer);
                            longPressTimer = null;
                        }
                    }
                }
            };
            cardDiv.ontouchend = (e) => {
                if (longPressTimer !== null) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                if (touchMoved) {
                    touchMoved = false;
                    suppressClickAfterTouch = true;
                    window.setTimeout(() => {
                        suppressClickAfterTouch = false;
                    }, 150);
                    return;
                }
                const pressDuration = Date.now() - touchStartTime;
                if (pressDuration < 500) {
                    tryAddCardToDeck(card, inDeckCount);
                }
                suppressClickAfterTouch = true;
                suppressClickAfterTouch = true;
                window.setTimeout(() => {
                    suppressClickAfterTouch = false;
                }, 400);
            };
            // 터치 취소 시 타이머 해제 (스크롤 등)
            cardDiv.ontouchcancel = () => {
                if (longPressTimer !== null) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                touchMoved = false;
            };
            cardDiv.onclick = (e) => {
                if (isMobile && suppressClickAfterTouch) {
                    return;
                }
                // Shift+클릭: 카드 상세 정보
                if (e.shiftKey) {
                    e.preventDefault();
                    showCardPreview(card);
                    return;
                }
                // 일반 클릭: 덱에 추가
                tryAddCardToDeck(card, inDeckCount);
            };
            // 우클릭: 카드 상세 정보
            cardDiv.oncontextmenu = (e) => {
                e.preventDefault();
                showCardPreview(card);
            };
            collectionGrid.appendChild(cardDiv);
        });
        // Render deck list with card images
        const deckList = document.getElementById('deck-list');
        if (playerDeck.length === 0) {
            deckList.innerHTML = '<div style="color: #777; text-align: center; padding: 20px;">덱이 비어있습니다</div>';
        }
        else {
            // 그리드 스타일 적용
            if (isMobileView) {
                const mobileDeckWidth = isSmallMobile ? 130 : 150;
                deckList.style.cssText = `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(${mobileDeckWidth}px, 1fr));
          gap: ${deckGap}px;
          margin-top: 16px;
          max-height: 60vh;
          overflow-y: auto;
          padding: 0 4px 12px;
        `;
                deckList.style.removeProperty('scrollbar-width');
                deckList.style.removeProperty('scrollbar-color');
            }
            else {
                deckList.style.cssText = `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(${deckColumnMinWidth}px, 1fr));
          gap: ${deckGap}px;
          margin-top: 16px;
          max-height: 600px;
          overflow-y: auto;
          padding: 0;
        `;
                deckList.style.removeProperty('scrollbar-width');
                deckList.style.removeProperty('scrollbar-color');
            }
            playerDeck.forEach((card, index) => {
                const cardDiv = document.createElement('div');
                cardDiv.style.cssText = `
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
        `;
                // 카드 이미지
                const cardImg = document.createElement('img');
                const imagePath = getCardImagePath(card);
                cardImg.src = imagePath;
                cardImg.alt = card.name;
                cardImg.style.cssText = `
          width: 100%;
          ${isMobileView ? 'height: auto;' : 'height: auto;'}
          border-radius: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          object-fit: cover;
        `;
                cardImg.onerror = () => {
                    cardImg.style.display = 'none';
                    cardDiv.innerHTML += `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #3a4f75; border-radius: 6px; padding: 8px; height: ${isMobileView ? 130 : 140}px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 11px;">
              <div style="font-weight: bold; margin-bottom: 4px; text-align: center;">${card.name}</div>
              <div style="color: #aaa;">💎 ${card.cost}</div>
            </div>
          `;
                };
                // 제거 버튼 (X 아이콘)
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✖';
                removeBtn.style.cssText = 'position: absolute; top: 4px; right: 4px; background: rgba(244, 67, 54, 0.9); color: #fff; border: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: all 0.2s; opacity: 0;';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    useBattleStore.getState().removeCardFromDeck(card.id);
                    audioManager.playSFX('card_play', 0.4);
                    toastManager.info(`${card.name} 제거됨`, 1500);
                };
                // 호버 시 제거 버튼 표시
                cardDiv.onmouseenter = () => {
                    cardDiv.style.transform = 'translateY(-2px)';
                    cardImg.style.boxShadow = '0 4px 10px rgba(244, 67, 54, 0.4)';
                    removeBtn.style.opacity = '1';
                };
                cardDiv.onmouseleave = () => {
                    cardDiv.style.transform = 'translateY(0)';
                    cardImg.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                    removeBtn.style.opacity = '0';
                };
                // 롱프레스 타이머 (모바일용)
                let longPressTimer = null;
                let touchStartTime = 0;
                let touchStartX = 0;
                let touchStartY = 0;
                let touchMoved = false;
                cardDiv.ontouchstart = (e) => {
                    touchStartTime = Date.now();
                    if (e.touches && e.touches.length > 0) {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                    }
                    longPressTimer = window.setTimeout(() => {
                        // 롱프레스: 카드 상세 정보
                        showCardPreview(card);
                        longPressTimer = null;
                    }, 500);
                    touchMoved = false;
                };
                cardDiv.ontouchmove = (e) => {
                    if (touchMoved)
                        return;
                    if (e.touches && e.touches.length > 0) {
                        const moveX = e.touches[0].clientX;
                        const moveY = e.touches[0].clientY;
                        const deltaX = Math.abs(moveX - touchStartX);
                        const deltaY = Math.abs(moveY - touchStartY);
                        if (deltaX > 8 || deltaY > 8) {
                            touchMoved = true;
                            if (longPressTimer !== null) {
                                clearTimeout(longPressTimer);
                                longPressTimer = null;
                            }
                        }
                    }
                };
                cardDiv.ontouchend = (e) => {
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                        // 롱프레스가 아니면 X 버튼 토글 (모바일에서 제거하기 쉽게)
                        const pressDuration = Date.now() - touchStartTime;
                        if (!touchMoved && pressDuration < 500) {
                            // 짧은 탭: X 버튼 토글
                            if (removeBtn.style.opacity === '1') {
                                removeBtn.style.opacity = '0';
                            }
                            else {
                                removeBtn.style.opacity = '1';
                            }
                        }
                    }
                    touchMoved = false;
                };
                // 터치 취소 시 타이머 해제 (스크롤 등)
                cardDiv.ontouchcancel = () => {
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                    touchMoved = false;
                };
                // Shift+클릭 또는 우클릭: 카드 상세 정보
                cardDiv.onclick = (e) => {
                    if (e.shiftKey) {
                        e.preventDefault();
                        showCardPreview(card);
                    }
                };
                cardDiv.oncontextmenu = (e) => {
                    e.preventDefault();
                    showCardPreview(card);
                };
                cardDiv.appendChild(cardImg);
                cardDiv.appendChild(removeBtn);
                deckList.appendChild(cardDiv);
            });
        }
    }
    // Card Gallery UI
    function renderCardGallery() {
        const state = useBattleStore.getState();
        const allCards = state.allCardsPool;
        // 카드 타입별로 그룹화
        const cardsByType = {
            Attack: allCards.filter(c => c.type === 'Attack'),
            Defense: allCards.filter(c => c.type === 'Defense'),
            Heal: allCards.filter(c => c.type === 'Heal'),
            Special: allCards.filter(c => c.type === 'Special')
        };
        // 레어도별 색상
        const rarityColors = {
            Normal: '#9e9e9e',
            Rare: '#2196f3',
            Epic: '#9c27b0',
            Legendary: '#ff9800'
        };
        cardGalleryRoot.innerHTML = `
      <div class="header">
        <div>
          <h2>📚 카드도감</h2>
          <div style="font-size: 11px; color: #aaa; margin-top: 6px;">
            💡 <strong>PC:</strong> Shift+클릭 또는 우클릭으로 카드 상세 정보 | <strong>모바일:</strong> 길게 눌러서 확인
          </div>
          <button id="gallery-back-btn" style="background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 4px 12px; border-radius: 6px; cursor: pointer; margin-top: 8px;">← 덱 편집으로</button>
        </div>
        <div class="gallery-info">
          <div style="font-size: 14px;">
            <strong>전체 카드:</strong> ${allCards.length}장
          </div>
        </div>
      </div>
      <div class="content">
        ${Object.entries(cardsByType).map(([type, cards]) => `
          <div style="margin-bottom: 40px;">
            <h3 style="font-size: 20px; margin-bottom: 16px; color: #4a9eff; border-bottom: 2px solid #4a9eff; padding-bottom: 8px;">
              ${type === 'Attack' ? '⚔️ 공격' : type === 'Defense' ? '🛡️ 방어' : type === 'Heal' ? '💚 회복' : '✨ 특수'} 카드 (${cards.length}장)
            </h3>
            <div class="card-grid" id="gallery-grid-${type}"></div>
          </div>
        `).join('')}
      </div>
    `;
        // 뒤로가기 버튼
        const backBtn = document.getElementById('gallery-back-btn');
        backBtn.onclick = () => {
            cardGalleryRoot.classList.remove('active');
            renderDeckEditor();
        };
        // 카드도감 표시
        cardGalleryRoot.classList.add('active');
        deckEditorRoot.classList.remove('active');
        // 각 타입별로 카드 렌더링
        Object.entries(cardsByType).forEach(([type, cards]) => {
            const grid = document.getElementById(`gallery-grid-${type}`);
            // 레어도 순으로 정렬 (Normal -> Rare -> Epic -> Legendary)
            const rarityOrder = { Normal: 0, Rare: 1, Epic: 2, Legendary: 3 };
            const sortedCards = [...cards].sort((a, b) => {
                const aOrder = rarityOrder[a.rarity] ?? 999;
                const bOrder = rarityOrder[b.rarity] ?? 999;
                if (aOrder !== bOrder)
                    return aOrder - bOrder;
                return a.cost - b.cost;
            });
            sortedCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'gallery-card';
                cardDiv.style.cssText = 'position: relative; cursor: pointer; transition: transform 0.2s;';
                // 카드 이미지
                const cardImg = document.createElement('img');
                const imagePath = getCardImagePath(card);
                cardImg.src = imagePath;
                cardImg.alt = card.name;
                cardImg.style.cssText = 'width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);';
                cardImg.onerror = () => {
                    cardImg.style.display = 'none';
                    cardDiv.innerHTML += `
            <div style="background: linear-gradient(135deg, #2a3f5f, #1a2f4f); border: 2px solid ${rarityColors[card.rarity] || '#3a4f75'}; border-radius: 8px; padding: 12px; height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-align: center; color: ${rarityColors[card.rarity] || '#fff'};">${card.name}</div>
              <div style="font-size: 11px; color: #aaa; display: flex; gap: 8px;">
                <span>💎 ${card.cost}</span>
                <span>${card.type}</span>
              </div>
            </div>
          `;
                };
                // 레어도 표시 배지
                const rarityBadge = document.createElement('div');
                rarityBadge.textContent = card.rarity === 'Normal' ? 'N' : card.rarity === 'Rare' ? 'R' : card.rarity === 'Epic' ? 'E' : 'L';
                rarityBadge.style.cssText = `position: absolute; top: 8px; left: 8px; background: ${rarityColors[card.rarity] || '#9e9e9e'}; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.4);`;
                cardDiv.appendChild(rarityBadge);
                cardDiv.appendChild(cardImg);
                // 호버 효과
                cardDiv.onmouseenter = () => {
                    cardDiv.style.transform = 'translateY(-4px)';
                    cardImg.style.boxShadow = '0 8px 16px rgba(74, 158, 255, 0.4)';
                };
                cardDiv.onmouseleave = () => {
                    cardDiv.style.transform = 'translateY(0)';
                    cardImg.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                };
                // 롱프레스 타이머 (모바일용)
                let longPressTimer = null;
                let touchStartTime = 0;
                cardDiv.ontouchstart = (e) => {
                    touchStartTime = Date.now();
                    longPressTimer = window.setTimeout(() => {
                        showCardPreview(card);
                        longPressTimer = null;
                    }, 500);
                };
                cardDiv.ontouchend = (e) => {
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                };
                cardDiv.ontouchcancel = () => {
                    if (longPressTimer !== null) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                };
                // 클릭 이벤트
                cardDiv.onclick = (e) => {
                    if (e.shiftKey) {
                        e.preventDefault();
                        showCardPreview(card);
                        return;
                    }
                    // 일반 클릭도 카드 상세 정보 표시
                    showCardPreview(card);
                };
                // 우클릭: 카드 상세 정보
                cardDiv.oncontextmenu = (e) => {
                    e.preventDefault();
                    showCardPreview(card);
                };
                grid.appendChild(cardDiv);
            });
        });
    }
    // Campaign UI
    function renderDailyDungeon() {
        const store = useBattleStore.getState();
        store.ensureDailyDungeon();
        const { dailyDungeon, gold, shards } = useBattleStore.getState();
        const todayKey = dailyDungeon.dateKey || new Date().toISOString().slice(0, 10);
        let nextResetDisplay = '다음날 00:00 (KST)';
        try {
            const baseDate = new Date(`${todayKey}T00:00:00`);
            if (!Number.isNaN(baseDate.getTime())) {
                const nextReset = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
                const month = String(nextReset.getMonth() + 1).padStart(2, '0');
                const day = String(nextReset.getDate()).padStart(2, '0');
                nextResetDisplay = `${nextReset.getFullYear()}.${month}.${day} 00:00 (KST)`;
            }
        }
        catch (error) {
            // fallback keeps default string
        }
        const totalFloors = dailyDungeon.floors.length;
        const clearedFloors = dailyDungeon.floors.filter(f => f.cleared).length;
        const allCleared = totalFloors > 0 && clearedFloors === totalFloors;
        const floorsMarkup = dailyDungeon.floors.map((floor, index) => {
            const prevCleared = index === 0 ? true : dailyDungeon.floors[index - 1].cleared;
            const isLocked = !prevCleared;
            const statusText = floor.cleared ? '완료됨' : (isLocked ? '잠김' : '도전 가능');
            const buttonLabel = floor.cleared ? '완료' : (isLocked ? '잠김' : '도전');
            const rewardsMarkup = `
        <div class="stage-rewards">
          <span>💰 +${floor.reward.gold}</span>
          <span>💎 +${floor.reward.shards}</span>
        </div>
      `;
            const modifiers = floor.modifiers.map(mod => `
        <div class="modifier-item">
          <strong>${mod.label}</strong>
          <div>${mod.description}</div>
        </div>
      `).join('');
            return `
        <div class="stage-card ${floor.cleared ? 'cleared' : ''} ${isLocked ? 'locked' : ''}">
          <div class="stage-header">
            <div class="stage-number">Floor ${floor.id}</div>
            <div class="badge">${statusText}</div>
          </div>
          <div class="stage-name">${floor.name}</div>
          <div class="stage-description">${floor.description}</div>
          <div class="stage-power">⚔️ 권장 전투력: ${floor.recommendedPower}</div>
          <div class="modifier-list">${modifiers}</div>
          ${rewardsMarkup}
          <div class="stage-actions">
            <button id="daily-play-${floor.id}" ${floor.cleared || isLocked ? 'disabled' : ''}>${buttonLabel}</button>
          </div>
        </div>
      `;
        }).join('');
        dailyRoot.innerHTML = `
      <div class="header">
        <div>
          <h2>🎯 일일 던전</h2>
          <div class="summary">
            <span>📅 오늘: ${todayKey}</span>
            <span>🔥 진행도: ${clearedFloors} / ${totalFloors || 0}</span>
            <span>⏱️ ${nextResetDisplay}</span>
            ${allCleared ? '<span>✅ 오늘의 던전을 모두 완료했습니다!</span>' : ''}
          </div>
          <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="daily-menu-btn" style="background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 6px 14px; border-radius: 8px; cursor: pointer;">← 메인 메뉴</button>
          </div>
        </div>
        <div class="currency">
          <div class="currency-item">💰 골드: ${gold}</div>
          <div class="currency-item">💎 파편: ${shards}</div>
        </div>
      </div>
      <section class="chapter-section">
        <div class="chapter-header">
          <h3>오늘의 시련</h3>
          <div class="chapter-description">매일 갱신되는 세 가지 전투를 완료해 강화된 보상을 획득하세요.</div>
          <div class="chapter-progress">진행도 ${clearedFloors} / ${totalFloors || 0}</div>
        </div>
        <div class="stages-grid">
          ${floorsMarkup || '<div style="color: #ccc; font-size: 14px;">오늘의 던전 정보를 불러오는 중입니다...</div>'}
        </div>
      </section>
    `;
        const menuBtn = document.getElementById('daily-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                useBattleStore.getState().setGameScreen('menu');
            });
        }
        dailyDungeon.floors.forEach((floor, index) => {
            const prevCleared = index === 0 ? true : dailyDungeon.floors[index - 1].cleared;
            const button = document.getElementById(`daily-play-${floor.id}`);
            if (!button)
                return;
            if (floor.cleared || !prevCleared) {
                button.disabled = true;
                return;
            }
            button.onclick = () => {
                const storeState = useBattleStore.getState();
                if (storeState.pendingReward) {
                    toastManager.error('보상을 먼저 수령하세요!', 2000);
                    return;
                }
                storeState.enterDailyDungeonFloor(floor.id);
            };
        });
    }
    function renderCampaign() {
        const state = useBattleStore.getState();
        const { campaignStages, gold, shards } = state;
        campaignRoot.innerHTML = `
      <div class="header">
        <div>
          <h2>📖 캠페인</h2>
          <button id="campaign-menu-btn" style="background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 4px 12px; border-radius: 6px; cursor: pointer; margin-top: 8px;">← 메인 메뉴</button>
        </div>
        <div class="currency">
          <div class="currency-item">💰 골드: ${gold}</div>
          <div class="currency-item">💎 파편: ${shards}</div>
        </div>
      </div>
      <div style="text-align: center; padding: 12px; background: rgba(103, 126, 234, 0.1); border-radius: 8px; margin: 0 16px 16px 16px; font-size: 13px; color: #aaa;">
        💡 <strong>사용법:</strong> 스테이지 카드를 <strong>클릭/탭</strong>하면 전투 시작 | <strong>📖 스토리 버튼</strong>을 눌러 스토리 확인
      </div>
      <div id="campaign-chapters"></div>
    `;
        // 메인 메뉴 버튼
        const menuBtn = document.getElementById('campaign-menu-btn');
        menuBtn.onclick = () => {
            useBattleStore.getState().setGameScreen('menu');
        };
        // 챕터 단위 렌더링
        const chaptersRoot = document.getElementById('campaign-chapters');
        const chapterDefinitions = [
            { id: 1, title: '📕 Chapter 1: 입문과 수련', description: '벨몬트 가문 합류, 기본 실력 증명', start: 1, end: 10 },
            { id: 2, title: '📘 Chapter 2: 성장과 시험', description: '실력 향상, 가문 내부 시험, 속성별 마스터', start: 11, end: 20 },
            { id: 3, title: '📙 Chapter 3: 최종 시련', description: '최강 적수들과의 대결, 가문 입성 최종 시험', start: 21, end: 30 },
            { id: 4, title: '📗 Chapter 4: 결혼과 적응', description: '결혼식, 가문 적응, 정치적 갈등, 새로운 임무', start: 31, end: 40 },
            { id: 5, title: '📒 Chapter 5: 어둠의 전쟁', description: '어둠의 세력과의 전쟁, 가문의 미래, 최종 결전', start: 41, end: 50 }
        ];
        const stageIndexMap = new Map();
        campaignStages.forEach((stage, index) => {
            stageIndexMap.set(stage.id, index);
        });
        chapterDefinitions.forEach(chapter => {
            const chapterStages = campaignStages.filter(stage => stage.id >= chapter.start && stage.id <= chapter.end);
            if (chapterStages.length === 0)
                return;
            const clearedCount = chapterStages.filter(stage => stage.cleared).length;
            const chapterSection = document.createElement('section');
            chapterSection.className = 'chapter-section';
            chapterSection.innerHTML = `
        <div class="chapter-header">
          <h3>${chapter.title}</h3>
          <div class="chapter-description">${chapter.description}</div>
          <div class="chapter-progress">진행도 ${clearedCount} / ${chapterStages.length}</div>
        </div>
        <div class="stages-grid" id="chapter-grid-${chapter.id}"></div>
      `;
            chaptersRoot.appendChild(chapterSection);
            const stagesGrid = chapterSection.querySelector(`#chapter-grid-${chapter.id}`);
            const sortedStages = [...chapterStages].sort((a, b) => a.id - b.id);
            sortedStages.forEach(stage => {
                const stageIndex = stageIndexMap.get(stage.id) ?? 0;
                const isLocked = stageIndex > 0 && !campaignStages[stageIndex - 1].cleared;
                const stageCard = document.createElement('div');
                stageCard.className = `stage-card ${stage.cleared ? 'cleared' : ''} ${isLocked ? 'locked' : ''}`;
                const baseReward = stage.cleared ? stage.repeatReward : stage.firstReward;
                const boostedReward = getBoostedStageReward(baseReward, stage.id, stage.cleared);
                const rewardText = [];
                if (boostedReward.gold > 0)
                    rewardText.push(`💰 ${boostedReward.gold}`);
                if (boostedReward.shards > 0)
                    rewardText.push(`💎 ${boostedReward.shards}`);
                if (stage.story?.backgroundImage) {
                    stageCard.style.backgroundImage = `url('${stage.story.backgroundImage}')`;
                    stageCard.style.backgroundSize = 'cover';
                    stageCard.style.backgroundPosition = 'center';
                    stageCard.style.position = 'relative';
                }
                stageCard.innerHTML = `
          ${stage.story?.backgroundImage ? '<div style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); border-radius: inherit;"></div>' : ''}
          <div style="position: relative; z-index: 1;">
            <div class="stage-header">
              <div class="stage-number">Stage ${stage.id}</div>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${stage.cleared ? '<div style="color: #4CAF50; font-size: 20px;">✓</div>' : ''}
                ${isLocked ? '<div style="color: #f44336; font-size: 20px;">🔒</div>' : ''}
                ${stage.story && !isLocked ? `
                  <button class="story-btn" data-stage-id="${stage.id}" style="
                    background: rgba(103, 126, 234, 0.8);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  " onmouseover="this.style.background='rgba(103, 126, 234, 1)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(103, 126, 234, 0.8)'; this.style.transform='scale(1)'">
                    📖<span style="font-size: 12px;">스토리</span>
                  </button>
                ` : ''}
              </div>
            </div>
            <div class="stage-name">${stage.name}</div>
            <div class="stage-theme">속성: ${stage.theme}</div>
            <div class="stage-power">⚔️ 권장 전투력: ${stage.recommendedPower}</div>
            <div class="stage-rewards">보상: ${rewardText.join(', ')}</div>
          </div>
        `;
                if (!isLocked) {
                    const storyBtn = stageCard.querySelector('.story-btn');
                    if (storyBtn && stage.story) {
                        storyBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showStoryModal(stage);
                        });
                    }
                    stageCard.onclick = (e) => {
                        if (e.target.closest('.story-btn')) {
                            return;
                        }
                        if (victoryDefeatTimer !== null) {
                            window.clearTimeout(victoryDefeatTimer);
                            victoryDefeatTimer = null;
                        }
                        useBattleStore.getState().selectStage(stage.id);
                        gameInitialized = false;
                        if (stage.cutscene?.preBattle) {
                            showCutscene(stage.cutscene.preBattle, stage.story?.backgroundImage || '', () => {
                                useBattleStore.getState().setGameScreen('battle');
                            });
                        }
                        else {
                            useBattleStore.getState().setGameScreen('battle');
                        }
                    };
                }
                stagesGrid.appendChild(stageCard);
            });
        });
    }
    // 🆕 스토리 모달 표시 함수
    function showStoryModal(stage) {
        if (!stage.story)
            return;
        // 기존 모달 제거
        const existingModal = document.getElementById('story-modal');
        if (existingModal) {
            existingModal.remove();
        }
        const modal = document.createElement('div');
        modal.id = 'story-modal';
        modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: fadeIn 0.3s;
    `;
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      position: relative;
      animation: slideUp 0.3s;
    `;
        // 배경 이미지
        const backgroundDiv = document.createElement('div');
        backgroundDiv.style.cssText = `
      height: 200px;
      background-image: url('${stage.story.backgroundImage}');
      background-size: cover;
      background-position: center;
      border-radius: 12px 12px 0 0;
      position: relative;
    `;
        // 그라데이션 오버레이
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(26, 26, 46, 0.9) 100%);
      border-radius: 12px 12px 0 0;
    `;
        backgroundDiv.appendChild(overlay);
        // 컨텐츠
        const textContent = document.createElement('div');
        textContent.style.cssText = `
      padding: 24px;
      color: white;
    `;
        textContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <div style="font-size: 14px; color: #888;">Stage ${stage.id}</div>
        <div style="font-size: 24px; font-weight: bold; color: #fff;">${stage.name}</div>
      </div>
      <div style="font-size: 14px; color: #aaa; margin-bottom: 8px;">
        속성: ${stage.theme} | ⚔️ 권장 전투력: ${stage.recommendedPower}
      </div>
      <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 16px 0;"></div>
      <div style="font-size: 16px; line-height: 1.8; color: #ddd; white-space: pre-wrap;">
        ${stage.story.description}
      </div>
      <button id="story-modal-start" style="
        width: 100%;
        padding: 12px;
        margin-top: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        전투 시작
      </button>
      <button id="story-modal-close" style="
        width: 100%;
        padding: 12px;
        margin-top: 8px;
        background: rgba(255,255,255,0.1);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
      ">
        닫기
      </button>
    `;
        modalContent.appendChild(backgroundDiv);
        modalContent.appendChild(textContent);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // 버튼 이벤트
        const startBtn = document.getElementById('story-modal-start');
        startBtn.onclick = () => {
            modal.remove();
            // 기존 타이머 취소
            if (victoryDefeatTimer !== null) {
                window.clearTimeout(victoryDefeatTimer);
                victoryDefeatTimer = null;
            }
            useBattleStore.getState().selectStage(stage.id);
            gameInitialized = false;
            // 🆕 전투 전 컷신 확인
            if (stage.cutscene?.preBattle) {
                showCutscene(stage.cutscene.preBattle, stage.story?.backgroundImage || '', () => {
                    useBattleStore.getState().setGameScreen('battle');
                });
            }
            else {
                useBattleStore.getState().setGameScreen('battle');
            }
        };
        const closeBtn = document.getElementById('story-modal-close');
        closeBtn.onclick = () => modal.remove();
        // 배경 클릭으로 닫기
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    // Reward UI
    function renderReward() {
        const state = useBattleStore.getState();
        const reward = state.pendingReward;
        if (!reward) {
            rewardRoot.classList.remove('active');
            return;
        }
        rewardRoot.classList.add('active');
        const { stage, subtitle } = resolveStageContext(state);
        const title = stage ? `스테이지 ${stage.id} 클리어` : state.battleContext.type === 'daily' ? '일일 던전 보상' : '전투 보상';
        const description = stage?.story?.description ?? (state.battleContext.type === 'pvp'
            ? '정정당당한 승부 끝에 획득한 전리품입니다.'
            : '가문을 위해 수집한 자원을 확인하세요.');
        const itemsHtml = `
    ${reward.gold > 0 ? `
      <div class="reward-item">
        <div class="reward-icon gold"></div>
        <div class="reward-amount">+${reward.gold}</div>
        <div class="reward-label">골드</div>
      </div>
    ` : ''}
    ${reward.shards > 0 ? `
      <div class="reward-item">
        <div class="reward-icon shard"></div>
        <div class="reward-amount">+${reward.shards}</div>
        <div class="reward-label">마나 파편</div>
      </div>
    ` : ''}
  `;
        const hasItems = reward.gold > 0 || reward.shards > 0;
        rewardRoot.innerHTML = `
      <div class="reward-background"></div>
      <div class="reward-panel">
        <div class="reward-header">
          <span class="reward-badge">${escapeHtml(title)}</span>
          <h2 class="reward-title">전리품 회수</h2>
          <p class="reward-subtitle">${escapeHtml(description)}</p>
        </div>
        <div class="reward-body ${hasItems ? '' : 'reward-body--empty'}">
          ${hasItems ? `<div class="reward-items">${itemsHtml}</div>` : `
            <div class="reward-empty">
              <div class="reward-empty-icon">🗃️</div>
              <div class="reward-empty-text">획득한 재화가 없습니다.</div>
            </div>
          `}
        </div>
        <button id="claim-reward-btn" class="reward-btn">다음으로</button>
      </div>
    `;
        // 보상 받기 버튼
        const claimBtn = document.getElementById('claim-reward-btn');
        claimBtn.onclick = () => {
            const store = useBattleStore.getState();
            const target = store.postBattleScreen;
            store.claimReward();
            if (target === 'campaign') {
                const currentStageId = store.currentStage;
                if (currentStageId) {
                    const stage = store.campaignStages.find(s => s.id === currentStageId);
                    if (stage?.cutscene?.postVictory) {
                        showCutscene(stage.cutscene.postVictory, stage.story?.backgroundImage || '', () => {
                            useBattleStore.getState().navigateAfterReward();
                        });
                        return;
                    }
                }
            }
            store.navigateAfterReward();
        };
    }
    // 🎓 Tutorial UI
    let currentTutorialStep = 0;
    let tutorialSteps = [];
    function showTutorial(steps, onComplete) {
        currentTutorialStep = 0;
        tutorialSteps = steps;
        tutorialOverlay.classList.add('active');
        renderTutorial();
        // 튜토리얼 완료 콜백 저장
        tutorialOverlay.onComplete = onComplete;
    }
    function renderTutorial() {
        if (currentTutorialStep >= tutorialSteps.length) {
            // 튜토리얼 완료
            tutorialOverlay.classList.remove('active');
            const onComplete = tutorialOverlay.onComplete;
            if (onComplete) {
                onComplete();
                tutorialOverlay.onComplete = null;
            }
            return;
        }
        const step = tutorialSteps[currentTutorialStep];
        const totalSteps = tutorialSteps.length;
        tutorialOverlay.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-icon">${step.icon}</div>
        <div class="tutorial-title">${step.title}</div>
        <div class="tutorial-text">${step.text}</div>
        ${step.highlight ? `
          <div class="tutorial-highlight">${step.highlight}</div>
        ` : ''}
        <div class="tutorial-buttons">
          ${currentTutorialStep < totalSteps - 1 ? `
            <button class="tutorial-btn" id="tutorial-next">다음 ▶</button>
          ` : `
            <button class="tutorial-btn" id="tutorial-complete">완료 ✓</button>
          `}
          ${currentTutorialStep > 0 ? `
            <button class="tutorial-btn secondary" id="tutorial-skip">건너뛰기</button>
          ` : ''}
        </div>
      </div>
    `;
        // 이벤트 리스너
        const nextBtn = document.getElementById('tutorial-next');
        const completeBtn = document.getElementById('tutorial-complete');
        const skipBtn = document.getElementById('tutorial-skip');
        const nextTutorial = () => {
            currentTutorialStep++;
            renderTutorial();
        };
        const skipTutorial = () => {
            currentTutorialStep = tutorialSteps.length;
            renderTutorial();
        };
        if (nextBtn) {
            nextBtn.onclick = nextTutorial;
        }
        if (completeBtn) {
            completeBtn.onclick = skipTutorial;
        }
        if (skipBtn) {
            skipBtn.onclick = skipTutorial;
        }
        // 키보드 단축키
        const keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (currentTutorialStep < totalSteps - 1) {
                    nextTutorial();
                }
                else {
                    skipTutorial();
                }
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                skipTutorial();
            }
        };
        document.removeEventListener('keydown', keyHandler);
        document.addEventListener('keydown', keyHandler);
    }
    // 🆕 Cutscene UI
    const cutsceneRoot = document.getElementById('cutscene');
    const screenTransitionOverlay = document.getElementById('screen-transition-overlay');
    let currentDialogueIndex = 0;
    let currentDialogueLines = [];
    let cutsceneCallback = null;
    function showCutscene(dialogues, backgroundImage, onComplete) {
        currentDialogueIndex = 0;
        currentDialogueLines = dialogues;
        cutsceneCallback = onComplete;
        useBattleStore.getState().setGameScreen('cutscene');
        renderCutscene(backgroundImage);
    }
    function renderCutscene(backgroundImage) {
        if (currentDialogueIndex >= currentDialogueLines.length) {
            // 대화 종료
            cutsceneRoot.classList.remove('active');
            if (cutsceneCallback) {
                cutsceneCallback();
                cutsceneCallback = null;
            }
            return;
        }
        const dialogue = currentDialogueLines[currentDialogueIndex];
        const totalLines = currentDialogueLines.length;
        cutsceneRoot.innerHTML = `
      <div class="cutscene-background" style="background-image: url('${backgroundImage}');"></div>
      <div class="cutscene-content">
        <div class="cutscene-top">
          ${dialogue.characterImage ? `
            <img 
              class="character-portrait visible ${dialogue.emotion ? `emotion-${dialogue.emotion}` : ''}" 
              src="${dialogue.characterImage}.png" 
              alt="${dialogue.speaker}"
            >
          ` : ''}
        </div>
        <div class="dialogue-box">
          <div class="dialogue-speaker">${dialogue.speaker}</div>
          <div class="dialogue-text">${dialogue.text}</div>
          <div class="dialogue-controls">
            <div class="dialogue-progress">${currentDialogueIndex + 1} / ${totalLines}</div>
            <div class="dialogue-buttons">
              ${currentDialogueIndex < totalLines - 1 ? `
                <button class="dialogue-btn" id="dialogue-next">다음 ▶</button>
              ` : `
                <button class="dialogue-btn" id="dialogue-complete">완료 ✓</button>
              `}
              ${currentDialogueIndex > 0 ? `
                <button class="dialogue-btn secondary" id="dialogue-skip">건너뛰기</button>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="skip-hint">Space 또는 Enter: 다음 | ESC: 건너뛰기</div>
      </div>
    `;
        // 이벤트 리스너
        const nextBtn = document.getElementById('dialogue-next');
        const completeBtn = document.getElementById('dialogue-complete');
        const skipBtn = document.getElementById('dialogue-skip');
        const nextDialogue = () => {
            currentDialogueIndex++;
            renderCutscene(backgroundImage);
        };
        const skipCutscene = () => {
            currentDialogueIndex = currentDialogueLines.length;
            renderCutscene(backgroundImage);
        };
        if (nextBtn) {
            nextBtn.onclick = nextDialogue;
        }
        if (completeBtn) {
            completeBtn.onclick = skipCutscene;
        }
        if (skipBtn) {
            skipBtn.onclick = skipCutscene;
        }
        // 키보드 단축키
        const keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (currentDialogueIndex < totalLines - 1) {
                    nextDialogue();
                }
                else {
                    skipCutscene();
                }
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                skipCutscene();
            }
        };
        document.removeEventListener('keydown', keyHandler);
        document.addEventListener('keydown', keyHandler);
    }
    // Victory/Defeat Screen
    function resolveStageContext(state) {
        const context = state.battleContext;
        let stageId = null;
        if (context.type === 'campaign') {
            stageId = context.campaignStageId ?? state.currentStage ?? null;
        }
        else if (context.type === 'daily') {
            stageId = context.campaignStageId ?? state.currentStage ?? null;
        }
        const stage = stageId ? state.campaignStages.find(s => s.id === stageId) ?? null : null;
        let subtitle = '전투 완료';
        if (stage) {
            subtitle = `스테이지 ${stage.id}. ${stage.name}`;
        }
        else if (context.type === 'daily') {
            subtitle = '일일 던전 클리어';
        }
        else if (context.type === 'pvp') {
            subtitle = 'PvP 랭크 매치';
        }
        return { stage, subtitle };
    }
    function buildVictoryDialogue(state) {
        const { stage, subtitle } = resolveStageContext(state);
        const authState = useAuthStore.getState();
        const portrait = stage?.characterImage ?? resolveDeckPortrait(state.playerDeck, DEFAULT_PLAYER_PORTRAIT);
        const speaker = getDisplayNameFromPortrait(portrait, authState.profileNickname || '세라피나');
        const stageLines = stage ? STAGE_VICTORY_LINES[stage.id] : undefined;
        let message;
        if (stageLines && stageLines.length > 0) {
            message = pickRandom(stageLines, stageLines[0]);
        }
        else if (stage) {
            message = `『${stage.name}』 전장은 이제 우리 뜻대로 움직이겠네요.`;
        }
        else {
            message = pickRandom(GENERIC_VICTORY_LINES, GENERIC_VICTORY_LINES[0]);
        }
        if (state.battleContext.type === 'pvp') {
            message = '승부는 끝났어요. 정정당당한 대전을 이어가 봐요.';
        }
        return {
            portrait,
            speaker,
            message,
            subtitle,
            accent: '#4caf90',
        };
    }
    function buildDefeatDialogue(state) {
        const { stage, subtitle } = resolveStageContext(state);
        let portrait = stage?.enemyImage ?? resolveDeckPortrait(state.enemyDeck, DEFAULT_ENEMY_PORTRAIT);
        let speaker = getDisplayNameFromPortrait(portrait, state.pvpMatch?.opponentName || '상대');
        const stageLines = stage ? STAGE_DEFEAT_TAUNTS[stage.id] : undefined;
        let message;
        if (stageLines && stageLines.length > 0) {
            message = pickRandom(stageLines, stageLines[0]);
        }
        else if (stage) {
            message = `${stage.name} 전장은 내 것이야. 다시 도전하고 싶다면 더 단단해져서 와.`;
        }
        else {
            message = pickRandom(GENERIC_DEFEAT_TAUNTS, GENERIC_DEFEAT_TAUNTS[0]);
        }
        if (state.battleContext.type === 'pvp') {
            const opponent = state.pvpMatch?.opponentName?.trim();
            portrait = resolveDeckPortrait(state.pvpMatch?.opponentDeckCards ?? [], DEFAULT_ENEMY_PORTRAIT);
            speaker = opponent && opponent.length > 0 ? opponent : '상대';
            message = '다음엔 집중력을 잃지 마. 난 언제든 다시 상대해 줄 수 있어.';
        }
        return {
            portrait,
            speaker,
            message,
            subtitle,
            accent: '#f15b5b',
        };
    }
    function showVictoryScreen() {
        const state = useBattleStore.getState();
        console.log(`[ShowVictoryScreen] 🔍 Called - gameOver: ${state.gameOver}, playerHp: ${state.playerHp}, enemyHp: ${state.enemyHp}`);
        const randomVariation = Math.floor(Math.random() * 3) + 1;
        const backgroundPath = getSpecialBackground('victory', randomVariation);
        const hasReward = state.pendingReward !== null;
        const dialogue = buildVictoryDialogue(state);
        const isPvpBattle = state.battleContext.type === 'pvp';
        victoryScreen.innerHTML = `
      <div class="result-background" style="background-image: url('${backgroundPath}');"></div>
      <div class="result-overlay">
        <div class="result-card result-card--victory" style="--result-accent: ${dialogue.accent};">
          <div class="result-portrait" style="background-image: url('${dialogue.portrait}');"></div>
          <div class="result-content">
            <div class="result-title">🎉 승리!</div>
            <div class="result-subtitle">${escapeHtml(dialogue.subtitle)}</div>
            <div class="result-speaker">${escapeHtml(dialogue.speaker)}</div>
            <div class="result-message">"${escapeHtml(dialogue.message)}"</div>
            <button class="result-btn" id="victory-continue-btn">${hasReward ? '보상 받기' : isPvpBattle ? 'PvP 로비로' : '메인 메뉴로'}</button>
          </div>
        </div>
      </div>
    `;
        victoryScreen.classList.add('active');
        const continueBtn = document.getElementById('victory-continue-btn');
        continueBtn.onclick = () => {
            victoryScreen.classList.remove('active');
            if (victoryDefeatTimer !== null) {
                window.clearTimeout(victoryDefeatTimer);
                victoryDefeatTimer = null;
            }
            const storeState = useBattleStore.getState();
            if (hasReward) {
                storeState.setGameScreen('reward');
            }
            else if (isPvpBattle) {
                useBattleStore.setState({
                    battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
                });
                storeState.setGameScreen('pvp');
            }
            else {
                storeState.setGameScreen('menu');
            }
        };
    }
    function showDefeatScreen() {
        const state = useBattleStore.getState();
        console.log(`[ShowDefeatScreen] 🔍 Called - gameOver: ${state.gameOver}, playerHp: ${state.playerHp}, enemyHp: ${state.enemyHp}`);
        const randomVariation = Math.floor(Math.random() * 3) + 1;
        const backgroundPath = getSpecialBackground('defeat', randomVariation);
        const dialogue = buildDefeatDialogue(state);
        defeatScreen.innerHTML = `
      <div class="result-background" style="background-image: url('${backgroundPath}');"></div>
      <div class="result-overlay">
        <div class="result-card result-card--defeat" style="--result-accent: ${dialogue.accent};">
          <div class="result-portrait" style="background-image: url('${dialogue.portrait}');"></div>
          <div class="result-content">
            <div class="result-title">💀 패배</div>
            <div class="result-subtitle">${escapeHtml(dialogue.subtitle)}</div>
            <div class="result-speaker">${escapeHtml(dialogue.speaker)}</div>
            <div class="result-message">"${escapeHtml(dialogue.message)}"</div>
            <button class="result-btn" id="defeat-retry-btn">다시 시도</button>
          </div>
        </div>
      </div>
    `;
        defeatScreen.classList.add('active');
        const retryBtn = document.getElementById('defeat-retry-btn');
        retryBtn.onclick = () => {
            defeatScreen.classList.remove('active');
            if (victoryDefeatTimer !== null) {
                window.clearTimeout(victoryDefeatTimer);
                victoryDefeatTimer = null;
            }
            gameInitialized = false;
            useBattleStore.getState().handleBattleDefeatNavigation();
        };
    }
    // Shop UI
    let gachaResultCard = null;
    let gachaResultModal = null;
    function renderShop() {
        const state = useBattleStore.getState();
        const { gold, shards } = state;
        console.log('[UI][Shop] Rendering with state', {
            gold,
            shards,
            collection: state.collection.length,
            deck: state.playerDeck.length,
        });
        const cardPacks = state.getCardPacks();
        const packVisuals = {
            pack_normal: {
                portrait: 'characters/seraphine_winters.png',
                accent: 'rgba(148, 163, 184, 0.45)',
                border: '#9e9e9e',
                gradient: 'linear-gradient(135deg, rgba(26, 38, 60, 0.92) 0%, rgba(18, 28, 48, 0.96) 100%)'
            },
            pack_rare: {
                portrait: 'characters/elena_drake.png',
                accent: 'rgba(88, 160, 255, 0.5)',
                border: '#2196f3',
                gradient: 'linear-gradient(135deg, rgba(26, 42, 78, 0.92) 0%, rgba(20, 32, 62, 0.96) 100%)'
            },
            pack_epic: {
                portrait: 'characters/lucian_rosegarden.png',
                accent: 'rgba(180, 120, 255, 0.5)',
                border: '#9c27b0',
                gradient: 'linear-gradient(135deg, rgba(32, 26, 68, 0.92) 0%, rgba(24, 20, 54, 0.96) 100%)'
            },
            pack_legendary: {
                portrait: 'characters/seraphina_belmont.png',
                accent: 'rgba(255, 196, 120, 0.55)',
                border: '#ff9800',
                gradient: 'linear-gradient(135deg, rgba(54, 32, 12, 0.9) 0%, rgba(32, 20, 8, 0.94) 100%)'
            },
            pack_premium: {
                portrait: 'characters/ariana_drake.png',
                accent: 'rgba(255, 140, 200, 0.45)',
                border: '#f472b6',
                gradient: 'linear-gradient(135deg, rgba(42, 24, 60, 0.92) 0%, rgba(28, 18, 46, 0.96) 100%)'
            }
        };
        shopRoot.innerHTML = `
      <div class="header">
        <div>
          <h2>🏪 상점</h2>
          <button id="shop-menu-btn" style="background: #2a3f5f; color: #fff; border: 1px solid #3a4f75; padding: 4px 12px; border-radius: 6px; cursor: pointer; margin-top: 8px;">← 메인 메뉴</button>
        </div>
        <div class="currency">
          <div class="currency-item">💰 골드: ${gold}</div>
          <div class="currency-item">💎 파편: ${shards}</div>
        </div>
      </div>
      <div class="shop-packs" id="shop-packs"></div>
      <!-- 기존 결과 모달 (백업용) -->
      <div id="gacha-result-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
        <div style="background: #1a2332; border: 2px solid #4a9eff; border-radius: 12px; padding: 30px; max-width: 400px; text-align: center;">
          <h2 style="color: #fff; margin-bottom: 20px;">카드 획득!</h2>
          <div id="gacha-result-card" style="margin-bottom: 20px;"></div>
          <button id="gacha-result-close-old" style="background: #4a9eff; color: #fff; border: none; padding: 10px 30px; border-radius: 6px; cursor: pointer; font-size: 16px;">확인</button>
        </div>
      </div>
    `;
        gachaResultModal = document.getElementById('gacha-result-modal');
        // gacha-animation-container는 HTML에 직접 있으므로 초기화 불필요
        // 메인 메뉴 버튼
        const menuBtn = document.getElementById('shop-menu-btn');
        menuBtn.onclick = () => {
            useBattleStore.getState().setGameScreen('menu');
        };
        // 가챠 결과 모달 닫기 (새 버전) - 이벤트 리스너는 애니메이션 후에 설정
        // closeBtn은 playGachaAnimation에서 설정
        // 가챠 결과 모달 닫기 (기존 버전)
        const closeBtnOld = document.getElementById('gacha-result-close-old');
        if (closeBtnOld) {
            closeBtnOld.onclick = () => {
                if (gachaResultModal) {
                    gachaResultModal.style.display = 'none';
                }
                renderShop();
            };
        }
        // 카드팩 렌더링
        const packsGrid = document.getElementById('shop-packs');
        cardPacks.forEach(pack => {
            const packDiv = document.createElement('div');
            packDiv.className = 'shop-pack';
            packDiv.dataset.packId = pack.id;
            packDiv.dataset.packType = pack.type;
            const visuals = packVisuals[pack.id] ??
                (pack.type === 'legendary'
                    ? packVisuals.pack_legendary
                    : pack.type === 'epic'
                        ? packVisuals.pack_epic
                        : pack.type === 'rare'
                            ? packVisuals.pack_rare
                            : packVisuals.pack_normal);
            packDiv.style.background = visuals.gradient;
            packDiv.style.borderColor = visuals.border;
            packDiv.style.setProperty('--pack-portrait', `url('${visuals.portrait}')`);
            packDiv.style.setProperty('--pack-accent', visuals.accent);
            const priceIcon = pack.priceType === 'gold' ? '💰' : '💎';
            const currentCurrency = pack.priceType === 'gold' ? gold : shards;
            const canAfford = currentCurrency >= pack.price;
            const priceClass = ['pack-price'];
            if (!canAfford) {
                priceClass.push('disabled');
            }
            packDiv.innerHTML = `
        <div class="pack-content">
          <div class="pack-header">
            <h3 class="pack-name">${pack.name}</h3>
            <p class="pack-desc">${pack.description}</p>
          </div>
          <div class="pack-rates">
            <div class="pack-rates-title">등급 확률</div>
            <div class="pack-rates-grid">
              <span>일반</span><span>${pack.rates.Normal}%</span>
              <span>레어</span><span>${pack.rates.Rare}%</span>
              <span>에픽</span><span>${pack.rates.Epic}%</span>
              <span>전설</span><span>${pack.rates.Legendary}%</span>
            </div>
          </div>
          <div class="${priceClass.join(' ')}">${priceIcon} ${pack.price}</div>
          <button class="buy-pack-btn" data-pack-type="${pack.type}" ${!canAfford ? 'disabled' : ''}>
            🛒 구매
          </button>
        </div>
      `;
            const buyBtn = packDiv.querySelector('.buy-pack-btn');
            buyBtn.onclick = async () => {
                if (!canAfford) {
                    toastManager.error(`${pack.priceType === 'gold' ? '골드' : '파편'}가 부족합니다!`, 2000);
                    audioManager.playSFX('button_click', 0.3);
                    return;
                }
                audioManager.playSFX('button_click', 0.7);
                const result = state.buyCardPack(pack.type);
                if (result) {
                    gachaResultCard = result;
                    // 가챠 애니메이션 시작
                    await playGachaAnimation(result);
                    toastManager.success(`${pack.name}을(를) 구매했습니다!`, 2000);
                }
                else {
                    toastManager.error('구매에 실패했습니다!', 2000);
                }
            };
            packsGrid.appendChild(packDiv);
        });
    }
    async function playGachaAnimation(card) {
        console.log('[Gacha] Starting animation for card:', card.name);
        // 요소 찾기
        const container = document.getElementById('gacha-animation-container');
        const cardWrapper = document.getElementById('gacha-card-wrapper');
        const cardBackImg = document.getElementById('gacha-card-back-img');
        const cardFrontImg = document.getElementById('gacha-card-front-img');
        const resultInfo = document.getElementById('gacha-result-info');
        const resultName = document.getElementById('gacha-result-name');
        const resultRarity = document.getElementById('gacha-result-rarity');
        const closeBtn = document.getElementById('gacha-result-close');
        if (!container || !cardWrapper || !cardBackImg || !cardFrontImg || !resultInfo || !resultName || !resultRarity || !closeBtn) {
            console.error('[Gacha] Elements not found!');
            showGachaResult(card);
            return;
        }
        const rarityColors = {
            Normal: '#9e9e9e',
            Rare: '#2196f3',
            Epic: '#9c27b0',
            Legendary: '#ff9800'
        };
        const rarityNames = {
            Normal: '일반',
            Rare: '레어',
            Epic: '에픽',
            Legendary: '전설'
        };
        // 초기 상태 설정
        container.style.display = 'flex';
        cardBackImg.style.display = 'block';
        cardFrontImg.style.display = 'none';
        resultInfo.style.display = 'none';
        cardWrapper.style.transform = 'translate(0, 0) rotate(0deg)';
        cardWrapper.style.transition = 'none';
        // 이미지 로드
        const cardBackPath = getCardBackImage();
        const cardImagePath = getLoadedCardImage(card);
        // Use relative paths to work under non-root base paths
        cardBackImg.src = cardBackPath ? cardBackPath : 'cards/card_back.webp';
        cardFrontImg.src = cardImagePath ? cardImagePath : '';
        // 이미지 로드 대기
        await new Promise((resolve) => {
            let loaded = 0;
            const check = () => {
                loaded++;
                if (loaded >= 2)
                    resolve();
            };
            if (cardBackImg.complete)
                check();
            else
                cardBackImg.onload = check;
            if (cardFrontImg.complete)
                check();
            else
                cardFrontImg.onload = check;
            setTimeout(() => resolve(), 3000); // 타임아웃
        });
        // 1단계: 카드 뒷면 표시
        await new Promise(resolve => setTimeout(resolve, 300));
        // 2단계: 흔들림 애니메이션
        const shakeDuration = 2000;
        const shakeSteps = 30;
        for (let i = 0; i < shakeSteps; i++) {
            const progress = i / shakeSteps;
            const intensity = progress * progress * 25;
            const angle = Math.random() * 360;
            const x = Math.cos(angle * Math.PI / 180) * intensity;
            const y = Math.sin(angle * Math.PI / 180) * intensity;
            const rotation = (Math.random() - 0.5) * intensity * 0.6;
            cardWrapper.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            await new Promise(resolve => setTimeout(resolve, shakeDuration / shakeSteps));
        }
        // 흔들림 정지
        cardWrapper.style.transition = 'transform 0.3s ease-out';
        cardWrapper.style.transform = 'translate(0, 0) rotate(0deg)';
        await new Promise(resolve => setTimeout(resolve, 300));
        // 3단계: 카드 전환
        cardBackImg.style.display = 'none';
        cardFrontImg.style.display = 'block';
        audioManager.playSFX('button_click', 0.8);
        await new Promise(resolve => setTimeout(resolve, 300));
        // 4단계: 결과 정보 표시
        resultName.textContent = card.name;
        resultName.style.color = rarityColors[card.rarity] || '#fff';
        resultRarity.textContent = rarityNames[card.rarity] || card.rarity;
        resultRarity.style.color = rarityColors[card.rarity] || '#fff';
        resultInfo.style.display = 'block';
        // 레어도 효과음
        if (card.rarity === 'Legendary') {
            audioManager.playSFX('button_click', 1.0);
        }
        else if (card.rarity === 'Epic') {
            audioManager.playSFX('button_click', 0.9);
        }
        // 닫기 버튼 이벤트
        const handleClose = () => {
            container.style.display = 'none';
            setTimeout(() => renderShop(), 100);
        };
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            handleClose();
        };
        container.onclick = (e) => {
            if (e.target === container)
                handleClose();
        };
        console.log('[Gacha] Animation completed');
    }
    function showGachaResult(card) {
        // 기존 함수는 백업용으로 유지
        if (!gachaResultModal)
            return;
        const rarityColors = {
            Normal: '#9e9e9e',
            Rare: '#2196f3',
            Epic: '#9c27b0',
            Legendary: '#ff9800'
        };
        const cardDisplay = document.getElementById('gacha-result-card');
        cardDisplay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a2332 0%, #2a3f5f 100%);
        border: 3px solid ${rarityColors[card.rarity] || '#9e9e9e'};
        border-radius: 12px;
        padding: 20px;
        margin: 0 auto;
        max-width: 300px;
      ">
        <div style="color: ${rarityColors[card.rarity] || '#9e9e9e'}; font-size: 14px; margin-bottom: 10px; font-weight: bold;">
          ${card.rarity}
        </div>
        <div style="color: #fff; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
          ${card.name}
        </div>
        <div style="color: #aaa; font-size: 14px; margin-bottom: 10px;">
          ${card.type}
        </div>
        <div style="color: #fff; font-size: 12px; line-height: 1.6;">
          ${card.effectText || '효과 없음'}
        </div>
      </div>
    `;
        gachaResultModal.style.display = 'flex';
    }
    const INTRO_SLIDES = [
        {
            text: `고귀한 벨몬트 가문의 딸, 세라피나.<br>그녀는 모든 것을 가진 완벽한 인생을 살았지만, 끝없는 질투와 오만으로 인해 모든 것을 잃고 떠났다.`,
            background: 'intro_01.webp',
            cards: [
                { asset: 'cards/Seraphina_Attack_Rare.webp', x: 41, y: 47, rotation: -12, scale: 1.05, delay: 60, glow: 'violet' },
                { asset: 'cards/Seraphina_Special_Epic.webp', x: 57, y: 43, rotation: 6, scale: 1.08, delay: 180, glow: 'amber' },
                { asset: 'cards/Seraphina_Defense_Rare.webp', x: 50, y: 62, rotation: 2, scale: 0.98, delay: 300, glow: 'cyan' },
            ],
        },
        {
            text: `그리고... 다시 한 번.<br>전생의 기억을 모두 가지고, 세라피나는 과거로 돌아왔다.`,
            background: 'intro_02.webp',
            cards: [
                { asset: 'cards/Marcus_Special_Epic.webp', x: 38, y: 46, rotation: -10, scale: 1.02, delay: 40, glow: 'violet' },
                { asset: 'cards/Kai_Attack_Epic.webp', x: 54, y: 42, rotation: 8, scale: 1.04, delay: 160, glow: 'cyan' },
                { asset: 'cards/Leon_Special_Rare.webp', x: 63, y: 58, rotation: 18, scale: 0.96, delay: 260, glow: 'amber' },
            ],
        },
        {
            text: `이번엔 다르게.<br>오만했던 악역영애가 아닌, 진정으로 가문을 지킬 수 있는 존재로.`,
            background: 'intro_03.webp',
            cards: [
                { asset: 'cards/Ariana_Special_Epic.webp', x: 44, y: 44, rotation: -15, scale: 1.05, delay: 60, glow: 'amber' },
                { asset: 'cards/Iris_Heal_Epic.webp', x: 56, y: 42, rotation: 7, scale: 1.03, delay: 210, glow: 'violet' },
                { asset: 'cards/Garen_Defense_Rare.webp', x: 52, y: 60, rotation: 4, scale: 0.97, delay: 320, glow: 'cyan' },
            ],
        },
        {
            text: `드레이크 가문과의 결혼을 앞두고,<br>세라피나는 카드 배틀로 가문의 명예를 증명해야 한다.`,
            background: 'intro_04.webp',
            cards: [
                { asset: 'cards/Lucian_Special_Epic.webp', x: 40, y: 47, rotation: -10, scale: 1.06, delay: 40, glow: 'cyan' },
                { asset: 'cards/Seraphina_Attack_Rare.webp', x: 58, y: 44, rotation: 9, scale: 1.04, delay: 180, glow: 'violet' },
                { asset: 'cards/Darius_Attack_Epic.webp', x: 51, y: 61, rotation: 6, scale: 0.98, delay: 280, glow: 'amber' },
            ],
        },
    ];
    const INTRO_TYPE_BY_CODE = {
        ATT: 'Attack',
        DEF: 'Defense',
        HEA: 'Heal',
        SPE: 'Special',
    };
    const INTRO_RARITY_BY_CODE = {
        NO: 'Normal',
        RA: 'Rare',
        EP: 'Epic',
        LE: 'Legendary',
    };
    const INTRO_FINALE_CARD_INTERVAL = 60;
    const INTRO_FINALE_STACK_BUFFER = 720;
    const INTRO_FINALE_FLASH_HOLD = 760;
    let introSlidesData = [];
    let currentIntroPage = 0;
    let introTimeouts = [];
    let introFinalePlaying = false;
    let introTitleShowing = false;
    function clearIntroTimers() {
        introTimeouts.forEach((timer) => clearTimeout(timer));
        introTimeouts = [];
    }
    function scheduleIntroTimer(callback, delay) {
        const timer = window.setTimeout(() => {
            introTimeouts = introTimeouts.filter((t) => t !== timer);
            callback();
        }, delay);
        introTimeouts.push(timer);
        return timer;
    }
    function renderIntroCards(slide) {
        const layer = document.getElementById('intro-card-layer');
        if (!layer || !slide)
            return;
        layer.innerHTML = '';
        slide.cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'intro-card';
            if (card.glow) {
                cardEl.classList.add(`glow-${card.glow}`);
            }
            cardEl.style.left = `${card.x}%`;
            cardEl.style.top = `${card.y}%`;
            cardEl.style.backgroundImage = `url('${card.asset}')`;
            cardEl.style.setProperty('--card-rotation', `${card.rotation ?? 0}deg`);
            cardEl.style.setProperty('--card-scale', `${card.scale ?? 1}`);
            const delay = card.delay ?? index * 120;
            cardEl.style.setProperty('--card-delay', `${delay}ms`);
            cardEl.style.setProperty('--float-delay', `${(delay / 1000 + 0.4).toFixed(2)}s`);
            layer.appendChild(cardEl);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => cardEl.classList.add('show'));
            });
        });
    }
    function resolveCardAssetFromId(cardId) {
        const parts = cardId.split('_');
        if (parts.length < 3) {
            return null;
        }
        const type = INTRO_TYPE_BY_CODE[parts[0]];
        const rarity = INTRO_RARITY_BY_CODE[parts[2]];
        if (!type || !rarity) {
            return null;
        }
        const partial = {
            id: cardId,
            type,
            rarity,
        };
        return getCardImagePath(partial) || getCardImagePathFallback(partial);
    }
    function shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    function updateMenuUserInfo() {
        if (!menuUserInfoRoot || !menuUserNicknameEl || !menuUserStageEl || !menuUserRankEl) {
            return;
        }
        const authState = useAuthStore.getState();
        const battleState = useBattleStore.getState();
        const nickname = authState.profileNickname?.trim() ? authState.profileNickname : '소환사';
        menuUserNicknameEl.textContent = nickname;
        const stageListCount = battleState.campaignStages?.length ?? 0;
        const totalStages = stageListCount > 0
            ? Math.max(stageListCount, STORY_TOTAL_STAGE_TARGET)
            : STORY_TOTAL_STAGE_TARGET;
        const clearedByFlag = stageListCount > 0
            ? battleState.campaignStages.filter(stage => stage.cleared).length
            : 0;
        const clearedByIds = battleState.completedStageIds?.length ?? 0;
        const clearedStages = stageListCount > 0 ? Math.max(clearedByFlag, clearedByIds) : clearedByIds;
        if (totalStages > 0) {
            menuUserStageEl.textContent = `스토리 진행 · ${Math.min(clearedStages, totalStages)}/${totalStages} 단계`;
        }
        else {
            menuUserStageEl.textContent = '스토리 진행 · 준비 중';
        }
        const wins = battleState.pvpWins ?? 0;
        const rankInfo = getPvpRankInfo(wins);
        const remaining = rankInfo.nextMinWins !== null ? Math.max(0, rankInfo.nextMinWins - wins) : null;
        let rankText = `${rankInfo.name} · ${wins}승`;
        rankText += remaining !== null ? ` · 다음까지 ${remaining}승` : ' · 최고 등급';
        menuUserRankEl.textContent = rankText;
        menuUserRankEl.style.color = rankInfo.color;
    }
    updateMenuUserInfo();
    useBattleStore.subscribe(() => {
        updateMenuUserInfo();
    });
    useAuthStore.subscribe(() => {
        updateMenuUserInfo();
    });
    function getAssetPathForCard(card) {
        const primary = getCardImagePath(card);
        if (primary) {
            return primary;
        }
        const fallback = getCardImagePathFallback(card);
        return fallback || null;
    }
    function buildFinaleCardAssets() {
        if (!allCards || allCards.length === 0) {
            return STARTER_COLLECTION_CARD_IDS_SAFE
                .map(resolveCardAssetFromId)
                .filter((src) => !!src);
        }
        const rarityBuckets = {
            Legendary: [],
            Epic: [],
            Rare: [],
            Normal: [],
        };
        allCards.forEach(card => {
            const asset = getAssetPathForCard(card);
            if (!asset)
                return;
            rarityBuckets[card.rarity].push(asset);
        });
        const selected = [];
        const used = new Set();
        const takeFromBucket = (rarity, count) => {
            const bucket = rarityBuckets[rarity];
            if (bucket.length === 0 || count <= 0)
                return;
            const shuffled = shuffleArray(bucket);
            for (let i = 0; i < shuffled.length && selected.length < count; i++) {
                const asset = shuffled[i];
                if (used.has(asset))
                    continue;
                used.add(asset);
                selected.push(asset);
            }
        };
        takeFromBucket('Legendary', 9);
        takeFromBucket('Epic', 8);
        takeFromBucket('Rare', 6);
        takeFromBucket('Normal', 5);
        const allAssets = shuffleArray([
            ...rarityBuckets.Legendary,
            ...rarityBuckets.Epic,
            ...rarityBuckets.Rare,
            ...rarityBuckets.Normal,
        ]);
        let index = 0;
        while (selected.length < 28 && index < allAssets.length) {
            const asset = allAssets[index++];
            if (used.has(asset))
                continue;
            used.add(asset);
            selected.push(asset);
        }
        return selected;
    }
    function playIntroFinale() {
        if (introFinalePlaying)
            return;
        introFinalePlaying = true;
        clearIntroTimers();
        introRoot.classList.add('finale-mode');
        introRoot.innerHTML = `
      <div id="intro-finale-layer"></div>
      <div id="intro-flash"></div>
    `;
        const layer = document.getElementById('intro-finale-layer');
        if (!layer) {
            showIntroTitle();
            return;
        }
        const cardAssets = shuffleArray(buildFinaleCardAssets());
        const totalCards = Math.min(cardAssets.length, 28);
        cardAssets.slice(0, totalCards).forEach((src, index) => {
            const cardImg = document.createElement('img');
            cardImg.className = 'intro-stack-card';
            cardImg.src = src;
            cardImg.alt = '';
            const rotation = (Math.random() * 44) - 22;
            const offsetX = (Math.random() * 520) - 260;
            const offsetY = (Math.random() * 260) - 130;
            const scale = 0.72 + Math.random() * 0.28;
            const delay = index * INTRO_FINALE_CARD_INTERVAL;
            cardImg.style.setProperty('--stack-rotation', `${rotation}deg`);
            cardImg.style.setProperty('--stack-offset-x', `${offsetX}px`);
            cardImg.style.setProperty('--stack-offset-y', `${offsetY}px`);
            cardImg.style.setProperty('--stack-scale', `${scale}`);
            cardImg.style.setProperty('--stack-delay', `${delay}ms`);
            cardImg.style.setProperty('--stack-z', `${index + 10}`);
            layer.appendChild(cardImg);
            scheduleIntroTimer(() => {
                cardImg.classList.add('show');
                audioManager.playSFX('card_play', 0.25);
            }, delay);
        });
        const totalDuration = totalCards * INTRO_FINALE_CARD_INTERVAL + INTRO_FINALE_STACK_BUFFER;
        scheduleIntroTimer(() => {
            const flash = document.getElementById('intro-flash');
            audioManager.playSFX('card_play', 0.8);
            if (flash) {
                flash.classList.add('active');
            }
            scheduleIntroTimer(() => {
                introRoot.classList.remove('finale-mode');
                showIntroTitle();
                scheduleIntroTimer(() => {
                    if (flash) {
                        flash.classList.remove('active');
                    }
                }, INTRO_FINALE_FLASH_HOLD);
            }, INTRO_FINALE_FLASH_HOLD);
        }, totalDuration);
    }
    function renderIntro() {
        setAuthOverlayEnabled(false);
        clearIntroTimers();
        introSlidesData = INTRO_SLIDES;
        currentIntroPage = 0;
        introFinalePlaying = false;
        introTitleShowing = false;
        introRoot.classList.remove('title-mode');
        introRoot.classList.remove('finale-mode');
        introRoot.classList.add('active');
        showNextIntroPage();
        // 클릭 이벤트
        introRoot.onclick = () => {
            if (introTitleShowing) {
                return;
            }
            if (introFinalePlaying) {
                clearIntroTimers();
                showIntroTitle();
                return;
            }
            if (currentIntroPage < introSlidesData.length) {
                showNextIntroPage();
            }
            else {
                playIntroFinale();
            }
        };
    }
    function showNextIntroPage() {
        if (introFinalePlaying) {
            return;
        }
        if (currentIntroPage >= introSlidesData.length) {
            playIntroFinale();
            return;
        }
        clearIntroTimers();
        const pageIndex = currentIntroPage;
        const slide = introSlidesData[pageIndex];
        currentIntroPage++;
        introRoot.classList.remove('title-mode');
        if (!slide) {
            playIntroFinale();
            return;
        }
        // 배경 이미지 설정
        introRoot.style.backgroundImage = `url('backgrounds/${slide.background}')`;
        introRoot.style.backgroundSize = 'cover';
        introRoot.style.backgroundPosition = 'center';
        introRoot.style.backgroundRepeat = 'no-repeat';
        // 페이지 컨테이너 먼저 만들기
        introRoot.innerHTML = `
      <div id="intro-card-layer"></div>
      <div id="intro-page" class="active">
        <p id="intro-text"></p>
      </div>
    `;
        renderIntroCards(slide);
        audioManager.playSFX('card_draw', 0.5);
        // 타자기 효과로 텍스트 출력
        const textElement = document.getElementById('intro-text');
        if (textElement) {
            textElement.innerHTML = '';
        }
        typeWriterEffect(slide.text, (completeText) => {
            const textElement = document.getElementById('intro-text');
            if (textElement) {
                textElement.innerHTML = completeText;
            }
            // 자동으로 다음 페이지로 이동
            scheduleIntroTimer(() => {
                if (!introFinalePlaying && currentIntroPage <= introSlidesData.length) {
                    showNextIntroPage();
                }
            }, 1800); // 타이핑 완료 후 1.8초 대기
        });
    }
    function typeWriterEffect(text, onComplete, speed = 30, elementId = 'intro-text') {
        const textElement = document.getElementById(elementId);
        if (!textElement)
            return;
        clearIntroTimers();
        // <br> 태그를 임시 토큰으로 변환하여 파싱
        const parts = [];
        const regex = /(<br>)/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(match[0]); // <br> 태그
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        if (parts.length === 0) {
            parts.push(text);
        }
        // 각 부분을 순차적으로 출력
        let partIndex = 0;
        let charIndex = 0;
        function typeNext() {
            if (!textElement)
                return;
            if (partIndex >= parts.length) {
                onComplete(text);
                return;
            }
            const currentPart = parts[partIndex];
            if (currentPart === '<br>') {
                textElement.innerHTML = textElement.innerHTML + '<br>';
                partIndex++;
                charIndex = 0;
                scheduleIntroTimer(typeNext, 50); // 줄바꿈 시 잠깐 대기
            }
            else {
                if (charIndex < currentPart.length) {
                    textElement.innerHTML = textElement.innerHTML + currentPart[charIndex];
                    charIndex++;
                    scheduleIntroTimer(typeNext, speed); // 타이핑 속도
                }
                else {
                    partIndex++;
                    charIndex = 0;
                    scheduleIntroTimer(typeNext, 0);
                }
            }
        }
        typeNext();
    }
    function showIntroTitle() {
        clearIntroTimers();
        introFinalePlaying = false;
        introTitleShowing = true;
        currentIntroPage = introSlidesData.length;
        introRoot.classList.add('title-mode');
        introRoot.classList.remove('finale-mode');
        introRoot.onclick = () => { };
        const titleText = '빈틈없는 악역영애가 회귀했다면<br>이번엔 가문 인정받을 때까지 그만둘 수 없어';
        // 타이틀 배경 이미지 설정
        introRoot.style.backgroundImage = `url('backgrounds/intro_title.webp')`;
        introRoot.style.backgroundSize = 'cover';
        introRoot.style.backgroundPosition = 'center';
        introRoot.style.backgroundRepeat = 'no-repeat';
        // 타이틀 바로 표시 (페이드 애니메이션만 적용, 타자기 효과 없음)
        introRoot.innerHTML = `
      <div id="intro-title">${titleText}</div>
      <div id="intro-click-hint">클릭하여 시작하기</div>
    `;
        // 타이틀 표시 후 클릭 시 메인 메뉴로 이동
        scheduleIntroTimer(() => {
            introRoot.onclick = () => {
                introTitleShowing = false;
                requestAuthWithCallback(() => {
                    useBattleStore.getState().setGameScreen('menu');
                });
            };
        }, 1000);
    }
    // 화면별 UI 표시/숨김 함수
    // 화면 전환 효과 함수
    let isInitialLoad = true; // 초기 로드 여부 추적
    function transitionToScreen(screen, callback, skipTransition = false) {
        // 초기 로드 시 또는 전환 스킵 시 바로 실행
        if (skipTransition || isInitialLoad) {
            callback();
            isInitialLoad = false;
            return;
        }
        // 페이드 아웃 시작
        screenTransitionOverlay.classList.add('active');
        // 페이드 아웃 완료 후 화면 전환
        setTimeout(() => {
            callback();
            // 페이드 인 시작
            setTimeout(() => {
                screenTransitionOverlay.classList.remove('active');
            }, 50); // 짧은 딜레이로 화면 전환 후 페이드 인
        }, 300); // 페이드 아웃 시간 (CSS transition과 동일)
    }
    function updateScreenVisibility(screen) {
        // 모든 화면 숨김
        introRoot.classList.remove('active');
        menuRoot.classList.remove('active');
        menuUserInfoRoot?.classList.remove('visible');
        deckEditorRoot.classList.remove('active');
        campaignRoot.classList.remove('active');
        dailyRoot.classList.remove('active');
        shopRoot.classList.remove('active');
        rewardRoot.classList.remove('active');
        cutsceneRoot.classList.remove('active');
        pvpRoot.classList.remove('active');
        root.style.display = 'none';
        hud.style.display = 'none';
        controls.style.display = 'none';
        logRoot.style.display = 'none';
        handRoot.style.display = 'none';
        logToggle.style.display = 'none'; // 배틀 화면에서만 표시되도록 함
        closeOptionsPanel();
        // BGM 전환
        if (screen === 'menu' || screen === 'deck-editor') {
            audioManager.playBGM('bgm_menu');
        }
        else if (screen === 'battle' || screen === 'campaign' || screen === 'daily' || screen === 'pvp') {
            audioManager.playBGM('bgm_battle');
        }
        else if (screen === 'shop') {
            audioManager.playBGM('bgm_shop');
        }
        else if (screen === 'cutscene') {
            // 컷신은 배경음악 유지 (또는 특별한 BGM 재생)
        }
        // UI 인터랙션 사운드
        if (screen !== 'cutscene' && screen !== 'intro') {
            audioManager.playSFX('menu_open', 0.4);
        }
        // 화면별 표시
        if (screen === 'intro') {
            renderIntro();
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
        }
        else if (screen === 'menu') {
            menuRoot.classList.add('active');
            menuUserInfoRoot?.classList.add('visible');
            updateMenuUserInfo();
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
            gameInitialized = false; // 메뉴로 나갈 때 게임 상태 리셋
            if (!announcementDismissedPermanently && (!announcementHasBeenShown || announcementRemindQueued)) {
                window.setTimeout(() => openAnnouncementModal(), 120);
            }
        }
        else if (screen === 'cutscene') {
            cutsceneRoot.classList.add('active');
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
        }
        else if (screen === 'battle') {
            root.style.display = 'block';
            hud.style.display = 'block';
            controls.style.display = 'flex';
            logRoot.style.display = 'block';
            handRoot.style.display = 'flex';
            // 모바일에서만 로그 토글 버튼 표시
            if (isMobile || window.innerWidth <= 768) {
                logToggle.style.display = 'block';
            }
            playerHPBar.visible = true;
            enemyHPBar.visible = true;
            // 캐릭터 일러스트 업데이트
            updateDeckVisuals();
            // 전투 모드 진입 시 게임 초기화
            if (!gameInitialized && allCards.length > 0) {
                // 기존 타이머 취소
                if (victoryDefeatTimer !== null) {
                    window.clearTimeout(victoryDefeatTimer);
                    victoryDefeatTimer = null;
                }
                const store = useBattleStore.getState();
                gameInitialized = true; // 🔴 gameInitialized를 먼저 설정하여 중복 호출 방지
                store.initGame(allCards);
                // UI 즉시 렌더링 (드로우 애니메이션은 별도로 처리됨)
                requestAnimationFrame(() => {
                    renderHUD();
                    renderControls();
                    renderLog();
                    // 덱과 버프/디버프는 자동으로 Zustand 구독을 통해 업데이트됨
                    // 🎓 1스테이지 튜토리얼 표시
                    if (store.currentStage === 1) {
                        setTimeout(() => {
                            showTutorial([
                                {
                                    icon: '🎯',
                                    title: '목표',
                                    text: '상대방의 HP를 0으로 만들면 승리합니다!',
                                },
                                {
                                    icon: '💪',
                                    title: '기본 규칙',
                                    text: '카드를 선택해서 전략적으로 사용하세요.',
                                    highlight: '💡 카드를 선택하면 "선언"됩니다'
                                },
                                {
                                    icon: '🔄',
                                    title: '턴 진행',
                                    text: '선언이 끝나면 "턴 종료" 버튼을 눌러주세요.',
                                    highlight: '💡 카드들은 우선순위에 따라 자동으로 실행됩니다'
                                },
                                {
                                    icon: '⚡',
                                    title: '우선순위',
                                    text: '카드 효과는 다음과 같은 순서로 해결됩니다.',
                                    highlight: '특수 > 공격 > 방어 > 회복'
                                },
                                {
                                    icon: '💡',
                                    title: '팁',
                                    text: '에너지 코스트를 확인하고 전략적으로 카드를 선택하세요!',
                                }
                            ], () => {
                                // 튜토리얼 완료 후 아무것도 하지 않음
                            });
                        }, 800);
                    }
                });
            }
        }
        else if (screen === 'deck-editor') {
            deckEditorRoot.classList.add('active');
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
            gameInitialized = false; // 덱 에디터로 나갈 때 게임 상태 리셋
            renderDeckEditor();
        }
        else if (screen === 'campaign') {
            campaignRoot.classList.add('active');
            playerHPBar.visible = true;
            enemyHPBar.visible = true;
            // 게임 초기화는 showDefeatScreen/showVictoryScreen에서 처리
            renderCampaign();
        }
        else if (screen === 'daily') {
            dailyRoot.classList.add('active');
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
            gameInitialized = false;
            renderDailyDungeon();
        }
        else if (screen === 'shop') {
            shopRoot.classList.add('active');
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
            gameInitialized = false; // 상점으로 나갈 때 게임 상태 리셋
            renderShop();
        }
        else if (screen === 'reward') {
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
            gameInitialized = false; // 보상 화면으로 나갈 때 게임 상태 리셋
            renderReward();
        }
        else if (screen === 'pvp') {
            pvpRoot.classList.add('active');
            playerHPBar.visible = false;
            enemyHPBar.visible = false;
        }
    }
    // 초기 화면 설정 (전환 효과 없이)
    isInitialLoad = true;
    updateScreenVisibility(useBattleStore.getState().gameScreen);
    isInitialLoad = false;
    // 이전 화면 상태 추적 (무한 루프 방지)
    let previousScreen = useBattleStore.getState().gameScreen;
    // 렌더링 배치: requestAnimationFrame으로 UI 업데이트 제한
    let pendingUIUpdate = false;
    let screenToRender = null;
    function scheduleUIUpdate(screen) {
        screenToRender = screen;
        if (pendingUIUpdate)
            return;
        pendingUIUpdate = true;
        requestAnimationFrame(() => {
            pendingUIUpdate = false;
            if (!screenToRender)
                return;
            // 화면별 UI 렌더링
            if (screenToRender === 'battle') {
                renderHUD();
                renderControls();
                renderLog();
                renderEnemyHand();
                renderHand();
            }
            else if (screenToRender === 'deck-editor') {
                renderDeckEditor();
            }
            else if (screenToRender === 'campaign') {
                renderCampaign();
            }
            else if (screenToRender === 'daily') {
                renderDailyDungeon();
            }
            else if (screenToRender === 'shop') {
                renderShop();
            }
            else if (screenToRender === 'reward') {
                renderReward();
            }
        });
    }
    // 덱/손 변화 추적 변수
    let prevDeckLength = useBattleStore.getState().deck.length;
    let prevHandLength = useBattleStore.getState().hand.length;
    let prevEnemyHandLength = useBattleStore.getState().enemyHand.length;
    // 드로우 애니메이션 중 플래그
    let isDrawingCards = false;
    let isDrawingEnemyCards = false;
    let cardsToRender = 0; // 렌더링할 카드 수 (애니메이션 완료된 카드만)
    let enemyCardsToRender = 0;
    // 드로우 애니메이션 타이머 추적
    let drawAnimationTimers = [];
    let enemyDrawAnimationTimers = [];
    // 🔴 핸드 추적 리셋 함수 등록 (initGame에서 호출됨)
    setHandTrackingResetCallback(() => {
        console.log(`[HandTracking] 🔄 RESET CALLED`);
        console.log(`[HandTracking]   Before - prevHand: ${prevHandLength}, prevEnemyHand: ${prevEnemyHandLength}`);
        // 🔴 드로우 애니메이션 타이머 모두 취소
        drawAnimationTimers.forEach(timer => window.clearTimeout(timer));
        drawAnimationTimers = [];
        enemyDrawAnimationTimers.forEach(timer => window.clearTimeout(timer));
        enemyDrawAnimationTimers = [];
        // 🔴 핸드를 0으로 설정 (draw()가 빈 손에서 시작하도록)
        prevDeckLength = 0;
        prevHandLength = 0;
        prevEnemyHandLength = 0;
        isDrawingCards = false;
        isDrawingEnemyCards = false;
        cardsToRender = 0;
        enemyCardsToRender = 0;
        console.log(`[HandTracking]   After - prevHand: ${prevHandLength}, prevEnemyHand: ${prevEnemyHandLength}`);
    });
    setEnemyHandUpdateCallback(() => {
        const state = useBattleStore.getState();
        enemyCardsToRender = state.enemyHand.length;
        renderEnemyHand();
    });
    // Keep local variables in sync with store updates
    useBattleStore.subscribe((s) => {
        // 화면이 변경된 경우에만 화면 전환 처리
        if (s.gameScreen !== previousScreen) {
            console.log(`[Screen] Transition: ${previousScreen} -> ${s.gameScreen}`);
            const targetScreen = s.gameScreen;
            // 화면 전환 효과 적용
            transitionToScreen(targetScreen, () => {
                previousScreen = targetScreen;
                updateScreenVisibility(targetScreen);
                // Update battle background on screen change
                updateBattleBackground();
            });
        }
        // Update battle background when stage changes
        if (s.gameScreen === 'battle') {
            updateBattleBackground();
        }
        // 덱 변화 감지
        if (s.deck.length !== prevDeckLength) {
            updateDeckVisuals();
            prevDeckLength = s.deck.length;
        }
        // 플레이어 손 카드 변화 감지 (카드가 추가된 경우 - 드로우 감지)
        if (s.hand.length !== prevHandLength) {
            console.log(`[Hand] 🔍 CHANGE DETECTED - prev: ${prevHandLength}, current: ${s.hand.length}, screen: ${s.gameScreen}, isDrawing: ${isDrawingCards}`);
        }
        // 🔴 드로우 중에 hand가 0으로 바뀌는 경우 무시 (Zustand 비동기 subscribe 문제)
        if (s.hand.length === 0 && prevHandLength > 0 && isDrawingCards) {
            console.log(`[Hand] 🚫 IGNORED: hand reset to 0 during draw animation (Zustand async issue)`);
            // prevHandLength 업데이트하지 않고 무시
        }
        else if (s.hand.length > prevHandLength && s.gameScreen === 'battle' && !isDrawingCards) {
            const newCards = s.hand.length - prevHandLength;
            const targetHandSize = s.hand.length; // 🔴 클로저 문제 해결: 목표 크기 고정
            console.log(`[Draw] ✅ ${newCards} card(s) drawn (${prevHandLength} → ${targetHandSize})`);
            // 🎬 드로우 애니메이션 시작
            isDrawingCards = true;
            cardsToRender = prevHandLength; // 기존 카드만 렌더링
            renderHand(); // 기존 카드만 표시
            // prevHandLength 즉시 업데이트 (중복 트리거 방지)
            prevHandLength = targetHandSize;
            console.log(`[Hand] ✅ Updated prevHandLength to ${targetHandSize}`);
            // 드로우된 카드마다 애니메이션 (순차 실행)
            for (let i = 0; i < newCards; i++) {
                const targetX = app.renderer.width / 2;
                const targetY = app.renderer.height - 100;
                const timer = window.setTimeout(async () => {
                    await animateCardDraw({ x: targetX, y: targetY }, true);
                    // 애니메이션 완료 후 카드 추가
                    cardsToRender++;
                    renderHand();
                    // 마지막 카드면 플래그 해제
                    if (cardsToRender >= targetHandSize) {
                        isDrawingCards = false;
                        console.log(`[Hand] ✅ Animation complete`);
                    }
                }, i * 300); // 0.3초 간격
                drawAnimationTimers.push(timer);
            }
        }
        else if (s.hand.length !== prevHandLength && !isDrawingCards) {
            // 드로우가 아닌 경우에만 업데이트 (카드 사용 등)
            console.log(`[Hand] ⚠️ Change detected (not a draw or screen !== 'battle') - prev: ${prevHandLength}, current: ${s.hand.length}, screen: ${s.gameScreen}`);
            prevHandLength = s.hand.length;
        }
        // 적 손 카드 변화 감지 (카드가 추가된 경우 - 드로우 감지)
        if (s.enemyHand.length !== prevEnemyHandLength) {
            console.log(`[EnemyHand] 🔍 CHANGE DETECTED - prev: ${prevEnemyHandLength}, current: ${s.enemyHand.length}, screen: ${s.gameScreen}, isDrawing: ${isDrawingEnemyCards}`);
        }
        // 🔴 드로우 중에 enemyHand가 0으로 바뀌는 경우 무시 (Zustand 비동기 subscribe 문제)
        if (s.enemyHand.length === 0 && prevEnemyHandLength > 0 && isDrawingEnemyCards) {
            console.log(`[EnemyHand] 🚫 IGNORED: enemyHand reset to 0 during draw animation (Zustand async issue)`);
            // prevEnemyHandLength 업데이트하지 않고 무시
        }
        else if (s.enemyHand.length > prevEnemyHandLength && s.gameScreen === 'battle' && !isDrawingEnemyCards) {
            if (prevEnemyHandLength === 0 && s.battleContext.type === 'pvp' && s.round === 1) {
                enemyCardsToRender = s.enemyHand.length;
                renderEnemyHand();
                prevEnemyHandLength = s.enemyHand.length;
                isDrawingEnemyCards = false;
                console.log('[EnemyHand] ⚡ Initial PvP hand synced without animation');
            }
            else {
                const newCards = s.enemyHand.length - prevEnemyHandLength;
                const targetHandSize = s.enemyHand.length; // 🔴 클로저 문제 해결: 목표 크기 고정
                console.log(`[EnemyDraw] ✅ ${newCards} card(s) drawn (${prevEnemyHandLength} → ${targetHandSize})`);
                // 🎬 드로우 애니메이션 시작
                isDrawingEnemyCards = true;
                enemyCardsToRender = prevEnemyHandLength; // 기존 카드만 렌더링
                renderEnemyHand(); // 기존 카드만 표시
                // prevEnemyHandLength 즉시 업데이트 (중복 트리거 방지)
                prevEnemyHandLength = targetHandSize;
                console.log(`[EnemyHand] ✅ Updated prevEnemyHandLength to ${targetHandSize}`);
                // 드로우된 카드마다 애니메이션 (순차 실행)
                for (let i = 0; i < newCards; i++) {
                    const targetX = app.renderer.width / 2;
                    const targetY = 100;
                    const timer = window.setTimeout(async () => {
                        await animateCardDraw({ x: targetX, y: targetY }, false);
                        // 애니메이션 완료 후 카드 추가
                        enemyCardsToRender++;
                        renderEnemyHand();
                        // 마지막 카드면 플래그 해제
                        if (enemyCardsToRender >= targetHandSize) {
                            isDrawingEnemyCards = false;
                            console.log(`[EnemyHand] ✅ Animation complete`);
                        }
                    }, i * 300); // 0.3초 간격
                    enemyDrawAnimationTimers.push(timer);
                }
            }
        }
        else if (s.enemyHand.length !== prevEnemyHandLength && s.gameScreen === 'battle' && !isDrawingEnemyCards) {
            // 드로우가 아닌 경우 (카드 제거 등)
            const newCards = s.enemyHand.length - prevEnemyHandLength;
            console.log(`[EnemyHand] ❌ UNEXPECTED CHANGE - newCards: ${newCards}, prev: ${prevEnemyHandLength}, current: ${s.enemyHand.length}`);
            if (newCards < 0) {
                console.log(`[EnemyHand] ${Math.abs(newCards)} card(s) removed`);
            }
            enemyCardsToRender = s.enemyHand.length;
            renderEnemyHand();
            prevEnemyHandLength = s.enemyHand.length;
        }
        else if (s.enemyHand.length !== prevEnemyHandLength) {
            console.log(`[EnemyHand] ⚠️ Change detected but screen !== 'battle' (screen: ${s.gameScreen})`);
            enemyCardsToRender = s.enemyHand.length;
            renderEnemyHand();
            prevEnemyHandLength = s.enemyHand.length;
        }
        // 전투 상태 업데이트 + 트윈 애니메이션
        // 에너지 변화 트윈
        if (energy !== s.energy) {
            tweenNumber(displayEnergy, s.energy, 300, (value) => {
                displayEnergy = value;
                renderHUD();
                // 플레이어 에너지 바 업데이트
                updateEnergyBar(playerEnergyBar, playerEnergyComponents, value, 10, playerHPBarWidth);
            }, { easing: Easing.easeOutQuad });
        }
        energy = s.energy;
        // 적 에너지 변화
        if (s.enemyEnergy !== undefined) {
            updateEnergyBar(enemyEnergyBar, enemyEnergyComponents, s.enemyEnergy, 10, enemyHPBarWidth);
        }
        // 플레이어 HP 변화 트윈
        if (playerHp !== s.playerHp) {
            const prevHP = displayPlayerHp; // 변화 전 HP 저장
            tweenNumber(displayPlayerHp, s.playerHp, 400, (value) => {
                displayPlayerHp = value;
                renderHUD();
                // HP 바 업데이트 (번쩍임 효과 포함)
                updateHPBar(playerHPBar, playerHPComponents, value, s.playerMaxHp, playerHPBarWidth, prevPlayerHPForFlash, true);
            }, { easing: Easing.easeOutCubic });
            prevPlayerHPForFlash = s.playerHp; // 이전 HP 업데이트
        }
        playerHp = s.playerHp;
        // 적 HP 변화 트윈
        if (enemyHp !== s.enemyHp) {
            const prevHP = displayEnemyHp; // 변화 전 HP 저장
            tweenNumber(displayEnemyHp, s.enemyHp, 400, (value) => {
                displayEnemyHp = value;
                renderHUD();
                // HP 바 업데이트 (번쩍임 효과 포함)
                updateHPBar(enemyHPBar, enemyHPComponents, value, s.enemyMaxHp, enemyHPBarWidth, prevEnemyHPForFlash, true);
            }, { easing: Easing.easeOutCubic });
            prevEnemyHPForFlash = s.enemyHp; // 이전 HP 업데이트
        }
        enemyHp = s.enemyHp;
        round = s.round;
        roundSeed = s.roundSeed;
        playerMaxHp = s.playerMaxHp;
        enemyMaxHp = s.enemyMaxHp;
        const nextInitiative = s.currentInitiative ?? null;
        if (currentInitiative !== nextInitiative) {
            currentInitiative = nextInitiative;
            renderHUD();
        }
        // 게임 오버 상태 변화 감지
        if (gameOver !== s.gameOver) {
            console.log(`[GameOver] State changed: ${gameOver} → ${s.gameOver}`);
            // 기존 타이머 취소
            if (victoryDefeatTimer !== null) {
                window.clearTimeout(victoryDefeatTimer);
                victoryDefeatTimer = null;
                console.log(`[GameOver] Cancelled previous timer`);
            }
            if (s.gameOver === 'victory') {
                console.log(`[GameOver] Setting victory timer`);
                victoryDefeatTimer = window.setTimeout(() => {
                    const currentState = useBattleStore.getState();
                    if (currentState.gameOver === 'victory') {
                        showVictoryScreen();
                    }
                    else {
                        console.log(`[GameOver] Timer fired but gameOver changed to ${currentState.gameOver}, skipping`);
                    }
                }, 1000);
            }
            else if (s.gameOver === 'defeat') {
                console.log(`[GameOver] Setting defeat timer`);
                victoryDefeatTimer = window.setTimeout(() => {
                    const currentState = useBattleStore.getState();
                    if (currentState.gameOver === 'defeat') {
                        showDefeatScreen();
                    }
                    else {
                        console.log(`[GameOver] Timer fired but gameOver changed to ${currentState.gameOver}, skipping`);
                    }
                }, 1000);
            }
            else {
                // 게임 재시작 시 화면 숨김
                console.log(`[GameOver] Hiding victory/defeat screens`);
                victoryScreen.classList.remove('active');
                defeatScreen.classList.remove('active');
            }
        }
        gameOver = s.gameOver;
        // 상태 변화 감지 시 UI 업데이트
        if (playerStatus !== s.playerStatus || enemyStatus !== s.enemyStatus) {
            updateStatusUI();
        }
        playerStatus = s.playerStatus;
        enemyStatus = s.enemyStatus;
        // 화면별 UI 업데이트 (화면 전환 시 제외 - updateScreenVisibility에서 이미 렌더링함)
        if (s.gameScreen === previousScreen) {
            scheduleUIUpdate(s.gameScreen);
        }
    });
});
