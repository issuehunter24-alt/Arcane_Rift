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
    tags: ['Tactics'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_tactical_slash',
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
  A13: {
    cost: 3,
    tags: ['Chrono'],
    keywords: ['Shock', 'Tempo'],
    effectText: '피해 30, 쇼크 2중첩, 템포 부스트 +1(1턴)',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 2, duration: 2, target: 'enemy' },
      { type: 'TempoBoost', amount: 1, turns: 1, scope: 'self' },
    ],
    vfxKey: 'atk_shockwave',
    sfxKey: 'shock_burst',
  },
  A04: {
    cost: 4,
    tags: ['Chrono'],
    keywords: ['Execute'],
    effectText: '피해 50, 대상 HP 30% 이하이면 추가 피해 30',
    effects: [
      { type: 'Damage', value: 50 },
      { type: 'Conditional', if: 'targetHp<=30%', then: [{ type: 'Damage', value: 30 }] },
    ],
    vfxKey: 'atk_execute',
    sfxKey: 'hit_final',
  },
  D01: {
    cost: 1,
    tags: ['Barrier'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_basic',
  },
  D09: {
    cost: 3,
    tags: ['Barrier'],
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
  D12: {
    cost: 4,
    tags: ['Tactics'],
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
  H05: {
    cost: 3,
    tags: ['Support'],
    keywords: ['Heal', 'Shield', 'Regen'],
    effectText: '체력 24 회복, 초과분 보호막, 재생 6(2턴)',
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
    keywords: ['Heal', 'Tempo'],
    effectText: '체력 18 회복, 재생 4(2턴), 에너지 +1',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Regen', value: 4, duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'heal_cycle',
    sfxKey: 'heal_wave',
  },
  H10: {
    cost: 4,
    tags: ['Chrono'],
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
    tags: ['Tempo'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'spell_order',
    sfxKey: 'energy_gain',
  },
  S05: {
    cost: 2,
    tags: ['Tempo'],
    keywords: ['Tempo', 'Draw'],
    effectText: '템포 부스트 +2(2턴), 카드 1장 드로우',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'spell_timeburst',
    sfxKey: 'clock_tick',
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
  ATT_MARCUS_NO_145: { code: 'A01', name: '전술 타격' },
  ATT_MARCUS_RA_146: { code: 'A09', name: '룬식 교란' },
  ATT_MARCUS_EP_147: { code: 'A13', name: '자음 포화' },
  ATT_MARCUS_LE_148: { code: 'A04', name: '시간의 처단' },
  DEF_MARCUS_NO_157: { code: 'D01', name: '전술 방벽' },
  DEF_MARCUS_RA_158: { code: 'D09', name: '재편 방진' },
  DEF_MARCUS_EP_159: { code: 'D11', name: '속박 지휘' },
  DEF_MARCUS_LE_160: { code: 'D12', name: '차원 차단' },
  HEA_MARCUS_NO_149: { code: 'H01', name: '응급 재정비' },
  HEA_MARCUS_RA_150: { code: 'H11', name: '순환 재배치' },
  HEA_MARCUS_EP_151: { code: 'H05', name: '재생 코어' },
  HEA_MARCUS_LE_152: { code: 'H10', name: '시간 회귀 프로토콜' },
  SPE_MARCUS_NO_153: { code: 'S02', name: '작전 지령' },
  SPE_MARCUS_RA_154: { code: 'S13', name: '미러 폴드' },
  SPE_MARCUS_EP_155: { code: 'S05', name: '전술 시계' },
  SPE_MARCUS_LE_156: { code: 'S14', name: '시간 정지' },
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

  // 불필요한 구 카드 제거 (초기 테스트용 SPC 카드)
  const filtered = cards.filter(card => card.id !== 'SPC_MARCUS_EP_212');
  filtered.sort((a, b) => a.id.localeCompare(b.id));
  return filtered;
}

function run() {
  const cards = JSON.parse(fs.readFileSync(publicCardsPath, 'utf8'));
  const updated = applyPlan(cards);
  fs.writeFileSync(publicCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  if (fs.existsSync(distCardsPath)) {
    fs.writeFileSync(distCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  }
  console.log('Updated Marcus cards with new effect plan.');
}

run();

