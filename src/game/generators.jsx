import AngleFigure from '../components/AngleFigure';
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
    key: uid('l1'),
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
    key: uid('l2'),
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
    key: uid('bank'),
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
    key: uid('fig'),
    figureUrl: `/figures/${topic}/${entry.file}.svg`,
    title: entry.title || null,
    note: entry.note || null,
  };
}
