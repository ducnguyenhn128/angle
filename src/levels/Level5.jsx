import { useState } from 'react';
import { motion } from 'framer-motion';
import FigureViewer from '../components/FigureViewer';
import { makeBankFigure } from '../game/generators';
import BackButton from '../components/BackButton';
import { RefreshCw, Mic, Lightbulb, EyeOff } from 'lucide-react';

/**
 * Cấp độ 5 — chế độ GV: chỉ hiển thị hình ngẫu nhiên từ kho,
 * GV tự hỏi - trả lời miệng. Không chấm điểm.
 */
export default function Level5({ onQuit }) {
  const [fig, setFig] = useState(() => makeBankFigure('parallel'));
  const [imgError, setImgError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const next = () => {
    setFig(makeBankFigure('parallel'));
    setImgError(false);
    setShowHint(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="glass-panel p-3 sm:p-4 flex items-center gap-3 shrink-0">
        <BackButton onClick={onQuit} />
        <div className="flex-1">
          <h2 className="font-bold">Hai đường thẳng song song</h2>
          <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
            <Mic className="w-3.5 h-3.5 text-neon-pink" />
            Chế độ giáo viên — trả lời miệng, giải thích vì sao song song
          </p>
        </div>
        <button
          onClick={next}
          className="p-2 rounded-lg text-text-secondary hover:text-neon-blue hover:bg-dark-bg/60 transition-colors shrink-0"
          title="Hình tiếp theo"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 glass-panel p-4 sm:p-6 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <div className="flex-1 min-h-[220px] flex items-center justify-center bg-dark-bg/60 rounded-xl border border-dark-border/50 p-2">
          {imgError ? (
            <p className="text-text-secondary text-sm text-center px-4">
              Chưa có hình trong kho. Chạy <code className="text-neon-blue">npm run figures</code> để tạo.
            </p>
          ) : (
            <FigureViewer src={fig.figureUrl} onError={() => setImgError(true)} />
          )}
        </div>

        <p className="text-center text-text-secondary text-sm">
          ID hình: <span className="font-mono text-neon-blue">{fig.qid || fig.key || '—'}</span> · Gợi ý: HS nêu lý do — hai góc so le trong bằng nhau · hai góc đồng vị bằng nhau ·
          cùng vuông góc với đường thẳng thứ ba · hai góc trong cùng phía bù nhau…
        </p>

        <button
          onClick={() => setShowHint((s) => !s)}
          className="shrink-0 mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-neon-green/30 text-neon-green hover:bg-neon-green/10 transition-colors"
        >
          {showHint ? <EyeOff className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
          {showHint ? 'Ẩn gợi ý đáp án' : 'Hiện gợi ý đáp án'}
        </button>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-neon-green/30 bg-neon-green/10 p-4"
          >
            <h3 className="font-semibold text-neon-green mb-1">
              {fig.title || 'Gợi ý đáp án'}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{fig.note}</p>
          </motion.div>
        )}

        <button
          onClick={next}
          className="shrink-0 mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-blue/15 border border-neon-blue/40 text-neon-blue font-semibold hover:bg-neon-blue/25 transition-colors"
        >
          <RefreshCw className="w-5 h-5" /> Hình tiếp theo
        </button>
      </div>
    </div>
  );
}
