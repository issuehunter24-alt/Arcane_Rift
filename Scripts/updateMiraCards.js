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
    tags: ['Specter'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_shadow_slash',
    sfxKey: 'slash_light',
    levelCurve: {
      base: { damage: 20 },
      perLevel: { damage: 2 },
    },
  },
  A14: {
    cost: 2,
    tags: ['Specter'],
    keywords: ['Evasion', 'Draw'],
    effectText: '피해 18, 회피 1회(1턴), 카드 1장 드로우',
    effects: [
      { type: 'Damage', value: 18 },
      { type: 'Evasion', charges: 1, duration: 1 },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'atk_ghost_arrow',
    sfxKey: 'arrow_whisper',
    levelCurve: {
      base: { damage: 18 },
      perLevel: { damage: 2 },
    },
  },
  A10: {
    cost: 3,
    tags: ['Specter'],
    keywords: ['Leech'],
    effectText: '4회 피해 4(총 16), 가한 피해의 50% 흡혈',
    effects: [{ type: 'Damage', value: 4, hits: 4, lifestealRatio: 0.5 }],
    vfxKey: 'atk_shadow_multi',
    sfxKey: 'slash_multi',
  },
  A05: {
    cost: 3,
    tags: ['Specter'],
    keywords: ['Bleed'],
    effectText: '피해 26, 출혈 2중첩(턴마다 6 피해)',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6 },
    ],
    vfxKey: 'atk_bleed',
    sfxKey: 'slash_heavy',
    levelCurve: {
      base: { damage: 26 },
      perLevel: { damage: 3 },
    },
  },
  D01: {
    cost: 1,
    tags: ['Veil'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_soft',
  },
  D08: {
    cost: 2,
    tags: ['Veil'],
    keywords: ['Evasion', 'Counter'],
    effectText: '회피 2회(1턴), 반격 12(1턴)',
    effects: [
      { type: 'Evasion', charges: 2, duration: 1 },
      { type: 'Counter', value: 12, duration: 1 },
    ],
    vfxKey: 'def_evasion',
    sfxKey: 'dash_swish',
  },
  D11: {
    cost: 3,
    tags: ['Veil'],
    keywords: ['Guard', 'Root'],
    effectText: '가드 12(2턴), 적에게 속박 1턴',
    effects: [
      { type: 'Guard', value: 12, duration: 2 },
      { type: 'ApplyStatus', key: 'Root', duration: 1, target: 'enemy' },
    ],
    vfxKey: 'def_snare_field',
    sfxKey: 'trap_snap',
  },
  D12: {
    cost: 4,
    tags: ['Veil'],
    keywords: ['Nullify', 'Tempo'],
    effectText: '다음 적 카드 1회 무효화, 다음 턴 에너지 +1',
    effects: [
      { type: 'Nullify', times: 1 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
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
  H13: {
    cost: 3,
    tags: ['Support'],
    keywords: ['Heal', 'Evasion', 'Duplicate'],
    effectText: '체력 18 회복, 회피 1회(1턴), 다음 방어 카드 1회 추가 발동',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Evasion', charges: 1, duration: 1 },
      { type: 'DuplicateNext', typeFilter: 'Defense', times: 1 },
    ],
    vfxKey: 'heal_shadow',
    sfxKey: 'heal_whisper',
  },
  H10: {
    cost: 4,
    tags: ['Chrono'],
    keywords: ['Heal', 'UndoDamage'],
    effectText: '체력 30 회복, 지난 턴 피해 30% 복구',
    effects: [
      { type: 'Heal', value: 30 },
      { type: 'UndoDamage', percent: 30 },
    ],
    vfxKey: 'heal_time',
    sfxKey: 'rewind',
  },
  S02: {
    cost: 1,
    tags: ['Tempo'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'spell_order',
    sfxKey: 'energy_gain',
  },
  S09: {
    cost: 3,
    tags: ['Specter'],
    keywords: ['Summon'],
    effectText: '공격력 12, 체력 20, 2턴 지속하는 망령 소환',
    effects: [
      { type: 'Summon', creature: 'wraith', attack: 12, hp: 20, duration: 2, target: 'player' },
    ],
    vfxKey: 'spell_summon',
    sfxKey: 'summon_shade',
  },
  S13: {
    cost: 3,
    tags: ['Tactics'],
    keywords: ['Steal'],
    effectText: '상대 손패 최저 코스트 카드 1장 훔치기',
    effects: [{ type: 'StealCard', from: 'opponentHand', filter: 'lowestCost', to: 'hand' }],
    vfxKey: 'spell_mirror',
    sfxKey: 'steal_card',
  },
  S14: {
    cost: 4,
    tags: ['Chrono'],
    keywords: ['Tempo', 'TurnSkip'],
    effectText: '에너지 +2, 적 턴 40% 확률로 스킵',
    effects: [
      { type: 'GainAction', value: 2 },
      { type: 'TurnSkip', chance: 40, target: 'enemy' },
    ],
    vfxKey: 'spell_time_stop',
    sfxKey: 'time_freeze',
  },
};

const cardPlan = {
  ATT_MIRA_NO_161: { code: 'A01', name: '그림자 찌르기' },
  ATT_MIRA_RA_162: { code: 'A14', name: '유령 사격' },
  ATT_MIRA_EP_163: { code: 'A10', name: '심연 흡혈' },
  ATT_MIRA_LE_164: { code: 'A05', name: '혈월 침투' },
  DEF_MIRA_NO_173: { code: 'D01', name: '은신 장막' },
  DEF_MIRA_RA_174: { code: 'D08', name: '그림자 회피술' },
  DEF_MIRA_EP_175: { code: 'D11', name: '속박 지휘' },
  DEF_MIRA_LE_176: { code: 'D12', name: '차원 차단' },
  HEA_MIRA_NO_165: { code: 'H01', name: '응급 재정비' },
  HEA_MIRA_RA_166: { code: 'H07', name: '생명 전이' },
  HEA_MIRA_EP_167: { code: 'H13', name: '그림자 봉합' },
  HEA_MIRA_LE_168: { code: 'H10', name: '시간 회귀 의식' },
  SPE_MIRA_NO_169: { code: 'S02', name: '은신 명령' },
  SPE_MIRA_RA_170: { code: 'S09', name: '영혼 소환' },
  SPE_MIRA_EP_171: { code: 'S13', name: '그림자 탈취' },
  SPE_MIRA_LE_172: { code: 'S14', name: '시간 전조' },
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
    levelCurve: def.levelCurve ? JSON.parse(JSON.stringify(def.levelCurve)) : undefined,
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
  console.log('Updated Mira cards with new effect plan.');
}

run();

