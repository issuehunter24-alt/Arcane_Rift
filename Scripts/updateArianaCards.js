import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptDir, '..');
const publicCardsPath = path.resolve(projectRoot, 'web/public/data/cards.json');
const distCardsPath = path.resolve(projectRoot, 'web/dist/data/cards.json');

const functionDefs = {
  A02: {
    cost: 2,
    keywords: ['Burn'],
    effectText: '피해 30, 대상에게 화상 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 30 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2 },
    ],
  },
  A15: {
    cost: 2,
    keywords: ['Burn', 'Vulnerable'],
    effectText: '피해 22, 화상 1중첩, 취약 1중첩(1턴)',
    effects: [
      { type: 'Damage', value: 22 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 1, duration: 2 },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 1 },
    ],
  },
  A06: {
    cost: 3,
    keywords: ['Shock', 'Chain'],
    effectText: '피해 18, 연쇄 2명(60%), 쇼크 1중첩',
    effects: [
      { type: 'Damage', value: 18 },
      { type: 'Chain', targets: 2, ratio: 0.6 },
      { type: 'ApplyStatus', key: 'Shock', stacks: 1, duration: 2 },
    ],
  },
  A03: {
    cost: 3,
    keywords: ['Burn', 'Vulnerable'],
    effectText: '피해 36, 화상 2중첩, 취약 1중첩(2턴)',
    effects: [
      { type: 'Damage', value: 36 },
      { type: 'ApplyStatus', key: 'Burn', stacks: 2, duration: 2, target: 'enemy' },
      { type: 'ApplyStatus', key: 'Vulnerable', stacks: 1, duration: 2, target: 'enemy' },
    ],
  },
  D01: {
    cost: 1,
    keywords: ['Shield'],
    effectText: '보호막 20(1턴)',
    effects: [{ type: 'Shield', value: 20, duration: 1 }],
  },
  D12: {
    cost: 2,
    keywords: ['Nullify'],
    effectText: '무효화 1회, 다음 턴 에너지 +1',
    effects: [
      { type: 'Nullify', times: 1 },
      { type: 'GainAction', value: 1, delayed: true, delayTurns: 1 },
    ],
  },
  D07: {
    cost: 3,
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
  },
  D04: {
    cost: 3,
    keywords: ['Shield', 'Immune'],
    effectText: '보호막 40(2턴), 화상 면역 1턴',
    effects: [
      { type: 'Shield', value: 40, duration: 2 },
      { type: 'Immune', keywords: ['Burn'], duration: 1 },
    ],
  },
  H11: {
    cost: 2,
    keywords: ['Heal', 'Regen'],
    effectText: '체력 18 회복, 재생 4(2턴), 에너지 +1',
    effects: [
      { type: 'Heal', value: 18 },
      { type: 'Regen', value: 4, duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
  },
  H06: {
    cost: 2,
    keywords: ['Heal', 'Cleanse'],
    effectText: '체력 25 회복, 최대 3중첩 디버프 해제',
    effects: [
      { type: 'Heal', value: 25 },
      { type: 'Cleanse', maxStacks: 3 },
    ],
  },
  H12: {
    cost: 3,
    keywords: ['Heal', 'Immune', 'Priority'],
    effectText: '체력 35 회복, 화상/쇼크 면역 1턴, 우선권 +1',
    effects: [
      { type: 'Heal', value: 35 },
      { type: 'Immune', keywords: ['Burn', 'Shock'], duration: 1 },
      { type: 'PriorityBoost', value: 1, duration: 1 },
    ],
  },
  H04: {
    cost: 3,
    keywords: ['Heal', 'Buff'],
    effectText: '체력 60 회복, 공격력 +20%(2턴)',
    effects: [
      { type: 'Heal', value: 60 },
      { type: 'Buff', stat: 'attack', value: 20, duration: 2 },
    ],
  },
  S01: {
    cost: 1,
    keywords: ['Draw'],
    effectText: '드로우 2장',
    effects: [{ type: 'Draw', value: 2 }],
  },
  S06: {
    cost: 2,
    keywords: ['ElementShift'],
    effectText: "속성 변환 (Fire→Lightning, 2턴), 피해 15",
    effects: [
      { type: 'ElementShift', from: 'Fire', to: 'Lightning', duration: 2 },
      { type: 'Damage', value: 15 },
    ],
  },
  S11: {
    cost: 3,
    keywords: ['Buff'],
    effectText: '공격력 +15%(2턴), 속도 +10%(2턴), 드로우 1장',
    effects: [
      { type: 'Buff', stat: 'attack', value: 15, duration: 2 },
      { type: 'Buff', stat: 'speed', value: 10, duration: 2 },
      { type: 'Draw', value: 1 },
    ],
  },
  S18: {
    cost: 3,
    keywords: ['Immune', 'Tempo'],
    effectText: '화상/출혈/쇼크 면역 2턴, 에너지 +1',
    effects: [
      { type: 'Immune', keywords: ['Burn', 'Bleed', 'Shock'], duration: 2 },
      { type: 'GainAction', value: 1 },
    ],
  },
};

const rarityMap = {
  NO: 'Normal',
  RA: 'Rare',
  EP: 'Epic',
  LE: 'Legendary',
};

const assignments = {
  ATT_NO: { code: 'A02', name: '파이어볼', cost: 2 },
  ATT_RA: { code: 'A15', name: '연성 폭연', cost: 2 },
  ATT_EP: { code: 'A06', name: '폭풍 연격', cost: 3 },
  ATT_LE: { code: 'A03', name: '화염 폭발', cost: 3 },
  DEF_NO: { code: 'D01', name: '마력 장막', cost: 1 },
  DEF_RA: { code: 'D12', name: '마력 역류', cost: 2 },
  DEF_EP: { code: 'D07', name: '천벌 결계', cost: 3 },
  DEF_LE: { code: 'D04', name: '성스러운 보호', cost: 3 },
  HEA_NO: { code: 'H11', name: '연금 촉진', cost: 2 },
  HEA_RA: { code: 'H06', name: '정화의 숨결', cost: 2 },
  HEA_EP: { code: 'H12', name: '천위 강림', cost: 3 },
  HEA_LE: { code: 'H04', name: '축복', cost: 3 },
  SPE_NO: { code: 'S01', name: '추가 드로우', cost: 1 },
  SPE_RA: { code: 'S06', name: '원소 전환', cost: 2 },
  SPE_EP: { code: 'S11', name: '오라 공진', cost: 3 },
  SPE_LE: { code: 'S18', name: '빛의 선언', cost: 3 },
};

function applyPlan(cards) {
  return cards.map(card => {
    const segments = card.id.split('_');
    if (segments[1] !== 'ARIANA') {
      return card;
    }

    const typeCode = segments[0];
    const rarityCode = segments[2];
    const key = `${typeCode}_${rarityCode}`;
    const assignment = assignments[key];
    if (!assignment) {
      return card;
    }
    const def = functionDefs[assignment.code];
    if (!def) {
      throw new Error(`Function definition missing for ${assignment.code}`);
    }

    return {
      ...card,
      name: assignment.name,
      cost: assignment.cost ?? def.cost ?? card.cost,
      effects: def.effects,
      keywords: def.keywords,
      effectText: def.effectText,
      version: (card.version ?? 0) + 1,
    };
  });
}

function run() {
  const cards = JSON.parse(fs.readFileSync(publicCardsPath, 'utf8'));
  const updated = applyPlan(cards);
  fs.writeFileSync(publicCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  if (fs.existsSync(distCardsPath)) {
    fs.writeFileSync(distCardsPath, JSON.stringify(updated, null, 2), 'utf8');
  }
  console.log('Updated Ariana cards with new effect plan.');
}

run();

