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
    tags: ['Hunter'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_basic',
    sfxKey: 'hit_generic',
  },
  A10: {
    cost: 3,
    tags: ['Shadow'],
    keywords: ['Leech'],
    effectText: '4회 피해 4(총 16), 가한 피해의 50% 흡혈',
    effects: [{ type: 'Damage', value: 4, hits: 4, lifestealRatio: 0.5 }],
    vfxKey: 'atk_shadow_multi',
    sfxKey: 'slash_multi',
  },
  A05: {
    cost: 2,
    tags: ['Blood'],
    keywords: ['Bleed'],
    effectText: '피해 26, 출혈 2중첩(턴마다 6 피해)',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6 },
    ],
    vfxKey: 'atk_bleed',
    sfxKey: 'slash_heavy',
  },
  A04: {
    cost: 4,
    tags: ['Execution'],
    keywords: ['Conditional'],
    effectText: '피해 50, 대상 HP 30% 이하 추가 피해 30',
    effects: [
      { type: 'Damage', value: 50 },
      { type: 'Conditional', if: 'targetHp<=30%', then: [{ type: 'Damage', value: 30 }] },
    ],
    vfxKey: 'atk_execute',
    sfxKey: 'hit_final',
  },
  D02: {
    cost: 2,
    tags: ['Guard'],
    keywords: ['Counter'],
    effectText: '반격 20 (1턴)',
    effects: [{ type: 'Counter', value: 20, duration: 1 }],
    vfxKey: 'def_counter',
    sfxKey: 'guard_clash',
  },
  D13: {
    cost: 2,
    tags: ['Earth'],
    keywords: ['Shield', 'Vulnerable'],
    effectText: '보호막 20(2턴), 공격자에게 취약 1중첩(2턴)',
    effects: [
      { type: 'Shield', value: 20, duration: 2 },
      {
        type: 'OnHitStatus',
        status: { key: 'Vulnerable', stacks: 1, duration: 2, chance: 100 },
        duration: 2,
      },
    ],
    vfxKey: 'def_earth',
    sfxKey: 'shield_earth',
  },
  D08: {
    cost: 2,
    tags: ['Shadow'],
    keywords: ['Evasion', 'Counter'],
    effectText: '회피 2회(1턴), 반격 12 (1턴)',
    effects: [
      { type: 'Evasion', charges: 2, duration: 1 },
      { type: 'Counter', value: 12, duration: 1 },
    ],
    vfxKey: 'def_evasion',
    sfxKey: 'step_swift',
  },
  D14: {
    cost: 3,
    tags: ['Storm'],
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
  H01: {
    cost: 1,
    tags: ['Hunter'],
    keywords: ['Heal'],
    effectText: '체력 20 회복',
    effects: [{ type: 'Heal', value: 20 }],
    vfxKey: 'heal_basic',
    sfxKey: 'heal_soft',
  },
  H09: {
    cost: 2,
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
  H08: {
    cost: 3,
    tags: ['Blood'],
    keywords: ['Heal', 'Regen', 'Bleed'],
    effectText: '체력 18 회복, 재생 8(3턴), 적에게 출혈 1중첩',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Regen', value: 8, duration: 3 },
      { type: 'ApplyBleed', stacks: 1, duration: 2, damagePerStack: 6 },
    ],
    vfxKey: 'heal_blood',
    sfxKey: 'heal_deep',
  },
  H10: {
    cost: 3,
    tags: ['Time'],
    keywords: ['Heal', 'Undo'],
    effectText: '체력 30 회복, 지난 턴 피해의 30% 복구',
    effects: [
      { type: 'Heal', value: 30 },
      { type: 'UndoDamage', percent: 30, target: 'player' },
    ],
    vfxKey: 'heal_time',
    sfxKey: 'time_rewind',
  },
  S02: {
    cost: 1,
    tags: ['Tempo'],
    keywords: ['GainAction'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'buff_energy',
    sfxKey: 'energy_gain',
  },
  S19: {
    cost: 2,
    tags: ['Twilight'],
    keywords: ['Burn', 'Bleed'],
    effectText: '피해 12, 화상 1중첩, 출혈 1중첩',
    effects: [
      { type: 'Damage', value: 12, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Bleed', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'spell_twilight',
    sfxKey: 'burn_bleed',
  },
  S10: {
    cost: 3,
    tags: ['Necromancy'],
    keywords: ['Revive', 'Bleed'],
    effectText: '체력이 0이 되면 20 회복, 적에게 출혈 2중첩',
    effects: [
      { type: 'Revive', value: 20, chance: 100 },
      { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6 },
    ],
    vfxKey: 'spell_revenant',
    sfxKey: 'revive_dark',
  },
  S13: {
    cost: 3,
    tags: ['Trick'],
    keywords: ['Steal'],
    effectText: '상대 손패 최저 코스트 카드 1장 훔치기',
    effects: [{ type: 'StealCard', from: 'opponentHand', count: 1, filter: 'lowestCost' }],
    vfxKey: 'spell_mirror',
    sfxKey: 'steal_card',
  },
};

const cardPlan = {
  ATT_DARIUS_NO_017: { code: 'A01', name: '사냥꾼의 일격' },
  ATT_DARIUS_RA_018: { code: 'A10', name: '심연 파동' },
  ATT_DARIUS_EP_019: { code: 'A05', name: '혈월의 일격' },
  ATT_DARIUS_LE_020: { code: 'A04', name: '처형' },
  HEA_DARIUS_NO_021: { code: 'H01', name: '사냥꾼의 휴식' },
  HEA_DARIUS_RA_022: { code: 'H09', name: '불굴의 맹세' },
  HEA_DARIUS_EP_023: { code: 'H08', name: '월광 재생' },
  HEA_DARIUS_LE_024: { code: 'H10', name: '시간 회귀' },
  DEF_DARIUS_NO_025: { code: 'D02', name: '받아치기' },
  DEF_DARIUS_RA_026: { code: 'D13', name: '지각 단층' },
  DEF_DARIUS_EP_027: { code: 'D08', name: '그림자 회피술' },
  DEF_DARIUS_LE_028: { code: 'D14', name: '회오리 방출' },
  SPE_DARIUS_NO_029: { code: 'S02', name: '전투 본능' },
  SPE_DARIUS_RA_030: { code: 'S19', name: '황혼 선포' },
  SPE_DARIUS_EP_031: { code: 'S10', name: '사령 개시' },
  SPE_DARIUS_LE_032: { code: 'S13', name: '미러 폴드' },
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
    cost: plan.cost ?? def.cost ?? existingCard?.cost ?? 1,
    effects: cloneEffects(def.effects),
    tags: [...(plan.tags ?? def.tags ?? existingCard?.tags ?? [])],
    keywords: [...(plan.keywords ?? def.keywords ?? existingCard?.keywords ?? [])],
    effectText: plan.effectText ?? def.effectText ?? existingCard?.effectText ?? '',
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
  console.log('Updated Darius cards with new effect plan.');
}

run();

