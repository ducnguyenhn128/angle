import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Proportions, Ruler, Sigma, Spline, Users, MoveDiagonal, Scissors, Scale, Calculator, ClipboardCheck,
} from 'lucide-react';
import { Level1, Level2, Level3, Level4, Level6, Level7, Level8, Level9 } from './levels';
import Level5 from './levels/Level5';
import LessonTest from './levels/LessonTest';

const LEVELS = [
  {
    id: '1', name: 'Nhận biết loại góc', desc: 'Cho 1 góc — chọn nhọn, vuông, tù hay bẹt',
    icon: Proportions, component: Level1, color: 'text-neon-blue',
  },
  {
    id: '2', name: 'Ước lượng số đo góc', desc: 'Nhìn hình đoán số đo — mắt nhìn phải chuẩn',
    icon: Ruler, component: Level2, color: 'text-neon-pink',
  },
  {
    id: '3', name: 'Đếm số góc trên hình', desc: 'Đếm góc trên hình vẽ (không kể góc bẹt)',
    icon: Sigma, component: Level3, color: 'text-neon-green',
  },
  {
    id: '4', name: 'Đường thẳng · Tia · Đoạn thẳng', desc: 'Tia đối, 3 điểm thẳng hàng, đọc tên hình',
    icon: Spline, component: Level4, color: 'text-neon-blue',
  },
  {
    id: '5', name: 'Hai đường thẳng song song', desc: 'Kho hình cho GV hỏi miệng: vì sao song song?',
    icon: Users, component: Level5, color: 'text-neon-pink', badge: 'GV',
  },
  {
    id: '6', name: 'Đường vuông góc · Đường cao', desc: 'Nhận biết đường vuông góc, đường cao trong tam giác',
    icon: MoveDiagonal, component: Level6, color: 'text-neon-green',
  },
  {
    id: '7', name: 'Tia phân giác', desc: 'Nhận biết tia chia góc thành hai phần bằng nhau',
    icon: Scissors, component: Level7, color: 'text-neon-blue',
  },
  {
    id: '8', name: 'So sánh góc', desc: 'Góc nào lớn hơn · tia nào phân giác · đường nào vuông góc · kề bù/đối đỉnh',
    icon: Scale, component: Level8, color: 'text-neon-green',
  },
  {
    id: '9', name: 'Tính góc tổng hợp', desc: 'Kề bù · đối đỉnh · phân giác · so le trong, đồng vị · tổng 3 góc tam giác · bài nhiều bước',
    icon: Calculator, component: Level9, color: 'text-neon-pink',
  },
  {
    id: 'test', name: 'Luyện tập & kiểm tra theo bài', desc: 'Lớp 7 · Lớp 8 (SGK Kết nối tri thức) — có gợi ý, luyện lại câu sai',
    icon: ClipboardCheck, component: LessonTest, color: 'text-neon-green',
  },
];

function LevelCard({ level, index, onSelect }) {
  const Icon = level.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(level)}
      className="glass-panel p-4 sm:p-5 text-left flex items-start gap-4 hover:border-neon-blue/40 transition-colors group"
    >
      <div className={`p-2.5 rounded-lg bg-dark-bg border border-dark-border shrink-0 ${level.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-sm sm:text-base leading-snug">{level.name}</h3>
          {level.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-pink/15 text-neon-pink border border-neon-pink/30 uppercase tracking-wide">
              {level.badge}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">{level.desc}</p>
      </div>
    </motion.button>
  );
}

export default function App() {
  const [level, setLevel] = useState(null);

  if (level) {
    const Comp = level.component;
    return <Comp onQuit={() => setLevel(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 max-w-3xl w-full mx-auto p-4 sm:p-6 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-neon-blue/10 border border-neon-blue/25 mb-3">
          <Proportions className="w-8 h-8 text-neon-blue" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">
          Thử Thách Hình Học
        </h1>
        <p className="text-text-secondary text-sm sm:text-base mt-1">
          Kiểm tra nhanh nền tảng hình học — giữ vững gốc, không ngại hình vẽ
        </p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4">
        <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-3 px-1">
          Chọn một cấp độ để bắt đầu
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {LEVELS.map((lv, i) => (
            <LevelCard key={lv.id} level={lv} index={i} onSelect={setLevel} />
          ))}
        </div>
      </main>

      <footer className="shrink-0 text-center text-xs text-text-secondary py-4 border-t border-dark-border/50">
        Talent Math · Hình học THCS · Đúng +10, chuỗi 🔥 ≥ 3: +15, sai không trừ điểm
      </footer>
    </div>
  );
}
