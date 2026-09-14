import QuizLevel from './QuizLevel';
import { makeLevel1Question } from '../game/generators';

export default function Level1({ onQuit }) {
  return (
    <QuizLevel
      level={{ id: '1', name: 'Nhận biết loại góc', title: 'Góc xOy trong hình là góc gì?', target: 150, onQuit }}
      makeQuestion={makeLevel1Question}
    />
  );
}
