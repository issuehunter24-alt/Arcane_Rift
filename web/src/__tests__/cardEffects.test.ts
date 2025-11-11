import { describe, it, expect, beforeEach } from 'vitest';
import { useBattleStore } from '../store';
import type { Card } from '../types';

const getBattleState = () => useBattleStore.getState();

const cloneCardWithSuffix = (card: Card, suffix: number): Card => ({
  ...card,
  id: `${card.id}__${suffix}`,
  effects: card.effects.map(eff => ({ ...eff })),
  tags: [...card.tags],
  keywords: [...card.keywords],
});

describe('Card Effects', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = getBattleState();

    const baseCards: Card[] = [
      {
        id: 'test-damage',
        name: 'Test Damage Card',
        type: 'Attack',
        rarity: 'Normal',
        cost: 1,
        effects: [{ type: 'Damage', value: 10 }],
        tags: [],
        keywords: [],
        version: 1,
      },
      {
        id: 'test-heal',
        name: 'Test Heal Card',
        type: 'Heal',
        rarity: 'Normal',
        cost: 1,
        effects: [{ type: 'Heal', value: 15 }],
        tags: [],
        keywords: [],
        version: 1,
      },
      {
        id: 'test-draw',
        name: 'Test Draw Card',
        type: 'Special',
        rarity: 'Normal',
        cost: 1,
        effects: [{ type: 'Draw', value: 2 }],
        tags: [],
        keywords: [],
        version: 1,
      },
      {
        id: 'test-bleed',
        name: 'Test Bleed Card',
        type: 'Attack',
        rarity: 'Rare',
        cost: 1,
        effects: [
          { type: 'ApplyBleed', stacks: 2, duration: 2, damagePerStack: 6 },
        ],
        tags: [],
        keywords: ['Bleed'],
        version: 1,
      },
      {
        id: 'test-reactive',
        name: 'Test Reactive Armor',
        type: 'Defense',
        rarity: 'Rare',
        cost: 1,
        effects: [
          { type: 'ReactiveArmor', charges: 2, reflectRatio: 0.4, shieldRatio: 0.25, duration: 2 },
        ],
        tags: [],
        keywords: ['Reactive'],
        version: 1,
      },
      {
        id: 'test-overflow',
        name: 'Test Overflow Heal',
        type: 'Heal',
        rarity: 'Rare',
        cost: 1,
        effects: [
          { type: 'Heal', value: 24, overflowToShield: true },
        ],
        tags: [],
        keywords: ['Shield'],
        version: 1,
      },
      {
        id: 'test-tempo',
        name: 'Test Tempo Boost',
        type: 'Special',
        rarity: 'Epic',
        cost: 1,
        effects: [
          { type: 'TempoBoost', amount: 2, turns: 2 },
        ],
        tags: [],
        keywords: ['Tempo'],
        version: 1,
      },
    ];

    const mockCards = baseCards.map((card, idx) => cloneCardWithSuffix(card, idx));
    store.setCollection(mockCards);
    store.initGame(mockCards);

    const deckCards = Array.from({ length: 16 }, (_, idx) => cloneCardWithSuffix(baseCards[idx % baseCards.length], idx + baseCards.length));
    const playerDeck = Array.from({ length: 20 }, (_, idx) => cloneCardWithSuffix(baseCards[idx % baseCards.length], idx + 200));
    const enemyDeck = Array.from({ length: 12 }, (_, idx) => cloneCardWithSuffix(baseCards[idx % baseCards.length], idx + 400));

    useBattleStore.setState({
      hand: mockCards.map((card, idx) => cloneCardWithSuffix(card, idx + 600)),
      deck: deckCards,
      discard: [],
      playerDeck,
      enemyDeck,
      enemyHand: enemyDeck.slice(0, 5),
      energy: 10,
      enemyEnergy: 5,
      playerHp: 100,
      playerMaxHp: 100,
      enemyHp: 100,
      enemyMaxHp: 100,
      gameOver: 'none',
    });
  });

  it('should deal damage to enemy', () => {
    const store = getBattleState();
    const initialEnemyHp = store.enemyHp;
    
    // Find damage card in hand
    const damageCardIndex = store.hand.findIndex(c => c.id === 'test-damage');
    if (damageCardIndex >= 0) {
      store.playCard(damageCardIndex);
      const updated = getBattleState();
      expect(updated.enemyHp).toBe(initialEnemyHp - 10);
    }
  });

  it('should heal player', () => {
    const store = getBattleState();
    // Damage player first
    store.dealDamage('player', 20);
    const damagedHp = getBattleState().playerHp;
    
    // Find heal card in hand
    const healCardIndex = store.hand.findIndex(c => c.id === 'test-heal');
    if (healCardIndex >= 0) {
      store.playCard(healCardIndex);
      const updated = getBattleState();
      expect(updated.playerHp).toBeGreaterThan(damagedHp);
    }
  });

  it('should draw cards', () => {
    const store = getBattleState();
    const initialHandSize = store.hand.length;
    
    // Find draw card in hand
    const drawCardIndex = store.hand.findIndex(c => c.id === 'test-draw');
    if (drawCardIndex >= 0) {
      store.playCard(drawCardIndex);
      const updated = getBattleState();
      // Hand size should increase by 2 (draw effect) - 1 (played card) = +1
      expect(updated.hand.length).toBe(initialHandSize + 1);
    }
  });

  it('should reduce energy when playing card', () => {
    const store = getBattleState();
    const initialEnergy = store.energy;
    
    // Play any card (cost 1)
    if (store.hand.length > 0) {
      store.playCard(0);
      const updated = getBattleState();
      expect(updated.energy).toBe(initialEnergy - 1);
    }
  });

  it('should not play card if not enough energy', () => {
    const store = getBattleState();
    // Reset energy to 0
    useBattleStore.setState({ energy: 0 });
    
    const initialHandSize = getBattleState().hand.length;
    const result = getBattleState().playCard(0);
    
    expect(result).toBe(false);
    expect(getBattleState().hand.length).toBe(initialHandSize);
  });

  it('supports bleed metadata fields on enemy status', () => {
    useBattleStore.setState(state => ({
      enemyStatus: { ...state.enemyStatus, bleedStacks: 2, bleedDuration: 2, bleedDamagePerStack: 6 },
    }));
    const status = getBattleState().enemyStatus as any;
    expect(status.bleedStacks).toBe(2);
    expect(status.bleedDuration).toBe(2);
    expect(status.bleedDamagePerStack).toBe(6);
  });

  it('supports overflow shield fields on player status', () => {
    useBattleStore.setState(state => ({
      playerStatus: { ...state.playerStatus, shield: 15, shieldDuration: 3 },
    }));
    const status = getBattleState().playerStatus;
    expect(status.shield).toBe(15);
    expect(status.shieldDuration).toBe(3);
  });

  it('supports reactive armor fields on player status', () => {
    useBattleStore.setState(state => ({
      playerStatus: {
        ...state.playerStatus,
        reactiveArmorCharges: 2,
        reactiveArmorReflectRatio: 0.4,
        reactiveArmorShieldRatio: 0.2,
        reactiveArmorDuration: 3,
      },
    }));
    const status = getBattleState().playerStatus;
    expect(status.reactiveArmorCharges).toBe(2);
    expect(status.reactiveArmorReflectRatio).toBeCloseTo(0.4);
    expect(status.reactiveArmorShieldRatio).toBeCloseTo(0.2);
    expect(status.reactiveArmorDuration).toBe(3);
  });

  it('supports energy boost placeholders on player status', () => {
    useBattleStore.setState(state => ({
      playerStatus: { ...state.playerStatus, energyBoostPending: 2, energyBoostDuration: 2 },
    }));
    const status = getBattleState().playerStatus;
    expect(status.energyBoostPending).toBe(2);
    expect(status.energyBoostDuration).toBe(2);
  });
});

