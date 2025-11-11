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
    tags: ['Tempest'],
    keywords: [],
    effectText: '피해 20',
    effects: [{ type: 'Damage', value: 20 }],
    vfxKey: 'atk_wind_slash',
    sfxKey: 'wind_slash',
  },
  A06: {
    cost: 2,
    tags: ['Tempest'],
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
    tags: ['Tempest'],
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
  A19: {
    cost: 4,
    tags: ['Chrono'],
    keywords: ['Tempo'],
    effectText: '피해 28, 다음 턴 에너지 +1, 템포 부스트 +1(2턴)',
    effects: [
      { type: 'Damage', value: 28 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
      { type: 'TempoBoost', amount: 1, turns: 2, scope: 'self' },
    ],
    vfxKey: 'atk_chrono_cut',
    sfxKey: 'time_slice',
  },
  D01: {
    cost: 1,
    tags: ['Tempest'],
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
    vfxKey: 'def_wind_barrier',
    sfxKey: 'shield_soft',
  },
  D07: {
    cost: 3,
    tags: ['Tempest'],
    keywords: ['Shield', 'Shock', 'Tempo'],
    effectText: '보호막 25(2턴), 공격자에게 쇼크 1중첩, 다음 턴 에너지 +1',
    effects: [
      { type: 'Shield', value: 25, duration: 2 },
      {
        type: 'OnHitStatus',
        status: { key: 'Shock', stacks: 1, duration: 2, chance: 100 },
        duration: 2,
      },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'def_shock_barrier',
    sfxKey: 'electric_guard',
  },
  D14: {
    cost: 3,
    tags: ['Tempest'],
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
  D05: {
    cost: 4,
    tags: ['Tempest'],
    keywords: ['Reactive', 'Guard'],
    effectText: '반응 장갑 2회 (35% 반격/25% 보호막), 가드 8(2턴)',
    effects: [
      {
        type: 'ReactiveArmor',
        charges: 2,
        reflectRatio: 0.35,
        shieldRatio: 0.25,
        duration: 2,
      },
      { type: 'Guard', value: 8, duration: 2 },
    ],
    vfxKey: 'def_reactive_armor',
    sfxKey: 'metal_shift',
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
    effectText: '체력 24 회복, 초과분은 보호막, 재생 6(2턴)',
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
    vfxKey: 'spell_charge',
    sfxKey: 'energy_gain',
  },
  S07: {
    cost: 2,
    tags: ['Tempo', 'Shock'],
    keywords: ['Shock', 'Tempo'],
    effectText: '적에게 쇼크 1중첩, 에너지 +1',
    effects: [
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2, target: 'enemy' },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
    vfxKey: 'spell_shockwave',
    sfxKey: 'electric_pop',
  },
  S05: {
    cost: 3,
    tags: ['Tempo'],
    keywords: ['Tempo', 'Draw'],
    effectText: '템포 부스트 +2(2턴), 드로우 1장',
    effects: [
      { type: 'TempoBoost', amount: 2, turns: 2, scope: 'self' },
      { type: 'Draw', value: 1 },
    ],
    vfxKey: 'spell_timeburst',
    sfxKey: 'clock_tick',
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
  ATT_KAI_NO_097: { code: 'A01', name: '질풍 베기' },
  ATT_KAI_RA_098: { code: 'A06', name: '연쇄 전격' },
  ATT_KAI_EP_099: { code: 'A13', name: '쇼크 공진' },
  ATT_KAI_LE_100: { code: 'A19', name: '시공 절단' },
  DEF_KAI_NO_109: { code: 'D01', name: '전위 방벽' },
  DEF_KAI_RA_110: { code: 'D07', name: '충격 대응' },
  DEF_KAI_EP_111: { code: 'D14', name: '회오리 반사' },
  DEF_KAI_LE_112: { code: 'D05', name: '반응 장갑 전개' },
  HEA_KAI_NO_101: { code: 'H01', name: '응급 회복' },
  HEA_KAI_RA_102: { code: 'H05', name: '순풍 재생' },
  HEA_KAI_EP_103: { code: 'H11', name: '순환 촉진' },
  HEA_KAI_LE_104: { code: 'H10', name: '시간 역행' },
  SPE_KAI_NO_105: { code: 'S02', name: '신속 배치' },
  SPE_KAI_RA_106: { code: 'S07', name: '감응 증폭' },
  SPE_KAI_EP_107: { code: 'S05', name: '전술 시계' },
  SPE_KAI_LE_108: { code: 'S21', name: '천둥 각성' },
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
  console.log('Updated Kai cards with new effect plan.');
}

run();

