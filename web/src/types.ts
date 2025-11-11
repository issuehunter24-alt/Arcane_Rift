export type CardType = 'Attack' | 'Heal' | 'Defense' | 'Special';
export type Rarity = 'Normal' | 'Rare' | 'Epic' | 'Legendary';

// 상태이상 키워드 타입
export type StatusKeyword = 'Burn' | 'Freeze' | 'Shock' | 'Vulnerable' | 'Regen' | 'Shield' | 'Guard' | 'Mark' | 'Root';

// 카드 효과 타입 정의
export type DamageTarget = 'player' | 'enemy';

export type CardEffect =
  | { type: 'Damage'; value: number; aoe?: boolean; hits?: number; lifestealRatio?: number; target?: DamageTarget }
  | { type: 'Heal'; value: number; aoe?: boolean; overflowToShield?: boolean }
  | { type: 'Shield'; value: number; duration?: number }
  | { type: 'Guard'; value: number; duration?: number }
  | { type: 'Draw'; value: number }
  | { type: 'GainAction'; value: number; delayed?: boolean; delayTurns?: number }
  | { type: 'ApplyStatus'; key: string; stacks?: number; duration?: number; chance?: number; target?: 'player' | 'enemy' }
  | { type: 'Vulnerable'; value: number; duration?: number }
  | { type: 'Buff'; stat: string; value: number; duration?: number }
  | { type: 'Regen'; value: number; duration?: number }
  | { type: 'Cleanse'; maxStacks?: number }
  | { type: 'PriorityBoost'; value: number; duration?: number }
  | { type: 'Silence'; duration?: number }
  | { type: 'Nullify'; times?: number }
  | { type: 'Counter'; value: number; duration?: number }
  | { type: 'Evasion'; value?: number; charges?: number; duration?: number }
  | { type: 'Immune'; keywords: string[]; duration?: number }
  | { type: 'Chain'; targets?: number; ratio?: number }
  | { type: 'Conditional'; if: string; then: CardEffect[] }
  | { type: 'DuplicateNext'; typeFilter?: string; times?: number }
  | { type: 'CopyCard'; from: string; filter?: string; to: string }
  | { type: 'TransferHp'; value: number; from: 'player' | 'enemy'; to: 'player' | 'enemy' }
  | { type: 'Revive'; value: number; chance?: number }
  | { type: 'ElementShift'; from: string; to: string; duration?: number }
  | { type: 'ApplyBleed'; stacks: number; duration: number; damagePerStack?: number }
  | { type: 'ReactiveArmor'; charges: number; reflectRatio?: number; shieldRatio?: number; duration?: number }
  | { type: 'TempoBoost'; amount: number; turns?: number; scope?: 'self' | 'team' }
  | { type: 'ArmorBreak'; guard?: number; shield?: number }
  | { type: 'UndoDamage'; percent: number; max?: number; target?: 'player' | 'enemy' }
  | {
      type: 'OnHitStatus';
      status: { key: string; stacks?: number; duration?: number; chance?: number };
      duration: number;
    }
  | { type: 'StealCard'; from: 'opponentHand' | 'opponentDeck'; count?: number; filter?: string }
  | { type: 'TurnSkip'; chance: number }
  | { type: 'Summon'; id?: string; attack: number; hp: number; duration: number };

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  effects: CardEffect[];
  tags: string[];
  keywords: string[];
  // 선택 필드: 설명/레벨 스케일링
  effectText?: string;
  levelCurve?: {
    base?: Record<string, number>;
    perLevel?: Record<string, number>;
  };
  vfxKey?: string;
  sfxKey?: string;
  version: number;
}

// 타입 가드 헬퍼 함수들
export function isDamageEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Damage' }> {
  return eff.type === 'Damage';
}

export function isHealEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Heal' }> {
  return eff.type === 'Heal';
}

export function isDrawEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Draw' }> {
  return eff.type === 'Draw';
}

export function isGainActionEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'GainAction' }> {
  return eff.type === 'GainAction';
}

export function isApplyStatusEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'ApplyStatus' }> {
  return eff.type === 'ApplyStatus';
}

export function isShieldEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Shield' }> {
  return eff.type === 'Shield';
}

export function isGuardEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Guard' }> {
  return eff.type === 'Guard';
}

export function isVulnerableEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Vulnerable' }> {
  return eff.type === 'Vulnerable';
}

export function isBuffEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Buff' }> {
  return eff.type === 'Buff';
}

export function isRegenEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Regen' }> {
  return eff.type === 'Regen';
}

export function isCleanseEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Cleanse' }> {
  return eff.type === 'Cleanse';
}

export function isPriorityBoostEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'PriorityBoost' }> {
  return eff.type === 'PriorityBoost';
}

export function isSilenceEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Silence' }> {
  return eff.type === 'Silence';
}

export function isNullifyEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Nullify' }> {
  return eff.type === 'Nullify';
}

export function isCounterEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Counter' }> {
  return eff.type === 'Counter';
}

export function isEvasionEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Evasion' }> {
  return eff.type === 'Evasion';
}

export function isImmuneEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Immune' }> {
  return eff.type === 'Immune';
}

export function isChainEffect(eff: CardEffect): eff is Extract<CardEffect, { type: 'Chain' }> {
  return eff.type === 'Chain';
}


