import { describe, it, expect, beforeEach } from 'vitest';
import { useBattleStore } from '../store';

const getBattleState = () => useBattleStore.getState();

const makeBlankStatus = () => ({
  statuses: [],
  shield: 0,
  shieldDuration: 0,
  guard: 0,
  guardDuration: 0,
  vulnerable: 0,
  attackBuff: 0,
  regen: 0,
  regenDuration: 0,
  shockStacks: 0,
  evasionCharges: 0,
  evasionDuration: 0,
  nullifyCharges: 0,
  counterValue: 0,
  counterDuration: 0,
  immuneKeywords: [] as string[],
  immuneDuration: 0,
  nextCardDuplicate: undefined,
  bleedStacks: 0,
  bleedDuration: 0,
  bleedDamagePerStack: 0,
  reactiveArmorCharges: 0,
  reactiveArmorReflectRatio: 0,
  reactiveArmorShieldRatio: 0,
  reactiveArmorDuration: 0,
  energyBoostPending: 0,
  energyBoostDuration: 0,
});

describe('Status Effects System', () => {
  beforeEach(() => {
    const blankPlayerStatus = makeBlankStatus();
    const blankEnemyStatus = makeBlankStatus();
    useBattleStore.setState({
      playerStatus: blankPlayerStatus,
      enemyStatus: blankEnemyStatus,
      playerHp: 100,
      enemyHp: 100,
      gameOver: 'none',
    });
  });

  it('should apply shield and absorb damage', () => {
    const store = getBattleState();
    
    // Apply shield
    const playerStatus = { ...store.playerStatus };
    playerStatus.shield = 20;
    playerStatus.shieldDuration = 2;
    useBattleStore.setState({ playerStatus });
    
    const initialHp = getBattleState().playerHp;
    
    // Deal 10 damage (should be absorbed by shield)
    store.dealDamage('player', 10);
    
    const updated = getBattleState();
    expect(updated.playerHp).toBe(initialHp);
    expect(updated.playerStatus.shield).toBe(10);
  });

  it('should apply vulnerable and increase damage', () => {
    useBattleStore.getState().applyStatus('enemy', 'Vulnerable', 1, 2, 100, 20);
    const initialHp = getBattleState().enemyHp;
    const baseDamage = 100;
    useBattleStore.getState().dealDamage('enemy', baseDamage);
    const expectedDamage = Math.floor(baseDamage * 1.2);
    const updatedHp = getBattleState().enemyHp;
    expect(updatedHp).toBe(Math.max(0, initialHp - expectedDamage));
  });

  it('should tick status effects over turns', () => {
    useBattleStore.getState().applyStatus('player', 'Regen', 1, 3);
    useBattleStore.setState(state => ({
      playerStatus: {
        ...state.playerStatus,
        regen: 10,
        regenDuration: 3,
      },
    }));
    useBattleStore.getState().dealDamage('player', 20);
    const damagedHp = getBattleState().playerHp;
    useBattleStore.getState().processStatusEffects();
    const updated = getBattleState();
    expect(updated.playerHp).toBe(Math.min(updated.playerMaxHp, damagedHp + 10));
    const regenStatus = updated.playerStatus.statuses.find(s => s.key === 'Regen');
    expect(regenStatus?.duration).toBe(2);
  });

  it('should apply burn status and deal damage over time', () => {
    useBattleStore.getState().applyStatus('enemy', 'Burn', 2, 3, 100);
    const initialHp = getBattleState().enemyHp;
    const statusBeforeTick = getBattleState().enemyStatus.statuses.find(s => s.key === 'Burn');
    expect(statusBeforeTick).toBeDefined();
    useBattleStore.getState().processStatusEffects('playerEnd');
    const updated = getBattleState();
    expect(updated.enemyHp).toBe(initialHp - 20);
    const burnStatus = updated.enemyStatus.statuses.find(s => s.key === 'Burn');
    expect(burnStatus?.duration).toBe((statusBeforeTick?.duration ?? 1) - 1);
  });

  it('should handle guard reduction', () => {
    useBattleStore.setState(state => ({
      playerStatus: {
        ...state.playerStatus,
        guard: 5,
        guardDuration: 2,
      },
    }));
    const initialHp = getBattleState().playerHp;
    const statusBefore = getBattleState().playerStatus;
    expect(statusBefore.guard).toBe(5);
    useBattleStore.getState().dealDamage('player', 10);
    expect(getBattleState().playerHp).toBe(initialHp - 5);
  });
});

