import { Flame, Trophy } from 'lucide-react';
import BackButton from './BackButton';

export default function ScoreBar({ score, streak, target, onQuit }) {
  const pct = Math.min(100, Math.round((score / target) * 100));
  return (
    <div className="glass-panel p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shrink-0">
      <BackButton onClick={onQuit} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-sm font-semibold">
            Điểm: <span className="text-neon-blue text-base">{score}</span>
            <span className="text-text-secondary"> / {target}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-orange-400 font-medium shrink-0">
            <Flame className="w-4 h-4" />
            {streak}
          </span>
        </div>
        <div className="h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-pink transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0 text-text-secondary">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-medium">Đúng +10 · Chuỗi 🔥 ≥ 3: +15</span>
      </div>
    </div>
  );
}
