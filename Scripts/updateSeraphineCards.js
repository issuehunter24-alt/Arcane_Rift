import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptDir, '..');

const publicCardsPath = path.resolve(projectRoot, 'web/public/data/cards.json');
const distCardsPath = path.resolve(projectRoot, 'web/dist/data/cards.json');

const rarityMap = {
  NO: 'Normal',
  RA: 'Rare',
  EP: 'Epic',
  LE: 'Legendary',
};

const typeMap = {
  ATT: 'Attack',
  DEF: 'Defense',
  HEA: 'Heal',
  SPE: 'Special',
};

const functionDefs = {
  A02: {
    cost: 2,
    tags: ['Harmony', 'Radiant'],
    keywords: ['Burn'],
    effectText: '피해 30, 화상 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_radiant_bolt',
    sfxKey: 'fire_throw',
    levelCurve: {
      base: { damage: 30 },
      perLevel: { damage: 3 },
    },
  },
  A07: {
    cost: 2,
    tags: ['Harmony', 'Frost'],
    keywords: ['Freeze'],
    effectText: '피해 24, 적에게 빙결 1턴, 빙결 상태면 추가 피해 10',
    effects: [
      { type: 'Damage', value: 24 },
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
      { type: 'Conditional', if: 'targetFrozen', then: [{ type: 'Damage', value: 10 }] },
    ],
    vfxKey: 'atk_ice_arpeggio',
    sfxKey: 'ice_crack',
  },
  A11: {
    cost: 3,
    tags: ['Harmony', 'Radiant'],
    keywords: ['Cleanse', 'Buff'],
    effectText: '피해 28, 자신 약화 2중첩 해제, 공격력 +10%(1턴)',
    effects: [
      { type: 'Damage', value: 28 },
      { type: 'Cleanse', maxStacks: 2 },
      { type: 'Buff', stat: 'attack', value: 10, duration: 1 },
    ],
    vfxKey: 'atk_radiant_slash',
    sfxKey: 'light_cut',
  },
  A18: {
    cost: 3,
    tags: ['Harmony', 'Radiant'],
    keywords: ['Heal', 'Cleanse'],
    effectText: '피해 26, 자신 HP 10 회복, 약화 2중첩 해제',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'Heal', value: 10 },
      { type: 'Cleanse', maxStacks: 2 },
    ],
    vfxKey: 'atk_radiant_wave',
    sfxKey: 'light_wave',
  },
  D01: {
    cost: 1,
    tags: ['Harmony'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_harmony_barrier',
    sfxKey: 'shield_soft',
  },
  D06: {
    cost: 2,
    tags: ['Harmony', 'Frost'],
    keywords: ['Shield', 'Freeze'],
    effectText: '보호막 18(2턴), 공격자에게 빙결 1턴',
    effects: [
      { type: 'Shield', value: 18, duration: 2 },
      {
        type: 'OnHitStatus',
        status: { key: 'Freeze', duration: 1, chance: 100 },
        duration: 2,
      },
    ],
    vfxKey: 'def_ice_barrier',
    sfxKey: 'shield_ice',
  },
  D10: {
    cost: 3,
    tags: ['Harmony'],
    keywords: ['Shield', 'Regen'],
    effectText: '보호막 30(3턴), 재생 5(3턴)',
    effects: [
      { type: 'Shield', value: 30, duration: 3 },
      { type: 'Regen', value: 5, duration: 3 },
    ],
    vfxKey: 'def_sanctify_barrier',
    sfxKey: 'heal_breeze',
  },
  D04: {
    cost: 3,
    tags: ['Harmony', 'Radiant'],
    keywords: ['Shield', 'Immune'],
    effectText: '보호막 40(2턴), 화상 면역 1턴',
    effects: [
      { type: 'Shield', value: 40, duration: 2 },
      { type: 'Immune', keywords: ['Burn'], duration: 1 },
    ],
    vfxKey: 'def_holy_barrier',
    sfxKey: 'shield_holy',
  },
  H01: {
    cost: 1,
    tags: ['Chorus'],
    keywords: ['Heal'],
    effectText: '체력 20 회복',
    effects: [{ type: 'Heal', value: 20 }],
    vfxKey: 'heal_basic',
    sfxKey: 'heal_soft',
  },
  H06: {
    cost: 2,
    tags: ['Chorus'],
    keywords: ['Heal', 'Cleanse'],
    effectText: '체력 25 회복, 최대 3중첩 디버프 해제',
    effects: [
      { type: 'Heal', value: 25 },
      { type: 'Cleanse', maxStacks: 3 },
    ],
    vfxKey: 'heal_purify',
    sfxKey: 'cleanse_soft',
  },
  H12: {
    cost: 3,
    tags: ['Chorus', 'Radiant'],
    keywords: ['Heal', 'Immune', 'Priority'],
    effectText: '체력 35 회복, 화상/쇼크 면역 1턴, 우선권 +1',
    effects: [
      { type: 'Heal', value: 35 },
      { type: 'Immune', keywords: ['Burn', 'Shock'], duration: 1 },
      { type: 'PriorityBoost', value: 1, duration: 1 },
    ],
    vfxKey: 'heal_storm',
    sfxKey: 'heal_burst',
  },
  H03: {
    cost: 4,
    tags: ['Chorus'],
    keywords: ['Heal'],
    effectText: '체력 60 회복',
    effects: [{ type: 'Heal', value: 60 }],
    vfxKey: 'heal_full',
    sfxKey: 'heal_full',
  },
  S01: {
    cost: 1,
    tags: ['Harmony'],
    keywords: ['Draw'],
    effectText: '카드 2장 드로우',
    effects: [{ type: 'Draw', value: 2 }],
    vfxKey: 'spell_plan',
    sfxKey: 'paper',
  },
  S08: {
    cost: 2,
    tags: ['Harmony', 'Frost'],
    keywords: ['Freeze', 'Nullify'],
    effectText: '적에게 빙결 1턴, 다음 적 공격 1회 무효',
    effects: [
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
      { type: 'Nullify', times: 1 },
    ],
    vfxKey: 'spell_ice_bind',
    sfxKey: 'ice_bind',
  },
  S15: {
    cost: 3,
    tags: ['Harmony', 'Chorus'],
    keywords: ['Regen', 'Cleanse'],
    effectText: '재생 5(3턴), 약화 2중첩 해제',
    effects: [
      { type: 'Regen', value: 5, duration: 3, target: 'player' },
      { type: 'Cleanse', maxStacks: 2, target: 'player' },
    ],
    vfxKey: 'spell_hymn',
    sfxKey: 'choir_soft',
  },
  S18: {
    cost: 4,
    tags: ['Harmony', 'Radiant'],
    keywords: ['Immune', 'Tempo'],
    effectText: '화상/출혈/쇼크 면역 2턴, 에너지 +1',
    effects: [
      { type: 'Immune', keywords: ['Burn', 'Bleed', 'Shock'], duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'spell_light_barrier',
    sfxKey: 'light_burst',
  },
};

const cardPlan = {
  ATT_SERAPHINE_NO_193: { code: 'A02', name: '빛의 선율' },
  ATT_SERAPHINE_RA_194: { code: 'A07', name: '빙결 아리아' },
  ATT_SERAPHINE_EP_195: { code: 'A11', name: '성가의 일섬' },
  ATT_SERAPHINE_LE_196: { code: 'A18', name: '천상의 레퀴엠' },
  DEF_SERAPHINE_NO_205: { code: 'D01', name: '수호의 장막' },
  DEF_SERAPHINE_RA_206: { code: 'D06', name: '빙결 선율 보호' },
  DEF_SERAPHINE_EP_207: { code: 'D10', name: '성가의 결계' },
  DEF_SERAPHINE_LE_208: { code: 'D04', name: '성스러운 포옹' },
  HEA_SERAPHINE_NO_197: { code: 'H01', name: '치유의 화음' },
  HEA_SERAPHINE_RA_198: { code: 'H06', name: '정화의 코러스' },
  HEA_SERAPHINE_EP_199: { code: 'H12', name: '천상의 합창' },
  HEA_SERAPHINE_LE_200: { code: 'H03', name: '완전한 앙코르' },
  SPE_SERAPHINE_NO_201: { code: 'S01', name: '차분한 조율' },
  SPE_SERAPHINE_RA_202: { code: 'S08', name: '빙결 서곡' },
  SPE_SERAPHINE_EP_203: { code: 'S15', name: '은빛 성가' },
  SPE_SERAPHINE_LE_204: { code: 'S18', name: '빛의 선언' },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildCardData(id, plan, existing) {
  const def = functionDefs[plan.code];
  if (!def) {
    throw new Error(`Missing function definition for ${plan.code}`);
  }

  const [typeCode, , rarityCode] = id.split('_');
  return {
    ...(existing || {}),
    id,
    type: existing?.type ?? typeMap[typeCode],
    rarity: existing?.rarity ?? rarityMap[rarityCode],
    name: plan.name,
    cost: def.cost,
    effects: clone(def.effects),
    tags: clone(def.tags ?? []),
    keywords: clone(def.keywords ?? []),
    effectText: def.effectText,
    vfxKey: def.vfxKey,
    sfxKey: def.sfxKey,
    levelCurve: def.levelCurve ? clone(def.levelCurve) : undefined,
    version: (existing?.version ?? 0) + 1,
  };
}

function applyPlan(cards) {
  const indexMap = new Map();
  cards.forEach((card, idx) => indexMap.set(card.id, idx));

  Object.entries(cardPlan).forEach(([id, plan]) => {
    const index = indexMap.get(id);
    if (index !== undefined) {
      cards[index] = buildCardData(id, plan, cards[index]);
    } else {
      const created = buildCardData(id, plan, null);
      created.version = 1;
      cards.push(created);
    }
  });

  cards.sort((a, b) => a.id.localeCompare(b.id));
  return cards;
}

function run() {
  const cards = JSON.parse(fs.readFileSync(publicCardsPath, 'utf8'));
  const updated = applyPlan(cards);
  fs.writeFileSync(publicCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  if (fs.existsSync(distCardsPath)) {
    fs.writeFileSync(distCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  }
  console.log('Updated Seraphine cards with new effect plan.');
}

run();

