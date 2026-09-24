import { BookOpen } from 'lucide-react';

/** Thẻ tóm tắt kiến thức của bài. */
export default function RecapCard({ lesson }) {
  if (!lesson?.recap?.length) return null;
  return (
    <div className="rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-3 sm:p-4 text-sm leading-relaxed">
      <p className="font-bold text-neon-blue mb-1.5 flex items-center gap-1.5">
        <BookOpen className="w-4 h-4" /> Nhắc lại kiến thức — {lesson.name}
      </p>
      <ul className="flex flex-col gap-1">
        {lesson.recap.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </div>
  );
}
