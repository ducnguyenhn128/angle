import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-blue/40 bg-neon-blue/10 text-neon-blue font-semibold text-sm hover:bg-neon-blue/20 hover:border-neon-blue/70 active:scale-95 transition-all shrink-0"
      title="Quay lại chọn cấp độ"
      aria-label="Quay lại chọn cấp độ"
    >
      <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
      <span className="hidden sm:inline">Quay lại</span>
    </button>
  );
}
