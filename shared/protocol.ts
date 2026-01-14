import type { GameState } from './types';

export function encodeGameState(state: GameState): ArrayBuffer {
  const buffer = new ArrayBuffer(36);
  const view = new DataView(buffer);
  view.setFloat32(0, state.ballX, true);
  view.setFloat32(4, state.ballY, true);
  view.setFloat32(8, state.ballVX, true);
  view.setFloat32(12, state.ballVY, true);
  view.setFloat32(16, state.leftPaddleY, true);
  view.setFloat32(20, state.rightPaddleY, true);
  view.setUint16(24, state.leftScore, true);
  view.setUint16(26, state.rightScore, true);
  return buffer;
}

export function decodeGameState(buffer: ArrayBuffer): GameState {
  const view = new DataView(buffer);
  return {
    ballX: view.getFloat32(0, true),
    ballY: view.getFloat32(4, true),
    ballVX: view.getFloat32(8, true),
    ballVY: view.getFloat32(12, true),
    leftPaddleY: view.getFloat32(16, true),
    rightPaddleY: view.getFloat32(20, true),
    leftScore: view.getUint16(24, true),
    rightScore: view.getUint16(26, true),
  };
}
