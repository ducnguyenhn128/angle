import GeoFigure from '../components/GeoFigure';
import { polar } from './geometry';
import { randInt, shuffle, uid } from './generators';

/* ========== Level 9: Tính góc tổng hợp ========== */

const O = [0, 0];
const L = 140; // độ dài tia
const SUB = ['', '₁', '₂', '₃', '₄'];
const pick = (arr) => arr[randInt(0, arr.length - 1)];

/** Tia từ O theo hướng deg kèm nhãn tên tia ở đầu mút. */
function ray(deg, name, from = O, len = L) {
  return {
    line: { from, to: polar(from, deg, len) },
    label: { at: polar(from, deg, len + 16), text: name },
  };
}

function rays(list) {
  const r = list.map(([deg, name]) => ray(deg, name));
  return { lines: r.map((x) => x.line), labels: r.map((x) => x.label) };
}

/** 4 phương án số đo: đáp án đúng + nhiễu hợp lý, thiếu thì bù bằng các giá trị lân cận. */
function numOptions(correct, wrongs) {
  const picked = [];
  for (const v of shuffle(wrongs)) {
    if (picked.length === 3) break;
    if (Number.isInteger(v) && v > 0 && v < 360 && v !== correct && !picked.includes(v)) picked.push(v);
  }
  for (let step = 10; picked.length < 3; step += 10) {
    for (const v of shuffle([correct + step, correct - step])) {
      if (picked.length < 3 && v > 0 && v < 360 && !picked.includes(v)) picked.push(v);
    }
  }
  return shuffle([correct, ...picked].map((v) => ({ label: `${v}°`, correct: v === correct })));
}

/** Vị trí nhãn (0..1) trên cung from→to sao cho nhãn nằm giữa khoảng trống rộng nhất giữa các tia bên trong. */
function gapLabelAt(from, to, inner) {
  const cuts = [from, ...inner.filter((d) => d > from && d < to).sort((p, q) => p - q), to];
  let best = 0;
  for (let i = 1; i < cuts.length - 1; i++) if (cuts[i + 1] - cuts[i] > cuts[best + 1] - cuts[best]) best = i;
  return ((cuts[best] + cuts[best + 1]) / 2 - from) / (to - from);
}

const vertexO = (deg) => ({ at: polar(O, deg, 18), text: 'O', tone: 'point' });

/* ---------- 9a: Hai góc kề bù ---------- */
function makeSupplementQ() {
  const [x, y, z] = pick([['x', 'y', 'z'], ['m', 'n', 't'], ['u', 'v', 'w']]);
  const a = 5 * randInt(5, 31); // xOy: 25°–155°
  const givenRight = Math.random() < 0.5;
  const g = givenRight ? a : 180 - a;
  const ans = 180 - g;
  const right = { from: 0, to: a };
  const left = { from: a, to: 180 };
  const nRight = `${x}O${y}`;
  const nLeft = `${y}O${z}`;
  const [gName, aName] = givenRight ? [nRight, nLeft] : [nLeft, nRight];
  const r = rays([[0, x], [a, y], [180, z]]);

  return {
    key: uid('L9-kebu'),
    figure: (
      <GeoFigure
        lines={r.lines}
        labels={[...r.labels, vertexO(270)]}
        dots={[O]}
        arcs={[
          { at: O, ...(givenRight ? right : left), r: 30, label: `${g}°`, tone: 'given' },
          { at: O, ...(givenRight ? left : right), r: 44, label: '?', tone: 'ask' },
        ]}
      />
    ),
    text: `Hai tia O${x} và O${z} đối nhau, góc ${gName} = ${g}°. Tính góc ${aName}.`,
    options: numOptions(ans, [g, Math.abs(90 - g), 360 - g, g / 2]),
    note: `Góc ${nRight} và góc ${nLeft} là hai góc kề bù nên có tổng 180°: ${aName} = 180° − ${g}° = ${ans}°.`,
  };
}

