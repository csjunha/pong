import type { Scores } from '@/src/lib/types';

interface Props {
  scores: Scores;
  leftLabel?: string;
  rightLabel?: string;
}

export function Scoreboard({ scores, leftLabel = 'Player', rightLabel = 'Computer' }: Props) {
  return (
    <div className="flex items-center gap-8 px-12 py-4 bg-[#14142380] rounded-2xl border border-white/10 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <span className="font-orbitron text-xs uppercase tracking-[0.2em] text-white/50">
          {leftLabel}
        </span>
        <span className="font-orbitron text-4xl font-bold text-[#ff6b6b] drop-shadow-[0_0_20px_rgba(255,107,107,0.5)]">
          {scores.left}
        </span>
      </div>
      <div className="font-orbitron text-2xl text-white/30">:</div>
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <span className="font-orbitron text-xs uppercase tracking-[0.2em] text-white/50">
          {rightLabel}
        </span>
        <span className="font-orbitron text-4xl font-bold text-[#4ecdc4] drop-shadow-[0_0_20px_rgba(78,205,196,0.5)]">
          {scores.right}
        </span>
      </div>
    </div>
  );
}
