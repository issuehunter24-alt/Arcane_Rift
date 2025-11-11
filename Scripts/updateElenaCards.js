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
    tags: ['Frost'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_basic',
    sfxKey: 'hit_generic',
  },
  A07: {
    cost: 2,
    tags: ['Frost'],
    keywords: ['Freeze'],
    effectText: '피해 24, 적이 빙결 상태면 추가 피해 10',
    effects: [
      { type: 'Damage', value: 24 },
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
      { type: 'Conditional', if: 'targetFrozen', then: [{ type: 'Damage', value: 10 }] },
    ],
    vfxKey: 'atk_ice_strike',
    sfxKey: 'ice_crack',
  },
  A16: {
    cost: 3,
    tags: ['Frost'],
    keywords: ['Freeze', 'Vulnerable'],
    effectText: '피해 26, 적에게 빙결 1턴 + 취약 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_ice_pierce',
    sfxKey: 'ice_shatter',
  },
  A17: {
    cost: 4,
    tags: ['Frost'],
    keywords: ['Freeze', 'Tempo'],
    effectText: '피해 30, 적에게 빙결 2턴, 다음 턴 에너지 +1',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Freeze', duration: 2, target: 'enemy' },
      { type: 'TempoBoost', amount: 1, turns: 1, scope: 'self' },
    ],
    vfxKey: 'atk_ice_overdrive',
    sfxKey: 'ice_blast',
  },
  D01: {
    cost: 1,
    tags: ['Frost'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_basic',
  },
  D06: {
    cost: 2,
    tags: ['Frost'],
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
  D16: {
    cost: 4,
    tags: ['Frost'],
    keywords: ['Shield', 'Freeze', 'Nullify'],
    effectText: '보호막 35(2턴), 공격자 빙결 1턴, 다음 공격 1회 무효',
    effects: [
      { type: 'Shield', value: 35, duration: 2 },
      {
        type: 'OnHitStatus',
        status: { key: 'Freeze', duration: 1, chance: 100 },
        duration: 2,
      },
      { type: 'Nullify', times: 1 },
    ],
    vfxKey: 'def_ice_prism',
    sfxKey: 'shield_crystal',
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
  H06: {
    cost: 2,
    tags: ['Purify'],
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
  S01: {
    cost: 1,
    tags: ['Focus'],
    keywords: ['Draw'],
    effectText: '카드 2장 드로우',
    effects: [{ type: 'Draw', value: 2 }],
    vfxKey: 'draw',
    sfxKey: 'paper',
  },
  S08: {
    cost: 2,
    tags: ['Frost'],
    keywords: ['Freeze', 'Nullify'],
    effectText: '적에게 빙결 1턴, 다음 적 공격 1회 무효',
    effects: [
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
      { type: 'Nullify', times: 1 },
    ],
    vfxKey: 'spell_ice_bind',
    sfxKey: 'ice_bind',
  },
  S22: {
    cost: 3,
    tags: ['Frost'],
    keywords: ['Tempo', 'Freeze'],
    effectText: '에너지 +1, 템포 부스트 +1(1턴), 적에게 빙결 1턴',
    effects: [
      { type: 'GainAction', value: 1 },
      { type: 'TempoBoost', amount: 1, turns: 1, scope: 'self' },
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
    ],
    vfxKey: 'spell_ice_awaken',
    sfxKey: 'ice_awaken',
  },
  S23: {
    cost: 3,
    tags: ['Frost'],
    keywords: ['Tempo', 'Freeze', 'Draw'],
    effectText: '템포 부스트 +1(2턴), 드로우 1장, 적에게 빙결 1턴',
    effects: [
      { type: 'TempoBoost', amount: 1, turns: 2, scope: 'self' },
      { type: 'Draw', value: 1 },
      { type: 'ApplyStatus', key: 'Freeze', duration: 1, target: 'enemy' },
    ],
    vfxKey: 'spell_ice_resonate',
    sfxKey: 'ice_chime',
  },
};

const cardPlan = {
  ATT_ELENA_NO_049: { code: 'A01', name: '서릿발 베기' },
  ATT_ELENA_RA_050: { code: 'A07', name: '얼음 척살' },
  ATT_ELENA_EP_051: { code: 'A16', name: '한기 관통' },
  ATT_ELENA_LE_052: { code: 'A17', name: '절대 영도' },
  DEF_ELENA_NO_061: { code: 'D01', name: '방풍 장막' },
  DEF_ELENA_RA_062: { code: 'D06', name: '결빙 장막' },
  DEF_ELENA_EP_063: { code: 'D14', name: '회오리 방출' },
  DEF_ELENA_LE_064: { code: 'D16', name: '얼음 결계' },
  HEA_ELENA_NO_053: { code: 'H05', name: '바람의 수선' },
  HEA_ELENA_RA_054: { code: 'H06', name: '정화의 숨결' },
  HEA_ELENA_EP_055: { code: 'H12', name: '폭풍 진동' },
  HEA_ELENA_LE_056: { code: 'H13', name: '회오리 정비' },
  SPE_ELENA_NO_057: { code: 'S01', name: '빙결 연구' },
  SPE_ELENA_RA_058: { code: 'S08', name: '빙정 봉인' },
  SPE_ELENA_EP_059: { code: 'S23', name: '서릿빛 공명' },
  SPE_ELENA_LE_060: { code: 'S22', name: '빙하 각성' },
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
  console.log('Updated Elena cards with new effect plan.');
}

run();

