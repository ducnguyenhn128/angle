import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw, Settings2, List, Repeat, BookOpen } from 'lucide-react';
import BackButton from '../components/BackButton';
import QuizRunner from '../quiz/QuizRunner';
import RecapCard from '../quiz/RecapCard';
import { QUESTION_TYPES, LEVELS } from '../quiz/types';
import { grades, lessonById, lessonSize, buildTest, availableCount } from '../quiz/bank';

const COUNTS = [5, 10, 15, 20];
const ALL_TYPES = Object.keys(QUESTION_TYPES);
const LEVEL_LABEL = { NB: 'Nhận biết', TH: 'Thông hiểu', VD: 'Vận dụng', VDC: 'Vận dụng cao' };
const MODES = [
  { id: 'practice', name: 'Luyện tập', desc: 'Sai được làm lại 1 lần, có gợi ý và thẻ kiến thức' },
  { id: 'test', name: 'Kiểm tra', desc: 'Mỗi câu trả lời 1 lần, chấm điểm thang 10' },
];

function Chip({ active, disabled, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-2 rounded-lg border text-sm font-semibold text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-neon-blue/15 border-neon-blue text-neon-blue'
          : 'bg-dark-surface border-dark-border text-text-secondary hover:border-neon-blue/40 hover:text-text-primary',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

const Label = ({ children }) => (
  <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary mb-2">{children}</p>
);

function Setup({ config, setConfig, onStart, onQuit }) {
  const [showRecap, setShowRecap] = useState(false);
  const toggle = (key, v) =>
    setConfig((c) => ({
      ...c,
      [key]: c[key].includes(v) ? c[key].filter((x) => x !== v) : [...c[key], v],
    }));
  const grade = grades.find((g) => g.grade === config.grade) ?? grades[0];
  const avail = availableCount(config);
  const ready = config.lessons.length > 0 && config.types.length > 0 && config.levels.length > 0 && avail > 0;
  const recaps = config.lessons.map((id) => lessonById[id]).filter((l) => l?.recap?.length);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 gap-3 sm:gap-4 max-w-3xl w-full mx-auto">
      <div className="glass-panel p-3 sm:p-4 flex items-center gap-3 shrink-0">
        <BackButton onClick={onQuit} />
        <h2 className="text-lg sm:text-xl font-bold">Luyện tập & kiểm tra theo bài</h2>
      </div>

      <div className="glass-panel p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto">
        <section>
          <Label>Chế độ</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {MODES.map((m) => (
              <Chip key={m.id} active={config.mode === m.id} onClick={() => setConfig((c) => ({ ...c, mode: m.id }))}>
                <span className="block">{m.name}</span>
                <span className="block text-xs font-normal opacity-80 mt-0.5">{m.desc}</span>
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <Label>Bài đã học (SGK Kết nối tri thức)</Label>
          <div className="flex gap-2 mb-3">
            {grades.map((g) => (
              <Chip
                key={g.grade}
                active={config.grade === g.grade}
                onClick={() => setConfig((c) => ({ ...c, grade: g.grade }))}
              >
                {g.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {grade.chapters.map((ch) => (
              <div key={ch.id}>
                <p className="text-sm font-bold mb-1.5">{ch.name}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ch.lessons.map((l) => {
                    const empty = lessonSize(l.id) === 0;
                    return (
                      <Chip
                        key={l.id}
                        disabled={empty}
                        active={config.lessons.includes(l.id)}
                        onClick={() => toggle('lessons', l.id)}
                      >
                        {l.name}
                        {empty && <span className="ml-1 text-xs font-normal">· sắp có</span>}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {recaps.length > 0 && (
          <section className="flex flex-col gap-2">
            <button
              onClick={() => setShowRecap((v) => !v)}
              className="self-start flex items-center gap-1.5 text-sm font-semibold text-neon-blue hover:underline"
            >
              <BookOpen className="w-4 h-4" /> {showRecap ? 'Ẩn kiến thức' : 'Xem lại kiến thức trước khi làm'}
            </button>
            {showRecap && recaps.map((l) => <RecapCard key={l.id} lesson={l} />)}
          </section>
        )}

        <section>
          <Label>Dạng câu hỏi</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((t) => (
              <Chip key={t} active={config.types.includes(t)} onClick={() => toggle('types', t)}>
                {QUESTION_TYPES[t].label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <Label>Mức độ</Label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lv) => (
              <Chip key={lv} active={config.levels.includes(lv)} onClick={() => toggle('levels', lv)}>
                {LEVEL_LABEL[lv]}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <Label>Số câu</Label>
          <div className="flex flex-wrap gap-2">
            {COUNTS.map((n) => (
              <Chip key={n} active={config.count === n} onClick={() => setConfig((c) => ({ ...c, count: n }))}>
                {n} câu
              </Chip>
            ))}
          </div>
          {config.lessons.length > 0 && Number.isFinite(avail) && avail < config.count && (
            <p className="text-xs text-orange-400 mt-2">
              {avail === 0
                ? 'Chưa có câu hỏi nào cho lựa chọn này.'
                : `Ngân hàng mới có ${avail} câu cho lựa chọn này — đề sẽ gồm ${avail} câu.`}
            </p>
          )}
        </section>

        <button
          onClick={onStart}
          disabled={!ready}
          className="self-center px-8 py-3 rounded-xl bg-neon-blue/15 border border-neon-blue/40 text-neon-blue font-bold hover:bg-neon-blue/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Bắt đầu {config.mode === 'practice' ? 'luyện tập' : 'làm bài'}
        </button>
      </div>
    </div>
  );
}

function praise(pct) {
  if (pct >= 90) return 'Xuất sắc! Em nắm bài rất chắc. 🌟';
  if (pct >= 70) return 'Tốt lắm! Xem lại vài câu sai là em vững bài rồi. 👍';
  if (pct >= 50) return 'Khá rồi! Luyện lại các câu sai để tiến bộ thêm nhé. 💪';
  return 'Không sao cả — em xem lại kiến thức rồi luyện lại các câu sai nhé. Cố lên! 🌱';
}

const btnMain = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors';
const btnGhost = `${btnMain} bg-dark-surface border border-dark-border text-text-secondary hover:text-text-primary hover:border-neon-blue/40`;

function Result({ results, onRetryWrong, onRetry, onSetup, onQuit }) {
  const nCorrect = results.filter((r) => r.correct).length;
  const nWrong = results.length - nCorrect;
  const score = Math.round((nCorrect / results.length) * 100) / 10;
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 gap-3 sm:gap-4 max-w-3xl w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-5 text-center shrink-0"
      >
        <p className="text-text-secondary text-sm">Kết quả</p>
        <p className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent my-1">
          {score} / 10
        </p>
        <p className="text-sm">
          Đúng <span className="text-neon-green font-bold">{nCorrect}</span> / {results.length} câu
        </p>
        <p className="text-sm text-text-secondary mt-1">{praise((nCorrect / results.length) * 100)}</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center mt-4">
          {nWrong > 0 && (
            <button onClick={onRetryWrong} className={`${btnMain} bg-orange-400/10 border border-orange-400/40 text-orange-300 hover:bg-orange-400/20`}>
              <Repeat className="w-4 h-4" /> Luyện lại {nWrong} câu sai
            </button>
          )}
          <button onClick={onRetry} className={`${btnMain} bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20`}>
            <RotateCcw className="w-4 h-4" /> Làm đề khác
          </button>
          <button onClick={onSetup} className={btnGhost}>
            <Settings2 className="w-4 h-4" /> Đổi bài
          </button>
          <button onClick={onQuit} className={btnGhost}>
            <List className="w-4 h-4" /> Trang chủ
          </button>
        </div>
      </motion.div>

      <div className="glass-panel p-3 sm:p-4 flex flex-col gap-2 overflow-y-auto">
        {results.map(({ q, correct, tries }, i) => (
          <details key={i} className="rounded-lg border border-dark-border/60 bg-dark-bg/40 px-3 py-2" open={!correct}>
            <summary className="flex items-start gap-2 cursor-pointer text-sm">
              {correct
                ? <Check className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                : <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
              <span className="flex-1">
                <span className="text-text-secondary">Câu {i + 1}. </span>
                {q.stem.replaceAll('{{}}', '___')}
                {correct && tries > 1 && <span className="ml-1 text-xs text-orange-300">(đúng ở lần 2)</span>}
              </span>
            </summary>
            {q.explanation && <p className="text-sm text-text-secondary mt-2 pl-6 leading-relaxed">{q.explanation}</p>}
          </details>
        ))}
      </div>
    </div>
  );
}

export default function LessonTest({ onQuit }) {
  const [config, setConfig] = useState({
    mode: 'practice', grade: 7, lessons: [], types: ALL_TYPES, levels: ['NB', 'TH', 'VD'], count: 10,
  });
  const [stage, setStage] = useState('setup'); // setup | run | result
  const [run, setRun] = useState({ questions: [], mode: 'practice', round: 0 });
  const [results, setResults] = useState([]);

  const launch = (questions, mode) => {
    setRun((r) => ({ questions, mode, round: r.round + 1 }));
    setStage('run');
  };
  const start = () => launch(buildTest(config), config.mode);
  // Câu sai: sinh lại (trộn phương án / số liệu mới) và luyện ở chế độ được làm lại
  const retryWrong = () =>
    launch(results.filter((r) => !r.correct).map(({ q }) => (q.regen ? q.regen() : q)), 'practice');

  if (stage === 'run' && run.questions.length > 0) {
    return (
      <QuizRunner
        key={run.round}
        questions={run.questions}
        mode={run.mode}
        onQuit={() => setStage('setup')}
        onFinish={(res) => {
          setResults(res);
          // Mọi câu đều bị bỏ qua vì lỗi thì không có gì để chấm
          setStage(res.length ? 'result' : 'setup');
        }}
      />
    );
  }

  if (stage === 'result') {
    return (
      <Result
        results={results}
        onRetryWrong={retryWrong}
        onRetry={start}
        onSetup={() => setStage('setup')}
        onQuit={onQuit}
      />
    );
  }

  return <Setup config={config} setConfig={setConfig} onStart={start} onQuit={onQuit} />;
}
