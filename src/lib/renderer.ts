import type { GameState } from '@/src/lib/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
} from '@/shared/constants';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  const leftGradient = ctx.createLinearGradient(20, 0, 20 + PADDLE_WIDTH, 0);
  leftGradient.addColorStop(0, '#ff6b6b');
  leftGradient.addColorStop(1, '#ee5a5a');
  ctx.fillStyle = leftGradient;
  ctx.shadowColor = '#ff6b6b';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(20, state.leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
  ctx.fill();

  const rightGradient = ctx.createLinearGradient(
    CANVAS_WIDTH - 20 - PADDLE_WIDTH,
    0,
    CANVAS_WIDTH - 20,
    0
  );
  rightGradient.addColorStop(0, '#4ecdc4');
  rightGradient.addColorStop(1, '#3dbdb5');
  ctx.fillStyle = rightGradient;
  ctx.shadowColor = '#4ecdc4';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(
    CANVAS_WIDTH - 20 - PADDLE_WIDTH,
    state.rightPaddleY,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    6
  );
  ctx.fill();

  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}
