import manifest from '../data/figures-manifest.json';

const preloaded = new Set();

/**
 * Nạp trước SVG của một topic vào browser cache để khi đổi câu
 * hình hiện gần như tức thì (không phải chờ fetch từng file).
 */
export function preloadTopic(topic) {
  const pool = manifest[topic] || [];
  for (const entry of pool) {
    const url = `/figures/${topic}/${entry.file}.svg`;
    if (preloaded.has(url)) continue;
    preloaded.add(url);
    const img = new Image();
    img.src = url;
  }
}

/** Nạp trước toàn bộ kho hình (tổng chỉ ~110KB / 18 file). */
export function preloadAllFigures() {
  for (const topic of Object.keys(manifest)) {
    preloadTopic(topic);
  }
}
