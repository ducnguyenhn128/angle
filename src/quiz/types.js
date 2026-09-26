/**
 * Logic thuần (không JSX) cho từng dạng câu hỏi: validate câu trong ngân hàng,
 * chuẩn bị câu để hiển thị (trộn phương án), và chấm điểm câu trả lời.
 * File này được dùng cả trong app lẫn script `npm run validate-questions`.
 *
 * Câu hỏi trong ngân hàng (src/data/questions/<lesson>.json):
 *   { id, type, lesson, skills?, level?, stem, figure?, hints?, explanation, vars?, where?, ...payload }
 *
 * level: 'NB' | 'TH' | 'VD' | 'VDC' (nhận biết · thông hiểu · vận dụng · vận dụng cao)
 * hints: các gợi ý theo bậc, hiện lần lượt khi HS bấm "Gợi ý"
 *
 * Mẫu câu có tham số: khai báo vars = { a: [từ, đến, bước], ... } rồi dùng trong mọi chuỗi
 *   {a}        → giá trị của a
 *   {=180 - a} → giá trị biểu thức (chỉ + − × : và ngoặc)
 * where (tuỳ chọn): danh sách biểu thức phải khác 0, ví dụ ["a != 90"] — bộ số không thoả thì bốc lại.
 *
 * payload theo dạng:
 *   mcq          options: string[], answer: number, shuffle?: boolean
 *   true-false   answer: boolean
 *   multi-select options: string[], answers: number[], shuffle?: boolean
 *   fill-blank   stem chứa các ô "{{}}", blanks: [{ accept: string[], tol?: number, suffix?: string }]
 *   hotspot      shape (bắt buộc), pick: ('vertex'|'side'|'diagonal'|'angle')[], answers: string[] (mã phần tử)
 *   classify     groups: string[] (2–3 nhóm), items: [{ text?, shape?, group }] (3–8 mục, group = chỉ số nhóm)
 *   match        pairs: [{ left, right }] (2–4 cặp), extra?: string[] (phương án nhiễu bên phải)
 *   order        steps: string[] (3–5 bước, theo đúng thứ tự) — hiển thị bị trộn
 *   find-error   lines: string[] (các dòng lời giải), answer: number (chỉ số dòng sai)
 *
 * retain(rq, response, result) (tuỳ chọn): ở chế độ luyện tập, khi làm lại thì giữ phần đúng, xoá phần sai.
 *
 * shape (tuỳ chọn với mọi dạng): tứ giác vẽ từ dữ liệu — xem src/quiz/shapes.js
 */

import { validateShape, buildShape, elementIds, normId } from './shapes.js';

export const BLANK = '{{}}';
export const LEVELS = ['NB', 'TH', 'VD', 'VDC'];

/* ---------- Mẫu câu có tham số ---------- */

const EXPR_RE = /^[\w\s+\-*/().!=<>&|%]+$/;
const exprCache = new Map();

/** Tính biểu thức số học đơn giản theo bảng biến. Chỉ cho phép tên biến đã khai báo. */
export function evalExpr(expr, env) {
  if (!EXPR_RE.test(expr)) throw new Error(`biểu thức không hợp lệ: ${expr}`);
  const names = Object.keys(env);
  for (const id of expr.match(/[A-Za-z_]\w*/g) || []) {
    if (!names.includes(id)) throw new Error(`biến "${id}" chưa khai báo trong vars`);
  }
  const key = `${names.join(',')}|${expr}`;
  let fn = exprCache.get(key);
  if (!fn) {
    fn = new Function(...names, `return (${expr});`);
    exprCache.set(key, fn);
  }
  const v = fn(...names.map((n) => env[n]));
  if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`biểu thức cho kết quả không hữu hạn: ${expr}`);
  return v;
}

const fmtNum = (v) => (typeof v === 'number' ? String(Math.round(v * 100) / 100) : String(v));

function interpolate(value, env) {
  if (typeof value === 'string') {
    // {a} hoặc {=biểu thức}; "{{}}" (ô trống) không khớp vì bên trong rỗng
    return value.replace(/\{(=?)([^{}]+)\}/g, (m, isExpr, body) => {
      if (isExpr) return fmtNum(evalExpr(body, env));
      return body.trim() in env ? fmtNum(env[body.trim()]) : m;
    });
  }
  if (Array.isArray(value)) return value.map((v) => interpolate(v, env));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolate(v, env)]));
  }
  return value;
}

