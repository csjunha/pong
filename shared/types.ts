export interface GameState {
    ballX: number;
    ballY: number;
    ballVX: number;
    ballVY: number;
    leftPaddleY: number;
    rightPaddleY: number;
    leftScore: number;
    rightScore: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface DifficultySettings {
    ballSpeed: number;
    maxSpeed: number;
    speedIncrement: number;
    aiSpeed: number;
}