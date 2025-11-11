import type { Card } from './types';

const DEFAULT_CHARACTER = 'Ariana';
const DEFAULT_TYPE = 'Attack';
const DEFAULT_RARITY = 'Normal';

function toTitleCase(value?: string | null): string {
  if (!value) return DEFAULT_CHARACTER;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_CHARACTER;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * 카드 ID에서 캐릭터 이름을 추출합니다.
 * ID 형식: {TYPE}_{CHARACTER}_{RARITY}_{NUMBER}
 */
function extractCharacterFromId(cardId?: string | null): string {
  if (!cardId || typeof cardId !== 'string') {
    return DEFAULT_CHARACTER;
  }
  const parts = cardId.split('_');
  if (parts.length >= 2) {
    return toTitleCase(parts[1]);
  }
  return DEFAULT_CHARACTER;
}

function resolveCardMeta(card?: Partial<Card> | null) {
  if (!card || typeof card !== 'object') {
    return {
      character: DEFAULT_CHARACTER,
      type: DEFAULT_TYPE,
      rarity: DEFAULT_RARITY,
    };
  }

  const rawId =
    (card as Card)?.id ??
    (card as { cardId?: string }).cardId ??
    (card as { baseId?: string }).baseId;

  const character = extractCharacterFromId(rawId ?? undefined);
  const type = typeof card.type === 'string' && card.type ? card.type : DEFAULT_TYPE;
  const rarity = typeof card.rarity === 'string' && card.rarity ? card.rarity : DEFAULT_RARITY;

  return {
    character,
    type,
    rarity,
  };
}

/**
 * 카드 ID에서 캐릭터를 추출하고 타입/등급으로 이미지 경로를 생성합니다.
 */
export function getCardImagePath(card?: Partial<Card> | null): string {
  const { character, type, rarity } = resolveCardMeta(card);
  return `cards/${character}_${type}_${rarity}.webp`;
}

export function getCardImagePathFallback(card?: Partial<Card> | null): string {
  const { character, type, rarity } = resolveCardMeta(card);
  return `cards/${character}_${type}_${rarity}.png`;
}

