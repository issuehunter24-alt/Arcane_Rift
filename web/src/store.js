let pendingDeckSave = false;
function scheduleDeckSave() {
    if (pendingDeckSave)
        return;
    pendingDeckSave = true;
    setTimeout(() => {
        pendingDeckSave = false;
        triggerCloudSave();
    }, 250);
}
import { create } from 'zustand';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';
import { createInitialCampaignStages } from './data/campaignStages';
function generateUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        crypto.getRandomValues(bytes);
    }
    else {
        for (let i = 0; i < bytes.length; i += 1) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
let vfxCallback = null;
let positionCallback = null;
let cardUseAnimationCallback = null;
let handTrackingResetCallback = null;
let enemyHandUpdateCallback = null;
// setTimeout 타이머 추적
let enemyTurnTimer1 = null;
let enemyTurnTimer2 = null;
let enemyTurnTimer3 = null;
let endTurnTimer = null;
let pvpPollTimer = null;
let pvpUnloadCleanup = null;
let pvpTurnTimerInterval = null;
let pvpSearchTimer = null;
let pvpAiFallbackTimer = null;
let pvpAiDecisionTimer = null;
const DEFAULT_PVP_TURN_DURATION = 15;
const PVP_AI_FALLBACK_MIN_MS = 15000;
const PVP_AI_FALLBACK_MAX_MS = 15000;
const PVP_AI_ESTIMATE_MIN_SECONDS = Math.floor(PVP_AI_FALLBACK_MIN_MS / 1000);
const PVP_AI_ESTIMATE_MAX_SECONDS = Math.floor(PVP_AI_FALLBACK_MAX_MS / 1000);
const PVP_FAKE_OPPONENT_NAMES = [
    '미러 기사 알파',
    '노바 스펙터',
    '환영 소환사 루나',
    '데이터 팬텀',
    '가상 검사 벨로스',
    '시뮬라크럼 델타',
    '에코 가디언',
    'AI 듀얼리스트 카일',
];
function formatDurationSeconds(totalSeconds) {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(clamped / 60).toString().padStart(2, '0');
    const seconds = (clamped % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}
function buildPvpSearchStatusMessage(elapsedSeconds) {
    const elapsedLabel = formatDurationSeconds(elapsedSeconds);
    const estimateRange = `${formatDurationSeconds(PVP_AI_ESTIMATE_MIN_SECONDS)}~${formatDurationSeconds(PVP_AI_ESTIMATE_MAX_SECONDS)}`;
    const caution = elapsedSeconds >= PVP_AI_ESTIMATE_MIN_SECONDS ? ' · 상대가 없으면 AI 모의전으로 전환됩니다.' : '';
    return `매칭 대기 ${elapsedLabel} (예상 ${estimateRange})${caution}`;
}
function getRandomFakeOpponentName() {
    if (PVP_FAKE_OPPONENT_NAMES.length === 0) {
        return '시스템 모의전';
    }
    const index = Math.floor(Math.random() * PVP_FAKE_OPPONENT_NAMES.length);
    return PVP_FAKE_OPPONENT_NAMES[index];
}
const CLOUD_SAVE_EVENT = 'cloud-save-force';
function triggerCloudSave() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CLOUD_SAVE_EVENT));
    }
}
const clampDeckSnapshot = (cards) => cards.slice(0, 20);
function normalizeCardId(cardId) {
    const withoutSnapshot = cardId.split('__snap__')[0] ?? cardId;
    const canonicalMatch = withoutSnapshot.match(/^([A-Z]+_[A-Z0-9]+_[A-Z]+_[0-9]+)/);
    if (canonicalMatch) {
        return canonicalMatch[1];
    }
    const parts = withoutSnapshot.split('_');
    const timestampIndex = parts.findIndex(part => /^\d{10,}$/.test(part));
    if (timestampIndex >= 0) {
        parts.splice(timestampIndex);
    }
    if (parts.length >= 4) {
        return parts.slice(0, 4).join('_');
    }
    return parts.join('_');
}
function rehydrateCardFromPool(card, pool) {
    if (!card)
        return card;
    if (!Array.isArray(pool) || pool.length === 0)
        return card;
    const baseId = normalizeCardId(card.id);
    const canonical = pool.find(candidate => normalizeCardId(candidate.id) === baseId);
    if (!canonical) {
        return card;
    }
    return {
        ...canonical,
        id: card.id,
    };
}
function rehydrateCardsFromPool(cards, pool) {
    if (!Array.isArray(cards) || cards.length === 0)
        return cards;
    if (!Array.isArray(pool) || pool.length === 0)
        return cards;
    return cards.map(card => rehydrateCardFromPool(card, pool));
}
function getDeckSnapshot(cards) {
    return clampDeckSnapshot(cards).map(card => {
        const baseId = normalizeCardId(card.id);
        return {
            baseId,
            rarity: card.rarity,
        };
    });
}
function buildDeckFromSnapshot(snapshot, pool) {
    if (!Array.isArray(snapshot) || snapshot.length === 0 || pool.length === 0) {
        return [];
    }
    const baseMap = new Map(pool.map(card => [normalizeCardId(card.id), card]));
    const generated = [];
    snapshot.forEach((entry, index) => {
        const base = baseMap.get(entry.baseId);
        if (base) {
            generated.push({
                ...base,
                id: `${normalizeCardId(base.id)}__snap__${index}`,
            });
        }
    });
    return clampDeckSnapshot(generated);
}
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 0x100000000;
function mixSeeds(base, salt) {
    let seed = (base ^ (salt + 0x9e3779b9)) >>> 0;
    seed = (seed * 0x85ebca6b) >>> 0;
    seed = (seed ^ (seed >>> 13)) >>> 0;
    return seed >>> 0;
}
function nextSeed(seed) {
    return (LCG_A * seed + LCG_C) >>> 0;
}
function generateRoundSeed(baseSeed, round, phase = 0) {
    const mixed = mixSeeds(baseSeed, round + phase * 9973);
    return nextSeed(mixed);
}
function getSeededRandom(baseSeed, counter, salt = 0) {
    let seed = mixSeeds(baseSeed, counter + salt * 2654435761);
    seed = nextSeed(seed);
    return seed / LCG_M;
}
function shuffleWithSeed(items, seed) {
    const result = [...items];
    let counter = 0;
    for (let i = result.length - 1; i > 0; i--) {
        const rand = getSeededRandom(seed, counter++);
        const j = Math.floor(rand * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}
function serializeCard(card) {
    const { id, name, type, rarity, cost, effects, tags, keywords, effectText, levelCurve, vfxKey, sfxKey, version } = card;
    return {
        id,
        name,
        type,
        rarity,
        cost,
        effects,
        tags,
        keywords,
        effectText,
        levelCurve,
        vfxKey,
        sfxKey,
        version,
    };
}
function deserializeCard(serialized) {
    return {
        ...serialized,
        tags: serialized.tags ?? [],
        keywords: serialized.keywords ?? [],
        effects: serialized.effects ?? [],
    };
}
function clearPvpPolling() {
    if (pvpPollTimer !== null) {
        window.clearInterval(pvpPollTimer);
        pvpPollTimer = null;
    }
}
function clearPvpSearchTimers() {
    if (typeof window !== 'undefined') {
        if (pvpSearchTimer !== null) {
            window.clearInterval(pvpSearchTimer);
            pvpSearchTimer = null;
        }
        if (pvpAiFallbackTimer !== null) {
            window.clearTimeout(pvpAiFallbackTimer);
            pvpAiFallbackTimer = null;
        }
    }
    else {
        pvpSearchTimer = null;
        pvpAiFallbackTimer = null;
    }
}
function clearPvpAiDecisionTimer() {
    if (typeof window !== 'undefined') {
        if (pvpAiDecisionTimer !== null) {
            window.clearTimeout(pvpAiDecisionTimer);
            pvpAiDecisionTimer = null;
        }
    }
    else {
        pvpAiDecisionTimer = null;
    }
}
function detachPvpUnloadCleanup() {
    if (typeof window === 'undefined' || !pvpUnloadCleanup) {
        pvpUnloadCleanup = null;
        return;
    }
    window.removeEventListener('beforeunload', pvpUnloadCleanup);
    window.removeEventListener('pagehide', pvpUnloadCleanup);
    pvpUnloadCleanup = null;
}
function registerPvpUnloadCleanup(userId) {
    if (typeof window === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return;
    }
    detachPvpUnloadCleanup();
    const restEndpoint = `${SUPABASE_URL}/rest/v1/pvp_queue?user_id=eq.${userId}`;
    const handler = () => {
        detachPvpUnloadCleanup();
        fetch(restEndpoint, {
            method: 'DELETE',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            keepalive: true,
        }).catch(() => {
            // 네트워크가 끊긴 상태에서 실패할 수 있으므로 조용히 무시
        });
    };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    pvpUnloadCleanup = handler;
}
export function setVFXCallback(callback) {
    vfxCallback = callback;
}
export function setPositionCallback(callback) {
    positionCallback = callback;
}
export function setCardUseAnimationCallback(callback) {
    cardUseAnimationCallback = callback;
}
export function setHandTrackingResetCallback(callback) {
    handTrackingResetCallback = callback;
}
export function setEnemyHandUpdateCallback(callback) {
    enemyHandUpdateCallback = callback;
}
function notifyEnemyHandUpdate() {
    if (enemyHandUpdateCallback) {
        enemyHandUpdateCallback();
    }
}
function triggerVFX(type, target, value) {
    if (vfxCallback) {
        vfxCallback(type, target, value);
    }
}
const STATUS_VFX_MAP = {
    Burn: 'burn',
    Freeze: 'freeze',
    Shock: 'shock',
    Vulnerable: 'vulnerable',
    Poison: 'vulnerable',
    Regen: 'heal',
    Mark: 'buff',
    Root: 'freeze',
};
function triggerStatusVFX(key, target) {
    const mapped = STATUS_VFX_MAP[key];
    if (mapped) {
        triggerVFX(mapped, target);
    }
}
async function triggerCardUseAnimation(card, isPlayerCard, handIndex) {
    if (cardUseAnimationCallback) {
        await cardUseAnimationCallback(card, isPlayerCard, handIndex);
    }
}
const STAGE_REWARD_SETTINGS = {
    first: {
        goldMultiplier: 3.5,
        goldMinimum: 450,
        shardMultiplier: 2.5,
        shardMinimum: 6
    },
    repeat: {
        goldMultiplier: 2,
        goldMinimum: 220,
        shardMultiplier: 1.5,
        shardMinimum: 3
    },
    stageGoldBonus: 40,
    stageShardBonus: 1
};
export function getBoostedStageReward(reward, stageId, isRepeat) {
    const config = isRepeat ? STAGE_REWARD_SETTINGS.repeat : STAGE_REWARD_SETTINGS.first;
    const goldBase = reward.gold * config.goldMultiplier + stageId * STAGE_REWARD_SETTINGS.stageGoldBonus;
    const shardsBase = reward.shards * config.shardMultiplier + stageId * STAGE_REWARD_SETTINGS.stageShardBonus;
    return {
        gold: Math.max(config.goldMinimum, goldBase),
        shards: Math.max(config.shardMinimum, shardsBase)
    };
}
// Daily dungeon helpers
function getTodayKey() {
    try {
        const formatter = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul' });
        const formatted = formatter.format(new Date()).replace(/\./g, '-').replace(/\s/g, '').replace(/-$/, '');
        if (formatted) {
            return formatted;
        }
    }
    catch (error) {
        // Intl 미지원 환경 대비
    }
    return new Date().toISOString().slice(0, 10);
}
function createSeededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value = (value * 1664525 + 1013904223) >>> 0;
        return value / 0x100000000;
    };
}
function generateDailyDungeonFloors(dateKey, stages) {
    if (stages.length === 0) {
        return [];
    }
    const seed = parseInt(dateKey.replace(/-/g, ''), 10) || Date.now();
    const rand = createSeededRandom(seed);
    const pickStage = (pool) => {
        if (pool.length === 0) {
            return stages[Math.floor(rand() * stages.length)] ?? stages[0];
        }
        return pool[Math.floor(rand() * pool.length)] ?? pool[0];
    };
    const early = stages.filter(s => s.id <= 15);
    const mid = stages.filter(s => s.id > 15 && s.id <= 30);
    const late = stages.filter(s => s.id > 30);
    const floor1Stage = pickStage(early);
    const floor2Stage = pickStage(mid);
    const floor3Stage = pickStage(late);
    return [
        {
            id: 1,
            name: '원소 조율 시험',
            stageId: floor1Stage.id,
            recommendedPower: floor1Stage.recommendedPower,
            description: `${floor1Stage.name}에서 원소 흐름을 조율하는 훈련입니다. 에너지가 넘치지만 집중력이 필요합니다.`,
            modifiers: [
                { type: 'playerEnergy', value: 1, label: '⚡ 플레이어 에너지 +1', description: '매 턴 시작 시 플레이어가 추가 에너지 1을 얻습니다.' },
                { type: 'playerShield', value: 10, label: '🛡️ 시작 보호막 10', description: '전투 시작 시 보호막 10을 얻어 초반 피해를 흡수합니다.' }
            ],
            reward: { gold: 1600, shards: 6 },
            cleared: false
        },
        {
            id: 2,
            name: '폭풍 연계 훈련',
            stageId: floor2Stage.id,
            recommendedPower: floor2Stage.recommendedPower,
            description: `${floor2Stage.name}의 난류 속에서 공격과 방어를 동시에 조정합니다. 적이 추가 에너지를 확보합니다.`,
            modifiers: [
                { type: 'enemyEnergy', value: 1, label: '⚡ 적 에너지 +1', description: '적이 매 턴 추가 에너지 1을 얻습니다.' },
                { type: 'enemyShield', value: 15, label: '🛡️ 적 시작 보호막 15', description: '적이 전투 시작 시 보호막 15를 얻습니다.' }
            ],
            reward: { gold: 2000, shards: 8 },
            cleared: false
        },
        {
            id: 3,
            name: '심층 보스 러시',
            stageId: floor3Stage.id,
            recommendedPower: floor3Stage.recommendedPower,
            description: `${floor3Stage.name}에서 최종 연속 전투를 치릅니다. 적이 강화되지만 플레이어도 방어 지원을 받습니다.`,
            modifiers: [
                { type: 'playerShield', value: 15, label: '🛡️ 시작 보호막 15', description: '전투 시작 시 추가 보호막 15를 얻어 생존력을 높입니다.' },
                { type: 'enemyEnergy', value: 1, label: '⚡ 적 에너지 +1', description: '적이 매 턴 추가 에너지 1을 얻습니다.' },
                { type: 'enemyShield', value: 20, label: '🛡️ 적 시작 보호막 20', description: '적이 전투 시작 시 보호막 20을 얻습니다.' }
            ],
            reward: { gold: 2600, shards: 12 },
            cleared: false
        }
    ];
}
function pickAiPvpCards(state, evaluate) {
    if (!Array.isArray(state.enemyHand) || state.enemyHand.length === 0) {
        return [];
    }
    let remainingEnergy = Math.max(0, state.enemyEnergy);
    if (remainingEnergy <= 0) {
        return [];
    }
    const context = {
        enemyHp: state.enemyHp,
        enemyMaxHp: state.enemyMaxHp,
        playerHp: state.playerHp,
        playerMaxHp: state.playerMaxHp,
        enemyStatus: state.enemyStatus,
        playerStatus: state.playerStatus,
    };
    const available = state.enemyHand.map((card, index) => ({ card, index }));
    const used = new Set();
    const chosen = [];
    while (remainingEnergy > 0 && used.size < available.length) {
        const playable = available.filter(entry => !used.has(entry.index) && entry.card.cost <= remainingEnergy);
        if (playable.length === 0) {
            break;
        }
        const scored = playable.map(entry => ({
            entry,
            score: evaluate(entry.card, context),
        }));
        scored.sort((a, b) => b.score - a.score);
        const topCount = Math.max(1, Math.ceil(scored.length * 0.5));
        const pick = scored[Math.floor(Math.random() * topCount)].entry;
        chosen.push({ ...pick.card });
        used.add(pick.index);
        remainingEnergy -= pick.card.cost;
        if (chosen.length >= 4) {
            break;
        }
    }
    if (chosen.length === 0 && state.playerQueue.length > 0) {
        const desiredIds = state.playerQueue.map(entry => normalizeCardId(entry.card.id));
        for (const desired of desiredIds) {
            const match = available.find(entry => !used.has(entry.index) && normalizeCardId(entry.card.id) === desired && entry.card.cost <= remainingEnergy);
            if (match) {
                chosen.push({ ...match.card });
                used.add(match.index);
                remainingEnergy -= match.card.cost;
            }
        }
    }
    if (chosen.length === 0 && remainingEnergy > 0) {
        const affordable = available
            .filter(entry => !used.has(entry.index) && entry.card.cost <= remainingEnergy)
            .sort((a, b) => a.card.cost - b.card.cost);
        if (affordable.length > 0) {
            const pick = affordable[0];
            chosen.push({ ...pick.card });
            used.add(pick.index);
            remainingEnergy -= pick.card.cost;
        }
    }
    return chosen;
}
function ensureAiPvpSubmission(getState, setState, round) {
    const current = getState();
    if (current.battleContext.type !== 'pvp' || current.pvpMatch?.mode !== 'ai') {
        return [];
    }
    if (current.round !== round) {
        return [];
    }
    const existing = current.pvpRemoteSubmission;
    if (existing && existing.round === round) {
        return existing.cards;
    }
    const evaluate = getState().evaluateCard;
    const aiCards = pickAiPvpCards(current, evaluate);
    const energySnapshot = current.enemyEnergy;
    setState(state => {
        if (state.battleContext.type !== 'pvp' || state.pvpMatch?.mode !== 'ai' || state.round !== round) {
            return {};
        }
        return {
            enemyQueue: aiCards.map(card => ({ card })),
            pvpRemoteSubmission: { round, cards: aiCards, energySnapshot },
            enemyEnergy: energySnapshot,
            pvpOpponentReady: true,
        };
    });
    const aiSummary = aiCards.length > 0
        ? aiCards.map(card => `${card.name} (코스트 ${card.cost})`).join(', ')
        : `선택 가능한 카드 없음 (에너지 ${energySnapshot}, 손패 ${current.enemyHand.length}장)`;
    getState().addLog(`🤖 AI 선언: ${aiSummary}`, 'system');
    return aiCards;
}
const initialEntityStatus = {
    statuses: [],
    shield: 0,
    shieldDuration: 0,
    guard: 0,
    guardDuration: 0,
    vulnerable: 0,
    attackBuff: 0,
    regen: 0,
    regenDuration: 0,
    priorityBoost: 0,
    priorityBoostDuration: 0,
    shockStacks: 0,
    evasionCharges: 0,
    evasionDuration: 0,
    nullifyCharges: 0,
    counterValue: 0,
    counterDuration: 0,
    immuneKeywords: [],
    immuneDuration: 0,
    nextCardDuplicate: undefined,
    bleedStacks: 0,
    bleedDuration: 0,
    bleedDamagePerStack: 0,
    reactiveArmorCharges: 0,
    reactiveArmorReflectRatio: 0,
    reactiveArmorShieldRatio: 0,
    reactiveArmorDuration: 0,
    energyBoostPending: 0,
    energyBoostDuration: 0,
    rootDuration: 0,
    markStacks: 0,
    markDuration: 0,
    markDamageAmp: 0,
    onHitStatuses: [],
    nullifyTriggerEffects: [],
    summons: [],
};
/**
 * 스테이지별 적 덱 구성 함수
 * - 스테이지 난이도에 따라 점진적으로 카드 추가
 * - 1-5: 기본 Normal 카드만 (플레이어보다 약하게)
 * - 6-10: Normal + 해당 캐릭터 Rare 카드 일부
 * - 11-20: 이전 카드 + Epic 카드 일부
 * - 21+: 이전 카드 + Legendary 카드 일부
 */
function getEnemyDeckForStage(stageId, allCards, campaignStages) {
    const stage = campaignStages.find(s => s.id === stageId);
    if (!stage) {
        // 스테이지 정보가 없으면 기본 덱
        return getBasicEnemyDeck(allCards);
    }
    // 적 캐릭터 이름 추출 (enemyImage에서)
    const enemyImage = stage.enemyImage || '';
    const characterName = extractCharacterNameFromImage(enemyImage);
    // 스테이지 난이도에 따른 카드 풀 구성
    let availableCards = [];
    if (stageId <= 5) {
        // 1-5 스테이지: 기본 Normal 카드만 (플레이어보다 약하게)
        // 해당 캐릭터의 Normal 카드만 사용, 코스트 1-2 제한
        availableCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Normal' &&
                c.cost <= 2;
        });
        // 해당 캐릭터 카드가 부족하면 일반 Normal 카드로 보충
        if (availableCards.length < 10) {
            const fallbackCards = allCards.filter(c => c.rarity === 'Normal' && c.cost <= 1);
            availableCards = [...availableCards, ...fallbackCards];
        }
    }
    else if (stageId <= 10) {
        // 6-10 스테이지: Normal + 해당 캐릭터 Rare 카드 일부
        const normalCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Normal' &&
                c.cost <= 2;
        });
        const rareCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Rare' &&
                c.cost <= 2;
        });
        // Normal 70%, Rare 30%
        availableCards = [
            ...normalCards,
            ...rareCards.slice(0, Math.ceil(rareCards.length * 0.3))
        ];
    }
    else if (stageId <= 20) {
        // 11-20 스테이지: 이전 카드 + Epic 카드 일부
        const normalCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Normal' &&
                c.cost <= 3;
        });
        const rareCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Rare' &&
                c.cost <= 3;
        });
        const epicCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Epic' &&
                c.cost <= 3;
        });
        // Normal 50%, Rare 30%, Epic 20%
        availableCards = [
            ...normalCards,
            ...rareCards,
            ...epicCards.slice(0, Math.ceil(epicCards.length * 0.2))
        ];
    }
    else {
        // 21+ 스테이지: 이전 카드 + Legendary 카드 일부
        const normalCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Normal';
        });
        const rareCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Rare';
        });
        const epicCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Epic';
        });
        const legendaryCards = allCards.filter(c => {
            const cardChar = extractCharacterFromCardId(c.id);
            return cardChar === characterName &&
                c.rarity === 'Legendary';
        });
        // Normal 40%, Rare 30%, Epic 20%, Legendary 10%
        availableCards = [
            ...normalCards,
            ...rareCards,
            ...epicCards,
            ...legendaryCards.slice(0, Math.ceil(legendaryCards.length * 0.1))
        ];
    }
    // 덱 구성: 공격 40% (8장), 방어 30% (6장), 회복 20% (4장), 특수 10% (2장)
    const attackCards = availableCards.filter(c => c.type === 'Attack');
    const defenseCards = availableCards.filter(c => c.type === 'Defense');
    const healCards = availableCards.filter(c => c.type === 'Heal');
    const specialCards = availableCards.filter(c => c.type === 'Special');
    const deck = [];
    const timestamp = Date.now();
    let cardIndex = 0;
    // 공격 8장 (40%)
    const attackCount = Math.min(8, attackCards.length);
    const shuffledAttack = [...attackCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < attackCount; i++) {
        const card = shuffledAttack[i % shuffledAttack.length];
        deck.push({ ...card, id: `${card.id}_enemy_${timestamp}_${cardIndex++}` });
    }
    // 방어 6장 (30%)
    const defenseCount = Math.min(6, defenseCards.length);
    const shuffledDefense = [...defenseCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < defenseCount; i++) {
        const card = shuffledDefense[i % shuffledDefense.length];
        deck.push({ ...card, id: `${card.id}_enemy_${timestamp}_${cardIndex++}` });
    }
    // 회복 4장 (20%)
    const healCount = Math.min(4, healCards.length);
    const shuffledHeal = [...healCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < healCount; i++) {
        const card = shuffledHeal[i % shuffledHeal.length];
        deck.push({ ...card, id: `${card.id}_enemy_${timestamp}_${cardIndex++}` });
    }
    // 특수 2장 (10%)
    const specialCount = Math.min(2, specialCards.length);
    const shuffledSpecial = [...specialCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < specialCount; i++) {
        const card = shuffledSpecial[i % shuffledSpecial.length];
        deck.push({ ...card, id: `${card.id}_enemy_${timestamp}_${cardIndex++}` });
    }
    // 부족하면 랜덤으로 채우기
    if (deck.length < 20) {
        const remaining = availableCards.filter(c => !deck.some(d => {
            const deckBaseId = d.id.split('_enemy_')[0];
            const cardBaseId = c.id;
            return deckBaseId === cardBaseId;
        }));
        const needed = 20 - deck.length;
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);
        for (let i = 0; i < needed && i < shuffled.length; i++) {
            const card = shuffled[i];
            deck.push({ ...card, id: `${card.id}_enemy_${timestamp}_${cardIndex++}` });
        }
    }
    return deck.slice(0, 20).sort(() => Math.random() - 0.5);
}
/**
 * 기본 적 덱 (스테이지 정보 없을 때)
 */
function getBasicEnemyDeck(allCards) {
    const basicCards = allCards.filter(c => c.rarity === 'Normal' && c.cost <= 1);
    const shuffled = [...basicCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20).map((card, i) => ({
        ...card,
        id: `${card.id}_enemy_basic_${Date.now()}_${i}`
    }));
}
/**
 * 이미지 경로에서 캐릭터 이름 추출
 * 예: 'characters/lucian_rosegarden.webp' -> 'LUCIAN'
 */
