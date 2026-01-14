import type { Server } from 'socket.io';
import type { Room } from './game';
import { updateGameState } from './game';
import { encodeGameState } from '../shared/protocol';

export const rooms = new Map<string, Room>();
export const playerRooms = new Map<string, string>();

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const SERVER_TICK_RATE = 30;

export function startGameLoop(room: Room, io: Server) {
  if (room.gameLoop) {
    clearInterval(room.gameLoop);
  }

  let lastTime = Date.now();

  room.gameLoop = setInterval(() => {
    if (!room || room.players.length < 2 || !room.gameState) {
      if (room.gameLoop) clearInterval(room.gameLoop);
      return;
    }

    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    const steps = Math.round(delta / (1000 / 60));
    for (let i = 0; i < Math.min(steps, 3); i++) {
      const { winner } = updateGameState(room);
      if (winner) {
        io.to(room.id).emit('game-over', { winner });
        if (room.gameLoop) clearInterval(room.gameLoop);
        room.gameLoop = null;
        return;
      }
    }

    const buffer = encodeGameState(room.gameState);
    io.to(room.id).volatile.emit('gs', buffer);
  }, 1000 / SERVER_TICK_RATE);
}

export function cleanupRoom(roomId: string, playerId: string, io: Server) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.gameLoop) {
    clearInterval(room.gameLoop);
    room.gameLoop = null;
  }

  room.players = room.players.filter((p) => p !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
  } else {
    io.to(roomId).emit('player-left');
  }
}