/* ---------- 9b: Hai đường thẳng cắt nhau (đối đỉnh / kề bù) ---------- */
function makeVerticalQ() {
  const a = 5 * randInt(6, 30); // xOy: 30°–150°
  // Bốn góc tạo bởi xx' và yy'
  const regions = [
    { name: "xOy", from: 0, to: a, val: a },
    { name: "yOx'", from: a, to: 180, val: 180 - a },
    { name: "x'Oy'", from: 180, to: 180 + a, val: a },
    { name: "y'Ox", from: 180 + a, to: 360, val: 180 - a },
  ];
  const askIdx = randInt(1, 3);
  const ask = regions[askIdx];
  const free = [1, 2, 3].find((i) => i !== askIdx);
  const r = rays([[0, 'x'], [180, "x'"], [a, 'y'], [180 + a, "y'"]]);
  const isVertical = askIdx === 2;

  return {
    key: uid('L9-doidinh'),
    figure: (
      <GeoFigure
        lines={r.lines}
        labels={[...r.labels, vertexO((regions[free].from + regions[free].to) / 2)]}
        dots={[O]}
        arcs={[
          { at: O, from: 0, to: a, r: 30, label: `${a}°`, tone: 'given' },
          { at: O, from: ask.from, to: ask.to, r: 30, label: '?', tone: 'ask' },
        ]}
      />
    ),
    text: `Hai đường thẳng xx' và yy' cắt nhau tại O, góc xOy = ${a}°. Tính góc ${ask.name}.`,
    options: numOptions(ask.val, [isVertical ? 180 - a : a, Math.abs(90 - a), 360 - a, 90]),
    note: isVertical
      ? `Góc x'Oy' và góc xOy là hai góc đối đỉnh nên bằng nhau: x'Oy' = ${a}°.`
      : `Góc ${ask.name} và góc xOy là hai góc kề bù nên ${ask.name} = 180° − ${a}° = ${180 - a}°.`,
  };
}

/* ---------- 9c: Tia phân giác ---------- */
function makeBisectorQ() {
  const a = 10 * randInt(4, 16); // xOy: 40°–160°
  const half = a / 2;
  const r = rays([[0, 'x'], [a, 'y'], [half, 't']]);
  const givenWhole = Math.random() < 0.5;
  const askHalfName = Math.random() < 0.5 ? 'xOt' : 'tOy';
  const halfArc = askHalfName === 'xOt' ? { from: 0, to: half } : { from: half, to: a };
  const otherHalf = askHalfName === 'xOt' ? { from: half, to: a } : { from: 0, to: half };

  const arcs = givenWhole
    ? [
      { at: O, from: 0, to: a, r: 62, label: `${a}°`, labelAt: askHalfName === 'xOt' ? 0.75 : 0.25, tone: 'given' },
      { at: O, ...halfArc, r: 32, label: '?', tone: 'ask' },
      { at: O, ...otherHalf, r: 32, tone: 'equal' },
    ]
    : [
      { at: O, ...halfArc, r: 32, label: `${half}°`, tone: 'given' },
      { at: O, ...otherHalf, r: 32, tone: 'equal' },
      { at: O, from: 0, to: a, r: 62, label: '?', labelAt: askHalfName === 'xOt' ? 0.75 : 0.25, tone: 'ask' },
    ];

  return {
    key: uid('L9-phangiac'),
    figure: <GeoFigure lines={r.lines} labels={[...r.labels, vertexO(-100)]} dots={[O]} arcs={arcs} />,
    text: givenWhole
      ? `Ot là tia phân giác của góc xOy, góc xOy = ${a}°. Tính góc ${askHalfName}.`
      : `Ot là tia phân giác của góc xOy, góc ${askHalfName} = ${half}°. Tính góc xOy.`,
    options: givenWhole
      ? numOptions(half, [a, 180 - a, 90 - half, 2 * a])
      : numOptions(a, [half, 180 - half, 90 + half, 180 - a]),
    note: givenWhole
      ? `Tia phân giác chia góc thành hai góc bằng nhau: ${askHalfName} = xOy : 2 = ${a}° : 2 = ${half}°.`
      : `Ot là tia phân giác nên xOy = 2 · ${askHalfName} = 2 · ${half}° = ${a}°.`,
  };
}

/* ---------- 9d: Hai đường thẳng song song (so le trong / đồng vị / trong cùng phía) ---------- */
const PARALLEL_KINDS = {
  dv: { name: 'đồng vị', pairs: [[1, 1], [2, 2], [3, 3], [4, 4]] },
  slt: { name: 'so le trong', pairs: [[3, 1], [4, 2]] },
  tcp: { name: 'trong cùng phía', pairs: [[3, 2], [4, 1]] },
};

