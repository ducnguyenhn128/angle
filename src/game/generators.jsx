import AngleFigure from '../components/AngleFigure';
import AngleCompareFigure from '../components/AngleCompareFigure';
import BisectorPickFigure from '../components/BisectorPickFigure';
import { PerpFromPointFigure, PerpFourLinesFigure } from '../components/PerpendicularPickFigure';
import IntersectLinesFigure from '../components/IntersectLinesFigure';
import manifest from '../data/figures-manifest.json';

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let seq = 0;
const uid = (p) => `${p}-${Date.now()}-${seq++}`;

/* ---------- Cấp độ 1: Nhận biết loại góc ---------- */
export function makeLevel1Question() {
  const r = Math.random();
  let deg;
  let type;
  if (r < 0.42) {
    deg = randInt(15, 80);
    type = 'Góc nhọn';
  } else if (r < 0.6) {
    deg = 90;
    type = 'Góc vuông';
  } else if (r < 0.82) {
    deg = randInt(100, 170);
    type = 'Góc tù';
  } else {
    deg = 180;
    type = 'Góc bẹt';
  }

  let rotate = 0;
  if (deg < 90) rotate = randInt(-25, 25);
  else if (deg < 170) rotate = randInt(-12, 12);

  return {
    key: uid('L1'),
    figure: <AngleFigure degrees={deg} rotate={rotate} />,
    text: 'Góc xOy trong hình là góc gì?',
    options: shuffle(
      ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'].map((label) => ({
        label,
        correct: label === type,
      })),
    ),
    note: `Số đo góc xOy bằng ${deg}° nên là ${type.toLowerCase()}.${
      deg === 90 ? '' : deg < 90 ? ' (0° < góc nhọn < 90°)' : deg < 180 ? ' (90° < góc tù < 180°)' : ' (Góc bẹt = 180°)'
    }`,
  };
}

/* ---------- Cấp độ 2: Ước lượng số đo góc ---------- */
export function makeLevel2Question(difficulty = 'easy') {
  const deg = 5 * randInt(3, 35);
  const spread = difficulty === 'easy' ? randInt(25, 55) : randInt(6, 15);

  const used = new Set([deg]);
  const offs = shuffle([spread, -spread, 2 * spread, -2 * spread, 3 * spread, -3 * spread]);
  const dist = [];
  for (const o of offs) {
    const v = 5 * Math.round((deg + o) / 5);
    if (v >= 10 && v <= 175 && !used.has(v)) {
      used.add(v);
      dist.push(v);
    }
    if (dist.length === 3) break;
  }
  let bump = 5;
  while (dist.length < 3) {
    const v = deg + bump;
    if (v >= 10 && v <= 175 && !used.has(v)) {
      used.add(v);
      dist.push(v);
    }
    bump += 5;
    if (bump > 200) break;
  }

  const values = shuffle([deg, ...dist]);
  return {
    key: uid(difficulty === 'hard' ? 'L2hard' : 'L2'),
    figure: <AngleFigure degrees={deg} rotate={0} />,
    text: 'Số đo của góc xOy gần nhất với số nào?',
    options: values.map((v) => ({ label: `${v}°`, correct: v === deg })),
    note: `Góc xOy có số đo đúng bằng ${deg}°.`,
  };
}

/* ---------- Các cấp độ dùng kho hình ---------- */
const usedMap = new Map();

export function makeBankQuestion(topic) {
  const pool = manifest[topic] || [];
  if (pool.length === 0) {
    return {
      key: uid('empty'),
      figureUrl: null,
      text: 'Kho hình cho cấp độ này chưa có dữ liệu. Hãy chạy "npm run figures" để tạo hình.',
      options: [{ label: 'Đã hiểu', correct: true }],
      note: null,
    };
  }
  let used = usedMap.get(topic);
  if (!used || used.size >= pool.length) {
    used = new Set();
    usedMap.set(topic, used);
  }
  let entry;
  do {
    entry = pool[randInt(0, pool.length - 1)];
  } while (used.has(entry.id));
  used.add(entry.id);

  return {
    key: uid(`bank-${topic}`),
    qid: `${topic}-${entry.id}`,
    figureUrl: `/figures/${topic}/${entry.file}.svg`,
    text: entry.question,
    options: shuffle(
      entry.options.map((label, i) => ({ label, correct: i === entry.answer })),
    ),
    note: entry.note,
  };
}

