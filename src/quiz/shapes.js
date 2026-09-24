/**
 * Tứ giác mô tả bằng dữ liệu (dùng trong trường `shape` của câu hỏi) — logic thuần, không JSX.
 *
 * shape = {
 *   kind: 'tu-giac' | 'hinh-thang' | 'thang-vuong' | 'thang-can' | 'hbh' | 'hcn' | 'thoi' | 'vuong' | 'dieu',
 *   names?: 'ABCD',                 // tên 4 đỉnh theo thứ tự ngược chiều kim đồng hồ, bắt đầu từ góc dưới bên trái
 *   marks?: ['sides', 'parallel', 'right', 'angles', 'diagonals', 'diag-marks'],  // ký hiệu vẽ sẵn theo loại hình
 *   center?: 'O',                   // tên giao điểm hai đường chéo (khi có 'diagonals')
 *   angleLabels?: { A: '70°', C: '?' },
 *   sideLabels?: { AB: '6 cm' },
 *   highlight?: ['AB', '∠A'],       // tô màu nổi bật các phần tử
 *   extra?: [{ t: 'tick' | 'par', a, b, n } | { t: 'right', at } | { t: 'arc', at, n, label? }]
 * }
 *
 * Mã phần tử: đỉnh 'A', cạnh 'AB', đường chéo 'AC', góc '∠A'. Cạnh/đường chéo không phân biệt thứ tự chữ.
 * Hình được sinh ngẫu nhiên nhưng KHÔNG vô tình mang tính chất của loại hình “mạnh hơn”
 * (HBH không gần HCN/thoi, hình thang thường không gần cân/vuông…), để HS không đoán bằng mắt.
 */

export const SHAPE_KINDS = {
  'tu-giac': 'Tứ giác',
  'hinh-thang': 'Hình thang',
  'thang-vuong': 'Hình thang vuông',
  'thang-can': 'Hình thang cân',
  hbh: 'Hình bình hành',
  hcn: 'Hình chữ nhật',
  thoi: 'Hình thoi',
  vuong: 'Hình vuông',
  dieu: 'Tứ giác có hai đường chéo vuông góc (hình cánh diều)',
};
export const MARK_PRESETS = ['sides', 'parallel', 'right', 'angles', 'diagonals', 'diag-marks'];

const rand = (a, b) => a + Math.random() * (b - a);
const deg = (r) => (r * 180) / Math.PI;

/** Chuẩn hoá mã phần tử: cạnh 'DA' → 'AD'. */
export function normId(id) {
  const s = String(id).trim();
  if (/^\p{Lu}\p{Lu}$/u.test(s)) return [...s].sort().join('');
  return s;
}

/** Danh sách mã phần tử bấm được theo loại (dùng cho validate & hotspot). */
export function elementIds(shape, kinds = ['vertex', 'side', 'diagonal', 'angle']) {
  const n = [...(shape.names || 'ABCD')];
  const out = [];
  if (kinds.includes('vertex')) out.push(...n);
  if (kinds.includes('side')) out.push(...n.map((v, i) => normId(v + n[(i + 1) % 4])));
  if (kinds.includes('diagonal')) out.push(normId(n[0] + n[2]), normId(n[1] + n[3]));
  if (kinds.includes('angle')) out.push(...n.map((v) => `∠${v}`));
  return out;
}

export function validateShape(shape, errs) {
  if (!shape || typeof shape !== 'object') return errs.push('shape phải là object');
  if (!SHAPE_KINDS[shape.kind]) errs.push(`shape.kind "${shape.kind}" không hợp lệ (${Object.keys(SHAPE_KINDS).join(', ')})`);
  const names = [...(shape.names || 'ABCD')];
  if (names.length !== 4 || new Set(names).size !== 4) errs.push('shape.names phải gồm 4 chữ cái khác nhau');
  for (const m of shape.marks || []) if (!MARK_PRESETS.includes(m)) errs.push(`shape.marks: "${m}" không hợp lệ`);
  const all = new Set([...elementIds(shape), shape.center || 'O']);
  for (const h of shape.highlight || []) if (!all.has(normId(h))) errs.push(`shape.highlight: "${h}" không có trên hình`);
  return errs;
}

/* ---------- Sinh toạ độ (màn hình, y hướng xuống) theo thứ tự A (dưới trái) → B → C → D ngược chiều kim đồng hồ ---------- */

function trapezoid(dx, L1, L2, h) {
  return [[0, h], [L1, h], [dx + L2, 0], [dx, 0]];
}

