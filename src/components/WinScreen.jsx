import { motion } from 'framer-motion';
import { RotateCcw, List } from 'lucide-react';

export default function WinScreen({ levelName, onReplay, onHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center text-center p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
        className="text-6xl sm:text-7xl mb-4"
      >
        🎉
      </motion.div>
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent mb-2">
        Chúc Mừng Em!
      </h2>
      <p className="text-text-secondary mb-8 max-w-md">
        Em đã xuất sắc hoàn thành thử thách <span className="text-text-primary font-semibold">{levelName}</span>!
        Kiến thức hình học nền tảng của em đang rất vững.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={onReplay}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-semibold hover:bg-neon-blue/20 transition-colors"
        >
          <RotateCcw className="w-5 h-5" /> Chơi lại
        </button>
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-dark-surface border border-dark-border text-text-secondary hover:text-text-primary hover:border-neon-blue/40 transition-colors"
        >
          <List className="w-5 h-5" /> Chọn cấp độ
        </button>
      </div>
    </motion.div>
  );
}