export function makeBankFigure(topic) {
  const pool = manifest[topic] || [];
  let used = usedMap.get(topic);
  if (!used || used.size >= pool.length) {
    used = new Set();
    usedMap.set(topic, used);
  }
  let entry;
  do {
    entry = pool[randInt(0, pool.length - 1)];
  } while (used.has(entry.id));
  used.add(entry.id);
  return {
    key: uid(`bank-${topic}`),
    qid: `${topic}-${entry.id}`,
    figureUrl: `/figures/${topic}/${entry.file}.svg`,
    title: entry.title || null,
    note: entry.note || null,
  };
}

/* ========== Level 8: So sánh góc ========== */

const LABEL_PAIRS = [
  { r1: 'a', v: 'O', r2: 'b' },
  { r1: 'c', v: 'O', r2: 'd' },
  { r1: 'x', v: 'O', r2: 'y' },
  { r1: 'u', v: 'O', r2: 'v' },
  { r1: 'm', v: 'A', r2: 'n' },
  { r1: 'p', v: 'A', r2: 'q' },
];

/* ---------- 8a: So sánh 2 góc ---------- */
function makeCompareAnglesQuestion() {
  const deg1 = 5 * randInt(5, 32);
  let deg2 = 5 * randInt(5, 32);
  while (Math.abs(deg1 - deg2) < 15) {
    deg2 = 5 * randInt(5, 32);
  }

  const pairs = shuffle([...LABEL_PAIRS]);
  const labels1 = pairs[0];
  const labels2 = pairs[1];

  const rotate1 = randInt(-30, 30);
  const rotate2 = randInt(-30, 30);

  const bigger = deg1 > deg2 ? deg1 : deg2;
  const smaller = deg1 > deg2 ? deg1 : deg2;
  const askBigger = Math.random() < 0.5;
  const askDeg = askBigger ? bigger : smaller;
  const askLabels = askDeg === deg1 ? labels1 : labels2;
  const otherLabels = askDeg === deg1 ? labels2 : labels1;
  const word = askBigger ? 'lớn hơn' : 'nhỏ hơn';

  return {
    key: uid('L8-compare'),
    figure: (
      <AngleCompareFigure
        deg1={deg1} deg2={deg2}
        labels1={labels1} labels2={labels2}
        rotate1={rotate1} rotate2={rotate2}
      />
    ),
    text: `Góc nào ${word}?`,
    options: shuffle([
      { label: `Góc ${askLabels.r1}${askLabels.v}${askLabels.r2}`, correct: true },
      { label: `Góc ${otherLabels.r1}${otherLabels.v}${otherLabels.r2}`, correct: false },
    ]),
    note: `Góc ${labels1.r1}${labels1.v}${labels1.r2} = ${deg1}°, góc ${labels2.r1}${labels2.v}${labels2.r2} = ${deg2}° → ${askLabels.r1}${askLabels.v}${askLabels.r2} ${word} (${askDeg}°).`,
  };
}

/* ---------- 8b: Tia nào là tia phân giác ---------- */
function makeBisectorPickQuestion() {
  const deg = 5 * randInt(14, 26); // 70..130
  const correctFrac = 0.5;
  const delta1 = 0.18 + Math.random() * 0.12; // 0.18..0.30
  let d2 = 0.18 + Math.random() * 0.12;
  while (Math.abs(d2 - delta1) < 0.08) {
    d2 = 0.18 + Math.random() * 0.12;
  }

  const fracs = [
    correctFrac,
    Math.min(0.88, correctFrac + delta1),
    Math.max(0.12, correctFrac - d2),
  ];
  const names = ['z', 't', 'u'];
  // shuffle
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fracs[i], fracs[j]] = [fracs[j], fracs[i]];
    [names[i], names[j]] = [names[j], names[i]];
  }
  const correctIdx = fracs.indexOf(correctFrac);

  const options = names.map((n) => ({
    label: `Tia O${n}`,
    correct: false,
  }));
  options[correctIdx].correct = true;

  return {
    key: uid('L8-bisector'),
    figure: (
      <BisectorPickFigure deg={deg} fracs={fracs} correctIdx={correctIdx} rayNames={names} />
    ),
    text: 'Tia nào là tia phân giác của góc xOy?',
    options: shuffle(options),
    note: `Tia phân giác chia góc xOy thành hai phần bằng nhau (${deg}° : 2 = ${deg / 2}°). Tia O${names[correctIdx]} nằm chính giữa nên là tia phân giác.`,
  };
}

