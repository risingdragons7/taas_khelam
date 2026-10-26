import { describe, it, expect } from 'vitest';
import { createDeck, shuffle } from '../utils/cards';
import { createInitialState, placeBid, playCard } from '../games/callbreak/engine';

describe('Cards', () => {
  it('creates a 52-card deck with unique cards', () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
    const ids = new Set(deck.map(c => c.id));
    expect(ids.size).toBe(52);
  });

  it('shuffles deterministically with seed', () => {
    const deck = createDeck();
    const s1 = shuffle(deck, 42);
    const s2 = shuffle(deck, 42);
    expect(s1.map(c => c.id)).toEqual(s2.map(c => c.id));
  });
});

describe('Call Break Engine', () => {
  it('deals 13 cards to each of 4 players', () => {
    const state = createInitialState(123);
    expect(state.hands.every(h => h.length === 13)).toBe(true);
    const allCards = state.hands.flat();
    expect(new Set(allCards.map(c => c.id)).size).toBe(52);
  });

  it('accepts valid bids', () => {
    let state = createInitialState(1);
    state = placeBid(state, 0, 3);
    expect(state.bids[0]).toBe(3);
    expect(state.currentBidder).toBe(1);
  });

  it('rejects invalid moves', () => {
    const state = createInitialState(1);
    // Force to playing with empty current trick
    const playingState = { ...state, phase: 'playing' as const, currentPlayer: 0 as const };
    const illegalCard = { suit: 'hearts' as const, rank: '2' as const, id: 'fake' };
    const result = playCard(playingState, 0, illegalCard);
    expect(result).toBe(playingState); // no change
  });
});
