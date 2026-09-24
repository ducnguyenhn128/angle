import { memo } from 'react';
import { normId } from '../quiz/shapes';

const C = {
  line: '#e2e8f0',
  mark: '#facc15',
  par: '#fb923c',
  right: '#00ff88',
  point: '#00d2ff',
  highlight: '#ff00c8',
  selected: '#00d2ff',
  correct: '#00ff88',
  wrong: '#f87171',
};

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const unit = (v) => mul(v, 1 / Math.hypot(v[0], v[1]));
const perp = (v) => [-v[1], v[0]];
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

/**
 * Hai đầu mút theo thứ tự “chuẩn” (đi sang phải, hoặc xuống nếu thẳng đứng): mũi tên song song cùng chiều,
 * và vạch cạnh bằng luôn nằm ở nửa bên kia so với mũi tên dù đoạn được khai báo theo chiều nào.
 */
function canonEnds(a, b) {
  const d = sub(b, a);
  return d[0] < -1e-6 || (Math.abs(d[0]) < 1e-6 && d[1] < 0) ? [b, a] : [a, b];
}

/** Hai tia từ đỉnh V tới hai đỉnh kề (hoặc tới p, q nếu truyền vào). */
function cornerRays(data, at, p, q) {
  const { points: P, names: N } = data;
  const V = P[at];
  let A;
  let B;
  if (p && q) {
    A = P[p];
    B = P[q];
  } else {
    const i = N.indexOf(at);
    A = P[N[(i + 3) % 4]];
    B = P[N[(i + 1) % 4]];
  }
  return [V, unit(sub(A, V)), unit(sub(B, V))];
}

function arcPath(V, u, w, r) {
  const cross = u[0] * w[1] - u[1] * w[0];
  return `M ${pt(add(V, mul(u, r)))} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${pt(add(V, mul(w, r)))}`;
}

/**
 * Vẽ tứ giác từ dữ liệu buildShape(). Khi truyền `pick`, các phần tử trở thành vùng bấm (hotspot).
 * - pick: ['vertex' | 'side' | 'diagonal' | 'angle']
 * - states: { [mã phần tử]: 'selected' | 'correct' | 'wrong' }
 * - onPick(id)
 */