function sampleVars(vars) {
  const env = {};
  for (const [name, [from, to, step = 1]] of Object.entries(vars)) {
    const n = Math.floor((to - from) / step);
    env[name] = from + step * Math.floor(Math.random() * (n + 1));
  }
  return env;
}

/** Mọi bộ số của vars (null nếu quá nhiều để duyệt hết). */
function allEnvs(vars, limit = 20000) {
  let envs = [{}];
  for (const [name, [from, to, step = 1]] of Object.entries(vars)) {
    const vals = [];
    for (let v = from; v <= to + 1e-9; v += step) vals.push(v);
    if (envs.length * vals.length > limit) return null;
    envs = envs.flatMap((e) => vals.map((v) => ({ ...e, [name]: v })));
  }
  return envs;
}

function fill(q, env) {
  const rest = { ...q };
  delete rest.vars;
  delete rest.where;
  return { ...interpolate(rest, env), vars: env };
}

/** Thay số vào mẫu câu (câu thường thì trả về nguyên vẹn). */
export function instantiate(q) {
  if (!q.vars) return q;
  const where = q.where || [];
  for (let tries = 0; tries < 200; tries++) {
    const env = sampleVars(q.vars);
    if (where.every((w) => evalExpr(w, env))) return fill(q, env);
  }
  throw new Error(`${q.id}: không tìm được bộ số thoả điều kiện where`);
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chuẩn hoá câu trả lời tự luận ngắn: bỏ dấu cách, "°", "độ", chữ "góc", đổi dấu phẩy thập phân. */
export function normalizeAnswer(s) {
  return String(s ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/°|độ|góc|∠|\^/g, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.');
}

const NUM_RE = /^-?\d+(\.\d+)?$/;

export function matchBlank(blank, input) {
  const got = normalizeAnswer(input);
  if (!got) return false;
  return blank.accept.some((acc) => {
    const want = normalizeAnswer(acc);
    if (NUM_RE.test(want) && NUM_RE.test(got)) {
      return Math.abs(Number(want) - Number(got)) <= (blank.tol ?? 0);
    }
    return want === got;
  });
}

/** Trộn phương án, giữ cờ correct theo từng phương án. */
function prepareOptions(q, correctSet) {
  const opts = q.options.map((text, i) => ({ text, correct: correctSet.has(i) }));
  return q.shuffle === false ? opts : shuffleArr(opts);
}

const isIndex = (q, i) => Number.isInteger(i) && i >= 0 && i < (q.options?.length ?? 0);

function checkOptions(q, errs) {
  if (!Array.isArray(q.options) || q.options.length < 2) errs.push('cần ít nhất 2 phương án (options)');
  else if (new Set(q.options).size !== q.options.length) errs.push('có phương án bị trùng');
}

export const QUESTION_TYPES = {
  mcq: {
    label: 'Trắc nghiệm 1 đáp án',
    autoSubmit: true,
    validate(q, errs) {
      checkOptions(q, errs);
      if (!isIndex(q, q.answer)) errs.push('answer phải là chỉ số hợp lệ trong options');
    },
    prepare: (q) => ({ options: prepareOptions(q, new Set([q.answer])) }),
    // response: chỉ số phương án đã chọn (theo thứ tự sau khi trộn)
    grade: (rq, response) => ({ correct: rq.options[response]?.correct === true }),
    isAnswered: (response) => response != null,
  },

  'true-false': {
    label: 'Đúng / Sai',
    autoSubmit: true,
    validate(q, errs) {
      if (typeof q.answer !== 'boolean') errs.push('answer phải là true/false');
    },
    prepare: (q) => ({
      options: [
        { text: 'Đúng', correct: q.answer === true },
        { text: 'Sai', correct: q.answer === false },
      ],
    }),
    grade: (rq, response) => ({ correct: rq.options[response]?.correct === true }),
    isAnswered: (response) => response != null,
  },

  'multi-select': {
    label: 'Chọn nhiều đáp án',
    autoSubmit: false,
    validate(q, errs) {
      checkOptions(q, errs);
      if (!Array.isArray(q.answers) || q.answers.length === 0) errs.push('answers phải là mảng khác rỗng');
      else if (!q.answers.every((i) => isIndex(q, i))) errs.push('answers chứa chỉ số không hợp lệ');
    },
    prepare: (q) => ({ options: prepareOptions(q, new Set(q.answers)) }),
    // response: mảng chỉ số đã chọn — đúng khi chọn đủ và không thừa
    grade: (rq, response = []) => {
      const picked = new Set(response);
      return { correct: rq.options.every((o, i) => o.correct === picked.has(i)) };
    },
    isAnswered: (response) => Array.isArray(response) && response.length > 0,
  },

  'fill-blank': {
    label: 'Điền vào chỗ trống',
    autoSubmit: false,
    validate(q, errs) {
      const holes = (q.stem ?? '').split(BLANK).length - 1;
      if (!Array.isArray(q.blanks) || q.blanks.length === 0) errs.push('cần mảng blanks');
      else {
        if (holes !== q.blanks.length) errs.push(`stem có ${holes} ô ${BLANK} nhưng blanks có ${q.blanks.length} phần tử`);
        q.blanks.forEach((b, i) => {
          if (!Array.isArray(b.accept) || b.accept.length === 0) errs.push(`blanks[${i}].accept phải là mảng khác rỗng`);
        });
      }
    },
    prepare: (q) => ({ blanks: q.blanks }),
    // response: mảng chuỗi, mỗi ô một chuỗi
    grade: (rq, response = []) => {
      const each = rq.blanks.map((b, i) => matchBlank(b, response[i]));
      return { correct: each.every(Boolean), each };
    },
    isAnswered: (response) => Array.isArray(response) && response.some((s) => s && s.trim()),
  },

  hotspot: {
    label: 'Chạm vào hình',
    autoSubmit: false,
    validate(q, errs) {
      if (!q.shape) return errs.push('hotspot cần shape');
      const kinds = ['vertex', 'side', 'diagonal', 'angle'];
      if (!Array.isArray(q.pick) || !q.pick.length || !q.pick.every((k) => kinds.includes(k))) {
        errs.push(`pick phải là mảng con của ${kinds.join(', ')}`);
        return;
      }
      if (q.pick.includes('diagonal') && !(q.shape.marks || []).includes('diagonals')) {
        errs.push('pick có "diagonal" nhưng shape.marks chưa có "diagonals"');
      }
      const ids = new Set(elementIds(q.shape, q.pick));
      if (!Array.isArray(q.answers) || !q.answers.length) errs.push('answers phải là mảng khác rỗng');
      else for (const a of q.answers) if (!ids.has(normId(a))) errs.push(`answers: "${a}" không bấm được với pick hiện tại`);
    },
    prepare: (q) => ({ pick: q.pick, answers: q.answers.map(normId) }),
    // response: mảng mã phần tử đã chọn — đúng khi trùng khớp tập đáp án
    grade: (rq, response = []) => {
      const picked = new Set(response);
      return { correct: picked.size === rq.answers.length && rq.answers.every((a) => picked.has(a)) };
    },
    isAnswered: (response) => Array.isArray(response) && response.length > 0,
  },

  classify: {
    label: 'Phân loại',
    autoSubmit: false,
    validate(q, errs) {
      if (!Array.isArray(q.groups) || q.groups.length < 2 || q.groups.length > 3) errs.push('groups phải có 2–3 nhóm');
      else if (new Set(q.groups).size !== q.groups.length) errs.push('groups có tên nhóm bị trùng');
      if (!Array.isArray(q.items) || q.items.length < 3 || q.items.length > 8) {
        errs.push('items phải có 3–8 mục');
        return;
      }
      q.items.forEach((it, i) => {
        if (!it.text && !it.shape) errs.push(`items[${i}] cần text hoặc shape`);
        if (!Number.isInteger(it.group) || it.group < 0 || it.group >= (q.groups?.length ?? 0)) {
          errs.push(`items[${i}].group phải là chỉ số hợp lệ trong groups`);
        }
        if (it.shape) validateShape(it.shape, errs);
      });
      const texts = q.items.filter((it) => it.text && !it.shape).map((it) => it.text);
      if (new Set(texts).size !== texts.length) errs.push('items có mục bị trùng');
    },
    prepare: (q) => ({
      groups: q.groups,
      items: shuffleArr(q.items.map((it) => ({
        text: it.text ?? '',
        shapeData: it.shape ? buildShape(it.shape) : null,
        group: it.group,
      }))),
    }),
    // response: mảng, phần tử i = chỉ số nhóm HS xếp mục i vào
    grade: (rq, response = []) => {
      const each = rq.items.map((it, i) => response[i] === it.group);
      return { correct: each.every(Boolean), each };
    },
    isAnswered: (response, rq) => Array.isArray(response) && rq.items.every((_, i) => response[i] != null),
    retain: (rq, response, res) => response.map((g, i) => (res.each[i] ? g : null)),
  },

  match: {
    label: 'Ghép nối',
    autoSubmit: false,
    validate(q, errs) {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2 || q.pairs.length > 4) {
        errs.push('pairs phải có 2–4 cặp');
        return;
      }
      if (!q.pairs.every((p) => p.left && p.right)) errs.push('mỗi cặp cần left và right');
      const lefts = q.pairs.map((p) => p.left);
      const rights = [...q.pairs.map((p) => p.right), ...(q.extra ?? [])];
      if (new Set(lefts).size !== lefts.length) errs.push('có vế trái bị trùng');
      if (new Set(rights).size !== rights.length) errs.push('có vế phải (kể cả extra) bị trùng');
    },
    prepare: (q) => ({
      lefts: shuffleArr(q.pairs.map((p, key) => ({ text: p.left, key }))),
      rights: shuffleArr([
        ...q.pairs.map((p, key) => ({ text: p.right, key })),
        ...(q.extra ?? []).map((text) => ({ text, key: -1 })),
      ]),
    }),
    // response: mảng, phần tử i = chỉ số vế phải được ghép với vế trái thứ i
    grade: (rq, response = []) => {
      const each = rq.lefts.map((l, i) => rq.rights[response[i]]?.key === l.key);
      return { correct: each.every(Boolean), each };
    },
    isAnswered: (response, rq) => Array.isArray(response) && rq.lefts.every((_, i) => response[i] != null),
    retain: (rq, response, res) => response.map((r, i) => (res.each[i] ? r : null)),
  },

  order: {
    label: 'Sắp xếp các bước',
    autoSubmit: false,
    validate(q, errs) {
      if (!Array.isArray(q.steps) || q.steps.length < 3 || q.steps.length > 5) errs.push('steps phải có 3–5 bước');
      else if (new Set(q.steps).size !== q.steps.length) errs.push('steps có bước bị trùng');
    },
    prepare: (q) => {
      const steps = q.steps.map((text, pos) => ({ text, pos }));
      let mixed = shuffleArr(steps);
      // Không để thứ tự hiển thị trùng đúng thứ tự đáp án
      while (mixed.every((s, i) => s.pos === i)) mixed = shuffleArr(steps);
      return { steps: mixed };
    },
    // response: mảng chỉ số bước (theo thứ tự hiển thị) mà HS đã xếp, từ bước 1 trở đi
    grade: (rq, response = []) => {
      const each = rq.steps.map((_, i) => rq.steps[response[i]]?.pos === i);
      return { correct: each.every(Boolean), each };
    },
    isAnswered: (response, rq) => Array.isArray(response) && response.length === rq.steps.length,
    // Giữ lại các bước đúng liên tiếp từ đầu
    retain: (rq, response, res) => {
      const k = res.each.indexOf(false);
      return response.slice(0, k < 0 ? response.length : k);
    },
  },

  'find-error': {
    label: 'Tìm bước sai',
    autoSubmit: true,
    validate(q, errs) {
      if (!Array.isArray(q.lines) || q.lines.length < 2 || q.lines.length > 5) errs.push('lines phải có 2–5 dòng');
      else if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.lines.length)) {
        errs.push('answer phải là chỉ số hợp lệ trong lines');
      }
    },
    // Giữ nguyên thứ tự các dòng lời giải
    prepare: (q) => ({ options: q.lines.map((text, i) => ({ text, correct: i === q.answer })) }),
    grade: (rq, response) => ({ correct: rq.options[response]?.correct === true }),
    isAnswered: (response) => response != null,
  },
};