function makeParallelQ() {
  const theta = pick([45, 50, 55, 60, 65, 70, 110, 115, 120, 125, 130, 135]);
  const h = 80;
  const k = h / Math.tan((theta * Math.PI) / 180);
  const V = { A: [k, h], B: [-k, -h] };
  // 4 góc tại mỗi giao điểm, đánh số ngược chiều kim đồng hồ bắt đầu từ góc trên-phải
  const region = (i) => {
    const from = [0, theta, 180, 180 + theta][i - 1];
    const to = [theta, 180, 180 + theta, 360][i - 1];
    return { from, to, mid: (from + to) / 2, val: i % 2 ? theta : 180 - theta };
  };

  const kindKey = pick(['dv', 'slt', 'slt', 'tcp']);
  const kind = PARALLEL_KINDS[kindKey];
  const [iA, iB] = pick(kind.pairs);
  const givenAtA = Math.random() < 0.5;
  const [gV, gI, aV, aI] = givenAtA ? ['A', iA, 'B', iB] : ['B', iB, 'A', iA];
  const g = region(gI).val;
  const ans = region(aI).val;
  const gName = `${gV}${SUB[gI]}`;
  const aName = `${aV}${SUB[aI]}`;

  const cFrom = polar(V.B, theta + 180, 75);
  const cTo = polar(V.A, theta, 75);
  const X0 = Math.min(-170, cFrom[0] - 50, cTo[0] - 50);
  const X1 = Math.max(170, cFrom[0] + 50, cTo[0] + 50);
  // Tên đỉnh đặt trong góc tù (góc rộng), sát đường thẳng: A phía trên a, B phía dưới b
  const side = theta < 90 ? 1 : -1;
  const vertexAt = { A: [V.A[0] - side * 52, h + 13], B: [V.B[0] + side * 52, -h - 13] };

  const labels = [
    { at: [X1 + 14, h], text: 'a' },
    { at: [X1 + 14, -h], text: 'b' },
    { at: polar(V.A, theta, 91), text: 'c' },
  ];
  // Số thứ tự góc nằm ngay ngoài cung đánh dấu (cung r = 15, số r = 26, số đo r ≥ 48)
  for (const v of ['A', 'B']) {
    for (let i = 1; i <= 4; i++) {
      labels.push({ at: polar(V[v], region(i).mid, 26), text: String(i), tone: 'muted', size: 13 });
    }
    labels.push({ at: vertexAt[v], text: v, tone: 'point', size: 17 });
  }

  const equal = kindKey !== 'tcp';
  return {
    key: uid(`L9-ss-${kindKey}`),
    figure: (
      <GeoFigure
        lines={[
          { from: [X0, h], to: [X1, h] },
          { from: [X0, -h], to: [X1, -h] },
          { from: cFrom, to: cTo },
        ]}
        labels={labels}
        dots={[V.A, V.B]}
        arcs={[
          { at: V[gV], from: region(gI).from, to: region(gI).to, r: 15, label: `${g}°`, labelR: 48, tone: 'given' },
          { at: V[aV], from: region(aI).from, to: region(aI).to, r: 15, label: '?', labelR: 48, tone: 'ask' },
        ]}
      />
    ),
    text: `Cho a ∥ b, đường thẳng c cắt a tại A và cắt b tại B. Biết góc ${gName} = ${g}°. Tính góc ${aName}.`,
    options: numOptions(ans, [equal ? 180 - g : g, Math.abs(90 - g), 90, 360 - g]),
    note: equal
      ? `${gName} và ${aName} là hai góc ${kind.name}. Vì a ∥ b nên ${aName} = ${gName} = ${g}°.`
      : `${gName} và ${aName} là hai góc trong cùng phía. Vì a ∥ b nên chúng bù nhau: ${aName} = 180° − ${g}° = ${ans}°.`,
  };
}

