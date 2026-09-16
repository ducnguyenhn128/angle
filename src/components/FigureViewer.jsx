import { useState, useEffect, useRef } from 'react';

export default function FigureViewer({ src, alt = 'Hình vẽ hình học', onError }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Reset trạng thái mỗi khi đổi hình để placeholder hiện đúng
  useEffect(() => {
    setLoaded(false);
    // Hình đã nằm trong cache (preload): load event có thể đã bắn xong
    // trước khi state được reset → kiểm tra complete để tránh kẹt opacity-0
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else onErrorRef.current?.();
    }
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[180px]">
      {!loaded && <div className="absolute inset-0 animate-pulse rounded-xl bg-dark-surface/50" />}
      <img
        key={src}
        ref={imgRef}
        src={src}
        alt={alt}
        onError={onError}
        onLoad={() => setLoaded(true)}
        className={[
          'h-[34vh] sm:h-[40vh] max-w-full w-auto object-contain',
          loaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-150',
        ].join(' ')}
        draggable="false"
      />
    </div>
  );
}
