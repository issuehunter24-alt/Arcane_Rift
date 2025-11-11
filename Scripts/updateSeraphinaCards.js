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
    tags: ['Shadow'],
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
  A02: {
    cost: 2,
    tags: ['Shadow', 'Fire'],
    keywords: ['Burn'],
    effectText: '피해 30, 화상 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_fire_orb',
    sfxKey: 'fire_throw',
    levelCurve: {
      base: { damage: 30 },
      perLevel: { damage: 3 },
    },
  },
  A05: {
    cost: 3,
    tags: ['Shadow', 'Blood'],
    keywords: ['Bleed'],
    effectText: '피해 26, 출혈 2중첩(턴마다 6 피해)',
    effects: [
      { type: 'Damage', value: 26 },
      { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6, target: 'enemy' },
    ],
    vfxKey: 'atk_bleed',
    sfxKey: 'slash_heavy',
    levelCurve: {
      base: { damage: 26 },
      perLevel: { damage: 3 },
    },
  },
  A03: {
    cost: 3,
    tags: ['Shadow', 'Fire'],
    keywords: ['Burn', 'Vulnerable'],
    effectText: '피해 36, 화상 2중첩, 취약 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 36 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 2, duration: 2, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
    ],
    vfxKey: 'atk_fire_aoe',
    sfxKey: 'explosion_fire',
  },
  D01: {
    cost: 1,
    tags: ['Shadow'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_shadow_barrier',
    sfxKey: 'shield_soft',
  },
  D08: {
    cost: 2,
    tags: ['Shadow'],
    keywords: ['Evasion', 'Counter'],
    effectText: '회피 2회(1턴), 반격 12(1턴)',
    effects: [
      { type: 'Evasion', charges: 2, duration: 1 },
      { type: 'Counter', value: 12, duration: 1 },
    ],
    vfxKey: 'def_evasion',
    sfxKey: 'step_swift',
  },
  D14: {
    cost: 3,
    tags: ['Shadow'],
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
  D04: {
    cost: 3,
    tags: ['Shadow', 'Fire'],
    keywords: ['Shield', 'Immune'],
    effectText: '보호막 40(2턴), 화상 면역 1턴',
    effects: [
      { type: 'Shield', value: 40, duration: 2 },
      { type: 'Immune', keywords: ['Burn'], duration: 1 },
    ],
    vfxKey: 'def_flame_barrier',
    sfxKey: 'shield_fire',
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
  H08: {
    cost: 3,
    tags: ['Blood'],
    keywords: ['Heal', 'Regen', 'Bleed'],
    effectText: '체력 18 회복, 재생 8(3턴), 적에게 출혈 1중첩',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Regen', value: 8, duration: 3 },
      { type: 'ApplyBleed', stacks: 1, duration: 2, damagePerStack: 6, target: 'enemy' },
    ],
    vfxKey: 'heal_blood',
    sfxKey: 'heal_deep',
  },
  H13: {
    cost: 3,
    tags: ['Shadow'],
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
  H03: {
    cost: 4,
    tags: ['Support'],
    keywords: ['Heal'],
    effectText: '체력 60 회복',
    effects: [{ type: 'Heal', value: 60 }],
    vfxKey: 'heal_full',
    sfxKey: 'heal_full',
  },
  S02: {
    cost: 1,
    tags: ['Tempo'],
    keywords: ['Tempo'],
    effectText: '에너지 +2',
    effects: [{ type: 'GainAction', value: 2 }],
    vfxKey: 'buff_energy',
    sfxKey: 'energy_gain',
  },
  S01: {
    cost: 1,
    tags: ['Tactics'],
    keywords: ['Draw'],
    effectText: '카드 2장 드로우',
    effects: [{ type: 'Draw', value: 2 }],
    vfxKey: 'spell_plan',
    sfxKey: 'paper',
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
      { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6, target: 'enemy' },
    ],
    vfxKey: 'spell_revenant',
    sfxKey: 'revive_dark',
  },
};

const cardPlan = {
  ATT_SERAPHINA_NO_177: { code: 'A01', name: '그림자 일섬' },
  ATT_SERAPHINA_RA_178: { code: 'A02', name: '홍염 투척' },
  ATT_SERAPHINA_EP_179: { code: 'A05', name: '혈월의 일격' },
  ATT_SERAPHINA_LE_180: { code: 'A03', name: '영혼 폭발' },
  DEF_SERAPHINA_NO_189: { code: 'D01', name: '어둠의 장막' },
  DEF_SERAPHINA_RA_190: { code: 'D08', name: '그림자 회피술' },
  DEF_SERAPHINA_EP_191: { code: 'D14', name: '월식 폭쇄' },
  DEF_SERAPHINA_LE_192: { code: 'D04', name: '홍염 결계' },
  HEA_SERAPHINA_NO_181: { code: 'H01', name: '응급 치유' },
  HEA_SERAPHINA_RA_182: { code: 'H08', name: '월광 재생' },
  HEA_SERAPHINA_EP_183: { code: 'H13', name: '그림자 봉합' },
  HEA_SERAPHINA_LE_184: { code: 'H03', name: '완전 회복' },
  SPE_SERAPHINA_NO_185: { code: 'S02', name: '긴급 지휘' },
  SPE_SERAPHINA_RA_186: { code: 'S01', name: '전술 재정비' },
  SPE_SERAPHINA_EP_187: { code: 'S19', name: '황혼 선언' },
  SPE_SERAPHINA_LE_188: { code: 'S10', name: '혼령 각성' },
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

  const filtered = cards.filter(card => card.id !== 'ATT_SERAPHINA_EP_209');
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
  console.log('Updated Seraphina cards with new effect plan.');
}

run();

