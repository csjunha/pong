import { useRef, useState, useEffect } from 'react';
import { usePongGame } from '@/src/hooks/usePongGame';
import { Scoreboard } from '@/src/components/Scoreboard';
import { GameOverlay } from '@/src/components/GameOverlay';
import { ControlsHint } from '@/src/components/ControlsHint';
import { Lobby } from '@/src/components/Lobby';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT } from '@/shared/constants';
import { renderGame } from '@/src/lib/renderer';
import { getSocket, disconnectSocket } from '@/src/lib/socket';
import type { Difficulty } from '@/shared/types';
import type { GameMode, LobbyState, Scores } from '@/src/lib/types';

function ComputerGame({ difficulty, onBack }: { difficulty: Difficulty; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scores, gameOver, winner, resetGame, isLocked } = usePongGame(canvasRef, containerRef, difficulty);

  return (
    <div className="flex flex-col items-center gap-6 p-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="font-orbitron text-xs text-white/40 hover:text-white/60 transition-colors px-3 py-1 rounded border border-white/10 hover:border-white/20"
        >
          ← Menu
        </button>
        <h1 className="font-orbitron text-5xl font-black tracking-[0.5em] bg-gradient-to-br from-[#ff6b6b] via-white to-[#4ecdc4] bg-clip-text text-transparent">
          PONG
        </h1>
        <span className="font-orbitron text-xs text-white/40 px-2 py-1 bg-white/5 rounded uppercase">
          {difficulty}
        </span>
      </div>

      <Scoreboard scores={scores} leftLabel="Player" rightLabel="Computer" />

      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-[0_0_0_2px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_100px_rgba(255,107,107,0.1),0_0_100px_rgba(78,205,196,0.1)]"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        {gameOver && <GameOverlay winner={winner} onRestart={resetGame} />}
      </div>

      <ControlsHint isLocked={isLocked} />
    </div>
  );
}

interface ServerGameState {
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  leftPaddleY: number;
  rightPaddleY: number;
  leftScore: number;
  rightScore: number;
}

