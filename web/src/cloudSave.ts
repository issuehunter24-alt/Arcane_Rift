import { supabase } from './supabaseClient';
import { useBattleStore, STARTER_COLLECTION_CARD_IDS, STARTER_DECK_CARD_IDS } from './store';
import type { Card } from './types';

const SAVE_VERSION = 1;
const SAVE_TABLE = 'saves';

type StoreState = ReturnType<typeof useBattleStore.getState>;

type DailyProgressSave = {
  dateKey: string;
  clearedFloorIds: number[];
  currentFloorId: number | null;
  completed: boolean;
};

export type SavedCollectionEntry = {
  cardId: string;
  count: number;
};

export type SavedDeckEntry = {
  cardId: string;
  count: number;
};

export type CloudSaveData = {
  version: number;
  gold: number;
  shards: number;
  pvpWins: number;
  collection: SavedCollectionEntry[];
  playerDeck: SavedDeckEntry[];
  campaignClears: number[];
  daily: DailyProgressSave;
  currentStage: number | null;
  timestamp: string;
};

let currentUserId: string | null = null;
let unsubscribeSync: (() => void) | null = null;
let saveTimer: number | null = null;
let lastSavedJson = '';
let pendingSaveJson = '';
let unloadHandlerRegistered = false;
let unloadHandler: (() => void) | null = null;
type CloudSyncStatus = 'loading' | 'saving' | 'idle';
let currentSyncStatus: CloudSyncStatus = 'idle';
type SaveTriggerSnapshot = {
  gold: number;
  shards: number;
  pvpWins: number;
  deckSignature: string;
  collectionSignature: string;
  campaignClearsSignature: string;
  currentStage: number | null;
  dailySignature: string;
};
let lastSaveTriggers: SaveTriggerSnapshot | null = null;
let pendingSavedCollection: SavedCollectionEntry[] | null = null;
let pendingSavedDeck: SavedDeckEntry[] | null = null;
let isApplyingSavedCardData = false;

const GUEST_SAVE_KEY = 'gals_guest_save_v1';
let guestSyncUnsubscribe: (() => void) | null = null;
let guestLastSaveTriggers: SaveTriggerSnapshot | null = null;
let guestLastSavedJson = '';

