import { useState, useEffect } from 'react';
import ScoreBar from '../components/ScoreBar';
import WinScreen from '../components/WinScreen';
import AnswerOptions, { Feedback } from '../components/AnswerOptions';
import FigureViewer from '../components/FigureViewer';
import { useGameLoop } from '../game/useGameLoop';

/**
 * Khung chơi chung cho các cấp độ trắc nghiệm.
 * makeQuestion: () => { key, figure | figureUrl, text, options, note }
 */
export default function QuizLevel({ level, makeQuestion }) {
  const game = useGameLoop(level.target);
  const [q, setQ] = useState(() => makeQuestion());
  const [phase, setPhase] = useState('idle'); // idle | correct | wrong | answered
  const [picked, setPicked] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setQ(makeQuestion());
    setPhase('idle');
    setPicked(null);
    setImgError(false);
  }, [level.id]);

  const handlePick = (opt) => {
    if (phase !== 'idle') return;
    setPicked(opt);
    if (opt.correct) {
      setPhase('correct');
      game.correct();
    } else {
      setPhase('wrong');
      game.wrong();
    }
  };

  const next = () => {
    setQ(makeQuestion());
    setPhase('idle');
    setPicked(null);
    setImgError(false);
  };

  if (game.won) {
    return (
      <WinScreen
        levelName={level.name}
        onReplay={() => {
          game.reset();
          next();
        }}
        onHome={level.onQuit}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 gap-3 sm:gap-4">
      <ScoreBar score={game.score} streak={game.streak} target={level.target} onQuit={level.onQuit} />

      <div className="flex-1 glass-panel p-4 sm:p-6 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-center shrink-0">{level.title}</h2>

        <div className="flex-1 min-h-[200px] flex items-center justify-center bg-dark-bg/60 rounded-xl border border-dark-border/50 p-2">
          {q.figureUrl ? (
            imgError ? (
              <p className="text-text-secondary text-sm text-center px-4">
                Chưa có hình trong kho. Chạy <code className="text-neon-blue">npm run figures</code> để tạo.
              </p>
            ) : (
              <FigureViewer src={q.figureUrl} onError={() => setImgError(true)} />
            )
          ) : (
            q.figure
          )}
        </div>

        <p className="text-center font-semibold text-base sm:text-lg shrink-0">{q.text}</p>
        <p className="text-center text-xs text-text-secondary shrink-0 -mt-2">
          ID: <span className="font-mono text-neon-blue">{q.qid || q.key || '—'}</span>
        </p>

        <AnswerOptions options={q.options} phase={phase === 'wrong' ? 'wrong' : phase === 'correct' ? 'answered' : 'idle'} picked={picked} onPick={handlePick} />
        <Feedback phase={phase === 'wrong' ? 'wrong' : phase === 'correct' ? 'correct' : 'idle'} note={q.note} onNext={next} />
      </div>
    </div>
  );
}