/* ---------- 9e: Tổng ba góc trong tam giác / góc ngoài ---------- */
function makeTriangleQ() {
  const w = 240;
  const rad = (d) => (d * Math.PI) / 180;
  let a0;
  let a1;
  let a2;
  let height;
  do {
    a0 = 5 * randInt(7, 20);
    a1 = 5 * randInt(7, 20);
    a2 = 180 - a0 - a1;
    height = (w * Math.sin(rad(a0)) * Math.sin(rad(a1))) / Math.sin(rad(a2));
  } while (a2 < 30 || a2 > 100 || height > 210 || height < 70);

  const names = shuffle(pick([['A', 'B', 'C'], ['M', 'N', 'P'], ['D', 'E', 'F']]));
  const triName = [...names].sort().join('');
  const P = [[0, 0], [w, 0], polar([0, 0], a0, (w * Math.sin(rad(a1))) / Math.sin(rad(a2)))];
  const angs = [a0, a1, a2];
  const arcAt = [
    { at: P[0], from: 0, to: a0 },
    { at: P[1], from: 180 - a1, to: 180 },
    { at: P[2], from: a0 + 180, to: 360 - a1 },
  ];
  const outDir = [180 + a0 / 2, 360 - a1 / 2, a0 + a2 / 2];
  const labels = names.map((n, i) => ({ at: polar(P[i], outDir[i], 18), text: n, tone: 'point' }));
  const lines = [{ from: P[0], to: P[1] }, { from: P[1], to: P[2] }, { from: P[2], to: P[0] }];

  if (Math.random() < 0.3) {
    // Góc ngoài tại đỉnh thứ hai
    const ext = a0 + a2;
    lines.push({ from: P[1], to: [w + 100, 0] });
    labels.push({ at: [w + 114, 0], text: 'x' });
    labels[1] = { at: polar(P[1], 270, 18), text: names[1], tone: 'point' };
    const extName = `${names[2]}${names[1]}x`;
    return {
      key: uid('L9-gocngoai'),
      figure: (
        <GeoFigure
          lines={lines}
          labels={labels}
          dots={P}
          arcs={[
            { ...arcAt[0], r: 28, label: `${a0}°`, tone: 'given' },
            { ...arcAt[2], r: 28, label: `${a2}°`, tone: 'given' },
            { at: P[1], from: 0, to: 180 - a1, r: 28, label: '?', tone: 'ask' },
          ]}
        />
      ),
      text: `Tam giác ${triName} có góc ${names[0]} = ${a0}°, góc ${names[2]} = ${a2}°. Tia ${names[1]}x là tia đối của tia ${names[1]}${names[0]}. Tính góc ${extName}.`,
      options: numOptions(ext, [180 - ext, 180 - a0, 180 - a2, Math.abs(a0 - a2)]),
      note: `Góc ngoài bằng tổng hai góc trong không kề với nó: ${extName} = ${a0}° + ${a2}° = ${ext}°. (Hoặc: góc ${names[1]} = 180° − ${a0}° − ${a2}° = ${a1}°, rồi ${extName} = 180° − ${a1}° = ${ext}°.)`,
    };
  }

  const askI = randInt(0, 2);
  const [g1, g2] = [0, 1, 2].filter((i) => i !== askI);
  const ans = angs[askI];
  return {
    key: uid('L9-tamgiac'),
    figure: (
      <GeoFigure
        lines={lines}
        labels={labels}
        dots={P}
        arcs={arcAt.map((arc, i) => ({
          ...arc,
          r: 28,
          label: i === askI ? '?' : `${angs[i]}°`,
          tone: i === askI ? 'ask' : 'given',
        }))}
      />
    ),
    text: `Tam giác ${triName} có góc ${names[g1]} = ${angs[g1]}°, góc ${names[g2]} = ${angs[g2]}°. Tính góc ${names[askI]}.`,
    options: numOptions(ans, [angs[g1] + angs[g2], 180 - angs[g1], 180 - angs[g2], 360 - angs[g1] - angs[g2]]),
    note: `Tổng ba góc trong tam giác bằng 180°: góc ${names[askI]} = 180° − ${angs[g1]}° − ${angs[g2]}° = ${ans}°.`,
  };
}

