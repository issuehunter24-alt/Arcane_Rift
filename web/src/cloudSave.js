import { supabase } from './supabaseClient';
import { useBattleStore } from './store';
const SAVE_VERSION = 1;
const SAVE_TABLE = 'saves';
let currentUserId = null;
let unsubscribeSync = null;
let saveTimer = null;
let lastSavedJson = '';
let pendingSaveJson = '';
let unloadHandlerRegistered = false;
let unloadHandler = null;
let currentSyncStatus = 'idle';
let lastSaveTriggers = null;
let pendingSavedCollection = null;
let pendingSavedDeck = null;
function setCloudSyncStatus(status) {
    if (currentSyncStatus === status) {
        return;
    }
    currentSyncStatus = status;
    window.dispatchEvent(new CustomEvent('cloud-sync-status', { detail: status }));
}
if (typeof window !== 'undefined') {
    let debugInitialized = false;
    window.addEventListener('cloud-save-force', () => flushSaveImmediately());
    if (!debugInitialized) {
        debugInitialized = true;
        let lastGold = useBattleStore.getState().gold;
        let lastShards = useBattleStore.getState().shards;
        let lastCollection = useBattleStore.getState().collection.length;
        let lastDeck = useBattleStore.getState().playerDeck.length;
        let lastStage = useBattleStore.getState().currentStage;
        useBattleStore.subscribe((state) => {
            if (state.gold !== lastGold) {
                console.log('[CloudSave][Debug] Gold changed', { prev: lastGold, next: state.gold });
                lastGold = state.gold;
            }
            if (state.shards !== lastShards) {
                console.log('[CloudSave][Debug] Shards changed', { prev: lastShards, next: state.shards });
                lastShards = state.shards;
            }
            if (state.collection.length !== lastCollection) {
                console.log('[CloudSave][Debug] Collection length changed', { prev: lastCollection, next: state.collection.length });
                lastCollection = state.collection.length;
            }
            if (state.playerDeck.length !== lastDeck) {
                console.log('[CloudSave][Debug] Player deck length changed', { prev: lastDeck, next: state.playerDeck.length });
                lastDeck = state.playerDeck.length;
            }
            if (state.currentStage !== lastStage) {
                console.log('[CloudSave][Debug] Current stage changed', { prev: lastStage, next: state.currentStage });
                lastStage = state.currentStage;
            }
        });
    }
}
function selectPersistentState(state) {
    const campaignClears = state.completedStageIds.length > 0
        ? state.completedStageIds
        : state.campaignStages.filter(stage => stage.cleared).map(stage => stage.id);
    const clearedFloorIds = state.dailyDungeon.floors.filter(floor => floor.cleared).map(floor => floor.id);
    const collectionEntries = aggregateCollection(state.collection);
    const deckEntries = aggregateDeck(state.playerDeck);
    const snapshot = {
        version: SAVE_VERSION,
        gold: state.gold,
        shards: state.shards,
        pvpWins: state.pvpWins ?? 0,
        collection: collectionEntries,
        playerDeck: deckEntries,
        campaignClears,
        daily: {
            dateKey: state.dailyDungeon.dateKey,
            clearedFloorIds,
            currentFloorId: state.currentDailyFloorId,
            completed: state.dailyDungeon.completed,
        },
        currentStage: state.currentStage,
        timestamp: new Date().toISOString(),
    };
    console.log('[CloudSave] selectPersistentState snapshot', {
        gold: snapshot.gold,
        shards: snapshot.shards,
        pvpWins: snapshot.pvpWins,
        collectionEntries: snapshot.collection.length,
        deckEntries: snapshot.playerDeck.length,
        campaignClears: snapshot.campaignClears,
        currentStage: snapshot.currentStage,
    });
    return snapshot;
}
function getCanonicalCardId(cardId) {
    if (!cardId || typeof cardId !== 'string') {
        return '';
    }
    const parts = cardId.split('_');
    if (parts.length <= 6) {
        return cardId;
    }
    return parts.slice(0, 6).join('_');
}
function aggregateCollection(cards) {
    const counts = new Map();
    cards.forEach(card => {
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}
function aggregateDeck(cards) {
    const limited = cards.slice(0, 20);
    const counts = new Map();
    limited.forEach(card => {
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}
function normalizeSavedCollection(data) {
    if (!Array.isArray(data)) {
        return [];
    }
    if (data.length === 0) {
        return [];
    }
    const first = data[0];
    if (first && typeof first === 'object' && 'cardId' in first && 'count' in first) {
        return data.map(entry => ({
            cardId: getCanonicalCardId(entry.cardId),
            count: Math.max(0, Math.floor(entry.count ?? 0)),
        })).filter(entry => entry.cardId && entry.count > 0);
    }
    // Legacy format: array of Card objects
    const counts = new Map();
    data.forEach(card => {
        if (!card || typeof card !== 'object')
            return;
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}
function normalizeSavedDeck(data) {
    if (!Array.isArray(data)) {
        return [];
    }
    if (data.length === 0) {
        return [];
    }
    const first = data[0];
    if (first && typeof first === 'object' && 'cardId' in first && 'count' in first) {
        return data.map(entry => ({
            cardId: getCanonicalCardId(entry.cardId),
            count: Math.max(0, Math.floor(entry.count ?? 0)),
        })).filter(entry => entry.cardId && entry.count > 0);
    }
    // Legacy format: array of Card objects
    const limited = data.slice(0, 20);
    const counts = new Map();
    limited.forEach(card => {
        if (!card || typeof card !== 'object')
            return;
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}
function instantiateSavedEntries(entries, pool, limit = null) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }
    if (!Array.isArray(pool) || pool.length === 0) {
        return [];
    }
    const poolMap = new Map();
    pool.forEach(card => {
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        poolMap.set(key, card);
    });
    const result = [];
    const now = Date.now();
    for (const entry of entries) {
        const canonicalId = getCanonicalCardId(entry.cardId);
        const base = poolMap.get(canonicalId);
        if (!base) {
            console.warn('[CloudSave] Base card not found for saved entry', canonicalId);
            continue;
        }
        const copies = Math.max(0, Math.floor(entry.count ?? 0));
        for (let i = 0; i < copies; i++) {
            if (limit !== null && result.length >= limit) {
                return result;
            }
            const uniqueId = `${base.id}_${now}_${result.length}_${Math.random().toString(36).slice(2, 8)}`;
            result.push({ ...base, id: uniqueId });
        }
    }
    return result;
}
function applySavedCardData(collectionEntries, deckEntries) {
    const pool = useBattleStore.getState().allCardsPool;
    if (!Array.isArray(pool) || pool.length === 0) {
        pendingSavedCollection = collectionEntries;
        pendingSavedDeck = deckEntries;
        return;
    }
    const hydratedCollection = instantiateSavedEntries(collectionEntries, pool);
    const hydratedDeck = instantiateSavedEntries(deckEntries, pool, 20);
    useBattleStore.setState(() => {
        const patch = {};
        if (hydratedCollection.length > 0) {
            patch.collection = hydratedCollection;
        }
        if (hydratedDeck.length > 0) {
            patch.playerDeck = hydratedDeck;
        }
        return Object.keys(patch).length > 0 ? patch : {};
    });
    pendingSavedCollection = null;
    pendingSavedDeck = null;
}
useBattleStore.subscribe((state) => {
    if (Array.isArray(state.allCardsPool) &&
        state.allCardsPool.length > 0 &&
        (pendingSavedCollection?.length ?? 0) > 0) {
        const collectionEntries = pendingSavedCollection ?? [];
        const deckEntries = pendingSavedDeck ?? [];
        applySavedCardData(collectionEntries, deckEntries);
    }
});
function makeDeckSignature(deck) {
    return deck
        .map(card => getCanonicalCardId(card.id))
        .filter(Boolean)
        .join('|');
}
function makeCollectionSignature(collection) {
    const counts = new Map();
    collection.forEach(card => {
        const key = getCanonicalCardId(card.id);
        if (!key)
            return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .sort(([aId], [bId]) => (aId < bId ? -1 : aId > bId ? 1 : 0))
        .map(([id, count]) => `${id}:${count}`)
        .join('|');
}
function makeCampaignClearsSignature(state) {
    const ids = state.completedStageIds.length > 0
        ? state.completedStageIds
        : state.campaignStages
            .filter(stage => stage.cleared)
            .map(stage => stage.id);
    return ids.slice().sort((a, b) => a - b).join(',');
}
function makeDailySignature(state) {
    const clearedFloors = state.dailyDungeon.floors
        .filter(floor => floor.cleared)
        .map(floor => floor.id)
        .sort((a, b) => a - b)
        .join(',');
    return `${state.dailyDungeon.completed ? '1' : '0'}|${state.dailyDungeon.dateKey}|${clearedFloors}|${state.currentDailyFloorId ?? 'null'}`;
}
function extractSaveTriggers(state) {
    return {
        gold: state.gold,
        shards: state.shards,
        pvpWins: state.pvpWins,
        deckSignature: makeDeckSignature(state.playerDeck),
        collectionSignature: makeCollectionSignature(state.collection),
        campaignClearsSignature: makeCampaignClearsSignature(state),
        currentStage: state.currentStage ?? null,
        dailySignature: makeDailySignature(state),
    };
}
function triggersChanged(a, b) {
    if (!a) {
        return true;
    }
    return (a.gold !== b.gold ||
        a.shards !== b.shards ||
        a.pvpWins !== b.pvpWins ||
        a.deckSignature !== b.deckSignature ||
        a.collectionSignature !== b.collectionSignature ||
        a.campaignClearsSignature !== b.campaignClearsSignature ||
        a.currentStage !== b.currentStage ||
        a.dailySignature !== b.dailySignature);
}
async function loadCloudSave(userId) {
    const { data, error } = await supabase
        .from(SAVE_TABLE)
        .select('save_blob')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) {
        console.error('[CloudSave] Failed to load save:', error);
        return null;
    }
    if (!data || !data.save_blob) {
        console.log('[CloudSave] No existing save for user', userId);
        return null;
    }
    try {
        const rawBlob = data.save_blob;
        console.log('[CloudSave] Raw save_blob fetched', {
            type: typeof rawBlob,
            hasContent: !!rawBlob,
        });
        const parsed = typeof rawBlob === 'string'
            ? JSON.parse(rawBlob)
            : rawBlob;
        if (!parsed || typeof parsed !== 'object') {
            console.warn('[CloudSave] Save blob is not an object, ignoring load');
            return null;
        }
        console.log('[CloudSave] Parsed save summary', {
            gold: parsed.gold,
            shards: parsed.shards,
            collection: Array.isArray(parsed.collection) ? parsed.collection.length : null,
            deck: Array.isArray(parsed.playerDeck) ? parsed.playerDeck.length : null,
            currentStage: parsed.currentStage,
            campaignClears: parsed.campaignClears,
        });
        return parsed;
    }
    catch (parseError) {
        console.error('[CloudSave] Failed to parse save blob:', parseError);
        return null;
    }
}
async function persistCloudSave(userId, save) {
    const payload = {
        user_id: userId,
        save_blob: save,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabase
        .from(SAVE_TABLE)
        .upsert(payload, { onConflict: 'user_id' });
    if (error) {
        console.error('[CloudSave] Failed to persist save:', error);
    }
    else {
        console.log('[CloudSave] Save persisted');
    }
}
function applyCampaignClears(state, clears) {
    const clearedSet = new Set(clears);
    return state.campaignStages.map(stage => (clearedSet.has(stage.id) ? { ...stage, cleared: true } : stage));
}
function applyCloudSave(save) {
    useBattleStore.setState((state) => {
        const updatedStages = applyCampaignClears(state, save.campaignClears ?? []);
        return {
            gold: save.gold ?? state.gold,
            shards: save.shards ?? state.shards,
            pvpWins: typeof save.pvpWins === 'number' ? save.pvpWins : state.pvpWins,
            campaignStages: updatedStages,
            completedStageIds: Array.isArray(save.campaignClears) ? [...save.campaignClears].sort((a, b) => a - b) : state.completedStageIds,
            currentDailyFloorId: save.daily?.currentFloorId ?? state.currentDailyFloorId,
            currentStage: save.currentStage ?? null,
        };
    });
    const legacyCollectionFormat = Array.isArray(save.collection) &&
        save.collection.length > 0 &&
        !save.collection[0]?.cardId;
    const legacyDeckFormat = Array.isArray(save.playerDeck) &&
        save.playerDeck.length > 0 &&
        !save.playerDeck[0]?.cardId;
    const collectionEntries = normalizeSavedCollection(save.collection);
    const deckEntries = normalizeSavedDeck(save.playerDeck);
    if (collectionEntries.length > 0 || deckEntries.length > 0) {
        applySavedCardData(collectionEntries, deckEntries);
    }
    console.log('[CloudSave] Applied save to store', {
        gold: save.gold,
        shards: save.shards,
        collectionEntries: collectionEntries.length,
        deckEntries: deckEntries.length,
        currentStage: save.currentStage,
        clears: save.campaignClears,
        pendingForRehydrate: {
            collection: pendingSavedCollection?.length ?? 0,
            deck: pendingSavedDeck?.length ?? 0,
        },
    });
    if ((legacyCollectionFormat || legacyDeckFormat) && typeof window !== 'undefined') {
        // 이전 포맷(전체 카드 객체 저장)에서 새 포맷(cardId+count)으로 변환된 경우 즉시 저장
        if (currentUserId) {
            const convertedSave = {
                ...save,
                collection: collectionEntries,
                playerDeck: deckEntries,
            };
            persistCloudSave(currentUserId, convertedSave).then(() => {
                lastSavedJson = JSON.stringify(convertedSave);
                pendingSaveJson = '';
                lastSaveTriggers = extractSaveTriggers(useBattleStore.getState());
                setCloudSyncStatus('idle');
            }).catch((error) => {
                console.error('[CloudSave] Failed to persist converted save:', error);
            });
        }
        window.setTimeout(() => {
            flushSaveImmediately();
        }, 0);
    }
}
function applyDailyProgressFromSave(save) {
    if (!save) {
        return;
    }
    const state = useBattleStore.getState();
    if (!state.dailyDungeon.dateKey || state.dailyDungeon.dateKey !== save.dateKey) {
        return;
    }
    const clearedSet = new Set(save.clearedFloorIds);
    useBattleStore.setState({
        dailyDungeon: {
            ...state.dailyDungeon,
            floors: state.dailyDungeon.floors.map(floor => ({ ...floor, cleared: clearedSet.has(floor.id) })),
            completed: save.completed,
        },
        currentDailyFloorId: save.currentFloorId ?? null,
    });
}
function flushSaveImmediately() {
    if (!currentUserId) {
        return;
    }
    setCloudSyncStatus('saving');
    const snapshot = selectPersistentState(useBattleStore.getState());
    lastSaveTriggers = extractSaveTriggers(useBattleStore.getState());
    pendingSaveJson = JSON.stringify(snapshot);
    persistCloudSave(currentUserId, snapshot).then(() => {
        lastSavedJson = JSON.stringify(snapshot);
        pendingSaveJson = '';
        setCloudSyncStatus('idle');
    }).catch((error) => {
        console.error('[CloudSave] Immediate flush failed', error);
        setCloudSyncStatus('idle');
    });
}
function scheduleSave(userId, data) {
    const json = JSON.stringify(data);
    if (json === lastSavedJson || json === pendingSaveJson) {
        return;
    }
    pendingSaveJson = json;
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = window.setTimeout(async () => {
        saveTimer = null;
        try {
            setCloudSyncStatus('saving');
            const snapshot = pendingSaveJson || json;
            const payload = JSON.parse(snapshot);
            await persistCloudSave(userId, payload);
            lastSavedJson = snapshot;
        }
        catch (error) {
            console.error('[CloudSave] Failed to serialize save payload:', error);
        }
        finally {
            pendingSaveJson = '';
            setCloudSyncStatus('idle');
        }
    }, 1000);
}
async function startSync(userId) {
    setCloudSyncStatus('loading');
    try {
        const existing = await loadCloudSave(userId);
        if (existing) {
            console.log('[CloudSave] Existing save found, applying…');
            applyCloudSave(existing);
            useBattleStore.getState().ensureDailyDungeon();
            applyDailyProgressFromSave(existing.daily);
            const currentState = useBattleStore.getState();
            lastSavedJson = JSON.stringify(selectPersistentState(currentState));
            lastSaveTriggers = extractSaveTriggers(currentState);
        }
        else {
            console.log('[CloudSave] No save found, creating default snapshot');
            useBattleStore.getState().ensureDailyDungeon();
            const defaultSave = selectPersistentState(useBattleStore.getState());
            await persistCloudSave(userId, defaultSave);
            lastSavedJson = JSON.stringify(defaultSave);
            lastSaveTriggers = extractSaveTriggers(useBattleStore.getState());
        }
        unsubscribeSync = useBattleStore.subscribe((state) => {
            const triggers = extractSaveTriggers(state);
            if (!triggersChanged(lastSaveTriggers, triggers)) {
                return;
            }
            lastSaveTriggers = triggers;
            const newState = selectPersistentState(state);
            scheduleSave(userId, newState);
        });
        if (!unloadHandlerRegistered) {
            unloadHandler = () => flushSaveImmediately();
            window.addEventListener('beforeunload', unloadHandler);
            window.addEventListener('pagehide', unloadHandler);
            unloadHandlerRegistered = true;
        }
    }
    finally {
        setCloudSyncStatus('idle');
    }
}
function stopSync() {
    if (unsubscribeSync) {
        unsubscribeSync();
        unsubscribeSync = null;
    }
    if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
    }
    lastSavedJson = '';
    pendingSaveJson = '';
    lastSaveTriggers = null;
    if (unloadHandlerRegistered && unloadHandler) {
        window.removeEventListener('beforeunload', unloadHandler);
        window.removeEventListener('pagehide', unloadHandler);
        unloadHandlerRegistered = false;
        unloadHandler = null;
    }
    setCloudSyncStatus('idle');
}
export async function handleAuthSessionChange(userId) {
    if (userId === currentUserId) {
        return;
    }
    stopSync();
    currentUserId = userId;
    if (!userId) {
        return;
    }
    await startSync(userId);
}
