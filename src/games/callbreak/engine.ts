import type { Card } from '../../utils/cards';
import { createDeck, shuffle, rankValue, type Suit } from '../../utils/cards';

export type PlayerId = 0 | 1 | 2 | 3;

export interface CallBreakState {
  hands: Card[][];
  bids: (number | null)[];
  currentBidder: PlayerId;
  tricks: { cards: Card[]; winner: PlayerId }[];
  currentTrick: { player: PlayerId; card: Card }[];
  leadPlayer: PlayerId;
  currentPlayer: PlayerId;
  scores: number[];
  round: number;
  phase: 'bidding' | 'playing' | 'round-end' | 'game-end';
  trump: Suit;
  seed: number;
  tricksWon: number[];
}

export function createInitialState(seed = Date.now()): CallBreakState {
  const deck = shuffle(createDeck(), seed);
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < 52; i++) {
    hands[i % 4].push(deck[i]);
  }
  // Sort hands by suit then rank for easier play
  hands.forEach(hand => hand.sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return rankValue(b.rank) - rankValue(a.rank);
  }));

  return {
    hands,
    bids: [null, null, null, null],
    currentBidder: 0,
    tricks: [],
    currentTrick: [],
    leadPlayer: 0,
    currentPlayer: 0,
    scores: [0, 0, 0, 0],
    round: 1,
    phase: 'bidding',
    trump: 'spades',
    seed,
    tricksWon: [0, 0, 0, 0],
  };
}

export function getLegalMoves(state: CallBreakState, player: PlayerId): Card[] {
  if (state.phase !== 'playing') return [];
  const hand = state.hands[player];
  if (state.currentTrick.length === 0) return hand; // lead anything

  const leadSuit = state.currentTrick[0].card.suit;
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);
  if (hasLeadSuit) return hand.filter(c => c.suit === leadSuit);
  return hand; // can play anything including trump
}

export function placeBid(state: CallBreakState, player: PlayerId, bid: number): CallBreakState {
  if (state.phase !== 'bidding' || state.currentBidder !== player || bid < 0 || bid > 13) return state;
  const newBids = [...state.bids];
  newBids[player] = bid;
  const nextBidder = ((player + 1) % 4) as PlayerId;
  const allBid = newBids.every(b => b !== null);
  return {
    ...state,
    bids: newBids,
    currentBidder: allBid ? 0 : nextBidder,
    phase: allBid ? 'playing' : 'bidding',
    currentPlayer: allBid ? 0 : nextBidder,
    leadPlayer: allBid ? 0 : state.leadPlayer,
  };
}

export function playCard(state: CallBreakState, player: PlayerId, card: Card): CallBreakState {
  if (state.phase !== 'playing' || state.currentPlayer !== player) return state;
  const legal = getLegalMoves(state, player);
  if (!legal.some(c => c.id === card.id)) return state;

  const newHands = state.hands.map((h, i) => i === player ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { player, card }];

  if (newTrick.length < 4) {
    return {
      ...state,
      hands: newHands,
      currentTrick: newTrick,
      currentPlayer: ((player + 1) % 4) as PlayerId,
    };
  }

  // Complete trick
  const winner = determineTrickWinner(newTrick, state.trump);
  const newTricks = [...state.tricks, { cards: newTrick.map(t => t.card), winner }];
  const newTricksWon = [...state.tricksWon];
  newTricksWon[winner] += 1;
  const allHandsEmpty = newHands.every(h => h.length === 0);

  if (allHandsEmpty) {
    const newScores = calculateRoundScores(state.bids as number[], newTricksWon);
    return {
      ...state,
      hands: newHands,
      currentTrick: [],
      tricks: newTricks,
      tricksWon: newTricksWon,
      scores: state.scores.map((s, i) => s + newScores[i]),
      phase: 'round-end',
      leadPlayer: winner,
      currentPlayer: winner,
    };
  }

  return {
    ...state,
    hands: newHands,
    currentTrick: [],
    tricks: newTricks,
    tricksWon: newTricksWon,
    leadPlayer: winner,
    currentPlayer: winner,
  };
}

function determineTrickWinner(trick: { player: PlayerId; card: Card }[], trump: Suit): PlayerId {
  let winner = trick[0];
  for (const play of trick.slice(1)) {
    const isTrump = play.card.suit === trump;
    const winnerIsTrump = winner.card.suit === trump;
    if (isTrump && !winnerIsTrump) {
      winner = play;
    } else if (isTrump === winnerIsTrump && play.card.suit === winner.card.suit) {
      if (rankValue(play.card.rank) > rankValue(winner.card.rank)) {
        winner = play;
      }
    } else if (!isTrump && !winnerIsTrump && play.card.suit === trick[0].card.suit) {
      if (rankValue(play.card.rank) > rankValue(winner.card.rank)) {
        winner = play;
      }
    }
  }
  return winner.player;
}

function calculateRoundScores(bids: number[], tricksWon: number[]): number[] {
  return bids.map((bid, i) => {
    const won = tricksWon[i];
    if (won === bid) return bid;
    if (won > bid) return bid + (won - bid) * 0.1;
    return -(bid - won);
  });
}

// Bot AI
export function botBid(state: CallBreakState, player: PlayerId, difficulty: 'beginner' | 'casual' | 'intermediate' | 'expert'): number {
  const hand = state.hands[player];
  let estimate = 0;
  // Simple: count high cards and trumps
  for (const card of hand) {
    if (card.suit === 'spades') estimate += 0.6;
    if (rankValue(card.rank) >= 12) estimate += 0.5;
    if (rankValue(card.rank) >= 14) estimate += 0.3;
  }
  estimate = Math.round(estimate);
  if (difficulty === 'beginner') estimate = Math.max(1, estimate - 1);
  if (difficulty === 'expert') estimate = Math.min(8, estimate + 1);
  return Math.max(1, Math.min(8, estimate));
}

export function botPlay(state: CallBreakState, player: PlayerId, _difficulty: string): Card | null {
  const legal = getLegalMoves(state, player);
  if (legal.length === 0) return null;
  // Simple: play lowest if not leading, highest if leading or to win
  if (state.currentTrick.length === 0) {
    return legal.reduce((a, b) => rankValue(a.rank) > rankValue(b.rank) ? a : b);
  }
  return legal.reduce((a, b) => rankValue(a.rank) < rankValue(b.rank) ? a : b);
}
