import { memo } from 'react';

const deg2rad = (d) => (d * Math.PI) / 180;

/**
 * Biến thể A: điểm M kẻ 4 đoạn xuống đường thẳng d, đúng 1 đoạn vuông góc.
 */
export const PerpFromPointFigure = memo(function PerpFromPointFigure({ footAngles, names }) {
  const W = 480;
  const H = 300;
  const Mx = W / 2;
  const My = 40;
  const dy = 200;
  const footY = My + dy;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[46vh] mx-auto select-none">
      {/* Đường thẳng d (ngang) */}
      <line x1="20" y1={footY} x2={W - 20} y2={footY} stroke="#e2e8f0" strokeWidth="2.5" />
      <text x={W - 30} y={footY + 22} fontSize="17" fill="#e2e8f0" fontWeight="600" textAnchor="middle">d</text>

      {/* Các đoạn kẻ */}
      {footAngles.map((angleDeg, i) => {
        const rad = deg2rad(angleDeg);
        const sign = Math.cos(rad) >= 0 ? 1 : -1;
        const halfLen = Math.abs(Math.sin(rad)) > 0.3 ? dy / Math.abs(Math.sin(rad)) : 300;
        const fx = Mx + sign * Math.abs(Math.cos(rad)) * halfLen;
        const isPerp = angleDeg === 90;
        return (
          <g key={i}>
            <line
              x1={Mx} y1={My} x2={fx} y2={footY}
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Nhãn điểm chân */}
            <text
              x={fx + (sign >= 0 ? 10 : -10)}
              y={footY + 20}
              fontSize="15"
              fill="#e2e8f0"
              fontWeight="600"
              textAnchor="middle"
            >
              {names[i]}
            </text>
            {/* Dấu góc vuông */}
            {isPerp && (
              <rect
                x={fx - 9} y={footY - 9}
                width="9" height="9"
                fill="none" stroke="#00ff88" strokeWidth="2"
              />
            )}
          </g>
        );
      })}

      {/* Đỉnh M */}
      <circle cx={Mx} cy={My} r="3.5" fill="#00d2ff" />
      <text x={Mx - 6} y={My - 10} fontSize="17" fill="#00d2ff" fontWeight="600" textAnchor="middle">M</text>
    </svg>
  );
});

/**
 * Biến thể B: 4 đường thẳng cắt d, đúng 3 vuông góc, 1 xiên.
 */
export const PerpFourLinesFigure = memo(function PerpFourLinesFigure({ angles, names, slantIdx }) {
  const W = 480;
  const H = 300;
  const dY = H / 2 + 20;
  const spacing = (W - 100) / 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[46vh] mx-auto select-none">
      {/* Đường thẳng d ngang giữa */}
      <line x1="30" y1={dY} x2={W - 30} y2={dY} stroke="#e2e8f0" strokeWidth="2.5" />
      <text x={W - 22} y={dY + 22} fontSize="17" fill="#e2e8f0" fontWeight="600" textAnchor="middle">d</text>

      {angles.map((angleDeg, i) => {
        const cx = 70 + spacing * i;
        const isSlant = i === slantIdx;
        const len = 110;
        const rad = deg2rad(angleDeg);
        const topX = cx - len * Math.cos(rad) / 2;
        const topY = dY - len * Math.abs(Math.sin(rad)) / 2;
        const botX = cx + len * Math.cos(rad) / 2;
        const botY = dY + len * Math.abs(Math.sin(rad)) / 2;
        return (
          <g key={i}>
            <line
              x1={topX} y1={topY} x2={botX} y2={botY}
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x={cx}
              y={dY + 50}
              fontSize="16"
              fill="#e2e8f0"
              fontWeight="600"
              textAnchor="middle"
            >
              {names[i]}
            </text>
            {/* Dấu góc vuông trên đường thẳng d */}
            {!isSlant && (
              <rect
                x={cx - 9} y={dY - 9}
                width="9" height="9"
                fill="none" stroke="#00ff88" strokeWidth="2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
});
