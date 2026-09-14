const deg2rad = (d) => (d * Math.PI) / 180;

/**
 * Vẽ góc xOy bằng SVG, chính xác theo số đo.
 * - degrees: số đo góc (10..180)
 * - rotate: xoay cả hình (độ) để HS không đoán theo tư thế
 */
export default function AngleFigure({ degrees = 60, rotate = 0 }) {
  const C = 160;
  const R = 118;
  const rayLen = R + 12;      // điểm cuối của tia
  const arrowLen = 12;        // độ dài mũi tên nhô ra
  const arrowSpread = 7;      // góc mở mũi tên
  const rMark = Math.min(44, 16 + degrees * 0.22);

  // Hai tia xuất phát từ O, Oy xoay -degrees (SVG y đi xuống)
  const ux = { x: 1, y: 0 };
  const uy = { x: Math.cos(deg2rad(-degrees)), y: Math.sin(deg2rad(-degrees)) };

  const oxEnd = { x: C + rayLen, y: C };
  const oyEnd = { x: C + rayLen * uy.x, y: C + rayLen * uy.y };

  // Mũi tên tia Ox (nằm trên hướng 0°)
  const oxTip = { x: C + rayLen + arrowLen, y: C };
  const oxBase1 = {
    x: C + rayLen * Math.cos(deg2rad(arrowSpread)),
    y: C - rayLen * Math.sin(deg2rad(arrowSpread)),
  };
  const oxBase2 = {
    x: C + rayLen * Math.cos(deg2rad(-arrowSpread)),
    y: C - rayLen * Math.sin(deg2rad(-arrowSpread)),
  };

  // Mũi tên tia Oy (nằm trên hướng -degrees)
  const oyTip = {
    x: C + (rayLen + arrowLen) * uy.x,
    y: C + (rayLen + arrowLen) * uy.y,
  };
  const oyBase1 = {
    x: C + rayLen * Math.cos(deg2rad(-degrees - arrowSpread)),
    y: C + rayLen * Math.sin(deg2rad(-degrees - arrowSpread)),
  };
  const oyBase2 = {
    x: C + rayLen * Math.cos(deg2rad(-degrees + arrowSpread)),
    y: C + rayLen * Math.sin(deg2rad(-degrees + arrowSpread)),
  };

  // Cung đánh dấu góc (đi từ tia Ox ngược chiều kim đồng hồ tới tia Oy)
  const a1 = { x: C + rMark, y: C };
  const a2 = {
    x: C + rMark * uy.x,
    y: C + rMark * uy.y,
  };
  const largeArc = degrees > 180 ? 1 : 0;
  const arcPath = `M ${a1.x} ${a1.y} A ${rMark} ${rMark} 0 ${largeArc} 0 ${a2.x} ${a2.y}`;

  // Dấu góc vuông
  const s = 16;
  const m1 = { x: C + s * ux.x, y: C + s * ux.y };
  const m2 = { x: m1.x + s * uy.x, y: m1.y + s * uy.y };
  const m3 = { x: C + s * uy.x, y: C + s * uy.y };

  // Nhãn x, y đặt ngoài đầu tia
  const labelR = R + 26;
  const lx = { x: C + labelR, y: C };
  const ly = {
    x: C + labelR * uy.x,
    y: C + labelR * uy.y - 4,
  };

  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full max-w-[320px] mx-auto select-none"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label={`Góc xOy có số đo ${degrees} độ`}
    >
      {/* Tia Ox và Oy */}
      <line x1={C} y1={C} x2={oxEnd.x} y2={oxEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <line x1={C} y1={C} x2={oyEnd.x} y2={oyEnd.y} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

      {/* Mũi tên */}
      <polygon points={`${oxTip.x},${oxTip.y} ${oxBase1.x},${oxBase1.y} ${oxBase2.x},${oxBase2.y}`} fill="#e2e8f0" />
      <polygon points={`${oyTip.x},${oyTip.y} ${oyBase1.x},${oyBase1.y} ${oyBase2.x},${oyBase2.y}`} fill="#e2e8f0" />

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

      {/* Đỉnh O */}
      <circle cx={C} cy={C} r="3.5" fill="#00d2ff" />
      <text x={C - 6} y={C + 22} fontSize="19" fill="#00d2ff" fontWeight="600" textAnchor="middle">O</text>
      <text x={lx.x + 8} y={lx.y + 6} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">x</text>
      <text x={ly.x} y={ly.y} fontSize="19" fill="#e2e8f0" fontWeight="600" textAnchor="middle">y</text>
    </svg>
  );
}
