import type { Difficulty, DifficultySettings } from "./types";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const PADDLE_WIDTH = 12;
export const PADDLE_HEIGHT = 100;
export const BALL_SIZE = 14;
export const WINNING_SCORE = 10;

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
    easy: { ballSpeed: 4, maxSpeed: 12, speedIncrement: 1.03, aiSpeed: 3 },
    normal: { ballSpeed: 5, maxSpeed: 16, speedIncrement: 1.05, aiSpeed: 5 },
    hard: { ballSpeed: 7, maxSpeed: 22, speedIncrement: 1.08, aiSpeed: 7 },
    extreme: { ballSpeed: 10, maxSpeed: 30, speedIncrement: 1.12, aiSpeed: 10 },
};

