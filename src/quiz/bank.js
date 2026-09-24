import grades from '../data/lessons.json';
import { makeLevel1Question, makeLevel2Question, makeBankQuestion, shuffle } from '../game/generators';
import {
  makeSupplementQ, makeVerticalQ, makeBisectorQ, makeParallelQ, makeTriangleQ,
} from '../game/computeAngles';
import { prepareQuestion, fromLegacy } from './types';

export { grades };

/** Danh sách phẳng mọi bài, kèm khối và chương. */
export const LESSONS = grades.flatMap((g) =>
  g.chapters.flatMap((c) => c.lessons.map((l) => ({ ...l, grade: g.grade, chapter: c.id }))),
);
export const lessonById = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

// Ngân hàng soạn sẵn: mỗi bài một file src/data/questions/<lesson>.json
const files = import.meta.glob('../data/questions/*.json', { eager: true, import: 'default' });
export const BANK = Object.values(files).flat();

// Câu trắc nghiệm có hình, sinh ngẫu nhiên bằng các generator của các level cũ
const GENERATORS = {
  goc: [makeLevel1Question, makeLevel2Question, () => makeBankQuestion('count-angles')],
  'tia-duong-thang': [() => makeBankQuestion('rays-lines')],
  'vuong-goc': [() => makeBankQuestion('perpendicular')],
  '7-08': [makeSupplementQ, makeVerticalQ, () => makeBankQuestion('bisector'), makeBisectorQ],
  '7-10': [makeParallelQ],
  '7-12': [makeTriangleQ],
};

/** Số câu có sẵn cho một bài (Infinity nếu có generator) — dùng để làm mờ bài chưa có nội dung. */
export function lessonSize(id) {
  if (GENERATORS[id]?.length) return Infinity;
  return BANK.filter((q) => q.lesson === id).length;
}

// Tỉ lệ tối đa câu lấy từ ngân hàng khi bài có cả generator
const BANK_RATIO = 0.6;

const inConfig = (q, { lessons, types, levels }) =>
  lessons.includes(q.lesson) && types.includes(q.type) && levels.includes(q.level ?? 'NB');

/** Số câu tối đa có thể lấy cho cấu hình (Infinity nếu có generator). */
export function availableCount(config) {
  const hasGen = config.types.includes('mcq') && config.lessons.some((id) => GENERATORS[id]?.length);
  if (hasGen) return Infinity;
  return BANK.filter((q) => inConfig(q, config)).length;
}

/**
 * Tạo đề: trộn câu trong ngân hàng (lọc theo bài + dạng + mức độ) với câu sinh tự động (dạng mcq).
 * Trả về mảng câu đã prepare, có thể ít hơn count nếu không đủ nguồn.
 */
export function buildTest(config) {
  const { lessons, types, count: n } = config;
  const pool = shuffle(BANK.filter((q) => inConfig(q, config)));
  const gens = types.includes('mcq')
    ? lessons.flatMap((id) => (GENERATORS[id] || []).map((g) => [id, g]))
    : [];

  const nBank = Math.min(pool.length, gens.length ? Math.ceil(n * BANK_RATIO) : n);
  const out = pool.slice(0, nBank).map(prepareQuestion);

  const seen = new Set();
  for (let tries = 0; gens.length && out.length < n && tries < n * 5; tries++) {
    const [lesson, gen] = gens[Math.floor(Math.random() * gens.length)];
    const q = fromLegacy(gen(), lesson, gen);
    // Kho hình có thể lặp lại khi đề dài — bỏ câu trùng
    if (q.id && seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return shuffle(out);
}
