import { memo } from 'react';

const deg2rad = (d) => (d * Math.PI) / 180;

/**
 * Hai đường thẳng cắt nhau tại O, 4 góc O₁–O₄ (chuẩn SGK).
 */
export default memo(function IntersectLinesFigure({ givenAngle }) {
  const W = 360;
  const H = 360;
  const Cx = W / 2;
  const Cy = H / 2;
  const lineLen = 150;

  const halfA = givenAngle / 2;
  const alpha = -halfA;
  const beta = halfA;

  const cosAlpha = Math.cos(deg2rad(alpha));
  const sinAlpha = Math.sin(deg2rad(alpha));
  const cosBeta = Math.cos(deg2rad(beta));
  const sinBeta = Math.sin(deg2rad(beta));

  const line1Start = { x: Cx + lineLen * cosAlpha, y: Cy + lineLen * sinAlpha };
  const line1End   = { x: Cx - lineLen * cosAlpha, y: Cy - lineLen * sinAlpha };
  const line2Start = { x: Cx + lineLen * cosBeta,  y: Cy + lineLen * sinBeta };
  const line2End   = { x: Cx - lineLen * cosBeta,  y: Cy - lineLen * sinBeta };

  const labelR = 70;

  const o1Angle = (alpha + beta) / 2;
  const o3Angle = o1Angle + 90 + (90 - halfA);
  const o2Angle = o1Angle + 180;
  const o4Angle = o1Angle - 90 - (90 - halfA);

  const positions = [o1Angle, o3Angle, o2Angle, o4Angle];
  const labelNames = ['O₁', 'O₃', 'O₂', 'O₄'];

  // Cung đánh dấu góc cho trước
  const markR = 36;
  const cosA1 = Math.cos(deg2rad(alpha));
  const sinA1 = Math.sin(deg2rad(alpha));
  const cosA2 = Math.cos(deg2rad(beta));
  const sinA2 = Math.sin(deg2rad(beta));
  const arcX1 = Cx + markR * cosA1;
  const arcY1 = Cy + markR * sinA1;
  const arcX2 = Cx + markR * cosA2;
  const arcY2 = Cy + markR * sinA2;
  const largeArc = givenAngle > 180 ? 1 : 0;
  const givenArc = `M ${arcX1} ${arcY1} A ${markR} ${markR} 0 ${largeArc} 0 ${arcX2} ${arcY2}`;

  // Nhãn góc cho trước
  const midA = deg2rad((alpha + beta) / 2);
  const angleLabelLx = Cx + (markR + 16) * Math.cos(midA);
  const angleLabelLy = Cy + (markR + 16) * Math.sin(midA);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px] mx-auto select-none">
      {/* Hai đường thẳng */}
      <line x1={line1Start.x} y1={line1Start.y} x2={line1End.x} y2={line1End.y} stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={line2Start.x} y1={line2Start.y} x2={line2End.x} y2={line2End.y} stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cung góc cho trước */}
      <path d={givenArc} fill="none" stroke="#ff00c8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Nhãn góc cho trước */}
      <text x={angleLabelLx} y={angleLabelLy + 2} fontSize="13" fill="#ff00c8" fontWeight="700" textAnchor="middle">{givenAngle}°</text>

      {/* Nhãn O₁–O₄ */}
      {positions.map((ang, i) => {
        const a = deg2rad(ang);
        const lx = Cx + labelR * Math.cos(a);
        const ly = Cy + labelR * Math.sin(a);
        return (
          <text
            key={i}
            x={lx} y={ly}
            fontSize="15"
            fill="#00d2ff"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {labelNames[i]}
          </text>
        );
      })}

      {/* Đỉnh O */}
      <circle cx={Cx} cy={Cy} r="3.5" fill="#00d2ff" />
      <text x={Cx + 8} y={Cy - 10} fontSize="16" fill="#00d2ff" fontWeight="700" textAnchor="middle">O</text>
    </svg>
  );
});
