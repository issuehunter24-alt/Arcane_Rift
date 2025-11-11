type Locale = 'ko' | 'en';

const ko: Record<string, string> = {
  // 메인/공통
  'ui.profile.title': '프로필',
  'ui.currency.gold': '골드',
  'ui.currency.shard': '파편',
  'ui.currency.ticket': '티켓',
  'ui.btn.ok': '확인',
  'ui.btn.cancel': '취소',
  'ui.btn.confirm': '확인',
  'ui.btn.back': '뒤로',
  
  // 모드 선택
  'ui.mode.campaign': '캠페인',
  'ui.mode.daily': '일일 던전',
  'ui.mode.draft': '드래프트',
  'ui.mode.pvp': '대전',
  'ui.mode.deck': '덱 편집',
  'ui.mode.shop': '상점',
  'ui.mode.archive': '아카이브',
  
  // 전투/HUD
  'battle.energy': '에너지',
  'battle.round': '라운드',
  'battle.initiative': '이니셔티브',
  'battle.lockin': '선언 잠금',
  'battle.reveal': '공개',
  'battle.pass': '패스',
  'battle.endTurn': '턴 종료',
  'battle.declared': '선언됨',
  'battle.reservedEnergy': '예약 에너지',
  'battle.noCards': '선언된 카드 없음',
  'battle.player': '플레이어',
  'battle.enemy': '적',
  'battle.victory': '승리!',
  'battle.defeat': '패배!',
  'battle.hp': 'HP',
  'battle.seed': '시드',
  
  // 튜토리얼
  'tuto.select_card': '카드를 1장 선택해 선언하세요.',
  'tuto.lockin': '선언이 잠겼습니다.',
  'tuto.reveal': '양측 선언을 공개합니다.',
  'tuto.use_fire': '파이어볼로 화상을 적용해 보세요.',
  'tuto.burn_tick': '턴 시작에 화상 피해가 적용됩니다.',
  'tuto.use_ice': '얼음 가시로 행동 -1을 적용해 보세요.',
  'tuto.nullify_hint': '공개 직전 무효화를 사용해 보세요.',
  
  // 상점/보상
  'shop.daily_deal': '일일 특가',
  'shop.buy': '구매',
  'reward.first_clear': '최초 클리어 보상',
  'reward.repeat': '반복 보상',
  
  // 로그 뷰어
  'log.view.all': '상세',
  'log.view.summary': '요약',
  'log.filter.all': '전체',
  'log.filter.card': '카드',
  'log.filter.effect': '효과',
  'log.filter.system': '시스템',
  'log.search': '검색...',
  'log.noResults': '검색 결과 없음',
  
  // 카드 타입
  'card.type.Attack': '공격',
  'card.type.Heal': '회복',
  'card.type.Defense': '방어',
  'card.type.Special': '특수',
  
  // 상태
  'status.none': '없음',
};

const en: Record<string, string> = {
  // Main/Common
  'ui.profile.title': 'Profile',
  'ui.currency.gold': 'Gold',
  'ui.currency.shard': 'Shards',
  'ui.currency.ticket': 'Tickets',
  'ui.btn.ok': 'OK',
  'ui.btn.cancel': 'Cancel',
  'ui.btn.confirm': 'Confirm',
  'ui.btn.back': 'Back',
  
  // Mode Selection
  'ui.mode.campaign': 'Campaign',
  'ui.mode.daily': 'Daily Dungeon',
  'ui.mode.draft': 'Draft',
  'ui.mode.pvp': 'PvP',
  'ui.mode.deck': 'Deck Editor',
  'ui.mode.shop': 'Shop',
  'ui.mode.archive': 'Archive',
  
  // Battle/HUD
  'battle.energy': 'Energy',
  'battle.round': 'Round',
  'battle.initiative': 'Initiative',
  'battle.lockin': 'Lock-in',
  'battle.reveal': 'Reveal',
  'battle.pass': 'Pass',
  'battle.endTurn': 'End Turn',
  'battle.declared': 'Declared',
  'battle.reservedEnergy': 'Reserved Energy',
  'battle.noCards': 'No cards declared',
  'battle.player': 'Player',
  'battle.enemy': 'Enemy',
  'battle.victory': 'Victory!',
  'battle.defeat': 'Defeat!',
  'battle.hp': 'HP',
  'battle.seed': 'Seed',
  
  // Tutorial
  'tuto.select_card': 'Select and declare a card.',
  'tuto.lockin': 'Declaration locked.',
  'tuto.reveal': 'Revealing both declarations.',
  'tuto.use_fire': 'Try applying Burn with Fireball.',
  'tuto.burn_tick': 'Burn damage applies at turn start.',
  'tuto.use_ice': 'Try reducing actions with Ice Spike.',
  'tuto.nullify_hint': 'Try using Nullify before reveal.',
  
  // Shop/Rewards
  'shop.daily_deal': 'Daily Deal',
  'shop.buy': 'Buy',
  'reward.first_clear': 'First Clear Reward',
  'reward.repeat': 'Repeat Reward',
  
  // Log Viewer
  'log.view.all': 'Detailed',
  'log.view.summary': 'Summary',
  'log.filter.all': 'All',
  'log.filter.card': 'Cards',
  'log.filter.effect': 'Effects',
  'log.filter.system': 'System',
  'log.search': 'Search...',
  'log.noResults': 'No results',
  
  // Card Types
  'card.type.Attack': 'Attack',
  'card.type.Heal': 'Heal',
  'card.type.Defense': 'Defense',
  'card.type.Special': 'Special',
  
  // Status
  'status.none': 'None',
};

const bundles: Record<Locale, Record<string, string>> = { ko, en };

// localStorage에서 언어 불러오기 (기본값: 'ko')
const LOCALE_STORAGE_KEY = 'gals_locale';
let currentLocale: Locale = (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || 'ko';

// 누락된 키를 추적하는 Set
const missingKeys = new Set<string>();

export function setLocale(locale: Locale) {
  const validLocale = locale in bundles ? locale : 'ko';
  currentLocale = validLocale;
  // localStorage에 저장
  localStorage.setItem(LOCALE_STORAGE_KEY, validLocale);
  console.log(`[i18n] Locale changed to: ${validLocale}`);
}

export function t(key: string): string {
  const bundle = bundles[currentLocale] || {};
  const translated = bundle[key];
  
  if (!translated) {
    // 누락된 키 기록
    if (!missingKeys.has(key)) {
      missingKeys.add(key);
      console.warn(`[i18n] Missing translation key: "${key}" (locale: ${currentLocale})`);
    }
    return key; // 키 자체를 반환 (폴백)
  }
  
  return translated;
}

export function getMissingKeys(): string[] {
  return Array.from(missingKeys).sort();
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}