export default memo(function QuadFigure({ data, pick = [], states = {}, onPick, disabled }) {
  const { points: P, names: N, center, sides, diagonals, marks, highlight } = data;
  const centroid = mul(N.reduce((s, n) => add(s, P[n]), [0, 0]), 1 / 4);
  const box = [];
  const grow = (p, r = 0) => box.push([p[0] - r, p[1] - r], [p[0] + r, p[1] + r]);
  N.forEach((n) => grow(P[n]));

  const colorOf = (id, base) => {
    const s = states[id];
    if (s) return C[s];
    if (highlight.includes(id)) return C.highlight;
    return base;
  };
  const clickable = !disabled && onPick;

  /* ---- Góc (vẽ dưới cùng) ---- */
  const angleEls = [];
  if (pick.includes('angle') || N.some((n) => states[`∠${n}`] || highlight.includes(`∠${n}`))) {
    N.forEach((n) => {
      const id = `∠${n}`;
      const [V, u, w] = cornerRays(data, n);
      const R = 40;
      const color = colorOf(id, null);
      const d = `M ${pt(V)} L ${pt(add(V, mul(u, R)))} ${arcPath(V, u, w, R).replace(/^M [^A]+/, '')} Z`;
      angleEls.push(
        <path
          key={id}
          d={d}
          fill={color ?? 'rgba(0,0,0,0)'}
          fillOpacity={color ? 0.28 : 1}
          stroke={color ?? 'none'}
          strokeWidth="2"
          className={pick.includes('angle') && clickable ? 'cursor-pointer hover:fill-[rgba(0,210,255,0.18)]' : ''}
          onClick={pick.includes('angle') && clickable ? () => onPick(id) : undefined}
        />,
      );
    });
  }

  /* ---- Cạnh & đường chéo ---- */
  const segEls = [];
  const hitEls = [];
  const drawSeg = ([a, b], kind, dashed) => {
    const id = normId(a + b);
    const color = colorOf(id, C.line);
    const strong = color !== C.line;
    segEls.push(
      <line key={id} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]}
        stroke={color} strokeWidth={strong ? 4 : 2.5} strokeLinecap="round"
        strokeDasharray={dashed && !strong ? '7 6' : undefined} />,
    );
    if (pick.includes(kind) && clickable) {
      hitEls.push(
        <line key={`hit-${id}`} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]}
          stroke="rgba(0,0,0,0)" strokeWidth="20" strokeLinecap="round" pointerEvents="stroke"
          className="cursor-pointer hover:stroke-[rgba(0,210,255,0.22)]" onClick={() => onPick(id)} />,
      );
    }
  };
  sides.forEach((s) => drawSeg(s, 'side'));
  diagonals.forEach((s) => drawSeg(s, 'diagonal', true));

  /* ---- Ký hiệu ---- */
  const parSegs = new Set(marks.filter((m) => m.t === 'par').map((m) => normId(m.a + m.b)));
  const markEls = marks.map((m, i) => {
    if (m.t === 'tick') {
      const [a, b] = canonEnds(P[m.a], P[m.b]);
      const d = unit(sub(b, a));
      const nrm = perp(d);
      const mid = lerp(a, b, parSegs.has(normId(m.a + m.b)) ? 0.64 : 0.5);
      return (
        <g key={i}>
          {Array.from({ length: m.n || 1 }, (_, k) => {
            const c = add(mid, mul(d, (k - ((m.n || 1) - 1) / 2) * 5));
            return <line key={k} x1={c[0] + nrm[0] * 7} y1={c[1] + nrm[1] * 7} x2={c[0] - nrm[0] * 7} y2={c[1] - nrm[1] * 7}
              stroke={C.mark} strokeWidth="2.2" strokeLinecap="round" />;
          })}
        </g>
      );
    }
    if (m.t === 'par') {
      const [a, b] = canonEnds(P[m.a], P[m.b]);
      const d = unit(sub(b, a));
      const nrm = perp(d);
      const mid = lerp(a, b, 0.36);
      return (
        <g key={i}>
          {Array.from({ length: m.n || 1 }, (_, k) => {
            const tip = add(mid, mul(d, k * 7 + 4));
            const back = add(tip, mul(d, -8));
            return <polyline key={k}
              points={`${pt(add(back, mul(nrm, 6)))} ${pt(tip)} ${pt(add(back, mul(nrm, -6)))}`}
              fill="none" stroke={C.par} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />;
          })}
        </g>
      );
    }
    if (m.t === 'right') {
      const [V, u, w] = cornerRays(data, m.at, m.p, m.q);
      const s = 12;
      return <polyline key={i} points={`${pt(add(V, mul(u, s)))} ${pt(add(add(V, mul(u, s)), mul(w, s)))} ${pt(add(V, mul(w, s)))}`}
        fill="none" stroke={C.right} strokeWidth="2" />;
    }
    if (m.t === 'arc') {
      const [V, u, w] = cornerRays(data, m.at, m.p, m.q);
      const n = m.n || 1;
      // Đường chéo (nếu có) đi qua đỉnh gần như dọc phân giác → dời nhãn lệch về phía một cạnh để khỏi bị đè
      const onDiag = diagonals.some(([a, b]) => a === m.at || b === m.at);
      const bis = unit(onDiag ? add(mul(unit(add(u, w)), 0.55), mul(u, 0.45)) : add(u, w));
      const lp = add(V, mul(bis, 22 + 5 * n + 16));
      if (m.label) grow(lp, 14);
      return (
        <g key={i}>
          {Array.from({ length: n }, (_, k) => (
            <path key={k} d={arcPath(V, u, w, 20 + 5 * k)} fill="none" stroke={C.mark} strokeWidth="2.2" />
          ))}
          {m.label && (
            <text x={lp[0]} y={lp[1]} fontSize="14" fontWeight="700" fill={C.mark}
              textAnchor="middle" dominantBaseline="central">{m.label}</text>
          )}
        </g>
      );
    }
    if (m.t === 'sideLabel') {
      const mid = lerp(P[m.a], P[m.b], 0.5);
      // Đẩy nhãn ra ngoài theo pháp tuyến của cạnh, đủ xa để bề ngang chữ không đè lên nét
      const d = unit(sub(P[m.b], P[m.a]));
      let out = perp(d);
      if (out[0] * (mid[0] - centroid[0]) + out[1] * (mid[1] - centroid[1]) < 0) out = mul(out, -1);
      const halfW = m.text.length * 3.8;
      const lp = add(mid, mul(out, 8 + Math.abs(out[0]) * halfW + Math.abs(out[1]) * 8));
      grow(lp, halfW + 4);
      return <text key={i} x={lp[0]} y={lp[1]} fontSize="14" fontWeight="700" fill={C.line}
        textAnchor="middle" dominantBaseline="central">{m.text}</text>;
    }
    return null;
  });

  /* ---- Đỉnh & tên đỉnh ---- */
  const vertexEls = N.map((n) => {
    const p = P[n];
    const lp = add(p, mul(unit(sub(p, centroid)), 19));
    grow(lp, 12);
    const color = colorOf(n, C.point);
    const strong = color !== C.point;
    return (
      <g key={n}>
        <circle cx={p[0]} cy={p[1]} r={strong ? 6 : 3.5} fill={color} />
        <text x={lp[0]} y={lp[1]} fontSize="17" fontWeight="700" fill={strong ? color : C.line}
          textAnchor="middle" dominantBaseline="central">{n}</text>
        {pick.includes('vertex') && clickable && (
          <circle cx={p[0]} cy={p[1]} r="17" fill="rgba(0,0,0,0)"
            className="cursor-pointer hover:fill-[rgba(0,210,255,0.22)]" onClick={() => onPick(n)} />
        )}
      </g>
    );
  });

  let centerEl = null;
  if (center) {
    const o = P[center];
    // Đặt tên giao điểm trong khoảng giữa OB và OC (dấu góc vuông tại O, nếu có, nằm giữa OA và OB)
    const lp = add(o, mul(unit(sub(lerp(P[N[1]], P[N[2]], 0.5), o)), 17));
    centerEl = (
      <g>
        <circle cx={o[0]} cy={o[1]} r="3" fill={C.point} />
        <text x={lp[0]} y={lp[1]} fontSize="15" fontWeight="700" fill={C.line}
          textAnchor="middle" dominantBaseline="central">{center}</text>
      </g>
    );
  }

  const pad = 14;
  const xs = box.map((p) => p[0]);
  const ys = box.map((p) => p[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) + pad - minX;
  const h = Math.max(...ys) + pad - minY;

  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} className="w-full h-auto max-w-[440px] max-h-[40vh] mx-auto select-none">
      {angleEls}
      {segEls}
      {markEls}
      {centerEl}
      {hitEls}
      {vertexEls}
    </svg>
  );
});
