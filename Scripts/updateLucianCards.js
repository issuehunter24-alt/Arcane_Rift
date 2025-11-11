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
    tags: ['Metal'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_metal_slash',
    sfxKey: 'slash_metal',
  },
  A08: {
    cost: 2,
    tags: ['Metal'],
    keywords: ['ArmorBreak'],
    effectText: '피해 22, 대상의 가드/보호막 15 제거',
    effects: [
      { type: 'Damage', value: 22 },
      { type: 'ArmorBreak', guard: 15, shield: 15, target: 'enemy' },
    ],
    vfxKey: 'atk_shield_break',
    sfxKey: 'armor_break',
  },
  A15: {
    cost: 3,
    tags: ['Overheat'],
    keywords: ['Burn', 'Vulnerable'],
    effectText: '피해 22, 화상 1중첩, 취약 1중첩(1턴)',
    effects: [
      { type: 'Damage', value: 22 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 1, target: 'enemy' },
    ],
    vfxKey: 'atk_thermal_burst',
    sfxKey: 'fire_burst',
  },
  A04: {
    cost: 4,
    tags: ['Metal'],
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
    tags: ['Aegis'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shield_basic',
    sfxKey: 'shield_basic',
  },
  D05: {
    cost: 2,
    tags: ['Aegis'],
    keywords: ['Reactive', 'Guard'],
    effectText: '2회 반응 장갑(35% 반격/25% 보호막), 가드 8(2턴)',
    effects: [
      { type: 'ReactiveArmor', charges: 2, reflectRatio: 0.35, shieldRatio: 0.25, duration: 2 },
      { type: 'Guard', value: 8, duration: 2 },
    ],
    vfxKey: 'def_reactive',
    sfxKey: 'armor_charge',
  },
  D09: {
    cost: 3,
    tags: ['Aegis'],
    keywords: ['Guard', 'Tempo'],
    effectText: '가드 18(2턴), 다음 턴 에너지 +1',
    effects: [
      { type: 'Guard', value: 18, duration: 2 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'def_guard_wall',
    sfxKey: 'guard_set',
  },
  D12: {
    cost: 4,
    tags: ['Aegis'],
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
    cost: 2,
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
    tags: ['Support'],
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
    tags: ['Tactics'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'spell_order',
    sfxKey: 'energy_gain',
  },
  S12: {
    cost: 2,
    tags: ['Tempo', 'Overheat'],
    keywords: ['Tempo', 'Vulnerable'],
    effectText: '에너지 +1, 피해 16, 자신 취약 1중첩',
    effects: [
      { type: 'GainAction', value: 1 },
      { type: 'Damage', value: 16 },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 1, target: 'player' },
    ],
    vfxKey: 'spell_overload',
    sfxKey: 'energy_overload',
  },
  S20: {
    cost: 3,
    tags: ['Tempo'],
    keywords: ['Tempo', 'Shield'],
    effectText: '템포 부스트 +1(3턴), 보호막 10(3턴), 에너지 +1',
    effects: [
      { type: 'TempoBoost', amount: 1, turns: 3, scope: 'self' },
      { type: 'Shield', value: 10, duration: 3 },
      { type: 'GainAction', value: 1 },
    ],
    vfxKey: 'spell_alloy_boost',
    sfxKey: 'gear_spin',
  },
  S21: {
    cost: 4,
    tags: ['Tempo', 'Shock'],
    keywords: ['Tempo', 'Shock'],
    effectText: '템포 부스트 +2(2턴), 에너지 +1, 적에게 쇼크 1중첩',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'GainAction', value: 1 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'spell_thunder_awakening',
    sfxKey: 'thunder_snap',
  },
};

const cardPlan = {
  ATT_LUCIAN_NO_129: { code: 'A01', name: '기계화 참격' },
  ATT_LUCIAN_RA_130: { code: 'A08', name: '합금 균열' },
  ATT_LUCIAN_EP_131: { code: 'A15', name: '열압 폭연' },
  ATT_LUCIAN_LE_132: { code: 'A04', name: '종결 프로토콜' },
  DEF_LUCIAN_NO_137: { code: 'D01', name: '강철 방벽' },
  DEF_LUCIAN_RA_210: { code: 'D05', name: '반응 장갑 전개' },
  DEF_LUCIAN_EP_211: { code: 'D09', name: '전술 재배치' },
  DEF_LUCIAN_LE_212: { code: 'D12', name: '차폐 매트릭스' },
  HEA_LUCIAN_NO_133: { code: 'H01', name: '응급 수리' },
  HEA_LUCIAN_RA_134: { code: 'H05', name: '재생 코팅' },
  HEA_LUCIAN_EP_135: { code: 'H11', name: '순환 촉진' },
  HEA_LUCIAN_LE_136: { code: 'H10', name: '시간 역행 프로토콜' },
  SPE_LUCIAN_NO_213: { code: 'S02', name: '작전 지령' },
  SPE_LUCIAN_RA_214: { code: 'S12', name: '과부하 실행' },
  SPE_LUCIAN_EP_215: { code: 'S20', name: '합금 가속기' },
  SPE_LUCIAN_LE_216: { code: 'S21', name: '과충전 돌격' },
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
  console.log('Updated Lucian cards with new effect plan.');
}

run();

