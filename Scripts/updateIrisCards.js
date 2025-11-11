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
  A01: {
    cost: 1,
    tags: ['Light'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_slash_light',
    sfxKey: 'light_swing',
  },
  A03: {
    cost: 4,
    tags: ['Light'],
    keywords: ['Burn', 'Vulnerable'],
    effectText: '피해 40, 화상 2중첩, 취약 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 40 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 2, duration: 2, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_radiant_burst',
    sfxKey: 'explosion_light',
  },
  A11: {
    cost: 3,
    tags: ['Light'],
    keywords: ['Cleanse', 'Buff'],
    effectText: '피해 28, 자신 약화 2중첩 정화, 공격력 +10%(1턴)',
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
    tags: ['Light'],
    keywords: ['Heal', 'Cleanse'],
    effectText: '피해 26, 자신 HP 10 회복, 약화 2중첩 정화',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'Heal', value: 10 },
      { type: 'Cleanse', maxStacks: 2 },
    ],
    vfxKey: 'atk_radiant_wave',
    sfxKey: 'light_wave',
  },
  D03: {
    cost: 1,
    tags: ['Sanctify'],
    keywords: ['Nullify'],
    effectText: '무효화 1회',
    effects: [{ type: 'Nullify', times: 1 }],
    vfxKey: 'def_nullify',
    sfxKey: 'nullify',
  },
  D04: {
    cost: 4,
    tags: ['Sanctify'],
    keywords: ['Shield', 'Immune'],
    effectText: '보호막 40(2턴), 화상 면역 1턴',
    effects: [
      { type: 'Shield', value: 40, duration: 2 },
      { type: 'Immune', keywords: ['Burn'], duration: 1 },
    ],
    vfxKey: 'def_holy_barrier',
    sfxKey: 'shield_holy',
  },
  D10: {
    cost: 3,
    tags: ['Sanctify'],
    keywords: ['Shield', 'Regen'],
    effectText: '보호막 30(3턴), 재생 5(3턴)',
    effects: [
      { type: 'Shield', value: 30, duration: 3 },
      { type: 'Regen', value: 5, duration: 3 },
    ],
    vfxKey: 'def_sanctuary',
    sfxKey: 'regen_field',
  },
  D12: {
    cost: 3,
    tags: ['Sanctify'],
    keywords: ['Nullify', 'Tempo'],
    effectText: '무효화 1회, 다음 턴 에너지 +1',
    effects: [
      { type: 'Nullify', times: 1 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'def_mana_flow',
    sfxKey: 'mana_shift',
  },
  H02: {
    cost: 2,
    tags: ['Light'],
    keywords: ['Heal'],
    effectText: '체력 40 회복',
    effects: [{ type: 'Heal', value: 40 }],
    vfxKey: 'heal_strong_light',
    sfxKey: 'heal_strong',
  },
  H04: {
    cost: 4,
    tags: ['Light'],
    keywords: ['Heal', 'Buff'],
    effectText: '체력 60 회복, 공격력 +20%(2턴)',
    effects: [
      { type: 'Heal', value: 60 },
      { type: 'Buff', stat: 'attack', value: 20, duration: 2 },
    ],
    vfxKey: 'heal_bless',
    sfxKey: 'bless',
  },
  H06: {
    cost: 2,
    tags: ['Light'],
    keywords: ['Heal', 'Cleanse'],
    effectText: '체력 25 회복, 최대 3중첩 디버프 제거',
    effects: [
      { type: 'Heal', value: 25 },
      { type: 'Cleanse', maxStacks: 3 },
    ],
    vfxKey: 'heal_purify',
    sfxKey: 'cleanse_soft',
  },
  H12: {
    cost: 3,
    tags: ['Light'],
    keywords: ['Heal', 'Immune', 'Priority'],
    effectText: '체력 35 회복, 화상/쇼크 면역 1턴, 우선권 +1',
    effects: [
      { type: 'Heal', value: 35 },
      { type: 'Immune', keywords: ['Burn', 'Shock'], duration: 1 },
      { type: 'PriorityBoost', value: 1, duration: 1 },
    ],
    vfxKey: 'heal_radiant',
    sfxKey: 'heal_burst',
  },
  S01: {
    cost: 1,
    tags: ['Light'],
    keywords: ['Draw'],
    effectText: '카드 2장 드로우',
    effects: [{ type: 'Draw', value: 2 }],
    vfxKey: 'draw',
    sfxKey: 'paper',
  },
  S05: {
    cost: 2,
    tags: ['Sanctify'],
    keywords: ['Tempo', 'Draw'],
    effectText: '템포 부스트 +2(2턴), 드로우 1장',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2 },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'spell_timeburst',
    sfxKey: 'clock_tick',
  },
  S11: {
    cost: 3,
    tags: ['Light'],
    keywords: ['Buff'],
    effectText: '공격력 +15%(2턴), 속도 +10%(2턴), 드로우 1장',
    effects: [
      { type: 'Buff', stat: 'attack', value: 15, duration: 2 },
      { type: 'Buff', stat: 'speed', value: 10, duration: 2 },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'spell_aura',
    sfxKey: 'buff_aura',
  },
  S18: {
    cost: 3,
    tags: ['Light'],
    keywords: ['Immune', 'Tempo'],
    effectText: '화상/출혈/쇼크 면역 2턴, 에너지 +1',
    effects: [
      { type: 'Immune', keywords: ['Burn', 'Bleed', 'Shock'], duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'spell_radiant',
    sfxKey: 'holy_chord',
  },
};

const cardPlan = {
  ATT_IRIS_NO_081: { code: 'A01', name: '광휘 베기' },
  ATT_IRIS_RA_082: { code: 'A11', name: '성광 일섬' },
  ATT_IRIS_EP_083: { code: 'A18', name: '성광 파동' },
  ATT_IRIS_LE_084: { code: 'A03', name: '천상 폭발' },
  DEF_IRIS_NO_093: { code: 'D03', name: '천상의 방벽' },
  DEF_IRIS_RA_094: { code: 'D10', name: '성역 구축' },
  DEF_IRIS_EP_095: { code: 'D12', name: '정화의 결계' },
  DEF_IRIS_LE_096: { code: 'D04', name: '빛의 수호' },
  HEA_IRIS_NO_085: { code: 'H02', name: '치유의 기원' },
  HEA_IRIS_RA_086: { code: 'H06', name: '정화의 숨결' },
  HEA_IRIS_EP_087: { code: 'H12', name: '천위 강림' },
  HEA_IRIS_LE_088: { code: 'H04', name: '축복' },
  SPE_IRIS_NO_089: { code: 'S01', name: '빛의 영감' },
  SPE_IRIS_RA_090: { code: 'S05', name: '전술 시계' },
  SPE_IRIS_EP_091: { code: 'S11', name: '오라 공진' },
  SPE_IRIS_LE_092: { code: 'S18', name: '빛의 선언' },
};

function cloneEffects(effects) {
  return effects.map(effect => JSON.parse(JSON.stringify(effect)));
}

function buildCardData(id, plan, existing) {
  const def = functionDefs[plan.code];
  if (!def) {
    throw new Error(`Missing function definition for ${plan.code}`);
  }

  const [typeCode, , rarityCode] = id.split('_');
  const card = {
    ...(existing || {}),
    id,
    type: existing?.type ?? typeMap[typeCode],
    rarity: existing?.rarity ?? rarityMap[rarityCode],
    name: plan.name,
    cost: def.cost,
    effects: cloneEffects(def.effects),
    tags: [...(def.tags ?? [])],
    keywords: [...(def.keywords ?? [])],
    effectText: def.effectText,
    vfxKey: def.vfxKey,
    sfxKey: def.sfxKey,
    version: (existing?.version ?? 0) + 1,
  };

  return card;
}

function applyPlan(cards) {
  const indexMap = new Map();
  cards.forEach((card, idx) => indexMap.set(card.id, idx));

  Object.entries(cardPlan).forEach(([id, plan]) => {
    const index = indexMap.get(id);
    if (index !== undefined) {
      cards[index] = buildCardData(id, plan, cards[index]);
    } else {
      const newCard = buildCardData(id, plan, null);
      newCard.version = 1;
      cards.push(newCard);
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
  console.log('Updated Iris cards with new effect plan.');
}

run();

