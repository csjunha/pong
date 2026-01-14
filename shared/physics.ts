import type { GameState, Difficulty } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  DIFFICULTY_SETTINGS,
} from './constants';

export function checkPaddleCollision(
  prevX: number,
  prevY: number,
  nextX: number,
  nextY: number,
  paddleX: number,
  paddleY: number,
  ballRadius: number,
  movingLeft: boolean
): { hit: boolean; t: number; hitY: number } {
  const paddleEdge = movingLeft ? paddleX + PADDLE_WIDTH : paddleX;
  const ballEdge = movingLeft ? -ballRadius : ballRadius;

  const prevBallEdge = prevX + ballEdge;
  const nextBallEdge = nextX + ballEdge;

  if (movingLeft) {
    if (prevBallEdge <= paddleEdge || nextBallEdge > paddleEdge) {
      return { hit: false, t: 0, hitY: 0 };
    }
  } else {
    if (prevBallEdge >= paddleEdge || nextBallEdge < paddleEdge) {
      return { hit: false, t: 0, hitY: 0 };
    }
  }

  const t = (paddleEdge - prevBallEdge) / (nextBallEdge - prevBallEdge);
  if (t < 0 || t > 1) {
    return { hit: false, t: 0, hitY: 0 };
  }

  const hitY = prevY + t * (nextY - prevY);
  if (hitY >= paddleY && hitY <= paddleY + PADDLE_HEIGHT) {
    return { hit: true, t, hitY };
  }

  return { hit: false, t: 0, hitY: 0 };
}

export function resetBall(state: GameState, direction: number, difficulty: Difficulty) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const totalScore = state.leftScore + state.rightScore;
  const progressBonus = 1 + totalScore * 0.08;
  const startSpeed = Math.min(settings.ballSpeed * progressBonus, settings.maxSpeed * 0.6);
  const angle = (Math.random() - 0.5) * Math.PI / 3;
  state.ballX = CANVAS_WIDTH / 2;
  state.ballY = CANVAS_HEIGHT / 2;
  state.ballVX = startSpeed * direction * Math.cos(angle);
  state.ballVY = startSpeed * Math.sin(angle);
}

export function createInitialGameState(difficulty: Difficulty): GameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const direction = Math.random() > 0.5 ? 1 : -1;
  const angle = (Math.random() - 0.5) * Math.PI / 3;
  return {
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVX: settings.ballSpeed * direction * Math.cos(angle),
    ballVY: settings.ballSpeed * Math.sin(angle),
    leftPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    leftScore: 0,
    rightScore: 0,
  };
}

export function updateBallPhysics(
  state: GameState,
  difficulty: Difficulty
): { scored: 'left' | 'right' | null } {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const ballRadius = BALL_SIZE / 2;

  const prevX = state.ballX;
  const prevY = state.ballY;
  let nextX = prevX + state.ballVX;
  let nextY = prevY + state.ballVY;

  if (nextY - ballRadius <= 0) {
    nextY = ballRadius;
    state.ballVY = -state.ballVY;
  } else if (nextY + ballRadius >= CANVAS_HEIGHT) {
    nextY = CANVAS_HEIGHT - ballRadius;
    state.ballVY = -state.ballVY;
  }

  const leftPaddleX = 20;
  const rightPaddleX = CANVAS_WIDTH - 20 - PADDLE_WIDTH;

  if (state.ballVX < 0) {
    const collision = checkPaddleCollision(
      prevX, prevY, nextX, nextY,
      leftPaddleX, state.leftPaddleY,
      ballRadius, true
    );

    if (collision.hit) {
      nextX = leftPaddleX + PADDLE_WIDTH + ballRadius;
      nextY = collision.hitY;

      const currentSpeed = Math.sqrt(state.ballVX ** 2 + state.ballVY ** 2);
      const newSpeed = Math.min(currentSpeed * settings.speedIncrement, settings.maxSpeed);
      const hitPos = (collision.hitY - state.leftPaddleY) / PADDLE_HEIGHT - 0.5;
      const angle = hitPos * (Math.PI / 3);
      state.ballVX = newSpeed * Math.cos(angle);
      state.ballVY = newSpeed * Math.sin(angle);
    }
  }

  if (state.ballVX > 0) {
    const collision = checkPaddleCollision(
      prevX, prevY, nextX, nextY,
      rightPaddleX, state.rightPaddleY,
      ballRadius, false
    );

    if (collision.hit) {
      nextX = rightPaddleX - ballRadius;
      nextY = collision.hitY;

      const currentSpeed = Math.sqrt(state.ballVX ** 2 + state.ballVY ** 2);
      const newSpeed = Math.min(currentSpeed * settings.speedIncrement, settings.maxSpeed);
      const hitPos = (collision.hitY - state.rightPaddleY) / PADDLE_HEIGHT - 0.5;
      const angle = hitPos * (Math.PI / 3);
      state.ballVX = -newSpeed * Math.cos(angle);
      state.ballVY = newSpeed * Math.sin(angle);
    }
  }

  state.ballX = nextX;
  state.ballY = nextY;

  let scored: 'left' | 'right' | null = null;
  if (state.ballX < 0) {
    scored = 'right';
  } else if (state.ballX > CANVAS_WIDTH) {
    scored = 'left';
  }

  return { scored };
}
