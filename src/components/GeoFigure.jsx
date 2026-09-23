import { memo } from 'react';
import { polar } from '../game/geometry';

const rad = (d) => (d * Math.PI) / 180;

// Toạ độ toán học (y hướng lên) → toạ độ màn hình SVG (y hướng xuống)
const scr = ([x, y]) => [x, -y];

const TONE = {
  line: '#e2e8f0',
  given: '#ff00c8',
  ask: '#00ff88',
  equal: '#facc15',
  point: '#00d2ff',
  muted: '#94a3b8',
};

/**
 * Hình học tổng quát vẽ bằng SVG, toạ độ theo hệ trục toán học; khung nhìn tự co theo nội dung.
 * - lines:  { from, to, tone? }
 * - arcs:   { at, from, to, r?, label?, labelAt?, labelR?, tone?, count? } — cung đi ngược chiều kim đồng hồ từ `from` đến `to` (độ);
 *           labelAt ∈ [0, 1] là vị trí nhãn dọc theo cung (mặc định 0.5 = chính giữa),
 *           labelR là khoảng cách tối thiểu từ đỉnh tới nhãn
 * - labels: { at, text, tone?, size? }
 * - dots:   [x, y]
 */
export default memo(function GeoFigure({ lines = [], arcs = [], labels = [], dots = [] }) {
  const box = [];
  const grow = ([x, y], dx = 0, dy = 0) => box.push([x - dx, y - dy], [x + dx, y + dy]);

  const lineEls = lines.map((l, i) => {
    const [x1, y1] = scr(l.from);
    const [x2, y2] = scr(l.to);
    grow([x1, y1]);
    grow([x2, y2]);
    return (
      <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={TONE[l.tone || 'line']} strokeWidth="2.5" strokeLinecap="round" />
    );
  });

  const arcEls = arcs.map((a, i) => {
    const span = (((a.to - a.from) % 360) + 360) % 360;
    const r0 = a.r ?? 28;
    const count = a.count ?? 1;
    const color = TONE[a.tone || 'given'];
    const paths = [];
    for (let k = 0; k < count; k++) {
      const r = r0 + 5 * k;
      const [x1, y1] = scr(polar(a.at, a.from, r));
      const [x2, y2] = scr(polar(a.at, a.to, r));
      paths.push(
        <path key={k} d={`M ${x1} ${y1} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 0 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />,
      );
    }
    let text = null;
    if (a.label) {
      // Góc hẹp → đẩy nhãn ra xa đỉnh tới khi bề ngang chữ lọt giữa hai cạnh
      const halfW = a.label.length * 4.5 + 5;
      const fit = span < 180 ? halfW / Math.sin(rad(span / 2)) : 0;
      const lr = Math.max(a.labelR ?? r0 + 5 * (count - 1) + 15, Math.min(fit, 110));
      const [tx, ty] = scr(polar(a.at, a.from + span * (a.labelAt ?? 0.5), lr));
      grow([tx, ty], 18, 11);
      text = (
        <text x={tx} y={ty} fontSize="15" fontWeight="700" fill={color}
          textAnchor="middle" dominantBaseline="central">{a.label}</text>
      );
    }
    return <g key={`a${i}`}>{paths}{text}</g>;
  });

  const labelEls = labels.map((t, i) => {
    const [x, y] = scr(t.at);
    const size = t.size ?? 17;
    grow([x, y], t.text.length * size * 0.32 + 3, size * 0.6);
    return (
      <text key={`t${i}`} x={x} y={y} fontSize={size} fontWeight="700" fill={TONE[t.tone || 'line']}
        textAnchor="middle" dominantBaseline="central">{t.text}</text>
    );
  });

  const dotEls = dots.map((d, i) => {
    const [x, y] = scr(d);
    return <circle key={`d${i}`} cx={x} cy={y} r="3.5" fill={TONE.point} />;
  });

  const pad = 12;
  const xs = box.map((p) => p[0]);
  const ys = box.map((p) => p[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) + pad - minX;
  const h = Math.max(...ys) + pad - minY;

  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} className="w-full h-auto max-w-[440px] max-h-[360px] mx-auto select-none">
      {lineEls}
      {arcEls}
      {dotEls}
      {labelEls}
    </svg>
  );
});
