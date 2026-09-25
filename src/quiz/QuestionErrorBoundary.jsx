import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/** Thông báo câu bị lỗi, kèm nút bỏ qua. Dùng cho cả lỗi khi vẽ lẫn lỗi khi chấm. */
export function BrokenQuestion({ onSkip }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
      <AlertTriangle className="w-10 h-10 text-orange-300" />
      <p className="font-semibold">Câu này đang bị lỗi hiển thị.</p>
      <p className="text-sm text-text-secondary">Câu bị bỏ qua sẽ không tính vào điểm.</p>
      <button
        onClick={onSkip}
        className="px-6 py-2.5 rounded-lg bg-orange-400/10 border border-orange-400/40 text-orange-300 font-semibold hover:bg-orange-400/20 transition-colors"
      >
        Bỏ qua câu này
      </button>
    </div>
  );
}

/**
 * Bắt lỗi khi render một câu để không làm trắng cả màn hình.
 * Đặt key theo câu hiện tại để lỗi của câu trước không dính sang câu sau.
 */
export default class QuestionErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[quiz] Lỗi hiển thị câu ${this.props.questionId ?? '?'}:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) return <BrokenQuestion onSkip={this.props.onSkip} />;
    return this.props.children;
  }
}
