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

const functionDefs = {
  A01: {
    cost: 1,
    tags: ['Storm'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_basic',
    sfxKey: 'hit_generic',
  },
  A06: {
    cost: 2,
    tags: ['Lightning'],
    keywords: ['Shock', 'Chain'],
    effectText: '피해 18, 연쇄 2명(60%), 쇼크 1중첩',
    effects: [
      { type: 'Damage', value: 18 },
      { type: 'Chain', targets: 2, ratio: 0.6 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_lightning_chain',
    sfxKey: 'lightning_arc',
  },
  A13: {
    cost: 3,
    tags: ['Lightning'],
    keywords: ['Shock', 'Tempo'],
    effectText: '피해 30, 쇼크 2중첩, 템포 부스트 +1 (1턴)',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 2, duration: 2, target: 'enemy' },
      { type: 'TempoBoost', amount: 1, turns: 1, scope: 'self' },
    ],
    vfxKey: 'atk_lightning_burst',
    sfxKey: 'lightning_burst',
  },
  A14: {
    cost: 3,
    tags: ['Storm'],
    keywords: ['Evasion', 'Draw'],
    effectText: '피해 18, 회피 1회(1턴), 드로우 1장',
    effects: [
      { type: 'Damage', value: 18 },
      { type: 'Evasion', charges: 1, duration: 1 },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'atk_glass',
    sfxKey: 'bow_quick',
  },
  D01: {
    cost: 1,
    tags: ['Cyclone'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_basic',
  },
  D07: {
    cost: 3,
    tags: ['Lightning'],
    keywords: ['Shield', 'Shock', 'Tempo'],
    effectText: '보호막 25(2턴), 공격자에게 쇼크 1중첩, 다음 턴 에너지 +1',
    effects: [
      { type: 'Shield', value: 25, duration: 2 },
      {
        type: 'OnHitStatus',
        status: { key: 'Shock', stacks: 1, duration: 2, chance: 100 },
        duration: 2,
      },
      { type: 'TempoBoost', amount: 1, turns: 1, scope: 'self' },
    ],
    vfxKey: 'def_thunder_barrier',
    sfxKey: 'shield_electric',
  },
  D14: {
    cost: 3,
    tags: ['Cyclone'],
    keywords: ['Evasion', 'Damage', 'Shock'],
    effectText: '회피 1회, 피해 16, 쇼크 1중첩',
    effects: [
      { type: 'Evasion', charges: 1, duration: 1 },
      { type: 'Damage', value: 16 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'def_whirlwind',
    sfxKey: 'slash_whirl',
  },
  D15: {
    cost: 4,
    tags: ['Storm'],
    keywords: ['Shield', 'Tempo', 'Shock'],
    effectText: '보호막 30(2턴), 템포 부스트 +2 (2턴), 적에게 쇼크 1중첩',
    effects: [
      { type: 'Shield', value: 30, duration: 2 },
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'def_storm_core',
    sfxKey: 'shield_surge',
  },
  H05: {
    cost: 2,
    tags: ['Gale'],
    keywords: ['Heal', 'Shield', 'Regen'],
    effectText: '체력 24 회복, 초과분 보호막 +재생 6(2턴)',
    effects: [
      { type: 'Heal', value: 24, overflowToShield: true },
      { type: 'Regen', value: 6, duration: 2 },
    ],
    vfxKey: 'heal_wind',
    sfxKey: 'heal_breeze',
  },
  H11: {
    cost: 3,
    tags: ['Support'],
    keywords: ['Heal', 'Regen', 'GainAction'],
    effectText: '체력 18 회복, 에너지 +1, 재생 4(2턴)',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Regen', value: 4, duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'heal_circle',
    sfxKey: 'heal_wave',
  },
  H12: {
    cost: 3,
    tags: ['Storm'],
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
  H13: {
    cost: 3,
    tags: ['Cyclone'],
    keywords: ['Heal', 'Evasion', 'Duplicate'],
    effectText: '체력 18 회복, 회피 1회(1턴), 다음 방어 카드 1회 추가 발동',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Evasion', charges: 1, duration: 1 },
      { type: 'DuplicateNext', typeFilter: 'Defense', times: 1 },
    ],
    vfxKey: 'heal_twist',
    sfxKey: 'step_swift',
  },
  S05: {
    cost: 3,
    tags: ['Tempo'],
    keywords: ['Tempo'],
    effectText: '템포 부스트 +2 (2턴), 드로우 1장',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'buff_tempo',
    sfxKey: 'tick',
  },
  S06: {
    cost: 2,
    tags: ['Element'],
    keywords: ['ElementShift'],
    effectText: "속성 변환 (Fire→Lightning, 2턴), 피해 15",
    effects: [
      { type: 'ElementShift', from: 'Fire', to: 'Lightning', duration: 2 },
      { type: 'Damage', value: 15 },
    ],
    vfxKey: 'spell_elements',
    sfxKey: 'element_shift',
  },
  S11: {
    cost: 3,
    tags: ['Support'],
    keywords: ['Buff', 'Draw'],
    effectText: '공격력 +15%(2턴), 속도 +10%(2턴), 드로우 1장',
    effects: [
      { type: 'Buff', stat: 'attack', value: 15, duration: 2 },
      { type: 'Buff', stat: 'speed', value: 10, duration: 2 },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'aura_resonate',
    sfxKey: 'buff_aura',
  },
  S21: {
    cost: 4,
    tags: ['Lightning'],
    keywords: ['Tempo', 'Shock'],
    effectText: '템포 부스트 +2 (2턴), 에너지 +1, 적에게 쇼크 1중첩',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'GainAction', value: 1 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'spell_thunder_awaken',
    sfxKey: 'lightning_awaken',
  },
};

const cardPlan = {
  ATT_ELDER_NO_033: { code: 'A01', name: '폭풍 개시' },
  ATT_ELDER_RA_034: { code: 'A06', name: '연쇄 낙뢰' },
  ATT_ELDER_EP_035: { code: 'A13', name: '자음 포화' },
  ATT_ELDER_LE_036: { code: 'A14', name: '유리령 사격' },
  HEA_ELDER_NO_037: { code: 'H05', name: '바람의 수선' },
  HEA_ELDER_RA_038: { code: 'H11', name: '서클 리제너' },
  HEA_ELDER_EP_039: { code: 'H12', name: '폭풍 진동' },
  HEA_ELDER_LE_040: { code: 'H13', name: '회오리 정비' },
  SPE_ELDER_NO_041: { code: 'S06', name: '원소 전환' },
  SPE_ELDER_RA_042: { code: 'S05', name: '윤회 가속' },
  SPE_ELDER_EP_043: { code: 'S11', name: '오라 공진' },
  SPE_ELDER_LE_044: { code: 'S21', name: '천둥 각성' },
  DEF_ELDER_NO_045: { code: 'D01', name: '방풍 장막' },
  DEF_ELDER_RA_046: { code: 'D07', name: '천벌 결계' },
  DEF_ELDER_EP_047: { code: 'D14', name: '회오리 방출' },
  DEF_ELDER_LE_048: { code: 'D15', name: '폭풍심 재가동' },
};

function parseType(typeCode) {
  switch (typeCode) {
    case 'ATT':
      return 'Attack';
    case 'DEF':
      return 'Defense';
    case 'HEA':
      return 'Heal';
    case 'SPE':
      return 'Special';
    default:
      throw new Error(`Unknown type code: ${typeCode}`);
  }
}

function cloneEffects(effects) {
  return effects.map(effect => JSON.parse(JSON.stringify(effect)));
}

function buildCardData(id, plan, existingCard) {
  const def = functionDefs[plan.code];
  if (!def) {
    throw new Error(`Missing function definition for code ${plan.code}`);
  }

  const segments = id.split('_');
  const typeCode = segments[0];
  const rarityCode = segments[2];

  const card = {
    ...(existingCard || {}),
    id,
    type: existingCard?.type ?? parseType(typeCode),
    rarity: existingCard?.rarity ?? rarityMap[rarityCode],
    name: plan.name,
    cost: def.cost ?? existingCard?.cost ?? 1,
    effects: cloneEffects(def.effects),
    tags: [...(def.tags ?? [])],
    keywords: [...(def.keywords ?? [])],
    effectText: def.effectText ?? existingCard?.effectText ?? '',
    version: (existingCard?.version ?? 0) + 1,
  };

  if (def.vfxKey) {
    card.vfxKey = def.vfxKey;
  } else if (!existingCard) {
    delete card.vfxKey;
  }

  if (def.sfxKey) {
    card.sfxKey = def.sfxKey;
  } else if (!existingCard) {
    delete card.sfxKey;
  }

  return card;
}

function applyPlan(cards) {
  const indexById = new Map();
  cards.forEach((card, idx) => {
    indexById.set(card.id, idx);
  });

  Object.entries(cardPlan).forEach(([id, plan]) => {
    const existingIndex = indexById.get(id);
    if (existingIndex !== undefined) {
      const updated = buildCardData(id, plan, cards[existingIndex]);
      cards[existingIndex] = updated;
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
  const updatedCards = applyPlan(cards);
  fs.writeFileSync(publicCardsPath, JSON.stringify(updatedCards, null, 2), 'utf8');
  if (fs.existsSync(distCardsPath)) {
    fs.writeFileSync(distCardsPath, JSON.stringify(updatedCards, null, 2), 'utf8');
  }
  console.log('Updated Elder cards with new effect plan.');
}

run();

