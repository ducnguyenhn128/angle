// Kiểm tra ngân hàng câu hỏi: đúng schema, id không trùng, hình tham chiếu có tồn tại.
// Chạy: npm run validate-questions
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateQuestion } from '../src/quiz/types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const grades = JSON.parse(readFileSync(join(root, 'src/data/lessons.json'), 'utf8'));
const lessonIds = new Set(grades.flatMap((g) => g.chapters.flatMap((c) => c.lessons.map((l) => l.id))));
const dir = join(root, 'src/data/questions');

const ids = new Map();
const counts = {};
let nErr = 0;
let total = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  let list;
  try {
    list = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  } catch (e) {
    console.error(`✗ ${file}: JSON lỗi — ${e.message}`);
    nErr++;
    continue;
  }
  for (const q of list) {
    total++;
    const errs = validateQuestion(q, lessonIds);
    if (q.id && ids.has(q.id)) errs.push(`id trùng với câu trong ${ids.get(q.id)}`);
    ids.set(q.id, file);
    if (q.figure && !existsSync(join(root, 'public/figures', `${q.figure}.svg`))) {
      errs.push(`không tìm thấy hình public/figures/${q.figure}.svg`);
    }
    if (`${q.lesson}.json` !== file) errs.push(`lesson "${q.lesson}" nhưng nằm trong file ${file}`);
    for (const e of errs) console.error(`✗ ${file} ${q.id ?? '(không id)'}: ${e}`);
    nErr += errs.length;
    const key = `${q.lesson} / ${q.type}${q.vars ? ' (mẫu)' : ''}`;
    counts[key] = (counts[key] || 0) + 1;
  }
}

console.table(counts);
console.log(`${total} câu, ${nErr} lỗi`);
process.exit(nErr ? 1 : 0);
