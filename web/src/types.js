// 타입 가드 헬퍼 함수들
export function isDamageEffect(eff) {
    return eff.type === 'Damage';
}
export function isHealEffect(eff) {
    return eff.type === 'Heal';
}
export function isDrawEffect(eff) {
    return eff.type === 'Draw';
}
export function isGainActionEffect(eff) {
    return eff.type === 'GainAction';
}
export function isApplyStatusEffect(eff) {
    return eff.type === 'ApplyStatus';
}
export function isShieldEffect(eff) {
    return eff.type === 'Shield';
}
export function isGuardEffect(eff) {
    return eff.type === 'Guard';
}
export function isVulnerableEffect(eff) {
    return eff.type === 'Vulnerable';
}
export function isBuffEffect(eff) {
    return eff.type === 'Buff';
}
export function isRegenEffect(eff) {
    return eff.type === 'Regen';
}
export function isCleanseEffect(eff) {
    return eff.type === 'Cleanse';
}
export function isPriorityBoostEffect(eff) {
    return eff.type === 'PriorityBoost';
}
export function isSilenceEffect(eff) {
    return eff.type === 'Silence';
}
export function isNullifyEffect(eff) {
    return eff.type === 'Nullify';
}
export function isCounterEffect(eff) {
    return eff.type === 'Counter';
}
export function isEvasionEffect(eff) {
    return eff.type === 'Evasion';
}
export function isImmuneEffect(eff) {
    return eff.type === 'Immune';
}
export function isChainEffect(eff) {
    return eff.type === 'Chain';
}