/* ---------- 8c: Đường vuông góc ---------- */
function makePerpPickQuestion() {
  const variant = Math.random() < 0.5 ? 'A' : 'B';

  if (variant === 'A') {
    // Từ điểm M kẻ 4 đoạn xuống d, đúng 1 vuông góc — tên điểm uppercase
    const ptNames = shuffle(['A', 'B', 'C', 'H', 'K', 'E', 'P']);
    const perpIdx = randInt(0, 3);
    const angles = [0, 0, 0, 0];
    const segNames = ptNames.slice(0, 4);
    for (let i = 0; i < 4; i++) {
      if (i === perpIdx) {
        angles[i] = 90;
      } else {
        angles[i] = 55 + randInt(0, 20); // 55°–75° (nghiêng rõ)
        if (angles[i] >= 90) angles[i] -= 40;
      }
    }
    return {
      key: uid(`L8-perp${variant}`),
      figure: <PerpFromPointFigure footAngles={angles} names={segNames} />,
      text: 'Đoạn thẳng nào vuông góc với đường thẳng d?',
      options: shuffle(segNames.map((n, i) => ({
        label: `Đoạn M${n}`,
        correct: i === perpIdx,
      }))),
      note: `Đoạn M${segNames[perpIdx]} vuông góc với d (có ký hiệu góc vuông tại chân). Đoạn vuông góc là đoạn ngắn nhất từ M xuống d.`,
    };
  }

  // Variant B: 4 đường cắt d, 3 vuông góc, 1 xiên — tên đường lowercase
  const lineNames = shuffle(['a', 'b', 'c', 'e', 'm', 'n']).slice(0, 4);
  const slantIdx = randInt(0, 3);
  const angles = [90, 90, 90, 90];
  angles[slantIdx] = 55 + randInt(0, 25); // 55°–80°
  if (angles[slantIdx] >= 90) angles[slantIdx] -= 35;

  return {
    key: uid(`L8-perp${variant}`),
    figure: <PerpFourLinesFigure angles={angles} names={lineNames} slantIdx={slantIdx} />,
    text: 'Đường thẳng nào KHÔNG vuông góc với d?',
    options: shuffle(lineNames.map((n, i) => ({
      label: `Đường thẳng ${n}`,
      correct: i === slantIdx,
    }))),
    note: `Đường ${lineNames[slantIdx]} không vuông góc với d vì không có ký hiệu góc vuông (${angles[slantIdx]}° ≠ 90°). Ba đường còn lại đều có ký hiệu vuông góc.`,
  };
}

/* ---------- 8d: Góc kề bù / đối đỉnh ---------- */
function makeSupplementVerticalQuestion() {
  const x = 5 * randInt(6, 30); // 30°–150°, bước 5
  const isDoiDinh = Math.random() < 0.5;
  const askDeg = isDoiDinh ? x : 180 - x;

  const wrong1 = 180 - x;
  const wrong2 = x / 2;
  const wrong3 = 90 - Math.round(x / 10) * 10;
  const candidates = new Set([askDeg, wrong1, wrong2, wrong3].filter((v) => v >= 10 && v <= 170 && v !== askDeg));
  const extra = shuffle([...candidates]).slice(0, 3);
  while (extra.length < 3) {
    const v = 10 + randInt(0, 16);
    if (v !== askDeg && !extra.includes(v)) extra.push(v);
  }

  const options = shuffle([
    { label: `${askDeg}°`, correct: true },
    ...extra.slice(0, 3).map((v) => ({ label: `${v}°`, correct: false })),
  ]);

  return {
    key: uid('L8-kubu'),
    figure: (
      <IntersectLinesFigure givenAngle={x} />
    ),
    text: isDoiDinh
      ? `Hai đường thẳng cắt nhau tại O, góc O₁ = ${x}°. Góc O₂ (đối đỉnh O₁) bằng bao nhiêu?`
      : `Hai đường thẳng cắt nhau tại O, góc O₁ = ${x}°. Góc O₃ (kề bù với O₁) bằng bao nhiêu?`,
    options,
    note: isDoiDinh
      ? `Hai góc đối đỉnh luôn bằng nhau: O₂ = O₁ = ${x}°.`
      : `Hai góc kề bù có tổng bằng 180°: O₃ = 180° − ${x}° = ${180 - x}°.`,
  };
}

/* ---------- 8: Level tổng hợp ---------- */
export function makeLevel8Question() {
  const r = Math.random();
  if (r < 0.28) return makeCompareAnglesQuestion();
  if (r < 0.56) return makeBisectorPickQuestion();
  if (r < 0.78) return makePerpPickQuestion();
  return makeSupplementVerticalQuestion();
}
