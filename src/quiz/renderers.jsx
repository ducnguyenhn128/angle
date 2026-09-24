import { Fragment } from 'react';
import { Check, X } from 'lucide-react';
import { BLANK } from './types';
import QuadFigure from '../components/QuadFigure';

/**
 * Mỗi renderer nhận: { q, response, setResponse, submitted, result, onSubmit }
 * - response/setResponse: câu trả lời hiện tại (định dạng theo types.js)
 * - submitted/result: sau khi chấm, result = { correct, each? }
 * - onSubmit(response): dạng autoSubmit gọi ngay khi chọn
 * - eliminated: chỉ số phương án đã chọn sai ở lần trước (chế độ luyện tập)
 */

function optionClass({ submitted, selected, correct }) {
  if (submitted && correct) return 'bg-neon-green/15 border-neon-green text-neon-green';
  if (submitted && selected) return 'bg-red-500/15 border-red-500 text-red-400';
  if (submitted) return 'bg-dark-surface/60 border-dark-border text-text-secondary';
  if (selected) return 'bg-neon-blue/10 border-neon-blue text-text-primary';
  return 'bg-dark-surface border-dark-border text-text-primary hover:border-neon-blue/50 hover:bg-neon-blue/5 active:scale-95';
}

/** Trắc nghiệm 1 đáp án & Đúng/Sai: bấm là chấm luôn. */
function SingleChoice({ q, response, submitted, eliminated = [], onSubmit }) {
  const long = q.options.some((o) => o.text.length > 24);
  return (
    <div className={`grid gap-3 ${long ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {q.options.map((opt, i) => (
        <button
          key={opt.text}
          disabled={submitted || eliminated.includes(i)}
          onClick={() => onSubmit(i)}
          className={[
            'px-4 py-3 sm:py-3.5 rounded-xl border font-semibold text-base transition-all duration-200 disabled:cursor-default',
            long ? 'text-left' : 'text-center sm:text-lg',
            !submitted && eliminated.includes(i)
              ? 'bg-dark-surface/40 border-red-500/30 text-red-400/60 line-through'
              : optionClass({ submitted, selected: response === i, correct: opt.correct }),
          ].join(' ')}
        >
          {opt.text}
        </button>
      ))}
    </div>
  );
}

function MultiChoice({ q, response = [], setResponse, submitted }) {
  const need = q.options.filter((o) => o.correct).length;
  const toggle = (i) =>
    setResponse(response.includes(i) ? response.filter((x) => x !== i) : [...response, i]);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-neon-blue font-semibold text-center -mt-1">
        Chọn {need} đáp án <span className="text-text-secondary font-normal">(đã chọn {response.length}/{need})</span>
      </p>
      {q.options.map((opt, i) => {
        const selected = response.includes(i);
        return (
          <button
            key={opt.text}
            disabled={submitted}
            onClick={() => toggle(i)}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-left transition-all duration-200 disabled:cursor-default',
              optionClass({ submitted, selected, correct: opt.correct }),
            ].join(' ')}
          >
            <span
              className={[
                'w-5 h-5 rounded border flex items-center justify-center shrink-0',
                selected ? 'bg-neon-blue border-neon-blue text-dark-bg' : 'border-dark-border',
              ].join(' ')}
            >
              {selected && <Check className="w-4 h-4" strokeWidth={3} />}
            </span>
            <span className="flex-1">{opt.text}</span>
            {submitted && opt.correct !== selected && (
              <span className="text-xs font-medium shrink-0">{opt.correct ? 'thiếu' : 'thừa'}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Điền vào chỗ trống: hiển thị stem kèm ô nhập tại vị trí {{}}. */
function FillBlank({ q, response = [], setResponse, submitted, result, onSubmit }) {
  const parts = q.stem.split(BLANK);
  const setAt = (i, v) => {
    const next = [...response];
    next[i] = v;
    setResponse(next);
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center font-semibold text-base sm:text-lg leading-loose">
        {parts.map((text, i) => (
          <Fragment key={i}>
            {text}
            {i < parts.length - 1 && (
              <span className="inline-flex items-center gap-1 align-middle mx-1">
                <input
                  value={response[i] ?? ''}
                  disabled={submitted}
                  autoFocus={i === 0}
                  inputMode="decimal"
                  onChange={(e) => setAt(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  aria-label={`Ô trống ${i + 1}`}
                  className={[
                    'w-20 px-2 py-1 rounded-lg border bg-dark-bg text-center font-bold outline-none',
                    submitted
                      ? result.each[i]
                        ? 'border-neon-green text-neon-green'
                        : 'border-red-500 text-red-400'
                      : 'border-dark-border focus:border-neon-blue',
                  ].join(' ')}
                />
                {submitted && (result.each[i]
                  ? <Check className="w-4 h-4 text-neon-green" />
                  : <X className="w-4 h-4 text-red-400" />)}
              </span>
            )}
          </Fragment>
        ))}
      </p>
      {submitted && !result.correct && (
        <p className="text-center text-sm text-text-secondary">
          Đáp án: {q.blanks.map((b) => b.accept[0]).join(' · ')}
        </p>
      )}
    </div>
  );
}

const PICK_WORD = { vertex: 'đỉnh', side: 'cạnh', diagonal: 'đường chéo', angle: 'góc' };

/** Chạm vào hình: chọn đỉnh / cạnh / đường chéo / góc trên tứ giác. Chỉ 1 đáp án thì chạm là chấm luôn. */
function Hotspot({ q, response = [], setResponse, submitted, onSubmit }) {
  const need = q.answers.length;
  const onPick = (id) => {
    if (need === 1) {
      onSubmit([id]);
      return;
    }
    setResponse(response.includes(id) ? response.filter((x) => x !== id) : [...response, id]);
  };
  const states = {};
  if (submitted) {
    for (const id of response) states[id] = q.answers.includes(id) ? 'correct' : 'wrong';
    for (const id of q.answers) states[id] = 'correct';
  } else {
    for (const id of response) states[id] = 'selected';
  }
  const what = q.pick.map((k) => PICK_WORD[k]).join(' / ');
  return (
    <div className="flex flex-col gap-2">
      <div className="min-h-[200px] flex items-center justify-center bg-dark-bg/60 rounded-xl border border-dark-border/50 p-2">
        <QuadFigure data={q.shapeData} pick={q.pick} states={states} onPick={onPick} disabled={submitted} />
      </div>
      <p className="text-sm text-neon-blue font-semibold text-center">
        {need === 1
          ? `Chạm vào ${what} đúng trên hình`
          : <>Chạm chọn {need} {what} <span className="text-text-secondary font-normal">(đã chọn {response.length}/{need} — chạm lần nữa để bỏ chọn)</span></>}
      </p>
      {submitted && (
        <p className="text-center text-sm text-text-secondary">Đáp án: {q.answers.join(', ')}</p>
      )}
    </div>
  );
}

export const RENDERERS = {
  mcq: SingleChoice,
  'true-false': SingleChoice,
  'multi-select': MultiChoice,
  'fill-blank': FillBlank,
  hotspot: Hotspot,
};

/** Dạng tự vẽ hình bên trong renderer (runner không vẽ hình riêng). */
export const OWN_FIGURE = new Set(['hotspot']);

/** Dạng tự hiển thị stem bên trong renderer (không cần runner in stem riêng). */
export const INLINE_STEM = new Set(['fill-blank']);
