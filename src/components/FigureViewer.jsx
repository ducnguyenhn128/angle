import { useState, useEffect } from 'react';

export default function FigureViewer({ src, alt = 'Hình vẽ hình học', onError }) {
  const [loaded, setLoaded] = useState(false);

  // Reset trạng thái mỗi khi đổi hình để placeholder hiện đúng
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[180px]">
      {!loaded && <div className="absolute inset-0 animate-pulse rounded-xl bg-dark-surface/50" />}
      <img
        src={src}
        alt={alt}
        onError={onError}
        onLoad={() => setLoaded(true)}
        className={[
          'max-w-full max-h-[46vh] sm:max-h-[52vh] w-auto object-contain',
          loaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-150',
        ].join(' ')}
        draggable="false"
      />
    </div>
  );
}
