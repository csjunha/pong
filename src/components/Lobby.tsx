import { useState } from 'react';
import type { Difficulty } from '@/shared/types';
import type { GameMode } from '@/src/lib/types';

interface Props {
    onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
    onCreateRoom: (difficulty: Difficulty) => void;
    onJoinRoom: (roomId: string) => void;
    roomId: string | null;
    waiting: boolean;
    error: string | null;
}

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Easy', description: 'Slow ball, relaxed pace' },
    { value: 'normal', label: 'Normal', description: 'Balanced gameplay' },
    { value: 'hard', label: 'Hard', description: 'Fast ball, quick reflexes needed' },
    { value: 'extreme', label: 'Extreme', description: 'Lightning fast, for pros only' },
];

export function Lobby({ onStartGame, onCreateRoom, onJoinRoom, roomId, waiting, error }: Props) {
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [showPvP, setShowPvP] = useState(false);

    if (waiting && roomId) {
        return (
            <div className="flex flex-col items-center gap-8 p-10">
                <h1 className="font-orbitron text-5xl font-black tracking-[0.5em] bg-gradient-to-br from-[#ff6b6b] via-white to-[#4ecdc4] bg-clip-text text-transparent">
                    PONG
                </h1>
                <div className="flex flex-col items-center gap-4 p-8 bg-[#14142380] rounded-2xl border border-white/10">
                    <p className="font-orbitron text-lg text-white/70">Waiting for opponent...</p>
                    <div className="flex items-center gap-3 p-4 bg-[#0a0a12] rounded-lg">
                        <span className="font-orbitron text-sm text-white/50">Room Code:</span>
                        <span className="font-orbitron text-2xl font-bold text-[#4ecdc4]">{roomId}</span>
                    </div>
                    <p className="font-orbitron text-xs text-white/40">Share this code with your friend</p>
                    <div className="mt-4 w-8 h-8 border-4 border-[#4ecdc4] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (showPvP) {
        return (
            <div className="flex flex-col items-center gap-8 p-10">
                <h1 className="font-orbitron text-5xl font-black tracking-[0.5em] bg-gradient-to-br from-[#ff6b6b] via-white to-[#4ecdc4] bg-clip-text text-transparent">
                    PONG
                </h1>

                <div className="flex flex-col gap-6 p-8 bg-[#14142380] rounded-2xl border border-white/10 min-w-[400px]">
                    <h2 className="font-orbitron text-xl text-center text-white/80">Player vs Player</h2>

                    <div className="flex flex-col gap-3">
                        <label className="font-orbitron text-xs text-white/50 uppercase tracking-wider">Difficulty</label>
                        <div className="grid grid-cols-2 gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDifficulty(d.value)}
                                    className={`p-3 rounded-lg font-orbitron text-sm transition-all ${difficulty === d.value
                                            ? 'bg-[#4ecdc4] text-[#0a0a12]'
                                            : 'bg-[#1a1a2e] text-white/70 hover:bg-[#252540]'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => onCreateRoom(difficulty)}
                        className="w-full p-4 rounded-lg font-orbitron text-base bg-gradient-to-r from-[#ff6b6b] to-[#ee5a5a] text-white uppercase tracking-wider transition-all hover:translate-y-[-2px] hover:shadow-[0_6px_30px_rgba(255,107,107,0.4)]"
                    >
                        Create Room
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="font-orbitron text-xs text-white/30">OR</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter room code"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                            className="flex-1 p-3 rounded-lg bg-[#0a0a12] border border-white/10 font-orbitron text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#4ecdc4]"
                            maxLength={6}
                        />
                        <button
                            onClick={() => joinRoomId && onJoinRoom(joinRoomId)}
                            disabled={!joinRoomId}
                            className="px-6 rounded-lg font-orbitron text-sm bg-[#4ecdc4] text-[#0a0a12] uppercase tracking-wider transition-all hover:bg-[#5dddd4] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Join
                        </button>
                    </div>

                    {error && (
                        <p className="font-orbitron text-sm text-[#ff6b6b] text-center">{error}</p>
                    )}

                    <button
                        onClick={() => setShowPvP(false)}
                        className="font-orbitron text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                        ← Back to menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 p-10">
            <h1 className="font-orbitron text-5xl font-black tracking-[0.5em] bg-gradient-to-br from-[#ff6b6b] via-white to-[#4ecdc4] bg-clip-text text-transparent">
                PONG
            </h1>

            <div className="flex flex-col gap-6 p-8 bg-[#14142380] rounded-2xl border border-white/10 min-w-[400px]">
                <h2 className="font-orbitron text-xl text-center text-white/80">Select Mode</h2>

                <div className="flex flex-col gap-3">
                    <label className="font-orbitron text-xs text-white/50 uppercase tracking-wider">Difficulty</label>
                    <div className="grid grid-cols-2 gap-2">
                        {DIFFICULTIES.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setDifficulty(d.value)}
                                className={`p-3 rounded-lg font-orbitron text-sm transition-all ${difficulty === d.value
                                        ? 'bg-[#4ecdc4] text-[#0a0a12]'
                                        : 'bg-[#1a1a2e] text-white/70 hover:bg-[#252540]'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <p className="font-orbitron text-xs text-white/40 text-center">
                        {DIFFICULTIES.find((d) => d.value === difficulty)?.description}
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <button
                        onClick={() => onStartGame('computer', difficulty)}
                        className="w-full p-4 rounded-lg font-orbitron text-base bg-gradient-to-r from-[#ff6b6b] to-[#ee5a5a] text-white uppercase tracking-wider transition-all hover:translate-y-[-2px] hover:shadow-[0_6px_30px_rgba(255,107,107,0.4)]"
                    >
                        🤖 vs Computer
                    </button>
                    <button
                        onClick={() => setShowPvP(true)}
                        className="w-full p-4 rounded-lg font-orbitron text-base bg-gradient-to-r from-[#4ecdc4] to-[#3dbdb5] text-[#0a0a12] uppercase tracking-wider transition-all hover:translate-y-[-2px] hover:shadow-[0_6px_30px_rgba(78,205,196,0.4)]"
                    >
                        👥 Player vs Player
                    </button>
                </div>
            </div>
        </div>
    );
}
