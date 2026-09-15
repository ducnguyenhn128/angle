import { memo } from 'react';

const deg2rad = (d) => (d * Math.PI) / 180;

const C = 160;
const R = 118;
const rayLen = R + 12;

function rayEnd(fract, deg) {
  const a = deg2rad(-deg * fract);
  return { x: C + rayLen * Math.cos(a), y: C + rayLen * Math.sin(a) };
}

function arcPath(r1, r2, startFract, endFract, deg) {
  const a1 = deg2rad(-deg * startFract);
  const a2 = deg2rad(-deg * endFract);
  const p1 = { x: C + r1 * Math.cos(a1), y: C + r1 * Math.sin(a1) };
  const p2 = { x: C + r2 * Math.cos(a2), y: C + r2 * Math.sin(a2) };
  const large = (endFract - startFract) * deg > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r2} ${r2} 0 ${large} 0 ${p2.x} ${p2.y}`;
}

const COLORS = ['#00d2ff', '#ff00c8', '#00ff88'];

/**
 * Góc xOy với 3 tia trong Oz, Ot, Ou.
 * fracs: mảng 3 fraction [0..1] tương ứng vị trí mỗi tia trong góc.
 */
export default memo(function BisectorPickFigure({ deg, fracs, rayNames }) {
  const oxEnd = { x: C + rayLen, y: C };
  const oyEnd = rayEnd(1, deg);

  const yLabelLx = C + (R + 26) * Math.cos(deg2rad(-deg));
  const yLabelLy = C + (R + 26) * Math.sin(deg2rad(-deg));

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto select-none">
      {/* Hai tia biên */}
      <line x1={C} y1={C} x2={oxEnd.x} y2={oxEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <line x1={C} y1={C} x2={oyEnd.x} y2={oyEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

      {/* 3 tia trong */}
      {fracs.map((f, i) => {
        const end = rayEnd(f, deg);
        return (
          <line
            key={i}
            x1={C} y1={C} x2={end.x} y2={end.y}
            stroke={COLORS[i]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 3"
          />
        );
      })}

      {/* Nhãn tia */}
      {fracs.map((f, i) => {
        const a = deg2rad(-deg * f);
        const lx = C + (R + 22) * Math.cos(a);
        const ly = C + (R + 22) * Math.sin(a);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize="17"
            fill={COLORS[i]}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {rayNames[i]}
          </text>
        );
      })}

      {/* Cung góc lớn */}
      <path
        d={arcPath(32, 32, 0, 1, deg)}
        fill="none"
        stroke="#ff00c8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Đỉnh + nhãn tia biên */}
      <circle cx={C} cy={C} r="3.5" fill="#00d2ff" />
      <text x={C - 6} y={C + 22} fontSize="19" fill="#00d2ff" fontWeight="600" textAnchor="middle">O</text>
      <text x={C + R + 26} y={C + 6} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">x</text>
      <text x={yLabelLx} y={yLabelLy} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">y</text>
    </svg>
  );
});
