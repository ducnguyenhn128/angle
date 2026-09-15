import { memo } from 'react';
import AngleFigure from './AngleFigure';

/**
 * Hiển thị 2 góc cạnh nhau để so sánh.
 */
export default memo(function AngleCompareFigure({ deg1, deg2, labels1, labels2, rotate1, rotate2 }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
      <div className="flex-1 min-w-0 text-center">
        <AngleFigure degrees={deg1} rotate={rotate1} labels={labels1} />
        <p className="text-xs sm:text-sm text-text-secondary mt-1 font-semibold">Góc {labels1.r1}{labels1.v}{labels1.r2}</p>
      </div>
      <span className="text-text-secondary font-bold text-lg shrink-0">vs</span>
      <div className="flex-1 min-w-0 text-center">
        <AngleFigure degrees={deg2} rotate={rotate2} labels={labels2} />
        <p className="text-xs sm:text-sm text-text-secondary mt-1 font-semibold">Góc {labels2.r1}{labels2.v}{labels2.r2}</p>
      </div>
    </div>
  );
});
