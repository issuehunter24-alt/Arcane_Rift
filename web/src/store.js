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
const DEFAULT_PVP_TURN_DURATION = 15;
const CLOUD_SAVE_EVENT = 'cloud-save-force';
function triggerCloudSave() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CLOUD_SAVE_EVENT));
    }
}
const clampDeckSnapshot = (cards) => cards.slice(0, 20);
function normalizeCardId(cardId) {
    const withoutSnapshot = cardId.split('__snap__')[0] ?? cardId;
    const parts = withoutSnapshot.split('_');
    if (parts.length <= 6) {
        return withoutSnapshot;
    }
    return parts.slice(0, 6).join('_');
}
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
    Root: 'freeze'
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
 * 예: 'characters/lucian_rosegarden.png' -> 'LUCIAN'
 */
function extractCharacterNameFromImage(imagePath) {
    const match = imagePath.match(/\/([^\/]+)\.png$/);
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
export const useBattleStore = create((set, get) => ({
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
    startPvpTurnTimer: (forceRestart = false) => {
        const state = get();
        if (state.battleContext.type !== 'pvp' || state.gameOver !== 'none') {
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
        if (typeof window === 'undefined') {
            return;
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
        void get().submitPvpTurn();
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
        get().stopPvpTurnTimer(true);
        set(state => {
            const isPvp = state.battleContext.type === 'pvp';
            return {
                pvpQueueStatus: 'searching',
                pvpStatusMessage: '매칭을 찾는 중입니다...',
                pvpError: null,
                pvpMatch: null,
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
            console.error('[PvP] Failed to join queue', upsertResult.error, queuePayload);
            return;
        }
        console.log('[PvP] Joined queue', { userId, deckSnapshotSize: deckSnapshot.length });
        registerPvpUnloadCleanup(userId);
        const opponentRes = await supabase
            .from('pvp_queue')
            .select('user_id, deck_snapshot, updated_at')
            .eq('status', 'waiting')
            .neq('user_id', userId)
            .order('updated_at', { ascending: true })
            .limit(1);
        if (opponentRes.error) {
            set({ pvpQueueStatus: 'error', pvpError: opponentRes.error.message });
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
            const opponentDeckCards = buildDeckFromSnapshot(opponentDeckSnapshot, get().allCardsPool);
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
                },
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
            const opponentSnapshot = (playerRole === 'player1' ? match.player2_deck : match.player1_deck);
            const ownSnapshot = (playerRole === 'player1' ? match.player1_deck : match.player2_deck);
            const opponentDeckCards = buildDeckFromSnapshot(opponentSnapshot ?? [], get().allCardsPool);
            const opponentProfile = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', opponentId)
                .maybeSingle();
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
                },
            });
            void Promise.resolve().then(() => get().acceptPvpMatch());
        }, 2000);
    },
    cancelPvpMatchmaking: async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        clearPvpPolling();
        detachPvpUnloadCleanup();
        if (session) {
            await supabase.from('pvp_queue').delete().eq('user_id', session.user.id);
        }
        set({ pvpQueueStatus: 'idle', pvpStatusMessage: '', pvpError: null, pvpMatch: null });
        await get().disconnectPvpChannel();
    },
    acceptPvpMatch: async () => {
        const match = get().pvpMatch;
        if (!match || match.status === 'ready')
            return;
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
        const deck = match.playerRole === 'player1'
            ? buildDeckFromSnapshot(match.playerDeckSnapshot, cardsPool)
            : get().playerDeck;
        if (match.playerRole === 'player1') {
            set({ playerDeck: deck });
        }
        await get().connectPvpChannel(match);
        get().initGame(cardsPool);
        get().setGameScreen('battle');
    },
    reportPvpResult: async (result) => {
        const match = get().pvpMatch;
        if (!match)
            return;
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
        if (!state.pvpChannel || !state.pvpMatch) {
            set({ pvpError: 'PVP 채널이 연결되지 않았습니다.' });
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
            if (after.battleContext.type === 'pvp') {
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
    campaignStages: [
        {
            id: 1, name: '입문', theme: 'Neutral', recommendedPower: 100,
            firstReward: { gold: 200, shards: 2 }, repeatReward: { gold: 100, shards: 1 }, cleared: false,
            story: {
                description: '세라피나가 벨몬트 가문의 전통 카드 배틀을 처음 배우는 날. 하인 Lucian이 친절하게 기본 규칙을 가르쳐준다.',
                backgroundImage: 'backgrounds/stage_01_training_1.png'
            },
            characterImage: 'characters/seraphina_belmont.png', // 주인공 세라피나
            enemyImage: 'characters/lucian_rosegarden.png', // 적 루시안
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Lucian',
                        text: '세라피나 아가씨, 벨몬트 가문의 훈련장에 오신 것을 진심으로 환영합니다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '여기서 제가 어떤 시험을 치르게 될지 솔직히 조금 긴장돼요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '이곳은 가문의 전술을 몸에 익히는 첫 관문입니다. 카드 한 장, 움직임 한 번까지 모두 실전에 맞춰 설계돼 있죠.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Lucian',
                        text: '안개, 지면, 장애물까지 완벽히 통제된 환경입니다. 여기서 안정적인 호흡을 만들어내면 그다음부터는 훨씬 수월해집니다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '공기부터가 긴장감을 주네요. 하지만 이런 곳에서 시작한다면 금세 적응할 수 있을 것 같아요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '카이 님도 이 훈련장에서 기초를 다졌습니다. 오늘은 그분이 걸었던 첫걸음을 그대로 밟아보는 셈이지요.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그 길을 따라갈 수 있다면 더 바랄 것이 없겠네요. 어설프더라도 포기하지 않겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '좋습니다. 첫 스테이지에서는 카드 순환과 발놀림만 집중하세요. 승패보다 더 중요한 건 기본입니다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네. 오늘 목표는 호흡과 리듬, 그리고 다음 단계로 나아갈 자신감을 만드는 것.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '바로 그 자세입니다. 이제 시작해볼까요?',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Lucian',
                        text: '숨이 안정적이었습니다. 첫 승리치고는 자세가 매우 안정됐어요.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '초반엔 손이 떨렸는데, 호흡을 길게 가져가니 카드가 제자리를 찾더라고요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '다음 스테이지부터는 상대가 전술적으로 훨씬 날카로워집니다. 방금 익힌 템포를 잊지 마세요.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '전투를 다시 떠올리면서 움직임을 정리해 둘게요. 그럼 어떤 속도에도 흔들리지 않을 거예요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '훌륭합니다. 지금의 집중력을 다음 스테이지에서도 이어가 봅시다.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Lucian',
                        text: '처음에는 누구나 발이 꼬이곤 합니다. 중요한 건 어디에서 리듬이 흐트러졌는지 확인하는 것이죠.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카드를 던지는 타이밍을 서두르다가 순서를 놓쳤어요. 다음엔 호흡을 더 길게 잡아야겠어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '방금 전투를 차근차근 복기해 봅시다. 다시 서 보면 금세 안정을 되찾게 될 겁니다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '좋아요. 실수를 바로잡을 수 있다면 몇 번이고 다시 도전할 수 있어요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '언제든 제가 곁에서 리듬을 맞춰드리겠습니다. 다시 호흡을 가다듬고 도전해 봅시다.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    }
                ]
            }
        },
        {
            id: 2, name: '불의 시련', theme: 'Fire', recommendedPower: 120,
            firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
            story: {
                description: '아리아나가 질투심으로 도전해온다. "카이 님의 약혼자라는 그 시골 소녀... 내 화염 카드의 힘을 봐!" 화산 지대에서 치열한 대결이 펼쳐진다.',
                backgroundImage: 'backgrounds/stage_02_fire_1.png'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: '당신이 세라피나? 카이 님 곁에 선다는 그 시골 소녀가 맞는지 두 눈으로 확인하려고 왔어.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요. 저는 세라피나 벨몬트가 될 사람입니다. 당신이 아리아나인가요?',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '그래. 카이 님과 함께 성장한 나에게 약혼녀로서의 자격을 증명해보인다고? 말뿐이라면 바로 여기서 끝이야.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카이가 어떤 사람인지 누구보다 잘 알고 싶어요. 그러기 위해서라면 당신과의 대결도 피하지 않을 겁니다.',
                        emotion: 'angry',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '좋아. 이 화산 지대는 나의 무대야. 뜨거운 기류에 집중하지 못하면 그대로 타버릴 거라고!',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '숨을 깊게 들이쉬면 유황 향 속에서도 다른 향기를 느낄 수 있네요. 당신이 얼마나 연습했는지 알 것 같아요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '말은 그럴듯하네. 그럼 화염 장미를 피할 각오라도 되어 있는지 보여봐!',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '불꽃이 꺼져버리다니... 내가 졌다고 인정해야겠네.',
                        emotion: 'sad',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '당신의 화염은 정말 아름다웠어요. 저도 그 열기에 사로잡힐 뻔했죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '흥... 인정은 하지만 마음까지 내주진 않을 거야. 다음엔 더 뜨겁게 불태울 테니까.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '언제든 좋아요. 당신과 다시 맞붙을 수 있다면 저도 더 성장해 있을 테니까요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '그 말, 꼭 기억해. 카이 님 옆에 설 자격을 진짜 증명할 때까지 끝내주지 않을 거야.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '봐, 이게 나와 카이 님이 쌓아온 실력이야. 아직 불꽃에 몸을 맡길 준비가 안 된 거지.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '화염의 리듬을 따라가지 못했어요... 다시 연습해서 돌아오겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '그 용기가 있다면 언젠가 다시 만나겠지. 그때는 오늘보다 뜨거운 전장을 준비해둘게.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '기다려 주세요. 다음에는 저도 불꽃을 친구로 만들고 돌아올게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 3, name: '얼음 요새', theme: 'Ice', recommendedPower: 140,
            firstReward: { gold: 250, shards: 3 }, repeatReward: { gold: 120, shards: 2 }, cleared: false,
            story: {
                description: '얼음 속성 마법사 Seraphine Winters와의 대결. 거대한 빙결 성채에서 차가운 마법이 휘몰아친다. 전략적인 플레이가 필요하다.',
                backgroundImage: 'backgrounds/stage_03_ice_1.png'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/seraphine_winters.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '빙결 성채에 온 것을 환영해요. 나는 Seraphine Winters, 얼음 마법의 수호자예요.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '저도 Seraphine라는 이름인데, 이렇게 만나게 되다니 신기하네요.',
                        emotion: 'surprised',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '이름이 같다고 길을 내주진 않아요. 여기서는 감정까지 얼려두지 않으면 한순간에 패배하거든요.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '화염 스테이지까지는 감정에 기대어 싸웠어요. 이번엔 조금 다르게 접근해볼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '좋아요. 숨을 들이쉴 때마다 얼음이 폐를 스치고 지나갈 거예요. 그 차가움을 즐겨보세요.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '차가움 속에 있는 고요를 느껴볼게요. 그 고요 속에서 제 전략을 찾겠습니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '바로 그 태도예요. 얼음은 부드러움과 단단함을 동시에 품고 있으니까요. 준비됐다면 시작하죠.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '훌륭하네요. 당신의 전략은 얼음 위에서 춤추듯 유연했어요.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '감사합니다. 차가움 속에서도 움직임을 멈추지 않는 게 중요하다는 걸 배웠어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '얼음은 감정을 얼리는 것이 아니라, 감정을 투명하게 만드는 힘이랍니다. 그 투명함을 잊지 마세요.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네. 제 마음을 다시 돌아보게 되었어요. 다음 전투에서 꼭 활용할게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '얼음에 몸이 굳었군요. 아직 호흡이 얼음의 속도에 맞춰지지 않았어요.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '차갑다는 느낌만 생각했더니 손끝이 움직이지 않았어요. 다시 감각을 익혀야겠네요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '물로 손을 적시고 다시 얼음 위에 올려보세요. 차가움에 익숙해지면 감정도 투명해질 겁니다.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '조언 고마워요. 다음에는 고요 속에서 길을 찾아 다시 도전할게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 4, name: '뇌전의 탑', theme: 'Lightning', recommendedPower: 160,
            firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
            story: {
                description: '왕국 기사단의 전기 마법사 Leon Ardenia. "벨몬트 가문의 새 아가씨라고? 흥미롭군. 나의 뇌전 마법을 막아보시지." 번개가 치는 폭풍우 탑에서 강력한 적수를 만난다.',
                backgroundImage: 'backgrounds/stage_04_lightning_1.png'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/leon_ardenia.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '벨몬트 가문의 새 아가씨라... 소문이 궁금해 직접 내려왔지.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '왕국 기사단의 Leon Ardenia 님, 뵙게 되어 영광입니다. 번개처럼 빠른 전술을 직접 보고 싶었어요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '이 탑은 번개구름이 하루에도 수십 번 지나가는 곳이다. 한 번 방심하면 바로 감전돼서 추락하지.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '바람과 얼음을 지나온 지금, 번개의 속도에도 적응해보고 싶어요. 저를 시험해 주세요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '좋다. 번개는 망설임을 용서하지 않는다. 카드 순서를 머릿속으로 세 번 외운 뒤 그대로 실행해라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '호흡을 맞추고, 마음을 가볍게... 번개의 박자를 따라가겠습니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '그 의지를 번개보다 빠르게 보여줘라. 망설임이 보이면 바로 떨어뜨릴 것이다.',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '...대단하군. 내 뇌전의 궤적을 정확히 읽어낸 자는 처음이네.',
                        emotion: 'surprised',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '손끝이 아직 찌릿하지만, 번개의 길을 머릿속으로 따라가니 보이더라고요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '벨몬트 가문이 좋은 선택을 했군. 다음에 만날 땐 기사단의 전술을 전부 가르쳐줄 수도 있겠다.',
                        emotion: 'happy',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그날을 기대할게요. 오늘 배운 속도를 기억해 두겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '망설였군. 번개는 단 한 번의 주저도 허용하지 않는다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '속도를 따라가려다 보니 손이 먼저 움직여 버렸어요... 순서를 놓쳤습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '카드를 뽑기 전에 박자를 세어라. "하나, 둘, 번개." 그 리듬을 뼛속에 새기면 된다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 리듬을 맞춰서 도전하겠습니다. 번개의 속도를 제 것으로 만들고 싶어요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 5, name: '바람의 신전', theme: 'Wind', recommendedPower: 180,
            firstReward: { gold: 300, shards: 3 }, repeatReward: { gold: 150, shards: 2 }, cleared: false,
            story: {
                description: '구름 위에 떠있는 고대 천공 신전. 벨몬트 가문의 여동생 Iris가 언니의 실력을 테스트한다. 바람이 불고 하늘빛이 아름다운 환상적인 장소에서의 시험.',
                backgroundImage: 'backgrounds/stage_05_wind_1.png'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/iris_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Iris Belmont',
                        text: '언니! 구름 위까지 올라온 거야? 여기까지 오는 걸 보고 싶었어!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Iris, 너다운 환영이네. 바람이 기분 좋게 불어와서 긴장이 조금 풀려.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '이 신전은 우리 집안에서 가장 자유로운 곳이야. 하지만 방심하면 바로 아래로 떨어지니까 집중해야 해!',
                        emotion: 'normal',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '알겠어. 바람처럼 가볍게, 하지만 중심은 놓치지 않을게.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '언니가 가문에 와준 게 너무 좋아. 그래서 언니가 얼마나 멋진지 직접 확인하고 싶었어!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그러면 언니가 얼마나 멋진지 보여줄 시간인가 보네? 기대해줘.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '좋아! 바람처럼 빠르게 움직여보자! 졸릴 틈도 없이 몰아붙일 거야!',
                        emotion: 'angry',
                        characterImage: 'characters/iris_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Iris Belmont',
                        text: '와... 역시 언니야! 바람을 가로질러 춤추는 것 같았어!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '너 덕분에 움직임이 더 부드러워졌어. 네가 만들어 준 공중의 흐름이 길을 보여주더라.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '그럼 다음에는 더 높이 날아보자! 언니가 점점 가벼워지는 느낌이 나!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '응. 언젠가 가족 모두가 같은 하늘을 보며 웃을 수 있도록 더 연습할게.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Iris Belmont',
                        text: '괜찮아? 바람이 마음대로 불어서 놀랐지? 처음엔 누구나 흔들려.',
                        emotion: 'surprised',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '몸이 가벼워지는 걸 즐기다가 중심을 잃어버렸어. 다시 자세를 다듬어야겠어.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '그럼 내가 옆에서 바람을 잡아줄게! 언니가 익숙해질 때까지 같이 연습하자!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '고마워, Iris. 다시 한 번 하늘을 가르는 느낌을 배우고 올게.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 6, name: '화염과 빙설', theme: 'FireIce', recommendedPower: 210,
            firstReward: { gold: 320, shards: 3 }, repeatReward: { gold: 160, shards: 2 }, cleared: false,
            story: {
                description: '화염 마법사 Ariana와 얼음 마법사 Seraphine이 동시에 설계한 이중 속성 훈련장. 반쪽은 불길이, 다른 반쪽은 얼음이 뒤덮어 급격한 온도 변화를 견뎌야 한다.',
                backgroundImage: 'backgrounds/stage_06_fire_ice_1.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: '드디어 두 속성을 동시에 다루는 시험이야. 반쪽은 내 화염, 반대편은 Seraphine이 얼려놨어.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '숨을 들이쉬면 뜨겁고, 내쉬면 얼어붙는 느낌이에요... 하지만 이 대비가 분명 도움이 되겠죠.',
                        emotion: 'surprised',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '목표는 단순 승리가 아니에요. 두 속성 사이에서 균형을 잡으며 카드 순서를 조정하는 감각을 익히는 겁니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Ariana',
                        text: '뜨거워졌다가 곧바로 차가워질 거야. 그때 망설이면 카드가 부서져버려. 온도뿐 아니라 마음의 속도도 함께 조절해봐.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '감정을 억누르지 않고 흐름에 맞추겠습니다. 두 분의 조언을 몸에 새겨서 균형을 잡아 볼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '호흡을 절반마다 나눠 생각하세요. 들이쉬면서 화염을, 내쉬면서 얼음을 손에 얹는다고 상상하면 흐름을 잡을 수 있어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Ariana',
                        text: '좋아, 그럼 비밀 열기를 풀어볼까? 불꽃이 꺼지기 전에 따라와 봐.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '화염이 얼음과 함께 춤췄어. 이제 네 에너지가 흔들리지 않고 이어지는 게 보이네.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '열과 냉기를 번갈아 다루는 손놀림이 훨씬 매끄러워졌어요. 다음엔 그 흐름에 회복 카드도 섞어보죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '화염이 달아오를 때마다 얼음이 바로 식혀주는 느낌이었어요. 두 분의 조언 덕분입니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '우릴 상대로 버텨냈으니 앞으로 다른 속성 조합도 거뜬할 거야. 기념으로 불꽃차 한 잔 마시자.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '불길이 높아지면 얼음이 금방 녹아버려. 그 전에 온도를 낮춰야지.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '화염을 따라가느라 얼음의 호흡을 놓쳤어요. 두 흐름을 동시에 느끼는 게 쉽지 않네요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '먼저 손끝을 얼음에 담갔다가 불꽃에 가져다 대보세요. 감각을 번갈아 자극하면 균형이 쉬워집니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Ariana',
                        text: '다시 도전해. 얼음이 숨을 고르게 해줄 거야. 내가 바로 앞에서 지켜보고 있을게.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ]
            }
        },
        {
            id: 7, name: '폭풍의 전장', theme: 'Storm', recommendedPower: 240,
            firstReward: { gold: 330, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
            story: {
                description: '거대한 태풍의 눈을 재현한 전장. 사방에서 몰아치는 바람과 번개 사이에서 균형과 버티기를 동시에 시험한다.',
                backgroundImage: 'backgrounds/stage_07_storm_1.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/garen_stone.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Garen Stone',
                        text: '바람이 속삭이는군. 태풍의 중심에서 버틸 준비는 됐나?',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '언니, 여기서는 발끝까지 힘을 줘야 해! 바람이 장난 아니거든!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '공기가 끊임없이 흔들려요. 방금 배운 화염과 얼음의 호흡이 여기에서도 도움이 될까요?',
                        emotion: 'surprised',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '바람은 곧 균형이다. 앞뒤로 쏠리지 말고, 카드 한 장마다 중심을 다시 세워라.',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '바람에 몸을 맡기고 따라가면 돼. 그러다 중요한 순간에 힘을 주면 멋지게 날 수 있어!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '흔들리는 감정을 그대로 메모하겠습니다. 오늘은 바람과 친구가 되어볼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Garen Stone',
                        text: '폭풍 속에서 중심을 잃지 않았다. 대지 위에서도 버틸 힘이 생겼군.',
                        emotion: 'surprised',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '언니, 진짜 멋졌어! 바람이 언니 말을 듣는 것 같았어!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '폭풍 속에서도 마음을 적어두니까 두려움이 줄었어요. 다음은 땅에서 버티는 법을 다시 다져보겠습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '좋다. 곧 대지의 숨결을 다시 확인하게 될 것이다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Garen Stone',
                        text: '바람에 몸을 맡기기만 하면 안 된다. 중심이 없으면 바로 날아가 버린다.',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '순간적으로 흔들렸어요. 바람과 싸우려다 더 크게 밀렸습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '다시 해보자! 내가 옆에서 바람을 읽는 법을 알려줄게!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '무릎을 굽히고, 손바닥으로 기류를 느껴라. 균형을 잡으면 폭풍도 길들인다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ]
            }
        },
        {
            id: 8, name: '정예 부대', theme: 'Elite', recommendedPower: 280,
            firstReward: { gold: 340, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
            story: {
                description: '벨몬트 가문의 정예 부대가 사용하는 비밀 훈련소. 전술, 협력, 리더십을 동시에 요구하는 고난도 시험이다.',
                backgroundImage: 'backgrounds/stage_08_elite_1.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/marcus_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Marcus Belmont',
                        text: '정예 부대를 지휘하려면 감정에 휘둘려선 안 된다. 네가 그 자격이 있는지 확인하겠다.',
                        emotion: 'angry',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Marcus 님, 이 시험을 통과해 벨몬트 가문의 신뢰를 더 얻고 싶습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '전투 도중에도 동료에게 명령을 내리고, 동시에 카드 순환을 예측해야 합니다. 머릿속에서 상황을 계속 정리하세요.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Marcus Belmont',
                        text: '정예는 실패를 두려워하지 않지만, 이유 없는 패배도 용납하지 않는다. 한 장 한 장 목적을 가지고 쓰도록 해라.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카드마다 역할을 정의하고 전선을 지키겠습니다. 모두를 보호할 움직임을 찾을게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Marcus Belmont',
                        text: '좋다. 지금부터는 감정이 아닌 판단으로 싸워라.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Marcus Belmont',
                        text: '명령이 끊기지 않았다. 정예 병사들도 네 지휘를 따를 만하겠군.',
                        emotion: 'surprised',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '방금 전투는 "전술 목표 → 카드 배치 → 후속 대응"이 또렷했습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이번엔 감정이 아닌 팀의 움직임에 집중했어요. 정말 큰 도움이 되었습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Marcus Belmont',
                        text: '다음에 다시 시험할 것이다. 그때도 방심하지 마라.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Marcus Belmont',
                        text: '명령이 흐트러졌다. 정예 부대는 혼란을 용납하지 않는다.',
                        emotion: 'angry',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '전술을 미리 준비했는데 상황에 맞춰 수정하지 못했어요... 다시 구성하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '방금 흔들렸던 지점을 다시 짚어보세요. 패턴을 찾으면 곧바로 개선됩니다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Marcus Belmont',
                        text: '다시 준비해 와라. 다음엔 내가 더 많은 변수를 던질 것이다.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    }
                ]
            }
        },
        {
            id: 9, name: '보스 전초전', theme: 'Shadow Corridor', recommendedPower: 320,
            firstReward: { gold: 360, shards: 4 }, repeatReward: { gold: 180, shards: 2 }, cleared: false,
            story: {
                description: '최종 보스 방으로 이어지는 어두운 복도. 빛이 거의 들지 않는 긴 통로에서 집중력과 인내심을 시험한다.',
                backgroundImage: 'backgrounds/stage_09_corridor_1.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/darius_blackwood.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '마지막 문을 지키는 자로서 다시 한 번 묻지. 어둠을 지나갈 용기가 있는가?',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '심장이 빨리 뛰지만... 여기서 물러설 수는 없어요. 떨림을 인정하면서도 전진하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '두려움이 생기면 이름을 붙여라. 이름 붙은 공포는 더 이상 괴물이 아니다.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이 감정을 "떨림"이라 부르겠습니다. 그 떨림이 저를 앞으로 밀어주는 힘이 되도록 하겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '좋다. 복도 끝에서 빛이 보일 때까지, 마음을 놓지 말아라.',
                        emotion: 'angry',
                        characterImage: 'characters/darius_blackwood'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '어둠 속에서 흔들리지 않았다. 네 안의 빛을 믿었군.',
                        emotion: 'surprised',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '두려움에 이름을 붙이니 흐려졌어요. 덕분에 마지막 문까지 도달할 수 있었습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '자, 다음은 드레이크 저택이다. 그곳에서 또 다른 시험을 맞이하게 될 것이다.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '어둠이 고개를 들었다. 그때 넌 숨을 멈췄지.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요... 호흡을 잊고 말았어요. 다시 어둠 속 호흡부터 다듬어 오겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '눈을 감고, 한 걸음마다 "빛"이라고 속삭여라. 어둠은 그 단어를 두려워한다.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '다시 오거라. 문은 언제나 여기서 기다릴 것이다.',
                        emotion: 'happy',
                        characterImage: 'characters/darius_blackwood'
                    }
                ]
            }
        },
        {
            id: 10, name: '드레이크 저택', theme: 'Estate', recommendedPower: 200,
            firstReward: { gold: 380, shards: 4 }, repeatReward: { gold: 190, shards: 2 }, cleared: false,
            story: {
                description: '드레이크 가문의 정원에서 치르는 친선 배틀. 따뜻한 환대 속에서 엘레나와의 호흡을 맞추며 신뢰를 쌓는다.',
                backgroundImage: 'backgrounds/stage_10_final_boss_1.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/elena_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Elena Drake',
                        text: '세라피나, 드레이크 저택에 온 걸 환영해요. 정원에서 직접 실력을 보고 싶었어요.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '엘레나 님, 이렇게 초대해 주셔서 감사합니다. 저도 가문의 일원이 되려면 더 많은 걸 배워야 하니까요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '둘 다 너무 긴장하지 마. 가족끼리 하는 연습일 뿐이니까.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '카이가 옆에 있으니 안심했겠지만, 난 너의 집중력을 시험할 거야. 정원은 온화하지만 전투는 다를 테니.',
                        emotion: 'angry',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '알겠습니다. 오늘 느낀 감정을 마음에 깊이 새겨두고 싶어요. 언젠가 이 순간을 떠올리며 미소 짓고 싶거든요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '두 사람 모두 즐겁게 싸워줘. 내가 응원하고 있을게.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Elena Drake',
                        text: '생각보다 훨씬 강하네. 우리 가문에 잘 어울리는 열정이야.',
                        emotion: 'surprised',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '엘레나 님의 매너 덕분에 전투가 즐거웠어요. 오늘 승부를 "따뜻한 전투"로 기억하겠습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '두 사람 모두 정말 잘했어. 이런 장면을 더 자주 보고 싶다니까.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '다음에는 내가 준비한 티타임에서 전략을 이야기해보자. 가족이 될 사람에게 꼭 보여주고 싶은 게 많거든.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Elena Drake',
                        text: '긴장이 아직 남아있네. 정원에서는 숨을 크게 쉬어도 괜찮아.',
                        emotion: 'normal',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '정원의 향기에 취해 집중을 놓쳤어요. 다시 한 번 차분하게 해보고 싶습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '실패도 괜찮아. 이 순간을 기억해두면 언젠가 웃으며 이야기할 수 있을 거야.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '다시 정원에 올 때까지 실력을 더 다듬어봐. 우리 저택은 언제든 환영이야.',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    }
                ]
            }
        },
        {
            id: 11, name: '중급 시험', theme: 'Lucian2', recommendedPower: 220,
            firstReward: { gold: 400, shards: 4 }, repeatReward: { gold: 200, shards: 2 }, cleared: false,
            story: {
                description: '세라피나의 실력 향상을 확인하는 재검증 배틀. 첫 배틀보다 훨씬 강해진 Lucian과 싸워 중급 마법사 수준을 증명한다.',
                backgroundImage: 'backgrounds/stage_11_training_advanced.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/lucian_rosegarden.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Lucian',
                        text: '아가씨, 초급 시험 이후로 정말 빠르게 성장하고 계십니다. 이제는 중급 마법사 수준을 검증할 차례지요.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그동안 배운 것들을 체계적으로 정리해봤어요. 오늘 그 결과를 보여드릴게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '이번 시험에서는 속성과 카드 순환, 그리고 위기 대처 능력을 동시에 보겠습니다. 마음가짐도 단단히 준비하세요.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네. 어떤 감정이 오더라도 흔들리지 않도록 다잡겠습니다. 그것이 제가 성장하는 방법이니까요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '좋습니다. 제 손에 들린 이 카드는 가문 내에서도 위험하다고 알려진 기술입니다. 완벽히 대응해보세요.',
                        emotion: 'angry',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '기대하고 있을게요. 당신에게 배운 것을 실전으로 보여줄 수 있다면 더할 나위 없겠죠.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Lucian',
                        text: '대단합니다! 섬세한 카드 운용과 침착한 판단력... 이 정도면 중급 마법사로 인정해도 되겠네요.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '처음으로 전투 중에 감정이 흔들리지 않았어요. 대신 상황을 차분히 분석했죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '그 집중력은 훗날 큰 자산이 될 겁니다. 다음 시험에서도 그 침착함을 기대하겠습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '앞으로도 계속 성장하는 모습을 보여드릴게요. 그 다짐을 잊지 않겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Lucian',
                        text: '아직 약간의 흔들림이 보입니다. 특히 긴급 상황에서 카드 선택이 지연됐죠.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요... 머리로는 이해했는데 손이 따라주지 않았어요. 다시 반복해보겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '실패 또한 복기해 두세요. 두려움을 솔직히 인정하면 다음엔 더 빨리 극복할 수 있습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '조언 고마워요. 감정을 정확히 다잡고 다시 도전하겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 12, name: '화염 마스터', theme: 'Fire2', recommendedPower: 240,
            firstReward: { gold: 450, shards: 4 }, repeatReward: { gold: 220, shards: 2 }, cleared: false,
            story: {
                description: '화염 마법의 정수를 담은 신성한 성소에서의 대결. 더욱 강렬하고 집중된 불의 에너지.',
                backgroundImage: 'backgrounds/stage_12_fire_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: 'Stage 11에서 보여준 성장, 정말 놀라웠어. 하지만 지금은 순수한 화염의 본질을 다루는 시험이야.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Lucian도 제 실력이 중급 마법사 수준이라고 인정해줬어요. 지금은 그걸 증명해야겠죠.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '불꽃은 감정과 연결되어 있어. 집중하지 못하면 곧바로 폭주하지. 마음을 안정시키고 플로우를 느껴봐.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카이와 약속했어요. 감정에 휩쓸리지 않고 끝까지 흔들리지 않겠다고.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '좋아. 그리고 오늘은 단순한 공격만 시험하는 게 아니야. 화염으로 보호하고 치유하는 법도 익혀야 해.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '준비됐어요. 불꽃이 제 편이 되도록 만들어보겠습니다.',
                        emotion: 'angry',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '훌륭해. 공격과 방어, 회복까지 균형 있게 불을 다루기 시작했네.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '불의 흐름이 손끝까지 이어지는 게 느껴졌어요. 감정을 억누르는 대신 조화시키는 게 맞았네요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '이제 다른 속성 마스터들도 기다리고 있어. 그들과의 협력도 염두에 둬.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네. 오늘 깨달은 균형을 잊지 않을게요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '감정이 조금 흔들렸어. 불길이 흐트러지는 게 보였지?',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요... 마지막에 화염을 제어하지 못했어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '괜찮아. 다시 한 번 호흡을 고르고 네 안의 불꽃과 협력해봐.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ]
            }
        },
        {
            id: 13, name: '얼음 마스터', theme: 'Ice2', recommendedPower: 260,
            firstReward: { gold: 500, shards: 5 }, repeatReward: { gold: 250, shards: 3 }, cleared: false,
            story: {
                description: '얼음 마법의 극한을 보여주는 성전. 더욱 차가운 신비로운 얼음의 세계.',
                backgroundImage: 'backgrounds/stage_13_ice_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/seraphine_winters.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '불꽃을 다듬었다고 해서 얼음이 받아줄 거라고 생각하지 마. 차가운 집중력을 증명해봐.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Ariana가 균형을 배우라고 했어요. 이번엔 감정보다 이성을 우선해볼게요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '얼음은 시간이야. 숨을 천천히 고르고, 상대의 흐름을 읽어. 서두르면 균열이 생기지.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Lucian에게 배운 분석력을 총동원하겠어요. 각 카드의 순서를 더 치밀하게 잡아볼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '좋아. 네가 진정한 드레이크 가문 며느리가 되려면 감정을 얼릴 줄도 알아야 해.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이번엔 제가 주도권을 가지고 조종해보겠습니다.',
                        emotion: 'angry',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '의외네. 감정이 흔들리는 순간을 잘 봉인했어.',
                        emotion: 'surprised',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '얼음 속에서 불꽃이 쉬고 있는 느낌이었어요. 두 속성이 싸우기보다 함께 춤추는 것 같았죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '그 감각을 잃지 마. 곧 번개와 바람이 동시에 너를 흔들 거야.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다음 시련도 차분하게 맞이하겠습니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Seraphine Winters',
                        text: '급했다. 마지막 한 수에서 허점을 보였어.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '얼음이 손에서 미끄러지는 기분이었어요... 다시 호흡을 정돈할게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '눈을 감고, 한겨울의 공기를 떠올려봐. 감각부터 되살리는 거야.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    }
                ]
            }
        },
        {
            id: 14, name: '번개 마스터', theme: 'Lightning2', recommendedPower: 280,
            firstReward: { gold: 550, shards: 5 }, repeatReward: { gold: 280, shards: 3 }, cleared: false,
            story: {
                description: '번개 마법의 절정을 보여주는 성역. 끝없이 치는 번개와 강력한 전기 에너지.',
                backgroundImage: 'backgrounds/stage_14_lightning_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/leon_ardenia.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '얼음에서 무사히 돌아왔군. 하지만 번개는 기다려주지 않아. 순간의 판단이 전부지.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Leon 님, 지난 번보다 더 빠르게 대응하겠습니다.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '카이는 지금도 너의 성장 보고를 기다리고 있지. 약혼자에게 보여줄만한 속도를 가져봐.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카이에 대한 믿음이 제 번개가 될 거예요. 주저하지 않겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '그 반짝임을 증명해봐. 늦으면 그대로 감전이야.',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '이번엔 내 번개를 따라잡았군. 예상보다 훨씬 빠른 반응이었어.',
                        emotion: 'surprised',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '번개의 선로를 그리면서 싸우니까 흐름이 보였어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '다음은 바람. 번개와 바람이 만날 때 생기는 소용돌이를 기억해둬.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '망설였지. 번개는 생각보다 빨라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '반응이 늦었어요... 다시 속도를 다듬겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '심호흡 후, 세 번의 맥박을 떠올려. 네 박자 중 하나라도 놓치면 번개가 도망간다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    }
                ]
            }
        },
        {
            id: 15, name: '바람 마스터', theme: 'Wind2', recommendedPower: 300,
            firstReward: { gold: 600, shards: 5 }, repeatReward: { gold: 300, shards: 3 }, cleared: false,
            story: {
                description: '하늘 위에 떠 있는 바람 성궁. 아이리스가 고급 바람 제어법과 순환 전술을 전수한다.',
                backgroundImage: 'backgrounds/stage_15_wind_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/iris_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Iris Belmont',
                        text: '언니! 이번엔 바람의 성궁이야. 여기서는 공기까지 내 뜻대로 부릴 수 있!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '구름 위에서 느꼈던 자유로움이 다시 떠오르네요. 하지만 이번엔 훨씬 섬세해야 할 것 같아요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '번개와 바람은 함께 흐를 때 가장 강하다. 네가 만든 속도를 바람이 증폭시키도록 유도해라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카이가 들려준 약속을 떠올리며 한 장 한 장 집중하겠습니다. 감정과 전술을 함께 다듬고 싶어요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '그럼 시작하자! 바람이 언니 편이 되도록 내가 조금은 밀어줄게!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Iris Belmont',
                        text: '언니, 바람이 언니를 밀어주는 게 느껴졌어! 진짜로 날아다니는 것 같았다니까!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '번개에서 다듬은 리듬이 바람과 함께 어울렸군. 다음 단계로 넘어갈 준비가 됐다.',
                        emotion: 'happy',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '숨이 가빠질 때마다 바람이 도와주더라고요. 오늘 전투를 "바람과의 협력"으로 기억하겠습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '언니 최고! 이제 진짜 바람 마스터라고 불러도 되겠다!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Iris Belmont',
                        text: '바람이 갑자기 방향을 틀었지? 그럴 땐 같이 돌지 말고, 잠깐 멈춰서 중심부터 잡아야 해.',
                        emotion: 'normal',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요... 서두르다가 흐름을 잃었어요. 다시 균형부터 맞춰보겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '번개를 다룰 때처럼 맥박을 세어라. 세 번째 박자에서 바람을 타면 늦지 않는다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '다시 하자! 바람은 언제든 친구가 되어줄 거야!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    }
                ]
            }
        },
        {
            id: 16, name: '대지 마스터', theme: 'Storm2', recommendedPower: 320,
            firstReward: { gold: 650, shards: 6 }, repeatReward: { gold: 325, shards: 3 }, cleared: false,
            story: {
                description: '대지와 폭풍의 힘이 만나는 거대한 지하 동굴. 강력한 대지의 에너지.',
                backgroundImage: 'backgrounds/stage_16_earth_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/garen_stone.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Garen Stone',
                        text: '바람을 타고 내려온 기분이 어떤가. 하지만 땅 위에서는 그 속도가 무력해질 수 있다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Garen 님, 이번엔 제 방어 개념을 다듬고 싶어요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '대지는 버티는 법을 가르치지. 잠깐의 방심도 허용하지 않아. 카드 하나를 두 번 생각하고 써라.',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Marcus 님과의 재대결 전에 꼭 필요하겠네요. 제 뿌리를 더 깊게 박겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Garen Stone',
                        text: '네가 만든 방패가 내 저주를 버텼다. 꽤나 단단해졌군.',
                        emotion: 'surprised',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '대지와 바람이 함께 호흡하는 상상을 했어요. 덕분에 움직임이 끊기지 않았죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '다음 불 시험에서 그 단단함을 유지할 수 있겠지?',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Garen Stone',
                        text: '뿌리가 얕았다. 쉽게 흔들렸어.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '지탱하는 법을 잊어버렸어요... 다시 가다듬을게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '무릎을 굽혀 땅을 만지고. 그 힘을 다시 느껴라.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ]
            }
        },
        {
            id: 17, name: '불의 도전', theme: 'Fire3', recommendedPower: 340,
            firstReward: { gold: 700, shards: 6 }, repeatReward: { gold: 350, shards: 3 }, cleared: false,
            story: {
                description: '화염의 원천을 직접 마주하는 고난도 도장. Ariana가 세라피나에게 감정과 불꽃을 합치는 방법을 시험한다.',
                backgroundImage: 'backgrounds/stage_17_fire_challenge.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: '장식 없는 불길이야. 마음이 흔들리면 그대로 타버릴 거야. 준비됐어?',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '화염 마스터 시험 이후 매일 감정을 정리했어요. 오늘은 그 다짐을 불꽃 위에 올려보겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '감정을 숨기면 불꽃이 폭주해. 솔직함만 남겨. 기쁨이든 두려움이든 모두 불길에 맡겨봐.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그렇다면 감사함을 불러올게요. 여러분이 있기에 제가 여기까지 왔으니까요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '좋아. 그 따뜻함을 불꽃에 태워. 그리고 내 화염을 능가하는 장면을 보여줘.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '내 불꽃이 밀렸네. 감정이 정확히 흐르고 있었어.',
                        emotion: 'surprised',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '감정에 이름을 붙여 불꽃에 실으니 길이 보였어요. 진심의 힘을 다시 느꼈습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '곧 Mira와 맞붙게 될 거야. 불꽃으로 따뜻함을 전하는 것도 잊지 마.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '감정을 숨겼지? 불꽃은 거짓을 알고 바로 폭발해.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네... 두려움을 밀어냈어요. 그대로 인정하고 다시 마주하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '다시 도전해. 이번엔 가장 솔직한 마음부터 불러와.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    }
                ]
            }
        },
        {
            id: 21, name: '원소 융합', theme: 'Fusion', recommendedPower: 420,
            firstReward: { gold: 950, shards: 9 }, repeatReward: { gold: 475, shards: 5 }, cleared: false,
            story: {
                description: '모든 원소가 융합되는 신비로운 장소. 다양한 마법 에너지가 뒤섞인 특별한 공간.',
                backgroundImage: 'backgrounds/stage_21_fusion.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Lucian',
                        text: '세라피나, 지금부터는 우리가 가르친 모든 속성을 동시에 다뤄야 한다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Ariana',
                        text: '불길이 지나가는 경로 위에 얼음이 깔리고, 번개가 그 사이를 파고들 거야. 네가 조율해봐.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모두가 제게 가르쳐준 것을 한 번에 엮어내는군요. 숨이 막힐 정도로 긴장돼요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '긴장감도 리듬이다. 그 박자를 네가 지휘해라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '좋아요. 지금까지 배운 모든 지식을 한 장의 악보라고 생각하겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Lucian',
                        text: '대단합니다! 네 카드 순환이 모든 속성을 끊김 없이 이어냈어요.',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모두의 목소리가 한 번에 들리는 것 같았어요. 서로 다른 에너지가 화음이 됐죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '이제 카이와의 대결에서도 흔들리지 않겠지. 약혼자의 속내까지 읽을 준비해 둬.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Lucian',
                        text: '흐름이 한 번 끊어졌습니다. 다시 연결 고리를 정리해보죠.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '속성이 서로 싸우기만 했어요... 어떻게 하나로 묶어야 할까요?',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '하나씩 들어. 불, 얼음, 번개... 각자에 귀 기울이며 다시 조율해라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    }
                ]
            }
        },
        {
            id: 22, name: '약혼자 시험', theme: 'Kai1', recommendedPower: 450,
            firstReward: { gold: 1000, shards: 10 }, repeatReward: { gold: 500, shards: 6 }, cleared: false,
            story: {
                description: '드레이크 가문의 연회장에서 약혼자 Kai와 치르는 첫 공식 대결. 감정과 실력이 동시에 시험된다.',
                backgroundImage: 'backgrounds/stage_22_kai.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/kai_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Kai Drake',
                        text: '세라피나, 이렇게 마주 서니 결혼식 때보다 더 떨리는군. 각오됐나?',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Kai 님도 긴장하셨나요? 저도 당신의 전술을 정면으로 확인하고 싶어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '이 연회장은 우리 가문이 중요한 결정을 내릴 때마다 쓰인 곳이야. 오늘은 우리의 미래를 비춰주겠지.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '당신과 함께라면 어떤 평가도 두렵지 않아요. 이번 대결이 우리의 새로운 출발이 되길 바랍니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '좋아. 서로의 힘을 숨기지 말자. 이 승부가 우리를 더 강하게 만들 거야.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Kai Drake',
                        text: '...대단하다. 네 카드가 내 리듬까지 읽어냈어.',
                        emotion: 'surprised',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Kai 님의 움직임도 완벽했어요. 서로를 더 잘 알게 된 기분입니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '이제 진짜로 같은 방향을 바라볼 수 있겠지. 다음 전장에서는 어깨를 나란히 하자.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Kai Drake',
                        text: '괜찮아. 이 승부는 서로를 알아가기 위한 과정일 뿐이야.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '조금 더 차분히 대응했어야 했어요. 다시 준비해서 도전하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '전술을 정리하고 다시 맞서자. 우리 둘의 성장 이야기니까.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    }
                ]
            }
        },
        {
            id: 23, name: '기사단 최종', theme: 'Lightning3', recommendedPower: 470,
            firstReward: { gold: 1050, shards: 10 }, repeatReward: { gold: 525, shards: 6 }, cleared: false,
            story: {
                description: '왕국 기사단의 최종 시험장. 번개가 치는 기사단 본부의 전투장.',
                backgroundImage: 'backgrounds/stage_23_knights.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/leon_ardenia.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '기사단의 최종 시험이다. 번개 속에서 동료를 지휘할 수 있겠느냐?',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네, 카이와 함께한 전략을 카드에 옮겨놨어요. 기사단의 규율도 익혔고요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '속도와 규율, 두 마리 토끼를 동시에 잡아야 한다. 흔들리면 기사단은 무너진다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '제 덱은 이미 팀 단위로 움직이도록 설계했어요. 시험해 보세요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '좋다. 네 지휘에 기사단이 흔들리지 않았다. 진정한 리더십을 보여줬다.',
                        emotion: 'happy',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모두가 알려준 전략 덕분이에요. 번개 속에서도 길을 잃지 않았습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '이제 석화 마법의 심연으로 들어갈 차례다. 무거움 속에서도 균형을 잃지 마라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '지휘가 흔들렸다. 카드 순환에서 손실이 컸다.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '죄송합니다... 다시 전술을 재정비하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Leon Ardenia',
                        text: '동료가 쓰러지는 것을 상상하고, 빈틈을 메우는 카드부터 준비해라.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    }
                ]
            }
        },
        {
            id: 24, name: '석화 완전', theme: 'Storm3', recommendedPower: 490,
            firstReward: { gold: 1100, shards: 11 }, repeatReward: { gold: 550, shards: 6 }, cleared: false,
            story: {
                description: '석화 마법의 완전한 형태를 보여주는 깊은 동굴. 모든 것이 돌로 변한 공간.',
                backgroundImage: 'backgrounds/stage_24_petrification.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/garen_stone.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Garen Stone',
                        text: '이번엔 네 움직임 자체를 돌로 굳히겠다. 그럼에도 버틸 수 있겠나?',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '석화의 완전한 형태... 다시는 움직일 수 없게 만드는 힘이라 들었어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '그래서 더 정확한 대응이 필요하지. 가문의 적에게 이 힘을 뺏기면 안 된다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '대지와 바람의 균형으로 대응하겠습니다. 움직임이 멈추지 않도록.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Garen Stone',
                        text: '석화의 틈을 찾아냈군. 네 카드가 돌조차 움직이게 했다.',
                        emotion: 'surprised',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '움직임을 포기하지 않았어요. 작은 틈이라도 흐름을 유지하면 돌도 갈라지니까요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '어둠 속에서도 길을 찾을 수 있는 눈을 갖춰라. 다음은 어둠 통달이다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Garen Stone',
                        text: '멈췄다. 완전히 굳어버렸어.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '숨조차 쉴 수 없었어요... 다시 흐름을 만들게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '심장에 귀를 대고 박동을 찾아라. 움직임은 그곳에서 시작된다.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    }
                ]
            }
        },
        {
            id: 25, name: '심연 통달', theme: 'ShadowMaster', recommendedPower: 510,
            firstReward: { gold: 1150, shards: 11 }, repeatReward: { gold: 575, shards: 6 }, cleared: false,
            story: {
                description: '어둠의 심연이 그대로 펼쳐진 전투장. Darius가 심연의 모든 힘을 개방해 시험한다.',
                backgroundImage: 'backgrounds/stage_25_shadow_master.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/darius_blackwood.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '심연의 속삭임이 들리나? 오늘은 그 목소리를 있는 그대로 마주해야 한다.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '두려움도, 차가운 공포도 느껴집니다. 하지만 도망치지 않겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '좋다. 감정을 억누르지 말고 정면으로 마주해라. 심연은 진실을 먹고 자라지.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '제가 쌓아온 빛과 동료들의 목소리를 심연 속에서도 잊지 않을게요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '심연이 너를 인정했다. 네 마음을 삼키지 못했지.',
                        emotion: 'happy',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '두려움을 받아들이니 경계가 명확해졌어요. 어둠 속에서도 길을 찾을 수 있습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '이제 가문의 심장부로 나아가라. 정예 부대가 너를 기다리고 있다.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '심연의 속삭임에 휘둘렸군. 다시 마음을 다져라.',
                        emotion: 'angry',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '목소리에 휩쓸렸어요... 하지만 다시 길을 찾겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 27, name: '드레이크 자매', theme: 'Sisters', recommendedPower: 550,
            firstReward: { gold: 1250, shards: 12 }, repeatReward: { gold: 625, shards: 7 }, cleared: false,
            story: {
                description: '드레이크 자매 Elena와 Ariana가 함께 있는 특별한 공간. 따뜻하면서도 경쟁적인 분위기.',
                backgroundImage: 'backgrounds/stage_27_sisters.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/elena_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Elena Drake',
                        text: '형수님! 우리 자매가 힘을 합쳤어요. 절대 만만하지 않을걸요?',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Ariana',
                        text: 'Elena와 내가 합을 맞추는 건 드문 일이야. 네가 우리 가족이 될 자격이 있는지 확인하려고.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '두 사람의 순환을 맞추려면 엄청난 집중이 필요하겠네요. 하지만 가족으로서 받아들이고 싶어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '그럼 우리 드레이크 자매의 콤비네이션을 버텨보세요! 특히 내가 더 귀엽다는 걸 잊지 말고요!',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Ariana',
                        text: 'Elena, 진지하게 하자. 하지만 네 말대로 그녀가 우리의 리듬을 이해하길 바랄게.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Elena Drake',
                        text: '우와! 형수님, 정말 멋있어요! 우리 둘을 동시에 상대하다니!',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Ariana',
                        text: '네가 우리 가족의 리듬을 이해한 게 느껴졌어. 이제 진짜 드레이크 가문의 일원이야.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '고마워요. 앞으로도 서로 기대며 나아갑시다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Elena Drake',
                        text: '괜찮아요? 우리 콤비네이션이 너무 셌던 건가요?',
                        emotion: 'surprised',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '둘의 연결을 읽지 못했어요... 조금 더 경청해야겠네요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '대화를 더 많이 나눠보자. 가족은 마음을 공유하는 데서 시작하니까.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    }
                ]
            }
        },
        {
            id: 28, name: '다중 전술', theme: 'Multi', recommendedPower: 570,
            firstReward: { gold: 1300, shards: 13 }, repeatReward: { gold: 650, shards: 7 }, cleared: false,
            story: {
                description: '다양한 전술이 결합된 복합 전투장. 여러 전략이 동시에 펼쳐지는 공간.',
                backgroundImage: 'backgrounds/stage_28_multi_tactics.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Lucian',
                        text: '이번 전장은 우리가 가르친 모든 전략이 동시에 등장한다. 매 순간 우선순위를 재정비해야 한다.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Marcus Belmont',
                        text: '정예 부대, 기사단, 드레이크 자매까지 모두 다른 전술을 펼칠 것이다. 혼란을 통제해라.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '마치 전쟁터 전체를 지휘하는 기분이네요. 하지만 지금까지 배운 것들을 믿겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '내가 후방에서 지원할게. 정보가 들어오면 곧바로 카드 선택에 반영해.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Lucian',
                        text: '모든 전술 변화를 정확히 읽어냈어요. 정말 훌륭합니다!',
                        emotion: 'happy',
                        characterImage: 'characters/lucian_rosegarden'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '정보를 정리하고 순위를 매기는 연습을 계속한 덕분이에요. 혼란도 패턴으로 바꿀 수 있었어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '곧 바람 최종 시험이야. 감각을 유지해.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Marcus Belmont',
                        text: '우선순위가 무너졌다. 한 곳에 집중하느라 다른 전술을 놓쳤다.',
                        emotion: 'normal',
                        characterImage: 'characters/marcus_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '맞아요... 한 가지에 매달렸어요. 다시 균형을 맞춰볼게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Lucian',
                        text: '데이터를 다시 정리해보고, 카드 순환 시뮬레이션을 함께 하죠.',
                        emotion: 'normal',
                        characterImage: 'characters/lucian_rosegarden'
                    }
                ]
            }
        },
        {
            id: 29, name: '여동생 결전', theme: 'IrisFinal', recommendedPower: 590,
            firstReward: { gold: 1400, shards: 14 }, repeatReward: { gold: 700, shards: 8 }, cleared: false,
            story: {
                description: '바람의 최고 신전에서 여동생 Iris와 치르는 마지막 시험. 가족의 약속을 확인하는 자리.',
                backgroundImage: 'backgrounds/stage_29_wind_final.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/iris_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Iris Belmont',
                        text: '언니! 이제 진짜 마지막이야. 내가 얼마나 성장했는지 보여줄게!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Iris, 네 바람은 언제나 따뜻했어. 이번엔 그 힘을 정면으로 느껴볼게.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '가문을 지킬 힘을 갖고 싶어. 언니가 인정해준다면 더할 나위 없겠지?',
                        emotion: 'determined',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '서로의 미래를 걸고 싸우자. 오늘 승부는 우리 둘의 약속이 될 거야.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Iris Belmont',
                        text: '역시 언니야! 내 바람이 언니를 더 높은 곳으로 끌어올릴 수 있으면 좋겠어.',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '너의 응원 덕분에 여기까지 왔어. 다음 전투는 가주님과의 대결이야.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Iris Belmont',
                        text: '할아버지도 분명 기뻐하실 거야. 나중에 같이 축하하자!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Iris Belmont',
                        text: '괜찮아 언니! 아직 시간이 많아. 내가 계속 응원할게!',
                        emotion: 'happy',
                        characterImage: 'characters/iris_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '고마워, Iris. 다시 준비하고 더 강해져서 돌아올게.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 30, name: '가주 최종', theme: 'ElderFinal', recommendedPower: 650,
            firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
            story: {
                description: '벨몬트 가문의 왕좌실. 가주 Elder Belmont와 치르는 최종 결전. 모든 시련의 종착점.',
                backgroundImage: 'backgrounds/stage_30_final_boss.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/elder_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Elder Belmont',
                        text: '세라피나, 여기까지 올라온 것만으로도 대단하다. 그러나 마지막 시험이 남았다.',
                        emotion: 'normal',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '가주님, 오늘의 승부로 제가 이 가문의 일원임을 증명하겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Elder Belmont',
                        text: '벨몬트의 역사가 담긴 모든 속성, 모든 전술이 나의 카드에 깃들어 있다. 그 흐름을 이겨내 보아라.',
                        emotion: 'angry',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '선대의 유산을 이어받아 새로운 장을 열겠습니다. 가문의 미래를 걸고 싸울게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Elder Belmont',
                        text: '훌륭하다. 벨몬트 가문은 너를 며느리가 아닌 진정한 가족으로써 받아들인다.',
                        emotion: 'happy',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '감사합니다. 앞으로도 가문과 왕국을 위해 힘을 다하겠습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Elder Belmont',
                        text: '이제 새로운 위협이 다가온다. 하지만 너라면 충분히 맞설 수 있다.',
                        emotion: 'normal',
                        characterImage: 'characters/elder_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Elder Belmont',
                        text: '아직 한 걸음 부족하다. 다시 수련하여 올라오거라.',
                        emotion: 'normal',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '포기하지 않겠습니다. 가문의 기대에 부응하도록 더 단단해지겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 31, name: '결혼식', theme: 'Wedding', recommendedPower: 680,
            firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
            story: {
                description: '세라피나와 카이의 결혼식이 열리는 아름다운 장소. 축하와 기쁨이 가득한 공간.',
                backgroundImage: 'backgrounds/stage_31_wedding.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: '드디어 결혼식이야! 하지만 그 전에 마지막으로 실전을 점검하자. 행사장에서 돌발 상황이 생기면 어쩔 건데?',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '축제라고 해서 방심할 수 없죠. 오늘은 축하와 보호, 두 가지를 동시에 생각해야 해요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '신부가 직접 재난 대응 훈련을 한다니 역시 너다운 발상이다. 좋아, 화려한 연출과 안전을 동시에 잡아봐.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '카이와 함께할 미래이니만큼 완벽하게 준비할게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '멋졌어! 네 덱이 축복과 방어를 동시에 보여줬어. 결혼식에서도 빛날 거야.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '고마워. 모두가 안심하고 웃을 수 있는 시간을 만들고 싶었어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '그 마음 잊지 마. 이제 정치 무대에서도 같은 마음으로 나아가자.',
                        emotion: 'normal',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '괜찮아? 긴장했나 보네. 신부도 숨을 고를 시간이 필요해.',
                        emotion: 'surprised',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '예상보다 준비할 게 많아서 정신이 없었어요... 다시 정리할게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '천천히 해. 오늘은 축복받아야 할 날이니까.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ]
            }
        },
        {
            id: 32, name: '정치 음모', theme: 'Aldric', recommendedPower: 700,
            firstReward: { gold: 1600, shards: 16 }, repeatReward: { gold: 800, shards: 9 }, cleared: false,
            story: {
                description: '정치적 음모가 벌어지는 왕국 의회. 어둡고 음침한 정치의 장.',
                backgroundImage: 'backgrounds/stage_32_politics.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Advisor Aldric',
                        text: '세라피나, 가문 내외의 귀족들이 너를 주시하고 있다. 단순한 전투 실력으로는 부족하지.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '정치 무대는 카드 배틀보다 더 복잡하다고 들었어요. 하지만 도망치지 않겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '상대의 이해관계를 읽고, 때로는 거래하고, 때로는 압박해야 한다. 카드 한 장으로도 협상을 이끌어야 하지.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모두의 목소리를 듣고 조율하겠습니다. 가문의 이름을 지키기 위해.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Advisor Aldric',
                        text: '놀랍군. 갈등을 유연하게 흡수하면서도 주도권을 놓치지 않았어.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '각자의 요구를 카드에 반영하니 협상이 훨씬 수월했어요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '하지만 음모는 반복될 것이다. 마음을 단단히 해둬라.',
                        emotion: 'normal'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Advisor Aldric',
                        text: '협상 테이블에서 감정이 앞섰군. 그 틈을 상대가 노렸다.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '말이 꼬였어요... 다시 데이터와 감정을 정리하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '정보를 다시 모으고 접근 방식을 바꿔라. 정치의 핵심은 준비다.',
                        emotion: 'normal'
                    }
                ]
            }
        },
        {
            id: 33, name: '하인 최종', theme: 'MiraFinal', recommendedPower: 720,
            firstReward: { gold: 1700, shards: 17 }, repeatReward: { gold: 850, shards: 9 }, cleared: false,
            story: {
                description: '세라피나의 충성스러운 시녀 Mira와의 마지막 시험. 서로의 신뢰와 우정을 확인하는 전용 수련장.',
                backgroundImage: 'backgrounds/stage_33_mira_final.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/mira.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Mira',
                        text: '아가씨, 오늘은 제가 끝까지 함께했던 훈련을 모두 펼쳐 마지막 시험을 부탁드리고 싶어요.',
                        emotion: 'happy',
                        characterImage: 'characters/mira'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '나를 위해 이렇게 오래 준비했다니... 이번엔 서로가 얼마나 성장했는지 확인해 보자.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Mira',
                        text: '처음엔 아가씨 곁을 지키겠다는 각오뿐이었지만, 이제는 제 힘으로도 도움이 되고 싶어요.',
                        emotion: 'determined',
                        characterImage: 'characters/mira'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네가 있어서 여기까지 올 수 있었어. 이번 전투는 나도 너에게 전력을 다해 보답할게.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Mira',
                        text: '그럼, 우리의 마지막 장면을 가장 아름다운 페이지로 장식해봐요!',
                        emotion: 'happy',
                        characterImage: 'characters/mira'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Mira',
                        text: '역시 아가씨예요! 제 모든 장치와 메모를 전부 다 읽고 움직이셨어요!',
                        emotion: 'happy',
                        characterImage: 'characters/mira'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '네가 만들어 준 훈련 덕분에 마음이 더 단단해졌어. 이제 어디서든 네가 자랑스러워질 만큼 강해졌다고 자신 있게 말할게.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Mira',
                        text: '앞으로도 계속 곁에 있을게요. 이번 경험은 제가 평생 간직할 거예요!',
                        emotion: 'happy',
                        characterImage: 'characters/mira'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Mira',
                        text: '괜찮으세요? 제가 너무 무리한 조건을 만든 건 아닌지 걱정돼요...',
                        emotion: 'sad',
                        characterImage: 'characters/mira'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '아니야. 네가 준비한 과정을 제대로 마주하고 싶어. 다시 한 번 도전하게 해줘.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Mira',
                        text: '그럼 준비 과정을 조금 손봐서 다시 맞춰둘게요. 아가씨가 웃을 때까지 계속 함께할게요!',
                        emotion: 'happy',
                        characterImage: 'characters/mira'
                    }
                ]
            }
        },
        {
            id: 35, name: '음모 공격', theme: 'Conspiracy', recommendedPower: 760,
            firstReward: { gold: 1900, shards: 19 }, repeatReward: { gold: 950, shards: 11 }, cleared: false,
            story: {
                description: '정치적 음모가 실행되는 어두운 본거지. 배신과 음모가 얽힌 공간.',
                backgroundImage: 'backgrounds/stage_35_conspiracy.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '음모 세력이 직접 움직이기 시작했다. 정치적 공격과 물리적 위협이 동시에 올 것이다.',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '정보에 따르면 그들은 네 약혼을 빌미로 삼아 가문을 흔들려 한다. 준비됐나?',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이제 도망치지 않아요. 제가 직접 음모의 고리를 끊어낼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '훌륭했다. 공격과 음모를 동시에 차단했어.',
                        emotion: 'happy',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '네 대응 덕분에 귀족들의 불만도 누그러졌지. 이제 마법 연구 사고에 대비하자.',
                        emotion: 'normal'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '정보가 부족했다. 우리가 놓친 연계가 있었어.',
                        emotion: 'normal',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 자료를 모으고 전략을 재구성할게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Advisor Aldric',
                        text: '이번엔 내가 더 많은 자료를 제공하마. 다시 준비하자.',
                        emotion: 'normal'
                    }
                ]
            }
        },
        {
            id: 36, name: '마법 사고', theme: 'Thorne', recommendedPower: 780,
            firstReward: { gold: 2000, shards: 20 }, repeatReward: { gold: 1000, shards: 12 }, cleared: false,
            story: {
                description: '마법 실험이 잘못되어 사고가 난 마법 연구소. 위험한 마법 에너지가 넘치는 곳.',
                backgroundImage: 'backgrounds/stage_36_magic_lab.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '연구소에서 폭주한 마법 에너지가 가문 전체를 위협하고 있다. 통제해야 한다.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '사고의 원인을 파악하고 봉인하겠습니다. 제가 배운 모든 속성을 활용해볼게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Archmage Thorne',
                        text: '마법식을 변경하고 에너지 흐름을 재조정해야 한다. 각 단계에서 빠른 판단이 필요하다.',
                        emotion: 'normal'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '잘했다. 제어 불능의 흐름을 안정시켰군.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이제 마법 연구가 다시 안전해졌어요. 모두의 노력이 헛되지 않았습니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '마법식을 한 단계 놓쳤다. 흐름이 역류했어.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 계산해볼게요. 안정화 순서를 조정해야겠어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 37, name: '고대 마법', theme: 'AncientMagic', recommendedPower: 800,
            firstReward: { gold: 2100, shards: 21 }, repeatReward: { gold: 1050, shards: 12 }, cleared: false,
            story: {
                description: '고대 문헌에 전해지는 비밀 마법을 재현하는 봉인된 전당. 모든 속성을 조합해야 하는 복합 시험.',
                backgroundImage: 'backgrounds/stage_37_ancient.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '사고 수습을 잘해냈군. 이제 고대의 마법식 자체를 네 손으로 재현할 차례다.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '화염과 얼음을 동시에 다루던 언니의 감각이 필요해요. 네가 중심이 되어 흐름을 묶어주세요.',
                        emotion: 'normal',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모든 속성이 서로 어긋나지 않도록 호흡을 맞춰볼게. 우리가 함께라면 해낼 수 있어.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Archmage Thorne',
                        text: '마법식이 무너지면 다시 폭주가 일어난다. 침착함을 잃지 마라.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '고대 마법의 리듬을 같이 불러볼까요? 하나, 둘, 셋... 이제 시작이에요!',
                        emotion: 'happy',
                        characterImage: 'characters/seraphine_winters'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '완벽하다. 네가 짜 올린 흐름이라면 고대 마법도 안전하게 쓰일 수 있겠지.',
                        emotion: 'happy'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '언니와 호흡을 맞추니 마법이 춤을 추는 것 같았어요. 이 순간은 영원히 잊지 않을게요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphine_winters'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모두의 도움이 있었기에 가능한 일이었어요. 이제 이 힘으로 더 많은 사람을 지킬 수 있겠죠.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Archmage Thorne',
                        text: '마법식이 흔들렸다. 다시 호흡을 정렬해라.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphine',
                        text: '순간 감각이 어긋났어... 다시 흐름을 정리해볼게.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Seraphine Winters',
                        text: '언니, 같이 호흡을 세어볼까요? 천천히 맞춰가요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphine_winters'
                    }
                ]
            }
        },
        {
            id: 38, name: '라이벌 화해', theme: 'Ariana4', recommendedPower: 820,
            firstReward: { gold: 2200, shards: 22 }, repeatReward: { gold: 1100, shards: 13 }, cleared: false,
            story: {
                description: '라이벌 Ariana와의 화해가 이루어지는 특별한 공간. 경쟁에서 우정으로.',
                backgroundImage: 'backgrounds/stage_38_reconciliation.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/ariana_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Ariana',
                        text: '우리는 늘 경쟁했지. 하지만 이제는 서로를 누구보다 잘 이해하게 된 것 같아.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '라이벌이 있었기에 여기까지 올 수 있었어. 오늘은 서로의 마음을 확인하자.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Ariana',
                        text: '좋아! 전력으로 부딪혀서 진심을 보여줘.',
                        emotion: 'angry',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Ariana',
                        text: '멋졌어. 경쟁에서 시작했지만, 이제는 진짜 동료야.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '고마워. 앞으로도 서로의 등을 맡기자.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Ariana',
                        text: '괜찮아. 우리가 공유한 시간은 변하지 않아.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '조금만 더 다듬어볼게요. 진심을 제대로 전달하고 싶어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 39, name: '협력 배틀', theme: 'Kai2', recommendedPower: 840,
            firstReward: { gold: 2300, shards: 23 }, repeatReward: { gold: 1150, shards: 13 }, cleared: false,
            story: {
                description: '약혼자 카이와 함께하는 협력 배틀. 부부가 함께 싸우는 특별한 공간.',
                backgroundImage: 'backgrounds/stage_39_cooperation.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/kai_drake.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Kai Drake',
                        text: '이전에는 서로를 시험했지만, 이제는 진짜 협력할 차례다. 우리 둘의 리듬을 맞춰보자.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '같이 싸우는 건 언제나 든든해요. 서로의 빈틈을 메우면서 전투를 설계해볼게요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Kai Drake',
                        text: '내 카드와 네 카드가 동시에 발동되는 상황도 있을 거야. 순서를 머릿속으로 그리고 있어.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Kai Drake',
                        text: '완벽했어. 우리 둘의 조합이라면 어떤 전장에서도 통하겠어.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '앞으로도 서로에게 기대며 싸워요. 우리의 미래를 위해.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Kai Drake',
                        text: '괜찮아. 호흡이 맞지 않았던 부분을 찾아보자.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 리허설해볼게요. 서로의 카드를 더 잘 이해해야겠어요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 41, name: '어둠 침략', theme: 'Invasion', recommendedPower: 880,
            firstReward: { gold: 2600, shards: 26 }, repeatReward: { gold: 1300, shards: 15 }, cleared: false,
            story: {
                description: '어둠의 세력이 침략한 전쟁터. 파괴와 혼돈이 가득한 전쟁의 장.',
                backgroundImage: 'backgrounds/stage_41_invasion.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '어둠 교단이 전면 침공을 시작했다. 전선이 무너져 가고 있어.',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '저도 전선에 서겠습니다. 지금까지의 모든 전술을 활용하겠어요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '어둠이 어둠과 싸운다는 것도 흥미롭지. 너의 그림자를 다시 시험해보자.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '전선이 안정됐다. 네가 시간을 벌어준 덕분이다.',
                        emotion: 'happy',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '이 흐름을 이어가야 해요. 더 큰 전투가 다가오고 있으니까요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Leon Ardenia',
                        text: '전선이 붕괴한다! 다시 정비하자!',
                        emotion: 'angry',
                        characterImage: 'characters/leon_ardenia'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '죄송해요... 다시 전략을 정비하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 42, name: '석화 타락', theme: 'Garen4', recommendedPower: 920,
            firstReward: { gold: 2800, shards: 28 }, repeatReward: { gold: 1400, shards: 17 }, cleared: false,
            story: {
                description: '타락한 Garen의 석화 마법이 만든 어둠의 석화 공간. 더욱 어둡고 위험한 석화 영역.',
                backgroundImage: 'backgrounds/stage_42_corrupted_stone.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/garen_stone.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Garen Stone',
                        text: '...어둠이... 내 몸을... 잠식한다...',
                        emotion: 'sad',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: 'Garen 님! 제정신을 되찾으세요. 제가 도와드릴게요!',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Garen Stone',
                        text: '타락한 석화가 네 몸까지 굳게 만들 것이다... 막을 수 있다면 막아봐라...',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Garen Stone',
                        text: '...고맙다... 어둠이 걷혀간다...',
                        emotion: 'happy',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 돌아오셔서 다행이에요. 이제 다음 전선을 지켜야 합니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Garen Stone',
                        text: '굳어라... 모두 돌이 되어라...',
                        emotion: 'angry',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '안돼요... 아직 놓칠 수 없어. 다시 되찾아드릴게요!',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 43, name: '어둠 통달', theme: 'Darius3', recommendedPower: 960,
            firstReward: { gold: 3000, shards: 30 }, repeatReward: { gold: 1500, shards: 18 }, cleared: false,
            story: {
                description: '어둠의 힘을 온전히 받아들여야 하는 심연의 수련장. 빛과 그림자를 동시에 다루는 고난도 시험.',
                backgroundImage: 'backgrounds/stage_43_absolute_darkness.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/darius_blackwood.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '석화 타락을 정화했다니 인상 깊군. 이제는 어둠 그 자체를 통제할 수 있는지 시험해보자.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '어둠을 두려워하지 않으려면 끝까지 바라봐야 한다는 걸 배웠어요. 이번에도 도망치지 않을게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '너의 빛과 나의 그림자를 겹치면 새로운 길이 열린다. 감정이 흔들려도 숨을 고르고 집중해라.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '모든 감정을 받아들이며 버틸게요. 어둠과 빛이 조화를 이루는 순간을 반드시 찾아보겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '훌륭하다. 어둠이 네 안에서 고요히 숨 쉬는 것이 느껴진다. 이제 어둠도 너의 빛이 되겠지.',
                        emotion: 'happy',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '두려움을 정면으로 바라보니, 어둠 속에서도 방향이 보였어요. 지금이라면 누군가의 그림자도 지켜줄 수 있을 것 같아요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Darius Blackwood',
                        text: '어둠이 속삭일 때 마음을 빼앗겼군. 다시 숨을 고르고 들어와라.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '틈이 생겼어요... 더 깊이까지 어둠을 받아들이는 연습을 다시 해볼게요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 45, name: '교단 본부', theme: 'CultFinal', recommendedPower: 1050,
            firstReward: { gold: 3600, shards: 36 }, repeatReward: { gold: 1800, shards: 22 }, cleared: false,
            story: {
                description: '어둠 교단의 핵심 본부. 끝없이 울려 퍼지는 주문과 제단이 숨 쉬는 심장부.',
                backgroundImage: 'backgrounds/stage_45_cult_final.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Dark Cult Leader',
                        text: '네가 여기까지 들어올 줄은 몰랐지. 하지만 본부의 심장은 쉽게 멈추지 않는다.',
                        emotion: 'angry'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '교단의 중심을 정면으로 무너뜨리겠어. 더 이상 피해자가 생기지 않도록.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Dark Cult Leader',
                        text: '의식이 완성되면 왕국 전체가 우리 의지에 굴복한다. 너의 빛을 짓밟아 보겠다.',
                        emotion: 'angry'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '어둠이 아무리 커도, 함께 쌓아 올린 다짐과 마음은 꺼지지 않아. 끝까지 버텨서 이곳을 멈춘다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Dark Cult Leader',
                        text: '믿을 수가... 없어... 심장이 멈추다니...!',
                        emotion: 'sad'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '의식은 끝났어. 이제 왕국은 우리 스스로 지킬 수 있어.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Dark Cult Leader',
                        text: '빛이 흔들린다... 결국 어둠은 다시 숨을 쉰다.',
                        emotion: 'happy'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 돌아와서 확실하게 끝내겠어요. 누구도 더 이상 다치지 않게.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 46, name: '주동자', theme: 'Mastermind', recommendedPower: 1100,
            firstReward: { gold: 3900, shards: 39 }, repeatReward: { gold: 1950, shards: 24 }, cleared: false,
            story: {
                description: '교단의 배후에서 모든 음모를 지휘하던 주동자 Xander와의 대면. 모든 사건의 실마리가 이어지는 작전 회랑.',
                backgroundImage: 'backgrounds/stage_46_mastermind.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Mastermind Xander',
                        text: '드디어 만났군, 세라피나. 네가 걸어온 모든 시련은 내가 설계한 장기 말에 불과했다.',
                        emotion: 'normal'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '사람들의 마음을 이용해 자신의 욕망을 채우다니, 이제는 그 고리를 끊을 때야.',
                        emotion: 'angry',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Mastermind Xander',
                        text: '네가 밝힌 빛이 강해질수록, 그림자도 함께 자라났지. 그 어둠의 힘을 내가 거둬들이겠다.',
                        emotion: 'angry'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '빛과 어둠 모두를 받아들였기에 더 이상 흔들리지 않아. 네 계획은 여기서 끝이야.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Mastermind Xander',
                        text: '불가능해... 모든 가능성을 예측했는데... 네가 그 모든 걸 넘어설 줄은...',
                        emotion: 'sad'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '사람들의 마음을 장기 말로 여긴 순간 너의 패배는 이미 정해졌어. 이제는 우리가 서로의 미래를 선택할 거야.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Mastermind Xander',
                        text: '예상대로다. 아직 내 계산 밖은 아니었지. 다시 일어나라, 세라피나.',
                        emotion: 'happy'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 계산을 넘어서는 길을 찾을게. 곧 너를 멈춰 세우겠다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 47, name: '타락자들', theme: 'Corrupted', recommendedPower: 1150,
            firstReward: { gold: 4200, shards: 42 }, repeatReward: { gold: 2100, shards: 28 }, cleared: false,
            story: {
                description: '모든 타락한 자들이 모이는 회합장. Garen, Darius, Elena가 함께 있는 어둠의 공간.',
                backgroundImage: 'backgrounds/stage_47_corrupted_gathering.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Garen Stone',
                        text: '세라피나... 다시 한 번 시험하겠다. 이 어둠의 잔재를 지워라.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '우리가 타락했던 흔적을 완전히 정화할 수 있는지 보여줘라.',
                        emotion: 'normal',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '형수님... 다시 한 번 빛으로 이끌어주세요.',
                        emotion: 'sad',
                        characterImage: 'characters/elena_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '함께 이겨내요. 이번엔 제가 끝까지 지켜드릴게요.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Garen Stone',
                        text: '어둠의 잔재가 모두 사라졌다. 네가 우리를 완전히 구해냈다.',
                        emotion: 'happy',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Darius Blackwood',
                        text: '이제 진정한 동료로서 싸울 수 있겠군.',
                        emotion: 'happy',
                        characterImage: 'characters/darius_blackwood'
                    },
                    {
                        speaker: 'Elena Drake',
                        text: '고마워요! 앞으로는 제가 언니를 지켜드릴게요!',
                        emotion: 'happy',
                        characterImage: 'characters/elena_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Garen Stone',
                        text: '아직 어둠이 남아 있다... 다시 도전하라.',
                        emotion: 'normal',
                        characterImage: 'characters/garen_stone'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '더 강해져서 돌아올게요. 모두를 지키기 위해.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 48, name: '가주 협력', theme: 'Elder2', recommendedPower: 1200,
            firstReward: { gold: 4600, shards: 46 }, repeatReward: { gold: 2300, shards: 30 }, cleared: false,
            story: {
                description: '벨몬트 가문 가주와 함께하는 협력 전투. 가문의 힘을 합치는 특별한 공간.',
                backgroundImage: 'backgrounds/stage_48_elder_cooperation.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            enemyImage: 'characters/elder_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Elder Belmont',
                        text: '세라피나, 이제 우리가 함께 싸울 차례다. 가문의 힘을 보여주자.',
                        emotion: 'normal',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '가주님과 어깨를 나란히 하게 되다니 영광입니다.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    },
                    {
                        speaker: 'Elder Belmont',
                        text: '너의 성장을 직접 확인했지. 이제는 내가 너를 믿고 의지할 차례다.',
                        emotion: 'happy',
                        characterImage: 'characters/elder_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Elder Belmont',
                        text: '훌륭하다. 가문의 힘이 이렇게 조화로운 것은 처음 보는군.',
                        emotion: 'happy',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '앞으로도 가문을 위해 싸우겠습니다.',
                        emotion: 'determined',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Elder Belmont',
                        text: '괜찮다. 우리는 다시 일어설 수 있다.',
                        emotion: 'normal',
                        characterImage: 'characters/elder_belmont'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '다시 힘을 합쳐서 도전하겠습니다.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 49, name: '가족 결사', theme: 'Family', recommendedPower: 1250,
            firstReward: { gold: 5000, shards: 50 }, repeatReward: { gold: 2500, shards: 33 }, cleared: false,
            story: {
                description: '카이와 Ariana를 포함한 가족이 모두 모이는 결집장. 가족의 힘을 보여주는 곳.',
                backgroundImage: 'backgrounds/stage_49_family.webp'
            },
            characterImage: 'characters/seraphina_belmont.png',
            cutscene: {
                preBattle: [
                    {
                        speaker: 'Kai Drake',
                        text: '우리 가족이 모두 모였다. 이번엔 가족의 힘으로 어둠을 몰아내자.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Ariana',
                        text: '가족끼리 싸울 일이 아니라, 함께 미래를 지키는 싸움이지.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '여러분을 만나 행복해요. 이제 가족으로서 마지막까지 싸워요.',
                        emotion: 'happy',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ],
                postVictory: [
                    {
                        speaker: 'Kai Drake',
                        text: '이것이 우리 가족의 힘이다. 정말 자랑스럽군.',
                        emotion: 'happy',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Ariana',
                        text: '앞으로도 함께 걸어가자, Seraphina.',
                        emotion: 'happy',
                        characterImage: 'characters/ariana_drake'
                    }
                ],
                postDefeat: [
                    {
                        speaker: 'Kai Drake',
                        text: '괜찮아. 가족이니까 다시 일어설 수 있어.',
                        emotion: 'normal',
                        characterImage: 'characters/kai_drake'
                    },
                    {
                        speaker: 'Seraphina',
                        text: '그래요. 우리 모두 다시 힘을 모아 도전해요.',
                        emotion: 'sad',
                        characterImage: 'characters/seraphina_belmont'
                    }
                ]
            }
        },
        {
            id: 50, name: '공허 제왕', theme: 'Void', recommendedPower: 1500,
            firstReward: { gold: 6000, shards: 60 }, repeatReward: { gold: 3000, shards: 40 }, cleared: false,
            story: {
                description: '최종 보스 공허 제왕의 왕좌. 모든 것을 삼키는 절대적인 공허의 공간.',
                backgroundImage: 'backgrounds/stage_50_void_emperor.webp'
            }
        },
    ],
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
        const target = get().postBattleScreen;
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
        set({
            allCardsPool: cards,
            collection: rehydratedCollection,
            playerDeck: rehydratedDeck,
        });
        console.log(`[Shop] All cards pool set: ${cards.length} cards`);
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
        const isPvp = state.battleContext.type === 'pvp';
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
            if (state.battleContext.type === 'pvp') {
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
            if (state.battleContext.type === 'pvp') {
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
        // playerDeck이 비어있거나 20장이 아니면 랜덤 구성
        if (deck.length !== 20) {
            console.warn('[Battle] playerDeck is invalid, generating random deck');
            deck = [...cards].sort(() => Math.random() - 0.5).slice(0, 20);
        }
        // 덱 셔플
        deck = deck.sort(() => Math.random() - 0.5);
        // 적 덱: 스테이지별로 구성
        const currentStage = state.currentStage;
        let enemyDeck;
        const isPvp = state.battleContext.type === 'pvp' && !!state.pvpMatch;
        if (isPvp) {
            enemyDeck = state.pvpMatch?.opponentDeckCards?.length ? [...state.pvpMatch.opponentDeckCards] : [];
        }
        else if (currentStage) {
            enemyDeck = getEnemyDeckForStage(currentStage, cards, state.campaignStages);
        }
        else {
            enemyDeck = getBasicEnemyDeck(cards);
        }
        const baseSeed = isPvp ? state.pvpMatch.seed : Math.floor(Math.random() * 1000000);
        const initialSeed = isPvp ? generateRoundSeed(baseSeed, 1) : baseSeed;
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
            playerHp: 100, playerMaxHp: 100,
            enemyHp: 100, enemyMaxHp: 100,
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
            pvpTurnTimeLeft: isPvp ? (get().pvpTurnDuration || DEFAULT_PVP_TURN_DURATION) : null,
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
        if (isPvp) {
            get().addLog(`적이 5장을 드로우했습니다.`, 'system');
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
            priority: priority(entry.card.type) + (entry.who === 'player' ? playerPriorityBonus : enemyPriorityBonus),
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
        for (let idx = 0; idx < combined.length; idx++) {
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
                    await delay(600); // 🎬 적 카드 효과 대기
                }
            }
        }
        // 정리
        await delay(300); // 🎬 정리 전 대기
        set({ declarationLocked: false, playerQueue: [], enemyQueue: [], queuedHandIndices: [] });
        get().addLog('✅ 공개/해결 완료', 'system');
        // 리플레이 액션 기록
        const finalState = get();
        get().recordReplayAction({
            round: finalState.round,
            seed: finalState.roundSeed,
            player: pq.map(p => ({ cardId: p.card.id, cardName: p.card.name })),
            enemy: eq.map(e => ({ cardId: e.card.id, cardName: e.card.name })),
            resultHp: { player: finalState.playerHp, enemy: finalState.enemyHp }
        });
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
                newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
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
                newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
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
    enemyDrawInitial: (count) => {
        let { enemyDeck, enemyDiscard } = get();
        const enemyHand = [];
        const drawn = [];
        let newDeck = [...enemyDeck];
        let newDiscard = [...enemyDiscard];
        const maxHandSize = 10;
        for (let i = 0; i < count && enemyHand.length + drawn.length < maxHandSize; i++) {
            if (newDeck.length === 0 && newDiscard.length > 0) {
                newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
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
            if (newDeck.length === 0 && newDiscard.length > 0) {
                newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
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
        const beforeEnemyHand = enemyHand.length;
        console.log(`[EnemyDraw] 🔧 set() BEFORE - enemyHand: ${beforeEnemyHand}, drawn: ${drawn.length}, newEnemyHand will be: ${beforeEnemyHand + drawn.length}`);
        set({ enemyDeck: newDeck, enemyHand: [...enemyHand, ...drawn], enemyDiscard: newDiscard });
        notifyEnemyHandUpdate();
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
                        get().addLog(`지난 턴 받은 피해가 없습니다`, 'effect');
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
                        return source[Math.floor(Math.random() * source.length)];
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
                const roll = Math.random() * 100;
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
        const isPvp = state.battleContext.type === 'pvp';
        const handIndex = state.enemyHand.findIndex(c => c.id === card.id);
        const hasHandCard = handIndex !== -1;
        if (!isPvp && !hasHandCard)
            return false;
        const deckCopy = [...state.enemyDeck];
        const deckIndex = deckCopy.findIndex(c => c.id === card.id);
        if (deckIndex !== -1) {
            deckCopy.splice(deckIndex, 1);
        }
        const newHand = hasHandCard ? state.enemyHand.filter((_, i) => i !== handIndex) : [...state.enemyHand];
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
                        }
                        else {
                            set({ enemyEnergy: get().enemyEnergy + value });
                            get().addLog(`적 효과: 에너지 +${value}`, 'effect');
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
                else if (type === 'ApplyBleed') {
                    const stacks = Math.max(1, Number(eff.stacks ?? 1));
                    const duration = Math.max(1, Number(eff.duration ?? 2));
                    const damagePerStack = Math.max(1, Number(eff.damagePerStack ?? 5));
                    get().applyStatus('player', 'Bleed', stacks, duration, 100, damagePerStack);
                    get().addLog(`적 출혈 적용: ${stacks}중첩 / ${duration}턴 (스택당 ${damagePerStack})`, 'effect');
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
                            return source[Math.floor(Math.random() * source.length)];
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
                        }
                    }
                }
                else if (type === 'TurnSkip') {
                    const chance = Math.max(0, Math.min(100, Number(eff.chance ?? 0)));
                    const roll = Math.random() * 100;
                    if (roll < chance) {
                        set({ skipPlayerTurnOnce: true });
                        get().addLog(`⚠️ 플레이어 턴이 봉인되었습니다!`, 'effect');
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
        if (state.gameOver !== 'none' || state.isTurnProcessing) {
            return;
        }
        if (state.battleContext.type === 'pvp') {
            await get().submitPvpTurn();
            return;
        }
        set({ isTurnProcessing: true });
        if (state.playerQueue.length > 0) {
            set({ declarationLocked: true });
            await get().revealAndResolve();
        }
        get().addLog(`플레이어 턴 종료`, 'system');
        get().processStatusEffects('playerEnd');
        endTurnTimer = window.setTimeout(async () => {
            await get().enemyTurn();
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
        if (state.battleContext.type === 'pvp')
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
}));