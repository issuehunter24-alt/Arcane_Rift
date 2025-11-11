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
    tags: ['Valor'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_slash_basic',
    sfxKey: 'hit_blade',
  },
  A04: {
    cost: 4,
    tags: ['Valor'],
    keywords: ['Execute'],
    effectText: '피해 50, 대상 HP 30% 이하이면 추가 피해 30',
    effects: [
      { type: 'Damage', value: 50 },
      { type: 'Conditional', if: 'targetHp<=30%', then: [{ type: 'Damage', value: 30 }] },
    ],
    vfxKey: 'atk_execute',
    sfxKey: 'hit_final',
  },
  A08: {
    cost: 2,
    tags: ['Valor'],
    keywords: ['ArmorBreak'],
    effectText: '피해 22, 대상의 가드/보호막 15 제거',
    effects: [
      { type: 'Damage', value: 22 },
      { type: 'ArmorBreak', guard: 15, shield: 15 },
    ],
    vfxKey: 'atk_shield_break',
    sfxKey: 'armor_break',
  },
  A12: {
    cost: 3,
    tags: ['Valor'],
    keywords: ['Duplicate', 'Heal'],
    effectText: '피해 15, 다음 공격 카드 1회 추가 발동, 자신 HP 5 회복',
    effects: [
      { type: 'Damage', value: 15 },
      { type: 'DuplicateNext', typeFilter: 'Attack', times: 1 },
      { type: 'Heal', value: 5 },
    ],
    vfxKey: 'atk_combo',
    sfxKey: 'combo_hit',
  },
  D01: {
    cost: 1,
    tags: ['Valor'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_basic',
  },
  D04: {
    cost: 4,
    tags: ['Valor'],
    keywords: ['Shield', 'Immune'],
    effectText: '보호막 40(2턴), 화상 면역 1턴',
    effects: [
      { type: 'Shield', value: 40, duration: 2 },
      { type: 'Immune', keywords: ['Burn'], duration: 1 },
    ],
    vfxKey: 'def_barrier',
    sfxKey: 'shield_hard',
  },
  D09: {
    cost: 2,
    tags: ['Valor'],
    keywords: ['Guard', 'Tempo'],
    effectText: '가드 18(2턴), 다음 턴 에너지 +1',
    effects: [
      { type: 'Guard', value: 18, duration: 2 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'def_guard_wall',
    sfxKey: 'guard_set',
  },
  D13: {
    cost: 3,
    tags: ['Valor'],
    keywords: ['Shield', 'Vulnerable'],
    effectText: '보호막 20(2턴), 적에게 취약 1중첩(2턴)',
    effects: [
      { type: 'Shield', value: 20, duration: 2 },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'def_ground_shock',
    sfxKey: 'earthquake',
  },
  H01: {
    cost: 1,
    tags: ['Valor'],
    keywords: ['Heal'],
    effectText: '체력 20 회복',
    effects: [{ type: 'Heal', value: 20 }],
    vfxKey: 'heal_basic',
    sfxKey: 'heal_soft',
  },
  H02: {
    cost: 2,
    tags: ['Valor'],
    keywords: ['Heal'],
    effectText: '체력 40 회복',
    effects: [{ type: 'Heal', value: 40 }],
    vfxKey: 'heal_strong',
    sfxKey: 'heal_pulse',
  },
  H09: {
    cost: 3,
    tags: ['Valor'],
    keywords: ['Heal', 'Guard', 'Counter'],
    effectText: '체력 20 회복, 가드 12(2턴), 반격 15(1턴)',
    effects: [
      { type: 'Heal', value: 20 },
      { type: 'Guard', value: 12, duration: 2 },
      { type: 'Counter', value: 15, duration: 1 },
    ],
    vfxKey: 'heal_guard',
    sfxKey: 'guard_impact',
  },
  H10: {
    cost: 4,
    tags: ['Valor'],
    keywords: ['Heal', 'UndoDamage'],
    effectText: '체력 30 회복, 지난 턴 받은 피해 30% 복구',
    effects: [
      { type: 'Heal', value: 30 },
      { type: 'UndoDamage', percent: 30 },
    ],
    vfxKey: 'heal_time',
    sfxKey: 'rewind',
  },
  S02: {
    cost: 1,
    tags: ['Valor'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'spell_charge',
    sfxKey: 'energy_gain',
  },
  S11: {
    cost: 3,
    tags: ['Valor'],
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
  S20: {
    cost: 3,
    tags: ['Valor'],
    keywords: ['Tempo', 'Shield'],
    effectText: '템포 부스트 +1(3턴), 보호막 10(3턴), 에너지 +1',
    effects: [
      { type: 'TempoBoost', amount: 1, turns: 3 },
      { type: 'Shield', value: 10, duration: 3 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'spell_galvanize',
    sfxKey: 'tempo_gain',
  },
  S24: {
    cost: 4,
    tags: ['Valor'],
    keywords: ['Guard', 'Buff', 'Tempo'],
    effectText: '가드 15(2턴), 공격력 +15%(2턴), 다음 턴 에너지 +1',
    effects: [
      { type: 'Guard', value: 15, duration: 2 },
      { type: 'Buff', stat: 'attack', value: 15, duration: 2 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'spell_battlecry',
    sfxKey: 'battle_shout',
  },
};

const cardPlan = {
  ATT_GAREN_NO_065: { code: 'A01', name: '강철 참격' },
  ATT_GAREN_RA_066: { code: 'A08', name: '균열 타격' },
  ATT_GAREN_EP_067: { code: 'A12', name: '승리의 연격' },
  ATT_GAREN_LE_068: { code: 'A04', name: '정의의 심판' },
  DEF_GAREN_NO_077: { code: 'D01', name: '방패 자세' },
  DEF_GAREN_RA_078: { code: 'D09', name: '전열 방진' },
  DEF_GAREN_EP_079: { code: 'D13', name: '균열 방진' },
  DEF_GAREN_LE_080: { code: 'D04', name: '철벽 수호' },
  HEA_GAREN_NO_069: { code: 'H01', name: '전열 재정비' },
  HEA_GAREN_RA_070: { code: 'H09', name: '불굴의 맹세' },
  HEA_GAREN_EP_071: { code: 'H02', name: '강인한 재생' },
  HEA_GAREN_LE_072: { code: 'H10', name: '결의의 회복' },
  SPE_GAREN_NO_073: { code: 'S02', name: '전장의 구령' },
  SPE_GAREN_RA_074: { code: 'S20', name: '합동 진군' },
  SPE_GAREN_EP_075: { code: 'S11', name: '전우의 함성' },
  SPE_GAREN_LE_076: { code: 'S24', name: '결의의 함성' },
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
  console.log('Updated Garen cards with new effect plan.');
}

run();