function extractCharacterNameFromImage(imagePath) {
    const match = imagePath.match(/\/([^\/]+)\.[a-z0-9]+$/i);
    if (!match)
        return '';
    const filename = match[1];
    // lucian_rosegarden -> LUCIAN
    const parts = filename.split('_');
    return parts[0].toUpperCase();
}
/**
 * 카드 ID에서 캐릭터 이름 추출
 * 예: 'ATT_ARIANA_NO_001' -> 'ARIANA'
 */
function extractCharacterFromCardId(cardId) {
    const parts = cardId.split('_');
    if (parts.length >= 2) {
        return parts[1]; // ARIANA, LUCIAN 등
    }
    return '';
}
export const STARTER_DECK_CARD_IDS = [
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
];
export const STARTER_COLLECTION_CARD_IDS = [
    ...STARTER_DECK_CARD_IDS,
    'ATT_ELDER_NO_033',
    'DEF_KAI_NO_109',
    'DEF_MARCUS_NO_157',
    'HEA_KAI_NO_101',
    'HEA_MARCUS_NO_149',
    'SPE_ELDER_NO_041',
    'SPE_LUCIAN_NO_213',
];
const RANK_TIERS = [
    { label: '브론즈', color: '#b87333' },
    { label: '실버', color: '#c0d4ff' },
    { label: '골드', color: '#fbc02d' },
    { label: '플래티넘', color: '#5ce1e6' },
    { label: '다이아몬드', color: '#82b1ff' },
    { label: '마스터', color: '#f48fb1' },
];
const RANK_LEVELS = ['V', 'IV', 'III', 'II', 'I'];
const WINS_PER_RANK = 5;
export const PVP_RANKS = (() => {
    const ranks = [];
    let winThreshold = 0;
    RANK_TIERS.forEach((tier) => {
        RANK_LEVELS.forEach((level) => {
            ranks.push({
                name: `${tier.label} ${level}`,
                minWins: winThreshold,
                color: tier.color,
            });
            winThreshold += WINS_PER_RANK;
        });
    });
    return ranks;
})();
export function getPvpRankInfo(wins) {
    const cappedWins = Math.max(0, Math.floor(wins));
    let rank = PVP_RANKS[0];
    for (const candidate of PVP_RANKS) {
        if (cappedWins >= candidate.minWins) {
            rank = candidate;
        }
        else {
            break;
        }
    }
    const index = PVP_RANKS.findIndex(r => r === rank);
    const nextRank = PVP_RANKS[index + 1] ?? null;
    return {
        name: rank.name,
        color: rank.color,
        minWins: rank.minWins,
        index,
        nextRankName: nextRank?.name ?? null,
        nextMinWins: nextRank?.minWins ?? null,
    };
}
/**
 * 초기 덱 20장 구성 함수
 * - 공격 6장, 방어 5장, 회복 4장, 특수 5장
 * - 대부분 Normal 등급, 신규 확장 카드 포함
 */
