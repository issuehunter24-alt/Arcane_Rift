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
    tags: ['Legion'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_legion_slash',
    sfxKey: 'slash_light',
  },
  A09: {
    cost: 2,
    tags: ['Rune'],
    keywords: ['Vulnerable', 'Tempo'],
    effectText: '피해 20, 적에게 취약 1중첩(2턴), 다음 턴 에너지 +1',
    effects: [
      { type: 'Damage', value: 20 },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'atk_rune_strike',
    sfxKey: 'arcane_burst',
  },
  A12: {
    cost: 3,
    tags: ['Legion'],
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
  A04: {
    cost: 4,
    tags: ['Legion'],
    keywords: ['Execute'],
    effectText: '피해 50, 대상 HP 30% 이하이면 추가 피해 30',
    effects: [
      { type: 'Damage', value: 50 },
      { type: 'Conditional', if: 'targetHp<=30%', then: [{ type: 'Damage', value: 30 }] },
    ],
    vfxKey: 'atk_execute',
    sfxKey: 'hit_final',
  },
  D02: {
    cost: 2,
    tags: ['Vanguard'],
    keywords: ['Counter'],
    effectText: '반격 20(1턴)',
    effects: [{ type: 'Counter', value: 20, duration: 1 }],
    vfxKey: 'def_counter',
    sfxKey: 'guard_clash',
  },
  D09: {
    cost: 2,
    tags: ['Vanguard'],
    keywords: ['Guard', 'Tempo'],
    effectText: '가드 18(2턴), 다음 턴 에너지 +1',
    effects: [
      { type: 'Guard', value: 18, duration: 2 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'def_guard_wall',
    sfxKey: 'guard_set',
  },
  D11: {
    cost: 3,
    tags: ['Tactics'],
    keywords: ['Guard', 'Root'],
    effectText: '가드 12(2턴), 적에게 속박 1턴',
    effects: [
      { type: 'Guard', value: 12, duration: 2 },
      { type: 'ApplyStatus', key: 'Root', duration: 1, target: 'enemy' },
    ],
    vfxKey: 'def_snare_field',
    sfxKey: 'trap_snap',
  },
  D03: {
    cost: 3,
    tags: ['Tactics'],
    keywords: ['Nullify'],
    effectText: '다음 적 카드 1회 무효화',
    effects: [{ type: 'Nullify', times: 1 }],
    vfxKey: 'def_nullify',
    sfxKey: 'nullify',
  },
  H01: {
    cost: 1,
    tags: ['Support'],
    keywords: ['Heal'],
    effectText: '체력 20 회복',
    effects: [{ type: 'Heal', value: 20 }],
    vfxKey: 'heal_basic',
    sfxKey: 'heal_soft',
  },
  H07: {
    cost: 2,
    tags: ['Support'],
    keywords: ['TransferHp', 'Shield'],
    effectText: '적의 체력 15 흡수, 자신 보호막 15(1턴)',
    effects: [
      { type: 'TransferHp', value: 15, from: 'enemy', to: 'player' },
      { type: 'Shield', value: 15, duration: 1 },
    ],
    vfxKey: 'heal_siphon',
    sfxKey: 'drain_hit',
  },
  H09: {
    cost: 3,
    tags: ['Support'],
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
  H04: {
    cost: 4,
    tags: ['Support'],
    keywords: ['Heal', 'Buff'],
    effectText: '체력 60 회복, 공격력 20% 증가(2턴)',
    effects: [
      { type: 'Heal', value: 60 },
      { type: 'Buff', stat: 'attack', value: 20, duration: 2 },
    ],
    vfxKey: 'heal_bless',
    sfxKey: 'bless_chime',
  },
  S02: {
    cost: 1,
    tags: ['Tactics'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'spell_order',
    sfxKey: 'energy_gain',
  },
  S03: {
    cost: 2,
    tags: ['Tactics'],
    keywords: ['Duplicate'],
    effectText: '다음 공격 카드 1회 추가 발동',
    effects: [{ type: 'DuplicateNext', typeFilter: 'Attack', times: 1 }],
    vfxKey: 'spell_twincast',
    sfxKey: 'arcane_twist',
  },
  S12: {
    cost: 3,
    tags: ['Tactics'],
    keywords: ['Tempo', 'Risk'],
    effectText: '에너지 +1, 피해 18, 자신에게 취약 1중첩',
    effects: [
      { type: 'GainAction', value: 1 },
      { type: 'Damage', value: 18 },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 1, target: 'player' },
    ],
    vfxKey: 'spell_overload',
    sfxKey: 'energy_overload',
  },
  S13: {
    cost: 4,
    tags: ['Tactics'],
    keywords: ['Steal'],
    effectText: '상대 손패 최저 코스트 카드 1장 훔치기',
    effects: [{ type: 'StealCard', from: 'opponentHand', filter: 'lowestCost', to: 'hand' }],
    vfxKey: 'spell_mirror',
    sfxKey: 'steal_card',
  },
};

const cardPlan = {
  ATT_LEON_NO_113: { code: 'A01', name: '용병의 베기' },
  ATT_LEON_RA_114: { code: 'A09', name: '룬식 충격' },
  ATT_LEON_EP_115: { code: 'A12', name: '전술 연격' },
  ATT_LEON_LE_116: { code: 'A04', name: '결전의 일격' },
  DEF_LEON_NO_121: { code: 'D02', name: '반격 자세' },
  DEF_LEON_RA_122: { code: 'D09', name: '철벽 방진' },
  DEF_LEON_EP_123: { code: 'D11', name: '속박 덫' },
  DEF_LEON_LE_124: { code: 'D03', name: '무효의 벽' },
  HEA_LEON_NO_117: { code: 'H01', name: '응급 치료' },
  HEA_LEON_RA_118: { code: 'H07', name: '생명 전이' },
  HEA_LEON_EP_119: { code: 'H09', name: '불굴의 맹세' },
  HEA_LEON_LE_120: { code: 'H04', name: '축복' },
  SPE_LEON_NO_125: { code: 'S02', name: '전술 명령' },
  SPE_LEON_RA_126: { code: 'S03', name: '더블캐스트' },
  SPE_LEON_EP_127: { code: 'S12', name: '기계 과부하' },
  SPE_LEON_LE_128: { code: 'S13', name: '미러 폴드' },
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
  console.log('Updated Leon cards with new effect plan.');
}

run();

