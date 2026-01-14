import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { GameState, Scores } from '@/src/lib/types';
import type { Difficulty } from '@/shared/types';
import { renderGame } from '@/src/lib/renderer';
import {
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  WINNING_SCORE,
  DIFFICULTY_SETTINGS,
} from '@/shared/constants';
import { createInitialGameState, resetBall, updateBallPhysics } from '@/shared/physics';

const PADDLE_SPEED = 8;

interface ClientGameState extends GameState {
  gameOver: boolean;
  winner: string | null;
}

function createInitialClientState(difficulty: Difficulty): ClientGameState {
  return {
    ...createInitialGameState(difficulty),
    gameOver: false,
    winner: null,
  };
}

export function usePongGame(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  difficulty: Difficulty = 'normal'
) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const gameStateRef = useRef<ClientGameState>(createInitialClientState(difficulty));
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  const [scores, setScores] = useState<Scores>({ left: 0, right: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleResetBall = useCallback((direction: number) => {
    resetBall(gameStateRef.current, direction, difficulty);
  }, [difficulty]);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.leftScore = 0;
    state.rightScore = 0;
    state.leftPaddleY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    state.rightPaddleY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    state.gameOver = false;
    state.winner = null;
    setScores({ left: 0, right: 0 });
    setGameOver(false);
    setWinner(null);
    handleResetBall(Math.random() > 0.5 ? 1 : -1);
  }, [handleResetBall]);

  const updateGame = useCallback(() => {
    const state = gameStateRef.current;
    if (state.gameOver) return;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
      state.leftPaddleY = Math.max(0, state.leftPaddleY - PADDLE_SPEED);
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
      state.leftPaddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.leftPaddleY + PADDLE_SPEED);
    }

    const rightPaddleCenter = state.rightPaddleY + PADDLE_HEIGHT / 2;
    const diff = state.ballY - rightPaddleCenter;
    if (Math.abs(diff) > settings.aiSpeed) {
      state.rightPaddleY += diff > 0 ? settings.aiSpeed : -settings.aiSpeed;
    }
    state.rightPaddleY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.rightPaddleY));

    const { scored } = updateBallPhysics(state, difficulty);

    if (scored === 'right') {
      state.rightScore++;
      setScores({ left: state.leftScore, right: state.rightScore });
      if (state.rightScore >= WINNING_SCORE) {
        state.gameOver = true;
        state.winner = 'Computer';
        setGameOver(true);
        setWinner('Computer');
      } else {
        handleResetBall(1);
      }
    } else if (scored === 'left') {
      state.leftScore++;
      setScores({ left: state.leftScore, right: state.rightScore });
      if (state.leftScore >= WINNING_SCORE) {
        state.gameOver = true;
        state.winner = 'Player';
        setGameOver(true);
        setWinner('Player');
      } else {
        handleResetBall(-1);
      }
    }
  }, [handleResetBall, settings, difficulty]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    renderGame(ctx, gameStateRef.current);
  }, [canvasRef]);

  const gameLoop = useCallback(() => {
    updateGame();
    render();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === container);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = gameStateRef.current;
      if (document.pointerLockElement === container) {
        state.leftPaddleY += e.movementY * 1.5;
        state.leftPaddleY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.leftPaddleY));
      } else {
        const rect = container.getBoundingClientRect();
        const scaleY = CANVAS_HEIGHT / rect.height;
        const mouseY = (e.clientY - rect.top) * scaleY;
        state.leftPaddleY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
      }
    };

    const handleClick = () => {
      if (document.pointerLockElement !== container) {
        container.requestPointerLock();
      }
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [containerRef]);

  useEffect(() => {
    gameStateRef.current = createInitialClientState(difficulty);
    handleResetBall(Math.random() > 0.5 ? 1 : -1);
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop, handleResetBall, difficulty]);

  return { scores, gameOver, winner, resetGame, isLocked };
}
