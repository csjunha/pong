import type { GameState, Difficulty } from '../shared/types';
import { WINNING_SCORE } from '../shared/constants';
import { createInitialGameState, resetBall, updateBallPhysics } from '../shared/physics';

export { createInitialGameState };

export interface Room {
  id: string;
  players: string[];
  gameState: GameState | null;
  difficulty: Difficulty;
  gameLoop: ReturnType<typeof setInterval> | null;
}

export function updateGameState(room: Room): { scored: 'left' | 'right' | null; winner: 'left' | 'right' | null } {
  const state = room.gameState;
  if (!state) return { scored: null, winner: null };

  const { scored } = updateBallPhysics(state, room.difficulty);

  let winner: 'left' | 'right' | null = null;

  if (scored === 'right') {
    state.rightScore++;
    if (state.rightScore >= WINNING_SCORE) {
      winner = 'right';
    } else {
      resetBall(state, 1, room.difficulty);
    }
  } else if (scored === 'left') {
    state.leftScore++;
    if (state.leftScore >= WINNING_SCORE) {
      winner = 'left';
    } else {
      resetBall(state, -1, room.difficulty);
    }
  }

  return { scored, winner };
}
