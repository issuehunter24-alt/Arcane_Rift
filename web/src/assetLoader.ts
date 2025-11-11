import { Assets } from 'pixi.js';
import type { Card } from './types';

/**
 * 이미지 프리로드 및 캐시 관리 모듈
 * WebP 우선, PNG 폴백 전략
 */

interface AssetManifest {
  webp: string[];
  png: string[];
  loaded: Set<string>;
  failed: Set<string>;
}

const manifest: AssetManifest = {
  webp: [],
  png: [],
  loaded: new Set(),
  failed: new Set(),
};

/**
 * 카드 ID에서 캐릭터 이름을 추출합니다.
 * ID 형식: {TYPE}_{CHARACTER}_{RARITY}_{NUMBER}
 * 예: ATT_ARIANA_NO_001 -> Ariana
 */
function extractCharacterFromId(cardId: string): string {
  const parts = cardId.split('_');
  if (parts.length >= 2) {
    const charName = parts[1];
    // ARIANA -> Ariana (첫 글자만 대문자)
    return charName.charAt(0) + charName.slice(1).toLowerCase();
  }
  return 'Ariana'; // 폴백
}

/**
 * 카드 이미지 경로 생성
 */
function getCardImagePaths(card: Card): { webp: string; png: string } {
  const character = extractCharacterFromId(card.id);
  const baseName = `${character}_${card.type}_${card.rarity}`;
  return {
    webp: `cards/${baseName}.webp`,
    png: `cards/${baseName}.png`,
  };
}

/**
 * 단일 이미지 로드 (WebP 우선, PNG 폴백)
 */
async function loadSingleImage(webpPath: string, pngPath: string): Promise<string> {
  // 이미 로드되었으면 스킵
  if (manifest.loaded.has(webpPath)) return webpPath;
  if (manifest.loaded.has(pngPath)) return pngPath;
  
  // WebP 시도
  try {
    await Assets.load(webpPath);
    manifest.loaded.add(webpPath);
    return webpPath;
  } catch {
    // PNG 폴백
    try {
      await Assets.load(pngPath);
      manifest.loaded.add(pngPath);
      return pngPath;
    } catch {
      manifest.failed.add(webpPath);
      manifest.failed.add(pngPath);
      throw new Error(`Failed to load: ${webpPath} or ${pngPath}`);
    }
  }
}

/**
 * 모든 카드 이미지 프리로드
 */
export async function preloadCardImages(cards: Card[]): Promise<void> {
  console.log(`[AssetLoader] Preloading ${cards.length} card images...`);
  const startTime = performance.now();
  
  // 중복 제거 (같은 캐릭터+type+rarity 조합)
  const uniqueCards = new Map<string, Card>();
  cards.forEach(card => {
    const character = extractCharacterFromId(card.id);
    const key = `${character}_${card.type}_${card.rarity}`;
    if (!uniqueCards.has(key)) {
      uniqueCards.set(key, card);
    }
  });
  
  const loadPromises: Promise<void>[] = [];
  
  for (const card of uniqueCards.values()) {
    const { webp, png } = getCardImagePaths(card);
    
    loadPromises.push(
      loadSingleImage(webp, png)
        .then(() => {
          // Success - silent
        })
        .catch((err) => {
          console.warn(`[AssetLoader] Failed to load card image for ${card.type}/${card.rarity}:`, err);
        })
    );
  }
  
  // 카드 뒷면도 프리로드
  loadPromises.push(
    loadSingleImage('cards/card_back.webp', 'cards/card_back.png')
      .then(() => {
        console.log('[AssetLoader] Card back loaded');
      })
      .catch((err) => {
        console.warn('[AssetLoader] Failed to load card back:', err);
      })
  );
  
  // 타입 아이콘도 프리로드
  const typeIcons = [
    'cardIcons/Type/type_attack.png',
    'cardIcons/Type/type_defense.png',
    'cardIcons/Type/type_heal.png',
    'cardIcons/Type/type_special.png',
  ];
  
  typeIcons.forEach(iconPath => {
    loadPromises.push(
      Assets.load(iconPath)
        .then(() => {
          manifest.loaded.add(iconPath);
          console.log(`[AssetLoader] Type icon loaded: ${iconPath}`);
        })
        .catch((err) => {
          manifest.failed.add(iconPath);
          console.warn(`[AssetLoader] Failed to load type icon: ${iconPath}`, err);
        })
    );
  });
  
  // 모든 이미지 로드 완료 대기
  await Promise.all(loadPromises);
  
  const elapsed = performance.now() - startTime;
  console.log(`[AssetLoader] Preloaded ${manifest.loaded.size} images in ${elapsed.toFixed(0)}ms`);
  console.log(`[AssetLoader] Failed: ${manifest.failed.size} images`);
}

/**
 * 카드 이미지가 로드되었는지 확인
 */
export function isCardImageLoaded(card: Card): boolean {
  const { webp, png } = getCardImagePaths(card);
  return manifest.loaded.has(webp) || manifest.loaded.has(png);
}

/**
 * 카드에 대한 로드된 이미지 경로 반환
 */
export function getLoadedCardImage(card: Card): string | null {
  const { webp, png } = getCardImagePaths(card);
  if (manifest.loaded.has(webp)) return webp;
  if (manifest.loaded.has(png)) return png;
  return null;
}

/**
 * 카드 뒷면 이미지 경로 반환
 */
export function getCardBackImage(): string | null {
  if (manifest.loaded.has('cards/card_back.webp')) return 'cards/card_back.webp';
  if (manifest.loaded.has('cards/card_back.png')) return 'cards/card_back.png';
  return null;
}

/**
 * 캐시 통계
 */
export function getAssetStats() {
  return {
    loaded: manifest.loaded.size,
    failed: manifest.failed.size,
    totalWebP: manifest.webp.length,
    totalPNG: manifest.png.length,
  };
}

/**
 * 캐시 클리어 (메모리 정리용)
 */
export function clearAssetCache() {
  manifest.loaded.clear();
  manifest.failed.clear();
  console.log('[AssetLoader] Cache cleared');
}

