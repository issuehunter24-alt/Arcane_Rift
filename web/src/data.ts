import type { Card, CardEffect } from './types';

export async function loadSampleCards(): Promise<Card[]> {
  // Cache-buster to ensure latest pruned list is fetched during dev
  const url = `/data/cards.json?v=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load cards.json: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('cards.json is not an array');
  }
  const cards = (data as Card[]).map(enrichCard);
  return cards;
}

function enrichCard(card: Card): Card {
  const enriched: Card = { ...card };
  // effectText 자동 생성(누락 시)
  if (!enriched.effectText) {
    enriched.effectText = summarizeEffects(enriched.effects);
  }
  // levelCurve 기본 생성(누락 시)
  if (!enriched.levelCurve) {
    const base: Record<string, number> = {};
    // Damage/Heal 우선 추출
    const dmg = firstEffectValue(enriched.effects, 'Damage');
    const heal = firstEffectValue(enriched.effects, 'Heal');
    if (typeof dmg === 'number') base['damage'] = dmg;
    if (typeof heal === 'number') base['heal'] = heal;
    enriched.levelCurve = { base, perLevel: {} };
  }
  return enriched;
}

function firstEffectValue(effects: CardEffect[], kind: string): number | undefined {
  for (const e of effects) {
    if (e.type === kind && 'value' in e) {
      const v = Number(e.value ?? NaN);
      if (!Number.isNaN(v)) return v;
    }
  }
  return undefined;
}

function summarizeEffects(effects: CardEffect[]): string {
  const parts: string[] = [];
  for (const e of effects) {
    if (!e) continue;
    
    if (e.type === 'Damage') {
      const v = e.value ?? 0;
      const aoe = e.aoe ? ' (광역)' : '';
      parts.push(`피해 ${v}${aoe}`);
    } else if (e.type === 'Heal') {
      const v = e.value ?? 0;
      const aoe = e.aoe ? ' (광역)' : '';
      parts.push(`회복 ${v}${aoe}`);
    } else if (e.type === 'ApplyStatus') {
      const key = e.key ?? 'Status';
      const stacks = e.stacks ?? 1;
      parts.push(`${key} ${stacks}중첩`);
    } else if (e.type === 'Shield') {
      const v = e.value ?? 0;
      parts.push(`보호막 ${v}`);
    } else if (e.type === 'Guard') {
      const v = e.value ?? 0;
      parts.push(`가드 ${v}`);
    } else if (e.type === 'Draw') {
      const v = e.value ?? 1;
      parts.push(`드로우 ${v}`);
    } else if (e.type === 'GainAction') {
      const v = e.value ?? 1;
      parts.push(`에너지 +${v}`);
    } else if (e.type === 'Vulnerable') {
      const v = e.value ?? 20;
      parts.push(`취약 +${v}%`);
    } else if (e.type === 'Regen') {
      const v = e.value ?? 0;
      parts.push(`지속 회복 ${v}/턴`);
    } else if (e.type === 'Cleanse') {
      const maxStacks = e.maxStacks ?? 2;
      parts.push(`정화(최대 ${maxStacks})`);
    }
  }
  return parts.join(', ');
}