function makeSavedEntriesFromCardIds(cardIds: readonly string[]): SavedCollectionEntry[] {
  const counts = new Map<string, number>();
  for (const rawId of cardIds) {
    const key = getCanonicalCardId(rawId);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}

function cloneSavedEntries<T extends SavedCollectionEntry | SavedDeckEntry>(entries: readonly T[]): T[] {
  return entries.map(entry => ({ cardId: entry.cardId, count: entry.count })) as T[];
}

const STARTER_COLLECTION_ENTRIES: readonly SavedCollectionEntry[] = makeSavedEntriesFromCardIds(STARTER_COLLECTION_CARD_IDS);
const STARTER_DECK_ENTRIES: readonly SavedDeckEntry[] = makeSavedEntriesFromCardIds(STARTER_DECK_CARD_IDS) as SavedDeckEntry[];

function setCloudSyncStatus(status: CloudSyncStatus) {
  if (currentSyncStatus === status) {
    return;
  }
  currentSyncStatus = status;
  window.dispatchEvent(new CustomEvent<CloudSyncStatus>('cloud-sync-status', { detail: status }));
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

function selectPersistentState(state: StoreState): CloudSaveData {
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
  } satisfies CloudSaveData;

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

function getCanonicalCardId(cardId: string | null | undefined): string {
  if (!cardId || typeof cardId !== 'string') {
    return '';
  }
  const canonicalMatch = cardId.match(/^([A-Z]+_[A-Z0-9]+_[A-Z]+_[0-9]+)/);
  if (canonicalMatch) {
    return canonicalMatch[1]!;
  }
  const parts = cardId.split('_');
  const timestampIndex = parts.findIndex(part => /^\d{10,}$/.test(part));
  if (timestampIndex >= 0) {
    parts.splice(timestampIndex);
  }
  if (parts.length >= 4) {
    return parts.slice(0, 4).join('_');
  }
  return parts.join('_');
}

function aggregateCollection(cards: Card[]): SavedCollectionEntry[] {
  const counts = new Map<string, number>();
  cards.forEach(card => {
    const key = getCanonicalCardId(card.id);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}

function aggregateDeck(cards: Card[]): SavedDeckEntry[] {
  const limited = cards.slice(0, 20);
  const counts = new Map<string, number>();
  limited.forEach(card => {
    const key = getCanonicalCardId(card.id);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}

function normalizeSavedCollection(data: unknown): SavedCollectionEntry[] {
  if (!Array.isArray(data)) {
    return [];
  }
  if (data.length === 0) {
    return [];
  }
  const first = data[0] as any;
  if (first && typeof first === 'object' && 'cardId' in first && 'count' in first) {
    return (data as SavedCollectionEntry[]).map(entry => ({
      cardId: getCanonicalCardId((entry as SavedCollectionEntry).cardId),
      count: Math.max(0, Math.floor((entry as SavedCollectionEntry).count ?? 0)),
    })).filter(entry => entry.cardId && entry.count > 0);
  }

  // Legacy format: array of Card objects
  const counts = new Map<string, number>();
  (data as Card[]).forEach(card => {
    if (!card || typeof card !== 'object') return;
    const key = getCanonicalCardId((card as Card).id);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}

function normalizeSavedDeck(data: unknown): SavedDeckEntry[] {
  if (!Array.isArray(data)) {
    return [];
  }
  if (data.length === 0) {
    return [];
  }
  const first = data[0] as any;
  if (first && typeof first === 'object' && 'cardId' in first && 'count' in first) {
    return (data as SavedDeckEntry[]).map(entry => ({
      cardId: getCanonicalCardId((entry as SavedDeckEntry).cardId),
      count: Math.max(0, Math.floor((entry as SavedDeckEntry).count ?? 0)),
    })).filter(entry => entry.cardId && entry.count > 0);
  }
  // Legacy format: array of Card objects
  const limited = (data as Card[]).slice(0, 20);
  const counts = new Map<string, number>();
  limited.forEach(card => {
    if (!card || typeof card !== 'object') return;
    const key = getCanonicalCardId((card as Card).id);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([cardId, count]) => ({ cardId, count }));
}

function instantiateSavedEntries(entries: (SavedCollectionEntry | SavedDeckEntry)[], pool: Card[], limit: number | null = null): Card[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }
  if (!Array.isArray(pool) || pool.length === 0) {
    return [];
  }

  const poolMap = new Map<string, Card>();
  pool.forEach(card => {
    const key = getCanonicalCardId(card.id);
    if (!key) return;
    poolMap.set(key, card);
  });

  const result: Card[] = [];
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

function applySavedCardData(collectionEntries: SavedCollectionEntry[], deckEntries: SavedDeckEntry[]) {
  if (isApplyingSavedCardData) {
    return;
  }

  const pool = useBattleStore.getState().allCardsPool;
  if (!Array.isArray(pool) || pool.length === 0) {
    pendingSavedCollection = collectionEntries;
    pendingSavedDeck = deckEntries;
    return;
  }

  isApplyingSavedCardData = true;
  try {
    const hydratedCollection = instantiateSavedEntries(collectionEntries, pool);
    const hydratedDeck = instantiateSavedEntries(deckEntries, pool, 20);

    pendingSavedCollection = null;
    pendingSavedDeck = null;

    useBattleStore.setState(() => {
      const patch: Partial<StoreState> = {};
      if (hydratedCollection.length > 0) {
        patch.collection = hydratedCollection;
      }
      if (hydratedDeck.length > 0) {
        patch.playerDeck = hydratedDeck;
      }
      return Object.keys(patch).length > 0 ? patch : {};
    });
  } finally {
    isApplyingSavedCardData = false;
  }
}

useBattleStore.subscribe((state) => {
  if (
    Array.isArray(state.allCardsPool) &&
    state.allCardsPool.length > 0 &&
    (pendingSavedCollection?.length ?? 0) > 0
  ) {
    const collectionEntries = pendingSavedCollection ?? [];
    const deckEntries = pendingSavedDeck ?? [];
    applySavedCardData(collectionEntries, deckEntries);
  }
});

function makeDeckSignature(deck: Card[]): string {
  return deck
    .map(card => getCanonicalCardId(card.id))
    .filter(Boolean)
    .join('|');
}

function makeCollectionSignature(collection: Card[]): string {
  const counts = new Map<string, number>();
  collection.forEach(card => {
    const key = getCanonicalCardId(card.id);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort(([aId], [bId]) => (aId < bId ? -1 : aId > bId ? 1 : 0))
    .map(([id, count]) => `${id}:${count}`)
    .join('|');
}

function makeCampaignClearsSignature(state: StoreState): string {
  const ids = state.completedStageIds.length > 0
    ? state.completedStageIds
    : state.campaignStages
        .filter(stage => stage.cleared)
        .map(stage => stage.id);
  return ids.slice().sort((a, b) => a - b).join(',');
}

function makeDailySignature(state: StoreState): string {
  const clearedFloors = state.dailyDungeon.floors
    .filter(floor => floor.cleared)
    .map(floor => floor.id)
    .sort((a, b) => a - b)
    .join(',');
  return `${state.dailyDungeon.completed ? '1' : '0'}|${state.dailyDungeon.dateKey}|${clearedFloors}|${state.currentDailyFloorId ?? 'null'}`;
}

function extractSaveTriggers(state: StoreState): SaveTriggerSnapshot {
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

function triggersChanged(a: SaveTriggerSnapshot | null, b: SaveTriggerSnapshot): boolean {
  if (!a) {
    return true;
  }
  return (
    a.gold !== b.gold ||
    a.shards !== b.shards ||
    a.pvpWins !== b.pvpWins ||
    a.deckSignature !== b.deckSignature ||
    a.collectionSignature !== b.collectionSignature ||
    a.campaignClearsSignature !== b.campaignClearsSignature ||
    a.currentStage !== b.currentStage ||
    a.dailySignature !== b.dailySignature
  );
}

async function loadCloudSave(userId: string): Promise<CloudSaveData | null> {
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
    const parsed =
      typeof rawBlob === 'string'
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
    return parsed as CloudSaveData;
  } catch (parseError) {
    console.error('[CloudSave] Failed to parse save blob:', parseError);
    return null;
  }
}

async function persistCloudSave(userId: string, save: CloudSaveData) {
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
  } else {
    console.log('[CloudSave] Save persisted');
  }
}

function applyCampaignClears(state: StoreState, clears: number[]) {
  const clearedSet = new Set(clears);
  return state.campaignStages.map(stage => (
    clearedSet.has(stage.id) ? { ...stage, cleared: true } : stage
  ));
}

function applyCloudSave(save: CloudSaveData) {
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

  const legacyCollectionFormat =
    Array.isArray(save.collection) &&
    save.collection.length > 0 &&
    !(save.collection[0] as any)?.cardId;
  const legacyDeckFormat =
    Array.isArray(save.playerDeck) &&
    save.playerDeck.length > 0 &&
    !(save.playerDeck[0] as any)?.cardId;

  const collectionEntries = normalizeSavedCollection(save.collection);
  const deckEntries = normalizeSavedDeck(save.playerDeck);

  let finalCollectionEntries = collectionEntries;
  let finalDeckEntries = deckEntries;
  let seededDefaults = false;

  if (finalCollectionEntries.length === 0 && finalDeckEntries.length === 0) {
    console.warn('[CloudSave] Empty save detected, seeding starter deck and collection');
    finalCollectionEntries = cloneSavedEntries(STARTER_COLLECTION_ENTRIES);
    finalDeckEntries = cloneSavedEntries(STARTER_DECK_ENTRIES);
    seededDefaults = true;
  }

  if (finalCollectionEntries.length > 0 || finalDeckEntries.length > 0) {
    applySavedCardData(finalCollectionEntries, finalDeckEntries);
  }

  console.log('[CloudSave] Applied save to store', {
    gold: save.gold,
    shards: save.shards,
    collectionEntries: finalCollectionEntries.length,
    deckEntries: finalDeckEntries.length,
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
      const convertedSave: CloudSaveData = {
        ...save,
        collection: finalCollectionEntries,
        playerDeck: finalDeckEntries,
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

  if (seededDefaults && currentUserId) {
    const seededSave: CloudSaveData = {
      ...save,
      collection: finalCollectionEntries,
      playerDeck: finalDeckEntries,
      timestamp: new Date().toISOString(),
    };
    persistCloudSave(currentUserId, seededSave).then(() => {
      lastSavedJson = JSON.stringify(seededSave);
      pendingSaveJson = '';
      lastSaveTriggers = extractSaveTriggers(useBattleStore.getState());
      setCloudSyncStatus('idle');
    }).catch((error) => {
      console.error('[CloudSave] Failed to persist seeded starter deck', error);
    });
  }
}

function applyDailyProgressFromSave(save: DailyProgressSave | undefined) {
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

function scheduleSave(userId: string, data: CloudSaveData) {
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
      const payload = JSON.parse(snapshot) as CloudSaveData;
      await persistCloudSave(userId, payload);
      lastSavedJson = snapshot;
    } catch (error) {
      console.error('[CloudSave] Failed to serialize save payload:', error);
    } finally {
      pendingSaveJson = '';
      setCloudSyncStatus('idle');
    }
  }, 1000);
}

async function startSync(userId: string) {
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
    } else {
      console.log('[CloudSave] No save found, creating default snapshot');
      useBattleStore.getState().ensureDailyDungeon();
      const starterCollection = cloneSavedEntries(STARTER_COLLECTION_ENTRIES);
      const starterDeck = cloneSavedEntries(STARTER_DECK_ENTRIES);
      applySavedCardData(starterCollection, starterDeck);
      const defaultSave = {
        ...selectPersistentState(useBattleStore.getState()),
        collection: starterCollection,
        playerDeck: starterDeck,
        timestamp: new Date().toISOString(),
      };
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
  } finally {
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

export async function handleAuthSessionChange(userId: string | null) {
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

function readGuestSaveFromStorage(): CloudSaveData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(GUEST_SAVE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as CloudSaveData;
  } catch (error) {
    console.warn('[CloudSave] Failed to parse guest save snapshot', error);
    return null;
  }
}

function persistGuestSave(snapshot: CloudSaveData) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('[CloudSave] Failed to persist guest save', error);
  }
}

export function enableGuestSaveMode() {
  if (typeof window === 'undefined') {
    console.warn('[CloudSave] Guest mode persistence is not available in this environment.');
    return;
  }

  disableGuestSaveMode();

  console.log('[CloudSave] Guest mode persistence enabled');

  const existingSave = readGuestSaveFromStorage();
  if (existingSave) {
    try {
      applyCloudSave(existingSave);
      applyDailyProgressFromSave(existingSave.daily);
      guestLastSavedJson = JSON.stringify(existingSave);
    } catch (error) {
      console.error('[CloudSave] Failed to apply guest save snapshot, clearing it', error);
      window.localStorage.removeItem(GUEST_SAVE_KEY);
      guestLastSavedJson = '';
    }
  } else {
    guestLastSavedJson = '';
    useBattleStore.getState().ensureDailyDungeon();
  }

  guestLastSaveTriggers = extractSaveTriggers(useBattleStore.getState());

  guestSyncUnsubscribe = useBattleStore.subscribe((state) => {
    const triggers = extractSaveTriggers(state);
    if (!triggersChanged(guestLastSaveTriggers, triggers)) {
      return;
    }
    guestLastSaveTriggers = triggers;
    const snapshot = selectPersistentState(state);
    guestLastSavedJson = JSON.stringify(snapshot);
    persistGuestSave(snapshot);
  });
}

export function disableGuestSaveMode() {
  if (guestSyncUnsubscribe) {
    guestSyncUnsubscribe();
    guestSyncUnsubscribe = null;
  }
  guestLastSaveTriggers = null;
  guestLastSavedJson = '';
}