function decodeGameState(buffer: ArrayBuffer): ServerGameState {
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

function MultiplayerGame({
  playerNumber,
  difficulty,
  onBack,
}: {
  playerNumber: number;
  difficulty: Difficulty;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const serverStateRef = useRef<ServerGameState | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const paddleY = useRef(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const lastPaddleSent = useRef(paddleY.current);
  const [scores, setScores] = useState<Scores>({ left: 0, right: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleGameState = (buffer: ArrayBuffer) => {
      const state = decodeGameState(buffer);
      serverStateRef.current = state;
      if (state.leftScore !== scores.left || state.rightScore !== scores.right) {
        setScores({ left: state.leftScore, right: state.rightScore });
      }
    };

    const handleGameOver = ({ winner: side }: { winner: 'left' | 'right' }) => {
      setGameOver(true);
      if (playerNumber === 1) {
        setWinner(side === 'left' ? 'You' : 'Opponent');
      } else {
        setWinner(side === 'right' ? 'You' : 'Opponent');
      }
    };

    const handlePlayerLeft = () => {
      setGameOver(true);
      setWinner('Opponent Left');
    };

    socket.on('gs', handleGameState);
    socket.on('game-over', handleGameOver);
    socket.on('player-left', handlePlayerLeft);

    return () => {
      socket.off('gs', handleGameState);
      socket.off('game-over', handleGameOver);
      socket.off('player-left', handlePlayerLeft);
    };
  }, [playerNumber, scores]);

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
      if (document.pointerLockElement === container) {
        paddleY.current += e.movementY * 1.5;
        paddleY.current = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddleY.current));
      } else {
        const rect = container.getBoundingClientRect();
        const scaleY = CANVAS_HEIGHT / rect.height;
        const mouseY = (e.clientY - rect.top) * scaleY;
        paddleY.current = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
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
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const socket = getSocket();
    let localBallX = CANVAS_WIDTH / 2;
    let localBallY = CANVAS_HEIGHT / 2;
    let localVX = 0;
    let localVY = 0;

    const loop = () => {
      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
        paddleY.current = Math.max(0, paddleY.current - 8);
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
        paddleY.current = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddleY.current + 8);
      }

      if (Math.abs(paddleY.current - lastPaddleSent.current) > 2) {
        socket.volatile.emit('paddle-move', paddleY.current);
        lastPaddleSent.current = paddleY.current;
      }

      const server = serverStateRef.current;
      if (server) {
        const errorX = server.ballX - localBallX;
        const errorY = server.ballY - localBallY;
        const errorDist = Math.sqrt(errorX * errorX + errorY * errorY);

        if (errorDist > 100) {
          localBallX = server.ballX;
          localBallY = server.ballY;
        } else {
          localVX = server.ballVX;
          localVY = server.ballVY;
          localBallX += localVX;
          localBallY += localVY;
          localBallX += errorX * 0.2;
          localBallY += errorY * 0.2;
        }

        if (localBallY < 7) localBallY = 7;
        if (localBallY > CANVAS_HEIGHT - 7) localBallY = CANVAS_HEIGHT - 7;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          renderGame(ctx, {
            ...server,
            ballX: localBallX,
            ballY: localBallY,
            gameOver: false,
            winner: null,
          });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleRestart = () => {
    const socket = getSocket();
    socket.emit('restart-game');
    setGameOver(false);
    setWinner(null);
  };

  const handleBack = () => {
    disconnectSocket();
    onBack();
  };

  const leftLabel = playerNumber === 1 ? 'You' : 'Opponent';
  const rightLabel = playerNumber === 2 ? 'You' : 'Opponent';

  return (
    <div className="flex flex-col items-center gap-6 p-10">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="font-orbitron text-xs text-white/40 hover:text-white/60 transition-colors px-3 py-1 rounded border border-white/10 hover:border-white/20"
        >
          ← Leave
        </button>
        <h1 className="font-orbitron text-5xl font-black tracking-[0.5em] bg-gradient-to-br from-[#ff6b6b] via-white to-[#4ecdc4] bg-clip-text text-transparent">
          PONG
        </h1>
        <span className="font-orbitron text-xs text-[#4ecdc4] px-2 py-1 bg-[#4ecdc4]/10 rounded uppercase">
          PvP • {difficulty}
        </span>
      </div>

      <Scoreboard scores={scores} leftLabel={leftLabel} rightLabel={rightLabel} />

      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-[0_0_0_2px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_100px_rgba(255,107,107,0.1),0_0_100px_rgba(78,205,196,0.1)]"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        {gameOver && <GameOverlay winner={winner} onRestart={handleRestart} />}
      </div>

      <ControlsHint isLocked={isLocked} />
    </div>
  );
}

export default function PongGame() {
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    mode: null,
    difficulty: 'normal',
    roomId: null,
    playerNumber: null,
    waiting: false,
    error: null,
  });

  useEffect(() => {
    const socket = getSocket();

    const handleRoomCreated = ({ roomId, playerNumber }: { roomId: string; playerNumber: number }) => {
      setLobbyState((prev) => ({
        ...prev,
        mode: 'pvp',
        roomId,
        playerNumber,
        waiting: true,
        error: null,
      }));
    };

    const handleRoomJoined = ({ roomId, playerNumber, difficulty }: { roomId: string; playerNumber: number; difficulty: string }) => {
      setLobbyState((prev) => ({
        ...prev,
        mode: 'pvp',
        difficulty: difficulty as Difficulty,
        roomId,
        playerNumber,
        waiting: false,
        error: null,
      }));
    };

    const handleGameStart = ({ difficulty }: { difficulty: string }) => {
      setLobbyState((prev) => ({
        ...prev,
        waiting: false,
        difficulty: difficulty as Difficulty,
      }));
    };

    const handleError = (message: string) => {
      setLobbyState((prev) => ({ ...prev, error: message }));
    };

    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('game-start', handleGameStart);
    socket.on('error', handleError);

    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('game-start', handleGameStart);
      socket.off('error', handleError);
    };
  }, []);

  const handleStartGame = (mode: GameMode, difficulty: Difficulty) => {
    setLobbyState((prev) => ({ ...prev, mode, difficulty }));
  };

  const handleCreateRoom = (difficulty: Difficulty) => {
    setLobbyState((prev) => ({ ...prev, difficulty }));
    const socket = getSocket();
    socket.emit('create-room', difficulty);
  };

  const handleJoinRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit('join-room', roomId);
  };

  const handleBack = () => {
    disconnectSocket();
    setLobbyState({
      mode: null,
      difficulty: 'normal',
      roomId: null,
      playerNumber: null,
      waiting: false,
      error: null,
    });
  };

  if (lobbyState.mode === 'computer') {
    return <ComputerGame difficulty={lobbyState.difficulty} onBack={handleBack} />;
  }

  if (lobbyState.mode === 'pvp' && lobbyState.playerNumber && !lobbyState.waiting) {
    return (
      <MultiplayerGame
        playerNumber={lobbyState.playerNumber}
        difficulty={lobbyState.difficulty}
        onBack={handleBack}
      />
    );
  }

  return (
    <Lobby
      onStartGame={handleStartGame}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      roomId={lobbyState.roomId}
      waiting={lobbyState.waiting}
      error={lobbyState.error}
    />
  );
}