function angleAt(p, a, b) {
  const u = [a[0] - p[0], a[1] - p[1]];
  const v = [b[0] - p[0], b[1] - p[1]];
  return deg(Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))));
}
const dirDeg = (a, b) => ((deg(Math.atan2(b[1] - a[1], b[0] - a[0])) % 180) + 180) % 180;
const lineGap = (d1, d2) => Math.min(Math.abs(d1 - d2), 180 - Math.abs(d1 - d2));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Tứ giác lồi “bất kỳ”: không có cặp cạnh song song, không cạnh đối bằng nhau, đường chéo không bằng/không vuông góc. */
function genericQuad() {
  for (let k = 0; k < 500; k++) {
    const P = [
      [rand(0, 30), rand(150, 190)],
      [rand(220, 270), rand(160, 200)],
      [rand(190, 250), rand(0, 40)],
      [rand(40, 110), rand(10, 60)],
    ];
    const angs = P.map((p, i) => angleAt(p, P[(i + 3) % 4], P[(i + 1) % 4]));
    if (angs.some((a) => a < 60 || a > 125)) continue;
    if (lineGap(dirDeg(P[0], P[1]), dirDeg(P[3], P[2])) < 10) continue;
    if (lineGap(dirDeg(P[1], P[2]), dirDeg(P[0], P[3])) < 10) continue;
    if (Math.abs(dist(P[0], P[1]) / dist(P[2], P[3]) - 1) < 0.15) continue;
    if (Math.abs(dist(P[1], P[2]) / dist(P[3], P[0]) - 1) < 0.15) continue;
    if (Math.abs(dist(P[0], P[2]) / dist(P[1], P[3]) - 1) < 0.12) continue;
    if (lineGap(dirDeg(P[0], P[2]), dirDeg(P[1], P[3])) > 78) continue;
    return P;
  }
  return [[0, 180], [250, 190], [220, 20], [70, 40]];
}

function genPoints(kind) {
  switch (kind) {
    case 'hbh': {
      const L = rand(180, 230);
      const s = L * rand(0.55, 0.75);
      const th = ((Math.random() < 0.8 ? rand(58, 72) : rand(108, 122)) * Math.PI) / 180;
      const h = s * Math.sin(th);
      const c = s * Math.cos(th);
      return [[0, h], [L, h], [L + c, 0], [c, 0]];
    }
    case 'hcn': {
      const w = rand(200, 240);
      const h = w * rand(0.5, 0.66);
      return [[0, h], [w, h], [w, 0], [0, 0]];
    }
    case 'vuong': {
      const s = rand(160, 180);
      return [[0, s], [s, s], [s, 0], [0, 0]];
    }
    case 'thoi': {
      // Hai đường chéo nằm ngang / thẳng đứng, không bằng nhau (tránh giống hình vuông)
      const d1 = rand(230, 260);
      const d2 = d1 * rand(0.5, 0.68);
      return [[0, d2 / 2], [d1 / 2, d2], [d1, d2 / 2], [d1 / 2, 0]];
    }
    case 'dieu': {
      const d1 = rand(230, 260);
      const px = d1 * rand(0.28, 0.36);
      const hb = rand(65, 85);
      return [[0, hb], [px, 2 * hb], [d1, hb], [px, 0]];
    }
    case 'hinh-thang':
    case 'thang-can':
    case 'thang-vuong': {
      const L1 = rand(230, 260);
      const L2 = L1 * rand(0.45, 0.6);
      const h = rand(105, 130);
      const gap = L1 - L2;
      let dx = gap / 2;
      if (kind === 'thang-vuong') dx = 0;
      if (kind === 'hinh-thang') {
        // Tránh gần cân (dx ≈ gap/2) và gần vuông (dx ≈ 0 hoặc gap)
        dx = Math.random() < 0.5 ? rand(0.18, 0.32) * gap : rand(0.68, 0.82) * gap;
      }
      return trapezoid(dx, L1, L2, h);
    }
    default:
      return genericQuad();
  }
}

/* ---------- Ký hiệu vẽ sẵn theo loại hình ---------- */

const PAIRS_OPP = [[[0, 1], [3, 2]], [[1, 2], [0, 3]]]; // (AB, DC) và (BC, AD)
const ALL_SIDES = [[0, 1], [1, 2], [2, 3], [3, 0]];
const PARALLELOGRAMS = ['hbh', 'hcn', 'thoi', 'vuong'];
const TRAPEZOIDS = ['hinh-thang', 'thang-can', 'thang-vuong'];

