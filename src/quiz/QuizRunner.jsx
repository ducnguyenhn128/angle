import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, BookOpen } from 'lucide-react';
import BackButton from '../components/BackButton';
import FigureViewer from '../components/FigureViewer';
import { Feedback } from '../components/AnswerOptions';
import { QUESTION_TYPES } from './types';
import { RENDERERS, INLINE_STEM, OWN_FIGURE } from './renderers';
import QuadFigure from '../components/QuadFigure';
import { lessonById } from './bank';
import RecapCard from './RecapCard';

const btnSoft = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors';

/**
 * Chạy một đề cố định gồm các câu đã prepare.
 * mode 'test': mỗi câu trả lời 1 lần. mode 'practice': sai lần đầu được làm lại (kèm gợi ý).
 * Hết đề gọi onFinish(results) với results[i] = { q, correct, tries, hintsUsed }.
 */
export default function QuizRunner({ questions, mode = 'test', onQuit, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [response, setResponse] = useState(null);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [tries, setTries] = useState(0);
  const [eliminated, setEliminated] = useState([]);
  const [hintsShown, setHintsShown] = useState(0);
  const [showRecap, setShowRecap] = useState(false);

  const q = questions[idx];
  const type = QUESTION_TYPES[q.type];
  const Render = RENDERERS[q.type];
  const lesson = lessonById[q.lesson];
  const submitted = result != null;
  const retrying = !submitted && tries > 0;
  const isLast = idx === questions.length - 1;
  const nCorrect = results.filter((r) => r.correct).length;
  const maxTries = mode === 'practice' ? 2 : 1;

  const submit = (r = response) => {
    if (submitted || !type.isAnswered(r)) return;
    const res = type.grade(q, r);
    const attempt = tries + 1;
    setTries(attempt);
    if (!res.correct && attempt < maxTries) {
      // Luyện tập: cho làm lại, tự mở thêm một gợi ý nếu có
      setHintsShown((h) => Math.min(q.hints.length, Math.max(h, 1)));
      if (typeof r === 'number') {
        setEliminated((e) => [...e, r]);
        setResponse(null);
      } else if (q.type === 'hotspot') {
        setResponse([]);
      } else {
        setResponse(r);
      }
      return;
    }
    setResponse(r);
    setResult(res);
    setResults((prev) => [...prev, { q, correct: res.correct, tries: attempt, hintsUsed: hintsShown }]);
  };

  const next = () => {
    if (isLast) {
      onFinish(results);
      return;
    }
    setIdx(idx + 1);
    setResponse(null);
    setResult(null);
    setImgError(false);
    setTries(0);
    setEliminated([]);
    setHintsShown(0);
    setShowRecap(false);
  };

  const hasFigure = (q.figure || q.figureUrl || q.shapeData) && !OWN_FIGURE.has(q.type);
  const canHint = !submitted && hintsShown < q.hints.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="glass-panel p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shrink-0">
        <BackButton onClick={onQuit} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-sm font-semibold">
              Câu <span className="text-neon-blue text-base">{idx + 1}</span>
              <span className="text-text-secondary"> / {questions.length}</span>
            </span>
            <span className="flex items-center gap-1 text-sm text-neon-green font-medium shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              {nCorrect}
            </span>
          </div>
          <div className="h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-pink transition-all duration-500"
              style={{ width: `${Math.round(((idx + (submitted ? 1 : 0)) / questions.length) * 100)}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-xs font-medium text-text-secondary shrink-0">
          {mode === 'practice' ? 'Luyện tập' : 'Kiểm tra'} · {type.label}
        </span>
      </div>

      <div className="flex-1 glass-panel p-4 sm:p-6 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {hasFigure && (
          <div className="flex-1 min-h-[200px] flex items-center justify-center bg-dark-bg/60 rounded-xl border border-dark-border/50 p-2">
            {q.figureUrl ? (
              imgError ? (
                <p className="text-text-secondary text-sm text-center px-4">
                  Chưa có hình trong kho. Chạy <code className="text-neon-blue">npm run figures</code> để tạo.
                </p>
              ) : (
                <FigureViewer src={q.figureUrl} scale={q.figureScale} onError={() => setImgError(true)} />
              )
            ) : q.shapeData ? (
              <QuadFigure data={q.shapeData} />
            ) : (
              q.figure
            )}
          </div>
        )}

        {!INLINE_STEM.has(q.type) && (
          <p className="text-center font-semibold text-base sm:text-lg shrink-0">{q.stem}</p>
        )}

        <Render
          key={`q-${idx}`}
          q={q}
          response={response}
          setResponse={setResponse}
          submitted={submitted}
          result={result}
          eliminated={eliminated}
          onSubmit={submit}
        />

        {retrying && (
          <motion.p
            key={`retry-${tries}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-semibold text-orange-300"
          >
            Chưa đúng rồi — em thử lại lần nữa nhé! 💪
          </motion.p>
        )}

        {hintsShown > 0 && (
          <div className="flex flex-col gap-1.5">
            {q.hints.slice(0, hintsShown).map((h, i) => (
              <p key={i} className="text-sm rounded-lg border border-yellow-400/30 bg-yellow-400/5 px-3 py-2 flex gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                <span>{h}</span>
              </p>
            ))}
          </div>
        )}

        {showRecap && <RecapCard lesson={lesson} />}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {canHint && (
            <button
              onClick={() => setHintsShown((h) => h + 1)}
              className={`${btnSoft} border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10`}
            >
              <Lightbulb className="w-4 h-4" /> {hintsShown ? 'Gợi ý thêm' : 'Gợi ý'}
            </button>
          )}
          {lesson?.recap?.length > 0 && (mode === 'practice' || submitted) && (
            <button
              onClick={() => setShowRecap((v) => !v)}
              className={`${btnSoft} border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10`}
            >
              <BookOpen className="w-4 h-4" /> {showRecap ? 'Ẩn kiến thức' : 'Nhắc lại kiến thức'}
            </button>
          )}
          {!type.autoSubmit && !submitted && (
            <button
              onClick={() => submit()}
              disabled={!type.isAnswered(response)}
              className="px-6 py-2.5 rounded-lg bg-neon-blue/15 border border-neon-blue/40 text-neon-blue font-semibold hover:bg-neon-blue/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          )}
        </div>

        <Feedback
          phase={!submitted ? 'idle' : result.correct ? 'correct' : 'wrong'}
          note={q.explanation}
          onNext={next}
          nextLabel={isLast ? 'Xem kết quả →' : undefined}
        />
      </div>
    </div>
  );
}
