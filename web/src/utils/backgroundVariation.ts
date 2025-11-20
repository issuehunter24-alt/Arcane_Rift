/**
 * 배경 이미지 Variation 선택 유틸리티
 * 
 * Variation 전략:
 * 1. 랜덤: 매 플레이마다 다른 배경
 * 2. 순차: 플레이 횟수에 따라 순환
 * 3. 난이도: 난이도에 따라 변경
 * 4. 씬: 전투 전/중/후에 따라 변경
 */

export type VariationContext = 
  | { type: 'random' }
  | { type: 'sequential'; playCount: number }
  | { type: 'difficulty'; level: 'normal' | 'hard' | 'extreme' }
  | { type: 'scene'; phase: 'pre' | 'battle' | 'post' };

/**
 * 스테이지 ID와 컨텍스트를 기반으로 배경 이미지 경로를 반환
 * @param stageId 스테이지 ID (1-50)
 * @param context Variation 선택 컨텍스트
 * @returns 배경 이미지 경로
 */
export function getBackgroundVariation(
  stageId: number,
  context: VariationContext = { type: 'random' }
): string {
  const stageNames: Record<number, string> = {
    // Chapter 1
    1: 'training',
    2: 'fire',
    3: 'ice',
    4: 'lightning',
    5: 'wind',
    6: 'fire_ice',
    7: 'storm',
    8: 'elite',
    9: 'corridor',
    10: 'drake_estate',  // Elena Drake
    // Chapter 2
    11: 'training_evening',
    12: 'fire_master',
    13: 'ice_master',
    14: 'lightning_master',
    15: 'wind_master',
    16: 'earth_master',
    17: 'fire_ice_clash',
    18: 'garden',
    19: 'shadow_trial',
    20: 'elite_training',
    // Chapter 3
    21: 'fusion_lab',
    22: 'drake_ballroom',
    23: 'royal_arena',
    24: 'stone_battlefield',
    25: 'void_abyss',
    26: 'belmont_hq',
    27: 'drake_arena',
    28: 'tactics_arena',
    29: 'wind_temple',
    30: 'throne_room',  // Elder Belmont
    // Chapter 4
    31: 'wedding_ceremony',
    32: 'royal_palace',
    33: 'belmont_mansion',
    34: 'council_room',
    35: 'secret_meeting',
    36: 'magic_lab',
    37: 'ancient_ruin',
    38: 'drake_estate',
    39: 'newlywed_retreat',
    40: 'dark_forest',
    // Chapter 5
    41: 'cursed_land',
    42: 'barren_wasteland',
    43: 'dark_kingdom',
    44: 'dark_fortress',
    45: 'cult_headquarters',
    46: 'secret_chamber',
    47: 'chaos_battlefield',
    48: 'belmont_arena',
    49: 'drake_final_stand',
    50: 'void_dimension',
  };

  const stageName = stageNames[stageId];
  if (!stageName) {
    console.warn(`[Background] Invalid stage ID: ${stageId}, using fallback`);
    return 'backgrounds/fallback_1.webp';
  }

  let variationNumber = 1;

  switch (context.type) {
    case 'random':
      // 랜덤: 1-3 중 무작위
      variationNumber = Math.floor(Math.random() * 3) + 1;
      break;

    case 'sequential':
      // 순차: 플레이 횟수에 따라 순환
      variationNumber = (context.playCount % 3) + 1;
      break;

    case 'difficulty':
      // 난이도별: Normal(1), Hard(2), Extreme(3)
      variationNumber = 
        context.level === 'normal' ? 1 :
        context.level === 'hard' ? 2 : 3;
      break;

    case 'scene':
      // 씬별: Pre(1), Battle(2), Post(3)
      variationNumber = 
        context.phase === 'pre' ? 1 :
        context.phase === 'battle' ? 2 : 3;
      break;
  }

  const path = `backgrounds/stage_${String(stageId).padStart(2, '0')}_${stageName}_${variationNumber}.webp`;
  console.log(`[Background] Stage ${stageId} (${stageName}) → Variation ${variationNumber} (${context.type})`);
  
  return path;
}

/**
 * 특수 배경 이미지 경로 반환 (Victory, Defeat, Fallback)
 * @param type 배경 타입
 * @param variationNumber Variation 번호 (1-3)
 * @returns 배경 이미지 경로
 */
export function getSpecialBackground(
  type: 'victory' | 'defeat' | 'fallback',
  variationNumber: number = 1
): string {
  const clampedVariation = Math.max(1, Math.min(3, variationNumber));
  return `backgrounds/${type}_${clampedVariation}.webp`;
}