/* ---------- 9f: Bài nhiều bước (kết hợp các tính chất) ---------- */
function makeComboQ() {
  const variant = pick(['kebu-pg', 'hai-pg', 'doidinh-pg']);

  if (variant === 'kebu-pg') {
    // xOy kề bù yOz, Ot phân giác yOz → tính xOt
    const a = 10 * randInt(3, 15);
    const yoz = 180 - a;
    const t = (a + 180) / 2;
    const ans = a + yoz / 2;
    const r = rays([[0, 'x'], [a, 'y'], [180, 'z'], [t, 't']]);
    return {
      key: uid('L9-combo1'),
      figure: (
        <GeoFigure
          lines={r.lines}
          labels={[...r.labels, vertexO(270)]}
          dots={[O]}
          arcs={[
            { at: O, from: 0, to: a, r: 28, label: `${a}°`, tone: 'given' },
            { at: O, from: a, to: t, r: 44, tone: 'equal' },
            { at: O, from: t, to: 180, r: 44, tone: 'equal' },
            { at: O, from: 0, to: t, r: 74, label: '?', labelAt: gapLabelAt(0, t, [a]), tone: 'ask' },
          ]}
        />
      ),
      text: `Tia Ox và Oz đối nhau, góc xOy = ${a}°. Ot là tia phân giác của góc yOz. Tính góc xOt.`,
      options: numOptions(ans, [yoz / 2, yoz, 180 - ans, a / 2 + yoz]),
      note: `Góc yOz kề bù với xOy nên yOz = 180° − ${a}° = ${yoz}°. Ot là phân giác nên yOt = ${yoz}° : 2 = ${yoz / 2}°. Vậy xOt = xOy + yOt = ${a}° + ${yoz / 2}° = ${ans}°.`,
    };
  }

  if (variant === 'hai-pg') {
    // Hai tia phân giác của hai góc kề bù vuông góc với nhau
    const a = 10 * randInt(4, 14);
    const t = a / 2;
    const t2 = (a + 180) / 2;
    const r = rays([[0, 'x'], [a, 'y'], [180, 'z'], [t, 'm'], [t2, 'n']]);
    return {
      key: uid('L9-combo2'),
      figure: (
        <GeoFigure
          lines={r.lines}
          labels={[...r.labels, vertexO(270)]}
          dots={[O]}
          arcs={[
            { at: O, from: 0, to: t, r: 30, tone: 'equal' },
            { at: O, from: t, to: a, r: 30, tone: 'equal' },
            { at: O, from: a, to: t2, r: 30, tone: 'equal', count: 2 },
            { at: O, from: t2, to: 180, r: 30, tone: 'equal', count: 2 },
            { at: O, from: t, to: t2, r: 70, label: '?', labelAt: gapLabelAt(t, t2, [a]), tone: 'ask' },
          ]}
        />
      ),
      text: `Tia Ox và Oz đối nhau, góc xOy = ${a}°. Om, On lần lượt là tia phân giác của góc xOy và yOz. Tính góc mOn.`,
      options: numOptions(90, [a, 180 - a, (180 - a) / 2 + a, 100, 80]),
      note: `mOy = ${a}° : 2 = ${t}°, yOn = (180° − ${a}°) : 2 = ${(180 - a) / 2}°. Vậy mOn = ${t}° + ${(180 - a) / 2}° = 90° (hai tia phân giác của hai góc kề bù luôn vuông góc).`,
    };
  }

  // Đối đỉnh + phân giác: xx' cắt yy' tại O, Ot phân giác xOy → tính x'Ot
  const a = 10 * randInt(4, 14);
  const half = a / 2;
  const ans = 180 - half;
  const r = rays([[0, 'x'], [180, "x'"], [a, 'y'], [180 + a, "y'"], [half, 't']]);
  return {
    key: uid('L9-combo3'),
    figure: (
      <GeoFigure
        lines={r.lines}
        labels={[...r.labels, vertexO(180 + a + (180 - a) / 2)]}
        dots={[O]}
        arcs={[
          { at: O, from: 0, to: half, r: 26, tone: 'equal' },
          { at: O, from: half, to: a, r: 26, tone: 'equal' },
          { at: O, from: 180, to: 180 + a, r: 30, label: `${a}°`, tone: 'given' },
          { at: O, from: half, to: 180, r: 56, label: '?', labelAt: gapLabelAt(half, 180, [a]), tone: 'ask' },
        ]}
      />
    ),
    text: `Hai đường thẳng xx' và yy' cắt nhau tại O, góc x'Oy' = ${a}°. Ot là tia phân giác của góc xOy. Tính góc x'Ot.`,
    options: numOptions(ans, [half, 180 - a, 90 + half, 180 - a + half + 10]),
    note: `xOy đối đỉnh với x'Oy' nên xOy = ${a}°, suy ra xOt = ${half}°. Góc x'Ot kề bù với xOt nên x'Ot = 180° − ${half}° = ${ans}°.`,
  };
}

export function makeLevel9Question() {
  const r = Math.random();
  if (r < 0.14) return makeSupplementQ();
  if (r < 0.28) return makeVerticalQ();
  if (r < 0.42) return makeBisectorQ();
  if (r < 0.62) return makeParallelQ();
  if (r < 0.8) return makeTriangleQ();
  return makeComboQ();
}