function validateConcrete(q, errs) {
  if (q.shape) validateShape(q.shape, errs);
  const type = QUESTION_TYPES[q.type];
  if (!type) errs.push(`dạng câu "${q.type}" chưa được hỗ trợ`);
  else type.validate(q, errs);
}

/** Trả về danh sách lỗi của một câu trong ngân hàng (rỗng = hợp lệ). */
export function validateQuestion(q, lessonIds) {
  const errs = [];
  if (!q.id) errs.push('thiếu id');
  if (!q.stem) errs.push('thiếu stem');
  if (!q.explanation) errs.push('thiếu explanation');
  if (lessonIds && !lessonIds.has(q.lesson)) errs.push(`lesson "${q.lesson}" không có trong lessons.json`);
  if (q.level != null && !LEVELS.includes(q.level)) errs.push(`level phải là một trong ${LEVELS.join(', ')}`);
  if (q.hints != null && !(Array.isArray(q.hints) && q.hints.every((h) => typeof h === 'string'))) {
    errs.push('hints phải là mảng chuỗi');
  }
  if (!q.vars) {
    validateConcrete(q, errs);
    return errs;
  }
  // Mẫu câu: thử thay số nhiều lần, mỗi lần phải ra một câu hợp lệ
  const bad = Object.entries(q.vars).filter(([, r]) => !(Array.isArray(r) && r.length >= 2 && r.every(Number.isFinite)));
  if (bad.length) {
    errs.push(`vars ${bad.map(([k]) => k).join(', ')} phải có dạng [từ, đến, bước]`);
    return errs;
  }
  // Duyệt hết các bộ số nếu không quá nhiều, ngược lại thử ngẫu nhiên 300 bộ
  const where = q.where || [];
  let envs;
  try {
    envs = (allEnvs(q.vars) ?? Array.from({ length: 300 }, () => sampleVars(q.vars)))
      .filter((env) => where.every((w) => evalExpr(w, env)));
  } catch (e) {
    errs.push(e.message);
    return errs;
  }
  if (!envs.length) errs.push('không có bộ số nào thoả điều kiện where');
  const seen = new Set();
  for (const env of envs) {
    let inst;
    try {
      inst = fill(q, env);
    } catch (e) {
      errs.push(e.message);
      break;
    }
    const sub = [];
    validateConcrete(inst, sub);
    for (const e of sub) {
      if (!seen.has(e)) errs.push(`với ${JSON.stringify(env)}: ${e}`);
      seen.add(e);
    }
    const texts = [inst.stem, inst.options, inst.explanation, inst.items, inst.pairs, inst.steps, inst.lines];
    if (/\{=?[^{}]+\}/.test(JSON.stringify(texts).replaceAll(BLANK, ''))) {
      errs.push('còn biến chưa được thay (kiểm tra tên biến trong {…})');
      break;
    }
  }
  return errs;
}