function presetMarks(kind, marks, N, O) {
  const out = [];
  const seg = (t, [i, j], n) => out.push({ t, a: N[i], b: N[j], n });
  const has = (m) => marks.includes(m);

  if (has('sides')) {
    if (kind === 'thoi' || kind === 'vuong') ALL_SIDES.forEach((s) => seg('tick', s, 1));
    else if (kind === 'hbh' || kind === 'hcn') PAIRS_OPP.forEach((pair, k) => pair.forEach((s) => seg('tick', s, k + 1)));
    else if (kind === 'thang-can') [[1, 2], [3, 0]].forEach((s) => seg('tick', s, 1));
    else if (kind === 'dieu') {
      [[0, 1], [3, 0]].forEach((s) => seg('tick', s, 1));
      [[1, 2], [2, 3]].forEach((s) => seg('tick', s, 2));
    }
  }
  if (has('parallel')) {
    if (PARALLELOGRAMS.includes(kind)) PAIRS_OPP.forEach((pair, k) => pair.forEach((s) => seg('par', s, k + 1)));
    else if (TRAPEZOIDS.includes(kind)) PAIRS_OPP[0].forEach((s) => seg('par', s, 1));
  }
  if (has('right')) {
    if (kind === 'hcn' || kind === 'vuong') N.forEach((v) => out.push({ t: 'right', at: v }));
    if (kind === 'thang-vuong') [N[0], N[3]].forEach((v) => out.push({ t: 'right', at: v }));
  }
  if (has('angles')) {
    if (kind === 'hbh' || kind === 'thoi') {
      [N[0], N[2]].forEach((v) => out.push({ t: 'arc', at: v, n: 1 }));
      [N[1], N[3]].forEach((v) => out.push({ t: 'arc', at: v, n: 2 }));
    }
    if (kind === 'thang-can') {
      [N[0], N[1]].forEach((v) => out.push({ t: 'arc', at: v, n: 1 }));
      [N[2], N[3]].forEach((v) => out.push({ t: 'arc', at: v, n: 2 }));
    }
  }
  if (has('diag-marks') && has('diagonals')) {
    const half = (i, n) => out.push({ t: 'tick', a: N[i], b: O, n });
    if (kind === 'hcn' || kind === 'vuong') [0, 1, 2, 3].forEach((i) => half(i, 1));
    else if (PARALLELOGRAMS.includes(kind)) {
      [0, 2].forEach((i) => half(i, 1));
      [1, 3].forEach((i) => half(i, 2));
    } else if (kind === 'dieu') [1, 3].forEach((i) => half(i, 1));
    if (kind === 'thoi' || kind === 'vuong' || kind === 'dieu') out.push({ t: 'right', at: O, p: N[0], q: N[1] });
  }
  return out;
}

function intersect(p1, p2, p3, p4) {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const a = p1[0] * p2[1] - p1[1] * p2[0];
  const b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d];
}

/** Dựng dữ liệu hình (toạ độ + ký hiệu) từ mô tả. Gọi một lần khi chuẩn bị câu để hình không đổi khi render lại. */
export function buildShape(shape) {
  const N = [...(shape.names || 'ABCD')];
  const marks = shape.marks || [];
  const pts = genPoints(shape.kind);
  const P = Object.fromEntries(N.map((n, i) => [n, pts[i]]));
  const withDiag = marks.includes('diagonals');
  const O = shape.center || 'O';
  if (withDiag) P[O] = intersect(pts[0], pts[2], pts[1], pts[3]);

  const primitives = [...presetMarks(shape.kind, marks, N, O), ...(shape.extra || [])];
  for (const [v, label] of Object.entries(shape.angleLabels || {})) {
    const existing = primitives.find((m) => m.t === 'arc' && m.at === v);
    if (existing) existing.label = label;
    else primitives.push({ t: 'arc', at: v, n: 1, label });
  }
  for (const [s, text] of Object.entries(shape.sideLabels || {})) {
    primitives.push({ t: 'sideLabel', a: s[0], b: s[1], text });
  }

  return {
    names: N,
    points: P,
    center: withDiag ? O : null,
    sides: N.map((v, i) => [v, N[(i + 1) % 4]]),
    diagonals: withDiag ? [[N[0], N[2]], [N[1], N[3]]] : [],
    marks: primitives,
    highlight: (shape.highlight || []).map(normId),
  };
}
