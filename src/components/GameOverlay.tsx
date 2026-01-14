interface Props {
  winner: string | null;
  onRestart: () => void;
}

export function GameOverlay({ winner, onRestart }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]/90 backdrop-blur-sm">
      <div className="text-center animate-[fadeIn_0.5s_ease-out]">
        <h2 className="font-orbitron text-4xl font-bold mb-6 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent">
          {winner} Wins!
        </h2>
        <button
          onClick={onRestart}
          className="font-orbitron text-base px-9 py-3.5 border-none rounded-lg bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] text-white cursor-pointer uppercase tracking-[0.15em] transition-all duration-200 shadow-[0_4px_20px_rgba(255,107,107,0.4)] hover:translate-y-[-2px] hover:shadow-[0_6px_30px_rgba(255,107,107,0.6)] active:translate-y-0"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