/** Chuyển câu trong ngân hàng thành câu chạy được (đã trộn phương án). */
export function prepareQuestion(src) {
  const q = instantiate(src);
  return {
    id: q.id,
    type: q.type,
    lesson: q.lesson,
    level: q.level,
    stem: q.stem,
    figureUrl: q.figure ? `/figures/${q.figure}.svg` : null,
    shapeData: q.shape ? buildShape(q.shape) : null,
    hints: q.hints ?? [],
    explanation: q.explanation,
    ...QUESTION_TYPES[q.type].prepare(q),
    // để "Luyện lại câu sai" sinh lại câu (trộn phương án / số liệu mới)
    regen: () => prepareQuestion(src),
  };
}

/** Bọc câu MCQ do generator cũ sinh ra ({ text, options[{label, correct}], note, figure|figureUrl }). */
export function fromLegacy(lq, lesson, gen) {
  return {
    id: lq.qid || lq.key,
    type: 'mcq',
    lesson,
    stem: lq.text,
    figure: lq.figure,
    figureUrl: lq.figureUrl ?? null,
    figureScale: lq.figureScale,
    explanation: lq.note,
    options: lq.options.map((o) => ({ text: o.label, correct: o.correct })),
    hints: [],
    regen: gen ? () => fromLegacy(gen(), lesson, gen) : null,
  };
}