function getInitialDeck(allCards) {
    const initialCardIds = STARTER_DECK_CARD_IDS;
    // 카드 ID로 카드 찾기
    const cardMap = new Map(allCards.map(card => [card.id, card]));
    const initialDeck = [];
    for (const cardId of initialCardIds) {
        const card = cardMap.get(cardId);
        if (card) {
            // 각 카드는 고유 ID로 복사 (덱에서 중복 허용)
            initialDeck.push({ ...card, id: `${card.id}_${Date.now()}_${Math.random()}` });
        }
        else {
            console.warn(`[InitialDeck] Card not found: ${cardId}`);
        }
    }
    // 카드가 부족하면 Normal 등급 카드로 채우기
    if (initialDeck.length < 20) {
        const normalCards = allCards.filter(c => c.rarity === 'Normal' && c.cost <= 2);
        const needed = 20 - initialDeck.length;
        const shuffled = [...normalCards].sort(() => Math.random() - 0.5);
        for (let i = 0; i < needed && i < shuffled.length; i++) {
            const card = shuffled[i];
            initialDeck.push({ ...card, id: `${card.id}_${Date.now()}_${Math.random()}` });
        }
    }
    return initialDeck.slice(0, 20);
}
export const useBattleStore = create((set, get) => {
    const resolveDeckSnapshot = (snapshot, fallback) => {
        if (!Array.isArray(snapshot) || snapshot.length === 0) {
            return [];
        }
        const state = get();
        const pools = [];
        if (state.allCardsPool.length > 0) {
            pools.push(state.allCardsPool);
        }
        if (state.collection.length > 0) {
            pools.push(state.collection);
        }
        if (fallback && fallback.length > 0) {
            pools.push(fallback);
        }
        if (state.playerDeck.length > 0) {
            pools.push(state.playerDeck);
        }
        for (const pool of pools) {
            const deck = buildDeckFromSnapshot(snapshot, pool);
            if (deck.length > 0) {
                return deck;
            }
        }
        return [];
    };
    const isOnlinePvpMatch = () => {
        const state = get();
        return state.battleContext.type === 'pvp' && state.pvpMatch?.mode === 'online';
    };
    const consumePvpRandom = () => {
        const state = get();
        const value = getSeededRandom(state.roundSeed, state.pvpRandomCounter);
        set({ pvpRandomCounter: state.pvpRandomCounter + 1 });
        return value;
    };
    const shuffleForCurrentContext = (items) => {
        if (!isOnlinePvpMatch()) {
            const copy = [...items];
            copy.sort(() => Math.random() - 0.5);
            return copy;
        }
        const state = get();
        const seed = state.roundSeed;
        let counter = state.pvpRandomCounter;
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const rand = getSeededRandom(seed, counter++);
            const j = Math.floor(rand * (i + 1));
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        set({ pvpRandomCounter: counter });
        return result;
    };
    const pickRandomIndex = (length) => {
        if (length <= 0) {
            return 0;
        }
        const roll = isOnlinePvpMatch() ? consumePvpRandom() : Math.random();
        return Math.floor(roll * length);
    };
    return {
        // 화면 상태
        gameScreen: 'intro',
        setGameScreen: (screen) => {
            const currentState = get();
            // console.log(`[GameScreen] 🔄 CHANGING: ${currentState.gameScreen} → ${screen}`);
            // console.log(`[GameScreen]   Before - hand: ${currentState.hand.length}, enemyHand: ${currentState.enemyHand.length}`);
            set({ gameScreen: screen });
            const newState = get();
            // console.log(`[GameScreen]   After - hand: ${newState.hand.length}, enemyHand: ${newState.enemyHand.length}`);
            // console.log(`[GameScreen] ✅ Changed to: ${screen}`);
        },
        // 리플레이 시스템
        replayHistory: [],
        recordReplayAction: (action) => {
            const history = [...get().replayHistory, action];
            set({ replayHistory: history });
            // console.log(`[Replay] Recorded round ${action.round}, seed: ${action.seed}`);
        },
        exportReplay: () => {
            const state = get();
            const replay = {
                timestamp: new Date().toISOString(),
                stage: state.currentStage,
                initialSeed: state.replayHistory[0]?.seed || state.roundSeed,
                actions: state.replayHistory,
                result: state.gameOver,
            };
            const json = JSON.stringify(replay, null, 2);
            // console.log('[Replay] Exported:', json);
            return json;
        },
        // 재화 시스템
        gold: 1200, // 초기 골드 (시작 패키지 구매 가능)
        shards: 80, // 초기 파편
        pvpWins: 0,
        addGold: (amount) => {
            const current = get().gold;
            set({ gold: current + amount });
            triggerCloudSave();
            // console.log(`[Currency] Gold: ${current} -> ${current + amount} (+${amount})`);
        },
        addShards: (amount) => {
            const current = get().shards;
            set({ shards: current + amount });
            triggerCloudSave();
            // console.log(`[Currency] Shards: ${current} -> ${current + amount} (+${amount})`);
        },
        // 상점 시스템
        getCardPacks: () => {
            return [
                {
                    id: 'pack_normal',
                    name: '일반 카드팩',
                    type: 'normal',
                    price: 100,
                    priceType: 'gold',
                    description: '기본 카드팩',
                    rates: { Normal: 70, Rare: 25, Epic: 4, Legendary: 1 }
                },
                {
                    id: 'pack_rare',
                    name: '레어 카드팩',
                    type: 'rare',
                    price: 250,
                    priceType: 'gold',
                    description: '레어 카드 확률 증가',
                    rates: { Normal: 50, Rare: 40, Epic: 8, Legendary: 2 }
                },
                {
                    id: 'pack_epic',
                    name: '에픽 카드팩',
                    type: 'epic',
                    price: 500,
                    priceType: 'gold',
                    description: '에픽 카드 확률 증가',
                    rates: { Normal: 30, Rare: 40, Epic: 25, Legendary: 5 }
                },
                {
                    id: 'pack_legendary',
                    name: '전설 카드팩',
                    type: 'legendary',
                    price: 1000,
                    priceType: 'gold',
                    description: '전설 카드 확률 증가',
                    rates: { Normal: 0, Rare: 20, Epic: 50, Legendary: 30 }
                },
                {
                    id: 'pack_premium',
                    name: '프리미엄 카드팩',
                    type: 'epic',
                    price: 50,
                    priceType: 'shards',
                    description: '파편으로 구매하는 고급 팩',
                    rates: { Normal: 20, Rare: 30, Epic: 40, Legendary: 10 }
                }
            ];
        },
        buyCardPack: (packType) => {
            const state = get();
            const packs = get().getCardPacks();
            const pack = packs.find(p => p.type === packType);
            if (!pack) {
                console.error(`[Shop] Pack type not found: ${packType}`);
                return null;
            }
            // 가격 체크
            if (pack.priceType === 'gold') {
                if (state.gold < pack.price) {
                    console.warn(`[Shop] Not enough gold: ${state.gold} < ${pack.price}`);
                    return null;
                }
                get().addGold(-pack.price);
            }
            else if (pack.priceType === 'shards') {
                if (state.shards < pack.price) {
                    console.warn(`[Shop] Not enough shards: ${state.shards} < ${pack.price}`);
                    return null;
                }
                get().addShards(-pack.price);
            }
            // 가챠 확률 계산
            const roll = Math.random() * 100;
            let selectedRarity = 'Normal';
            let cumulative = 0;
            for (const [rarity, rate] of Object.entries(pack.rates)) {
                cumulative += rate;
                if (roll < cumulative) {
                    selectedRarity = rarity;
                    break;
                }
            }
            // 해당 레어도의 카드 중 랜덤 선택 (전체 카드 풀에서)
            const cardPool = state.allCardsPool.length > 0 ? state.allCardsPool : state.collection;
            const availableCards = cardPool.filter(c => c.rarity === selectedRarity);
            if (availableCards.length === 0) {
                console.warn(`[Shop] No cards available for rarity: ${selectedRarity}`);
                // 레어도가 없으면 Normal로 폴백
                const fallbackCards = cardPool.filter(c => c.rarity === 'Normal');
                if (fallbackCards.length === 0) {
                    return null;
                }
                const randomIndex = Math.floor(Math.random() * fallbackCards.length);
                const selectedCard = fallbackCards[randomIndex];
                // 컬렉션에 추가 (중복 허용)
                const newCollection = [...state.collection, { ...selectedCard, id: `${selectedCard.id}_${Date.now()}` }];
                set({ collection: newCollection });
                triggerCloudSave();
                return selectedCard;
            }
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const selectedCard = availableCards[randomIndex];
            // 컬렉션에 추가 (중복 허용 - 같은 카드를 여러 장 가질 수 있음)
            const newCollection = [...state.collection, { ...selectedCard, id: `${selectedCard.id}_${Date.now()}` }];
            set({ collection: newCollection });
            triggerCloudSave();
            console.log(`[Shop] Pack opened: ${pack.name}, Got: ${selectedCard.name} (${selectedRarity})`);
            return selectedCard;
        },
        // PvP 시스템
        pvpQueueStatus: 'idle',
        pvpStatusMessage: '',
        pvpError: null,
        pvpMatch: null,
        pvpChannel: null,
        pvpRealtimeConnected: false,
        pvpLocalSubmissionRound: null,
        pvpRemoteSubmission: null,
        pvpLastResolvedRound: 0,
        pvpRandomCounter: 0,
        pvpLocalReady: false,
        pvpOpponentReady: false,
        pvpTurnDuration: DEFAULT_PVP_TURN_DURATION,
        pvpTurnTimeLeft: null,
        pvpTurnTimerActive: false,
        pvpSearchElapsed: 0,
        pvpEstimatedWaitSeconds: null,
        startPvpTurnTimer: (forceRestart = false) => {
            const state = get();
            if (state.battleContext.type !== 'pvp' || state.gameOver !== 'none' || !state.pvpMatch) {
                return;
            }
            if (!forceRestart && state.pvpTurnTimerActive) {
                return;
            }
            if (!forceRestart && state.pvpLocalReady) {
                return;
            }
            if (pvpTurnTimerInterval !== null && typeof window !== 'undefined') {
                window.clearInterval(pvpTurnTimerInterval);
                pvpTurnTimerInterval = null;
            }
            const duration = state.pvpTurnDuration || DEFAULT_PVP_TURN_DURATION;
            set({
                pvpTurnDuration: duration,
                pvpTurnTimeLeft: duration,
                pvpTurnTimerActive: true,
            });
            clearPvpAiDecisionTimer();
            if (typeof window === 'undefined') {
                return;
            }
            if (state.pvpMatch.mode === 'ai') {
                const targetRound = get().round;
                const durationMs = (get().pvpTurnDuration || DEFAULT_PVP_TURN_DURATION) * 1000;
                const minDelay = 3000;
                const maxDelay = Math.max(minDelay + 1000, durationMs - 1000);
                const randomDelay = minDelay + Math.floor(Math.random() * Math.max(1, maxDelay - minDelay));
                const clampedDelay = Math.min(Math.max(minDelay, randomDelay), Math.max(minDelay, durationMs - 1000));
                pvpAiDecisionTimer = window.setTimeout(() => {
                    pvpAiDecisionTimer = null;
                    const cards = ensureAiPvpSubmission(get, set, targetRound);
                    if (cards.length > 0) {
                        get().addLog(`AI 상대가 선언을 완료했습니다.`, 'system');
                    }
                    else {
                        get().addLog(`AI 상대가 이번 턴에는 행동하지 않습니다.`, 'system');
                    }
                    void get().tryResolvePvpRound(targetRound);
                }, clampedDelay);
            }
            pvpTurnTimerInterval = window.setInterval(() => {
                const current = get();
                if (current.battleContext.type !== 'pvp' || current.gameOver !== 'none') {
                    current.stopPvpTurnTimer(true);
                    return;
                }
                if (current.pvpLocalReady) {
                    current.stopPvpTurnTimer();
                    return;
                }
                const remaining = (current.pvpTurnTimeLeft ?? current.pvpTurnDuration ?? DEFAULT_PVP_TURN_DURATION) - 1;
                if (remaining <= 0) {
                    set({ pvpTurnTimeLeft: 0 });
                    current.stopPvpTurnTimer();
                    current.handlePvpTurnTimeout();
                }
                else {
                    set({ pvpTurnTimeLeft: remaining });
                }
            }, 1000);
        },
        stopPvpTurnTimer: (resetState = false) => {
            if (pvpTurnTimerInterval !== null && typeof window !== 'undefined') {
                window.clearInterval(pvpTurnTimerInterval);
                pvpTurnTimerInterval = null;
            }
            clearPvpAiDecisionTimer();
            set(state => ({
                pvpTurnTimerActive: false,
                pvpTurnTimeLeft: resetState ? null : state.pvpTurnTimeLeft,
            }));
        },
        handlePvpTurnTimeout: () => {
            const state = get();
            if (state.battleContext.type !== 'pvp' || state.gameOver !== 'none' || state.pvpLocalReady) {
                return;
            }
            get().addLog('⏳ 제한 시간이 초과되어 자동으로 턴이 종료됩니다.', 'system');
            if (state.pvpMatch?.mode === 'ai') {
                clearPvpAiDecisionTimer();
                ensureAiPvpSubmission(get, set, state.round);
                void get().submitPvpTurn();
                return;
            }
            void get().endPlayerTurn();
        },
        startPvpMatchmaking: async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData.session;
            if (!session) {
                set({ pvpQueueStatus: 'error', pvpError: '로그인 후 이용 가능합니다.' });
                return;
            }
            const userId = session.user.id;
            clearPvpPolling();
            clearPvpSearchTimers();
            get().stopPvpTurnTimer(true);
            set(state => {
                const isPvp = state.battleContext.type === 'pvp';
                return {
                    pvpQueueStatus: 'searching',
                    pvpStatusMessage: buildPvpSearchStatusMessage(0),
                    pvpError: null,
                    pvpMatch: null,
                    pvpSearchElapsed: 0,
                    pvpEstimatedWaitSeconds: PVP_AI_ESTIMATE_MIN_SECONDS,
                    pvpLocalSubmissionRound: isPvp ? state.pvpLocalSubmissionRound : null,
                    pvpRemoteSubmission: isPvp ? state.pvpRemoteSubmission : null,
                    pvpLastResolvedRound: 0,
                    pvpLocalReady: false,
                    pvpOpponentReady: false,
                    pvpTurnTimeLeft: null,
                    pvpTurnTimerActive: false,
                };
            });
            try {
                await supabase.rpc('pvp_cleanup_stale');
            }
            catch (error) {
                console.warn('[PvP] cleanup rpc failed (non-blocking)', error);
            }
            const deckSnapshot = getDeckSnapshot(get().playerDeck);
            const queuePayload = {
                user_id: userId,
                status: 'waiting',
                opponent_id: null,
                match_id: null,
                deck_snapshot: deckSnapshot,
                updated_at: new Date().toISOString(),
            };
            const upsertResult = await supabase.from('pvp_queue').upsert(queuePayload);
            if (upsertResult.error) {
                set({ pvpQueueStatus: 'error', pvpError: upsertResult.error.message });
                clearPvpSearchTimers();
                console.error('[PvP] Failed to join queue', upsertResult.error, queuePayload);
                return;
            }
            console.log('[PvP] Joined queue', { userId, deckSnapshotSize: deckSnapshot.length });
            registerPvpUnloadCleanup(userId);
            if (typeof window !== 'undefined') {
                const searchStartedAt = Date.now();
                clearPvpSearchTimers();
                set({
                    pvpSearchElapsed: 0,
                    pvpEstimatedWaitSeconds: PVP_AI_ESTIMATE_MIN_SECONDS,
                    pvpStatusMessage: buildPvpSearchStatusMessage(0),
                });
                pvpSearchTimer = window.setInterval(() => {
                    const state = get();
                    if (state.pvpQueueStatus !== 'searching') {
                        clearPvpSearchTimers();
                        return;
                    }
                    const elapsed = Math.floor((Date.now() - searchStartedAt) / 1000);
                    if (elapsed !== state.pvpSearchElapsed) {
                        console.log('[PvP] Matchmaking wait elapsed', elapsed);
                    }
                    set({
                        pvpSearchElapsed: elapsed,
                        pvpStatusMessage: buildPvpSearchStatusMessage(elapsed),
                    });
                }, 1000);
                const fallbackDelay = PVP_AI_FALLBACK_MIN_MS + Math.floor(Math.random() * (PVP_AI_FALLBACK_MAX_MS - PVP_AI_FALLBACK_MIN_MS));
                pvpAiFallbackTimer = window.setTimeout(() => {
                    const currentState = get();
                    if (currentState.pvpQueueStatus !== 'searching') {
                        return;
                    }
                    void (async () => {
                        try {
                            const { data: refreshedSessionData } = await supabase.auth.getSession();
                            const refreshedSession = refreshedSessionData.session;
                            if (refreshedSession) {
                                await supabase.from('pvp_queue').delete().eq('user_id', refreshedSession.user.id);
                            }
                        }
                        catch (error) {
                            console.warn('[PvP] Failed to clear queue before AI fallback', error);
                        }
                        finally {
                            detachPvpUnloadCleanup();
                        }
                        clearPvpPolling();
                        clearPvpSearchTimers();
                        const fallbackState = get();
                        if (fallbackState.pvpQueueStatus !== 'searching') {
                            return;
                        }
                        const playerDeck = fallbackState.playerDeck;
                        const cardsPool = fallbackState.allCardsPool;
                        const snapshot = getDeckSnapshot(playerDeck);
                        let opponentDeckCards = resolveDeckSnapshot(snapshot, playerDeck);
                        if (opponentDeckCards.length === 0) {
                            opponentDeckCards = playerDeck.map((card, index) => ({
                                ...card,
                                id: `${normalizeCardId(card.id)}__ai__${index}`,
                            }));
                        }
                        const aiName = getRandomFakeOpponentName();
                        const matchId = `ai-${Date.now()}`;
                        const seed = Math.floor(Math.random() * 1000000);
                        set({
                            pvpQueueStatus: 'matched',
                            pvpStatusMessage: `${aiName}와의 모의전이 준비되었습니다.`,
                            pvpMatch: {
                                matchId,
                                seed,
                                opponentId: matchId,
                                opponentName: aiName,
                                opponentDeckSnapshot: snapshot,
                                opponentDeckCards,
                                playerDeckSnapshot: snapshot,
                                playerRole: 'player2',
                                status: 'pending',
                                mode: 'ai',
                            },
                            pvpSearchElapsed: fallbackState.pvpSearchElapsed,
                            pvpEstimatedWaitSeconds: null,
                        });
                        void Promise.resolve().then(() => get().acceptPvpMatch());
                    })();
                }, fallbackDelay);
            }
            const opponentRes = await supabase
                .from('pvp_queue')
                .select('user_id, deck_snapshot, updated_at')
                .eq('status', 'waiting')
                .neq('user_id', userId)
                .order('updated_at', { ascending: true })
                .limit(1);
            if (opponentRes.error) {
                set({ pvpQueueStatus: 'error', pvpError: opponentRes.error.message });
                clearPvpSearchTimers();
                console.error('[PvP] Failed to search opponent', opponentRes.error);
                return;
            }
            console.log('[PvP] Opponent search result', opponentRes.data?.length ?? 0);
            if (opponentRes.data && opponentRes.data.length > 0) {
                const opponent = opponentRes.data[0];
                const matchId = generateUuid();
                const seed = Math.floor(Math.random() * 1000000);
                const insertedMatch = await supabase.from('pvp_matches').insert({
                    id: matchId,
                    player1_id: opponent.user_id,
                    player2_id: userId,
                    seed,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    player1_deck: opponent.deck_snapshot ?? [],
                    player2_deck: deckSnapshot,
                });
                if (insertedMatch.error) {
                    set({ pvpQueueStatus: 'error', pvpError: insertedMatch.error.message });
                    console.error('[PvP] Failed to create match row', insertedMatch.error);
                    return;
                }
                await Promise.all([
                    supabase.from('pvp_queue').update({ status: 'matched', match_id: matchId, opponent_id: opponent.user_id }).eq('user_id', userId),
                    supabase.from('pvp_queue').update({ status: 'matched', match_id: matchId, opponent_id: userId }).eq('user_id', opponent.user_id),
                ]);
                const opponentProfile = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('user_id', opponent.user_id)
                    .maybeSingle();
                const opponentDeckSnapshot = opponent.deck_snapshot ?? [];
                const opponentDeckCards = resolveDeckSnapshot(opponentDeckSnapshot);
                clearPvpSearchTimers();
                set({
                    pvpQueueStatus: 'matched',
                    pvpStatusMessage: '상대와 매칭되었습니다.',
                    pvpMatch: {
                        matchId,
                        seed,
                        opponentId: opponent.user_id,
                        opponentName: opponentProfile.data?.display_name ?? null,
                        opponentDeckSnapshot,
                        opponentDeckCards,
                        playerDeckSnapshot: deckSnapshot,
                        playerRole: 'player2',
                        status: 'pending',
                        mode: 'online',
                    },
                    pvpEstimatedWaitSeconds: null,
                });
                void Promise.resolve().then(() => get().acceptPvpMatch());
                return;
            }
            clearPvpPolling();
            pvpPollTimer = window.setInterval(async () => {
                const queueRes = await supabase
                    .from('pvp_queue')
                    .select('status, match_id, opponent_id')
                    .eq('user_id', userId)
                    .maybeSingle();
                if (queueRes.error) {
                    set({ pvpQueueStatus: 'error', pvpError: queueRes.error.message });
                    clearPvpPolling();
                    clearPvpSearchTimers();
                    return;
                }
                const queueRow = queueRes.data;
                if (!queueRow || queueRow.status !== 'matched' || !queueRow.match_id) {
                    return;
                }
                clearPvpPolling();
                const matchRes = await supabase
                    .from('pvp_matches')
                    .select('id, player1_id, player2_id, seed, player1_deck, player2_deck')
                    .eq('id', queueRow.match_id)
                    .maybeSingle();
                if (matchRes.error || !matchRes.data) {
                    set({ pvpQueueStatus: 'error', pvpError: matchRes.error?.message ?? '매치 정보를 불러오지 못했습니다.' });
                    return;
                }
                const match = matchRes.data;
                const playerRole = match.player1_id === userId ? 'player1' : 'player2';
                const opponentId = playerRole === 'player1' ? match.player2_id : match.player1_id;
                const opponentSnapshot = ((playerRole === 'player1' ? match.player2_deck : match.player1_deck) ?? []);
                const ownSnapshot = ((playerRole === 'player1' ? match.player1_deck : match.player2_deck) ?? []);
                const opponentDeckCards = resolveDeckSnapshot(opponentSnapshot);
                const opponentProfile = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('user_id', opponentId)
                    .maybeSingle();
                clearPvpSearchTimers();
                set({
                    pvpQueueStatus: 'matched',
                    pvpStatusMessage: '상대와 매칭되었습니다.',
                    pvpMatch: {
                        matchId: match.id,
                        seed: match.seed ?? 0,
                        opponentId,
                        opponentName: opponentProfile.data?.display_name ?? null,
                        opponentDeckSnapshot: opponentSnapshot ?? [],
                        opponentDeckCards,
                        playerDeckSnapshot: ownSnapshot ?? deckSnapshot,
                        playerRole,
                        status: 'pending',
                        mode: 'online',
                    },
                    pvpEstimatedWaitSeconds: null,
                });
                void Promise.resolve().then(() => get().acceptPvpMatch());
            }, 2000);
        },
        cancelPvpMatchmaking: async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData.session;
            clearPvpPolling();
            clearPvpSearchTimers();
            detachPvpUnloadCleanup();
            if (session) {
                await supabase.from('pvp_queue').delete().eq('user_id', session.user.id);
            }
            set({
                pvpQueueStatus: 'idle',
                pvpStatusMessage: '',
                pvpError: null,
                pvpMatch: null,
                pvpSearchElapsed: 0,
                pvpEstimatedWaitSeconds: null,
            });
            await get().disconnectPvpChannel();
        },
        acceptPvpMatch: async () => {
            const match = get().pvpMatch;
            if (!match || match.status === 'ready')
                return;
            if (match.mode === 'ai') {
                detachPvpUnloadCleanup();
                clearPvpSearchTimers();
                set({
                    pvpQueueStatus: 'idle',
                    pvpStatusMessage: 'AI 모의전을 시작합니다.',
                    pvpError: null,
                });
                set({
                    battleContext: { type: 'pvp', pvpMatchId: match.matchId, pvpSeed: match.seed },
                    pvpMatch: { ...match, status: 'ready' },
                });
                const cardsPool = get().allCardsPool;
                get().initGame(cardsPool);
                get().setGameScreen('battle');
                return;
            }
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData.session;
            if (!session) {
                set({ pvpError: '로그인 세션이 만료되었습니다.', pvpQueueStatus: 'error' });
                return;
            }
            await supabase.from('pvp_queue').delete().eq('user_id', session.user.id);
            detachPvpUnloadCleanup();
            set(state => ({
                battleContext: { type: 'pvp', pvpMatchId: match.matchId, pvpSeed: match.seed },
                pvpMatch: match ? { ...match, status: 'ready' } : null,
            }));
            set({ pvpQueueStatus: 'idle', pvpStatusMessage: '' });
            const cardsPool = get().allCardsPool;
            const resolvedPlayerDeck = match.playerRole === 'player1'
                ? resolveDeckSnapshot(match.playerDeckSnapshot, get().playerDeck)
                : get().playerDeck;
            if (match.playerRole === 'player1' && resolvedPlayerDeck.length > 0) {
                set({ playerDeck: resolvedPlayerDeck });
            }
            await get().connectPvpChannel(match);
            get().initGame(cardsPool);
            get().setGameScreen('battle');
        },
        reportPvpResult: async (result) => {
            const match = get().pvpMatch;
            if (!match)
                return;
            if (match.mode === 'ai') {
                if (result === 'victory') {
                    set(state => ({ pvpWins: (state.pvpWins ?? 0) + 1 }));
                }
                triggerCloudSave();
                set({
                    pvpMatch: { ...match, status: 'completed' },
                    pvpQueueStatus: 'idle',
                    pvpStatusMessage: '',
                });
                await get().disconnectPvpChannel();
                return;
            }
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData.session;
            if (!session)
                return;
            const outcome = await supabase.from('pvp_matches').update({
                status: 'completed',
                result,
                completed_at: new Date().toISOString(),
                winner_id: result === 'victory' ? session.user.id : result === 'defeat' ? match.opponentId : null,
            }).eq('id', match.matchId);
            if (outcome.error) {
                console.error('[PvP] Failed to report match result', outcome.error);
            }
            await supabase.from('pvp_queue').delete().eq('user_id', session.user.id);
            detachPvpUnloadCleanup();
            if (result === 'victory') {
                set(state => ({ pvpWins: (state.pvpWins ?? 0) + 1 }));
            }
            triggerCloudSave();
            set({ pvpMatch: { ...match, status: 'completed' }, pvpQueueStatus: 'idle', pvpStatusMessage: '' });
            await get().disconnectPvpChannel();
        },
        connectPvpChannel: async (match) => {
            if (match.mode !== 'online') {
                set({
                    pvpChannel: null,
                    pvpRealtimeConnected: false,
                });
                return;
            }
            const existing = get().pvpChannel;
            if (existing) {
                try {
                    await existing.unsubscribe();
                }
                catch (error) {
                    console.warn('[PvP] Failed to unsubscribe existing channel', error);
                }
            }
            const channel = supabase.channel(`pvp:${match.matchId}`, {
                config: {
                    broadcast: { ack: true },
                },
            });
            channel.on('broadcast', { event: 'turn:submit' }, ({ payload }) => {
                const data = payload;
                if (!data || data.matchId !== match.matchId) {
                    return;
                }
                const state = get();
                if (state.battleContext.type !== 'pvp')
                    return;
                if (data.round < state.round) {
                    return;
                }
                const cards = data.cards.map(deserializeCard);
                set(current => {
                    if (current.battleContext.type !== 'pvp') {
                        return {};
                    }
                    if (data.round < current.round) {
                        return {};
                    }
                    return {
                        enemyQueue: cards.map(card => ({ card })),
                        pvpRemoteSubmission: { round: data.round, cards, energySnapshot: data.energy },
                        enemyEnergy: data.energy,
                        pvpOpponentReady: true,
                    };
                });
                get().addLog(`적이 선언을 제출했습니다. (라운드 ${data.round})`, 'system');
                void get().tryResolvePvpRound(data.round);
            });
            let subscribeError = null;
            await new Promise((resolve, reject) => {
                channel.subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        set({ pvpRealtimeConnected: true });
                        resolve();
                    }
                    else if (status === 'CHANNEL_ERROR') {
                        reject(new Error('PVP 채널 구독 실패'));
                    }
                });
                // subscribe returns immediately; resolution handled in callback
            }).catch(error => {
                subscribeError = error instanceof Error ? error : new Error(String(error));
                console.error('[PvP] Channel subscribe error', subscribeError);
                set({ pvpError: subscribeError.message });
            });
            if (subscribeError) {
                try {
                    await channel.unsubscribe();
                }
                catch {
                    // ignore
                }
                return;
            }
            set({
                pvpChannel: channel,
                pvpRealtimeConnected: true,
                pvpOpponentReady: false,
            });
        },
        disconnectPvpChannel: async () => {
            const existing = get().pvpChannel;
            if (existing) {
                try {
                    await existing.unsubscribe();
                }
                catch (error) {
                    console.warn('[PvP] Failed to unsubscribe channel', error);
                }
            }
            get().stopPvpTurnTimer(true);
            set({
                pvpChannel: null,
                pvpRealtimeConnected: false,
                pvpLocalSubmissionRound: null,
                pvpRemoteSubmission: null,
                pvpLocalReady: false,
                pvpOpponentReady: false,
                pvpTurnTimeLeft: null,
                pvpTurnTimerActive: false,
            });
        },
        submitPvpTurn: async () => {
            const state = get();
            if (state.battleContext.type !== 'pvp') {
                return;
            }
            const mode = state.pvpMatch?.mode;
            if (!mode) {
                return;
            }
            const currentRound = state.round;
            if (state.pvpLocalSubmissionRound === currentRound || state.pvpLocalReady) {
                return;
            }
            if (!state.declarationLocked) {
                set({ declarationLocked: true });
            }
            set({ isTurnProcessing: true, pvpError: null });
            get().addLog('플레이어 선언 제출', 'system');
            if (mode === 'ai') {
                get().stopPvpTurnTimer();
                set({
                    pvpLocalSubmissionRound: currentRound,
                    pvpLocalReady: true,
                });
                ensureAiPvpSubmission(get, set, currentRound);
                await get().tryResolvePvpRound(currentRound);
                return;
            }
            if (!state.pvpChannel || !state.pvpMatch) {
                set({ pvpError: 'PVP 채널이 연결되지 않았습니다.' });
                set({ isTurnProcessing: false });
                return;
            }
            const payload = {
                matchId: state.pvpMatch.matchId,
                round: currentRound,
                cards: state.playerQueue.map(entry => serializeCard(entry.card)),
                energy: state.energy,
            };
            const sendStatus = await state.pvpChannel.send({
                type: 'broadcast',
                event: 'turn:submit',
                payload,
            });
            if (sendStatus !== 'ok') {
                console.error('[PvP] Failed to send turn payload', sendStatus);
                set({
                    pvpError: sendStatus === 'timed out'
                        ? '턴 정보를 전송하는 데 시간이 초과되었습니다.'
                        : '턴 정보를 전송하지 못했습니다.',
                    isTurnProcessing: false,
                });
                return;
            }
            get().stopPvpTurnTimer();
            set({
                pvpLocalSubmissionRound: currentRound,
                pvpLocalReady: true,
            });
            await get().tryResolvePvpRound(currentRound);
        },
        tryResolvePvpRound: async (round) => {
            const state = get();
            if (state.battleContext.type !== 'pvp')
                return;
            const mode = state.pvpMatch?.mode;
            if (!mode)
                return;
            if (state.round !== round)
                return;
            if (state.pvpLocalSubmissionRound !== round)
                return;
            const remote = state.pvpRemoteSubmission;
            if (!remote || remote.round !== round)
                return;
            if (state.pvpLastResolvedRound >= round)
                return;
            if (state.isTurnProcessing && state.gameOver !== 'none') {
                return;
            }
            try {
                set(current => ({
                    enemyQueue: remote.cards.map(card => ({ card })),
                    enemyEnergy: remote.energySnapshot,
                    declarationLocked: true,
                    isTurnProcessing: true,
                }));
                await get().revealAndResolve();
                if (get().gameOver !== 'none') {
                    set({
                        pvpRandomCounter: 0,
                        pvpLastResolvedRound: round,
                        pvpLocalSubmissionRound: null,
                        pvpRemoteSubmission: null,
                        pvpLocalReady: false,
                        pvpOpponentReady: false,
                        isTurnProcessing: false,
                    });
                    return;
                }
                get().processStatusEffects();
                const after = get();
                const matchSeed = after.pvpMatch?.seed ?? after.roundSeed;
                const nextRound = round + 1;
                const nextSeed = generateRoundSeed(matchSeed, nextRound);
                const nextPlayerEnergy = Math.min(after.energy + 3, 10);
                const nextEnemyEnergy = Math.min(after.enemyEnergy + 3, 10);
                const turnDuration = after.pvpTurnDuration || DEFAULT_PVP_TURN_DURATION;
                set({
                    round: nextRound,
                    roundSeed: nextSeed,
                    energy: nextPlayerEnergy,
                    enemyEnergy: nextEnemyEnergy,
                    pvpRandomCounter: 0,
                    pvpLastResolvedRound: round,
                    pvpLocalSubmissionRound: null,
                    pvpRemoteSubmission: null,
                    pvpLocalReady: false,
                    pvpOpponentReady: false,
                    pvpTurnTimeLeft: turnDuration,
                    pvpTurnTimerActive: false,
                    isTurnProcessing: false,
                });
                get().addLog(`─── 라운드 ${nextRound} 시작 ───`, 'system');
                get().addLog(`플레이어 에너지: ${nextPlayerEnergy}`, 'system');
                get().addLog(`적 에너지: ${nextEnemyEnergy}`, 'system');
                get().draw(1);
                if (after.battleContext.type === 'pvp' && after.pvpMatch) {
                    get().enemyDraw(1);
                }
                get().startPvpTurnTimer(true);
            }
            catch (error) {
                console.error('[PvP] Failed to resolve round', error);
                set({
                    pvpError: error instanceof Error ? error.message : String(error),
                    isTurnProcessing: false,
                });
            }
        },
        // 캠페인 시스템
        campaignStages: createInitialCampaignStages(),
        completedStageIds: [],
        dailyDungeon: {
            dateKey: '',
            floors: [],
            currentFloorId: null,
            completed: false,
        },
        currentDailyFloorId: null,
        currentStage: null,
        battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
        postBattleScreen: null,
        selectStage: (stageId) => {
            set({
                currentStage: stageId,
                currentDailyFloorId: null,
                battleContext: { type: 'campaign', campaignStageId: stageId, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
                postBattleScreen: 'campaign',
            });
            // console.log(`[Campaign] Selected stage: ${stageId}`);
        },
        clearStage: (stageId) => {
            const stages = get().campaignStages;
            const updatedStages = stages.map(s => s.id === stageId ? { ...s, cleared: true } : s);
            const stage = stages.find(s => s.id === stageId);
            if (stage) {
                set(state => {
                    const alreadyCleared = state.completedStageIds.includes(stageId);
                    return alreadyCleared
                        ? {}
                        : { completedStageIds: [...state.completedStageIds, stageId].sort((a, b) => a - b) };
                });
                // 보상 설정 (테스트용 보상 증폭)
                const isRepeatClear = stage.cleared;
                const baseReward = isRepeatClear ? stage.repeatReward : stage.firstReward;
                const boostedReward = getBoostedStageReward(baseReward, stageId, isRepeatClear);
                set({
                    campaignStages: updatedStages,
                    pendingReward: { gold: boostedReward.gold, shards: boostedReward.shards, cards: [] }
                });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('cloud-save-force'));
                }
                // console.log(`[Campaign] Stage ${stageId} cleared! Reward: ${reward.gold} gold, ${reward.shards} shards`);
            }
        },
        ensureDailyDungeon: () => {
            const state = get();
            const today = getTodayKey();
            if (state.dailyDungeon.dateKey === today && state.dailyDungeon.floors.length > 0) {
                return;
            }
            const floors = generateDailyDungeonFloors(today, state.campaignStages);
            set({
                dailyDungeon: {
                    dateKey: today,
                    floors,
                    currentFloorId: null,
                    completed: floors.every(f => f.cleared),
                },
                currentDailyFloorId: null,
            });
        },
        resetDailyDungeon: () => {
            const today = getTodayKey();
            const floors = generateDailyDungeonFloors(today, get().campaignStages);
            set({
                dailyDungeon: {
                    dateKey: today,
                    floors,
                    currentFloorId: null,
                    completed: false,
                },
                currentDailyFloorId: null,
            });
        },
        enterDailyDungeonFloor: (floorId) => {
            get().ensureDailyDungeon();
            const state = get();
            const daily = state.dailyDungeon;
            const floorIndex = daily.floors.findIndex(f => f.id === floorId);
            if (floorIndex === -1) {
                console.warn(`[DailyDungeon] Floor not found: ${floorId}`);
                return;
            }
            if (floorIndex > 0 && !daily.floors[floorIndex - 1].cleared) {
                console.warn(`[DailyDungeon] Floor ${floorId} is locked. Previous floor not cleared.`);
                return;
            }
            const floor = daily.floors[floorIndex];
            set({
                currentDailyFloorId: floorId,
                currentStage: floor.stageId,
                battleContext: { type: 'daily', campaignStageId: floor.stageId, dailyFloorId: floorId, pvpMatchId: null, pvpSeed: null },
                postBattleScreen: 'daily',
                dailyDungeon: { ...daily, currentFloorId: floorId },
            });
            get().setGameScreen('battle');
        },
        completeDailyFloor: (floorId) => {
            const state = get();
            const daily = state.dailyDungeon;
            const floors = daily.floors.map(f => f.id === floorId ? { ...f, cleared: true } : f);
            const floor = floors.find(f => f.id === floorId);
            if (!floor)
                return;
            const completed = floors.every(f => f.cleared);
            set({
                dailyDungeon: {
                    dateKey: daily.dateKey,
                    floors,
                    currentFloorId: null,
                    completed,
                },
                currentDailyFloorId: null,
                currentStage: null,
                battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
                pendingReward: { gold: floor.reward.gold, shards: floor.reward.shards, cards: [] },
            });
        },
        handleBattleDefeatNavigation: () => {
            const current = get();
            if (current.battleContext.type === 'pvp') {
                set({
                    battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
                    postBattleScreen: null,
                });
                get().setGameScreen('pvp');
                return;
            }
            const target = current.postBattleScreen;
            if (target === 'daily') {
                set(state => ({
                    currentStage: null,
                    currentDailyFloorId: null,
                    dailyDungeon: { ...state.dailyDungeon, currentFloorId: null },
                    battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null },
                    postBattleScreen: null,
                }));
                get().setGameScreen('daily');
            }
            else {
                set({ battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null }, postBattleScreen: null });
                get().setGameScreen(target ?? 'campaign');
            }
        },
        navigateAfterReward: () => {
            const target = get().postBattleScreen;
            set({ postBattleScreen: null });
            if (target === 'daily') {
                get().setGameScreen('daily');
            }
            else {
                set({ battleContext: { type: null, campaignStageId: null, dailyFloorId: null, pvpMatchId: null, pvpSeed: null } });
                get().setGameScreen('campaign');
            }
        },
        // 보상 시스템
        pendingReward: null,
        claimReward: () => {
            const reward = get().pendingReward;
            if (!reward)
                return;
            get().addGold(reward.gold);
            get().addShards(reward.shards);
            // 카드 보상을 컬렉션에 추가 (TODO: 나중에 구현)
            set({ pendingReward: null });
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('cloud-save-force'));
            }
            console.log('[Reward] Claimed!');
        },
        // 덱 관리
        playerDeck: [],
        collection: [],
        allCardsPool: [],
        setCollection: (cards) => {
            const pool = get().allCardsPool;
            const hydrated = rehydrateCardsFromPool(cards, pool);
            set({ collection: hydrated });
            // 초기 덱이 비어있으면 자동으로 20장 구성 (초기 덱)
            const currentDeck = get().playerDeck;
            if (currentDeck.length === 0) {
                // allCardsPool에서 초기 덱 구성 (전체 카드 풀에서 선택)
                const allCardsPool = get().allCardsPool;
                if (allCardsPool.length > 0) {
                    const initialDeck = getInitialDeck(allCardsPool);
                    set({ playerDeck: initialDeck });
                    console.log('[Deck] Auto-generated initial deck (20 cards)');
                }
                else if (cards.length >= 20) {
                    // allCardsPool이 없으면 collection에서 구성 (폴백)
                    const initialDeck = getInitialDeck(cards);
                    set({ playerDeck: initialDeck });
                    console.log('[Deck] Auto-generated initial deck from collection (20 cards)');
                }
            }
            triggerCloudSave();
        },
        setAllCardsPool: (cards) => {
            const state = get();
            const rehydratedCollection = rehydrateCardsFromPool(state.collection, cards);
            const rehydratedDeck = rehydrateCardsFromPool(state.playerDeck, cards);
            let nextPlayerDeck = rehydratedDeck;
            let nextMatch = state.pvpMatch;
            let matchChanged = false;
            let enemyDeckUpdate;
            let shouldRedrawEnemyHand = false;
            if (state.pvpMatch) {
                const { opponentDeckSnapshot, playerDeckSnapshot, playerRole, opponentDeckCards } = state.pvpMatch;
                const resolvedOpponentDeck = Array.isArray(opponentDeckSnapshot) && opponentDeckSnapshot.length > 0
                    ? buildDeckFromSnapshot(opponentDeckSnapshot, cards)
                    : [];
                if (resolvedOpponentDeck.length > 0) {
                    if (!opponentDeckCards || opponentDeckCards.length === 0) {
                        nextMatch = { ...state.pvpMatch, opponentDeckCards: resolvedOpponentDeck };
                        matchChanged = true;
                    }
                    else if (opponentDeckCards.length !== resolvedOpponentDeck.length) {
                        nextMatch = { ...state.pvpMatch, opponentDeckCards: resolvedOpponentDeck };
                        matchChanged = true;
                    }
                    if (state.battleContext.type === 'pvp' && state.enemyDeck.length === 0) {
                        enemyDeckUpdate = resolvedOpponentDeck;
                        if (state.enemyHand.length === 0) {
                            shouldRedrawEnemyHand = true;
                        }
                    }
                }
                if (playerRole === 'player1') {
                    const resolvedPlayerDeckSnapshot = Array.isArray(playerDeckSnapshot) && playerDeckSnapshot.length > 0
                        ? buildDeckFromSnapshot(playerDeckSnapshot, cards)
                        : [];
                    if (resolvedPlayerDeckSnapshot.length > 0) {
                        nextPlayerDeck = resolvedPlayerDeckSnapshot;
                    }
                }
            }
            const partial = {
                allCardsPool: cards,
                collection: rehydratedCollection,
                playerDeck: nextPlayerDeck,
            };
            if (matchChanged && nextMatch) {
                partial.pvpMatch = nextMatch;
            }
            if (enemyDeckUpdate) {
                partial.enemyDeck = enemyDeckUpdate;
            }
            set(partial);
            console.log(`[Shop] All cards pool set: ${cards.length} cards`);
            if (shouldRedrawEnemyHand) {
                const current = get();
                if (current.battleContext.type === 'pvp' &&
                    current.enemyHand.length === 0 &&
                    current.enemyDeck.length > 0 &&
                    current.round === 1 &&
                    current.gameOver === 'none') {
                    current.enemyDrawInitial(5);
                    current.addLog('상대 덱 데이터를 재구성하여 초기 패를 다시 채웠습니다.', 'system');
                }
            }
        },
        addCardToDeck: (card) => {
            const state = get();
            const currentDeck = state.playerDeck;
            // 덱이 이미 20장이면 추가 불가
            if (currentDeck.length >= 20) {
                console.warn('[Deck] Cannot add card: deck is full (20/20)');
                return false;
            }
            // 동일 카드 개수 확인 (최대 3장)
            const newCardKey = normalizeCardId(card.id);
            const sameCardCount = currentDeck.filter(c => normalizeCardId(c.id) === newCardKey).length;
            if (sameCardCount >= 3) {
                console.warn(`[Deck] Cannot add card: ${card.name} already has 3 copies`);
                return false;
            }
            const ownedCount = state.collection.filter(c => normalizeCardId(c.id) === newCardKey).length;
            if (sameCardCount >= ownedCount) {
                console.warn(`[Deck] Cannot add card: ${card.name} owned ${ownedCount}, already in deck ${sameCardCount}`);
                return false;
            }
            // Legendary는 1장 제한
            if (card.rarity === 'Legendary') {
                const legendaryCount = currentDeck.filter(c => c.rarity === 'Legendary').length;
                if (legendaryCount >= 3) {
                    console.warn('[Deck] Cannot add card: Legendary limit (3) reached');
                    return false;
                }
            }
            set({ playerDeck: [...currentDeck, card] });
            scheduleDeckSave();
            // console.log(`[Deck] Added: ${card.name} (${currentDeck.length + 1}/20)`);
            return true;
        },
        removeCardFromDeck: (cardId) => {
            const state = get();
            const currentDeck = state.playerDeck;
            // 첫 번째로 발견된 카드만 제거
            const index = currentDeck.findIndex(c => c.id === cardId);
            if (index === -1) {
                console.warn('[Deck] Cannot remove card: not found in deck');
                return;
            }
            const newDeck = [...currentDeck];
            newDeck.splice(index, 1);
            set({ playerDeck: newDeck });
            scheduleDeckSave();
            // console.log(`[Deck] Removed card (${newDeck.length}/20)`);
        },
        autoBuildDeck: () => {
            const state = get();
            const { collection } = state;
            if (!collection || collection.length === 0) {
                console.warn('[Deck] Cannot auto-build: collection is empty');
                return { success: false, deckSize: state.playerDeck.length, missing: Math.max(0, 20 - state.playerDeck.length), reason: 'empty-collection' };
            }
            const canonicalMap = new Map();
            collection.forEach(card => {
                const key = normalizeCardId(card.id);
                if (!canonicalMap.has(key)) {
                    canonicalMap.set(key, []);
                }
                canonicalMap.get(key).push(card);
            });
            const rarityScore = {
                Legendary: 500,
                Epic: 360,
                Rare: 250,
                Normal: 150,
            };
            const typeScore = {
                Attack: 80,
                Defense: 70,
                Heal: 65,
                Special: 60,
            };
            const entries = Array.from(canonicalMap.entries()).map(([key, cards]) => {
                const sortedCards = cards.slice().sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
                const primary = sortedCards[0];
                const baseCost = primary.cost ?? 0;
                const costScore = Math.max(40, 90 - Math.abs(baseCost - 2.5) * 18);
                const tagScore = (primary.tags?.includes('Tempo') ? 14 : 0) +
                    (primary.tags?.includes('Shield') ? 8 : 0) +
                    (primary.tags?.includes('Heal') ? 8 : 0);
                const score = (rarityScore[primary.rarity] ?? 120) +
                    (typeScore[primary.type] ?? 50) +
                    costScore +
                    tagScore +
                    (primary.version ?? 0);
                return {
                    key,
                    cards: sortedCards,
                    prototype: primary,
                    remaining: Math.min(sortedCards.length, 3),
                    score,
                };
            }).filter(entry => entry.remaining > 0);
            if (entries.length === 0) {
                console.warn('[Deck] Cannot auto-build: no usable cards');
                return { success: false, deckSize: state.playerDeck.length, missing: Math.max(0, 20 - state.playerDeck.length), reason: 'no-available-cards' };
            }
            const typeTargets = {
                Attack: 10,
                Defense: 6,
                Heal: 2,
                Special: 2,
            };
            const deck = [];
            const duplicateCounts = new Map();
            const typeCounts = new Map();
            const legendaryCap = 1;
            let legendaryCount = 0;
            const performAdd = (entry) => {
                if (entry.remaining <= 0)
                    return false;
                const canonicalId = entry.key;
                const currentCount = duplicateCounts.get(canonicalId) ?? 0;
                if (currentCount >= 3) {
                    entry.remaining = 0;
                    return false;
                }
                const cardIndex = entry.cards.length - entry.remaining;
                const card = entry.cards[cardIndex];
                if (!card) {
                    entry.remaining = 0;
                    return false;
                }
                if (card.rarity === 'Legendary' && legendaryCount >= legendaryCap) {
                    entry.remaining = 0;
                    return false;
                }
                deck.push(card);
                duplicateCounts.set(canonicalId, currentCount + 1);
                entry.remaining -= 1;
                typeCounts.set(card.type, (typeCounts.get(card.type) ?? 0) + 1);
                if (card.rarity === 'Legendary') {
                    legendaryCount += 1;
                }
                return true;
            };
            const typeOrder = ['Attack', 'Defense', 'Heal', 'Special'];
            typeOrder.forEach(type => {
                const target = typeTargets[type] ?? 0;
                let current = typeCounts.get(type) ?? 0;
                if (target <= current)
                    return;
                const candidates = entries
                    .filter(entry => entry.prototype.type === type && entry.remaining > 0)
                    .sort((a, b) => b.score - a.score);
                for (const entry of candidates) {
                    while (deck.length < 20 && entry.remaining > 0 && current < target) {
                        if (!performAdd(entry))
                            break;
                        current = typeCounts.get(type) ?? 0;
                    }
                    if (deck.length >= 20 || current >= target)
                        break;
                }
            });
            const sortedEntries = entries.sort((a, b) => b.score - a.score);
            for (const entry of sortedEntries) {
                while (deck.length < 20 && entry.remaining > 0) {
                    if (!performAdd(entry))
                        break;
                }
                if (deck.length >= 20)
                    break;
            }
            if (deck.length === 0) {
                console.warn('[Deck] Auto-build produced an empty deck');
                return { success: false, deckSize: state.playerDeck.length, missing: Math.max(0, 20 - state.playerDeck.length), reason: 'selection-failed' };
            }
            const rarityOrder = {
                Legendary: 3,
                Epic: 2,
                Rare: 1,
                Normal: 0,
            };
            deck.sort((a, b) => {
                const costDiff = (a.cost ?? 0) - (b.cost ?? 0);
                if (costDiff !== 0)
                    return costDiff;
                const rarityDiff = (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0);
                if (rarityDiff !== 0)
                    return rarityDiff;
                return a.name.localeCompare(b.name);
            });
            set({ playerDeck: deck.slice(0, 20) });
            scheduleDeckSave();
            const missing = Math.max(0, 20 - deck.length);
            return {
                success: true,
                deckSize: deck.length,
                missing,
                reason: missing > 0 ? 'insufficient-cards' : undefined,
            };
        },
        getDeckValidity: () => {
            const state = get();
            const deck = state.playerDeck;
            const errors = [];
            // 덱 사이즈 체크 (정확히 20장)
            if (deck.length < 20) {
                errors.push(`덱이 ${20 - deck.length}장 부족합니다 (${deck.length}/20)`);
            }
            else if (deck.length > 20) {
                errors.push(`덱이 ${deck.length - 20}장 초과합니다 (${deck.length}/20)`);
            }
            // 동일 카드 3장 제한 체크
            const cardCounts = new Map();
            deck.forEach(card => {
                const canonicalId = normalizeCardId(card.id);
                const count = cardCounts.get(canonicalId) || 0;
                cardCounts.set(canonicalId, count + 1);
            });
            cardCounts.forEach((count, cardId) => {
                if (count > 3) {
                    const card = deck.find(c => normalizeCardId(c.id) === cardId);
                    errors.push(`${card?.name || cardId}: 동일 카드는 최대 3장입니다 (현재 ${count}장)`);
                }
            });
            // Legendary 1장 제한 체크
            const legendaryCards = deck.filter(c => c.rarity === 'Legendary');
            if (legendaryCards.length > 1) {
                errors.push(`Legendary 카드는 1장만 허용됩니다 (현재 ${legendaryCards.length}장)`);
            }
            return {
                valid: errors.length === 0,
                errors
            };
        },
        // 전투 상태
        energy: 3,
        enemyEnergy: 3,
        round: 1,
        roundSeed: Math.floor(Math.random() * 1000000),
        currentInitiative: null,
        playerDamageTakenThisTurn: 0,
        playerDamageTakenLastTurn: 0,
        enemyDamageTakenThisTurn: 0,
        enemyDamageTakenLastTurn: 0,
        skipEnemyTurnOnce: false,
        skipPlayerTurnOnce: false,
        playerHp: 100,
        playerMaxHp: 100,
        enemyHp: 100,
        enemyMaxHp: 100,
        playerStatus: { ...initialEntityStatus },
        enemyStatus: { ...initialEntityStatus },
        gameOver: 'none',
        deck: [],
        hand: [],
        discard: [],
        enemyDeck: [],
        enemyHand: [],
        enemyDiscard: [],
        logs: [],
        logIdCounter: 0,
        declarationLocked: false,
        isTurnProcessing: false,
        playerQueue: [],
        enemyQueue: [],
        queuedHandIndices: [],
        getPendingCost: () => get().playerQueue.reduce((sum, q) => sum + (q.card?.cost ?? 0), 0),
        getRemainingEnergy: () => {
            const s = get();
            return Math.max(0, s.energy - s.playerQueue.reduce((sum, q) => sum + (q.card?.cost ?? 0), 0));
        },
        addLog: (message, type = 'system') => {
            const state = get();
            const entry = {
                id: state.logIdCounter++,
                message,
                type,
                timestamp: Date.now()
            };
            const newLogs = [...state.logs, entry].slice(-100); // Keep last 100 entries (20 → 100)
            set({ logs: newLogs });
        },
        applyStatus: (target, key, stacks = 1, duration = 1, chance = 100, value = 0) => {
            const state = get();
            if (state.gameOver !== 'none')
                return 0;
            const status = target === 'player' ? state.playerStatus : state.enemyStatus;
            // 면역 체크: 면역 키워드에 포함되어 있으면 미적용
            if (status.immuneKeywords.includes(key)) {
                get().addLog(`🛡️ ${target === 'player' ? '플레이어' : '적'} 면역: ${key} 상태이상 무효`, 'effect');
                return 0;
            }
            const isPvp = state.battleContext.type === 'pvp' && !!state.pvpMatch;
            if (chance < 100) {
                if (isPvp) {
                    const counter = state.pvpRandomCounter;
                    const roll = getSeededRandom(state.roundSeed, counter) * 100;
                    set({ pvpRandomCounter: counter + 1 });
                    if (roll >= chance) {
                        get().addLog(`${target === 'player' ? '플레이어' : '적'} 상태이상 발동 실패: ${key} (${chance}%)`, 'effect');
                        return;
                    }
                }
                else if (Math.random() * 100 >= chance) {
                    get().addLog(`${target === 'player' ? '플레이어' : '적'} 상태이상 발동 실패: ${key} (${chance}%)`, 'effect');
                    return;
                }
            }
            const existingIndex = status.statuses.findIndex(s => s.key === key);
            let newStatuses = [...status.statuses];
            if (existingIndex >= 0) {
                // 기존 상태이상이 있으면 중첩 또는 지속시간 연장
                const existing = { ...newStatuses[existingIndex] };
                if (key === 'Burn') {
                    // Burn은 중첩 (최대 3)
                    existing.stacks = Math.min(3, (existing.stacks || 1) + (stacks || 1));
                    existing.duration = Math.max(existing.duration, duration);
                }
                else if (key === 'Bleed') {
                    const stackValue = Math.max(1, stacks || 1);
                    existing.stacks = Math.min(5, (existing.stacks || 0) + stackValue);
                    existing.duration = Math.max(existing.duration, duration);
                    existing.value = value || existing.value || 5;
                }
                else {
                    // 다른 상태이상은 지속시간 연장
                    existing.duration = Math.max(existing.duration, duration);
                    if (stacks)
                        existing.stacks = stacks;
                    if (value)
                        existing.value = value;
                }
                newStatuses[existingIndex] = existing;
            }
            else {
                // 새 상태이상 추가
                const baseStacks = key === 'Bleed' ? Math.max(1, stacks || 1) : stacks;
                const baseValue = key === 'Bleed' ? value || 5 : value;
                newStatuses.push({ key, stacks: baseStacks, duration, chance, value: baseValue });
            }
            const newStatus = { ...status, statuses: newStatuses };
            const regenEffect = newStatuses.find(s => s.key === 'Regen');
            if (regenEffect) {
                const regenValue = regenEffect.value ?? newStatus.regen ?? value ?? 0;
                newStatus.regen = regenValue;
                newStatus.regenDuration = regenEffect.duration ?? duration ?? newStatus.regenDuration;
            }
            else {
                newStatus.regen = 0;
                newStatus.regenDuration = 0;
            }
            // Vulnerable은 별도로 관리
            if (key === 'Vulnerable' && value > 0) {
                newStatus.vulnerable = Math.max(newStatus.vulnerable, duration);
            }
            if (target === 'player') {
                set({ playerStatus: newStatus });
            }
            else {
                set({ enemyStatus: newStatus });
            }
            if (key === 'Root') {
                newStatus.rootDuration = Math.max(newStatus.rootDuration, duration);
                newStatus.evasionCharges = 0;
                newStatus.evasionDuration = 0;
            }
            if (key === 'Mark') {
                newStatus.markStacks = Math.max(1, stacks || 1);
                newStatus.markDuration = Math.max(newStatus.markDuration, duration);
                newStatus.markDamageAmp = value || newStatus.markDamageAmp || 20;
            }
            const statusName = {
                Burn: '화상',
                Bleed: '출혈',
                Freeze: '빙결',
                Shock: '감전',
                Vulnerable: '취약',
                Root: '구속',
                Mark: '표식',
                Regen: '지속 회복',
            };
            get().addLog(`${target === 'player' ? '플레이어' : '적'} 상태이상: ${statusName[key] || key}${stacks && stacks > 1 ? ` (${stacks}중첩)` : ''} (${duration}턴)`, 'effect');
            triggerStatusVFX(key, target);
        },
        // 내부 헬퍼: 단일 대상의 상태이상 틱 처리 (공통화)
        _tickEntityStatus: (target, status) => {
            const prefix = target === 'player' ? '' : '적 ';
            const newStatus = { ...status };
            const newStatuses = [];
            // 1) DoT/HoT 처리 및 지속시간 감소
            for (const eff of status.statuses) {
                if (eff.key === 'Burn' && eff.stacks) {
                    const damage = 10 * eff.stacks;
                    get().dealDamage(target, damage, false, true);
                    get().addLog(`🔥 ${prefix}화상 피해: ${damage} (${eff.stacks}중첩, ${eff.duration}턴 남음)`, 'effect');
                    // VFX 추가
                    triggerVFX('burn', target);
                }
                else if (eff.key === 'Bleed' && eff.stacks) {
                    const damagePerStack = (eff.value ?? status.bleedDamagePerStack) ?? 5;
                    const damage = Math.max(0, Math.floor(damagePerStack * eff.stacks));
                    if (damage > 0) {
                        get().dealDamage(target, damage, false, true);
                        get().addLog(`🩸 ${prefix}출혈 피해: ${damage} (${eff.stacks}중첩, ${eff.duration}턴 남음)`, 'effect');
                        triggerVFX('damage', target);
                    }
                }
                else if (eff.key === 'Poison' && eff.value) {
                    const damage = eff.value;
                    get().dealDamage(target, damage, false, true);
                    get().addLog(`☠️ ${prefix}중독 피해: ${damage} (${eff.duration}턴 남음)`, 'effect');
                    // VFX 추가
                    triggerVFX('vulnerable', target);
                }
                else if (eff.key === 'Regen') {
                    const healAmount = status.regen || eff.value || 0;
                    if (healAmount > 0) {
                        get().heal(target, healAmount);
                        get().addLog(`💚 ${prefix}지속 회복: +${healAmount}`, 'effect');
                    }
                }
                const newDuration = eff.duration - 1;
                if (newDuration > 0) {
                    newStatuses.push({ ...eff, duration: newDuration });
                }
                else {
                    // 효과 종료 로그
                    get().addLog(`${prefix}${eff.key} 효과 종료`, 'effect');
                }
            }
            newStatus.statuses = newStatuses;
            const regenStatus = newStatuses.find(s => s.key === 'Regen');
            if (regenStatus) {
                newStatus.regen = regenStatus.value ?? status.regen ?? 0;
                newStatus.regenDuration = regenStatus.duration ?? status.regenDuration ?? 0;
            }
            else {
                newStatus.regen = 0;
                newStatus.regenDuration = 0;
            }
            // 2) Vulnerable 동기화
            const vulnerableStatus = newStatuses.find(s => s.key === 'Vulnerable');
            newStatus.vulnerable = vulnerableStatus ? vulnerableStatus.duration : 0;
            const bleedStatus = newStatuses.find(s => s.key === 'Bleed');
            if (bleedStatus) {
                newStatus.bleedStacks = bleedStatus.stacks ?? 0;
                newStatus.bleedDuration = bleedStatus.duration ?? 0;
                const baseDamage = bleedStatus.value ?? newStatus.bleedDamagePerStack;
                newStatus.bleedDamagePerStack = baseDamage && baseDamage > 0 ? baseDamage : 5;
            }
            else {
                newStatus.bleedStacks = 0;
                newStatus.bleedDuration = 0;
                newStatus.bleedDamagePerStack = 0;
            }
            // 3) Guard duration 감소
            if (newStatus.guardDuration > 0) {
                newStatus.guardDuration -= 1;
                if (newStatus.guardDuration === 0 && newStatus.guard > 0) {
                    newStatus.guard = 0;
                    get().addLog(`${prefix}가드 효과 종료`, 'effect');
                }
            }
            // 4) Shield duration 감소
            if (newStatus.shieldDuration > 0) {
                newStatus.shieldDuration -= 1;
                if (newStatus.shieldDuration === 0 && newStatus.shield > 0) {
                    newStatus.shield = 0;
                    get().addLog(`${prefix}보호막 효과 종료`, 'effect');
                }
            }
            // 5) Evasion duration 감소
            if (newStatus.evasionDuration > 0) {
                newStatus.evasionDuration -= 1;
                if (newStatus.evasionDuration === 0 && newStatus.evasionCharges > 0) {
                    newStatus.evasionCharges = 0;
                    get().addLog(`${prefix}회피 효과 종료`, 'effect');
                }
            }
            // 6) Counter duration 감소
            if (newStatus.counterDuration > 0) {
                newStatus.counterDuration -= 1;
                if (newStatus.counterDuration === 0) {
                    newStatus.counterValue = 0;
                    get().addLog(`${prefix}반격 효과 종료`, 'effect');
                }
            }
            // 7) Immune duration 감소
            if (newStatus.immuneDuration > 0) {
                newStatus.immuneDuration -= 1;
                if (newStatus.immuneDuration === 0) {
                    newStatus.immuneKeywords = [];
                    get().addLog(`${prefix}면역 효과 종료`, 'effect');
                }
            }
            if (newStatus.priorityBoostDuration > 0) {
                newStatus.priorityBoostDuration -= 1;
                if (newStatus.priorityBoostDuration === 0 && newStatus.priorityBoost !== 0) {
                    newStatus.priorityBoost = 0;
                    get().addLog(`${prefix}이니셔티브 효과 종료`, 'effect');
                }
            }
            if (newStatus.rootDuration > 0) {
                newStatus.rootDuration -= 1;
                if (newStatus.rootDuration === 0) {
                    get().addLog(`${prefix}구속 효과 종료`, 'effect');
                }
            }
            if (newStatus.markDuration > 0) {
                newStatus.markDuration -= 1;
                if (newStatus.markDuration === 0) {
                    newStatus.markStacks = 0;
                    newStatus.markDamageAmp = 0;
                    get().addLog(`${prefix}표식 효과 종료`, 'effect');
                }
            }
            if (newStatus.onHitStatuses.length > 0) {
                const remaining = [];
                newStatus.onHitStatuses.forEach(entry => {
                    const next = entry.turnsLeft - 1;
                    if (next > 0) {
                        remaining.push({ ...entry, turnsLeft: next });
                    }
                    else {
                        get().addLog(`${prefix}반격 준비 효과 종료`, 'effect');
                    }
                });
                newStatus.onHitStatuses = remaining;
            }
            // 8) Reactive Armor duration 감소
            if (newStatus.reactiveArmorDuration > 0) {
                newStatus.reactiveArmorDuration -= 1;
                if (newStatus.reactiveArmorDuration === 0 || newStatus.reactiveArmorCharges <= 0) {
                    if (newStatus.reactiveArmorCharges > 0) {
                        newStatus.reactiveArmorCharges = 0;
                    }
                    newStatus.reactiveArmorReflectRatio = 0;
                    newStatus.reactiveArmorShieldRatio = 0;
                    get().addLog(`${prefix}반응 장갑 효과 종료`, 'effect');
                }
            }
            return newStatus;
        },
        processStatusEffects: (phase = 'both') => {
            const state = get();
            if (state.gameOver !== 'none')
                return 0;
            const tickPlayer = phase === 'both' || phase === 'enemyEnd';
            const tickEnemy = phase === 'both' || phase === 'playerEnd';
            const headerLabel = phase === 'playerEnd'
                ? '상태이상 효과 발동 (적 측)'
                : phase === 'enemyEnd'
                    ? '상태이상 효과 발동 (플레이어 측)'
                    : '상태이상 효과 발동';
            get().addLog(`━━━━━ ${headerLabel} ━━━━━`, 'system');
            if (tickPlayer) {
                const playerBurns = state.playerStatus.statuses.filter(s => s.key === 'Burn');
                if (playerBurns.length > 0) {
                    get().addLog(`  📊 플레이어 Burn: ${playerBurns.map(b => `${b.stacks}중첩 ${b.duration}턴`).join(', ')}`, 'system');
                }
            }
            if (tickEnemy) {
                const enemyBurns = state.enemyStatus.statuses.filter(s => s.key === 'Burn');
                if (enemyBurns.length > 0) {
                    get().addLog(`  📊 적 Burn: ${enemyBurns.map(b => `${b.stacks}중첩 ${b.duration}턴`).join(', ')}`, 'system');
                }
            }
            const updates = {};
            if (tickPlayer) {
                updates.playerStatus = get()._tickEntityStatus('player', state.playerStatus);
            }
            if (tickEnemy) {
                updates.enemyStatus = get()._tickEntityStatus('enemy', state.enemyStatus);
            }
            if (Object.keys(updates).length > 0) {
                set(updates);
            }
            const footerLabel = phase === 'playerEnd'
                ? '상태이상 처리 완료 (적 측)'
                : phase === 'enemyEnd'
                    ? '상태이상 처리 완료 (플레이어 측)'
                    : '상태이상 처리 완료';
            get().addLog(`━━━━━ ${footerLabel} ━━━━━`, 'system');
        },
        checkGameOver: () => {
            const state = get();
            console.log(`[CheckGameOver] 🔍 Called - playerHp: ${state.playerHp}, enemyHp: ${state.enemyHp}, gameOver: ${state.gameOver}, hand: ${state.hand.length}, enemyHand: ${state.enemyHand.length}`);
            if (state.gameOver !== 'none') {
                console.log(`[CheckGameOver] 🚫 Already over, skipping`);
                return 0;
            }
            if (state.playerHp <= 0) {
                console.log(`[CheckGameOver] 💀 DEFEAT - playerHp: ${state.playerHp}, hand: ${state.hand.length}, enemyHand: ${state.enemyHand.length}`);
                set({ gameOver: 'defeat' });
                get().addLog('패배! 플레이어 HP가 0 이하입니다.', 'system');
                // 리플레이 내보내기
                const replay = get().exportReplay();
                // console.log('=== GAME REPLAY (DEFEAT) ===');
                // console.log(replay);
                // VFX: 패배 이펙트
                triggerVFX('defeat', 'center');
                triggerVFX('defeat', 'player');
                if (state.battleContext.type === 'pvp' && state.pvpMatch) {
                    get().stopPvpTurnTimer(true);
                    void get().reportPvpResult('defeat');
                }
                if (state.battleContext.type === 'daily') {
                    set(current => ({
                        dailyDungeon: { ...current.dailyDungeon, currentFloorId: null },
                        currentDailyFloorId: null,
                    }));
                }
            }
            else if (state.enemyHp <= 0) {
                console.log(`[CheckGameOver] 🎉 VICTORY - enemyHp: ${state.enemyHp}`);
                set({ gameOver: 'victory' });
                get().addLog('승리! 적의 HP가 0 이하입니다.', 'system');
                // 리플레이 내보내기
                const replay = get().exportReplay();
                // console.log('=== GAME REPLAY (VICTORY) ===');
                // console.log(replay);
                // VFX: 승리 이펙트
                triggerVFX('victory', 'center');
                triggerVFX('defeat', 'enemy');
                if (state.battleContext.type === 'pvp' && state.pvpMatch) {
                    get().stopPvpTurnTimer(true);
                    void get().reportPvpResult('victory');
                }
                // 캠페인/일일 던전 보상 처리
                // 보상 화면으로의 전환은 main.ts의 showVictoryScreen에서 처리
                const context = state.battleContext;
                if (context.type === 'campaign' && state.currentStage !== null) {
                    get().clearStage(state.currentStage);
                }
                else if (context.type === 'daily' && state.currentDailyFloorId !== null) {
                    get().completeDailyFloor(state.currentDailyFloorId);
                }
            }
        },
        dealDamage: (target, amount, skipGameOverCheck = false, disableReactive = false) => {
            const state = get();
            if (state.gameOver !== 'none')
                return 0;
            const opponent = target === 'player' ? 'enemy' : 'player';
            const targetLabel = target === 'player' ? '플레이어' : '적';
            const opponentLabel = opponent === 'player' ? '플레이어' : '적';
            const getStatus = () => (target === 'player' ? get().playerStatus : get().enemyStatus);
            const setStatus = (next) => {
                if (target === 'player') {
                    set({ playerStatus: next });
                }
                else {
                    set({ enemyStatus: next });
                }
            };
            let status = getStatus();
            // Evasion (회피) 체크
            if (status.evasionCharges > 0) {
                const chargesLeft = status.evasionCharges - 1;
                const newStatus = { ...status, evasionCharges: Math.max(0, chargesLeft) };
                if (newStatus.evasionCharges === 0) {
                    newStatus.evasionDuration = 0;
                }
                setStatus(newStatus);
                get().addLog(`${targetLabel} 회피! 피해 무효화 (남은 회피: ${Math.max(0, chargesLeft)}회)`, 'effect');
                if (chargesLeft <= 0) {
                    get().addLog(`${targetLabel} 회피 소진`, 'effect');
                }
                return 0;
            }
            let finalAmount = amount;
            const hasVulnerable = status.vulnerable > 0 || status.statuses.some(s => s.key === 'Vulnerable' && s.duration > 0);
            if (hasVulnerable) {
                finalAmount = Math.floor(amount * 1.2);
            }
            const markActive = status.markDuration > 0 && status.markStacks > 0 && status.markDamageAmp > 0;
            if (markActive) {
                finalAmount = Math.floor(finalAmount * (1 + status.markDamageAmp / 100));
            }
            // Guard 적용: 피해 감소
            if (status.guard > 0) {
                finalAmount = Math.max(0, finalAmount - status.guard);
            }
            // Shield 적용: 보호막이 있으면 보호막 먼저 소모
            const prevShield = status.shield;
            let remainingShield = prevShield;
            let hpDamage = finalAmount;
            if (remainingShield > 0) {
                if (finalAmount <= remainingShield) {
                    remainingShield -= finalAmount;
                    hpDamage = 0;
                }
                else {
                    hpDamage = finalAmount - remainingShield;
                    remainingShield = 0;
                }
                const newStatus = { ...status, shield: remainingShield };
                setStatus(newStatus);
                status = newStatus;
                if (finalAmount > 0) {
                    get().addLog(`${targetLabel} 보호막: ${prevShield} → ${remainingShield}`, 'effect');
                }
            }
            if (target === 'player') {
                const newHp = Math.max(0, state.playerHp - hpDamage);
                set({ playerHp: newHp });
                const vulnerableText = hasVulnerable ? ` → ${finalAmount} (취약 +20%)` : '';
                const guardText = status.guard > 0 ? ` → ${finalAmount} (가드 -${status.guard})` : '';
                const shieldText = prevShield > 0 ? ` → ${hpDamage} (보호막 ${prevShield}→${remainingShield})` : '';
                get().addLog(`플레이어 피해: ${hpDamage} (원래: ${amount}${vulnerableText}${guardText}${shieldText}) (HP: ${newHp}/${state.playerMaxHp})`, 'effect');
                if (hpDamage > 0) {
                    triggerVFX('damage', 'player', hpDamage);
                }
                if (hpDamage > 0 && state.playerStatus.counterValue > 0) {
                    const counterDamage = state.playerStatus.counterValue;
                    get().addLog(`⚔️ 반격 발동! 적에게 ${counterDamage} 피해`, 'effect');
                    get().dealDamage('enemy', counterDamage, true);
                }
            }
            else {
                const newHp = Math.max(0, state.enemyHp - hpDamage);
                set({ enemyHp: newHp });
                const vulnerableText = hasVulnerable ? ` → ${finalAmount} (취약 +20%)` : '';
                const guardText = status.guard > 0 ? ` → ${finalAmount} (가드 -${status.guard})` : '';
                const shieldText = prevShield > 0 ? ` → ${hpDamage} (보호막 ${prevShield}→${remainingShield})` : '';
                get().addLog(`적 피해: ${hpDamage} (원래: ${amount}${vulnerableText}${guardText}${shieldText}) (HP: ${newHp}/${state.enemyMaxHp})`, 'effect');
                if (hpDamage > 0) {
                    triggerVFX('damage', 'enemy', hpDamage);
                }
                if (hpDamage > 0 && state.enemyStatus.counterValue > 0) {
                    const counterDamage = state.enemyStatus.counterValue;
                    get().addLog(`⚔️ 적 반격 발동! 플레이어에게 ${counterDamage} 피해`, 'effect');
                    get().dealDamage('player', counterDamage, true);
                }
            }
            // Reactive Armor 처리 (반격 및 보호막 변환)
            if (!disableReactive && hpDamage > 0) {
                status = getStatus();
                if (status.reactiveArmorCharges > 0 && (status.reactiveArmorReflectRatio > 0 || status.reactiveArmorShieldRatio > 0)) {
                    const reflectRatio = Math.min(1, Math.max(0, status.reactiveArmorReflectRatio || 0));
                    const shieldRatio = Math.min(1, Math.max(0, status.reactiveArmorShieldRatio || 0));
                    const reflectDamage = Math.floor(hpDamage * reflectRatio);
                    const shieldGain = Math.floor(hpDamage * shieldRatio);
                    const chargesLeft = Math.max(0, status.reactiveArmorCharges - 1);
                    const updatedStatus = {
                        ...status,
                        reactiveArmorCharges: chargesLeft,
                    };
                    if (chargesLeft === 0 && updatedStatus.reactiveArmorDuration === 0) {
                        updatedStatus.reactiveArmorReflectRatio = 0;
                        updatedStatus.reactiveArmorShieldRatio = 0;
                    }
                    if (shieldGain > 0) {
                        updatedStatus.shield = (updatedStatus.shield || 0) + shieldGain;
                        updatedStatus.shieldDuration = Math.max(updatedStatus.shieldDuration, 1);
                        get().addLog(`${targetLabel} 반응 장갑: 피해 ${hpDamage} → 보호막 +${shieldGain}`, 'effect');
                    }
                    setStatus(updatedStatus);
                    if (reflectDamage > 0) {
                        get().addLog(`🛡️ 반응 장갑 반격! ${opponentLabel}에게 ${reflectDamage} 피해`, 'effect');
                        get().dealDamage(opponent, reflectDamage, true, true);
                    }
                }
            }
            if (hpDamage > 0 && markActive) {
                const updatedStatus = { ...getStatus() };
                updatedStatus.markStacks = Math.max(0, updatedStatus.markStacks - 1);
                if (updatedStatus.markStacks === 0) {
                    updatedStatus.markDuration = 0;
                    updatedStatus.markDamageAmp = 0;
                }
                setStatus(updatedStatus);
                status = updatedStatus;
            }
            if (hpDamage > 0) {
                const postStatus = getStatus();
                if (postStatus.onHitStatuses.length > 0) {
                    const remaining = [];
                    postStatus.onHitStatuses.forEach(entry => {
                        get().applyStatus(opponent, entry.status.key, entry.status.stacks ?? 1, entry.status.duration ?? 1, entry.status.chance ?? 100, entry.status.value ?? 0);
                        const next = entry.turnsLeft - 1;
                        if (next > 0) {
                            remaining.push({ ...entry, turnsLeft: next });
                        }
                    });
                    setStatus({ ...postStatus, onHitStatuses: remaining });
                }
            }
            if (hpDamage > 0) {
                if (target === 'player') {
                    const currentDamage = get().playerDamageTakenThisTurn;
                    set({ playerDamageTakenThisTurn: currentDamage + hpDamage });
                }
                else {
                    const currentDamage = get().enemyDamageTakenThisTurn;
                    set({ enemyDamageTakenThisTurn: currentDamage + hpDamage });
                }
            }
            if (!skipGameOverCheck) {
                get().checkGameOver();
            }
            return hpDamage;
        },
        heal: (target, amount) => {
            const state = get();
            if (target === 'player') {
                const newHp = Math.min(state.playerMaxHp, state.playerHp + amount);
                set({ playerHp: newHp });
                get().addLog(`플레이어 회복: ${amount} (HP: ${newHp}/${state.playerMaxHp})`, 'effect');
                // VFX: 회복 이펙트
                triggerVFX('heal', 'player', amount);
            }
            else {
                const newHp = Math.min(state.enemyMaxHp, state.enemyHp + amount);
                set({ enemyHp: newHp });
                get().addLog(`적 회복: ${amount} (HP: ${newHp}/${state.enemyMaxHp})`, 'effect');
                triggerVFX('heal', 'enemy', amount);
            }
        },
        initGame: (cards) => {
            // 플레이어 덱: playerDeck 사용 (덱 편집에서 구성한 덱)
            const state = get();
            console.log(`[InitGame] 🔄 Starting - BEFORE: playerHp: ${state.playerHp}, enemyHp: ${state.enemyHp}, gameOver: ${state.gameOver}, hand: ${state.hand.length}, enemyHand: ${state.enemyHand.length}`);
            let deck = [...state.playerDeck];
            const matchState = state.pvpMatch;
            const isOnlinePvp = state.battleContext.type === 'pvp' && !!matchState && matchState.mode === 'online';
            const isAiPvp = state.battleContext.type === 'pvp' && !!matchState && matchState.mode === 'ai';
            const isAnyPvp = isOnlinePvp || isAiPvp;
            const baseSeed = isAnyPvp && matchState ? matchState.seed : Math.floor(Math.random() * 1000000);
            const playerPhase = matchState ? (matchState.playerRole === 'player1' ? 1 : 2) : 1;
            const enemyPhase = matchState ? (playerPhase === 1 ? 2 : 1) : 2;
            // playerDeck이 비어있거나 20장이 아니면 랜덤 구성
            if (deck.length !== 20) {
                console.warn('[Battle] playerDeck is invalid, generating random deck');
                if (isOnlinePvp) {
                    const fallbackSeed = generateRoundSeed(baseSeed, 0, playerPhase + 10);
                    deck = shuffleWithSeed(cards, fallbackSeed).slice(0, 20);
                }
                else {
                    deck = [...cards].sort(() => Math.random() - 0.5).slice(0, 20);
                }
            }
            // 덱 셔플
            if (isOnlinePvp) {
                const playerSeed = generateRoundSeed(baseSeed, 0, playerPhase);
                deck = shuffleWithSeed(deck, playerSeed);
            }
            else {
                deck = deck.sort(() => Math.random() - 0.5);
            }
            // 적 덱: 스테이지별로 구성
            const currentStage = state.currentStage;
            let enemyDeck;
            if (isAnyPvp) {
                enemyDeck = matchState?.opponentDeckCards?.length ? [...matchState.opponentDeckCards] : [];
                let shouldUpdateMatchDeck = false;
                if (enemyDeck.length === 0 && matchState?.opponentDeckSnapshot?.length) {
                    const snapshot = matchState.opponentDeckSnapshot;
                    const pools = [cards, state.collection, state.playerDeck];
                    for (const pool of pools) {
                        if (Array.isArray(pool) && pool.length > 0) {
                            const rebuilt = buildDeckFromSnapshot(snapshot, pool);
                            if (rebuilt.length > 0) {
                                enemyDeck = rebuilt;
                                break;
                            }
                        }
                    }
                    if (enemyDeck.length === 0 && state.playerDeck.length > 0) {
                        enemyDeck = state.playerDeck.map((card, index) => ({
                            ...card,
                            id: `${normalizeCardId(card.id)}__pvp_fallback__${index}`,
                        }));
                    }
                    shouldUpdateMatchDeck = enemyDeck.length > 0;
                }
                if (isOnlinePvp && enemyDeck.length > 0) {
                    const enemySeed = generateRoundSeed(baseSeed, 0, enemyPhase);
                    enemyDeck = shuffleWithSeed(enemyDeck, enemySeed);
                    shouldUpdateMatchDeck = true;
                }
                if (shouldUpdateMatchDeck && matchState) {
                    const deckForMatch = enemyDeck;
                    set(current => {
                        if (!current.pvpMatch || current.pvpMatch.matchId !== matchState.matchId) {
                            return {};
                        }
                        return {
                            pvpMatch: {
                                ...current.pvpMatch,
                                opponentDeckCards: deckForMatch,
                            },
                        };
                    });
                }
            }
            else if (currentStage) {
                enemyDeck = getEnemyDeckForStage(currentStage, cards, state.campaignStages);
            }
            else {
                enemyDeck = getBasicEnemyDeck(cards);
            }
            const initialSeed = isAnyPvp ? generateRoundSeed(baseSeed, 1) : baseSeed;
            const stageEnemyMaxHp = !isAnyPvp && currentStage
                ? (state.campaignStages.find(stage => stage.id === currentStage)?.enemyMaxHp ?? 100)
                : 100;
            // 🔴 setTimeout 타이머 모두 취소 (이전 게임의 타이머가 새 게임에 영향을 주지 않도록)
            if (enemyTurnTimer1 !== null) {
                clearTimeout(enemyTurnTimer1);
                enemyTurnTimer1 = null;
                console.log('[Battle] Cleared enemyTurnTimer1');
            }
            if (enemyTurnTimer2 !== null) {
                clearTimeout(enemyTurnTimer2);
                enemyTurnTimer2 = null;
                console.log('[Battle] Cleared enemyTurnTimer2');
            }
            if (enemyTurnTimer3 !== null) {
                clearTimeout(enemyTurnTimer3);
                enemyTurnTimer3 = null;
                console.log('[Battle] Cleared enemyTurnTimer3');
            }
            if (endTurnTimer !== null) {
                clearTimeout(endTurnTimer);
                endTurnTimer = null;
                console.log('[Battle] Cleared endTurnTimer');
            }
            // 🔴 핸드 추적 변수 리셋 (콜백 실행)
            if (handTrackingResetCallback) {
                console.log('[Battle] Resetting hand tracking');
                handTrackingResetCallback();
            }
            // 🔴 모든 전투 상태 강제 리셋
            set({
                deck, discard: [],
                enemyDeck, enemyDiscard: [],
                hand: [], // 🔴 핸드 초기화 추가
                enemyHand: [], // 🔴 적 핸드 초기화 추가
                energy: 3, enemyEnergy: 3, round: 1,
                roundSeed: initialSeed,
                currentInitiative: null,
                playerHp: 100, playerMaxHp: 100,
                enemyHp: stageEnemyMaxHp, enemyMaxHp: stageEnemyMaxHp,
                playerStatus: { ...initialEntityStatus },
                enemyStatus: { ...initialEntityStatus },
                gameOver: 'none',
                logs: [], // 🔴 로그 초기화 추가
                logIdCounter: 0, // 🔴 로그 ID 카운터 초기화 추가
                declarationLocked: false,
                isTurnProcessing: false,
                playerQueue: [],
                enemyQueue: [],
                queuedHandIndices: [], // 🔴 선언된 핸드 인덱스 초기화 추가
                replayHistory: [], // 리플레이 히스토리 초기화
                pvpRandomCounter: 0,
                pvpLastResolvedRound: 0,
                pvpLocalSubmissionRound: null,
                pvpRemoteSubmission: null,
                pvpLocalReady: false,
                pvpOpponentReady: false,
                pvpTurnTimeLeft: isAnyPvp ? (get().pvpTurnDuration || DEFAULT_PVP_TURN_DURATION) : null,
                pvpTurnTimerActive: false,
            });
            const context = get().battleContext;
            if (context.type === 'daily' && context.dailyFloorId !== null) {
                const dailyState = get().dailyDungeon;
                const floor = dailyState.floors.find(f => f.id === context.dailyFloorId);
                if (floor) {
                    let playerEnergyBonus = 0;
                    let enemyEnergyBonus = 0;
                    let playerShieldBonus = 0;
                    let enemyShieldBonus = 0;
                    const ruleMessages = [];
                    floor.modifiers.forEach(mod => {
                        switch (mod.type) {
                            case 'playerEnergy':
                                playerEnergyBonus += Number(mod.value) || 0;
                                break;
                            case 'enemyEnergy':
                                enemyEnergyBonus += Number(mod.value) || 0;
                                break;
                            case 'playerShield':
                                playerShieldBonus += Number(mod.value) || 0;
                                break;
                            case 'enemyShield':
                                enemyShieldBonus += Number(mod.value) || 0;
                                break;
                            case 'rule':
                                ruleMessages.push(String(mod.description));
                                break;
                        }
                    });
                    if (playerEnergyBonus !== 0) {
                        set(state => ({ energy: Math.max(0, state.energy + playerEnergyBonus) }));
                        get().addLog(`⚡ 일일 던전 효과: 플레이어 에너지 +${playerEnergyBonus}`, 'system');
                    }
                    if (enemyEnergyBonus !== 0) {
                        set(state => ({ enemyEnergy: Math.max(0, state.enemyEnergy + enemyEnergyBonus) }));
                        get().addLog(`⚡ 일일 던전 효과: 적 에너지 +${enemyEnergyBonus}`, 'system');
                    }
                    if (playerShieldBonus > 0) {
                        const status = get().playerStatus;
                        set({ playerStatus: { ...status, shield: status.shield + playerShieldBonus } });
                        get().addLog(`🛡️ 일일 던전 효과: 플레이어 보호막 +${playerShieldBonus}`, 'system');
                    }
                    if (enemyShieldBonus > 0) {
                        const status = get().enemyStatus;
                        set({ enemyStatus: { ...status, shield: status.shield + enemyShieldBonus } });
                        get().addLog(`🛡️ 일일 던전 효과: 적 보호막 +${enemyShieldBonus}`, 'system');
                    }
                    ruleMessages.forEach(message => {
                        get().addLog(`📜 일일 규칙: ${message}`, 'system');
                    });
                }
            }
            // 🔍 초기화 검증
            const afterState = get();
            console.log(`[InitGame] 🔍 After init - playerHp: ${afterState.playerHp}, enemyHp: ${afterState.enemyHp}, gameOver: ${afterState.gameOver}, hand: ${afterState.hand.length}, enemyHand: ${afterState.enemyHand.length}`);
            get().addLog(`게임 시작 - 초기 시드: ${initialSeed}`, 'system');
            // 🎬 초기 드로우: draw()가 hand를 []로 초기화한 뒤 5장 드로우
            // console.log('[Battle] Starting initial draw(5)');
            get().drawInitial(5);
            get().enemyDrawInitial(5);
            if (isAnyPvp) {
                const opponentLabel = matchState?.mode === 'ai' ? 'AI 상대' : '적';
                get().addLog(`${opponentLabel}가 5장을 드로우했습니다.`, 'system');
                get().startPvpTurnTimer(true);
            }
            else {
                get().addLog(`플레이어와 적이 각각 5장씩 드로우`, 'system');
            }
        },
        declareCard: (handIndex) => {
            const state = get();
            if (state.gameOver !== 'none' || state.declarationLocked || state.isTurnProcessing)
                return false;
            if (state.battleContext.type === 'pvp' && state.pvpLocalSubmissionRound === state.round) {
                return false;
            }
            const card = state.hand[handIndex];
            if (!card)
                return false;
            // 이미 큐에 있는 동일 handIndex 방지
            if (state.playerQueue.some(q => q.handIndex === handIndex)) {
                return false;
            }
            // 남은 에너지 기준 예약 가능 여부 판단
            const remaining = get().getRemainingEnergy();
            if (card.cost > remaining) {
                get().addLog(`에너지 부족: ${card.name} 선언 불가 (필요: ${card.cost}, 남음: ${remaining})`, 'system');
                return false;
            }
            const queue = [...state.playerQueue, { handIndex, card }];
            const queued = [...state.queuedHandIndices, handIndex];
            set({ playerQueue: queue, queuedHandIndices: queued });
            get().addLog(`선언: ${card.name} (코스트 ${card.cost})`, 'system');
            return true;
        },
        unDeclareCard: (handIndex) => {
            const state = get();
            const target = state.playerQueue.find(q => q.handIndex === handIndex);
            if (!target)
                return;
            const nextQueue = state.playerQueue.filter(q => q.handIndex !== handIndex);
            const nextQueued = state.queuedHandIndices.filter(i => i !== handIndex);
            set({ playerQueue: nextQueue, queuedHandIndices: nextQueued });
            get().addLog(`선택 취소: ${target.card.name}`, 'system');
        },
        lockIn: () => {
            const state = get();
            if (state.gameOver !== 'none')
                return;
            set({ declarationLocked: true });
            get().addLog('선언 잠금', 'system');
        },
        revealAndResolve: async () => {
            const state = get();
            if (state.gameOver !== 'none')
                return;
            if (!state.declarationLocked) {
                get().addLog('선언이 잠기지 않았습니다', 'system');
                return;
            }
            // 딜레이 헬퍼 함수
            const delay = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
            // 라운드 시드 로그
            get().addLog(`🎲 라운드 ${state.round} 시드: ${state.roundSeed}`, 'system');
            // 우선순위: Special > Attack > Defense > Heal, 코스트 높은 순
            const priorityMap = { Special: 3, Attack: 2, Defense: 1, Heal: 0 };
            const priority = (t) => priorityMap[t] ?? 0;
            const current = get();
            // 해결 시점에 현재 hand에서 카드 찾기(handIndex는 변할 수 있음)
            const pq = current.playerQueue.map(q => {
                const handIdx = current.hand.findIndex(c => c.id === q.card.id);
                return { who: 'player', card: q.card, handIndex: handIdx };
            }).filter(q => q.handIndex >= 0); // hand에 없는 카드는 제외
            const eq = current.enemyQueue.map(q => ({ who: 'enemy', card: q.card }));
            // 우선순위 계산 및 동률 시 시드 사용
            const playerPriorityBonus = Math.max(0, current.playerStatus.priorityBoost || 0);
            const enemyPriorityBonus = Math.max(0, current.enemyStatus.priorityBoost || 0);
            const combined = [...pq, ...eq].map((entry, idx) => ({
                ...entry,
                priority: priority(entry.card.type) +
                    (entry.who === 'player' ? playerPriorityBonus : enemyPriorityBonus),
                originalIndex: idx
            })).sort((a, b) => {
                // 1차: 타입 우선순위
                if (a.priority !== b.priority)
                    return b.priority - a.priority;
                // 2차: 코스트 높은 순
                if (a.card.cost !== b.card.cost)
                    return b.card.cost - a.card.cost;
                // 3차: 시드 기반 동률 결정 (결정론적)
                const seedA = (current.roundSeed + a.originalIndex) % 1000;
                const seedB = (current.roundSeed + b.originalIndex) % 1000;
                return seedB - seedA;
            });
            if (combined.length === 0) {
                set({ currentInitiative: null });
            }
            else {
                const firstActor = combined[0].who;
                set({ currentInitiative: firstActor });
                get().addLog(`🎯 이번 라운드 선공: ${firstActor === 'player' ? '플레이어' : '적'}`, 'system');
            }
            get().addLog(`공개: ${combined.length}장 해결 시작 (우선순위 순서)`, 'system');
            await delay(500); // 🎬 공개 단계 대기
            // 우선순위 상세 로그
            combined.forEach((entry, idx) => {
                const typeLabel = { Special: '특수', Attack: '공격', Defense: '방어', Heal: '회복' }[entry.card.type] || entry.card.type;
                const who = entry.who === 'player' ? '플레이어' : '적';
                get().addLog(`  ${idx + 1}순위: ${who} [${typeLabel}/${entry.card.cost}코스트] ${entry.card.name}`, 'system');
            });
            await delay(300); // 🎬 우선순위 표시 대기
        // 🎬 순차 처리 (forEach → for loop)
        let battleEnded = false;
        for (let idx = 0; idx < combined.length; idx++) {
            if (get().gameOver !== 'none') {
                battleEnded = true;
                break;
            }
                const entry = combined[idx];
                if (entry.who === 'player') {
                    // 🔴 매번 현재 hand에서 실제 handIndex 찾기 (이전 카드 사용으로 인덱스가 변경될 수 있음)
                    const s = get();
                    const actualHandIndex = s.hand.findIndex(c => c.id === entry.card.id);
                    // playCard가 에너지 차감과 카드 제거를 모두 처리
                    if (s.energy >= entry.card.cost && actualHandIndex >= 0) {
                        get().addLog(`⚔️ 플레이어 해결: ${entry.card.name} (코스트 ${entry.card.cost})`, 'card-play');
                        // 🎬 카드 사용 연출 애니메이션 (손에서의 위치 전달)
                        await triggerCardUseAnimation(entry.card, true, actualHandIndex);
                        const success = get().playCard(actualHandIndex);
                        if (!success) {
                            get().addLog(`경고: ${entry.card.name} 사용 실패`, 'system');
                        }
                    if (get().gameOver !== 'none') {
                        battleEnded = true;
                        break;
                    }
                        await delay(600); // 🎬 플레이어 카드 효과 대기
                    }
                    else if (actualHandIndex < 0) {
                        get().addLog(`경고: ${entry.card.name}이(가) 손패에 없습니다`, 'system');
                    }
                    else {
                        get().addLog(`에너지 부족: ${entry.card.name} 해결 실패 (필요: ${entry.card.cost}, 보유: ${s.energy})`, 'system');
                    }
                }
                else {
                    const s = get();
                    if (s.enemyEnergy >= entry.card.cost) {
                        get().addLog(`🗡️ 적 해결: ${entry.card.name} (코스트 ${entry.card.cost})`, 'card-play');
                        // 🎬 카드 사용 연출 애니메이션 (적은 handIndex -1)
                        await triggerCardUseAnimation(entry.card, false, -1);
                        get().playEnemyCard(entry.card);
                    if (get().gameOver !== 'none') {
                        battleEnded = true;
                        break;
                    }
                        await delay(600); // 🎬 적 카드 효과 대기
                    }
                }
            }
        if (get().gameOver !== 'none') {
            battleEnded = true;
        }
        set({ declarationLocked: false, playerQueue: [], enemyQueue: [], queuedHandIndices: [] });
        // 리플레이 액션 기록
            const finalState = get();
            get().recordReplayAction({
                round: finalState.round,
                seed: finalState.roundSeed,
                player: pq.map(p => ({ cardId: p.card.id, cardName: p.card.name })),
                enemy: eq.map(e => ({ cardId: e.card.id, cardName: e.card.name })),
                resultHp: { player: finalState.playerHp, enemy: finalState.enemyHp }
            });
        if (battleEnded) {
            return;
        }
        // 정리
        await delay(300); // 🎬 정리 전 대기
        get().addLog('✅ 공개/해결 완료', 'system');
        },
        // 🎬 초기 드로우 (hand를 []로 강제 리셋)
        drawInitial: (count) => {
            console.log(`[DrawInitial] 🔍 drawInitial() called with count: ${count}, current hand: ${get().hand.length}`);
            let { deck, discard } = get();
            const hand = []; // 🔴 강제로 비우기
            const drawn = [];
            let newDeck = [...deck];
            let newDiscard = [...discard];
            const maxHandSize = 10;
            for (let i = 0; i < count && hand.length + drawn.length < maxHandSize; i++) {
                if (newDeck.length === 0 && newDiscard.length > 0) {
                    newDeck = shuffleForCurrentContext(newDiscard);
                    newDiscard = [];
                    get().addLog(`덱 리셔플: ${newDeck.length}장`, 'system');
                }
                if (newDeck.length > 0) {
                    drawn.push(newDeck.shift());
                }
                else {
                    break;
                }
            }
            const beforeHand = hand.length;
            console.log(`[DrawInitial] 🔧 set() BEFORE - hand: ${beforeHand}, drawn: ${drawn.length}, newHand will be: ${beforeHand + drawn.length}`);
            set({ deck: newDeck, hand: [...hand, ...drawn], discard: newDiscard });
            const afterHand = get().hand.length;
            console.log(`[DrawInitial] 🔧 set() AFTER - hand: ${afterHand}`);
            if (drawn.length > 0) {
                get().addLog(`드로우: ${drawn.length}장`, 'system');
            }
        },
        draw: (count) => {
            console.log(`[Draw] 🔍 draw() called with count: ${count}, current hand: ${get().hand.length}`);
            let { deck, hand, discard } = get();
            const drawn = [];
            let newDeck = [...deck];
            let newDiscard = [...discard];
            const maxHandSize = 10;
            for (let i = 0; i < count && hand.length + drawn.length < maxHandSize; i++) {
                // 덱이 비었으면 discard pile을 섞어서 덱으로
                if (newDeck.length === 0 && newDiscard.length > 0) {
                    newDeck = shuffleForCurrentContext(newDiscard);
                    newDiscard = [];
                    get().addLog(`덱 리셔플: ${newDeck.length}장`, 'system');
                }
                if (newDeck.length > 0) {
                    drawn.push(newDeck.shift());
                }
                else {
                    // 덱도 discard도 비었으면 드로우 불가
                    break;
                }
            }
            // 손패가 가득 차면 나머지는 버림
            const overflow = count - drawn.length;
            if (overflow > 0 && newDeck.length > 0) {
                const discarded = [];
                for (let i = 0; i < overflow && newDeck.length > 0; i++) {
                    discarded.push(newDeck.shift());
                }
                newDiscard = [...newDiscard, ...discarded];
                if (discarded.length > 0) {
                    get().addLog(`손패 가득 참: ${discarded.length}장 버림`, 'system');
                }
            }
            // 🔴 한 번만 set() 호출
            const beforeHand = hand.length;
            console.log(`[Draw] 🔧 set() BEFORE - hand: ${beforeHand}, drawn: ${drawn.length}, newHand will be: ${beforeHand + drawn.length}`);
            set({ deck: newDeck, hand: [...hand, ...drawn], discard: newDiscard });
            const afterHand = get().hand.length;
            console.log(`[Draw] 🔧 set() AFTER - hand: ${afterHand}`);
            if (drawn.length > 0) {
                get().addLog(`드로우: ${drawn.length}장`, 'system');
                triggerVFX('draw', 'player', drawn.length);
            }
        },
        // 🎬 초기 적 드로우 (enemyHand를 []로 강제 리셋)
        enemyDrawInitial: (count) => {
            let { enemyDeck, enemyDiscard } = get();
            const enemyHand = []; // 🔴 강제로 비우기
            const drawn = [];
            let newDeck = [...enemyDeck];
            let newDiscard = [...enemyDiscard];
            const maxHandSize = 10;
            for (let i = 0; i < count && enemyHand.length + drawn.length < maxHandSize; i++) {
                if (newDeck.length === 0 && newDiscard.length > 0) {
                    newDeck = shuffleForCurrentContext(newDiscard);
                    newDiscard = [];
                    get().addLog(`적 덱 리셔플: ${newDeck.length}장`, 'system');
                }
                if (newDeck.length > 0) {
                    drawn.push(newDeck.shift());
                }
                else {
                    break;
                }
            }
            const beforeEnemyHand = enemyHand.length;
            console.log(`[EnemyDrawInitial] 🔧 set() BEFORE - enemyHand: ${beforeEnemyHand}, drawn: ${drawn.length}, newEnemyHand will be: ${beforeEnemyHand + drawn.length}`);
            set({ enemyDeck: newDeck, enemyHand: [...enemyHand, ...drawn], enemyDiscard: newDiscard });
            notifyEnemyHandUpdate();
            notifyEnemyHandUpdate();
            const afterEnemyHand = get().enemyHand.length;
            console.log(`[EnemyDrawInitial] 🔧 set() AFTER - enemyHand: ${afterEnemyHand}`);
            if (drawn.length > 0) {
                get().addLog(`적 드로우: ${drawn.length}장`, 'system');
                triggerVFX('draw', 'enemy', drawn.length);
            }
        },
        enemyDraw: (count) => {
            let { enemyDeck, enemyHand, enemyDiscard } = get();
            const drawn = [];
            let newDeck = [...enemyDeck];
            let newDiscard = [...enemyDiscard];
            const maxHandSize = 10;
            for (let i = 0; i < count && enemyHand.length + drawn.length < maxHandSize; i++) {
                // 덱이 비었으면 discard pile을 섞어서 덱으로
                if (newDeck.length === 0 && newDiscard.length > 0) {
                    newDeck = shuffleForCurrentContext(newDiscard);
                    newDiscard = [];
                    get().addLog(`적 덱 리셔플: ${newDeck.length}장`, 'system');
                }
                if (newDeck.length > 0) {
                    drawn.push(newDeck.shift());
                }
                else {
                    // 덱도 discard도 비었으면 드로우 불가
                    break;
                }
            }
            // 손패가 가득 차면 나머지는 버림
            const overflow = count - drawn.length;
            if (overflow > 0 && newDeck.length > 0) {
                const discarded = [];
                for (let i = 0; i < overflow && newDeck.length > 0; i++) {
                    discarded.push(newDeck.shift());
                }
                newDiscard = [...newDiscard, ...discarded];
                if (discarded.length > 0) {
                    get().addLog(`적 손패 가득 참: ${discarded.length}장 버림`, 'system');
                }
            }
            // 🔴 한 번만 set() 호출
            const beforeEnemyHand = enemyHand.length;
            console.log(`[EnemyDraw] 🔧 set() BEFORE - enemyHand: ${beforeEnemyHand}, drawn: ${drawn.length}, newEnemyHand will be: ${beforeEnemyHand + drawn.length}`);
            set({ enemyDeck: newDeck, enemyHand: [...enemyHand, ...drawn], enemyDiscard: newDiscard });
            const afterEnemyHand = get().enemyHand.length;
            console.log(`[EnemyDraw] 🔧 set() AFTER - enemyHand: ${afterEnemyHand}`);
            if (drawn.length > 0) {
                get().addLog(`적 드로우: ${drawn.length}장`, 'system');
                triggerVFX('draw', 'enemy', drawn.length);
            }
        },
        playCard: (handIndex) => {
            const state = get();
            if (state.gameOver !== 'none')
                return false;
            const card = state.hand[handIndex];
            if (!card)
                return false;
            if (state.energy < card.cost)
                return false;
            // Nullify 체크: 적이 무효화 상태면 카드 무효
            if (state.enemyStatus.nullifyCharges > 0) {
                const newEnergy = state.energy - card.cost;
                const newHand = state.hand.filter((_, i) => i !== handIndex);
                const newDiscard = [...state.discard, card];
                const newEnemyStatus = { ...state.enemyStatus };
                newEnemyStatus.nullifyCharges -= 1;
                set({ energy: newEnergy, hand: newHand, discard: newDiscard, enemyStatus: newEnemyStatus });
                get().addLog(`카드 사용: ${card.name} (코스트 ${card.cost})`, 'card-play');
                get().addLog(`⚠️ 무효화! 적이 카드 효과를 무효화했습니다 (남은 무효화: ${newEnemyStatus.nullifyCharges})`, 'effect');
                return true;
            }
            const newEnergy = state.energy - card.cost;
            const newHand = state.hand.filter((_, i) => i !== handIndex);
            const newDiscard = [...state.discard, card];
            set({ energy: newEnergy, hand: newHand, discard: newDiscard });
            get().addLog(`카드 사용: ${card.name} (코스트 ${card.cost})`, 'card-play');
            // process effects
            card.effects.forEach((eff, idx) => {
                if (!eff)
                    return;
                if (eff.type === 'Draw') {
                    const value = Number(eff.value ?? 0);
                    if (value > 0) {
                        get().draw(value);
                        get().addLog(`효과: 드로우 ${value}장`, 'effect');
                    }
                }
                else if (eff.type === 'GainAction') {
                    const value = Number(eff.value ?? 0);
                    if (value > 0) {
                        if (eff.delayed) {
                            const turns = Math.max(1, Number(eff.delayTurns ?? 1));
                            const playerStatus = { ...get().playerStatus };
                            playerStatus.energyBoostPending = (playerStatus.energyBoostPending || 0) + value;
                            playerStatus.energyBoostDuration = Math.max(playerStatus.energyBoostDuration, turns);
                            set({ playerStatus });
                            get().addLog(`지연 에너지 효과 준비: ${turns}턴 동안 +${value}`, 'effect');
                            triggerVFX('buff', 'player', value);
                        }
                        else {
                            set({ energy: get().energy + value });
                            get().addLog(`효과: 에너지 +${value}`, 'effect');
                            triggerVFX('energy', 'player', value);
                        }
                    }
                }
                else if (eff.type === 'Damage') {
                    const value = Number(eff.value ?? 0);
                    const hits = Math.max(1, Number(eff.hits ?? 1));
                    const lifestealRatio = Math.min(1, Math.max(0, Number(eff.lifestealRatio ?? 0)));
                    if (value > 0) {
                        // 공격력 버프 적용
                        let finalValue = value;
                        if (card.type === 'Attack') {
                            const attackBuff = state.playerStatus.attackBuff || 0;
                            if (attackBuff > 0) {
                                finalValue = Math.floor(value * (1 + attackBuff / 100));
                            }
                            // 감전 (Shock) 효과: 스택별 차등 연쇄 효과 (결정론적)
                            const currentState = get();
                            const shockStacks = currentState.enemyStatus.shockStacks || 0;
                            if (shockStacks > 0) {
                                // 스택별 효과 결정
                                let procChance = 0;
                                let damageRatio = 0;
                                if (shockStacks >= 3) {
                                    procChance = 0.9; // 90%
                                    damageRatio = 0.5; // 50% 추가 피해
                                }
                                else if (shockStacks === 2) {
                                    procChance = 0.6; // 60%
                                    damageRatio = 0.4; // 40% 추가 피해
                                }
                                else {
                                    procChance = 0.3; // 30%
                                    damageRatio = 0.3; // 30% 추가 피해
                                }
                                // 시드 기반 결정론적 확률 (roundSeed 사용)
                                const roll = ((currentState.roundSeed + finalValue + shockStacks) % 100) / 100;
                                if (roll < procChance) {
                                    const chainDamage = Math.floor(finalValue * damageRatio);
                                    get().addLog(`⚡ 감전 발동! (${shockStacks}스택, ${Math.floor(procChance * 100)}% 확률) 연쇄 피해: ${chainDamage}`, 'effect');
                                    get().dealDamage('enemy', chainDamage, false);
                                    // 감전 스택 1 소모
                                    const updatedState = get();
                                    const newEnemyStatus = { ...updatedState.enemyStatus };
                                    newEnemyStatus.shockStacks = Math.max(0, shockStacks - 1);
                                    set({ enemyStatus: newEnemyStatus });
                                }
                                else {
                                    get().addLog(`감전 발동 실패 (${shockStacks}스택, ${Math.floor(procChance * 100)}% 확률)`, 'effect');
                                }
                            }
                        }
                        // Attack cards damage enemy, others might vary
                        // 여러 피해가 있을 수 있으므로 게임 오버 체크는 마지막 Damage에만
                        const remainingDamages = card.effects.slice(idx + 1).filter(e => e.type === 'Damage').length;
                        const aoe = eff.aoe === true;
                        if (hits > 1) {
                            get().addLog(`다단 히트: ${hits}회`, 'effect');
                        }
                        const targetOverride = eff.target;
                        for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
                            const totalRemaining = remainingDamages + (hits - hitIndex - 1);
                            const skipGameOver = totalRemaining > 0;
                            let dealt = 0;
                            if (aoe) {
                                dealt = get().dealDamage('enemy', finalValue, skipGameOver);
                                get().addLog(`광역 피해: 적에게 ${finalValue}`, 'effect');
                            }
                            else {
                                let targetSide = card.type === 'Attack' ? 'enemy' : 'player';
                                if (targetOverride === 'player' || targetOverride === 'enemy') {
                                    targetSide = targetOverride;
                                }
                                dealt = get().dealDamage(targetSide, finalValue, skipGameOver);
                            }
                            if (lifestealRatio > 0 && card.type === 'Attack' && dealt > 0) {
                                const healAmount = Math.floor(dealt * lifestealRatio);
                                if (healAmount > 0) {
                                    get().heal('player', healAmount);
                                    get().addLog(`🩸 흡혈: +${healAmount}`, 'effect');
                                }
                            }
                        }
                    }
                }
                else if (eff.type === 'Heal') {
                    const value = Number(eff.value ?? 0);
                    const aoe = eff.aoe === true;
                    const overflowToShield = eff.overflowToShield === true;
                    if (value > 0) {
                        if (aoe) {
                            // 광역 회복: 플레이어와 적 모두에게 (초과 보호막 없음)
                            get().heal('player', value);
                            get().heal('enemy', value);
                            get().addLog(`광역 회복: 플레이어와 적에게 ${value}`, 'effect');
                        }
                        else if (overflowToShield) {
                            const currentState = get();
                            const currentHp = currentState.playerHp;
                            const maxHp = currentState.playerMaxHp;
                            const missing = Math.max(0, maxHp - currentHp);
                            const healAmount = Math.min(value, missing);
                            const overflow = Math.max(0, value - healAmount);
                            if (healAmount > 0) {
                                get().heal('player', healAmount);
                            }
                            if (overflow > 0) {
                                const playerStatus = { ...currentState.playerStatus };
                                playerStatus.shield = (playerStatus.shield || 0) + overflow;
                                playerStatus.shieldDuration = Math.max(playerStatus.shieldDuration, 2);
                                set({ playerStatus });
                                get().addLog(`초과 회복 보호막: +${overflow} (총 ${playerStatus.shield})`, 'effect');
                            }
                            if (healAmount === 0 && overflow === 0) {
                                get().addLog(`회복 효과가 있었지만 HP가 가득 차 있어 변화 없음`, 'effect');
                            }
                        }
                        else {
                            get().heal('player', value);
                        }
                    }
                }
                else if (eff.type === 'ApplyBleed') {
                    const stacks = Math.max(1, Number(eff.stacks ?? 1));
                    const duration = Math.max(1, Number(eff.duration ?? 2));
                    const damagePerStack = Math.max(1, Number(eff.damagePerStack ?? 5));
                    get().applyStatus('enemy', 'Bleed', stacks, duration, 100, damagePerStack);
                    get().addLog(`출혈 적용: ${stacks}중첩 / ${duration}턴 (스택당 ${damagePerStack})`, 'effect');
                    triggerVFX('damage', 'enemy', stacks);
                }
                else if (eff.type === 'ReactiveArmor') {
                    const charges = Math.max(1, Number(eff.charges ?? 1));
                    const reflectRatio = Math.min(1, Math.max(0, Number(eff.reflectRatio ?? 0.3)));
                    const shieldRatio = Math.min(1, Math.max(0, Number(eff.shieldRatio ?? 0)));
                    const duration = Math.max(0, Number(eff.duration ?? charges));
                    const playerStatus = { ...get().playerStatus };
                    playerStatus.reactiveArmorCharges = charges;
                    playerStatus.reactiveArmorReflectRatio = reflectRatio;
                    playerStatus.reactiveArmorShieldRatio = shieldRatio;
                    playerStatus.reactiveArmorDuration = duration;
                    set({ playerStatus });
                    const reflectPct = Math.round(reflectRatio * 100);
                    const shieldPct = Math.round(shieldRatio * 100);
                    get().addLog(`반응 장갑 활성화: ${charges}회 (반격 ${reflectPct}%, 보호막 전환 ${shieldPct}%)`, 'effect');
                    triggerVFX('shield', 'player', charges);
                }
                else if (eff.type === 'TempoBoost') {
                    const amount = Number(eff.amount ?? 0);
                    const turns = Math.max(1, Number(eff.turns ?? 1));
                    if (amount > 0) {
                        const playerStatus = { ...get().playerStatus };
                        playerStatus.energyBoostPending = (playerStatus.energyBoostPending || 0) + amount;
                        playerStatus.energyBoostDuration = Math.max(playerStatus.energyBoostDuration, turns);
                        set({ playerStatus });
                        get().addLog(`에너지 가속: 다음 ${turns}턴 동안 에너지 +${amount}`, 'effect');
                        triggerVFX('energy', 'player', amount);
                    }
                }
                else if (eff.type === 'ArmorBreak') {
                    const guardBreak = Math.max(0, Number(eff.guard ?? 0));
                    const shieldBreak = Math.max(0, Number(eff.shield ?? 0));
                    const enemyStatus = { ...get().enemyStatus };
                    if (guardBreak > 0 && enemyStatus.guard > 0) {
                        const prevGuard = enemyStatus.guard;
                        enemyStatus.guard = Math.max(0, enemyStatus.guard - guardBreak);
                        if (enemyStatus.guard === 0) {
                            enemyStatus.guardDuration = 0;
                        }
                        get().addLog(`🗡️ 가드 파쇄: ${prevGuard} → ${enemyStatus.guard}`, 'effect');
                    }
                    if (shieldBreak > 0 && enemyStatus.shield > 0) {
                        const prevShield = enemyStatus.shield;
                        enemyStatus.shield = Math.max(0, enemyStatus.shield - shieldBreak);
                        if (enemyStatus.shield === 0) {
                            enemyStatus.shieldDuration = 0;
                        }
                        get().addLog(`🔨 보호막 파쇄: ${prevShield} → ${enemyStatus.shield}`, 'effect');
                    }
                    set({ enemyStatus });
                    if (guardBreak > 0 || shieldBreak > 0) {
                        triggerVFX('vulnerable', 'enemy', guardBreak + shieldBreak);
                    }
                }
                else if (eff.type === 'UndoDamage') {
                    const percent = Math.max(0, Math.min(100, Number(eff.percent ?? 0)));
                    if (percent > 0) {
                        const target = eff.target ?? 'player';
                        const lastDamage = target === 'player' ? get().playerDamageTakenLastTurn : get().enemyDamageTakenLastTurn;
                        const maxRecover = eff.max ? Math.max(0, Number(eff.max)) : undefined;
                        if (lastDamage > 0) {
                            const rawAmount = Math.floor((lastDamage * percent) / 100);
                            const amount = maxRecover !== undefined ? Math.min(rawAmount, maxRecover) : rawAmount;
                            if (amount > 0) {
                                get().heal(target, amount);
                                get().addLog(`⏪ 지난 턴 피해 복구: ${target === 'player' ? '플레이어' : '적'} +${amount}`, 'effect');
                            }
                        }
                        else {
                            get().addLog(`지난 턴 받은 피해가 없어 복구되지 않았습니다`, 'effect');
                        }
                    }
                }
                else if (eff.type === 'OnHitStatus') {
                    const playerStatus = { ...get().playerStatus };
                    const entry = {
                        status: {
                            key: eff.status.key,
                            stacks: eff.status.stacks,
                            duration: eff.status.duration ?? 1,
                            chance: eff.status.chance,
                        },
                        turnsLeft: Math.max(1, eff.duration),
                    };
                    if (typeof eff.status.value === 'number') {
                        entry.status.value = eff.status.value;
                    }
                    playerStatus.onHitStatuses = [...(playerStatus.onHitStatuses || []), entry];
                    set({ playerStatus });
                    get().addLog(`🛡️ 반격 상태 준비: 공격자에게 ${eff.status.key} 적용 (${eff.duration}턴)`, 'effect');
                    triggerVFX('buff', 'player', entry.status.stacks ?? 1);
                }
                else if (eff.type === 'StealCard') {
                    const count = Math.max(1, Number(eff.count ?? 1));
                    const fromHand = eff.from === 'opponentHand';
                    const enemyHand = [...get().enemyHand];
                    const enemyDeck = [...get().enemyDeck];
                    const acquired = [];
                    const source = fromHand ? enemyHand : enemyDeck;
                    if (source.length === 0) {
                        get().addLog(`훔칠 카드가 없습니다`, 'effect');
                    }
                    else {
                        const resolvedFilter = eff.filter ?? 'random';
                        const pickCard = () => {
                            if (resolvedFilter === 'lowestCost') {
                                return source.reduce((acc, curr) => (curr.cost < acc.cost ? curr : acc), source[0]);
                            }
                            if (resolvedFilter === 'highestCost') {
                                return source.reduce((acc, curr) => (curr.cost > acc.cost ? curr : acc), source[0]);
                            }
                            return source[pickRandomIndex(source.length)];
                        };
                        for (let i = 0; i < count && source.length > 0; i++) {
                            const picked = pickCard();
                            const index = source.findIndex(c => c === picked);
                            if (index >= 0) {
                                source.splice(index, 1);
                                acquired.push({ ...picked });
                            }
                        }
                        if (fromHand) {
                            set({ enemyHand: source });
                        }
                        else {
                            set({ enemyDeck: source });
                        }
                        if (acquired.length > 0) {
                            const currentHand = get().hand;
                            const newHand = [...currentHand, ...acquired.map(card => ({ ...card }))].slice(0, 10);
                            set({ hand: newHand });
                            get().addLog(`🎴 카드 탈취: ${acquired.map(c => c.name).join(', ')}`, 'effect');
                            triggerVFX('draw', 'player', acquired.length);
                        }
                    }
                }
                else if (eff.type === 'TurnSkip') {
                    const chance = Math.max(0, Math.min(100, Number(eff.chance ?? 0)));
                    const roll = (isOnlinePvpMatch() ? consumePvpRandom() : Math.random()) * 100;
                    if (roll < chance) {
                        set({ skipEnemyTurnOnce: true });
                        get().addLog(`⏱️ 적의 다음 턴을 건너뜁니다! (확률 ${chance}% 성공)`, 'effect');
                        triggerVFX('freeze', 'enemy', chance);
                    }
                    else {
                        get().addLog(`시간 정지 실패 (확률 ${chance}%)`, 'effect');
                    }
                }
                else if (eff.type === 'Summon') {
                    get().addLog(`소환 효과는 추후 스프린트에서 구현 예정입니다. (임시 무효 처리)`, 'effect');
                }
                else if (eff.type === 'ApplyStatus') {
                    const key = eff.key;
                    const stacks = Number(eff.stacks ?? 1);
                    const duration = Number(eff.duration ?? 2);
                    const chance = Number(eff.chance ?? 100);
                    const target = eff.target ??
                        (card.type === 'Attack' ? 'enemy' : 'player');
                    get().applyStatus(target, key, stacks, duration, chance);
                    // Shock은 별도로 shockStacks에 저장
                    if (key === 'Shock' && target === 'enemy') {
                        const currentState = get();
                        const enemyStatus = { ...currentState.enemyStatus };
                        enemyStatus.shockStacks = (enemyStatus.shockStacks || 0) + stacks;
                        set({ enemyStatus });
                    }
                }
                else if (eff.type === 'Shield') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.shield = (playerStatus.shield || 0) + value;
                        playerStatus.shieldDuration = Math.max(playerStatus.shieldDuration, duration);
                        set({ playerStatus });
                        get().addLog(`보호막: +${value} (현재: ${playerStatus.shield}, ${playerStatus.shieldDuration}턴)`, 'effect');
                        triggerVFX('shield', 'player', value);
                    }
                }
                else if (eff.type === 'Guard') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.guard = value;
                        playerStatus.guardDuration = duration;
                        set({ playerStatus });
                        get().addLog(`가드: ${value} (피해 감소, ${duration}턴)`, 'effect');
                        triggerVFX('shield', 'player', value);
                    }
                }
                else if (eff.type === 'Vulnerable') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0) {
                        // Attack 카드는 적에게 취약 적용
                        get().applyStatus('enemy', 'Vulnerable', 1, duration, 100, value);
                    }
                }
                else if (eff.type === 'Buff') {
                    const stat = eff.stat;
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0 && stat === 'attack') {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.attackBuff = value;
                        set({ playerStatus });
                        get().addLog(`공격력 버프: +${value}% (${duration}턴)`, 'effect');
                        // duration은 추후 상태이상 시스템으로 관리할 수 있음
                        triggerVFX('buff', 'player', value);
                    }
                }
                else if (eff.type === 'Regen') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 3);
                    if (value > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.regen = value;
                        playerStatus.regenDuration = duration;
                        set({ playerStatus });
                        get().applyStatus('player', 'Regen', 1, duration, 100, value);
                        get().addLog(`지속 회복: 턴 시작 시 ${value} 회복 (${duration}턴)`, 'effect');
                    }
                }
                else if (eff.type === 'Cleanse') {
                    const maxStacks = Number(eff.maxStacks ?? 2);
                    const playerStatus = { ...state.playerStatus };
                    const removed = playerStatus.statuses.filter(s => s.key === 'Burn' && (s.stacks || 0) <= maxStacks);
                    playerStatus.statuses = playerStatus.statuses.filter(s => !(s.key === 'Burn' && (s.stacks || 0) <= maxStacks));
                    set({ playerStatus });
                    if (removed.length > 0) {
                        get().addLog(`정화: 화상 ${removed.reduce((sum, s) => sum + (s.stacks || 0), 0)}중첩 제거`, 'effect');
                        triggerVFX('buff', 'player', removed.length);
                    }
                }
                else if (eff.type === 'PriorityBoost') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.priorityBoost = (playerStatus.priorityBoost || 0) + value;
                        playerStatus.priorityBoostDuration = Math.max(playerStatus.priorityBoostDuration || 0, duration);
                        set({ playerStatus });
                        get().addLog(`이니셔티브 증가: +${value} (${duration}턴)`, 'effect');
                        triggerVFX('buff', 'player', value);
                    }
                }
                else if (eff.type === 'Silence') {
                    const duration = Number(eff.duration ?? 1);
                    // 침묵: 적의 다음 카드 사용을 막음 (현재는 로그만, 추후 구현)
                    get().addLog(`침묵: 적의 다음 ${duration}턴 카드 사용 제한`, 'effect');
                    triggerVFX('shock', 'enemy', duration);
                }
                else if (eff.type === 'Nullify') {
                    const times = Number(eff.times ?? 1);
                    if (times > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.nullifyCharges = (playerStatus.nullifyCharges || 0) + times;
                        set({ playerStatus });
                        get().addLog(`무효화: 적의 다음 ${times}회 카드 효과 무효`, 'effect');
                        triggerVFX('shield', 'player', times);
                    }
                }
                else if (eff.type === 'Counter') {
                    const value = Number(eff.value ?? 0);
                    const duration = Number(eff.duration ?? 1);
                    if (value > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.counterValue = value;
                        playerStatus.counterDuration = duration;
                        set({ playerStatus });
                        get().addLog(`반격: 공격받을 시 ${value}의 피해 반사 (${duration}턴)`, 'effect');
                        triggerVFX('buff', 'player', value);
                    }
                }
                else if (eff.type === 'Evasion') {
                    const value = Number(eff.value ?? 100); // 회피 확률 (%)
                    const charges = Number(eff.charges ?? 1);
                    const duration = Number(eff.duration ?? 1);
                    if (charges > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.evasionCharges = (playerStatus.evasionCharges || 0) + charges;
                        playerStatus.evasionDuration = Math.max(playerStatus.evasionDuration, duration);
                        set({ playerStatus });
                        get().addLog(`회피: ${charges}회 공격 회피 가능 (${playerStatus.evasionDuration}턴)`, 'effect');
                        triggerVFX('buff', 'player', charges);
                    }
                }
                else if (eff.type === 'Immune') {
                    const keywords = eff.keywords || [];
                    const duration = Number(eff.duration ?? 1);
                    if (keywords.length > 0) {
                        const playerStatus = { ...state.playerStatus };
                        playerStatus.immuneKeywords = [...new Set([...playerStatus.immuneKeywords, ...keywords])];
                        playerStatus.immuneDuration = Math.max(playerStatus.immuneDuration, duration);
                        set({ playerStatus });
                        get().addLog(`🛡️ 면역: ${keywords.join(', ')} 상태이상 무효 (${duration}턴)`, 'effect');
                        triggerVFX('shield', 'player', keywords.length);
                    }
                }
                else if (eff.type === 'Chain') {
                    // Chain 효과: 이전 Damage 효과의 피해량에 ratio를 곱한 추가 피해
                    const targets = Number(eff.targets ?? 2);
                    const ratio = Number(eff.ratio ?? 0.5);
                    // 같은 카드의 이전 Damage 효과 찾기
                    let chainDamage = 0;
                    for (let i = idx - 1; i >= 0; i--) {
                        const prevEff = card.effects[i];
                        if (prevEff.type === 'Damage') {
                            const prevDamage = Number(prevEff.value ?? 0);
                            if (prevDamage > 0) {
                                // 공격력 버프 적용 (동일하게)
                                let prevFinalValue = prevDamage;
                                if (card.type === 'Attack') {
                                    const currentState = get();
                                    const attackBuff = currentState.playerStatus.attackBuff || 0;
                                    if (attackBuff > 0) {
                                        prevFinalValue = Math.floor(prevDamage * (1 + attackBuff / 100));
                                    }
                                }
                                chainDamage = Math.floor(prevFinalValue * ratio);
                                break;
                            }
                        }
                    }
                    if (chainDamage > 0) {
                        // Chain 피해 적용 (여러 타겟이 있으면 타겟 수만큼, 현재는 단일 적에게만)
                        for (let t = 0; t < targets; t++) {
                            get().dealDamage('enemy', chainDamage, t < targets - 1);
                        }
                        get().addLog(`연쇄 효과: 추가 피해 ${chainDamage} × ${targets}회`, 'effect');
                    }
                    else {
                        get().addLog(`연쇄 효과: 적용할 피해가 없음`, 'effect');
                    }
                }
                else if (eff.type === 'Conditional') {
                    // 조건부 효과 처리
                    const condition = eff.if;
                    let conditionMet = false;
                    if (condition.includes('targetHp<=')) {
                        // HP 조건 체크 (예: "targetHp<=30%")
                        const match = condition.match(/targetHp<=(\d+)%/);
                        if (match) {
                            const threshold = Number(match[1]);
                            const currentState = get();
                            const targetHp = card.type === 'Attack' ? currentState.enemyHp : currentState.playerHp;
                            const targetMaxHp = card.type === 'Attack' ? currentState.enemyMaxHp : currentState.playerMaxHp;
                            const hpPercent = (targetHp / targetMaxHp) * 100;
                            conditionMet = hpPercent <= threshold;
                        }
                    }
                    if (conditionMet) {
                        get().addLog(`조건 충족! 추가 효과 발동`, 'effect');
                        // then 효과들을 재귀적으로 처리
                        eff.then.forEach((thenEff) => {
                            // 효과를 처리하기 위해 임시로 card.effects를 교체
                            const originalEffects = card.effects;
                            card.effects = [thenEff];
                            // 재귀 호출 대신 직접 처리
                            if (thenEff.type === 'Damage') {
                                const value = Number(thenEff.value ?? 0);
                                if (value > 0) {
                                    let finalValue = value;
                                    if (card.type === 'Attack') {
                                        const currentState = get();
                                        const attackBuff = currentState.playerStatus.attackBuff || 0;
                                        if (attackBuff > 0) {
                                            finalValue = Math.floor(value * (1 + attackBuff / 100));
                                        }
                                    }
                                    get().dealDamage(card.type === 'Attack' ? 'enemy' : 'player', finalValue, false);
                                    get().addLog(`조건부 피해: ${finalValue}`, 'effect');
                                }
                            }
                            else if (thenEff.type === 'Heal') {
                                const value = Number(thenEff.value ?? 0);
                                if (value > 0) {
                                    get().heal('player', value);
                                    get().addLog(`조건부 회복: ${value}`, 'effect');
                                }
                            }
                            card.effects = originalEffects;
                        });
                    }
                    else {
                        get().addLog(`조건 미충족: ${condition}`, 'effect');
                    }
                }
                else if (eff.type === 'DuplicateNext') {
                    // 다음 카드 중복 효과
                    const typeFilter = eff.typeFilter;
                    const times = Number(eff.times ?? 1);
                    const playerStatus = { ...state.playerStatus };
                    playerStatus.nextCardDuplicate = { typeFilter, times };
                    set({ playerStatus });
                    get().addLog(`다음 ${typeFilter || '카드'} ${times + 1}회 사용 준비`, 'effect');
                }
                else if (eff.type === 'CopyCard') {
                    // 덱에서 카드 복사
                    const from = eff.from; // "deck"
                    const filter = eff.filter; // "type:Attack"
                    const to = eff.to; // "hand"
                    if (from === 'deck' && to === 'hand') {
                        const currentState = get();
                        let sourceDeck = currentState.deck;
                        // 필터 적용
                        if (filter && filter.includes('type:')) {
                            const cardType = filter.split(':')[1];
                            sourceDeck = sourceDeck.filter(c => c.type === cardType);
                        }
                        if (sourceDeck.length > 0) {
                            // 랜덤하게 카드 선택
                            const randomIndex = Math.floor((currentState.roundSeed + idx) % sourceDeck.length);
                            const copiedCard = sourceDeck[randomIndex];
                            // 덱에서 제거하고 손패에 추가
                            const newDeck = currentState.deck.filter(c => c.id !== copiedCard.id);
                            const newHand = [...currentState.hand, copiedCard];
                            set({ deck: newDeck, hand: newHand });
                            get().addLog(`덱에서 "${copiedCard.name}" 복사하여 손패에 추가`, 'effect');
                        }
                        else {
                            get().addLog(`복제 실패: 조건에 맞는 카드가 덱에 없음`, 'effect');
                        }
                    }
                }
                else if (eff.type === 'TransferHp') {
                    // HP 전이
                    const value = Number(eff.value ?? 0);
                    const from = eff.from;
                    const to = eff.to;
                    if (value > 0) {
                        const currentState = get();
                        let fromHp = from === 'player' ? currentState.playerHp : currentState.enemyHp;
                        let toHp = to === 'player' ? currentState.playerHp : currentState.enemyHp;
                        let toMaxHp = to === 'player' ? currentState.playerMaxHp : currentState.enemyMaxHp;
                        // 전이할 HP 계산 (최대 전이 가능량은 현재 HP)
                        const transferAmount = Math.min(value, fromHp);
                        if (transferAmount > 0) {
                            // from에서 HP 차감
                            if (from === 'player') {
                                set({ playerHp: Math.max(0, currentState.playerHp - transferAmount) });
                            }
                            else {
                                set({ enemyHp: Math.max(0, currentState.enemyHp - transferAmount) });
                            }
                            // to에 HP 추가
                            if (to === 'player') {
                                set({ playerHp: Math.min(currentState.playerMaxHp, currentState.playerHp + transferAmount) });
                            }
                            else {
                                set({ enemyHp: Math.min(currentState.enemyMaxHp, currentState.enemyHp + transferAmount) });
                            }
                            get().addLog(`HP 전이: ${from}에서 ${to}로 ${transferAmount} 전이`, 'effect');
                        }
                    }
                }
                else if (eff.type === 'Revive') {
                    // 부활 효과
                    const value = Number(eff.value ?? 0);
                    const chance = Number(eff.chance ?? 30);
                    const currentState = get();
                    if (currentState.playerHp <= 0) {
                        // 확률 체크
                        const roll = ((currentState.roundSeed + idx) % 100);
                        if (roll < chance) {
                            set({ playerHp: value });
                            get().addLog(`부활 성공! HP ${value}으로 부활`, 'effect');
                        }
                        else {
                            get().addLog(`부활 실패 (${chance}% 확률)`, 'effect');
                        }
                    }
                    else {
                        get().addLog(`부활 효과: 이미 살아있음`, 'effect');
                    }
                }
                else if (eff.type === 'ElementShift') {
                    // 속성 전환 (현재는 로그만, 실제 속성 시스템이 구현되면 적용)
                    const from = eff.from;
                    const to = eff.to;
                    const duration = Number(eff.duration ?? 1);
                    get().addLog(`속성 전환: ${from} → ${to} (${duration}턴)`, 'effect');
                }
            });
            // DuplicateNext 효과 체크: 다음 카드가 중복되어야 하는지 확인
            if (state.playerStatus.nextCardDuplicate) {
                const duplicate = state.playerStatus.nextCardDuplicate;
                const shouldDuplicate = !duplicate.typeFilter || card.type === duplicate.typeFilter;
                if (shouldDuplicate) {
                    // 카드를 중복 실행
                    for (let i = 0; i < duplicate.times; i++) {
                        get().addLog(`중복 효과: "${card.name}" 추가 실행 (${i + 1}/${duplicate.times})`, 'effect');
                        // 효과를 다시 실행
                        card.effects.forEach((dupEff) => {
                            if (dupEff.type === 'Damage') {
                                const value = Number(dupEff.value ?? 0);
                                if (value > 0) {
                                    let finalValue = value;
                                    const currentState = get();
                                    if (card.type === 'Attack') {
                                        const attackBuff = currentState.playerStatus.attackBuff || 0;
                                        if (attackBuff > 0) {
                                            finalValue = Math.floor(value * (1 + attackBuff / 100));
                                        }
                                    }
                                    get().dealDamage(card.type === 'Attack' ? 'enemy' : 'player', finalValue, false);
                                }
                            }
                            else if (dupEff.type === 'Heal') {
                                const value = Number(dupEff.value ?? 0);
                                if (value > 0) {
                                    get().heal('player', value);
                                }
                            }
                            else if (dupEff.type === 'ApplyStatus') {
                                const key = dupEff.key;
                                const stacks = Number(dupEff.stacks ?? 1);
                                const duration = Number(dupEff.duration ?? 2);
                                const chance = Number(dupEff.chance ?? 100);
                                const target = card.type === 'Attack' ? 'enemy' : 'player';
                                get().applyStatus(target, key, stacks, duration, chance);
                            }
                        });
                    }
                    // 중복 효과 제거
                    const updatedState = get();
                    const newPlayerStatus = { ...updatedState.playerStatus };
                    newPlayerStatus.nextCardDuplicate = undefined;
                    set({ playerStatus: newPlayerStatus });
                }
            }
            return true;
        },
        playEnemyCard: (card) => {
            const state = get();
            if (state.gameOver !== 'none')
                return false;
            if (state.enemyEnergy < card.cost)
                return false;
            const isPvp = state.battleContext.type === 'pvp' && !!state.pvpMatch;
            const targetBaseId = normalizeCardId(card.id);
            let handIndex = state.enemyHand.findIndex(c => c.id === card.id);
            if (handIndex === -1) {
                handIndex = state.enemyHand.findIndex(c => normalizeCardId(c.id) === targetBaseId);
            }
            const hasHandCard = handIndex !== -1;
            if (!isPvp && !hasHandCard)
                return false;
            const deckCopy = [...state.enemyDeck];
            let deckIndex = deckCopy.findIndex(c => c.id === card.id);
            if (deckIndex === -1) {
                deckIndex = deckCopy.findIndex(c => normalizeCardId(c.id) === targetBaseId);
            }
            if (deckIndex !== -1) {
                deckCopy.splice(deckIndex, 1);
            }
            let newHand;
            if (hasHandCard) {
                newHand = state.enemyHand.filter((_, i) => i !== handIndex);
            }
            else if (isPvp && state.enemyHand.length > 0) {
                newHand = state.enemyHand.slice(1);
                console.warn('[PvP] Enemy card not matched in hand, removing top card as fallback', {
                    targetId: card.id,
                    targetBaseId,
                    handSize: state.enemyHand.length,
                });
            }
            else {
                newHand = [...state.enemyHand];
            }
            // Nullify 체크: 플레이어가 무효화 상태면 카드 무효
            if (state.playerStatus.nullifyCharges > 0) {
                const newEnergy = state.enemyEnergy - card.cost;
                const newPlayerStatus = { ...state.playerStatus, nullifyCharges: state.playerStatus.nullifyCharges - 1 };
                const newDiscard = [...state.enemyDiscard, card];
                set({
                    enemyEnergy: newEnergy,
                    enemyHand: newHand,
                    enemyDeck: deckIndex !== -1 ? deckCopy : state.enemyDeck,
                    enemyDiscard: newDiscard,
                    playerStatus: newPlayerStatus
                });
                notifyEnemyHandUpdate();
                get().addLog(`적이 ${card.name} 사용 (코스트 ${card.cost})`, 'card-play');
                get().addLog(`✅ 무효화! 플레이어가 카드 효과를 무효화했습니다 (남은 무효화: ${newPlayerStatus.nullifyCharges})`, 'effect');
                return true;
            }
            const newEnergy = state.enemyEnergy - card.cost;
            const newDiscard = [...state.enemyDiscard, card];
            set({
                enemyEnergy: newEnergy,
                enemyHand: newHand,
                enemyDeck: deckIndex !== -1 ? deckCopy : state.enemyDeck,
                enemyDiscard: newDiscard
            });
            notifyEnemyHandUpdate();
            get().addLog(`적이 ${card.name} 사용 (코스트 ${card.cost})`, 'card-play');
            // process effects (플레이어 카드 로직 재사용)
            card.effects.forEach((eff, idx) => {
                if (eff && typeof eff === 'object') {
                    const type = eff.type;
                    if (type === 'Draw') {
                        const value = Number(eff.value ?? 0);
                        if (value > 0) {
                            get().enemyDraw(value);
                            get().addLog(`적 효과: 드로우 ${value}장`, 'effect');
                            triggerVFX('draw', 'enemy', value);
                        }
                    }
                    else if (type === 'GainAction') {
                        const value = Number(eff.value ?? 0);
                        if (value > 0) {
                            if (eff.delayed) {
                                const turns = Math.max(1, Number(eff.delayTurns ?? 1));
                                const enemyStatus = { ...get().enemyStatus };
                                enemyStatus.energyBoostPending = (enemyStatus.energyBoostPending || 0) + value;
                                enemyStatus.energyBoostDuration = Math.max(enemyStatus.energyBoostDuration, turns);
                                set({ enemyStatus });
                                get().addLog(`적 지연 에너지 효과 준비: ${turns}턴 뒤 +${value}`, 'effect');
                                triggerVFX('buff', 'enemy', value);
                            }
                            else {
                                set({ enemyEnergy: get().enemyEnergy + value });
                                get().addLog(`적 효과: 에너지 +${value}`, 'effect');
                                triggerVFX('energy', 'enemy', value);
                            }
                        }
                    }
                    else if (type === 'Damage') {
                        const value = Number(eff.value ?? 0);
                        const hits = Math.max(1, Number(eff.hits ?? 1));
                        const lifestealRatio = Math.min(1, Math.max(0, Number(eff.lifestealRatio ?? 0)));
                        const aoe = eff.aoe === true;
                        if (value > 0) {
                            let finalValue = value;
                            // 적의 공격 버프 적용
                            const state = get();
                            const attackBuff = state.enemyStatus.attackBuff || 0;
                            if (attackBuff > 0) {
                                finalValue = Math.floor(value * (1 + attackBuff / 100));
                            }
                            // 감전 (Shock) 효과: 스택별 차등 연쇄 효과 (결정론적)
                            const currentState = get();
                            const shockStacks = currentState.playerStatus.shockStacks || 0;
                            if (shockStacks > 0) {
                                let procChance = 0;
                                let damageRatio = 0;
                                if (shockStacks >= 3) {
                                    procChance = 0.9;
                                    damageRatio = 0.5;
                                }
                                else if (shockStacks === 2) {
                                    procChance = 0.6;
                                    damageRatio = 0.4;
                                }
                                else {
                                    procChance = 0.3;
                                    damageRatio = 0.3;
                                }
                                const roll = ((currentState.roundSeed + finalValue + shockStacks + 100) % 100) / 100;
                                if (roll < procChance) {
                                    const chainDamage = Math.floor(finalValue * damageRatio);
                                    get().addLog(`⚡ 감전 발동! (${shockStacks}스택, ${Math.floor(procChance * 100)}% 확률) 연쇄 피해: ${chainDamage}`, 'effect');
                                    get().dealDamage('player', chainDamage, false);
                                    const updatedState = get();
                                    const newPlayerStatus = { ...updatedState.playerStatus };
                                    newPlayerStatus.shockStacks = Math.max(0, shockStacks - 1);
                                    set({ playerStatus: newPlayerStatus });
                                }
                                else {
                                    get().addLog(`감전 발동 실패 (${shockStacks}스택, ${Math.floor(procChance * 100)}% 확률)`, 'effect');
                                }
                            }
                            const remainingDamages = card.effects.slice(idx + 1).filter((e) => e.type === 'Damage').length;
                            if (hits > 1) {
                                get().addLog(`적 다단 히트: ${hits}회`, 'effect');
                            }
                            const targetOverride = eff.target;
                            for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
                                const totalRemaining = remainingDamages + (hits - hitIndex - 1);
                                const skipCheck = totalRemaining > 0;
                                let dealt = 0;
                                if (aoe) {
                                    dealt = get().dealDamage('player', finalValue, skipCheck);
                                    get().addLog(`적 광역 피해: ${finalValue}`, 'effect');
                                }
                                else {
                                    let targetSide = 'player';
                                    if (targetOverride === 'player' || targetOverride === 'enemy') {
                                        targetSide = targetOverride;
                                    }
                                    dealt = get().dealDamage(targetSide, finalValue, skipCheck);
                                }
                                if (lifestealRatio > 0 && dealt > 0) {
                                    const healAmount = Math.floor(dealt * lifestealRatio);
                                    if (healAmount > 0) {
                                        get().heal('enemy', healAmount);
                                        get().addLog(`적 흡혈: +${healAmount}`, 'effect');
                                    }
                                }
                            }
                        }
                    }
                    else if (type === 'Heal') {
                        const value = Number(eff.value ?? 0);
                        const aoe = eff.aoe === true;
                        const overflowToShield = eff.overflowToShield === true;
                        if (value > 0) {
                            if (aoe) {
                                get().heal('enemy', value);
                                get().heal('player', value);
                                get().addLog(`적 광역 회복: ${value}`, 'effect');
                            }
                            else if (overflowToShield) {
                                const currentState = get();
                                const currentHp = currentState.enemyHp;
                                const maxHp = currentState.enemyMaxHp;
                                const missing = Math.max(0, maxHp - currentHp);
                                const healAmount = Math.min(value, missing);
                                const overflow = Math.max(0, value - healAmount);
                                if (healAmount > 0) {
                                    get().heal('enemy', healAmount);
                                }
                                if (overflow > 0) {
                                    const enemyStatus = { ...currentState.enemyStatus };
                                    enemyStatus.shield = (enemyStatus.shield || 0) + overflow;
                                    enemyStatus.shieldDuration = Math.max(enemyStatus.shieldDuration, 2);
                                    set({ enemyStatus });
                                    get().addLog(`적 초과 회복 보호막: +${overflow} (총 ${enemyStatus.shield})`, 'effect');
                                }
                            }
                            else {
                                get().heal('enemy', value);
                            }
                        }
                    }
                    else if (type === 'Buff') {
                        const stat = eff.stat;
                        const value = Number((eff.value ?? 0));
                        const duration = Number((eff.duration ?? 1));
                        if (value > 0 && stat === 'attack') {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.attackBuff = value;
                            set({ enemyStatus });
                            get().addLog(`적 공격력 버프: +${value}% (${duration}턴)`, 'effect');
                            triggerVFX('buff', 'enemy', value);
                        }
                    }
                    else if (type === 'Regen') {
                        const value = Number(eff.value ?? 0);
                        const duration = Math.max(1, Number(eff.duration ?? 3));
                        const chance = Number(eff.chance ?? 100);
                        if (value > 0 && chance > 0) {
                            const targetOverride = eff.target;
                            const target = targetOverride === 'player' || targetOverride === 'enemy' ? targetOverride : 'enemy';
                            if (target === 'enemy') {
                                const enemyStatus = { ...get().enemyStatus };
                                enemyStatus.regen = value;
                                enemyStatus.regenDuration = duration;
                                set({ enemyStatus });
                                get().addLog(`적 지속 회복: 턴 시작 시 ${value} 회복 (${duration}턴)`, 'effect');
                            }
                            else {
                                const playerStatus = { ...get().playerStatus };
                                playerStatus.regen = value;
                                playerStatus.regenDuration = duration;
                                set({ playerStatus });
                                get().addLog(`적 효과: 플레이어에게 지속 회복 부여 (+${value}, ${duration}턴)`, 'effect');
                            }
                            get().applyStatus(target, 'Regen', 1, duration, chance, value);
                        }
                    }
                    else if (type === 'Cleanse') {
                        const maxStacks = Number((eff.maxStacks ?? 2));
                        const enemyStatus = { ...state.enemyStatus };
                        const removed = enemyStatus.statuses.filter(s => s.key === 'Burn' && (s.stacks || 0) <= maxStacks);
                        enemyStatus.statuses = enemyStatus.statuses.filter(s => !(s.key === 'Burn' && (s.stacks || 0) <= maxStacks));
                        set({ enemyStatus });
                        if (removed.length > 0) {
                            get().addLog(`적 정화: 화상 ${removed.reduce((sum, s) => sum + (s.stacks || 0), 0)}중첩 제거`, 'effect');
                            triggerVFX('buff', 'enemy', removed.length);
                        }
                    }
                    else if (type === 'ApplyBleed') {
                        const stacks = Math.max(1, Number(eff.stacks ?? 1));
                        const duration = Math.max(1, Number(eff.duration ?? 2));
                        const damagePerStack = Math.max(1, Number(eff.damagePerStack ?? 5));
                        get().applyStatus('player', 'Bleed', stacks, duration, 100, damagePerStack);
                        get().addLog(`적 출혈 적용: ${stacks}중첩 / ${duration}턴 (스택당 ${damagePerStack})`, 'effect');
                        triggerVFX('damage', 'player', stacks);
                    }
                    else if (type === 'ReactiveArmor') {
                        const charges = Math.max(1, Number(eff.charges ?? 1));
                        const reflectRatio = Math.min(1, Math.max(0, Number(eff.reflectRatio ?? 0.3)));
                        const shieldRatio = Math.min(1, Math.max(0, Number(eff.shieldRatio ?? 0)));
                        const duration = Math.max(0, Number(eff.duration ?? charges));
                        const enemyStatus = { ...get().enemyStatus };
                        enemyStatus.reactiveArmorCharges = charges;
                        enemyStatus.reactiveArmorReflectRatio = reflectRatio;
                        enemyStatus.reactiveArmorShieldRatio = shieldRatio;
                        enemyStatus.reactiveArmorDuration = duration;
                        set({ enemyStatus });
                        const reflectPct = Math.round(reflectRatio * 100);
                        const shieldPct = Math.round(shieldRatio * 100);
                        get().addLog(`적 반응 장갑: ${charges}회 (반격 ${reflectPct}%, 보호막 전환 ${shieldPct}%)`, 'effect');
                        triggerVFX('shield', 'enemy', charges);
                    }
                    else if (type === 'TempoBoost') {
                        const amount = Number(eff.amount ?? 0);
                        const turns = Math.max(1, Number(eff.turns ?? 1));
                        if (amount > 0) {
                            const enemyStatus = { ...get().enemyStatus };
                            enemyStatus.energyBoostPending = (enemyStatus.energyBoostPending || 0) + amount;
                            enemyStatus.energyBoostDuration = Math.max(enemyStatus.energyBoostDuration, turns);
                            set({ enemyStatus });
                            get().addLog(`적 에너지 가속: 다음 ${turns}턴 동안 에너지 +${amount}`, 'effect');
                            triggerVFX('energy', 'enemy', amount);
                        }
                    }
                    else if (type === 'ArmorBreak') {
                        const guardBreak = Math.max(0, Number(eff.guard ?? 0));
                        const shieldBreak = Math.max(0, Number(eff.shield ?? 0));
                        const playerStatus = { ...get().playerStatus };
                        if (guardBreak > 0 && playerStatus.guard > 0) {
                            const prevGuard = playerStatus.guard;
                            playerStatus.guard = Math.max(0, playerStatus.guard - guardBreak);
                            if (playerStatus.guard === 0) {
                                playerStatus.guardDuration = 0;
                            }
                            get().addLog(`적 효과: 플레이어 가드 파쇄 ${prevGuard} → ${playerStatus.guard}`, 'effect');
                        }
                        if (shieldBreak > 0 && playerStatus.shield > 0) {
                            const prevShield = playerStatus.shield;
                            playerStatus.shield = Math.max(0, playerStatus.shield - shieldBreak);
                            if (playerStatus.shield === 0) {
                                playerStatus.shieldDuration = 0;
                            }
                            get().addLog(`적 효과: 플레이어 보호막 파쇄 ${prevShield} → ${playerStatus.shield}`, 'effect');
                        }
                        set({ playerStatus });
                        if (guardBreak > 0 || shieldBreak > 0) {
                            triggerVFX('vulnerable', 'player', guardBreak + shieldBreak);
                        }
                    }
                    else if (type === 'UndoDamage') {
                        const percent = Math.max(0, Math.min(100, Number(eff.percent ?? 0)));
                        if (percent > 0) {
                            const target = eff.target ?? 'enemy';
                            const lastDamage = target === 'enemy' ? get().enemyDamageTakenLastTurn : get().playerDamageTakenLastTurn;
                            const maxRecover = eff.max !== undefined ? Math.max(0, Number(eff.max)) : undefined;
                            if (lastDamage > 0) {
                                const rawAmount = Math.floor((lastDamage * percent) / 100);
                                const amount = maxRecover !== undefined ? Math.min(rawAmount, maxRecover) : rawAmount;
                                if (amount > 0) {
                                    get().heal(target, amount);
                                    get().addLog(`적 효과: 지난 턴 피해 복구 (${target === 'enemy' ? '적' : '플레이어'}) +${amount}`, 'effect');
                                }
                            }
                        }
                    }
                    else if (type === 'OnHitStatus') {
                        const enemyStatus = { ...get().enemyStatus };
                        const entry = {
                            status: {
                                key: eff.status.key,
                                stacks: eff.status.stacks,
                                duration: eff.status.duration ?? 1,
                                chance: eff.status.chance,
                                value: eff.status.value,
                            },
                            turnsLeft: Math.max(1, Number(eff.duration ?? 1)),
                        };
                        enemyStatus.onHitStatuses = [...(enemyStatus.onHitStatuses || []), entry];
                        set({ enemyStatus });
                        get().addLog(`적 효과: 반격 준비 (${entry.status.key})`, 'effect');
                        triggerVFX('buff', 'enemy', entry.status.stacks ?? 1);
                    }
                    else if (type === 'StealCard') {
                        const count = Math.max(1, Number(eff.count ?? 1));
                        const fromHand = eff.from === 'opponentHand';
                        const playerHand = [...get().hand];
                        const playerDeck = [...get().deck];
                        const source = fromHand ? playerHand : playerDeck;
                        const acquired = [];
                        if (source.length === 0) {
                            get().addLog(`적 효과: 훔칠 플레이어 카드가 없음`, 'effect');
                        }
                        else {
                            const resolvedFilter = eff.filter ?? 'random';
                            const pickCard = () => {
                                if (resolvedFilter === 'lowestCost') {
                                    return source.reduce((acc, curr) => (curr.cost < acc.cost ? curr : acc), source[0]);
                                }
                                if (resolvedFilter === 'highestCost') {
                                    return source.reduce((acc, curr) => (curr.cost > acc.cost ? curr : acc), source[0]);
                                }
                                return source[pickRandomIndex(source.length)];
                            };
                            for (let i = 0; i < count && source.length > 0; i++) {
                                const picked = pickCard();
                                const index = source.findIndex(c => c === picked);
                                if (index >= 0) {
                                    source.splice(index, 1);
                                    acquired.push({ ...picked });
                                }
                            }
                            if (fromHand) {
                                set({ hand: source });
                            }
                            else {
                                set({ deck: source });
                            }
                            if (acquired.length > 0) {
                                const enemyHand = get().enemyHand;
                                const newEnemyHand = [...enemyHand, ...acquired.map(c => ({ ...c }))].slice(0, 10);
                                set({ enemyHand: newEnemyHand });
                                notifyEnemyHandUpdate();
                                get().addLog(`적이 플레이어 카드 탈취: ${acquired.map(c => c.name).join(', ')}`, 'effect');
                                triggerVFX('draw', 'enemy', acquired.length);
                            }
                        }
                    }
                    else if (type === 'TurnSkip') {
                        const chance = Math.max(0, Math.min(100, Number(eff.chance ?? 0)));
                        const roll = (isOnlinePvpMatch() ? consumePvpRandom() : Math.random()) * 100;
                        if (roll < chance) {
                            set({ skipPlayerTurnOnce: true });
                            get().addLog(`⚠️ 플레이어 턴이 봉인되었습니다!`, 'effect');
                            triggerVFX('freeze', 'player', chance);
                        }
                        else {
                            get().addLog(`적 턴스킵 실패 (확률 ${chance}%)`, 'effect');
                        }
                    }
                    else if (type === 'Summon') {
                        get().addLog(`적 소환 효과는 추후 구현 예정입니다. (임시 무효 처리)`, 'effect');
                    }
                    else if (type === 'ApplyStatus') {
                        const key = eff.key;
                        const stacks = Number(eff.stacks ?? 1);
                        const duration = Number(eff.duration ?? 2);
                        const chance = Number(eff.chance ?? 100);
                        const targetOverride = eff.target;
                        let target = 'player';
                        if (targetOverride === 'player' || targetOverride === 'enemy') {
                            target = targetOverride;
                        }
                        get().applyStatus(target, key, stacks, duration, chance);
                        if (key === 'Shock') {
                            const currentState = get();
                            if (target === 'player') {
                                const playerStatus = { ...currentState.playerStatus };
                                playerStatus.shockStacks = (playerStatus.shockStacks || 0) + stacks;
                                set({ playerStatus });
                            }
                            else {
                                const enemyStatus = { ...currentState.enemyStatus };
                                enemyStatus.shockStacks = (enemyStatus.shockStacks || 0) + stacks;
                                set({ enemyStatus });
                            }
                        }
                    }
                    else if (type === 'Shield') {
                        const value = Number(eff.value ?? 0);
                        const duration = Number(eff.duration ?? 1);
                        if (value > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.shield = (enemyStatus.shield || 0) + value;
                            enemyStatus.shieldDuration = Math.max(enemyStatus.shieldDuration, duration);
                            set({ enemyStatus });
                            get().addLog(`적 보호막: +${value} (현재: ${enemyStatus.shield}, ${enemyStatus.shieldDuration}턴)`, 'effect');
                            triggerVFX('shield', 'enemy', value);
                        }
                    }
                    else if (type === 'Guard') {
                        const value = Number(eff.value ?? 0);
                        const duration = Number(eff.duration ?? 1);
                        if (value > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.guard = value;
                            enemyStatus.guardDuration = duration;
                            set({ enemyStatus });
                            get().addLog(`적 가드: ${value} (${duration}턴)`, 'effect');
                            triggerVFX('shield', 'enemy', value);
                        }
                    }
                    else if (type === 'Vulnerable') {
                        const value = Number(eff.value ?? 0);
                        const duration = Number(eff.duration ?? 1);
                        if (value > 0) {
                            get().applyStatus('player', 'Vulnerable', 1, duration, 100, value);
                        }
                    }
                    else if (type === 'Nullify') {
                        const times = Number(eff.times ?? 1);
                        if (times > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.nullifyCharges = (enemyStatus.nullifyCharges || 0) + times;
                            set({ enemyStatus });
                            get().addLog(`적 무효화: 플레이어의 다음 ${times}회 카드 효과 무효`, 'effect');
                            triggerVFX('shield', 'enemy', times);
                        }
                    }
                    else if (type === 'Counter') {
                        const value = Number(eff.value ?? 0);
                        const duration = Number(eff.duration ?? 1);
                        if (value > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.counterValue = value;
                            enemyStatus.counterDuration = duration;
                            set({ enemyStatus });
                            get().addLog(`적 반격: 플레이어 공격 시 ${value}의 피해 반사 (${duration}턴)`, 'effect');
                            triggerVFX('buff', 'enemy', value);
                        }
                    }
                    else if (type === 'Immune') {
                        const keywords = eff.keywords || [];
                        const duration = Number(eff.duration ?? 1);
                        if (keywords.length > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.immuneKeywords = [...new Set([...enemyStatus.immuneKeywords, ...keywords])];
                            enemyStatus.immuneDuration = Math.max(enemyStatus.immuneDuration, duration);
                            set({ enemyStatus });
                            get().addLog(`적 면역: ${keywords.join(', ')} 상태이상 무효 (${duration}턴)`, 'effect');
                            triggerVFX('shield', 'enemy', keywords.length);
                        }
                    }
                    else if (type === 'PriorityBoost') {
                        const value = Number(eff.value ?? 0);
                        const duration = Number(eff.duration ?? 1);
                        if (value > 0) {
                            const enemyStatus = { ...state.enemyStatus };
                            enemyStatus.priorityBoost = (enemyStatus.priorityBoost || 0) + value;
                            enemyStatus.priorityBoostDuration = Math.max(enemyStatus.priorityBoostDuration || 0, duration);
                            set({ enemyStatus });
                            get().addLog(`적 이니셔티브 증가: +${value} (${duration}턴)`, 'effect');
                            triggerVFX('buff', 'enemy', value);
                        }
                    }
                    else if (type === 'Conditional') {
                        // 조건부 효과 처리 (적 카드용)
                        const condition = eff.if;
                        let conditionMet = false;
                        if (condition.includes('targetHp<=')) {
                            const match = condition.match(/targetHp<=(\d+)%/);
                            if (match) {
                                const threshold = Number(match[1]);
                                const currentState = get();
                                const targetHp = card.type === 'Attack' ? currentState.playerHp : currentState.enemyHp;
                                const targetMaxHp = card.type === 'Attack' ? currentState.playerMaxHp : currentState.enemyMaxHp;
                                const hpPercent = (targetHp / targetMaxHp) * 100;
                                conditionMet = hpPercent <= threshold;
                            }
                        }
                        if (conditionMet) {
                            get().addLog(`적 조건 충족! 추가 효과 발동`, 'effect');
                            const thenEffects = eff.then || [];
                            thenEffects.forEach((thenEff) => {
                                if (thenEff.type === 'Damage') {
                                    const value = Number(thenEff.value ?? 0);
                                    if (value > 0) {
                                        get().dealDamage('player', value, false);
                                        get().addLog(`적 조건부 피해: ${value}`, 'effect');
                                    }
                                }
                                else if (thenEff.type === 'Heal') {
                                    const value = Number(thenEff.value ?? 0);
                                    if (value > 0) {
                                        get().heal('enemy', value);
                                        get().addLog(`적 조건부 회복: ${value}`, 'effect');
                                    }
                                }
                            });
                        }
                    }
                    else if (type === 'Chain') {
                        // Chain 효과 (적 카드용)
                        const targets = Number(eff.targets ?? 2);
                        const ratio = Number(eff.ratio ?? 0.5);
                        let chainDamage = 0;
                        for (let i = idx - 1; i >= 0; i--) {
                            const prevEff = card.effects[i];
                            if (prevEff && prevEff.type === 'Damage') {
                                const prevDamage = Number(prevEff.value ?? 0);
                                if (prevDamage > 0) {
                                    chainDamage = Math.floor(prevDamage * ratio);
                                    break;
                                }
                            }
                        }
                        if (chainDamage > 0) {
                            for (let t = 0; t < targets; t++) {
                                get().dealDamage('player', chainDamage, t < targets - 1);
                            }
                            get().addLog(`적 연쇄 효과: 추가 피해 ${chainDamage} × ${targets}회`, 'effect');
                        }
                    }
                }
            });
            return true;
        },
        spendEnergy: () => {
            const { energy } = get();
            if (energy > 0)
                set({ energy: energy - 1 });
        },
        resetEnergyAndNextRound: () => {
            const stateBefore = get();
            const { round } = stateBefore;
            const skipPlayerTurn = stateBefore.skipPlayerTurnOnce;
            set({
                playerDamageTakenLastTurn: stateBefore.playerDamageTakenThisTurn,
                enemyDamageTakenLastTurn: stateBefore.enemyDamageTakenThisTurn,
                playerDamageTakenThisTurn: 0,
                enemyDamageTakenThisTurn: 0,
                skipPlayerTurnOnce: false,
            });
            // 상태이상 처리
            get().processStatusEffects();
            const currentState = get();
            const playerStatus = { ...currentState.playerStatus };
            let bonusEnergy = 0;
            if (playerStatus.energyBoostDuration > 0) {
                bonusEnergy = Math.max(0, playerStatus.energyBoostPending);
                playerStatus.energyBoostDuration = Math.max(0, playerStatus.energyBoostDuration - 1);
                if (playerStatus.energyBoostDuration === 0) {
                    playerStatus.energyBoostPending = 0;
                    get().addLog(`에너지 가속 효과 종료`, 'effect');
                }
            }
            const newEnergy = Math.min(10, 3 + bonusEnergy);
            const updates = {
                energy: newEnergy,
                round: round + 1,
                playerStatus,
                currentInitiative: null,
            };
            set(updates);
            if (bonusEnergy > 0) {
                get().addLog(`에너지 회복: 기본 3 + 보너스 ${bonusEnergy} = ${newEnergy}`, 'system');
            }
            else {
                get().addLog(`에너지 회복: 3`, 'system');
            }
            get().addLog(`턴 종료 → 라운드 ${round + 1}`, 'system');
            if (skipPlayerTurn) {
                get().addLog(`⚠️ 플레이어 턴이 봉인되어 적이 연속으로 행동합니다.`, 'system');
                const triggerEnemy = () => {
                    if (get().gameOver === 'none') {
                        void get().enemyTurn();
                    }
                };
                if (typeof window !== 'undefined') {
                    window.setTimeout(triggerEnemy, 400);
                }
                else {
                    triggerEnemy();
                }
            }
        },
        endPlayerTurn: async () => {
            const state = get();
            if (state.gameOver !== 'none' || state.isTurnProcessing)
                return;
            if (state.battleContext.type === 'pvp' && state.pvpMatch) {
                await get().submitPvpTurn();
                return;
            }
            // 🔒 턴 처리 시작 (입력 차단)
            set({ isTurnProcessing: true });
            // 선언이 남아있으면 자동 공개/해결 후 진행
        if (state.playerQueue.length > 0) {
                set({ declarationLocked: true });
                await get().revealAndResolve(); // 🎬 비동기 대기
            if (get().gameOver !== 'none') {
                set({ isTurnProcessing: false });
                return;
            }
            }
            get().addLog(`플레이어 턴 종료`, 'system');
            // 상태이상 처리
            get().processStatusEffects('playerEnd');
            // 적 턴 시작
            endTurnTimer = window.setTimeout(async () => {
                await get().enemyTurn();
                // 🔓 턴 처리 완료 (입력 허용) - 적 턴 완료 후 해제
            }, 500);
        },
        // AI 카드 평가 함수
        evaluateCard: (card, context) => {
            let score = 0;
            const { enemyHp, enemyMaxHp, playerHp, playerMaxHp, enemyStatus, playerStatus } = context;
            const enemyHpRatio = enemyHp / enemyMaxHp;
            const playerHpRatio = playerHp / playerMaxHp;
            // 카드 타입별 기본 점수
            if (card.type === 'Attack') {
                score += 50;
                // 킬 각 계산: 플레이어 HP가 낮으면 공격 가치 상승
                if (playerHpRatio < 0.3) {
                    score += 40; // 킬 찬스
                }
                else if (playerHpRatio < 0.5) {
                    score += 20;
                }
                // 플레이어에게 취약 상태가 있으면 공격 가치 상승
                if (playerStatus.vulnerable > 0) {
                    score += 25;
                }
                // 플레이어에게 가드/보호막이 있으면 공격 가치 하락
                if (playerStatus.guard > 0) {
                    score -= 15;
                }
                if (playerStatus.shield > 0) {
                    score -= 10;
                }
                // 플레이어에게 회피가 있으면 공격 가치 대폭 하락
                if (playerStatus.evasionCharges > 0) {
                    score -= 30;
                }
            }
            else if (card.type === 'Heal') {
                score += 30;
                // 생존 각: HP가 낮을수록 회복 가치 상승
                if (enemyHpRatio < 0.3) {
                    score += 50; // 긴급 회복
                }
                else if (enemyHpRatio < 0.5) {
                    score += 30;
                }
                else if (enemyHpRatio > 0.8) {
                    score -= 20; // HP 충분하면 회복 낭비
                }
            }
            else if (card.type === 'Defense') {
                score += 35;
                // 방어 타이밍: HP 낮거나 플레이어 공격력이 높을 때
                if (enemyHpRatio < 0.5) {
                    score += 25;
                }
                // 이미 가드/보호막이 있으면 중복 방어 가치 하락
                if (enemyStatus.guard > 0 || enemyStatus.shield > 0) {
                    score -= 20;
                }
            }
            else if (card.type === 'Special') {
                score += 40;
                // Special은 상황에 따라 가치 변동
                if (card.keywords.includes('Nullify') && playerStatus.nullifyCharges === 0) {
                    score += 20; // 무효화는 항상 유용
                }
            }
            // 코스트 효율: 낮은 코스트 선호 (에너지 효율적 사용)
            score -= card.cost * 3;
            // 키워드 평가
            card.keywords.forEach(keyword => {
                if (keyword === 'Burn') {
                    // 플레이어에게 면역이 없으면 화상 가치 상승
                    if (!playerStatus.immuneKeywords.includes('Burn')) {
                        score += 15;
                    }
                    else {
                        score -= 30; // 면역이면 무의미
                    }
                }
                else if (keyword === 'Shock') {
                    if (!playerStatus.immuneKeywords.includes('Shock')) {
                        score += 12;
                    }
                    else {
                        score -= 30;
                    }
                }
                else if (keyword === 'Vulnerable') {
                    // 취약은 다음 공격과 연계
                    score += 10;
                }
                else if (keyword === 'Shield' || keyword === 'Guard') {
                    // 방어 키워드는 생존 상황에서 가치 상승
                    if (enemyHpRatio < 0.6) {
                        score += 15;
                    }
                }
            });
            return Math.max(0, score);
        },
        enemyTurn: async () => {
            const state = get();
            console.log(`[EnemyTurn] 🔍 enemyTurn() called, gameOver: ${state.gameOver}`);
            if (state.battleContext.type === 'pvp' && state.pvpMatch)
                return;
            if (state.gameOver !== 'none')
                return;
            get().addLog(`적 턴 시작`, 'system');
            if (state.skipEnemyTurnOnce) {
                set({ skipEnemyTurnOnce: false });
                get().addLog(`⏱️ 시간 정지! 적 턴이 건너뜁니다.`, 'system');
                get().processStatusEffects('enemyEnd');
                const midState = get();
                const newRound = midState.round + 1;
                const newSeed = Math.floor(Math.random() * 1000000);
                const remainingEnergy = midState.energy;
                const newEnergy = Math.min(remainingEnergy + 3, 10);
                set({ round: newRound, roundSeed: newSeed, energy: newEnergy });
                get().addLog(`─── 라운드 ${newRound} 시작 ───`, 'system');
                get().addLog(`플레이어 턴 시작`, 'system');
                if (remainingEnergy > 0) {
                    get().addLog(`에너지: ${remainingEnergy}(이월) + 3 = ${newEnergy}`, 'system');
                }
                else {
                    get().addLog(`에너지: ${newEnergy}`, 'system');
                }
                get().draw(1);
                set({ isTurnProcessing: false });
                return;
            }
            // 적 에너지 회복 및 드로우 (캐리오버 시스템: 남은 에너지 + 3 (+보너스), 상한 10)
            const remainingEnemyEnergy = state.enemyEnergy;
            const enemyStatus = { ...state.enemyStatus };
            let enemyBonusEnergy = 0;
            if (enemyStatus.energyBoostDuration > 0) {
                enemyBonusEnergy = Math.max(0, enemyStatus.energyBoostPending);
                enemyStatus.energyBoostDuration = Math.max(0, enemyStatus.energyBoostDuration - 1);
                if (enemyStatus.energyBoostDuration === 0) {
                    enemyStatus.energyBoostPending = 0;
                    get().addLog(`적 에너지 가속 효과 종료`, 'effect');
                }
            }
            const newEnemyEnergy = Math.min(remainingEnemyEnergy + 3 + enemyBonusEnergy, 10);
            set({ enemyEnergy: newEnemyEnergy, enemyStatus });
            if (enemyBonusEnergy > 0 || remainingEnemyEnergy > 0) {
                get().addLog(`적 에너지: ${remainingEnemyEnergy}(이월) + 3${enemyBonusEnergy > 0 ? ` + 보너스 ${enemyBonusEnergy}` : ''} = ${newEnemyEnergy}`, 'system');
            }
            else {
                get().addLog(`적 에너지: ${newEnemyEnergy}`, 'system');
            }
            get().enemyDraw(1);
            // 🎬 드로우 애니메이션 대기 (500ms)
            enemyTurnTimer1 = window.setTimeout(async () => {
                console.log(`[EnemyTurn] 🔍 setTimeout callback 1 triggered, gameOver: ${get().gameOver}, round: ${get().round}`);
                const currentState = get();
                // 🔴 게임이 종료되었으면 중단 (initGame 등에 의해 리셋되었을 수 있음)
                if (currentState.gameOver !== 'none') {
                    console.log(`[EnemyTurn] 🚫 Aborted due to gameOver: ${currentState.gameOver}`);
                    return;
                }
                // AI 개선: 카드 평가 기반 선택
                const playableCards = currentState.enemyHand.filter(c => c.cost <= currentState.enemyEnergy);
                if (playableCards.length === 0) {
                    get().addLog(`적이 사용할 카드가 없습니다`, 'system');
                }
                else {
                    // 컨텍스트 정보
                    const context = {
                        enemyHp: currentState.enemyHp,
                        enemyMaxHp: currentState.enemyMaxHp,
                        playerHp: currentState.playerHp,
                        playerMaxHp: currentState.playerMaxHp,
                        enemyStatus: currentState.enemyStatus,
                        playerStatus: currentState.playerStatus,
                    };
                    // 모든 카드 평가
                    const cardScores = playableCards.map(card => ({
                        card,
                        score: get().evaluateCard(card, context)
                    }));
                    // 점수순 정렬
                    cardScores.sort((a, b) => b.score - a.score);
                    // 상위 30% 카드 중에서 랜덤 선택 (약간의 다양성 유지)
                    const topCandidates = cardScores.slice(0, Math.max(1, Math.ceil(cardScores.length * 0.3)));
                    const chosenCard = topCandidates[Math.floor(Math.random() * topCandidates.length)].card;
                    if (chosenCard) {
                        get().addLog(`[AI] 선택: ${chosenCard.name} (평가점수: ${cardScores.find(cs => cs.card.id === chosenCard.id)?.score})`, 'system');
                        // 🎬 카드 사용 연출 애니메이션
                        await triggerCardUseAnimation(chosenCard, false, -1);
                        get().playEnemyCard(chosenCard);
                        // 추가 카드 사용 고려
                        const nextState = get();
                        // 🔴 게임이 종료되었으면 중단
                        if (nextState.gameOver !== 'none')
                            return;
                        const nextPlayable = nextState.enemyHand.filter(c => c.cost <= nextState.enemyEnergy);
                        if (nextPlayable.length > 0) {
                            const nextScores = nextPlayable.map(card => ({
                                card,
                                score: get().evaluateCard(card, {
                                    enemyHp: nextState.enemyHp,
                                    enemyMaxHp: nextState.enemyMaxHp,
                                    playerHp: nextState.playerHp,
                                    playerMaxHp: nextState.playerMaxHp,
                                    enemyStatus: nextState.enemyStatus,
                                    playerStatus: nextState.playerStatus,
                                })
                            }));
                            nextScores.sort((a, b) => b.score - a.score);
                            // 높은 점수 카드가 있으면 사용 (50점 이상)
                            if (nextScores[0].score >= 50) {
                                // 🎬 카드 사용 연출 애니메이션
                                await triggerCardUseAnimation(nextScores[0].card, false, -1);
                                get().playEnemyCard(nextScores[0].card);
                            }
                        }
                    }
                }
                // 🔴 게임이 종료되었으면 중단 (initGame 등에 의해 리셋되었을 수 있음)
                const checkState = get();
                console.log(`[EnemyTurn] 🔍 Before addLog, gameOver: ${checkState.gameOver}, round: ${checkState.round}`);
                if (checkState.gameOver !== 'none') {
                    console.log(`[EnemyTurn] 🚫 Aborted before addLog due to gameOver: ${checkState.gameOver}`);
                    return;
                }
                // 적 턴 종료 후 플레이어 턴으로
                get().addLog(`적 턴 종료`, 'system');
                get().processStatusEffects('enemyEnd');
                enemyTurnTimer2 = window.setTimeout(() => {
                    console.log(`[EnemyTurn] 🔍 setTimeout callback 2 triggered, gameOver: ${get().gameOver}, round: ${get().round}`);
                    const finalState = get();
                    if (finalState.gameOver === 'none') {
                        // 라운드 증가 및 새 시드 생성
                        const newRound = finalState.round + 1;
                        const newSeed = Math.floor(Math.random() * 1000000);
                        // 에너지 캐리오버 시스템: 남은 에너지 + 3, 상한 10
                        const remainingEnergy = finalState.energy;
                        const newEnergy = Math.min(remainingEnergy + 3, 10);
                        set({ round: newRound, roundSeed: newSeed, energy: newEnergy });
                        get().addLog(`─── 라운드 ${newRound} 시작 ───`, 'system');
                        get().addLog(`플레이어 턴 시작`, 'system');
                        if (remainingEnergy > 0) {
                            get().addLog(`에너지: ${remainingEnergy}(이월) + 3 = ${newEnergy}`, 'system');
                        }
                        else {
                            get().addLog(`에너지: ${newEnergy}`, 'system');
                        }
                        // 자동 드로우 1장
                        get().draw(1);
                        // 🔓 턴 처리 완료 (입력 허용) - 드로우 애니메이션 대기 후
                        enemyTurnTimer3 = window.setTimeout(() => {
                            set({ isTurnProcessing: false });
                        }, 500); // 드로우 애니메이션 완료 대기
                    }
                }, 500);
            }, 500); // 🎬 드로우 애니메이션 대기
        },
    };
});
