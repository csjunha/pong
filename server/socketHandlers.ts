import type { Server, Socket } from 'socket.io';
import type { Difficulty } from '../shared/types';
import type { Room } from './game';
import { CANVAS_HEIGHT, PADDLE_HEIGHT } from '../shared/constants';
import { createInitialGameState } from './game';
import {
  rooms,
  playerRooms,
  generateRoomId,
  startGameLoop,
  cleanupRoom,
} from './roomManager';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Player connected:', socket.id);

    socket.on('create-room', (difficulty: Difficulty) => {
      const roomId = generateRoomId();
      const room: Room = {
        id: roomId,
        players: [socket.id],
        gameState: null,
        difficulty: difficulty || 'normal',
        gameLoop: null,
      };
      rooms.set(roomId, room);
      playerRooms.set(socket.id, roomId);
      socket.join(roomId);
      socket.emit('room-created', { roomId, playerNumber: 1 });
      console.log(`Room ${roomId} created by ${socket.id} (${difficulty})`);
    });

    socket.on('join-room', (roomId: string) => {
      const room = rooms.get(roomId.toUpperCase());
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }
      if (room.players.length >= 2) {
        socket.emit('error', 'Room is full');
        return;
      }

      room.players.push(socket.id);
      playerRooms.set(socket.id, roomId.toUpperCase());
      socket.join(roomId.toUpperCase());
      socket.emit('room-joined', {
        roomId: room.id,
        playerNumber: 2,
        difficulty: room.difficulty,
      });

      room.gameState = createInitialGameState(room.difficulty);
      io.to(room.id).emit('game-start', {
        gameState: room.gameState,
        difficulty: room.difficulty,
      });

      startGameLoop(room, io);
      console.log(`Player ${socket.id} joined room ${room.id}`);
    });

    socket.on('paddle-move', (y: number) => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room?.gameState) return;

      const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y));
      const playerIndex = room.players.indexOf(socket.id);

      if (playerIndex === 0) {
        room.gameState.leftPaddleY = clampedY;
      } else if (playerIndex === 1) {
        room.gameState.rightPaddleY = clampedY;
      }
    });

    socket.on('restart-game', () => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room || room.players.length < 2) return;

      room.gameState = createInitialGameState(room.difficulty);
      io.to(room.id).emit('game-start', {
        gameState: room.gameState,
        difficulty: room.difficulty,
      });

      startGameLoop(room, io);
    });

    socket.on('disconnect', () => {
      const roomId = playerRooms.get(socket.id);
      if (roomId) {
        cleanupRoom(roomId, socket.id, io);
        playerRooms.delete(socket.id);
      }
      console.log('Player disconnected:', socket.id);
    });
  });
}
