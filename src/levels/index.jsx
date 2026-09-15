export { default as Level1 } from './Level1';
export { default as Level5 } from './Level5';

import QuizLevel from './QuizLevel';
import { makeLevel2Question, makeBankQuestion, makeLevel8Question } from '../game/generators';

export function Level2({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '2', name: 'Ước lượng số đo góc', title: 'Số đo góc xOy gần nhất với số nào?', target: 150, onQuit }}
      makeQuestion={() => makeLevel2Question('easy')}
    />
  );
}

export function Level2Hard({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '2h', name: 'Ước lượng số đo góc (khó)', title: 'Mắt nhìn chuẩn: góc xOy bằng bao nhiêu độ?', target: 150, onQuit }}
      makeQuestion={() => makeLevel2Question('hard')}
    />
  );
}

export function Level3({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '3', name: 'Đếm số góc trên hình', title: 'Trên hình có bao nhiêu góc (không kể góc bẹt)?', target: 150, onQuit }}
      makeQuestion={() => makeBankQuestion('count-angles')}
    />
  );
}

export function Level4({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '4', name: 'Đường thẳng · Tia · Đoạn thẳng', title: 'Quan sát hình và chọn câu đúng', target: 150, onQuit }}
      makeQuestion={() => makeBankQuestion('rays-lines')}
    />
  );
}

export function Level6({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '6', name: 'Đường vuông góc · Đường cao', title: 'Nhận biết đường vuông góc / đường cao', target: 150, onQuit }}
      makeQuestion={() => makeBankQuestion('perpendicular')}
    />
  );
}

export function Level7({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '7', name: 'Tia phân giác', title: 'Nhận biết tia phân giác', target: 150, onQuit }}
      makeQuestion={() => makeBankQuestion('bisector')}
    />
  );
}

export function Level8({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '8', name: 'So sánh góc', title: 'Quan sát hình và chọn câu đúng', target: 150, onQuit }}
      makeQuestion={makeLevel8Question}
    />
  );
}
