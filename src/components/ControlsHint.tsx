export function ControlsHint({ isLocked }: { isLocked?: boolean }) {
  return (
    <div className="flex gap-8 px-6 py-3 bg-[#14142399] rounded-lg font-orbitron text-xs text-white/40 tracking-[0.1em]">
      <span className="flex items-center gap-2">
        🖱️ Mouse {isLocked && <span className="text-[#4ecdc4]">✓ Locked</span>}
      </span>
      <span className="flex items-center gap-2">⬆️⬇️ W/S</span>
      {isLocked && <span className="flex items-center gap-2">ESC to unlock</span>}
    </div>
  );
}
