import { memo } from 'react';

const deg2rad = (d) => (d * Math.PI) / 180;

/**
 * Vẽ góc xOy bằng SVG, chính xác theo số đo.
 * - degrees: số đo góc (10..180)
 * - rotate: xoay cả hình (độ) để HS không đoán theo tư thế
 * - labels: { v: đỉnh, r1: tia 1, r2: tia 2 } — mặc định O / x / y
 */
export default memo(function AngleFigure({ degrees = 60, rotate = 0, labels }) {
  const { v: vLabel = 'O', r1: r1Label = 'x', r2: r2Label = 'y' } = labels || {};
  const C = 160;
  const R = 118;
  const rayLen = R + 12;
  const rMark = Math.min(44, 16 + degrees * 0.22);

  const ux = { x: 1, y: 0 };
  const uy = { x: Math.cos(deg2rad(-degrees)), y: Math.sin(deg2rad(-degrees)) };

  const oxEnd = { x: C + rayLen, y: C };
  const oyEnd = { x: C + rayLen * uy.x, y: C + rayLen * uy.y };

  const a1 = { x: C + rMark, y: C };
  const a2 = { x: C + rMark * uy.x, y: C + rMark * uy.y };
  const largeArc = degrees > 180 ? 1 : 0;
  const arcPath = `M ${a1.x} ${a1.y} A ${rMark} ${rMark} 0 ${largeArc} 0 ${a2.x} ${a2.y}`;

  const s = 16;
  const m1 = { x: C + s * ux.x, y: C + s * ux.y };
  const m2 = { x: m1.x + s * uy.x, y: m1.y + s * uy.y };
  const m3 = { x: C + s * uy.x, y: C + s * uy.y };

  const labelR = R + 26;
  const lx = { x: C + labelR, y: C };
  const ly = { x: C + labelR * uy.x, y: C + labelR * uy.y - 4 };

  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full max-w-[320px] mx-auto select-none"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label={`Góc ${r1Label}${vLabel}${r2Label} có số đo ${degrees} độ`}
    >
      <line x1={C} y1={C} x2={oxEnd.x} y2={oxEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <line x1={C} y1={C} x2={oyEnd.x} y2={oyEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

      {degrees === 90 ? (
        <path
          d={`M ${m1.x} ${m1.y} L ${m2.x} ${m2.y} L ${m3.x} ${m3.y}`}
          fill="none"
          stroke="#ff00c8"
          strokeWidth="2.5"
        />
      ) : (
        <path d={arcPath} fill="none" stroke="#ff00c8" strokeWidth="2.5" strokeLinecap="round" />
      )}

      <circle cx={C} cy={C} r="3.5" fill="#00d2ff" />
      <text x={C - 6} y={C + 22} fontSize="19" fill="#00d2ff" fontWeight="600" textAnchor="middle">{vLabel}</text>
      <text x={lx.x + 8} y={lx.y + 6} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">{r1Label}</text>
      <text x={ly.x} y={ly.y} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">{r2Label}</text>
    </svg>
  );
});
