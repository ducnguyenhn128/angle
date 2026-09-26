import { Fragment, useState } from 'react';
import { Check, X, ArrowDown } from 'lucide-react';
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

function MultiChoice({ q, response: raw, setResponse, submitted }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
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
function FillBlank({ q, response: raw, setResponse, submitted, result, onSubmit }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
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
function Hotspot({ q, response: raw, setResponse, submitted, onSubmit }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
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

/** Viền/màu thẻ theo kết quả chấm từng phần (classify, match, order). */
function partClass(submitted, ok) {
  if (!submitted) return 'border-dark-border bg-dark-surface';
  return ok ? 'border-neon-green bg-neon-green/10' : 'border-red-500 bg-red-500/10';
}

const Mark = ({ ok }) => (ok
  ? <Check className="w-4 h-4 text-neon-green shrink-0" />
  : <X className="w-4 h-4 text-red-400 shrink-0" />);

/** Phân loại: dưới mỗi mục có các nút nhóm, chạm để xếp mục vào nhóm (chạm lại để bỏ). */
function Classify({ q, response: raw, setResponse, submitted, result }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
  const setAt = (i, g) => {
    const next = q.items.map((_, j) => response[j] ?? null);
    next[i] = next[i] === g ? null : g;
    setResponse(next);
  };
  const done = q.items.filter((_, i) => response[i] != null).length;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-neon-blue font-semibold text-center -mt-1">
        Chạm chọn nhóm cho từng mục{' '}
        <span className="text-text-secondary font-normal">(đã xếp {done}/{q.items.length})</span>
      </p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {q.items.map((it, i) => {
          const ok = submitted && result.each[i];
          return (
            <div key={i} className={`rounded-xl border p-3 flex flex-col gap-2 ${partClass(submitted, ok)}`}>
              <div className="flex items-start gap-2">
                {it.shapeData ? (
                  <div className="flex-1 max-w-[200px] mx-auto">
                    <QuadFigure data={it.shapeData} />
                  </div>
                ) : (
                  <p className="flex-1 font-semibold">{it.text}</p>
                )}
                {submitted && <Mark ok={ok} />}
              </div>
              {it.shapeData && it.text && <p className="text-sm text-center">{it.text}</p>}
              <div className="flex flex-wrap gap-1.5">
                {q.groups.map((g, gi) => {
                  const picked = response[i] === gi;
                  const right = submitted && it.group === gi;
                  return (
                    <button
                      key={g}
                      disabled={submitted}
                      onClick={() => setAt(i, gi)}
                      className={[
                        'flex-1 min-w-[6rem] px-2 py-1.5 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-default',
                        right
                          ? 'border-neon-green text-neon-green bg-neon-green/10'
                          : picked
                            ? submitted
                              ? 'border-red-500 text-red-400 bg-red-500/10 line-through'
                              : 'border-neon-blue text-neon-blue bg-neon-blue/15'
                            : 'border-dark-border text-text-secondary hover:border-neon-blue/50',
                      ].join(' ')}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Ghép nối: chạm một ô bên phải của dòng (mặc định là ô trống đầu tiên) rồi chạm phương án bên dưới. */
function Match({ q, response: raw, setResponse, submitted, result }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
  const [active, setActive] = useState(null);
  const firstEmpty = q.lefts.findIndex((_, i) => response[i] == null);
  const target = active ?? (firstEmpty >= 0 ? firstEmpty : null);
  const current = q.lefts.map((_, i) => response[i] ?? null);

  const tapSlot = (i) => {
    if (current[i] != null) {
      const next = [...current];
      next[i] = null;
      setResponse(next);
    }
    setActive(i);
  };
  const tapRight = (ri) => {
    if (target == null) return;
    // Mỗi phương án chỉ ghép một lần: bỏ khỏi ô cũ nếu đã dùng
    const next = current.map((r) => (r === ri ? null : r));
    next[target] = ri;
    setResponse(next);
    setActive(null);
  };
  const used = new Set(current.filter((r) => r != null));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {q.lefts.map((l, i) => {
          const r = current[i];
          const ok = submitted && result.each[i];
          const isTarget = !submitted && target === i;
          return (
            <div key={l.key} className={`rounded-xl border p-2.5 ${partClass(submitted, ok)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="sm:flex-1 font-semibold">{l.text}</p>
                <div className="sm:w-1/2 flex items-center gap-2">
                  <button
                    disabled={submitted}
                    onClick={() => tapSlot(i)}
                    className={[
                      'flex-1 min-h-[2.5rem] px-3 py-2 rounded-lg border-2 text-sm text-left transition-colors disabled:cursor-default',
                      isTarget ? 'border-neon-blue bg-neon-blue/10' : 'border-dark-border',
                      r != null ? 'font-semibold' : 'border-dashed text-text-secondary',
                    ].join(' ')}
                  >
                    {r != null ? q.rights[r].text : isTarget ? 'Chạm phương án bên dưới…' : 'Chạm để chọn ô này'}
                  </button>
                  {submitted && <Mark ok={ok} />}
                </div>
              </div>
              {submitted && !ok && (
                <p className="text-xs text-neon-green mt-1.5">
                  Đáp án: {q.rights.find((x) => x.key === l.key)?.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!submitted && (
        <div className="flex flex-wrap gap-2 justify-center">
          {q.rights.map((x, ri) => (
            <button
              key={x.text}
              onClick={() => tapRight(ri)}
              className={[
                'px-3 py-2 rounded-lg border text-sm font-semibold transition-colors',
                used.has(ri)
                  ? 'border-dark-border/50 text-text-secondary/50 bg-dark-surface/40'
                  : 'border-neon-blue/40 text-text-primary bg-dark-surface hover:bg-neon-blue/10 active:scale-95',
              ].join(' ')}
            >
              {x.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Sắp xếp các bước: chạm lần lượt các bước theo thứ tự; chạm bước đã xếp để bỏ ra. */
function Order({ q, response: raw, setResponse, submitted, result }) {
  // Câu mới bắt đầu với response = null (giá trị mặc định của tham số không áp dụng cho null)
  const response = raw ?? [];
  const remaining = q.steps.map((_, i) => i).filter((i) => !response.includes(i));
  const sorted = [...q.steps].sort((a, b) => a.pos - b.pos);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {q.steps.map((_, pos) => {
          const si = response[pos];
          const filled = si != null;
          const ok = submitted && result.each[pos];
          return (
            <button
              key={pos}
              disabled={submitted || !filled}
              onClick={() => setResponse(response.filter((x) => x !== si))}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default',
                filled ? partClass(submitted, ok) : 'border-dashed border-dark-border text-text-secondary',
                !submitted && filled ? 'hover:border-red-400/60' : '',
              ].join(' ')}
            >
              <span className="w-7 h-7 rounded-full border border-neon-blue/50 text-neon-blue text-sm font-bold flex items-center justify-center shrink-0">
                {pos + 1}
              </span>
              <span className="flex-1 font-semibold">{filled ? q.steps[si].text : '…'}</span>
              {submitted && filled && <Mark ok={ok} />}
              {!submitted && filled && <X className="w-4 h-4 text-text-secondary shrink-0" />}
            </button>
          );
        })}
      </div>
      {!submitted && remaining.length > 0 && (
        <>
          <p className="text-sm text-neon-blue font-semibold text-center flex items-center justify-center gap-1">
            <ArrowDown className="w-4 h-4" /> Chạm chọn bước {response.length + 1}
          </p>
          <div className="flex flex-col gap-1.5">
            {remaining.map((i) => (
              <button
                key={i}
                onClick={() => setResponse([...response, i])}
                className="px-3 py-2.5 rounded-xl border border-dark-border bg-dark-surface text-left font-semibold hover:border-neon-blue/50 hover:bg-neon-blue/5 active:scale-[0.98] transition-all"
              >
                {q.steps[i].text}
              </button>
            ))}
          </div>
        </>
      )}
      {submitted && !result.correct && (
        <div className="text-sm text-text-secondary">
          <p className="font-semibold text-neon-green mb-1">Thứ tự đúng:</p>
          <ol className="list-decimal pl-6 flex flex-col gap-0.5">
            {sorted.map((s) => <li key={s.pos}>{s.text}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

/** Tìm bước sai: các dòng lời giải giữ nguyên thứ tự, chạm vào dòng sai là chấm luôn. */
function FindError({ q, response, submitted, eliminated = [], onSubmit }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neon-blue font-semibold text-center -mt-1">Chạm vào dòng SAI đầu tiên trong lời giải</p>
      {q.options.map((opt, i) => (
        <button
          key={i}
          disabled={submitted || eliminated.includes(i)}
          onClick={() => onSubmit(i)}
          className={[
            'flex items-start gap-3 px-4 py-3 rounded-xl border text-left font-semibold transition-all duration-200 disabled:cursor-default',
            !submitted && eliminated.includes(i)
              ? 'bg-dark-surface/40 border-red-500/30 text-red-400/60 line-through'
              : optionClass({ submitted, selected: response === i, correct: opt.correct }),
          ].join(' ')}
        >
          <span className="text-xs font-bold opacity-70 mt-1 shrink-0 w-12">Dòng {i + 1}</span>
          <span className="flex-1">{opt.text}</span>
        </button>
      ))}
    </div>
  );
}

export const RENDERERS = {
  mcq: SingleChoice,
  'true-false': SingleChoice,
  'multi-select': MultiChoice,
  'fill-blank': FillBlank,
  hotspot: Hotspot,
  classify: Classify,
  match: Match,
  order: Order,
  'find-error': FindError,
};

/** Dạng tự vẽ hình bên trong renderer (runner không vẽ hình riêng). */
export const OWN_FIGURE = new Set(['hotspot']);

/** Dạng tự hiển thị stem bên trong renderer (không cần runner in stem riêng). */
export const INLINE_STEM = new Set(['fill-blank']);
