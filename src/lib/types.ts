import type { Difficulty, GameState as ServerGameState } from '@/shared/types';

export type { Difficulty };

export interface GameState extends ServerGameState {
  gameOver: boolean;
  winner: string | null;
}

export interface Scores {
  left: number;
  right: number;
}

export type GameMode = 'computer' | 'pvp';

export interface LobbyState {
  mode: GameMode | null;
  difficulty: Difficulty;
  roomId: string | null;
  playerNumber: number | null;
  waiting: boolean;
  error: string | null;
}
