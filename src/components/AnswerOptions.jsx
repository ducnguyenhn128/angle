import { motion } from 'framer-motion';

export default function AnswerOptions({ options, phase, picked, onPick }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isPicked = phase !== 'idle' && picked === opt;
        const showCorrect = phase !== 'idle' && opt.correct;
        const showWrong = phase === 'wrong' && isPicked && !opt.correct;
        return (
          <button
            key={opt.label}
            disabled={phase !== 'idle'}
            onClick={() => onPick(opt)}
            className={[
              'px-4 py-3.5 sm:py-4 rounded-xl border font-semibold text-base sm:text-lg transition-all duration-200',
              'disabled:cursor-default',
              showCorrect
                ? 'bg-neon-green/15 border-neon-green text-neon-green'
                : showWrong
                  ? 'bg-red-500/15 border-red-500 text-red-400'
                  : phase === 'answered'
                    ? 'bg-dark-surface/60 border-dark-border text-text-secondary'
                    : 'bg-dark-surface border-dark-border text-text-primary hover:border-neon-blue/50 hover:bg-neon-blue/5 active:scale-95',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Feedback({ phase, note, onNext, nextLabel = 'Câu tiếp theo →' }) {
  if (phase === 'idle') return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3',
        phase === 'correct'
          ? 'bg-neon-green/10 border-neon-green/40'
          : 'bg-red-500/10 border-red-500/40',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-bold mb-1 ${phase === 'correct' ? 'text-neon-green' : 'text-red-400'}`}>
          {phase === 'correct' ? '✅ Chính xác!' : '❌ Chưa đúng — xem giải thích:'}
        </p>
        {note && <p className="text-sm text-text-secondary leading-relaxed">{note}</p>}
      </div>
      <button
        onClick={onNext}
        className="shrink-0 px-5 py-2.5 rounded-lg bg-neon-blue/15 border border-neon-blue/40 text-neon-blue font-semibold hover:bg-neon-blue/25 transition-colors"
      >
        {nextLabel}
      </button>
    </motion.div>
  );
}
